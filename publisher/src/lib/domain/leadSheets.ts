import { findContact } from "./leads";

// Rows from the Google Sheets the website fills (founder, 2026-10-25; migration 0026) → leads. Columns are found by their
// heading, so the agency can move them; a sheet missing the number or date column is refused rather than half-read.
// Sheet times are UTC (the sheet's quiet hours fall at night in India).

export const SHEET_KINDS = ["age_calculator", "popup_form"] as const;
export type SheetKind = (typeof SHEET_KINDS)[number];

/** One lead in the shape public.import_sheet_rows (→ add_outside_leads) expects. */
export interface SheetLead {
  name: string | null; contact: string; course: string | null; class_level: string | null; lead_at: string; from_ad: false; reason: string | null;
}
export interface SheetResult { leads: SheetLead[]; skipped: { noNumber: number; fake: number; noDate: number; repeats: number } }

export class SheetFormatError extends Error {}

// Numbers people type to get past a form.
const FAKE = new Set(["+919876543210", "+919123456789", "+918765432109"]);
const isFake = (contact: string) => FAKE.has(contact) || /^\+91(\d)\1{9}$/.test(contact);

const tidy = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

/** "2026-03-30 4:33:23" or "April 21, 2026 11:52 AM", read as UTC. */
export function sheetTime(s: string): string | null {
  const iso = s.trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  const d = iso
    ? new Date(`${iso[1]}T${iso[2].padStart(2, "0")}:${iso[3]}:${iso[4] ?? "00"}Z`)
    : /^[A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M$/.test(s.trim()) ? new Date(`${s.trim()} UTC`) : new Date(NaN);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type Row = Record<string, string>;
/** "12passed" → "12 passed"; blank → null (migration 0027). */
const classLevel = (s: string | undefined) => tidy(s).replace(/(\d)\s*passed$/i, "$1 passed").slice(0, 20) || null;

const SPEC: Record<SheetKind, { name: string; details: (r: Row) => { course: string | null; class_level: string | null; reason: string } }> = {
  age_calculator: {
    name: "full name",
    details: (r) => {
      const parts = [
        r["current age"] && `age ${r["current age"]}`, r["class level"] && `class ${r["class level"]}`,
        r["total attempts"] && `${r["total attempts"]} attempts${r["attempt details"] ? ` (${r["attempt details"]})` : ""}`,
      ].filter(Boolean);
      return { course: "NDA", class_level: classLevel(r["class level"]), reason: `NDA age calculator${parts.length ? `: ${parts.join(", ")}` : ""}`.slice(0, 300) };
    },
  },
  popup_form: {
    name: "student's full name",
    details: (r) => {
      const course = r["courses"] && r["courses"].toLowerCase() !== "courses" ? r["courses"].slice(0, 80) : null;
      return { course, class_level: null, reason: r["state"] ? `Popup form, ${r["state"]}`.slice(0, 300) : "Popup form" };
    },
  },
};

export function sheetLeads(kind: SheetKind, header: string[], rows: string[][]): SheetResult {
  const keys = header.map((h) => tidy(h).toLowerCase());
  const missing = ["Mobile Number", "Submission Date"].filter((h) => !keys.includes(h.toLowerCase()));
  if (missing.length) throw new SheetFormatError(`Missing column: ${missing.join(", ")} (found: ${header.map(tidy).filter(Boolean).join(", ") || "none"})`);
  const spec = SPEC[kind];
  const skipped = { noNumber: 0, fake: 0, noDate: 0, repeats: 0 };
  const byContact = new Map<string, SheetLead>();
  for (const cells of rows) {
    if (!cells.some((c) => tidy(c))) continue;
    const r: Row = Object.fromEntries(keys.map((k, i) => [k, tidy(cells[i])]));
    const contact = findContact(r["mobile number"]);
    if (!contact?.startsWith("+")) { skipped.noNumber++; continue; }
    if (isFake(contact)) { skipped.fake++; continue; }
    const leadAt = sheetTime(r["submission date"]);
    if (!leadAt) { skipped.noDate++; continue; }
    const lead: SheetLead = { name: r[spec.name]?.slice(0, 200) || null, contact, ...spec.details(r), lead_at: leadAt, from_ad: false };
    const seen = byContact.get(contact);
    if (seen) skipped.repeats++;
    byContact.set(contact, seen && seen.lead_at < leadAt ? { ...lead, lead_at: seen.lead_at } : lead);
  }
  return { leads: [...byContact.values()], skipped };
}

const STALE_MS = 3 * 3_600_000;
const SINCE = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

/** The Leads page's one-line warning, or null while every tab is syncing (the hourly job runs at :15). */
export function sheetWarning(sheets: { tab: string; last_error: string | null; last_synced_at: string | null }[], now: Date): string | null {
  for (const s of sheets) {
    if (s.last_error) return `${s.tab} isn't syncing: ${s.last_error}`;
    if (!s.last_synced_at) return `${s.tab} hasn't synced yet.`;
    if (now.getTime() - Date.parse(s.last_synced_at) > STALE_MS) return `${s.tab} hasn't synced since ${SINCE.format(new Date(s.last_synced_at))}.`;
  }
  return null;
}
