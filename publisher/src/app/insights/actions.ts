"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncAccount } from "@/lib/insights/run";
import { metaConfigFromEnv } from "@/lib/platforms/meta";
import { fail, ok, type Result } from "@/lib/publishing/result";
import type { SyncSummary } from "@/lib/insights/sync";

/** Refresh now: re-read every reel on the signed-in member's Instagram account(s). */
export async function refreshInsights(): Promise<Result<SyncSummary>> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  // RLS: a member only sees their own org's accounts, so this is also the membership check.
  const { data: accounts } = await supabase.from("connected_accounts").select("id, external_id").eq("platform", "instagram");
  if (!accounts?.length) return fail("not_connected", "No Instagram account is connected yet.");
  try {
    const admin = createSupabaseAdminClient(), cfg = metaConfigFromEnv();
    const totals: SyncSummary = { media: 0, reels: 0, withInsights: 0, failed: 0 };
    for (const a of accounts) {
      const s = await syncAccount(admin, cfg, { id: a.id, externalId: a.external_id });
      totals.media += s.media; totals.reels += s.reels; totals.withInsights += s.withInsights; totals.failed += s.failed;
    }
    revalidatePath("/insights");
    return ok(totals);
  } catch (e) {
    console.error("insights: refresh failed", { error: (e as Error).message });
    return fail("refresh_failed", "Couldn't read Instagram right now. Try again in a few minutes.");
  }
}
