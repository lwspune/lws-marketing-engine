import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import {
  exchangeSignupCode, fetchInstagramConversations, fetchInstagramProfile, findWhatsAppNumber, listWabaNumbers, requestWhatsAppHistory,
  sendInstagramText, sendWhatsAppText, subscribeAppToWaba,
} from "@/lib/platforms/metaMessages";
import { MetaApiError } from "@/lib/platforms/meta";

// Instagram messaging over the Graph API with the stored Page token (instagram_manage_messages).

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

describe("sendInstagramText", () => {
  it("sends a text reply to the person and returns Meta's message id", async () => {
    fake = await startFakeMeta();
    const mid = await sendInstagramText(fake.config, { token: "T", recipientId: "9001", text: "Syllabus PDF is in our bio link" });
    expect(mid).toBe("mid.sent1");
    const call = fake.calls.find((c) => c.method === "POST" && c.path.endsWith("/me/messages"))!;
    expect(JSON.parse(call.params.recipient)).toEqual({ id: "9001" });
    expect(JSON.parse(call.params.message)).toEqual({ text: "Syllabus PDF is in our bio link" });
  });

  it("raises Meta's reason when it refuses (e.g. outside the 24-hour window), without the token", async () => {
    const token = "EAAG-secret-token-0123456789";
    fake = await startFakeMeta({ failOn: { path: /\/me\/messages$/, status: 400, message: `This message is sent outside of allowed window. ${token}` } });
    const err = await sendInstagramText(fake.config, { token, recipientId: "9001", text: "hi" }).catch((e) => e);
    expect(err).toBeInstanceOf(MetaApiError);
    expect(err.message).toMatch(/outside of allowed window/);
    expect(err.message).not.toContain(token);
  });
});

describe("fetchInstagramProfile", () => {
  it("reads the person's name and username", async () => {
    fake = await startFakeMeta();
    expect(await fetchInstagramProfile(fake.config, { token: "T", contactId: "9001" })).toEqual({ name: "Rahul S", username: "rahul_07" });
  });
});

describe("fetchInstagramConversations", () => {
  const conv = (id: string, contact: string, msgs: [string, "in" | "out", string, string][]) => ({
    id, updated_time: "2026-10-18T10:00:00+0000",
    messages: { data: msgs.map(([mid, dir, text, at]) => ({
      id: mid, created_time: at, message: text,
      from: dir === "in" ? { id: contact, username: `user_${contact}` } : { id: "ig1", username: "lws.pune" },
      to: { data: [dir === "in" ? { id: "ig1", username: "lws.pune" } : { id: contact, username: `user_${contact}` }] },
    })) },
  });

  it("lists every page of conversations and turns their recent messages into rows, with usernames", async () => {
    fake = await startFakeMeta({
      igConversations: [
        conv("c1", "9001", [["m2", "out", "Yes, ₹499", "2026-10-18T10:00:00+0000"], ["m1", "in", "Fees?", "2026-10-18T09:00:00+0000"]]),
        conv("c2", "9002", [["m3", "in", "", "2026-10-17T09:00:00+0000"]]),
        conv("c3", "9003", [["m4", "in", "Hello", "2026-10-16T09:00:00+0000"]]),
      ],
      igConversationsPageSize: 2,
    });
    const out = await fetchInstagramConversations(fake.config, { token: "T", igUserId: "ig1" });
    expect(out.rows).toEqual([
      { contact_id: "9001", mid: "m2", direction: "out", body: "Yes, ₹499", attachment: null, sent_at: "2026-10-18T10:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9001", mid: "m1", direction: "in", body: "Fees?", attachment: null, sent_at: "2026-10-18T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9002", mid: "m3", direction: "in", body: "", attachment: "other", sent_at: "2026-10-17T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9003", mid: "m4", direction: "in", body: "Hello", attachment: null, sent_at: "2026-10-16T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
    ]);
    expect(out.usernames).toEqual({ "9001": "user_9001", "9002": "user_9002", "9003": "user_9003" });
    const lists = fake.calls.filter((c) => c.path.endsWith("/me/conversations"));
    expect(lists).toHaveLength(2);
    expect(lists[0].params.platform).toBe("instagram");
  });

  it("stops at the conversation cap", async () => {
    fake = await startFakeMeta({
      igConversations: Array.from({ length: 5 }, (_, i) => conv(`c${i}`, `90${i}`, [[`m${i}`, "in", "x", "2026-10-16T09:00:00+0000"]])),
      igConversationsPageSize: 2,
    });
    const out = await fetchInstagramConversations(fake.config, { token: "T", igUserId: "ig1", maxConversations: 3 });
    expect(new Set(out.rows.map((r) => r.contact_id)).size).toBe(3);
  });
});

describe("WhatsApp Cloud API", () => {
  it("sends a text reply from our phone number as JSON and returns the message id", async () => {
    fake = await startFakeMeta();
    const id = await sendWhatsAppText(fake.config, { token: "SYS", phoneNumberId: "PN1", to: "919800000001", text: "Sunday 10 am slot is open" });
    expect(id).toBe("wamid.sent1");
    const call = fake.calls.find((c) => c.method === "POST" && c.path.endsWith("/PN1/messages"))!;
    expect(call.headers["content-type"]).toMatch(/application\/json/);
    expect(call.headers.authorization).toBe("Bearer SYS");
    expect(call.json).toEqual({
      messaging_product: "whatsapp", recipient_type: "individual", to: "919800000001", type: "text",
      text: { body: "Sunday 10 am slot is open", preview_url: false },
    });
  });

  it("finds the number's WhatsApp account and phone number id from the token's access", async () => {
    fake = await startFakeMeta();
    expect(await findWhatsAppNumber(fake.config, { token: "SYS", appToken: "APP|SECRET", number: "+91 76206 99213" })).toEqual({
      wabaId: "WABA1", phoneNumberId: "PN1", displayPhoneNumber: "+91 76206 99213", verifiedName: "LWS PUNE PRIVATE LIMITED",
    });
  });

  it("for a system user token (no account list on the token), finds the number through the business portfolio", async () => {
    fake = await startFakeMeta({ debugTokenNoTargets: true });
    expect(await findWhatsAppNumber(fake.config, { token: "SYS", appToken: "APP|SECRET", number: "7620699213", businessId: "BIZ1" }))
      .toMatchObject({ wabaId: "WABA1", phoneNumberId: "PN1" });
    const err = await findWhatsAppNumber(fake.config, { token: "SYS", appToken: "APP|SECRET", number: "7620699213" }).catch((e) => e);
    expect(err.message).toMatch(/--business/);
  });

  it("says which numbers the token can reach when the asked one isn't among them", async () => {
    fake = await startFakeMeta();
    const err = await findWhatsAppNumber(fake.config, { token: "SYS", appToken: "APP|SECRET", number: "9156310546" }).catch((e) => e);
    expect(err.message).toMatch(/9156310546/);
    expect(err.message).toMatch(/\+91 76206 99213/);
  });

  it("subscribes our app to the WhatsApp account without replacing other apps' webhooks", async () => {
    fake = await startFakeMeta();
    await subscribeAppToWaba(fake.config, { token: "SYS", wabaId: "WABA1" });
    const call = fake.calls.find((c) => c.method === "POST" && c.path.endsWith("/WABA1/subscribed_apps"))!;
    expect(call.params.override_callback_uri).toBeUndefined();
  });
});

// A WhatsApp Business app number joins the Cloud API through Meta's Embedded Signup ("coexistence"): the phone keeps working.
describe("WhatsApp Business app number (Embedded Signup)", () => {
  it("swaps the sign-up code for the business token, with the app's id and secret", async () => {
    fake = await startFakeMeta();
    expect(await exchangeSignupCode(fake.config, { appId: "APP", appSecret: "SECRET", code: "CODE1" })).toBe("BIZTOKEN-0123456789abcdef");
    const call = fake.calls.find((c) => c.path.endsWith("/oauth/access_token"))!;
    expect(call.method).toBe("GET");
    expect(call.params).toMatchObject({ client_id: "APP", client_secret: "SECRET", code: "CODE1" });
  });

  it("says plainly when the code has expired (it lives 30 seconds), without the app secret", async () => {
    fake = await startFakeMeta();
    const err = await exchangeSignupCode(fake.config, { appId: "APP", appSecret: "SECRET-abcdef0123456789", code: "OLD" }).catch((e) => e);
    expect(err).toBeInstanceOf(MetaApiError);
    expect(err.message).toMatch(/expired/);
    expect(err.message).not.toContain("SECRET-abcdef0123456789");
  });

  it("lists a WhatsApp account's numbers, marking the ones that are also on the phone app", async () => {
    fake = await startFakeMeta();
    expect(await listWabaNumbers(fake.config, { token: "BIZ", wabaId: "WABA2" })).toEqual([
      { wabaId: "WABA2", phoneNumberId: "PN3", displayPhoneNumber: "+91 70200 03600", verifiedName: "LWS Pune", onPhoneApp: true },
    ]);
    expect((await listWabaNumbers(fake.config, { token: "SYS", wabaId: "WABA1" })).map((n) => n.onPhoneApp)).toEqual([false, false]);
  });

  it("asks Meta to copy the phone's chat history (once), returning Meta's request id", async () => {
    fake = await startFakeMeta();
    expect(await requestWhatsAppHistory(fake.config, { token: "BIZ", phoneNumberId: "PN3" })).toBe("REQ1");
    const call = fake.calls.find((c) => c.method === "POST" && c.path.endsWith("/PN3/smb_app_data"))!;
    expect(call.json).toEqual({ messaging_product: "whatsapp", sync_type: "history" });
  });

  it("treats 'history already requested' (code 135000) as done", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/PN3\/smb_app_data$/, status: 400, message: "Sync already requested", code: 135000 } });
    expect(await requestWhatsAppHistory(fake.config, { token: "BIZ", phoneNumberId: "PN3" })).toBeNull();
  });
});
