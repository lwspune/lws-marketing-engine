"use strict";
// Virality predictor (founder, 2026-10-22; framework F30): will a finished @pyqvault_ reel beat our record for views?
// Inputs are measured on the finished reel (motion and colour in the first 3 s, its length, its cover) or read from its
// storyboard (hook move, words on screen, second hook…), each turned into points; the score is points × weights out of 100
// (the weights live in reels/virality-log.md → Scoring, tuned at every analysis like the idea score's); the band says
// record-breaker / above typical / below typical; the weakest input says what to fix. Each prediction is logged, frozen,
// before the reel is posted, and judged at 48 h.
//
//   node reels/tools/virality.js            (check the log, show accuracy so far)
//   node reels/tools/virality.js --calibrate (weight changes the 48 h results support; prints, changes nothing)
//   node reels/tools/virality.js --update    (each analysis: fill outcomes, apply the weight changes, log the run)

const fs = require("node:fs"), path = require("node:path");
const ts = require("./topic-scores.js");

// Colourfulness thresholds (Hasler and Süsstrunk's M, median over the first 3 s), set from our own reels' spread
// (2026-10-22): the pre-framework reels sit at 7–9, the framework reels at 11–41; at or above COLOUR[1] our most colourful.
const COLOUR = [10, 20];
const BANDS = ["record-breaker", "above typical", "below typical"];
// A frame "moves" when at least this share of its pixels changes noticeably from the previous frame (more than CHANGE,
// 0–255, averaged over R, G and B). A whole-frame average hid small objects (launch angles: mean 0.25, 0.3% of pixels).
const MOVING = 0.002, CHANGE = 10;

/** Points per input, from the anchors in the log's Scoring table. */
const points = {
  idea: (score) => (score >= 70 ? 3 : score >= 60 ? 2 : score >= 50 ? 1 : 0),
  motion: (share) => (share >= 0.95 ? 2 : share >= 0.75 ? 1 : 0),
  words: (n) => (n <= 10 ? 2 : n <= 18 ? 1 : 0),
  colour: (m) => (m >= COLOUR[1] ? 2 : m >= COLOUR[0] ? 1 : 0),
  length: (seconds) => (seconds <= 25 ? 1 : 0),
  momentum: (ratio) => (ratio >= 1.5 ? 2 : ratio >= 0.8 ? 1 : 0),
};

/** Mean absolute difference per colour channel (alpha ignored) between two RGBA frames of the same size. */
function frameDiff(a, b) {
  let sum = 0, n = 0;
  for (let i = 0; i < a.length; i += 4) for (let c = 0; c < 3; c++) { sum += Math.abs(a[i + c] - b[i + c]); n++; }
  return n ? sum / n : 0;
}

/** Share of pixels whose change, averaged over R, G and B, is more than `delta` (0–255). */
function changedShare(a, b, delta = CHANGE) {
  let changed = 0;
  for (let i = 0; i < a.length; i += 4)
    if ((Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3 > delta) changed++;
  return a.length ? changed / (a.length / 4) : 0;
}

/** Share of frames that move: frame-to-frame values (changedShare) at or above the threshold. */
const motionShare = (values, threshold = MOVING) => (values.length ? values.filter((d) => d >= threshold).length / values.length : 0);

// Framework F37: the opening keeps building to 3 s. It fades when seconds 1–3 are quiet both ways: under AFTERSHOCK of
// the first second's motion (set 2026-10-26 on 14 framework reels: Chemistry #10 0.52 and Physics #9b 0.28 fade, every
// other reel 0.8 or more) AND under AFTER_FLOOR of the pixels a frame, Physics #13's level (our best start, 78% at 3 s).
// The floor came the same day: a big shock made the ratio unreachable for a busy opening (Chemistry #11 remade: 0.39,
// though seconds 1–3 moved 16% a frame, 3× Physics #13).
const AFTERSHOCK = 0.6, AFTER_FLOOR = 0.05;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Median change per frame in 1–3 s (changedShare values 0.1 s apart; the first is the change at 0.1 s). */
const motionAfter = (values) => median(values.slice(10, 30));
/** motionAfter ÷ the median change in 0.2–1 s; null when the first second doesn't move at all (F5's failure, not this one). */
function aftershock(values) {
  const first = median(values.slice(2, 10));
  return first > 0 ? motionAfter(values) / first : null;
}
const fades = (values) => { const r = aftershock(values); return r != null && r < AFTERSHOCK && motionAfter(values) < AFTER_FLOOR; };

/** Hasler and Süsstrunk's colourfulness M of an RGBA frame: 0 for grey, ~15 slightly, ~33 moderately, ~59 highly colourful. */
function colourfulness(px) {
  const rg = [], yb = [];
  for (let i = 0; i < px.length; i += 4) { rg.push(px[i] - px[i + 1]); yb.push(0.5 * (px[i] + px[i + 1]) - px[i + 2]); }
  const stats = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return [m, Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length)]; };
  const [mrg, srg] = stats(rg), [myb, syb] = stats(yb);
  return Math.sqrt(srg ** 2 + syb ** 2) + 0.3 * Math.sqrt(mrg ** 2 + myb ** 2);
}

// ---- the log ----

const cellsOf = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
function tableRows(md, heading) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return { names: [], rows: [] };
  const rest = lines.slice(start + 1), end = rest.findIndex((l) => l.startsWith("## "));
  const body = (end < 0 ? rest : rest.slice(0, end)).filter((l) => l.startsWith("|")).map(cellsOf);
  return { names: body[0] || [], rows: body.slice(2) };
}

// Reels table header → input key (keys as in the Scoring table).
const INPUTS = { "Idea score": "idea", Motion: "motion", "Hook move": "hookmove", Words: "words", Colour: "colour",
  Length: "length", "Second hook": "secondhook", Momentum: "momentum", Cover: "cover", Answer: "answer", Loop: "loop" };

/** The Reels table: one row per reel, its points per input. */
function parseReels(md) {
  const { names, rows } = tableRows(md, "## Reels");
  return rows.map((c) => {
    const row = { id: c[names.indexOf("Idea")], reel: c[names.indexOf("Reel")] };
    names.forEach((n, i) => { if (INPUTS[n]) row[INPUTS[n]] = Number(c[i]); });
    if (names.includes("Measured")) row.measured = c[names.indexOf("Measured")];
    return row;
  });
}

/** "**Bands:** record-breaker ≥ 80 · above typical ≥ 55 · …" → { record: 80, above: 55 }. */
function parseBands(md) {
  const m = md.match(/\*\*Bands:\*\* record-breaker ≥ (\d+) · above typical ≥ (\d+)/);
  return m ? { record: Number(m[1]), above: Number(m[2]) } : null;
}

const score = (row, weights) => ts.weightedScore(row, weights);
const band = (s, b) => (s >= b.record ? BANDS[0] : s >= b.above ? BANDS[1] : BANDS[2]);

/** The counted input losing the most weighted points (first in table order on a tie), or null when nothing is lost. */
function weakest(row, weights) {
  let worst = null, lost = 0;
  for (const [key, { weight, max }] of Object.entries(weights)) {
    const l = weight * (max - row[key]);
    if (weight > 0 && l > lost) { worst = key; lost = l; }
  }
  return worst;
}

/** The Predictions table: frozen at logging time. */
function parsePredictions(md) {
  const { names, rows } = tableRows(md, "## Predictions"), at = (c, n) => c[names.indexOf(n)];
  return rows.map((c) => ({
    id: at(c, "Idea"), reel: at(c, "Reel"), logged: at(c, "Logged"), score: Number(at(c, "Score")), band: at(c, "Band"),
    weakest: at(c, "Weakest"), record: Number(at(c, "Record then")), typical: Number(at(c, "Typical then")), hindsight: at(c, "Hindsight") === "yes",
  }));
}

/** Everything wrong with the log, as readable lines. */
function validate(md) {
  const errors = [], weights = ts.parseWeights(md), reels = parseReels(md), ids = new Set(reels.map((r) => r.id));
  if (!parseBands(md)) errors.push('no "**Bands:** record-breaker ≥ N · above typical ≥ M" line');
  for (const r of reels) for (const [k, { min, max }] of Object.entries(weights))
    if (!Number.isInteger(r[k]) || r[k] < min || r[k] > max) errors.push(`${r.id}: ${k} ${r[k]} is outside ${min}–${max}`);
  for (const p of parsePredictions(md)) {
    if (!ids.has(p.id)) errors.push(`${p.id}: prediction has no row in Reels`);
    if (!BANDS.includes(p.band)) errors.push(`${p.id}: band "${p.band}" should be one of ${BANDS.join(", ")}`);
    if (!(p.record > 0 && p.typical > 0)) errors.push(`${p.id}: prediction needs the record and the typical views at logging time`);
  }
  return errors;
}

/** How the logged predictions did at 48 h: the actual band (by the record and typical at logging time), hits, and how
    well the score ranked views. Hindsight predictions are shown but never counted. */
function accuracy(predictions, results) {
  const byIdea = new Map(results.filter((x) => x.idea).map((x) => [x.idea, x]));
  const rows = predictions.map((p) => {
    const r = byIdea.get(p.id), ripe = r && r.views != null && r.hours != null && r.hours >= ts.CAL.minHours;
    const actual = ripe ? (r.views > p.record ? BANDS[0] : r.views >= p.typical ? BANDS[1] : BANDS[2]) : null;
    return { ...p, views: ripe ? r.views : null, actual, hit: actual ? actual === p.band : null };
  });
  const judged = rows.filter((r) => r.actual && !r.hindsight), hits = judged.filter((r) => r.hit).length;
  return { rows, n: judged.length, hits, hitRate: judged.length ? hits / judged.length : null,
    rho: judged.length >= 3 ? ts.spearman(judged.map((r) => r.score), judged.map((r) => r.views)) : null };
}

// ---- updating (founder, 2026-10-22: "old predictions are updated to fine-tune the predictor") ----

/** The line range [header, last row] of the table under a ## heading. */
function tableAt(lines, heading) {
  const h = lines.findIndex((l) => l.trim() === heading), head = lines.findIndex((l, i) => i > h && l.startsWith("|"));
  let last = head + 1;
  while (lines[last + 1] && lines[last + 1].startsWith("|")) last++;
  return { head, last };
}

/** Fill each prediction's outcome beside it (Views 48 h · Actual · Right); the frozen columns are never touched. */
function fillOutcomes(md, accRows) {
  const lines = md.split("\n"), { head, last } = tableAt(lines, "## Predictions");
  const extra = ["Views 48 h", "Actual", "Right"];
  if (!cellsOf(lines[head]).includes("Actual")) { lines[head] += ` ${extra.join(" | ")} |`; lines[head + 1] += "---|---|---|"; }
  const width = cellsOf(lines[head]).length, byId = new Map(accRows.map((r) => [r.id, r]));
  for (let i = head + 2; i <= last; i++) {
    const c = cellsOf(lines[i]).slice(0, width - 3), r = byId.get(c[0]);
    const right = !r || !r.actual ? "–" : r.hindsight ? "hindsight" : r.hit ? "✓" : "✗";
    lines[i] = `| ${[...c, r && r.views != null ? r.views.toLocaleString("en-US") : "–", r && r.actual ? r.actual : "waiting", right].join(" | ")} |`;
  }
  return lines.join("\n");
}

/** Write changed weights into the Scoring table. */
function applyWeights(md, criteria) {
  const lines = md.split("\n"), { head, last } = tableAt(lines, "## Scoring");
  const names = cellsOf(lines[head]), k = names.indexOf("Key"), w = names.indexOf("Weight");
  for (let i = head + 2; i <= last; i++) {
    const c = cellsOf(lines[i]), ch = criteria.find((x) => x.key === c[k] && x.change);
    if (ch) { c[w] = String(ch.newWeight); lines[i] = `| ${c.join(" | ")} |`; }
  }
  return lines.join("\n");
}

/** Add the run's row to the log (replacing today's row when run again the same day). */
function logRun(md, row) {
  const lines = md.split("\n"), { last } = tableAt(lines, "## Calibration and accuracy runs"), line = `| ${row.join(" | ")} |`;
  if (cellsOf(lines[last])[0] === row[0]) lines[last] = line; else lines.splice(last + 1, 0, line);
  return lines.join("\n");
}

/** The last logged run that calibrated: how many 48 h reels it used, and its date. */
function lastCalibrated(md) {
  const lines = md.split("\n"), { head, last } = tableAt(lines, "## Calibration and accuracy runs");
  for (let i = last; i >= head + 2; i--) {
    const m = /(?:calibrated on|still) (\d+) reels/.exec(lines[i]);
    if (m) return { n: Number(m[1]), date: cellsOf(lines[i])[0] };
  }
  return null;
}

/** One analysis: fill outcomes, apply the weight changes the calibration rule allows, log the run. Weights move only on
 *  new 48 h readings: the same readings never step a weight twice (48 h readings are write-once, so a count is enough). */
function update(md, results, today) {
  const acc = accuracy(parsePredictions(md), results);
  let out = fillOutcomes(md, acc.rows);
  const cal = ts.calibrate(parseReels(out), ts.parseWeights(out), results), prev = lastCalibrated(md);
  const held = !cal.refused && prev && prev.n === cal.n;
  if (held && prev.date === today) return { md: out, summary: `weights held: already run today on these ${cal.n} reels` };
  const moved = cal.refused || held ? [] : cal.criteria.filter((c) => c.change);
  if (moved.length) out = applyWeights(out, moved);
  const right = acc.n ? `${acc.hits} of ${acc.n}` : "–", rho = acc.rho == null ? "–" : acc.rho.toFixed(2);
  const changes = moved.length ? moved.map((c) => `${c.key} ${c.weight} → ${c.newWeight}`).join(", ") : "none";
  const note = cal.refused ? `calibration refused: ${cal.refused}`
    : held ? `no new 48 h reading: still ${cal.n} reels, weights held (score vs result ${cal.rho.toFixed(2)})`
    : `calibrated on ${cal.n} reels, score vs result ${cal.rho.toFixed(2)}`;
  out = logRun(out, [today, String(acc.n), right, rho, changes, note]);
  return { md: out, summary: `${acc.n ? `${right} bands right` : "no real prediction judged yet"}; weights: ${changes}; ${note}` };
}

module.exports = { COLOUR, BANDS, AFTERSHOCK, AFTER_FLOOR, points, frameDiff, changedShare, motionShare, aftershock, motionAfter, fades, fillOutcomes, applyWeights, update, colourfulness, parseReels, parseBands, score, band, weakest,
  parsePredictions, validate, accuracy };

if (require.main === module) {
  const read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
  const md = read("virality-log.md"), errors = validate(md);
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  const weights = ts.parseWeights(md), bands = parseBands(md), results = ts.parseResults(read("pyqvault-learnings.md"));
  if (process.argv[2] === "--update") {
    const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10), { md: next, summary } = update(md, results, today);
    fs.writeFileSync(path.join(__dirname, "..", "virality-log.md"), next);
    console.log(`Updated virality-log.md (${today}): ${summary}`);
    process.exit(0);
  }
  if (process.argv[2] === "--calibrate") {
    const rows = parseReels(md), cal = ts.calibrate(rows, weights, results);
    if (cal.refused) { console.log(`Calibration refused: ${cal.refused}.`); process.exit(0); }
    console.log(`Calibration on ${cal.n} reels · rank correlation ${cal.rho.toFixed(2)}`);
    for (const c of cal.criteria) console.log(`  ${c.key}: weight ${c.weight} → ${c.newWeight} · ${c.reason}`);
    process.exit(0);
  }
  for (const r of parseReels(md)) {
    const s = score(r, weights);
    console.log(`${r.id.padEnd(4)} ${r.reel.padEnd(32)} now ${String(s).padStart(3)} · ${band(s, bands)}${weakest(r, weights) ? ` · weakest: ${weakest(r, weights)}` : ""}`);
  }
  const acc = accuracy(parsePredictions(md), results);
  console.log(acc.n ? `Accuracy: ${acc.hits}/${acc.n} bands right${acc.rho != null ? `, rank correlation ${acc.rho.toFixed(2)}` : ""} (hindsight rows not counted)`
    : "Accuracy: no logged prediction has a 48 h reading yet.");
}
