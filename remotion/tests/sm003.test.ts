import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, SHIELD, CROWS, CROW, BANNER_DY, crowAt, textAlpha, zoomAt, growthAt, bloomAt, sunAt,
  smileAt, MUSIC,
} from '../src/lib/sm003.ts';

// @soundmindwithshivani reel #3, "my own plant": "Other people's opinions are not instructions." ME waters her own plant
// while crows circle carrying remarks (WHEN IS THE WEDDING?, AT YOUR AGE?…). Ignored, each crow gives up and leaves,
// and the plant grows a little. Ending: the sky clears and the plant blooms. Same structure as reels #1 and #2.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const W = 1080;
const hookBox = TEXT_BOXES.find(b => b.id === 'hook')!;
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const crowBox = (x: number, y: number): Box => ({ x0: x - CROW.w / 2, y0: y - CROW.h / 2, x1: x + CROW.w / 2, y1: y + CROW.h / 2 });
const bannerBox = (label: string, x: number, y: number): Box =>
  ({ x0: x - labelWidth(label) / 2, y0: y + BANNER_DY - LABEL_H / 2, x1: x + labelWidth(label) / 2, y1: y + BANNER_DY + LABEL_H / 2 });

test('20–30 s long, every crow gone before the end', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  for (const c of CROWS) assert.equal(crowAt(c, DURATION - 0.5).phase, 'gone', c.label);
});

test('the message is fully on screen at frame 0, and nothing covers the close-up', () => {
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
  assert.match(HOOK.text, /opinions/);
});

test('remarks are short, in capitals, in two waves', () => {
  for (const c of CROWS) {
    assert.ok(c.label.split(/\s+/).length <= 5, c.label);
    assert.equal(c.label, c.label.toUpperCase());
  }
  assert.ok(CROWS.filter(c => c.t0 < ZOOM.t0).length >= 5 && CROWS.filter(c => c.t0 > ZOOM.t1).length >= 5);
});

test('a crow flies in, circles once, gives up and flies off', () => {
  for (const c of CROWS) {
    const phases = frames.map(t => crowAt(c, t).phase).filter((p, i, a) => p !== a[i - 1]);
    assert.deepEqual(phases, ['wait', 'enter', 'circle', 'leave', 'gone'], c.label);
  }
});

test('no crow or remark ever touches ME or the plant', () => {
  const shield: Box = { x0: SHIELD.x, y0: SHIELD.y, x1: SHIELD.x + SHIELD.w, y1: SHIELD.y + SHIELD.h };
  for (const c of CROWS) for (const t of frames) {
    const p = crowAt(c, t);
    if (p.phase === 'wait' || p.phase === 'gone') continue;
    assert.ok(!overlaps(crowBox(p.x, p.y), shield) && !overlaps(bannerBox(c.label, p.x, p.y), shield), `${c.label} touches ME at ${t.toFixed(2)} s`);
  }
});

test('a remark is fully readable on screen while its crow circles, and never covers the message', () => {
  const hook: Box = { x0: hookBox.x, y0: hookBox.y, x1: hookBox.x + hookBox.w, y1: hookBox.y + hookBox.h };
  for (const c of CROWS) for (const t of frames) {
    const p = crowAt(c, t);
    if (p.phase === 'wait' || p.phase === 'gone') continue;
    const b = bannerBox(c.label, p.x, p.y);
    if (p.phase === 'circle') assert.ok(b.x0 >= 20 && b.x1 <= W - 20, `${c.label} runs off screen at ${t.toFixed(2)} s`);
    if (textAlpha(HOOK, t) > 0) assert.ok(!overlaps(b, hook) && !overlaps(crowBox(p.x, p.y), hook), `${c.label} covers the message at ${t.toFixed(2)} s`);
  }
});

test('while a remark circles, no other crow or remark flies across it', () => {
  for (const t of frames) {
    const all = CROWS.map(c => ({ c, p: crowAt(c, t) })).filter(({ p }) => p.phase !== 'wait' && p.phase !== 'gone');
    for (const a of all.filter(({ p }) => p.phase === 'circle')) {
      const read = bannerBox(a.c.label, a.p.x, a.p.y);
      for (const b of all) {
        if (b.c === a.c) continue;
        assert.ok(!overlaps(read, crowBox(b.p.x, b.p.y)) && !overlaps(read, bannerBox(b.c.label, b.p.x, b.p.y)),
          `${b.c.label} covers ${a.c.label} at ${t.toFixed(2)} s`);
      }
    }
  }
});

test('two circling remarks never overlap each other', () => {
  for (const t of frames) {
    const up = CROWS.map(c => ({ c, p: crowAt(c, t) })).filter(({ p }) => p.phase === 'circle');
    for (let i = 0; i < up.length; i++) for (let j = i + 1; j < up.length; j++) {
      assert.ok(!overlaps(bannerBox(up[i].c.label, up[i].p.x, up[i].p.y), bannerBox(up[j].c.label, up[j].p.x, up[j].p.y)),
        `${up[i].c.label} and ${up[j].c.label} overlap at ${t.toFixed(2)} s`);
    }
  }
});

test('the plant never shrinks, grows each time a crow gives up, and blooms at the end', () => {
  for (let i = 1; i < frames.length; i++) assert.ok(growthAt(frames[i]) >= growthAt(frames[i - 1]) - 1e-12);
  for (const c of CROWS) {
    const left = frames.find(t => crowAt(c, t).phase === 'leave')!;
    assert.ok(growthAt(left + 0.8) > growthAt(left - 0.05) + 0.02, `no growth after ${c.label} left`);
  }
  assert.equal(bloomAt(10), 0);
  assert.equal(bloomAt(DURATION), 1);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) =>
    Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 || Math.abs(bloomAt(t + dt) - bloomAt(t)) > 1e-4 ||
    CROWS.some(c => { const a = crowAt(c, t), b = crowAt(c, t + dt); return Math.hypot(a.x - b.x, a.y - b.y) > 0.5; });
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});

test('all text stays clear of Instagram\'s buttons and caption', () => {
  for (const b of TEXT_BOXES) assert.ok(b.y >= SAFE.top && b.y + b.h <= SAFE.bottom && b.x >= SAFE.left && b.x + b.w <= SAFE.right, b.id);
});

test('a happy ending: the sun comes out and ME smiles', () => {
  assert.equal(sunAt(0), 0);
  assert.equal(sunAt(DURATION), 1);
  assert.ok(smileAt(DURATION) > 0.95 && smileAt(10) === 0);
  assert.ok(MUSIC.chime > LINE2.t0 && MUSIC.chime < DURATION);
});
