import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, f, df, A, X1, AREA, secantSlope, hAt, stripsAt, riemann, zoomAt, insetDeviation, PHASES,
} from '../src/lib/pm002.ts';

// @pyqvault_ · Maths, visualised #2: calculus in one curve: zoom in (limit), slope (derivative), strips (integral).
const near = (a: number, b: number, eps: number) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test("the curve and its slope: df is f's derivative (checked numerically)", () => {
  for (const x of [0.3, 1.1, A, 2.9]) near(df(x), (f(x + 1e-6) - f(x - 1e-6)) / 2e-6, 1e-6);
  assert.ok(df(A) > 0.3, 'a clearly sloped point to zoom in on');
});

test('the exact area under the curve from 0 to 3 matches a fine numerical integral', () => {
  let s = 0; const n = 200000; for (let i = 0; i < n; i++) s += f(((i + 0.5) / n) * X1) * (X1 / n);
  near(AREA, s, 1e-6);
});

test('limit: zooming in, the curve hugs its tangent ever closer (under 2 px at ×64)', () => {
  const d1 = insetDeviation(1), d8 = insetDeviation(8), d64 = insetDeviation(64);
  assert.ok(d1 > d8 && d8 > d64, `${d1} > ${d8} > ${d64}`);
  assert.ok(d64 < 2, `×64 still ${d64.toFixed(2)} px off`);
  assert.equal(zoomAt(PHASES.limit[0]), 1); near(zoomAt(PHASES.limit[1]), 64, 1e-9);
});

test('derivative: as h shrinks, the secant slope closes in on the true slope', () => {
  const t0 = PHASES.slope[0], t1 = PHASES.slope[1];
  let prev = Infinity;
  for (let t = t0 + 0.5; t <= t1; t += 0.5) {
    const err = Math.abs(secantSlope(hAt(t)) - df(A));
    assert.ok(err <= prev + 1e-12, `error grew at ${t}`); prev = err;
  }
  assert.ok(prev < 0.005, `ends ${prev.toFixed(4)} away`);
});

test('integral: more strips, closer to the exact area (64 strips within 1%)', () => {
  const ns = [4, 8, 16, 64], errs = ns.map(n => Math.abs(riemann(n) - AREA));
  for (let i = 1; i < errs.length; i++) assert.ok(errs[i] < errs[i - 1], `${ns[i]} strips not closer`);
  assert.ok(errs.at(-1)! / AREA < 0.01);
  assert.equal(stripsAt(PHASES.area[0] + 0.1), 4); assert.equal(stripsAt(PHASES.area[1] - 0.1), 64);
});

test('the three ideas come in order, before the end card; short labels; music hits on each idea', () => {
  assert.ok(PHASES.limit[1] <= PHASES.slope[0] && PHASES.slope[1] <= PHASES.area[0] && PHASES.area[1] <= END_AT && END_AT < DURATION);
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  for (const p of [PHASES.limit, PHASES.slope, PHASES.area]) assert.ok(MUSIC_HITS.includes(p[0]));
});
