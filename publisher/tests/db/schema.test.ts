import { describe, expect, it } from "vitest";
import { asAnon, asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx } from "../helpers/testdb";

// Skipped until a test database is configured (TEST_DATABASE_URL in .env.local).
describe.skipIf(!TEST_DB_URL)("database: tenancy and row-level security", () => {
  it("members see their org's posts; outsiders and anon see nothing", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    expect(await q("select id from public.posts where org_id = $1", [f.org])).toHaveLength(2);
    await asUser(q, f.outsider);
    expect(await q("select id from public.posts where org_id = $1", [f.org])).toHaveLength(0);
    expect(await q("select id from public.connected_accounts where org_id = $1", [f.org])).toHaveLength(0);
    await asAnon(q);
    expect(await q("select id from public.posts")).toHaveLength(0);
  }));

  it("signed-in users can't write tables directly; only through the functions", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    expect((await errorOf(q, "update public.posts set title = 'x' where id = $1", [f.post]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "insert into public.publications (org_id, post_id, platform) values ($1, $2, 'instagram')", [f.org, f.post]))?.message).toMatch(/permission denied/);
  }));

  it("the vault pointer is invisible to signed-in users, and they can't read tokens", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    expect(await q("select display_name from public.connected_accounts where id = $1", [f.igAccount])).toHaveLength(1);
    expect((await errorOf(q, "select secret_id from public.connected_accounts"))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select public.get_account_token($1)", [f.igAccount]))?.message).toMatch(/permission denied/);
  }));

  it("the service role can read the decrypted token", () => withTx(async (q) => {
    const f = await fixture(q);
    await asService(q);
    const [row] = await q<{ t: string }>("select public.get_account_token($1) as t", [f.igAccount]);
    expect(row.t).toBe("IGAA-test-token-0123456789");
  }));

  it("media paths must sit under the post's own org folder", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const err = await errorOf(q,
      `insert into public.posts (org_id, project_id, slug, kind, title, video_path) values ($1, $2, 'evil', 'reel', 'x', 'other-org/v.mp4')`, [f.org, f.project]);
    expect(err?.message).toMatch(/posts_media_in_org/);
  }));
});

describe.skipIf(!TEST_DB_URL)("database: approval", () => {
  it("a member approves a ready post: one pending publication per platform", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    const pubs = await q<{ platform: string; status: string }>("select * from public.approve_post($1, array['instagram'])", [f.post]);
    expect(pubs).toEqual([expect.objectContaining({ platform: "instagram", status: "pending" })]);
    const [post] = await q<{ status: string; approved_by: string }>("select status, approved_by from public.posts where id = $1", [f.post]);
    expect(post).toEqual({ status: "approved", approved_by: f.member });
  }));

  it("an outsider gets 'not found' (nothing leaks)", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.outsider);
    expect((await errorOf(q, "select * from public.approve_post($1, array['instagram'])", [f.post]))?.hint).toBe("not_found");
  }));

  it("refuses unconnected platforms, unsupported kinds and bad schedules", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    expect((await errorOf(q, "select * from public.approve_post($1, array['facebook'])", [f.post]))?.hint).toBe("not_connected");
    expect((await errorOf(q, "select * from public.approve_post($1, array['youtube'])", [f.carousel]))?.hint).toBe("unsupported_platform");
    expect((await errorOf(q, "select * from public.approve_post($1, array['instagram','instagram'])", [f.post]))?.hint).toBe("duplicate_platform");
    expect((await errorOf(q, "select * from public.approve_post($1, array['instagram'], now() - interval '1 minute')", [f.post]))?.hint).toBe("schedule_in_past");
    expect((await errorOf(q, "select * from public.approve_post($1, array['instagram'], now() + interval '80 days')", [f.post]))?.hint).toBe("schedule_too_far");
  }));

  it("approval freezes the captions; reject only works on ready posts", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'])", [f.post]);
    expect((await errorOf(q, "select public.update_post_captions($1, '{\"instagram\":\"changed\"}')", [f.post]))?.hint).toBe("not_ready");
    expect((await errorOf(q, "select public.reject_post($1, 'meh')", [f.post]))?.hint).toBe("not_ready");
    await q("select public.reject_post($1, 'not on brand')", [f.carousel]);
    const [c] = await q<{ status: string; reject_reason: string }>("select status, reject_reason from public.posts where id = $1", [f.carousel]);
    expect(c).toEqual({ status: "rejected", reject_reason: "not on brand" });
  }));

  it("unapprove works only while nothing has started", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'])", [f.post]);
    await q("select public.unapprove_post($1)", [f.post]);
    const [p] = await q<{ status: string }>("select status from public.posts where id = $1", [f.post]);
    expect(p.status).toBe("ready");
    await q("select * from public.approve_post($1, array['instagram'])", [f.post]);
    await asService(q);
    const [pub] = await q<{ id: string }>("select id from public.publications where post_id = $1", [f.post]);
    await q("select public.record_publication_event($1, 'processing', 'c1')", [pub.id]);
    await asUser(q, f.member);
    expect((await errorOf(q, "select public.unapprove_post($1)", [f.post]))?.hint).toBe("already_started");
  }));
});

describe.skipIf(!TEST_DB_URL)("database: publishing worker", () => {
  async function approved(q: Parameters<Parameters<typeof withTx>[0]>[0], scheduled = "null") {
    const f = await fixture(q);
    await asUser(q, f.member);
    const [pub] = await q<{ id: string }>(`select id from public.approve_post($1, array['instagram'], ${scheduled})`, [f.post]);
    await asService(q);
    return { f, pub: pub.id };
  }

  it("claims due work once (a lease blocks a second claim), and skips future schedules", () => withTx(async (q) => {
    const { pub } = await approved(q);
    const first = await q<{ id: string }>("select id from public.claim_due_publications(50)");
    expect(first.map((r) => r.id)).toContain(pub);
    const second = await q<{ id: string }>("select id from public.claim_due_publications(50)");
    expect(second.map((r) => r.id)).not.toContain(pub);
  }));

  it("does not claim a publication scheduled for later", () => withTx(async (q) => {
    const { pub } = await approved(q, "now() + interval '2 hours'");
    const claimed = await q<{ id: string }>("select id from public.claim_due_publications(50)");
    expect(claimed.map((r) => r.id)).not.toContain(pub);
  }));

  it("records started → published and settles the post as published", () => withTx(async (q) => {
    const { f, pub } = await approved(q);
    await q("select public.record_publication_event($1, 'processing', 'c1')", [pub]);
    await q("select public.record_publication_event($1, 'published', null, 'm1', 'https://www.instagram.com/reel/x/')", [pub]);
    const [p] = await q<{ status: string; attempts: number; permalink: string }>("select status, attempts, permalink from public.publications where id = $1", [pub]);
    expect(p).toEqual({ status: "published", attempts: 1, permalink: "https://www.instagram.com/reel/x/" });
    const [post] = await q<{ status: string }>("select status from public.posts where id = $1", [f.post]);
    expect(post.status).toBe("published");
  }));

  it("never lets a published publication change again", () => withTx(async (q) => {
    const { pub } = await approved(q);
    await q("select public.record_publication_event($1, 'processing', 'c1')", [pub]);
    await q("select public.record_publication_event($1, 'published', null, 'm1')", [pub]);
    expect((await errorOf(q, "select public.record_publication_event($1, 'failed', null, null, null, 'x')", [pub]))?.message).toMatch(/already published/);
    await asOwner(q);
    expect((await errorOf(q, "update public.publications set status = 'pending' where id = $1", [pub]))?.message).toMatch(/already published/);
  }));

  it("rejects skipped steps (pending → published)", () => withTx(async (q) => {
    const { pub } = await approved(q);
    expect((await errorOf(q, "select public.record_publication_event($1, 'published', null, 'm1')", [pub]))?.message).toMatch(/cannot go from pending to published/);
  }));

  it("a failure settles the post as failed; retry puts both back in flight", () => withTx(async (q) => {
    const { f, pub } = await approved(q);
    await q("select public.record_publication_event($1, 'failed', null, null, null, 'token expired')", [pub]);
    let [post] = await q<{ status: string }>("select status from public.posts where id = $1", [f.post]);
    expect(post.status).toBe("failed");
    await asUser(q, f.member);
    await q("select public.retry_publication($1)", [pub]);
    [post] = await q<{ status: string }>("select status from public.posts where id = $1", [f.post]);
    expect(post.status).toBe("approved");
    const [p] = await q<{ status: string; error: string | null }>("select status, error from public.publications where id = $1", [pub]);
    expect(p).toEqual({ status: "pending", error: null });
  }));

  it("signed-in users can't call worker functions", () => withTx(async (q) => {
    const { f, pub } = await approved(q);
    await asUser(q, f.member);
    expect((await errorOf(q, "select * from public.claim_due_publications(5)"))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select public.record_publication_event($1, 'processing', 'c')", [pub]))?.message).toMatch(/permission denied/);
  }));
});
