// Reel element analysis (reels/analysis-framework.md): fetch the cover image of every reel in a sample, read-only,
// through Instagram Business Discovery (the same lookup as the competitor study). Saved as <neutral id>.jpg so the
// covers can be coded blind. Measure them, then delete them: we keep numbers, never other creators' images.
//
//   npm run covers:fetch -- --org=lws-pune --sample=../analytics/elements/<date>/sample.json --covers=<dir>
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { admin, flags, need, run } from "./lib";

type Reel = { id: string; account: string; permalink: string };
const shortcode = (url: string) => url.match(/\/(?:reel|reels|p|tv)\/([^/?#]+)/)?.[1] ?? url;

run(async () => {
  const f = flags(), orgSlug = need(f, "org"), sample = JSON.parse(readFileSync(need(f, "sample"), "utf8")) as { reels: Reel[] };
  const dir = need(f, "covers");
  mkdirSync(dir, { recursive: true });
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: accts } = await db.from("connected_accounts").select("id, external_id").eq("org_id", org.id).eq("platform", "instagram").order("created_at");
  if (!accts?.length) throw new Error("No Instagram account connected.");
  const { data: token } = await db.rpc("get_account_token", { p_account: accts[0].id });
  const version = process.env.META_GRAPH_VERSION || "v24.0";

  for (const handle of [...new Set(sample.reels.map((r) => r.account))]) {
    const wanted = new Map(sample.reels.filter((r) => r.account === handle && !existsSync(path.join(dir, `${r.id}.jpg`))).map((r) => [shortcode(r.permalink), r]));
    let after = "", pages = 0, saved = 0;
    while (wanted.size && pages < 60) {
      const media = `media.limit(50)${after ? `.after(${after})` : ""}{permalink,media_type,thumbnail_url,media_url}`;
      const url = `https://graph.facebook.com/${version}/${accts[0].external_id}?fields=${encodeURIComponent(`business_discovery.username(${handle}){${media}}`)}&access_token=${token}`;
      const j = await (await fetch(url)).json();
      if (j.error) throw new Error(`@${handle}: Meta ${j.error.code}: ${j.error.message}`);
      const page = j.business_discovery?.media;
      pages++;
      for (const m of page?.data ?? []) {
        const r = wanted.get(shortcode(m.permalink)), img = m.thumbnail_url ?? m.media_url;
        if (!r || !img) continue;
        const res = await fetch(img);
        if (!res.ok) { console.log(`  ${r.id}: cover download ${res.status}, skipped`); continue; }
        writeFileSync(path.join(dir, `${r.id}.jpg`), Buffer.from(await res.arrayBuffer()));
        wanted.delete(shortcode(m.permalink)); saved++;
      }
      const next = page?.paging?.cursors?.after ?? "";        // Business Discovery gives a cursor but no "next" link
      if (!next || next === after || !page?.data?.length) break;
      after = next;
    }
    console.log(`@${handle}: ${saved} covers saved${wanted.size ? `, ${wanted.size} not found (${[...wanted.values()].map((r) => r.id).join(" ")})` : ""} · ${pages} pages`);
  }
});
