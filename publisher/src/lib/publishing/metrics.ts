import type { PostMetrics, SnapshotLabel } from "@/lib/domain/metrics";
import { PLATFORM_LABEL, type Publication } from "@/lib/domain/types";
import type { MetaConfig } from "@/lib/platforms/meta";
import { fetchFacebookReelInsights, fetchInstagramInsights, type InsightsResult } from "@/lib/platforms/metaInsights";
import type { PublishContext } from "./worker";

// Scorecard snapshots: 48 hours and 7 days after a post went live, read its numbers and store
// them once. Runs in the same per-minute tick as publishing. A permanent failure (deleted post,
// missing permission) is stored with its reason so it isn't retried forever; a temporary one
// (Meta busy, network) records nothing and is tried again next tick.

export interface DueMetric { publication: Publication; snapshot: SnapshotLabel }

export interface MetricsRepo {
  metricsDue(limit: number): Promise<DueMetric[]>;
  loadContext(pub: Publication): Promise<PublishContext | null>;
  recordMetrics(publicationId: string, snapshot: SnapshotLabel, metrics: PostMetrics | null, raw: unknown): Promise<void>;
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
      const record = async (metrics: PostMetrics | null, raw: unknown) => { await repo.recordMetrics(pub.id, snapshot, metrics, raw); s.recorded++; };
      if (pub.platform === "youtube") { await record(null, { error: "YouTube statistics aren't available yet." }); continue; }
      if (!pub.externalId) { await record(null, { error: "The post has no platform id, so its statistics can't be read." }); continue; }
      const ctx = await repo.loadContext(pub);
      if (!ctx) { await record(null, { error: `${PLATFORM_LABEL[pub.platform]} isn't connected for this project any more.` }); continue; }

      const res: InsightsResult = pub.platform === "instagram"
        ? await fetchInstagramInsights(opts.metaConfig, { mediaId: pub.externalId, kind: ctx.post.kind, token: ctx.account.token })
        : await fetchFacebookReelInsights(opts.metaConfig, { videoId: pub.externalId, token: ctx.account.token });

      if (res.ok) await record(res.metrics, res.raw);
      else if (res.temporary) s.skipped++;
      else await record(null, { error: res.error });
    } catch (e) {
      s.errors++;
      logger.error("publisher: metrics snapshot failed", { publicationId: pub.id, snapshot, error: (e as Error).message });
    }
  }
  return s;
}
