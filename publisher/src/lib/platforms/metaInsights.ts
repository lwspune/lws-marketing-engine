import { normalizeFacebookInsights, normalizeInstagramInsights, type PostMetrics } from "@/lib/domain/metrics";
import type { PostKind } from "@/lib/domain/types";
import { graphUrl, MetaApiError, metaCall, type MetaConfig } from "./meta";

// Read-only performance numbers for a published post. Needs instagram_manage_insights (Instagram)
// and read_insights (Facebook Page) on the stored Page token.

export type InsightsResult =
  | { ok: true; metrics: PostMetrics; raw: unknown }
  | { ok: false; temporary: boolean; error: string };

const IG_REEL = ["views", "reach", "saved", "shares", "likes", "comments", "ig_reels_avg_watch_time"];
const IG_CAROUSEL = ["views", "reach", "saved", "shares", "likes", "comments"];
const FB_REEL = ["fb_reels_total_plays", "blue_reels_play_count", "post_impressions_unique", "post_video_avg_time_watched", "post_video_social_actions"];

function failure(e: unknown): InsightsResult {
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
