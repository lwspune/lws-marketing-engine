-- 0013_whatsapp — WhatsApp messages in the Inbox (founder, 2026-10-19): the API number +91 76206 99213, which WABridge
-- also uses for the attendance messages. GoPost listens alongside WABridge (its app subscribed to the same WhatsApp
-- account), so WABridge keeps working. The number is a connected account with platform 'whatsapp' (external_id = Meta's
-- phone number id, token = a system user token); its chats use the 0012 tables with channel 'whatsapp'.
-- WhatsApp sends each sender's profile name with the message, so ingest_messages now stores it (newest wins).

alter table public.connected_accounts drop constraint connected_accounts_platform_check;
alter table public.connected_accounts add constraint connected_accounts_platform_check
  check (platform in ('instagram', 'facebook', 'youtube', 'meta_ads', 'whatsapp'));

create or replace function public.ingest_messages(p_platform text, p_external_id text, p_rows jsonb)
returns table (account_id uuid, conversation_id uuid, contact_id text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare a record; r record; v_conv uuid; v_preview text;
begin
  if p_platform is null or p_platform not in ('instagram', 'whatsapp') then perform private.fail('invalid_input', 'Unknown channel.'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then perform private.fail('invalid_input', 'Rows must be an array.'); end if;
  for a in select ca.id, ca.org_id from public.connected_accounts ca where ca.platform = p_platform and ca.external_id = p_external_id loop
    for r in select * from jsonb_to_recordset(p_rows) as x(contact_id text, mid text, direction text, body text, attachment text,
                     sent_at timestamptz, source text, ad_id text, deleted boolean, contact_name text) order by x.sent_at loop
      if coalesce(r.deleted, false) then
        delete from public.messages m using public.conversations c
         where m.conversation_id = c.id and c.account_id = a.id and c.contact_id = r.contact_id and m.external_id = r.mid;
        continue;
      end if;
      v_preview := left(case when coalesce(r.body, '') = '' and r.attachment is not null then '[' || r.attachment || ']' else coalesce(r.body, '') end, 200);
      insert into public.conversations as c (org_id, account_id, channel, contact_id, contact_name, source, ad_id, first_message_at,
                                             last_message_at, last_incoming_at, last_outgoing_at, preview)
      values (a.org_id, a.id, p_platform, r.contact_id, left(nullif(btrim(r.contact_name), ''), 200), coalesce(r.source, 'direct'), r.ad_id,
              r.sent_at, r.sent_at, case when r.direction = 'in' then r.sent_at end, case when r.direction = 'out' then r.sent_at end, v_preview)
      on conflict (account_id, contact_id) do update set
        contact_name = coalesce(excluded.contact_name, c.contact_name),
        first_message_at = least(c.first_message_at, excluded.first_message_at),
        last_message_at = greatest(c.last_message_at, excluded.last_message_at),
        last_incoming_at = greatest(c.last_incoming_at, excluded.last_incoming_at),
        last_outgoing_at = greatest(c.last_outgoing_at, excluded.last_outgoing_at),
        preview = case when excluded.last_message_at >= c.last_message_at then excluded.preview else c.preview end
      returning c.id into v_conv;
      insert into public.messages (org_id, conversation_id, external_id, direction, body, attachment, sent_at)
      values (a.org_id, v_conv, r.mid, r.direction, coalesce(r.body, ''), r.attachment, r.sent_at)
      on conflict (conversation_id, external_id) do nothing;
    end loop;
    return query
      select a.id, c.id, c.contact_id from public.conversations c
       where c.account_id = a.id and c.contact_name is null and c.contact_username is null
         and c.contact_id in (select x.contact_id from jsonb_to_recordset(p_rows) as x(contact_id text, deleted boolean) where not coalesce(x.deleted, false));
  end loop;
end $$;

revoke all on function public.ingest_messages(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_messages(text, text, jsonb) to service_role;
