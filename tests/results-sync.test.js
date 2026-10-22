"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const rs = require("../reels/tools/results-sync.js");
const ts = require("../reels/tools/topic-scores.js");

// Copy GoPost's readings into the results table (founder, 2026-10-22: the numbers must reach the log by themselves so the
// idea score and the virality predictor can learn). The 48 h reading is the one that counts; a younger reel shows its
// latest numbers with their age, and a 48 h reading is never replaced by anything younger.

const TABLE = `
## Reel-by-reel results (fill at 48 h and 7 d)

| Reel | Idea | Background | Music | Voice | Hook · opening | Tests | Posted | Reach | Views | Watch | Saves | Shares | Comments |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PV Physics #2, Boyle | P2 | white | lofi | — | — | L22 | 18 Oct 09:04 | 229 | **268** (62 h) | 6.3 s | 3 | 0 | 0 |
| PV Physics #4, ramp | P4 | white | drive | — | A/B/C | — | 20 Oct 12:33 | 1,234 | 1,403 (11 h) | 9.5 s | 3 | 0 | 0 |
| PV Maths #1 | – | white | drive | — | — | — | 18 Oct | 125 | 132 (50 h) | 3.1 s | 1 | 1 | 0 |

## Next
`;
const n = (views, watchSec, reach = 100) => ({ views, watchSec, reach, saves: 1, shares: 2, comments: 0 });
const RESULTS = [
  { slug: "pv-physics-002-boyle", title: "Physics #2", publishedAt: "2026-10-18T03:34:00Z", ageHours: 88, h48: n(263, 6.3, 230), d7: null, latest: n(270, 6.2) },
  { slug: "pv-physics-004-slope", title: "Physics #4", publishedAt: "2026-10-20T07:03:00Z", ageHours: 36.5, h48: null, d7: null, latest: n(1429, 9.4, 1250) },
  { slug: "pv-chem-001-heat-rate-repost", title: "Chemistry #1", publishedAt: "2026-10-18T12:01:00Z", ageHours: 79.5, h48: n(133, 3.5), d7: null, latest: null },
  { slug: "pv-physics-007-heat", title: "Physics #7 · hot meets cold", publishedAt: "2026-10-22T03:30:00Z", ageHours: 5.2, h48: null, d7: null, latest: n(380, 9.1) },
  { slug: "pv-maths-002-calculus", title: "Maths #2", publishedAt: "2026-10-19T12:01:00Z", ageHours: 55, h48: n(928, 7.8), d7: null, latest: null },
];
const IDEAS = { "pv-physics-002-boyle": "P2", "pv-physics-004-slope": "P4", "pv-chem-001-heat-rate": "C1", "pv-physics-007-heat": "P9" };

test("a reel's slug finds its idea, reposts included", () => {
  assert.equal(rs.ideaFor("pv-chem-001-heat-rate-repost", IDEAS), "C1");
  assert.equal(rs.ideaFor("pv-maths-002-calculus", IDEAS), null);
});

test("the 48 h reading goes in as '263 (48 h)'; a younger reel shows its latest with its age", () => {
  const { md, changes } = rs.applyResults(TABLE, RESULTS, IDEAS);
  const rows = ts.parseResults(md), byIdea = Object.fromEntries(rows.filter((r) => r.idea).map((r) => [r.idea, r]));
  assert.equal(byIdea.P2.views, 263);
  assert.equal(byIdea.P2.hours, 48);
  assert.equal(byIdea.P4.views, 1429);
  assert.equal(byIdea.P4.hours, 36);
  assert.equal(byIdea.P4.watch, 9.4);
  assert.match(md, /\| 1,250 \| 1,429 \(36 h\) \| 9\.4 s \| 1 \| 2 \| 0 \|/);
  assert.ok(changes.some((c) => /P2: 263 views at 48 h/.test(c)));
});

test("a reel with no row gets one; a reel that isn't one of our ideas (maths) is left alone", () => {
  const { md, changes } = rs.applyResults(TABLE, RESULTS, IDEAS);
  const rows = ts.parseResults(md);
  const p9 = rows.find((r) => r.idea === "P9"), c1 = rows.find((r) => r.idea === "C1");
  assert.equal(p9.views, 380);
  assert.equal(p9.hours, 5);
  assert.match(p9.reel, /Physics #7/);
  assert.ok(c1, "Chemistry #1's repost adds its row");
  assert.equal(rows.filter((r) => !r.idea).length, 1, "the maths row is untouched and no maths row is added");
  assert.ok(changes.some((c) => /P9: new row/.test(c)));
});

test("a 48 h reading is never replaced by a younger one", () => {
  const first = rs.applyResults(TABLE, RESULTS, IDEAS).md;
  const again = rs.applyResults(first, [{ ...RESULTS[0], h48: null, latest: n(300, 6) }], IDEAS).md;
  assert.equal(ts.parseResults(again).find((r) => r.idea === "P2").views, 263);
});

test("running it twice changes nothing the second time", () => {
  const once = rs.applyResults(TABLE, RESULTS, IDEAS).md, twice = rs.applyResults(once, RESULTS, IDEAS);
  assert.equal(twice.md, once);
  assert.deepEqual(twice.changes, []);
});

// A rebuilt reel of an idea gets the idea's id plus a version letter (P29b, founder 2026-10-22: rebuild an approved reel
// to compare it with the original), so both reels keep their own results row and prediction.
test("a rebuilt reel (P29b) maps from the virality log and keeps its own results row", () => {
  const ideas = rs.ideaMap("", "| P29 | pv-physics-009-wing-mirror | 2 |\n| P29b | pv-physics-009b-wing-mirror | 2 |\n");
  assert.equal(ideas["pv-physics-009b-wing-mirror"], "P29b");
  assert.equal(ideas["pv-physics-009-wing-mirror"], "P29");
  const rebuilt = { slug: "pv-physics-009b-wing-mirror", title: "Physics #9 rebuilt", publishedAt: "2026-10-24T03:30:00Z", ageHours: 50, h48: n(900, 9.0), d7: null, latest: null };
  const rows = ts.parseResults(rs.applyResults(TABLE, [rebuilt], ideas).md);
  const row = rows.find((r) => r.idea === "P29b");
  assert.ok(row, "P29b has its own row");
  assert.equal(row.views, 900);
});
