// Fill the Leads list from chats already in the Inbox (the hourly job only gets through a batch at a time).
//
//   npm run leads:screen -- --org=lws-pune
//   npm run leads:screen -- --org=lws-pune --whatsapp-out=chats.json   # save waiting WhatsApp chats to sort by hand
//   npm run leads:screen -- --org=lws-pune --whatsapp-in=verdicts.json  # record those verdicts
//
// Same rules as /api/cron/leads (src/lib/leads/screen.ts): Instagram chats where the person shared a phone number or
// email; WhatsApp chats judged genuine. Claude judges them when ANTHROPIC_API_KEY is in .env.local. Without a key,
// --whatsapp-out writes the chats (phone numbers and emails removed) for someone to sort, and --whatsapp-in reads
// {"chats":[{"id","genuine","reason","name","course"}]} back in. Runs batch after batch until nothing new is left.
import { readFileSync, writeFileSync } from "node:fs";
import { transcript } from "../src/lib/domain/leads";
import { leadsStore } from "../src/lib/leads/store";
import { screenLeads, LIMITS } from "../src/lib/leads/screen";
import { admin, flags, need, run } from "./lib";

const ALL = 500;

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const store = leadsStore(db, { apiKey: process.env.ANTHROPIC_API_KEY, orgId: org.id });

  if (f["whatsapp-out"]) {
    const chats = await store.candidates("whatsapp", ALL);
    const msgs = await store.messages(chats.map((c) => c.conversationId));
    writeFileSync(f["whatsapp-out"], JSON.stringify(chats.map((c) => ({
      id: c.conversationId, whatsappName: c.contactName, transcript: transcript(msgs.get(c.conversationId) ?? []),
    })), null, 1));
    console.log(`✓ ${chats.length} WhatsApp chats waiting → ${f["whatsapp-out"]}`);
    return;
  }
  const limits = { ...LIMITS };
  if (f["whatsapp-in"]) {
    const verdicts = JSON.parse(readFileSync(f["whatsapp-in"], "utf8")) as unknown;
    store.ask = async () => verdicts;
    limits.whatsapp = ALL;
  } else if (!store.ask) {
    console.log("No ANTHROPIC_API_KEY in .env.local: checking Instagram only (sort WhatsApp with --whatsapp-out / --whatsapp-in).");
  }

  const total = { instagram: 0, whatsapp: 0, leads: 0 };
  for (;;) {
    const r = await screenLeads(store, limits);
    const wa = "checked" in r.whatsapp ? r.whatsapp : { checked: 0, leads: 0 };
    total.instagram += r.instagram.checked;
    total.whatsapp += wa.checked;
    total.leads += r.instagram.leads + wa.leads;
    console.log(`  Instagram ${r.instagram.checked} checked, ${r.instagram.leads} leads · WhatsApp ${"checked" in r.whatsapp
      ? `${wa.checked} checked, ${wa.leads} leads` : "error" in r.whatsapp ? `failed: ${r.whatsapp.error}` : "skipped"}`);
    if ("error" in r.whatsapp) throw new Error(r.whatsapp.error);
    if (r.instagram.checked + wa.checked === 0) break;
  }
  console.log(`✓ ${total.instagram} Instagram and ${total.whatsapp} WhatsApp chats checked, ${total.leads} leads added.`);
});
