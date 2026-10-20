"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("../reels/tools/topic-scores.js");

// @pyqvault_ topic score (framework F21, founder 2026-10-20): proof + vivid + question + law live + everyday hook,
// out of 10. Goal: engagement and reach, so no exam-weight criterion (founder).

const TABLE = `
## Topic scores

| # | Subject | Idea | Proof (×) | Vivid | Question | Law live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| P5 | P | Adiabatic squeeze | 125 | 3 | 2 | 1 | 1 | 10 | |
| P6 | P | Work vs power | 76 | 1 | 2 | 1 | 1 | 7 | |
| P2 | P | Boyle | 129 | 3 | 1 | 1 | 1 | 9 | ✅ made |
| C7 | C | Flame colours | – | 3 | 2 | 0 | 1 | 6 | |
| C5 | C | P, V, T together | 11 | 2 | 2 | 1 | 1 | 7 | |
| C8 | C | Split water | – | 3 | 2 | 0 | 0 | 5 | |

## Next section
`;

test("proof points come from the views multiple: ≥100× → 3, ≥30× → 2, ≥3× → 1, none → 0", () => {
  assert.equal(ts.proofPoints(190), 3);
  assert.equal(ts.proofPoints(100), 3);
  assert.equal(ts.proofPoints(54), 2);
  assert.equal(ts.proofPoints(30), 2);
  assert.equal(ts.proofPoints(11), 1);
  assert.equal(ts.proofPoints(3), 1);
  assert.equal(ts.proofPoints(null), 0);
});

test("reads the Topic scores table and nothing after it", () => {
  const rows = ts.parse(TABLE);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows[0], { id: "P5", subject: "P", idea: "Adiabatic squeeze", proofX: 125, vivid: 3, question: 2, law: 1, everyday: 1, score: 10, status: "" });
  assert.equal(rows[3].proofX, null);
});

test("a correct table has no errors", () => {
  assert.deepEqual(ts.validate(ts.parse(TABLE)), []);
});

test("catches a wrong total, a score out of range, an unknown subject and a repeated id", () => {
  const bad = TABLE
    .replace("| 76 | 1 | 2 | 1 | 1 | 7 |", "| 76 | 1 | 2 | 1 | 1 | 8 |")
    .replace("| – | 3 | 2 | 0 | 1 | 6 |", "| – | 4 | 2 | 0 | 1 | 7 |")
    .replace("| C5 | C |", "| C5 | X |")
    .replace("| C8 | C |", "| P5 | C |");
  const errors = ts.validate(ts.parse(bad)).join("\n");
  assert.match(errors, /P6: score 8 should be 7/);
  assert.match(errors, /C7: vivid 4 is outside 0–3/);
  assert.match(errors, /C5: subject "X"/);
  assert.match(errors, /P5: id used twice/);
});

test("next pick per subject: highest open score, made ideas skipped, ties go to the better-proven idea", () => {
  const next = ts.nextPicks(ts.parse(TABLE));
  assert.equal(next.P.id, "P5");                       // Boyle (9) is made, P5 (10) is open
  assert.equal(next.C.id, "C5");                       // 7 beats the unproven flame colours (6)
  assert.equal(next.M, undefined, "@pyqvault_ has no maths series (founder, 2026-10-20)");
  const tie = ts.nextPicks(ts.parse(TABLE.replace("| – | 3 | 2 | 0 | 1 | 6 |", "| – | 3 | 2 | 1 | 1 | 7 |")));
  assert.equal(tie.C.id, "C5", "same score: the proven idea first");
});

test("the real backlog's score table is valid and has an open idea for every subject", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "remake-backlog.md"), "utf8");
  const rows = ts.parse(md);
  assert.ok(rows.length >= 10, `only ${rows.length} scored ideas`);
  assert.deepEqual(ts.validate(rows), []);
  const next = ts.nextPicks(rows);
  for (const s of ["P", "C"]) assert.ok(next[s], `no open ${s} idea`);
});

test("queued ideas (to make next) are listed as queued, and the next pick moves past them", () => {
  const md = TABLE.replace("| 125 | 3 | 2 | 1 | 1 | 10 | |", "| 125 | 3 | 2 | 1 | 1 | 10 | ⏭ queued |");
  const rows = ts.parse(md);
  assert.deepEqual(ts.queued(rows).map((r) => r.id), ["P5"]);
  assert.equal(ts.nextPicks(rows).P.id, "P6", "P5 is already queued, so the next physics pick is P6");
});

test("a broken row (wrong number of columns) is reported, not silently skipped", () => {
  const md = TABLE.replace("| 76 | 1 | 2 | 1 | 1 | 7 | |", "| 76 | 1 | 2 | 1 | 1 | 7 || queued |");
  assert.match(ts.validate(ts.parse(md)).join("\n"), /P6: 11 columns, expected 10/);
});

test("an idea moved to another handle is closed: never queued, never picked", () => {
  const rows = ts.parse(TABLE.replace("| 11 | 2 | 2 | 1 | 1 | 7 | |", "| 11 | 2 | 2 | 1 | 1 | 7 | ↪ moved to @lws.pune |"));
  assert.equal(ts.nextPicks(rows).C.id, "C7", "C5 moved away, so the next chemistry pick is C7");
  assert.deepEqual(ts.queued(rows), []);
});

test("a parked idea is skipped until it's unparked (founder, 2026-10-20: park W6)", () => {
  const { heading, subjects } = ts.ACCOUNTS.lwspune;
  const rows = ts.parse(LWS.replace("| 9 | |", "| 9 | ⏸ parked (founder, 2026-10-20) |"), heading);
  assert.deepEqual(ts.validate(rows, subjects), []);
  assert.equal(ts.nextPicks(rows, subjects).M.id, "W14");
  assert.deepEqual(ts.queued(rows), []);
});

// @lws.pune has its own table (founder 2026-10-20: same framework for both handles): NDA maths concepts, subject M only.
const LWS = `
## Topic scores

| # | Subject | Idea | Proof (×) | Vivid | Question | Law live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| P5 | P | Adiabatic squeeze | 125 | 3 | 2 | 1 | 1 | 10 | |

## @lws.pune topic scores

| # | Subject | Idea | Proof (×) | Vivid | Question | Concept live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| W6 | M | The soda can | 114 | 2 | 2 | 1 | 1 | 9 | |
| W14 | M | A matrix moves space | 34 | 3 | 1 | 1 | 0 | 7 | |
| W15 | M | f and f′ together | 115 | 2 | 1 | 1 | 0 | 7 | ✅ made |

## Re-run
`;

test("each handle reads only its own table", () => {
  assert.deepEqual(ts.parse(LWS).map((r) => r.id), ["P5"], "the default is @pyqvault_'s table");
  assert.deepEqual(ts.parse(LWS, ts.ACCOUNTS.lwspune.heading).map((r) => r.id), ["W6", "W14", "W15"]);
});

test("@lws.pune ideas are NDA maths only: subject M, and its next pick skips made ideas", () => {
  const { heading, subjects } = ts.ACCOUNTS.lwspune;
  const rows = ts.parse(LWS, heading);
  assert.deepEqual(ts.validate(rows, subjects), []);
  assert.equal(ts.nextPicks(rows, subjects).M.id, "W6");
  assert.match(ts.validate(ts.parse(LWS.replace("| W14 | M |", "| W14 | P |"), heading), subjects).join("\n"), /W14: subject "P" should be M/);
});

test("the real backlog's @lws.pune table is valid and has an open idea", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "remake-backlog.md"), "utf8");
  const { heading, subjects } = ts.ACCOUNTS.lwspune;
  const rows = ts.parse(md, heading);
  assert.ok(rows.length >= 9, `only ${rows.length} scored @lws.pune ideas`);
  assert.deepEqual(ts.validate(rows, subjects), []);
  assert.ok(ts.nextPicks(rows, subjects).M, "no open @lws.pune idea");
});

test("@pyqvault_ is physics and chemistry only: a maths row is an error (founder, 2026-10-20)", () => {
  const md = TABLE.replace("| C8 | C |", "| M5 | M | Square | 40 | 2 | 1 | 0 | 0 | 5 | |\n| C8 | C |");
  assert.match(ts.validate(ts.parse(md)).join("\n"), /M5: subject "M" should be P or C/);
});

test("a tie on score goes to the bigger views multiple, not just more proof points (F21: the better-proven idea)", () => {
  const md = TABLE.replace("| P6 | P | Work vs power | 76 | 1 | 2 | 1 | 1 | 7 | |",
    "| P9 | P | Heat flow | 54 | 3 | 1 | 1 | 1 | 8 | |\n| P12 | P | Topspin | 63 | 3 | 2 | 0 | 1 | 8 | |");
  const rows = ts.parse(md.replace("| 125 | 3 | 2 | 1 | 1 | 10 | |", "| 125 | 3 | 2 | 1 | 1 | 10 | ✅ made |"));
  assert.equal(ts.nextPicks(rows).P.id, "P12", "both score 8 with 2 proof points; 63× beats 54×");
});

test("same score and same proof: the idea with the law shown live goes first (F3: our best category)", () => {
  const md = TABLE.replace("| C7 | C | Flame colours | – | 3 | 2 | 0 | 1 | 6 | |",
    "| C7 | C | Flame colours | – | 3 | 2 | 0 | 1 | 6 | |\n| C12 | C | Heat it by 10 °C | – | 3 | 2 | 1 | 0 | 6 | |")
    .replace("| 11 | 2 | 2 | 1 | 1 | 7 | |", "| 11 | 2 | 2 | 1 | 1 | 7 | ✅ made |");
  assert.equal(ts.nextPicks(ts.parse(md)).C.id, "C12", "both 6 with no proof; C12 shows its law live, C7 doesn't");
});
