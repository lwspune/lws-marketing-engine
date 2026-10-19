import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { handleMetaWebhook, type WebhookDeps } from "@/lib/inbox/webhook";

// /api/webhooks/meta: Meta calls it once to check the address (GET), then for every DM (POST, signed with the app secret).

const SECRET = "app-secret", VERIFY = "verify-token-123";
const body = JSON.stringify({ object: "instagram", entry: [{ id: "ig1", messaging: [
  { sender: { id: "9001" }, recipient: { id: "ig1" }, timestamp: 1760860800000, message: { mid: "mid.1", text: "Hi" } },
] }] });
const sign = (b: string) => `sha256=${createHmac("sha256", SECRET).update(b).digest("hex")}`;
const post = (b: string, sig: string | null = sign(b)) =>
  new Request("https://gopost.test/api/webhooks/meta", { method: "POST", body: b, headers: sig ? { "x-hub-signature-256": sig } : {} });

function deps(over: Partial<WebhookDeps> = {}): WebhookDeps {
  return {
    appSecret: SECRET, verifyToken: VERIFY,
    ingest: vi.fn(async () => [{ accountId: "acc1", conversationId: "conv1", contactId: "9001" }]),
    fillProfiles: vi.fn(async () => {}),
    logger: { error: vi.fn() },
    ...over,
  };
}

describe("handleMetaWebhook: address check (GET)", () => {
  const get = (q: string) => new Request(`https://gopost.test/api/webhooks/meta?${q}`);
  it("answers Meta's challenge when the verify token matches", async () => {
    const res = await handleMetaWebhook(get(`hub.mode=subscribe&hub.verify_token=${VERIFY}&hub.challenge=1158201444`), deps());
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("1158201444");
  });
  it("refuses a wrong token, a wrong mode, or an unset token", async () => {
    expect((await handleMetaWebhook(get("hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1"), deps())).status).toBe(403);
    expect((await handleMetaWebhook(get(`hub.mode=unsubscribe&hub.verify_token=${VERIFY}&hub.challenge=1`), deps())).status).toBe(403);
    expect((await handleMetaWebhook(get("hub.mode=subscribe&hub.verify_token=&hub.challenge=1"), deps({ verifyToken: "" }))).status).toBe(403);
  });
});

describe("handleMetaWebhook: messages (POST)", () => {
  it("stores a signed delivery, fills in new contacts' names, and answers in the standard shape", async () => {
    const d = deps();
    const res = await handleMetaWebhook(post(body), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { stored: 1 } });
    expect(d.ingest).toHaveBeenCalledWith("instagram", "ig1", [expect.objectContaining({ mid: "mid.1", direction: "in", body: "Hi" })]);
    expect(d.fillProfiles).toHaveBeenCalledWith([{ accountId: "acc1", conversationId: "conv1", contactId: "9001" }]);
  });

  it("turns away an unsigned or wrongly signed delivery without storing anything", async () => {
    const d = deps();
    expect((await handleMetaWebhook(post(body, null), d)).status).toBe(401);
    expect((await handleMetaWebhook(post(body, sign(body + "x")), d)).status).toBe(401);
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("refuses a signed body that isn't JSON", async () => {
    expect((await handleMetaWebhook(post("not json"), deps())).status).toBe(400);
  });

  it("answers 200 with nothing stored for deliveries that hold no messages (read receipts, other objects)", async () => {
    const d = deps(), b = JSON.stringify({ object: "page", entry: [] });
    const res = await handleMetaWebhook(post(b), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { stored: 0 } });
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("answers 500 when storing fails, so Meta delivers it again", async () => {
    const d = deps({ ingest: vi.fn(async () => { throw new Error("db down"); }) });
    const res = await handleMetaWebhook(post(body), d);
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ ok: false, error: { code: "ingest_failed" } });
    expect(d.logger!.error).toHaveBeenCalled();
  });

  it("still answers 200 when only the name lookup fails (the message is already stored)", async () => {
    const d = deps({ fillProfiles: vi.fn(async () => { throw new Error("meta down"); }) });
    expect((await handleMetaWebhook(post(body), d)).status).toBe(200);
    expect(d.logger!.error).toHaveBeenCalled();
  });
});
