// Export every reel on the org's Instagram account with its numbers, and print a short summary.
//
//   npm run insights -- --org=lws-pune
//
// Writes ../analytics/<handle>-reels-<YYYY-MM-DD>.csv (opens in Excel / Google Sheets): posted time
// (IST), views, reach, likes, comments, saves, shares, average watch time, link, caption start.
// Read-only: uses the stored Page token's instagram_manage_insights permission.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LWS_BASELINE, type PostMetrics } from "../src/lib/domain/metrics";
import { graphUrl, metaCall, metaConfigFromEnv } from "../src/lib/platforms/meta";
import { fetchInstagramInsights } from "../src/lib/platforms/metaInsights";
import { admin, flags, need, run } from "./lib";

interface Media { id: string; media_product_type: string; caption?: string; permalink: string; timestamp: string; like_count?: number; comments_count?: number }

run(async () => {
  const orgSlug = need(flags(), "org");
  const db = admin();
  const cfg = metaConfigFromEnv();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: acct } = await db.from("connected_accounts").select("id, external_id, display_name").eq("org_id", org.id).eq("platform", "instagram").single();
  if (!acct) throw new Error("No Instagram account connected. Run npm run connect:meta first.");
  const { data: token } = await db.rpc("get_account_token", { p_account: acct.id });
  if (!token) throw new Error("Couldn't read the Instagram token.");

  const media: Media[] = [];
  let after: string | undefined;
  do {
    const params: Record<string, string> = { fields: "id,media_product_type,caption,permalink,timestamp,like_count,comments_count", limit: "100", access_token: token as string };
    if (after) params.after = after;
    const page = await metaCall(graphUrl(cfg, `${acct.external_id}/media`), { method: "GET", params, token: token as string }) as { data: Media[]; paging?: { cursors?: { after?: string }; next?: string } };
    media.push(...page.data);
    after = page.paging?.next ? page.paging.cursors?.after : undefined;
  } while (after);
  const reels = media.filter((m) => m.media_product_type === "REELS");
  console.log(`${acct.display_name}: ${media.length} posts, ${reels.length} reels. Reading their numbers…`);

  const rows: (Media & { m: PostMetrics | null })[] = [];
  for (let i = 0; i < reels.length; i += 5) {
    const chunk = reels.slice(i, i + 5);
    const res = await Promise.all(chunk.map((r) => fetchInstagramInsights(cfg, { mediaId: r.id, kind: "reel", token: token as string })));
    chunk.forEach((r, j) => rows.push({ ...r, m: res[j].ok ? res[j].metrics : null }));
  }

  const ist = (t: string) => new Date(new Date(t).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 16).replace("T", " ");
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const val = (x: number | null | undefined) => (x ?? "");
  const lines = ["posted_ist,views,reach,likes,comments,saves,shares,avg_watch_sec,permalink,caption"];
  for (const r of rows) {
    lines.push([ist(r.timestamp), val(r.m?.views), val(r.m?.reach), val(r.like_count), val(r.comments_count), val(r.m?.saves), val(r.m?.shares),
      r.m?.avgWatchMs != null ? (r.m.avgWatchMs / 1000).toFixed(1) : "", r.permalink, q((r.caption ?? "").slice(0, 300))].join(","));
  }
  const handle = String(acct.display_name).replace(/[^a-z0-9]/gi, "").toLowerCase();
  const dir = path.resolve(process.cwd(), "..", "analytics");
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${handle}-reels-${new Date().toISOString().slice(0, 10)}.csv`);
  writeFileSync(out, "﻿" + lines.join("\n"), "utf8");

  const median = (pick: (r: (typeof rows)[number]) => number | null | undefined) => {
    const v = rows.map(pick).filter((x): x is number => typeof x === "number").sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : null;
  };
  const ok = rows.filter((r) => r.m).length;
  console.log(`✓ ${ok}/${rows.length} reels with numbers → ${out}`);
  console.log(`  typical reel now: ${median((r) => r.m?.views)} views · ${median((r) => r.m?.saves)} saves · ${((median((r) => r.m?.avgWatchMs) ?? 0) / 1000).toFixed(1)} s watched`);
  console.log(`  (dashboard baseline from ${LWS_BASELINE.measuredOn}: ${LWS_BASELINE.views} views · ${LWS_BASELINE.saves} save · ${(LWS_BASELINE.avgWatchMs / 1000).toFixed(1)} s)`);
});
