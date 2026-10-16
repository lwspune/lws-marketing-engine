-- 0008_ads — Meta ads: the ad account, its results, bookings typed in by hand, and ad drafts.
--
-- The ad account is one more connected account (platform 'meta_ads', external_id 'act_<id>'),
-- with its System User token in Vault like every other token. It can't be a posting channel.
--
-- Results: `ad_entities` (each campaign / ad set / ad with its current status and budget) and
-- `ad_daily` (one row per ad per day: spend, impressions, WhatsApp chats started). Days are in the
-- AD ACCOUNT's time zone, as Meta reports them. Synced nightly with the reels (pg_cron →
-- /api/cron/insights), from the Insights tab's Refresh, or by `npm run insights`.
--
-- Bookings: Meta can't see WhatsApp labels, so tests booked and NDA leads per campaign per week
-- (weeks start Monday) are typed in on the Insights tab (`ad_outcomes`).
--
-- Drafts: an ad made from an .ad.json file (`npm run ads:add`). Two gates, and nothing spends on
-- its own: Approve (a member) → the app creates the campaign, ad set, creative and ad on Meta, all
-- PAUSED, recording each Meta id as it goes → Launch (a member) switches them on. Guardrails live
-- here so they hold whoever writes: at most ₹1,000 a day, an end date 1–30 days after the start,
-- the poster in the org's own folder, everything frozen once approved, and each Meta id written
-- once (a retry resumes; it can never create a second campaign).

-- ---------------------------------------------------------------------------------------------
-- The ad account

alter table public.connected_accounts drop constraint connected_accounts_platform_check;
alter table public.connected_accounts add constraint connected_accounts_platform_check
  check (platform in ('instagram', 'facebook', 'youtube', 'meta_ads'));
alter table public.connected_accounts add column ads_synced_at timestamptz;

-- ---------------------------------------------------------------------------------------------
-- Results

create table public.ad_entities (
  org_id uuid not null,
  account_id uuid not null,
  level text not null check (level in ('campaign', 'adset', 'ad')),
  external_id text not null check (length(external_id) between 1 and 100),
  name text not null check (length(name) <= 400),
  parent_id text check (parent_id is null or length(parent_id) <= 100),
  effective_status text not null check (length(effective_status) between 1 and 60),
  daily_budget_minor bigint check (daily_budget_minor is null or daily_budget_minor >= 0),
  refreshed_at timestamptz not null default now(),
  primary key (account_id, external_id),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade
);
create index ad_entities_org_idx on public.ad_entities(org_id, level);

create table public.ad_daily (
  org_id uuid not null,
  account_id uuid not null,
  ad_id text not null check (length(ad_id) between 1 and 100),
  day date not null,
  ad_name text not null default '' check (length(ad_name) <= 400),
  adset_id text not null check (length(adset_id) between 1 and 100),
  adset_name text not null default '' check (length(adset_name) <= 400),
  campaign_id text not null check (length(campaign_id) between 1 and 100),
  campaign_name text not null default '' check (length(campaign_name) <= 400),
  spend numeric(14, 2) not null check (spend >= 0),
  impressions bigint not null default 0 check (impressions >= 0),
  reach bigint check (reach is null or reach >= 0),
  clicks bigint check (clicks is null or clicks >= 0),
  conversations bigint not null default 0 check (conversations >= 0),
  actions jsonb not null default '[]'::jsonb check (jsonb_typeof(actions) = 'array'),
  refreshed_at timestamptz not null default now(),
  primary key (account_id, ad_id, day),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade
);
create index ad_daily_org_day_idx on public.ad_daily(org_id, day desc);

-- ---------------------------------------------------------------------------------------------
-- Bookings typed in by hand

create table public.ad_outcomes (
  org_id uuid not null,
  account_id uuid not null,
  campaign_id text not null check (length(campaign_id) between 1 and 100),
  week_start date not null check (extract(isodow from week_start) = 1),
  tests_booked int not null default 0 check (tests_booked between 0 and 10000),
  nda_leads int not null default 0 check (nda_leads between 0 and 10000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (account_id, campaign_id, week_start),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade
);

-- ---------------------------------------------------------------------------------------------
-- Drafts

create table public.ad_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  project_id uuid not null,
  account_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  title text not null check (length(btrim(title)) between 1 and 120),
  status text not null default 'ready'
    check (status in ('ready', 'approved', 'failed', 'created', 'live', 'paused', 'rejected')),
  spec jsonb not null check (jsonb_typeof(spec) = 'object'),
  image_path text not null,
  daily_budget_minor int not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  meta_image_hash text check (meta_image_hash is null or length(meta_image_hash) between 1 and 100),
  meta_campaign_id text check (meta_campaign_id is null or length(meta_campaign_id) between 1 and 100),
  meta_adset_id text check (meta_adset_id is null or length(meta_adset_id) between 1 and 100),
  meta_creative_id text check (meta_creative_id is null or length(meta_creative_id) between 1 and 100),
  meta_ad_id text check (meta_ad_id is null or length(meta_ad_id) between 1 and 100),
  error text check (error is null or length(error) <= 2000),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  reject_reason text check (reject_reason is null or length(reject_reason) <= 500),
  launched_by uuid references auth.users(id) on delete set null,
  launched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, org_id) references public.projects(id, org_id) on delete cascade,
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade,
  unique (project_id, slug),
  -- ₹1,000 a day at most (minor units: paise)
  constraint ad_drafts_budget check (daily_budget_minor between 1 and 100000),
  -- an end date is required: more than a day after the start (Meta's rule for daily budgets), 30 days at most
  constraint ad_drafts_length check (end_at > start_at + interval '1 day' and end_at <= start_at + interval '30 days'),
  constraint ad_drafts_image check (image_path like org_id::text || '/%' and image_path ~* '\.(png|jpe?g)$'),
  constraint ad_drafts_created_complete check (
    status not in ('created', 'live', 'paused') or (meta_image_hash is not null and meta_campaign_id is not null
      and meta_adset_id is not null and meta_creative_id is not null and meta_ad_id is not null)
  )
);
create index ad_drafts_org_status_idx on public.ad_drafts(org_id, status, created_at desc);

create or replace function private.guard_ad_draft_insert() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from public.connected_accounts a where a.id = new.account_id and a.platform = 'meta_ads') then
    raise exception 'account % is not a Meta ad account', new.account_id using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger ad_drafts_insert_guard before insert on public.ad_drafts
  for each row execute function private.guard_ad_draft_insert();

create or replace function private.guard_ad_draft_update() returns trigger
language plpgsql as $$
begin
  if new.status <> old.status and not (
       (old.status = 'ready'    and new.status in ('approved', 'rejected'))
    or (old.status = 'approved' and new.status in ('created', 'failed'))
    or (old.status = 'failed'   and new.status = 'approved')
    or (old.status in ('created', 'paused') and new.status = 'live')
    or (old.status = 'live'     and new.status = 'paused')
  ) then
    raise exception 'ad draft % cannot go from % to %', old.id, old.status, new.status using errcode = 'check_violation';
  end if;
  if new.org_id <> old.org_id or new.project_id <> old.project_id or new.account_id <> old.account_id then
    raise exception 'ad draft % cannot change org, project or ad account', old.id using errcode = 'check_violation';
  end if;
  -- what you approved is what gets created
  if old.status <> 'ready' and (new.spec is distinct from old.spec or new.image_path is distinct from old.image_path
      or new.daily_budget_minor is distinct from old.daily_budget_minor or new.start_at is distinct from old.start_at
      or new.end_at is distinct from old.end_at or new.title is distinct from old.title) then
    raise exception 'ad draft % can only be edited while ready', old.id using errcode = 'check_violation';
  end if;
  -- each Meta object is created once: its id never changes after it is recorded
  if (old.meta_image_hash is not null and new.meta_image_hash is distinct from old.meta_image_hash)
     or (old.meta_campaign_id is not null and new.meta_campaign_id is distinct from old.meta_campaign_id)
     or (old.meta_adset_id is not null and new.meta_adset_id is distinct from old.meta_adset_id)
     or (old.meta_creative_id is not null and new.meta_creative_id is distinct from old.meta_creative_id)
     or (old.meta_ad_id is not null and new.meta_ad_id is distinct from old.meta_ad_id) then
    raise exception 'ad draft % already has that Meta object', old.id using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger ad_drafts_update_guard before update on public.ad_drafts
  for each row execute function private.guard_ad_draft_update();

-- ---------------------------------------------------------------------------------------------
-- Row-level security: members read their org's rows; writes only through the functions below.

alter table public.ad_entities enable row level security;
alter table public.ad_daily enable row level security;
alter table public.ad_outcomes enable row level security;
alter table public.ad_drafts enable row level security;

create policy ad_entities_read on public.ad_entities for select to authenticated using (private.is_org_member(org_id));
create policy ad_daily_read on public.ad_daily for select to authenticated using (private.is_org_member(org_id));
create policy ad_outcomes_read on public.ad_outcomes for select to authenticated using (private.is_org_member(org_id));
create policy ad_drafts_read on public.ad_drafts for select to authenticated using (private.is_org_member(org_id));

revoke insert, update, delete, truncate on public.ad_entities, public.ad_daily, public.ad_outcomes, public.ad_drafts
  from authenticated, anon;

-- ---------------------------------------------------------------------------------------------
-- Worker functions (service role)

-- Store one sync of an ad account: entities and daily rows, in one transaction.
create or replace function public.upsert_ad_sync(p_account uuid, p_entities jsonb, p_daily jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare v_org uuid; n int;
begin
  select org_id into v_org from public.connected_accounts where id = p_account and platform = 'meta_ads';
  if v_org is null then perform private.fail('not_found', 'Ad account not found.'); end if;
  if jsonb_typeof(p_entities) <> 'array' or jsonb_typeof(p_daily) <> 'array' then
    perform private.fail('invalid_input', 'Entities and daily rows must be arrays.');
  end if;

  insert into public.ad_entities as e (org_id, account_id, level, external_id, name, parent_id, effective_status, daily_budget_minor, refreshed_at)
  select v_org, p_account, r.level, r.external_id, coalesce(left(r.name, 400), ''), r.parent_id, r.effective_status, r.daily_budget_minor, now()
    from jsonb_to_recordset(p_entities) as r(level text, external_id text, name text, parent_id text, effective_status text, daily_budget_minor bigint)
  on conflict (account_id, external_id) do update set
    level = excluded.level, name = excluded.name, parent_id = excluded.parent_id,
    effective_status = excluded.effective_status, daily_budget_minor = excluded.daily_budget_minor, refreshed_at = now();

  insert into public.ad_daily as d (org_id, account_id, ad_id, day, ad_name, adset_id, adset_name, campaign_id, campaign_name,
    spend, impressions, reach, clicks, conversations, actions, refreshed_at)
  select v_org, p_account, r.ad_id, r.day, coalesce(left(r.ad_name, 400), ''), r.adset_id, coalesce(left(r.adset_name, 400), ''),
         r.campaign_id, coalesce(left(r.campaign_name, 400), ''), r.spend, coalesce(r.impressions, 0), r.reach, r.clicks,
         coalesce(r.conversations, 0), coalesce(r.actions, '[]'::jsonb), now()
    from jsonb_to_recordset(p_daily) as r(ad_id text, day date, ad_name text, adset_id text, adset_name text, campaign_id text,
         campaign_name text, spend numeric, impressions bigint, reach bigint, clicks bigint, conversations bigint, actions jsonb)
  on conflict (account_id, ad_id, day) do update set
    ad_name = excluded.ad_name, adset_id = excluded.adset_id, adset_name = excluded.adset_name, campaign_id = excluded.campaign_id,
    campaign_name = excluded.campaign_name, spend = excluded.spend, impressions = excluded.impressions, reach = excluded.reach,
    clicks = excluded.clicks, conversations = excluded.conversations, actions = excluded.actions, refreshed_at = now();
  get diagnostics n = row_count;

  update public.connected_accounts set ads_synced_at = now() where id = p_account;
  return n;
end $$;

-- Ad accounts never synced, or not synced within the last p_hours.
create or replace function public.ads_sync_due(p_hours int default 20)
returns table (account_id uuid, org_id uuid, external_id text)
language sql stable security definer set search_path = '' as $$
  select a.id, a.org_id, a.external_id
    from public.connected_accounts a
   where a.platform = 'meta_ads'
     and coalesce(a.ads_synced_at, '-infinity'::timestamptz) < now() - make_interval(hours => p_hours);
$$;

-- Record one Meta object made for an approved draft. The same id again is a no-op; a different
-- one is refused, so a retry resumes where it stopped and never creates a duplicate.
create or replace function public.record_ad_object(p_draft uuid, p_kind text, p_meta_id text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts; v_old text;
begin
  if p_kind not in ('image_hash', 'campaign', 'adset', 'creative', 'ad') then
    perform private.fail('invalid_input', format('Unknown Meta object "%s".', p_kind));
  end if;
  if coalesce(length(p_meta_id), 0) = 0 then perform private.fail('invalid_input', 'Meta id is empty.'); end if;
  select * into v from public.ad_drafts where id = p_draft for update;
  if not found then perform private.fail('not_found', 'Ad draft not found.'); end if;
  if v.status <> 'approved' then perform private.fail('not_approved', 'Only an approved ad draft is created on Meta.'); end if;
  v_old := case p_kind when 'image_hash' then v.meta_image_hash when 'campaign' then v.meta_campaign_id
    when 'adset' then v.meta_adset_id when 'creative' then v.meta_creative_id else v.meta_ad_id end;
  if v_old = p_meta_id then return; end if;
  if v_old is not null then perform private.fail('already_created', format('This draft already has a %s on Meta (%s).', p_kind, v_old)); end if;
  update public.ad_drafts set
    meta_image_hash = case when p_kind = 'image_hash' then p_meta_id else meta_image_hash end,
    meta_campaign_id = case when p_kind = 'campaign' then p_meta_id else meta_campaign_id end,
    meta_adset_id = case when p_kind = 'adset' then p_meta_id else meta_adset_id end,
    meta_creative_id = case when p_kind = 'creative' then p_meta_id else meta_creative_id end,
    meta_ad_id = case when p_kind = 'ad' then p_meta_id else meta_ad_id end
   where id = p_draft;
end $$;

create or replace function public.record_ad_created(p_draft uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.ad_drafts set status = 'created', error = null where id = p_draft;
  if not found then perform private.fail('not_found', 'Ad draft not found.'); end if;
end $$;

create or replace function public.record_ad_failed(p_draft uuid, p_error text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.ad_drafts set status = 'failed', error = left(coalesce(p_error, 'Unknown error'), 2000) where id = p_draft;
  if not found then perform private.fail('not_found', 'Ad draft not found.'); end if;
end $$;

-- After Meta confirmed the switch: live (launched / resumed) or paused. p_user is the member who
-- pressed the button (the app checks membership before calling Meta).
create or replace function public.record_ad_status(p_draft uuid, p_status text, p_user uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_status not in ('live', 'paused') then perform private.fail('invalid_input', 'Status must be live or paused.'); end if;
  update public.ad_drafts set
    status = p_status,
    launched_by = case when p_status = 'live' and launched_at is null then p_user else launched_by end,
    launched_at = case when p_status = 'live' and launched_at is null then now() else launched_at end
   where id = p_draft;
  if not found then perform private.fail('not_found', 'Ad draft not found.'); end if;
end $$;

-- ---------------------------------------------------------------------------------------------
-- Member functions

create or replace function private.lock_member_ad(p_draft uuid) returns public.ad_drafts
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts;
begin
  select * into v from public.ad_drafts where id = p_draft for update;
  if not found or not private.is_org_member(v.org_id) then perform private.fail('not_found', 'Ad draft not found.'); end if;
  return v;
end $$;

create or replace function public.approve_ad(p_draft uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts;
begin
  v := private.lock_member_ad(p_draft);
  if v.status <> 'ready' then perform private.fail('not_ready', format('Only a ready ad can be approved (this one is %s).', v.status)); end if;
  if v.end_at <= now() + interval '1 day' then
    perform private.fail('ends_too_soon', 'This ad ends within a day. Change its dates in the .ad.json file and add it again.');
  end if;
  update public.ad_drafts set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = v.id;
end $$;

create or replace function public.reject_ad(p_draft uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts;
begin
  v := private.lock_member_ad(p_draft);
  if v.status <> 'ready' then perform private.fail('not_ready', format('Only a ready ad can be rejected (this one is %s).', v.status)); end if;
  update public.ad_drafts
     set status = 'rejected', rejected_by = auth.uid(), rejected_at = now(), reject_reason = nullif(btrim(p_reason), '')
   where id = v.id;
end $$;

create or replace function public.retry_ad(p_draft uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v public.ad_drafts;
begin
  v := private.lock_member_ad(p_draft);
  if v.status <> 'failed' then perform private.fail('not_failed', 'Only an ad that failed to be created can be retried.'); end if;
  update public.ad_drafts set status = 'approved', error = null where id = v.id;
end $$;

create or replace function public.set_ad_outcome(p_account uuid, p_campaign text, p_week date, p_booked int, p_leads int)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid;
begin
  select org_id into v_org from public.connected_accounts where id = p_account and platform = 'meta_ads';
  if v_org is null or not private.is_org_member(v_org) then perform private.fail('not_found', 'Ad account not found.'); end if;
  if p_week is null or extract(isodow from p_week) <> 1 then perform private.fail('invalid_week', 'A week starts on a Monday.'); end if;
  insert into public.ad_outcomes (org_id, account_id, campaign_id, week_start, tests_booked, nda_leads, updated_by, updated_at)
  values (v_org, p_account, p_campaign, p_week, p_booked, p_leads, auth.uid(), now())
  on conflict (account_id, campaign_id, week_start) do update set
    tests_booked = excluded.tests_booked, nda_leads = excluded.nda_leads, updated_by = excluded.updated_by, updated_at = now();
end $$;

-- ---------------------------------------------------------------------------------------------
-- Nightly sync: the 03:00 IST job now also fires when an ad account is due.

create or replace function private.trigger_insights() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  if not exists (select 1 from public.insights_sync_due(20)) and not exists (select 1 from public.ads_sync_due(20)) then return; end if;
  perform net.http_post(
    url := replace(v_url, '/api/cron/publish', '/api/cron/insights'),
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

-- ---------------------------------------------------------------------------------------------
-- Who may call what

revoke all on function
  public.upsert_ad_sync(uuid, jsonb, jsonb), public.ads_sync_due(int), public.record_ad_object(uuid, text, text),
  public.record_ad_created(uuid), public.record_ad_failed(uuid, text), public.record_ad_status(uuid, text, uuid),
  public.approve_ad(uuid), public.reject_ad(uuid, text), public.retry_ad(uuid),
  public.set_ad_outcome(uuid, text, date, int, int)
  from public, anon, authenticated;

grant execute on function
  public.approve_ad(uuid), public.reject_ad(uuid, text), public.retry_ad(uuid), public.set_ad_outcome(uuid, text, date, int, int)
  to authenticated;

grant execute on function
  public.upsert_ad_sync(uuid, jsonb, jsonb), public.ads_sync_due(int), public.record_ad_object(uuid, text, text),
  public.record_ad_created(uuid), public.record_ad_failed(uuid, text), public.record_ad_status(uuid, text, uuid)
  to service_role;

revoke all on function private.lock_member_ad(uuid), private.guard_ad_draft_insert(), private.guard_ad_draft_update(),
  private.trigger_insights() from public, anon, authenticated;
