import { describe, expect, it } from "vitest";
import {
  compareToBaseline, dueSnapshots, LWS_BASELINE, normalizeFacebookInsights, normalizeInstagramInsights, SNAPSHOTS,
} from "@/lib/domain/metrics";

const H = 3600_000;
const PUBLISHED = new Date("2026-10-15T14:00:00Z");

describe("dueSnapshots", () => {
  it("defines a 48-hour and a 7-day snapshot", () => {
    expect(SNAPSHOTS.map((s) => s.label)).toEqual(["48h", "7d"]);
  });

  it("nothing is due before 48 hours", () => {
    expect(dueSnapshots(PUBLISHED, [], new Date(PUBLISHED.getTime() + 47.9 * H))).toEqual([]);
  });

  it("48h is due at 48 hours, once", () => {
    const at = new Date(PUBLISHED.getTime() + 48 * H);
    expect(dueSnapshots(PUBLISHED, [], at)).toEqual(["48h"]);
    expect(dueSnapshots(PUBLISHED, ["48h"], at)).toEqual([]);
  });

  it("7d is due at 7 days; a missed 48h is still taken then", () => {
    const at = new Date(PUBLISHED.getTime() + 7 * 24 * H);
    expect(dueSnapshots(PUBLISHED, ["48h"], at)).toEqual(["7d"]);
    expect(dueSnapshots(PUBLISHED, [], at)).toEqual(["48h", "7d"]);
    expect(dueSnapshots(PUBLISHED, ["48h", "7d"], at)).toEqual([]);
  });
});

describe("normalizeInstagramInsights", () => {
  const api = {
    data: [
      { name: "views", values: [{ value: 1234 }] },
      { name: "reach", values: [{ value: 900 }] },
      { name: "saved", values: [{ value: 7 }] },
      { name: "shares", values: [{ value: 3 }] },
      { name: "likes", values: [{ value: 55 }] },
      { name: "comments", values: [{ value: 4 }] },
      { name: "ig_reels_avg_watch_time", values: [{ value: 9870 }] },
    ],
  };

  it("maps Instagram's metric names to ours", () => {
    expect(normalizeInstagramInsights(api)).toEqual({
      views: 1234, reach: 900, saves: 7, shares: 3, likes: 55, comments: 4, avgWatchMs: 9870,
    });
  });

  it("accepts the total_value shape and leaves missing metrics null", () => {
    expect(normalizeInstagramInsights({ data: [{ name: "views", total_value: { value: 10 } }] })).toEqual({
      views: 10, reach: null, saves: null, shares: null, likes: null, comments: null, avgWatchMs: null,
    });
  });

  it("ignores negative or non-numeric values", () => {
    expect(normalizeInstagramInsights({ data: [{ name: "views", values: [{ value: -1 }] }, { name: "reach", values: [{ value: "x" }] }] }))
      .toMatchObject({ views: null, reach: null });
  });
});

describe("normalizeFacebookInsights", () => {
  it("maps Facebook reel metrics, splitting social actions into likes/comments/shares", () => {
    const api = {
      data: [
        { name: "fb_reels_total_plays", values: [{ value: 500 }] },
        { name: "post_impressions_unique", values: [{ value: 420 }] },
        { name: "post_video_avg_time_watched", values: [{ value: 6100 }] },
        { name: "post_video_social_actions", values: [{ value: { REACTION: 12, COMMENT: 2, SHARE: 5 } }] },
      ],
    };
    expect(normalizeFacebookInsights(api)).toEqual({
      views: 500, reach: 420, saves: null, shares: 5, likes: 12, comments: 2, avgWatchMs: 6100,
    });
  });

  it("falls back to blue_reels_play_count when total plays is missing", () => {
    expect(normalizeFacebookInsights({ data: [{ name: "blue_reels_play_count", values: [{ value: 77 }] }] }).views).toBe(77);
  });
});

describe("compareToBaseline", () => {
  it("marks each tracked metric above or below the typical reel", () => {
    const m = { views: 1000, reach: null, saves: 1, shares: 0, likes: 0, comments: 0, avgWatchMs: 5000 };
    expect(compareToBaseline(m, LWS_BASELINE)).toEqual({ views: "above", saves: "even", avgWatchMs: "below" });
  });

  it("says n/a when a metric wasn't available", () => {
    const m = { views: null, reach: null, saves: null, shares: null, likes: null, comments: null, avgWatchMs: null };
    expect(compareToBaseline(m, LWS_BASELINE)).toEqual({ views: "n/a", saves: "n/a", avgWatchMs: "n/a" });
  });

  it("uses the typical @lws.pune reel measured on 2026-10-15", () => {
    expect(LWS_BASELINE).toMatchObject({ views: 779, saves: 1, avgWatchMs: 6906, measuredOn: "2026-10-15" });
  });
});
