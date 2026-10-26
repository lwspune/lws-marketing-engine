import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { startFakeGoogle } from "../helpers/fakeGoogle";
import { runTick, type PublishContext, type PublisherRepo } from "@/lib/publishing/worker";
import type { Publication } from "@/lib/domain/types";
import type { PublicationEvent } from "@/lib/domain/workflow";
import type { UploadSession } from "@/lib/platforms/youtube";

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "instagram", status: "pending", scheduledAt: null,
  attempts: 0, externalRef: null, externalId: null, permalink: null, error: null, ...over,
});

const reelContext = (platform: "instagram" | "facebook" | "youtube" = "instagram"): PublishContext => ({
  post: {
    id: "p1", kind: "reel", videoPath: "o1/p1/v.mp4", coverPath: "o1/p1/c.png", slidePaths: [],
    captions: { instagram: "IG caption #NDA", facebook: "FB caption", youtube: { title: "Q74 #shorts", description: "pyqvault.com" } },
  },
  account: { platform, externalId: { instagram: "ig1", facebook: "page1", youtube: "UC-lws" }[platform], token: platform === "youtube" ? "REFRESH-OK" : "TOKEN" },
});

/** In-memory stand-in for the Supabase repo: hands out the given publications once, records what happens. */
function memoryRepo(pubs: Publication[], ctx: PublishContext | null | ((p: Publication) => PublishContext | null), fileUrl?: string) {
  const recorded: { id: string; ev: PublicationEvent }[] = [];
  const released: string[] = [];
  const signed: { paths: string[]; ttl: number }[] = [];
  const children: { id: string; refs: string[] }[] = [];
  const sessions = new Map<string, UploadSession>();
  const repo: PublisherRepo = {
    claimDue: async () => pubs.splice(0),
    loadContext: async (p) => (typeof ctx === "function" ? ctx(p) : ctx),
    signUrls: async (paths, ttl) => { signed.push({ paths, ttl }); return paths.map((x) => fileUrl ?? `https://signed.example/${x}?t=1`); },
    record: async (id, ev) => { recorded.push({ id, ev }); },
    release: async (id) => { released.push(id); },
    saveChildren: async (id, refs) => { children.push({ id, refs }); },
    loadUploadSession: async (id) => sessions.get(id) ?? null,
    saveUploadSession: async (id, s) => { sessions.set(id, s); },
  };
  return { repo, recorded, released, signed, children, sessions };
}

const silent = { error: () => {} };
let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

const storyContext = (): PublishContext => ({
  post: { id: "p1", kind: "story", videoPath: null, coverPath: "o1/p1/card.jpg", slidePaths: [], captions: {} },
  account: { platform: "instagram", externalId: "ig1", token: "TOKEN" },
});

describe("runTick", () => {
  it("starts a pending story from a signed link to its card", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub()], storyContext());
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toMatchObject({ type: "started" });
    expect(m.signed[0]).toEqual({ paths: ["o1/p1/card.jpg"], ttl: 7200 });
    const create = fake.calls.find((c) => c.path.endsWith("/ig1/media"))!;
    expect(create.params).toMatchObject({ media_type: "STORIES", image_url: "https://signed.example/o1/p1/card.jpg?t=1" });
  });

  it("starts a pending Instagram reel using signed URLs for the video and cover", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub()], reelContext());
    const summary = await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(summary).toEqual({ claimed: 1, recorded: 1, released: 0, errors: 0 });
    expect(m.recorded[0]).toEqual({ id: "x1", ev: { type: "started", externalRef: expect.any(String) } });
    expect(m.signed[0]).toEqual({ paths: ["o1/p1/v.mp4", "o1/p1/c.png"], ttl: 7200 });
    const create = fake.calls.find((c) => c.path.endsWith("/ig1/media"))!;
    expect(create.params.video_url).toBe("https://signed.example/o1/p1/v.mp4?t=1");
    expect(create.params.caption).toBe("IG caption #NDA");
  });

  it("publishes a processing one when Meta says it's ready, without re-signing media", async () => {
    fake = await startFakeMeta({ containerStatuses: ["FINISHED"] });
    const m = memoryRepo([pub({ status: "processing", externalRef: "c1", attempts: 1 })], reelContext());
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toMatchObject({ type: "published", permalink: "https://www.instagram.com/reel/FAKE/" });
    expect(m.signed).toHaveLength(0);
  });

  it("releases (records nothing) while the platform is still processing", async () => {
    fake = await startFakeMeta({ containerStatuses: ["IN_PROGRESS"] });
    const m = memoryRepo([pub({ status: "processing", externalRef: "c1", attempts: 1 })], reelContext());
    const summary = await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(summary).toMatchObject({ recorded: 0, released: 1 });
  });

  it("uses the Facebook caption for Facebook", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub({ platform: "facebook" })], reelContext("facebook"));
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    const finish = fake.calls.find((c) => c.params.upload_phase === "finish")!;
    expect(finish.params.description).toBe("FB caption");
  });

  it("reuses the Instagram caption on Facebook when the Facebook one is blank", async () => {
    fake = await startFakeMeta();
    const ctx = reelContext("facebook");
    ctx.post.captions = { instagram: "IG caption #NDA", facebook: "" };
    const m = memoryRepo([pub({ platform: "facebook" })], ctx);
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    const finish = fake.calls.find((c) => c.params.upload_phase === "finish")!;
    expect(finish.params.description).toBe("IG caption #NDA");
  });

  it("fails a publication whose account is no longer connected", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub()], null);
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toEqual({ type: "failed", error: expect.stringMatching(/isn't connected/) });
  });

  it("uploads a pending YouTube reel with its YouTube title, saving the upload session through the repo", async () => {
    fake = await startFakeMeta();
    const google = await startFakeGoogle();
    try {
      const m = memoryRepo([pub({ platform: "youtube" })], reelContext("youtube"), google.fileUrl);
      await runTick({ repo: m.repo, metaConfig: fake.config, youtubeConfig: google.config, logger: silent });
      expect(m.recorded[0].ev).toEqual({ type: "started", externalRef: expect.stringMatching(/^vid\d+$/) });
      expect(m.signed[0].paths).toEqual(["o1/p1/v.mp4"]); // the video only: Shorts take no cover through the API
      expect(m.sessions.get("x1")).toEqual({ uri: expect.stringContaining("upload_id="), size: 1000 });
      const init = google.calls.find((c) => c.method === "POST" && c.path.startsWith("/upload"))!;
      expect(init.json).toMatchObject({ snippet: { title: "Q74 #shorts", description: "pyqvault.com" } });
      expect(fake.calls).toHaveLength(0);
    } finally { await google.close(); }
  });

  it("sends YouTube the reel's YouTube copy when it has one (\"Subscribe for more\" end card)", async () => {
    fake = await startFakeMeta();
    const google = await startFakeGoogle();
    try {
      const ctx = reelContext("youtube");
      ctx.post.youtubeVideoPath = "o1/p1/v-yt.mp4";
      const m = memoryRepo([pub({ platform: "youtube" })], ctx, google.fileUrl);
      await runTick({ repo: m.repo, metaConfig: fake.config, youtubeConfig: google.config, logger: silent });
      expect(m.signed[0].paths).toEqual(["o1/p1/v-yt.mp4"]);
      expect(m.recorded[0].ev).toMatchObject({ type: "started" });
    } finally { await google.close(); }
  });

  it("publishes a processed YouTube Short without downloading anything", async () => {
    fake = await startFakeMeta();
    const google = await startFakeGoogle({ uploadStatuses: ["processed"] });
    try {
      const m = memoryRepo([pub({ platform: "youtube", status: "processing", externalRef: "vid5", attempts: 1 })], reelContext("youtube"), google.fileUrl);
      await runTick({ repo: m.repo, metaConfig: fake.config, youtubeConfig: google.config, logger: silent });
      expect(m.recorded[0].ev).toEqual({ type: "published", externalId: "vid5", permalink: "https://www.youtube.com/shorts/vid5" });
      expect(m.signed).toHaveLength(0);
    } finally { await google.close(); }
  });

  it("fails YouTube clearly when the Google client isn't set up on the server", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub({ platform: "youtube" })], reelContext("youtube"));
    await runTick({ repo: m.repo, metaConfig: fake.config, youtubeConfig: null, logger: silent });
    expect(m.recorded[0].ev).toEqual({ type: "failed", error: expect.stringMatching(/GOOGLE_CLIENT_ID/) });
  });

  it("an unexpected crash on one publication is logged and released; the others still run", async () => {
    fake = await startFakeMeta();
    const errors: unknown[] = [];
    const m = memoryRepo([pub({ id: "boom" }), pub({ id: "ok" })], (p) => {
      if (p.id === "boom") throw new Error("db hiccup");
      return reelContext();
    });
    const summary = await runTick({ repo: m.repo, metaConfig: fake.config, logger: { error: (...a: unknown[]) => errors.push(a) } });
    expect(summary).toEqual({ claimed: 2, recorded: 1, released: 1, errors: 1 });
    expect(m.released).toEqual(["boom"]);
    expect(errors).toHaveLength(1);
  });

  it("gives up on a post picked up more than 5 times without getting started (each run was cut off)", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub({ claims: 6 })], reelContext());
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toEqual({ type: "failed", error: expect.stringMatching(/5 tries.*Retry/) });
    expect(fake.calls).toHaveLength(0);
  });

  it("still tries on the fifth pick-up", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub({ claims: 5 })], reelContext());
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toMatchObject({ type: "started" });
  });

  it("stops starting new work once the run's time budget is spent; the rest wait for the next minute", async () => {
    fake = await startFakeMeta();
    const times = [0, 1_000, 31_000];
    const m = memoryRepo([pub({ id: "a" }), pub({ id: "b" })], reelContext());
    const summary = await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent, clock: () => times.shift() ?? 99_000 });
    expect(m.recorded.map((r) => r.id)).toEqual(["a"]);
    expect(m.released).toEqual(["b"]);
    expect(summary).toEqual({ claimed: 2, recorded: 1, released: 1, errors: 0 });
  });

  it("saves a carousel's uploaded slides through the repo", async () => {
    fake = await startFakeMeta();
    const ctx: PublishContext = {
      post: { id: "p1", kind: "carousel", videoPath: null, coverPath: null, slidePaths: ["o1/p1/1.jpg", "o1/p1/2.jpg"], captions: { instagram: "Q42" } },
      account: { platform: "instagram", externalId: "ig1", token: "TOKEN" },
    };
    const m = memoryRepo([pub()], ctx);
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.children.at(-1)).toEqual({ id: "x1", refs: [expect.stringMatching(/^c\d+$/), expect.stringMatching(/^c\d+$/)] });
    expect(m.recorded[0].ev).toMatchObject({ type: "started" });
  });

  it("refuses to record an event the state machine doesn't allow", async () => {
    fake = await startFakeMeta({ containerStatuses: ["FINISHED"] });
    // processing without a container ref can't be stepped; the stepper returns null → released, never recorded
    const m = memoryRepo([pub({ status: "processing", externalRef: null })], reelContext());
    const summary = await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(summary.recorded).toBe(0);
  });
});
