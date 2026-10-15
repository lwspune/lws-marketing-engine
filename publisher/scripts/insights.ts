// Refresh every reel's numbers on the org's Instagram account: updates the dashboard's Insights tab
// (same sync the nightly job runs) and writes a spreadsheet copy.
//
//   npm run insights -- --org=lws-pune
//
// Writes ../analytics/<handle>-reels-<YYYY-MM-DD>.csv (opens in Excel / Google Sheets): posted time
// (IST), views, reach, likes, comments, saves, shares, average watch time, link, caption start.
// Read-only on Instagram: uses the stored Page token's instagram_manage_insights permission.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { typicalReel } from "../src/lib/domain/metrics";
import { metaConfigFromEnv } from "../src/lib/platforms/meta";
import { syncInstagramAccount, toDbRow, type AccountMediaRow } from "../src/lib/insights/sync";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const orgSlug = need(flags(), "org");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: acct } = await db.from("connected_accounts").select("id, external_id, display_name").eq("org_id", org.id).eq("platform", "instagram").single();
  if (!acct) throw new Error("No Instagram account connected. Run npm run connect:meta first.");
  const { data: token } = await db.rpc("get_account_token", { p_account: acct.id });
  if (!token) throw new Error("Couldn't read the Instagram token.");

  console.log(`${acct.display_name}: reading every reel's numbers…`);
  let rows: AccountMediaRow[] = [];
  const s = await syncInstagramAccount({
    config: metaConfigFromEnv(), igUserId: acct.external_id, token: token as string,
    store: async (r) => {
      rows = r;
      const { error } = await db.rpc("upsert_account_media", { p_account: acct.id, p_rows: r.map(toDbRow) });
      if (error) throw new Error(`saving to the dashboard: ${error.message}`);
    },
  });

  const ist = (t: string) => new Date(new Date(t).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 16).replace("T", " ");
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const val = (x: number | null | undefined) => (x ?? "");
  const lines = ["posted_ist,views,reach,likes,comments,saves,shares,avg_watch_sec,permalink,caption"];
  for (const r of rows) {
    lines.push([ist(r.postedAt), val(r.metrics?.views), val(r.metrics?.reach), val(r.likes), val(r.comments), val(r.metrics?.saves),
      val(r.metrics?.shares), r.metrics?.avgWatchMs != null ? (r.metrics.avgWatchMs / 1000).toFixed(1) : "", r.permalink, q(r.caption)].join(","));
  }
  const handle = String(acct.display_name).replace(/[^a-z0-9]/gi, "").toLowerCase();
  const dir = path.resolve(process.cwd(), "..", "analytics");
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${handle}-reels-${new Date().toISOString().slice(0, 10)}.csv`);
  writeFileSync(out, "﻿" + lines.join("\n"), "utf8");

  const t = typicalReel(rows.filter((r) => r.metrics).map((r) => r.metrics!), new Date());
  console.log(`✓ ${s.withInsights}/${s.reels} reels with numbers (of ${s.media} posts) → dashboard Insights tab + ${out}`);
  console.log(`  typical reel now: ${t.views} views · ${t.saves} saves · ${(t.avgWatchMs / 1000).toFixed(1)} s watched (${t.note})`);
});
