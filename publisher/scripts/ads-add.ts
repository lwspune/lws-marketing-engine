// Put a ready-made ad on the dashboard's Ads tab, waiting for Approve.
//
//   npm run ads:add -- --org=lws-pune ../reels/spi-mock-parents.ad.json [more.ad.json …]
//   npm run ads:add -- --org=lws-pune --replace ../reels/spi-mock-parents.ad.json
//
// Each .ad.json sits next to its poster (see src/lib/domain/ads.ts for the fields). The file is
// checked first (budget ≤ ₹1,000/day, 1–30 days, texts, audience); the poster goes to the private
// `media` bucket under <org_id>/ads/<draft_id>/. Nothing touches Meta here: that happens only when
// a member presses Approve, and it stays paused until they press Launch. A slug already on the tab
// is skipped, unless --replace is given AND it's still ready (not yet approved).
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseAdSpec } from "../src/lib/domain/ads";
import { admin, flags, need, run } from "./lib";

const TYPE: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const replace = "replace" in f;
  const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!files.length) throw new Error("Give at least one .ad.json file.");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: account } = await db.from("connected_accounts").select("id").eq("org_id", org.id).eq("platform", "meta_ads").maybeSingle();
  if (!account) throw new Error("No ad account connected. Run npm run connect:ads first.");

  for (const file of files) {
    const dir = path.dirname(path.resolve(file));
    const s = parseAdSpec(JSON.parse(readFileSync(file, "utf8")));
    const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", s.project).single();
    if (!project) throw new Error(`${s.slug}: no project "${s.project}" in ${orgSlug}.`);
    const poster = readFileSync(path.join(dir, s.image));
    const row = {
      title: s.title, spec: s, daily_budget_minor: s.dailyBudgetInr * 100,
      start_at: new Date(s.start).toISOString(), end_at: new Date(s.end).toISOString(),
    };
    const { data: existing } = await db.from("ad_drafts").select("id, status").eq("project_id", project.id).eq("slug", s.slug).maybeSingle();

    if (existing && !(replace && existing.status === "ready")) {
      console.log(`- ${s.slug}: already on the Ads tab (${existing.status}), skipped${replace ? " (only a ready ad can be replaced)" : ""}`);
      continue;
    }
    if (existing) {
      const key = `${org.id}/ads/${existing.id}/${s.image}`;
      const { error: up } = await db.storage.from("media").upload(key, poster, { contentType: TYPE[path.extname(s.image).toLowerCase()], upsert: true });
      if (up) throw new Error(`${s.slug}: uploading ${s.image}: ${up.message}`);
      const { error } = await db.from("ad_drafts").update({ ...row, image_path: key }).eq("id", existing.id).eq("status", "ready");
      if (error) throw new Error(`${s.slug}: updating the ad: ${error.message}`);
      console.log(`✓ ${s.slug} replaced with the new version, still waiting for Approve`);
      continue;
    }

    const id = randomUUID();
    const key = `${org.id}/ads/${id}/${s.image}`;
    const { error: up } = await db.storage.from("media").upload(key, poster, { contentType: TYPE[path.extname(s.image).toLowerCase()], upsert: false });
    if (up) throw new Error(`${s.slug}: uploading ${s.image}: ${up.message}`);
    const { error } = await db.from("ad_drafts").insert({
      id, org_id: org.id, project_id: project.id, account_id: account.id, slug: s.slug, image_path: key, ...row,
    });
    if (error) {
      await db.storage.from("media").remove([key]);
      throw new Error(`${s.slug}: saving the ad: ${error.message}`);
    }
    console.log(`✓ ${s.slug} is on the Ads tab: ₹${s.dailyBudgetInr}/day, waiting for Approve`);
  }
});
