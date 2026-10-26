-- 0029_admissions_feed — LWS Pune's leads for Admissions AI (founder, 2026-10-26). Admissions AI is where the counsellors
-- and telecallers work: it reads this feed every hour through GET /api/feeds/admissions (src/lib/domain/admissionsFeed.ts),
-- behind a shared secret, and adds each lead there as New. It holds no key to this database, as GoPost holds none to PYQ
-- Vault's (0028). Every lead with an Indian mobile counts, whatever the course: the founder's call ("all"); an email has
-- nothing a telecaller can dial. "Not a lead" deletes the row here, so such a lead is never served.
--
-- The cursor is (created_at, id): when the lead reached this list, not lead_at, because website and outside leads are
-- often added days after their date and a lead_at cursor would pass them by. A lead added in the last two minutes is held
-- back, so one whose transaction is still open when the feed is read can't land behind a cursor that has moved on.

create or replace function public.admissions_leads_after(p_org text, p_after_at timestamptz, p_after_id uuid, p_limit int)
returns table (
  id uuid, created_at timestamptz, lead_at timestamptz, name text, contact text, course text, class_level text,
  channel text, page text, from_ad boolean, reason text
)
language plpgsql stable security definer set search_path = '' as $$
declare v_org uuid;
begin
  if p_limit is null or p_limit < 1 or p_limit > 500 then perform private.fail('invalid_input', 'A page holds 1 to 500 leads.'); end if;
  if (p_after_at is null) <> (p_after_id is null) then perform private.fail('invalid_input', 'A cursor has a time and an id.'); end if;
  select o.id into v_org from public.organizations o where o.slug = p_org;
  if v_org is null then perform private.fail('not_found', 'Organisation not found.'); end if;
  return query
    select l.id, l.created_at, l.lead_at, l.name, l.contact, l.course, l.class_level, l.channel, l.page, l.from_ad, l.reason
      from public.leads l
     where l.org_id = v_org
       and l.contact ~ '^\+91[6-9][0-9]{9}$'
       and l.created_at < now() - interval '2 minutes'
       and (p_after_at is null or (l.created_at, l.id) > (p_after_at, p_after_id))
     order by l.created_at, l.id
     limit p_limit;
end $$;

revoke all on function public.admissions_leads_after(text, timestamptz, uuid, int) from public, anon, authenticated;
grant execute on function public.admissions_leads_after(text, timestamptz, uuid, int) to service_role;
