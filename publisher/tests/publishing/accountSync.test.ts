import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { syncInstagramAccount, type AccountMediaRow } from "@/lib/insights/sync";

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

const media = (n: number, type = "REELS") => Array.from({ length: n }, (_, i) => ({
  id: `m${100 + i}`, media_product_type: type, media_type: type === "REELS" ? "VIDEO" : "IMAGE",
  caption: `Reel ${i} #NDA`, permalink: `https://www.instagram.com/reel/R${i}/`,
  timestamp: `2026-10-${String(1 + (i % 28)).padStart(2, "0")}T12:00:00+0000`, like_count: i, comments_count: 1,
}));

describe("syncInstagramAccount", () => {
  it("lists every page of media, keeps the reels, reads each reel's insights and stores them", async () => {
    fake = await startFakeMeta({ igMedia: [...media(3), ...media(2, "FEED")], igMediaPageSize: 2 });
    const stored: AccountMediaRow[] = [];
    const s = await syncInstagramAccount({ config: fake.config, igUserId: "ig1", token: "T", store: async (rows) => { stored.push(...rows); } });
    expect(s).toEqual({ media: 5, reels: 3, withInsights: 3, failed: 0 });
    expect(stored).toHaveLength(3);
    expect(stored[0]).toMatchObject({
      externalId: "m100", productType: "REELS", permalink: "https://www.instagram.com/reel/R0/", caption: "Reel 0 #NDA",
      postedAt: "2026-10-01T12:00:00.000Z", likes: 0, comments: 1, metrics: { views: 1500, saves: 9 }, insightsError: null,
    });
    // pagination really happened (5 items, 2 per page)
    expect(fake.calls.filter((c) => c.method === "GET" && c.path.endsWith("/ig1/media")).length).toBe(3);
  });

  it("keeps a reel whose insights fail, with the reason and no numbers", async () => {
    fake = await startFakeMeta({ igMedia: media(1), failOn: { path: /\/insights$/, status: 400, message: "Not enough viewers" } });
    const stored: AccountMediaRow[] = [];
    const s = await syncInstagramAccount({ config: fake.config, igUserId: "ig1", token: "T", store: async (rows) => { stored.push(...rows); } });
    expect(s).toMatchObject({ reels: 1, withInsights: 0, failed: 1 });
    expect(stored[0]).toMatchObject({ metrics: null, insightsError: expect.stringMatching(/Not enough viewers/) });
  });

  it("trims long captions to 300 characters", async () => {
    fake = await startFakeMeta({ igMedia: [{ ...media(1)[0], caption: "x".repeat(900) }] });
    const stored: AccountMediaRow[] = [];
    await syncInstagramAccount({ config: fake.config, igUserId: "ig1", token: "T", store: async (rows) => { stored.push(...rows); } });
    expect(stored[0].caption).toHaveLength(300);
  });

  it("never cuts an emoji in half when trimming (a lone half is invalid JSON for Postgres)", async () => {
    fake = await startFakeMeta({ igMedia: [{ ...media(1)[0], caption: "x".repeat(299) + "🔥🔥🔥" }] });
    const stored: AccountMediaRow[] = [];
    await syncInstagramAccount({ config: fake.config, igUserId: "ig1", token: "T", store: async (rows) => { stored.push(...rows); } });
    expect(stored[0].caption).toBe("x".repeat(299) + "🔥");
    expect(stored[0].caption.isWellFormed()).toBe(true);
  });

  it("fails loudly (no partial store) when the media list itself can't be read", async () => {
    fake = await startFakeMeta({ igMedia: media(2), failOn: { path: /\/ig1\/media$/, status: 400, message: "Invalid OAuth access token." } });
    let stored = 0;
    await expect(syncInstagramAccount({ config: fake.config, igUserId: "ig1", token: "T", store: async (rows) => { stored += rows.length; } }))
      .rejects.toThrow(/Invalid OAuth/);
    expect(stored).toBe(0);
  });
});
