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

test("the styles: the three calm ones plus four energetic ones", () => {
  assert.deepEqual([...loadReel().MUSIC_STYLES], ["lofi", "bright", "calm", "drive", "synthwave", "trap", "cinematic"]);
});

test("hitWindows: each riser runs up to 2 s into its impact, starting no earlier than 0.3 s", () => {
  const w = JSON.parse(JSON.stringify(loadReel().hitWindows([5, 12.5, 1.4], 30)));
  assert.deepEqual(w, [{ from: 0.3, at: 1.4 }, { from: 3, at: 5 }, { from: 10.5, at: 12.5 }]);
});

test("hitWindows: drops hits too close to the start or the end, and ones that overlap the previous hit", () => {
  const w = JSON.parse(JSON.stringify(loadReel().hitWindows([0.5, 9, 9.8, 29.5], 30)));
  assert.deepEqual(w, [{ from: 7, at: 9 }], "0.5 s is too early, 9.8 s is too close to 9 s, 29.5 s is in the fade-out");
});
