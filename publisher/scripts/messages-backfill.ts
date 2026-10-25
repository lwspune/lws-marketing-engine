// Pull Instagram accounts' and Facebook Pages' existing chats into the Inbox, once (new ones arrive by webhook).
//
//   npm run messages:backfill -- --org=lws-pune --accounts=@lws.pune,@pyqvault_ [--pages="LWS Pune"] [--max=200]
//
// Only the accounts and Pages named are read: an outside brand's messages (e.g. Sound Mind) are never pulled unless
// someone names it, after the brand owner agreed. Naming a Page also switches its inbox on (migration 0025), so its new
// Messenger messages are stored from then on; until then the webhook stores nothing for it.
// Meta returns about the last 20 messages of each chat, newest chats first; --max caps the number of chats per
// account. Safe to re-run: messages already stored are skipped. Needs instagram_manage_messages / pages_messaging on the
// Page token (re-run npm run connect:meta after adding it). How an old chat started isn't known, so it counts as direct.
import { metaConfigFromEnv } from "../src/lib/platforms/meta";
import { fetchConversations } from "../src/lib/platforms/metaMessages";
import { fillProfiles, ingestRows } from "../src/lib/inbox/store";
import { admin, flags, need, run } from "./lib";

const list = (s: string | undefined) => (s ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), max = Number(f.max ?? 200);
  const wantedIg = list(f.accounts), wantedPages = list(f.pages);
  if (!wantedIg.length && !wantedPages.length) throw new Error('Name what to read: --accounts=@lws.pune and/or --pages="LWS Pune".');
  if (!Number.isInteger(max) || max < 1 || max > 2000) throw new Error("--max must be a whole number from 1 to 2000.");
  const db = admin(), cfg = metaConfigFromEnv();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: accounts } = await db.from("connected_accounts").select("id, platform, external_id, display_name")
    .eq("org_id", org.id).in("platform", ["instagram", "facebook"]).order("created_at");
  const pick = (platform: string, wanted: string[], what: string) => {
    const have = (accounts ?? []).filter((a) => a.platform === platform);
    const unknown = wanted.filter((w) => !have.some((a) => a.display_name.toLowerCase() === w));
    if (unknown.length) throw new Error(`${what} not connected: ${unknown.join(", ")}. Connected: ${have.map((a) => a.display_name).join(", ") || "none"}`);
    return have.filter((a) => wanted.includes(a.display_name.toLowerCase()));
  };
  const chosen = [...pick("instagram", wantedIg, "Instagram account"), ...pick("facebook", wantedPages, "Facebook Page")];

  for (const a of chosen) {
    const page = a.platform === "facebook", label = page ? `Facebook ${a.display_name}` : a.display_name;
    const { data: token } = await db.rpc("get_account_token", { p_account: a.id });
    if (!token) throw new Error(`Couldn't read the token for ${label}.`);
    if (page) {
      const { error } = await db.rpc("set_account_inbox", { p_account: a.id, p_on: true });
      if (error) throw new Error(`set_account_inbox: ${error.message}`);
    }
    process.stdout.write(`${label}: reading chats… `);
    let got;
    try {
      got = await fetchConversations(cfg, { platform: page ? "messenger" : "instagram", token: token as string, ownId: a.external_id, maxConversations: max });
    } catch (e) {
      console.log(`skipped (${(e as Error).message})`);
      continue;
    }
    const needs = await ingestRows(db, page ? "facebook" : "instagram", a.external_id, got.rows);
    // The list already carried most names (Messenger) or usernames (Instagram); look up the rest one by one.
    const rest = [];
    for (const n of needs) {
      const name = got.names[n.contactId] ?? "", username = got.usernames[n.contactId] ?? "";
      if (!name && !username) { rest.push({ ...n, platform: page ? "facebook" as const : "instagram" as const }); continue; }
      const { error } = await db.rpc("set_contact_profile", { p_conversation: n.conversationId, p_name: name, p_username: username });
      if (error) throw new Error(`set_contact_profile: ${error.message}`);
    }
    await fillProfiles(db, cfg, rest);
    console.log(`${new Set(got.rows.map((r) => r.contact_id)).size} chats, ${got.rows.length} messages${page ? " (inbox on: new messages arrive too)" : ""}`);
  }
  console.log("✓ done. Open the Inbox tab.");
});
