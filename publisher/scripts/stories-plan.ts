// Queue next Monday–Sunday's daily quiz Stories as Ready (same as the Saturday job).
//
//   npm run stories:plan
//   npm run stories:plan -- --cta=reply      (cards say "Reply QUIZ" instead of "link in bio")
//
// Days already planned are skipped, so running it again is harmless.
import { runStoryPlanner, storyConfigFromEnv } from "../src/lib/publishing/storyRun";
import { admin, flags, run } from "./lib";

run(async () => {
  const f = flags();
  const cfg = storyConfigFromEnv();
  if (f.cta === "reply" || f.cta === "bio") cfg.cta = f.cta;
  const r = await runStoryPlanner(admin(), cfg);
  for (const d of r.planned) console.log(`✓ ${d} queued as Ready`);
  for (const d of r.skipped) console.log(`- ${d} already planned`);
  for (const x of r.failed) console.log(`✗ ${x.date}: ${x.error}`);
  if (r.failed.length) process.exitCode = 1;
});
