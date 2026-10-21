"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("../reels/tools/topic-scores.js");

// @pyqvault_ idea score (framework F21, founder 2026-10-21): each criterion's points × its weight, out of 100. The weights
// live in the idea list's Scoring table and are tuned at every analysis of posted reels (calibrate). The goal is engagement
// and reach, so there is no exam-weight criterion (founder, 2026-10-20).

const SCORING = `
## Scoring

| Criterion | Key | Points | Weight | Anchors |
|---|---|---|---|---|
| Proof | proof | −1–3 | 1 | views multiple |
| Vivid | vivid | 0–3 | 1 | busy picture |
| Guess | guess | 0–2 | 1 | 2-second A/B/C |
| Surprise | surprise | 0–2 | 1 | the obvious answer is wrong |
| Law live | law | 0–1 | 1 | sim + numbers + graph |
| Everyday | everyday | 0–2 | 1 | held or seen daily |
`;

const HEADER = `| # | Subject | Idea | Proof (×) | Vivid | Guess | Surprise | Law live | Everyday | Score | Status | Source | Wordless |
|---|---|---|---|---|---|---|---|---|---|---|---|---|`;

const CARDS = `
## Idea cards

### P5 · Adiabatic squeeze
- **Frame 0:** Squeeze a gas that can't lose heat: hotter, colder, or the same? → hotter
- **Without words:** two cylinders, one wrapped → both pistons push down → only the wrapped one's particles speed up and glow → its thermometer climbs
- **Second hook:** Let it out fast? → it cools
- **From:** remake · @bisal.physics 125×

### P6 · Work vs power
- **Frame 0:** Same box, same height, one lift faster: more work? → the same work, more power
- **Without words:** two lifts raise the same box → one arrives first → both energy bars end equal → one power bar is twice as tall
- **Second hook:** So what did speed change? → power
- **From:** remake · @sciencevisualised 76×

### C7 · Flame colours
- **Frame 0:** Barium in a flame: red, green, or blue? → green
- **Without words:** a wire dips into powder → the flame flares green → an electron drops a level → a green packet flies out
- **Second hook:** And copper? → blue-green
- **From:** own

### C8 · Split water
- **Frame 0:** One battery, two tubes: which fills first? → hydrogen
- **Without words:** a molecule splits → two H go one way, one O the other → the H tube fills twice as fast → the levels read 2 : 1
- **Second hook:** Why exactly twice? → H₂O
- **From:** own
`;

const ideas = (rows, extra = "") => `${SCORING}
## Ideas

${HEADER}
${rows}
${CARDS}${extra}
## Concept sweep

| Chapter | Swept | Added | Left out (rule) |
|---|---|---|---|
| mht-cet-physics/rotational-dynamics | 2026-10-21 | P13 | – |
`;

// P5: 3 + 3 + 2 + 2 + 1 + 1 = 12 of 13 → 92. P6: 2 + 1 + 2 + 1 + 1 + 1 = 8 → 62. C7: 0 + 3 + 2 + 1 + 0 + 1 = 7 → 54.
// C8: 0 + 3 + 2 + 1 + 1 + 0 = 7 → 54.
const ROWS = [
  "| P5 | P | Adiabatic squeeze | 125 | 3 | 2 | 2 | 1 | 1 | 92 | | remake | ✓ |",
  "| P6 | P | Work vs power | 76 | 1 | 2 | 1 | 1 | 1 | 62 | | remake | ✓ |",
  "| P2 | P | Boyle | 129 | 3 | 1 | 1 | 1 | 1 | 77 | ✅ made | remake | ✓ |",
  "| C7 | C | Flame colours | – | 3 | 2 | 1 | 0 | 1 | 54 | | own | ✓ |",
  "| C8 | C | Split water | – | 3 | 2 | 1 | 1 | 0 | 54 | | own | ✓ |",
].join("\n");
const MD = ideas(ROWS);
const opts = (md) => ({ weights: ts.parseWeights(md), swept: ts.parseSweep(md), cards: ts.parseCards(md) });
const check = (md) => ts.validate(ts.parse(md), undefined, opts(md));

test("proof points come from the views multiple: ≥100× → 3, ≥30× → 2, ≥3× → 1, none or 1–3× → 0, under 1× → −1", () => {
  assert.deepEqual([190, 100, 54, 30, 11, 3, null, 2.3, 1, 0.9, 0.1].map(ts.proofPoints), [3, 3, 2, 2, 1, 1, 0, 0, 0, -1, -1]);
});

test("the weights and each criterion's range are read from the Scoring table", () => {
  assert.deepEqual(ts.parseWeights(MD), {
    proof: { weight: 1, min: -1, max: 3 }, vivid: { weight: 1, min: 0, max: 3 }, guess: { weight: 1, min: 0, max: 2 },
    surprise: { weight: 1, min: 0, max: 2 }, law: { weight: 1, min: 0, max: 1 }, everyday: { weight: 1, min: 0, max: 2 },
  });
});

test("the score is the weighted points out of 100", () => {
  const w = ts.parseWeights(MD), [p5, p6, , c7] = ts.parse(MD);
  assert.equal(ts.weightedScore(p5, w), 92);
  assert.equal(ts.weightedScore(p6, w), 62);
  assert.equal(ts.weightedScore(c7, w), 54);
  const vivid2 = ts.parseWeights(MD.replace("| Vivid | vivid | 0–3 | 1 |", "| Vivid | vivid | 0–3 | 2 |"));
  assert.equal(ts.weightedScore(p6, vivid2), 56, "P6's vivid is low, so weighting vivid up lowers it: (8 + 1) / (13 + 3)");
});

test("columns are read by their header names", () => {
  const [p5] = ts.parse(MD);
  assert.deepEqual(p5, { id: "P5", subject: "P", idea: "Adiabatic squeeze", proofX: 125, vivid: 3, guess: 2, surprise: 2, law: 1,
    everyday: 1, score: 92, status: "", source: "remake", wordless: true });
});

test("a correct list has no errors", () => {
  assert.deepEqual(check(MD), []);
});

test("catches a wrong score, a value out of range, an unknown subject and a repeated id", () => {
  const bad = MD.replace("| 76 | 1 | 2 | 1 | 1 | 1 | 62 |", "| 76 | 1 | 2 | 1 | 1 | 1 | 70 |")
    .replace("| – | 3 | 2 | 1 | 0 | 1 | 54 |", "| – | 3 | 2 | 1 | 0 | 3 | 69 |")
    .replace("| C8 | C |", "| P5 | X |");
  const errors = check(bad).join("\n");
  assert.match(errors, /P6: score 70 should be 62/);
  assert.match(errors, /C7: everyday 3 is outside 0–2/);
  assert.match(errors, /P5: subject "X"/);
  assert.match(errors, /P5: id used twice/);
});

test("a broken row (wrong number of columns) is reported, not skipped", () => {
  const bad = MD.replace("| 62 | | remake | ✓ |", "| 62 || | remake | ✓ |");
  assert.match(check(bad).join("\n"), /P6: 14 columns, expected 13/);
});

test("next pick per subject: highest open score, then the bigger views multiple, then the law shown live", () => {
  const next = ts.nextPicks(ts.parse(MD));
  assert.equal(next.P.id, "P5", "Boyle is made");
  assert.equal(next.C.id, "C8", "C7 and C8 both 54 with no proof; C8 shows its law live");
  const flop = ts.parse(MD.replace("| C7 | C | Flame colours | – |", "| C7 | C | Flame colours | 11 |").replace("| 0 | 1 | 54 | | own |", "| 0 | 1 | 62 | | own |"));
  assert.equal(ts.nextPicks(flop).C.id, "C7");
});

test("queued, parked and moved ideas are never picked; queued ones are listed", () => {
  const rows = ts.parse(MD.replace("| 92 | | remake |", "| 92 | ⏭ queued | remake |").replace("| 54 | | own | ✓ |\n| C8", "| 54 | ⏸ parked | own | ✓ |\n| C8"));
  assert.deepEqual(ts.queued(rows).map((r) => r.id), ["P5"]);
  assert.equal(ts.nextPicks(rows).P.id, "P6");
  assert.equal(ts.nextPicks(rows).C.id, "C8");
});

// F1 + F28: Source is remake, own, founder or a notes chapter; a notes or founder idea needs a 2-second guess (guess 2)
// and a busy picture (vivid ≥ 2); a notes chapter must be in the Concept sweep log, once.
test("sources: remake, own, founder or an MHT-CET / JEE Main physics or chemistry chapter", () => {
  const bad = MD.replace("| 62 | | remake |", "| 62 | | youtube |").replace("| 54 | | own | ✓ |\n| C8", "| 54 | | nda-chemistry/acids | ✓ |\n| C8");
  const errors = check(bad).join("\n");
  assert.match(errors, /P6: source "youtube"/);
  assert.match(errors, /C7: source "nda-chemistry\/acids"/);
});

test("F28 gate: a non-remake idea to make needs guess 2 and vivid ≥ 2; a remake is exempt", () => {
  const row = "| P13 | P | Rolling race | – | 1 | 1 | 1 | 1 | 1 | 38 | | mht-cet-physics/rotational-dynamics | ✓ |";
  const card = "\n### P13 · Rolling race\n- **Frame 0:** Which is first? → the ball\n- **Without words:** a → b → c\n- **Second hook:** Heavier ring? → tie\n- **From:** notes\n";
  const md = ideas(`${ROWS}\n${row}`, card);
  const errors = check(md).join("\n");
  assert.match(errors, /P13: fails the F28 gate: vivid 1/);
  assert.match(errors, /P13: fails the F28 gate: guess 1/);
  assert.doesNotMatch(errors, /P6/, "P6 is a remake with vivid 1");
});

test("a notes idea's chapter must be in the Concept sweep log, and no chapter is logged twice", () => {
  const row = "| C16 | C | Water is bent | – | 2 | 2 | 1 | 1 | 1 | 54 | | mht-cet-chemistry/chemical-bonding | ✓ |";
  const card = "\n### C16 · Water is bent\n- **Frame 0:** 109.5°, 104.5° or 90°? → 104.5°\n- **Without words:** a → b → c\n- **Second hook:** NH₃? → 107°\n- **From:** notes\n";
  assert.match(check(ideas(`${ROWS}\n${row}`, card)).join("\n"), /C16: chapter mht-cet-chemistry\/chemical-bonding is not in the Concept sweep log/);
  const twice = MD.replace("| mht-cet-physics/rotational-dynamics | 2026-10-21 | P13 | – |", "| mht-cet-physics/rotational-dynamics | 2026-10-21 | P13 | – |\n| mht-cet-physics/rotational-dynamics | 2026-10-22 | – | – |");
  assert.match(check(twice).join("\n"), /mht-cet-physics\/rotational-dynamics is logged twice/);
});

// F29: explained without a single word; ✓ / ✗ for every row, an open or queued ✗ refused whatever the source.
test("F29: an open or queued ✗ is refused; a parked one isn't; the cell must be ✓ or ✗", () => {
  const bad = MD.replace("| 62 | | remake | ✓ |", "| 62 | | remake | ✗ |").replace("| 77 | ✅ made | remake | ✓ |", "| 77 | ✅ made | remake | ✗ |")
    .replace("| 54 | | own | ✓ |\n| C8", "| 54 | | own | maybe |\n| C8");
  const errors = check(bad).join("\n");
  assert.match(errors, /P6: fails the F29 wordless test/);
  assert.doesNotMatch(errors, /P2:/, "a made idea isn't checked");
  assert.match(errors, /C7: wordless "maybe" should be ✓ or ✗/);
});

// Idea cards: every open or queued idea has one, with frame 0 (question → answer), ≥ 3 beats told without words, a
// second hook (F26) and where it came from; every card belongs to a row.
test("cards are read: frame 0, the wordless beats, the second hook and the source", () => {
  const c = ts.parseCards(MD);
  assert.deepEqual(Object.keys(c), ["P5", "P6", "C7", "C8"]);
  assert.equal(c.P6.beats.length, 4);
  assert.equal(c.P6.secondHook, "So what did speed change? → power");
  assert.match(c.C8.frame0, /→ hydrogen$/);
});

test("an open idea without a card, or with a thin card, is refused; a card with no row is reported", () => {
  const noCard = MD.replace(/### C8 · Split water[\s\S]*?- \*\*From:\*\* own\n/, "");
  assert.match(check(noCard).join("\n"), /C8: no idea card/);
  const thin = MD.replace("- **Without words:** two lifts raise the same box → one arrives first → both energy bars end equal → one power bar is twice as tall",
    "- **Without words:** two lifts → power bars").replace("- **Second hook:** So what did speed change? → power\n", "")
    .replace("- **Frame 0:** Same box, same height, one lift faster: more work? → the same work, more power", "- **Frame 0:** Same box, same height?");
  const errors = check(thin).join("\n");
  assert.match(errors, /P6: card has 2 wordless beats, needs ≥ 3/);
  assert.match(errors, /P6: card has no second hook/);
  assert.match(errors, /P6: card's frame 0 needs "question → answer"/);
  const orphan = MD.replace("## Concept sweep", "### C99 · Ghost\n- **Frame 0:** ? → !\n- **Without words:** a → b → c\n- **Second hook:** ? → !\n- **From:** own\n\n## Concept sweep");
  assert.match(check(orphan).join("\n"), /C99: card has no row in Ideas/);
});

// The runway line: how many ideas are left at 3 reels a day.
test("the Open line must match the list: open + queued ideas, and the days they last at 3 a day", () => {
  const rows = ts.parse(MD);
  assert.deepEqual(ts.runwayErrors("**Open: 4 ideas · about 2 days at 3 reels a day.**", rows), []);
  assert.match(ts.runwayErrors("**Open: 9 ideas · about 3 days at 3 reels a day.**", rows).join(), /says 9 ideas and 3 days; the list has 4 open or queued \(about 2 days\)/);
  assert.match(ts.runwayErrors("no line", rows).join(), /no "Open: N ideas/);
});

// Calibration (founder, 2026-10-21: "this mechanism will be fine-tuned during every analysis of our posted list").
const RESULTS = (rows) => `
## Reel-by-reel results (fill at 48 h and 7 d)

| Reel | Idea | Background | Music | Voice | Hook · opening | Tests | Posted | Reach | Views | Watch | Saves | Shares | Comments |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows}
`;
const r = (name, id, bg, views, watch) => `| ${name} | ${id} | ${bg} | drive | — | A/B/C | — | 20 Oct | 100 | ${views} (48 h) | ${watch} s | 0 | 0 | 0 |`;

test("results are read from the results table: idea id, numbers and the columns that could explain a split", () => {
  const res = ts.parseResults(RESULTS([r("PV Physics #2", "P2", "**white**", "**268**", "6.3"), r("PV Maths #1", "–", "dark", "1,403", "9.5"), r("PV Physics #9", "P29", "dark", "", "")].join("\n")));
  assert.deepEqual(res.map((x) => [x.idea, x.views, x.watch, x.background]), [["P2", 268, 6.3, "white"], [null, 1403, 9.5, "dark"], ["P29", null, null, "dark"]]);
});

// Six scored ideas: the three vivid ones did twice as well as the three quiet ones.
const CAL_ROWS = [
  "| P1 | P | a | – | 3 | 2 | 1 | 1 | 1 | 62 | ✅ made | own | ✓ |",
  "| P2 | P | b | – | 3 | 2 | 1 | 1 | 1 | 62 | ✅ made | own | ✓ |",
  "| P3 | P | c | – | 3 | 2 | 1 | 1 | 1 | 62 | ✅ made | own | ✓ |",
  "| C1 | C | d | – | 1 | 2 | 1 | 1 | 1 | 46 | ✅ made | own | ✓ |",
  "| C2 | C | e | – | 1 | 2 | 1 | 1 | 1 | 46 | ✅ made | own | ✓ |",
  "| C3 | C | f | – | 1 | 2 | 1 | 1 | 1 | 46 | ✅ made | own | ✓ |",
].join("\n");
const calResults = (bgs) => RESULTS([
  r("1", "P1", bgs[0], 200, 8), r("2", "P2", bgs[1], 220, 9), r("3", "P3", bgs[2], 240, 8.5),
  r("4", "C1", bgs[3], 100, 4), r("5", "C2", bgs[4], 110, 4.5), r("6", "C3", bgs[5], 90, 4),
].join("\n"));

test("calibrate: a criterion whose high scorers beat its low scorers by ≥ 20% gains 0.5 weight; the score's fit is reported", () => {
  const md = ideas(CAL_ROWS), out = ts.calibrate(ts.parse(md), ts.parseWeights(md), ts.parseResults(calResults(["white", "dark", "white", "dark", "white", "dark"])));
  assert.equal(out.n, 6);
  assert.ok(out.rho > 0.8, `score and result should agree, rho ${out.rho}`);
  const vivid = out.criteria.find((c) => c.key === "vivid");
  assert.equal(vivid.change, 0.5);
  assert.equal(vivid.newWeight, 1.5);
  const guess = out.criteria.find((c) => c.key === "guess");
  assert.equal(guess.change, 0);
  assert.match(guess.reason, /no spread/);
});

// Founder, 2026-10-22: "views is the main goal because we want to reach the maximum audience… watch time as well";
// comments later. A reel's result weighs both equally: the average of views ÷ typical views and watch ÷ typical watch.
test("calibrate: a reel's result is the average of its views and its watch time against the typical reel", () => {
  const md = ideas(CAL_ROWS), res = ts.parseResults(calResults(["white", "dark", "white", "dark", "white", "dark"]).replace("| 200 (48 h) | 8 s |", "| 200 (48 h) | 2 s |"));
  const out = ts.calibrate(ts.parse(md), ts.parseWeights(md), res), p1 = out.reels.find((x) => x.idea === "P1");
  assert.equal(out.typical.views, 155);
  assert.equal(out.typical.watch, 4.25);
  assert.equal(Math.round(p1.result * 1000) / 1000, Math.round(((200 / 155 + 2 / 4.25) / 2) * 1000) / 1000, "P1's short watch time pulls its result down");
});

test("calibrate: no weight moves when the split lines up with something else (here, the background)", () => {
  const md = ideas(CAL_ROWS), out = ts.calibrate(ts.parse(md), ts.parseWeights(md), ts.parseResults(calResults(["dark", "dark", "dark", "white", "white", "white"])));
  const vivid = out.criteria.find((c) => c.key === "vivid");
  assert.equal(vivid.change, 0);
  assert.match(vivid.reason, /background/);
});

test("calibrate counts a reel only once its numbers are at least 48 h old (the result is a 48 h result)", () => {
  const md = ideas(CAL_ROWS), young = calResults(["white", "dark", "white", "dark", "white", "dark"]).replace("| 240 (48 h) |", "| 240 (11 h) |");
  const out = ts.calibrate(ts.parse(md), ts.parseWeights(md), ts.parseResults(young));
  assert.match(out.refused, /5 scored reels with numbers at 48 h or more; need 6/);
  assert.deepEqual(out.tooYoung.map((x) => x.idea), ["P3"]);
  assert.equal(ts.parseResults(young)[2].hours, 11);
});

test("calibrate refuses to run on fewer than 6 scored reels with numbers", () => {
  const md = ideas(CAL_ROWS), few = RESULTS([r("1", "P1", "dark", 200, 8), r("2", "C1", "dark", 100, 4)].join("\n"));
  assert.match(ts.calibrate(ts.parse(md), ts.parseWeights(md), ts.parseResults(few)).refused, /2 scored reels with numbers at 48 h or more; need 6/);
});

test("Spearman's rank correlation handles ties", () => {
  assert.equal(ts.spearman([1, 2, 3], [10, 20, 30]), 1);
  assert.equal(ts.spearman([1, 2, 3], [30, 20, 10]), -1);
  assert.equal(Math.round(ts.spearman([1, 1, 2, 2], [1, 2, 3, 4]) * 100) / 100, 0.89);
});

// The real files.
const real = (f) => fs.readFileSync(path.join(__dirname, "..", "reels", f), "utf8");

test("the real @pyqvault_ idea list is valid, has an open idea for each subject and a correct Open line", () => {
  const md = real("pyqvault-ideas.md"), rows = ts.parse(md);
  assert.ok(rows.length >= 60, `only ${rows.length} ideas`);
  assert.deepEqual(ts.validate(rows, undefined, opts(md)), []);
  assert.deepEqual(ts.runwayErrors(md, rows), []);
  const next = ts.nextPicks(rows);
  for (const s of ["P", "C"]) assert.ok(next[s], `no open ${s} idea`);
});

test("every posted @pyqvault_ reel with an idea id points at a row of the idea list", () => {
  const ids = new Set(ts.parse(real("pyqvault-ideas.md")).map((x) => x.id));
  for (const x of ts.parseResults(real("pyqvault-learnings.md"))) if (x.idea) assert.ok(ids.has(x.idea), `${x.reel}: idea ${x.idea} isn't in the list`);
});

// @lws.pune keeps its own table, the older unweighted score out of 10 (founder 2026-10-21: built separately later).
const LWS = `
## @lws.pune topic scores

| # | Subject | Idea | Proof (×) | Vivid | Question | Concept live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| W6 | M | The soda can | 114 | 2 | 2 | 1 | 1 | 9 | |
| W14 | M | A matrix moves space | 34 | 3 | 1 | 1 | 0 | 7 | |
| W15 | M | f and f′ together | 115 | 2 | 1 | 1 | 0 | 7 | ✅ made |

## Re-run
`;
const { heading: LH, subjects: LS } = ts.ACCOUNTS.lwspune;

test("@lws.pune: its own table, subject M only, score out of 10, made and parked ideas skipped", () => {
  const rows = ts.parse(LWS, LH);
  assert.deepEqual(rows.map((x) => x.id), ["W6", "W14", "W15"]);
  assert.deepEqual(ts.validate(rows, LS), []);
  assert.equal(ts.nextPicks(rows, LS).M.id, "W6");
  assert.equal(ts.nextPicks(ts.parse(LWS.replace("| 9 | |", "| 9 | ⏸ parked |"), LH), LS).M.id, "W14");
  assert.match(ts.validate(ts.parse(LWS.replace("| W14 | M |", "| W14 | P |"), LH), LS).join("\n"), /W14: subject "P" should be M/);
  assert.match(ts.validate(ts.parse(LWS.replace("| 34 | 3 | 1 | 1 | 0 | 7 |", "| 34 | 3 | 1 | 1 | 0 | 8 |"), LH), LS).join("\n"), /W14: score 8 should be 7/);
});

test("the real @lws.pune table is valid and has an open idea", () => {
  const rows = ts.parse(real("remake-backlog.md"), LH);
  assert.ok(rows.length >= 9);
  assert.deepEqual(ts.validate(rows, LS), []);
  assert.ok(ts.nextPicks(rows, LS).M);
});
