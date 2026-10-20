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
| M4 | M | f and f′ | 115 | 2 | 1 | 1 | 0 | 7 | |

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
    .replace("| M4 | M |", "| P5 | M |");
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
  assert.equal(next.M.id, "M4");
  const tie = ts.nextPicks(ts.parse(TABLE.replace("| – | 3 | 2 | 0 | 1 | 6 |", "| – | 3 | 2 | 1 | 1 | 7 |")));
  assert.equal(tie.C.id, "C5", "same score: the proven idea first");
});

test("the real backlog's score table is valid and has an open idea for every subject", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "remake-backlog.md"), "utf8");
  const rows = ts.parse(md);
  assert.ok(rows.length >= 15, `only ${rows.length} scored ideas`);
  assert.deepEqual(ts.validate(rows), []);
  const next = ts.nextPicks(rows);
  for (const s of ["P", "C", "M"]) assert.ok(next[s], `no open ${s} idea`);
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
  const rows = ts.parse(TABLE.replace("| 115 | 2 | 1 | 1 | 0 | 7 | |", "| 115 | 2 | 1 | 1 | 0 | 7 | ↪ moved to @lws.pune |"));
  assert.equal(ts.nextPicks(rows).M, null);
  assert.deepEqual(ts.queued(rows), []);
});
