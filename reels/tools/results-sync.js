"use strict";
// Results sync (founder, 2026-10-22): copy GoPost's readings into reels/pyqvault-learnings.md → Reel-by-reel results, so the
// idea score (topic-scores.js --calibrate) and the virality predictor (virality.js --update) learn without hand copying.
//
//   cd publisher && npm run insights -- --org=lws-pune && npm run results -- --org=lws-pune --project=pyqvault-insta
//   node reels/tools/results-sync.js          (reads analytics/reel-results-pyqvault-insta.json)
//
// The 48 h reading is the one that counts ("1,610 (48 h)"); a younger reel shows its latest numbers with their age
// ("420 (10 h)"), and a 48 h reading is never replaced by a younger one. A reel with no row gets one. A reel that isn't an
// idea in pyqvault-ideas.md (the closed maths series) is left alone.

const fs = require("node:fs"), path = require("node:path");

const HEADING = "## Reel-by-reel results";
const cellsOf = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
const fmt = (x) => (x == null ? "—" : Number(x).toLocaleString("en-US"));

/** A reel's idea id from its post slug (a repost is the same reel). */
const ideaFor = (slug, ideas) => ideas[slug.replace(/-repost$/, "")] ?? null;

/** The reading that counts most: 48 h, else the latest with its age in whole hours. */
function reading(r) {
  if (r.h48) return { n: r.h48, hours: 48 };
  if (r.latest) return { n: r.latest, hours: Math.floor(r.ageHours) };
  return null;
}
// A 48 h reading outranks any other; otherwise the older reading is the better one.
const rank = (hours) => (hours === 48 ? Infinity : hours ?? -1);
const hoursIn = (cell) => { const m = cell.match(/\((\d+(?:\.\d+)?) h(?![a-z])/); return m ? Number(m[1]) : null; };

const ist = (iso) => {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3_600_000);
  return `${d.getUTCDate()} ${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })} ${d.toISOString().slice(11, 16)}`;
};

/** Apply the results to the markdown; returns the new markdown and a line per change. */
function applyResults(md, results, ideas) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.startsWith(HEADING));
  if (start < 0) throw new Error(`no "${HEADING}" section`);
  const headerAt = lines.findIndex((l, i) => i > start && l.startsWith("| Reel |"));
  const names = cellsOf(lines[headerAt]), col = (n) => names.indexOf(n);
  let last = headerAt + 1;
  while (lines[last + 1] && lines[last + 1].startsWith("|")) last++;
  const changes = [];
  const fill = (cells, r, rd) => {
    const set = (name, v) => { if (col(name) >= 0) cells[col(name)] = v; };
    set("Views", `${fmt(rd.n.views)} (${rd.hours} h)`); set("Watch", `${rd.n.watchSec} s`);
    for (const [name, key] of [["Reach", "reach"], ["Saves", "saves"], ["Shares", "shares"], ["Comments", "comments"]])
      if (rd.n[key] != null) set(name, fmt(rd.n[key]));
  };
  for (const r of results) {
    const id = ideaFor(r.slug, ideas), rd = reading(r);
    if (!id || !rd) continue;
    let at = -1;
    for (let i = headerAt + 2; i <= last; i++) if (cellsOf(lines[i])[col("Idea")] === id) { at = i; break; }
    const what = `${id}: ${fmt(rd.n.views)} views at ${rd.hours} h${rd.hours === 48 ? "" : " (latest)"}`;
    if (at < 0) {
      const cells = names.map(() => "—");
      cells[col("Reel")] = r.title; cells[col("Idea")] = id; if (col("Posted") >= 0) cells[col("Posted")] = ist(r.publishedAt);
      fill(cells, r, rd);
      lines.splice(++last, 0, `| ${cells.join(" | ")} |`);
      changes.push(`${id}: new row (${r.title}) · ${what.slice(id.length + 2)}`);
      continue;
    }
    const cells = cellsOf(lines[at]), before = lines[at], had = hoursIn(cells[col("Views")] || "");
    if (rank(rd.hours) < rank(had) || (rank(rd.hours) === rank(had) && rd.hours !== 48)) continue;
    fill(cells, r, rd);
    const after = `| ${cells.join(" | ")} |`;
    if (after !== before) { lines[at] = after; changes.push(what); }
  }
  return { md: lines.join("\n"), changes };
}

/** Post slug → idea id, from the idea list's made statuses (`pv-…` in backticks) and the virality log's Reels table. */
function ideaMap(ideasMd, viralityMd) {
  const map = {};
  for (const line of ideasMd.split("\n")) {
    const c = cellsOf(line);
    if (!/^[PC]\d+$/.test(c[0] || "")) continue;
    for (const m of line.matchAll(/`(pv-[a-z0-9-]+)`/g)) map[m[1]] = c[0];
  }
  for (const line of viralityMd.split("\n")) {
    const c = cellsOf(line);
    if (/^[PC]\d+$/.test(c[0] || "") && /^pv-/.test(c[1] || "")) map[c[1]] = c[0];
  }
  return map;
}

module.exports = { ideaFor, applyResults, ideaMap };

if (require.main === module) {
  const root = path.join(__dirname, "..", ".."), read = (f) => fs.readFileSync(path.join(root, f), "utf8");
  const file = process.argv[2] || "analytics/reel-results-pyqvault-insta.json";
  const { exportedAt, reels } = JSON.parse(read(file));
  const ideas = ideaMap(read("reels/pyqvault-ideas.md"), read("reels/virality-log.md"));
  const target = "reels/pyqvault-learnings.md", { md, changes } = applyResults(read(target), reels, ideas);
  if (changes.length) fs.writeFileSync(path.join(root, target), md);
  console.log(`Results from ${exportedAt}: ${changes.length ? changes.join("\n") : "nothing new"}`);
}
