// Add lwspune.com form entries to the Leads list, from the emails the site sends (lws.adacoount@gmail.com).
//
//   npm run leads:website -- --org=lws-pune --file=emails.json
//
// emails.json: [{ "date": "<when the email arrived, ISO>", "text": "<the email's text or Gmail preview>" }], gathered in a
// Claude Code chat through the Gmail connector (that sender only). Each email is parsed by parseFormEmail, repeats of
// a number are merged, and numbers that are already a lead from any channel are skipped (migration 0017).
import { readFileSync } from "node:fs";
import { mergeFormLeads, parseFormEmail, type FormLead } from "../src/lib/domain/leads";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const emails = JSON.parse(readFileSync(need(f, "file"), "utf8")) as { date: string; text: string }[];
  if (!Array.isArray(emails)) throw new Error("The file must hold a list of { date, text }.");

  const parsed: FormLead[] = [];
  let unreadable = 0;
  for (const e of emails) {
    const lead = typeof e?.text === "string" && typeof e?.date === "string" ? parseFormEmail(e.text, e.date) : null;
    if (lead) parsed.push(lead); else unreadable++;
  }
  const leads = mergeFormLeads(parsed);

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const { data, error } = await db.rpc("add_website_leads", { p_org: org.id, p_rows: leads });
  if (error) throw new Error(`add_website_leads: ${error.message}`);
  console.log(`✓ ${emails.length} emails → ${leads.length} people → ${data as number} new leads ` +
    `(${leads.length - (data as number)} already in the list${unreadable ? `, ${unreadable} emails without a usable mobile number` : ""}).`);
});
