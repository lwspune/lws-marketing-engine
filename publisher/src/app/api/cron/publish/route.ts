import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { supabaseRepo } from "@/lib/publishing/supabaseRepo";
import { runTick } from "@/lib/publishing/worker";
import { metaConfigFromEnv } from "@/lib/platforms/meta";

// Called every minute by Supabase pg_cron (migration 0003) with `Authorization: Bearer <CRON_SECRET>`.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: () => runTick({ repo: supabaseRepo(createSupabaseAdminClient()), metaConfig: metaConfigFromEnv() }),
  });
}
