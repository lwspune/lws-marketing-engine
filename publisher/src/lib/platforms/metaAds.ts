import { adParams, adsetParams, campaignParams, conversationsFrom, creativeParams, type AdSpec, type EntityRow } from "@/lib/domain/ads";
import { graphUrl, MetaApiError, metaCall, type MetaConfig } from "./meta";

// Meta Marketing API: read an ad account's results, create a Click-to-WhatsApp ad PAUSED, and
// switch it on or off. Uses the ad account's System User token (ads_read + ads_management).
//
// Creation is resumable: each object's id is recorded (record → database, write-once) before the
// next step starts, and a retry skips every object that already has an id. So a failure halfway
// leaves paused, harmless objects on Meta and a retry finishes the job without duplicating any.

export type AdObjectKind = "image_hash" | "campaign" | "adset" | "creative" | "ad";
export interface ExistingIds { imageHash?: string | null; campaignId?: string | null; adsetId?: string | null; creativeId?: string | null; adId?: string | null }

const redact = (text: string, token: string) => (token ? text.split(token).join("[token]") : text);
const reason = (e: unknown, token: string) =>
  redact(e instanceof MetaApiError ? e.message : (e as Error)?.message ?? String(e), token);

export async function fetchAdAccount(cfg: MetaConfig, input: { actId: string; token: string }) {
  const r = await metaCall(graphUrl(cfg, input.actId), {
    method: "GET", params: { fields: "id,name,currency,timezone_name,account_status", access_token: input.token }, token: input.token,
  });
  return {
    id: String(r.id), name: String(r.name ?? ""), currency: String(r.currency ?? ""),
    timezoneName: String(r.timezone_name ?? ""), accountStatus: Number(r.account_status),
  };
}

// ---------------------------------------------------------------------------------------------
// Create (all PAUSED)

export async function createAdOnMeta(cfg: MetaConfig, input: {
  actId: string; token: string; spec: AdSpec; pageId: string; igUserId: string; existing: ExistingIds;
  loadImage: () => Promise<{ bytes: Buffer; filename: string }>;
  record: (kind: AdObjectKind, id: string) => Promise<void>;
}): Promise<{ ok: true; ids: Required<{ [K in keyof ExistingIds]: string }> } | { ok: false; error: string }> {
  const { actId, token, spec } = input;
  const ids = { ...input.existing };
  const post = async (edge: string, params: Record<string, string>) =>
    String((await metaCall(graphUrl(cfg, `${actId}/${edge}`), { method: "POST", params: { ...params, access_token: token }, token })).id ?? "");

  let step = "poster";
  try {
    if (!ids.imageHash) {
      const img = await input.loadImage();
      const r = await metaCall(graphUrl(cfg, `${actId}/adimages`), {
        method: "POST", params: { bytes: img.bytes.toString("base64"), access_token: token }, token,
      });
      const first = Object.values((r.images ?? {}) as Record<string, { hash?: string }>)[0];
      if (!first?.hash) throw new Error("Meta didn't return an image hash.");
      ids.imageHash = first.hash;
      await input.record("image_hash", ids.imageHash);
    }
    step = "campaign";
    if (!ids.campaignId) {
      ids.campaignId = await post("campaigns", campaignParams(spec));
      await input.record("campaign", ids.campaignId);
    }
    step = "ad set";
    if (!ids.adsetId) {
      ids.adsetId = await post("adsets", adsetParams(spec, { campaignId: ids.campaignId, pageId: input.pageId }));
      await input.record("adset", ids.adsetId);
    }
    step = "creative";
    if (!ids.creativeId) {
      ids.creativeId = await post("adcreatives", creativeParams(spec, { pageId: input.pageId, igUserId: input.igUserId, imageHash: ids.imageHash }));
      await input.record("creative", ids.creativeId);
    }
    step = "ad";
    if (!ids.adId) {
      ids.adId = await post("ads", adParams(spec, { adsetId: ids.adsetId, creativeId: ids.creativeId }));
      await input.record("ad", ids.adId);
    }
    return { ok: true, ids: ids as Required<{ [K in keyof ExistingIds]: string }> };
  } catch (e) {
    return { ok: false, error: `${step}: ${reason(e, token)}` };
  }
}

/** Launch: ad, then ad set, then the campaign last (so nothing runs half-on). Pause: the campaign stops everything under it. */
export async function setAdLive(cfg: MetaConfig, input: {
  token: string; ids: { campaignId: string; adsetId: string; adId: string }; live: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { token, ids } = input;
  const order = input.live ? [ids.adId, ids.adsetId, ids.campaignId] : [ids.campaignId];
  try {
    for (const id of order) {
      await metaCall(graphUrl(cfg, id), { method: "POST", params: { status: input.live ? "ACTIVE" : "PAUSED", access_token: token }, token });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: reason(e, token) };
  }
}

// ---------------------------------------------------------------------------------------------
// Read results

export interface AdDailyRow {
  ad_id: string; day: string; ad_name: string; adset_id: string; adset_name: string; campaign_id: string; campaign_name: string;
  spend: number; impressions: number; reach: number | null; clicks: number | null; conversations: number;
  actions: { action_type: string; value: string }[];
}

async function listAll(cfg: MetaConfig, path: string, params: Record<string, string>, token: string) {
  const out: Record<string, unknown>[] = [];
  let after: string | undefined;
  do {
    const page = (await metaCall(graphUrl(cfg, path), {
      method: "GET", params: { ...params, limit: params.limit ?? "200", ...(after ? { after } : {}), access_token: token }, token,
    })) as { data?: Record<string, unknown>[]; paging?: { cursors?: { after?: string }; next?: string } };
    out.push(...(page.data ?? []));
    after = page.paging?.next ? page.paging.cursors?.after : undefined;
  } while (after);
  return out;
}

const num = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));

/** Every campaign, ad set and ad (with status and budget), and one row per ad per day in [since, until] (account time zone). */
export async function readAdAccount(cfg: MetaConfig, input: { actId: string; token: string; since: string; until: string }) {
  const { actId, token } = input;
  const [campaigns, adsets, ads, insights] = await Promise.all([
    listAll(cfg, `${actId}/campaigns`, { fields: "id,name,effective_status,daily_budget" }, token),
    listAll(cfg, `${actId}/adsets`, { fields: "id,name,campaign_id,effective_status,daily_budget" }, token),
    listAll(cfg, `${actId}/ads`, { fields: "id,name,adset_id,effective_status" }, token),
    listAll(cfg, `${actId}/insights`, {
      level: "ad", time_increment: "1", time_range: JSON.stringify({ since: input.since, until: input.until }), limit: "500",
      fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,clicks,actions,date_start",
    }, token),
  ]);

  const entity = (level: EntityRow["level"], parentKey: string | null) => (r: Record<string, unknown>): EntityRow => ({
    level, external_id: String(r.id), name: String(r.name ?? ""), parent_id: parentKey ? String(r[parentKey] ?? "") || null : null,
    effective_status: String(r.effective_status ?? "UNKNOWN"), daily_budget_minor: num(r.daily_budget),
  });
  const entities: EntityRow[] = [
    ...campaigns.map(entity("campaign", null)), ...adsets.map(entity("adset", "campaign_id")), ...ads.map(entity("ad", "adset_id")),
  ];

  const daily: AdDailyRow[] = insights.map((r) => {
    const actions = ((r.actions ?? []) as { action_type: string; value: string }[]).map((a) => ({ action_type: a.action_type, value: String(a.value) }));
    return {
      ad_id: String(r.ad_id), day: String(r.date_start), ad_name: String(r.ad_name ?? ""), adset_id: String(r.adset_id),
      adset_name: String(r.adset_name ?? ""), campaign_id: String(r.campaign_id), campaign_name: String(r.campaign_name ?? ""),
      spend: Number(r.spend ?? 0), impressions: Number(r.impressions ?? 0), reach: num(r.reach), clicks: num(r.clicks),
      conversations: conversationsFrom(actions), actions,
    };
  });
  return { entities, daily };
}
