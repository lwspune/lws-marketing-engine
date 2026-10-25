-- 0026_lead_sheets — leads from the Google Sheets the website fills (founder, 2026-10-25): the NDA age calculator and the
-- popup form ("Defence Age Calculator Data- LWS Pune", kept by the web agency). The hourly leads job reads each tab's new
-- rows as a Google service account (read-only, src/lib/leads/sheets.ts) and imports them through import_sheet_rows: the
-- leads and the tab's row marker move in one transaction, so a run cut off half way never skips rows or adds them twice.
-- Same list and rules as add_outside_leads (0018): channel 'website', one lead per contact per organisation.

create table public.lead_sheets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  spreadsheet_id text not null check (spreadsheet_id ~ '^[A-Za-z0-9_-]{20,100}$'),
  tab text not null check (tab = btrim(tab) and length(tab) between 1 and 100),
  -- How its rows read (src/lib/domain/leadSheets.ts).
  kind text not null check (kind in ('age_calculator', 'popup_form')),
  -- Shown as the lead's source on the Leads page.
  page text not null check (page = btrim(page) and length(page) between 1 and 200),
  -- The first row not read yet (row 1 is the headings).
  next_row int not null default 2 check (next_row >= 2),
  last_synced_at timestamptz,
  last_error text check (last_error is null or length(last_error) <= 500),
  created_at timestamptz not null default now(),
  unique (org_id, spreadsheet_id, tab)
);

alter table public.lead_sheets enable row level security;
create policy lead_sheets_read on public.lead_sheets for select to authenticated using (private.is_org_owner(org_id));
revoke insert, update, delete, truncate on public.lead_sheets from authenticated, anon;

-- Setup (service role, `npm run leads:sheet:add`): one tab to read. Adding it again changes nothing; returns its id.
create or replace function public.add_lead_sheet(p_org uuid, p_spreadsheet text, p_tab text, p_kind text, p_page text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  insert into public.lead_sheets (org_id, spreadsheet_id, tab, kind, page)
  values (p_org, p_spreadsheet, btrim(p_tab), p_kind, btrim(p_page))
  on conflict (org_id, spreadsheet_id, tab) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from public.lead_sheets where org_id = p_org and spreadsheet_id = p_spreadsheet and tab = btrim(p_tab);
  end if;
  return v_id;
end $$;

-- Job (service role): the leads read from rows p_from..p_next-1, with the tab's marker moved to p_next. Refused unless
-- p_from is the marker (another run got there first). Rows: [{name, contact, course, lead_at, from_ad, reason}].
-- Returns how many leads were new.
create or replace function public.import_sheet_rows(p_sheet uuid, p_from int, p_next int, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare s record; n int := 0;
begin
  select * into s from public.lead_sheets where id = p_sheet for update;
  if s.id is null then perform private.fail('not_found', 'Sheet not found.'); end if;
  if p_next is null or p_from is null or p_next < p_from then perform private.fail('invalid_input', 'The rows read are not valid.'); end if;
  if p_from <> s.next_row then perform private.fail('conflict', 'These rows were already read.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  if jsonb_array_length(p_rows) > 0 then
    n := public.add_outside_leads(s.org_id, 'website',
      (select jsonb_agg(x || jsonb_build_object('page', s.page)) from jsonb_array_elements(p_rows) x));
  end if;
  update public.lead_sheets set next_row = p_next, last_synced_at = now(), last_error = null where id = p_sheet;
  return n;
end $$;

-- Job (service role): why the last run couldn't read the tab (shown on the Leads page). The marker stays put.
create or replace function public.record_sheet_error(p_sheet uuid, p_error text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.lead_sheets set last_error = left(coalesce(nullif(btrim(p_error), ''), 'Unknown error'), 500) where id = p_sheet;
  if not found then perform private.fail('not_found', 'Sheet not found.'); end if;
end $$;

revoke all on function public.add_lead_sheet(uuid, text, text, text, text), public.import_sheet_rows(uuid, int, int, jsonb),
  public.record_sheet_error(uuid, text) from public, anon, authenticated;
grant execute on function public.add_lead_sheet(uuid, text, text, text, text), public.import_sheet_rows(uuid, int, int, jsonb),
  public.record_sheet_error(uuid, text) to service_role;
