import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { syncDueAccounts } from "@/lib/insights/run";
import { metaConfigFromEnv } from "@/lib/platforms/meta";

// Called daily at 03:00 IST by Supabase pg_cron (migration 0005), same secret as the publisher tick.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: () => syncDueAccounts(createSupabaseAdminClient(), metaConfigFromEnv()),
  });
}
