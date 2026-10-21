import {
  normalizeFacebookInsights, normalizeInstagramInsights, normalizeInstagramStoryInsights, type PostMetrics, type StoryMetrics,
} from "@/lib/domain/metrics";
import type { PostKind } from "@/lib/domain/types";
import { graphUrl, MetaApiError, metaCall, type MetaConfig } from "./meta";

// Read-only performance numbers for a published post. Needs instagram_manage_insights (Instagram)
// and read_insights (Facebook Page) on the stored Page token.

export type InsightsResult =
  | { ok: true; metrics: PostMetrics; raw: unknown }
  | { ok: false; temporary: boolean; error: string };

const IG_REEL = ["views", "reach", "saved", "shares", "likes", "comments", "ig_reels_avg_watch_time"];
const IG_STORY = ["reach", "views", "replies", "shares", "follows", "profile_visits"];
const IG_CAROUSEL = ["views", "reach", "saved", "shares", "likes", "comments"];
const FB_REEL = ["fb_reels_total_plays", "blue_reels_play_count", "post_impressions_unique", "post_video_avg_time_watched", "post_video_social_actions"];

export type StoryInsightsResult = { ok: true; metrics: StoryMetrics; raw: unknown } | Extract<InsightsResult, { ok: false }>;

function failure(e: unknown): Extract<InsightsResult, { ok: false }> {
  if (e instanceof MetaApiError) return { ok: false, temporary: e.temporary, error: e.message };
  return { ok: false, temporary: false, error: `Unexpected error: ${(e as Error).message ?? String(e)}` };
}

export async function fetchInstagramInsights(
  cfg: MetaConfig, input: { mediaId: string; kind: PostKind; token: string },
): Promise<InsightsResult> {
  const metric = (input.kind === "reel" ? IG_REEL : IG_CAROUSEL).join(",");
  try {
    const raw = await metaCall(graphUrl(cfg, `${input.mediaId}/insights`), {
      method: "GET", params: { metric, access_token: input.token }, token: input.token,
    });
    return { ok: true, metrics: normalizeInstagramInsights(raw as never), raw };
  } catch (e) {
    return failure(e);
  }
}

/** A story's numbers and, in a second call, how people tapped through it. Readable for about 24 hours. */
export async function fetchInstagramStoryInsights(
  cfg: MetaConfig, input: { mediaId: string; token: string },
): Promise<StoryInsightsResult> {
  const get = (params: Record<string, string>) => metaCall(graphUrl(cfg, `${input.mediaId}/insights`), {
    method: "GET", params: { ...params, access_token: input.token }, token: input.token,
  });
  try {
    const [main, navigation] = await Promise.all([
      get({ metric: IG_STORY.join(",") }),
      get({ metric: "navigation", breakdown: "story_navigation_action_type" }),
    ]);
    return { ok: true, metrics: normalizeInstagramStoryInsights(main as never, navigation as never), raw: { main, navigation } };
  } catch (e) {
    return failure(e);
  }
}

export async function fetchFacebookReelInsights(cfg: MetaConfig, input: { videoId: string; token: string }): Promise<InsightsResult> {
  try {
    const raw = await metaCall(graphUrl(cfg, `${input.videoId}/video_insights`), {
      method: "GET", params: { metric: FB_REEL.join(","), access_token: input.token }, token: input.token,
    });
    return { ok: true, metrics: normalizeFacebookInsights(raw as never), raw };
  } catch (e) {
    return failure(e);
  }
}
