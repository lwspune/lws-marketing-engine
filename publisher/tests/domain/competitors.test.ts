import { describe, expect, it } from "vitest";
import { competitorCsv, competitorRows, type DiscoveryMedia } from "@/lib/domain/competitors";

// The competitor export (npm run competitors:export → ../analytics/competitors/<handle>-<date>.csv), read by
// reels/tools/elements.js for the element analysis (reels/analysis-framework.md).

const reel = (likes: number | undefined, views: number, at = "2026-10-01T03:30:00+0000"): DiscoveryMedia => ({
  timestamp: at, media_type: "VIDEO", media_product_type: "REELS", like_count: likes, comments_count: 1, view_count: views,
  permalink: `https://www.instagram.com/reel/${likes}-${views}/`, caption: "a reel",
});
const carousel = (likes: number | undefined, slides: number): DiscoveryMedia => ({
  timestamp: "2026-10-02T12:00:00+0000", media_type: "CAROUSEL_ALBUM", media_product_type: "FEED", like_count: likes,
  comments_count: 0, permalink: `https://www.instagram.com/p/${likes}-${slides}/`, caption: "Line one\nSend this to a friend",
  children: { data: Array.from({ length: slides }, (_, i) => ({ id: String(i) })) },
});

describe("competitorRows", () => {
  it("likes: every post type, each against the account's median likes; hidden likes stay but get no multiple", () => {
    const rows = competitorRows([reel(100, 5000), carousel(300, 10), carousel(50, 4), reel(undefined, 900), {
      ...carousel(200, 1), media_type: "IMAGE", children: undefined,
    }], "likes");
    expect(rows.map((r) => r.type)).toEqual(["REELS", "CAROUSEL", "CAROUSEL", "REELS", "IMAGE"]);
    // median of 100, 300, 50, 200 → 200 (upper middle, like metrics.ts)
    expect(rows.map((r) => r.x)).toEqual([0.5, 1.5, 0.25, null, 1]);
    expect(rows[1].slides).toBe(10);
    expect(rows[0].slides).toBeNull();
    expect(rows[3].likes).toBeNull();
  });

  it("views: reels only (Meta gives no views for other accounts' carousels or images)", () => {
    const rows = competitorRows([reel(100, 1000), carousel(300, 10), reel(10, 3000), reel(5, 2000)], "views");
    expect(rows.map((r) => r.views)).toEqual([1000, 3000, 2000]);
    expect(rows.map((r) => r.x)).toEqual([0.5, 1.5, 1]);
  });

  it("time is IST, to the minute", () => {
    expect(competitorRows([reel(1, 1, "2026-10-17T18:52:00+0000")], "likes")[0].postedIst).toBe("2026-10-18 00:22");
  });

  it("an account with no visible numbers gets no multiples instead of dividing by zero", () => {
    expect(competitorRows([reel(undefined, 1)], "likes")[0].x).toBeNull();
    expect(competitorRows([reel(0, 1), reel(0, 1)], "likes")[0].x).toBeNull();
  });
});

describe("competitorCsv", () => {
  it("writes the columns elements.js reads, with a BOM, and keeps caption line breaks inside quotes", () => {
    const csv = competitorCsv(competitorRows([carousel(300, 10), reel(undefined, 900)], "likes"));
    const lines = csv.replace(/^﻿/, "").split("\n");
    expect(csv.startsWith("﻿")).toBe(true);
    expect(lines[0]).toBe("posted_ist,type,views,x_their_median,likes,comments,slides,permalink,caption");
    expect(lines[1]).toBe('2026-10-02 17:30,CAROUSEL,,1,300,0,10,https://www.instagram.com/p/300-10/,"Line one');
    expect(lines[2]).toBe('Send this to a friend"');
    expect(lines[3]).toBe('2026-10-01 09:00,REELS,900,,,1,,https://www.instagram.com/reel/undefined-900/,"a reel"');
  });

  it("doubles quotes inside captions", () => {
    const csv = competitorCsv(competitorRows([{ ...reel(1, 1), caption: 'say "hi", ok' }], "likes"));
    expect(csv).toContain('"say ""hi"", ok"');
  });
});
