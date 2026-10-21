// Post performance snapshots: when to take them, how Meta's raw insights become one shape, and
// how a post compares with the account's typical reel.

export const SNAPSHOTS = [
  { label: "48h", afterHours: 48 },
  { label: "7d", afterHours: 7 * 24 },
] as const;
/** A story's one snapshot: Instagram deletes a story's insights about 24 hours after it goes up. */
export const STORY_SNAPSHOT = { label: "23h", afterHours: 23 } as const;
export type SnapshotLabel = (typeof SNAPSHOTS)[number]["label"] | typeof STORY_SNAPSHOT.label;

export interface PostMetrics {
  views: number | null;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  likes: number | null;
  comments: number | null;
  avgWatchMs: number | null;
}

export interface StoryMetrics {
  views: number | null;
  reach: number | null;
  shares: number | null;
  replies: number | null;
  follows: number | null;
  profileVisits: number | null;
  /** Taps out of the story (Instagram's tap_exit). */
  exits: number | null;
}

/** Snapshots whose time has come and that haven't been taken yet, oldest first. */
export function dueSnapshots(publishedAt: Date, taken: string[], now: Date): SnapshotLabel[] {
  const age = now.getTime() - publishedAt.getTime();
  return SNAPSHOTS.filter((s) => age >= s.afterHours * 3_600_000 && !taken.includes(s.label)).map((s) => s.label);
}

interface BreakdownResult { dimension_values?: string[]; value?: unknown }
interface InsightsRow {
  name: string; values?: { value: unknown }[];
  total_value?: { value: unknown; breakdowns?: { results?: BreakdownResult[] }[] };
}
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

/** A story's insights plus its navigation breakdown (story_navigation_action_type) → StoryMetrics. */
export function normalizeInstagramStoryInsights(api: InsightsResponse, navigation: InsightsResponse): StoryMetrics {
  const m = byName(api);
  const taps = (navigation.data ?? []).find((r) => r.name === "navigation")?.total_value?.breakdowns?.[0]?.results ?? [];
  return {
    views: count(m.get("views")),
    reach: count(m.get("reach")),
    shares: count(m.get("shares")),
    replies: count(m.get("replies")),
    follows: count(m.get("follows")),
    profileVisits: count(m.get("profile_visits")),
    exits: count(taps.find((t) => t.dimension_values?.[0] === "tap_exit")?.value),
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

/** Why a story's numbers weren't saved, in plain words. */
export function storyErrorText(error: string): string {
  return /does not exist/i.test(error) ? "Instagram had already deleted it (stories last 24 hours)." : error;
}

export interface TypicalStory { reach: number; profileVisits: number; follows: number; replies: number; count: number }

/** The median story, once 5 stories have numbers (fewer, and one good morning would set the bar). */
export function typicalStory(rows: StoryMetrics[]): TypicalStory | null {
  const known = rows.filter((r) => r.reach !== null);
  if (known.length < 5) return null;
  const mid = (f: (r: StoryMetrics) => number | null) => median(known.map(f)) ?? 0;
  return { reach: mid((r) => r.reach), profileVisits: mid((r) => r.profileVisits), follows: mid((r) => r.follows), replies: mid((r) => r.replies), count: known.length };
}

export type Verdict = "above" | "even" | "below" | "n/a";

export function compareToBaseline(m: PostMetrics, b: Baseline): { views: Verdict; saves: Verdict; avgWatchMs: Verdict } {
  const v = (x: number | null, base: number): Verdict => (x === null ? "n/a" : x > base ? "above" : x === base ? "even" : "below");
  return { views: v(m.views, b.views), saves: v(m.saves, b.saves), avgWatchMs: v(m.avgWatchMs, b.avgWatchMs) };
}
