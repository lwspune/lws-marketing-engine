import { createHmac, timingSafeEqual } from "node:crypto";
import { weekStartIst } from "./ads";

// Instagram DMs pulled into GoPost (founder, 2026-10-19; migration 0012). Owners only: read, reply, mark leads,
// count them, and mine what students ask. Meta's webhook delivers each message; the database stores it once.

export const LEAD_STATUSES = ["new", "interested", "booked", "bought", "not_lead"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_LABEL: Record<LeadStatus, string> = {
  new: "New", interested: "Interested", booked: "Booked", bought: "Bought", not_lead: "Not a lead",
};

/** Stored message length (public.messages.body). */
export const MAX_BODY = 4000;
/** Instagram's limit for one text message. */
export const MAX_REPLY = 1000;
/** Instagram lets a business reply only within 24 hours of the person's last message. */
export const REPLY_WINDOW_MS = 24 * 3_600_000;

const ATTACHMENTS = new Set([
  "image", "video", "audio", "file", "share", "ig_post", "ig_reel", "story", "story_mention", "sticker", "location", "contacts",
]);
const AD_ID = /^\d{1,30}$/;

/** One message in the shape public.ingest_messages expects. */
export interface InboxRow {
  contact_id: string;
  mid: string;
  direction: "in" | "out";
  body: string;
  /** Attachment type only: Instagram's file links expire, so no URL is kept. */
  attachment: string | null;
  sent_at: string;
  /** How the chat started (kept from its first message). */
  source: "direct" | "ad" | "story";
  ad_id: string | null;
  /** The person unsent it: delete the stored copy. */
  deleted: boolean;
  /** WhatsApp sends the sender's profile name with each message (Instagram doesn't: looked up once instead). */
  contact_name?: string | null;
}

export interface InboxGroup { accountExternalId: string; rows: InboxRow[] }

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : typeof v === "number" ? String(v) : null);

export const attachmentType = (t: unknown): string => (typeof t === "string" && ATTACHMENTS.has(t) ? t : "other");

function toIso(ts: unknown): string | null {
  const n = typeof ts === "number" ? ts : typeof ts === "string" && /^\d+$/.test(ts) ? Number(ts) : NaN;
  const d = Number.isFinite(n) ? new Date(n) : typeof ts === "string" ? new Date(ts) : new Date(NaN);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function rowFrom(account: string, ev: Obj): InboxRow | null {
  const m = ev.message;
  if (!isObj(m) || m.is_self === true) return null;
  const mid = str(m.mid), sender = isObj(ev.sender) ? str(ev.sender.id) : null, recipient = isObj(ev.recipient) ? str(ev.recipient.id) : null;
  const sentAt = toIso(ev.timestamp);
  if (!mid || !sender || !recipient || !sentAt) return null;
  const out = m.is_echo === true || sender === account;
  const attachments = Array.isArray(m.attachments) ? m.attachments.filter(isObj) : [];
  const referral = isObj(m.referral) ? m.referral : null;
  const adId = referral && referral.source === "ADS" && typeof referral.ad_id === "string" && AD_ID.test(referral.ad_id) ? referral.ad_id : null;
  const storyReply = isObj(m.reply_to) && isObj(m.reply_to.story);
  return {
    contact_id: out ? recipient : sender,
    mid,
    direction: out ? "out" : "in",
    body: typeof m.text === "string" ? m.text.slice(0, MAX_BODY) : "",
    attachment: attachments.length ? attachmentType(attachments[0].type) : null,
    sent_at: sentAt,
    source: adId ? "ad" : storyReply ? "story" : "direct",
    ad_id: adId,
    deleted: m.is_deleted === true,
  };
}

/** Meta's Instagram webhook body → messages per account (entry.id). Anything that isn't a message is skipped. */
export function parseInstagramWebhook(body: unknown): InboxGroup[] {
  if (!isObj(body) || body.object !== "instagram" || !Array.isArray(body.entry)) return [];
  const groups = new Map<string, InboxRow[]>();
  for (const entry of body.entry) {
    if (!isObj(entry) || !Array.isArray(entry.messaging)) continue;
    const account = str(entry.id);
    if (!account) continue;
    for (const ev of entry.messaging) {
      const row = isObj(ev) ? rowFrom(account, ev) : null;
      if (!row) continue;
      groups.set(account, [...(groups.get(account) ?? []), row]);
    }
  }
  return [...groups].map(([accountExternalId, rows]) => ({ accountExternalId, rows }));
}

// WhatsApp message types → stored attachment type (text-like ones become the body instead).
const WA_MEDIA: Record<string, string> = {
  image: "image", video: "video", audio: "audio", document: "file", sticker: "sticker", location: "location", contacts: "contacts",
};
const WA_SKIP = new Set(["reaction", "system", "ephemeral", "request_welcome"]);

function waRow(m: Obj, names: Map<string, string>): InboxRow | null {
  const mid = str(m.id), from = str(m.from), type = typeof m.type === "string" ? m.type : "";
  const secs = typeof m.timestamp === "string" && /^\d+$/.test(m.timestamp) ? Number(m.timestamp) : typeof m.timestamp === "number" ? m.timestamp : NaN;
  if (!mid || !from || !Number.isFinite(secs) || WA_SKIP.has(type)) return null;
  let body = "", attachment: string | null = null;
  const part = isObj(m[type]) ? (m[type] as Obj) : null;
  if (type === "text" && part && typeof part.body === "string") body = part.body;
  else if (type === "button" && part && typeof part.text === "string") body = part.text;
  else if (type === "interactive" && part) {
    const reply = [part.button_reply, part.list_reply].find(isObj) as Obj | undefined;
    body = typeof reply?.title === "string" ? reply.title : "";
    if (!body) attachment = "other";
  } else {
    attachment = WA_MEDIA[type] ?? "other";
    if (part && typeof part.caption === "string") body = part.caption;
  }
  const referral = isObj(m.referral) ? m.referral : null;
  const adId = referral && referral.source_type === "ad" && typeof referral.source_id === "string" && AD_ID.test(referral.source_id) ? referral.source_id : null;
  return {
    contact_id: from, mid, direction: "in", body: body.slice(0, MAX_BODY), attachment,
    sent_at: new Date(secs * 1000).toISOString(), source: adId ? "ad" : "direct", ad_id: adId, deleted: false,
    contact_name: names.get(from) ?? null,
  };
}

/** Meta's WhatsApp Cloud API webhook body → incoming messages per phone number id. Statuses and other fields are skipped. */
export function parseWhatsAppWebhook(body: unknown): InboxGroup[] {
  if (!isObj(body) || body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) return [];
  const groups = new Map<string, InboxRow[]>();
  for (const entry of body.entry) {
    if (!isObj(entry) || !Array.isArray(entry.changes)) continue;
    for (const change of entry.changes) {
      if (!isObj(change) || change.field !== "messages" || !isObj(change.value)) continue;
      const v = change.value;
      const account = isObj(v.metadata) ? str(v.metadata.phone_number_id) : null;
      if (!account || !Array.isArray(v.messages)) continue;
      const names = new Map<string, string>();
      for (const c of Array.isArray(v.contacts) ? v.contacts.filter(isObj) : []) {
        const id = str(c.wa_id), name = isObj(c.profile) && typeof c.profile.name === "string" ? c.profile.name : null;
        if (id && name) names.set(id, name);
      }
      for (const m of v.messages) {
        const row = isObj(m) ? waRow(m, names) : null;
        if (row) groups.set(account, [...(groups.get(account) ?? []), row]);
      }
    }
  }
  return [...groups].map(([accountExternalId, rows]) => ({ accountExternalId, rows }));
}

/** Meta signs each delivery: X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(app secret, raw body). */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!appSecret || !header?.startsWith("sha256=")) return false;
  const given = Buffer.from(header.slice("sha256=".length), "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const canReply = (lastIncomingAt: string | null, now: Date): boolean =>
  !!lastIncomingAt && now.getTime() - new Date(lastIncomingAt).getTime() <= REPLY_WINDOW_MS;

// Auto-reply to ad chats (founder, 2026-10-19; migration 0014). Meta marks only some ad messages as from an ad
// (2 of 62 on 19 Oct); the rest start with one of Meta's ready-made ad questions, matched whole so a person's
// own question that happens to mention an ad isn't caught.
const AD_STARTERS = new Set(["can i learn more about your business", "is anyone available to chat", "can you tell me more about your ad"]);
const starterKey = (body: string) => body.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/, "");

/** Who in this delivery just messaged from an ad (one entry per person), while Instagram still allows a reply. */
export function adStarts(rows: InboxRow[], now: Date): string[] {
  const out = new Set<string>();
  for (const r of rows) {
    if (r.direction !== "in" || r.deleted || r.source === "story" || !canReply(r.sent_at, now)) continue;
    if (r.source === "ad" || AD_STARTERS.has(starterKey(r.body))) out.add(r.contact_id);
  }
  return [...out];
}

export function checkAutoReplyText(text: string): { ok: true; text: string } | { ok: false; message: string } {
  const t = text.trim();
  if (!t) return { ok: false, message: "Write the reply first." };
  if (t.length > MAX_REPLY) return { ok: false, message: `Replies can be up to ${MAX_REPLY} characters.` };
  return { ok: true, text: t };
}

export const needsReply =(c: { last_incoming_at: string | null; last_outgoing_at: string | null }): boolean =>
  !!c.last_incoming_at && (!c.last_outgoing_at || new Date(c.last_incoming_at) > new Date(c.last_outgoing_at));

export interface InboxWeek { newChats: number; fromAds: number; leads: number; booked: number }

/** This IST week's new chats per account (by first message), from ads, leads (interested or further) and booked/bought. */
export function summariseInbox(
  convs: { account_id: string; first_message_at: string; status: string; source: string }[], weekStart: string,
): Record<string, InboxWeek> {
  const out: Record<string, InboxWeek> = {};
  for (const c of convs) {
    if (weekStartIst(new Date(c.first_message_at)) !== weekStart) continue;
    const s = (out[c.account_id] ??= { newChats: 0, fromAds: 0, leads: 0, booked: 0 });
    s.newChats++;
    if (c.source === "ad") s.fromAds++;
    if (["interested", "booked", "bought"].includes(c.status)) s.leads++;
    if (["booked", "bought"].includes(c.status)) s.booked++;
  }
  return out;
}

export const contactLabel = (c: { contact_name: string | null; contact_username: string | null; contact_id: string; channel?: string }): string =>
  c.contact_name || (c.channel === "whatsapp" ? `+${c.contact_id}`
    : c.contact_username ? `@${c.contact_username}` : `Instagram user …${c.contact_id.slice(-4)}`);

const ATTACHMENT_LABEL: Record<string, string> = {
  image: "Photo", video: "Video", audio: "Voice note", file: "File", share: "Shared post", ig_post: "Shared post",
  ig_reel: "Shared reel", story: "Shared story", story_mention: "Mentioned you in a story", sticker: "Sticker",
  location: "Location", contacts: "Contact card",
};
export const attachmentLabel = (type: string): string => ATTACHMENT_LABEL[type] ?? "Attachment";

/** Strip what identifies a person before message text is sent anywhere (the monthly themes report). */
export const redactForThemes = (text: string): string =>
  text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\bhttps?:\/\/\S+|\bwww\.\S+/gi, "[link]")
    .replace(/(^|[^\w])@[\w.]{2,30}/g, "$1[handle]")
    .replace(/\+?\d[\d\s-]{8,}\d/g, (m) => (m.replace(/\D/g, "").length >= 10 ? "[phone]" : m));
