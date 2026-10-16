import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Fixture, type Q } from "../helpers/testdb";

// Migration 0008: the Meta ad account, ad results synced from Meta, the bookings typed in by hand,
// and ad drafts that a member approves (created PAUSED on Meta) and then launches.

async function adsAccount(q: Q, f: Fixture) {
  await asOwner(q);
  const [{ id }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'meta_ads', 'act_779905330977080', 'LWS Pune ads', 'EAAB-test-token-0123456789', null) as id", [f.org]);
  return id;
}

const entity = (over: Record<string, unknown> = {}) => ({
  level: "adset", external_id: "as1", name: "Parents 35–55 – Pune", parent_id: "c1", effective_status: "ACTIVE", daily_budget_minor: 15000, ...over,
});
const daily = (over: Record<string, unknown> = {}) => ({
  ad_id: "ad1", day: "2026-10-17", ad_name: "Poster – English", adset_id: "as1", adset_name: "Parents 35–55 – Pune",
  campaign_id: "c1", campaign_name: "SPI Mock Test – Pune – Oct 2026", spend: 148.5, impressions: 5200, reach: 3900, clicks: 61,
  conversations: 4, actions: [{ action_type: "onsite_conversion.messaging_conversation_started_7d", value: "4" }], ...over,
});

async function sync(q: Q, account: string, entities: object[], rows: object[]) {
  const [r] = await q<{ n: number }>("select public.upsert_ad_sync($1, $2::jsonb, $3::jsonb) as n", [account, JSON.stringify(entities), JSON.stringify(rows)]);
  return r.n;
}

async function draft(q: Q, f: Fixture, account: string, over: Record<string, unknown> = {}) {
  await asOwner(q);
  const v = {
    slug: "spi-mock-test", title: "SPI Mock Test – parents", spec: {}, image_path: `${f.org}/ads/x/poster.png`,
    daily_budget_minor: 15000, start_at: "2026-11-01T07:30:00Z", end_at: "2026-11-08T07:30:00Z", ...over,
  };
  const [{ id }] = await q<{ id: string }>(
    `insert into public.ad_drafts (org_id, project_id, account_id, slug, title, spec, image_path, daily_budget_minor, start_at, end_at)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10) returning id`,
    [f.org, f.project, account, v.slug, v.title, JSON.stringify(v.spec), v.image_path, v.daily_budget_minor, v.start_at, v.end_at]);
  return id;
}

const status = async (q: Q, id: string) => (await q<{ status: string }>("select status from public.ad_drafts where id = $1", [id]))[0].status;

/** Approve as the member, then record every Meta object as the worker would. */
async function created(q: Q, f: Fixture, id: string) {
  await asUser(q, f.member);
  await q("select public.approve_ad($1)", [id]);
  await asService(q);
  for (const [k, v] of [["image_hash", "h1"], ["campaign", "c9"], ["adset", "as9"], ["creative", "cr9"], ["ad", "ad9"]]) {
    await q("select public.record_ad_object($1, $2, $3)", [id, k, v]);
  }
  await q("select public.record_ad_created($1)", [id]);
}

describe.skipIf(!TEST_DB_URL)("database: ad account and results", () => {
  it("an ad account is a connected account; its token is readable only by the service role", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asService(q);
    expect((await q<{ t: string }>("select public.get_account_token($1) as t", [account]))[0].t).toBe("EAAB-test-token-0123456789");
    await asUser(q, f.member);
    expect(await q("select platform from public.connected_accounts where id = $1", [account])).toEqual([{ platform: "meta_ads" }]);
    expect((await errorOf(q, "select public.get_account_token($1)", [account]))?.message).toMatch(/permission denied/);
  }));

  it("an ad account can't be used as a posting channel", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asOwner(q);
    expect(await errorOf(q, "select public.set_project_channel($1, 'meta_ads', $2)", [f.project, account])).not.toBeNull();
  }));

  it("the service role stores results; a second sync updates instead of duplicating", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asService(q);
    await sync(q, account, [entity(), entity({ level: "campaign", external_id: "c1", name: "SPI", parent_id: null, daily_budget_minor: null })],
      [daily(), daily({ day: "2026-10-18", spend: 150 })]);
    await sync(q, account, [entity({ effective_status: "PAUSED" })], [daily({ spend: 149.99, conversations: 5 })]);
    const rows = await q<{ day: string; spend: string; conversations: string }>(
      "select to_char(day, 'YYYY-MM-DD') as day, spend::text, conversations::text from public.ad_daily where account_id = $1 order by day", [account]);
    expect(rows).toEqual([{ day: "2026-10-17", spend: "149.99", conversations: "5" }, { day: "2026-10-18", spend: "150.00", conversations: "4" }]);
    expect(await q("select effective_status from public.ad_entities where account_id = $1 and external_id = 'as1'", [account]))
      .toEqual([{ effective_status: "PAUSED" }]);
  }));

  it("rejects negative spend or chats, and unknown levels", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asService(q);
    const call = "select public.upsert_ad_sync($1, $2::jsonb, $3::jsonb)";
    expect(await errorOf(q, call, [account, "[]", JSON.stringify([daily({ spend: -1 })])])).not.toBeNull();
    expect(await errorOf(q, call, [account, "[]", JSON.stringify([daily({ conversations: -2 })])])).not.toBeNull();
    expect(await errorOf(q, call, [account, JSON.stringify([entity({ level: "account" })]), "[]"])).not.toBeNull();
  }));

  it("members read their org's results; outsiders see none; nobody signed in can write", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asService(q);
    await sync(q, account, [entity()], [daily()]);
    await asUser(q, f.member);
    expect(await q("select ad_id from public.ad_daily where org_id = $1", [f.org])).toHaveLength(1);
    expect(await q("select external_id from public.ad_entities where org_id = $1", [f.org])).toHaveLength(1);
    expect((await errorOf(q, "select public.upsert_ad_sync($1, '[]'::jsonb, '[]'::jsonb)", [account]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "update public.ad_daily set spend = 0 where org_id = $1", [f.org]))?.message).toMatch(/permission denied/);
    await asUser(q, f.outsider);
    expect(await q("select ad_id from public.ad_daily where org_id = $1", [f.org])).toHaveLength(0);
  }));

  it("an ad account is due for a sync when never synced or not within the window", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asService(q);
    const due = async () => (await q<{ account_id: string }>("select account_id from public.ads_sync_due(20)")).map((r) => r.account_id);
    expect(await due()).toContain(account);
    expect(await due()).not.toContain(f.igAccount);
    await sync(q, account, [], []);
    expect(await due()).not.toContain(account);
    await asOwner(q);
    await q("update public.connected_accounts set ads_synced_at = now() - interval '21 hours' where id = $1", [account]);
    await asService(q);
    expect(await due()).toContain(account);
  }));
});

describe.skipIf(!TEST_DB_URL)("database: bookings typed in by hand", () => {
  it("a member records a week's bookings for a campaign; saving again overwrites", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asUser(q, f.member);
    await q("select public.set_ad_outcome($1, 'c1', '2026-10-12', 3, 1)", [account]);
    await q("select public.set_ad_outcome($1, 'c1', '2026-10-12', 4, 2)", [account]);
    expect(await q("select tests_booked, nda_leads, updated_by from public.ad_outcomes where account_id = $1", [account]))
      .toEqual([{ tests_booked: 4, nda_leads: 2, updated_by: f.member }]);
  }));

  it("weeks start on Monday; counts can't be negative; outsiders get 'not found'", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asUser(q, f.member);
    expect((await errorOf(q, "select public.set_ad_outcome($1, 'c1', '2026-10-13', 1, 0)", [account]))?.hint).toBe("invalid_week");
    expect(await errorOf(q, "select public.set_ad_outcome($1, 'c1', '2026-10-12', -1, 0)", [account])).not.toBeNull();
    await asUser(q, f.outsider);
    expect((await errorOf(q, "select public.set_ad_outcome($1, 'c1', '2026-10-12', 1, 0)", [account]))?.hint).toBe("not_found");
  }));
});

describe.skipIf(!TEST_DB_URL)("database: ad drafts", () => {
  it("guardrails: budget at most ₹1,000/day, 1–30 days long, image in the org folder", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    await asOwner(q);
    const bad = async (over: Record<string, unknown>) => {
      await q("savepoint d");
      try { await draft(q, f, account, over); await q("release savepoint d"); return null; } catch (e) { await q("rollback to savepoint d"); return (e as Error).message; }
    };
    expect(await bad({ daily_budget_minor: 100001 })).toMatch(/ad_drafts_budget/);
    expect(await bad({ daily_budget_minor: 0 })).toMatch(/ad_drafts_budget/);
    expect(await bad({ end_at: "2026-12-02T07:30:00Z" })).toMatch(/ad_drafts_length/);
    expect(await bad({ end_at: "2026-11-01T20:00:00Z" })).toMatch(/ad_drafts_length/);
    expect(await bad({ image_path: "other-org/poster.png" })).toMatch(/ad_drafts_image/);
    expect(await bad({ image_path: `${f.org}/ads/x/poster.gif` })).toMatch(/ad_drafts_image/);
    expect(await bad({})).toBeNull();
  }));

  it("only a Meta ad account can pay for a draft", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    await q("savepoint d");
    await expect(draft(q, f, f.igAccount)).rejects.toThrow(/not a Meta ad account/);
    await q("rollback to savepoint d");
  }));

  it("approve → objects recorded → created → launch → pause → resume", () => withTx(async (q) => {
    const f = await fixture(q);
    const id = await draft(q, f, await adsAccount(q, f));
    await created(q, f, id);
    expect(await status(q, id)).toBe("created");
    await q("select public.record_ad_status($1, 'live', $2)", [id, f.member]);
    expect(await q("select status, launched_by from public.ad_drafts where id = $1", [id])).toEqual([{ status: "live", launched_by: f.member }]);
    await q("select public.record_ad_status($1, 'paused', $2)", [id, f.member]);
    await q("select public.record_ad_status($1, 'live', $2)", [id, f.member]);
    expect(await status(q, id)).toBe("live");
  }));

  it("approval records who approved, and refuses a draft that ends within a day", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    const id = await draft(q, f, account);
    await asUser(q, f.member);
    await q("select public.approve_ad($1)", [id]);
    expect(await q("select status, approved_by from public.ad_drafts where id = $1", [id])).toEqual([{ status: "approved", approved_by: f.member }]);
    const old = await draft(q, f, account, { slug: "old", start_at: "2026-01-01T00:00:00Z", end_at: "2026-01-05T00:00:00Z" });
    await asUser(q, f.member);
    expect((await errorOf(q, "select public.approve_ad($1)", [old]))?.hint).toBe("ends_too_soon");
  }));

  it("what was approved is frozen: spec, poster, budget and dates", () => withTx(async (q) => {
    const f = await fixture(q);
    const id = await draft(q, f, await adsAccount(q, f));
    await asUser(q, f.member);
    await q("select public.approve_ad($1)", [id]);
    await asOwner(q);
    expect((await errorOf(q, "update public.ad_drafts set daily_budget_minor = 50000 where id = $1", [id]))?.message).toMatch(/only be edited while ready/);
    expect((await errorOf(q, "update public.ad_drafts set spec = '{\"x\":1}' where id = $1", [id]))?.message).toMatch(/only be edited while ready/);
  }));

  it("a Meta object id is written once: a retry can never create a second campaign", () => withTx(async (q) => {
    const f = await fixture(q);
    const id = await draft(q, f, await adsAccount(q, f));
    await asUser(q, f.member);
    await q("select public.approve_ad($1)", [id]);
    await asService(q);
    await q("select public.record_ad_object($1, 'campaign', 'c9')", [id]);
    await q("select public.record_ad_object($1, 'campaign', 'c9')", [id]); // same id again: harmless
    expect((await errorOf(q, "select public.record_ad_object($1, 'campaign', 'c10')", [id]))?.hint).toBe("already_created");
    expect((await errorOf(q, "select public.record_ad_object($1, 'audience', 'x')", [id]))?.hint).toBe("invalid_input");
  }));

  it("'created' needs every Meta object; a failure can be retried and keeps the ids already made", () => withTx(async (q) => {
    const f = await fixture(q);
    const id = await draft(q, f, await adsAccount(q, f));
    await asUser(q, f.member);
    await q("select public.approve_ad($1)", [id]);
    await asService(q);
    await q("select public.record_ad_object($1, 'campaign', 'c9')", [id]);
    expect(await errorOf(q, "select public.record_ad_created($1)", [id])).not.toBeNull();
    await q("select public.record_ad_failed($1, 'Meta API 400: Invalid targeting')", [id]);
    expect(await q("select status, error, meta_campaign_id from public.ad_drafts where id = $1", [id]))
      .toEqual([{ status: "failed", error: "Meta API 400: Invalid targeting", meta_campaign_id: "c9" }]);
    await asUser(q, f.member);
    await q("select public.retry_ad($1)", [id]);
    expect(await q("select status, error from public.ad_drafts where id = $1", [id])).toEqual([{ status: "approved", error: null }]);
  }));

  it("nothing goes live without being created first, and a rejected draft stays rejected", () => withTx(async (q) => {
    const f = await fixture(q);
    const account = await adsAccount(q, f);
    const id = await draft(q, f, account);
    await asService(q);
    expect(await errorOf(q, "select public.record_ad_status($1, 'live', $2)", [id, f.member])).not.toBeNull();
    const other = await draft(q, f, account, { slug: "other" });
    await asUser(q, f.member);
    await q("select public.reject_ad($1, 'wrong poster')", [other]);
    expect(await errorOf(q, "select public.approve_ad($1)", [other])).not.toBeNull();
    expect(await status(q, other)).toBe("rejected");
  }));

  it("members read drafts; outsiders get 'not found' and see nothing; workers' functions are closed to users", () => withTx(async (q) => {
    const f = await fixture(q);
    const id = await draft(q, f, await adsAccount(q, f));
    await asUser(q, f.outsider);
    expect(await q("select id from public.ad_drafts where id = $1", [id])).toHaveLength(0);
    expect((await errorOf(q, "select public.approve_ad($1)", [id]))?.hint).toBe("not_found");
    await asUser(q, f.member);
    expect(await q("select id from public.ad_drafts where id = $1", [id])).toHaveLength(1);
    expect((await errorOf(q, "update public.ad_drafts set status = 'approved' where id = $1", [id]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select public.record_ad_object($1, 'campaign', 'c1')", [id]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select public.record_ad_status($1, 'live', $2)", [id, f.member]))?.message).toMatch(/permission denied/);
  }));
});
