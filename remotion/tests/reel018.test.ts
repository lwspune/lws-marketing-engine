import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, f, hAt, xAt, chordSlope, CAMERA, cam, toScreen, BAND,
  SOUND, HALVINGS, COLORS, COVER_T, DEEP, ZOOM_OUT,
} from '../src/lib/reel018.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 018 (predict-first): a chord through two points of y = x² at x = 1 slides into a tangent. Its slope
// (f(1 + h) − f(1)) / h = 2 + h settles on 2 (answer B). NDA 2021 (II) Q100 (caption): the tangent to x² = y at (1, 1)
// has slope 2, so θ = tan⁻¹ 2 ≈ 63.4°, between π/3 and π/2 (answer (d)).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: the chord slope is 2 + h, so it settles on 2 as the points meet; NDA 2021 (II) Q100 is (d)', () => {
  for (const h of [1.5, 0.7, 0.1, 0.003]) near(chordSlope(1, h), (f(1 + h) - f(1)) / h, 1e-9);
  for (const h of [1.5, 0.7, 0.1, 0.003]) near(chordSlope(1, h), 2 + h, 1e-9);
  near(chordSlope(1, 0), 2);                                       // h = 0: the tangent, slope f′(1) = 2
  assert.match(OPTIONS[ANSWER], /\b2\b/);
  const theta = Math.atan(2);                                     // Q100: tan θ = 2
  assert.ok(theta > Math.PI / 3 && theta < Math.PI / 2, 'θ = tan⁻¹ 2 lies between π/3 and π/2');
});

test('the gap h shrinks from frame 0, on every frame, and is exactly 0 from the answer on', () => {
  for (let k = 1; k < ANSWER_AT * 30; k++) assert.ok(hAt(k / 30) < hAt((k - 1) / 30), `h still at frame ${k}`);
  assert.ok(hAt(ANSWER_AT - 1 / 30) < 0.005, 'the readout already shows 2.00x just before the answer');
  for (const t of frames.filter(t => t >= ANSWER_AT)) assert.equal(hAt(t), 0);
  near(xAt(0), 1); near(xAt(ANSWER_AT), 1); near(xAt(END_AT), 2);
});

test('the cover is taken before the answer, with a slope that gives nothing away (not 1, 2 or ∞)', () => {
  assert.ok(COVER_T < ANSWER_AT);
  const m = chordSlope(1, hAt(COVER_T));
  assert.ok(m > 2.5, `cover slope ${m} is too close to 2`);
});

test('camera: two zooms in on the point, a deep zoom where the curve turns straight, a fast zoom out, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05 && k.to[1] === 1 && k.to[2] === 1), 'no punch-in on the point at the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = cam(frames[i - 1]), b = cam(frames[i]);
    assert.ok(Math.abs(Math.log2(b.z / a.z)) < 0.75, `zoom jumps at ${frames[i]}`);
  }
  // At the deepest zoom the curve and its tangent are less than 12 px apart across the whole band: it looks straight.
  const c = cam(DEEP.t + DEEP.dur), xs = 540 / (c.z * BAND.sx);
  const gap = (1 + xs - 1) ** 2 * BAND.sy * c.z;                  // x² − tangent (2x − 1) = (x − 1)²
  assert.ok(gap < 12, `curve still ${gap.toFixed(1)} px off the tangent at the band's edge`);
});

test('whenever the camera is zoomed, the point (1, 1) stays inside the picture', () => {
  for (const t of frames) {
    const c = cam(t); if (c.z < 1.3) continue;
    const [sx, sy] = toScreen(xAt(t), f(xAt(t)), c);
    assert.ok(sx > 60 && sx < 1020 && sy > 40 && sy < BAND.height - 40, `point off screen at ${t}: ${sx.toFixed(0)}, ${sy.toFixed(0)}`);
  }
});

test('sound: a tick each time the gap halves, rising in pitch; a knock as the tangent locks; whooshes on fast zooms', () => {
  const ticks = SOUND.hits.filter(h => h.kind === 'click');
  assert.equal(ticks.length, HALVINGS.length);
  ticks.forEach((h, i) => near(hAt(h.t), hAt(0) / 2 ** (i + 1), 1e-6));
  for (let i = 1; i < ticks.length; i++) assert.ok(ticks[i].pitch! > ticks[i - 1].pitch!);
  const knock = SOUND.hits.filter(h => h.kind === 'thunk');
  assert.equal(knock.length, 1); near(knock[0].t, ANSWER_AT);
  assert.ok(SOUND.hits.some(h => h.kind === 'shimmer' && Math.abs(h.t - DEEP.t) < 0.3), 'no shimmer under the deep zoom');
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: curve, chord and tangent are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.curve, COLORS.chord, COLORS.tangent]) assert.ok(v.includes(c), `${c} is not VIVID`);
  for (const [a, b] of [[COLORS.curve, COLORS.chord], [COLORS.chord, COLORS.tangent], [COLORS.curve, COLORS.tangent]]) assert.ok(distinguishable(a, b), `${a} vs ${b}`);
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the zoom out', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(ZOOM_OUT.t + ZOOM_OUT.dur));
});
