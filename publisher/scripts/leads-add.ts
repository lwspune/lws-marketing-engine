// Add leads from chats GoPost can't see, after the founder approves each one (migration 0018).
//
//   npm run leads:add -- --org=lws-pune --channel=whatsapp --via="+91 91563 10546" --file=leads.json
//
// leads.json: [{ "phone", "date" (ISO), "name"?, "course"?, "from_ad"?, "reason"? }], written in a Claude Code chat
// after reading those chats (e.g. WhatsApp Web, read-only). Every number must be usable, or nothing is added.
// Numbers that are already a lead from any channel are skipped.
import { readFileSync } from "node:fs";
import { findContact } from "../src/lib/domain/leads";
import { admin, flags, need, run } from "./lib";

interface Row { phone: string; date: string; name?: string; course?: string; from_ad?: boolean; reason?: string }

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), channel = need(f, "channel"), via = need(f, "via");
  const rows = JSON.parse(readFileSync(need(f, "file"), "utf8")) as Row[];
  if (!Array.isArray(rows) || !rows.length) throw new Error("The file must hold a list of leads.");

  const leads = rows.map((r, i) => {
    const contact = typeof r.phone === "string" ? findContact(r.phone) : null;
    if (!contact?.startsWith("+")) throw new Error(`Row ${i + 1}: "${r.phone}" isn't a usable mobile number.`);
    if (Number.isNaN(Date.parse(r.date))) throw new Error(`Row ${i + 1}: "${r.date}" isn't a date.`);
    return { contact, lead_at: r.date, name: r.name ?? null, course: r.course ?? null, from_ad: r.from_ad ?? false, reason: r.reason ?? null, page: via };
  });

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data, error } = await db.rpc("add_outside_leads", { p_org: org.id, p_channel: channel, p_rows: leads });
  if (error) throw new Error(`add_outside_leads: ${error.message}`);
  console.log(`✓ ${leads.length} leads → ${data as number} new (${leads.length - (data as number)} already in the list).`);
});
