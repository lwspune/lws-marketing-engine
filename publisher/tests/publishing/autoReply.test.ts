import { describe, expect, it, vi } from "vitest";
import { autoReplyToAds, type AutoReplyDeps } from "@/lib/inbox/autoReply";
import type { InboxRow } from "@/lib/domain/inbox";

// After the webhook stores a delivery, everyone who just messaged from an ad gets the saved reply, once.
// The database decides "once" (claim_auto_reply); this sends, records, and gives the claim back if sending fails.

const NOW = new Date("2026-10-19T12:00:00Z");
const TEXT = "Please share your contact. Our counsellor will reach out to you.";
const row = (over: Partial<InboxRow> = {}): InboxRow => ({
  contact_id: "9001", mid: "mid.1", direction: "in", body: "Can I learn more about your business?", attachment: null,
  sent_at: "2026-10-19T11:59:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});

function deps(over: Partial<AutoReplyDeps> = {}): AutoReplyDeps {
  return {
    claim: vi.fn(async (_ext: string, contactId: string) => [{ conversationId: `conv-${contactId}`, accountId: "acc1", body: TEXT }]),
    release: vi.fn(async () => {}),
    send: vi.fn(async (_acc: string, contactId: string) => `sent-${contactId}`),
    record: vi.fn(async () => {}),
    logger: { error: vi.fn() },
    now: () => NOW,
    ...over,
  };
}

describe("autoReplyToAds", () => {
  it("sends the saved reply to each person who just messaged from an ad, and records it in the Inbox", async () => {
    const d = deps();
    const sent = await autoReplyToAds("ig1", [row(), row({ contact_id: "9002", mid: "mid.2", body: "Hi" })], d);
    expect(sent).toBe(1);
    expect(d.claim).toHaveBeenCalledTimes(1);
    expect(d.claim).toHaveBeenCalledWith("ig1", "9001");
    expect(d.send).toHaveBeenCalledWith("acc1", "9001", TEXT);
    expect(d.record).toHaveBeenCalledWith("ig1", expect.objectContaining({
      contact_id: "9001", mid: "sent-9001", direction: "out", body: TEXT, sent_at: NOW.toISOString(), source: "direct",
    }));
    expect(d.release).not.toHaveBeenCalled();
  });

  it("sends nothing when the database doesn't hand out a claim (switched off, already replied, or a human answered)", async () => {
    const d = deps({ claim: vi.fn(async () => []) });
    expect(await autoReplyToAds("ig1", [row()], d)).toBe(0);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("does nothing at all for a delivery with no ad starts", async () => {
    const d = deps();
    expect(await autoReplyToAds("ig1", [row({ body: "Sir fees?" })], d)).toBe(0);
    expect(d.claim).not.toHaveBeenCalled();
  });

  it("gives the claim back when Instagram refuses, logs it, and still serves the next person", async () => {
    const d = deps({ send: vi.fn(async (_a: string, c: string) => { if (c === "9001") throw new Error("(#10) outside window"); return "sent-9002"; }) });
    const sent = await autoReplyToAds("ig1", [row(), row({ contact_id: "9002", mid: "mid.2" })], d);
    expect(sent).toBe(1);
    expect(d.release).toHaveBeenCalledWith("conv-9001");
    expect(d.logger!.error).toHaveBeenCalledWith("inbox: auto-reply failed", expect.objectContaining({ conversationId: "conv-9001" }));
    expect(d.record).toHaveBeenCalledTimes(1);
  });

  it("keeps the claim when only recording fails (the message went out; Instagram's echo stores it)", async () => {
    const d = deps({ record: vi.fn(async () => { throw new Error("db down"); }) });
    expect(await autoReplyToAds("ig1", [row()], d)).toBe(1);
    expect(d.release).not.toHaveBeenCalled();
    expect(d.logger!.error).toHaveBeenCalled();
  });
});
