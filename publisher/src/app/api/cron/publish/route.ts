import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { supabaseMetricsRepo, supabaseRepo } from "@/lib/publishing/supabaseRepo";
import { runTick } from "@/lib/publishing/worker";
import { runMetricsTick } from "@/lib/publishing/metrics";
import { metaConfigFromEnv } from "@/lib/platforms/meta";

// Called every minute by Supabase pg_cron (migrations 0003/0004) with `Authorization: Bearer <CRON_SECRET>`.
// One tick = publish what's due, then take any scorecard snapshots that are due.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: async () => {
      const db = createSupabaseAdminClient();
      const metaConfig = metaConfigFromEnv();
      const publishing = await runTick({ repo: supabaseRepo(db), metaConfig });
      const metrics = await runMetricsTick({ repo: supabaseMetricsRepo(db), metaConfig });
      return { ...publishing, metrics };
    },
  });
}
