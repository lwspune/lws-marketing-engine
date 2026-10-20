import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, MU_S, THETA_C, T_SLIP, T_STOP, tiltAt, blockAt, blockSpeedAt, forcesAt, PLANK, BLOCK,
  CAMERA, SOUND,
} from '../src/lib/pp004.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

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

// Remake (founder, 2026-10-20): the picture moves from frame 0 behind the question, the camera zooms in and out, and
// the sound comes from the experiment itself.
test('the ramp is already tilting on every frame of the first 3 s (no still opening)', () => {
  for (let f = 1; f <= 90; f++) assert.ok(tiltAt(f / 30) > tiltAt((f - 1) / 30), `still at frame ${f}`);
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in on the slip', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (const t of frames) { const [zoom] = tween(t, CAMERA.start, CAMERA.keys); assert.ok(zoom >= 0.85 && zoom <= 2.2, `zoom ${zoom} at ${t}`); }
  for (let i = 1; i < frames.length; i++)
    assert.ok(Math.abs(tween(frames[i], CAMERA.start, CAMERA.keys)[0] - tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0]) < 0.1, `zoom jumps at ${frames[i]}`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && Math.abs(k.t + k.dur - T_SLIP) < 0.3), 'no punch-in on the slip');
});

test('a ratchet click for every whole degree up to the slip, rising in pitch, then a crack on the slip itself', () => {
  const clicks = SOUND.hits.filter(h => h.kind === 'click');
  assert.equal(clicks.length, 34);
  clicks.forEach((c, i) => {
    assert.ok(Math.abs(tiltAt(c.t) * DEG - (i + 1)) < 0.01, `click ${i + 1} at ${tiltAt(c.t) * DEG}°`);
    if (i) assert.ok(c.pitch! > clicks[i - 1].pitch!);
  });
  const crack = SOUND.hits.filter(h => h.kind === 'crack');
  assert.equal(crack.length, 1); assert.ok(Math.abs(crack[0].t - T_SLIP) < 1e-9);
});

test('the friction scrape runs only while it slides and grows with its real speed; a thunk when it hits the stop', () => {
  const scrape = SOUND.beds.filter(b => b.kind === 'scrape');
  assert.equal(scrape.length, 1);
  assert.ok(Math.abs(scrape[0].t0 - T_SLIP) < 1e-9 && Math.abs(scrape[0].t1 - T_STOP) < 1e-9);
  const vMax = blockSpeedAt(T_STOP - 1e-6);
  for (let t = T_SLIP; t < T_STOP; t += 0.05) assert.ok(Math.abs(scrape[0].level(t) - blockSpeedAt(t) / vMax) < 1e-5);
  assert.equal(blockAt(T_STOP), PLANK.stop);
  assert.ok(blockAt(T_STOP - 0.02) > PLANK.stop, 'it reaches the stop at T_STOP, not before');
  const thunk = SOUND.hits.filter(h => h.kind === 'thunk');
  assert.equal(thunk.length, 1); assert.ok(Math.abs(thunk[0].t - T_STOP) < 1e-9);
});

test('the fast zooms carry their whooshes, and every sound is over before the end card fades out', () => {
  const w = whooshesFor(CAMERA.start, CAMERA.keys);
  assert.ok(w.length >= 2);
  for (const h of w) assert.ok(SOUND.hits.some(s => s.kind === h.kind && Math.abs(s.t - h.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  assert.equal(SOUND.duration, DURATION);
});
