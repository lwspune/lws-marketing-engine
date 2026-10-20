import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, PAGE, LINES, FINAL, DOODLES, writeAt, strikeAt, inkAlpha, doodleAt, doodlePoints,
  pageTurnAt, penAt, highlightAt, sunAt, smileAt, zoomAt, textAlpha, wordBox, SEED,
} from '../src/lib/sm004.ts';

// @soundmindwithshivani reel #4, "my own page": "Your inner critic doesn't get to write your story." ME sits with her
// notebook; the critic's lines write themselves onto the page and ME's pen strikes each one out. Close-up. The page
// turns: "Cross it out. Write something kinder." Each new line is struck and a little pen doodle grows beside it. Ending:
// ME writes I'M ENOUGH, a marker sweeps behind it, the sun comes out, ME smiles. Same structure as reels #1–#3.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.match(HOOK.text, /inner critic/);
  for (const l of LINES) assert.ok(l.t0 + 1.6 <= ZOOM.t0 || l.t0 >= ZOOM.t1, `${l.text} is written during the close-up`);
});

test('the critic’s lines are short, in capitals, in two waves (five, then three), each on its own row', () => {
  for (const l of LINES) { assert.ok(l.text.split(/\s+/).length <= 5, l.text); assert.equal(l.text, l.text.toUpperCase()); }
  assert.equal(LINES.filter(l => l.t0 < ZOOM.t0).length, 5);
  assert.equal(LINES.filter(l => l.t0 > ZOOM.t1).length, 3);
  for (const wave of [LINES.filter(l => l.t0 < ZOOM.t0), LINES.filter(l => l.t0 > ZOOM.t1)])
    assert.equal(new Set(wave.map(l => l.row)).size, wave.length);
});

test('each line writes itself, then the pen strikes it out, then it fades back', () => {
  for (const l of LINES) {
    assert.equal(writeAt(l, l.t0 - 0.01), 0); assert.equal(writeAt(l, l.t0 + 0.7), 1);
    assert.equal(strikeAt(l, l.t0 + 1.1), 0); assert.equal(strikeAt(l, l.t0 + 1.6), 1);
    for (let i = 1; i < frames.length; i++) {
      assert.ok(writeAt(l, frames[i]) >= writeAt(l, frames[i - 1]) && strikeAt(l, frames[i]) >= strikeAt(l, frames[i - 1]));
    }
    assert.ok(inkAlpha(l, l.t0 + 1.0) === 1 && inkAlpha(l, l.t0 + 2.2) < 0.5, `${l.text} doesn't fade once struck`);
  }
});

test('every word and the final line fit on the page and inside Instagram’s safe band, clear of the text boxes', () => {
  const page: Box = asBox(PAGE);
  for (const item of [...LINES, FINAL]) {
    const b = wordBox(item);
    assert.ok(b.x0 >= page.x0 + 20 && b.x1 <= page.x1 - 20 && b.y0 >= page.y0 && b.y1 <= page.y1, `${item.text} off the page`);
    assert.ok(b.x1 <= SAFE.right && b.y1 <= SAFE.bottom, `${item.text} under Instagram's buttons`);
    for (const t of TEXT_BOXES) assert.ok(!overlaps(b, asBox(t)), `${item.text} under the ${t.id} text`);
  }
  for (const t of TEXT_BOXES) assert.ok(t.y >= SAFE.top && t.y + t.h <= SAFE.bottom && t.x >= SAFE.left && t.x + t.w <= SAFE.right, t.id);
});

test('the page turns between the waves, and the second wave writes on the fresh page', () => {
  assert.equal(pageTurnAt(ZOOM.t1 - 0.5), 0);
  assert.equal(pageTurnAt(LINE2.t0 + 0.5), 1);
  const turned = frames.find(t => pageTurnAt(t) === 1)!;
  for (const l of LINES.filter(l => l.t0 > ZOOM.t1)) assert.ok(l.t0 >= turned, `${l.text} written before the page turned`);
});

test('a doodle grows beside each line of the second wave, drawn with the pen after the strike', () => {
  const second = LINES.filter(l => l.t0 > ZOOM.t1);
  assert.equal(DOODLES.length, second.length);
  DOODLES.forEach((d, i) => {
    const l = second[i];
    assert.equal(d.row, l.row);
    assert.equal(doodleAt(d, l.t0 + 1.6), 0);
    assert.equal(doodleAt(d, l.t0 + 2.4), 1);
    assert.ok(doodlePoints(d.shape).length >= 12, d.shape);
    const b = wordBox(l);
    assert.ok(d.x - d.size / 2 > b.x1 + 10 && d.x + d.size / 2 <= PAGE.x + PAGE.w - 20, `${d.shape} overlaps ${l.text}`);
  });
});

test('the pen goes where it writes: along each strike, never jumping', () => {
  for (const l of LINES) {
    const b = wordBox(l), mid = l.t0 + 1.35, p = penAt(mid);
    assert.ok(p.x >= b.x0 - 5 && p.x <= b.x1 + 5 && Math.abs(p.y - (b.y0 + b.y1) / 2) < 30, `pen not on ${l.text}`);
  }
  for (let i = 1; i < frames.length; i++) {
    const a = penAt(frames[i - 1]), b = penAt(frames[i]);
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) < 45, `pen jumps at ${frames[i].toFixed(2)} s`);
  }
});

test('a happy ending: I’M ENOUGH is written, a marker sweeps behind it, the sun comes out, ME smiles', () => {
  assert.equal(FINAL.text, "I'M ENOUGH");
  const last = LINES[LINES.length - 1];
  assert.ok(FINAL.t0 >= last.t0 + 2.4, 'the last doodle finishes first');
  assert.equal(highlightAt(FINAL.t0 + 0.5), 0); assert.equal(highlightAt(FINAL.t0 + 1.6), 1);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.ok(smileAt(DURATION) > 0.95 && smileAt(10) === 0);
  assert.ok(MUSIC.chime > FINAL.t0 && MUSIC.chime < DURATION);
  assert.ok(Number.isInteger(SEED) && SEED > 0, 'the hand-drawn strokes need a fixed seed, or every render differs');
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => {
    const p = penAt(t), q = penAt(t + dt);
    return Math.hypot(q.x - p.x, q.y - p.y) > 0.5 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 ||
      Math.abs(pageTurnAt(t + dt) - pageTurnAt(t)) > 1e-4 || LINES.some(l => writeAt(l, t + dt) !== writeAt(l, t) || strikeAt(l, t + dt) !== strikeAt(l, t)) ||
      DOODLES.some(d => doodleAt(d, t + dt) !== doodleAt(d, t)) || highlightAt(t + dt) !== highlightAt(t);
  };
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
