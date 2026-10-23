"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const hr = require("../reels/tools/hook-rotation.js");
const ts = require("../reels/tools/topic-scores.js");

// @pyqvault_ hook rotation (framework F25, founder 2026-10-21): the A/B/C guess stays, the hook around it and the opening
// picture rotate so the first 3 seconds don't become the same every reel. Each reel also gets a second hook at the answer
// (F26) and either loops back to its first frame or ends on the end card (F27).

const QUEUE = `
## Hook queue

| Order | # | Hook | Opening | Visual hook | Hook sound | Second hook | Second visual | Second sound | Loop | Frame 0 (draft) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | P11 | Pick one | Race running | five balls already flying from one cannon, each its own colour | thunk (the cannon fires) + whoosh-out | Then which angle goes farthest? | the fan freezes; the camera punches in on the 30° and 60° balls landing together | whoosh-in + music hit | yes | Pick one. Don't switch. |
| 2 | C8 | Race | Zoom (scale) | two tubes side by side, bubbles already rising in both | crack (the molecule bursts) + tap (bubbles) | Why exactly twice as fast? | punch-in on one molecule; it splits again in slow motion | whoosh-in + crack | no | Which fills first? |
| 3 | P6 | You'd think | Orbit 360° | two lifts hauling the same box, one racing ahead | silent (slow orbit) | So what did the fast lift spend? | both lifts freeze; the camera swings to the power meters | thunk (the lifts stop) + music hit | no | The fast lift does more work. Right? |
| 4 | C9 | Put in order | Colour flood | four glasses on a shelf, colours flooding in, four empty numbered slots below | shimmer (the colours flood) | Where does pure water sit? | a clear glass slides into the empty middle slot | tap (the glass lands) + shimmer | yes | Most acidic first? |

## Next section
`;

test("reads the queue in order, and only the table under its heading", () => {
  const q = hr.parseQueue(QUEUE);
  assert.deepEqual(q.map((r) => r.id), ["P11", "C8", "P6", "C9"]);
  assert.equal(q[2].hook, "You'd think");
  assert.equal(q[2].opening, "Orbit 360°");
  assert.equal(q[0].secondHook, "Then which angle goes farthest?");
  assert.equal(q[0].loop, "yes");
  assert.equal(q[1].visual, "two tubes side by side, bubbles already rising in both");
});

// Founder, 2026-10-21/22: "hook should always have a visual layer… orbit shot, objects splitting or coming together (just
// like an Iron Man suit), some visual which hooks the viewer's attention". The Opening is that move; the Visual hook column
// says what we see it do, as a picture (not a question in words).
// Founder, 2026-10-22: "second should also have attention grabbing visual". As the second question appears (F26), the
// scene makes its own striking move; the Second visual column says what we see.
test("every second hook has its own attention-grabbing visual, described as a picture", () => {
  const ok = hr.rotationErrors(hr.parseQueue(QUEUE)).join("\n");
  assert.doesNotMatch(ok, /second visual/);
  assert.equal(hr.parseQueue(QUEUE)[1].secondVisual, "punch-in on one molecule; it splits again in slow motion");
  const md = QUEUE.replace("| punch-in on one molecule; it splits again in slow motion |", "|  |")
    .replace("| both lifts freeze; the camera swings to the power meters |", "| what did the fast lift spend? |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /C8: no second visual/);
  assert.match(errors, /P6: the second visual reads as a question/);
});

// Founder, 2026-10-22: each hook's move gets its own sound (F14: only what's on screen), named from the kit in
// remotion/src/lib/sfx.ts, plus "music hit" (F13) or "silent" for a slow move (F15).
test("both hooks name their sounds, from the kit only", () => {
  const q = hr.parseQueue(QUEUE);
  assert.equal(q[1].sound, "crack (the molecule bursts) + tap (bubbles)");
  assert.deepEqual(hr.rotationErrors(q), []);
  const md = QUEUE.replace("| crack (the molecule bursts) + tap (bubbles) |", "|  |")
    .replace("| thunk (the lifts stop) + music hit |", "| thunk + kazoo |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /C8: no hook sound/);
  assert.match(errors, /P6: second sound "kazoo" is not in the sound kit/);
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

test("the orbit opens at most 2 of any 4 reels in a row", () => {
  const md = QUEUE.replace("| Race running |", "| Orbit 360° |").replace("| Colour flood |", "| Orbit 360° |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /orbit opens 3 of the 4 reels P11–C9/);
});

test("physics and chemistry alternate (framework F19)", () => {
  const md = QUEUE.replace("| 2 | C8 |", "| 2 | P8 |");
  assert.match(hr.rotationErrors(hr.parseQueue(md)).join("\n"), /P8: two physics reels in a row/);
});

test("the exam badge is out (founder, 2026-10-21), and so is any hook or opening not in the catalogue", () => {
  const md = QUEUE.replace("| P11 | Pick one |", "| P11 | Exam badge |").replace("| Colour flood |", "| Slow fade |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /P11: hook "Exam badge" is out \(founder, 2026-10-21\)/);
  assert.match(errors, /C9: opening "Slow fade" is not in F25's list/);
});

test("every reel has a second hook at the answer, short enough to read at a glance (F26, F7: ≤ 7 words)", () => {
  const md = QUEUE.replace("| Then which angle goes farthest? |", "|  |")
    .replace("| Why exactly twice as fast? |", "| So why does hydrogen fill exactly twice as fast here? |");
  const errors = hr.rotationErrors(hr.parseQueue(md)).join("\n");
  assert.match(errors, /P11: no second hook/);
  assert.match(errors, /C8: second hook has 10 words \(at most 7\)/);
});

test("loop is yes or no, and never the same 3 reels in a row, so loops and end cards stay comparable (F27)", () => {
  const bad = hr.rotationErrors(hr.parseQueue(QUEUE.replace("| yes | Pick one.", "| maybe | Pick one."))).join("\n");
  assert.match(bad, /P11: loop "maybe" should be yes or no/);
  const run = hr.rotationErrors(hr.parseQueue(QUEUE.replace("| no | The fast lift", "| yes | The fast lift")
    .replace("| no | Which fills", "| yes | Which fills"))).join("\n");
  assert.match(run, /loop "yes" on 3 reels in a row \(P11–P6\)/);
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
