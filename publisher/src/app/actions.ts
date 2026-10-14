"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { planApproval } from "@/lib/domain/workflow";
import { DomainError, PLATFORMS, type Captions, type Platform, type Post } from "@/lib/domain/types";
import { fail, fromRpcError, ok, type Result } from "@/lib/publishing/result";

// Every action: validate input (fail fast) → check the signed-in user → run the domain rules →
// one database function call (which re-checks membership and runs in a single transaction).

const Uuid = z.string().uuid();
const CaptionsSchema = z.object({
  instagram: z.string().max(5000).optional(),
  facebook: z.string().max(70000).optional(),
  youtube: z.object({ title: z.string().max(300), description: z.string().max(10000) }).optional(),
});

async function signedIn() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? supabase : null;
}

const invalid = (e: z.ZodError) => fail("invalid_input", e.issues.map((i) => i.message).join("; "));

export async function approvePost(input: { postId: string; platforms: string[]; scheduledAt: string | null }): Promise<Result<{ publications: number }>> {
  const parsed = z.object({
    postId: Uuid,
    platforms: z.array(z.enum(PLATFORMS)).max(3),
    scheduledAt: z.string().datetime({ offset: true }).nullable(),
  }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");

  const { data: row } = await supabase.from("posts").select("id, org_id, project_id, kind, status, captions").eq("id", parsed.data.postId).maybeSingle();
  if (!row) return fail("not_found", "Post not found.");
  const { data: channels } = await supabase.from("project_channels").select("platform").eq("project_id", row.project_id);

  const post: Post = { id: row.id, orgId: row.org_id, projectId: row.project_id, kind: row.kind, status: row.status, captions: row.captions as Captions };
  const scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
  try {
    planApproval(post, {
      platforms: parsed.data.platforms as Platform[], scheduledAt, now: new Date(),
      connected: (channels ?? []).map((c) => c.platform as Platform),
    });
  } catch (e) {
    if (e instanceof DomainError) return fail(e.code, e.message);
    throw e;
  }

  const { data, error } = await supabase.rpc("approve_post", {
    p_post: post.id, p_platforms: parsed.data.platforms, p_scheduled_at: scheduledAt?.toISOString() ?? null,
  });
  if (error) return fromRpcError(error);
  revalidatePath("/");
  return ok({ publications: (data ?? []).length });
}

export async function rejectPost(input: { postId: string; reason?: string }): Promise<Result<null>> {
  const parsed = z.object({ postId: Uuid, reason: z.string().max(500).optional() }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("reject_post", { p_post: parsed.data.postId, p_reason: parsed.data.reason ?? null });
  if (error) return fromRpcError(error);
  revalidatePath("/");
  return ok(null);
}

export async function unapprovePost(input: { postId: string }): Promise<Result<null>> {
  const parsed = z.object({ postId: Uuid }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("unapprove_post", { p_post: parsed.data.postId });
  if (error) return fromRpcError(error);
  revalidatePath("/");
  return ok(null);
}

export async function saveCaptions(input: { postId: string; captions: Captions }): Promise<Result<null>> {
  const parsed = z.object({ postId: Uuid, captions: CaptionsSchema }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("update_post_captions", { p_post: parsed.data.postId, p_captions: parsed.data.captions });
  if (error) return fromRpcError(error);
  revalidatePath("/");
  return ok(null);
}

export async function retryPublication(input: { publicationId: string }): Promise<Result<null>> {
  const parsed = z.object({ publicationId: Uuid }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("retry_publication", { p_publication: parsed.data.publicationId });
  if (error) return fromRpcError(error);
  revalidatePath("/");
  return ok(null);
}
