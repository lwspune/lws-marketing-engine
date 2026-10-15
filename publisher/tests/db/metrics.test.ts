import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// A published Instagram publication whose go-live time is pushed `hoursAgo` into the past.
async function publishedHoursAgo(q: Q, hoursAgo: number) {
  const f = await fixture(q);
  await asUser(q, f.member);
  const [pub] = await q<{ id: string }>("select id from public.approve_post($1, array['instagram'])", [f.post]);
  await asService(q);
  await q("select public.record_publication_event($1, 'processing', 'c1')", [pub.id]);
  await q("select public.record_publication_event($1, 'published', null, 'm1', 'https://www.instagram.com/reel/x/')", [pub.id]);
  await asOwner(q);
  await q("update public.publications set published_at = now() - make_interval(hours => $2) where id = $1", [pub.id, hoursAgo]);
  await asService(q);
  return { f, pub: pub.id };
}

const due = async (q: Q, pubId: string) =>
  (await q<{ publication_id: string; snapshot: string }>("select publication_id, snapshot from public.metrics_due(50)"))
    .filter((r) => r.publication_id === pubId).map((r) => r.snapshot);

describe.skipIf(!TEST_DB_URL)("database: scorecard snapshots", () => {
  it("nothing is due before 48 hours", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 47);
    expect(await due(q, pub)).toEqual([]);
  }));

  it("48h is due after 48 hours and disappears once recorded", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 49);
    expect(await due(q, pub)).toEqual(["48h"]);
    await q("select public.record_publication_metrics($1, '48h', 1500, 900, 9, 3, 55, 4, 9870, null, '{}')", [pub]);
    expect(await due(q, pub)).toEqual([]);
  }));

  it("after 7 days both are due when neither was taken", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 8 * 24);
    expect((await due(q, pub)).sort()).toEqual(["48h", "7d"]);
  }));

  it("a snapshot is stored once (a second record is ignored) and can't be edited", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 49);
    await q("select public.record_publication_metrics($1, '48h', 1500, null, 9, null, null, null, null, null, '{}')", [pub]);
    await q("select public.record_publication_metrics($1, '48h', 99999, null, 0, null, null, null, null, null, '{}')", [pub]);
    const rows = await q<{ views: string }>("select views from public.publication_metrics where publication_id = $1", [pub]);
    expect(rows).toEqual([{ views: "1500" }]);
    await asOwner(q);
    expect((await errorOf(q, "update public.publication_metrics set views = 1 where publication_id = $1", [pub]))?.message).toMatch(/write-once/);
  }));

  it("records a failure reason with no numbers", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 49);
    await q("select public.record_publication_metrics($1, '48h', null, null, null, null, null, null, null, 'Media does not exist', '{}')", [pub]);
    const [row] = await q<{ views: string | null; error: string }>("select views, error from public.publication_metrics where publication_id = $1", [pub]);
    expect(row).toEqual({ views: null, error: "Media does not exist" });
  }));

  it("rejects negative numbers and unknown snapshot labels", () => withTx(async (q) => {
    const { pub } = await publishedHoursAgo(q, 49);
    expect(await errorOf(q, "select public.record_publication_metrics($1, '48h', -5, null, null, null, null, null, null, null, '{}')", [pub])).not.toBeNull();
    expect(await errorOf(q, "select public.record_publication_metrics($1, '3d', 5, null, null, null, null, null, null, null, '{}')", [pub])).not.toBeNull();
  }));

  it("members read their snapshots; outsiders see none; users can't call the worker functions", () => withTx(async (q) => {
    const { f, pub } = await publishedHoursAgo(q, 49);
    await q("select public.record_publication_metrics($1, '48h', 1500, null, 9, null, null, null, null, null, '{}')", [pub]);
    await asUser(q, f.member);
    expect(await q("select views from public.publication_metrics where publication_id = $1", [pub])).toHaveLength(1);
    expect((await errorOf(q, "select * from public.metrics_due(5)"))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "insert into public.publication_metrics (org_id, publication_id, snapshot) values ($1, $2, '7d')", [f.org, pub]))?.message).toMatch(/permission denied/);
    await asUser(q, f.outsider);
    expect(await q("select views from public.publication_metrics where publication_id = $1", [pub])).toHaveLength(0);
  }));
});
