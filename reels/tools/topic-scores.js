"use strict";
// Topic score (framework F21, both handles): which idea to make next. Reads each handle's score table in
// reels/remake-backlog.md, checks every row, and names the best open idea per subject.
//
//   node reels/tools/topic-scores.js            (both handles)
//   node reels/tools/topic-scores.js lwspune    (one handle: pyqvault or lwspune)
//
// Score out of 10 = proof (0–3, from the views multiple) + vivid (0–3) + question (0–2) + law live (0–1)
// + everyday hook (0–1). The goal is engagement and reach, so exam weight is not a criterion (founder, 2026-10-20).

const RANGES = { vivid: 3, question: 2, law: 1, everyday: 1 };
// @pyqvault_ is physics and chemistry only: they have the better visual content (founder, 2026-10-20).
const SUBJECTS = ["P", "C"];
// @lws.pune scores NDA maths concepts only (founder 2026-10-20); its "law live" column is "concept live".
const ACCOUNTS = {
  pyqvault: { handle: "@pyqvault_", heading: "## Topic scores", subjects: SUBJECTS },
  lwspune: { handle: "@lws.pune", heading: "## @lws.pune topic scores", subjects: ["M"] },
};

/** Proof points from "their views ÷ their typical reel": a big multiple means proven demand (framework F1). */
function proofPoints(x) {
  if (x == null) return 0;
  return x >= 100 ? 3 : x >= 30 ? 2 : x >= 3 ? 1 : 0;
}

/** Rows of the table under `heading` (a whole line; stops at the next ## heading). */
function parse(md, heading = ACCOUNTS.pyqvault.heading) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return [];
  const rest = lines.slice(start + 1).join("\n"), end = rest.search(/(^|\n)## /);
  const rows = [];
  for (const line of (end < 0 ? rest : rest.slice(0, end)).split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (!/^[A-Z]\d+$/.test(cells[0] || "")) continue;
    if (cells.length !== 10) { rows.push({ id: cells[0], broken: cells.length }); continue; }   // reported by validate()
    const n = (c) => Number(c);
    rows.push({
      id: cells[0], subject: cells[1], idea: cells[2], proofX: /^\d+(\.\d+)?$/.test(cells[3]) ? n(cells[3]) : null,
      vivid: n(cells[4]), question: n(cells[5]), law: n(cells[6]), everyday: n(cells[7]), score: n(cells[8]), status: cells[9],
    });
  }
  return rows;
}

const total = (r) => proofPoints(r.proofX) + r.vivid + r.question + r.law + r.everyday;

/** Everything wrong with the table, as readable lines (empty when it's fine). */
function validate(rows, subjects = SUBJECTS) {
  const errors = [], seen = new Set(), list = subjects.join(", ").replace(/, (?=[^,]*$)/, " or ");
  for (const r of rows) {
    if (r.broken) { errors.push(`${r.id}: ${r.broken} columns, expected 10`); continue; }
    if (seen.has(r.id)) errors.push(`${r.id}: id used twice`);
    seen.add(r.id);
    if (!subjects.includes(r.subject)) errors.push(`${r.id}: subject "${r.subject}" should be ${list}`);
    for (const [k, max] of Object.entries(RANGES))
      if (!Number.isInteger(r[k]) || r[k] < 0 || r[k] > max) errors.push(`${r.id}: ${k} ${r[k]} is outside 0–${max}`);
    if (r.score !== total(r)) errors.push(`${r.id}: score ${r.score} should be ${total(r)}`);
  }
  return errors;
}

const isQueued = (r) => /queued/i.test(r.status);                       // picked, waiting to be made
const isOpen = (r) => !/made|rejected|dropped|queued|moved|parked/i.test(r.status);   // parked: kept, not picked

/** Ideas already picked and waiting to be made, best first. */
function queued(rows) {
  return rows.filter(isQueued).sort((a, b) => b.score - a.score);
}

/** The best open idea per subject (not queued): highest score, then the better-proven one (bigger views multiple), then
    the one that shows its law live (F3). */
function nextPicks(rows, subjects = SUBJECTS) {
  const out = {};
  for (const s of subjects) {
    const open = rows.filter((r) => r.subject === s && isOpen(r))
      .sort((a, b) => b.score - a.score || (b.proofX ?? 0) - (a.proofX ?? 0) || b.law - a.law);
    out[s] = open[0] || null;
  }
  return out;
}

module.exports = { ACCOUNTS, proofPoints, parse, validate, nextPicks, queued };

if (require.main === module) {
  const md = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "remake-backlog.md"), "utf8");
  const only = process.argv[2], name = { P: "Physics", C: "Chemistry", M: "Maths" };
  if (only && !ACCOUNTS[only]) { console.error(`unknown handle "${only}": use ${Object.keys(ACCOUNTS).join(" or ")}`); process.exit(1); }
  let failed = false;
  for (const [key, { handle, heading, subjects }] of Object.entries(ACCOUNTS)) {
    if (only && only !== key) continue;
    const rows = parse(md, heading), errors = validate(rows, subjects);
    console.log(`\n${handle}`);
    if (errors.length) { console.error(errors.join("\n")); failed = true; continue; }
    for (const s of subjects) {
      const open = rows.filter((r) => r.subject === s && isOpen(r)).sort((a, b) => b.score - a.score);
      console.log(`${name[s]}: ${open.map((r) => `${r.id} ${r.score}`).join(" · ") || "nothing open"}`);
    }
    const q = queued(rows);
    console.log(`Queued to make: ${q.map((r) => `${r.id} "${r.idea}" (${r.score}/10)`).join(" · ") || "none"}`);
    const next = nextPicks(rows, subjects);
    console.log("Next after the queue:", subjects.map((s) => next[s] ? `${name[s]} ${next[s].id} "${next[s].idea}" (${next[s].score}/10)` : `${name[s]} —`).join(" · "));
  }
  if (failed) process.exit(1);
}
