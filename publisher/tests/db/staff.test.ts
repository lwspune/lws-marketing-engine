import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Fixture, type Q } from "../helpers/testdb";

// Staff (founder, 2026-10-18): a staff login sees only the projects it is given (e.g. an outside brand's own
// person sees just their project); owners and editors still see the whole organisation.

interface StaffFixture extends Fixture { staff: string; brand: string; brandIg: string; brandPost: string; adAccount: string }

async function staffFixture(q: Q): Promise<StaffFixture> {
  const f = await fixture(q);
  await asOwner(q);
  const staff = randomUUID();
  await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [staff, `s-${staff.slice(0, 8)}@test.local`]);
  await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'staff')", [f.org, staff]);
  const [{ id: brand }] = await q<{ id: string }>("insert into public.projects (org_id, slug, name) values ($1, 'brand', 'Brand') returning id", [f.org]);
  const [{ id: brandIg }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'instagram', '17841400000000001', '@brand', 'IGAA-test-token-brand-0123456789', null) as id", [f.org]);
  await q("select public.set_project_channel($1, 'instagram', $2)", [brand, brandIg]);
  const [{ id: brandPost }] = await q<{ id: string }>(
    `insert into public.posts (org_id, project_id, slug, kind, title, captions, video_path, cover_path)
     values ($1::uuid, $2, 'brand-1', 'reel', 'Brand 1', '{"instagram":"Hello"}', $1::text || '/b/v.mp4', $1::text || '/b/c.png') returning id`, [f.org, brand]);
  await q("insert into public.project_members (org_id, project_id, user_id) values ($1, $2, $3)", [f.org, brand, staff]);
  const [{ id: adAccount }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'meta_ads', 'act_779905330977080', 'LWS Pune ads', 'EAAB-test-token-0123456789', null) as id", [f.org]);
  await asService(q);
  const media = (id: string) => JSON.stringify([{ external_id: id, product_type: "REELS", media_type: "VIDEO", permalink: "https://www.instagram.com/reel/A/",
    caption: "x", posted_at: "2026-10-12T14:41:00Z", likes: 1, comments: 0, views: 10, reach: 8, saves: 0, shares: 0, avg_watch_ms: 5000, insights_error: null }]);
  await q("select public.upsert_account_media($1, $2::jsonb)", [f.igAccount, media("lws-1")]);
  await q("select public.upsert_account_media($1, $2::jsonb)", [brandIg, media("brand-1")]);
  return { ...f, staff, brand, brandIg, brandPost, adAccount };
}

const ids = async (q: Q, sql: string, params: unknown[] = []) => (await q<{ id: string }>(sql, params)).map((r) => r.id).sort();

describe.skipIf(!TEST_DB_URL)("database: staff see only their projects", () => {
  it("staff read their project, its posts, channels, account and reels, and nothing of the other projects", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asUser(q, f.staff);
    expect(await ids(q, "select id from public.projects where org_id = $1", [f.org])).toEqual([f.brand]);
    expect(await ids(q, "select id from public.posts where org_id = $1", [f.org])).toEqual([f.brandPost]);
    expect(await ids(q, "select project_id as id from public.project_channels where org_id = $1", [f.org])).toEqual([f.brand]);
    expect(await ids(q, "select id from public.connected_accounts where org_id = $1", [f.org])).toEqual([f.brandIg]);
    expect(await q("select external_id from public.account_media where org_id = $1", [f.org])).toEqual([{ external_id: "brand-1" }]);
  }));

  it("owners still see every project, account and reel in the organisation", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asUser(q, f.member);
    expect(await ids(q, "select id from public.projects where org_id = $1", [f.org])).toEqual([f.project, f.brand].sort());
    expect(await ids(q, "select id from public.connected_accounts where org_id = $1", [f.org])).toEqual([f.igAccount, f.brandIg, f.adAccount].sort());
    expect(await q("select external_id from public.account_media where org_id = $1", [f.org])).toHaveLength(2);
  }));

  it("staff with no project see nothing", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asOwner(q);
    await q("delete from public.project_members where user_id = $1", [f.staff]);
    await asUser(q, f.staff);
    expect(await q("select id from public.projects where org_id = $1", [f.org])).toHaveLength(0);
    expect(await q("select id from public.connected_accounts where org_id = $1", [f.org])).toHaveLength(0);
  }));

  it("staff approve their project's posts and see its publications, but can't act on other projects' posts", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asUser(q, f.staff);
    expect(await q("select * from public.approve_post($1, array['instagram'])", [f.brandPost])).toHaveLength(1);
    expect(await ids(q, "select post_id as id from public.publications where org_id = $1", [f.org])).toEqual([f.brandPost]);
    expect((await errorOf(q, "select * from public.approve_post($1, array['instagram'])", [f.post]))?.hint).toBe("not_found");
    expect((await errorOf(q, "select public.reject_post($1, null)", [f.post]))?.hint).toBe("not_found");
  }));

  it("staff see none of the ads and can't record ad outcomes", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asUser(q, f.staff);
    expect(await q("select id from public.connected_accounts where platform = 'meta_ads' and org_id = $1", [f.org])).toHaveLength(0);
    expect((await errorOf(q, "select public.set_ad_outcome($1, 'c1', '2026-10-12', 1, 1)", [f.adAccount]))?.hint).toBe("not_found");
  }));

  it("staff see only their own membership and can't give themselves more projects", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asUser(q, f.staff);
    expect((await q<{ user_id: string }>("select user_id from public.org_members where org_id = $1", [f.org])).map((r) => r.user_id)).toEqual([f.staff]);
    expect((await errorOf(q, "insert into public.project_members (org_id, project_id, user_id) values ($1, $2, $3)", [f.org, f.project, f.staff]))?.message)
      .toMatch(/permission denied/);
    expect((await errorOf(q, "update public.org_members set role = 'owner' where user_id = $1", [f.staff]))?.message).toMatch(/permission denied/);
  }));

  it("a project can only be given to a member of the same organisation", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asOwner(q);
    expect(await errorOf(q, "insert into public.project_members (org_id, project_id, user_id) values ($1, $2, $3)", [f.org, f.project, f.outsider])).not.toBeNull();
  }));

  it("staff can open their project's media files only", () => withTx(async (q) => {
    const f = await staffFixture(q);
    await asOwner(q);
    for (const [post, file] of [[f.post, "v.mp4"], [f.brandPost, "v.mp4"]]) {
      await q("insert into storage.objects (bucket_id, name) values ('media', $1)", [`${f.org}/${post}/${file}`]);
    }
    await asUser(q, f.staff);
    expect((await q<{ name: string }>("select name from storage.objects where bucket_id = 'media' and name like $1", [`${f.org}/%`])).map((r) => r.name))
      .toEqual([`${f.org}/${f.brandPost}/v.mp4`]);
    await asUser(q, f.member);
    expect(await q("select name from storage.objects where bucket_id = 'media' and name like $1", [`${f.org}/%`])).toHaveLength(2);
  }));
});
