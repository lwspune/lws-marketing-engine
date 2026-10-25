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
    expect(d.fillProfiles).toHaveBeenCalledWith([{ accountId: "acc1", conversationId: "conv1", contactId: "9001", platform: "instagram" }]);
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

describe("handleMetaWebhook: auto-reply to ad chats", () => {
  it("hands each stored Instagram delivery to the auto-reply, after storing it", async () => {
    const autoReply = vi.fn(async () => 0), d = deps({ autoReply });
    expect((await handleMetaWebhook(post(body), d)).status).toBe(200);
    expect(autoReply).toHaveBeenCalledWith("ig1", [expect.objectContaining({ mid: "mid.1" })]);
    expect((d.ingest as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]).toBeLessThan(autoReply.mock.invocationCallOrder[0]);
  });

  it("never auto-replies when storing failed (Meta will deliver again)", async () => {
    const autoReply = vi.fn(async () => 0);
    await handleMetaWebhook(post(body), deps({ autoReply, ingest: vi.fn(async () => { throw new Error("db down"); }) }));
    expect(autoReply).not.toHaveBeenCalled();
  });

  it("still answers 200 and looks names up when the auto-reply itself breaks", async () => {
    const d = deps({ autoReply: vi.fn(async () => { throw new Error("vault down"); }) });
    expect((await handleMetaWebhook(post(body), d)).status).toBe(200);
    expect(d.fillProfiles).toHaveBeenCalled();
    expect(d.logger!.error).toHaveBeenCalledWith("inbox: auto-reply failed", expect.anything());
  });
});

describe("handleMetaWebhook: Facebook Page (Messenger)", () => {
  const fbBody = JSON.stringify({ object: "page", entry: [{ id: "page1", time: 1760860800000, messaging: [
    { sender: { id: "7001" }, recipient: { id: "page1" }, timestamp: 1760860800000, message: { mid: "m_fb1", text: "Batch?" } },
  ] }] });

  it("stores Messenger messages under the Page and looks new contacts' names up on Facebook", async () => {
    const d = deps({ ingest: vi.fn(async () => [{ accountId: "fb1", conversationId: "conv9", contactId: "7001" }]) });
    const res = await handleMetaWebhook(post(fbBody), d);
    expect(await res.json()).toEqual({ ok: true, data: { stored: 1 } });
    expect(d.ingest).toHaveBeenCalledWith("facebook", "page1", [expect.objectContaining({ mid: "m_fb1", direction: "in", body: "Batch?" })]);
    expect(d.fillProfiles).toHaveBeenCalledWith([{ accountId: "fb1", conversationId: "conv9", contactId: "7001", platform: "facebook" }]);
  });

  it("doesn't auto-reply on Messenger (Instagram only)", async () => {
    const autoReply = vi.fn(async () => 0);
    await handleMetaWebhook(post(fbBody), deps({ autoReply }));
    expect(autoReply).not.toHaveBeenCalled();
  });
});

describe("handleMetaWebhook: WhatsApp", () => {
  const waBody = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "WABA1", changes: [{ field: "messages", value: {
    metadata: { phone_number_id: "PN1" }, contacts: [{ profile: { name: "Parent A" }, wa_id: "919800000001" }],
    messages: [{ from: "919800000001", id: "wamid.1", timestamp: "1760860800", type: "text", text: { body: "Hi" } }] } }] }] });

  it("stores WhatsApp messages under the phone number id, and never looks names up on Instagram", async () => {
    const d = deps();
    const res = await handleMetaWebhook(post(waBody), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { stored: 1 } });
    expect(d.ingest).toHaveBeenCalledWith("whatsapp", "PN1", [expect.objectContaining({ mid: "wamid.1", contact_name: "Parent A" })]);
    expect(d.fillProfiles).not.toHaveBeenCalled();
  });

  it("doesn't auto-reply on WhatsApp (Instagram only for now)", async () => {
    const autoReply = vi.fn(async () => 0);
    await handleMetaWebhook(post(waBody), deps({ autoReply }));
    expect(autoReply).not.toHaveBeenCalled();
  });

  it("stores a WhatsApp Business app number's old chats (history) and phone-app replies (echoes) under its number", async () => {
    const value = (v: object) => ({ metadata: { phone_number_id: "PN3" }, ...v });
    const coexist = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "WABA2", changes: [
      { field: "history", value: value({ history: [{ metadata: { phase: 0, chunk_order: 1, progress: 100 }, threads: [{ id: "919800000001", messages: [
        { from: "919800000001", id: "wamid.h1", timestamp: "1750000000", type: "text", text: { body: "Fees?" } }] }] }] }) },
      { field: "smb_message_echoes", value: value({ message_echoes: [
        { from: "917020003600", to: "919800000001", id: "wamid.e1", timestamp: "1760860900", type: "text", text: { body: "₹499" } }] }) },
    ] }] });
    const d = deps();
    const res = await handleMetaWebhook(post(coexist), d);
    expect(await res.json()).toEqual({ ok: true, data: { stored: 2 } });
    expect(d.ingest).toHaveBeenCalledWith("whatsapp", "PN3", [
      expect.objectContaining({ mid: "wamid.h1", direction: "in" }), expect.objectContaining({ mid: "wamid.e1", direction: "out" }),
    ]);
  });
});
