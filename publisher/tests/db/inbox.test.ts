import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asAnon, asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Fixture, type Q } from "../helpers/testdb";

// Instagram DMs (founder, 2026-10-19): stored so the founder can read, reply and count leads, but ONLY owners
// ever see them. Meta's webhook (service role) writes through ingest_messages; text goes after 12 months.

const IG = "17841400000000000";
interface InboxFixture extends Fixture { editor: string; staff: string }

async function inboxFixture(q: Q): Promise<InboxFixture> {
  const f = await fixture(q);
  await asOwner(q);
  const editor = randomUUID(), staff = randomUUID();
  for (const [id, role] of [[editor, "editor"], [staff, "staff"]]) {
    await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [id, `${role}-${id.slice(0, 8)}@test.local`]);
    await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, $3)", [f.org, id, role]);
  }
  await q("insert into public.project_members (org_id, project_id, user_id) values ($1, $2, $3)", [f.org, f.project, staff]);
  return { ...f, editor, staff };
}

const row = (over: Record<string, unknown> = {}) => ({
  contact_id: "9001", mid: "mid.1", direction: "in", body: "Sir fees kitni hai?", attachment: null,
  sent_at: "2026-10-19T08:00:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});
const ingest = (q: Q, rows: object[], external = IG) =>
  q<{ account_id: string; conversation_id: string; contact_id: string }>(
    "select * from public.ingest_messages('instagram', $1, $2::jsonb)", [external, JSON.stringify(rows)]);

describe.skipIf(!TEST_DB_URL)("database: inbox", () => {
  it("stores a message under a new conversation for the account, and asks for the contact's name once", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    const needs = await ingest(q, [row()]);
    expect(needs).toEqual([{ account_id: f.igAccount, conversation_id: expect.any(String), contact_id: "9001" }]);
    await asOwner(q);
    const [c] = await q("select * from public.conversations where account_id = $1", [f.igAccount]);
    expect(c).toMatchObject({ org_id: f.org, channel: "instagram", contact_id: "9001", status: "new", source: "direct", preview: "Sir fees kitni hai?" });
    expect(await q("select direction, body from public.messages where conversation_id = $1", [c.id])).toEqual([{ direction: "in", body: "Sir fees kitni hai?" }]);

    await asService(q);
    await q("select public.set_contact_profile($1, 'Rahul S', 'rahul_07')", [c.id]);
    expect(await ingest(q, [row({ mid: "mid.2" })])).toEqual([]);
  }));

  it("never stores the same message twice (Meta re-delivers) and tracks who spoke last", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    await ingest(q, [row(), row()]);
    await ingest(q, [row(), row({ mid: "mid.2", direction: "out", body: "₹499", sent_at: "2026-10-19T09:00:00Z" })]);
    await asOwner(q);
    const [c] = await q<{ id: string; last_incoming_at: Date; last_outgoing_at: Date; last_message_at: Date; preview: string }>(
      "select * from public.conversations where account_id = $1", [f.igAccount]);
    expect(await q("select count(*)::int as n from public.messages where conversation_id = $1", [c.id])).toEqual([{ n: 2 }]);
    expect(c.last_incoming_at.toISOString()).toBe("2026-10-19T08:00:00.000Z");
    expect(c.last_outgoing_at.toISOString()).toBe("2026-10-19T09:00:00.000Z");
    expect(c.last_message_at.toISOString()).toBe("2026-10-19T09:00:00.000Z");
    expect(c.preview).toBe("₹499");

    // An older message (backfill) doesn't move "last" or the preview, but does move "first".
    await asService(q);
    await ingest(q, [row({ mid: "mid.0", body: "Hello", sent_at: "2026-10-01T08:00:00Z" })]);
    await asOwner(q);
    const [c2] = await q<{ first_message_at: Date; preview: string }>("select * from public.conversations where id = $1", [c.id]);
    expect(c2.first_message_at.toISOString()).toBe("2026-10-01T08:00:00.000Z");
    expect(c2.preview).toBe("₹499");
  }));

  it("records an ad's id on chats that start from an ad, and shows attachments as [type]", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    await ingest(q, [row({ source: "ad", ad_id: "120231234567890", body: "", attachment: "image" })]);
    await asOwner(q);
    expect(await q("select source, ad_id, preview from public.conversations where account_id = $1", [f.igAccount]))
      .toEqual([{ source: "ad", ad_id: "120231234567890", preview: "[image]" }]);
  }));

  it("deletes the stored copy when the person unsends a message", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    await ingest(q, [row(), row({ mid: "mid.2" })]);
    await ingest(q, [row({ deleted: true, body: "", sent_at: "2026-10-19T10:00:00Z" })]);
    await asOwner(q);
    expect(await q("select m.external_id from public.messages m join public.conversations c on c.id = m.conversation_id where c.account_id = $1",
      [f.igAccount])).toEqual([{ external_id: "mid.2" }]);
  }));

  it("ignores messages for accounts nobody connected, and rejects bad input", () => withTx(async (q) => {
    await inboxFixture(q);
    await asService(q);
    expect(await ingest(q, [row()], "999")).toEqual([]);
    expect((await errorOf(q, "select * from public.ingest_messages('sms', $1, '[]'::jsonb)", [IG]))?.hint).toBe("invalid_input");
    expect((await errorOf(q, "select * from public.ingest_messages('instagram', $1, '{}'::jsonb)", [IG]))?.hint).toBe("invalid_input");
    expect(await errorOf(q, "select * from public.ingest_messages('instagram', $1, $2::jsonb)", [IG, JSON.stringify([row({ direction: "sideways" })])])).not.toBeNull();
    expect(await errorOf(q, "select * from public.ingest_messages('instagram', $1, $2::jsonb)", [IG, JSON.stringify([row({ source: "ad", ad_id: null })])])).not.toBeNull();
  }));

  it("only owners can read conversations and messages: not editors, staff, outsiders or anonymous visitors", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    await ingest(q, [row()]);
    await asUser(q, f.member);
    expect(await q("select id from public.conversations")).toHaveLength(1);
    expect(await q("select id from public.messages")).toHaveLength(1);
    for (const who of [f.editor, f.staff, f.outsider]) {
      await asUser(q, who);
      expect(await q("select id from public.conversations")).toHaveLength(0);
      expect(await q("select id from public.messages")).toHaveLength(0);
    }
    await asAnon(q);
    expect(await q("select id from public.conversations")).toHaveLength(0);
  }));

  it("nobody signed in can write messages directly or call the webhook's functions", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    const [{ conversation_id }] = await ingest(q, [row()]);
    await asUser(q, f.member);
    expect(await errorOf(q, "select * from public.ingest_messages('instagram', $1, $2::jsonb)", [IG, JSON.stringify([row({ mid: "x" })])])).not.toBeNull();
    expect(await errorOf(q, "select public.set_contact_profile($1, 'x', 'y')", [conversation_id])).not.toBeNull();
    expect(await errorOf(q, "insert into public.messages (org_id, conversation_id, external_id, direction, sent_at) values ($1, $2, 'x', 'in', now())",
      [f.org, conversation_id])).not.toBeNull();
    expect(await errorOf(q, "update public.conversations set status = 'bought'")).not.toBeNull();
  }));

  it("owners set a lead status; others can't, and only known statuses are accepted", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    const [{ conversation_id: id }] = await ingest(q, [row()]);
    await asUser(q, f.member);
    await q("select public.set_conversation_status($1, 'booked')", [id]);
    expect(await q("select status, status_updated_by from public.conversations where id = $1", [id])).toEqual([{ status: "booked", status_updated_by: f.member }]);
    expect((await errorOf(q, "select public.set_conversation_status($1, 'vip')", [id]))?.hint).toBe("invalid_status");
    for (const who of [f.editor, f.staff, f.outsider]) {
      await asUser(q, who);
      expect((await errorOf(q, "select public.set_conversation_status($1, 'bought')", [id]))?.hint).toBe("not_found");
    }
  }));

  it("the nightly clean-up deletes message text older than 12 months but keeps the conversation for the lead counts", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asService(q);
    const old = new Date(Date.now() - 400 * 86_400_000).toISOString(), recent = new Date(Date.now() - 86_400_000).toISOString();
    await ingest(q, [row({ mid: "old", sent_at: old }), row({ contact_id: "9002", mid: "new", sent_at: recent })]);
    await asOwner(q);
    // The live schema holds real chats too (rolled back with the test), so count every message past 12 months.
    const [{ due }] = await q<{ due: number }>("select count(*)::int as due from public.messages where sent_at < now() - interval '12 months'");
    expect(await q("select private.purge_old_messages(12) as n")).toEqual([{ n: due }]);
    expect(await q("select external_id from public.messages m join public.conversations c on c.id = m.conversation_id where c.account_id = $1",
      [f.igAccount])).toEqual([{ external_id: "new" }]);
    expect(await q("select contact_id, preview from public.conversations where account_id = $1 order by contact_id", [f.igAccount]))
      .toEqual([{ contact_id: "9001", preview: "" }, { contact_id: "9002", preview: "Sir fees kitni hai?" }]);
    expect(await q("select 1 from cron.job where jobname = 'messages-retention'")).toHaveLength(1);
  }));

  it("WhatsApp: a number connects as its own account, and the sender's WhatsApp name is stored (newest wins)", () => withTx(async (q) => {
    const f = await inboxFixture(q);
    await asOwner(q);
    const [{ id: wa }] = await q<{ id: string }>(
      "select public.upsert_connected_account($1, 'whatsapp', '123456789012345', '+91 76206 99213', 'EAAG-system-user-token-0123456789', null) as id", [f.org]);
    await asService(q);
    const send = (rows: object[]) => q("select * from public.ingest_messages('whatsapp', '123456789012345', $1::jsonb)", [JSON.stringify(rows)]);
    const waRow = (over: Record<string, unknown> = {}) => row({ contact_id: "919800000001", mid: "wamid.1", contact_name: "Parent A", ...over });
    expect(await send([waRow()])).toEqual([]); // named already: no lookup needed
    await send([waRow({ mid: "wamid.2", contact_name: "Parent A (Rahul's mom)", sent_at: "2026-10-19T09:00:00Z" })]);
    await send([waRow({ mid: "wamid.3", contact_name: null, sent_at: "2026-10-19T10:00:00Z" })]);
    await asUser(q, f.member);
    expect(await q("select channel, contact_id, contact_name from public.conversations where account_id = $1", [wa]))
      .toEqual([{ channel: "whatsapp", contact_id: "919800000001", contact_name: "Parent A (Rahul's mom)" }]);
    expect(await q("select count(*)::int as n from public.messages m join public.conversations c on c.id = m.conversation_id where c.account_id = $1", [wa]))
      .toEqual([{ n: 3 }]);
  }));
});
