"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createDraftOnMeta, switchDraft } from "@/lib/ads/run";
import { metaConfigFromEnv } from "@/lib/platforms/meta";
import { fail, fromRpcError, type Result } from "@/lib/publishing/result";

// Every action: validate input (fail fast) → check the signed-in member (their own database call,
// or an RLS read that only returns their org's draft) → only then talk to Meta with the service role.
// Nothing here can spend money except launchAd, which a member presses after checking the preview.

const Id = z.string().uuid();

async function member() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

const done = <T>(r: Result<T>) => { revalidatePath("/ads"); return r; };

/** Approve a ready ad: created on Meta, PAUSED. */
export async function approveAd(draftId: string): Promise<Result<{ status: string }>> {
  if (!Id.safeParse(draftId).success) return fail("invalid_input", "Unknown ad.");
  const m = await member();
  if (!m) return fail("unauthorized", "Please sign in again.");
  const { error } = await m.supabase.rpc("approve_ad", { p_draft: draftId });
  if (error) return fromRpcError(error);
  return done(await createDraftOnMeta(createSupabaseAdminClient(), metaConfigFromEnv(), draftId));
}

/** After a failure: resume creating it on Meta (objects already made are kept). */
export async function retryAd(draftId: string): Promise<Result<{ status: string }>> {
  if (!Id.safeParse(draftId).success) return fail("invalid_input", "Unknown ad.");
  const m = await member();
  if (!m) return fail("unauthorized", "Please sign in again.");
  const { error } = await m.supabase.rpc("retry_ad", { p_draft: draftId });
  if (error) return fromRpcError(error);
  return done(await createDraftOnMeta(createSupabaseAdminClient(), metaConfigFromEnv(), draftId));
}

export async function rejectAd(draftId: string, reason: string): Promise<Result<{ status: string }>> {
  const parsed = z.object({ draftId: Id, reason: z.string().max(500) }).safeParse({ draftId, reason });
  if (!parsed.success) return fail("invalid_input", "Keep the reason under 500 characters.");
  const m = await member();
  if (!m) return fail("unauthorized", "Please sign in again.");
  const { error } = await m.supabase.rpc("reject_ad", { p_draft: draftId, p_reason: reason });
  if (error) return fromRpcError(error);
  return done({ ok: true, data: { status: "rejected" } });
}

async function switchAd(draftId: string, live: boolean): Promise<Result<{ status: string }>> {
  if (!Id.safeParse(draftId).success) return fail("invalid_input", "Unknown ad.");
  const m = await member();
  if (!m) return fail("unauthorized", "Please sign in again.");
  // RLS: this only finds the draft if it belongs to the member's org.
  const { data: mine } = await m.supabase.from("ad_drafts").select("id").eq("id", draftId).maybeSingle();
  if (!mine) return fail("not_found", "Ad not found.");
  return done(await switchDraft(createSupabaseAdminClient(), metaConfigFromEnv(), draftId, live, m.user.id));
}

/** Switch the ad on. The only action that starts spending. */
export async function launchAd(draftId: string) { return switchAd(draftId, true); }
export async function pauseAd(draftId: string) { return switchAd(draftId, false); }
