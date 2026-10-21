import { describe, expect, it } from "vitest";
import {
  compareToBaseline, dueSnapshots, LWS_BASELINE, median, normalizeFacebookInsights, normalizeInstagramInsights,
  normalizeInstagramStoryInsights, SNAPSHOTS, STORY_SNAPSHOT, storyErrorText, typicalReel, typicalStory, type StoryMetrics,
} from "@/lib/domain/metrics";

describe("median", () => {
  it("ignores nulls and handles odd/even counts", () => {
    expect(median([3, null, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(3); // upper middle, like the spreadsheet summary
    expect(median([null, null])).toBeNull();
    expect(median([])).toBeNull();
  });
});

describe("typicalReel", () => {
  const row = (views: number | null, saves: number | null, avgWatchMs: number | null) =>
    ({ views, saves, avgWatchMs, reach: null, shares: null, likes: null, comments: null });

  it("is the median reel, labelled with the date and count", () => {
    const b = typicalReel([row(100, 1, 5000), row(800, 0, 7000), row(5000, 9, 9000)], new Date("2026-10-16T05:00:00Z"));
    expect(b).toEqual({ views: 800, saves: 1, avgWatchMs: 7000, measuredOn: "2026-10-16", note: "median of 3 reels" });
  });

  it("falls back to the stored baseline when there are no numbers yet", () => {
    expect(typicalReel([], new Date())).toEqual(LWS_BASELINE);
  });
});

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

// Instagram's real replies for the 20 Oct quiz story (read on 2026-10-21, descriptions and ids left out).
const STORY_MAIN = { data: [
  { name: "reach", period: "lifetime", title: "Accounts reached", values: [{ value: 163 }] },
  { name: "views", period: "lifetime", title: "Views", values: [{ value: 206 }] },
  { name: "replies", period: "lifetime", title: "Replies", values: [{ value: 0 }] },
  { name: "shares", period: "lifetime", title: "Shares", values: [{ value: 0 }] },
  { name: "follows", period: "lifetime", title: "Follows", values: [{ value: 1 }] },
  { name: "profile_visits", period: "lifetime", title: "Profile visits", values: [{ value: 17 }] },
] };
const STORY_NAV = { data: [{ name: "navigation", period: "lifetime", title: "Navigation", values: [{ value: 195 }],
  total_value: { value: 195, breakdowns: [{ dimension_keys: ["story_navigation_action_type"], results: [
    { dimension_values: ["tap_forward"], value: 69 }, { dimension_values: ["tap_exit"], value: 115 },
    { dimension_values: ["swipe_forward"], value: 10 }, { dimension_values: ["tap_back"], value: 1 },
  ] }] } }] };

describe("story snapshot", () => {
  it("is taken at 23 hours, before Instagram deletes the story at 24", () => {
    expect(STORY_SNAPSHOT).toEqual({ label: "23h", afterHours: 23 });
    expect(SNAPSHOTS.map((s) => s.label)).not.toContain("23h");
  });
});

describe("normalizeInstagramStoryInsights", () => {
  it("reads the story's numbers and counts tap-exits as people leaving", () => {
    expect(normalizeInstagramStoryInsights(STORY_MAIN, STORY_NAV)).toEqual({
      views: 206, reach: 163, shares: 0, replies: 0, follows: 1, profileVisits: 17, exits: 115,
    });
  });

  it("leaves a number empty when Instagram didn't send it", () => {
    expect(normalizeInstagramStoryInsights({ data: [{ name: "reach", values: [{ value: 9 }] }] }, { data: [] })).toEqual({
      views: null, reach: 9, shares: null, replies: null, follows: null, profileVisits: null, exits: null,
    });
  });
});

describe("typicalStory", () => {
  const story = (reach: number | null, profileVisits: number, follows: number, replies: number): StoryMetrics =>
    ({ views: null, reach, shares: null, replies, follows, profileVisits, exits: null });

  it("is the median story once there are 5 with numbers", () => {
    const rows = [story(100, 5, 0, 0), story(163, 17, 1, 0), story(90, 3, 0, 1), story(200, 20, 2, 0), story(150, 9, 0, 0)];
    expect(typicalStory(rows)).toEqual({ reach: 150, profileVisits: 9, follows: 0, replies: 0, count: 5 });
  });

  it("isn't shown with fewer than 5 (one good morning would set the bar)", () => {
    expect(typicalStory([story(100, 5, 0, 0), story(163, 17, 1, 0), story(null, 0, 0, 0), story(90, 3, 0, 1), story(200, 20, 2, 0)])).toBeNull();
  });
});

describe("storyErrorText", () => {
  it("says plainly when Instagram had already deleted the story", () => {
    expect(storyErrorText("Unsupported get request. Object with ID '18022722398723166' does not exist, cannot be loaded due to missing permissions"))
      .toBe("Instagram had already deleted it (stories last 24 hours).");
  });

  it("passes any other reason through", () => {
    expect(storyErrorText("Instagram isn't connected for this project any more.")).toBe("Instagram isn't connected for this project any more.");
  });
});
