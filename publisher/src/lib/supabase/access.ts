import "server-only";
import { seesAds } from "@/lib/domain/access";
import type { createSupabaseServerClient } from "./server";

/** Whether the signed-in user sees ads: reads their own memberships (RLS returns at least their own rows). */
export async function canSeeAds(supabase: ReturnType<typeof createSupabaseServerClient>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("org_members").select("role").eq("user_id", user.id);
  return seesAds((data ?? []).map((m) => m.role as string));
}
