import test from 'node:test';
import assert from 'node:assert/strict';
import { paintProblems, contrast } from '../src/lib/paint.ts';
import { PAINT } from '../src/lib/pvCast.ts';
import {
  DURATION, HEADER, OPTIONS, ANSWER, ANSWER_AT, HOOK2, HOOK2_AT, CAPTIONS, voltsAt, ohmsAt, currentAt, heatAt, ampsAt,
  AMP_N, LOOP, pointOnLoop, extraVoltAt, extraOhmAt, METER, SOUND, COVER_T,
} from '../src/lib/pvOhm.ts';

// @pyqvault_ pilot reel with the new cast (founder approved Volt, Amp and Ohm, 2026-10-24), in Painted 2D: "Double the
// battery. What happens to the current?" A circuit loop: Volt pushes, Amp sparks race round the wire, Ohm stands in the
// way. A second battery doubles the current (I = V/R) and Ohm gets 4x hotter (P = I^2 R); then "Now double Ohm?": the
// current falls back. Predict-first (F4), moving from frame 0 (F5), short labels (F7), a second hook (F26), loops (F27).
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.trim().split(/\s+/).length;

test('short: 12–15 s, like the account’s hits (9–16 s), well inside F18’s 25 s', () => {
  assert.ok(DURATION >= 12 && DURATION <= 15);
});

test('predict-first: the question, three options and the answer, re-derived from I = V/R', () => {
  assert.equal(HEADER.length, 2);
  for (const l of HEADER) assert.ok(words(l) <= 7, l);
  assert.equal(OPTIONS.length, 3);
  const before = currentAt(ANSWER_AT - 3), after = currentAt(ANSWER_AT);
  assert.equal(voltsAt(ANSWER_AT) / voltsAt(0), 2, 'the battery doubles');
  assert.equal(after / before, 2, 'the current doubles');
  assert.match(OPTIONS[ANSWER], /doubles/);
});

test('the second hook lands with the answer’s explanation and is settled by the picture: double Ohm, the current halves', () => {
  assert.ok(words(HOOK2.text) <= 7 && HOOK2_AT > ANSWER_AT && HOOK2_AT < DURATION - 2);
  const settled = HOOK2_AT + 2.2;
  assert.equal(ohmsAt(settled), 2);
  assert.equal(currentAt(settled), currentAt(ANSWER_AT + 0.5) / 2);
});

test('the physics on screen: I = V/R at every frame, the meter shows it, Ohm’s heat goes as I²R', () => {
  for (const t of frames) {
    assert.ok(Math.abs(currentAt(t) - voltsAt(t) / ohmsAt(t)) < 1e-9, `I ≠ V/R at ${t.toFixed(2)}`);
    assert.equal(METER.text(t), `I = ${Math.round(currentAt(t))} A`);
  }
  const h0 = heatAt(0), h1 = heatAt(ANSWER_AT + 1);
  assert.ok(Math.abs(h1 / h0 - 4) < 1e-9, 'double the current, four times the heat');
});

test('the sparks race round the loop, twice as fast when the current doubles', () => {
  const step = (t: number) => {
    const a = ampsAt(t)[0], b = ampsAt(t + 0.1)[0];
    return ((b.s - a.s) % 1 + 1) % 1;
  };
  assert.ok(Math.abs(step(ANSWER_AT + 0.5) / step(1.0) - 2) < 0.05);
  for (const t of [0, 4, 9, 13]) for (const a of ampsAt(t)) {
    const p = pointOnLoop(a.s);
    assert.ok(p.x >= LOOP.x0 - 1 && p.x <= LOOP.x1 + 1 && p.y >= LOOP.y0 - 1 && p.y <= LOOP.y1 + 1, 'a spark off the wire');
  }
  assert.equal(ampsAt(0).length, AMP_N);
});

test('something moves on every frame of the first 3 s (F5)', () => {
  for (const t of frames.filter(t => t < 3)) assert.notDeepEqual(ampsAt(t)[0].s, ampsAt(t + 1 / 30)[0].s);
});

test('it loops: the last frame is the first (no extra battery, no extra Ohm, the sparks in the same places)', () => {
  assert.equal(voltsAt(DURATION), voltsAt(0));
  assert.equal(ohmsAt(DURATION), ohmsAt(0));
  assert.equal(extraVoltAt(DURATION), extraVoltAt(0));
  assert.equal(extraOhmAt(DURATION), extraOhmAt(0));
  const ring = (t: number) => ampsAt(t).map(a => ((a.s % 1) + 1) % 1).sort((x, y) => x - y);
  const a0 = ring(0), a1 = ring(DURATION);
  for (let i = 0; i < AMP_N; i++) assert.ok(Math.min(Math.abs(a0[i] - a1[i]), 1 - Math.abs(a0[i] - a1[i])) < 1e-6, 'sparks jump at the loop');
});

test('labels stay short (F7) and the cover never gives the answer away (F6)', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  assert.ok(COVER_T < ANSWER_AT - 1);
});

test('painted, not outlined (Painted 2D), and the live meter is readable', () => {
  assert.deepEqual(paintProblems(PAINT), []);
  assert.ok(contrast(METER.color, METER.bg) >= 4.5);
});

test('the sound: a thump when the second battery lands, a snap at the answer, a hum that follows the heat', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && h.t > 2 && h.t < ANSWER_AT));
  assert.ok(SOUND.hits.some(h => h.kind === 'snap' && Math.abs(h.t - ANSWER_AT) < 0.05));
  assert.ok(SOUND.beds.some(b => b.kind === 'roar'));
});
