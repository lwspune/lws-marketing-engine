import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COVER_T, COLORS, SQUARE, LEFT_END, leftHalfAt, rightHalfAt,
  halfCorners, cornerAt, f, dotX, readoutAt, VERTEX, gx, gy, CAMERA, view, labelsAt, labelBox, SOUND, LABEL_SWAP,
} from '../src/lib/reel022.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 022 (predict-first): x² + 6x as tiles; split the 6x strip, wrap it round the square, and the missing
// corner is 3 × 3 = 9 (answer B), so x² + 6x = (x + 3)² − 9 ≥ −9. Caption: NDA 2026 (I) Q42, min of x² + kx + k² = 3k²/4.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Pt = [number, number];
// Separating-axis test for two convex polygons (true = they overlap with positive area).
function overlap(a: Pt[], b: Pt[]) {
  for (const poly of [a, b]) for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], nx = y2 - y1, ny = x1 - x2;
    const pa = a.map(([x, y]) => x * nx + y * ny), pb = b.map(([x, y]) => x * nx + y * ny);
    if (Math.max(...pa) <= Math.min(...pb) + 1e-6 || Math.max(...pb) <= Math.min(...pa) + 1e-6) return false;
  }
  return true;
}
const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

test('the answer, re-derived: x² + 6x + 9 = (x + 3)², the corner is 3 × 3 = 9; x² + 6x is lowest (−9) at x = −3', () => {
  for (const x of [-5, -3, 0, 1.7, 4]) { near(x * x + 6 * x + 9, (x + 3) ** 2); near(f(x), (x + 3) ** 2 - 9); }
  assert.match(OPTIONS[ANSWER], /\b9\b/);
  near(VERTEX[0], -3); near(VERTEX[1], -9); near(f(-3), -9);
  for (const x of [-3.5, -3.01, -2.99, 0]) assert.ok(f(x) > f(-3));
  // the tiles: square x² = 360 × 360 px, each half 3 × x = 120 × 360 px, the corner 120 × 120 px (1 unit = 40 px)
  near(SQUARE.w, 360); near(LEFT_END.w / 40 * (SQUARE.h / 360), 3);
});

test('NDA 2026 (I) Q42: the minimum of x² + kx + k² is 3k²/4, at x = −k/2', () => {
  for (const k of [-3, -1, 0.5, 2, 6]) {
    let best = Infinity;
    for (let x = -10; x <= 10; x += 0.0005) best = Math.min(best, x * x + k * x + k * k);
    near(best, (3 * k * k) / 4, 1e-6);
    near((-k / 2) ** 2 + k * (-k / 2) + k * k, (3 * k * k) / 4);
  }
});

test('the cover still shows "6" (not "3, 3") and no corner: it gives away neither the method nor the answer', () => {
  assert.ok(COVER_T < LABEL_SWAP.t);
  const ls = labelsAt(COVER_T).filter(l => l.alpha > 0.01).map(l => l.text);
  assert.ok(ls.includes('6') && ls.includes('6x') && !ls.includes('3') && !ls.includes('3x') && !ls.includes('9'), ls.join(' | '));
  assert.equal(cornerAt(COVER_T).fill, 0);
});

test('motion from frame 0: a tile moves on every frame of the first 3 s', () => {
  for (let k = 1; k <= 90; k++) {
    const a = (k - 1) / 30, b = k / 30, ra = rightHalfAt(a), rb = rightHalfAt(b);
    const moved = leftHalfAt(b).x !== leftHalfAt(a).x || rb.cx !== ra.cx || rb.cy !== ra.cy || rb.angle !== ra.angle;
    assert.ok(moved, `still at frame ${k}`);
  }
});

test('the wrapping half never cuts into the square or the other half, lands exactly under the square, stays in frame', () => {
  const sq = rect(SQUARE.x, SQUARE.y, SQUARE.x + SQUARE.w, SQUARE.y + SQUARE.h);
  for (const t of frames.filter(t => t <= 3.5)) {
    const h = halfCorners(rightHalfAt(t)), l = leftHalfAt(t);
    assert.ok(!overlap(h, sq), `cuts the square at ${t.toFixed(2)}`);
    assert.ok(!overlap(h, rect(l.x, l.y, l.x + l.w, l.y + l.h)), `cuts the left half at ${t.toFixed(2)}`);
    for (const p of h.map(p => view(p, t))) assert.ok(p[0] >= 0 && p[0] <= 1080 && p[1] >= 0 && p[1] <= 1030, `out of frame at ${t.toFixed(2)}`);
  }
  const end = halfCorners(rightHalfAt(3.4)).map(([x, y]) => [Math.round(x), Math.round(y)].join());
  assert.deepEqual(new Set(end), new Set([[300, 510], [660, 510], [660, 630], [300, 630]].map(p => p.join())));
  const l = leftHalfAt(1.4); assert.deepEqual([l.x, l.y, l.w, l.h], [660, 150, 120, 360]);
});

test('the live readout is y = x² + 6x at the dot, and stops at −9 on the vertex', () => {
  for (const t of frames) { const x = dotX(t); if (x !== null) assert.equal(readoutAt(t), `y = ${f(x) === 0 ? '0' : f(x).toFixed(2).replace('-', '−')}`); }
  near(dotX(12.6)!, -3, 1e-9);
  const [vx, vy] = [gx(-3), gy(-9)]; near(vx, 540); assert.ok(vy < 968, 'the vertex sits above the bottom fade');
});

test('labels: every visible label stays inside the picture and no two overlap, on every frame', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(l => labelBox(l, t));
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 20 && b.x1 <= 1060 && b.y0 >= 20 && b.y1 <= 1010, `"${ls[i].text}" out at ${t.toFixed(2)}: ${JSON.stringify(b)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
});

test('camera: two zooms in, one out, a punch-in on the corner landing on the answer, smooth', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] >= 1.15 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05));
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(Math.abs(b - a) < 0.1, `zoom jumps at ${frames[i]}`);
  }
});

test('sound: a snap at the split, a tap per half landing, a knock on the answer, ticks as the readout passes −1 … −8', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'snap' && h.t < 0.5));
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap').length >= 2);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  const ticks = SOUND.hits.filter(h => h.kind === 'click' && h.t > 10);
  assert.deepEqual(ticks.map(h => Math.round(f(dotX(h.t)!) * 1e6) / 1e6), [-1, -2, -3, -4, -5, -6, -7, -8]);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: square, strips and corner are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.square, COLORS.strip, COLORS.corner]) assert.ok(v.includes(c));
  for (const [a, b] of [[COLORS.square, COLORS.strip], [COLORS.strip, COLORS.corner], [COLORS.square, COLORS.corner]]) assert.ok(distinguishable(a, b), `${a} vs ${b}`);
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the vertex', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(12.6));
});
