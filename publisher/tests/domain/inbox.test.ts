import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  attachmentLabel, canReply, contactLabel, LEAD_STATUSES, MAX_BODY, needsReply, parseInstagramWebhook, parseWhatsAppWebhook, redactForThemes,
  summariseInbox, verifyMetaSignature,
} from "@/lib/domain/inbox";

// Instagram DMs pulled into GoPost (founder, 2026-10-19). Shapes follow Meta's Instagram messaging webhooks:
// object "instagram", entry[].id = our account, messaging[] = one event each.

const ME = "17841400000000000";
const event = (messaging: object) => ({ object: "instagram", entry: [{ id: ME, time: 1760860800000, messaging: [messaging] }] });
const incoming = (message: object, sender = "9001") => event({
  sender: { id: sender }, recipient: { id: ME }, timestamp: 1760860800000, message: { mid: "mid.1", ...message },
});

describe("parseInstagramWebhook", () => {
  it("reads an incoming text message as one row for our account", () => {
    expect(parseInstagramWebhook(incoming({ text: "Sir NDA maths ka syllabus?" }))).toEqual([{
      accountExternalId: ME,
      rows: [{
        contact_id: "9001", mid: "mid.1", direction: "in", body: "Sir NDA maths ka syllabus?", attachment: null,
        sent_at: "2025-10-19T08:00:00.000Z", source: "direct", ad_id: null, deleted: false,
      }],
    }]);
  });

  it("reads our own replies (echoes, including ones typed in the Instagram app) as outgoing to the other person", () => {
    const [{ rows: [row] }] = parseInstagramWebhook(event({
      sender: { id: ME }, recipient: { id: "9001" }, timestamp: 1760860800000, message: { mid: "mid.2", text: "Hi!", is_echo: true },
    }));
    expect(row).toMatchObject({ contact_id: "9001", direction: "out", body: "Hi!" });
  });

  it("keeps the attachment type and no URL (Instagram's file links expire)", () => {
    const [{ rows: [row] }] = parseInstagramWebhook(incoming({ attachments: [{ type: "image", payload: { url: "https://cdn/x.jpg" } }] }));
    expect(row).toMatchObject({ body: "", attachment: "image" });
    const [{ rows: [odd] }] = parseInstagramWebhook(incoming({ attachments: [{ type: "something_new", payload: {} }] }));
    expect(odd.attachment).toBe("other");
  });

  it("marks how the chat started: an ad (with its id) or a story reply", () => {
    const ad = parseInstagramWebhook(incoming({ text: "Price?", referral: { ad_id: "120231234567890", source: "ADS", type: "OPEN_THREAD" } }));
    expect(ad[0].rows[0]).toMatchObject({ source: "ad", ad_id: "120231234567890" });
    const story = parseInstagramWebhook(incoming({ text: "Answer is B", reply_to: { story: { id: "s1", url: "https://cdn/s" } } }));
    expect(story[0].rows[0]).toMatchObject({ source: "story", ad_id: null });
    // An ad referral without a usable id is just a direct chat: the database insists ad ⇔ ad id.
    const noId = parseInstagramWebhook(incoming({ text: "Hi", referral: { source: "ADS", ad_id: "not-a-number" } }));
    expect(noId[0].rows[0]).toMatchObject({ source: "direct", ad_id: null });
  });

  it("passes on unsends so the stored copy is deleted", () => {
    const [{ rows: [row] }] = parseInstagramWebhook(incoming({ is_deleted: true }));
    expect(row).toMatchObject({ mid: "mid.1", deleted: true });
  });

  it("cuts very long messages to the stored limit", () => {
    const [{ rows: [row] }] = parseInstagramWebhook(incoming({ text: "x".repeat(MAX_BODY + 50) }));
    expect(row.body).toHaveLength(MAX_BODY);
  });

  it("skips what isn't a message: other objects, referral-only events, self tests, read receipts, junk", () => {
    expect(parseInstagramWebhook({ object: "page", entry: [] })).toEqual([]);
    expect(parseInstagramWebhook(null)).toEqual([]);
    expect(parseInstagramWebhook({ object: "instagram", entry: "nope" })).toEqual([]);
    expect(parseInstagramWebhook(event({ sender: { id: "9001" }, recipient: { id: ME }, timestamp: 1, referral: { source: "ADS" } }))).toEqual([]);
    expect(parseInstagramWebhook(incoming({ text: "test", is_self: true }))).toEqual([]);
    expect(parseInstagramWebhook(event({ sender: { id: "9001" }, recipient: { id: ME }, timestamp: 1, read: { mid: "mid.1" } }))).toEqual([]);
    expect(parseInstagramWebhook(incoming({ text: "no mid", mid: undefined }))).toEqual([]);
  });

  it("groups events by account when one delivery covers several", () => {
    const body = { object: "instagram", entry: [
      { id: "A", messaging: [{ sender: { id: "1" }, recipient: { id: "A" }, timestamp: 1, message: { mid: "m1", text: "a" } }] },
      { id: "B", messaging: [{ sender: { id: "2" }, recipient: { id: "B" }, timestamp: 2, message: { mid: "m2", text: "b" } }] },
      { id: "A", messaging: [{ sender: { id: "3" }, recipient: { id: "A" }, timestamp: 3, message: { mid: "m3", text: "c" } }] },
    ] };
    const out = parseInstagramWebhook(body);
    expect(out.map((g) => [g.accountExternalId, g.rows.map((r) => r.mid)])).toEqual([["A", ["m1", "m3"]], ["B", ["m2"]]]);
  });
});

describe("verifyMetaSignature", () => {
  const secret = "app-secret", raw = JSON.stringify(incoming({ text: "hi" }));
  const sign = (body: string, key = secret) => `sha256=${createHmac("sha256", key).update(body).digest("hex")}`;

  it("accepts Meta's HMAC of the exact body", () => {
    expect(verifyMetaSignature(raw, sign(raw), secret)).toBe(true);
  });
  it("refuses a missing, malformed, wrong-key or tampered signature, and an unset secret", () => {
    expect(verifyMetaSignature(raw, null, secret)).toBe(false);
    expect(verifyMetaSignature(raw, "sha1=abc", secret)).toBe(false);
    expect(verifyMetaSignature(raw, sign(raw, "other"), secret)).toBe(false);
    expect(verifyMetaSignature(raw + " ", sign(raw), secret)).toBe(false);
    expect(verifyMetaSignature(raw, sign(raw, ""), "")).toBe(false);
  });
});

describe("reply window", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  it("allows a reply within 24 hours of their last message, not after, and not before they wrote", () => {
    expect(canReply("2026-10-18T12:00:01Z", now)).toBe(true);
    expect(canReply("2026-10-18T11:59:59Z", now)).toBe(false);
    expect(canReply(null, now)).toBe(false);
  });
  it("needs a reply when their last message is newer than ours", () => {
    expect(needsReply({ last_incoming_at: "2026-10-19T10:00:00Z", last_outgoing_at: "2026-10-19T09:00:00Z" })).toBe(true);
    expect(needsReply({ last_incoming_at: "2026-10-19T10:00:00Z", last_outgoing_at: null })).toBe(true);
    expect(needsReply({ last_incoming_at: "2026-10-19T08:00:00Z", last_outgoing_at: "2026-10-19T09:00:00Z" })).toBe(false);
    expect(needsReply({ last_incoming_at: null, last_outgoing_at: "2026-10-19T09:00:00Z" })).toBe(false);
  });
});

describe("summariseInbox", () => {
  it("counts this IST week's new chats per account: from ads, leads (interested or further) and booked/bought", () => {
    const c = (account_id: string, first_message_at: string, status: string, source = "direct") => ({ account_id, first_message_at, status, source });
    const s = summariseInbox([
      c("a", "2026-10-19T03:00:00Z", "new"),
      c("a", "2026-10-20T03:00:00Z", "interested", "ad"),
      c("a", "2026-10-21T03:00:00Z", "booked", "ad"),
      c("a", "2026-10-22T03:00:00Z", "bought"),
      c("a", "2026-10-22T04:00:00Z", "not_lead"),
      c("a", "2026-10-18T18:00:00Z", "booked"), // Sun 23:30 IST: last week
      c("b", "2026-10-18T19:00:00Z", "new"), // Mon 00:30 IST: this week
    ], "2026-10-19");
    expect(s).toEqual({
      a: { newChats: 5, fromAds: 2, leads: 3, booked: 2 },
      b: { newChats: 1, fromAds: 0, leads: 0, booked: 0 },
    });
  });
  it("knows every lead status the database allows", () => {
    expect(LEAD_STATUSES).toEqual(["new", "interested", "booked", "bought", "not_lead"]);
  });
});

describe("redactForThemes", () => {
  it("removes handles, phone numbers, emails and links before text leaves GoPost", () => {
    expect(redactForThemes("Call me 98765 43210 or +91-9876543210, mail a.b@gmail.com, see https://x.com/y and @rahul_07"))
      .toBe("Call me [phone] or [phone], mail [email], see [link] and [handle]");
  });
  it("keeps maths and years intact", () => {
    expect(redactForThemes("NDA 2 2024 Q74: sin 30 = 0.5, answer 1/2")).toBe("NDA 2 2024 Q74: sin 30 = 0.5, answer 1/2");
  });
});

describe("contactLabel / attachmentLabel", () => {
  it("shows the name, else @username, else the id's last digits", () => {
    expect(contactLabel({ contact_name: "Rahul S", contact_username: "rahul_07", contact_id: "123456789" })).toBe("Rahul S");
    expect(contactLabel({ contact_name: null, contact_username: "rahul_07", contact_id: "123456789" })).toBe("@rahul_07");
    expect(contactLabel({ contact_name: null, contact_username: null, contact_id: "123456789" })).toBe("Instagram user …6789");
  });
  it("shows a WhatsApp contact's name, else their number", () => {
    expect(contactLabel({ contact_name: "Parent A", contact_username: null, contact_id: "919800000001", channel: "whatsapp" })).toBe("Parent A");
    expect(contactLabel({ contact_name: null, contact_username: null, contact_id: "919800000001", channel: "whatsapp" })).toBe("+919800000001");
  });
  it("names attachments in plain words", () => {
    expect(attachmentLabel("image")).toBe("Photo");
    expect(attachmentLabel("ig_reel")).toBe("Shared reel");
    expect(attachmentLabel("story_mention")).toBe("Mentioned you in a story");
    expect(attachmentLabel("other")).toBe("Attachment");
    expect(attachmentLabel("location")).toBe("Location");
    expect(attachmentLabel("contacts")).toBe("Contact card");
  });
});

// WhatsApp Cloud API webhooks: object "whatsapp_business_account", entry[].changes[].value holds one phone number's
// messages (metadata.phone_number_id = our account), with each sender's profile name in value.contacts.
describe("parseWhatsAppWebhook", () => {
  const PN = "123456789012345";
  const wa = (messages: object[], contacts: object[] = [{ profile: { name: "Parent A" }, wa_id: "919800000001" }]) => ({
    object: "whatsapp_business_account",
    entry: [{ id: "WABA1", changes: [{ field: "messages", value: {
      messaging_product: "whatsapp", metadata: { display_phone_number: "917620699213", phone_number_id: PN }, contacts, messages,
    } }] }],
  });
  const msg = (over: object) => ({ from: "919800000001", id: "wamid.1", timestamp: "1760860800", type: "text", text: { body: "Sir test kab hai?" }, ...over });

  it("reads an incoming text with the sender's WhatsApp name, for our phone number", () => {
    expect(parseWhatsAppWebhook(wa([msg({})]))).toEqual([{
      accountExternalId: PN,
      rows: [{
        contact_id: "919800000001", mid: "wamid.1", direction: "in", body: "Sir test kab hai?", attachment: null,
        sent_at: "2025-10-19T08:00:00.000Z", source: "direct", ad_id: null, deleted: false, contact_name: "Parent A",
      }],
    }]);
  });

  it("records Click-to-WhatsApp ads by their ad id", () => {
    const [{ rows: [row] }] = parseWhatsAppWebhook(wa([msg({ referral: { source_type: "ad", source_id: "120239876543210", source_url: "https://fb.me/x", ctwa_clid: "c" } })]));
    expect(row).toMatchObject({ source: "ad", ad_id: "120239876543210" });
    const [{ rows: [post] }] = parseWhatsAppWebhook(wa([msg({ referral: { source_type: "post", source_id: "999" } })]));
    expect(post).toMatchObject({ source: "direct", ad_id: null });
  });

  it("keeps media types (with captions), button and list replies, location and contact cards", () => {
    const rows = parseWhatsAppWebhook(wa([
      msg({ id: "a", type: "image", text: undefined, image: { id: "m1", mime_type: "image/jpeg", caption: "Q74 ka doubt" } }),
      msg({ id: "b", type: "document", text: undefined, document: { id: "m2", filename: "fees.pdf" } }),
      msg({ id: "c", type: "button", text: undefined, button: { text: "Yes, book me", payload: "BOOK" } }),
      msg({ id: "d", type: "interactive", text: undefined, interactive: { type: "list_reply", list_reply: { id: "s1", title: "Sunday 10 am" } } }),
      msg({ id: "e", type: "location", text: undefined, location: { latitude: 18.5, longitude: 73.8 } }),
      msg({ id: "f", type: "contacts", text: undefined, contacts: [{ name: { formatted_name: "X" } }] }),
      msg({ id: "g", type: "unsupported", text: undefined }),
    ]))[0].rows;
    expect(rows.map((r) => [r.mid, r.attachment, r.body])).toEqual([
      ["a", "image", "Q74 ka doubt"], ["b", "file", ""], ["c", null, "Yes, book me"], ["d", null, "Sunday 10 am"],
      ["e", "location", ""], ["f", "contacts", ""], ["g", "other", ""],
    ]);
  });

  it("skips reactions, system notices, delivery statuses and other fields", () => {
    expect(parseWhatsAppWebhook(wa([msg({ type: "reaction", text: undefined, reaction: { message_id: "x", emoji: "👍" } }), msg({ type: "system", text: undefined })]))).toEqual([]);
    const statusOnly = { object: "whatsapp_business_account", entry: [{ id: "WABA1", changes: [{ field: "messages", value: {
      metadata: { phone_number_id: PN }, statuses: [{ id: "wamid.9", status: "delivered" }] } }] }] };
    expect(parseWhatsAppWebhook(statusOnly)).toEqual([]);
    expect(parseWhatsAppWebhook({ object: "whatsapp_business_account", entry: [{ id: "W", changes: [{ field: "message_template_status_update", value: {} }] }] })).toEqual([]);
    expect(parseWhatsAppWebhook({ object: "instagram", entry: [] })).toEqual([]);
    expect(parseWhatsAppWebhook(null)).toEqual([]);
  });

  it("leaves the name empty when WhatsApp sends none", () => {
    const [{ rows: [row] }] = parseWhatsAppWebhook(wa([msg({})], []));
    expect(row.contact_name).toBeNull();
  });
});
