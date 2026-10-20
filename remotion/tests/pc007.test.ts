import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, N0, T0, T_HALF, RESUME, HEADER, OPTIONS, ANSWER, ANSWER_AT, ORDER, DECAY_H, COVER_T, C14_YEARS,
  halfLivesAt, countAt, decayTimeOf, glowAt, CAPTIONS, SHOWN, VOICE, CAMERA, SOUND, MUSIC_HITS, carbonAge,
} from '../src/lib/pc007.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';

// @pyqvault_ · Chemistry, visualised #7 (predict-first, first voiceover): 64 atoms, two half-lives: how many are left?
// 16. Class 12 Chemistry · Chemical Kinetics (first-order reactions: t½ = 0.693/k, the same however much is left).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: 64 × (½)² = 16', () => {
  assert.equal(N0, 64);
  assert.equal(N0 * 0.5 ** 2, 16);
  assert.match(OPTIONS[ANSWER], /\b16\b/);
  assert.equal(countAt(ANSWER_AT), 16);
  assert.ok(ANSWER_AT < 6, 'the answer comes within 6 s');
});

test('the count follows first-order decay exactly: N = 64 × (½)^(half-lives), one atom at a time', () => {
  for (const [h, n] of [[0, 64], [1, 32], [2, 16], [3, 8], [4, 4], [5, 2], [6, 1]]) {
    const t = h <= 2 ? T0 + h * T_HALF : RESUME + (h - 2) * T_HALF;
    assert.equal(countAt(t), n, `after ${h} half-lives`);
  }
  for (let k = 1; k < frames.length; k++) {
    const a = countAt(frames[k - 1]), b = countAt(frames[k]);
    assert.ok(b <= a && a - b <= 3, `count jumps ${a} → ${b} at ${frames[k]}`);
  }
  assert.equal(DECAY_H.length, N0 - 1, 'the last atom has no set time: it could last for ever');
  for (let k = 1; k < DECAY_H.length; k++) assert.ok(DECAY_H[k] > DECAY_H[k - 1]);
});

test('the half-life clock: runs, pauses on the answer (16 held on screen), runs again at the same rate', () => {
  near(halfLivesAt(T0), 0); near(halfLivesAt(ANSWER_AT), 2); near(halfLivesAt(RESUME), 2);
  assert.ok(RESUME - ANSWER_AT >= 1.2, 'the answer is held long enough to read');
  for (const t of frames.filter(t => t >= ANSWER_AT && t <= RESUME)) assert.equal(countAt(t), 16);
  near(halfLivesAt(RESUME + T_HALF) - halfLivesAt(RESUME), halfLivesAt(T0 + T_HALF) - halfLivesAt(T0), 1e-12);
});

test('which atom goes next is random (a seeded shuffle); the 16 survivors are scattered across the tray', () => {
  assert.deepEqual([...ORDER].sort((a, b) => a - b), Array.from({ length: N0 }, (_, i) => i));
  assert.notDeepEqual(ORDER, Array.from({ length: N0 }, (_, i) => i));
  const alive = ORDER.slice(N0 - 16), rows = new Set(alive.map(i => Math.floor(i / 8))), cols = new Set(alive.map(i => i % 8));
  assert.ok(rows.size >= 6 && cols.size >= 6, `survivors in ${rows.size} rows, ${cols.size} columns`);
});

test('something moves on every frame of the first 3 s: the atoms glow and pulse, the first decays start by 0.5 s', () => {
  for (let f = 1; f <= 90; f++) assert.ok(glowAt(0, f / 30) !== glowAt(0, (f - 1) / 30), `still at frame ${f}`);
  for (const t of frames) for (let i = 0; i < N0; i += 7) { const g = glowAt(i, t); assert.ok(g >= 0 && g <= 1); }
  assert.ok(decayTimeOf(0) < 0.5);
});

test('the cover is taken before any atom decays and before the answer (F6)', () => {
  assert.ok(COVER_T < decayTimeOf(0) && COVER_T < ANSWER_AT && countAt(COVER_T) === 64);
});

test('carbon dating: C-14 halves every 5,730 years, so 25 % left = 11,460 years', () => {
  assert.equal(C14_YEARS, 5730);
  assert.equal(carbonAge(0.25), 11460);
  assert.equal(carbonAge(0.5), 5730);
  assert.ok(CAPTIONS.some(c => c.text.includes('5,730')));
});

test('the camera: zooms in twice and out once, a punch-in landing on the answer, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 1.6 && Math.abs(b - a) < 0.1, `camera jumps at ${frames[i]}`);
  }
});

test('sound from the picture: a Geiger click on every decay and nowhere else, whooshes on the fast zooms', () => {
  const clicks = SOUND.hits.filter(h => h.kind === 'click');
  const decays = DECAY_H.map((_, k) => decayTimeOf(k)).filter(t => t < DURATION - 0.5);
  assert.equal(clicks.length, decays.length);
  for (const t of decays) assert.ok(clicks.some(c => Math.abs(c.t - t) < 1e-9), `no click at ${t}`);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  assert.equal(SOUND.hits.length, clicks.length + whooshesFor(CAMERA.start, CAMERA.keys).length);
  assert.equal(SOUND.duration, DURATION);
});

test('the voice reads only what is on screen, while it is on screen; the question from frame 0 (F4, F17)', () => {
  assert.ok(VOICE[0].t <= 0.2 && VOICE[0].text === HEADER.join(' '));
  for (const line of VOICE) assert.ok(onScreen(line, SHOWN), `"${line.text}" at ${line.t}`);
  for (let k = 1; k < VOICE.length; k++) assert.ok(VOICE[k].t >= VOICE[k - 1].until, 'lines overlap');
  assert.ok(VOICE.at(-1)!.until <= END_AT);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
