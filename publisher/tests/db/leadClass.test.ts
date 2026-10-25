import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// A lead's class (founder, 2026-10-25; migration 0027): filled from the NDA age calculator's "Class Level", typed in by an
// owner for any other lead. The calculator leads imported before the column existed get it from their note.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0027_lead_class.sql");
const SHEET = "1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcdEFGH";

const withClass = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>(
    "select not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'class_level') as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const lead = (over: Record<string, unknown> = {}) => ({
  name: "Test Student", contact: "+919800000001", course: "NDA", class_level: "12 passed", lead_at: "2026-10-25T04:21:06Z", from_ad: false,
  reason: "NDA age calculator: age 17.9, class 12passed, 2 attempts (NDA I 2026, NDA II 2026)", ...over,
});
const classOf = async (q: Q, org: string, contact = "+919800000001") =>
  (await q<{ class_level: string | null }>("select class_level from public.leads where org_id = $1 and contact = $2", [org, contact]))[0]?.class_level;

describe.skipIf(!TEST_DB_URL)("database: a lead's class", () => {
  it("the sheet import and the outside-leads import store the class they're given", () => withClass(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const [{ id: sheet }] = await q<{ id: string }>("select public.add_lead_sheet($1, $2, 'Age Calculator', 'age_calculator', 'lwspune.com NDA age calculator') as id", [f.org, SHEET]);
    await q("select public.import_sheet_rows($1, 2, 3, $2::jsonb)", [sheet, JSON.stringify([lead()])]);
    await q("select public.add_outside_leads($1, 'whatsapp', $2::jsonb)", [f.org, JSON.stringify([lead({ contact: "+919800000002", class_level: null })])]);
    expect(await classOf(q, f.org)).toBe("12 passed");
    expect(await classOf(q, f.org, "+919800000002")).toBeNull();
  }));

  it("owners change or clear it with Edit; an edit that doesn't mention class leaves it alone", () => withClass(async (q) => {
    const f = await fixture(q);
    await asService(q);
    await q("select public.add_outside_leads($1, 'website', $2::jsonb)", [f.org, JSON.stringify([lead()])]);
    const [{ id }] = await q<{ id: string }>("select id from public.leads where org_id = $1", [f.org]);
    await asUser(q, f.member);
    await q("select public.update_lead($1, 'Test Student', 'NDA', '11')", [id]);
    expect(await classOf(q, f.org)).toBe("11");
    await q("select public.update_lead(p_lead => $1, p_name => 'Renamed', p_course => 'NDA')", [id]);
    expect(await classOf(q, f.org)).toBe("11");
    await q("select public.update_lead($1, 'Renamed', 'NDA', '  ')", [id]);
    expect(await classOf(q, f.org)).toBeNull();
    expect(await errorOf(q, "select public.update_lead($1, 'x', 'NDA', $2)", [id, "x".repeat(21)])).toMatchObject({ hint: "invalid_input" });
    await asUser(q, f.outsider);
    expect(await errorOf(q, "select public.update_lead($1, 'x', 'NDA', '9')", [id])).toMatchObject({ hint: "not_found" });
  }));

  it("reads the class back out of a calculator lead's note (the backfill)", () => withClass(async (q) => {
    const cases: [string, string | null][] = [
      ["NDA age calculator: age 17.9, class 12passed, 2 attempts (NDA I 2026, NDA II 2026)", "12 passed"],
      ["NDA age calculator: age 15.3, class 10, 4 attempts (NDA II 2027, NDA I 2028)", "10"],
      ["NDA age calculator: age 16, class 11", "11"],
      ["Shared a phone number", null],
    ];
    for (const [reason, want] of cases) {
      expect((await q<{ c: string | null }>("select private.class_from_note($1) as c", [reason]))[0].c, reason).toBe(want);
    }
  }));
});
