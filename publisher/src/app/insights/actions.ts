"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncAccount, syncAdsAccount } from "@/lib/insights/run";
import { metaConfigFromEnv } from "@/lib/platforms/meta";
import { fail, fromRpcError, ok, type Result } from "@/lib/publishing/result";
import type { SyncSummary } from "@/lib/insights/sync";

/** Refresh now: re-read every reel on the member's Instagram account(s), and their ad accounts' results. */
export async function refreshInsights(): Promise<Result<SyncSummary & { adCampaigns: number }>> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  // RLS: a member only sees their own org's accounts, so this is also the membership check.
  const { data: accounts } = await supabase.from("connected_accounts").select("id, external_id, platform").in("platform", ["instagram", "meta_ads"]);
  const ig = (accounts ?? []).filter((a) => a.platform === "instagram");
  const ads = (accounts ?? []).filter((a) => a.platform === "meta_ads");
  if (!ig.length && !ads.length) return fail("not_connected", "No Instagram or ad account is connected yet.");
  const admin = createSupabaseAdminClient(), cfg = metaConfigFromEnv();
  const totals = { media: 0, reels: 0, withInsights: 0, failed: 0, adCampaigns: 0 };
  try {
    for (const a of ig) {
      const s = await syncAccount(admin, cfg, { id: a.id, externalId: a.external_id });
      totals.media += s.media; totals.reels += s.reels; totals.withInsights += s.withInsights; totals.failed += s.failed;
    }
  } catch (e) {
    console.error("insights: refresh failed", { error: (e as Error).message });
    return fail("refresh_failed", "Couldn't read Instagram right now. Try again in a few minutes.");
  }
  try {
    for (const a of ads) totals.adCampaigns += (await syncAdsAccount(admin, cfg, { id: a.id, externalId: a.external_id })).campaigns;
  } catch (e) {
    console.error("insights: ad refresh failed", { error: (e as Error).message });
    revalidatePath("/insights");
    return fail("ads_refresh_failed", "Reels updated, but Meta didn't return the ad results. Try again in a few minutes.");
  }
  revalidatePath("/insights");
  return ok(totals);
}

/** Save one campaign's bookings for one week (typed in from WhatsApp labels). */
export async function saveAdOutcome(input: { accountId: string; campaignId: string; weekStart: string; booked: number; leads: number }): Promise<Result<null>> {
  const parsed = z.object({
    accountId: z.string().uuid(),
    campaignId: z.string().regex(/^\d{1,30}$/, "Unknown campaign."),
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Unknown week."),
    booked: z.number().int().min(0, "Counts can't be negative.").max(10000),
    leads: z.number().int().min(0, "Counts can't be negative.").max(10000),
  }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", parsed.error.issues.map((i) => i.message).join("; "));
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  const d = parsed.data;
  const { error } = await supabase.rpc("set_ad_outcome", {
    p_account: d.accountId, p_campaign: d.campaignId, p_week: d.weekStart, p_booked: d.booked, p_leads: d.leads,
  });
  if (error) return fromRpcError(error);
  revalidatePath("/insights");
  return ok(null);
}
