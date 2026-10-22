"use strict";
// Idea score (framework F21, both handles): which idea to make next. Checks each handle's idea table and names the best open
// idea per subject.
//
//   node reels/tools/topic-scores.js                       (both handles)
//   node reels/tools/topic-scores.js pyqvault              (one handle: pyqvault or lwspune)
//   node reels/tools/topic-scores.js pyqvault --calibrate  (tune the weights from posted results; prints, changes nothing)
//
// @pyqvault_ (reels/pyqvault-ideas.md, founder 2026-10-21): score = each criterion's points × its weight, out of 100. The
// criteria, their ranges and weights are the list's Scoring table; calibrate() suggests weight changes from posted reels'
// results at every analysis. Each idea names its Source (F1: remake, own, founder, or a PYQ Vault notes chapter); a notes or
// founder idea must pass the F28 gate and a notes chapter must be in the Concept sweep log; every idea to make must pass F29
// (explained without a single word) and have an idea card.
// @lws.pune (reels/remake-backlog.md) keeps the older unweighted score out of 10 until it is rebuilt (founder, 2026-10-21).
// The goal is engagement and reach, so exam weight is never a criterion (founder, 2026-10-20).

const fs = require("node:fs"), path = require("node:path");

// @lws.pune's fixed ranges: proof + vivid + question + concept live + everyday, out of 10.
const RANGES = { vivid: 3, question: 2, law: 1, everyday: 1 };
// @pyqvault_ is physics and chemistry only: they have the better visual content (founder, 2026-10-20).
const SUBJECTS = ["P", "C"];
const ACCOUNTS = {
  pyqvault: { handle: "@pyqvault_", file: "pyqvault-ideas.md", heading: "## Ideas", subjects: SUBJECTS, weighted: true },
  lwspune: { handle: "@lws.pune", file: "remake-backlog.md", heading: "## @lws.pune topic scores", subjects: ["M"] },
};
const REELS_A_DAY = 3;                 // @pyqvault_ posts at 09:00, 13:00 and 18:00 IST (pyqvault-insta.md)
// Calibration rules (pyqvault-ideas.md → Scoring): enough reels, a 20% gap, one half-step at a time, weights 0–3.
const CAL = { minReels: 6, minHours: 48, minSide: 3, gap: 1.2, step: 0.5, minWeight: 0, maxWeight: 3, confound: [0.75, 0.25] };

/** Proof points from "their views ÷ their typical reel": a big multiple means proven demand (framework F1); under 1×
    the idea already flopped for someone else, which is worse than no evidence (founder, 2026-10-20). */
function proofPoints(x) {
  if (x == null) return 0;
  return x >= 100 ? 3 : x >= 30 ? 2 : x >= 3 ? 1 : x >= 1 ? 0 : -1;
}

/** Tie-break order: no evidence counts as an ordinary reel (1×), so a flop ranks below it. */
const proofRank = (r) => r.proofX ?? 1;

/** The lines of the section under `heading` (that whole line, or that line followed by more words), up to the next ##. */
function section(md, heading) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.trim() === heading || l.trim().startsWith(heading + " "));
  if (start < 0) return [];
  const rest = lines.slice(start + 1), end = rest.findIndex((l) => l.startsWith("## "));
  return end < 0 ? rest : rest.slice(0, end);
}

const cellsOf = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
const plain = (c) => c.replace(/\*\*/g, "").trim();
/** The number a cell starts with ("**1,403** (11 h)" → 1403, "6.3 s" → 6.3), or null. */
const leadingNumber = (c) => { const m = plain(c).match(/^([\d,]+(?:\.\d+)?)/); return m ? Number(m[1].replace(/,/g, "")) : null; };

// Column header → row key. "Question" is @lws.pune's guess column; "Concept live" its law column.
const KEYS = { "#": "id", Subject: "subject", Idea: "idea", "Proof (×)": "proofX", Vivid: "vivid", Question: "question",
  Guess: "guess", Surprise: "surprise", "Law live": "law", "Concept live": "law", Everyday: "everyday", Score: "score",
  Status: "status", Source: "source", Wordless: "wordless" };

/** Rows of the idea table under `heading`, keyed by its header names. Wordless ✓ → true, ✗ → false (else kept as text). */
function parse(md, heading = ACCOUNTS.pyqvault.heading) {
  const lines = section(md, heading), names = cellsOf(lines.find((l) => /^\|\s*#\s*\|/.test(l)) || "");
  const rows = [];
  for (const line of lines) {
    const cells = cellsOf(line);
    if (!/^[A-Z]\d+$/.test(cells[0] || "")) continue;
    if (cells.length !== names.length) { rows.push({ id: cells[0], broken: cells.length, width: names.length }); continue; }
    const row = {};
    names.forEach((name, i) => {
      const key = KEYS[name], c = cells[i];
      if (!key) return;
      if (key === "proofX") row[key] = /^\d+(\.\d+)?$/.test(c) ? Number(c) : null;
      else if (["vivid", "question", "guess", "surprise", "law", "everyday", "score"].includes(key)) row[key] = Number(c);
      else if (key === "wordless") row[key] = c === "✓" ? true : c === "✗" ? false : c;
      else row[key] = c;
    });
    rows.push(row);
  }
  return rows;
}

/** The Scoring table: { key: { weight, min, max } } in table order. */
function parseWeights(md) {
  const out = {};
  for (const c of section(md, "## Scoring").map(cellsOf)) {
    if (c.length < 4 || !/^[a-z]+$/.test(c[1])) continue;
    const range = c[2].replace(/−/g, "-").match(/^(-?\d+)\s*[–-]\s*(-?\d+)$/);
    if (range) out[c[1]] = { weight: Number(c[3]), min: Number(range[1]), max: Number(range[2]) };
  }
  return out;
}

const pointsOf = (r, key) => (key === "proof" ? proofPoints(r.proofX) : r[key]);

/** Σ points × weight over Σ max × weight, out of 100 (a flop's −1 can take a score below 0). */
function weightedScore(r, weights) {
  let got = 0, best = 0;
  for (const [key, { weight, max }] of Object.entries(weights)) { got += weight * pointsOf(r, key); best += weight * max; }
  return best ? Math.round((100 * got) / best) : 0;
}

/** The chapters in the Concept sweep log (F28: each notes chapter is read once), in table order. */
function parseSweep(md) {
  return section(md, "## Concept sweep").map(cellsOf)
    .filter((c) => /^[a-z-]+\/[a-z0-9-]+$/.test(c[0] || "")).map((c) => c[0]);
}

/** Idea cards: "### P13 · Title" then "- **Frame 0:** …", "- **Without words:** a → b → c", "- **Second hook:** …",
    "- **From:** …". */
function parseCards(md) {
  const cards = {};
  let card = null;
  for (const line of section(md, "## Idea cards")) {
    const head = line.match(/^### ([A-Z]\d+) · (.+)$/);
    if (head) { card = cards[head[1]] = { title: head[2].trim(), frame0: "", beats: [], secondHook: "", from: "" }; continue; }
    const field = card && line.match(/^- \*\*(Frame 0|Without words|Second hook|From):\*\*\s*(.*)$/);
    if (!field) continue;
    const v = field[2].trim();
    if (field[1] === "Frame 0") card.frame0 = v;
    else if (field[1] === "Without words") card.beats = v.split(/\s+→\s+/).filter(Boolean);
    else if (field[1] === "Second hook") card.secondHook = v;
    else card.from = v;
  }
  return cards;
}

// Where a @pyqvault_ idea comes from (F1). Notes: the Class 11–12 physics and chemistry chapters of the MHT-CET and JEE Main
// notes in Question_Bank/src/app/notes; NDA notes belong to @lws.pune.
const isNotes = (source) => /^(mht-cet|jee-mains)-(physics|chemistry)\/[a-z0-9-]+$/.test(source);
const SOURCES = ["remake", "own", "founder"];

const isQueued = (r) => /queued/i.test(r.status);                       // picked, waiting to be made
const isOpen = (r) => !/made|rejected|dropped|queued|moved|parked/i.test(r.status);   // parked: kept, not picked
const toMake = (r) => isOpen(r) || isQueued(r);

const total = (r) => proofPoints(r.proofX) + r.vivid + r.question + r.law + r.everyday;

/** Everything wrong with the table, as readable lines (empty when it's fine). Options (the weighted @pyqvault_ list):
    `weights` (parseWeights), `swept` (parseSweep), `cards` (parseCards). Without weights, the @lws.pune score out of 10. */
function validate(rows, subjects = SUBJECTS, { weights, swept, cards } = {}) {
  const errors = [], seen = new Set(), list = subjects.join(", ").replace(/, (?=[^,]*$)/, " or ");
  if (swept) for (const [i, c] of swept.entries()) if (swept.indexOf(c) !== i) errors.push(`${c} is logged twice in the Concept sweep`);
  for (const r of rows) {
    if (r.broken) { errors.push(`${r.id}: ${r.broken} columns, expected ${r.width}`); continue; }
    if (seen.has(r.id)) errors.push(`${r.id}: id used twice`);
    seen.add(r.id);
    if (!subjects.includes(r.subject)) errors.push(`${r.id}: subject "${r.subject}" should be ${list}`);
    if (weights) {
      for (const [k, { min, max }] of Object.entries(weights))
        if (k !== "proof" && (!Number.isInteger(r[k]) || r[k] < min || r[k] > max)) errors.push(`${r.id}: ${k} ${r[k]} is outside ${min}–${max}`);
      const s = weightedScore(r, weights);
      if (r.score !== s) errors.push(`${r.id}: score ${r.score} should be ${s}`);
    } else {
      for (const [k, max] of Object.entries(RANGES))
        if (!Number.isInteger(r[k]) || r[k] < 0 || r[k] > max) errors.push(`${r.id}: ${k} ${r[k]} is outside 0–${max}`);
      if (r.score !== total(r)) errors.push(`${r.id}: score ${r.score} should be ${total(r)}`);
    }
    // F29: whatever its source, an idea still to make must be explainable by the picture alone, without a single word.
    if (r.wordless !== undefined && typeof r.wordless !== "boolean") errors.push(`${r.id}: wordless "${r.wordless}" should be ✓ or ✗`);
    else if (r.wordless === false && toMake(r))
      errors.push(`${r.id}: fails the F29 wordless test (the picture can't tell it without words); park it or find a picture that can`);
    if (cards && toMake(r)) {
      const c = cards[r.id];
      if (!c) errors.push(`${r.id}: no idea card`);
      else {
        if (!/\S.*→.*\S/.test(c.frame0)) errors.push(`${r.id}: card's frame 0 needs "question → answer"`);
        if (c.beats.length < 3) errors.push(`${r.id}: card has ${c.beats.length} wordless beats, needs ≥ 3`);
        if (!c.secondHook) errors.push(`${r.id}: card has no second hook`);
        if (!c.from) errors.push(`${r.id}: card doesn't say where it's from`);
      }
    }
    if (r.source === undefined) continue;
    if (!r.source) { errors.push(`${r.id}: no source (remake, own, founder, or a notes chapter like mht-cet-physics/ray-optics)`); continue; }
    if (!SOURCES.includes(r.source) && !isNotes(r.source)) {
      errors.push(`${r.id}: source "${r.source}" should be remake, own, founder, or an MHT-CET / JEE Main physics or chemistry chapter`);
      continue;
    }
    // F28: with no remake's proof behind it, an idea still to make must open on a 2-second guess (F4) over a busy picture (F2).
    if (r.source !== "remake" && toMake(r)) {
      const guess = r.guess ?? r.question;
      if (r.vivid < 2) errors.push(`${r.id}: fails the F28 gate: vivid ${r.vivid} (needs ≥ 2, F2); park it or find a busier picture`);
      if (guess < 2) errors.push(`${r.id}: fails the F28 gate: guess ${guess} (needs a 2-second guess, F4)`);
    }
    if (swept && isNotes(r.source) && !swept.includes(r.source))
      errors.push(`${r.id}: chapter ${r.source} is not in the Concept sweep log`);
  }
  if (cards) for (const id of Object.keys(cards)) if (!seen.has(id)) errors.push(`${id}: card has no row in Ideas`);
  return errors;
}

/** The "**Open: N ideas · about D days at 3 reels a day.**" line must count the open and queued ideas. */
function runwayErrors(md, rows) {
  const m = md.match(/\*\*Open: (\d+) ideas · about (\d+) days at \d+ reels a day\.\*\*/);
  if (!m) return [`no "Open: N ideas · about D days at ${REELS_A_DAY} reels a day." line`];
  const n = rows.filter((r) => !r.broken && toMake(r)).length, days = Math.ceil(n / REELS_A_DAY);
  return Number(m[1]) === n && Number(m[2]) === days ? []
    : [`the Open line says ${m[1]} ideas and ${m[2]} days; the list has ${n} open or queued (about ${days} days)`];
}

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
      .sort((a, b) => b.score - a.score || proofRank(b) - proofRank(a) || b.law - a.law);
    out[s] = open[0] || null;
  }
  return out;
}

// ---- Calibration (founder, 2026-10-21: "fine-tuned during every analysis of our posted list") ----

/** The reading age in a Views cell: "**268** (62 h)" → 62, "340 (5 h)" → 5, none → null. */
const readingHours = (c) => { const m = c.match(/\((\d+(?:\.\d+)?) h(?![a-z])/); return m ? Number(m[1]) : null; };

/** The results table of pyqvault-learnings.md: one entry per reel, with its idea id ("–" → null) and numbers. */
function parseResults(md) {
  const lines = section(md, "## Reel-by-reel results"), names = cellsOf(lines.find((l) => l.startsWith("| Reel |")) || "");
  const at = (c, name) => c[names.indexOf(name)] ?? "";
  return lines.map(cellsOf).filter((c) => c.length === names.length && c[0] !== "Reel" && !/^-+$/.test(c[0])).map((c) => ({
    reel: plain(at(c, "Reel")), idea: /^[A-Z]\d+[a-z]?$/.test(plain(at(c, "Idea"))) ? plain(at(c, "Idea")) : null,
    views: leadingNumber(at(c, "Views")), watch: leadingNumber(at(c, "Watch")), viewsCell: at(c, "Views"),
    hours: readingHours(at(c, "Views")),
    background: plain(at(c, "Background")), music: plain(at(c, "Music")), voice: plain(at(c, "Voice")), hook: plain(at(c, "Hook · opening")),
  }));
}

const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Spearman's rank correlation (ties get their average rank). */
function spearman(xs, ys) {
  const rank = (v) => { const order = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]), r = []; for (let i = 0; i < order.length;) {
    let j = i; while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    for (let k = i; k <= j; k++) r[order[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const rx = rank(xs), ry = rank(ys), mx = rx.reduce((a, b) => a + b) / rx.length, my = ry.reduce((a, b) => a + b) / ry.length;
  let cov = 0, vx = 0, vy = 0;
  rx.forEach((x, i) => { cov += (x - mx) * (ry[i] - my); vx += (x - mx) ** 2; vy += (ry[i] - my) ** 2; });
  return vx && vy ? cov / Math.sqrt(vx * vy) : 0;
}

const CONFOUNDS = { background: "background", music: "music", voice: "voice", hook: "hook" };

/** Something other than the criterion that one side has (≥ 75%) and the other mostly doesn't (≤ 25%), or null. */
function confound(high, low) {
  for (const [key, label] of Object.entries(CONFOUNDS)) {
    for (const v of new Set([...high, ...low].map((x) => x[key]))) {
      const share = (side) => side.filter((x) => x[key] === v).length / side.length, h = share(high), l = share(low);
      if ((h >= CAL.confound[0] && l <= CAL.confound[1]) || (l >= CAL.confound[0] && h <= CAL.confound[1])) return `${label} "${v}"`;
    }
  }
  return null;
}

/** One analysis: how well the score ranks posted reels (rho) and, per criterion, the weight change the rules give.
    Result per reel = the average of its views ÷ the typical views and its watch ÷ the typical watch (founder, 2026-10-22:
    views and watch time are the goals, to reach the most people; comments later). Typical = the median of every posted
    reel read at 48 h or more. A reel counts once its numbers are at least 48 h old; younger ones are listed in `tooYoung`. A criterion's
    reels split into above and at-or-below its average points. */
/** A rebuilt reel's id (P29b) → its idea's id (P29): the same idea made again. */
const baseIdea = (id) => id.replace(/[a-z]$/, "");

function calibrate(ideaRows, weights, results) {
  const withNumbers = results.filter((x) => x.views != null && x.watch != null);
  const ripe = withNumbers.filter((x) => x.hours != null && x.hours >= CAL.minHours);
  const typical = ripe.length ? { views: median(ripe.map((x) => x.views)), watch: median(ripe.map((x) => x.watch)) } : null;
  const byId = Object.fromEntries(ideaRows.filter((r) => !r.broken).map((r) => [r.id, r]));
  const tooYoung = withNumbers.filter((x) => x.idea && byId[baseIdea(x.idea)] && !ripe.includes(x));
  const reels = ripe.filter((x) => x.idea && byId[baseIdea(x.idea)])
    .map((x) => ({ ...x, row: byId[baseIdea(x.idea)], result: (x.views / typical.views + x.watch / typical.watch) / 2 }));
  if (reels.length < CAL.minReels)
    return { refused: `${reels.length} scored reels with numbers at ${CAL.minHours} h or more; need ${CAL.minReels}`, n: reels.length, tooYoung };
  const rho = spearman(reels.map((x) => weightedScore(x.row, weights)), reels.map((x) => x.result));
  const criteria = Object.entries(weights).map(([key, { weight }]) => {
    const pts = reels.map((x) => pointsOf(x.row, key)), mean = pts.reduce((a, b) => a + b) / pts.length;
    const out = { key, weight, change: 0, newWeight: weight };
    if (pts.every((p) => p === pts[0])) return { ...out, reason: "no spread (every reel scores the same)" };
    const high = reels.filter((_, i) => pts[i] > mean), low = reels.filter((_, i) => pts[i] <= mean);
    Object.assign(out, { nHigh: high.length, nLow: low.length });
    if (high.length < CAL.minSide || low.length < CAL.minSide) return { ...out, reason: `too few on one side (${high.length} high, ${low.length} low; need ${CAL.minSide})` };
    const hm = median(high.map((x) => x.result)), lm = median(low.map((x) => x.result)), ratio = hm / lm;
    Object.assign(out, { highMedian: hm, lowMedian: lm, ratio });
    const step = ratio >= CAL.gap ? CAL.step : ratio <= 1 / CAL.gap ? -CAL.step : 0;
    if (!step) return { ...out, reason: "within 20%" };
    const mix = confound(high, low);
    if (mix) return { ...out, reason: `lines up with ${mix}, so no change` };
    const nw = Math.min(CAL.maxWeight, Math.max(CAL.minWeight, weight + step));
    return { ...out, change: nw - weight, newWeight: nw, reason: step > 0 ? "high scorers did better" : "low scorers did better" };
  });
  return { n: reels.length, typical, rho, reels, criteria, tooYoung };
}

module.exports = { ACCOUNTS, CAL, proofPoints, parse, parseWeights, weightedScore, parseSweep, parseCards, validate, runwayErrors,
  nextPicks, queued, parseResults, spearman, calibrate, baseIdea };

if (require.main === module) {
  const read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
  const [only, flag] = process.argv.slice(2), name = { P: "Physics", C: "Chemistry", M: "Maths" };
  if (only && !ACCOUNTS[only]) { console.error(`unknown handle "${only}": use ${Object.keys(ACCOUNTS).join(" or ")}`); process.exit(1); }
  let failed = false;
  for (const [key, { handle, file, heading, subjects, weighted }] of Object.entries(ACCOUNTS)) {
    if (only && only !== key) continue;
    const md = read(file), rows = parse(md, heading), weights = weighted ? parseWeights(md) : undefined;
    const errors = [...validate(rows, subjects, weighted ? { weights, swept: parseSweep(md), cards: parseCards(md) } : {}),
      ...(weighted ? runwayErrors(md, rows) : [])];
    const out = weighted ? "/100" : "/10";
    console.log(`\n${handle} (${file})`);
    if (errors.length) { console.error(errors.join("\n")); failed = true; continue; }
    if (flag === "--calibrate" && weighted) {
      const cal = calibrate(rows, weights, parseResults(read("pyqvault-learnings.md")));
      const young = cal.tooYoung.map((x) => `${x.idea} (${x.hours ?? "?"} h)`).join(", ");
      if (young) console.log(`Not counted yet, read before ${CAL.minHours} h: ${young}`);
      if (cal.refused) { console.log(`Calibration refused: ${cal.refused}.`); continue; }
      console.log(`Calibration on ${cal.n} reels (typical: ${cal.typical.views} views, ${cal.typical.watch.toFixed(1)} s watched)`);
      for (const x of cal.reels) console.log(`  ${x.idea} ${x.reel.slice(0, 48)}: score ${weightedScore(x.row, weights)}, result ${x.result.toFixed(2)} (${x.viewsCell})`);
      console.log(`Does the score predict? rank correlation ${cal.rho.toFixed(2)} (1 = same order, 0 = no link, −1 = reversed)`);
      for (const c of cal.criteria) {
        const nums = c.ratio ? ` · high ${c.highMedian.toFixed(2)} vs low ${c.lowMedian.toFixed(2)} (${c.nHigh} vs ${c.nLow})` : "";
        console.log(`  ${c.key}: weight ${c.weight} → ${c.newWeight}${nums} · ${c.reason}`);
      }
      continue;
    }
    for (const s of subjects) {
      const open = rows.filter((r) => r.subject === s && isOpen(r)).sort((a, b) => b.score - a.score);
      console.log(`${name[s]}: ${open.map((r) => `${r.id} ${r.score}`).join(" · ") || "nothing open"}`);
    }
    const q = queued(rows);
    console.log(`Queued to make: ${q.map((r) => `${r.id} "${r.idea}" (${r.score}${out})`).join(" · ") || "none"}`);
    const next = nextPicks(rows, subjects);
    console.log("Next after the queue:", subjects.map((s) => next[s] ? `${name[s]} ${next[s].id} "${next[s].idea}" (${next[s].score}${out})` : `${name[s]} —`).join(" · "));
  }
  if (failed) process.exit(1);
}
