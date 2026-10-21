-- 0016_leads — one leads list (founder, 2026-10-21): name, contact, course, date and source for every real lead, from
-- every channel. Chats stay in the Inbox; a lead is the person worth calling back.
--   * Instagram: a chat becomes a lead when the person shares a phone number or email (no AI).
--   * WhatsApp: everyone there has a number, so Claude reads each new chat and only genuine ones become leads.
-- The hourly job /api/cron/leads (service role) does both: leads_to_check → src/lib/leads/screen.ts → record_lead_checks.
-- Every chat it looks at is marked checked up to its last incoming message, so it's looked at again only when they
-- write again. One lead per contact per organisation. Owners only, like the Inbox (many senders are minors).

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  -- The chat it came from. A removed account or chat leaves the lead in place.
  conversation_id uuid unique references public.conversations(id) on delete set null,
  account_id uuid references public.connected_accounts(id) on delete set null,
  channel text not null check (channel in ('instagram', 'whatsapp')),
  from_ad boolean not null default false,
  name text check (name is null or (name = btrim(name) and length(name) between 1 and 200)),
  -- +<country><number>, or an email in lower case.
  contact text not null check (contact ~ '^\+[1-9][0-9]{7,14}$' or (contact ~ '^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$' and length(contact) <= 200)),
  course text check (course is null or (course = btrim(course) and length(course) between 1 and 80)),
  -- When they became a lead: the message with their contact (Instagram), or their first message (WhatsApp).
  lead_at timestamptz not null default now(),
  -- Why it counts ("Shared a phone number", or Claude's one-line reason).
  reason text check (reason is null or length(reason) <= 300),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, contact)
);
create index leads_org_lead_at_idx on public.leads(org_id, lead_at desc);

alter table public.leads enable row level security;
create policy leads_read on public.leads for select to authenticated using (private.is_org_owner(org_id));
revoke insert, update, delete, truncate on public.leads from authenticated, anon;

alter table public.conversations
  add column lead_checked_at timestamptz,
  add column lead_reason text check (lead_reason is null or length(lead_reason) <= 300);

-- ---------------------------------------------------------------------------------------------
-- Job (service role): chats with something new from the person since the last check, newest first. Skipped: chats
-- already a lead, chats marked Not a lead, and WhatsApp numbers that are already a lead from another chat.
-- p_org narrows it to one organisation (the backfill script, tests); null means all.

create or replace function public.leads_to_check(p_channel text, p_limit int, p_org uuid default null)
returns table (conversation_id uuid, channel text, contact_id text, contact_name text, contact_username text, last_incoming_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.channel, c.contact_id, c.contact_name, c.contact_username, c.last_incoming_at
    from public.conversations c
   where c.channel = p_channel and (p_org is null or c.org_id = p_org) and c.last_incoming_at is not null and c.status <> 'not_lead'
     and (c.lead_checked_at is null or c.last_incoming_at > c.lead_checked_at)
     and not exists (select 1 from public.leads l where l.conversation_id = c.id)
     and not (c.channel = 'whatsapp' and exists (select 1 from public.leads l where l.org_id = c.org_id and l.contact = '+' || c.contact_id))
   order by c.last_incoming_at desc
   limit least(greatest(coalesce(p_limit, 0), 0), 500);
$$;

-- Job: what it found, in one go. Each check: {conversation_id, checked_at, reason?, lead?: {contact, name, course,
-- lead_at, reason}}. A contact that is already a lead is skipped. Returns how many leads were added.
create or replace function public.record_lead_checks(p_checks jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare r record; c record; v_id uuid; n int := 0;
begin
  if jsonb_typeof(p_checks) is distinct from 'array' then perform private.fail('invalid_input', 'Checks must be an array.'); end if;
  for r in select * from jsonb_to_recordset(p_checks) as x(conversation_id uuid, checked_at timestamptz, reason text, lead jsonb) loop
    select cv.id, cv.org_id, cv.account_id, cv.channel, cv.source, cv.status into c from public.conversations cv where cv.id = r.conversation_id for update;
    if c.id is null then continue; end if;
    update public.conversations set lead_checked_at = greatest(lead_checked_at, r.checked_at),
                                    lead_reason = coalesce(left(r.reason, 300), lead_reason)
     where id = c.id;
    if r.lead is null or jsonb_typeof(r.lead) <> 'object' or c.status = 'not_lead' then continue; end if;
    v_id := null;
    insert into public.leads (org_id, conversation_id, account_id, channel, from_ad, name, contact, course, lead_at, reason)
    values (c.org_id, c.id, c.account_id, c.channel, c.source = 'ad', nullif(btrim(r.lead->>'name'), ''), r.lead->>'contact',
            nullif(btrim(r.lead->>'course'), ''), coalesce((r.lead->>'lead_at')::timestamptz, now()), left(r.lead->>'reason', 300))
    on conflict do nothing
    returning id into v_id;
    if v_id is not null then
      n := n + 1;
      update public.conversations set status = 'interested', status_updated_at = now() where id = c.id and status = 'new';
    end if;
  end loop;
  return n;
end $$;

revoke all on function public.leads_to_check(text, int, uuid), public.record_lead_checks(jsonb) from public, anon, authenticated;
grant execute on function public.leads_to_check(text, int, uuid), public.record_lead_checks(jsonb) to service_role;

-- ---------------------------------------------------------------------------------------------
-- Owners: correct a lead, or remove a wrong one. Removing marks its chat Not a lead, so the job never adds it back.
-- "Not found" also covers "not an owner" so nothing leaks.

create or replace function public.update_lead(p_lead uuid, p_name text, p_course text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid; v_name text := nullif(btrim(coalesce(p_name, '')), ''); v_course text := nullif(btrim(coalesce(p_course, '')), '');
begin
  select org_id into v_org from public.leads where id = p_lead for update;
  if v_org is null or not private.is_org_owner(v_org) then perform private.fail('not_found', 'Lead not found.'); end if;
  if length(v_name) > 200 then perform private.fail('invalid_input', 'Names can be up to 200 characters.'); end if;
  if length(v_course) > 80 then perform private.fail('invalid_input', 'Courses can be up to 80 characters.'); end if;
  update public.leads set name = v_name, course = v_course, updated_by = auth.uid(), updated_at = now() where id = p_lead;
end $$;

create or replace function public.remove_lead(p_lead uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare l record;
begin
  select id, org_id, conversation_id into l from public.leads where id = p_lead for update;
  if l.id is null or not private.is_org_owner(l.org_id) then perform private.fail('not_found', 'Lead not found.'); end if;
  update public.conversations set status = 'not_lead', status_updated_by = auth.uid(), status_updated_at = now() where id = l.conversation_id;
  delete from public.leads where id = l.id;
end $$;

revoke all on function public.update_lead(uuid, text, text), public.remove_lead(uuid) from public, anon;
grant execute on function public.update_lead(uuid, text, text), public.remove_lead(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Every hour at :15 (same URL base and secret as the publisher tick, migration 0003).

create or replace function private.trigger_leads() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'publisher_cron_secret');
begin
  if v_url is null or v_secret is null then return; end if;
  perform net.http_post(
    url := replace(v_url, '/api/cron/publish', '/api/cron/leads'),
    headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end $$;

revoke all on function private.trigger_leads() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'leads-hourly';
select cron.schedule('leads-hourly', '15 * * * *', $$select private.trigger_leads()$$);
