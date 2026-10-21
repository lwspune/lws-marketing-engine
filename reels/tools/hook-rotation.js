"use strict";
// Hook rotation (framework F25, @pyqvault_, founder 2026-10-21): the A/B/C guess (F4) stays on every reel, but the hook
// around it and the opening picture rotate, so the first 3 seconds don't become the same every reel. Each reel also asks a
// second question as the first is answered (F26: viewers leave at the answer) and either loops back to its first frame
// or ends on the end card (F27), never 3 the same in a row so the two can be compared. Reads the
// "## Hook queue" table in reels/remake-backlog.md and checks it against the rules and the ideas queued in Topic scores.
//
//   node reels/tools/hook-rotation.js

// The catalogue, each with the reel that proved it for another account (framework F25 has the evidence).
const HOOKS = ["Race", "Pick one", "Ending first", "Everyday puzzle", "You'd think", "Spot the mistake", "Put in order",
  "Same start, two endings"];
const OPENINGS = ["Orbit 360°", "Race running", "Ending first", "Zoom (scale)", "Parts build", "X-ray", "Split screen",
  "Colour flood"];
// Out by the founder's call: the reason is in the framework's change log.
const BANNED = { "Exam badge": "out (founder, 2026-10-21)" };
const ORBIT = "Orbit 360°", ORBIT_MAX = 2, WINDOW = 4;
const MAX_WORDS = 7, LOOP_RUN = 3;   // F7: on-screen lines ≤ 7 words
const HEADING = "## Hook queue";

/** Rows of the hook queue, in order (the table under HEADING; stops at the next ## heading). */
function parseQueue(md) {
  const lines = md.split("\n"), start = lines.findIndex((l) => l.trim() === HEADING);
  if (start < 0) return [];
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (!/^\d+$/.test(cells[0] || "")) continue;
    rows.push({ order: Number(cells[0]), id: cells[1], hook: cells[2], opening: cells[3], secondHook: cells[4], loop: cells[5],
      words: cells[6] });
  }
  return rows.sort((a, b) => a.order - b.order);
}

const subjectName = { P: "physics", C: "chemistry" };

/** Everything that breaks the rotation, as readable lines (empty when it's fine). */
function rotationErrors(q) {
  const errors = [];
  q.forEach((r, i) => {
    if (BANNED[r.hook]) errors.push(`${r.id}: hook "${r.hook}" is ${BANNED[r.hook]}`);
    else if (!HOOKS.includes(r.hook)) errors.push(`${r.id}: hook "${r.hook}" is not in F25's list`);
    if (!OPENINGS.includes(r.opening)) errors.push(`${r.id}: opening "${r.opening}" is not in F25's list`);
    const words = (r.secondHook || "").split(/\s+/).filter(Boolean).length;
    if (!words) errors.push(`${r.id}: no second hook (F26)`);
    else if (words > MAX_WORDS) errors.push(`${r.id}: second hook has ${words} words (at most ${MAX_WORDS})`);
    if (!["yes", "no"].includes(r.loop)) errors.push(`${r.id}: loop "${r.loop}" should be yes or no (F27)`);
    const prev = q[i - 1];
    if (!prev) return;
    if (r.hook === prev.hook) errors.push(`${r.id}: hook "${r.hook}" again right after ${prev.id}`);
    if (r.opening === prev.opening) errors.push(`${r.id}: opening "${r.opening}" again right after ${prev.id}`);
    if (r.id[0] === prev.id[0]) errors.push(`${r.id}: two ${subjectName[r.id[0]] ?? r.id[0]} reels in a row (F19: P → C)`);
  });
  for (let i = 0; i + LOOP_RUN <= q.length; i++) {
    const w = q.slice(i, i + LOOP_RUN);
    if (w.every((r) => r.loop === w[0].loop) && ["yes", "no"].includes(w[0].loop))
      errors.push(`loop "${w[0].loop}" on ${LOOP_RUN} reels in a row (${w[0].id}–${w[LOOP_RUN - 1].id})`);
  }
  for (let i = 0; i + WINDOW <= q.length; i++) {
    const w = q.slice(i, i + WINDOW), n = w.filter((r) => r.opening === ORBIT).length;
    if (n > ORBIT_MAX) errors.push(`orbit opens ${n} of the ${WINDOW} reels ${w[0].id}–${w[WINDOW - 1].id} (at most ${ORBIT_MAX})`);
  }
  return errors;
}

/** The hook queue and Topic scores' queued ideas must name the same ideas. */
function syncErrors(q, queuedRows) {
  const inQueue = new Set(q.map((r) => r.id)), queued = new Set(queuedRows.map((r) => r.id));
  return [
    ...[...inQueue].filter((id) => !queued.has(id)).map((id) => `${id} is in the hook queue but not queued in Topic scores`),
    ...[...queued].filter((id) => !inQueue.has(id)).map((id) => `${id} is queued in Topic scores but has no hook in the hook queue`),
  ];
}

module.exports = { HOOKS, OPENINGS, parseQueue, rotationErrors, syncErrors };

if (require.main === module) {
  const md = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "remake-backlog.md"), "utf8");
  const ts = require("./topic-scores.js");
  const q = parseQueue(md), errors = [...rotationErrors(q), ...syncErrors(q, ts.queued(ts.parse(md)))];
  for (const r of q) console.log(`${r.order}. ${r.id} · ${r.hook} · ${r.opening} · then "${r.secondHook}" · loop ${r.loop}`);
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log(q.length ? "✓ rotation OK" : "hook queue is empty");
}
