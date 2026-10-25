import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Leads from Google Sheets that the website fills (founder, 2026-10-25; migration 0026): the NDA age calculator and the
// popup form. The hourly job reads each tab's new rows and imports them with the row marker in one step, so a run cut
// off half way never skips rows or adds them twice. Same leads list and rules as every other import.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0026_lead_sheets.sql");
const SHEET = "1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcdEFGH";

const withSheets = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regclass('public.lead_sheets') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const lead = (over: Record<string, unknown> = {}) => ({
  name: "Test Student", contact: "+919800000001", course: "NDA", lead_at: "2026-10-25T04:21:06Z", from_ad: false,
  reason: "NDA age calculator: age 17.9, class 12passed, 2 attempts (NDA I 2026, NDA II 2026)", ...over,
});
const addSheet = async (q: Q, org: string, tab = "Age Calculator") =>
  (await q<{ id: string }>("select public.add_lead_sheet($1, $2, $3, 'age_calculator', 'lwspune.com NDA age calculator') as id", [org, SHEET, tab]))[0].id;
const importRows = async (q: Q, sheet: string, from: number, next: number, rows: object[]) =>
  (await q<{ n: number }>("select public.import_sheet_rows($1, $2, $3, $4::jsonb) as n", [sheet, from, next, JSON.stringify(rows)]))[0].n;

describe.skipIf(!TEST_DB_URL)("database: lead sheets", () => {
  it("imports a tab's new rows as website leads with the sheet's page, and moves its row marker in the same step", () => withSheets(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const sheet = await addSheet(q, f.org);
    expect(await importRows(q, sheet, 2, 5, [lead(), lead({ contact: "+919800000002", name: null })])).toBe(2);
    await asOwner(q);
    expect(await q("select channel, page, course, contact from public.leads where org_id = $1 order by contact", [f.org])).toEqual([
      { channel: "website", page: "lwspune.com NDA age calculator", course: "NDA", contact: "+919800000001" },
      { channel: "website", page: "lwspune.com NDA age calculator", course: "NDA", contact: "+919800000002" },
    ]);
    const [s] = await q<{ next_row: number; last_error: string | null; last_synced_at: Date | null }>("select * from public.lead_sheets where id = $1", [sheet]);
    expect(s).toMatchObject({ next_row: 5, last_error: null });
    expect(s.last_synced_at).not.toBeNull();
  }));

  it("refuses rows that don't start at the marker (another run got there first), adding nothing", () => withSheets(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const sheet = await addSheet(q, f.org);
    await importRows(q, sheet, 2, 5, [lead()]);
    expect(await errorOf(q, "select public.import_sheet_rows($1, 2, 6, $2::jsonb)", [sheet, JSON.stringify([lead({ contact: "+919800000003" })])]))
      .toMatchObject({ hint: "conflict" });
    expect(await errorOf(q, "select public.import_sheet_rows($1, 5, 4, '[]'::jsonb)", [sheet])).toMatchObject({ hint: "invalid_input" });
    await asOwner(q);
    expect(await q("select count(*)::int as n from public.leads where org_id = $1", [f.org])).toEqual([{ n: 1 }]);
  }));

  it("skips numbers already on the list, and a run with no new rows still marks the sheet synced and clears its error", () => withSheets(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const sheet = await addSheet(q, f.org);
    await importRows(q, sheet, 2, 3, [lead()]);
    expect(await importRows(q, sheet, 3, 4, [lead({ lead_at: "2026-10-26T00:00:00Z" })])).toBe(0);
    await q("select public.record_sheet_error($1, 'Missing column: Mobile Number')", [sheet]);
    await asOwner(q);
    expect(await q("select last_error, next_row from public.lead_sheets where id = $1", [sheet])).toEqual([{ last_error: "Missing column: Mobile Number", next_row: 4 }]);
    await asService(q);
    expect(await importRows(q, sheet, 4, 4, [])).toBe(0);
    await asOwner(q);
    expect(await q("select last_error from public.lead_sheets where id = $1", [sheet])).toEqual([{ last_error: null }]);
  }));

  it("adding the same tab twice keeps one entry; bad sheet ids, kinds and pages are refused", () => withSheets(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await addSheet(q, f.org)).toBe(await addSheet(q, f.org));
    expect(await errorOf(q, "select public.add_lead_sheet($1, 'not a sheet id!', 'Tab', 'age_calculator', 'p')", [f.org])).not.toBeNull();
    expect(await errorOf(q, "select public.add_lead_sheet($1, $2, 'Tab', 'survey', 'p')", [f.org, SHEET])).not.toBeNull();
    expect(await errorOf(q, "select public.add_lead_sheet($1, $2, 'Tab', 'popup_form', '')", [f.org, SHEET])).not.toBeNull();
  }));

  it("owners can read the sheets' status; nobody signed in can change it", () => withSheets(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const sheet = await addSheet(q, f.org);
    await asUser(q, f.member);
    expect(await q("select tab from public.lead_sheets where id = $1", [sheet])).toEqual([{ tab: "Age Calculator" }]);
    expect(await errorOf(q, "select public.import_sheet_rows($1, 2, 3, '[]'::jsonb)", [sheet])).toMatchObject({ code: "42501" });
    expect(await errorOf(q, "update public.lead_sheets set next_row = 99 where id = $1", [sheet])).toMatchObject({ code: "42501" });
    await asUser(q, f.outsider);
    expect(await q("select tab from public.lead_sheets where id = $1", [sheet])).toEqual([]);
  }));
});
