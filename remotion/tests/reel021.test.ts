import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COVER_T, COLORS, exp2, log2, fold, foldAt, xEndAt, dotAt,
  DOTS, FOLD, CROSS_AT, STRIP_FOLD, stripCorners, CAMERA, cam, toScreen, labelsAt, labelBox, SOUND,
} from '../src/lib/reel021.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 021 (predict-first): fold y = 2ˣ over y = x and you get y = log₂x (answer B). Every point (a, b) lands
// on (b, a): 2³ = 8 becomes log₂8 = 3. The strip y ≤ 0 that 2ˣ never enters folds onto x ≤ 0: no log there. Caption:
// NDA 2024 (I) Q27, log₄(x − 1) = log₂(x − 3) has one solution (x = 5; x = 2 is outside the domain).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: folding over y = x swaps (a, b) to (b, a), so 2ˣ lands exactly on log₂x', () => {
  for (const [a, b] of [[1, 2], [3, 8], [-1, 0.5], [0.3, 7]]) { const [x, y] = fold([a, b], -1); near(x, b); near(y, a); }
  for (let x = -1.5; x <= 3.1; x += 0.1) { const [u, v] = fold([x, exp2(x)], -1); near(v, log2(u), 1e-9); }
  for (const [a, b] of DOTS) { near(exp2(a), b); near(log2(b), a); }
  assert.match(OPTIONS[ANSWER], /log₂x/);
});

test('NDA 2024 (I) Q27: log₄(x − 1) = log₂(x − 3) has exactly one solution, x = 5', () => {
  const roots = [2, 5];                                            // x − 1 = (x − 3)² ⇔ x² − 7x + 10 = 0
  for (const r of roots) near(r * r - 7 * r + 10, 0);
  const valid = roots.filter(x => x - 1 > 0 && x - 3 > 0);
  assert.deepEqual(valid, [5]);
  near(Math.log(5 - 1) / Math.log(4), log2(5 - 3));
});

test('the fold: the copy moves from the curve (s = 1) to its mirror image (s = −1), crossing the line at CROSS_AT', () => {
  near(foldAt(FOLD.t), 1); near(foldAt(FOLD.t + FOLD.dur), -1); near(foldAt(CROSS_AT), 0, 1e-9);
  for (let i = 1; i < frames.length; i++) assert.ok(foldAt(frames[i]) <= foldAt(frames[i - 1]) + 1e-12);
  // the y ≤ 0 strip folds exactly onto the x ≤ 0 strip
  const c = stripCorners(-1).map(p => p.map(v => Math.round(v * 1e9) / 1e9));
  assert.deepEqual(new Set(c.map(p => p.join())), new Set([[-1.5, -1.5], [-1.5, 8.6], [0, 8.6], [0, -1.5]].map(p => p.join())));
  assert.ok(STRIP_FOLD.t > FOLD.t + FOLD.dur);
});

test('motion from frame 0: the curve draws, then the copy folds, on every frame of the first 3 s', () => {
  for (let k = 1; k <= 90; k++) {
    const a = (k - 1) / 30, b = k / 30;
    assert.ok(xEndAt(b) > xEndAt(a) || foldAt(b) < foldAt(a), `still at frame ${k}`);
  }
  near(xEndAt(FOLD.t), 3.1, 1e-9);
  assert.ok(xEndAt(0) > -1.5 && xEndAt(0) < 1, 'frame 0 already shows part of the curve');
});

test('the cover: the blue curve and its three labelled dots are all there, nothing has started folding', () => {
  assert.ok(COVER_T < FOLD.t && xEndAt(COVER_T) >= 3);
  for (const d of DOTS) assert.ok(dotAt(d, COVER_T) >= 0.999, `dot ${d} not fully in at the cover`);
  assert.ok(labelsAt(COVER_T).filter(l => l.alpha > 0.01).every(l => l.color !== COLORS.log), 'something orange on the cover');
});

test('labels: every visible label stays inside the picture and no two overlap, on every frame', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(labelBox);
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 30 && b.x1 <= 1050 && b.y0 >= 30 && b.y1 <= 1000, `"${ls[i].text}" out at ${t.toFixed(2)}: ${JSON.stringify(b)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j], hit = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
      assert.ok(!hit, `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
});

test('camera: two zooms in, one out, a punch-in on the (3, 8)–(8, 3) pair landing on the answer, smooth', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] >= 1.25 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05 && k.to[1] === 5.5 && k.to[2] === 5.5));
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(cam(frames[i]).z - cam(frames[i - 1]).z) < 0.1, `zoom jumps at ${frames[i]}`);
  const [px, py] = toScreen(3, 8, cam(ANSWER_AT + 0.5)), [qx, qy] = toScreen(8, 3, cam(ANSWER_AT + 0.5));
  for (const v of [px, qx]) assert.ok(v > 60 && v < 1020);
  for (const v of [py, qy]) assert.ok(v > 60 && v < 970);
});

test('sound: a tap per dot as it pops in, a snap as the copy crosses the line, a knock on the answer, whooshes', () => {
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  for (const d of DOTS) assert.ok(taps.some(h => Math.abs(xEndAt(h.t) - d[0]) < 1e-6), `no tap for ${d}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'snap' && Math.abs(h.t - CROSS_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: 2ˣ and log₂x are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  assert.ok(v.includes(COLORS.exp) && v.includes(COLORS.log));
  assert.ok(distinguishable(COLORS.exp, COLORS.log));
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the strip landing', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(STRIP_FOLD.t + STRIP_FOLD.dur));
});
