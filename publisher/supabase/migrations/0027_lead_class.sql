-- 0027_lead_class — a lead's class (founder, 2026-10-25): "10", "11", "12", "12 passed"… The NDA age calculator gives it
-- (lead sheets, 0026); for any other lead an owner types it in with Edit. Shown on the Leads page and in the Excel download.
-- The calculator leads imported before this column existed carry it in their note ("…, class 12passed, …"): filled below.

alter table public.leads add column class_level text
  check (class_level is null or (class_level = btrim(class_level) and length(class_level) between 1 and 20));

-- "NDA age calculator: age 17.9, class 12passed, 2 attempts (…)" → "12 passed". Null when the note has no class.
create or replace function private.class_from_note(p_reason text) returns text
language sql immutable set search_path = '' as $$
  select nullif(left(regexp_replace(btrim((regexp_match(p_reason, 'class ([^,(]+)'))[1]), '(\d)\s*passed$', '\1 passed', 'i'), 20), '')
$$;

update public.leads set class_level = private.class_from_note(reason)
 where class_level is null and channel = 'website' and reason like 'NDA age calculator:%';

-- 0018's import, plus class_level.
create or replace function public.add_outside_leads(p_org uuid, p_channel text, p_rows jsonb)
returns int
language plpgsql security definer set search_path = '' as $$
declare r record; v_id uuid; n int := 0;
begin
  if not exists (select 1 from public.organizations where id = p_org) then perform private.fail('not_found', 'Organisation not found.'); end if;
  if p_channel is null or p_channel not in ('whatsapp', 'website') then perform private.fail('invalid_input', 'Unknown channel.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  for r in select * from jsonb_to_recordset(p_rows)
                  as x(name text, contact text, course text, class_level text, lead_at timestamptz, page text, from_ad boolean, reason text) loop
    if r.lead_at is null then perform private.fail('invalid_input', 'Every lead needs its date.'); end if;
    v_id := null;
    insert into public.leads (org_id, channel, from_ad, name, contact, course, class_level, lead_at, page, reason)
    values (p_org, p_channel, coalesce(r.from_ad, false), nullif(btrim(r.name), ''), r.contact, nullif(btrim(r.course), ''),
            nullif(btrim(r.class_level), ''), r.lead_at, nullif(btrim(r.page), ''), nullif(btrim(r.reason), ''))
    on conflict do nothing
    returning id into v_id;
    if v_id is not null then n := n + 1; end if;
  end loop;
  return n;
end $$;

-- 0016's owner edit, plus class. p_class null (an older caller) leaves the class alone; blank clears it.
drop function public.update_lead(uuid, text, text);
create function public.update_lead(p_lead uuid, p_name text, p_course text, p_class text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid; v_class text; v_name text := nullif(btrim(coalesce(p_name, '')), ''); v_course text := nullif(btrim(coalesce(p_course, '')), '');
begin
  select org_id, class_level into v_org, v_class from public.leads where id = p_lead for update;
  if v_org is null or not private.is_org_owner(v_org) then perform private.fail('not_found', 'Lead not found.'); end if;
  if p_class is not null then v_class := nullif(btrim(p_class), ''); end if;
  if length(v_name) > 200 then perform private.fail('invalid_input', 'Names can be up to 200 characters.'); end if;
  if length(v_course) > 80 then perform private.fail('invalid_input', 'Courses can be up to 80 characters.'); end if;
  if length(v_class) > 20 then perform private.fail('invalid_input', 'Classes can be up to 20 characters.'); end if;
  update public.leads set name = v_name, course = v_course, class_level = v_class, updated_by = auth.uid(), updated_at = now() where id = p_lead;
end $$;

revoke all on function public.update_lead(uuid, text, text, text) from public, anon;
grant execute on function public.update_lead(uuid, text, text, text) to authenticated;
