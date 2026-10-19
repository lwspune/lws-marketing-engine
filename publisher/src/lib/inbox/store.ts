import type { SupabaseClient } from "@supabase/supabase-js";
import type { InboxRow } from "@/lib/domain/inbox";
import type { MetaConfig } from "@/lib/platforms/meta";
import { fetchInstagramProfile } from "@/lib/platforms/metaMessages";
import type { NeedsProfile } from "./webhook";

// Stores DMs through the 0012 database functions (service role). Shared by the webhook route, the reply action
// and `npm run messages:backfill`, so no `server-only` here: callers pass the admin client.

const CHUNK = 200;

export async function ingestRows(db: SupabaseClient, platform: "instagram", externalId: string, rows: InboxRow[]): Promise<NeedsProfile[]> {
  const needs = new Map<string, NeedsProfile>();
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { data, error } = await db.rpc("ingest_messages", { p_platform: platform, p_external_id: externalId, p_rows: rows.slice(i, i + CHUNK) });
    if (error) throw new Error(`ingest_messages: ${error.message}`);
    for (const r of (data ?? []) as { account_id: string; conversation_id: string; contact_id: string }[]) {
      needs.set(r.conversation_id, { accountId: r.account_id, conversationId: r.conversation_id, contactId: r.contact_id });
    }
  }
  return [...needs.values()];
}

/** Look up each new contact's name once. A failed lookup leaves the name empty; the next message tries again. */
export async function fillProfiles(
  db: SupabaseClient, cfg: MetaConfig, needs: NeedsProfile[], logger: { error: (...a: unknown[]) => void } = console,
): Promise<void> {
  const tokens = new Map<string, string | null>();
  for (const n of needs) {
    if (!tokens.has(n.accountId)) {
      const { data } = await db.rpc("get_account_token", { p_account: n.accountId });
      tokens.set(n.accountId, (data as string | null) ?? null);
    }
    const token = tokens.get(n.accountId);
    if (!token) continue;
    try {
      const p = await fetchInstagramProfile(cfg, { token, contactId: n.contactId });
      const { error } = await db.rpc("set_contact_profile", { p_conversation: n.conversationId, p_name: p.name ?? "", p_username: p.username ?? "" });
      if (error) throw new Error(`set_contact_profile: ${error.message}`);
    } catch (e) {
      logger.error("inbox: contact lookup failed", { conversationId: n.conversationId, error: (e as Error).message });
    }
  }
}
