import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { leadsStore } from "@/lib/leads/store";
import { screenLeads } from "@/lib/leads/screen";
import { syncLeadSheets } from "@/lib/leads/sheets";
import { sheetsStore } from "@/lib/leads/sheetsStore";

// Called every hour at :15 by Supabase pg_cron (migration 0016), same secret as the publisher tick. WhatsApp chats
// are sorted only when ANTHROPIC_API_KEY is set on the server; the website's lead sheets (0026) are read only when
// GOOGLE_SHEETS_KEY is.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: async () => {
      const db = createSupabaseAdminClient();
      const key = process.env.GOOGLE_SHEETS_KEY;
      const sheets = key ? await syncLeadSheets(sheetsStore(db, key)) : { skipped: "no_key" };
      return { ...(await screenLeads(leadsStore(db, { apiKey: process.env.ANTHROPIC_API_KEY }))), sheets };
    },
  });
}
