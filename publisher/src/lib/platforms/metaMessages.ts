import { attachmentType, MAX_BODY, type InboxRow } from "@/lib/domain/inbox";
import { graphUrl, metaCall, type MetaConfig } from "./meta";

// Instagram messaging with the stored Page token (instagram_manage_messages). With a Page token, /me is the Page.
// New messages arrive by webhook (src/lib/inbox/webhook.ts); this reads old chats once, looks up names, and replies.

/** Send one text reply; returns Meta's message id (the webhook echo of it is then ignored as a duplicate). */
export async function sendInstagramText(cfg: MetaConfig, input: { token: string; recipientId: string; text: string }): Promise<string> {
  const res = await metaCall(graphUrl(cfg, "me/messages"), {
    method: "POST",
    params: { recipient: JSON.stringify({ id: input.recipientId }), message: JSON.stringify({ text: input.text }), access_token: input.token },
    token: input.token,
  });
  return String(res.message_id);
}

export async function fetchInstagramProfile(cfg: MetaConfig, input: { token: string; contactId: string }): Promise<{ name: string | null; username: string | null }> {
  const res = await metaCall(graphUrl(cfg, input.contactId), {
    method: "GET", params: { fields: "name,username", access_token: input.token }, token: input.token,
  });
  return { name: typeof res.name === "string" ? res.name : null, username: typeof res.username === "string" ? res.username : null };
}

interface ApiMessage {
  id: string; created_time: string; message?: string;
  from?: { id: string; username?: string }; to?: { data?: { id: string; username?: string }[] };
}
interface ApiConversation { id: string; messages?: { data?: ApiMessage[] } }

/**
 * The account's existing chats, newest first, with each one's recent messages (Meta returns about 20 per chat).
 * Used once by `npm run messages:backfill`; how a chat started isn't known for old chats, so they count as direct.
 */
export async function fetchInstagramConversations(
  cfg: MetaConfig, input: { token: string; igUserId: string; maxConversations?: number },
): Promise<{ rows: InboxRow[]; usernames: Record<string, string> }> {
  const max = input.maxConversations ?? 200;
  const rows: InboxRow[] = [], usernames: Record<string, string> = {};
  let seen = 0, after: string | undefined;
  do {
    const params: Record<string, string> = {
      platform: "instagram", fields: "id,updated_time,messages.limit(20){id,created_time,from,to,message}", limit: "25", access_token: input.token,
    };
    if (after) params.after = after;
    const page = (await metaCall(graphUrl(cfg, "me/conversations"), { method: "GET", params, token: input.token })) as {
      data?: ApiConversation[]; paging?: { cursors?: { after?: string }; next?: string };
    };
    for (const c of page.data ?? []) {
      if (seen++ >= max) break;
      for (const m of c.messages?.data ?? []) {
        const out = m.from?.id === input.igUserId;
        const other = out ? m.to?.data?.[0] : m.from;
        const sentAt = new Date(m.created_time.replace(/\+0000$/, "Z"));
        if (!other?.id || Number.isNaN(sentAt.getTime())) continue;
        if (other.username) usernames[other.id] = other.username;
        const body = (m.message ?? "").slice(0, MAX_BODY);
        rows.push({
          contact_id: other.id, mid: m.id, direction: out ? "out" : "in", body,
          // The list call doesn't say what an empty message held (a photo, a reel share…).
          attachment: body ? null : attachmentType(undefined),
          sent_at: sentAt.toISOString(), source: "direct", ad_id: null, deleted: false,
        });
      }
    }
    after = seen < max && page.paging?.next ? page.paging.cursors?.after : undefined;
  } while (after);
  return { rows, usernames };
}
