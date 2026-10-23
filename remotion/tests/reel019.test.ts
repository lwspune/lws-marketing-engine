import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, top, bottom, stripSum, stripsAt, drawAt, readoutAt,
  SWEEP, DOUBLINGS, CAMERA, SOUND, COLORS, COVER_T, PARTS,
} from '../src/lib/reel019.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 019 (predict-first): the area between y = x and y = x³ in the first quadrant is…? Strips sweep in, each
// top minus bottom, more and thinner until the total settles on 0.25 = ¼ (answer B). Then why: ½ under the line, ¼ under
// x³, ½ − ¼ = ¼. This is NDA 2022 (I) Q78 (options ⅛, ¼, ½, 1; answer ¼).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: the curves meet at 0 and 1, the line is on top between, and ∫(x − x³) = ½ − ¼ = ¼', () => {
  near(top(0), bottom(0)); near(top(1), bottom(1));
  for (let x = 0.01; x < 1; x += 0.01) assert.ok(top(x) > bottom(x), `x³ above x at ${x}`);
  const F = (x: number) => x ** 2 / 2 - x ** 4 / 4;                 // antiderivative of x − x³
  near(F(1) - F(0), 0.25);
  near(PARTS.underTop, 0.5); near(PARTS.underBottom, 0.25); near(PARTS.underTop - PARTS.underBottom, 0.25);
  assert.match(OPTIONS[ANSWER], /¼/);
});

test('the strips: midpoint sums settle on ¼ from above (10 strips 0.25125), and the readout says exactly 0.25 at the answer', () => {
  near(stripSum(10), 0.5 - (0.25 - 3 / 2400), 1e-12);              // midpoint rule on x³: error (f′(1) − f′(0)) / 24n²
  let last = Infinity;
  for (const n of [10, 20, 40, 80, 1000]) { const s = stripSum(n); assert.ok(s > 0.25 && s < last); last = s; }
  near(stripSum(4000), 0.25, 1e-7);
  assert.equal(readoutAt(ANSWER_AT), '0.25');
  for (const t of frames.filter(t => t < ANSWER_AT && stripsAt(t).shown > 0)) assert.notEqual(readoutAt(t), '0.25');
});

test('motion from frame 0: the curves draw, then the strips sweep, something new on every frame of the first 3 s', () => {
  for (let k = 1; k <= 90; k++) {
    const a = (k - 1) / 30, b = k / 30;
    assert.ok(drawAt(b) > drawAt(a) || stripsAt(b).sweep > stripsAt(a).sweep, `still at frame ${k}`);
  }
  near(drawAt(SWEEP.t), 1, 1e-6);
  assert.equal(stripsAt(SWEEP.t + SWEEP.dur).n, 10);
  assert.equal(stripsAt(ANSWER_AT - 0.05).n, 80);
  DOUBLINGS.forEach((t, i) => assert.equal(stripsAt(t + 1e-6).n, 10 * 2 ** (i + 1)));
});

test('the cover is taken before any strip shows a total, so it gives nothing away', () => {
  assert.ok(COVER_T < SWEEP.t && stripsAt(COVER_T).shown === 0);
});

test('zooms: at least two in and one out, smooth, a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 1.8 && Math.abs(b - a) < 0.1, `zoom ${b} at ${frames[i]}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.2 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound: a tap per strip of the first sweep, rising; a snap at each doubling; a knock on the answer; whooshes', () => {
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  assert.equal(taps.length, 10);
  taps.forEach((h, i) => assert.equal(stripsAt(h.t + 1e-6).shown, i + 1));
  for (let i = 1; i < taps.length; i++) assert.ok(taps[i].pitch! > taps[i - 1].pitch!);
  const snaps = SOUND.hits.filter(h => h.kind === 'snap');
  assert.deepEqual(snaps.map(h => h.t), DOUBLINGS);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: the line, the cubic and the strips are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.top, COLORS.bottom, COLORS.area]) assert.ok(v.includes(c), `${c} is not VIVID`);
  for (const [a, b] of [[COLORS.top, COLORS.bottom], [COLORS.top, COLORS.area], [COLORS.bottom, COLORS.area]]) assert.ok(distinguishable(a, b), `${a} vs ${b}`);
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
