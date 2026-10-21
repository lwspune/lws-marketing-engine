-- 0017_website_leads — lwspune.com form entries in the leads list (founder, 2026-10-21). The site emails every entry
-- from lws.adacoount@gmail.com; those emails are read in a Claude Code chat (the Gmail connector, that sender only),
-- parsed by src/lib/domain/leads.ts (parseFormEmail) and added by `npm run leads:website`. They have no chat behind
-- them: channel 'website', the form's page in `page`. Same rule as every lead: one per contact per organisation.

alter table public.leads drop constraint leads_channel_check;
alter table public.leads add constraint leads_channel_check check (channel in ('instagram', 'whatsapp', 'website'));
alter table public.leads add column page text check (page is null or length(page) between 1 and 200);

-- Import (service role): add form entries [{name, contact, course, lead_at, page}]. A contact that is already a lead
-- (from any channel) is skipped. Returns how many were added.
create or replace function public.add_website_leads(p_org uuid, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare r record; v_id uuid; n int := 0;
begin
  if not exists (select 1 from public.organizations where id = p_org) then perform private.fail('not_found', 'Organisation not found.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  for r in select * from jsonb_to_recordset(p_rows) as x(name text, contact text, course text, lead_at timestamptz, page text) loop
    if r.lead_at is null then perform private.fail('invalid_input', 'Every entry needs its date.'); end if;
    v_id := null;
    insert into public.leads (org_id, channel, name, contact, course, lead_at, page, reason)
    values (p_org, 'website', nullif(btrim(r.name), ''), r.contact, nullif(btrim(r.course), ''), r.lead_at, nullif(btrim(r.page), ''), 'Website form')
    on conflict do nothing
    returning id into v_id;
    if v_id is not null then n := n + 1; end if;
  end loop;
  return n;
end $$;

revoke all on function public.add_website_leads(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.add_website_leads(uuid, jsonb) to service_role;
