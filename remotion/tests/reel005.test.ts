import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GX0, GX1, GY, view, px, py, f, foldAt, curveEnd, curvePaths, humpAlpha, humpsShown, slices, slicesAlpha,
  CAPTIONS, ANSWER_AT, DURATION,
} from '../src/lib/reel005.ts';

// Reel 005 (∫₀^8π |sin x| dx = 16), same timeline as reels/nda-maths-005-area.render.html.
const PI = Math.PI;
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('view: all 8 humps at the start, zoomed on the first at 12 s, back out by 17 s', () => {
  const a = view(0), b = view(12), c = view(17.5);
  near(a.z, 0); near(a.xmax, 8 * PI); near(a.amp, 210);
  near(b.z, 1); near(b.xmax, PI); near(b.amp, 290);
  near(c.z, 0); near(c.xmax, 8 * PI);
});

test('px/py: x = 0 sits on the left axis, x = xmax on the right end, y = 0 on the baseline', () => {
  const V = view(0);
  near(px(V, 0), GX0); near(px(V, 8 * PI), GX1); near(py(V, 0), GY); near(py(V, 1), GY - 210);
});

test('f: sin x before the fold, |sin x| after it, flat dips halfway', () => {
  near(f(PI / 2, 0), 1); near(f(1.5 * PI, 0), -1);
  near(f(1.5 * PI, 1), 1); near(f(1.5 * PI, 0.5), 0);
});

test('foldAt: the dips fold up between 6.6 s and 8.6 s', () => {
  assert.equal(foldAt(6.6), 0); assert.equal(foldAt(8.6), 1);
});

test('curveEnd: draws from 1 s to 5 s, never past the visible window', () => {
  assert.equal(curveEnd(0.5, view(0.5)), 0);
  near(curveEnd(5, view(5)), 8 * PI);
  near(curveEnd(12, view(12)), PI);
});

test('curvePaths: humps and dips are separate paths so the dips can be dimmer', () => {
  const p = curvePaths(6, view(6));
  assert.match(p.above, /^M/); assert.match(p.below, /^M/);
  near(p.belowAlpha, 0.5);
  assert.equal(p.head, null, 'no leading dot once the curve is fully drawn');
  assert.ok(curvePaths(3, view(3)).head, 'the leading dot shows while drawing');
  assert.equal(curvePaths(0.5, view(0.5)).above, '');
});

test('slices: 16 midpoint slices fill the first hump exactly while zoomed', () => {
  const V = view(14), s = slices(14, V);
  assert.equal(s.length, 16);
  near(s[0].x, GX0);
  near(s.reduce((w, r) => w + r.w, 0), GX1 - GX0, 1e-6);
  // Each slice stands on the baseline and is as tall as sin(midpoint).
  for (const [i, r] of s.entries()) { near(r.y + r.h, GY, 1e-6); near(r.h, Math.sin((i + 0.5) * PI / 16) * V.amp, 1e-6); }
});

test('slices grow in one after another, then melt into the area', () => {
  assert.equal(slices(11.5, view(11.5)).length, 0);
  assert.ok(slices(11.8, view(11.8)).length < 16);
  assert.equal(slicesAlpha(11.5), 0);
  assert.equal(slicesAlpha(13), 1);
  assert.equal(slicesAlpha(14.7), 0);
});

test('humps: the first fills at the merge, then humps 2–8 fill one by one', () => {
  assert.equal(humpAlpha(14.7, 1), 1);
  assert.equal(humpAlpha(17.2, 2), 0);
  assert.equal(humpAlpha(17.5, 2), 1);
  assert.equal(humpAlpha(19.9, 8), 0);
  assert.equal(humpsShown(17.0), 1);
  assert.equal(humpsShown(25), 8);
});

test('timeline: the answer lights at 21.8 s, captions cover the reel up to the end card', () => {
  assert.equal(ANSWER_AT, 21.8);
  assert.equal(DURATION, 31.5);
  assert.equal(CAPTIONS[0].t0, 0);
  assert.equal(CAPTIONS.at(-1)!.t1, 28.5);
  for (let i = 1; i < CAPTIONS.length; i++) assert.equal(CAPTIONS[i].t0, CAPTIONS[i - 1].t1, 'no gaps');
});
