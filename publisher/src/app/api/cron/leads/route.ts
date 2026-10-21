import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { leadsStore } from "@/lib/leads/store";
import { screenLeads } from "@/lib/leads/screen";

// Called every hour at :15 by Supabase pg_cron (migration 0016), same secret as the publisher tick. WhatsApp chats
// are sorted only when ANTHROPIC_API_KEY is set on the server.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: () => screenLeads(leadsStore(createSupabaseAdminClient(), { apiKey: process.env.ANTHROPIC_API_KEY })),
  });
}
