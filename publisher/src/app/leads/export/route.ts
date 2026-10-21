import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { handleLeadExport } from "@/lib/leads/export";
import { lastDownload, loadLeads } from "../data";

// "Download for Excel" on the Leads page: all leads, or those added since your last download (owners only; the rules
// are in src/lib/leads/export.ts). A POST from the page's form, because each download moves your download point.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  return handleLeadExport(req, {
    isOwner: async () => (await memberAccess(supabase)).inbox,
    lastDownload: () => lastDownload(supabase),
    load: (window) => loadLeads(supabase, window),
    record: async ({ kind, count, since, at }) => {
      const { error } = await supabase.rpc("record_lead_download", { p_kind: kind, p_count: count, p_since: since, p_at: at });
      if (error) throw new Error(`record_lead_download: ${error.message}`);
    },
    now: () => new Date(),
  });
}
