"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { planApproval } from "@/lib/domain/workflow";
import { storyApproval } from "@/lib/domain/story";
import { nextSlot, slotsFor } from "@/lib/domain/slots";
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

export async function approvePost(input: { postId: string; platforms: string[]; scheduledAt: string | null; slot?: boolean }):
  Promise<Result<{ publications: number; scheduledAt: string | null }>> {
  const parsed = z.object({
    postId: Uuid,
    platforms: z.array(z.enum(PLATFORMS)).max(3),
    scheduledAt: z.string().datetime({ offset: true }).nullable(),
    slot: z.boolean().optional(),
  }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");

  const { data: row } = await supabase.from("posts").select("id, org_id, project_id, kind, status, captions").eq("id", parsed.data.postId).maybeSingle();
  if (!row) return fail("not_found", "Post not found.");
  const { data: channels } = await supabase.from("project_channels").select("platform").eq("project_id", row.project_id);

  const post: Post = { id: row.id, orgId: row.org_id, projectId: row.project_id, kind: row.kind, status: row.status, captions: row.captions as Captions };
  const now = new Date();

  // "Next free slot" (domain/slots.ts): the project's slots minus the ones already booked. The database allows one
  // post per slot (0010), so if another approval took this one a moment ago, try the next slot (at most 3 times).
  let times: string[] = [], taken: Date[] = [];
  if (parsed.data.slot) {
    const { data: project } = await supabase.from("projects").select("slug").eq("id", row.project_id).maybeSingle();
    times = slotsFor(project?.slug ?? "");
    if (!times.length) return fail("no_slots", "This project has no posting slots. Choose Publish now or Schedule.");
    const { data: booked } = await supabase.from("posts").select("scheduled_at")
      .eq("project_id", row.project_id).not("scheduled_at", "is", null).gt("scheduled_at", now.toISOString()).neq("kind", "story");
    taken = (booked ?? []).map((b) => new Date(b.scheduled_at as string));
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const scheduledAt = parsed.data.slot ? nextSlot(times, taken, now) : parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    if (parsed.data.slot && !scheduledAt) return fail("no_free_slot", "No free slot in the next 75 days.");
    try {
      planApproval(post, {
        platforms: parsed.data.platforms as Platform[], scheduledAt, now,
        connected: (channels ?? []).map((c) => c.platform as Platform),
      });
    } catch (e) {
      if (e instanceof DomainError) return fail(e.code, e.message);
      throw e;
    }
    const { data, error } = await supabase.rpc("approve_post", {
      p_post: post.id, p_platforms: parsed.data.platforms, p_scheduled_at: scheduledAt?.toISOString() ?? null,
    });
    if (error?.code === "23505" && parsed.data.slot && scheduledAt) { taken.push(scheduledAt); continue; }
    if (error) return fromRpcError(error);
    revalidatePath("/");
    return ok({ publications: (data ?? []).length, scheduledAt: scheduledAt?.toISOString() ?? null });
  }
  return fail("slot_busy", "Those slots were just taken. Refresh and approve again.");
}

type Db = ReturnType<typeof createSupabaseServerClient>;
type StoryRow = { id: string; org_id: string; project_id: string; kind: Post["kind"]; status: Post["status"]; captions: Captions; planned_for: string | null };

/** Approve one ready story for Instagram at the time its day allows (domain/story.ts). */
async function approveStoryRow(supabase: Db, row: StoryRow, connected: Platform[], now: Date): Promise<Result<null>> {
  if (row.kind !== "story" || !row.planned_for) return fail("not_a_story", "That post isn't a daily story.");
  const when = storyApproval(new Date(row.planned_for), now);
  if (!when.ok) return fail("story_expired", when.reason);
  const post: Post = { id: row.id, orgId: row.org_id, projectId: row.project_id, kind: row.kind, status: row.status, captions: row.captions };
  try {
    planApproval(post, { platforms: ["instagram"], scheduledAt: when.scheduledAt, now, connected });
  } catch (e) {
    if (e instanceof DomainError) return fail(e.code, e.message);
    throw e;
  }
  const { error } = await supabase.rpc("approve_post", {
    p_post: row.id, p_platforms: ["instagram"], p_scheduled_at: when.scheduledAt?.toISOString() ?? null,
  });
  return error ? fromRpcError(error) : ok(null);
}

const STORY_COLUMNS = "id, org_id, project_id, kind, status, captions, planned_for";

async function connectedFor(supabase: Db, projectId: string): Promise<Platform[]> {
  const { data } = await supabase.from("project_channels").select("platform").eq("project_id", projectId);
  return (data ?? []).map((c) => c.platform as Platform);
}

export async function approveStory(input: { postId: string }): Promise<Result<null>> {
  const parsed = z.object({ postId: Uuid }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  const { data: row } = await supabase.from("posts").select(STORY_COLUMNS).eq("id", parsed.data.postId).maybeSingle();
  if (!row) return fail("not_found", "Post not found.");
  const r = await approveStoryRow(supabase, row as StoryRow, await connectedFor(supabase, row.project_id), new Date());
  revalidatePath("/");
  return r;
}

/** The Sunday routine in one click: approve every ready story whose day hasn't passed. */
export async function approveReadyStories(input: { projectId: string | null }): Promise<Result<{ approved: number; skipped: string[] }>> {
  const parsed = z.object({ projectId: Uuid.nullable() }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await signedIn();
  if (!supabase) return fail("unauthorized", "Please sign in again.");
  let q = supabase.from("posts").select(`${STORY_COLUMNS}, title`).eq("kind", "story").eq("status", "ready").order("planned_for");
  if (parsed.data.projectId) q = q.eq("project_id", parsed.data.projectId);
  const { data: rows } = await q;
  const now = new Date();
  const connected = new Map<string, Platform[]>();
  let approved = 0;
  const skipped: string[] = [];
  for (const row of rows ?? []) {
    if (!connected.has(row.project_id)) connected.set(row.project_id, await connectedFor(supabase, row.project_id));
    const r = await approveStoryRow(supabase, row as StoryRow, connected.get(row.project_id)!, now);
    if (r.ok) approved++;
    else skipped.push(`${row.title}: ${r.error.message}`);
  }
  revalidatePath("/");
  return ok({ approved, skipped });
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
