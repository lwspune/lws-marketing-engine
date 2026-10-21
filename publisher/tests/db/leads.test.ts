import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Fixture, type Q } from "../helpers/testdb";

// One leads list (founder, 2026-10-21; migration 0016). The hourly job (service role) asks which chats need a look,
// then records what it found; owners read, correct and remove leads. Same privacy as the Inbox: owners only.

const IG = "17841400000000000", WA = "109876543210987";
const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0016_leads.sql");

/** Like withTx, but applies 0016 first while the live schema doesn't have it yet (it's rolled back with the test). */
const withLeads = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regclass('public.leads') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

interface LeadsFixture extends Fixture { editor: string; waAccount: string }

async function leadsFixture(q: Q): Promise<LeadsFixture> {
  const f = await fixture(q);
  await asOwner(q);
  const editor = randomUUID();
  await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [editor, `e-${editor.slice(0, 8)}@test.local`]);
  await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'editor')", [f.org, editor]);
  const [{ id: waAccount }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'whatsapp', $2, '+91 76206 99213', 'EAAG-test-token-0123456789', null) as id", [f.org, WA]);
  org = f.org;
  return { ...f, editor, waAccount };
}

const row = (over: Record<string, unknown> = {}) => ({
  contact_id: "9001", mid: `mid.${randomUUID().slice(0, 8)}`, direction: "in", body: "Sir fees kitni hai?", attachment: null,
  sent_at: "2026-10-19T08:00:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});
const ingest = (q: Q, platform: string, external: string, rows: object[]) =>
  q("select * from public.ingest_messages($1, $2, $3::jsonb)", [platform, external, JSON.stringify(rows)]);
// Scoped to the test organisation: the live schema also holds real chats.
let org = "";
const toCheck = (q: Q, channel: string) =>
  q<{ conversation_id: string; contact_id: string; last_incoming_at: Date }>("select * from public.leads_to_check($1, 50, $2)", [channel, org]);
const record = async (q: Q, checks: object[]) =>
  (await q<{ n: number }>("select public.record_lead_checks($1::jsonb) as n", [JSON.stringify(checks)]))[0].n;
const lead = (over: Record<string, unknown> = {}) =>
  ({ contact: "+919876543210", name: "Rahul S", course: "NDA", lead_at: "2026-10-19T08:00:00Z", reason: "Shared a phone number", ...over });

describe.skipIf(!TEST_DB_URL)("database: leads", () => {
  it("offers a chat for checking until it's checked, and again once they write again", () => withLeads(async (q) => {
    await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row()]);
    const [c] = await toCheck(q, "instagram");
    expect(c).toMatchObject({ contact_id: "9001" });
    expect(await toCheck(q, "whatsapp")).toEqual([]);

    expect(await record(q, [{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: null }])).toBe(0);
    expect(await toCheck(q, "instagram")).toEqual([]);

    await ingest(q, "instagram", IG, [row({ sent_at: "2026-10-20T08:00:00Z" })]);
    expect((await toCheck(q, "instagram")).map((x) => x.conversation_id)).toEqual([c.conversation_id]);
  }));

  it("records a lead with where it came from, moves a new chat to Interested, and never offers it again", () => withLeads(async (q) => {
    const f = await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row({ source: "ad", ad_id: "120231234567890" })]);
    const [c] = await toCheck(q, "instagram");
    expect(await record(q, [{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: lead() }])).toBe(1);

    await asOwner(q);
    const [l] = await q("select * from public.leads where org_id = $1", [f.org]);
    expect(l).toMatchObject({
      conversation_id: c.conversation_id, account_id: f.igAccount, channel: "instagram", from_ad: true,
      name: "Rahul S", contact: "+919876543210", course: "NDA", reason: "Shared a phone number",
    });
    expect((l.lead_at as Date).toISOString()).toBe("2026-10-19T08:00:00.000Z");
    expect(await q("select status from public.conversations where id = $1", [c.conversation_id])).toEqual([{ status: "interested" }]);

    await asService(q);
    await ingest(q, "instagram", IG, [row({ sent_at: "2026-10-21T08:00:00Z" })]);
    expect(await toCheck(q, "instagram")).toEqual([]);
  }));

  it("keeps one lead per person: the same number from another chat is not added twice", () => withLeads(async (q) => {
    const f = await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row()]);
    await ingest(q, "whatsapp", WA, [row({ contact_id: "919876543210" })]);
    const [ig] = await toCheck(q, "instagram"), [wa] = await toCheck(q, "whatsapp");
    expect(await record(q, [
      { conversation_id: ig.conversation_id, checked_at: ig.last_incoming_at, lead: lead() },
      { conversation_id: wa.conversation_id, checked_at: wa.last_incoming_at, lead: lead({ name: "Priya" }), reason: "Parent asking fees" },
    ])).toBe(1);
    await asOwner(q);
    expect(await q("select name, channel from public.leads where org_id = $1", [f.org])).toEqual([{ name: "Rahul S", channel: "instagram" }]);
    expect(await toCheck(q, "whatsapp")).toEqual([]);
  }));

  it("refuses leads the database can't trust: bad contact, over-long fields", () => withLeads(async (q) => {
    await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row()]);
    const [c] = await toCheck(q, "instagram");
    for (const bad of [lead({ contact: "98765" }), lead({ contact: "not an email" }), lead({ name: "x".repeat(201) }), lead({ course: "x".repeat(81) })]) {
      expect(await errorOf(q, "select public.record_lead_checks($1::jsonb)",
        [JSON.stringify([{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: bad }])])).not.toBeNull();
    }
  }));

  it("shows leads to owners only, and only the job can write them", () => withLeads(async (q) => {
    const f = await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row()]);
    const [c] = await toCheck(q, "instagram");
    await record(q, [{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: lead() }]);

    await asUser(q, f.member);
    expect(await q("select name from public.leads")).toEqual([{ name: "Rahul S" }]);
    expect(await errorOf(q, "select * from public.leads_to_check('instagram', 5)")).toMatchObject({ code: "42501" });
    expect(await errorOf(q, "select public.record_lead_checks('[]'::jsonb)")).toMatchObject({ code: "42501" });
    expect(await errorOf(q, "insert into public.leads (org_id, contact) values ($1, '+919876543210')", [f.org])).not.toBeNull();
    for (const who of [f.editor, f.outsider]) {
      await asUser(q, who);
      expect(await q("select * from public.leads")).toEqual([]);
    }
  }));

  it("lets an owner correct a lead's name and course, and nobody else", () => withLeads(async (q) => {
    const f = await leadsFixture(q);
    await asService(q);
    await ingest(q, "instagram", IG, [row()]);
    const [c] = await toCheck(q, "instagram");
    await record(q, [{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: lead() }]);
    await asOwner(q);
    const [{ id }] = await q<{ id: string }>("select id from public.leads where org_id = $1", [f.org]);

    await asUser(q, f.editor);
    expect(await errorOf(q, "select public.update_lead($1, 'X', 'Y')", [id])).toMatchObject({ hint: "not_found" });
    await asUser(q, f.member);
    await q("select public.update_lead($1, '  Rahul Sharma ', '  ')", [id]);
    expect(await q("select name, course from public.leads where id = $1", [id])).toEqual([{ name: "Rahul Sharma", course: null }]);
    expect(await errorOf(q, "select public.update_lead($1, $2, null)", [id, "x".repeat(201)])).toMatchObject({ hint: "invalid_input" });
  }));

  it("removing a wrong lead marks the chat Not a lead, so the job never adds it back", () => withLeads(async (q) => {
    const f = await leadsFixture(q);
    await asService(q);
    await ingest(q, "whatsapp", WA, [row({ contact_id: "919876543210" })]);
    const [c] = await toCheck(q, "whatsapp");
    await record(q, [{ conversation_id: c.conversation_id, checked_at: c.last_incoming_at, lead: lead(), reason: "Asked fees" }]);
    await asOwner(q);
    const [{ id }] = await q<{ id: string }>("select id from public.leads where org_id = $1", [f.org]);

    await asUser(q, f.editor);
    expect(await errorOf(q, "select public.remove_lead($1)", [id])).toMatchObject({ hint: "not_found" });
    await asUser(q, f.member);
    await q("select public.remove_lead($1)", [id]);
    expect(await q("select * from public.leads")).toEqual([]);
    expect(await q("select status from public.conversations where id = $1", [c.conversation_id])).toEqual([{ status: "not_lead" }]);

    await asService(q);
    await ingest(q, "whatsapp", WA, [row({ contact_id: "919876543210", sent_at: "2026-10-22T08:00:00Z" })]);
    expect(await toCheck(q, "whatsapp")).toEqual([]);
  }));
});
