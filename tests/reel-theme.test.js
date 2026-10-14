"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// engine.js is a browser script that sets window.Reel; run it in a sandbox to read its palette.
function loadReel() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "reels", "engine.js"), "utf8"), { window });
  return window.Reel;
}

// WCAG 2 relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const HEX = /^#[0-9a-f]{6}$/i;

test("white theme: a warm soft-white board that darkens slightly at the edges", () => {
  const W = loadReel().WHITE;
  assert.ok(W, "Reel.WHITE palette is exported");
  assert.match(W.board, HEX);
  assert.match(W.edge, HEX);
  assert.notEqual(W.board.toLowerCase(), "#ffffff", "soothing white, not glaring pure white");
  assert.ok(luminance(W.board) > 0.85 && luminance(W.edge) > 0.8, "both still read as white");
  assert.ok(luminance(W.edge) < luminance(W.board), "the edge is the darker end of the gradient");
});

test("white theme: text colours meet WCAG AA (4.5:1) on the whole board, centre to edge", () => {
  const W = loadReel().WHITE;
  for (const key of ["ink", "muted", "blue", "green", "amber"]) {
    assert.match(W[key], HEX, key);
    for (const bg of [W.board, W.edge]) {
      const c = contrast(W[key], bg);
      assert.ok(c >= 4.5, `${key} ${W[key]} is only ${c.toFixed(2)}:1 on ${bg}`);
    }
  }
});

test("white theme: the pen (answer accent) meets the 3:1 graphics minimum", () => {
  const W = loadReel().WHITE;
  assert.ok(contrast(W.red, W.edge) >= 3);
});

test("white theme: restrained palette, one maths colour, one area colour, one accent", () => {
  const W = loadReel().WHITE;
  const hues = new Set([W.blue, W.green, W.amber].map(c => c.toLowerCase()));
  assert.equal(hues.size, 3);
  assert.equal(W.red.toLowerCase(), W.amber.toLowerCase(), "the pen uses the single accent colour");
});
