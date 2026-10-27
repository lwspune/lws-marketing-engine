"use strict";
// Music styles (founder, 2026-10-18: "better, exciting, different music for each reel"). Four energetic styles join
// the three calm ones, and a reel can mark its key moments (`music.hits`): a riser builds into an impact exactly
// there, so the music lands with the picture.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadReel() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "reels", "engine.js"), "utf8"), { window });
  return window.Reel;
}

test("the styles: the three calm ones plus five energetic ones", () => {
  assert.deepEqual([...loadReel().MUSIC_STYLES], ["lofi", "bright", "calm", "drive", "synthwave", "trap", "cinematic", "anthem"]);
});

test("anthem (2026-10-27, the defence-story reels): its drums rest inside music.calm and a snare roll leads into each hit", () => {
  const plan = loadReel().anthemPlan({ duration: 14.4, music: { style: "anthem", hits: [7.2, 9.6], calm: [[3, 6]] } });
  assert.equal(plan.bpm, 100);
  assert.ok(plan.drums.every(d => d.t < 3 || d.t >= 6), "no drum inside the calm span");
  assert.ok(plan.drums.some(d => d.t < 3) && plan.drums.some(d => d.t >= 7.2), "drums before and after it");
  const roll = JSON.parse(JSON.stringify(plan.rolls.map(r => [r.from, r.to])));
  assert.deepEqual(roll, [[6, 7.2], [8.4, 9.6]], "a roll fills the 1.2 s before each hit");
});

test("hitWindows: each riser runs up to 2 s into its impact, starting no earlier than 0.3 s", () => {
  const w = JSON.parse(JSON.stringify(loadReel().hitWindows([5, 12.5, 1.4], 30)));
  assert.deepEqual(w, [{ from: 0.3, at: 1.4 }, { from: 3, at: 5 }, { from: 10.5, at: 12.5 }]);
});

test("hitWindows: drops hits too close to the start or the end, and ones that overlap the previous hit", () => {
  const w = JSON.parse(JSON.stringify(loadReel().hitWindows([0.5, 9, 9.8, 29.5], 30)));
  assert.deepEqual(w, [{ from: 7, at: 9 }], "0.5 s is too early, 9.8 s is too close to 9 s, 29.5 s is in the fade-out");
});
