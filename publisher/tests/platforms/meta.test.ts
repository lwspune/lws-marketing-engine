import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { stepFacebook, stepInstagram, type MetaPostMedia } from "@/lib/platforms/meta";
import type { Publication } from "@/lib/domain/types";

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "instagram", status: "pending", scheduledAt: null,
  attempts: 0, externalRef: null, externalId: null, permalink: null, error: null, ...over,
});

const reel: MetaPostMedia = {
  kind: "reel", caption: "NDA 2026 Q74 #NDA",
  videoUrl: "https://files.example/v.mp4", coverUrl: "https://files.example/c.png",
};
const carousel: MetaPostMedia = {
  kind: "carousel", caption: "Q42 #NDA",
  slideUrls: ["https://files.example/1.png", "https://files.example/2.png", "https://files.example/3.png"],
};
const ig = { igUserId: "ig1", token: "TOKEN-IG" };
const fb = { pageId: "page1", token: "TOKEN-PAGE" };

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

describe("stepInstagram — reel", () => {
  it("pending: creates a REELS container with video, cover and caption", async () => {
    fake = await startFakeMeta();
    const ev = await stepInstagram(pub(), { config: fake.config, account: ig, media: reel });
    expect(ev).toEqual({ type: "started", externalRef: expect.stringMatching(/^c\d+$/) });
    const create = fake.calls.find((c) => c.path.endsWith("/ig1/media"))!;
    expect(create.method).toBe("POST");
    expect(create.params).toMatchObject({
      media_type: "REELS", video_url: reel.videoUrl, cover_url: reel.coverUrl, caption: reel.caption, share_to_feed: "true", access_token: "TOKEN-IG",
    });
  });

  it("keeps the token out of URLs on POST (it goes in the body)", async () => {
    fake = await startFakeMeta();
    await stepInstagram(pub(), { config: fake.config, account: ig, media: reel });
    const create = fake.calls.find((c) => c.path.endsWith("/ig1/media"))!;
    expect(create.headers["content-type"]).toContain("x-www-form-urlencoded");
  });

  it("processing + IN_PROGRESS: nothing to record yet", async () => {
    fake = await startFakeMeta({ containerStatuses: ["IN_PROGRESS"] });
    const ev = await stepInstagram(pub({ status: "processing", externalRef: "c1" }), { config: fake.config, account: ig, media: reel });
    expect(ev).toBeNull();
    expect(fake.calls.some((c) => c.path.endsWith("media_publish"))).toBe(false);
  });

  it("processing + FINISHED: publishes once and returns the permalink", async () => {
    fake = await startFakeMeta({ containerStatuses: ["FINISHED"] });
    const ev = await stepInstagram(pub({ status: "processing", externalRef: "c1" }), { config: fake.config, account: ig, media: reel });
    expect(ev).toEqual({ type: "published", externalId: expect.stringMatching(/^m\d+$/), permalink: "https://www.instagram.com/reel/FAKE/" });
    const publishes = fake.calls.filter((c) => c.path.endsWith("/ig1/media_publish"));
    expect(publishes).toHaveLength(1);
    expect(publishes[0].params.creation_id).toBe("c1");
  });

  it("processing + PUBLISHED (an earlier run already published): records it without publishing again", async () => {
    fake = await startFakeMeta({ containerStatuses: ["PUBLISHED"] });
    const ev = await stepInstagram(pub({ status: "processing", externalRef: "c1" }), { config: fake.config, account: ig, media: reel });
    expect(ev).toEqual({ type: "published", externalId: null, permalink: null });
    expect(fake.calls.some((c) => c.path.endsWith("media_publish"))).toBe(false);
  });

  it("processing + ERROR or EXPIRED: fails with Instagram's reason", async () => {
    fake = await startFakeMeta({ containerStatuses: ["ERROR"] });
    const ev = await stepInstagram(pub({ status: "processing", externalRef: "c1" }), { config: fake.config, account: ig, media: reel });
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/video too short/) });
  });

  it("a 4xx from Meta fails the publication with Meta's message", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/ig1\/media$/, status: 400, message: "Invalid OAuth access token." } });
    const ev = await stepInstagram(pub(), { config: fake.config, account: ig, media: reel });
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/Invalid OAuth access token/) });
  });

  it("a 5xx from Meta is treated as temporary: nothing recorded, retried next tick", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/ig1\/media$/, status: 503, message: "Service temporarily unavailable" } });
    expect(await stepInstagram(pub(), { config: fake.config, account: ig, media: reel })).toBeNull();
  });

  it("never echoes the access token in an error message", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/ig1\/media$/, status: 400, message: "bad request for TOKEN-IG" } });
    const ev = await stepInstagram(pub(), { config: fake.config, account: ig, media: reel });
    expect(ev && "error" in ev ? ev.error : "").not.toContain("TOKEN-IG");
  });
});

describe("stepInstagram — carousel", () => {
  it("pending: creates one child per slide, then a CAROUSEL container with them in order", async () => {
    fake = await startFakeMeta();
    const ev = await stepInstagram(pub(), { config: fake.config, account: ig, media: carousel });
    expect(ev).toMatchObject({ type: "started" });
    const creates = fake.calls.filter((c) => c.path.endsWith("/ig1/media"));
    expect(creates).toHaveLength(4);
    creates.slice(0, 3).forEach((c, i) => expect(c.params).toMatchObject({ image_url: carousel.slideUrls![i], is_carousel_item: "true" }));
    const parent = creates[3].params;
    expect(parent.media_type).toBe("CAROUSEL");
    expect(parent.caption).toBe("Q42 #NDA");
    expect(parent.children.split(",")).toHaveLength(3);
  });
});

describe("stepFacebook — Page reel", () => {
  const fbPub = (over: Partial<Publication> = {}) => pub({ platform: "facebook", ...over });
  const fbMedia = { ...reel, caption: "Solve it in 10 seconds" };

  it("pending: start → upload from the hosted file → finish as published, then started", async () => {
    fake = await startFakeMeta();
    const ev = await stepFacebook(fbPub(), { config: fake.config, account: fb, media: fbMedia });
    expect(ev).toEqual({ type: "started", externalRef: expect.stringMatching(/^v\d+$/) });
    const [start, upload, finish] = fake.calls;
    expect(start.params).toMatchObject({ upload_phase: "start", access_token: "TOKEN-PAGE" });
    expect(upload.path).toMatch(/^\/video-upload\/v24\.0\/v\d+$/);
    expect(upload.headers["file_url"]).toBe(reel.videoUrl);
    expect(upload.headers["authorization"]).toBe("OAuth TOKEN-PAGE");
    expect(finish.params).toMatchObject({ upload_phase: "finish", video_state: "PUBLISHED", description: "Solve it in 10 seconds" });
  });

  it("processing: still processing → nothing to record", async () => {
    fake = await startFakeMeta({ fbStatuses: [{ video_status: "processing", publishing_phase: { status: "not_started" } }] });
    expect(await stepFacebook(fbPub({ status: "processing", externalRef: "v1" }), { config: fake.config, account: fb, media: fbMedia })).toBeNull();
  });

  it("processing: publishing complete → published with an absolute permalink", async () => {
    fake = await startFakeMeta();
    const ev = await stepFacebook(fbPub({ status: "processing", externalRef: "v1" }), { config: fake.config, account: fb, media: fbMedia });
    expect(ev).toEqual({ type: "published", externalId: "v1", permalink: "https://www.facebook.com/reel/987654321/" });
  });

  it("processing: an error status fails it", async () => {
    fake = await startFakeMeta({ fbStatuses: [{ video_status: "error", processing_phase: { status: "error", error: { message: "Unsupported codec" } } }] });
    const ev = await stepFacebook(fbPub({ status: "processing", externalRef: "v1" }), { config: fake.config, account: fb, media: fbMedia });
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/Unsupported codec/) });
  });

  it("refuses a carousel (not supported on Facebook yet)", async () => {
    fake = await startFakeMeta();
    const ev = await stepFacebook(fbPub(), { config: fake.config, account: fb, media: carousel });
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/carousel/i) });
    expect(fake.calls).toHaveLength(0);
  });
});
