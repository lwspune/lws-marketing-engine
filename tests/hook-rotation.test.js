"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const hr = require("../reels/tools/hook-rotation.js");
const ts = require("../reels/tools/topic-scores.js");

// @pyqvault_ hook rotation (framework F25, founder 2026-10-21): the A/B/C guess stays, the hook around it and the opening
// picture rotate so the first 3 seconds don't become the same every reel. Every reel loops back to its first frame (F27,
// confirmed 2026-10-26). The second hook (F26) and the orbit cap (F22) were dropped on the data (framework v1.33).

const QUEUE = `
## Hook queue

| Order | # | Hook | Opening | Visual hook | Hook sound | Loop | Frame 0 (draft) |
|---|---|---|---|---|---|---|---|
| 1 | P11 | Pick one | Race running | five balls already flying from one cannon, each its own colour | thunk (the cannon fires) + whoosh-out | yes | Pick one. Don't switch. |
| 2 | C8 | Race | Zoom (scale) | two tubes side by side, bubbles already rising in both | crack (the molecule bursts) + tap (bubbles) | yes | Which fills first? |
| 3 | P6 | You'd think | Orbit 360° | two lifts hauling the same box, one racing ahead | silent (slow orbit) | yes | The fast lift does more work. Right? |
| 4 | C9 | Put in order | Colour flood | four glasses on a shelf, colours flooding in, four empty numbered slots below | shimmer (the colours flood) | yes | Most acidic first? |

## Next section
`;

test("reads the queue in order, and only the table under its heading", () => {
  const q = hr.parseQueue(QUEUE);
  assert.deepEqual(q.map((r) => r.id), ["P11", "C8", "P6", "C9"]);
  assert.equal(q[2].hook, "You'd think");
  assert.equal(q[2].opening, "Orbit 360°");
  assert.equal(q[0].loop, "yes");
  assert.equal(q[1].visual, "two tubes side by side, bubbles already rising in both");
});

// Founder, 2026-10-22: the hook's move gets its own sound (F14: only what's on screen), named from the kit in
// remotion/src/lib/sfx.ts, plus "music hit" (F13) or "silent" for a slow move.
test("the hook names its sound, from the kit only", () => {
  const q = hr.parseQueue(QUEUE);
  assert.equal(q[1].sound, "crack (the molecule bursts) + tap (bubbles)");
  assert.deepEqual(hr.rotationErrors(q), []);
  const md = QUEUE.replace("| crack (the molecule bursts) + tap (bubbles) |", "|  |")
    .replace("| silent (slow orbit) |", "| whoosh-in + kazoo |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /C8: no hook sound/);
  assert.match(errors, /P6: hook sound "kazoo" is not in the sound kit/);
});

test("the sound list matches the kit the reels are mixed from (remotion/src/lib/sfx.ts)", () => {
  const ts = fs.readFileSync(path.join(__dirname, "..", "remotion", "src", "lib", "sfx.ts"), "utf8");
  const hits = JSON.parse(ts.match(/HIT_KINDS = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  const beds = ts.match(/kind: ('[a-z]+'(?: \| '[a-z]+')*)/)[1].split(" | ").map((s) => s.replace(/'/g, ""));
  assert.deepEqual([...hr.SOUNDS].sort(), [...hits, ...beds, "music hit", "silent"].sort());
});

test("the opening catalogue has the attention moves: orbit, zoom, assemble (suit-up), split apart, morph", () => {
  for (const move of ["Orbit 360°", "Zoom (scale)", "Assemble (suit-up)", "Split apart", "Morph"]) assert.ok(hr.OPENINGS.includes(move), move);
  assert.ok(!hr.OPENINGS.includes("Parts build"), "Parts build is now Assemble (suit-up)");
});

test("Shock is an opening: a dramatic event from the topic in the first second (founder, 2026-10-23)", () => {
  assert.ok(hr.OPENINGS.includes("Shock"));
});

// Founder, 2026-10-21/22: "hook should always have a visual layer… orbit shot, objects splitting or coming together (just
// like an Iron Man suit), some visual which hooks the viewer's attention". The Opening is that move; the Visual hook column
// says what we see it do, as a picture (not a question in words).
test("every reel has a visual hook: a picture, not a question in words", () => {
  const md = QUEUE.replace("| two lifts hauling the same box, one racing ahead |", "|  |")
    .replace("| two tubes side by side, bubbles already rising in both |", "| which tube fills first? |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /P6: no visual hook/);
  assert.match(errors, /C8: the visual hook reads as a question/);
});

test("a queue that follows every rule has no errors", () => {
  assert.deepEqual(hr.rotationErrors(hr.parseQueue(QUEUE)), []);
});

test("the same hook twice in a row is refused", () => {
  const md = QUEUE.replace("| C8 | Race |", "| C8 | Pick one |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /C8: hook "Pick one" again right after P11/);
});

test("the same opening twice in a row is refused", () => {
  const md = QUEUE.replace("| Zoom (scale) |", "| Race running |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /C8: opening "Race running" again right after P11/);
});

test("physics and chemistry alternate (framework F19)", () => {
  const md = QUEUE.replace("| 2 | C8 |", "| 2 | P8 |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /P8: two physics reels in a row/);
});

// Founder, 2026-10-28: maths is back on @pyqvault_, so the subjects rotate P → C → M.
test("two maths reels in a row are refused, a maths reel after chemistry is fine", () => {
  assert.deepEqual(hr.rotationErrors(hr.parseQueue(QUEUE.replace("| 4 | C9 |", "| 4 | M1 |"))), []);
  const md = QUEUE.replace("| 3 | P6 |", "| 3 | M1 |").replace("| 4 | C9 |", "| 4 | M2 |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /M2: two maths reels in a row/);
});

// Founder, 2026-10-28 ("let's not reinvent the wheel"): an imitated reel (framework F40) keeps its source's hook and
// opening, so "Copied" is in both catalogues and two imitations in a row aren't a repeat. The loop (F27) still holds.
test("an imitated reel keeps its source's hook and opening (F40), and two in a row aren't a repeat", () => {
  const md = QUEUE.replace("| P6 | You'd think | Orbit 360° |", "| P6 | Copied | Copied |")
    .replace("| C9 | Put in order | Colour flood |", "| C9 | Copied | Copied |");
  assert.deepEqual(hr.rotationErrors(hr.parseQueue(md)), []);
  const noLoop = md.replace("| yes | Most acidic", "| no | Most acidic");
  assert.match(hr.rotationErrors(hr.parseQueue(noLoop)).join("\n"), /C9: loop "no": every reel loops/);
});

test("the exam badge is out (founder, 2026-10-21), and so is any hook or opening not in the catalogue", () => {
  const md = QUEUE.replace("| P11 | Pick one |", "| P11 | Exam badge |").replace("| Colour flood |", "| Slow fade |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /P11: hook "Exam badge" is out \(founder, 2026-10-21\)/);
  assert.match(errors, /C9: opening "Slow fade" is not in F25's list/);
});

// F27 confirmed (2026-10-26): the 4 looping reels got 1.35 views per account reached, the 14 with an end card 1.16.
test("every reel loops back to its first frame (F27)", () => {
  const errors = hr.rotationErrors(hr.parseQueue(QUEUE.replace("| yes | Which fills", "| no | Which fills"))).join("\n");
  assert.match(errors, /C8: loop "no": every reel loops \(F27\)/);
});

// Framework v1.33 (2026-10-26): F26 (8 reels with a second hook, median watch 8.5 s vs 8.7 s without) was dropped on the
// data, so a queue without the Second hook / Second visual / Second sound columns passes.
test("no second hook is needed (F26 dropped)", () => {
  const q = hr.parseQueue(QUEUE);
  assert.equal(q[0].secondHook, undefined);
  assert.deepEqual(hr.rotationErrors(q), []);
});

test("the queue matches the ideas queued in the idea list, both ways", () => {
  const queuedRows = [{ id: "P11" }, { id: "C8" }, { id: "P6" }, { id: "C15" }];
  const errors = hr.syncErrors(hr.parseQueue(QUEUE), queuedRows).join("\n");
  assert.match(errors, /C9 is in the hook queue but not queued in the idea list/);
  assert.match(errors, /C15 is queued in the idea list but has no hook in the hook queue/);
});

test("the real hook queue in reels/pyqvault-ideas.md follows the rotation and matches the idea list", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "pyqvault-ideas.md"), "utf8");
  const q = hr.parseQueue(md);
  assert.ok(q.length > 0, "the hook queue has rows");
  assert.deepEqual(hr.rotationErrors(q), []);
  assert.deepEqual(hr.syncErrors(q, ts.queued(ts.parse(md))), []);
});
