-- 0021_publication_progress — let a publish run that gets cut off resume, and stop it looping.
--
-- 2026-10-23: a 9-slide carousel took longer to upload than a scheduler run is allowed (55 s), so
-- every run was cut off and the next started again from slide 1. Nothing recorded the cut-off runs,
-- so this went on ~50 times until Instagram blocked the account's uploads (code 9).
--
--   claims      times the worker picked it up while pending; the worker gives up after 5
--               (MAX_START_TRIES in src/lib/domain/workflow.ts).
--   child_refs  a carousel's slide containers uploaded so far, in slide order ('' = not yet).
--               Instagram drops unused containers after 24 hours, so retry clears them.

alter table public.publications
  add column claims int not null default 0 check (claims >= 0),
  add column child_refs text[] not null default '{}'
    check (cardinality(child_refs) <= 20 and array_position(child_refs, null) is null);

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
     set locked_until = now() + make_interval(secs => p_lease_seconds),
         claims = t.claims + case when t.status = 'pending' then 1 else 0 end
    from due
   where t.id = due.id
  returning t.*;
end $$;

create or replace function public.save_carousel_children(p_publication uuid, p_refs text[])
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from unnest(p_refs) r where r is null or length(r) > 64) then
    perform private.fail('invalid_refs', 'Slide container ids must be text of at most 64 characters.');
  end if;
  update public.publications set child_refs = p_refs where id = p_publication and status = 'pending';
  if not found then perform private.fail('invalid_transition', 'Slides can only be saved while the publication is pending.'); end if;
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
  update public.publications
     set status = 'pending', external_ref = null, error = null, scheduled_at = null, claims = 0, child_refs = '{}'
   where id = pb.id;
  if v.status in ('failed', 'partially_published') then update public.posts set status = 'approved' where id = v.id; end if;
end $$;

revoke all on function public.save_carousel_children(uuid, text[]) from public, anon, authenticated;
grant execute on function public.save_carousel_children(uuid, text[]) to service_role;
