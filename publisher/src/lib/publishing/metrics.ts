import { STORY_SNAPSHOT, type PostMetrics, type SnapshotLabel, type StoryMetrics } from "@/lib/domain/metrics";
import { PLATFORM_LABEL, type Publication } from "@/lib/domain/types";
import type { MetaConfig } from "@/lib/platforms/meta";
import {
  fetchFacebookReelInsights, fetchInstagramInsights, fetchInstagramStoryInsights, type InsightsResult,
} from "@/lib/platforms/metaInsights";
import type { PublishContext } from "./worker";

// Scorecard snapshots: 48 hours and 7 days after a post went live (23 hours for a story), read its numbers and store
// them once. Runs in the same per-minute tick as publishing. A permanent failure (deleted post,
// missing permission) is stored with its reason so it isn't retried forever; a temporary one
// (Meta busy, network) records nothing and is tried again next tick.

export interface DueMetric { publication: Publication; snapshot: SnapshotLabel }

export interface MetricsRepo {
  metricsDue(limit: number): Promise<DueMetric[]>;
  loadContext(pub: Publication): Promise<PublishContext | null>;
  recordMetrics(publicationId: string, snapshot: SnapshotLabel, metrics: PostMetrics | null, raw: unknown): Promise<void>;
  /** The 23h snapshot; `null` metrics with a raw `{ error }` when it couldn't be read. */
  recordStoryMetrics(publicationId: string, metrics: StoryMetrics | null, raw: unknown): Promise<void>;
}

export interface MetricsSummary { due: number; recorded: number; skipped: number; errors: number }

export async function runMetricsTick(opts: {
  repo: MetricsRepo; metaConfig: MetaConfig; limit?: number; logger?: { error: (...a: unknown[]) => void };
}): Promise<MetricsSummary> {
  const { repo, logger = console } = opts;
  const due = await repo.metricsDue(opts.limit ?? 10);
  const s: MetricsSummary = { due: due.length, recorded: 0, skipped: 0, errors: 0 };

  for (const { publication: pub, snapshot } of due) {
    try {
      const story = snapshot === STORY_SNAPSHOT.label;
      const record = async (metrics: PostMetrics | null, raw: unknown) => { await repo.recordMetrics(pub.id, snapshot, metrics, raw); s.recorded++; };
      const fail = async (error: string) => {
        if (story) { await repo.recordStoryMetrics(pub.id, null, { error }); s.recorded++; } else await record(null, { error });
      };
      if (pub.platform === "youtube") { await fail("YouTube statistics aren't available yet."); continue; }
      if (!pub.externalId) { await fail("The post has no platform id, so its statistics can't be read."); continue; }
      const ctx = await repo.loadContext(pub);
      if (!ctx) { await fail(`${PLATFORM_LABEL[pub.platform]} isn't connected for this project any more.`); continue; }

      if (story) {
        const res = await fetchInstagramStoryInsights(opts.metaConfig, { mediaId: pub.externalId, token: ctx.account.token });
        if (res.ok) { await repo.recordStoryMetrics(pub.id, res.metrics, res.raw); s.recorded++; }
        else if (res.temporary) s.skipped++;
        else await fail(res.error);
        continue;
      }

      const res: InsightsResult = pub.platform === "instagram"
        ? await fetchInstagramInsights(opts.metaConfig, { mediaId: pub.externalId, kind: ctx.post.kind, token: ctx.account.token })
        : await fetchFacebookReelInsights(opts.metaConfig, { videoId: pub.externalId, token: ctx.account.token });

      if (res.ok) await record(res.metrics, res.raw);
      else if (res.temporary) s.skipped++;
      else await fail(res.error);
    } catch (e) {
      s.errors++;
      logger.error("publisher: metrics snapshot failed", { publicationId: pub.id, snapshot, error: (e as Error).message });
    }
  }
  return s;
}
