/* Daily maths question stories for @pyqvault_ — pure rules.
 * No DOM, no fetch. Loaded by stories/card.html (browser, as window.StoryQuestions),
 * stories/render.mjs and tests/stories-questions.test.js (node).
 *
 * Each day is two Instagram stories: the question with its four options at 07:30 IST ("Reply A, B,
 * C or D") and the answer at 19:30 IST. Easy MHT-CET maths MCQs from the question bank, but the
 * cards never name an exam (founder 2026-10-21: just the question and options). Runbook: stories/README.md.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.StoryQuestions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PROJECT = "pyqvault-insta";
  const SIZE = [1080, 1920];
  const TIMES = { question: "07:30", answer: "19:30" };
  const LABELS = ["A", "B", "C", "D"];

  // Visible characters (maths commands not counted) each part may carry; a story is read in ~5 s.
  const MAX_CHARS = { question: 220, option: 60, step: 160 };

  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const EXAM = /\b(MHT[- ]?CET|CET|JEE|NEET|NDA|CBSE|HSC|PYQs?|board exams?|previous[- ]years?)\b/gi;

  /** Text and maths in order: `\(…\)` is inline maths, `\[…\]` display maths. */
  function segments(text) {
    const out = [];
    const s = String(text);
    let i = 0;
    while (i < s.length) {
      const open = s.slice(i).search(/\\[([]/);
      if (open < 0) { out.push({ math: false, text: s.slice(i) }); break; }
      if (open > 0) out.push({ math: false, text: s.slice(i, i + open) });
      const start = i + open;
      const display = s[start + 1] === "[";
      const close = s.indexOf(display ? "\\]" : "\\)", start + 2);
      if (close < 0) throw new Error(`unclosed maths after "${s.slice(start, start + 20)}"`);
      out.push({ math: true, tex: s.slice(start + 2, close), display });
      i = close + 2;
    }
    return out;
  }

  /** Roughly what a reader sees: maths commands and braces don't count. */
  const visibleLength = (text) =>
    String(text).replace(/\\[([\])]/g, "").replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "").length;

  function examMentions(text) {
    return [...new Set((String(text).match(EXAM) || []))];
  }

  const plannedFor = (date, part) => `${date}T${TIMES[part]}:00+05:30`;

  const slugFor = (date, part) => `maths-${part === "question" ? "q" : "a"}-${date}`;

  const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
  const dayLabel = (date) => DAY_LABEL.format(new Date(`${date}T00:00:00Z`)).replace(",", "");

  function checkText(problems, where, text, max) {
    if (typeof text !== "string" || !text.trim()) return problems.push(`${where} is empty`);
    // In JSON "\times" is a tab + "imes" and "\right" a carriage return + "ight": KaTeX can't see it.
    if (/[\t\r\n\f\b]/.test(text)) problems.push(`${where} has a control character: a lost backslash? (write \\\\times, \\\\right…)`);
    try { segments(text); } catch (e) { problems.push(`${where}: ${e.message}`); }
    if (visibleLength(text) > max) problems.push(`${where} is too long (${visibleLength(text)} > ${max})`);
    for (const m of examMentions(text)) problems.push(`${where} names an exam ("${m}")`);
  }

  /** Everything wrong with a week's batch; [] when it's ready to render. `used` = question ids already posted. */
  function validateBatch(batch, used = []) {
    const problems = [];
    const days = (batch && batch.days) || [];
    if (!Array.isArray(days) || days.length < 1 || days.length > 7) problems.push("a batch is 1–7 days");
    const dates = new Set();
    const ids = new Set();
    const before = new Set(used);
    for (const d of Array.isArray(days) ? days : []) {
      const at = d.date || "?";
      if (!DATE.test(d.date || "") || Number.isNaN(Date.parse(`${d.date}T00:00:00Z`))) problems.push(`${at}: date must be YYYY-MM-DD`);
      else if (dates.has(d.date)) problems.push(`${d.date} twice`);
      dates.add(d.date);
      if (!UUID.test(d.questionId || "")) problems.push(`${at}: questionId must be the question bank id`);
      else if (ids.has(d.questionId)) problems.push(`${at}: question ${d.questionId} used twice`);
      else if (before.has(d.questionId)) problems.push(`${at}: question ${d.questionId} was already posted`);
      ids.add(d.questionId);
      checkText(problems, `${at} question`, d.question, MAX_CHARS.question);
      const opts = Array.isArray(d.options) ? d.options : [];
      if (opts.length !== 4) problems.push(`${at}: needs four options`);
      else if (opts.map((o) => o.label).join() !== LABELS.join()) problems.push(`${at}: options must be labelled A, B, C, D in order`);
      opts.forEach((o) => checkText(problems, `${at} option ${o.label}`, o.text, MAX_CHARS.option));
      if (!LABELS.includes(d.answer)) problems.push(`${at}: answer must be A, B, C or D`);
      checkText(problems, `${at} step`, d.step, MAX_CHARS.step);
      if (typeof d.checked !== "string" || !d.checked.trim()) problems.push(`${at}: say how the answer was re-derived (checked)`);
      for (const m of examMentions(d.chapter || "")) problems.push(`${at} chapter names an exam ("${m}")`);
    }
    // Spread the right answers, so "it's always C" never works.
    for (const l of LABELS) {
      const n = (Array.isArray(days) ? days : []).filter((d) => d.answer === l).length;
      if (n > 2) problems.push(`answer ${l} ${n} times this week (at most 2)`);
    }
    return problems;
  }

  /** The words on each card. The question card is just the question and options, plus how to answer. */
  function cardText(day, part) {
    const base = { question: day.question, options: day.options };
    if (part === "question") return { ...base, kicker: "", cta: "Reply A, B, C or D" };
    return { ...base, kicker: "Answer", correct: day.answer, step: day.step, cta: "New question tomorrow, 7:30 am" };
  }

  /** The two GoPost manifests for a day (publisher/src/lib/domain/manifest.ts). */
  function buildManifests(day) {
    return ["question", "answer"].map((part) => ({
      slug: slugFor(day.date, part),
      project: PROJECT,
      kind: "story",
      title: `Maths ${part} · ${dayLabel(day.date)} · ${day.chapter}`.slice(0, 120),
      cover: `${slugFor(day.date, part)}.jpg`,
      plannedFor: plannedFor(day.date, part),
      question: { id: day.questionId, answer: day.answer, part },
      captions: {},
    }));
  }

  return { PROJECT, SIZE, TIMES, MAX_CHARS, segments, visibleLength, examMentions, plannedFor, slugFor, dayLabel, validateBatch, cardText, buildManifests };
});
