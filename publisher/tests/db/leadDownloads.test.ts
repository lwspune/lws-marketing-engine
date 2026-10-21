import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asOwner, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Lead downloads (founder, 2026-10-21; migration 0020): each owner's downloads are recorded, so "new since your last
// download" knows where to start. Each person sees only their own; only the download function writes them.

const MIGRATION = path.resolve(__dirname, "../../supabase/migrations/0020_lead_downloads.sql");

/** Like withTx, but applies 0020 first while the live schema doesn't have it yet (it's rolled back with the test). */
const withDownloads = (fn: (q: Q) => Promise<void>) => withTx(async (q) => {
  const [{ missing }] = await q<{ missing: boolean }>("select to_regclass('public.lead_downloads') is null as missing");
  if (missing) await q(readFileSync(MIGRATION, "utf8"));
  await fn(q);
});

const record = (q: Q, kind: string, count: number, since: string | null, at: string) =>
  q("select public.record_lead_download($1, $2, $3, $4)", [kind, count, since, at]);

describe.skipIf(!TEST_DB_URL)("database: lead downloads", () => {
  it("records an owner's downloads; the latest is their download point", () => withDownloads(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await record(q, "all", 219, null, "2026-10-01T09:00:00Z");
    await record(q, "new", 3, "2026-10-01T09:00:00Z", "2026-10-01T10:00:00Z");
    const rows = await q<{ kind: string; lead_count: number; downloaded_at: Date }>(
      "select kind, lead_count, downloaded_at from public.lead_downloads order by downloaded_at desc");
    expect(rows.map((r) => [r.kind, r.lead_count, r.downloaded_at.toISOString()])).toEqual([
      ["new", 3, "2026-10-01T10:00:00.000Z"], ["all", 219, "2026-10-01T09:00:00.000Z"],
    ]);
  }));

  it("shows each person only their own downloads, and nobody can write them directly", () => withDownloads(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await record(q, "all", 5, null, "2026-10-01T09:00:00Z");
    expect(await errorOf(q, "insert into public.lead_downloads (user_id, kind, lead_count, downloaded_at) values ($1, 'all', 1, now())", [f.member]))
      .not.toBeNull();
    await asOwner(q);
    const other = randomUUID();
    await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [other, `x-${other.slice(0, 8)}@test.local`]);
    await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'owner')", [f.org, other]);
    await asUser(q, other);
    expect(await q("select * from public.lead_downloads")).toEqual([]);
  }));

  it("refuses non-owners and impossible downloads", () => withDownloads(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.outsider);
    expect(await errorOf(q, "select public.record_lead_download('all', 1, null, now())")).toMatchObject({ hint: "forbidden" });
    await asUser(q, f.member);
    for (const [kind, count, since, at] of [
      ["some", 1, null, "2026-10-01T09:00:00Z"],
      ["all", -1, null, "2026-10-01T09:00:00Z"],
      ["new", 1, "2026-10-01T10:00:00Z", "2026-10-01T09:00:00Z"],
      ["all", 1, null, "2999-01-01T00:00:00Z"],
    ] as const) {
      expect(await errorOf(q, "select public.record_lead_download($1, $2, $3, $4)", [kind, count, since, at]), `${kind} ${count}`).not.toBeNull();
    }
  }));
});
