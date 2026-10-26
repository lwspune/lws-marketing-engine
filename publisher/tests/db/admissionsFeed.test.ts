import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asAnon, asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// The admissions feed (founder, 2026-10-26; migration 0029): an organisation's leads with an Indian mobile, oldest-added
// first, a page at a time after a (created_at, id) cursor, for Admissions AI to read every hour. Service role only: the
// route answers with it after checking the shared secret.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0029_admissions_feed.sql");

const withFeed = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regprocedure('public.admissions_leads_after(text, timestamptz, uuid, int)') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const orgSlug = async (q: Q, org: string) => (await q<{ slug: string }>("select slug from public.organizations where id = $1", [org]))[0].slug;
// Leads are added as the owner with explicit times: inside one transaction now() never moves, so "added a while ago" has to be written down.
const addLead = (q: Q, org: string, contact: string, createdAt: string, over: Record<string, unknown> = {}) =>
  q<{ id: string }>(
    `insert into public.leads (org_id, channel, contact, name, course, class_level, page, from_ad, reason, lead_at, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
    [org, over.channel ?? "instagram", contact, over.name ?? "Test Student", over.course ?? "NDA", over.class_level ?? "10",
      over.page ?? null, over.from_ad ?? false, over.reason ?? "Shared a phone number", over.lead_at ?? createdAt, createdAt],
  ).then((r) => r[0].id);
// `at` is the time as text, as the route sends it: a JS Date would cut the microseconds and the next page would re-read rows.
const page = (q: Q, slug: string, after: { at: string; id: string } | null = null, limit = 100) =>
  q<{ id: string; contact: string; at: string }>(
    "select *, created_at::text as at from public.admissions_leads_after($1, $2, $3, $4)", [slug, after?.at ?? null, after?.id ?? null, limit]);

describe.skipIf(!TEST_DB_URL)("database: admissions feed", () => {
  it("serves the organisation's leads with an Indian mobile, oldest-added first; emails, other numbers and other organisations stay out", () => withFeed(async (q) => {
    const f = await fixture(q), other = await fixture(q);
    const late = await addLead(q, f.org, "+919800000002", "2026-10-02T10:00:00Z", { lead_at: "2026-09-01T00:00:00Z" });
    const early = await addLead(q, f.org, "+919800000001", "2026-10-01T10:00:00Z");
    await addLead(q, f.org, "student@example.com", "2026-10-01T11:00:00Z");
    await addLead(q, f.org, "+447700900001", "2026-10-01T12:00:00Z");
    await addLead(q, f.org, "+915800000001", "2026-10-01T13:00:00Z");
    await addLead(q, other.org, "+919800000003", "2026-10-01T10:00:00Z");
    await asService(q);
    const rows = await page(q, await orgSlug(q, f.org));
    // Added order, not lead order: the late-added lead has the earlier lead_at and still comes second.
    expect(rows.map((r) => r.id)).toEqual([early, late]);
    expect(rows[0]).toMatchObject({ contact: "+919800000001", name: "Test Student", course: "NDA", class_level: "10", channel: "instagram", from_ad: false });
  }));

  it("pages after a cursor, breaking a tie on the time by id", () => withFeed(async (q) => {
    const f = await fixture(q);
    const same = "2026-10-01T10:00:00.123456Z";
    const ids = [
      await addLead(q, f.org, "+919800000011", same),
      await addLead(q, f.org, "+919800000012", same),
      await addLead(q, f.org, "+919800000013", "2026-10-01T10:00:01Z"),
    ];
    const sorted = [...ids.slice(0, 2)].sort().concat(ids[2]);
    await asService(q);
    const slug = await orgSlug(q, f.org);
    const first = await page(q, slug, null, 1);
    expect(first.map((r) => r.id)).toEqual([sorted[0]]);
    const rest = await page(q, slug, { at: first[0].at, id: first[0].id });
    expect(rest.map((r) => r.id)).toEqual(sorted.slice(1));
    expect(await page(q, slug, { at: rest[1].at, id: rest[1].id })).toEqual([]);
  }));

  it("holds back a lead added in the last two minutes, so one still being saved is never passed by", () => withFeed(async (q) => {
    const f = await fixture(q);
    const [{ now }] = await q<{ now: Date }>("select now()");
    await addLead(q, f.org, "+919800000021", new Date(now.getTime() - 60_000).toISOString());
    const settled = await addLead(q, f.org, "+919800000022", new Date(now.getTime() - 180_000).toISOString());
    await asService(q);
    expect((await page(q, await orgSlug(q, f.org))).map((r) => r.id)).toEqual([settled]);
  }));

  it("refuses a page size outside 1 to 500 and an organisation that doesn't exist", () => withFeed(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const slug = await orgSlug(q, f.org);
    for (const limit of [0, 501]) {
      expect(await errorOf(q, "select * from public.admissions_leads_after($1, null, null, $2)", [slug, limit])).toMatchObject({ hint: "invalid_input" });
    }
    expect(await errorOf(q, "select * from public.admissions_leads_after('no-such-org', null, null, 10)")).toMatchObject({ hint: "not_found" });
  }));

  it("is service role's only: an owner and anonymous callers are refused", () => withFeed(async (q) => {
    const f = await fixture(q);
    const slug = await orgSlug(q, f.org);
    await asUser(q, f.member);
    expect(await errorOf(q, "select * from public.admissions_leads_after($1, null, null, 10)", [slug])).toMatchObject({ code: "42501" });
    await asAnon(q);
    expect(await errorOf(q, "select * from public.admissions_leads_after($1, null, null, 10)", [slug])).toMatchObject({ code: "42501" });
    await asOwner(q);
  }));
});
