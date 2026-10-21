import { median } from "./metrics";

// Other accounts' posts, read through Instagram Business Discovery (read-only), as rows for the element analysis
// (reels/analysis-framework.md). Meta gives views only for reels; carousels and images have likes and comments.

export type DiscoveryMedia = {
  timestamp: string; media_type: string; media_product_type: string; permalink: string; caption?: string;
  like_count?: number; comments_count?: number; view_count?: number; children?: { data: { id: string }[] };
};

export type CompetitorRow = {
  postedIst: string; type: "REELS" | "CAROUSEL" | "IMAGE" | "VIDEO"; views: number | null; likes: number | null;
  comments: number | null; slides: number | null; permalink: string; caption: string;
  /** The post's metric ÷ the account's median for it (2 decimals); null when the metric is hidden or the median is 0. */
  x: number | null;
};

export type CompetitorMetric = "likes" | "views";

const ist = (t: string) => new Date(new Date(t).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 16).replace("T", " ");

const typeOf = (m: DiscoveryMedia): CompetitorRow["type"] =>
  m.media_product_type === "REELS" ? "REELS" : m.media_type === "CAROUSEL_ALBUM" ? "CAROUSEL" : m.media_type === "VIDEO" ? "VIDEO" : "IMAGE";

/** One row per post, newest first as given. "views" keeps reels only; "likes" keeps every post type. */
export function competitorRows(media: DiscoveryMedia[], metric: CompetitorMetric): CompetitorRow[] {
  const rows: CompetitorRow[] = media.map((m) => ({
    postedIst: ist(m.timestamp), type: typeOf(m), views: m.view_count ?? null, likes: m.like_count ?? null,
    comments: m.comments_count ?? null, slides: m.children?.data.length ?? null, permalink: m.permalink, caption: m.caption ?? "", x: null,
  })).filter((r) => metric === "likes" || r.type === "REELS");
  const mid = median(rows.map((r) => r[metric]));
  for (const r of rows) {
    const v = r[metric];
    r.x = v != null && mid ? Math.round((v / mid) * 100) / 100 : null;
  }
  return rows;
}

const cell = (v: number | null) => (v ?? "");
const quote = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** The CSV that reels/tools/elements.js parseCsv() reads. Captions keep their line breaks (the first line is an element). */
export function competitorCsv(rows: CompetitorRow[]): string {
  const lines = ["posted_ist,type,views,x_their_median,likes,comments,slides,permalink,caption", ...rows.map((r) =>
    [r.postedIst, r.type, cell(r.views), cell(r.x), cell(r.likes), cell(r.comments), cell(r.slides), r.permalink, quote(r.caption)].join(","))];
  return "﻿" + lines.join("\n");
}
