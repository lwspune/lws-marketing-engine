// Post performance snapshots: when to take them, how Meta's raw insights become one shape, and
// how a post compares with the account's typical reel.

export const SNAPSHOTS = [
  { label: "48h", afterHours: 48 },
  { label: "7d", afterHours: 7 * 24 },
] as const;
export type SnapshotLabel = (typeof SNAPSHOTS)[number]["label"];

export interface PostMetrics {
  views: number | null;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  likes: number | null;
  comments: number | null;
  avgWatchMs: number | null;
}

/** Snapshots whose time has come and that haven't been taken yet, oldest first. */
export function dueSnapshots(publishedAt: Date, taken: string[], now: Date): SnapshotLabel[] {
  const age = now.getTime() - publishedAt.getTime();
  return SNAPSHOTS.filter((s) => age >= s.afterHours * 3_600_000 && !taken.includes(s.label)).map((s) => s.label);
}

interface InsightsRow { name: string; values?: { value: unknown }[]; total_value?: { value: unknown } }
interface InsightsResponse { data?: InsightsRow[] }

const count = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

function byName(api: InsightsResponse): Map<string, unknown> {
  return new Map((api.data ?? []).map((r) => [r.name, r.values?.[0]?.value ?? r.total_value?.value]));
}

/** Instagram media insights → PostMetrics (Instagram calls saves "saved"). */
export function normalizeInstagramInsights(api: InsightsResponse): PostMetrics {
  const m = byName(api);
  return {
    views: count(m.get("views")),
    reach: count(m.get("reach")),
    saves: count(m.get("saved")),
    shares: count(m.get("shares")),
    likes: count(m.get("likes")),
    comments: count(m.get("comments")),
    avgWatchMs: count(m.get("ig_reels_avg_watch_time")),
  };
}

/** Facebook reel video_insights → PostMetrics. Facebook has no saves for reels. */
export function normalizeFacebookInsights(api: InsightsResponse): PostMetrics {
  const m = byName(api);
  const social = (m.get("post_video_social_actions") ?? {}) as Record<string, unknown>;
  return {
    views: count(m.get("fb_reels_total_plays")) ?? count(m.get("blue_reels_play_count")),
    reach: count(m.get("post_impressions_unique")),
    saves: null,
    shares: count(social.SHARE),
    likes: count(social.REACTION),
    comments: count(social.COMMENT),
    avgWatchMs: count(m.get("post_video_avg_time_watched")),
  };
}

export interface Baseline { views: number; saves: number; avgWatchMs: number; measuredOn: string; note: string }

/** Median @lws.pune reel over all 171 reels, from Instagram insights pulled on 2026-10-15. */
export const LWS_BASELINE: Baseline = {
  views: 779, saves: 1, avgWatchMs: 6906, measuredOn: "2026-10-15",
  note: "median of 171 @lws.pune reels (analytics/lwspune-reels-2026-10-15.csv)",
};

/** Median of the known values (upper middle for an even count); null when there are none. */
export function median(values: (number | null)[]): number | null {
  const v = values.filter((x): x is number => typeof x === "number").sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
}

/** The account's typical reel, computed live from its reels; the stored baseline if there are none. */
export function typicalReel(rows: PostMetrics[], now: Date): Baseline {
  const views = median(rows.map((r) => r.views)), saves = median(rows.map((r) => r.saves)), watch = median(rows.map((r) => r.avgWatchMs));
  if (views === null || saves === null || watch === null) return LWS_BASELINE;
  return { views, saves, avgWatchMs: watch, measuredOn: now.toISOString().slice(0, 10), note: `median of ${rows.length} reels` };
}

export type Verdict = "above" | "even" | "below" | "n/a";

export function compareToBaseline(m: PostMetrics, b: Baseline): { views: Verdict; saves: Verdict; avgWatchMs: Verdict } {
  const v = (x: number | null, base: number): Verdict => (x === null ? "n/a" : x > base ? "above" : x === base ? "even" : "below");
  return { views: v(m.views, b.views), saves: v(m.saves, b.saves), avgWatchMs: v(m.avgWatchMs, b.avgWatchMs) };
}
