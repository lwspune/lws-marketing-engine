import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { leadDate, leadsCsv } from "@/lib/domain/leads";
import { fail } from "@/lib/publishing/result";
import { loadLeads } from "../data";

// "Download for Excel" on the Leads page: every lead as a CSV (owners only).
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!(await memberAccess(supabase)).inbox) return Response.json(fail("forbidden", "Only owners can download leads."), { status: 403 });
  let leads;
  try {
    leads = await loadLeads(supabase);
  } catch (e) {
    console.error("leads: export failed", { error: (e as Error).message });
    return Response.json(fail("unexpected", "Couldn't read the leads. Try again."), { status: 500 });
  }
  return new Response(leadsCsv(leads), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${leadDate(new Date().toISOString())}.csv"`,
      "cache-control": "no-store",
    },
  });
}
