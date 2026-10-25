-- 0028_lead_feeds — leads from PYQ Vault (founder, 2026-10-25): NDA, CDS and AFCAT students who gave a mobile and ticked
-- "I agree to be contacted", from their accounts and from the public NDA quizzes. The hourly leads job reads each feed
-- from PYQ Vault's /api/leads/defence after its cursor (src/lib/leads/pyqvault.ts) and imports each page through
-- import_feed_rows: the leads and the cursor move in one transaction, so a run cut off half way never skips a student or
-- adds them twice. PYQ Vault decides who counts; GoPost holds no key to its database. Same list and rules as
-- add_outside_leads (0018/0027): channel 'website', one lead per contact per organisation.

create table public.lead_feeds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  -- Which feed (src/lib/domain/pyqvaultLeads.ts).
  source text not null check (source in ('pyqvault_account', 'pyqvault_quiz')),
  -- Shown as the lead's source on the Leads page.
  page text not null check (page = btrim(page) and length(page) between 1 and 200),
  -- PYQ Vault's cursor after the last imported lead (<timestamp>~<id>); null = from the start.
  cursor text check (cursor is null or length(cursor) between 1 and 200),
  last_synced_at timestamptz,
  last_error text check (last_error is null or length(last_error) <= 500),
  created_at timestamptz not null default now(),
  unique (org_id, source)
);

alter table public.lead_feeds enable row level security;
create policy lead_feeds_read on public.lead_feeds for select to authenticated using (private.is_org_owner(org_id));
revoke insert, update, delete, truncate on public.lead_feeds from authenticated, anon;

-- Setup (service role, `npm run leads:pyqvault`): one feed to read. Adding it again changes nothing; returns its id.
create or replace function public.add_lead_feed(p_org uuid, p_source text, p_page text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  insert into public.lead_feeds (org_id, source, page)
  values (p_org, p_source, btrim(p_page))
  on conflict (org_id, source) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from public.lead_feeds where org_id = p_org and source = p_source;
  end if;
  return v_id;
end $$;

-- Job (service role): one page of leads read after cursor p_from, with the feed's cursor moved to p_next. Refused unless
-- p_from is the cursor (another run got there first). Rows: [{name, contact, course, class_level, lead_at, from_ad,
-- reason}]. Returns how many leads were new.
create or replace function public.import_feed_rows(p_feed uuid, p_from text, p_next text, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare s record; n int := 0;
begin
  select * into s from public.lead_feeds where id = p_feed for update;
  if s.id is null then perform private.fail('not_found', 'Feed not found.'); end if;
  if nullif(btrim(p_next), '') is null and p_from is not null then perform private.fail('invalid_input', 'The new cursor is missing.'); end if;
  if p_from is distinct from s.cursor then perform private.fail('conflict', 'These leads were already read.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  if jsonb_array_length(p_rows) > 0 then
    n := public.add_outside_leads(s.org_id, 'website',
      (select jsonb_agg(x || jsonb_build_object('page', s.page)) from jsonb_array_elements(p_rows) x));
  end if;
  update public.lead_feeds set cursor = nullif(btrim(p_next), ''), last_synced_at = now(), last_error = null where id = p_feed;
  return n;
end $$;

-- Job (service role): why the last run couldn't read the feed (shown on the Leads page). The cursor stays put.
create or replace function public.record_feed_error(p_feed uuid, p_error text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.lead_feeds set last_error = left(coalesce(nullif(btrim(p_error), ''), 'Unknown error'), 500) where id = p_feed;
  if not found then perform private.fail('not_found', 'Feed not found.'); end if;
end $$;

revoke all on function public.add_lead_feed(uuid, text, text), public.import_feed_rows(uuid, text, text, jsonb),
  public.record_feed_error(uuid, text) from public, anon, authenticated;
grant execute on function public.add_lead_feed(uuid, text, text), public.import_feed_rows(uuid, text, text, jsonb),
  public.record_feed_error(uuid, text) to service_role;
