import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, CUP, LID_T, KETTLES, kettleAt, levelAt, spillAt, lidAt, splashAt, steamAt, sunAt,
  smileAt, bloomAt, textAlpha, zoomAt,
} from '../src/lib/sm008.ts';

// @soundmindwithshivani reel #8, "the teacup": "It's okay to say no." ME holds her teacup. Kettles carrying requests
// (JUST THIS ONCE, YOU'RE FREE, NA?…) fly in and pour into it until it overflows. Close-up. "Put a lid on it. Your cup is
// yours." ME puts a lid on; the second wave's tea splashes off it. Ending: the lid lifts, steam curls into a heart over her
// own tea, the sun comes out, ME smiles, the plant blooms.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const pillBox = (label: string, x: number, y: number): Box =>
  ({ x0: x - labelWidth(label) / 2, y0: y - LABEL_H / 2, x1: x + labelWidth(label) / 2, y1: y + LABEL_H / 2 });
const firstWave = KETTLES.filter(k => k.t0 < ZOOM.t0), secondWave = KETTLES.filter(k => k.t0 > ZOOM.t1);
const ORDER = ['wait', 'enter', 'pour', 'leave', 'gone'];

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /no/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the requests are short, in capitals, in two waves (five, then three), gone before the close-up and the end', () => {
  for (const k of KETTLES) { assert.ok(k.label.split(/\s+/).length <= 5, k.label); assert.equal(k.label, k.label.toUpperCase()); }
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const k of firstWave) assert.equal(kettleAt(k, ZOOM.t0).phase, 'gone', `${k.label} still there in the close-up`);
  for (const k of KETTLES) assert.equal(kettleAt(k, DURATION - 3).phase, 'gone', k.label);
});

test('each kettle comes in, pours, and leaves, in that order', () => {
  for (const k of KETTLES) {
    const phases = frames.map(t => kettleAt(k, t).phase);
    for (let i = 1; i < phases.length; i++) assert.ok(ORDER.indexOf(phases[i]) >= ORDER.indexOf(phases[i - 1]), `${k.label} goes back a phase`);
    assert.ok(frames.some(t => kettleAt(k, t).tilt > 30), `${k.label} never tips to pour`);
    for (const t of frames.filter(t => kettleAt(k, t).phase !== 'pour')) assert.ok(kettleAt(k, t).tilt < 1e-9 || kettleAt(k, t).phase === 'leave');
  }
});

test('a request on screen stays clear of the text, the cup and the other request', () => {
  const cup: Box = { x0: CUP.x - CUP.w / 2 - 40, y0: CUP.y - CUP.h, x1: CUP.x + CUP.w / 2 + 40, y1: CUP.y + 20 };
  for (const t of frames) {
    const up = KETTLES.filter(k => kettleAt(k, t).phase === 'pour');
    for (const k of up) {
      const s = kettleAt(k, t), b = pillBox(k.label, s.x, s.labelY);
      assert.ok(b.x0 >= SAFE.left - 40 && b.x1 <= 1060, `${k.label} off screen`);
      assert.ok(!overlaps(b, cup), `${k.label} covers the cup`);
      for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${k.label} under the ${box.id} text`);
    }
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++) {
      const a = kettleAt(up[i], t), c = kettleAt(up[j], t);
      assert.ok(!overlaps(pillBox(up[i].label, a.x, a.labelY), pillBox(up[j].label, c.x, c.labelY)), `${up[i].label} and ${up[j].label} overlap`);
    }
  }
});

test('the first wave fills the cup until it overflows; once the lid is on, nothing more goes in and the spill dries', () => {
  assert.ok(levelAt(0) > 0.1 && levelAt(0) < 0.5, 'the cup starts with a little of her own tea');
  for (let i = 1; i < frames.length; i++) assert.ok(levelAt(frames[i]) >= levelAt(frames[i - 1]) - 1e-9 || frames[i] > LID_T, `the cup empties at ${frames[i]}`);
  assert.equal(spillAt(firstWave[1].t0), 0, 'it overflows too early');
  assert.ok(spillAt(ZOOM.t0) > 0.3, 'it never overflows');
  assert.ok(LID_T >= ZOOM.t1 && LID_T < secondWave[0].t0);
  const atLid = levelAt(LID_T);
  for (const t of frames.filter(t => t > LID_T)) assert.ok(levelAt(t) <= atLid + 1e-9, `tea goes in through the lid at ${t.toFixed(2)} s`);
  assert.equal(spillAt(secondWave[0].t0), 0, 'the spill is still there in the second wave');
  assert.equal(lidAt(LID_T - 0.1), 0); assert.equal(lidAt(secondWave[0].t0), 1);
});

test('the second wave splashes off the lid; the first wave does not splash', () => {
  for (const k of secondWave) assert.ok(frames.some(t => kettleAt(k, t).phase === 'pour' && splashAt(t) > 0.5), `${k.label} doesn't splash`);
  for (const t of frames.filter(t => t < LID_T)) assert.equal(splashAt(t), 0);
});

test('a happy ending: the lid lifts, steam curls into a heart, the sun comes out, ME smiles, the plant blooms', () => {
  const last = Math.max(...secondWave.map(k => frames.find(t => kettleAt(k, t).phase === 'gone')!));
  assert.ok(lidAt(DURATION) < 0.05, 'the lid is still on at the end');
  assert.equal(steamAt(last - 0.1), 0); assert.ok(steamAt(DURATION) > 0.95);
  assert.equal(smileAt(last), 0); assert.ok(smileAt(DURATION) > 0.95);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.equal(bloomAt(last), 0); assert.equal(bloomAt(DURATION), 1);
  assert.ok(MUSIC.chime > last && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 ||
    Math.abs(levelAt(t + dt) - levelAt(t)) > 1e-5 || Math.abs(lidAt(t + dt) - lidAt(t)) > 1e-4 || Math.abs(steamAt(t + dt) - steamAt(t)) > 1e-4 ||
    KETTLES.some(k => { const a = kettleAt(k, t), b = kettleAt(k, t + dt); return a.x !== b.x || a.tilt !== b.tilt; });
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
