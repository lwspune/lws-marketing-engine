// Read the website's lead sheets now (the hourly job does the same, migration 0026), looping until every tab is caught up.
//
//   npm run leads:sheets -- --org=lws-pune [--dry-run]
//
// --dry-run reads every new row and prints what would be added (new people, already on the list, skipped and why),
// changing nothing. Needs GOOGLE_SHEETS_KEY in .env.local.
import { sheetLeads } from "../src/lib/domain/leadSheets";
import { MAX_ROWS, syncLeadSheets } from "../src/lib/leads/sheets";
import { sheetsStore } from "../src/lib/leads/sheetsStore";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const key = process.env.GOOGLE_SHEETS_KEY;
  if (!key) throw new Error("Set GOOGLE_SHEETS_KEY in .env.local first (SETUP.md step 12).");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", need(f, "org")).single();
  if (!org) throw new Error(`No organisation "${f.org}".`);
  const store = sheetsStore(db, key, { orgId: org.id });

  if (f["dry-run"] !== undefined) {
    for (const s of await store.sheets()) {
      const stats = { rows: 0, noNumber: 0, fake: 0, noDate: 0, repeats: 0 };
      const contacts = new Map<string, string>();
      for (let from = s.nextRow; ; from += MAX_ROWS) {
        const { header, rows } = await store.read(s, from, MAX_ROWS);
        const r = sheetLeads(s.kind, header, rows);
        stats.rows += rows.length; stats.noNumber += r.skipped.noNumber; stats.fake += r.skipped.fake; stats.noDate += r.skipped.noDate;
        for (const l of r.leads) { if (contacts.has(l.contact)) stats.repeats++; contacts.set(l.contact, l.lead_at); }
        stats.repeats += r.skipped.repeats;
        if (rows.length < MAX_ROWS) break;
      }
      const known = new Set<string>();
      const list = [...contacts.keys()];
      for (let i = 0; i < list.length; i += 300) {
        const { data } = await db.from("leads").select("contact").eq("org_id", org.id).in("contact", list.slice(i, i + 300));
        for (const l of data ?? []) known.add(l.contact);
      }
      const dates = [...contacts.values()].sort();
      console.log(`${s.tab} (from row ${s.nextRow}): ${stats.rows} rows → ${contacts.size} people, ${contacts.size - known.size} new`
        + ` (${known.size} already on the list) · skipped: ${stats.noNumber} no usable number, ${stats.fake} made-up, ${stats.noDate} no date,`
        + ` ${stats.repeats} repeats${dates.length ? ` · ${dates[0].slice(0, 10)} → ${dates.at(-1)!.slice(0, 10)}` : ""}`);
    }
    console.log("Dry run: nothing was added.");
    return;
  }

  const total = new Map<string, { read: number; added: number }>();
  for (;;) {
    const results = await syncLeadSheets(store);
    for (const r of results) {
      if (r.error) throw new Error(`${r.tab}: ${r.error}`);
      const t = total.get(r.tab) ?? { read: 0, added: 0 };
      total.set(r.tab, { read: t.read + r.read, added: t.added + r.added });
    }
    if (results.every((r) => r.read === 0)) break;
  }
  for (const [tab, t] of total) console.log(`✓ ${tab}: ${t.read} rows read, ${t.added} leads added`);
});
