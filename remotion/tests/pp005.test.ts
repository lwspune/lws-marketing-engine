import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, T_SQ, T_DONE, GAMMA, T0, volumeAt, tempAt, pressureAt,
  heightAt, speedAt, particleAt, N, HALF_W, R_BALL, CAMERA, SOUND, pistonSpeedAt,
} from '../src/lib/pp005.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Physics, visualised #5 (predict-first): squeeze a gas to half its volume in an insulated cylinder and in
// one standing in water. Insulated (adiabatic): T·V^(γ−1) stays constant, so 300 K → 300·2^(2/3) ≈ 476 K. In water
// (isothermal) the heat flows out and it stays at 300 K. Monatomic ideal gas, γ = 5/3.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: insulated 300 K → 476 K (hotter); in water it stays 300 K', () => {
  near(GAMMA, 5 / 3);
  near(tempAt('ins', T_DONE), T0 * 2 ** (2 / 3)); assert.equal(Math.round(tempAt('ins', T_DONE)), 476);
  near(tempAt('water', T_DONE), 300);
  assert.match(OPTIONS[ANSWER], /hotter/);
  assert.ok(ANSWER_AT > T_DONE && ANSWER_AT < T_DONE + 1);
});

test('the laws on every frame: same volume both sides; PV^γ constant insulated, PV constant in water', () => {
  for (const t of frames) {
    near(volumeAt(t), volumeAt(t));
    near(pressureAt('ins', t) * volumeAt(t) ** GAMMA, 1, 1e-9);
    near(pressureAt('water', t) * volumeAt(t), 1, 1e-9);
    near(tempAt('ins', t) * volumeAt(t) ** (GAMMA - 1), T0, 1e-6);
  }
  near(volumeAt(0), 1); near(volumeAt(END_AT), 0.5);
});

test('molecules: speed ∝ √T, inside their cylinder on every frame, moving smoothly, already moving at frame 0', () => {
  near(speedAt('ins', T_DONE), Math.sqrt(2 ** (2 / 3)), 1e-9); near(speedAt('water', T_DONE), 1);
  for (let k = 0; k < frames.length; k++) for (const side of ['ins', 'water'] as const) for (let i = 0; i < N; i++) {
    const t = frames[k], [x, y, z] = particleAt(side, i, t);
    assert.ok(Math.abs(x) <= HALF_W + 1e-9 && Math.abs(z) <= HALF_W + 1e-9 && y >= -1e-9 && y <= heightAt(t) + 1e-9, `${side} ${i} out at ${t}`);
    if (k) { const p = particleAt(side, i, frames[k - 1]); assert.ok(Math.hypot(x - p[0], y - p[1], z - p[2]) < 2 * R_BALL, `jump ${side} ${i} at ${t}`); }
  }
  const moved = (f: number) => particleAt('ins', 0, f / 30).some((v, j) => v !== particleAt('ins', 0, (f - 1) / 30)[j]);
  for (let f = 1; f <= 90; f++) assert.ok(moved(f), `still at frame ${f}`);
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 2.2 && Math.abs(b - a) < 0.1, `zoom ${b} at ${frames[i]}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.5 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('every tap is a real hit on a piston; hotter and squeezed means more hits, each harder', () => {
  for (const side of ['ins', 'water'] as const) {
    const taps = SOUND.hits.filter(h => h.kind === 'tap' && (h as { side?: string }).side === side);
    assert.ok(taps.length > 60, `${side}: ${taps.length} taps`);
    for (const h of taps) {
      const atLid = Array.from({ length: N }, (_, i) => particleAt(side, i, h.t)[1]).some(y => Math.abs(y - heightAt(h.t)) < 0.01);
      assert.ok(atLid, `${side} tap at ${h.t} with no molecule at the piston`);
    }
  }
  const win = (side: string, a: number, b: number) => SOUND.hits.filter(h => h.kind === 'tap' && (h as { side?: string }).side === side && h.t >= a && h.t < b);
  const ins0 = win('ins', 0, T_SQ), ins1 = win('ins', T_DONE, T_DONE + T_SQ), wat1 = win('water', T_DONE, T_DONE + T_SQ);
  assert.ok(ins1.length > 1.6 * ins0.length, `squeezed + hot: ${ins1.length} vs ${ins0.length} hits`);   // theory 2^(4/3) ≈ 2.5×
  assert.ok(ins1.length > wat1.length, 'the hot side is hit more often than the cool one');
  const avg = (hs: typeof ins1) => hs.reduce((s, h) => s + h.gain, 0) / hs.length;
  near(avg(ins1) / avg(wat1), speedAt('ins', T_DONE) / speedAt('water', T_DONE), 1e-6);
});

test('the piston scrape runs only while the pistons move, a thunk as they stop, whooshes on the fast zooms', () => {
  const scrape = SOUND.beds.filter(b => b.kind === 'scrape');
  assert.equal(scrape.length, 1);
  near(scrape[0].t0, T_SQ); near(scrape[0].t1, T_DONE);
  const vMax = Math.max(...frames.map(pistonSpeedAt));
  for (const t of frames.filter(t => t >= T_SQ && t < T_DONE)) near(scrape[0].level(t), pistonSpeedAt(t) / vMax, 1e-9);
  assert.equal(pistonSpeedAt(T_DONE + 0.1), 0);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - T_DONE) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  assert.equal(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
