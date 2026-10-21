// The results export for the reels' learnings log and the virality predictor (founder, 2026-10-22): for each published
// Instagram reel of a project, its write-once 48 h and 7 d readings (publication_metrics) and, for any age, its latest
// numbers (account_media), keyed by the post slug, which is the reel's name in reels/ (e.g. pv-physics-006-topspin).
// Pure: the script reads the rows, this shapes them.

export interface Numbers { views: number; watchSec: number; reach: number | null; saves: number | null; shares: number | null; comments: number | null }
export interface ReelResult {
  slug: string; title: string; permalink: string | null; publishedAt: string; ageHours: number;
  h48: Numbers | null; d7: Numbers | null; latest: Numbers | null;
}

interface Row { [k: string]: unknown }
const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));

function numbers(r: Row | undefined): Numbers | null {
  if (!r || r.views == null || r.avg_watch_ms == null) return null;
  return { views: Number(r.views), watchSec: Math.round(Number(r.avg_watch_ms) / 100) / 10, reach: n(r.reach), saves: n(r.saves),
    shares: n(r.shares), comments: n(r.comments) };
}

export function reelResults(
  { posts, publications, metrics, media }: { posts: Row[]; publications: Row[]; metrics: Row[]; media: Row[] }, now: Date,
): ReelResult[] {
  const out: ReelResult[] = [];
  for (const p of posts) {
    if (p.kind !== "reel") continue;
    const pub = publications.find((u) => u.post_id === p.id && u.platform === "instagram" && u.status === "published");
    if (!pub || !pub.published_at) continue;
    const snap = (s: string) => numbers(metrics.find((m) => m.publication_id === pub.id && m.snapshot === s));
    out.push({
      slug: String(p.slug), title: String(p.title), permalink: (pub.permalink as string) ?? null, publishedAt: String(pub.published_at),
      ageHours: Math.round(((now.getTime() - new Date(String(pub.published_at)).getTime()) / 3_600_000) * 10) / 10,
      h48: snap("48h"), d7: snap("7d"), latest: numbers(media.find((m) => m.external_id === pub.external_id)),
    });
  }
  return out;
}
