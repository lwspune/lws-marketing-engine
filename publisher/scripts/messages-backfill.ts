// Pull each Instagram account's existing DMs into the Inbox, once (new ones arrive by webhook).
//
//   npm run messages:backfill -- --org=lws-pune --accounts=@lws.pune,@pyqvault_ [--max=200]
//
// Only the accounts named in --accounts are read: an outside brand's DMs (e.g. Sound Mind) are never pulled
// unless someone names it, after the brand owner agreed.
// Meta returns about the last 20 messages of each chat, newest chats first; --max caps the number of chats per
// account. Safe to re-run: messages already stored are skipped. Needs instagram_manage_messages on the Page token
// (re-run npm run connect:meta after adding it). How an old chat started isn't known, so it counts as direct.
import { metaConfigFromEnv } from "../src/lib/platforms/meta";
import { fetchInstagramConversations } from "../src/lib/platforms/metaMessages";
import { fillProfiles, ingestRows } from "../src/lib/inbox/store";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), max = Number(f.max ?? 200);
  const wanted = need(f, "accounts").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!Number.isInteger(max) || max < 1 || max > 2000) throw new Error("--max must be a whole number from 1 to 2000.");
  const db = admin(), cfg = metaConfigFromEnv();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data: accounts } = await db.from("connected_accounts").select("id, external_id, display_name")
    .eq("org_id", org.id).eq("platform", "instagram").order("created_at");
  if (!accounts?.length) throw new Error("No Instagram account connected. Run npm run connect:meta first.");
  const unknown = wanted.filter((w) => !accounts.some((a) => a.display_name.toLowerCase() === w));
  if (unknown.length) throw new Error(`Not connected: ${unknown.join(", ")}. Connected: ${accounts.map((a) => a.display_name).join(", ")}`);

  for (const a of accounts.filter((x) => wanted.includes(x.display_name.toLowerCase()))) {
    const { data: token } = await db.rpc("get_account_token", { p_account: a.id });
    if (!token) throw new Error(`Couldn't read the token for ${a.display_name}.`);
    process.stdout.write(`${a.display_name}: reading chats… `);
    let got;
    try {
      got = await fetchInstagramConversations(cfg, { token: token as string, igUserId: a.external_id, maxConversations: max });
    } catch (e) {
      console.log(`skipped (${(e as Error).message})`);
      continue;
    }
    const needs = await ingestRows(db, "instagram", a.external_id, got.rows);
    // The list already carried most usernames; look up the rest one by one.
    const rest = [];
    for (const n of needs) {
      const username = got.usernames[n.contactId];
      if (!username) { rest.push(n); continue; }
      const { error } = await db.rpc("set_contact_profile", { p_conversation: n.conversationId, p_name: "", p_username: username });
      if (error) throw new Error(`set_contact_profile: ${error.message}`);
    }
    await fillProfiles(db, cfg, rest);
    console.log(`${new Set(got.rows.map((r) => r.contact_id)).size} chats, ${got.rows.length} messages`);
  }
  console.log("✓ done. Open the Inbox tab.");
});
