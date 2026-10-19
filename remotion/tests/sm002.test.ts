import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES, LABEL_H, labelWidth } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, GLASS, ME, THOUGHTS, thoughtAt, textAlpha, zoomAt, nightAt, sleepAt, smileAt, sipAt, MUSIC,
} from '../src/lib/sm002.ts';

// @soundmindwithshivani reel #2, "the window": "Not every thought deserves an answer tonight." ME sits with tea inside a
// closed window; thoughts (WHAT IF?, DID I SAY IT WRONG?, 3 AM WORRIES…) fly at the glass, thump, slide down and fade.
// Same structure as reel #1 (soundmind/brand.md → Reels); the ending is night falling and ME asleep, smiling.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('20–30 s long, every thought gone before the end', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  for (const th of THOUGHTS) assert.equal(thoughtAt(th, DURATION - 0.5).phase, 'gone', th.label);
});

test('the message is fully on screen at frame 0, and nothing covers the close-up', () => {
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
  assert.match(HOOK.text, /thought/);
});

test('thoughts are short, in capitals, and there are two waves of them', () => {
  for (const th of THOUGHTS) {
    assert.ok(th.label.split(/\s+/).length <= 5, th.label);
    assert.equal(th.label, th.label.toUpperCase());
  }
  assert.ok(THOUGHTS.filter(th => th.t0 < ZOOM.t0).length >= 6 && THOUGHTS.filter(th => th.t0 > ZOOM.t1).length >= 6);
});

test('a thought flies up to the glass, thumps against it, slides down and fades', () => {
  for (const th of THOUGHTS) {
    const phases = frames.map(t => thoughtAt(th, t).phase).filter((p, i, a) => p !== a[i - 1]);
    assert.deepEqual(phases, ['wait', 'approach', 'hit', 'slide', 'gone'], th.label);
  }
});

test('nothing gets through the glass: every thought stays inside the window pane', () => {
  for (const th of THOUGHTS) for (const t of frames) {
    const p = thoughtAt(th, t);
    if (p.phase === 'wait' || p.phase === 'gone') continue;
    const halfW = (labelWidth(th.label) * p.scale * p.sx) / 2, halfH = (LABEL_H * p.scale * p.sy) / 2;
    assert.ok(p.x - halfW >= GLASS.x && p.x + halfW <= GLASS.x + GLASS.w, `${th.label} pokes out sideways at ${t.toFixed(2)} s`);
    assert.ok(p.y - halfH >= GLASS.y && p.y + halfH <= GLASS.y + GLASS.h, `${th.label} pokes out of the pane at ${t.toFixed(2)} s`);
  }
});

test('two thoughts on the glass never overlap, so each one can be read', () => {
  const box = (label: string, p: ReturnType<typeof thoughtAt>) => {
    const hw = (labelWidth(label) * p.sx) / 2, hh = (LABEL_H * p.sy) / 2;
    return { x0: p.x - hw, x1: p.x + hw, y0: p.y - hh, y1: p.y + hh };
  };
  for (const t of frames) {
    const on = THOUGHTS.map(th => ({ th, p: thoughtAt(th, t) })).filter(({ p }) => p.phase === 'hit' || p.phase === 'slide');
    for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
      const a = box(on[i].th.label, on[i].p), b = box(on[j].th.label, on[j].p);
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `${on[i].th.label} and ${on[j].th.label} overlap at ${t.toFixed(2)} s`);
    }
  }
});

test('ME sits in the room, clear of the window', () => {
  assert.ok(ME.x + 130 < GLASS.x, 'ME overlaps the window');
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) =>
    Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(nightAt(t + dt) - nightAt(t)) > 1e-4 ||
    THOUGHTS.some(th => { const a = thoughtAt(th, t), b = thoughtAt(th, t + dt); return Math.hypot(a.x - b.x, a.y - b.y) > 0.5 || Math.abs(a.scale - b.scale) > 1e-3; });
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});

test('all text stays clear of Instagram\'s buttons and caption', () => {
  for (const b of TEXT_BOXES) assert.ok(b.y >= SAFE.top && b.y + b.h <= SAFE.bottom && b.x >= SAFE.left && b.x + b.w <= SAFE.right, b.id);
});

test('ME sips tea in the close-up and falls asleep smiling as night comes', () => {
  const peak = Math.max(...frames.filter(t => t > ZOOM.t0 && t < ZOOM.t1).map(sipAt));
  assert.ok(peak > 0.95, 'the cup reaches her lips during the close-up');
  assert.equal(sipAt(0), 0);
  assert.equal(nightAt(0), 0);
  assert.equal(nightAt(DURATION), 1);
  assert.ok(sleepAt(DURATION) > 0.95 && sleepAt(10) === 0);
  assert.ok(smileAt(DURATION) > 0.6);
  assert.ok(MUSIC.chime > LINE2.t0 && MUSIC.chime < DURATION && MUSIC.style === 'calm');
});
