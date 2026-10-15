import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

const row = (over: Record<string, unknown> = {}) => ({
  external_id: "m1", product_type: "REELS", media_type: "VIDEO", permalink: "https://www.instagram.com/reel/A/",
  caption: "Q74 #NDA", posted_at: "2026-10-12T14:41:00Z", likes: 10, comments: 1, views: 1071, reach: 831,
  saves: 4, shares: 3, avg_watch_ms: 6900, insights_error: null, ...over,
});

async function upsert(q: Q, account: string, rows: object[]) {
  const [r] = await q<{ n: number }>("select public.upsert_account_media($1, $2::jsonb) as n", [account, JSON.stringify(rows)]);
  return r.n;
}

describe.skipIf(!TEST_DB_URL)("database: account-wide insights", () => {
  it("the service role stores reels; a second sync updates instead of duplicating", () => withTx(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await upsert(q, f.igAccount, [row(), row({ external_id: "m2", views: 50 })])).toBe(2);
    await upsert(q, f.igAccount, [row({ views: 2000 })]);
    const rows = await q<{ external_id: string; views: string }>("select external_id, views from public.account_media where account_id = $1 order by external_id", [f.igAccount]);
    expect(rows).toEqual([{ external_id: "m1", views: "2000" }, { external_id: "m2", views: "50" }]);
  }));

  it("rejects negative numbers and non-https links", () => withTx(async (q) => {
    const f = await fixture(q);
    await asService(q);
    expect(await errorOf(q, "select public.upsert_account_media($1, $2::jsonb)", [f.igAccount, JSON.stringify([row({ views: -1 })])])).not.toBeNull();
    expect(await errorOf(q, "select public.upsert_account_media($1, $2::jsonb)", [f.igAccount, JSON.stringify([row({ permalink: "http://x" })])])).not.toBeNull();
  }));

  it("members read their account's reels; outsiders see none; nobody signed in can write", () => withTx(async (q) => {
    const f = await fixture(q);
    await asService(q); await upsert(q, f.igAccount, [row()]);
    await asUser(q, f.member);
    expect(await q("select external_id from public.account_media where org_id = $1", [f.org])).toHaveLength(1);
    expect((await errorOf(q, "select public.upsert_account_media($1, $2::jsonb)", [f.igAccount, JSON.stringify([row()])]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "update public.account_media set views = 1 where org_id = $1", [f.org]))?.message).toMatch(/permission denied/);
    await asUser(q, f.outsider);
    expect(await q("select external_id from public.account_media where org_id = $1", [f.org])).toHaveLength(0);
  }));

  it("an Instagram account is due for a sync when never synced or not within the window", () => withTx(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const due = async () => (await q<{ account_id: string }>("select account_id from public.insights_sync_due(20)")).map((r) => r.account_id);
    expect(await due()).toContain(f.igAccount);
    await upsert(q, f.igAccount, [row()]);
    expect(await due()).not.toContain(f.igAccount);
    await asOwner(q);
    await q("update public.account_media set refreshed_at = now() - interval '21 hours' where account_id = $1", [f.igAccount]);
    await asService(q);
    expect(await due()).toContain(f.igAccount);
  }));
});
