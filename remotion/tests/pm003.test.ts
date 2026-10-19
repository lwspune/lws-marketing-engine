import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, STAGES, amount, valueAt, stageAt, T_ANSWER } from '../src/lib/pm003.ts';

// @pyqvault_ · Maths, visualised #3 (predict-first): ₹1 at 100% a year, added more and more often. The total climbs
// 2 → 2.25 → 2.44 → 2.61 → 2.71 → 2.718… and never passes e.
const near = (a: number, b: number, eps: number) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('(1 + 1/n)^n for each stage, re-derived', () => {
  near(amount(1), 2, 1e-12); near(amount(2), 2.25, 1e-12); near(amount(4), 2.44140625, 1e-12);
  near(amount(12), 2.613035290, 1e-8); near(amount(365), 2.714567482, 1e-8);
  near(amount(31_536_000), Math.E, 1e-7);                // every second of a year: e to 7 decimals
});

test('more often always gives more, but never more than e', () => {
  for (let i = 1; i < STAGES.length; i++) assert.ok(amount(STAGES[i].n) > amount(STAGES[i - 1].n));
  for (const s of STAGES) assert.ok(amount(s.n) < Math.E);
});

test('the staircase: starts at ₹1, steps up n times, ends at (1 + 1/n)^n, never above e', () => {
  for (const s of STAGES) {
    near(valueAt(s.n, 0), 1, 1e-12); near(valueAt(s.n, 1), amount(s.n), 1e-7);
    for (let k = 0; k <= 200; k++) assert.ok(valueAt(s.n, k / 200) <= Math.E + 1e-9);
  }
});

test('stages run in order before the answer; the answer says ₹2.72', () => {
  for (let i = 1; i < STAGES.length; i++) assert.ok(STAGES[i].t0 > STAGES[i - 1].t0);
  assert.equal(stageAt(STAGES[2].t0 + 0.1).n, STAGES[2].n);
  assert.ok(STAGES.at(-1)!.t0 < T_ANSWER && T_ANSWER < END_AT && END_AT < DURATION && DURATION <= 25);
  assert.match(OPTIONS[ANSWER], /2\.72/);
});

test('short labels; a music hit on the answer', () => {
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  assert.ok(MUSIC_HITS.includes(T_ANSWER));
});
