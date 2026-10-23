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

});

// Question stories (migration 0019): a story shows either a quiz link or one question with its answer.
const QUESTION = JSON.stringify({ id: "047abe4b-6c21-47e9-b26e-4d6e74258b74", answer: "D", part: "question" });

async function insertQuestionStory(q: Q, org: string, project: string, question = QUESTION) {
  const [row] = await q<{ id: string }>(
    `insert into public.posts (org_id, project_id, slug, kind, title, cover_path, question, planned_for)
     values ($1::uuid, $2, 'maths-q-2026-10-26', 'story', 'Maths question · Mon 26 Oct', $1::text || '/s/card.jpg', $3::jsonb, '2026-10-26T02:00:00Z') returning id`,
    [org, project, question]);
  return row.id;
}

describe.skipIf(!TEST_DB_URL)("database: question stories", () => {
  it("a story can show one question instead of a quiz", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertQuestionStory(q, f.org, f.project);
    const [row] = await q<{ quiz: unknown; question: { answer: string } }>("select quiz, question from public.posts where id = $1", [id]);
    expect(row.quiz).toBeNull();
    expect(row.question.answer).toBe("D");
  }));

  it("a story shows a quiz or a question, never both", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const err = await errorOf(q,
      `insert into public.posts (org_id, project_id, slug, kind, title, cover_path, quiz, question) values ($1::uuid, $2, 'both', 'story', 'x', $1::text || '/s/c.jpg', $3::jsonb, $4::jsonb)`,
      [f.org, f.project, QUIZ, QUESTION]);
    expect(err?.message).toMatch(/posts_story_quiz/);
  }));

  it("only a story carries a question", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    expect((await errorOf(q, "update public.posts set question = $2::jsonb where id = $1", [f.post, QUESTION]))?.message).toMatch(/posts_story_quiz/);
  }));

  it("the question names its id, an answer A–D and which card it is", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    for (const bad of [{ answer: "D", part: "question" }, { id: "x", answer: "E", part: "question" }, { id: "x", answer: "D", part: "hint" }, ["D"]]) {
      expect((await errorOf(q,
        `insert into public.posts (org_id, project_id, slug, kind, title, cover_path, question) values ($1::uuid, $2, 'bad', 'story', 'x', $1::text || '/s/c.jpg', $3::jsonb)`,
        [f.org, f.project, JSON.stringify(bad)]))?.message, JSON.stringify(bad)).toMatch(/posts_story_question/);
    }
  }));

  it("a story's question is frozen once approved", () => withTx(async (q) => {
    const f = await fixture(q);
    await asOwner(q);
    const id = await insertQuestionStory(q, f.org, f.project);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'])", [id]);
    await asOwner(q);
    expect((await errorOf(q, `update public.posts set question = jsonb_set(question, '{answer}', '"A"') where id = $1`, [id]))?.message)
      .toMatch(/can only be edited while ready/);
  }));
});

// Story scorecard (migration 0015): one snapshot at 23 hours, an hour before Instagram deletes the story.
async function publishedStory(q: Q, hoursAgo: number) {
  const f = await fixture(q);
  await asOwner(q);
  const id = await insertStory(q, f.org, f.project);
  await asUser(q, f.member);
  const [pub] = await q<{ id: string }>("select id from public.approve_post($1, array['instagram'])", [id]);
  await asService(q);
  await q("select public.record_publication_event($1, 'processing', 'c1')", [pub.id]);
  await q("select public.record_publication_event($1, 'published', null, 'm1', null)", [pub.id]);
  await asOwner(q);
  await q("update public.publications set published_at = now() - make_interval(mins => $2) where id = $1", [pub.id, Math.round(hoursAgo * 60)]);
  await asService(q);
  return { f, pub: pub.id };
}
const dueFor = async (q: Q, pubId: string) =>
  (await q<{ publication_id: string; snapshot: string }>("select publication_id, snapshot from public.metrics_due(50)"))
    .filter((r) => r.publication_id === pubId).map((r) => r.snapshot);
const STORY_ROW = "select public.record_story_metrics($1, 206, 163, 0, 0, 1, 17, 115, null, '{}')";

describe.skipIf(!TEST_DB_URL)("database: story scorecard", () => {
  it("nothing is due before 23 hours", () => withTx(async (q) => {
    const { pub } = await publishedStory(q, 22);
    expect(await dueFor(q, pub)).toEqual([]);
  }));

  it("23h is due after 23 hours, and a story never gets 48 h / 7 d", () => withTx(async (q) => {
    expect(await dueFor(q, (await publishedStory(q, 23.5)).pub)).toEqual(["23h"]);
    expect(await dueFor(q, (await publishedStory(q, 8 * 24)).pub)).toEqual(["23h"]);
  }));

  it("stores the story's numbers once and they can't be edited", () => withTx(async (q) => {
    const { pub } = await publishedStory(q, 23.5);
    await q(STORY_ROW, [pub]);
    await q("select public.record_story_metrics($1, 1, 1, 1, 1, 1, 1, 1, null, '{}')", [pub]);
    const rows = await q("select snapshot, views, reach, replies, follows, profile_visits, exits from public.publication_metrics where publication_id = $1", [pub]);
    expect(rows).toEqual([{ snapshot: "23h", views: "206", reach: "163", replies: "0", follows: "1", profile_visits: "17", exits: "115" }]);
    expect(await dueFor(q, pub)).toEqual([]);
    await asOwner(q);
    expect((await errorOf(q, "update public.publication_metrics set reach = 1 where publication_id = $1", [pub]))?.message).toMatch(/write-once/);
  }));

  it("an expired story is stored with its reason and no numbers", () => withTx(async (q) => {
    const { pub } = await publishedStory(q, 30);
    await q("select public.record_story_metrics($1, null, null, null, null, null, null, null, 'Object does not exist', '{}')", [pub]);
    const [row] = await q("select reach, error from public.publication_metrics where publication_id = $1", [pub]);
    expect(row).toEqual({ reach: null, error: "Object does not exist" });
  }));

  it("23h is for stories only, and story numbers only on 23h", () => withTx(async (q) => {
    const { f, pub } = await publishedStory(q, 49);
    expect((await errorOf(q, "select public.record_publication_metrics($1, '48h', 5, null, null, null, null, null, null, null, '{}')", [pub]))?.message)
      .toMatch(/23h snapshot is for stories/);
    await asUser(q, f.member);
    const [reel] = await q<{ id: string }>("select id from public.approve_post($1, array['instagram'])", [f.post]);
    await asService(q);
    await q("select public.record_publication_event($1, 'processing', 'c9')", [reel.id]);
    await q("select public.record_publication_event($1, 'published', null, 'm9', null)", [reel.id]);
    expect((await errorOf(q, STORY_ROW, [reel.id]))?.message).toMatch(/23h snapshot is for stories/);
    await asOwner(q);
    expect((await errorOf(q, "insert into public.publication_metrics (org_id, publication_id, snapshot, follows) values ($1, $2, '48h', 3)", [f.org, reel.id]))?.message)
      .toMatch(/publication_metrics_story_columns/);
  }));

  it("rejects negative numbers; only the worker can record", () => withTx(async (q) => {
    const { f, pub } = await publishedStory(q, 23.5);
    expect(await errorOf(q, "select public.record_story_metrics($1, null, null, null, -1, null, null, null, null, '{}')", [pub])).not.toBeNull();
    await asUser(q, f.member);
    expect((await errorOf(q, STORY_ROW, [pub]))?.message).toMatch(/permission denied/);
  }));
});

// Founder, 2026-10-23: the quiz stories brought no leads, so @lws.pune posts NDA maths questions
// (stories/lwspune/) instead, and the Saturday quiz planner no longer runs (migration 0022).
describe.skipIf(!TEST_DB_URL)("database: the weekly quiz story planner", () => {
  it("is switched off: nothing queues quiz stories on Saturdays", () => withTx(async (q) => {
    expect(await q("select 1 from cron.job where jobname = 'stories-weekly'")).toHaveLength(0);
  }));
});
