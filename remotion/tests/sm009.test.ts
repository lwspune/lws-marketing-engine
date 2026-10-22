import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, KITE, LOOSE_T, CLOUDS, cloudAt, cloudBox, kiteAt, sagAt, sunAt, smileAt, bloomAt,
  textAlpha, zoomAt,
} from '../src/lib/sm009.ts';

// @soundmindwithshivani reel #9, "the kite": "You don't have to have it all figured out." ME flies a kite. Storm clouds
// (WHAT'S YOUR PLAN?, BY 30 YOU SHOULD…) roll in and gust at it, and the kite jerks about on a tight string. Close-up.
// "Hold the string loosely. Let the wind help." ME lets the string out; the second wave barely moves the kite, which
// starts to climb. Ending: the clouds have gone, the kite soars high in the sun, ME smiles, the plant blooms.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const kiteBox = (t: number): Box => { const k = kiteAt(t); return { x0: k.x - KITE.w / 2, y0: k.y - KITE.h / 2, x1: k.x + KITE.w / 2, y1: k.y + KITE.h / 2 }; };
const firstWave = CLOUDS.filter(c => c.t0 < ZOOM.t0), secondWave = CLOUDS.filter(c => c.t0 > ZOOM.t1);
const ORDER = ['wait', 'enter', 'gust', 'leave', 'gone'];

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /figured out/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the clouds carry short questions in capitals, in two waves (five, then three), gone before the close-up and the end', () => {
  for (const c of CLOUDS) { assert.ok(c.label.split(/\s+/).length <= 5, c.label); assert.equal(c.label, c.label.toUpperCase()); }
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const c of firstWave) assert.equal(cloudAt(c, ZOOM.t0).phase, 'gone', `${c.label} still there in the close-up`);
  for (const c of CLOUDS) assert.equal(cloudAt(c, DURATION - 3).phase, 'gone', c.label);
  for (const c of CLOUDS) {
    const phases = frames.map(t => cloudAt(c, t).phase);
    for (let i = 1; i < phases.length; i++) assert.ok(ORDER.indexOf(phases[i]) >= ORDER.indexOf(phases[i - 1]), `${c.label} goes back a phase`);
  }
});

test('a gusting cloud stays on screen, clear of the text, the kite and the other cloud', () => {
  for (const t of frames) {
    const up = CLOUDS.filter(c => cloudAt(c, t).phase === 'gust');
    for (const c of up) {
      const b = cloudBox(c, cloudAt(c, t));
      assert.ok(b.x0 >= SAFE.left - 40 && b.x1 <= 1060, `${c.label} off screen`);
      assert.ok(!overlaps(b, kiteBox(t)), `${c.label} covers the kite at ${t.toFixed(2)} s`);
      for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${c.label} under the ${box.id} text`);
    }
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++)
      assert.ok(!overlaps(cloudBox(up[i], cloudAt(up[i], t)), cloudBox(up[j], cloudAt(up[j], t))), `${up[i].label} and ${up[j].label} overlap`);
  }
});

test('the first wave jerks the kite about; after ME loosens the string, the second wave barely moves it', () => {
  for (const c of firstWave) assert.ok(frames.some(t => cloudAt(c, t).phase === 'gust' && Math.abs(kiteAt(t).rot) > 12), `${c.label} doesn't jerk the kite`);
  for (const t of frames.filter(t => t > LOOSE_T + 0.5)) assert.ok(Math.abs(kiteAt(t).rot) < 8, `the kite jerks at ${t.toFixed(2)} s`);
  assert.ok(LOOSE_T >= ZOOM.t1 && LOOSE_T < secondWave[0].t0);
  assert.ok(sagAt(LOOSE_T + 1) > sagAt(LOOSE_T - 1) + 40, 'the string never loosens');
});

test('the kite climbs high by the end, and never jumps', () => {
  assert.ok(kiteAt(DURATION).y < kiteAt(0).y - 150);
  assert.ok(kiteAt(DURATION).y - KITE.h / 2 >= SAFE.top);
  for (let i = 1; i < frames.length; i++) {
    const a = kiteAt(frames[i - 1]), b = kiteAt(frames[i]);
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) < 30, `the kite jumps at ${frames[i].toFixed(2)} s`);
  }
});

test('a happy ending once the clouds have gone: the sun comes out, ME smiles, the plant blooms', () => {
  const last = Math.max(...secondWave.map(c => frames.find(t => cloudAt(c, t).phase === 'gone')!));
  assert.equal(smileAt(last), 0); assert.ok(smileAt(DURATION) > 0.95);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.equal(bloomAt(last), 0); assert.equal(bloomAt(DURATION), 1);
  assert.ok(MUSIC.chime > last && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => { const a = kiteAt(t), b = kiteAt(t + dt); return Math.abs(a.rot - b.rot) > 0.05 || Math.hypot(b.x - a.x, b.y - a.y) > 0.2 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4; };
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
