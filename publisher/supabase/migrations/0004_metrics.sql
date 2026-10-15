-- 0004_metrics — scorecard snapshots: each published post's numbers at 48 hours and 7 days.
--
-- One row per publication per snapshot, written once by the worker (service role) and never
-- edited, so a scorecard can't drift after the fact. A snapshot that can't be read (post deleted,
-- permission missing) is stored with `error` and no numbers, so it isn't retried every minute.
-- Members read their org's rows; all writes go through record_publication_metrics.

alter table public.publications add constraint publications_id_org_key unique (id, org_id);

create table public.publication_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  publication_id uuid not null,
  snapshot text not null check (snapshot in ('48h', '7d')),
  captured_at timestamptz not null default now(),
  views bigint check (views >= 0),
  reach bigint check (reach >= 0),
  saves bigint check (saves >= 0),
  shares bigint check (shares >= 0),
  likes bigint check (likes >= 0),
  comments bigint check (comments >= 0),
  avg_watch_ms bigint check (avg_watch_ms >= 0),
  error text check (error is null or length(error) <= 2000),
  raw jsonb not null default '{}'::jsonb check (jsonb_typeof(raw) = 'object'),
  foreign key (publication_id, org_id) references public.publications(id, org_id) on delete cascade,
  unique (publication_id, snapshot)
);

create or replace function private.guard_metrics_write_once() returns trigger
language plpgsql as $$
begin
  raise exception 'scorecard snapshots are write-once (publication %, %)', old.publication_id, old.snapshot
    using errcode = 'check_violation';
end $$;

create trigger publication_metrics_write_once before update on public.publication_metrics
  for each row execute function private.guard_metrics_write_once();

alter table public.publication_metrics enable row level security;
create policy publication_metrics_read on public.publication_metrics for select to authenticated
  using (private.is_org_member(org_id));
revoke insert, update, delete, truncate on public.publication_metrics from authenticated, anon;

-- Published publications with a snapshot whose time has come and that hasn't been taken yet.
create or replace function public.metrics_due(p_limit int default 10)
returns table (
  publication_id uuid, post_id uuid, platform text, external_ref text, external_id text,
  published_at timestamptz, snapshot text
)
language sql stable security definer set search_path = '' as $$
  select pb.id, pb.post_id, pb.platform, pb.external_ref, pb.external_id, pb.published_at, s.label
    from public.publications pb
    cross join (values ('48h', interval '48 hours'), ('7d', interval '7 days')) as s(label, after)
   where pb.status = 'published'
     and pb.published_at <= now() - s.after
     and not exists (select 1 from public.publication_metrics m where m.publication_id = pb.id and m.snapshot = s.label)
   order by pb.published_at, s.after
   limit greatest(1, least(p_limit, 50));
$$;

create or replace function public.record_publication_metrics(
  p_publication uuid, p_snapshot text,
  p_views bigint, p_reach bigint, p_saves bigint, p_shares bigint, p_likes bigint, p_comments bigint, p_avg_watch_ms bigint,
  p_error text, p_raw jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.publication_metrics
    (org_id, publication_id, snapshot, views, reach, saves, shares, likes, comments, avg_watch_ms, error, raw)
  select pb.org_id, pb.id, p_snapshot, p_views, p_reach, p_saves, p_shares, p_likes, p_comments, p_avg_watch_ms,
         left(p_error, 2000), coalesce(p_raw, '{}'::jsonb)
    from public.publications pb
   where pb.id = p_publication and pb.status = 'published'
  on conflict (publication_id, snapshot) do nothing;
end $$;

revoke all on function public.metrics_due(int),
  public.record_publication_metrics(uuid, text, bigint, bigint, bigint, bigint, bigint, bigint, bigint, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.metrics_due(int),
  public.record_publication_metrics(uuid, text, bigint, bigint, bigint, bigint, bigint, bigint, bigint, text, jsonb)
  to service_role;
revoke all on function private.guard_metrics_write_once() from public, anon, authenticated;

-- The per-minute trigger now also wakes the app when a snapshot is due.
create or replace function private.trigger_publisher() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  if not exists (
    select 1 from public.publications pb join public.posts p on p.id = pb.post_id
     where p.status = 'approved'
       and ((pb.status = 'pending' and (pb.scheduled_at is null or pb.scheduled_at <= now())) or pb.status = 'processing')
  ) and not exists (select 1 from public.metrics_due(1)) then
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

revoke all on function private.trigger_publisher() from public, anon, authenticated;
