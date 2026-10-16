import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseAdSpec } from "@/lib/domain/ads";
import type { MetaConfig } from "@/lib/platforms/meta";
import { createAdOnMeta, setAdLive } from "@/lib/platforms/metaAds";
import { fail, ok, type Result } from "@/lib/publishing/result";

// Server side of the Ads tab, run with the service role AFTER the member's own database call
// (approve_ad / retry_ad) or membership check has passed. Every Meta object id is recorded through
// record_ad_object (write-once), so a retry picks up where a failure stopped.

const DRAFT_FIELDS = "id, project_id, account_id, spec, image_path, status, meta_image_hash, meta_campaign_id, meta_adset_id, meta_creative_id, meta_ad_id";

async function accountAndToken(db: SupabaseClient, accountId: string) {
  const { data: acct } = await db.from("connected_accounts").select("external_id").eq("id", accountId).eq("platform", "meta_ads").single();
  const { data: token } = await db.rpc("get_account_token", { p_account: accountId });
  if (!acct || !token) throw new Error("The ad account isn't connected (run npm run connect:ads).");
  return { actId: acct.external_id as string, token: token as string };
}

/** Create an approved draft's campaign, ad set, creative and ad on Meta, all PAUSED. */
export async function createDraftOnMeta(db: SupabaseClient, cfg: MetaConfig, draftId: string): Promise<Result<{ status: "created" }>> {
  const { data: d } = await db.from("ad_drafts").select(DRAFT_FIELDS).eq("id", draftId).single();
  if (!d) return fail("not_found", "Ad draft not found.");
  if (d.status !== "approved") return fail("not_approved", "Only an approved ad is created on Meta.");

  const failed = async (message: string, code = "meta_refused") => {
    const { error } = await db.rpc("record_ad_failed", { p_draft: draftId, p_error: message });
    if (error) console.error("ads: couldn't record a failure", { draftId, error: error.message });
    return fail(code, message);
  };

  let ids: { actId: string; token: string };
  try {
    ids = await accountAndToken(db, d.account_id);
  } catch (e) {
    return failed((e as Error).message, "not_connected");
  }
  let spec;
  try {
    spec = parseAdSpec(d.spec);
  } catch (e) {
    return failed((e as Error).message, "invalid_ad");
  }
  const { data: channels } = await db.from("project_channels").select("platform, connected_accounts(external_id)").eq("project_id", d.project_id);
  const ext = (p: string) => {
    const row = (channels ?? []).find((c) => c.platform === p) as { connected_accounts?: { external_id?: string } | null } | undefined;
    return row?.connected_accounts?.external_id ?? null;
  };
  const pageId = ext("facebook"), igUserId = ext("instagram");
  if (!pageId || !igUserId) return failed("This project needs its Facebook Page and Instagram account connected (npm run connect:meta).", "not_connected");

  const r = await createAdOnMeta(cfg, {
    actId: ids.actId, token: ids.token, spec, pageId, igUserId,
    existing: { imageHash: d.meta_image_hash, campaignId: d.meta_campaign_id, adsetId: d.meta_adset_id, creativeId: d.meta_creative_id, adId: d.meta_ad_id },
    loadImage: async () => {
      const { data, error } = await db.storage.from("media").download(d.image_path);
      if (error || !data) throw new Error(error?.message ?? "file missing");
      return { bytes: Buffer.from(await data.arrayBuffer()), filename: d.image_path.split("/").pop() ?? "poster.png" };
    },
    record: async (kind, metaId) => {
      const { error } = await db.rpc("record_ad_object", { p_draft: draftId, p_kind: kind, p_meta_id: metaId });
      if (error) throw new Error(`saving the ${kind} id: ${error.message}`);
    },
  });
  if (!r.ok) {
    console.error("ads: creating on Meta failed", { draftId, error: r.error });
    return failed(`Couldn't create the ${r.error}`);
  }
  const { error } = await db.rpc("record_ad_created", { p_draft: draftId });
  if (error) {
    console.error("ads: couldn't mark the draft created", { draftId, error: error.message });
    return fail("unexpected", "The ad was created on Meta but the dashboard couldn't record it. Press Retry.");
  }
  return ok({ status: "created" });
}

/** Switch a created ad on (launch / resume) or off (pause), then record it. */
export async function switchDraft(db: SupabaseClient, cfg: MetaConfig, draftId: string, live: boolean, userId: string): Promise<Result<{ status: "live" | "paused" }>> {
  const { data: d } = await db.from("ad_drafts").select(DRAFT_FIELDS).eq("id", draftId).single();
  if (!d) return fail("not_found", "Ad draft not found.");
  const allowed = live ? ["created", "paused"] : ["live"];
  if (!allowed.includes(d.status)) return fail("invalid_transition", live ? "Only a created or paused ad can be launched." : "Only a running ad can be paused.");
  let ids: { actId: string; token: string };
  try {
    ids = await accountAndToken(db, d.account_id);
  } catch (e) {
    return fail("not_connected", (e as Error).message);
  }
  const r = await setAdLive(cfg, { token: ids.token, ids: { campaignId: d.meta_campaign_id, adsetId: d.meta_adset_id, adId: d.meta_ad_id }, live });
  if (!r.ok) {
    console.error("ads: switching on Meta failed", { draftId, live, error: r.error });
    return fail("meta_refused", `Meta refused: ${r.error}`);
  }
  const status = live ? "live" : "paused";
  const { error } = await db.rpc("record_ad_status", { p_draft: draftId, p_status: status, p_user: userId });
  if (error) {
    console.error("ads: couldn't record the switch", { draftId, error: error.message });
    return fail("unexpected", `Meta has the ad ${status === "live" ? "running" : "paused"}, but the dashboard couldn't record it. Check Ads Manager.`);
  }
  return ok({ status });
}
