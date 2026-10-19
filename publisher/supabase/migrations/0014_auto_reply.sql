-- 0014_auto_reply — auto-reply to ad chats (founder, 2026-10-19). Someone who messages an Instagram account from an
-- ad gets that account's saved reply within seconds, once. Owners save the text and switch it on or off in the Inbox.
-- The webhook (service role) claims a chat before sending: switched on, never claimed before, and nobody has replied
-- yet. One UPDATE does the check and the marking, so a re-delivered or concurrent webhook can't send it twice.
-- Which messages count as "from an ad" is decided in src/lib/domain/inbox.ts (adStarts).

create table public.auto_replies (
  account_id uuid primary key,
  org_id uuid not null,
  enabled boolean not null default false,
  body text not null check (body = btrim(body) and length(body) between 1 and 1000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  foreign key (account_id, org_id) references public.connected_accounts(id, org_id) on delete cascade
);

alter table public.auto_replies enable row level security;
create policy auto_replies_read on public.auto_replies for select to authenticated using (private.is_org_owner(org_id));
revoke insert, update, delete, truncate on public.auto_replies from authenticated, anon;

alter table public.conversations add column auto_replied_at timestamptz;

-- Owners: save the reply for one Instagram account. "Not found" also covers "not an owner" so nothing leaks.
create or replace function public.set_auto_reply(p_account uuid, p_enabled boolean, p_body text)
returns void
language plpgsql security definer set search_path = '' as $$
declare a record; v_body text := btrim(coalesce(p_body, ''));
begin
  select ca.id, ca.org_id, ca.platform into a from public.connected_accounts ca where ca.id = p_account;
  if a.id is null or not private.is_org_owner(a.org_id) then perform private.fail('not_found', 'Account not found.'); end if;
  if a.platform <> 'instagram' then perform private.fail('invalid_input', 'Auto-reply works on Instagram accounts only.'); end if;
  if length(v_body) not between 1 and 1000 then perform private.fail('invalid_input', 'The reply must be 1 to 1000 characters.'); end if;
  if p_enabled is null then perform private.fail('invalid_input', 'Say whether it is on or off.'); end if;
  insert into public.auto_replies (account_id, org_id, enabled, body, updated_by, updated_at)
  values (a.id, a.org_id, p_enabled, v_body, auth.uid(), now())
  on conflict (account_id) do update set enabled = excluded.enabled, body = excluded.body, updated_by = excluded.updated_by, updated_at = now();
end $$;

-- Webhook: claim this person's chat for the auto-reply. Returns the text to send, or no rows.
create or replace function public.claim_auto_reply(p_platform text, p_external_id text, p_contact_id text)
returns table (conversation_id uuid, account_id uuid, body text)
language sql security definer set search_path = '' as $$
  update public.conversations c set auto_replied_at = now()
    from public.connected_accounts ca, public.auto_replies ar
   where ca.platform = p_platform and ca.external_id = p_external_id
     and c.account_id = ca.id and c.contact_id = p_contact_id
     and ar.account_id = ca.id and ar.enabled
     and c.auto_replied_at is null and c.last_outgoing_at is null
  returning c.id, ca.id, ar.body;
$$;

-- Webhook: the send failed, so the person's next message may try again.
create or replace function public.release_auto_reply(p_conversation uuid)
returns void
language sql security definer set search_path = '' as $$
  update public.conversations set auto_replied_at = null where id = p_conversation and last_outgoing_at is null;
$$;

revoke all on function public.set_auto_reply(uuid, boolean, text) from public, anon;
grant execute on function public.set_auto_reply(uuid, boolean, text) to authenticated;
revoke all on function public.claim_auto_reply(text, text, text), public.release_auto_reply(uuid) from public, anon, authenticated;
grant execute on function public.claim_auto_reply(text, text, text), public.release_auto_reply(uuid) to service_role;
