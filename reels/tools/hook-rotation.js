"use strict";
// Hook rotation (framework F25, @pyqvault_, founder 2026-10-21): the A/B/C guess (F4) stays on every reel, but the hook
// around it and the opening picture rotate, so the first 3 seconds don't become the same every reel. Every reel loops back
// to its first frame (F27, confirmed 2026-10-26: loops earn rewatches). Every hook has a visual layer: the
// picture that poses the question with the text hidden (founder, 2026-10-21). Reads the
// "## Hook queue" table in reels/pyqvault-ideas.md and checks it against the rules and the ideas queued in its Ideas table.
//
//   node reels/tools/hook-rotation.js

// The catalogue, each with the reel that proved it for another account (framework F25 has the evidence).
const HOOKS = ["Race", "Pick one", "Ending first", "Everyday puzzle", "You'd think", "Spot the mistake", "Put in order",
  "Same start, two endings", "Copied"];
// Openings are the visual layer, the move that grabs attention in the first 3 s (founder, 2026-10-22: "orbit shot, objects
// splitting or coming together, just like an Iron Man suit"). Assemble (suit-up) replaced "Parts build". Shock: a dramatic
// event from the topic in the first second, before anyone can read (founder, 2026-10-23).
const OPENINGS = ["Orbit 360°", "Race running", "Ending first", "Zoom (scale)", "Assemble (suit-up)", "Split apart", "Morph",
  "X-ray", "Split screen", "Colour flood", "Shock", "Copied"];
// Out by the founder's call: the reason is in the framework's change log.
const BANNED = { "Exam badge": "out (founder, 2026-10-21)" };
// An imitated reel (framework F40, founder 2026-10-28) keeps the hook and opening of the reel it copies.
const COPIED = "Copied";
const HEADING = "## Hook queue";

// The sound kit the hook's sound comes from (founder, 2026-10-22; F14: only what's on screen): the hits and beds of
// remotion/src/lib/sfx.ts (a test keeps this list equal to it), a music hit (F13), or silent for a slow move.
const SOUNDS = ["click", "crack", "thunk", "whump", "tap", "boom", "whoosh-in", "whoosh-out", "snap", "shimmer", "clang", "roar", "scrape", "rain", "dawn",
  "music hit", "silent"];

/** Each sound named in a cell like "snap ×8 (rising) + shimmer", or the names that aren't in the kit. */
const soundsIn = (cell) => cell.split("+").map((s) => s.replace(/\([^)]*\)/g, "").replace(/×\s*\d+/g, "").trim()).filter(Boolean);

// Column header → field (columns are read by name, so one can be added without breaking the rest).
const FIELDS = { Order: "order", "#": "id", Hook: "hook", Opening: "opening", "Visual hook": "visual", "Hook sound": "sound",
  Loop: "loop", "Frame 0 (draft)": "words" };

/** Rows of the hook queue, in order (the table under HEADING; stops at the next ## heading). */
function parseQueue(md) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.trim() === HEADING);
  if (start < 0) return [];
  const cellsOf = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
  let names = [];
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    const cells = cellsOf(line);
    if (cells[0] === "Order") { names = cells; continue; }
    if (!/^\d+$/.test(cells[0] || "")) continue;
    const row = {};
    names.forEach((name, i) => { if (FIELDS[name]) row[FIELDS[name]] = cells[i] ?? ""; });
    row.order = Number(row.order);
    rows.push(row);
  }
  return rows.sort((a, b) => a.order - b.order);
}

const subjectName = { P: "physics", C: "chemistry", M: "maths" };

/** Everything that breaks the rotation, as readable lines (empty when it's fine). */
function rotationErrors(q) {
  const errors = [];
  q.forEach((r, i) => {
    if (BANNED[r.hook]) errors.push(`${r.id}: hook "${r.hook}" is ${BANNED[r.hook]}`);
    else if (!HOOKS.includes(r.hook)) errors.push(`${r.id}: hook "${r.hook}" is not in F25's list`);
    if (!OPENINGS.includes(r.opening)) errors.push(`${r.id}: opening "${r.opening}" is not in F25's list`);
    // Founder, 2026-10-21/22: "hook should always have a visual layer", a move that grabs attention in the first 3 s. The
    // column describes what we see that move do, so it can't be a question in words.
    if (!r.visual) errors.push(`${r.id}: no visual hook (what eye-catching move opens the reel: an orbit, a suit-up assembly, a split…?)`);
    else if (r.visual.includes("?")) errors.push(`${r.id}: the visual hook reads as a question; describe what we see the move do`);
    // Founder, 2026-10-22: the hook's move has its sound, from the kit.
    if (!r.sound) errors.push(`${r.id}: no hook sound (which kit sound goes with the move? ${SOUNDS.join(", ")})`);
    else for (const s of soundsIn(r.sound)) if (!SOUNDS.includes(s)) errors.push(`${r.id}: hook sound "${s}" is not in the sound kit`);
    if (r.loop !== "yes") errors.push(`${r.id}: loop "${r.loop}": every reel loops (F27)`);
    const prev = q[i - 1];
    if (!prev) return;
    if (r.hook === prev.hook && r.hook !== COPIED) errors.push(`${r.id}: hook "${r.hook}" again right after ${prev.id}`);
    if (r.opening === prev.opening && r.opening !== COPIED) errors.push(`${r.id}: opening "${r.opening}" again right after ${prev.id}`);
    if (r.id[0] === prev.id[0]) errors.push(`${r.id}: two ${subjectName[r.id[0]] ?? r.id[0]} reels in a row (F19: P → C → M)`);
  });
  return errors;
}

/** The hook queue and the idea list's queued ideas must name the same ideas. */
function syncErrors(q, queuedRows) {
  const inQueue = new Set(q.map((r) => r.id)), queued = new Set(queuedRows.map((r) => r.id));
  return [
    ...[...inQueue].filter((id) => !queued.has(id)).map((id) => `${id} is in the hook queue but not queued in the idea list`),
    ...[...queued].filter((id) => !inQueue.has(id)).map((id) => `${id} is queued in the idea list but has no hook in the hook queue`),
  ];
}

module.exports = { HOOKS, OPENINGS, SOUNDS, parseQueue, rotationErrors, syncErrors };

if (require.main === module) {
  const md = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "pyqvault-ideas.md"), "utf8");
  const ts = require("./topic-scores.js");
  const q = parseQueue(md), errors = [...rotationErrors(q), ...syncErrors(q, ts.queued(ts.parse(md)))];
  for (const r of q) console.log(`${r.order}. ${r.id} · ${r.hook} · ${r.opening} · loop ${r.loop}`);
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log(q.length ? "✓ rotation OK" : "hook queue is empty");
}
