"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Q = require("../stories/questions.js");

const ID = "047abe4b-6c21-47e9-b26e-4d6e74258b74";

function day(over = {}) {
  return {
    date: "2026-10-26",
    questionId: ID,
    chapter: "Matrices",
    question: "If \\(A = \\begin{bmatrix} 1 & 2 \\\\ -5 & 1 \\end{bmatrix}\\), then \\(|A| =\\)",
    options: [
      { label: "A", text: "\\(-9\\)" },
      { label: "B", text: "\\(9\\)" },
      { label: "C", text: "\\(11\\)" },
      { label: "D", text: "\\(-11\\)" },
    ],
    answer: "C",
    step: "\\(|A| = 1\\cdot 1 - 2\\cdot(-5) = 11\\)",
    checked: "Re-derived: 1 − (−10) = 11.",
    ...over,
  };
}
const batch = (days = [day()]) => ({ week: "2026-w44", days });

test("segments splits text and inline/display maths, in order", () => {
  assert.deepEqual(Q.segments("Find \\(x^2\\) if \\[x = 3\\] now"), [
    { math: false, text: "Find " },
    { math: true, tex: "x^2", display: false },
    { math: false, text: " if " },
    { math: true, tex: "x = 3", display: true },
    { math: false, text: " now" },
  ]);
  assert.deepEqual(Q.segments("plain"), [{ math: false, text: "plain" }]);
});

test("segments refuses unclosed maths", () => {
  assert.throws(() => Q.segments("Find \\(x^2 now"), /unclosed/);
});

test("a good batch has no problems", () => {
  assert.deepEqual(Q.validateBatch(batch()), []);
});

test("the cards never name an exam (founder 2026-10-21: just the question and options)", () => {
  assert.deepEqual(Q.examMentions("MHT-CET 2024 asked this"), ["MHT-CET"]);
  assert.deepEqual(Q.examMentions("a JEE Main PYQ"), ["JEE", "PYQ"]);
  assert.deepEqual(Q.examMentions("Find the determinant"), []);
  const p = Q.validateBatch(batch([day({ question: "MHT CET: find \\(|A|\\)" })]));
  assert.ok(p.some((x) => /names an exam/.test(x)), p.join("; "));
  const s = Q.validateBatch(batch([day({ step: "As in CET 2023, \\(11\\)" })]));
  assert.ok(s.some((x) => /names an exam/.test(x)), s.join("; "));
});

test("every question has four options A–D and an answer among them", () => {
  const three = day({ options: day().options.slice(0, 3) });
  assert.ok(Q.validateBatch(batch([three])).some((x) => /four options/.test(x)));
  const order = day({ options: [...day().options].reverse() });
  assert.ok(Q.validateBatch(batch([order])).some((x) => /A, B, C, D/.test(x)));
  assert.ok(Q.validateBatch(batch([day({ answer: "E" })])).some((x) => /answer/.test(x)));
  const empty = day({ options: day().options.map((o, i) => (i === 2 ? { ...o, text: " " } : o)) });
  assert.ok(Q.validateBatch(batch([empty])).some((x) => /option C/.test(x)));
});

test("right answers are spread: no letter more than twice a week (people guess patterns)", () => {
  const ids = ["2d9f7c9a-c7b0-45c1-919d-cbf429d667ec", "2e76fb4d-7ec6-4b39-9f4d-388313009e66", "96eec994-78c2-4b78-9ae6-152a15281b73"];
  const three = ids.map((id, i) => day({ questionId: id, date: `2026-10-2${6 + i}` }));
  assert.ok(Q.validateBatch(batch(three)).some((x) => /answer C 3 times/.test(x)));
  assert.deepEqual(Q.validateBatch(batch(three.slice(0, 2))), []);
});

test("each answer must have been re-derived before it goes in a post", () => {
  assert.ok(Q.validateBatch(batch([day({ checked: "" })])).some((x) => /re-derived/.test(x)));
});

test("broken maths is caught before rendering", () => {
  assert.ok(Q.validateBatch(batch([day({ question: "Find \\(x" })])).some((x) => /unclosed/.test(x)));
});

test("a lost backslash is caught: in JSON \\t, \\r, \\b, \\f become control characters (\\times → tab + 'imes')", () => {
  for (const bad of ["\\(12 \times 11\\)", "\\(\\left(x\right)\\)", "\\(\frac{1}{2}\\)", "\\(\beta\\)"]) {
    const p = Q.validateBatch(batch([day({ step: bad })]));
    assert.ok(p.some((x) => /lost backslash/.test(x)), JSON.stringify(bad));
  }
  assert.ok(Q.validateBatch(batch([day({ options: day().options.map((o) => ({ ...o, text: o.text + "\t" })) })])).some((x) => /lost backslash/.test(x)));
});

test("a batch is 1–7 days with distinct dates and distinct questions, none used before", () => {
  assert.ok(Q.validateBatch(batch([])).some((x) => /1–7 days/.test(x)));
  const two = [day(), day({ date: "2026-10-27" })];
  assert.ok(Q.validateBatch(batch(two)).some((x) => /used twice/.test(x)));
  const sameDate = [day(), day({ questionId: "2d9f7c9a-c7b0-45c1-919d-cbf429d667ec" })];
  assert.ok(Q.validateBatch(batch(sameDate)).some((x) => /2026-10-26 twice/.test(x)));
  assert.ok(Q.validateBatch(batch(), [ID]).some((x) => /already posted/.test(x)));
  assert.ok(Q.validateBatch(batch([day({ date: "26 Oct" })])).some((x) => /YYYY-MM-DD/.test(x)));
  assert.ok(Q.validateBatch(batch([day({ questionId: "q1" })])).some((x) => /question bank id/.test(x)));
});

test("long text is refused: a story is read in about five seconds", () => {
  const long = day({ question: "x ".repeat(Q.MAX_CHARS.question) });
  assert.ok(Q.validateBatch(batch([long])).some((x) => /too long/.test(x)));
});

test("the question goes up at 07:30 IST and the answer at 19:30 IST", () => {
  assert.equal(Q.plannedFor("2026-10-26", "question"), "2026-10-26T07:30:00+05:30");
  assert.equal(Q.plannedFor("2026-10-26", "answer"), "2026-10-26T19:30:00+05:30");
  assert.equal(new Date(Q.plannedFor("2026-10-26", "question")).toISOString(), "2026-10-26T02:00:00.000Z");
});

test("each day makes two GoPost story manifests for @pyqvault_", () => {
  const [q, a] = Q.buildManifests(day());
  assert.deepEqual(q, {
    slug: "maths-q-2026-10-26",
    project: "pyqvault-insta",
    kind: "story",
    title: "Maths question · Mon 26 Oct · Matrices",
    cover: "maths-q-2026-10-26.jpg",
    plannedFor: "2026-10-26T07:30:00+05:30",
    question: { id: ID, answer: "C", part: "question" },
    captions: {},
  });
  assert.equal(a.slug, "maths-a-2026-10-26");
  assert.equal(a.cover, "maths-a-2026-10-26.jpg");
  assert.equal(a.title, "Maths answer · Mon 26 Oct · Matrices");
  assert.equal(a.plannedFor, "2026-10-26T19:30:00+05:30");
  assert.deepEqual(a.question, { id: ID, answer: "C", part: "answer" });
});

test("each series posts to its own account and draws on its own exam (founder 2026-10-23: @lws.pune gets NDA questions)", () => {
  assert.deepEqual(Q.SERIES.pyqvault, { project: "pyqvault-insta", exam: "MHT-CET", subject: "Maths" });
  assert.deepEqual(Q.SERIES.lwspune, { project: "pyq-vault", exam: "NDA", subject: "Mathematics" });
  const [q, a] = Q.buildManifests(day({ date: "2026-10-24" }), "lwspune");
  assert.equal(q.project, "pyq-vault");
  assert.equal(a.project, "pyq-vault");
  assert.equal(q.slug, "maths-q-2026-10-24");
  assert.equal(q.plannedFor, "2026-10-24T07:30:00+05:30");
  assert.equal(Q.buildManifests(day())[0].project, "pyqvault-insta", "@pyqvault_ stays the default");
  assert.throws(() => Q.buildManifests(day(), "nope"), /unknown series/);
});

test("a batch's series is the folder it sits in: stories/<series>/<week>/batch.json", () => {
  assert.equal(Q.seriesOf("stories/lwspune/2026-w43/batch.json"), "lwspune");
  assert.equal(Q.seriesOf("C:\\repo\\stories\\pyqvault\\2026-w44\\batch.json"), "pyqvault");
  assert.throws(() => Q.seriesOf("stories/other/2026-w44/batch.json"), /unknown series "other"/);
});

test("the card text says only what the founder asked for", () => {
  const t = Q.cardText(day(), "question");
  assert.equal(t.cta, "Reply A, B, C or D");
  assert.equal(t.kicker, "", "the question card is just the question and options");
  const a = Q.cardText(day(), "answer");
  assert.equal(a.kicker, "Answer");
  assert.equal(a.correct, "C");
  assert.equal(a.cta, "New question tomorrow, 7:30 am");
  for (const s of [t, a]) assert.deepEqual(Q.examMentions(JSON.stringify(s)), []);
});
