import test from 'node:test';
import assert from 'node:assert/strict';
import { layerCam } from '../src/lib/sm011.ts';
import { paintProblems, contrast } from '../src/lib/paint.ts';
import {
  DURATION, MUSIC, HOOK, LINE2, SHOTS, WIDE, LAYERS, shotAt, cameraAt, viewOf, dissolveAt, DISSOLVE, textAlpha, W, H,
  CUP, steamAt, STEAM, BOOK, pageAt, PAGE_TURN, motesAt, BEAM, inBeam, cloudsAt, glanceAt, leanAt, eyesClosed, BLINKS, SCENE,
  PAINT, SOUND,
} from '../src/lib/sm013.ts';

// @soundmindwithshivani pause reel #3 (framework S20, Painted 2D S21), "window seat": not monsoon any more (founder,
// 2026-10-24: "chai in cozy room besides window with book in hand"). A clear golden-hour evening: she reads in a window
// seat, chai steaming on the sill, dust drifting in the sunbeam; wide → the cup → a page turning → wide (the book on her
// chest, eyes closed). 12–15 s, loops.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shot = (id: string) => SHOTS.find(s => s.id === id)!;
const inView = (t: number, x: number, y: number) => { const v = viewOf(cameraAt(t)); return x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1; };

test('12–15 s; the message on frame 0, the second line to the end', () => {
  assert.ok(DURATION >= 12 && DURATION <= 15);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /rest/i);
  assert.equal(LINE2.t1, DURATION);
});

test('four shots back to back: wide, the cup, the book, wide; text only on the wide shots', () => {
  assert.deepEqual(SHOTS.map(s => s.id), ['wide', 'cup', 'book', 'rest']);
  assert.equal(SHOTS[0].t0, 0); assert.equal(SHOTS.at(-1)!.t1, DURATION);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i].t0, SHOTS[i - 1].t1);
  for (const id of ['cup', 'book']) assert.ok(shot(id).from.z >= 2 && shot(id).to.z >= 2, `${id} isn't a close-up`);
  for (const id of ['wide', 'rest']) assert.ok(shot(id).from.z <= 1.2 && shot(id).to.z <= 1.2, `${id} isn't wide`);
  assert.ok(HOOK.t1 <= shot('cup').t0 && LINE2.t0 >= shot('rest').t0 + DISSOLVE);
});

test('no layer looks past the drawing; the camera ends where it began; dissolves at the cuts', () => {
  for (const t of frames.concat(DURATION)) for (const d of Object.values(LAYERS)) {
    const v = viewOf(layerCam(cameraAt(t), d));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `layer ${d} off at ${t.toFixed(2)} s`);
  }
  assert.deepEqual(cameraAt(0), WIDE);
  assert.deepEqual(cameraAt(DURATION), WIDE);
  assert.equal(dissolveAt(0), null);
  for (let i = 1; i < SHOTS.length; i++) assert.ok(dissolveAt(SHOTS[i].t0 + DISSOLVE / 2)!.k > 0.3);
});

test('the close-ups hold their subject: the cup and its steam; the book and its turning page', () => {
  for (const t of frames.filter(t => shotAt(t).id === 'cup')) {
    assert.ok(inView(t, CUP.x, CUP.y) && inView(t, CUP.x, CUP.y - STEAM.rise - 30), `cup cut off at ${t.toFixed(2)}`);
  }
  for (const t of frames.filter(t => shotAt(t).id === 'book')) {
    assert.ok(inView(t, BOOK.x - BOOK.w / 2, BOOK.y) && inView(t, BOOK.x + BOOK.w / 2, BOOK.y), `book cut off at ${t.toFixed(2)}`);
  }
});

test('a page turns once, inside the book close-up, and lies flat before and after', () => {
  assert.ok(PAGE_TURN[0] >= shot('book').t0 + DISSOLVE && PAGE_TURN[1] <= shot('book').t1 - 0.3);
  assert.equal(pageAt(PAGE_TURN[0] - 0.05), 0);
  assert.equal(pageAt(PAGE_TURN[1] + 0.05), 1);
  assert.ok(pageAt((PAGE_TURN[0] + PAGE_TURN[1]) / 2) > 0.3 && pageAt((PAGE_TURN[0] + PAGE_TURN[1]) / 2) < 0.7);
});

test('alive all the time: steam rising, dust drifting in the sunbeam, clouds that loop', () => {
  for (const t of frames) assert.ok([0, 1, 2, 3].filter(i => steamAt(i, t).alpha > 0.2).length >= 3, `steam thin at ${t.toFixed(2)}`);
  for (const t of frames.filter((_, i) => i % 10 === 0)) {
    const m = motesAt(t);
    assert.ok(m.length >= 12 && m.every(p => inBeam(p.x, p.y)), `dust outside the beam at ${t.toFixed(2)}`);
  }
  const a = cloudsAt(0), b = cloudsAt(DURATION);
  for (let i = 0; i < a.length; i++) assert.ok(Math.abs(a[i].x - b[i].x) < 1e-6, 'clouds jump at the loop');
  assert.ok(BEAM.x0 < BEAM.x1);
});

test('she glances out of the window and back in the first shot, blinks, and rests with her eyes closed at the end', () => {
  const g = frames.filter(t => shotAt(t).id === 'wide').map(glanceAt);
  assert.ok(Math.max(...g) > 0.8 && g[0] === 0 && glanceAt(shot('cup').t0) === 0);
  for (const b of BLINKS) assert.ok(eyesClosed(b + 0.05) && !eyesClosed(b + 0.2), `blink at ${b}`);
  assert.equal(leanAt(shot('rest').t0), 0);
  assert.ok(leanAt(DURATION) > 0.99 && eyesClosed(DURATION));
  assert.ok(MUSIC.chime >= LINE2.t0 && MUSIC.chime < DURATION - 1);
});

test('painted, not outlined (S21), and the words readable on the room (WCAG AA)', () => {
  assert.deepEqual(paintProblems(PAINT), []);
  for (const bg of SCENE.behindText) assert.ok(contrast(SCENE.text, bg) >= 4.5, `text on ${bg}: ${contrast(SCENE.text, bg).toFixed(2)}`);
});

test('not monsoon: no rain in the sound; a soft page sound when the page turns', () => {
  assert.equal(SOUND.beds.filter(b => b.kind === 'rain').length, 0);
  assert.ok(SOUND.hits.some(h => Math.abs(h.t - PAGE_TURN[0]) < 0.3));
});
