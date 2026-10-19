-- 0012_inbox — Instagram DMs pulled into GoPost (founder, 2026-10-19): read and reply in one place, mark
-- leads, count them, and mine what students ask for reel ideas. WhatsApp will use the same tables (channel).
--
-- Many senders are students (often minors), so:
--   * ONLY owners read conversations and messages: not editors, not staff (RLS below).
--   * Nobody signed in writes them. Meta's webhook (service role) stores messages through ingest_messages;
--     owners change a chat's lead status through set_conversation_status.
--   * Message text is deleted after 12 months by a nightly job. The conversation row (who, when, how it
--     started, lead status) stays for the lead counts.
--   * No attachment URLs and no raw payloads are kept: just the attachment's type.

create or replace function private.is_org_owner(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.org_members m where m.org_id = p_org and m.user_id = auth.uid() and m.role = 'owner');
$$;
revoke all on function private.is_org_owner(uuid) from public, anon;
grant execute on function private.is_org_owner(uuid) to authenticated;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  account_id uuid not null,
  channel text not null check (channel in ('instagram', 'whatsapp')),
  -- The person on the other side: Instagram-scoped user id, or WhatsApp number id.
  contact_id text not null check (contact_id ~ '^[0-9A-Za-z_.:-]{1,100}$'),
  contact_name text check (contact_name is null or length(contact_name) <= 200),
  contact_username text check (contact_username is null or length(contact_username) <= 100),
  status text not null default 'new' check (status in ('new', 'interested', 'booked', 'bought', 'not_lead')),
  -- How the chat started (from its first message): an ad (with the ad's id), a story reply, or directly.
  source text not null default 'direct' check (source in ('direct', 'ad', 'story')),
  ad_id text check (ad_id is null or ad_id ~ '^\d{1,30}$'),
  first_message_at timestamptz not null,
  last_message_at timestamptz not null,
  last_incoming_at timestamptz,
  last_outgoing_at timestamptz,
  preview text not null default '' check (length(preview) <= 200),
  status_updated_by uuid references auth.users(id) on delete set null,
  status_updated_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade,
  unique (account_id, contact_id),
  unique (id, org_id),
  constraint conversations_ad_has_id check ((source = 'ad') = (ad_id is not null))
);
create index conversations_org_last_idx on public.conversations(org_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  conversation_id uuid not null,
  external_id text not null check (length(external_id) between 1 and 400),
  direction text not null check (direction in ('in', 'out')),
  body text not null default '' check (length(body) <= 4000),
  attachment text check (attachment is null or attachment ~ '^[a-z_]{1,20}$'),
  sent_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (conversation_id, org_id) references public.conversations(id, org_id) on delete cascade,
  -- Meta re-delivers webhooks: the same message is stored once.
  unique (conversation_id, external_id)
);
create index messages_conversation_sent_idx on public.messages(conversation_id, sent_at);
create index messages_sent_idx on public.messages(sent_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
create policy conversations_read on public.conversations for select to authenticated using (private.is_org_owner(org_id));
create policy messages_read on public.messages for select to authenticated using (private.is_org_owner(org_id));
revoke insert, update, delete, truncate on public.conversations, public.messages from authenticated, anon;

-- ---------------------------------------------------------------------------------------------
-- Webhook (service role): store a batch of messages for every connected account with this external id.
-- Rows: {contact_id, mid, direction, body, attachment, sent_at, source, ad_id, deleted} (src/lib/domain/inbox.ts).
-- Returns the conversations still without a name, so the caller can look them up once.

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
                     sent_at timestamptz, source text, ad_id text, deleted boolean) order by x.sent_at loop
      if coalesce(r.deleted, false) then
        delete from public.messages m using public.conversations c
         where m.conversation_id = c.id and c.account_id = a.id and c.contact_id = r.contact_id and m.external_id = r.mid;
        continue;
      end if;
      v_preview := left(case when coalesce(r.body, '') = '' and r.attachment is not null then '[' || r.attachment || ']' else coalesce(r.body, '') end, 200);
      insert into public.conversations as c (org_id, account_id, channel, contact_id, source, ad_id, first_message_at, last_message_at,
                                             last_incoming_at, last_outgoing_at, preview)
      values (a.org_id, a.id, p_platform, r.contact_id, coalesce(r.source, 'direct'), r.ad_id, r.sent_at, r.sent_at,
              case when r.direction = 'in' then r.sent_at end, case when r.direction = 'out' then r.sent_at end, v_preview)
      on conflict (account_id, contact_id) do update set
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

create or replace function public.set_contact_profile(p_conversation uuid, p_name text, p_username text)
returns void
language sql security definer set search_path = '' as $$
  update public.conversations
     set contact_name = left(nullif(btrim(p_name), ''), 200), contact_username = left(nullif(btrim(p_username), ''), 100)
   where id = p_conversation;
$$;

revoke all on function public.ingest_messages(text, text, jsonb), public.set_contact_profile(uuid, text, text) from public, anon, authenticated;
grant execute on function public.ingest_messages(text, text, jsonb), public.set_contact_profile(uuid, text, text) to service_role;

-- ---------------------------------------------------------------------------------------------
-- Owners: mark how far a chat got. "Not found" also covers "not an owner" so nothing leaks.

create or replace function public.set_conversation_status(p_conversation uuid, p_status text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_org uuid;
begin
  select org_id into v_org from public.conversations where id = p_conversation for update;
  if v_org is null or not private.is_org_owner(v_org) then perform private.fail('not_found', 'Conversation not found.'); end if;
  if p_status is null or p_status not in ('new', 'interested', 'booked', 'bought', 'not_lead') then
    perform private.fail('invalid_status', 'Unknown lead status.');
  end if;
  update public.conversations set status = p_status, status_updated_by = auth.uid(), status_updated_at = now() where id = p_conversation;
end $$;

revoke all on function public.set_conversation_status(uuid, text) from public, anon;
grant execute on function public.set_conversation_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Retention: message text older than p_months goes, and so does the preview of chats that went quiet then.

create or replace function private.purge_old_messages(p_months int default 12) returns int
language plpgsql security definer set search_path = '' as $$
declare v_cutoff timestamptz := now() - make_interval(months => p_months); n int;
begin
  delete from public.messages where sent_at < v_cutoff;
  get diagnostics n = row_count;
  update public.conversations set preview = '' where last_message_at < v_cutoff and preview <> '';
  return n;
end $$;

revoke all on function private.purge_old_messages(int) from public, anon, authenticated;

-- Nightly at 03:30 IST (22:00 UTC), inside the database: no app call needed.
select cron.unschedule(jobid) from cron.job where jobname = 'messages-retention';
select cron.schedule('messages-retention', '0 22 * * *', $$select private.purge_old_messages(12)$$);
