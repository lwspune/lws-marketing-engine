import { describe, expect, it } from "vitest";
import {
  adParams, adsetParams, adsManagerUrl, campaignParams, chatVerdict, draftActions, conversationsFrom, creativeParams, OPTED_OUT_FEATURES, parseAdSpec,
  summariseCampaigns, weekStartIst, type AdSpec,
} from "@/lib/domain/ads";
import { DomainError } from "@/lib/domain/types";

const spec = {
  slug: "spi-mock-parents",
  project: "lws-coaching",
  title: "SPI Mock Test – parents",
  image: "spi-mock-test-poster.png",
  campaign: "SPI Mock Test – Pune – Nov 2026",
  adset: "Parents 35–55 – Pune",
  ad: "Poster – English",
  primaryText: "Is your child in 10th and aiming for NDA?",
  headline: "SPI Mock Test – Every Sunday, FC Road",
  description: "Sagar Arcade, FC Road · Every Sunday 10 AM–1 PM",
  whatsapp: { phone: "919156310546", greeting: "Hi! 👋 Tap send to get the schedule and fees.", prefilled: "Hi, please send details of the SPI Sunday mock test." },
  audience: { latitude: 18.52, longitude: 73.84, radiusKm: 20, ageMin: 35, ageMax: 55 },
  dailyBudgetInr: 150,
  start: "2026-11-01T13:00:00+05:30",
  end: "2026-11-08T13:00:00+05:30",
};

function codeOf(fn: () => unknown): string | undefined {
  try { fn(); } catch (e) { return e instanceof DomainError ? e.code : "not-a-domain-error"; }
  return undefined;
}
const json = (s: string) => JSON.parse(s) as Record<string, unknown>;

describe("parseAdSpec (.ad.json files)", () => {
  it("accepts a valid ad; music is off unless asked for", () => {
    const s = parseAdSpec(spec);
    expect(s).toMatchObject({ slug: "spi-mock-parents", dailyBudgetInr: 150, music: false });
  });

  it("enforces the same guardrails as the database: ≤ ₹1,000/day, 1–30 days, end after start", () => {
    expect(codeOf(() => parseAdSpec({ ...spec, dailyBudgetInr: 1001 }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, dailyBudgetInr: 0 }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, dailyBudgetInr: 150.5 }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, end: "2026-12-02T13:00:00+05:30" }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, end: "2026-11-01T20:00:00+05:30" }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, end: undefined }))).toBe("invalid_ad");
  });

  it("dates need a time zone, so 13:00 can't silently mean US time", () => {
    expect(codeOf(() => parseAdSpec({ ...spec, start: "2026-11-01T13:00:00" }))).toBe("invalid_ad");
  });

  it("checks the audience: ages 13–65 in order, a 1–80 km radius, a real place", () => {
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, ageMin: 56 } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, ageMin: 12 } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, ageMax: 70 } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, radiusKm: 0 } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, radiusKm: 81 } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, latitude: 95 } }))).toBe("invalid_ad");
    expect(parseAdSpec({ ...spec, audience: { ...spec.audience, ageMin: 15, ageMax: 17 } }).audience.ageMax).toBe(17);
  });

  it("the poster is a plain .png/.jpg next to the file; the WhatsApp number is digits with country code", () => {
    expect(codeOf(() => parseAdSpec({ ...spec, image: "../secret.png" }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, image: "poster.gif" }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, whatsapp: { ...spec.whatsapp, phone: "+91 91563 10546" } }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, whatsapp: { ...spec.whatsapp, phone: "9156310546" } }))).toBe("invalid_ad");
  });

  it("an optional place name is for people reading the Ads tab only (Meta gets the pin)", () => {
    expect(parseAdSpec({ ...spec, audience: { ...spec.audience, place: "FC Road, Pune" } }).audience.place).toBe("FC Road, Pune");
    expect(codeOf(() => parseAdSpec({ ...spec, audience: { ...spec.audience, place: "x".repeat(81) } }))).toBe("invalid_ad");
    const p = adsetParams(parseAdSpec({ ...spec, audience: { ...spec.audience, place: "FC Road, Pune" } }), { campaignId: "c1", pageId: "page1" });
    expect(p.targeting).not.toContain("FC Road");
  });

  it("texts are required and within Meta's limits", () => {
    expect(codeOf(() => parseAdSpec({ ...spec, primaryText: " " }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, headline: "x".repeat(256) }))).toBe("invalid_ad");
    expect(codeOf(() => parseAdSpec({ ...spec, whatsapp: { ...spec.whatsapp, prefilled: "" } }))).toBe("invalid_ad");
    expect(parseAdSpec({ ...spec, description: undefined }).description).toBeUndefined();
  });

  it("names every problem at once", () => {
    try {
      parseAdSpec({ ...spec, dailyBudgetInr: 5000, image: "x.gif" });
      expect.unreachable();
    } catch (e) {
      expect((e as Error).message).toMatch(/dailyBudgetInr/);
      expect((e as Error).message).toMatch(/image/);
    }
  });
});

describe("what gets sent to Meta: everything created PAUSED", () => {
  const s: AdSpec = parseAdSpec(spec);

  it("campaign: Engagement, no special category, budgets on the ad sets without sharing", () => {
    expect(campaignParams(s)).toEqual({
      name: "SPI Mock Test – Pune – Nov 2026", objective: "OUTCOME_ENGAGEMENT", special_ad_categories: "[]",
      status: "PAUSED", is_adset_budget_sharing_enabled: "false",
    });
  });

  it("ad set: WhatsApp conversations, budget in paise, the pin + radius for people living there, strict ages", () => {
    const p = adsetParams(s, { campaignId: "c1", pageId: "page1" });
    expect(p).toMatchObject({
      name: "Parents 35–55 – Pune", campaign_id: "c1", status: "PAUSED", billing_event: "IMPRESSIONS",
      optimization_goal: "CONVERSATIONS", destination_type: "WHATSAPP", bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      daily_budget: "15000", start_time: "2026-11-01T07:30:00.000Z", end_time: "2026-11-08T07:30:00.000Z",
    });
    expect(json(p.promoted_object)).toEqual({ page_id: "page1", whatsapp_phone_number: "919156310546" });
    expect(json(p.targeting)).toEqual({
      geo_locations: { custom_locations: [{ latitude: 18.52, longitude: 73.84, radius: 20, distance_unit: "kilometer" }], location_types: ["home"] },
      age_min: 35, age_max: 55,
      targeting_automation: { advantage_audience: 0 },
    });
  });

  it("creative: poster, texts, WhatsApp button + greeting + pre-filled message; AI changes and multi-advertiser off", () => {
    const p = creativeParams(s, { pageId: "page1", igUserId: "ig1", imageHash: "h1" });
    expect(p.name).toBe("Poster – English");
    const story = json(p.object_story_spec);
    expect(story).toMatchObject({ page_id: "page1", instagram_user_id: "ig1" });
    const link = story.link_data as Record<string, unknown>;
    expect(link).toMatchObject({
      image_hash: "h1", link: "https://api.whatsapp.com/send", message: "Is your child in 10th and aiming for NDA?",
      name: "SPI Mock Test – Every Sunday, FC Road", description: "Sagar Arcade, FC Road · Every Sunday 10 AM–1 PM",
      call_to_action: { type: "WHATSAPP_MESSAGE", value: { app_destination: "WHATSAPP" } },
    });
    expect(json(link.page_welcome_message as string)).toEqual({
      type: "VISUAL_EDITOR", version: 2, landing_screen_type: "welcome_message", media_type: "text",
      text_format: {
        customer_action_type: "autofill_message",
        message: { text: "Hi! 👋 Tap send to get the schedule and fees.", autofill_message: { content: "Hi, please send details of the SPI Sunday mock test." } },
      },
    });
    const features = (json(p.degrees_of_freedom_spec).creative_features_spec ?? {}) as Record<string, { enroll_status: string }>;
    for (const f of OPTED_OUT_FEATURES) expect(features[f]).toEqual({ enroll_status: "OPT_OUT" });
    expect(features.music_generation).toEqual({ enroll_status: "OPT_OUT" });
    expect(json(p.contextual_multi_ads)).toEqual({ enroll_status: "OPT_OUT" });
  });

  it("music is the one enhancement you can switch on", () => {
    const p = creativeParams(parseAdSpec({ ...spec, music: true }), { pageId: "page1", igUserId: "ig1", imageHash: "h1" });
    const features = json(p.degrees_of_freedom_spec).creative_features_spec as Record<string, { enroll_status: string }>;
    expect(features.music_generation).toEqual({ enroll_status: "OPT_IN" });
  });

  it("without a description, none is sent (Meta would otherwise write one)", () => {
    const p = creativeParams(parseAdSpec({ ...spec, description: undefined }), { pageId: "page1", igUserId: "ig1", imageHash: "h1" });
    expect("description" in (json(p.object_story_spec).link_data as object)).toBe(false);
  });

  it("ad: the creative in the ad set, paused", () => {
    expect(adParams(s, { adsetId: "as1", creativeId: "cr1" })).toEqual({
      name: "Poster – English", adset_id: "as1", creative: JSON.stringify({ creative_id: "cr1" }), status: "PAUSED",
    });
  });
});

describe("results", () => {
  it("counts WhatsApp chats started from Meta's actions list", () => {
    expect(conversationsFrom([
      { action_type: "link_click", value: "40" },
      { action_type: "onsite_conversion.messaging_conversation_started_7d", value: "6" },
    ])).toBe(6);
    expect(conversationsFrom(undefined)).toBe(0);
  });

  it("verdict on cost per chat: ≤ ₹60 good, ≤ ₹100 watch, more is change the poster; too early under ₹100 spent with no chats", () => {
    expect(chatVerdict(300, 6)).toBe("good");      // ₹50
    expect(chatVerdict(300, 5)).toBe("good");      // ₹60
    expect(chatVerdict(400, 5)).toBe("watch");     // ₹80
    expect(chatVerdict(600, 5)).toBe("change");    // ₹120
    expect(chatVerdict(80, 0)).toBe("early");
    expect(chatVerdict(150, 0)).toBe("change");
    expect(chatVerdict(0, 0)).toBe("early");
  });

  it("weeks start on Monday in India", () => {
    expect(weekStartIst(new Date("2026-10-16T12:00:00Z"))).toBe("2026-10-12");        // Friday
    expect(weekStartIst(new Date("2026-10-11T19:00:00Z"))).toBe("2026-10-12");        // Mon 00:30 IST
    expect(weekStartIst(new Date("2026-10-18T17:00:00Z"))).toBe("2026-10-12");        // Sun 22:30 IST
  });

  it("adds up each campaign and ad set, with bookings and cost per booked test", () => {
    const day = (d: string, adset: string, spend: number, chats: number) => ({
      ad_id: `ad-${adset}`, day: d, adset_id: adset, adset_name: adset === "as1" ? "Parents" : "Students",
      campaign_id: "c1", campaign_name: "SPI", spend, conversations: chats, impressions: 1000,
    });
    const [c] = summariseCampaigns(
      [day("2026-10-17", "as1", 150, 3), day("2026-10-18", "as1", 150, 2), day("2026-10-17", "as2", 150, 0)],
      [
        { level: "campaign", external_id: "c1", name: "SPI Mock Test", parent_id: null, effective_status: "ACTIVE", daily_budget_minor: null },
        { level: "adset", external_id: "as1", name: "Parents 35–55", parent_id: "c1", effective_status: "ACTIVE", daily_budget_minor: 15000 },
      ],
      [{ campaign_id: "c1", week_start: "2026-10-12", tests_booked: 2, nda_leads: 1 }],
    );
    expect(c).toMatchObject({
      campaignId: "c1", name: "SPI Mock Test", status: "ACTIVE", spend: 450, chats: 5, costPerChat: 90, verdict: "watch",
      booked: 2, leads: 1, costPerBooked: 225, firstDay: "2026-10-17", lastDay: "2026-10-18",
    });
    expect(c.adsets).toEqual([
      expect.objectContaining({ adsetId: "as1", name: "Parents 35–55", dailyBudgetInr: 150, spend: 300, chats: 5, costPerChat: 60, verdict: "good" }),
      expect.objectContaining({ adsetId: "as2", name: "Students", status: null, spend: 150, chats: 0, costPerChat: null, verdict: "change" }),
    ]);
  });

  it("a running or in-review campaign shows before it has any results; old finished ones without results don't", () => {
    const out = summariseCampaigns([], [
      { level: "campaign", external_id: "c2", name: "SPI students", parent_id: null, effective_status: "PENDING_REVIEW", daily_budget_minor: null },
      { level: "adset", external_id: "as2", name: "Students 15–17", parent_id: "c2", effective_status: "PENDING_REVIEW", daily_budget_minor: 10000 },
      { level: "campaign", external_id: "c0", name: "Old boost", parent_id: null, effective_status: "PAUSED", daily_budget_minor: null },
    ], []);
    expect(out).toEqual([expect.objectContaining({
      campaignId: "c2", status: "PENDING_REVIEW", spend: 0, chats: 0, verdict: "early", firstDay: null, lastDay: null,
      adsets: [expect.objectContaining({ adsetId: "as2", name: "Students 15–17", dailyBudgetInr: 100, spend: 0, verdict: "early" })],
    })]);
  });

  it("newest campaign first; no bookings typed in means no cost per booked test", () => {
    const row = (c: string, d: string) => ({ ad_id: `a${c}`, day: d, adset_id: `s${c}`, adset_name: "", campaign_id: c, campaign_name: c, spend: 10, conversations: 1, impressions: 1 });
    const out = summariseCampaigns([row("old", "2026-09-01"), row("new", "2026-10-17")], [], []);
    expect(out.map((c) => c.campaignId)).toEqual(["new", "old"]);
    expect(out[0]).toMatchObject({ booked: null, costPerBooked: null });
  });
});

describe("ad drafts on the Ads tab", () => {
  it("each status offers only its next step: approve/reject → (create) → launch ⇄ pause; retry after a failure", () => {
    expect(draftActions("ready")).toEqual(["approve", "reject"]);
    expect(draftActions("approved")).toEqual([]);            // being created on Meta right now
    expect(draftActions("failed")).toEqual(["retry"]);
    expect(draftActions("created")).toEqual(["launch"]);
    expect(draftActions("live")).toEqual(["pause"]);
    expect(draftActions("paused")).toEqual(["launch"]);
    expect(draftActions("rejected")).toEqual([]);
  });

  it("links to the campaign in Ads Manager to check the preview before launching", () => {
    expect(adsManagerUrl("act_779905330977080", "120200000000001"))
      .toBe("https://adsmanager.facebook.com/adsmanager/manage/ads?act=779905330977080&selected_campaign_ids=120200000000001");
    expect(adsManagerUrl("act_779905330977080", null)).toBe("https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=779905330977080");
  });
});
