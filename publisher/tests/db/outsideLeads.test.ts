import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Leads from chats GoPost can't see (founder, 2026-10-21; migration 0018): e.g. WhatsApp chats on +91 91563 10546, the
// number the SPI ads point to, read in a Claude Code chat and added by `npm run leads:add`. Same list, same rules.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0018_outside_leads.sql");

/** Like withTx, but applies 0018 first while the live schema doesn't have it yet (it's rolled back with the test). */
const withOutside = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regprocedure('public.add_outside_leads(uuid, text, jsonb)') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const row = (over: Record<string, unknown> = {}) => ({
  name: null, contact: "+918208237618", course: "SPI mock test", lead_at: "2026-10-20T05:54:00Z", page: "+91 91563 10546",
  from_ad: true, reason: "Asked for the SPI mock test details from the ad", ...over,
});
const add = async (q: Q, org: string, channel: string, rows: object[]) =>
  (await q<{ n: number }>("select public.add_outside_leads($1, $2, $3::jsonb) as n", [org, channel, JSON.stringify(rows)]))[0].n;

describe.skipIf(!TEST_DB_URL)("database: leads from chats outside GoPost", () => {
  it("adds WhatsApp leads with no chat behind them, with the number they wrote to and the ad mark", () => withOutside(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await add(q, f.org, "whatsapp", [row(), row({ contact: "+919373431015", name: "Abhijeet Dodke", course: null, from_ad: false })])).toBe(2);
    await asOwner(q);
    expect(await q("select name, contact, course, channel, page, from_ad, conversation_id, reason from public.leads where org_id = $1 order by contact", [f.org])).toEqual([
      { name: null, contact: "+918208237618", course: "SPI mock test", channel: "whatsapp", page: "+91 91563 10546", from_ad: true, conversation_id: null, reason: "Asked for the SPI mock test details from the ad" },
      { name: "Abhijeet Dodke", contact: "+919373431015", course: null, channel: "whatsapp", page: "+91 91563 10546", from_ad: false, conversation_id: null, reason: "Asked for the SPI mock test details from the ad" },
    ]);
  }));

  it("skips a number that is already a lead, from any channel", () => withOutside(async (q) => {
    const f = await fixture(q);
    await asService(q);
    await q("select public.add_website_leads($1, $2::jsonb)", [f.org, JSON.stringify([{ name: "Web", contact: "+918208237618", course: null, lead_at: "2026-10-01T00:00:00Z", page: null }])]);
    expect(await add(q, f.org, "whatsapp", [row()])).toBe(0);
  }));

  it("refuses an unknown channel, an unknown organisation and bad rows, and only the import may add", () => withOutside(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await errorOf(q, "select public.add_outside_leads($1, 'sms', '[]'::jsonb)", [f.org])).toMatchObject({ hint: "invalid_input" });
    expect(await errorOf(q, "select public.add_outside_leads('00000000-0000-0000-0000-000000000000', 'whatsapp', '[]'::jsonb)")).toMatchObject({ hint: "not_found" });
    for (const bad of [row({ contact: "8208237618" }), row({ lead_at: null }), row({ reason: "x".repeat(301) })]) {
      expect(await errorOf(q, "select public.add_outside_leads($1, 'whatsapp', $2::jsonb)", [f.org, JSON.stringify([bad])])).not.toBeNull();
    }
    await asUser(q, f.member);
    expect(await errorOf(q, "select public.add_outside_leads($1, 'whatsapp', '[]'::jsonb)", [f.org])).toMatchObject({ code: "42501" });
  }));
});
