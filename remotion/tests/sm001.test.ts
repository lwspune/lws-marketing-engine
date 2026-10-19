import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, HOOK, LINE2, ZOOM, UMBRELLA, GROUND_Y, SAFE, TEXT_BOXES, DROPS, LABEL_H, labelWidth,
  surfaceY, dropAt, textAlpha, zoomAt, sunAt, smileAt, cloudX, MUSIC,
} from '../src/lib/sm001.ts';

// @soundmindwithshivani reel #1: "Not everything that falls on you is yours to carry." A calm ME sits under an umbrella
// while word-drops (SHOULD, GUILT, WHAT WILL PEOPLE SAY?…) fall and roll off. The structure of the 45K "protect your
// peace" reel (message at frame 0, conflict, close-up, second wave + second line, happy ending), in Sound Mind's look.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const W = 1080;

test('20–30 s long, ending after the last drop is gone', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  for (const d of DROPS) assert.equal(dropAt(d, DURATION - 0.5).phase, 'gone', `${d.label} still on screen at the end`);
});

test('the message is fully on screen at frame 0, and nothing covers the close-up', () => {
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1, 'text is off screen during the close-up');
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
  assert.match(HOOK.text, /falls on you/);
});

test('drop labels are short, in capitals, and fit the canopy', () => {
  for (const d of DROPS) {
    assert.ok(d.label.split(/\s+/).length <= 4, d.label);
    assert.equal(d.label, d.label.toUpperCase());
    assert.ok(labelWidth(d.label) < UMBRELLA.rx * 1.6, `${d.label} is wider than the umbrella can shed`);
    assert.ok(Math.abs(d.x - UMBRELLA.cx) < UMBRELLA.rx * 0.7, `${d.label} would miss the umbrella`);
  }
  assert.ok(DROPS.length >= 10);
});

test('a drop falls, lands on the canopy, rolls off its edge, and fades on the ground', () => {
  for (const d of DROPS) {
    const phases = frames.map(t => dropAt(d, t).phase).filter((p, i, a) => p !== a[i - 1]);
    assert.deepEqual(phases, ['wait', 'fall', 'slide', 'drop', 'gone'], d.label);
  }
});

test('nothing ever gets under the umbrella: ME stays dry', () => {
  const { cx, cy, rx } = UMBRELLA;
  for (const d of DROPS) for (const t of frames) {
    const p = dropAt(d, t);
    if (p.phase === 'wait' || p.phase === 'gone') continue;
    if (Math.abs(p.x - cx) <= rx) assert.ok(p.y + LABEL_H / 2 <= surfaceY(p.x) + 2, `${d.label} is through the canopy at ${t.toFixed(2)} s`);
    if (p.y > cy && p.y < GROUND_Y) assert.ok(Math.abs(p.x - cx) >= rx, `${d.label} is under the umbrella at ${t.toFixed(2)} s`);
    assert.ok(p.x - labelWidth(d.label) / 2 > -W * 0.25 && p.x + labelWidth(d.label) / 2 < W * 1.25);
  }
});

test('every label lands fully on screen, so it can be read on the grass', () => {
  for (const d of DROPS) {
    const end = frames.map(t => dropAt(d, t)).filter(p => p.phase === 'drop').at(-1)!;
    const w = labelWidth(d.label);
    assert.ok(end.x - w / 2 >= 20 && end.x + w / 2 <= W - 20, `${d.label} lands off screen at x = ${end.x}`);
  }
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const moving = (t: number) => {
    const dt = 1 / 30;
    if (Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4) return true;
    if (Math.abs(cloudX(t + dt) - cloudX(t)) > 0.05) return true;
    return DROPS.some(d => { const a = dropAt(d, t), b = dropAt(d, t + dt); return Math.hypot(a.x - b.x, a.y - b.y) > 0.5; });
  };
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) {
    assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves between ${t0} s and ${t0 + 1.5} s`);
  }
});

test('all text stays clear of Instagram\'s buttons and caption', () => {
  for (const b of TEXT_BOXES) {
    assert.ok(b.y >= SAFE.top && b.y + b.h <= SAFE.bottom, `${b.id} is outside the safe band`);
    assert.ok(b.x >= SAFE.left && b.x + b.w <= SAFE.right, `${b.id} runs under the side buttons`);
  }
});

test('a happy ending: the cloud leaves, the sun comes out and ME smiles', () => {
  assert.equal(sunAt(0), 0);
  assert.equal(sunAt(DURATION), 1);
  assert.ok(smileAt(DURATION) > 0.95 && smileAt(10) === 0);
  assert.ok(cloudX(DURATION) > W + 300, 'the cloud has drifted away');
  assert.ok(MUSIC.chime > LINE2.t0 && MUSIC.chime < DURATION && MUSIC.style === 'calm');
});
