import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { layerCam } from '../src/lib/sm011.ts';
import { paintProblems, contrast } from '../src/lib/paint.ts';
import { SAFE } from '../src/lib/meStory.ts';
import {
  DURATION, MUSIC, LINES, HOOK, textAlpha, readSeconds, TEXT_BOX, SHOTS, WIDE, LAYERS, shotAt, cameraAt, viewOf, toScreen,
  dissolveAt, DISSOLVE, WINDOW, SHOOTING, shootingStarAt, tiltAt, dimAt, twinkleAt, flickerAt, cloudsAt, SCENE, PAINT,
  SOUND, W, H,
} from '../src/lib/sm014.ts';

// @soundmindwithshivani reminder reel #1 (framework S22), "a reminder under the stars". Model: a 34 s "let me remind you"
// reel studied 2026-10-27 (one short line at a time over slowly drifting night skies, no hard cuts, the hook inside a dark
// circle on frame 0, ending dark). Ours: Painted 2D (S21), in season (Diwali: lanterns and diyas, no rain), silent-first.
const { unsafeClaims } = createRequire(import.meta.url)('../../soundmind/cards.js');
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shot = (id: string) => SHOTS.find(s => s.id === id)!;
const words = (s: string) => s.split(/\s+/).length;

test('25–32 s; the hook names the feeling and is fully there on frame 0', () => {
  assert.ok(DURATION >= 25 && DURATION <= 32);
  assert.equal(HOOK, LINES[0]);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /hard on yourself/i);
});

test('one line at a time, back to back, each on screen long enough to read; the last one stays to the end', () => {
  for (let i = 1; i < LINES.length; i++) assert.ok(LINES[i].t0 >= LINES[i - 1].t1 - 1e-9, `lines ${i - 1} and ${i} overlap`);
  for (const l of LINES) {
    assert.ok(words(l.text) <= 8, `too long to read at a glance: "${l.text}"`);
    assert.ok(l.t1 - l.t0 >= readSeconds(l.text) - 1e-9, `"${l.text}" is up ${(l.t1 - l.t0).toFixed(2)} s, needs ${readSeconds(l.text).toFixed(2)}`);
  }
  assert.equal(LINES.at(-1)!.t1, DURATION);
  for (const t of frames) assert.ok(LINES.filter(l => textAlpha(l, t) > 0).length <= 1, `two lines at ${t.toFixed(2)}`);
  // never more than a breath without words
  for (let i = 1; i < LINES.length; i++) assert.ok(LINES[i].t0 - LINES[i - 1].t1 <= 0.5);
});

test('the words: original, warm, no health claims', () => {
  for (const l of LINES) assert.deepEqual(unsafeClaims(l.text), [], l.text);
  assert.equal(new Set(LINES.map(l => l.text)).size, LINES.length);
});

test('the words sit mid-frame, inside Instagram\'s safe band and the profile grid\'s 3:4 crop', () => {
  const b = TEXT_BOX;
  assert.ok(b.x >= SAFE.left && b.x + b.w <= SAFE.right && b.y >= SAFE.top && b.y + b.h <= SAFE.bottom);
  const crop = (H - (W * 4) / 3) / 2;
  assert.ok(b.y >= crop && b.y + b.h <= H - crop);
});

test('five scenes back to back, no hard cuts: window, rooftops, terrace, sky, clouds', () => {
  assert.deepEqual(SHOTS.map(s => s.id), ['window', 'rooftops', 'terrace', 'sky', 'clouds']);
  assert.equal(SHOTS[0].t0, 0); assert.equal(SHOTS.at(-1)!.t1, DURATION);
  for (let i = 1; i < SHOTS.length; i++) {
    assert.equal(SHOTS[i].t0, SHOTS[i - 1].t1);
    assert.ok(dissolveAt(SHOTS[i].t0 + DISSOLVE / 2)!.k > 0.2, `no dissolve into ${SHOTS[i].id}`);
  }
  assert.equal(dissolveAt(0), null);
  for (const s of SHOTS) assert.notDeepEqual(s.from, s.to, `${s.id} holds still`);
});

test('no layer looks past its drawing', () => {
  for (const t of frames.concat(DURATION)) for (const d of Object.values(LAYERS)) {
    const v = viewOf(layerCam(cameraAt(t), d));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `layer ${d} off at ${t.toFixed(2)} s`);
  }
});

test('frame 0: the hook sits inside the round window; the shot ends flying through it', () => {
  assert.deepEqual(cameraAt(0), WIDE);
  const inWindow = (p: { x: number; y: number }) => Math.hypot(p.x - WINDOW.cx, p.y - WINDOW.cy) <= WINDOW.r;
  const corners = [[TEXT_BOX.x, TEXT_BOX.y], [TEXT_BOX.x + TEXT_BOX.w, TEXT_BOX.y], [TEXT_BOX.x, TEXT_BOX.y + TEXT_BOX.h], [TEXT_BOX.x + TEXT_BOX.w, TEXT_BOX.y + TEXT_BOX.h]];
  // the window only grows on screen during its shot, so the words stay inside it
  for (const t of frames.filter(t => shotAt(t).id === 'window')) {
    const c = cameraAt(t), cx = toScreen(c, WINDOW.cx, WINDOW.cy), r = WINDOW.r * c.z;
    for (const [x, y] of corners) assert.ok(Math.hypot(x - cx.x, y - cx.y) <= r, `words outside the window at ${t.toFixed(2)}`);
  }
  const end = viewOf(cameraAt(shot('window').t1 - 1e-6));
  for (const p of [{ x: end.x0, y: end.y0 }, { x: end.x1, y: end.y0 }, { x: end.x0, y: end.y1 }, { x: end.x1, y: end.y1 }]) assert.ok(inWindow(p), 'the wall is still on screen at the fly-through');
});

test('the terrace: she tips her head up to the sky and the camera tilts up with her', () => {
  const s = shot('terrace');
  assert.ok(s.to.cy < s.from.cy);
  assert.ok(tiltAt(s.t0) < 0.1 && tiltAt(s.t1) > 0.9);
});

test('a shooting star crosses the sky shot, after the dissolve and above the words', () => {
  const s = shot('sky');
  assert.ok(SHOOTING.t0 >= s.t0 + DISSOLVE && SHOOTING.t1 <= s.t1);
  for (const t of frames.filter(t => t >= SHOOTING.t0 && t <= SHOOTING.t1)) {
    const p = shootingStarAt(t)!, q = toScreen(cameraAt(t), p.x, p.y);
    assert.ok(q.y < TEXT_BOX.y - 40, `the star crosses the words at ${t.toFixed(2)}`);
  }
  assert.equal(shootingStarAt(SHOOTING.t0 - 0.1), null);
});

test('alive all the time: stars twinkle, diyas flicker, clouds drift', () => {
  // never still for more than a tenth of a second
  const moves = (f: (t: number) => number, t: number) => [1, 2, 3].some(k => Math.abs(f(t + k / 30) - f(t)) > 1e-3);
  for (const t of frames) {
    assert.ok([0, 1, 2, 3, 4].some(i => moves(u => twinkleAt(i, u), t)), `stars still at ${t.toFixed(2)}`);
    assert.ok(moves(u => flickerAt(0, u), t), `flame still at ${t.toFixed(2)}`);
  }
  const a = cloudsAt(shot('clouds').t0), b = cloudsAt(DURATION);
  assert.ok(a.some((c, i) => Math.abs(c.x - b[i].x) > 20));
});

test('ends dark, so the loop back to the dark room is soft; the last line stays bright', () => {
  assert.equal(dimAt(LINES.at(-1)!.t0), 1);
  assert.ok(dimAt(DURATION) <= 0.5);
  for (const t of frames) assert.ok(dimAt(t) <= dimAt(Math.max(0, t - 1 / 30)) + 1e-9, 'brightens again');
  assert.equal(textAlpha(LINES.at(-1)!, DURATION), 1);
  assert.ok(MUSIC.chime >= LINES.at(-1)!.t0 - 0.5 && MUSIC.chime < DURATION - 1);
});

test('painted, not outlined (S21), and the words readable on every sky (WCAG AA)', () => {
  assert.deepEqual(paintProblems(PAINT), []);
  for (const bg of SCENE.behindText) assert.ok(contrast(SCENE.text, bg) >= 4.5, `text on ${bg}: ${contrast(SCENE.text, bg).toFixed(2)}`);
});

test('in season (Diwali, not monsoon): no rain; a soft whoosh through the window, a shimmer for the shooting star', () => {
  assert.equal(SOUND.beds.filter(b => b.kind === 'rain').length, 0);
  assert.ok(SOUND.hits.some(h => h.kind === 'whoosh-in' && Math.abs(h.t - (shot('window').t1 - 0.6)) < 0.6));
  assert.ok(SOUND.hits.some(h => h.kind === 'shimmer' && h.t >= SHOOTING.t0 && h.t <= SHOOTING.t1));
});
