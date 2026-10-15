// Queue next Monday–Sunday's daily quiz Stories as Ready (same as the Saturday job).
//
//   npm run stories:plan
//   npm run stories:plan -- --cta=reply      (cards say "Reply QUIZ" instead of "link in bio")
//   npm run stories:plan -- --date=2026-10-19 (just that day: a first test, or a day whose card was rejected)
//
// Days already planned are skipped, so running it again is harmless.
import { runStoryPlanner, storyConfigFromEnv } from "../src/lib/publishing/storyRun";
import { admin, flags, run } from "./lib";

run(async () => {
  const f = flags();
  const cfg = storyConfigFromEnv();
  if (f.cta === "reply" || f.cta === "bio") cfg.cta = f.cta;
  if (f.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) throw new Error("--date must be YYYY-MM-DD.");
  const r = await runStoryPlanner(admin(), cfg, new Date(), f.date ? [f.date] : undefined);
  for (const d of r.planned) console.log(`✓ ${d} queued as Ready`);
  for (const d of r.skipped) console.log(`- ${d} already planned`);
  for (const x of r.failed) console.log(`✗ ${x.date}: ${x.error}`);
  if (r.failed.length) process.exitCode = 1;
});
