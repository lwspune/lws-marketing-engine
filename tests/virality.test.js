"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const v = require("../reels/tools/virality.js");
const ts = require("../reels/tools/topic-scores.js");

// Virality predictor (founder, 2026-10-22): will a finished @pyqvault_ reel beat our record for views? A score out of 100
// from inputs measured on the reel, a verdict band, and the weakest input to fix. Every prediction is logged before the
// reel is posted; the weights are tuned from 48 h results like the idea score, and it becomes the go/no-go gate only once
// its log shows it predicts well.

const LOG = `
## Scoring

| Input | Key | Points | Weight | Anchors |
|---|---|---|---|---|
| Idea | idea | 0–3 | 1 | x |
| Motion 0–3 s | motion | 0–2 | 1 | x |
| Hook move | hookmove | 0–1 | 1 | x |
| Words 0–3 s | words | 0–2 | 1 | x |
| Answer after 8 s | answer | 0–1 | 0 | x |

**Bands:** record-breaker ≥ 80 · above typical ≥ 55 · below typical under 55.

## Reels

| Idea | Reel | Idea score | Motion | Hook move | Words | Answer | Measured |
|---|---|---|---|---|---|---|---|
| P24 | pv-physics-008-spoon | 3 | 2 | 1 | 2 | 1 | motion 100% · 9 words |
| C14 | pv-chem-008-packing | 2 | 1 | 1 | 1 | 0 | motion 80% · 14 words |
| P1 | pv-physics-001-collision | 0 | 0 | 0 | 1 | 0 | motion 20% |

## Predictions

| Idea | Reel | Logged | Score | Band | Weakest | Record then | Typical then | Hindsight |
|---|---|---|---|---|---|---|---|---|
| P24 | pv-physics-008-spoon | 2026-10-22 | 100 | record-breaker | – | 1496 | 1429 | no |
| C14 | pv-chem-008-packing | 2026-10-22 | 63 | above typical | motion | 1496 | 1429 | no |
| P1 | pv-physics-001-collision | 2026-10-22 | 13 | below typical | idea | 269 | 143 | yes |
`;

test("points per input follow their anchors", () => {
  assert.deepEqual([77, 69, 62, 54, 46].map(v.points.idea), [3, 2, 2, 1, 0]);
  assert.deepEqual([1, 0.95, 0.9, 0.75, 0.5].map(v.points.motion), [2, 2, 1, 1, 0]);
  assert.deepEqual([0, 10, 11, 18, 19].map(v.points.words), [2, 2, 1, 1, 0]);
  assert.deepEqual([20, 25, 26, 40].map(v.points.length), [1, 1, 0, 0]);
  assert.deepEqual([2, 1.5, 1, 0.8, 0.5].map(v.points.momentum), [2, 2, 1, 1, 0]);
  const [lo, hi] = v.COLOUR;
  assert.deepEqual([lo - 1, lo, hi - 0.1, hi].map(v.points.colour), [0, 1, 1, 2]);
});

test("frames: a mean difference per pixel, the share of frames that move, and colourfulness", () => {
  const grey = new Uint8ClampedArray([100, 100, 100, 255, 100, 100, 100, 255]);
  const lit = new Uint8ClampedArray([110, 100, 100, 255, 100, 100, 120, 255]);
  assert.equal(v.frameDiff(grey, grey), 0);
  assert.equal(v.frameDiff(grey, lit), 5, "(10 + 20) / 6 channel values");
  assert.equal(v.motionShare([0, 2, 3, 0.5], 1), 0.5);
  assert.equal(v.colourfulness(grey), 0, "grey has no colour");
  const red = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255]), mixed = new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]);
  assert.ok(v.colourfulness(mixed) > 0 && v.colourfulness(red) > 0);
});

// A small object moving on a big still board changes few pixels, so a whole-frame average hides it (launch angles' balls:
// mean 0.25, yet ~0.3% of pixels change every frame). Motion counts the share of pixels that change noticeably.
test("motion: the share of pixels that change noticeably; a frame moves when at least 0.2% do", () => {
  const a = new Uint8ClampedArray(4 * 1000).fill(100), b = a.slice();
  for (let i = 0; i < 3; i++) b[i * 4] = 140;   // 3 of 1,000 pixels change by 40 in red (13.3 averaged over RGB)
  assert.equal(v.changedShare(a, b), 0.003);
  assert.equal(v.changedShare(a, a), 0);
  const faint = a.slice(); faint[0] = 120;      // a change of 20 in one channel averages under 10: noise, not motion
  assert.equal(v.changedShare(a, faint), 0);
  assert.equal(v.motionShare([0.003, 0.001, 0.002, 0.0005]), 0.5, "default threshold: 0.2% of pixels");
});

test("the Reels table is read by header, and each input stays in its range", () => {
  const rows = v.parseReels(LOG);
  assert.deepEqual(rows[0], { id: "P24", reel: "pv-physics-008-spoon", idea: 3, motion: 2, hookmove: 1, words: 2, answer: 1, measured: "motion 100% · 9 words" });
  assert.deepEqual(v.validate(LOG), []);
  assert.match(v.validate(LOG.replace("| P24 | pv-physics-008-spoon | 3 |", "| P24 | pv-physics-008-spoon | 4 |")).join("\n"), /P24: idea 4 is outside 0–3/);
});

test("score out of 100 from the weighted inputs; a weight-0 input is logged but doesn't count", () => {
  const w = ts.parseWeights(LOG), [p24, c14, p1] = v.parseReels(LOG);
  assert.equal(v.score(p24, w), 100);
  assert.equal(v.score(c14, w), 63, "(2 + 1 + 1 + 1) / (3 + 2 + 1 + 2) = 5/8");
  assert.equal(v.score(p1, w), 13);
});

test("the verdict band comes from the Bands line", () => {
  const b = v.parseBands(LOG);
  assert.deepEqual(b, { record: 80, above: 55 });
  assert.deepEqual([100, 80, 79, 55, 54].map((s) => v.band(s, b)), ["record-breaker", "record-breaker", "above typical", "above typical", "below typical"]);
});

test("the weakest input is the one losing the most weighted points (weight-0 inputs never count)", () => {
  const w = ts.parseWeights(LOG), [p24, c14, p1] = v.parseReels(LOG);
  assert.equal(v.weakest(p24, w), null);
  assert.equal(v.weakest(c14, w), "idea", "idea, motion and words each lose 1; the first in table order");
  assert.equal(v.weakest(p1, w), "idea", "idea loses 3");
});

test("predictions are read, and must point at a Reels row with a known band", () => {
  const p = v.parsePredictions(LOG);
  assert.equal(p.length, 3);
  assert.deepEqual(p[1], { id: "C14", reel: "pv-chem-008-packing", logged: "2026-10-22", score: 63, band: "above typical", weakest: "motion", record: 1496, typical: 1429, hindsight: false });
  const bad = LOG.replace("| C14 | pv-chem-008-packing | 2026-10-22 | 63 | above typical |", "| C99 | pv-chem-008-packing | 2026-10-22 | 63 | sure thing |");
  const errors = v.validate(bad).join("\n");
  assert.match(errors, /C99: prediction has no row in Reels/);
  assert.match(errors, /C99: band "sure thing"/);
});

// Accuracy, from the results table (48 h readings only): the actual band is set by the record and the typical reel at the
// time of the prediction; hindsight rows are shown but never counted.
const RESULTS = `
## Reel-by-reel results (fill at 48 h and 7 d)

| Reel | Idea | Background | Music | Voice | Hook · opening | Tests | Posted | Reach | Views | Watch | Saves | Shares | Comments |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| spoon | P24 | white | trap | AI | A/B/C | — | 22 Oct | 1 | 1,610 (49 h) | 9.9 s | 0 | 0 | 0 |
| packing | C14 | dark | cinematic | AI | A/B/C | — | 22 Oct | 1 | 1,200 (50 h) | 7 s | 0 | 0 | 0 |
| collision | P1 | dark | bright | — | — | — | 18 Oct | 1 | 141 (71 h) | 5.1 s | 0 | 0 | 0 |
`;

test("accuracy: the actual band at 48 h, hits, and whether the score ranks the reels", () => {
  const acc = v.accuracy(v.parsePredictions(LOG), ts.parseResults(RESULTS));
  assert.deepEqual(acc.rows.map((r) => [r.id, r.actual, r.hit]), [["P24", "record-breaker", true], ["C14", "below typical", false], ["P1", "below typical", true]]);
  assert.equal(acc.n, 2, "P1 is hindsight: shown, not counted");
  assert.equal(acc.hits, 1);
  assert.equal(acc.hitRate, 0.5);
  const young = v.accuracy(v.parsePredictions(LOG), ts.parseResults(RESULTS.replace("1,610 (49 h)", "1,610 (20 h)")));
  assert.equal(young.rows.find((r) => r.id === "P24").actual, null, "a reading under 48 h isn't judged yet");
});

test("the real prediction log is valid and every Reels row has its prediction", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "virality-log.md"), "utf8");
  assert.deepEqual(v.validate(md), []);
  const reels = v.parseReels(md), preds = new Set(v.parsePredictions(md).map((p) => p.id));
  assert.ok(reels.length >= 10);
  for (const r of reels) assert.ok(preds.has(r.id), `${r.id} has no prediction`);
});

// Founder, 2026-10-22: "prediction is made every time a new reel is made and old predictions are updated to fine-tune the
// predictor". Updating never rewrites a frozen prediction: it fills its 48 h outcome beside it, moves the weights the rule
// allows, and logs the run.
const RUNS = "\n## Calibration and accuracy runs\n\n| Date | Real predictions judged | Bands right | Rank correlation | Weight changes | Note |\n|---|---|---|---|---|---|\n| 2026-10-22 | 0 | – | – | none | set-up |\n";

test("update: each prediction gets its 48 h views, actual band and whether it was right; the frozen columns stay", () => {
  const { md } = v.update(LOG + RUNS, ts.parseResults(RESULTS), "2026-10-24");
  const p = v.parsePredictions(md);
  assert.deepEqual(p.map((x) => [x.id, x.score, x.band]), [["P24", 100, "record-breaker"], ["C14", 63, "above typical"], ["P1", 13, "below typical"]]);
  assert.match(md, /\| P24 \| pv-physics-008-spoon \| 2026-10-22 \| 100 \| record-breaker \| – \| 1496 \| 1429 \| no \| 1,610 \| record-breaker \| ✓ \|/);
  assert.match(md, /\| C14 \|[^\n]*\| 1,200 \| below typical \| ✗ \|/);
  assert.match(md, /\| P1 \|[^\n]*\| 141 \| below typical \| hindsight \|/);
  assert.deepEqual(v.validate(md), []);
});

test("update: a reel without its 48 h reading shows 'waiting'; running twice the same day logs one run", () => {
  const young = ts.parseResults(RESULTS.replace("1,610 (49 h)", "1,610 (20 h)"));
  const once = v.update(LOG + RUNS, young, "2026-10-24").md, twice = v.update(once, young, "2026-10-24").md;
  assert.match(once, /\| P24 \|[^\n]*\| – \| waiting \| – \|/);
  assert.equal(twice, once);
  assert.equal((twice.match(/^\| 2026-10-24 \|/gm) || []).length, 1);
});

test("update: the run row records what was judged and any weight changes", () => {
  const { md, summary } = v.update(LOG + RUNS, ts.parseResults(RESULTS), "2026-10-24");
  assert.match(md, /\| 2026-10-24 \| 2 \| 1 of 2 \| – \| none \| calibration refused: 3 scored reels with numbers at 48 h or more; need 6 \|/);
  assert.match(summary, /1 of 2 bands right/);
});

// 2026-10-23: the rule allows one step per analysis of NEW 48 h readings. Running --update again on the same readings
// (the next day before any reel turns 48 h, or twice in a day) stepped the weight again on the same evidence.
const SIX = LOG.replace(/## Reels[\s\S]*$/, `## Reels

| Idea | Reel | Idea score | Motion | Hook move | Words | Answer | Measured |
|---|---|---|---|---|---|---|---|
${["P1", "P2", "P3", "P4", "P5", "P6", "P7"].map((id, i) => `| ${id} | r${i + 1} | ${[0, 1, 2, 6].includes(i) ? 3 : 0} | 1 | 1 | 1 | 0 | – |`).join("\n")}

## Predictions

| Idea | Reel | Logged | Score | Band | Weakest | Record then | Typical then | Hindsight |
|---|---|---|---|---|---|---|---|---|
| P1 | r1 | 2026-10-22 | 100 | record-breaker | – | 1496 | 1429 | yes |
`);
const sixResults = (n) => ts.parseResults(`
## Reel-by-reel results (fill at 48 h and 7 d)

| Reel | Idea | Background | Music | Voice | Hook · opening | Tests | Posted | Reach | Views | Watch | Saves | Shares | Comments |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${["P1", "P2", "P3", "P4", "P5", "P6", "P7"].slice(0, n).map((id, i) => `| r${i + 1} | ${id} | ${i % 2 ? "dark" : "white"} | — | — | — | — | 20 Oct | 1 | ${[0, 1, 2, 6].includes(i) ? "1,000" : "100"} (49 h) | ${[0, 1, 2, 6].includes(i) ? 10 : 5} s | 0 | 0 | 0 |`).join("\n")}
`);

test("update: weights step once per new 48 h reading, never again on the same readings", () => {
  const first = v.update(SIX + RUNS, sixResults(6), "2026-10-24").md;
  assert.equal(ts.parseWeights(first).idea.weight, 1.5);
  assert.match(first, /\| 2026-10-24 \|[^\n]*\| idea 1 → 1.5 \| calibrated on 6 reels/);

  const sameDay = v.update(first, sixResults(6), "2026-10-24").md;
  assert.equal(ts.parseWeights(sameDay).idea.weight, 1.5);
  assert.match(sameDay, /\| 2026-10-24 \|[^\n]*\| idea 1 → 1.5 \|/);

  const nextDay = v.update(first, sixResults(6), "2026-10-25").md;
  assert.equal(ts.parseWeights(nextDay).idea.weight, 1.5);
  assert.match(nextDay, /\| 2026-10-25 \|[^\n]*\| none \| no new 48 h reading: still 6 reels, weights held/);
  assert.equal(v.update(nextDay, sixResults(6), "2026-10-25").md, nextDay);

  const seventh = v.update(nextDay, sixResults(7), "2026-10-26").md;
  assert.equal(ts.parseWeights(seventh).idea.weight, 2);
  assert.match(seventh, /\| 2026-10-26 \|[^\n]*\| idea 1.5 → 2 \| calibrated on 7 reels/);
});

test("applyWeights writes a changed weight into the Scoring table", () => {
  const md = v.applyWeights(LOG, [{ key: "motion", change: 0.5, newWeight: 1.5 }, { key: "words", change: 0, newWeight: 1 }]);
  assert.equal(ts.parseWeights(md).motion.weight, 1.5);
  assert.equal(ts.parseWeights(md).words.weight, 1);
});
