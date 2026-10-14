-- 0002_functions — the only write paths.
--
-- User actions (signed-in members, via supabase.rpc): approve_post, reject_post, unapprove_post,
-- update_post_captions, retry_publication. Each checks membership, locks the post row, validates,
-- and does all its writes in one transaction (a function call is atomic).
--
-- Worker/admin actions (service role only): claim_due_publications, record_publication_event,
-- release_publication, get_account_token, upsert_connected_account, set_project_channel.
--
-- Errors: RAISE with a human MESSAGE and a stable machine code in HINT (e.g. 'not_ready'); the
-- app maps HINT to its DomainError codes. Caption limits are checked app-side before approve_post
-- (src/lib/domain/captions.ts); everything structural is re-checked here.

create or replace function private.fail(p_code text, p_message text) returns void
language plpgsql as $$ begin raise exception '%', p_message using errcode = 'P0001', hint = p_code; end $$;

-- Lock a post the caller may act on; "not found" also covers "not your org" so nothing leaks.
create or replace function private.lock_member_post(p_post uuid) returns public.posts
language plpgsql security definer set search_path = '' as $$
declare v public.posts;
begin
  select * into v from public.posts where id = p_post for update;
  if not found or not private.is_org_member(v.org_id) then
    perform private.fail('not_found', 'Post not found.');
  end if;
  return v;
end $$;

-- ---------------------------------------------------------------------------------------------
-- User actions

create or replace function public.approve_post(p_post uuid, p_platforms text[], p_scheduled_at timestamptz default null)
returns setof public.publications
language plpgsql security definer set search_path = '' as $$
declare
  v public.posts;
  pf text;
begin
  v := private.lock_member_post(p_post);
  if v.status <> 'ready' then perform private.fail('not_ready', format('Only a ready post can be approved (this one is %s).', v.status)); end if;
  if p_platforms is null or cardinality(p_platforms) = 0 then perform private.fail('no_platforms', 'Choose at least one platform.'); end if;
  if (select count(distinct x) from unnest(p_platforms) x) <> cardinality(p_platforms) then
    perform private.fail('duplicate_platform', 'A platform was chosen twice.');
  end if;
  foreach pf in array p_platforms loop
    if pf not in ('instagram', 'facebook', 'youtube') or (v.kind = 'carousel' and pf <> 'instagram') then
      perform private.fail('unsupported_platform', format('A %s can''t be published to %s yet.', v.kind, pf));
    end if;
    if not exists (select 1 from public.project_channels c where c.project_id = v.project_id and c.platform = pf) then
      perform private.fail('not_connected', format('%s isn''t connected for this project.', pf));
    end if;
  end loop;
  if p_scheduled_at is not null then
    if p_scheduled_at <= now() then perform private.fail('schedule_in_past', 'The scheduled time has already passed.'); end if;
    if p_scheduled_at > now() + interval '75 days' then perform private.fail('schedule_too_far', 'Schedule at most 75 days ahead.'); end if;
  end if;

  update public.posts
     set status = 'approved', approved_by = auth.uid(), approved_at = now(), scheduled_at = p_scheduled_at
   where id = v.id;

  return query
    insert into public.publications (org_id, post_id, platform, scheduled_at)
    select v.org_id, v.id, x, p_scheduled_at from unnest(p_platforms) x
    returning *;
end $$;

create or replace function public.reject_post(p_post uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.posts;
begin
  v := private.lock_member_post(p_post);
  if v.status <> 'ready' then perform private.fail('not_ready', format('Only a ready post can be rejected (this one is %s).', v.status)); end if;
  update public.posts
     set status = 'rejected', rejected_by = auth.uid(), rejected_at = now(), reject_reason = nullif(btrim(p_reason), '')
   where id = v.id;
end $$;

create or replace function public.unapprove_post(p_post uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.posts;
begin
  v := private.lock_member_post(p_post);
  if v.status <> 'approved' then perform private.fail('not_approved', 'Only an approved post can be taken back.'); end if;
  if exists (select 1 from public.publications p where p.post_id = v.id and p.status <> 'pending') then
    perform private.fail('already_started', 'Publishing has already started on at least one platform.');
  end if;
  delete from public.publications where post_id = v.id;
  update public.posts set status = 'ready', approved_by = null, approved_at = null, scheduled_at = null where id = v.id;
end $$;

create or replace function public.update_post_captions(p_post uuid, p_captions jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.posts;
begin
  v := private.lock_member_post(p_post);
  if v.status <> 'ready' then perform private.fail('not_ready', 'Captions can only be edited while the post is ready.'); end if;
  if p_captions is null or jsonb_typeof(p_captions) <> 'object' then perform private.fail('invalid_caption', 'Captions must be an object.'); end if;
  update public.posts set captions = p_captions where id = v.id;
end $$;

create or replace function public.retry_publication(p_publication uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  pb public.publications;
  v public.posts;
begin
  select * into pb from public.publications where id = p_publication;
  if not found then perform private.fail('not_found', 'Publication not found.'); end if;
  v := private.lock_member_post(pb.post_id);
  if pb.status <> 'failed' then perform private.fail('invalid_transition', 'Only a failed publication can be retried.'); end if;
  if pb.attempts >= 3 then perform private.fail('retry_limit', 'Gave up after 3 attempts.'); end if;
  update public.publications set status = 'pending', external_ref = null, error = null, scheduled_at = null where id = pb.id;
  if v.status in ('failed', 'partially_published') then update public.posts set status = 'approved' where id = v.id; end if;
end $$;

-- ---------------------------------------------------------------------------------------------
-- Worker actions (service role)

-- Hand out due publications with a short lease so two overlapping ticks never work on the same
-- one. SKIP LOCKED means a concurrent tick simply takes the next rows.
create or replace function public.claim_due_publications(p_limit int default 10, p_lease_seconds int default 90)
returns setof public.publications
language plpgsql security definer set search_path = '' as $$
begin
  return query
  with due as (
    select pb.id
      from public.publications pb
      join public.posts p on p.id = pb.post_id
     where p.status = 'approved'
       and ((pb.status = 'pending' and (pb.scheduled_at is null or pb.scheduled_at <= now())) or pb.status = 'processing')
       and (pb.locked_until is null or pb.locked_until < now())
     order by pb.created_at
     limit greatest(1, least(p_limit, 50))
     for update of pb skip locked
  )
  update public.publications t
     set locked_until = now() + make_interval(secs => p_lease_seconds)
    from due
   where t.id = due.id
  returning t.*;
end $$;

-- Record one step's outcome and settle the post, in one transaction.
create or replace function public.record_publication_event(
  p_publication uuid, p_status text,
  p_external_ref text default null, p_external_id text default null, p_permalink text default null, p_error text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_post uuid;
  n_open int; n_published int; n_total int;
begin
  update public.publications
     set status = p_status,
         attempts = attempts + case when p_status = 'processing' and status = 'pending' then 1 else 0 end,
         external_ref = coalesce(p_external_ref, external_ref),
         external_id = coalesce(p_external_id, external_id),
         permalink = coalesce(p_permalink, permalink),
         error = case when p_status = 'failed' then left(coalesce(p_error, 'Unknown error'), 2000) else null end,
         published_at = case when p_status = 'published' then now() else published_at end,
         locked_until = null
   where id = p_publication
  returning post_id into v_post;
  if v_post is null then perform private.fail('not_found', 'Publication not found.'); end if;

  select count(*) filter (where status in ('pending', 'processing')),
         count(*) filter (where status = 'published'),
         count(*)
    into n_open, n_published, n_total
    from public.publications where post_id = v_post;

  if n_open = 0 then
    update public.posts
       set status = case when n_published = n_total then 'published'
                         when n_published > 0 then 'partially_published'
                         else 'failed' end
     where id = v_post and status = 'approved';
  end if;
end $$;

-- Nothing to record this tick (still processing, or a temporary error): free it for the next tick.
create or replace function public.release_publication(p_publication uuid)
returns void
language sql security definer set search_path = '' as $$
  update public.publications set locked_until = null where id = p_publication;
$$;

create or replace function public.get_account_token(p_account uuid)
returns text
language sql stable security definer set search_path = '' as $$
  select s.decrypted_secret
    from public.connected_accounts a
    join vault.decrypted_secrets s on s.id = a.secret_id
   where a.id = p_account;
$$;

create or replace function public.upsert_connected_account(
  p_org uuid, p_platform text, p_external_id text, p_display_name text, p_token text, p_expires_at timestamptz default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_secret uuid;
begin
  if coalesce(length(p_token), 0) < 20 then perform private.fail('invalid_token', 'That access token looks wrong.'); end if;
  select id, secret_id into v_id, v_secret from public.connected_accounts
   where org_id = p_org and platform = p_platform and external_id = p_external_id for update;
  if v_id is null then
    v_secret := vault.create_secret(p_token, format('account:%s:%s:%s', p_org, p_platform, p_external_id));
    insert into public.connected_accounts (org_id, platform, external_id, display_name, secret_id, token_expires_at)
    values (p_org, p_platform, p_external_id, p_display_name, v_secret, p_expires_at)
    returning id into v_id;
  else
    perform vault.update_secret(v_secret, p_token);
    update public.connected_accounts set display_name = p_display_name, token_expires_at = p_expires_at where id = v_id;
  end if;
  return v_id;
end $$;

create or replace function public.set_project_channel(p_project uuid, p_platform text, p_account uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid;
begin
  select org_id into v_org from public.projects where id = p_project;
  if v_org is null then perform private.fail('not_found', 'Project not found.'); end if;
  insert into public.project_channels (project_id, org_id, platform, account_id)
  values (p_project, v_org, p_platform, p_account)
  on conflict (project_id, platform) do update set account_id = excluded.account_id;
end $$;

-- ---------------------------------------------------------------------------------------------
-- Who may call what

revoke all on function
  public.approve_post(uuid, text[], timestamptz), public.reject_post(uuid, text), public.unapprove_post(uuid),
  public.update_post_captions(uuid, jsonb), public.retry_publication(uuid),
  public.claim_due_publications(int, int), public.record_publication_event(uuid, text, text, text, text, text),
  public.release_publication(uuid), public.get_account_token(uuid),
  public.upsert_connected_account(uuid, text, text, text, text, timestamptz), public.set_project_channel(uuid, text, uuid)
  from public, anon, authenticated;

grant execute on function
  public.approve_post(uuid, text[], timestamptz), public.reject_post(uuid, text), public.unapprove_post(uuid),
  public.update_post_captions(uuid, jsonb), public.retry_publication(uuid)
  to authenticated;

grant execute on function
  public.claim_due_publications(int, int), public.record_publication_event(uuid, text, text, text, text, text),
  public.release_publication(uuid), public.get_account_token(uuid),
  public.upsert_connected_account(uuid, text, text, text, text, timestamptz), public.set_project_channel(uuid, text, uuid)
  to service_role;

revoke all on function private.fail(text, text), private.lock_member_post(uuid) from public, anon, authenticated;
