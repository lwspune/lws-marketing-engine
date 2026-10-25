import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Facebook Page (Messenger) chats in the Inbox (founder, 2026-10-25; migration 0025). connect:meta subscribes every
// connected Page to `messages`, outside brands' Pages too, so a Page's chats are stored only once its inbox is
// switched on, which `messages:backfill --pages=…` does for the Pages it is told to read.

const PAGE = "104000000000001";
const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0025_facebook_messages.sql");

/** Like withTx, but applies 0025 first while the live schema doesn't have it yet (it's rolled back with the test). */
const withFacebook = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>(
    "select not exists (select 1 from private.schema_migrations where name = '0025_facebook_messages.sql') as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

async function pageFixture(q: Q) {
  const f = await fixture(q);
  await asOwner(q);
  const [{ id: fbAccount }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'facebook', $2, 'LWS Pune', 'EAAG-page-token-0123456789', null) as id", [f.org, PAGE]);
  return { ...f, fbAccount };
}

const row = (over: Record<string, unknown> = {}) => ({
  contact_id: "7001", mid: "m_fb1", direction: "in", body: "NDA batch kab start hai? 9123456789", attachment: null,
  sent_at: "2026-10-25T08:00:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});
const ingest = (q: Q, rows: object[]) =>
  q<{ account_id: string; conversation_id: string; contact_id: string }>(
    "select * from public.ingest_messages('facebook', $1, $2::jsonb)", [PAGE, JSON.stringify(rows)]);
const count = async (q: Q, account: string) =>
  (await q<{ n: number }>("select count(*)::int as n from public.conversations where account_id = $1", [account]))[0].n;

describe.skipIf(!TEST_DB_URL)("database: Facebook Page chats", () => {
  it("stores nothing for a Page whose inbox is off (the default), without failing the delivery", () => withFacebook(async (q) => {
    const f = await pageFixture(q);
    await asService(q);
    expect(await ingest(q, [row()])).toEqual([]);
    await asOwner(q);
    expect(await count(q, f.fbAccount)).toBe(0);
  }));

  it("once the inbox is on, stores Messenger chats as channel facebook and asks for the name", () => withFacebook(async (q) => {
    const f = await pageFixture(q);
    await asService(q);
    await q("select public.set_account_inbox($1, true)", [f.fbAccount]);
    expect(await ingest(q, [row()])).toEqual([{ account_id: f.fbAccount, conversation_id: expect.any(String), contact_id: "7001" }]);
    await asOwner(q);
    const [c] = await q("select channel, contact_id, preview from public.conversations where account_id = $1", [f.fbAccount]);
    expect(c).toMatchObject({ channel: "facebook", contact_id: "7001", preview: "NDA batch kab start hai? 9123456789" });
  }));

  it("lets a Facebook chat become a lead", () => withFacebook(async (q) => {
    const f = await pageFixture(q);
    await asService(q);
    await q("select public.set_account_inbox($1, true)", [f.fbAccount]);
    await ingest(q, [row()]);
    const [c] = await q<{ conversation_id: string; last_incoming_at: Date }>("select * from public.leads_to_check('facebook', 50, $1)", [f.org]);
    const lead = { contact: "+919123456789", name: "Priya K", course: "NDA", lead_at: "2026-10-25T08:00:00Z", reason: "Shared a phone number" };
    await q("select public.record_lead_checks($1::jsonb)", [JSON.stringify([{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead }])]);
    await asOwner(q);
    expect(await q("select channel, account_id from public.leads where org_id = $1", [f.org])).toEqual([{ channel: "facebook", account_id: f.fbAccount }]);
  }));

  it("switching a Page's inbox is for the service role only, and only for Facebook Pages", () => withFacebook(async (q) => {
    const f = await pageFixture(q);
    await asUser(q, f.member);
    expect((await errorOf(q, "select public.set_account_inbox($1, true)", [f.fbAccount]))?.message).toMatch(/permission denied/);
    await asService(q);
    expect((await errorOf(q, "select public.set_account_inbox($1, true)", [f.igAccount]))?.message).toMatch(/Facebook Page/);
  }));
});
