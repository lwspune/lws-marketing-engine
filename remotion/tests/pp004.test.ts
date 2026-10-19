import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, MU_S, THETA_C, T_SLIP, tiltAt, blockAt, forcesAt, PLANK, BLOCK,
} from '../src/lib/pp004.ts';

// @pyqvault_ · Physics, visualised #4 (predict-first): tilt a ramp; when does the block slide? It slips the moment the
// pull down the slope (mg sin θ) beats the most friction can give (μ mg cos θ): tan θ = μ = 0.7 → θ = 35°.
const DEG = 180 / Math.PI, frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: tan θ = μ = 0.7 → θ = 35.0°, and the right option says 35°', () => {
  assert.ok(Math.abs(Math.tan(THETA_C) - MU_S) < 1e-12);
  assert.equal(Math.round(THETA_C * DEG), 35);
  assert.match(OPTIONS[ANSWER], /35°/);
  assert.equal(OPTIONS.length, 3);
});

test('the ramp only tilts up, smoothly, from flat to just past the slip angle', () => {
  assert.equal(tiltAt(0), 0);
  for (let i = 1; i < frames.length; i++) {
    const d = tiltAt(frames[i]) - tiltAt(frames[i - 1]);
    assert.ok(d >= 0 && d < 0.6 / DEG * 1.5, `tilt step ${d * DEG}° at ${frames[i]}`);
  }
  assert.ok(tiltAt(END_AT) > THETA_C && tiltAt(END_AT) < 40 / DEG);
});

test('the block holds until the pull beats the most friction can give, then slips at once', () => {
  for (const t of frames) {
    const f = forcesAt(t);
    if (t < T_SLIP) { assert.equal(blockAt(t), PLANK.start); assert.ok(f.pull <= f.maxFriction + 1e-9, `pull beats friction early at ${t}`); }
  }
  const after = frames.filter(t => t > T_SLIP + 0.1);
  assert.ok(blockAt(after[0]) < PLANK.start, 'it moves right after the slip');
  assert.ok(Math.abs(tiltAt(T_SLIP) - THETA_C) < 1e-6, 'the slip happens at exactly 35°');
});

test('once slipping it slides down and stops at the bottom stop, never off the plank', () => {
  let prev = Infinity;
  for (const t of frames) {
    const s = blockAt(t);
    assert.ok(s <= prev + 1e-12, `slid back up at ${t}`); prev = s;
    assert.ok(s >= PLANK.stop - 1e-9 && s + BLOCK.len / 2 <= PLANK.len, `off the plank at ${t}`);
  }
  assert.equal(blockAt(END_AT), PLANK.stop);
});

test('short (≤ 25 s), question on screen from frame 0, short labels, a music hit on the slip', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  assert.ok(MUSIC_HITS.includes(T_SLIP));
});
