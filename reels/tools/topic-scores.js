"use strict";
// @pyqvault_ topic score (framework F21): which idea to make next. Reads the "Topic scores" table in
// reels/remake-backlog.md, checks every row, and names the best open idea per subject.
//
//   node reels/tools/topic-scores.js
//
// Score out of 10 = proof (0–3, from the views multiple) + vivid (0–3) + question (0–2) + law live (0–1)
// + everyday hook (0–1). The goal is engagement and reach, so exam weight is not a criterion (founder, 2026-10-20).

const RANGES = { vivid: 3, question: 2, law: 1, everyday: 1 };
const SUBJECTS = ["P", "C", "M"];

/** Proof points from "their views ÷ their typical reel": a big multiple means proven demand (framework F1). */
function proofPoints(x) {
  if (x == null) return 0;
  return x >= 100 ? 3 : x >= 30 ? 2 : x >= 3 ? 1 : 0;
}

/** Rows of the "## Topic scores" table (stops at the next heading). */
function parse(md) {
  const start = md.indexOf("## Topic scores");
  if (start < 0) return [];
  const rest = md.slice(start + 1), end = rest.search(/\n## /);
  const rows = [];
  for (const line of (end < 0 ? rest : rest.slice(0, end)).split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length !== 10 || !/^[A-Z]\d+$/.test(cells[0])) continue;
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
function validate(rows) {
  const errors = [], seen = new Set();
  for (const r of rows) {
    if (seen.has(r.id)) errors.push(`${r.id}: id used twice`);
    seen.add(r.id);
    if (!SUBJECTS.includes(r.subject)) errors.push(`${r.id}: subject "${r.subject}" should be P, C or M`);
    for (const [k, max] of Object.entries(RANGES))
      if (!Number.isInteger(r[k]) || r[k] < 0 || r[k] > max) errors.push(`${r.id}: ${k} ${r[k]} is outside 0–${max}`);
    if (r.score !== total(r)) errors.push(`${r.id}: score ${r.score} should be ${total(r)}`);
  }
  return errors;
}

const isOpen = (r) => !/made|rejected|dropped/i.test(r.status);

/** The best open idea per subject: highest score, then the better-proven one. */
function nextPicks(rows) {
  const out = {};
  for (const s of SUBJECTS) {
    const open = rows.filter((r) => r.subject === s && isOpen(r))
      .sort((a, b) => b.score - a.score || proofPoints(b.proofX) - proofPoints(a.proofX));
    out[s] = open[0] || null;
  }
  return out;
}

module.exports = { proofPoints, parse, validate, nextPicks };

if (require.main === module) {
  const md = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "remake-backlog.md"), "utf8");
  const rows = parse(md), errors = validate(rows);
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  const name = { P: "Physics", C: "Chemistry", M: "Maths" };
  for (const s of SUBJECTS) {
    const open = rows.filter((r) => r.subject === s && isOpen(r)).sort((a, b) => b.score - a.score);
    console.log(`${name[s]}: ${open.map((r) => `${r.id} ${r.score}`).join(" · ") || "nothing open"}`);
  }
  const next = nextPicks(rows);
  console.log("\nNext:", SUBJECTS.map((s) => next[s] ? `${name[s]} ${next[s].id} "${next[s].idea}" (${next[s].score}/10)` : `${name[s]} —`).join(" · "));
}
