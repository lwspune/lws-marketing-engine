import "server-only";
import { sourceLabel } from "@/lib/domain/leads";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LeadView {
  id: string; name: string | null; contact: string; course: string | null; lead_at: string; source: string;
  conversationId: string | null;
}

/** Every lead the signed-in user may see, newest first (RLS: owners only). Shared by the page and the download. */
export async function loadLeads(supabase: ReturnType<typeof createSupabaseServerClient>): Promise<LeadView[]> {
  const { data, error } = await supabase.from("leads")
    .select("id, name, contact, course, lead_at, channel, from_ad, conversation_id, connected_accounts(display_name)")
    .order("lead_at", { ascending: false }).limit(5000);
  if (error) throw new Error(`reading leads: ${error.message}`);
  return (data ?? []).map((l) => {
    const account = (l.connected_accounts as unknown as { display_name: string } | null)?.display_name ?? null;
    return {
      id: l.id, name: l.name, contact: l.contact, course: l.course, lead_at: l.lead_at, conversationId: l.conversation_id,
      source: sourceLabel({ channel: l.channel, account, fromAd: l.from_ad }),
    };
  });
}
