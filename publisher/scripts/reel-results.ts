// Export a project's reel results for the reels' learnings log and virality predictor (founder, 2026-10-22):
// each published Instagram reel's write-once 48 h and 7 d readings and its latest numbers, keyed by post slug.
//
//   npm run results -- --org=lws-pune --project=pyqvault-insta
//
// Read-only on the database. Writes ../analytics/reel-results-<project>.json (git-ignored); then, from the repo root,
// `node reels/tools/results-sync.js` copies the numbers into reels/pyqvault-learnings.md. Run `npm run insights` first
// so the latest numbers are fresh.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { reelResults } from "../src/lib/domain/reelResults";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags(), orgSlug = need(f, "org"), projectSlug = need(f, "project");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", projectSlug).single();
  if (!project) throw new Error(`No project "${projectSlug}" in ${orgSlug}.`);

  const fail = (what: string, e: { message: string } | null) => { if (e) throw new Error(`Couldn't read ${what}: ${e.message}`); };
  const { data: posts, error: e1 } = await db.from("posts").select("id, slug, title, kind").eq("project_id", project.id);
  fail("posts", e1);
  const ids = (posts ?? []).map((p) => p.id);
  const { data: publications, error: e2 } = await db.from("publications")
    .select("id, post_id, platform, status, external_id, permalink, published_at").in("post_id", ids.length ? ids : ["-"]);
  fail("publications", e2);
  const pubIds = (publications ?? []).map((u) => u.id);
  const { data: metrics, error: e3 } = await db.from("publication_metrics")
    .select("publication_id, snapshot, views, avg_watch_ms, reach, saves, shares, comments, error").in("publication_id", pubIds.length ? pubIds : ["-"]);
  fail("metrics", e3);
  const ext = (publications ?? []).map((u) => u.external_id).filter(Boolean) as string[];
  const { data: media, error: e4 } = await db.from("account_media")
    .select("external_id, views, avg_watch_ms, reach, saves, shares, comments").eq("org_id", org.id).in("external_id", ext.length ? ext : ["-"]);
  fail("account media", e4);

  const rows = reelResults({ posts: posts ?? [], publications: publications ?? [], metrics: metrics ?? [], media: media ?? [] }, new Date());
  const dir = path.resolve(process.cwd(), "..", "analytics");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `reel-results-${projectSlug}.json`);
  writeFileSync(file, JSON.stringify({ exportedAt: new Date().toISOString(), project: projectSlug, reels: rows }, null, 2));
  const with48 = rows.filter((r) => r.h48).length;
  console.log(`✓ ${rows.length} published reels (${with48} with a 48 h reading) → ${file}`);
});
