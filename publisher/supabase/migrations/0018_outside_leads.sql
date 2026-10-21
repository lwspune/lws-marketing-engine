-- 0018_outside_leads — leads from chats GoPost can't see (founder, 2026-10-21): e.g. WhatsApp chats on +91 91563 10546,
-- the number the SPI ads point to, which isn't connected to GoPost. They're read in a Claude Code chat (WhatsApp Web,
-- read-only), the founder approves each verdict, and `npm run leads:add` adds them. No chat behind them; `page` holds
-- where they wrote in (the form page for website leads, the number for WhatsApp). One lead per contact per organisation.

comment on column public.leads.page is 'Where they wrote in when there is no GoPost chat: the form page (website) or the number (whatsapp).';

-- Import (service role): rows [{name, contact, course, lead_at, page, from_ad, reason}]. A contact that is already a lead
-- (from any channel) is skipped. Returns how many were added.
create or replace function public.add_outside_leads(p_org uuid, p_channel text, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare r record; v_id uuid; n int := 0;
begin
  if not exists (select 1 from public.organizations where id = p_org) then perform private.fail('not_found', 'Organisation not found.'); end if;
  if p_channel is null or p_channel not in ('whatsapp', 'website') then perform private.fail('invalid_input', 'Unknown channel.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  for r in select * from jsonb_to_recordset(p_rows)
                  as x(name text, contact text, course text, lead_at timestamptz, page text, from_ad boolean, reason text) loop
    if r.lead_at is null then perform private.fail('invalid_input', 'Every lead needs its date.'); end if;
    v_id := null;
    insert into public.leads (org_id, channel, from_ad, name, contact, course, lead_at, page, reason)
    values (p_org, p_channel, coalesce(r.from_ad, false), nullif(btrim(r.name), ''), r.contact, nullif(btrim(r.course), ''),
            r.lead_at, nullif(btrim(r.page), ''), nullif(btrim(r.reason), ''))
    on conflict do nothing
    returning id into v_id;
    if v_id is not null then n := n + 1; end if;
  end loop;
  return n;
end $$;

revoke all on function public.add_outside_leads(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.add_outside_leads(uuid, text, jsonb) to service_role;
