import { afterEach, describe, expect, it } from "vitest";
import { startFakeGoogle } from "../helpers/fakeGoogle";
import { stepYouTube, type UploadSession, type YouTubeMedia } from "@/lib/platforms/youtube";
import type { Publication } from "@/lib/domain/types";

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "youtube", status: "pending", scheduledAt: null,
  attempts: 0, externalRef: null, externalId: null, permalink: null, error: null, ...over,
});
const account = { channelId: "UC-lws", refreshToken: "REFRESH-OK" };

let fake: Awaited<ReturnType<typeof startFakeGoogle>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

/** A step context with an in-memory session store. */
function ctx(f: NonNullable<typeof fake>, over: { media?: Partial<YouTubeMedia>; session?: UploadSession | null; refreshToken?: string } = {}) {
  let session = over.session ?? null;
  const saved: UploadSession[] = [];
  return {
    saved,
    get session() { return session; },
    step: {
      config: f.config,
      account: { ...account, refreshToken: over.refreshToken ?? account.refreshToken },
      media: { videoUrl: f.fileUrl, title: "Derivatives of sin x go round in a circle #shorts", description: "pyqvault.com #Shorts", ...over.media },
      loadSession: async () => session,
      saveSession: async (s: UploadSession) => { saved.push(s); session = s; },
    },
  };
}

describe("stepYouTube — pending (upload)", () => {
  it("uploads the video once with its title, description and Shorts-friendly settings, and saves the session first", async () => {
    fake = await startFakeGoogle({ fileSize: 1000 });
    const c = ctx(fake);
    const ev = await stepYouTube(pub(), c.step);
    expect(ev).toEqual({ type: "started", externalRef: expect.stringMatching(/^vid\d+$/) });

    const init = fake.calls.find((x) => x.method === "POST" && x.path === "/upload/youtube/v3/videos")!;
    expect(init.query).toMatchObject({ uploadType: "resumable", part: "snippet,status" });
    expect(init.headers["x-upload-content-length"]).toBe("1000");
    expect(init.headers["x-upload-content-type"]).toBe("video/mp4");
    expect(init.json).toEqual({
      snippet: { title: "Derivatives of sin x go round in a circle #shorts", description: "pyqvault.com #Shorts", categoryId: "27" },
      status: { privacyStatus: "public", selfDeclaredMadeForKids: false, containsSyntheticMedia: false },
    });
    const puts = fake.calls.filter((x) => x.method === "PUT");
    expect(puts).toHaveLength(1);
    expect(puts[0].body.length).toBe(1000);
    expect(c.saved).toEqual([{ uri: expect.stringContaining("upload_id=U1"), size: 1000 }]);
  });

  it("an upload cut off part-way records nothing; the next run resumes from where Google got to", async () => {
    fake = await startFakeGoogle({ fileSize: 1000, cutPutAfter: 1 });
    const c = ctx(fake);
    expect(await stepYouTube(pub(), c.step)).toBeNull(); // temporary: the worker releases it
    expect(c.session).not.toBeNull();
    await fake.close();

    fake = await startFakeGoogle({ fileSize: 1000, session: { kind: "partial", received: 600 } });
    const resumed = ctx(fake, { session: { uri: `${fake.base}/upload/youtube/v3/videos?uploadType=resumable&upload_id=U1`, size: 1000 } });
    const ev = await stepYouTube(pub(), resumed.step);
    expect(ev).toEqual({ type: "started", externalRef: expect.stringMatching(/^vid\d+$/) });
    expect(fake.calls.some((x) => x.method === "POST" && x.path.startsWith("/upload"))).toBe(false); // no second session
    const put = fake.calls.filter((x) => x.method === "PUT").at(-1)!;
    expect(put.headers["content-range"]).toBe("bytes 600-999/1000");
    expect(put.body.length).toBe(400);
  });

  it("never uploads twice: a saved session Google reports complete is recorded as started with that video", async () => {
    fake = await startFakeGoogle({ session: { kind: "complete", videoId: "vidDONE" } });
    const c = ctx(fake, { session: { uri: `${fake.base}/upload/youtube/v3/videos?uploadType=resumable&upload_id=U9`, size: 1000 } });
    expect(await stepYouTube(pub(), c.step)).toEqual({ type: "started", externalRef: "vidDONE" });
    expect(fake.calls.filter((x) => x.method === "PUT")).toHaveLength(1); // only the status query
    expect(fake.calls.some((x) => x.path === "/files/v.mp4")).toBe(false);
  });

  it("an expired session starts a fresh upload", async () => {
    fake = await startFakeGoogle({ session: { kind: "gone" } });
    const c = ctx(fake, { session: { uri: `${fake.base}/upload/youtube/v3/videos?uploadType=resumable&upload_id=OLD`, size: 1000 } });
    expect(await stepYouTube(pub(), c.step)).toEqual({ type: "started", externalRef: expect.stringMatching(/^vid\d+$/) });
    expect(c.saved).toHaveLength(1);
  });

  it("fails clearly when the sign-in was revoked, without leaking the refresh token", async () => {
    fake = await startFakeGoogle();
    const ev = await stepYouTube(pub(), ctx(fake, { refreshToken: "REFRESH-REVOKED-123" }).step);
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/connect:youtube/) });
    expect(JSON.stringify(ev)).not.toContain("REFRESH-REVOKED-123");
  });

  it("fails with a plain message when YouTube's daily upload quota is used up", async () => {
    fake = await startFakeGoogle({ failOn: { method: "POST", path: /^\/upload/, status: 403, reason: "quotaExceeded", message: "The request cannot be completed because you have exceeded your quota." } });
    const ev = await stepYouTube(pub(), ctx(fake).step);
    expect(ev).toEqual({ type: "failed", error: expect.stringMatching(/daily limit.*tomorrow/i) });
  });

  it("a 5xx from Google is temporary: nothing recorded", async () => {
    fake = await startFakeGoogle({ failOn: { method: "POST", path: /^\/upload/, status: 503, message: "Backend Error" } });
    expect(await stepYouTube(pub(), ctx(fake).step)).toBeNull();
  });

  it("fails when the post has no video", async () => {
    fake = await startFakeGoogle();
    expect(await stepYouTube(pub(), ctx(fake, { media: { videoUrl: undefined } }).step)).toEqual({ type: "failed", error: "Reel has no video file." });
  });
});

describe("stepYouTube — processing (poll)", () => {
  const processing = pub({ status: "processing", externalRef: "vid7", attempts: 1 });

  it("still processing: nothing to record", async () => {
    fake = await startFakeGoogle({ uploadStatuses: ["uploaded"] });
    expect(await stepYouTube(processing, ctx(fake).step)).toBeNull();
  });

  it("processed: published with the Shorts link", async () => {
    fake = await startFakeGoogle({ uploadStatuses: ["processed"] });
    expect(await stepYouTube(processing, ctx(fake).step)).toEqual({
      type: "published", externalId: "vid7", permalink: "https://www.youtube.com/shorts/vid7",
    });
    expect(fake.calls.some((x) => x.method === "PUT" || x.path.startsWith("/upload"))).toBe(false);
  });

  it("failed or rejected: fails with YouTube's reason", async () => {
    fake = await startFakeGoogle({ uploadStatuses: ["rejected"], rejectionReason: "duplicate" });
    expect(await stepYouTube(processing, ctx(fake).step)).toEqual({ type: "failed", error: expect.stringMatching(/rejected.*duplicate/) });
    await fake.close();
    fake = await startFakeGoogle({ uploadStatuses: ["failed"], failureReason: "codec" });
    expect(await stepYouTube(processing, ctx(fake).step)).toEqual({ type: "failed", error: expect.stringMatching(/codec/) });
  });

  it("a video that has gone from YouTube fails", async () => {
    fake = await startFakeGoogle({ videoMissing: true });
    expect(await stepYouTube(processing, ctx(fake).step)).toEqual({ type: "failed", error: expect.stringMatching(/no longer on YouTube/) });
  });
});
