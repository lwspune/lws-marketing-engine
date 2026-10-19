import "server-only";
import { seesAds, seesInbox } from "@/lib/domain/access";
import type { createSupabaseServerClient } from "./server";

type Db = ReturnType<typeof createSupabaseServerClient>;

/** Which tabs the signed-in user gets: reads their own memberships (RLS returns at least their own rows). */
export async function memberAccess(supabase: Db): Promise<{ ads: boolean; inbox: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ads: false, inbox: false };
  const { data } = await supabase.from("org_members").select("role").eq("user_id", user.id);
  const roles = (data ?? []).map((m) => m.role as string);
  return { ads: seesAds(roles), inbox: seesInbox(roles) };
}

/** Whether the signed-in user sees ads. */
export async function canSeeAds(supabase: Db): Promise<boolean> {
  return (await memberAccess(supabase)).ads;
}
