import { adStarts, type InboxRow } from "@/lib/domain/inbox";

// Auto-reply to ad chats (founder, 2026-10-19; migration 0014). Runs after the webhook stores an Instagram delivery.
// The database decides who gets a reply (claim_auto_reply: switched on, once per chat, nobody has replied yet);
// this sends it, records it, and gives the claim back if Instagram refuses so the person's next message retries.

export interface AutoReplyClaim { conversationId: string; accountId: string; body: string }

export interface AutoReplyDeps {
  claim: (accountExternalId: string, contactId: string) => Promise<AutoReplyClaim[]>;
  release: (conversationId: string) => Promise<void>;
  /** Sends one Instagram text from the account; returns Meta's message id. */
  send: (accountId: string, contactId: string, text: string) => Promise<string>;
  record: (accountExternalId: string, row: InboxRow) => Promise<void>;
  logger?: { error: (...args: unknown[]) => void };
  now?: () => Date;
}

/** Returns how many replies went out. */
export async function autoReplyToAds(accountExternalId: string, rows: InboxRow[], deps: AutoReplyDeps): Promise<number> {
  const log = deps.logger ?? console;
  const now = deps.now ?? (() => new Date());
  let sent = 0;
  for (const contactId of adStarts(rows, now())) {
    for (const c of await deps.claim(accountExternalId, contactId)) {
      let mid: string;
      try {
        mid = await deps.send(c.accountId, contactId, c.body);
      } catch (e) {
        log.error("inbox: auto-reply failed", { conversationId: c.conversationId, error: (e as Error).message });
        await deps.release(c.conversationId);
        continue;
      }
      sent++;
      try {
        await deps.record(accountExternalId, {
          contact_id: contactId, mid, direction: "out", body: c.body, attachment: null,
          sent_at: now().toISOString(), source: "direct", ad_id: null, deleted: false,
        });
      } catch (e) {
        // Sent already; Instagram's echo of it will be stored by the webhook.
        log.error("inbox: storing an auto-reply failed", { conversationId: c.conversationId, error: (e as Error).message });
      }
    }
  }
  return sent;
}
