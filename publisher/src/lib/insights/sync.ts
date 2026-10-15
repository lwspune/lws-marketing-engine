import type { PostMetrics } from "@/lib/domain/metrics";
import { graphUrl, metaCall, type MetaConfig } from "@/lib/platforms/meta";
import { fetchInstagramInsights } from "@/lib/platforms/metaInsights";

// Account-wide insights: every reel on the connected Instagram account, including ones posted by
// hand, with its current numbers. Feeds the dashboard's Insights tab (refreshed daily).
// If the media list can't be read the whole sync fails (nothing stored); a single reel whose
// insights fail is still stored, with the reason and no numbers.

export interface AccountMediaRow {
  externalId: string;
  productType: string;
  mediaType: string;
  permalink: string;
  caption: string;
  postedAt: string;
  likes: number | null;
  comments: number | null;
  metrics: PostMetrics | null;
  insightsError: string | null;
}

interface IgMedia {
  id: string; media_product_type: string; media_type: string; caption?: string; permalink: string; timestamp: string;
  like_count?: number; comments_count?: number;
}

export interface SyncSummary { media: number; reels: number; withInsights: number; failed: number }

/** One row in the shape public.upsert_account_media expects. */
export const toDbRow = (r: AccountMediaRow) => ({
  external_id: r.externalId, product_type: r.productType, media_type: r.mediaType, permalink: r.permalink,
  caption: r.caption, posted_at: r.postedAt, likes: r.likes, comments: r.comments,
  views: r.metrics?.views ?? null, reach: r.metrics?.reach ?? null, saves: r.metrics?.saves ?? null,
  shares: r.metrics?.shares ?? null, avg_watch_ms: r.metrics?.avgWatchMs ?? null, insights_error: r.insightsError,
});

export async function syncInstagramAccount(opts: {
  config: MetaConfig; igUserId: string; token: string; store: (rows: AccountMediaRow[]) => Promise<void>; concurrency?: number;
}): Promise<SyncSummary> {
  const { config: cfg, igUserId, token } = opts;
  const all: IgMedia[] = [];
  let after: string | undefined;
  do {
    const params: Record<string, string> = {
      fields: "id,media_product_type,media_type,caption,permalink,timestamp,like_count,comments_count", limit: "100", access_token: token,
    };
    if (after) params.after = after;
    const page = (await metaCall(graphUrl(cfg, `${igUserId}/media`), { method: "GET", params, token })) as {
      data?: IgMedia[]; paging?: { cursors?: { after?: string }; next?: string };
    };
    all.push(...(page.data ?? []));
    after = page.paging?.next ? page.paging.cursors?.after : undefined;
  } while (after);

  const reels = all.filter((m) => m.media_product_type === "REELS");
  const rows: AccountMediaRow[] = [];
  const n = opts.concurrency ?? 5;
  for (let i = 0; i < reels.length; i += n) {
    const chunk = reels.slice(i, i + n);
    const res = await Promise.all(chunk.map((m) => fetchInstagramInsights(cfg, { mediaId: m.id, kind: "reel", token })));
    chunk.forEach((m, j) => {
      const r = res[j];
      rows.push({
        externalId: m.id, productType: m.media_product_type, mediaType: m.media_type, permalink: m.permalink,
        // Trim by whole characters: .slice() on UTF-16 can cut an emoji in half, and a lone half is
        // invalid JSON for Postgres (it rejected the first real sync of @lws.pune's captions).
        caption: Array.from(m.caption ?? "").slice(0, 300).join(""), postedAt: new Date(m.timestamp).toISOString(),
        likes: m.like_count ?? null, comments: m.comments_count ?? null,
        metrics: r.ok ? r.metrics : null, insightsError: r.ok ? null : r.error,
      });
    });
  }
  await opts.store(rows);
  return { media: all.length, reels: reels.length, withInsights: rows.filter((r) => r.metrics).length, failed: rows.filter((r) => !r.metrics).length };
}
