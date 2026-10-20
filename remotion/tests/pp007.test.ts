import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, N_HOT, N_COLD, N, T_HOT0, T_COLD0, T_OPEN, T_LIFTED,
  BOX, FPS, FRAMES, positionsAt, speedSqAt, energyAt, tempOfSpeedSq, rawTemps, shownTemps, wallBottomAt, heatArrowAt,
  simulate, CAMERA, SOUND, TAPS,
} from '../src/lib/pp007.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Physics, visualised #7 (predict-first): lift the wall between a hot gas (600 K) and a cold gas (200 K) at
// the same pressure. 2,400 hard-sphere molecules, elastic collisions: the speed spreads by collisions until both sides
// read 300 K, and it never flows back. Thermodynamics (zeroth / second law).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: FRAMES }, (_, f) => f);

test('the set-up: 600 K beside 200 K at the same pressure (3× as many cold molecules), meeting at 300 K', () => {
  assert.equal(T_HOT0, 600); assert.equal(T_COLD0, 200); assert.equal(N, N_HOT + N_COLD);
  near(N_HOT * T_HOT0, N_COLD * T_COLD0);                       // p = nkT, same volume each side
  // Energy is shared per molecule, so the end temperature is the molecule-weighted average.
  near((N_HOT * T_HOT0 + N_COLD * T_COLD0) / N, 300);
  const t0 = rawTemps(0);
  near(t0.left, T_HOT0, 1e-6); near(t0.right, T_COLD0, 1e-6);
  assert.match(OPTIONS[ANSWER], /equal/);
  for (const o of OPTIONS) assert.ok(o.length <= 10, `chip too long: "${o}"`);   // PredictHeader chips are 200 px wide
});

test('energy is conserved by every collision: total kinetic energy never changes', () => {
  const e0 = energyAt(0);
  for (const f of frames) near(energyAt(f) / e0, 1, 1e-9);
  // and the stored speeds (float32, what the picture is drawn from) agree with it
  for (const f of [0, 200, FRAMES - 1]) { const s = speedSqAt(f); let k = 0; for (let i = 0; i < N; i++) k += s[i]; near(k / energyAt(f), 1, 1e-5); }
});

test('the wall holds until it lifts: no molecule changes side before T_OPEN', () => {
  for (let f = 0; f < Math.floor(T_OPEN * FPS); f++) {
    const p = positionsAt(f);
    for (let i = 0; i < N; i++) assert.ok(i < N_HOT ? p[3 * i] < 0 : p[3 * i] > 0, `molecule ${i} crossed at frame ${f}`);
  }
  near(wallBottomAt(0), 0); near(wallBottomAt(T_OPEN), 0); near(wallBottomAt(T_LIFTED), BOX.h); near(wallBottomAt(DURATION), BOX.h);
  for (let f = 1; f < FRAMES; f++) assert.ok(Math.abs(wallBottomAt(f / FPS) - wallBottomAt((f - 1) / FPS)) < 0.12, 'the wall jumps');
});

test('every molecule stays inside the box', () => {
  for (const f of [0, 60, 300, FRAMES - 1]) {
    const p = positionsAt(f);
    for (let i = 0; i < N; i++) {
      assert.ok(Math.abs(p[3 * i]) <= BOX.l + 1e-6 && p[3 * i + 1] >= -1e-6 && p[3 * i + 1] <= BOX.h + 1e-6 && Math.abs(p[3 * i + 2]) <= BOX.d + 1e-6);
    }
  }
});

test('the thermometers: hot cools, cold warms, they meet at 300 K, and the cold side never reads hotter (no flowing back)', () => {
  const shown = frames.map(f => shownTemps(f / FPS));
  const meet = shown.findIndex((s, f) => f / FPS > T_OPEN && s.left - s.right <= 10);
  assert.ok(meet > 0 && meet / FPS < 7.5, `they meet at ${meet / FPS} s`);
  for (let f = meet; f < FRAMES; f++) {
    assert.ok(shown[f].right <= shown[f].left, `cold shown hotter at ${f / FPS}`);
    assert.ok(Math.abs(shown[f].left - 300) <= 10 && Math.abs(shown[f].right - 300) <= 10, `${shown[f].left}/${shown[f].right} at ${f / FPS}`);
  }
  // before they meet: the gap only closes (never re-opens by more than one 10 K step)
  let low = Infinity;
  for (let f = 0; f < meet; f++) { const g = shown[f].left - shown[f].right; low = Math.min(low, g); assert.ok(g <= low + 10, `gap re-opens at ${f / FPS}`); }
  for (const s of shown) assert.ok(s.left % 10 === 0 && s.right % 10 === 0, 'readings in 10 K steps');
  near(ANSWER_AT, meet / FPS, 1e-9);
});

test('a molecule’s colour follows its own speed: T = 200 K × v² / v²(200 K)', () => {
  near(tempOfSpeedSq(0), 0);
  const s = speedSqAt(0); let hot = 0, cold = 0;
  for (let i = 0; i < N_HOT; i++) hot += tempOfSpeedSq(s[i]);
  for (let i = N_HOT; i < N; i++) cold += tempOfSpeedSq(s[i]);
  near(hot / N_HOT, T_HOT0, 1e-3); near(cold / N_COLD, T_COLD0, 1e-3);
});

test('the same run every time (the picture and the sound come from one simulation)', () => {
  const again = simulate();
  for (const f of [0, 100, FRAMES - 1]) {
    assert.deepEqual(again.positionsAt(f), positionsAt(f));
    assert.deepEqual(again.speedSqAt(f), speedSqAt(f));
  }
});

test('the heat arrow draws itself when the wall lifts and thins as the gap closes, gone once they meet', () => {
  assert.equal(heatArrowAt(T_OPEN - 0.1).draw, 0);
  assert.equal(heatArrowAt(T_OPEN + 2).draw, 1);
  assert.ok(heatArrowAt(2.5).width > heatArrowAt(5).width);
  assert.equal(heatArrowAt(ANSWER_AT + 1).opacity, 0);
});

test('something moves on every frame of the first 3 s', () => {
  for (let f = 1; f <= 90; f++) assert.notDeepEqual(positionsAt(f).slice(0, 30), positionsAt(f - 1).slice(0, 30), `still at ${f}`);
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let f = 1; f < FRAMES; f++) {
    const a = tween((f - 1) / FPS, CAMERA.start, CAMERA.keys), b = tween(f / FPS, CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.85 && b[0] <= 2.0 && Math.abs(b[0] - a[0]) < 0.1 && Math.abs(b[1] - a[1]) < 0.15, `camera jumps at ${f / FPS}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.4 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound from the picture: real wall hits (hot side quietens, cold side gets louder), the wall’s slide and stop', () => {
  assert.ok(TAPS.length > 50);
  for (const h of TAPS) {                                       // each tap is a molecule at an end wall
    const p = positionsAt(Math.round(h.t * FPS));
    assert.ok(BOX.l - Math.abs(p[3 * h.i]) < 0.2 &&Math.sign(p[3 * h.i]) === (h.wall === 'left' ? -1 : 1), `tap ${h.t} not at a wall`);
  }
  const mean = (w: 'left' | 'right', a: number, b: number) => {
    const g = TAPS.filter(h => h.wall === w && h.t >= a && h.t < b).map(h => h.gain);
    return g.reduce((s, v) => s + v, 0) / g.length;
  };
  assert.ok(mean('left', 0, T_OPEN) > 1.2 * mean('left', 12, END_AT), 'the hot end should tap softer once it cools');
  assert.ok(mean('right', 12, END_AT) > 1.2 * mean('right', 0, T_OPEN), 'the cold end should tap harder once it warms');
  for (let s = 0; s < Math.floor(END_AT); s++) assert.ok(TAPS.filter(h => h.t >= s && h.t < s + 1).length <= 24, `too many taps in second ${s}`);
  for (const h of TAPS) assert.ok(SOUND.hits.some(x => x.kind === 'tap' && x.t === h.t));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - T_LIFTED) < 1e-9), 'the wall stops with a thunk');
  assert.equal(SOUND.beds.length, 1); assert.equal(SOUND.beds[0].kind, 'scrape');
  near(SOUND.beds[0].t0, T_OPEN); near(SOUND.beds[0].t1, T_LIFTED);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  near(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION && ANSWER_AT < END_AT);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
