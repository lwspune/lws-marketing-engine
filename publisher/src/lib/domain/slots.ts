// Posting slots per project (founder, 2026-10-18): the founder only approves or rejects, and approving puts a post
// in its project's next free slot. Times are IST (HH:MM). Projects are named by slug (they never change).
//   pyqvault-insta = PYQ Vault (@pyqvault_): 1 reel a day at 18:00 (founder, 2026-10-26: each reel now takes longer, with
//                    the review panel; was 09:00, 13:00, 18:00 from 2026-10-20, whose medians were within ~10% of each other).
//   pyq-vault      = LWS Pune (@lws.pune): 1 reel a day, the slot the format test used.
//   soundmind-shivani = Sound Mind with Shivani (@soundmindwithshivani, an outside brand): 1 post a day, evening.
export const POST_SLOTS: Readonly<Record<string, readonly string[]>> = {
  "pyqvault-insta": ["18:00"],
  "pyq-vault": ["15:40"],
  "soundmind-shivani": ["18:00"],
};

export const slotsFor = (projectSlug: string): string[] => [...(POST_SLOTS[projectSlug] ?? [])];

const IST_MS = 5.5 * 3_600_000, DAY_MS = 86_400_000, LEAD_MS = 5 * 60_000, SEARCH_DAYS = 75;

/** The earliest slot at least 5 minutes ahead of `now` that no other post holds; null when the project has none. */
export function nextSlot(times: readonly string[], taken: readonly Date[], now: Date): Date | null {
  if (!times.length) return null;
  const busy = new Set(taken.map((d) => Math.round(d.getTime() / 60_000)));
  const istMidnight = Math.floor((now.getTime() + IST_MS) / DAY_MS) * DAY_MS - IST_MS; // today 00:00 IST, as UTC ms
  for (let day = 0; day <= SEARCH_DAYS; day++) {
    for (const t of times) {
      const [h, m] = t.split(":").map(Number);
      const at = istMidnight + day * DAY_MS + (h * 60 + m) * 60_000;
      if (at - now.getTime() >= LEAD_MS && !busy.has(Math.round(at / 60_000))) return new Date(at);
    }
  }
  return null;
}
