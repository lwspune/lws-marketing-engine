import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asAnon, asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Auto-reply to ad chats (founder, 2026-10-19; migration 0014). Owners save one reply per Instagram account and switch
// it on or off. The webhook (service role) claims a chat before sending: at most once per chat, never once anyone
// has replied, never while switched off. A failed send gives the claim back.

const IG = "17841400000000000";
const TEXT = "Please share your contact. Our counsellor will reach out to you.";

const row = (over: Record<string, unknown> = {}) => ({
  contact_id: "9001", mid: "mid.1", direction: "in", body: "Can I learn more about your business?", attachment: null,
  sent_at: "2026-10-19T08:00:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});
const ingest = (q: Q, rows: object[]) => q("select * from public.ingest_messages('instagram', $1, $2::jsonb)", [IG, JSON.stringify(rows)]);
const claim = (q: Q, contact = "9001") =>
  q<{ conversation_id: string; account_id: string; body: string }>("select * from public.claim_auto_reply('instagram', $1, $2)", [IG, contact]);

async function setup(q: Q, enabled = true) {
  const f = await fixture(q);
  await asUser(q, f.member);
  await q("select public.set_auto_reply($1, $2, $3)", [f.igAccount, enabled, TEXT]);
  return f;
}

describe.skipIf(!TEST_DB_URL)("database: auto-reply", () => {
  it("an owner saves the reply and switches it on; the text is trimmed and stored per account", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await q("select public.set_auto_reply($1, true, $2)", [f.igAccount, `  ${TEXT}  `]);
    expect(await q("select account_id, enabled, body, updated_by from public.auto_replies")).toEqual([
      { account_id: f.igAccount, enabled: true, body: TEXT, updated_by: f.member },
    ]);
    await q("select public.set_auto_reply($1, false, $2)", [f.igAccount, TEXT]);
    expect(await q("select enabled from public.auto_replies")).toEqual([{ enabled: false }]);
  }));

  it("refuses an empty or over-long reply, and accounts that aren't Instagram", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const [{ id: wa }] = await q<{ id: string }>(
      "select public.upsert_connected_account($1, 'whatsapp', '123456789012345', '+91 76206 99213', 'EAAG-system-user-token-0123456789', null) as id", [f.org]);
    await asUser(q, f.member);
    expect((await errorOf(q, "select public.set_auto_reply($1, true, '   ')", [f.igAccount]))?.hint).toBe("invalid_input");
    expect((await errorOf(q, "select public.set_auto_reply($1, true, $2)", [f.igAccount, "x".repeat(1001)]))?.hint).toBe("invalid_input");
    expect((await errorOf(q, "select public.set_auto_reply($1, true, $2)", [wa, TEXT]))?.hint).toBe("invalid_input");
    // The table holds the same rule, so nothing can slip past the function.
    await asOwner(q);
    expect(await errorOf(q, "insert into public.auto_replies (account_id, org_id, enabled, body) values ($1, $2, true, '')", [f.igAccount, f.org])).not.toBeNull();
  }));

  it("only owners see or change it: not editors, staff, outsiders or anonymous visitors", () => withTx(async (q) => {
    const f = await setup(q);
    await asOwner(q);
    const editor = randomUUID();
    await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [editor, `e-${editor.slice(0, 8)}@test.local`]);
    await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'editor')", [f.org, editor]);
    for (const who of [editor, f.outsider]) {
      await asUser(q, who);
      expect(await q("select 1 from public.auto_replies")).toHaveLength(0);
      expect((await errorOf(q, "select public.set_auto_reply($1, false, 'x')", [f.igAccount]))?.hint).toBe("not_found");
      expect(await errorOf(q, "update public.auto_replies set enabled = false")).not.toBeNull();
    }
    await asAnon(q);
    expect(await errorOf(q, "select public.set_auto_reply($1, false, 'x')", [f.igAccount])).not.toBeNull();
  }));

  it("hands out one claim per chat, with the saved text, and never a second", () => withTx(async (q) => {
    const f = await setup(q);
    await asService(q);
    await ingest(q, [row()]);
    const [c] = await claim(q);
    expect(c).toMatchObject({ account_id: f.igAccount, body: TEXT, conversation_id: expect.any(String) });
    expect(await claim(q)).toEqual([]);
    await asOwner(q);
    expect(await q("select auto_replied_at is not null as done from public.conversations where id = $1", [c.conversation_id])).toEqual([{ done: true }]);
  }));

  it("no claim while switched off, for a chat someone has replied to, or for an unknown chat", () => withTx(async (q) => {
    await setup(q, false);
    await asService(q);
    await ingest(q, [row(), row({ contact_id: "9002", mid: "mid.2" }), row({ contact_id: "9002", mid: "mid.3", direction: "out", body: "Hello!" })]);
    expect(await claim(q)).toEqual([]);
    await asOwner(q);
    await q("update public.auto_replies set enabled = true");
    await asService(q);
    expect(await claim(q, "9002")).toEqual([]);
    expect(await claim(q, "nobody")).toEqual([]);
    expect(await claim(q)).toHaveLength(1);
  }));

  it("a released claim (the send failed) can be claimed again", () => withTx(async (q) => {
    await setup(q);
    await asService(q);
    await ingest(q, [row()]);
    const [c] = await claim(q);
    await q("select public.release_auto_reply($1)", [c.conversation_id]);
    expect(await claim(q)).toHaveLength(1);
  }));

  it("nobody signed in can claim or release", () => withTx(async (q) => {
    const f = await setup(q);
    await asService(q);
    const [{ conversation_id }] = await ingest(q, [row()]) as { conversation_id: string }[];
    await asUser(q, f.member);
    expect(await errorOf(q, "select * from public.claim_auto_reply('instagram', $1, '9001')", [IG])).not.toBeNull();
    expect(await errorOf(q, "select public.release_auto_reply($1)", [conversation_id])).not.toBeNull();
  }));
});
