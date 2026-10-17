"use strict";
// Sonified reels (L17): a tone's loudness follows a function of time, e.g. sin²θ while a point circles.
// Reel.toneCurve samples that function into a Web Audio gain curve: values stay in 0…1 and the curve
// starts and ends at 0 (a 0.25 s edge fade), so a tone never clicks on or off.
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

test("toneCurve samples the gain function at the given rate", () => {
  const c = loadReel().toneCurve(t => 0.5, 10, 12, 100);
  assert.equal(c.length, 201);
  assert.ok(Math.abs(c[100] - 0.5) < 1e-6, "middle sample is the function's value");
});

test("toneCurve fades in and out at the edges, so the tone never clicks", () => {
  const c = loadReel().toneCurve(() => 1, 0, 4, 100);
  assert.equal(c[0], 0);
  assert.equal(c[c.length - 1], 0);
  assert.ok(Math.abs(c[12] - 0.48) < 1e-6, "0.12 s in: 0.12 / 0.25 of the way up");
  assert.equal(c[200], 1, "full level away from the edges");
});

test("toneCurve clamps the function into 0…1", () => {
  const c = loadReel().toneCurve(t => (t < 1 ? -2 : 3), 0, 2, 50);
  for (const v of c) assert.ok(v >= 0 && v <= 1, `value ${v} out of range`);
});
