// Connect a Facebook Page and its linked Instagram account, and route projects to them.
//
//   npm run connect:meta -- --org=lws-pune --projects=pyq-vault,lws-coaching [--page="LWS Pune"]
//
// Permissions on the token: pages_show_list, pages_read_engagement, pages_manage_posts,
// instagram_basic, instagram_content_publish, business_management, and the read-only statistics
// pair instagram_manage_insights + read_insights. Re-running only refreshes the stored tokens.
// For the Inbox (owners only, migration 0012) also grant instagram_manage_messages, pages_manage_metadata and
// pages_messaging: the script then subscribes the Page to the app's webhooks so new DMs reach /api/webhooks/meta.
// Without Advanced Access Meta refuses the `messages` subscription unless pages_messaging (from the app's Messenger
// use case) is granted too (found 2026-10-19).
//
// It asks for a short-lived USER token from Graph API Explorer (never pass tokens on the command
// line; they end up in shell history), swaps it for a long-lived one, then reads the Page's own
// token. A Page token minted from a long-lived user token does not expire. Tokens are stored
// encrypted in Supabase Vault; only the worker can read them.
import { createInterface } from "node:readline/promises";
import { admin, flags, need, run } from "./lib";

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v24.0"}`;

async function graph(path: string, params: Record<string, string>) {
  const res = await fetch(`${GRAPH}/${path}?${new URLSearchParams(params)}`);
  const json = (await res.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(`Meta: ${json.error?.message ?? res.statusText}`);
  return json;
}

interface PageRow { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string } }

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const projectSlugs = need(f, "projects").split(",").map((s) => s.trim()).filter(Boolean);
  const appId = process.env.META_APP_ID, appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Set META_APP_ID and META_APP_SECRET in .env.local first.");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const shortToken = (await rl.question("Paste the user access token from Graph API Explorer: ")).trim();
  rl.close();
  if (shortToken.length < 20) throw new Error("That doesn't look like an access token.");

  const long = await graph("oauth/access_token", {
    grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken,
  });
  const userToken = String(long.access_token);
  console.log("✓ exchanged for a long-lived token");

  const pages = (await graph("me/accounts", {
    fields: "id,name,access_token,instagram_business_account{id,username}", access_token: userToken, limit: "100",
  })).data as PageRow[];
  if (!pages?.length) throw new Error("No Facebook Pages found. Did you tick the Page when granting access?");
  const page = f.page ? pages.find((p) => p.name.toLowerCase() === f.page.toLowerCase()) : pages.length === 1 ? pages[0] : undefined;
  if (!page) throw new Error(`Choose a page with --page="…". Found: ${pages.map((p) => p.name).join(", ")}`);
  console.log(`✓ page ${page.name} (${page.id})`);

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}". Run npm run seed first.`);

  const accounts: { platform: "facebook" | "instagram"; id: string }[] = [];
  const { data: fbId, error: fbErr } = await db.rpc("upsert_connected_account", {
    p_org: org.id, p_platform: "facebook", p_external_id: page.id, p_display_name: page.name, p_token: page.access_token, p_expires_at: null,
  });
  if (fbErr) throw new Error(`saving the Facebook Page: ${fbErr.message}`);
  accounts.push({ platform: "facebook", id: fbId as string });
  console.log("✓ Facebook Page connected");

  const ig = page.instagram_business_account;
  if (ig) {
    const { data: igId, error: igErr } = await db.rpc("upsert_connected_account", {
      p_org: org.id, p_platform: "instagram", p_external_id: ig.id, p_display_name: ig.username ? `@${ig.username}` : ig.id,
      p_token: page.access_token, p_expires_at: null,
    });
    if (igErr) throw new Error(`saving the Instagram account: ${igErr.message}`);
    accounts.push({ platform: "instagram", id: igId as string });
    console.log(`✓ Instagram ${ig.username ? `@${ig.username}` : ig.id} connected`);
  } else {
    console.log("! This Page has no linked Instagram professional account; only Facebook was connected.");
  }

  // Inbox: only when the messaging permission was granted (otherwise DMs stay out of GoPost).
  const perms = (await graph("me/permissions", { access_token: userToken })).data as { permission: string; status: string }[];
  const granted = (name: string) => perms?.some((p) => p.permission === name && p.status === "granted");
  const inboxPerms = ["instagram_manage_messages", "pages_manage_metadata", "pages_messaging"];
  if (ig && inboxPerms.every(granted)) {
    const res = await fetch(`${GRAPH}/${page.id}/subscribed_apps`, {
      method: "POST", body: new URLSearchParams({ subscribed_fields: "messages", access_token: page.access_token }),
    });
    const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
    if (!res.ok || !json.success) console.log(`! Couldn't subscribe the Page to DMs: ${json.error?.message ?? res.statusText}`);
    else console.log("✓ Inbox: new Instagram DMs will reach GoPost (run npm run messages:backfill for old ones)");
  } else if (ig) {
    console.log(`· Inbox off: grant ${inboxPerms.filter((p) => !granted(p)).join(" + ")} to pull DMs (SETUP.md → Inbox)`);
  }

  for (const slug of projectSlugs) {
    const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", slug).single();
    if (!project) throw new Error(`No project "${slug}" in ${orgSlug}.`);
    for (const a of accounts) {
      const { error } = await db.rpc("set_project_channel", { p_project: project.id, p_platform: a.platform, p_account: a.id });
      if (error) throw new Error(`routing ${slug} → ${a.platform}: ${error.message}`);
    }
    console.log(`✓ ${slug} now posts to ${accounts.map((a) => a.platform).join(" + ")}`);
  }
});
