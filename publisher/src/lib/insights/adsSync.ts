import type { EntityRow } from "@/lib/domain/ads";
import type { MetaConfig } from "@/lib/platforms/meta";
import { fetchAdAccount, readAdAccount, type AdDailyRow } from "@/lib/platforms/metaAds";

// Ad results for the Insights tab: every campaign / ad set / ad with its status, and one row per
// ad per day for the last 30 days. Meta's days are in the AD ACCOUNT's time zone (LWS Pune's is
// US Pacific), so "today" is worked out there; asking Meta for a day that hasn't started yet
// there would be refused. All or nothing: if any read fails, nothing is stored.

export const AD_WINDOW_DAYS = 30;

export interface AdSyncSummary { campaigns: number; days: number; spend: number; chats: number }

/** YYYY-MM-DD of `at` in the IANA time zone `tz`. */
const dateIn = (at: Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(at);

export async function syncAdAccount(opts: {
  config: MetaConfig; actId: string; token: string; now: Date;
  store: (entities: EntityRow[], daily: AdDailyRow[]) => Promise<void>;
}): Promise<AdSyncSummary> {
  const account = await fetchAdAccount(opts.config, { actId: opts.actId, token: opts.token });
  const until = dateIn(opts.now, account.timezoneName);
  const since = new Date(Date.parse(`${until}T00:00:00Z`) - (AD_WINDOW_DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
  const { entities, daily } = await readAdAccount(opts.config, { actId: opts.actId, token: opts.token, since, until });
  await opts.store(entities, daily);
  return {
    campaigns: new Set(daily.map((d) => d.campaign_id)).size,
    days: new Set(daily.map((d) => d.day)).size,
    spend: Math.round(daily.reduce((t, d) => t + d.spend, 0) * 100) / 100,
    chats: daily.reduce((t, d) => t + d.conversations, 0),
  };
}
