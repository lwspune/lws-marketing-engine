// Export other accounts' posts for the element analysis (reels/analysis-framework.md), read-only, through Instagram
// Business Discovery (the same lookup as covers:fetch). One CSV per account: ../analytics/competitors/<handle>-<date>.csv.
//
//   npm run competitors:export -- --org=lws-pune --handles=komal_reads,myeasytherapy [--metric=likes|views] [--days=365]
//
// --metric=likes (default) keeps reels, carousels and images, each against the account's median likes (Meta gives no
// views for other accounts' carousels). --metric=views keeps reels only, against median views, like the science study.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { competitorCsv, competitorRows, type CompetitorMetric, type DiscoveryMedia } from "../src/lib/domain/competitors";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags(), orgSlug = need(f, "org"), handles = need(f, "handles").split(",").map((h) => h.trim().replace(/^@/, ""));
  const metric = (f.metric || "likes") as CompetitorMetric;
  if (metric !== "likes" && metric !== "views") throw new Error("--metric must be likes or views.");
  const cutoff = Date.now() - Number(f.days || 365) * 86_400_000;
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: accts } = await db.from("connected_accounts").select("id, external_id").eq("org_id", org.id).eq("platform", "instagram").order("created_at");
  if (!accts?.length) throw new Error("No Instagram account connected.");
  const { data: token } = await db.rpc("get_account_token", { p_account: accts[0].id });
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const dir = path.resolve(process.cwd(), "..", "analytics", "competitors"), date = new Date().toISOString().slice(0, 10);
  mkdirSync(dir, { recursive: true });

  for (const handle of handles) {
    const media: DiscoveryMedia[] = [];
    let after = "", followers = 0, limit = 50, stopped = "";
    for (let pages = 0; pages < 60; pages++) {
      const fields = `timestamp,media_type,media_product_type,like_count,comments_count,view_count,permalink,caption,children{id}`;
      const q = `business_discovery.username(${handle}){followers_count,media.limit(${limit})${after ? `.after(${after})` : ""}{${fields}}}`;
      const res = await fetch(`https://graph.facebook.com/${version}/${accts[0].external_id}?fields=${encodeURIComponent(q)}&access_token=${token}`);
      const j = (await res.json()) as { error?: { message: string }; business_discovery?: { followers_count: number; media?: { data: DiscoveryMedia[]; paging?: { cursors?: { after?: string } } } } };
      // Long captions and 10-slide carousels make a page too big for Meta: ask again for fewer posts.
      if (j.error && /reduce the amount of data/i.test(j.error.message) && limit > 10) { limit = Math.max(10, Math.floor(limit / 2)); continue; }
      if (j.error) { stopped = j.error.message; break; }
      followers = j.business_discovery?.followers_count ?? 0;
      const page = j.business_discovery?.media;
      media.push(...(page?.data ?? []));
      after = page?.paging?.cursors?.after ?? "";
      if (!after || !page?.data.length || Date.parse(page.data[page.data.length - 1].timestamp) < cutoff) break;
    }
    const rows = competitorRows(media.filter((m) => Date.parse(m.timestamp) >= cutoff), metric);
    if (stopped) console.error(`✗ @${handle}: ${stopped}${rows.length ? ` (stopped early: ${rows.length} posts kept)` : ""}`);
    if (!rows.length) continue;
    const out = path.join(dir, `${handle}-${date}.csv`);
    writeFileSync(out, competitorCsv(rows), "utf8");
    const count = (t: string) => rows.filter((r) => r.type === t).length;
    console.log(`✓ @${handle} (${followers.toLocaleString("en-IN")} followers): ${rows.length} posts · ${count("REELS")} reels · ${count("CAROUSEL")} carousels · ${count("IMAGE")} images → ${path.relative(process.cwd(), out)}`);
  }
});
