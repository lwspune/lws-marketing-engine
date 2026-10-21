import { attachmentLabel, redactForThemes } from "./inbox";

// One leads list (founder, 2026-10-21; migration 0016): name, contact, course, date and source. Pure rules for the
// hourly job (src/lib/leads/screen.ts) and the Leads page: finding a shared contact in an Instagram chat, the
// transcript Claude reads for a WhatsApp chat, its verdicts, and the Excel download.

export interface ChatMessage { direction: "in" | "out"; body: string; sent_at: string; attachment?: string | null }

// LWS's own numbers, which people sometimes quote back ("is 7620699213 your number?").
const OWN_NUMBERS = new Set(["+917620699213", "+917020003600", "+919156310546"]);

// An Indian mobile (starts 6–9, ten digits), however it's spaced or prefixed (+91, 91, 0). Not inside a longer number.
const MOBILE = /(?<![\d+])(?:\+?91[\s-]?|0)?([6-9](?:[\s-]?\d){9})(?!\d)/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

/** The phone number (as +91…) or email someone wrote, or null. A phone number wins over an email. */
export function findContact(text: string): string | null {
  for (const m of text.matchAll(MOBILE)) {
    const phone = `+91${m[1].replace(/\D/g, "")}`;
    if (!OWN_NUMBERS.has(phone)) return phone;
  }
  const email = text.match(EMAIL)?.[0].toLowerCase();
  return email ?? null;
}

const byTime = (msgs: ChatMessage[]) => [...msgs].sort((a, b) => a.sent_at.localeCompare(b.sent_at));

/** Instagram: the first contact the person shared, and when. Our own messages never count. */
export function instagramLead(msgs: ChatMessage[]): { contact: string; at: string } | null {
  for (const m of byTime(msgs)) {
    if (m.direction !== "in") continue;
    const contact = findContact(m.body);
    if (contact) return { contact, at: m.sent_at };
  }
  return null;
}

const COURSES: [RegExp, string][] = [
  [/\bSPI\b|services prep/i, "SPI"],
  [/\bNDA\b/i, "NDA"],
  [/\bCDS\b/i, "CDS"],
  [/\bAFCAT\b/i, "AFCAT"],
  [/\bPYQ\s*Vault\b/i, "PYQ Vault"],
];

/** The course the person mentioned first, from what they wrote. Null when none (the owner can fill it in). */
export function guessCourse(msgs: ChatMessage[]): string | null {
  for (const m of byTime(msgs)) {
    if (m.direction !== "in") continue;
    let best: { at: number; course: string } | null = null;
    for (const [re, course] of COURSES) {
      const at = m.body.search(re);
      if (at >= 0 && (!best || at < best.at)) best = { at, course };
    }
    if (best) return best.course;
  }
  return null;
}

/** A WhatsApp contact id is the number with its country code: "919876543210" → "+919876543210". */
export const whatsappContact = (contactId: string): string | null => (/^[1-9]\d{7,14}$/.test(contactId) ? `+${contactId}` : null);

/** "+919876543210" → "+91 98765 43210"; other numbers and emails as they are. */
export const formatPhone = (contact: string): string =>
  /^\+91[6-9]\d{9}$/.test(contact) ? `+91 ${contact.slice(3, 8)} ${contact.slice(8)}` : contact;

export const sourceLabel = (s: { channel: string; account: string | null; fromAd: boolean }): string =>
  `${s.channel === "whatsapp" ? "WhatsApp" : "Instagram"}${s.account ? ` ${s.account}` : ""}${s.fromAd ? " (ad)" : ""}`;

const MAX_LINE = 500;

/** The chat as Claude reads it: latest messages, who said what, phone numbers and emails removed. */
export function transcript(msgs: ChatMessage[], last = 30): string {
  return byTime(msgs).slice(-last).map((m) => {
    const text = m.body.trim() ? redactForThemes(m.body).replace(/\s+/g, " ").trim() : `[${attachmentLabel(m.attachment ?? "")}]`;
    return `${m.direction === "in" ? "Them" : "Us"}: ${text.slice(0, MAX_LINE)}`;
  }).join("\n");
}

export interface Verdict { genuine: boolean; reason: string; name: string | null; course: string | null }

/** Claude's answer: one verdict per chat. Its structured output follows this. */
export const SCREENING_SCHEMA = {
  type: "object",
  properties: {
    chats: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "The chat's id, exactly as given" },
          genuine: { type: "boolean", description: "True if this person is a genuine new lead" },
          reason: { type: "string", description: "One short line: why" },
          name: { anyOf: [{ type: "string" }, { type: "null" }], description: "The student's or parent's name if they wrote it, else null" },
          course: { anyOf: [{ type: "string" }, { type: "null" }], description: "The course they asked about (e.g. NDA, SPI, CDS), else null" },
        },
        required: ["id", "genuine", "reason", "name", "course"],
        additionalProperties: false,
      },
    },
  },
  required: ["chats"],
  additionalProperties: false,
} as const;

const clean = (v: unknown, max: number): string | null => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};

/** Verdicts for the chats we asked about. Anything malformed is dropped, so that chat is simply checked next time. */
export function parseScreening(raw: unknown, ids: string[]): Map<string, Verdict> {
  const out = new Map<string, Verdict>();
  const asked = new Set(ids);
  const chats = (raw as { chats?: unknown } | null)?.chats;
  if (!Array.isArray(chats)) return out;
  for (const c of chats as Record<string, unknown>[]) {
    if (!c || typeof c.id !== "string" || !asked.has(c.id) || typeof c.genuine !== "boolean") continue;
    out.set(c.id, { genuine: c.genuine, reason: clean(c.reason, 300) ?? "", name: clean(c.name, 200), course: clean(c.course, 80) });
  }
  return out;
}

export interface LeadRow { name: string | null; contact: string; course: string | null; lead_at: string; source: string }

const DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
export const leadDate = (at: string): string => DAY.format(new Date(at));

// A cell starting with = + - @ would run as a formula in Excel; a leading ' keeps it text.
const cell = (v: string | null): string => {
  const s = !v ? "" : /^[=+\-@]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// Indian mobiles as "98765 43210": the space keeps Excel from turning them into 9.88E+09.
const csvContact = (c: string) => (/^\+91[6-9]\d{9}$/.test(c) ? `${c.slice(3, 8)} ${c.slice(8)}` : c);

/** The Leads download: UTF-8 with a BOM so Excel shows Hindi names and ₹ correctly. */
export function leadsCsv(rows: LeadRow[]): string {
  const lines = [["Name", "Contact", "Course", "Date", "Source"].join(",")];
  for (const r of rows) lines.push([cell(r.name), cell(csvContact(r.contact)), cell(r.course), leadDate(r.lead_at), cell(r.source)].join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
