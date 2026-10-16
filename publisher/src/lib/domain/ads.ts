import { z } from "zod";
import { DomainError } from "./types";

// Meta ads: the .ad.json file, the exact settings sent to Meta, and how results are judged.
//
// An .ad.json file sits next to its poster (like a reel's .post.json) and describes one
// Click-to-WhatsApp ad: campaign → ad set → ad. `npm run ads:add` checks it here and puts it in
// the dashboard's Ads tab. Approving it creates all three on Meta PAUSED; Launch switches them on.
// The guardrails mirror the database (migration 0008): ≤ ₹1,000/day, an end date 1–30 days on.
//
// Defaults are the settings chosen for the first SPI campaign (Oct 2026): WhatsApp chats as the
// goal, a pin + radius for people LIVING there, strict ages (no Advantage+ audience widening),
// automatic placements, Multi-advertiser ads off, and every AI creative change off except
// (optionally) music. The poster and texts run exactly as written.

const SLUG = /^[a-z0-9][a-z0-9-]{1,79}$/;
const FILE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const DAY_MS = 86_400_000;
export const MAX_DAILY_BUDGET_INR = 1000;
export const MAX_DAYS = 30;

const text = (max: number) => z.string().trim().min(1, "is required").max(max, `must be at most ${max} characters`);

const AdSpecSchema = z
  .object({
    slug: z.string().regex(SLUG, "must be lowercase letters, digits and dashes"),
    project: z.string().regex(SLUG, "must be a lowercase slug"),
    title: text(120),
    image: z.string().regex(FILE, "must be a plain file name next to the .ad.json").regex(/\.(png|jpe?g)$/i, "must be a .png or .jpg"),
    campaign: text(400),
    adset: text(400),
    ad: text(400),
    primaryText: text(2000),
    headline: text(255),
    description: text(255).optional(),
    whatsapp: z.object({
      phone: z.string().regex(/^[1-9]\d{10,14}$/, "must be digits with the country code, e.g. 919156310546"),
      greeting: text(1000),
      prefilled: text(300),
    }),
    audience: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().min(1, "must be at least 1 km").max(80, "must be at most 80 km"),
        ageMin: z.number().int().min(13).max(65),
        ageMax: z.number().int().min(13).max(65),
        /** Shown on the Ads tab only; Meta targets the pin. */
        place: text(80).optional(),
      })
      .refine((a) => a.ageMin <= a.ageMax, { message: "ageMin must not be above ageMax", path: ["ageMin"] }),
    dailyBudgetInr: z.number().int("must be whole rupees").min(1).max(MAX_DAILY_BUDGET_INR, `must be at most ₹${MAX_DAILY_BUDGET_INR} a day`),
    start: z.string().datetime({ offset: true, message: "must be a date-time with its time zone, e.g. 2026-11-01T13:00:00+05:30" }),
    end: z.string().datetime({ offset: true, message: "must be a date-time with its time zone, e.g. 2026-11-08T13:00:00+05:30" }),
    music: z.boolean().default(false),
  })
  .superRefine((s, ctx) => {
    const days = (Date.parse(s.end) - Date.parse(s.start)) / DAY_MS;
    if (!(days > 1)) ctx.addIssue({ code: "custom", path: ["end"], message: "must be more than a day after start" });
    if (days > MAX_DAYS) ctx.addIssue({ code: "custom", path: ["end"], message: `must be at most ${MAX_DAYS} days after start` });
  });

export type AdSpec = z.infer<typeof AdSpecSchema>;

export function parseAdSpec(input: unknown): AdSpec {
  const result = AdSpecSchema.safeParse(input);
  if (result.success) return result.data;
  const problems = result.error.issues.map((i) => `${i.path.join(".") || "file"}: ${i.message}`);
  throw new DomainError("invalid_ad", `Invalid ad file — ${problems.join("; ")}`);
}

// ---------------------------------------------------------------------------------------------
// What gets sent to Meta (Marketing API form parameters; objects are JSON-encoded)

/** AI creative changes switched off on every ad (Marketing API v22+: one switch per feature). */
export const OPTED_OUT_FEATURES = [
  "image_touchups", "text_optimizations", "image_templates", "image_animation", "image_background_gen", "description_automation",
] as const;

export const campaignParams = (s: AdSpec) => ({
  name: s.campaign,
  objective: "OUTCOME_ENGAGEMENT",
  special_ad_categories: "[]",
  status: "PAUSED",
  // budgets live on the ad sets; since v24 Meta requires saying whether they share
  is_adset_budget_sharing_enabled: "false",
});

export const adsetParams = (s: AdSpec, ids: { campaignId: string; pageId: string }) => ({
  name: s.adset,
  campaign_id: ids.campaignId,
  status: "PAUSED",
  billing_event: "IMPRESSIONS",
  optimization_goal: "CONVERSATIONS",
  destination_type: "WHATSAPP",
  bid_strategy: "LOWEST_COST_WITHOUT_CAP",
  daily_budget: String(s.dailyBudgetInr * 100),
  start_time: new Date(s.start).toISOString(),
  end_time: new Date(s.end).toISOString(),
  promoted_object: JSON.stringify({ page_id: ids.pageId, whatsapp_phone_number: s.whatsapp.phone }),
  targeting: JSON.stringify({
    geo_locations: {
      custom_locations: [{ latitude: s.audience.latitude, longitude: s.audience.longitude, radius: s.audience.radiusKm, distance_unit: "kilometer" }],
      location_types: ["home"],
    },
    age_min: s.audience.ageMin,
    age_max: s.audience.ageMax,
    targeting_automation: { advantage_audience: 0 },
  }),
});

export function creativeParams(s: AdSpec, ids: { pageId: string; igUserId: string; imageHash: string }) {
  const welcome = {
    type: "VISUAL_EDITOR", version: 2, landing_screen_type: "welcome_message", media_type: "text",
    text_format: {
      customer_action_type: "autofill_message",
      message: { text: s.whatsapp.greeting, autofill_message: { content: s.whatsapp.prefilled } },
    },
  };
  const features: Record<string, { enroll_status: "OPT_IN" | "OPT_OUT" }> = {};
  for (const f of OPTED_OUT_FEATURES) features[f] = { enroll_status: "OPT_OUT" };
  features.music_generation = { enroll_status: s.music ? "OPT_IN" : "OPT_OUT" };
  return {
    name: s.ad,
    object_story_spec: JSON.stringify({
      page_id: ids.pageId,
      instagram_user_id: ids.igUserId,
      link_data: {
        image_hash: ids.imageHash,
        link: "https://api.whatsapp.com/send",
        message: s.primaryText,
        name: s.headline,
        ...(s.description ? { description: s.description } : {}),
        call_to_action: { type: "WHATSAPP_MESSAGE", value: { app_destination: "WHATSAPP" } },
        page_welcome_message: JSON.stringify(welcome),
      },
    }),
    degrees_of_freedom_spec: JSON.stringify({ creative_features_spec: features }),
    contextual_multi_ads: JSON.stringify({ enroll_status: "OPT_OUT" }),
  };
}

export const adParams = (s: AdSpec, ids: { adsetId: string; creativeId: string }) => ({
  name: s.ad,
  adset_id: ids.adsetId,
  creative: JSON.stringify({ creative_id: ids.creativeId }),
  status: "PAUSED",
});

// ---------------------------------------------------------------------------------------------
// Results

/** Meta's action type for "Messaging conversations started" (the Results column for WhatsApp ads). */
export const CONVERSATION_ACTION = "onsite_conversion.messaging_conversation_started_7d";

export function conversationsFrom(actions: { action_type: string; value: string | number }[] | undefined): number {
  const hit = (actions ?? []).find((a) => a.action_type === CONVERSATION_ACTION);
  return hit ? Number(hit.value) || 0 : 0;
}

/** Rough guide for local education ads in India; your own numbers replace it over time. */
export const COST_PER_CHAT = { good: 60, watch: 100 } as const;
export type ChatVerdict = "good" | "watch" | "change" | "early";

export function chatVerdict(spend: number, chats: number): ChatVerdict {
  if (chats === 0) return spend >= COST_PER_CHAT.watch ? "change" : "early";
  const cost = spend / chats;
  return cost <= COST_PER_CHAT.good ? "good" : cost <= COST_PER_CHAT.watch ? "watch" : "change";
}

/** The Monday (YYYY-MM-DD, India time) of the week `at` falls in. */
export function weekStartIst(at: Date): string {
  const ist = new Date(at.getTime() + 5.5 * 3_600_000);
  const back = (ist.getUTCDay() + 6) % 7;
  return new Date(ist.getTime() - back * DAY_MS).toISOString().slice(0, 10);
}

export interface DailyRow {
  ad_id: string; day: string; adset_id: string; adset_name: string; campaign_id: string; campaign_name: string;
  spend: number | string; conversations: number | string; impressions: number | string;
}
export interface EntityRow {
  level: "campaign" | "adset" | "ad"; external_id: string; name: string; parent_id: string | null;
  effective_status: string; daily_budget_minor: number | string | null;
}
export interface OutcomeRow { campaign_id: string; week_start: string; tests_booked: number; nda_leads: number }

export interface AdsetSummary {
  adsetId: string; name: string; status: string | null; dailyBudgetInr: number | null;
  spend: number; chats: number; costPerChat: number | null; verdict: ChatVerdict;
}
export interface CampaignSummary {
  campaignId: string; name: string; status: string | null; firstDay: string | null; lastDay: string | null;
  spend: number; chats: number; costPerChat: number | null; verdict: ChatVerdict;
  booked: number | null; leads: number | null; costPerBooked: number | null;
  adsets: AdsetSummary[];
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/** Statuses worth showing even before any results: running, waiting for review, or needing attention. */
const LIVE_STATUSES = new Set(["ACTIVE", "PENDING_REVIEW", "IN_PROCESS", "WITH_ISSUES", "PENDING_BILLING_INFO", "DISAPPROVED"]);

export function summariseCampaigns(daily: DailyRow[], entities: EntityRow[], outcomes: OutcomeRow[]): CampaignSummary[] {
  const ent = new Map(entities.map((e) => [e.external_id, e]));
  const byCampaign = new Map<string, DailyRow[]>();
  for (const r of daily) byCampaign.set(r.campaign_id, [...(byCampaign.get(r.campaign_id) ?? []), r]);

  for (const e of entities) {
    if (e.level === "campaign" && LIVE_STATUSES.has(e.effective_status) && !byCampaign.has(e.external_id)) byCampaign.set(e.external_id, []);
  }

  const out: CampaignSummary[] = [];
  for (const [campaignId, rows] of byCampaign) {
    const spend = round2(rows.reduce((t, r) => t + Number(r.spend), 0));
    const chats = rows.reduce((t, r) => t + Number(r.conversations), 0);
    const days = rows.map((r) => r.day).sort();
    const mine = outcomes.filter((o) => o.campaign_id === campaignId);
    const booked = mine.length ? mine.reduce((t, o) => t + o.tests_booked, 0) : null;
    const leads = mine.length ? mine.reduce((t, o) => t + o.nda_leads, 0) : null;

    const byAdset = new Map<string, DailyRow[]>();
    for (const r of rows) byAdset.set(r.adset_id, [...(byAdset.get(r.adset_id) ?? []), r]);
    // ad sets that are running or in review but have no results yet
    for (const e of entities) {
      if (e.level === "adset" && e.parent_id === campaignId && LIVE_STATUSES.has(e.effective_status) && !byAdset.has(e.external_id)) byAdset.set(e.external_id, []);
    }
    const adsets: AdsetSummary[] = [...byAdset].map(([adsetId, ar]) => {
      const e = ent.get(adsetId);
      const s = round2(ar.reduce((t, r) => t + Number(r.spend), 0));
      const c = ar.reduce((t, r) => t + Number(r.conversations), 0);
      return {
        adsetId, name: e?.name ?? ar[ar.length - 1]?.adset_name ?? "", status: e?.effective_status ?? null,
        dailyBudgetInr: e?.daily_budget_minor != null ? Number(e.daily_budget_minor) / 100 : null,
        spend: s, chats: c, costPerChat: c ? round2(s / c) : null, verdict: chatVerdict(s, c),
      };
    });

    const e = ent.get(campaignId);
    out.push({
      campaignId, name: e?.name ?? rows[rows.length - 1]?.campaign_name ?? "", status: e?.effective_status ?? null,
      firstDay: days[0] ?? null, lastDay: days[days.length - 1] ?? null,
      spend, chats, costPerChat: chats ? round2(spend / chats) : null, verdict: chatVerdict(spend, chats),
      booked, leads, costPerBooked: booked ? round2(spend / booked) : null, adsets,
    });
  }
  // no results yet = newest
  return out.sort((a, b) => (b.lastDay ?? "9999").localeCompare(a.lastDay ?? "9999"));
}

// ---------------------------------------------------------------------------------------------
// Drafts (the Ads tab). Mirrors the transitions the database allows (migration 0008).

export type DraftStatus = "ready" | "approved" | "failed" | "created" | "live" | "paused" | "rejected";
export type DraftAction = "approve" | "reject" | "retry" | "launch" | "pause";

const NEXT: Record<DraftStatus, DraftAction[]> = {
  ready: ["approve", "reject"],
  approved: [], // being created on Meta right now
  failed: ["retry"],
  created: ["launch"],
  live: ["pause"],
  paused: ["launch"],
  rejected: [],
};

export const draftActions = (status: DraftStatus): DraftAction[] => NEXT[status] ?? [];

/** Where to check the real preview before pressing Launch. */
export function adsManagerUrl(actId: string, campaignId: string | null): string {
  const act = actId.replace(/^act_/, "");
  return campaignId
    ? `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${act}&selected_campaign_ids=${campaignId}`
    : `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${act}`;
}
