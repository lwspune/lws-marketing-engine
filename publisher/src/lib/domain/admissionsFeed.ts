import { createHash, timingSafeEqual } from "node:crypto";

// The admissions feed (GET /api/feeds/admissions, founder 2026-10-26): LWS Pune's leads with an Indian mobile, read every
// hour by Admissions AI (the aptitude test app), where counsellors and telecallers pick them up. GoPost serves; Admissions
// AI holds no key to this database, the same way GoPost reads PYQ Vault (0028). Pure: the request rules, the cursor and
// the secret check test without a database or a request. WHICH leads count is decided in SQL (admissions_leads_after,
// migration 0029), next to the data.
//
// The cursor is (created_at, id): when GoPost added the lead, not lead_at, because website and outside leads are often
// added days after their date and a lead_at cursor would pass them by. The timestamp travels as Postgres printed it
// (microseconds); a JS Date would cut it to milliseconds and the next page would read rows again.

export const DEFAULT_LIMIT = 100;
/** Under PostgREST's 1,000-row cap with room to spare; refused, never truncated. */
export const MAX_LIMIT = 500;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEP = "~";

export type FeedCursor = { at: string; id: string };
export type FeedRequest = { ok: true; after: FeedCursor | null; limit: number } | { ok: false; error: string };

function parseCursor(raw: string): FeedCursor | null {
  const i = raw.lastIndexOf(SEP);
  if (i <= 0) return null;
  const at = raw.slice(0, i), id = raw.slice(i + 1);
  if (!UUID_RE.test(id) || Number.isNaN(Date.parse(at))) return null;
  return { at, id };
}

export function parseFeedRequest(params: URLSearchParams): FeedRequest {
  const rawAfter = params.get("after");
  let after: FeedCursor | null = null;
  if (rawAfter) {
    after = parseCursor(rawAfter);
    if (!after) return { ok: false, error: "`after` must be <timestamp>~<id>, as returned in `next`" };
  }
  const rawLimit = params.get("limit");
  let limit = DEFAULT_LIMIT;
  if (rawLimit !== null) {
    limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return { ok: false, error: `\`limit\` must be a whole number from 1 to ${MAX_LIMIT}` };
    }
  }
  return { ok: true, after, limit };
}

/**
 * Constant-time check of `Authorization: Bearer <secret>` against ADMISSIONS_LEADS_SECRET. Both sides are hashed first so
 * their lengths match (timingSafeEqual throws on a mismatch). No secret configured = closed.
 */
export function secretMatches(header: string | null, expected: string | undefined): boolean {
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const given = header.slice(7).trim();
  if (!given) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** One row of admissions_leads_after. */
export type FeedRow = {
  id: string; created_at: string; lead_at: string; name: string | null; contact: string; course: string | null;
  class_level: string | null; channel: string; page: string | null; from_ad: boolean; reason: string | null;
};

export type FeedLead = {
  cursor: string; leadAt: string; name: string | null;
  /** +91XXXXXXXXXX, as GoPost stores it. */
  mobile: string;
  course: string | null; classLevel: string | null; channel: string; page: string | null; fromAd: boolean; reason: string | null;
};

const blankToNull = (s: string | null) => (s?.trim() ? s.trim() : null);

export function toFeedLead(r: FeedRow): FeedLead {
  return {
    cursor: `${r.created_at}${SEP}${r.id}`, leadAt: r.lead_at, name: blankToNull(r.name), mobile: r.contact,
    course: blankToNull(r.course), classLevel: blankToNull(r.class_level), channel: r.channel, page: blankToNull(r.page),
    fromAd: r.from_ad, reason: blankToNull(r.reason),
  };
}
