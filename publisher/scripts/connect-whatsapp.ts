// Connect a WhatsApp API number to the Inbox (owners only, migrations 0012/0013).
//
//   npm run connect:whatsapp -- --org=lws-pune --number=7620699213
//
// It asks for a SYSTEM USER token (Business Settings → System users → Digi Publisher → Generate token, with
// whatsapp_business_management + whatsapp_business_messaging + business_management, never expiring) after the
// WhatsApp account was assigned to that system user. Never pass tokens on the command line.
//
// It finds the number's WhatsApp account and phone number id, stores the token encrypted in Supabase Vault, and
// subscribes this Meta app to the account's webhooks. Other apps on the same number (WABridge, which sends the
// attendance messages) keep their own subscription: nothing is moved or re-registered. Re-running is safe.
import { createInterface } from "node:readline/promises";
import { metaConfigFromEnv } from "../src/lib/platforms/meta";
import { findWhatsAppNumber, subscribeAppToWaba } from "../src/lib/platforms/metaMessages";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), number = need(f, "number");
  const appId = process.env.META_APP_ID, appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Set META_APP_ID and META_APP_SECRET in .env.local first.");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const token = (await rl.question("Paste the system user token: ")).trim();
  rl.close();
  if (token.length < 20) throw new Error("That doesn't look like an access token.");

  const cfg = metaConfigFromEnv();
  const n = await findWhatsAppNumber(cfg, { token, appToken: `${appId}|${appSecret}`, number });
  console.log(`✓ found ${n.displayPhoneNumber} (${n.verifiedName}) in WhatsApp account ${n.wabaId}`);

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { error } = await db.rpc("upsert_connected_account", {
    p_org: org.id, p_platform: "whatsapp", p_external_id: n.phoneNumberId, p_display_name: n.displayPhoneNumber, p_token: token, p_expires_at: null,
  });
  if (error) throw new Error(`saving the WhatsApp number: ${error.message}`);
  console.log("✓ number saved (token encrypted in Supabase Vault)");

  await subscribeAppToWaba(cfg, { token, wabaId: n.wabaId });
  console.log("✓ Inbox: WhatsApp messages to this number will reach GoPost (WABridge keeps working)");
});
