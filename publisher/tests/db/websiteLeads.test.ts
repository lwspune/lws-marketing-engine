import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Website form leads (founder, 2026-10-21; migration 0017): lwspune.com form entries, read from the form's emails,
// go into the same leads list with source "Website" and the form's page. No chat behind them.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0017_website_leads.sql");

/** Like withTx, but applies 0017 first while the live schema doesn't have it yet (it's rolled back with the test). */
const withWebsite = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>(
    "select not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'page') as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const entry = (over: Record<string, unknown> = {}) =>
  ({ name: "Shubham Dalvi", contact: "+918356925351", course: "NDA 6 months", lead_at: "2026-10-21T07:12:57Z", page: "lwspune.com/ssb/", ...over });
const add = async (q: Q, org: string, rows: object[]) =>
  (await q<{ n: number }>("select public.add_website_leads($1, $2::jsonb) as n", [org, JSON.stringify(rows)]))[0].n;

describe.skipIf(!TEST_DB_URL)("database: website leads", () => {
  it("adds form entries as website leads with their page, once per number", () => withWebsite(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await add(q, f.org, [entry(), entry({ name: "Again" }), entry({ contact: "+919730010347", name: null, course: null, page: null })])).toBe(2);
    expect(await add(q, f.org, [entry()])).toBe(0);
    await asOwner(q);
    expect(await q("select name, contact, course, channel, page, conversation_id, from_ad, reason from public.leads where org_id = $1 order by contact", [f.org])).toEqual([
      { name: "Shubham Dalvi", contact: "+918356925351", course: "NDA 6 months", channel: "website", page: "lwspune.com/ssb/", conversation_id: null, from_ad: false, reason: "Website form" },
      { name: null, contact: "+919730010347", course: null, channel: "website", page: null, conversation_id: null, from_ad: false, reason: "Website form" },
    ]);
  }));

  it("skips a number that is already a lead from Instagram or WhatsApp", () => withWebsite(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    await q("insert into public.leads (org_id, channel, contact, name) values ($1, 'whatsapp', '+918356925351', 'Shubham')", [f.org]);
    await asService(q);
    expect(await add(q, f.org, [entry()])).toBe(0);
  }));

  it("refuses bad entries, and only the import may add them", () => withWebsite(async (q) => {
    const f = await fixture(q);
    await asService(q);
    for (const bad of [entry({ contact: "08356925351" }), entry({ page: "x".repeat(201) }), entry({ lead_at: null })]) {
      expect(await errorOf(q, "select public.add_website_leads($1, $2::jsonb)", [f.org, JSON.stringify([bad])])).not.toBeNull();
    }
    expect(await errorOf(q, "select public.add_website_leads($1, $2::jsonb)", [randomUUID(), JSON.stringify([entry()])])).toMatchObject({ hint: "not_found" });
    await asUser(q, f.member);
    expect(await errorOf(q, "select public.add_website_leads($1, '[]'::jsonb)", [f.org])).toMatchObject({ code: "42501" });
  }));

  it("owners see, correct and remove website leads like any other", () => withWebsite(async (q) => {
    const f = await fixture(q);
    await asService(q);
    await add(q, f.org, [entry()]);
    await asUser(q, f.member);
    const [{ id }] = await q<{ id: string }>("select id from public.leads");
    await q("select public.update_lead($1, 'Shubham D', 'SSB')", [id]);
    expect(await q("select name, course from public.leads")).toEqual([{ name: "Shubham D", course: "SSB" }]);
    await q("select public.remove_lead($1)", [id]);
    expect(await q("select * from public.leads")).toEqual([]);
    await asUser(q, f.outsider);
    expect(await q("select * from public.leads")).toEqual([]);
  }));
});
