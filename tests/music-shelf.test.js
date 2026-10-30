"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const shelf = require("../reels/tools/shelf.js");

// The music shelf (founder, 2026-10-30: "i need music which can be directly used in reel"): licensed tracks we can put in
// our own MP4 and post through GoPost to Instagram, Facebook and YouTube. Pixabay Content License: commercial use, no
// credit needed. A reel's music spec names a track ("track": "<id>") instead of a code-made style.

const SHELF = shelf.load();

test("every track on the shelf says what it is, where it came from and its licence", () => {
  assert.ok(SHELF.length >= 12, `${SHELF.length} tracks`);
  const ids = new Set();
  for (const t of SHELF) {
    assert.match(t.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(t.id), `${t.id} twice`); ids.add(t.id);
    assert.ok(t.title && t.artist && t.mood, `${t.id}: title, artist, mood`);
    assert.match(t.page, /^https:\/\/pixabay\.com\/music\/[a-z0-9-]+-\d+\/$/, `${t.id}: its Pixabay page`);
    assert.equal(t.licence, "Pixabay Content License");
    assert.ok(t.seconds > 30 && t.start >= 0 && t.start < t.seconds, `${t.id}: length and start`);
    assert.ok(Math.abs(t.gainDb) <= 15, `${t.id}: level correction`);
  }
});

test("the moods cover what our reels need, at least two tracks each", () => {
  for (const mood of ["patriotic", "epic", "motivational", "lofi", "suspense", "upbeat", "emotional"])
    assert.ok(SHELF.filter((t) => t.mood === mood).length >= 2, mood);
});

test("a cut starts at the track's start (or a chosen point) and fits inside it", () => {
  const t = { id: "x", seconds: 100, start: 1, gainDb: -2 };
  assert.deepEqual(shelf.cutPlan(t, { duration: 30 }), { from: 1, duration: 30, gainDb: -2, fadeIn: 0.05, fadeOut: 1.5 });
  assert.equal(shelf.cutPlan(t, { duration: 30, from: 40 }).from, 40);
  assert.throws(() => shelf.cutPlan(t, { duration: 30, from: 80 }), /runs past the end/);
  assert.throws(() => shelf.cutPlan(t, { duration: 0 }), /duration/);
  assert.equal(shelf.cutPlan({ ...t, start: 0 }, { duration: 30 }).fadeIn, 0, "a cut from 0 keeps the track's own attack");
});

test("a spec names a shelf track by id; an unknown id is refused with the list", () => {
  assert.equal(shelf.find(SHELF, SHELF[0].id).id, SHELF[0].id);
  assert.throws(() => shelf.find(SHELF, "nope"), /not on the shelf/);
});

test("fades are applied to the samples: silent edges where they fade, untouched in the middle", () => {
  const rate = 1000, n = 3000, pcm = new Int16Array(n * 2).fill(10000);   // 3 s of stereo at a steady level
  shelf.applyFades(pcm, rate, { fadeIn: 0.5, fadeOut: 1 });
  assert.equal(pcm[0], 0);
  assert.equal(pcm[2 * (n - 1)], 0);
  assert.equal(pcm[2 * 1500], 10000, "the middle stays as it was");
  assert.ok(pcm[2 * 250] > 4000 && pcm[2 * 250] < 6000, "half way through the fade-in, about half");
});

test("the shelf's audio files themselves stay out of git", () => {
  const ignore = fs.readFileSync(path.join(__dirname, "..", "remotion", "public", "music-shelf", ".gitignore"), "utf8");
  assert.match(ignore, /\*\.mp3/);
});
