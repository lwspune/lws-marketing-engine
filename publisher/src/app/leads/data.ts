import "server-only";
import { sourceLabel } from "@/lib/domain/leads";
import { allRows } from "@/lib/supabase/pages";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type Db = ReturnType<typeof createSupabaseServerClient>;

export interface LeadView {
  id: string; name: string | null; contact: string; course: string | null; class_level: string | null; lead_at: string; source: string;
  conversationId: string | null; created_at: string;
}

/**
 * Every lead the signed-in user may see, newest first (RLS: owners only). Shared by the page and the download, which
 * passes a window: added after `since` (null: from the start) and up to `until` (migration 0020).
 */
export async function loadLeads(supabase: Db, window?: { since: string | null; until: string }): Promise<LeadView[]> {
  // Page by page: Supabase returns at most 1,000 rows per request. id breaks ties so no lead is skipped or repeated.
  const rows = await allRows((from, to) => {
    let query = supabase.from("leads")
      .select("id, name, contact, course, class_level, lead_at, created_at, channel, from_ad, page, conversation_id, connected_accounts(display_name)");
    if (window) {
      query = query.lte("created_at", window.until);
      if (window.since) query = query.gt("created_at", window.since);
    }
    return query.order("lead_at", { ascending: false }).order("id").range(from, to);
  }).catch((e: Error) => { throw new Error(`reading leads: ${e.message}`); });
  return rows.map((l) => {
    const account = (l.connected_accounts as unknown as { display_name: string } | null)?.display_name ?? null;
    return {
      id: l.id, name: l.name, contact: l.contact, course: l.course, class_level: l.class_level, lead_at: l.lead_at, created_at: l.created_at,
      conversationId: l.conversation_id, source: sourceLabel({ channel: l.channel, account, fromAd: l.from_ad, page: l.page }),
    };
  });
}

/** The signed-in user's download point: when their last download was read up to, or null before the first. */
export async function lastDownload(supabase: Db): Promise<string | null> {
  const { data, error } = await supabase.from("lead_downloads").select("downloaded_at")
    .order("downloaded_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`reading downloads: ${error.message}`);
  return (data?.downloaded_at as string | undefined) ?? null;
}
