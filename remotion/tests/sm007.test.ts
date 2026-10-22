import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, JAR, DOWN_T, jarAt, PRESSURES, pressureAt, hitAt, agitationAt, shakeAt, GLITTER,
  glitterAt, inJar, smileAt, sunAt, bloomAt, textAlpha, zoomAt,
} from '../src/lib/sm007.ts';

// @soundmindwithshivani reel #7, "the glitter jar": "Calm can't be forced. It settles." ME holds a jar of glitter water.
// Pressures (CALM DOWN!, JUST RELAX…) slam in and each one shakes the jar: the glitter whirls. Close-up on calm ME.
// "Put it down. Let it settle." ME sets the jar on the grass; a second wave arrives but can't shake it, and the glitter
// sinks. Ending: clear water, the glitter at the bottom, a flower grows, the sun comes out, ME smiles.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const pillBox = (label: string, x: number, y: number): Box =>
  ({ x0: x - labelWidth(label) / 2, y0: y - LABEL_H / 2, x1: x + labelWidth(label) / 2, y1: y + LABEL_H / 2 });
const firstWave = PRESSURES.filter(p => p.t0 < ZOOM.t0), secondWave = PRESSURES.filter(p => p.t0 > ZOOM.t1);

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /[Cc]alm/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the pressures are short, in capitals, in two waves (five, then three), gone before the close-up and the end', () => {
  for (const p of PRESSURES) { assert.ok(p.label.split(/\s+/).length <= 5, p.label); assert.equal(p.label, p.label.toUpperCase()); }
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const p of firstWave) assert.equal(pressureAt(p, ZOOM.t0).phase, 'gone', `${p.label} still there in the close-up`);
  for (const p of PRESSURES) assert.equal(pressureAt(p, DURATION - 3).phase, 'gone', p.label);
});

test('a pressure up on screen stays clear of the text, the jar and the other pressure', () => {
  for (const t of frames) {
    const up = PRESSURES.filter(p => pressureAt(p, t).phase === 'shout');
    for (const p of up) {
      const s = pressureAt(p, t), b = pillBox(p.label, s.x, s.y), j = jarAt(t);
      assert.ok(b.x0 >= SAFE.left - 40 && b.x1 <= 1060, `${p.label} off screen`);
      assert.ok(!overlaps(b, { x0: j.x - JAR.w / 2, y0: j.y - JAR.h / 2, x1: j.x + JAR.w / 2, y1: j.y + JAR.h / 2 }), `${p.label} covers the jar`);
      for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${p.label} under the ${box.id} text`);
    }
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++) {
      const a = pressureAt(up[i], t), c = pressureAt(up[j], t);
      assert.ok(!overlaps(pillBox(up[i].label, a.x, a.y), pillBox(up[j].label, c.x, c.y)), `${up[i].label} and ${up[j].label} overlap`);
    }
  }
});

test('each pressure of the first wave shakes the jar and stirs the glitter up; the second wave cannot', () => {
  for (const p of firstWave) {
    const h = hitAt(p);
    assert.ok(frames.some(t => t >= h && t < h + 0.3 && Math.abs(shakeAt(t)) > 3), `${p.label} doesn't shake the jar`);
    assert.ok(agitationAt(h + 0.3) >= agitationAt(h - 0.05), `${p.label} doesn't stir the glitter`);
  }
  assert.ok(agitationAt(hitAt(firstWave[2]) + 0.3) > agitationAt(0) + 0.3);
  for (const t of frames.filter(t => t > DOWN_T)) assert.ok(Math.abs(shakeAt(t)) < 0.5, `the jar shakes at ${t.toFixed(2)} s`);
});

test('ME puts the jar down after the close-up, smoothly, and from then on the glitter only settles', () => {
  assert.ok(DOWN_T >= ZOOM.t1);
  assert.ok(jarAt(DURATION).y > jarAt(0).y + 60, 'the jar never reaches the grass');
  for (let i = 1; i < frames.length; i++) {
    const a = jarAt(frames[i - 1]), b = jarAt(frames[i]);
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) < 30, `the jar jumps at ${frames[i].toFixed(2)} s`);
  }
  const after = frames.filter(t => t >= DOWN_T);
  for (let i = 1; i < after.length; i++) assert.ok(agitationAt(after[i]) <= agitationAt(after[i - 1]) + 1e-9, `the glitter rises at ${after[i].toFixed(2)} s`);
});

test('the glitter is swirling at frame 0, stays inside the jar, and ends settled in the bottom third', () => {
  assert.ok(agitationAt(0) > 0.2);
  assert.ok(GLITTER.length >= 30);
  for (const g of GLITTER) for (const t of frames.filter((_, i) => i % 5 === 0)) assert.ok(inJar(glitterAt(g, t)), `a speck leaves the jar at ${t.toFixed(2)} s`);
  assert.equal(agitationAt(DURATION - 3), 0);
  for (const g of GLITTER) assert.ok(glitterAt(g, DURATION).y > JAR.h / 6, 'a speck still floating at the end');
});

test('a happy ending once the glitter has settled: the sun comes out, a flower blooms, ME smiles', () => {
  const settled = frames.find(t => t > DOWN_T && agitationAt(t) === 0)!;
  assert.equal(smileAt(settled - 0.1), 0);
  assert.ok(smileAt(DURATION) > 0.95);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.equal(bloomAt(settled - 0.1), 0); assert.equal(bloomAt(DURATION), 1);
  assert.ok(MUSIC.chime > settled && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30, g = GLITTER[0];
  const moving = (t: number) => {
    const a = glitterAt(g, t), b = glitterAt(g, t + dt), j = jarAt(t), k = jarAt(t + dt);
    return Math.hypot(b.x - a.x, b.y - a.y) > 0.2 || Math.hypot(k.x - j.x, k.y - j.y) > 0.2 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 ||
      Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 || PRESSURES.some(p => { const s = pressureAt(p, t), q = pressureAt(p, t + dt); return s.x !== q.x || s.alpha !== q.alpha; });
  };
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
