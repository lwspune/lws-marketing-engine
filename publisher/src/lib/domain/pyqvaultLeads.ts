import { isFake, type SheetLead } from "./leadSheets";

// PYQ Vault's NDA, CDS and AFCAT students → leads (founder, 2026-10-25; migration 0028). PYQ Vault decides who counts
// (a mobile + the "agree to be contacted" tick, in its defence_leads_after); this shapes each one for the Leads list.

export const FEED_SOURCES = ["pyqvault_account", "pyqvault_quiz"] as const;
export type FeedSource = (typeof FEED_SOURCES)[number];

/** Each feed's `source` on PYQ Vault's /api/leads/defence, and its label on the Leads page. */
export const FEEDS: Record<FeedSource, { path: "account" | "quiz"; page: string; reason: string }> = {
  pyqvault_account: { path: "account", page: "PYQ Vault · account", reason: "Agreed to be contacted on PYQ Vault (account)" },
  pyqvault_quiz: { path: "quiz", page: "PYQ Vault · quiz", reason: "Agreed to be contacted on PYQ Vault (NDA quiz)" },
};

/** One lead as PYQ Vault's feed sends it. */
export interface PyqvaultLead {
  cursor: string; leadAt: string; name: string | null;
  /** 91XXXXXXXXXX */
  mobile: string;
  exams: string[]; stage: string | null; city: string | null;
}

const EXAMS: [string, string][] = [["nda", "NDA"], ["cds", "CDS"], ["afcat", "AFCAT"]];
const CLASS: Record<string, string> = { "class-9-10": "9-10", "class-11": "11", "class-12": "12", dropper: "12 passed", college: "College" };

export function feedLeads(source: FeedSource, rows: PyqvaultLead[]) {
  const skipped = { noNumber: 0, fake: 0, repeats: 0 };
  const byContact = new Map<string, SheetLead>();
  for (const r of rows) {
    if (!/^91[6-9]\d{9}$/.test(r.mobile)) { skipped.noNumber++; continue; }
    const contact = `+${r.mobile}`;
    if (isFake(contact)) { skipped.fake++; continue; }
    const course = EXAMS.filter(([slug]) => r.exams.includes(slug)).map(([, label]) => label).join(", ") || null;
    const lead: SheetLead = {
      name: r.name?.slice(0, 200) || null, contact, course, class_level: (r.stage && CLASS[r.stage]) || null,
      lead_at: r.leadAt, from_ad: false, reason: [FEEDS[source].reason, r.city].filter(Boolean).join(", ").slice(0, 300),
    };
    const seen = byContact.get(contact);
    if (seen) skipped.repeats++;
    byContact.set(contact, seen && seen.lead_at < lead.lead_at ? { ...lead, lead_at: seen.lead_at } : lead);
  }
  return { leads: [...byContact.values()], skipped };
}
