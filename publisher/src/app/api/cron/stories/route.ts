import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCron } from "@/lib/publishing/cron";
import { runStoryPlanner, storyConfigFromEnv } from "@/lib/publishing/storyRun";

// Called Saturdays at 18:00 IST by Supabase pg_cron (migration 0007), same secret as the publisher
// tick: queues next Monday–Sunday's daily quiz Stories as Ready, for the founder to approve.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleCron(req, {
    secret: process.env.CRON_SECRET ?? "",
    tick: () => runStoryPlanner(createSupabaseAdminClient(), storyConfigFromEnv()),
  });
}
