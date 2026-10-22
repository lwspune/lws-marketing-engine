import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, BATTERY, PRESSURES, pressureAt, batteryAt, batteryColour, swayAt, wakeAt, sunAt,
  smileAt, bloomAt, textAlpha, zoomAt,
} from '../src/lib/sm005.ts';

// @soundmindwithshivani reel #5, "the hammock": "You don't have to earn your rest." ME sleeps in a hammock under a low,
// red battery. Pressures (ONE MORE TASK, LAZY?, GUILT…) arrive on ropes and tug at the hammock; ME keeps resting, each
// one gives up and floats away, and the battery charges a step. Close-up. "Rest isn't a reward. It's a need." A second
// wave gives up faster. Ending: the battery is full and green, the sun comes out, ME wakes and smiles, the plant blooms.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const pillBox = (label: string, x: number, y: number): Box =>
  ({ x0: x - labelWidth(label) / 2, y0: y - LABEL_H / 2, x1: x + labelWidth(label) / 2, y1: y + LABEL_H / 2 });
const firstWave = PRESSURES.filter(p => p.t0 < ZOOM.t0), secondWave = PRESSURES.filter(p => p.t0 > ZOOM.t1);
const onScreen = (t: number) => PRESSURES.filter(p => { const s = pressureAt(p, t); return s.phase !== 'wait' && s.phase !== 'gone'; });

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /rest/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the pressures are short, in capitals, in two waves (five, then three), all gone before the close-up and the end', () => {
  for (const p of PRESSURES) { assert.ok(p.label.split(/\s+/).length <= 5, p.label); assert.equal(p.label, p.label.toUpperCase()); }
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const p of firstWave) assert.equal(pressureAt(p, ZOOM.t0 + 0.4).phase, 'gone', `${p.label} still there in the close-up`);
  for (const p of PRESSURES) assert.equal(pressureAt(p, DURATION - 3).phase, 'gone', p.label);
});

test('every pressure stays on screen, clear of the text, the battery and the other pressure up at the same time', () => {
  const battery = asBox(BATTERY);
  for (const t of frames) {
    const up = onScreen(t).map(p => ({ p, s: pressureAt(p, t) })).filter(({ s }) => s.phase === 'tug');
    for (const { p, s } of up) {
      const b = pillBox(p.label, s.x, s.y);
      assert.ok(b.x0 >= SAFE.left - 40 && b.x1 <= 1080 - 20, `${p.label} off screen at ${t.toFixed(2)} s`);
      assert.ok(!overlaps(b, battery), `${p.label} covers the battery`);
      for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${p.label} under the ${box.id} text`);
    }
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++)
      assert.ok(!overlaps(pillBox(up[i].p.label, up[i].s.x, up[i].s.y), pillBox(up[j].p.label, up[j].s.x, up[j].s.y)),
        `${up[i].p.label} and ${up[j].p.label} overlap at ${t.toFixed(2)} s`);
  }
  for (const t of frames) assert.ok(onScreen(t).length <= 2, `too many pressures at ${t.toFixed(2)} s`);
});

test('a pressure comes in, tugs, then gives up and floats away', () => {
  for (const p of PRESSURES) {
    assert.equal(pressureAt(p, p.t0 - 0.01).phase, 'wait');
    const phases = frames.filter(t => t >= p.t0).map(t => pressureAt(p, t).phase);
    const order = ['enter', 'tug', 'leave', 'gone'];
    for (let i = 1; i < phases.length; i++) assert.ok(order.indexOf(phases[i]) >= order.indexOf(phases[i - 1]), `${p.label} goes back a phase`);
    assert.ok(frames.some(t => pressureAt(p, t).pull > 0.8), `${p.label} never tugs hard`);
    const left = frames.find(t => pressureAt(p, t).phase === 'leave')!;
    assert.ok(pressureAt(p, left + 0.5).y < pressureAt(p, left).y, `${p.label} doesn't float up`);
  }
});

test('the hammock sways towards a tug, and rocks gently even when nobody pulls', () => {
  for (const p of PRESSURES) {
    const hard = frames.find(t => t > p.t0 && pressureAt(p, t).pull > 0.8)!;
    assert.ok(Math.sign(swayAt(hard)) === p.side, `${p.label} doesn't pull the hammock its way`);
  }
  for (const t of frames) assert.ok(Math.abs(swayAt(t)) <= 40, `sways too far at ${t.toFixed(2)} s`);
  assert.ok(frames.some(t => onScreen(t).length === 0 && Math.abs(swayAt(t)) > 2));
});

test('the battery starts low and red, charges a step each time a pressure gives up, never drains, and ends full and green', () => {
  assert.ok(batteryAt(0) < 0.25);
  assert.equal(batteryColour(batteryAt(0)), 'low');
  for (let i = 1; i < frames.length; i++) assert.ok(batteryAt(frames[i]) >= batteryAt(frames[i - 1]) - 1e-9, `drains at ${frames[i]}`);
  for (const p of PRESSURES) {
    const left = frames.find(t => pressureAt(p, t).phase === 'leave')!;
    assert.ok(batteryAt(left + 0.9) - batteryAt(left - 0.05) > 0.05, `${p.label} giving up doesn't charge the battery`);
  }
  assert.equal(batteryAt(DURATION), 1);
  assert.equal(batteryColour(batteryAt(DURATION)), 'full');
  assert.equal(batteryColour(0.5), 'mid');
});

test('a happy ending: ME sleeps until the battery is full, then wakes and smiles; the sun comes out; the plant blooms', () => {
  const full = frames.find(t => batteryAt(t) === 1)!;
  for (const t of frames.filter(t => t < full)) assert.equal(wakeAt(t), 0, `ME wakes early at ${t.toFixed(2)} s`);
  assert.equal(wakeAt(DURATION), 1);
  assert.ok(smileAt(DURATION) > 0.95 && smileAt(10) === 0);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.equal(bloomAt(10), 0); assert.equal(bloomAt(DURATION), 1);
  assert.ok(MUSIC.chime > full && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => Math.abs(swayAt(t + dt) - swayAt(t)) > 0.05 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 ||
    Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 || PRESSURES.some(p => { const a = pressureAt(p, t), b = pressureAt(p, t + dt); return a.x !== b.x || a.y !== b.y; });
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
