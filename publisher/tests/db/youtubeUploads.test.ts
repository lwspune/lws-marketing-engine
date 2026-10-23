import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// 0023: a YouTube upload's resumable session is saved before any bytes go, so a run that gets cut off
// resumes instead of posting the Short twice. Only the worker (service role) reads or writes it.

const URI = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&upload_id=ABC";

async function approvedYouTube(q: Q) {
  const f = await fixture(q);
  await asOwner(q);
  const [{ id: yt }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'youtube', 'UC-test', 'LWS Pune', '1//refresh-test-token-0123456789', null) as id", [f.org]);
  await q("select public.set_project_channel($1, 'youtube', $2)", [f.project, yt]);
  await q(`update public.posts set captions = captions || '{"youtube":{"title":"Q74 #shorts","description":"pyqvault.com"}}' where id = $1`, [f.post]);
  await asUser(q, f.member);
  const [{ id: pub }] = await q<{ id: string }>("select id from public.approve_post($1, array['youtube'], null)", [f.post]);
  await asService(q);
  return { f, pub };
}

describe.skipIf(!TEST_DB_URL)("database: YouTube upload sessions", () => {
  it("saves a session while pending and hands it back for the same attempt", () => withTx(async (q) => {
    const { pub } = await approvedYouTube(q);
    expect(await q("select * from public.upload_session($1)", [pub])).toEqual([]);
    await q("select public.save_upload_session($1, $2, 1000)", [pub, URI]);
    expect(await q("select session_uri, size_bytes::int as size from public.upload_session($1)", [pub])).toEqual([{ session_uri: URI, size: 1000 }]);
    await q("select public.save_upload_session($1, $2, 2000)", [pub, `${URI}2`]); // a fresh session replaces it
    expect(await q("select size_bytes::int as size from public.upload_session($1)", [pub])).toEqual([{ size: 2000 }]);
  }));

  it("refuses once the upload has started, bad links and sizes", () => withTx(async (q) => {
    const { pub } = await approvedYouTube(q);
    expect((await errorOf(q, "select public.save_upload_session($1, 'http://evil.example/x', 1000)", [pub]))?.hint).toBe("invalid_session");
    expect((await errorOf(q, "select public.save_upload_session($1, $2, 0)", [pub, URI]))?.hint).toBe("invalid_session");
    await q("select public.record_publication_event($1, 'processing', 'vid1')", [pub]);
    expect((await errorOf(q, "select public.save_upload_session($1, $2, 1000)", [pub, URI]))?.hint).toBe("invalid_transition");
  }));

  it("a retry starts with no session (the old one belongs to the failed attempt)", () => withTx(async (q) => {
    const { f, pub } = await approvedYouTube(q);
    await q("select public.save_upload_session($1, $2, 1000)", [pub, URI]);
    await q("select public.record_publication_event($1, 'processing', 'vid1')", [pub]);
    await q("select public.record_publication_event($1, 'failed', null, null, null, 'rejected: duplicate')", [pub]);
    await asUser(q, f.member);
    await q("select public.retry_publication($1)", [pub]);
    await asService(q);
    expect(await q("select * from public.upload_session($1)", [pub])).toEqual([]);
  }));

  // 0024: a reel can carry a YouTube copy of its video (end card "Subscribe for more" instead of "Follow for more").
  it("a reel's YouTube video lives in the org's folder and is frozen once approved", () => withTx(async (q) => {
    const { f } = await approvedYouTube(q);
    await asOwner(q);
    expect((await errorOf(q, "update public.posts set youtube_video_path = 'elsewhere/v-yt.mp4' where id = $1", [f.carousel]))?.message).toBeTruthy();
    expect((await errorOf(q, "update public.posts set youtube_video_path = $2 || '/c/v-yt.mp4' where id = $1", [f.carousel, f.org]))?.message)
      .toMatch(/posts_youtube_video/); // only reels
    expect((await errorOf(q, "update public.posts set youtube_video_path = $2 || '/p/v-yt.mp4' where id = $1", [f.post, f.org]))?.message)
      .toMatch(/only be edited while ready/); // the reel is approved
    const [{ id: ready }] = await q<{ id: string }>(
      `insert into public.posts (org_id, project_id, slug, kind, title, captions, video_path, youtube_video_path)
       values ($1::uuid, $2, 'reel-2', 'reel', 'Reel 2', '{}', $1::text || '/r/v.mp4', $1::text || '/r/v-yt.mp4') returning id`, [f.org, f.project]);
    expect(ready).toBeTruthy();
  }));

  it("signed-in users can neither read nor write sessions", () => withTx(async (q) => {
    const { f, pub } = await approvedYouTube(q);
    await q("select public.save_upload_session($1, $2, 1000)", [pub, URI]);
    await asUser(q, f.member);
    expect((await errorOf(q, "select * from public.upload_session($1)", [pub]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select public.save_upload_session($1, $2, 1000)", [pub, URI]))?.message).toMatch(/permission denied/);
    expect((await errorOf(q, "select * from private.upload_sessions"))?.message).toMatch(/permission denied/);
  }));
});
