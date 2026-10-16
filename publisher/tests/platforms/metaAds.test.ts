import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { parseAdSpec } from "@/lib/domain/ads";
import { createAdOnMeta, fetchAdAccount, readAdAccount, setAdLive, type AdObjectKind } from "@/lib/platforms/metaAds";

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

const TOKEN = "EAAB-secret-system-user-token";

const spec = parseAdSpec({
  slug: "spi-mock-parents", project: "lws-coaching", title: "SPI – parents", image: "poster.png",
  campaign: "SPI Mock Test", adset: "Parents 35–55 – Pune", ad: "Poster – English",
  primaryText: "Is your child in 10th?", headline: "SPI Mock Test – FC Road",
  whatsapp: { phone: "919156310546", greeting: "Hi!", prefilled: "Please send details." },
  audience: { latitude: 18.52, longitude: 73.84, radiusKm: 20, ageMin: 35, ageMax: 55 },
  dailyBudgetInr: 150, start: "2026-11-01T13:00:00+05:30", end: "2026-11-08T13:00:00+05:30",
});

function recorder() {
  const recorded: [AdObjectKind, string][] = [];
  return { recorded, record: async (k: AdObjectKind, id: string) => { recorded.push([k, id]); } };
}
const image = async () => ({ bytes: Buffer.from("PNGDATA"), filename: "poster.png" });
const base = { actId: "act_1", token: TOKEN, spec, pageId: "page1", igUserId: "ig1", loadImage: image };

describe("fetchAdAccount", () => {
  it("reads the account's name, currency and time zone (proves the token can see it)", async () => {
    fake = await startFakeMeta();
    expect(await fetchAdAccount(fake.config, { actId: "act_1", token: TOKEN })).toEqual({
      id: "act_1", name: "LWS Pune ads", currency: "INR", timezoneName: "America/Los_Angeles", accountStatus: 1,
    });
  });
});

describe("createAdOnMeta", () => {
  it("uploads the poster, then creates campaign → ad set → creative → ad, recording each id as it goes", async () => {
    fake = await startFakeMeta();
    const { recorded, record } = recorder();
    const r = await createAdOnMeta(fake.config, { ...base, existing: {}, record });
    expect(r.ok).toBe(true);
    expect(recorded.map(([k]) => k)).toEqual(["image_hash", "campaign", "adset", "creative", "ad"]);
    const posts = fake.calls.filter((c) => c.method === "POST").map((c) => c.path.replace(/^\/v[\d.]+/, ""));
    expect(posts).toEqual(["/act_1/adimages", "/act_1/campaigns", "/act_1/adsets", "/act_1/adcreatives", "/act_1/ads"]);
    // the image went up as base64 bytes, and the later steps point at the ids made before them
    expect(fake.calls[0].params.bytes).toBe(Buffer.from("PNGDATA").toString("base64"));
    const adset = fake.calls.find((c) => c.path.endsWith("/adsets"))!.params;
    expect(adset.campaign_id).toBe(recorded[1][1]);
    const creative = fake.calls.find((c) => c.path.endsWith("/adcreatives"))!.params;
    expect(JSON.parse(creative.object_story_spec).link_data.image_hash).toBe(recorded[0][1]);
    const ad = fake.calls.find((c) => c.path.endsWith("/ads"))!.params;
    expect(ad).toMatchObject({ adset_id: recorded[2][1], creative: JSON.stringify({ creative_id: recorded[3][1] }) });
  });

  it("everything is created PAUSED: nothing can spend before Launch", async () => {
    fake = await startFakeMeta();
    await createAdOnMeta(fake.config, { ...base, existing: {}, ...recorder() });
    for (const path of ["/campaigns", "/adsets", "/ads"]) {
      expect(fake.calls.find((c) => c.path.endsWith(path))!.params.status).toBe("PAUSED");
    }
  });

  it("a retry resumes after the last recorded object and never makes a second campaign", async () => {
    fake = await startFakeMeta();
    const { recorded, record } = recorder();
    const r = await createAdOnMeta(fake.config, { ...base, existing: { imageHash: "h0", campaignId: "camp0" }, record });
    expect(r.ok).toBe(true);
    expect(recorded.map(([k]) => k)).toEqual(["adset", "creative", "ad"]);
    expect(fake.calls.some((c) => c.path.endsWith("/campaigns") || c.path.endsWith("/adimages"))).toBe(false);
    expect(fake.calls.find((c) => c.path.endsWith("/adsets"))!.params.campaign_id).toBe("camp0");
  });

  it("stops at the first refusal, keeps what was made, and reports Meta's reason without the token", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/adsets$/, status: 400, message: `Invalid targeting spec (token ${TOKEN})` } });
    const { recorded, record } = recorder();
    const r = await createAdOnMeta(fake.config, { ...base, existing: {}, record });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/ad set: Meta API 400.*Invalid targeting spec/) });
    expect(r.ok ? "" : r.error).not.toContain(TOKEN);
    expect(recorded.map(([k]) => k)).toEqual(["image_hash", "campaign"]);
    expect(fake.calls.some((c) => c.path.endsWith("/adcreatives"))).toBe(false);
  });

  it("if the poster can't be read, nothing is created on Meta", async () => {
    fake = await startFakeMeta();
    const r = await createAdOnMeta(fake.config, {
      ...base, existing: {}, ...recorder(), loadImage: async () => { throw new Error("object not found"); },
    });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/poster: object not found/) });
    expect(fake.calls).toHaveLength(0);
  });
});

describe("setAdLive", () => {
  const ids = { campaignId: "camp1", adsetId: "adset2", adId: "ad3" };

  it("launch switches on the ad, then the ad set, and the campaign last", async () => {
    fake = await startFakeMeta();
    expect(await setAdLive(fake.config, { token: TOKEN, ids, live: true })).toEqual({ ok: true });
    expect(fake.calls.map((c) => [c.path.replace(/^\/v[\d.]+\//, ""), c.params.status])).toEqual([
      ["ad3", "ACTIVE"], ["adset2", "ACTIVE"], ["camp1", "ACTIVE"],
    ]);
  });

  it("pause switches off the campaign, which stops everything under it", async () => {
    fake = await startFakeMeta();
    expect(await setAdLive(fake.config, { token: TOKEN, ids, live: false })).toEqual({ ok: true });
    expect(fake.calls.map((c) => [c.path.replace(/^\/v[\d.]+\//, ""), c.params.status])).toEqual([["camp1", "PAUSED"]]);
  });

  it("reports a refusal", async () => {
    fake = await startFakeMeta({ failOn: { path: /camp1$/, status: 400, message: "Ad account has no payment method" } });
    expect(await setAdLive(fake.config, { token: TOKEN, ids, live: true })).toEqual({ ok: false, error: expect.stringMatching(/payment method/) });
  });
});

describe("readAdAccount", () => {
  const insight = (ad: string, day: string, over: object = {}) => ({
    ad_id: ad, ad_name: `Ad ${ad}`, adset_id: "as1", adset_name: "Parents", campaign_id: "c1", campaign_name: "SPI",
    spend: "148.50", impressions: "5200", reach: "3900", clicks: "61", date_start: day, date_stop: day,
    actions: [{ action_type: "onsite_conversion.messaging_conversation_started_7d", value: "4" }], ...over,
  });

  it("reads every page of campaigns, ad sets, ads and daily ad rows over the window", async () => {
    fake = await startFakeMeta({
      adPageSize: 2,
      adLists: {
        campaigns: [{ id: "c1", name: "SPI", effective_status: "ACTIVE" }],
        adsets: [{ id: "as1", name: "Parents", campaign_id: "c1", effective_status: "ACTIVE", daily_budget: "15000" }],
        ads: [{ id: "a1", name: "Poster", adset_id: "as1", effective_status: "PENDING_REVIEW" }],
      },
      adInsights: [insight("a1", "2026-10-17"), insight("a1", "2026-10-18"), insight("a1", "2026-10-19", { actions: undefined })],
    });
    const r = await readAdAccount(fake.config, { actId: "act_1", token: TOKEN, since: "2026-09-20", until: "2026-10-19" });
    expect(r.entities).toEqual([
      { level: "campaign", external_id: "c1", name: "SPI", parent_id: null, effective_status: "ACTIVE", daily_budget_minor: null },
      { level: "adset", external_id: "as1", name: "Parents", parent_id: "c1", effective_status: "ACTIVE", daily_budget_minor: 15000 },
      { level: "ad", external_id: "a1", name: "Poster", parent_id: "as1", effective_status: "PENDING_REVIEW", daily_budget_minor: null },
    ]);
    expect(r.daily).toHaveLength(3);
    expect(r.daily[0]).toEqual({
      ad_id: "a1", day: "2026-10-17", ad_name: "Ad a1", adset_id: "as1", adset_name: "Parents", campaign_id: "c1", campaign_name: "SPI",
      spend: 148.5, impressions: 5200, reach: 3900, clicks: 61, conversations: 4,
      actions: [{ action_type: "onsite_conversion.messaging_conversation_started_7d", value: "4" }],
    });
    expect(r.daily[2]).toMatchObject({ conversations: 0, actions: [] });
    const ins = fake.calls.filter((c) => c.path.endsWith("/act_1/insights"));
    expect(ins).toHaveLength(2);
    expect(ins[0].params).toMatchObject({ level: "ad", time_increment: "1", time_range: JSON.stringify({ since: "2026-09-20", until: "2026-10-19" }) });
  });

  it("fails loudly when Meta refuses (e.g. the token lacks ads_read)", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/act_1\/campaigns$/, status: 403, message: "(#200) Requires ads_read permission" } });
    await expect(readAdAccount(fake.config, { actId: "act_1", token: TOKEN, since: "2026-09-20", until: "2026-10-19" }))
      .rejects.toThrow(/ads_read/);
  });
});
