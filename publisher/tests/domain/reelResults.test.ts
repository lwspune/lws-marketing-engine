import { describe, expect, it } from "vitest";
import { reelResults } from "@/lib/domain/reelResults";

// The results export for the reels' learnings log and virality predictor (founder, 2026-10-22): each published reel's
// write-once 48 h and 7 d readings, plus its latest numbers (from the account's media) while it's younger than 48 h.
const NOW = new Date("2026-10-22T12:00:00Z");
const posts = [
  { id: "p1", slug: "pv-physics-006-topspin", title: "Physics #6", kind: "reel" },
  { id: "p2", slug: "pv-chem-006-flame", title: "Chemistry #6", kind: "reel" },
  { id: "p3", slug: "pv-chem-009-draft", title: "not out yet", kind: "reel" },
  { id: "p4", slug: "sm-001", title: "a carousel", kind: "carousel" },
];
const publications = [
  { id: "u1", post_id: "p1", platform: "instagram", status: "published", external_id: "ig1", permalink: "https://instagram.com/reel/A/", published_at: "2026-10-19T12:30:00Z" },
  { id: "u1f", post_id: "p1", platform: "facebook", status: "published", external_id: "fb1", permalink: "https://facebook.com/x", published_at: "2026-10-19T12:30:00Z" },
  { id: "u2", post_id: "p2", platform: "instagram", status: "published", external_id: "ig2", permalink: "https://instagram.com/reel/B/", published_at: "2026-10-22T02:00:00Z" },
  { id: "u3", post_id: "p3", platform: "instagram", status: "pending", external_id: null, permalink: null, published_at: null },
];
const metrics = [
  { publication_id: "u1", snapshot: "48h", views: 1610, avg_watch_ms: 10_800, reach: 1400, saves: 2, shares: 3, comments: 0, error: null },
  { publication_id: "u1f", snapshot: "48h", views: 50, avg_watch_ms: 4000, reach: 40, saves: 0, shares: 0, comments: 0, error: null },
];
const media = [
  { external_id: "ig1", views: 1900, avg_watch_ms: 10_500, reach: 1700, saves: 3, shares: 4, comments: 0 },
  { external_id: "ig2", views: 420, avg_watch_ms: 8200, reach: 390, saves: 0, shares: 0, comments: 0 },
];

describe("reelResults", () => {
  const out = reelResults({ posts, publications, metrics, media }, NOW);

  it("lists published Instagram reels only, by post slug", () => {
    expect(out.map((r) => r.slug)).toEqual(["pv-physics-006-topspin", "pv-chem-006-flame"]);
  });

  it("gives the 48 h reading (Instagram's, not Facebook's) in seconds, and its age", () => {
    expect(out[0]).toMatchObject({ title: "Physics #6", permalink: "https://instagram.com/reel/A/", ageHours: 71.5,
      h48: { views: 1610, watchSec: 10.8, reach: 1400, saves: 2, shares: 3, comments: 0 }, d7: null });
  });

  it("gives a young reel its latest numbers with their age, and no 48 h reading yet", () => {
    expect(out[1]).toMatchObject({ ageHours: 10, h48: null, latest: { views: 420, watchSec: 8.2 } });
  });

  it("skips a snapshot that failed (an error and no numbers)", () => {
    const failed = reelResults({ posts, publications, media, metrics: [{ ...metrics[0], views: null, avg_watch_ms: null, error: "rate limited" }] }, NOW);
    expect(failed[0].h48).toBeNull();
  });
});
