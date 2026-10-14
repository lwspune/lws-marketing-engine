-- 0001_core — organisations, projects, connected accounts, posts, publications.
--
-- Tenancy: organisation → project → post → publication (one per platform). Every row carries
-- org_id, and composite foreign keys make it impossible for a child to point at another org's
-- parent. Connected accounts (an Instagram account, a Facebook Page, a YouTube channel) belong to
-- the ORG; each project chooses which of them it posts to (project_channels), so one Instagram
-- account can serve several products without being connected twice.
--
-- Writes from the app go ONLY through the security-definer functions in 0002 (approve, reject,
-- …), which check membership and run each multi-step change in one transaction. Signed-in users
-- get read-only RLS policies here; the publishing worker uses the service role.
--
-- State rules live in triggers so they hold no matter who writes: a publication can never leave
-- `published` (never post twice), and posts/publications only move along allowed transitions.
-- The same rules are mirrored app-side in src/lib/domain/workflow.ts.

create schema if not exists private;

-- ---------------------------------------------------------------------------------------------
-- Tenancy

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  name text not null check (length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index org_members_user_idx on public.org_members(user_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  name text not null check (length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (org_id, slug),
  unique (id, org_id)
);

-- ---------------------------------------------------------------------------------------------
-- Connected platform accounts (tokens live encrypted in Supabase Vault; only the id is here)

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'youtube')),
  external_id text not null check (length(external_id) between 1 and 200),
  display_name text not null check (length(display_name) between 1 and 200),
  secret_id uuid not null,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, platform, external_id),
  unique (id, org_id)
);

create table public.project_channels (
  project_id uuid not null,
  org_id uuid not null,
  platform text not null check (platform in ('instagram', 'facebook', 'youtube')),
  account_id uuid not null,
  primary key (project_id, platform),
  foreign key (project_id, org_id) references public.projects(id, org_id) on delete cascade,
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade
);

-- ---------------------------------------------------------------------------------------------
-- Posts and their per-platform publications

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  project_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  kind text not null check (kind in ('reel', 'carousel')),
  title text not null check (length(btrim(title)) between 1 and 120),
  status text not null default 'ready'
    check (status in ('ready', 'approved', 'published', 'partially_published', 'failed', 'rejected')),
  captions jsonb not null default '{}'::jsonb check (jsonb_typeof(captions) = 'object'),
  video_path text,
  cover_path text,
  slide_paths text[] not null default '{}',
  scheduled_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  reject_reason text check (reject_reason is null or length(reject_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, org_id) references public.projects(id, org_id) on delete cascade,
  unique (project_id, slug),
  unique (id, org_id),
  -- media shape per kind
  constraint posts_media_shape check (
    (kind = 'reel' and video_path is not null and cardinality(slide_paths) = 0)
    or (kind = 'carousel' and video_path is null and cardinality(slide_paths) between 2 and 10)
  ),
  -- files must live under the post's own org folder in storage
  constraint posts_media_in_org check (
    (video_path is null or video_path like org_id::text || '/%')
    and (cover_path is null or cover_path like org_id::text || '/%')
  )
);
create index posts_org_status_idx on public.posts(org_id, status, created_at desc);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  post_id uuid not null,
  platform text not null check (platform in ('instagram', 'facebook', 'youtube')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'published', 'failed')),
  scheduled_at timestamptz,
  attempts int not null default 0 check (attempts between 0 and 3),
  external_ref text,
  external_id text,
  permalink text check (permalink is null or permalink ~ '^https://'),
  error text check (error is null or length(error) <= 2000),
  locked_until timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (post_id, org_id) references public.posts(id, org_id) on delete cascade,
  -- one publication per platform per post: the database half of "never post twice"
  unique (post_id, platform),
  constraint publications_processing_has_ref check (status <> 'processing' or external_ref is not null),
  constraint publications_published_has_time check (status <> 'published' or published_at is not null)
);
create index publications_due_idx on public.publications(status, scheduled_at) where status in ('pending', 'processing');

-- ---------------------------------------------------------------------------------------------
-- Transition guards

create or replace function private.guard_publication_transition() returns trigger
language plpgsql as $$
begin
  if old.status = 'published' and (new.status <> 'published' or new.external_id is distinct from old.external_id) then
    raise exception 'publication % is already published and can never be published again', old.id
      using errcode = 'check_violation';
  end if;
  if new.status <> old.status and not (
       (old.status = 'pending'    and new.status in ('processing', 'failed'))
    or (old.status = 'processing' and new.status in ('published', 'failed'))
    or (old.status = 'failed'     and new.status = 'pending' and old.attempts < 3)
  ) then
    raise exception 'publication % cannot go from % to %', old.id, old.status, new.status
      using errcode = 'check_violation';
  end if;
  if new.platform <> old.platform or new.post_id <> old.post_id or new.org_id <> old.org_id then
    raise exception 'publication % cannot change platform, post or org', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger publications_guard before update on public.publications
  for each row execute function private.guard_publication_transition();

create or replace function private.guard_post_transition() returns trigger
language plpgsql as $$
begin
  if new.status <> old.status and not (
       (old.status = 'ready'    and new.status in ('approved', 'rejected'))
    or (old.status = 'approved' and new.status in ('ready', 'published', 'partially_published', 'failed'))
    -- a retry puts a settled-with-failures post back in flight
    or (old.status in ('partially_published', 'failed') and new.status = 'approved')
  ) then
    raise exception 'post % cannot go from % to %', old.id, old.status, new.status using errcode = 'check_violation';
  end if;
  if new.org_id <> old.org_id or new.project_id <> old.project_id or new.kind <> old.kind then
    raise exception 'post % cannot change org, project or kind', old.id using errcode = 'check_violation';
  end if;
  -- captions and media are frozen once approved: what you approved is what gets published
  if old.status <> 'ready' and (new.captions is distinct from old.captions
      or new.video_path is distinct from old.video_path or new.cover_path is distinct from old.cover_path
      or new.slide_paths is distinct from old.slide_paths) then
    raise exception 'post % can only be edited while ready', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger posts_guard before update on public.posts
  for each row execute function private.guard_post_transition();

create or replace function private.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

create trigger connected_accounts_touch before update on public.connected_accounts
  for each row execute function private.touch_updated_at();

-- A project may only post through an account of the matching platform.
create or replace function private.guard_channel_platform() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from public.connected_accounts a where a.id = new.account_id and a.platform = new.platform) then
    raise exception 'account % is not a % account', new.account_id, new.platform using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger project_channels_platform before insert or update on public.project_channels
  for each row execute function private.guard_channel_platform();

-- ---------------------------------------------------------------------------------------------
-- Row-level security: members read their own org's rows. No direct writes from clients.

create or replace function private.is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.org_members m where m.org_id = p_org and m.user_id = auth.uid());
$$;

-- Policies run as the querying user, so it needs to reach this one helper (and nothing else here).
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.projects enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.project_channels enable row level security;
alter table public.posts enable row level security;
alter table public.publications enable row level security;

create policy organizations_read on public.organizations for select to authenticated using (private.is_org_member(id));
create policy org_members_read on public.org_members for select to authenticated using (private.is_org_member(org_id));
create policy projects_read on public.projects for select to authenticated using (private.is_org_member(org_id));
create policy connected_accounts_read on public.connected_accounts for select to authenticated using (private.is_org_member(org_id));
create policy project_channels_read on public.project_channels for select to authenticated using (private.is_org_member(org_id));
create policy posts_read on public.posts for select to authenticated using (private.is_org_member(org_id));
create policy publications_read on public.publications for select to authenticated using (private.is_org_member(org_id));

-- The vault secret id is an internal pointer; hide it from signed-in users entirely. A column-level
-- REVOKE is a no-op while the table-level grant (Supabase's default) exists, so swap the table grant
-- for an explicit column list.
revoke select on public.connected_accounts from authenticated, anon;
grant select (id, org_id, platform, external_id, display_name, token_expires_at, created_at, updated_at)
  on public.connected_accounts to authenticated;

-- No direct writes from API clients on any table; everything goes through the 0002 functions.
revoke insert, update, delete, truncate on
  public.organizations, public.org_members, public.projects, public.connected_accounts,
  public.project_channels, public.posts, public.publications
  from authenticated, anon;

-- ---------------------------------------------------------------------------------------------
-- Media storage: private bucket, files under <org_id>/<post_id>/<file>. Members may read their
-- org's files (for previews); uploads happen server-side with the service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 104857600, array['video/mp4', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- Compare as text: a cast to uuid would throw on any folder name that isn't one.
create policy media_read_own_org on storage.objects for select to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in (select m.org_id::text from public.org_members m where m.user_id = auth.uid())
  );
