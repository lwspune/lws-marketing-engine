import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { runTick, type PublishContext, type PublisherRepo } from "@/lib/publishing/worker";
import type { Publication } from "@/lib/domain/types";
import type { PublicationEvent } from "@/lib/domain/workflow";

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "instagram", status: "pending", scheduledAt: null,
  attempts: 0, externalRef: null, externalId: null, permalink: null, error: null, ...over,
});

const reelContext = (platform: "instagram" | "facebook" | "youtube" = "instagram"): PublishContext => ({
  post: {
    id: "p1", kind: "reel", videoPath: "o1/p1/v.mp4", coverPath: "o1/p1/c.png", slidePaths: [],
    captions: { instagram: "IG caption #NDA", facebook: "FB caption" },
  },
  account: { platform, externalId: platform === "instagram" ? "ig1" : "page1", token: "TOKEN" },
});

/** In-memory stand-in for the Supabase repo: hands out the given publications once, records what happens. */
function memoryRepo(pubs: Publication[], ctx: PublishContext | null | ((p: Publication) => PublishContext | null)) {
  const recorded: { id: string; ev: PublicationEvent }[] = [];
  const released: string[] = [];
  const signed: { paths: string[]; ttl: number }[] = [];
  const children: { id: string; refs: string[] }[] = [];
  const repo: PublisherRepo = {
    claimDue: async () => pubs.splice(0),
    loadContext: async (p) => (typeof ctx === "function" ? ctx(p) : ctx),
    signUrls: async (paths, ttl) => { signed.push({ paths, ttl }); return paths.map((x) => `https://signed.example/${x}?t=1`); },
    record: async (id, ev) => { recorded.push({ id, ev }); },
    release: async (id) => { released.push(id); },
    saveChildren: async (id, refs) => { children.push({ id, refs }); },
  };
  return { repo, recorded, released, signed, children };
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

  it("fails YouTube cleanly until that phase is built", async () => {
    fake = await startFakeMeta();
    const m = memoryRepo([pub({ platform: "youtube" })], reelContext("youtube"));
    await runTick({ repo: m.repo, metaConfig: fake.config, logger: silent });
    expect(m.recorded[0].ev).toEqual({ type: "failed", error: expect.stringMatching(/YouTube/) });
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
