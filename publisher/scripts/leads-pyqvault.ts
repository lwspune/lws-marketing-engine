// Read PYQ Vault's NDA, CDS and AFCAT students now (the hourly job does the same, migration 0028), looping until both
// feeds are caught up. The first run registers the two feeds (account, quiz) for the organisation.
//
//   npm run leads:pyqvault -- --org=lws-pune [--dry-run]
//
// --dry-run reads every new student and prints what would be added (new people, already on the list, skipped and why),
// changing nothing. Needs PYQVAULT_LEADS_SECRET in .env.local (the same value as GOPOST_LEADS_SECRET on PYQ Vault);
// PYQVAULT_URL overrides https://www.pyqvault.com.
import { FEED_SOURCES, FEEDS, feedLeads } from "../src/lib/domain/pyqvaultLeads";
import { PAGE_SIZE, syncPyqvaultLeads } from "../src/lib/leads/pyqvault";
import { pyqvaultStore } from "../src/lib/leads/pyqvaultStore";
import { PYQVAULT_BASE } from "../src/lib/platforms/pyqvault";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const secret = process.env.PYQVAULT_LEADS_SECRET;
  if (!secret) throw new Error("Set PYQVAULT_LEADS_SECRET in .env.local first (SETUP.md step 13).");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", need(f, "org")).single();
  if (!org) throw new Error(`No organisation "${f.org}".`);
  const store = pyqvaultStore(db, { base: process.env.PYQVAULT_URL ?? PYQVAULT_BASE, secret }, { orgId: org.id });

  if (f["dry-run"] !== undefined) {
    const feeds = await store.feeds();
    for (const source of FEED_SOURCES) {
      const feed = feeds.find((x) => x.source === source) ?? { id: "(not registered yet)", source, page: FEEDS[source].page, cursor: null };
      const stats = { read: 0, noNumber: 0, fake: 0, repeats: 0 };
      const contacts = new Map<string, string>();
      for (let after = feed.cursor; ;) {
        const { leads, next } = await store.read(feed, after, PAGE_SIZE);
        const r = feedLeads(source, leads);
        stats.read += leads.length; stats.noNumber += r.skipped.noNumber; stats.fake += r.skipped.fake; stats.repeats += r.skipped.repeats;
        for (const l of r.leads) { if (contacts.has(l.contact)) stats.repeats++; contacts.set(l.contact, l.lead_at); }
        if (leads.length < PAGE_SIZE) break;
        after = next;
      }
      const known = new Set<string>();
      const list = [...contacts.keys()];
      for (let i = 0; i < list.length; i += 300) {
        const { data } = await db.from("leads").select("contact").eq("org_id", org.id).in("contact", list.slice(i, i + 300));
        for (const l of data ?? []) known.add(l.contact);
      }
      const dates = [...contacts.values()].sort();
      console.log(`${feed.page}: ${stats.read} students → ${contacts.size} people, ${contacts.size - known.size} new`
        + ` (${known.size} already on the list) · skipped: ${stats.noNumber} no usable number, ${stats.fake} made-up, ${stats.repeats} repeats`
        + `${dates.length ? ` · ${dates[0].slice(0, 10)} → ${dates.at(-1)!.slice(0, 10)}` : ""}`);
    }
    console.log("Dry run: nothing was added.");
    return;
  }

  for (const source of FEED_SOURCES) {
    const { error } = await db.rpc("add_lead_feed", { p_org: org.id, p_source: source, p_page: FEEDS[source].page });
    if (error) throw new Error(`add_lead_feed: ${error.message}`);
  }
  const total = new Map<string, { read: number; added: number }>();
  for (;;) {
    const results = await syncPyqvaultLeads(store);
    for (const r of results) {
      if (r.error) throw new Error(`${r.feed}: ${r.error}`);
      const t = total.get(r.feed) ?? { read: 0, added: 0 };
      total.set(r.feed, { read: t.read + r.read, added: t.added + r.added });
    }
    if (results.every((r) => r.read === 0)) break;
  }
  for (const [feed, t] of total) console.log(`✓ ${feed}: ${t.read} students read, ${t.added} leads added`);
});
