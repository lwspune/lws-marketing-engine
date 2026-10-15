import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { fetchFacebookReelInsights, fetchInstagramInsights } from "@/lib/platforms/metaInsights";
import { runMetricsTick, type MetricsRepo, type DueMetric } from "@/lib/publishing/metrics";
import type { PublishContext } from "@/lib/publishing/worker";
import type { Publication } from "@/lib/domain/types";
import type { PostMetrics } from "@/lib/domain/metrics";

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

describe("fetchInstagramInsights", () => {
  it("asks for reel metrics (incl. watch time) and normalizes them", async () => {
    fake = await startFakeMeta({ igInsights: { data: [{ name: "views", values: [{ value: 1500 }] }, { name: "ig_reels_avg_watch_time", values: [{ value: 8000 }] }] } });
    const r = await fetchInstagramInsights(fake.config, { mediaId: "m1", kind: "reel", token: "T" });
    expect(r).toMatchObject({ ok: true, metrics: { views: 1500, avgWatchMs: 8000 } });
    const call = fake.calls.find((c) => c.path.endsWith("/m1/insights"))!;
    expect(call.params.metric.split(",")).toEqual(expect.arrayContaining(["views", "reach", "saved", "shares", "ig_reels_avg_watch_time"]));
  });

  it("doesn't ask a carousel for watch time (it has none)", async () => {
    fake = await startFakeMeta();
    await fetchInstagramInsights(fake.config, { mediaId: "m1", kind: "carousel", token: "T" });
    expect(fake.calls[0].params.metric).not.toContain("ig_reels_avg_watch_time");
  });

  it("reports a 4xx as a permanent failure and a 5xx as temporary, never leaking the token", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/insights$/, status: 400, message: "Media does not exist for T0KEN-X" } });
    expect(await fetchInstagramInsights(fake.config, { mediaId: "m1", kind: "reel", token: "T0KEN-X" }))
      .toEqual({ ok: false, temporary: false, error: expect.not.stringContaining("T0KEN-X") });
    await fake.close();
    fake = await startFakeMeta({ failOn: { path: /\/insights$/, status: 503, message: "busy" } });
    expect(await fetchInstagramInsights(fake.config, { mediaId: "m1", kind: "reel", token: "T" })).toMatchObject({ ok: false, temporary: true });
  });
});

describe("fetchFacebookReelInsights", () => {
  it("reads video_insights and normalizes them", async () => {
    fake = await startFakeMeta({ fbInsights: { data: [{ name: "fb_reels_total_plays", values: [{ value: 300 }] }, { name: "post_video_avg_time_watched", values: [{ value: 5000 }] }] } });
    const r = await fetchFacebookReelInsights(fake.config, { videoId: "v1", token: "T" });
    expect(r).toMatchObject({ ok: true, metrics: { views: 300, avgWatchMs: 5000, saves: null } });
    expect(fake.calls[0].path).toMatch(/\/v1\/video_insights$/);
  });
});

// ---------------------------------------------------------------------------------------------

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "instagram", status: "published", scheduledAt: null,
  attempts: 1, externalRef: "c1", externalId: "m1", permalink: null, error: null, ...over,
});
const ctx = (platform: "instagram" | "facebook" = "instagram"): PublishContext => ({
  post: { id: "p1", kind: "reel", captions: {}, videoPath: "o/v.mp4", coverPath: null, slidePaths: [] },
  account: { platform, externalId: platform === "instagram" ? "ig1" : "page1", token: "TOKEN" },
});

function memoryRepo(due: DueMetric[], context: PublishContext | null = ctx()) {
  const recorded: { id: string; snapshot: string; metrics: PostMetrics | null; raw: unknown }[] = [];
  const repo: MetricsRepo = {
    metricsDue: async () => due.splice(0),
    loadContext: async () => context,
    recordMetrics: async (id, snapshot, metrics, raw) => { recorded.push({ id, snapshot, metrics, raw }); },
  };
  return { repo, recorded };
}
const silent = { error: () => {} };

describe("runMetricsTick", () => {
  it("records a 48h Instagram snapshot", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([{ publication: pub(), snapshot: "48h" }]);
    const s = await runMetricsTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(s).toEqual({ due: 1, recorded: 1, skipped: 0, errors: 0 });
    expect(m.recorded[0]).toMatchObject({ id: "x1", snapshot: "48h", metrics: { views: 1500, saves: 9 } });
  });

  it("records a Facebook snapshot from the video id", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([{ publication: pub({ platform: "facebook", externalId: "v1" }), snapshot: "7d" }], ctx("facebook"));
    await runMetricsTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0]).toMatchObject({ snapshot: "7d", metrics: { views: 300 } });
  });

  it("a permanent failure is recorded (with the reason) so it isn't retried every minute", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/insights$/, status: 400, message: "Media does not exist" } });
    const m = memoryRepo([{ publication: pub(), snapshot: "48h" }]);
    await runMetricsTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0]).toMatchObject({ metrics: null, raw: { error: expect.stringMatching(/does not exist/) } });
  });

  it("a temporary failure records nothing, so the next tick tries again", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/insights$/, status: 503, message: "busy" } });
    const m = memoryRepo([{ publication: pub(), snapshot: "48h" }]);
    const s = await runMetricsTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(s).toMatchObject({ recorded: 0, skipped: 1 });
  });

  it("records a clear reason when the post has no platform id or account", async () => {
    fake = await startFakeMeta();
    const noId = memoryRepo([{ publication: pub({ externalId: null }), snapshot: "48h" }]);
    await runMetricsTick({ repo: noId.repo, metaConfig: fake.config, logger: silent });
    expect(noId.recorded[0]).toMatchObject({ metrics: null, raw: { error: expect.stringMatching(/no platform id/) } });
    const noAcct = memoryRepo([{ publication: pub(), snapshot: "48h" }], null);
    await runMetricsTick({ repo: noAcct.repo, metaConfig: fake.config, logger: silent });
    expect(noAcct.recorded[0]).toMatchObject({ metrics: null, raw: { error: expect.stringMatching(/isn't connected/) } });
  });

  it("skips YouTube for now without recording", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([{ publication: pub({ platform: "youtube" }), snapshot: "48h" }]);
    expect(await runMetricsTick({ repo: m.repo, metaConfig: fake.config, logger: silent })).toMatchObject({ recorded: 1 });
    expect(m.recorded[0].raw).toMatchObject({ error: expect.stringMatching(/YouTube/) });
  });
});
