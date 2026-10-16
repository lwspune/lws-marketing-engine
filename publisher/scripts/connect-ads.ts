// Connect a Meta ad account, so the dashboard can read ad results and create ads (paused until Launch).
//
//   npm run connect:ads -- --org=lws-pune --account=570714718754453
//
// Token: a SYSTEM USER token (Business settings → Users → System users → Generate new token, for
// the publisher's Meta app) with ads_read, ads_management, business_management, pages_show_list,
// pages_read_engagement. The system user needs the ad account (Manage campaigns), the Page and the
// Instagram account assigned to it; only ad accounts in the business portfolio can be assigned. System user tokens don't expire. Never pass it on the command line (it would
// end up in shell history); it's asked for here and stored encrypted in Supabase Vault.
import { createInterface } from "node:readline/promises";
import { metaConfigFromEnv, metaCall, graphUrl } from "../src/lib/platforms/meta";
import { fetchAdAccount } from "../src/lib/platforms/metaAds";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const actId = `act_${need(f, "account").replace(/^act_/, "")}`;
  if (!/^act_\d{5,30}$/.test(actId)) throw new Error("--account should be the ad account number, e.g. 570714718754453.");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const token = (await rl.question("Paste the System User access token: ")).trim();
  rl.close();
  if (token.length < 20) throw new Error("That doesn't look like an access token.");

  const cfg = metaConfigFromEnv();
  const account = await fetchAdAccount(cfg, { actId, token });
  console.log(`✓ ad account ${account.name} (${account.id}) · ${account.currency} · time zone ${account.timezoneName}`);
  if (account.currency !== "INR") throw new Error(`This account bills in ${account.currency}; the dashboard's budgets are in rupees.`);
  if (account.accountStatus !== 1) console.log(`! Meta reports account status ${account.accountStatus} (1 = active). Ads may not run until it's fixed in Ads Manager.`);
  await metaCall(graphUrl(cfg, `${actId}/campaigns`), { method: "GET", params: { fields: "id", limit: "1", access_token: token }, token });
  console.log("✓ the token can read campaigns (ads_read)");

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}". Run npm run seed first.`);
  const { error } = await db.rpc("upsert_connected_account", {
    p_org: org.id, p_platform: "meta_ads", p_external_id: actId, p_display_name: account.name || actId, p_token: token, p_expires_at: null,
  });
  if (error) throw new Error(`saving the ad account: ${error.message}`);
  console.log("✓ connected. Results appear on the Insights tab after the next refresh (or run npm run insights).");
});
