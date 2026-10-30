import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, SOURCE, SCENES, sceneAlphas, pushAt, creditAt, embersAt, streaksAt, CREDIT } from '../src/lib/poem001.ts';

// @lws.pune · the poem reel (founder, 2026-10-28: "use this as background music and voice as it is. Images could be
// different defence themes of struggles of soldiers"). A copy of @filmy.sketches' reel (study/reels/Dd9KpTsOQH6.mp4): four
// red-and-black scenes, each pushing in slowly, cross-fading where theirs do, then the poet's name. Their audio is added in
// the Instagram app ("Use audio"), never put in our file; our photos are licensed (Wikimedia Commons, GODL-India / public
// domain), graded red.

const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);

test('the length of their audio, so "Use audio" fits it end to end', () => {
  assert.ok(Math.abs(DURATION - SOURCE.audio) < 0.05);
});

test('four scenes, cutting where theirs cut (within 0.3 s), each a licensed photo', () => {
  assert.equal(SCENES.length, 4);
  SOURCE.cuts.forEach((c, i) => assert.ok(Math.abs(SCENES[i + 1].t0 + SCENES[i + 1].fade / 2 - c) <= 0.3, `cut ${i + 1}: ${SCENES[i + 1].t0} vs ${c}`));
  for (const s of SCENES) assert.match(s.licence, /^(Public domain|GODL-India)$/);
});

test('the picture is never empty or doubled: the scenes\' alphas add up to 1 on every frame', () => {
  for (const t of frames) {
    const a = sceneAlphas(t), sum = a.reduce((x, y) => x + y, 0);
    assert.ok(Math.abs(sum - 1) < 1e-6, `at ${t.toFixed(2)}: ${a.map(v => v.toFixed(2))}`);
  }
  assert.equal(sceneAlphas(0)[0], 1);
  assert.equal(sceneAlphas(DURATION)[3], 1);
});

test('every scene keeps moving: a slow push-in on every frame, never a still', () => {
  for (const [i, s] of SCENES.entries()) {
    const a = pushAt(i, s.t0), b = pushAt(i, s.t0 + 1);
    assert.ok(b.scale > a.scale, `scene ${i + 1} pushes in`);
    assert.ok(pushAt(i, s.t1).scale <= 1.16, 'gentle, as theirs');
  }
});

test('the poet\'s name from 41.7 s, as theirs; embers all reel, tracers in the last scene only', () => {
  assert.ok(Math.abs(CREDIT.t0 - SOURCE.credit) <= 0.2);
  assert.equal(creditAt(CREDIT.t0 - 0.1), 0);
  assert.ok(creditAt(CREDIT.t0 + 0.6) > 0.95 && creditAt(DURATION) > 0.95);
  for (const t of [1, 15, 30, 45]) assert.ok(embersAt(t).length >= 25, `embers at ${t}`);
  assert.equal(streaksAt(SCENES[3].t0 - 0.5).length, 0);
  assert.ok(streaksAt(35).length >= 8);
  for (const t of frames) for (const e of embersAt(t)) assert.ok(e.x >= -50 && e.x <= 1130 && e.y >= -50 && e.y <= 1970);
});
