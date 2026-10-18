-- Staff (founder, 2026-10-18): a staff login sees only the projects it is given (first use: Sound Mind's own
-- login sees just the Sound Mind project inside LWS Pune). Owners and editors still see the whole organisation.
-- What staff see: their projects, those projects' posts, publications, scorecards, channels, connected accounts
-- and reels, and their posts' media files. Never the ads (ad accounts aren't tied to a project).
-- Staff are added with `npm run staff:add`; nobody can change memberships from the app.

alter table public.org_members drop constraint org_members_role_check;
alter table public.org_members add constraint org_members_role_check check (role in ('owner', 'editor', 'staff'));

create table public.project_members (
  org_id uuid not null,
  project_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id),
  foreign key (project_id, org_id) references public.projects(id, org_id) on delete cascade,
  foreign key (org_id, user_id) references public.org_members(org_id, user_id) on delete cascade
);
create index project_members_user_idx on public.project_members(user_id);

-- ---------------------------------------------------------------------------------------------
-- Who sees what

-- Owner or editor: the whole organisation.
create or replace function private.is_org_full_member(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.org_members m where m.org_id = p_org and m.user_id = auth.uid() and m.role <> 'staff');
$$;

create or replace function private.can_see_project(p_project uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p
      join public.org_members m on m.org_id = p.org_id and m.user_id = auth.uid()
     where p.id = p_project
       and (m.role <> 'staff'
            or exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.user_id = auth.uid())));
$$;

-- Staff see an account when one of their projects posts to it.
create or replace function private.can_see_account(p_account uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.connected_accounts a where a.id = p_account and private.is_org_full_member(a.org_id))
      or exists (select 1 from public.project_channels c
                   join public.project_members pm on pm.project_id = c.project_id and pm.user_id = auth.uid()
                  where c.account_id = p_account);
$$;

create or replace function private.can_see_post(p_post uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.posts p where p.id = p_post and private.can_see_project(p.project_id));
$$;

revoke all on function private.is_org_full_member(uuid), private.can_see_project(uuid), private.can_see_account(uuid),
  private.can_see_post(uuid) from public, anon;
grant execute on function private.is_org_full_member(uuid), private.can_see_project(uuid), private.can_see_account(uuid),
  private.can_see_post(uuid) to authenticated;

alter table public.project_members enable row level security;
create policy project_members_read on public.project_members for select to authenticated
  using (private.is_org_full_member(org_id) or user_id = auth.uid());
revoke insert, update, delete, truncate on public.project_members from authenticated, anon;

drop policy org_members_read on public.org_members;
create policy org_members_read on public.org_members for select to authenticated
  using (private.is_org_full_member(org_id) or user_id = auth.uid());

drop policy projects_read on public.projects;
create policy projects_read on public.projects for select to authenticated using (private.can_see_project(id));

drop policy connected_accounts_read on public.connected_accounts;
create policy connected_accounts_read on public.connected_accounts for select to authenticated using (private.can_see_account(id));

drop policy project_channels_read on public.project_channels;
create policy project_channels_read on public.project_channels for select to authenticated using (private.can_see_project(project_id));

drop policy posts_read on public.posts;
create policy posts_read on public.posts for select to authenticated using (private.can_see_project(project_id));

drop policy publications_read on public.publications;
create policy publications_read on public.publications for select to authenticated using (private.can_see_post(post_id));

drop policy publication_metrics_read on public.publication_metrics;
create policy publication_metrics_read on public.publication_metrics for select to authenticated
  using (exists (select 1 from public.publications pb where pb.id = publication_id and private.can_see_post(pb.post_id)));

drop policy account_media_read on public.account_media;
create policy account_media_read on public.account_media for select to authenticated using (private.can_see_account(account_id));

drop policy ad_entities_read on public.ad_entities;
drop policy ad_daily_read on public.ad_daily;
drop policy ad_outcomes_read on public.ad_outcomes;
drop policy ad_drafts_read on public.ad_drafts;
create policy ad_entities_read on public.ad_entities for select to authenticated using (private.is_org_full_member(org_id));
create policy ad_daily_read on public.ad_daily for select to authenticated using (private.is_org_full_member(org_id));
create policy ad_outcomes_read on public.ad_outcomes for select to authenticated using (private.is_org_full_member(org_id));
create policy ad_drafts_read on public.ad_drafts for select to authenticated using (private.is_org_full_member(org_id));

-- Media files live under <org_id>/<post_id>/<file>; staff open only their projects' posts' files.
-- Compare as text: a cast to uuid would throw on any folder name that isn't one.
drop policy media_read_own_org on storage.objects;
create policy media_read_own_org on storage.objects for select to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from public.org_members m
       where m.user_id = auth.uid() and m.org_id::text = (storage.foldername(name))[1]
         and (m.role <> 'staff'
              or exists (select 1 from public.posts p
                          where p.org_id = m.org_id and p.id::text = (storage.foldername(name))[2]
                            and private.can_see_project(p.project_id))))
  );

-- ---------------------------------------------------------------------------------------------
-- What staff may do: act on their projects' posts; nothing on ads.

create or replace function private.lock_member_post(p_post uuid) returns public.posts
language plpgsql security definer set search_path = '' as $$
declare v public.posts;
begin
  select * into v from public.posts where id = p_post for update;
  if not found or not private.can_see_project(v.project_id) then
    perform private.fail('not_found', 'Post not found.');
  end if;
  return v;
end $$;

create or replace function private.lock_member_ad(p_draft uuid) returns public.ad_drafts
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts;
begin
  select * into v from public.ad_drafts where id = p_draft for update;
  if not found or not private.is_org_full_member(v.org_id) then perform private.fail('not_found', 'Ad draft not found.'); end if;
  return v;
end $$;

create or replace function public.set_ad_outcome(p_account uuid, p_campaign text, p_week date, p_booked int, p_leads int)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid;
begin
  select org_id into v_org from public.connected_accounts where id = p_account and platform = 'meta_ads';
  if v_org is null or not private.is_org_full_member(v_org) then perform private.fail('not_found', 'Ad account not found.'); end if;
  if p_week is null or extract(isodow from p_week) <> 1 then perform private.fail('invalid_week', 'A week starts on a Monday.'); end if;
  insert into public.ad_outcomes (org_id, account_id, campaign_id, week_start, tests_booked, nda_leads, updated_by, updated_at)
  values (v_org, p_account, p_campaign, p_week, p_booked, p_leads, auth.uid(), now())
  on conflict (account_id, campaign_id, week_start) do update set
    tests_booked = excluded.tests_booked, nda_leads = excluded.nda_leads, updated_by = excluded.updated_by, updated_at = now();
end $$;
