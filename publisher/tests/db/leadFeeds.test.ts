import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Leads from PYQ Vault (founder, 2026-10-25; migration 0028): NDA, CDS and AFCAT students who agreed to be contacted.
// The hourly job reads each feed after its cursor and imports a page with the new cursor in one step, so a run cut off
// half way never skips a student or adds them twice. Same leads list and rules as every other import.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0028_lead_feeds.sql");
const C1 = "2026-07-15T16:16:12.104123+00:00~11111111-1111-4111-8111-111111111111";
const C2 = "2026-07-16T09:00:00.5+00:00~22222222-2222-4222-8222-222222222222";

const withFeeds = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regclass('public.lead_feeds') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const lead = (over: Record<string, unknown> = {}) => ({
  name: "Test Student", contact: "+919800000001", course: "NDA, CDS", class_level: "12", lead_at: "2026-07-15T16:16:12Z",
  from_ad: false, reason: "PYQ Vault: Pune", ...over,
});
const addFeed = async (q: Q, org: string, source = "pyqvault_account", page = "PYQ Vault · account") =>
  (await q<{ id: string }>("select public.add_lead_feed($1, $2, $3) as id", [org, source, page]))[0].id;
const importRows = async (q: Q, feed: string, from: string | null, next: string | null, rows: object[]) =>
  (await q<{ n: number }>("select public.import_feed_rows($1, $2, $3, $4::jsonb) as n", [feed, from, next, JSON.stringify(rows)]))[0].n;

describe.skipIf(!TEST_DB_URL)("database: lead feeds", () => {
  it("imports a page as website leads with the feed's page, and moves its cursor in the same step", () => withFeeds(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const feed = await addFeed(q, f.org);
    expect(await importRows(q, feed, null, C1, [lead(), lead({ contact: "+919800000002", name: null, class_level: null })])).toBe(2);
    await asOwner(q);
    expect(await q("select channel, page, course, class_level, contact from public.leads where org_id = $1 order by contact", [f.org])).toEqual([
      { channel: "website", page: "PYQ Vault · account", course: "NDA, CDS", class_level: "12", contact: "+919800000001" },
      { channel: "website", page: "PYQ Vault · account", course: "NDA, CDS", class_level: null, contact: "+919800000002" },
    ]);
    const [s] = await q<{ cursor: string; last_error: string | null; last_synced_at: Date | null }>("select * from public.lead_feeds where id = $1", [feed]);
    expect(s).toMatchObject({ cursor: C1, last_error: null });
    expect(s.last_synced_at).not.toBeNull();
  }));

  it("refuses a page that doesn't start at the cursor (another run got there first), adding nothing", () => withFeeds(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const feed = await addFeed(q, f.org);
    await importRows(q, feed, null, C1, [lead()]);
    expect(await errorOf(q, "select public.import_feed_rows($1, null, $2, $3::jsonb)", [feed, C2, JSON.stringify([lead({ contact: "+919800000003" })])]))
      .toMatchObject({ hint: "conflict" });
    expect(await errorOf(q, "select public.import_feed_rows($1, $2, '', '[]'::jsonb)", [feed, C1])).toMatchObject({ hint: "invalid_input" });
    await asOwner(q);
    expect(await q("select count(*)::int as n from public.leads where org_id = $1", [f.org])).toEqual([{ n: 1 }]);
  }));

  it("skips numbers already on the list; a run with nothing new keeps the cursor, marks the feed synced and clears its error", () => withFeeds(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const feed = await addFeed(q, f.org);
    await importRows(q, feed, null, C1, [lead()]);
    expect(await importRows(q, feed, C1, C2, [lead({ lead_at: "2026-07-16T09:00:00Z" })])).toBe(0);
    await q("select public.record_feed_error($1, 'PYQ Vault answered 401')", [feed]);
    await asOwner(q);
    expect(await q("select last_error, cursor from public.lead_feeds where id = $1", [feed])).toEqual([{ last_error: "PYQ Vault answered 401", cursor: C2 }]);
    await asService(q);
    expect(await importRows(q, feed, C2, C2, [])).toBe(0);
    await asOwner(q);
    expect(await q("select last_error, cursor from public.lead_feeds where id = $1", [feed])).toEqual([{ last_error: null, cursor: C2 }]);
  }));

  it("adding the same feed twice keeps one entry; unknown sources and blank pages are refused", () => withFeeds(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await addFeed(q, f.org)).toBe(await addFeed(q, f.org));
    expect(await addFeed(q, f.org, "pyqvault_quiz", "PYQ Vault · quiz")).not.toBe(await addFeed(q, f.org));
    expect(await errorOf(q, "select public.add_lead_feed($1, 'gmail', 'p')", [f.org])).not.toBeNull();
    expect(await errorOf(q, "select public.add_lead_feed($1, 'pyqvault_quiz', ' ')", [f.org])).not.toBeNull();
  }));

  it("owners can read the feeds' status; nobody signed in can change it", () => withFeeds(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const feed = await addFeed(q, f.org);
    await asUser(q, f.member);
    expect(await q("select page from public.lead_feeds where id = $1", [feed])).toEqual([{ page: "PYQ Vault · account" }]);
    expect(await errorOf(q, "select public.import_feed_rows($1, null, $2, '[]'::jsonb)", [feed, C1])).toMatchObject({ code: "42501" });
    expect(await errorOf(q, "update public.lead_feeds set cursor = 'x' where id = $1", [feed])).toMatchObject({ code: "42501" });
    await asUser(q, f.outsider);
    expect(await q("select page from public.lead_feeds where id = $1", [feed])).toEqual([]);
  }));
});
