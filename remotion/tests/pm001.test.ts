import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, CIRCLE, SINE, COSV, thetaAt, pointAt, sinPen, cosPen, cosCurve, sinCurve, morphAt, slideAt,
} from '../src/lib/pm001.ts';

// @pyqvault_ · Maths, visualised #1: sine and cosine in motion, and why cos θ = sin(θ + 90°).
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('θ holds at 0, makes exactly one smooth turn, then holds at 360°; never jumps', () => {
  near(thetaAt(0), 0); near(thetaAt(4.4), 0); near(thetaAt(15), 2 * Math.PI); near(thetaAt(END_AT), 2 * Math.PI);
  for (let i = 1; i < frames.length; i++) {
    const d = thetaAt(frames[i]) - thetaAt(frames[i - 1]);
    assert.ok(d >= -1e-12 && d < 0.04, `θ step ${d} at ${frames[i]}`);
  }
});

test('the point is on the circle; its height is sin θ and its width is cos θ (screen y grows downwards)', () => {
  for (const th of [0, 0.5, 2, Math.PI, 5]) {
    const p = pointAt(th);
    near(Math.hypot(p.x - CIRCLE.cx, p.y - CIRCLE.cy), CIRCLE.r);
    near((CIRCLE.cy - p.y) / CIRCLE.r, Math.sin(th)); near((p.x - CIRCLE.cx) / CIRCLE.r, Math.cos(th));
  }
});

test('the pens: the sine pen is level with the point, the cosine pen is straight below it', () => {
  for (const th of [0.3, 1.7, 4.2]) {
    const p = pointAt(th), s = sinPen(th), c = cosPen(th);
    near(s.y, p.y); near(s.x, SINE.x0 + th * SINE.k);
    near(c.x, p.x); near(c.y, COSV.y0 + th * COSV.k);
  }
});

test('the payoff: rotated onto the sine axes and slid 90° right, the cosine curve lands exactly on the sine curve', () => {
  const landed = cosCurve(1, 1), sine = sinCurve();
  for (const q of landed) {
    const th = (q.x - SINE.x0) / SINE.k;
    if (th < 0 || th > 2 * Math.PI) continue;            // the slid curve pokes out past 360°: nothing to compare there
    near(q.y, SINE.y0 - SINE.amp * Math.sin(th), 1e-6);
  }
  assert.ok(sine.length > 50);
  // Before the morph the curve is the vertical cosine graph, unchanged.
  const flat = cosCurve(0, 0);
  for (const q of flat) near(q.x, CIRCLE.cx + CIRCLE.r * Math.cos((q.y - COSV.y0) / COSV.k));
});

test('morph and slide run once each, in order, before the end card', () => {
  near(morphAt(15.9), 0); near(morphAt(18.3), 1); near(slideAt(18.5), 0); near(slideAt(20.7), 1);
  assert.ok(END_AT < DURATION);
});

test('everything drawn stays inside the frame (40 px margin)', () => {
  for (const k of [0, 0.5, 1]) for (const s of [0, 1]) for (const q of cosCurve(k, s)) {
    assert.ok(q.x > 40 && q.x < 1040 && q.y > 40 && q.y < 1880, `off frame at k=${k}, slide=${s}: ${q.x},${q.y}`);
  }
  assert.ok(SINE.x0 + 2 * Math.PI * SINE.k < 1040);
});

test('house settings: short labels; music hits inside the reel', () => {
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  for (const h of MUSIC_HITS) assert.ok(h > 1 && h < END_AT - 1);
});
