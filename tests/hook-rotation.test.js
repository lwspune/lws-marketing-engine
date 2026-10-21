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

| Order | # | Hook | Opening | Second hook | Loop | Frame 0 (draft) |
|---|---|---|---|---|---|---|
| 1 | P11 | Pick one | Race running | Then which angle goes farthest? | yes | Pick one. Don't switch. |
| 2 | C8 | Race | Zoom (scale) | Why exactly twice as fast? | no | Which fills first? |
| 3 | P6 | You'd think | Orbit 360° | So what did the fast lift spend? | no | The fast lift does more work. Right? |
| 4 | C9 | Put in order | Colour flood | Where does pure water sit? | yes | Most acidic first? |

## Next section
`;

test("reads the queue in order, and only the table under its heading", () => {
  const q = hr.parseQueue(QUEUE);
  assert.deepEqual(q.map((r) => r.id), ["P11", "C8", "P6", "C9"]);
  assert.equal(q[2].hook, "You'd think");
  assert.equal(q[2].opening, "Orbit 360°");
  assert.equal(q[0].secondHook, "Then which angle goes farthest?");
  assert.equal(q[0].loop, "yes");
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

test("the queue matches the ideas queued in Topic scores, both ways", () => {
  const queuedRows = [{ id: "P11" }, { id: "C8" }, { id: "P6" }, { id: "C15" }];
  const errors = hr.syncErrors(hr.parseQueue(QUEUE), queuedRows).join("\n");
  assert.match(errors, /C9 is in the hook queue but not queued in Topic scores/);
  assert.match(errors, /C15 is queued in Topic scores but has no hook in the hook queue/);
});

test("the real hook queue in reels/remake-backlog.md follows the rotation and matches Topic scores", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "reels", "remake-backlog.md"), "utf8");
  const q = hr.parseQueue(md);
  assert.ok(q.length > 0, "the hook queue has rows");
  assert.deepEqual(hr.rotationErrors(q), []);
  assert.deepEqual(hr.syncErrors(q, ts.queued(ts.parse(md))), []);
});
