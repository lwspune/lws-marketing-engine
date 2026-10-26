import test from 'node:test';
import assert from 'node:assert/strict';
import { FULL, SAFE, textBox, inSafeArea, overlaps, widthShare, heightShare, frameProblems } from '../src/lib/layout.ts';

// Full-frame reels (framework F35, founder 2026-10-26): the picture fills the frame and text floats beside what it names.
// These checks keep every text box clear of Instagram's own overlays and of each other on every frame.

test('the full frame is the whole 1080 × 1920 page; the safe area leaves Instagram its caption band and button strip', () => {
  assert.deepEqual(FULL, { top: 0, width: 1080, height: 1920 });
  assert.equal(SAFE.bottom, 1600);                 // the bottom ~320 px: username + caption (lwspune-insta.md)
  assert.equal(SAFE.right, 960);                   // the right ~120 px below mid-screen: like, comment, share
  assert.equal(SAFE.rightFrom, 960);
});

test('textBox: centred on (x, y), about 0.55 em per character, one line high', () => {
  const b = textBox('abcdefghij', 40, 540, 300);
  assert.equal(b.w, 10 * 40 * 0.55);
  assert.equal(b.h, 40 * 1.3);
  assert.equal(b.x, 540 - b.w / 2);
  assert.equal(b.y, 300 - b.h / 2);
  assert.ok(textBox('abc', 40, 540, 300, 30).w === 3 * 40 * 0.55 + 60, 'padding on both sides');
});

test('inSafeArea: inside the page, above the caption band, out of the button strip', () => {
  assert.ok(inSafeArea({ x: 100, y: 100, w: 300, h: 60 }));
  assert.ok(!inSafeArea({ x: 100, y: 1560, w: 300, h: 60 }), 'runs into the caption band');
  assert.ok(!inSafeArea({ x: -5, y: 100, w: 300, h: 60 }), 'off the left edge');
  assert.ok(!inSafeArea({ x: 800, y: 1200, w: 200, h: 60 }), 'under the buttons');
  assert.ok(inSafeArea({ x: 800, y: 400, w: 200, h: 60 }), 'the right edge is free above mid-screen');
});

test('overlaps: boxes that share area, not boxes that only touch', () => {
  assert.ok(overlaps({ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 50, w: 100, h: 100 }));
  assert.ok(!overlaps({ x: 0, y: 0, w: 100, h: 100 }, { x: 100, y: 0, w: 100, h: 100 }));
});

test('widthShare / heightShare: how much of the page a set of points spans', () => {
  assert.equal(widthShare([108, 972, 540]), 0.8);
  assert.equal(widthShare([540]), 0);
  assert.equal(heightShare([192, 1728]), 0.8);
});

test('frameProblems: names every text out of the safe area and every pair that collides', () => {
  const ok = frameProblems([{ name: 'a', box: { x: 100, y: 100, w: 200, h: 50 } }, { name: 'b', box: { x: 100, y: 200, w: 200, h: 50 } }]);
  assert.deepEqual(ok, []);
  const bad = frameProblems([{ name: 'a', box: { x: 100, y: 100, w: 200, h: 50 } }, { name: 'b', box: { x: 150, y: 120, w: 200, h: 50 } },
    { name: 'c', box: { x: 100, y: 1700, w: 200, h: 50 } }]);
  assert.deepEqual(bad, ['c outside the safe area', 'a overlaps b']);
});
