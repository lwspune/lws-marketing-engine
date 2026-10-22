import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, CLOUD, LET_T, RAIN_END, SIGNS, signAt, cloudAt, rainAt, SPROUTS, sproutAt, rainbowAt,
  sunAt, smileAt, bloomAt, textAlpha, zoomAt,
} from '../src/lib/sm010.ts';

// @soundmindwithshivani reel #10, "the rain cloud": "It's okay to not be okay." A small rain cloud hangs over ME. Signs pop
// up from the grass (STOP CRYING, BE STRONG, SMILE!…); with each one ME holds it in: the rain stops, the cloud squeezes
// smaller and darker. Close-up. "Let it rain. Things grow after." ME lets it rain; the second wave's signs are washed over,
// and a flower sprouts for each. Ending: the rain stops, the cloud turns white and floats off, a rainbow, the sun, ME smiles.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const pillBox = (label: string, x: number, y: number): Box =>
  ({ x0: x - labelWidth(label) / 2, y0: y - LABEL_H / 2, x1: x + labelWidth(label) / 2, y1: y + LABEL_H / 2 });
const cloudBox = (t: number): Box => {
  const c = cloudAt(t), hw = (CLOUD.w / 2) * c.scale, hh = (CLOUD.h / 2) * c.scale;
  return { x0: CLOUD.x - hw, y0: c.y - hh, x1: CLOUD.x + hw, y1: c.y + hh };
};
const firstWave = SIGNS.filter(s => s.t0 < ZOOM.t0), secondWave = SIGNS.filter(s => s.t0 > ZOOM.t1);
const ORDER = ['wait', 'rise', 'up', 'sink', 'topple', 'gone'];

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /okay/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the signs are short, in capitals, in two waves (five, then three), gone before the close-up and the end', () => {
  for (const s of SIGNS) { assert.ok(s.label.split(/\s+/).length <= 5, s.label); assert.equal(s.label, s.label.toUpperCase()); }
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const s of firstWave) assert.equal(signAt(s, ZOOM.t0).phase, 'gone', `${s.label} still there in the close-up`);
  for (const s of SIGNS) assert.equal(signAt(s, DURATION - 3).phase, 'gone', s.label);
  for (const s of SIGNS) {
    const phases = frames.map(t => signAt(s, t).phase);
    for (let i = 1; i < phases.length; i++) assert.ok(ORDER.indexOf(phases[i]) >= ORDER.indexOf(phases[i - 1]), `${s.label} goes back a phase`);
  }
});

test('a sign that is up stays on screen, clear of the text, the cloud and the other sign', () => {
  for (const t of frames) {
    const up = SIGNS.filter(s => signAt(s, t).phase === 'up');
    for (const s of up) {
      const st = signAt(s, t), b = pillBox(s.label, st.x, st.y);
      assert.ok(b.x0 >= SAFE.left - 40 && b.x1 <= 1060, `${s.label} off screen`);
      assert.ok(!overlaps(b, cloudBox(t)), `${s.label} covers the cloud`);
      for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${s.label} under the ${box.id} text`);
    }
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++) {
      const a = signAt(up[i], t), c = signAt(up[j], t);
      assert.ok(!overlaps(pillBox(up[i].label, a.x, a.y), pillBox(up[j].label, c.x, c.y)), `${up[i].label} and ${up[j].label} overlap`);
    }
  }
});

test('with each sign of the first wave ME holds it in: the rain stops and the cloud squeezes smaller and darker', () => {
  assert.ok(rainAt(0) > 0.3, 'it is raining a little at frame 0');
  for (const s of firstWave) {
    const up = frames.find(t => signAt(s, t).phase === 'up')!;
    assert.ok(cloudAt(up + 0.6).scale < cloudAt(s.t0 - 0.05).scale, `${s.label} doesn't squeeze the cloud`);
    assert.ok(rainAt(up + 0.6) <= rainAt(s.t0 - 0.05), `${s.label} doesn't hold the rain in`);
  }
  assert.equal(rainAt((ZOOM.t0 + ZOOM.t1) / 2), 0, 'it still rains in the close-up');
  assert.ok(cloudAt(ZOOM.t0).dark > cloudAt(0).dark + 0.4);
});

test('after ME lets it rain, the second wave is washed over and a flower sprouts for each sign', () => {
  assert.ok(LET_T >= ZOOM.t1 && LET_T < secondWave[0].t0);
  for (const s of secondWave) {
    assert.ok(frames.some(t => signAt(s, t).phase === 'topple'), `${s.label} isn't washed over`);
    assert.ok(frames.every(t => signAt(s, t).phase !== 'sink'));
    const up = frames.find(t => signAt(s, t).phase === 'up')!;
    assert.ok(rainAt(up) > 0.9, `it isn't raining hard while ${s.label} is up`);
    const toppled = frames.find(t => signAt(s, t).phase === 'topple')!;
    assert.ok(SPROUTS.some(f => f.t0 >= toppled - 0.05 && f.t0 <= toppled + 0.8), `no flower for ${s.label}`);
  }
  for (const s of firstWave) assert.ok(frames.every(t => signAt(s, t).phase !== 'topple'), `${s.label} topples in the first wave`);
  for (const f of SPROUTS) { assert.equal(sproutAt(f, LET_T), 0); assert.equal(sproutAt(f, DURATION), 1); }
});

test('a happy ending: the rain stops, the cloud floats off white, a rainbow, the sun, ME smiles, the flowers bloom', () => {
  assert.ok(RAIN_END > Math.max(...secondWave.map(s => frames.find(t => signAt(s, t).phase === 'gone')!)));
  assert.equal(rainAt(RAIN_END + 1), 0);
  assert.ok(cloudAt(DURATION).dark < 0.05 && cloudAt(DURATION).alpha < 0.05);
  assert.equal(rainbowAt(RAIN_END - 0.1), 0); assert.equal(rainbowAt(DURATION), 1);
  assert.equal(smileAt(RAIN_END), 0); assert.ok(smileAt(DURATION) > 0.95);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.equal(bloomAt(RAIN_END), 0); assert.equal(bloomAt(DURATION), 1);
  assert.ok(MUSIC.chime > RAIN_END && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => rainAt(t) > 0 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 ||
    Math.abs(cloudAt(t + dt).scale - cloudAt(t).scale) > 1e-4 || Math.abs(cloudAt(t + dt).y - cloudAt(t).y) > 0.05 ||
    SIGNS.some(s => { const a = signAt(s, t), b = signAt(s, t + dt); return a.y !== b.y || a.rot !== b.rot; });
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
