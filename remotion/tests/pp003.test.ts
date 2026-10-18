import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, END_AT, RELEASE, DRAG_ON, E0, CAPTIONS, MUSIC_HITS, stateAt, energyAt, THETA0 } from '../src/lib/pp003.ts';

// @pyqvault_ · Physics, visualised #3: a pendulum trades height for speed and back; the total stays put. Then air
// resistance turns a little of it into heat each swing, which is why a real pendulum stops.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('held still at 50° until it is let go', () => {
  for (const t of [0, 2, RELEASE - 0.01]) { const s = stateAt(t); assert.equal(s.theta, THETA0); assert.equal(s.omega, 0); }
  assert.ok(Math.abs(THETA0 - (50 * Math.PI) / 180) < 1e-12);
});

test('E0 = mgL(1 − cos 50°) for 1 kg on a 1.2 m string (≈ 4.20 J)', () => {
  assert.ok(Math.abs(E0 - 1 * 9.8 * 1.2 * (1 - Math.cos(THETA0))) < 1e-9);
  assert.ok(Math.abs(E0 - 4.20) < 0.01);
});

test('without air: height and speed trade places, the total stays the same (within 0.2%)', () => {
  for (const t of frames.filter(t => t >= RELEASE && t < DRAG_ON)) {
    const e = energyAt(t);
    assert.ok(Math.abs(e.pe + e.ke - E0) / E0 < 0.002, `total ${(e.pe + e.ke).toFixed(4)} J at ${t.toFixed(2)} s`);
    assert.ok(Math.abs(e.heat) < 0.01 * E0);
  }
  // It really swings: all height at the ends, nearly all speed at the bottom.
  const es = frames.filter(t => t >= RELEASE && t < DRAG_ON).map(energyAt);
  assert.ok(Math.max(...es.map(e => e.ke)) > 0.99 * E0 && Math.max(...es.map(e => e.pe)) > 0.99 * E0);
});

test('with air: the total only falls, the lost part is the heat, and the swing ends well below half', () => {
  let prev = Infinity;
  for (const t of frames.filter(t => t >= DRAG_ON && t <= END_AT)) {
    const e = energyAt(t), total = e.pe + e.ke;
    assert.ok(total <= prev + 1e-6, `total rose at ${t.toFixed(2)} s`); prev = total;
    assert.ok(Math.abs(total + e.heat - E0) < 1e-6, 'height + speed + heat = what it started with');
  }
  assert.ok(prev < 0.5 * E0, `ends at ${(prev / E0 * 100).toFixed(0)}% of E0`);
});

test('the swing is smooth: under 0.12 rad of turn per frame', () => {
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(stateAt(frames[i]).theta - stateAt(frames[i - 1]).theta) < 0.12);
});

test('house settings: short labels; music hits on the release and when the air comes in', () => {
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  assert.ok(MUSIC_HITS.includes(RELEASE) && MUSIC_HITS.includes(DRAG_ON));
  for (const h of MUSIC_HITS) assert.ok(h > 1 && h < END_AT - 1);
  assert.ok(END_AT < DURATION);
});
