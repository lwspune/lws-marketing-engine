import { describe, expect, it } from "vitest";
import { asOwner, asService, asUser, errorOf, fixture, TEST_DB_URL, withTx, type Q } from "../helpers/testdb";

// Daily quiz Stories (migration 0006): one image, no caption, Instagram only, carrying the quiz it
// shows so the story-reply DM and the Telegram post can link the same quiz.

const QUIZ = JSON.stringify({
  publicSlug: "nda-maths-vectors-formula-1",
  title: "NDA Vectors — Formulas 1",
  chapter: "Vectors",
  links: { dm: "https://www.pyqvault.com/quiz/nda-maths-vectors-formula-1?utm_source=instagram&utm_medium=dm&utm_campaign=daily-quiz" },
});

async function insertStory(q: Q, org: string, project: string, over: Record<string, string | null> = {}) {
  const v = { slug: "daily-quiz-2026-10-19", image: `${org}/s/card.jpg`, quiz: QUIZ, planned: "2026-10-19T02:00:00Z", ...over };
  const [row] = await q<{ id: string }>(
    `insert into public.posts (org_id, project_id, slug, kind, title, cover_path, quiz, planned_for)
     values ($1, $2, $3, 'story', 'Daily quiz · Mon 19 Oct', $4, $5::jsonb, $6) returning id`,
    [org, project, v.slug, v.image, v.quiz, v.planned]);
  return row.id;
}

describe.skipIf(!TEST_DB_URL)("database: daily quiz stories", () => {
  it("a story is one image plus the quiz it shows", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertStory(q, f.org, f.project);
    const [row] = await q<{ kind: string; quiz: { publicSlug: string } }>("select kind, quiz from public.posts where id = $1", [id]);
    expect(row.kind).toBe("story");
    expect(row.quiz.publicSlug).toBe("nda-maths-vectors-formula-1");
  }));

  it("a story needs its image and its quiz", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    expect((await errorOf(q, `insert into public.posts (org_id, project_id, slug, kind, title, quiz) values ($1, $2, 'no-img', 'story', 'x', $3::jsonb)`,
      [f.org, f.project, QUIZ]))?.message).toMatch(/posts_media_shape/);
    expect((await errorOf(q, `insert into public.posts (org_id, project_id, slug, kind, title, cover_path) values ($1::uuid, $2, 'no-quiz', 'story', 'x', $1::text || '/s/c.jpg')`,
      [f.org, f.project]))?.message).toMatch(/posts_story_quiz/);
  }));

  it("only a story carries a quiz", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    expect((await errorOf(q, "update public.posts set quiz = $2::jsonb where id = $1", [f.post, QUIZ]))?.message).toMatch(/posts_story_quiz/);
  }));

  it("a story's image must be a JPEG (Instagram rejects PNG)", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const err = await errorOf(q,
      `insert into public.posts (org_id, project_id, slug, kind, title, cover_path, quiz) values ($1::uuid, $2, 'png', 'story', 'x', $1::text || '/s/c.png', $3::jsonb)`,
      [f.org, f.project, QUIZ]);
    expect(err?.message).toMatch(/posts_story_jpeg/);
  }));

  it("a story is approved for Instagram only", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertStory(q, f.org, f.project);
    await asUser(q, f.member);
    expect((await errorOf(q, "select * from public.approve_post($1, array['facebook'])", [id]))?.hint).toBe("unsupported_platform");
    const pubs = await q("select * from public.approve_post($1, array['instagram'], now() + interval '1 day')", [id]);
    expect(pubs).toHaveLength(1);
  }));

  it("a story's quiz is frozen once approved", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertStory(q, f.org, f.project);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'])", [id]);
    await asOwner(q);
    expect((await errorOf(q, `update public.posts set quiz = jsonb_set(quiz, '{publicSlug}', '"other"') where id = $1`, [id]))?.message)
      .toMatch(/can only be edited while ready/);
  }));

  it("stories never get a 48 h / 7 d scorecard (they're gone after 24 h)", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertStory(q, f.org, f.project);
    await asUser(q, f.member);
    const [pub] = await q<{ id: string }>("select id from public.approve_post($1, array['instagram'])", [id]);
    await asService(q);
    await q("select public.record_publication_event($1, 'processing', 'c1')", [pub.id]);
    await q("select public.record_publication_event($1, 'published', null, 'm1', null)", [pub.id]);
    await asOwner(q);
    await q("update public.publications set published_at = now() - interval '8 days' where id = $1", [pub.id]);
    await asService(q);
    const due = await q<{ publication_id: string }>("select publication_id from public.metrics_due(50)");
    expect(due.some((r) => r.publication_id === pub.id)).toBe(false);
  }));
});
