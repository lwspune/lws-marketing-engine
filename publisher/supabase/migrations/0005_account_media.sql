-- 0005_account_media — every reel on a connected Instagram account (including ones posted by hand)
-- with its latest numbers, for the dashboard's Insights tab. Refreshed daily by pg_cron via
-- /api/cron/insights, or on demand from the tab. Members read their org's rows; only the worker
-- (service role, through upsert_account_media) writes.

create table public.account_media (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  account_id uuid not null,
  external_id text not null check (length(external_id) between 1 and 100),
  product_type text not null check (length(product_type) between 1 and 40),
  media_type text not null check (length(media_type) between 1 and 40),
  permalink text not null check (permalink ~ '^https://'),
  caption text not null default '' check (length(caption) <= 500),
  posted_at timestamptz not null,
  likes bigint check (likes >= 0),
  comments bigint check (comments >= 0),
  views bigint check (views >= 0),
  reach bigint check (reach >= 0),
  saves bigint check (saves >= 0),
  shares bigint check (shares >= 0),
  avg_watch_ms bigint check (avg_watch_ms >= 0),
  insights_error text check (insights_error is null or length(insights_error) <= 2000),
  refreshed_at timestamptz not null default now(),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade,
  unique (account_id, external_id)
);
create index account_media_org_posted_idx on public.account_media(org_id, posted_at desc);

alter table public.account_media enable row level security;
create policy account_media_read on public.account_media for select to authenticated using (private.is_org_member(org_id));
revoke insert, update, delete, truncate on public.account_media from authenticated, anon;

-- Insert or refresh a batch of reels for one account, in one transaction.
create or replace function public.upsert_account_media(p_account uuid, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare v_org uuid; n int;
begin
  select org_id into v_org from public.connected_accounts where id = p_account;
  if v_org is null then perform private.fail('not_found', 'Account not found.'); end if;
  if jsonb_typeof(p_rows) <> 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  insert into public.account_media as m (org_id, account_id, external_id, product_type, media_type, permalink, caption, posted_at,
    likes, comments, views, reach, saves, shares, avg_watch_ms, insights_error, refreshed_at)
  select v_org, p_account, r.external_id, r.product_type, r.media_type, r.permalink, coalesce(left(r.caption, 500), ''), r.posted_at,
         r.likes, r.comments, r.views, r.reach, r.saves, r.shares, r.avg_watch_ms, left(r.insights_error, 2000), now()
    from jsonb_to_recordset(p_rows) as r(external_id text, product_type text, media_type text, permalink text, caption text,
         posted_at timestamptz, likes bigint, comments bigint, views bigint, reach bigint, saves bigint, shares bigint,
         avg_watch_ms bigint, insights_error text)
  on conflict (account_id, external_id) do update set
    product_type = excluded.product_type, media_type = excluded.media_type, permalink = excluded.permalink,
    caption = excluded.caption, posted_at = excluded.posted_at, likes = excluded.likes, comments = excluded.comments,
    views = excluded.views, reach = excluded.reach, saves = excluded.saves, shares = excluded.shares,
    avg_watch_ms = excluded.avg_watch_ms, insights_error = excluded.insights_error, refreshed_at = now();
  get diagnostics n = row_count;
  return n;
end $$;

-- Instagram accounts never synced, or not synced within the last p_hours.
create or replace function public.insights_sync_due(p_hours int default 20)
returns table (account_id uuid, org_id uuid, external_id text)
language sql stable security definer set search_path = '' as $$
  select a.id, a.org_id, a.external_id
    from public.connected_accounts a
   where a.platform = 'instagram'
     and coalesce((select max(m.refreshed_at) from public.account_media m where m.account_id = a.id), '-infinity'::timestamptz)
         < now() - make_interval(hours => p_hours);
$$;

revoke all on function public.upsert_account_media(uuid, jsonb), public.insights_sync_due(int) from public, anon, authenticated;
grant execute on function public.upsert_account_media(uuid, jsonb), public.insights_sync_due(int) to service_role;

-- Daily at 03:00 IST (21:30 UTC): call /api/cron/insights (same secret as the publisher tick).
create or replace function private.trigger_insights() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  if not exists (select 1 from public.insights_sync_due(20)) then return; end if;
  perform net.http_post(
    url := replace(v_url, '/api/cron/publish', '/api/cron/insights'),
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

revoke all on function private.trigger_insights() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'insights-daily';
select cron.schedule('insights-daily', '30 21 * * *', $$select private.trigger_insights()$$);
