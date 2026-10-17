// An org can connect more than one Instagram account (one per brand: @lws.pune, @pyqvault_). Screens that
// summarise "your reels" show one account at a time, so typical-reel numbers never mix two audiences.

export interface InstagramAccount { id: string; displayName: string; createdAt: string }

/** The account to show: the requested one if it's among the org's accounts, else the first connected. */
export function pickInstagramAccount(accounts: InstagramAccount[], requestedId: string | undefined): InstagramAccount | null {
  if (!accounts.length) return null;
  const asked = requestedId ? accounts.find((a) => a.id === requestedId) : undefined;
  if (asked) return asked;
  return [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
}
