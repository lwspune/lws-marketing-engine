import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, T_STOP, T_SECOND, T_SHAKE, LABEL, HEADER, OPTIONS, ANSWER, BRAND, SECOND_Q, CAPTIONS, SECOND_HOOK,
  BAND, BULB_V, magnetU, coilU, relU, glow, emfNow, windUpTo, cameraAt, anchors, CAMERA, SOUND, MUSIC_HITS, COLOURS, COVER_T,
} from '../src/lib/pp011.ts';
import { project } from '../src/lib/inductionScene.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Physics, visualised #11 (P37, "Still magnet, dark bulb"): reel B of the framework-2 test (L61), made by our
// framework (F1–F30). A magnet held still inside a coil lights nothing: only a change of flux makes a current.
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const maxGlow = (a: number, b: number) => Math.max(...frames.filter(t => t >= a && t <= b).map(glow));

test('frame 0 (F4, F20): the question, three options, the tag: 13 words; the answer is "off"', () => {
  assert.equal(LABEL, 'PHYSICS, VISUALISED  #11');
  assert.deepEqual(HEADER, ['Magnet stops inside. Bulb?']);
  assert.deepEqual(OPTIONS, ['A  bright', 'B  dim', 'C  off']);
  assert.equal(OPTIONS[ANSWER], 'C  off');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const options = OPTIONS.map(o => o.replace(/^[A-C]\s+/, '')).join(' ');
  assert.equal(words(LABEL) + words(HEADER.join(' ')) + words(options) + words(BRAND), 13);
});

test('the hook move (F25 Assemble, F5): the coil winds itself turn by turn from frame 0 while the magnet already moves', () => {
  assert.equal(windUpTo(0), 0);
  assert.equal(windUpTo(2.4), 1);
  for (let f = 1; f <= 90; f++) {
    const a = (f - 1) / 30, b = f / 30;
    assert.ok(windUpTo(a) !== windUpTo(b) || magnetU(a) !== magnetU(b), `nothing moves at frame ${f}`);
  }
});

test('F10: the bulb follows Faraday\'s law: it flashes while the magnet plunges and is dark once it stops', () => {
  assert.ok(maxGlow(2.4, 7.0) > 0.6, 'bright flashes while the magnet moves in and out');
  for (const t of frames.filter(t => t > T_STOP + 0.5 && t < 10)) { assert.equal(emfNow(t), 0); assert.ok(glow(t) < 0.02, `glow ${glow(t)} at ${t}`); }
  assert.ok(Math.abs(magnetU(T_STOP + 1)) < 1e-9, 'it stops inside, at the centre');
});

test('the answer at 8.4 s (L48), after the bulb has gone dark; the right option is "off"', () => {
  assert.ok(ANSWER_AT > 8 && ANSWER_AT < 9 && ANSWER_AT > T_STOP + 0.5);
  assert.ok(glow(ANSWER_AT) < 0.01);
});

test('the second hook (F26): "Move the coil instead?" as the answer lands; moving the coil lights it too', () => {
  assert.equal(SECOND_Q, 'Move the coil instead?');
  assert.equal(SECOND_HOOK.text, SECOND_Q);
  assert.ok(words(SECOND_Q) <= 7 && SECOND_HOOK.t0 >= ANSWER_AT && SECOND_HOOK.t0 - ANSWER_AT <= 1.5);
  assert.equal(SECOND_HOOK.t0, T_SECOND);
  for (const t of frames.filter(t => t > T_SECOND && t < T_SHAKE)) assert.equal(magnetU(t), magnetU(T_SECOND), 'the magnet stays still');
  assert.ok(maxGlow(T_SECOND, T_SHAKE) > 0.3, 'the moving coil lights the bulb');
  assert.ok(frames.some(t => t > T_SECOND && coilU(t) !== 0), 'the coil moves');
});

test('faster change, brighter bulb: the quick shake glows brighter than the first slow strokes', () => {
  assert.ok(maxGlow(T_SHAKE, END_AT) > maxGlow(2.4, 7.0));
  assert.ok(Math.abs(relU(END_AT)) < 1e-6, 'everything back at rest for the end card');
});

test('the readout and the bulb use one scale: full glow at the bulb\'s 1.5 V', () => {
  assert.equal(BULB_V, 1.5);
  for (const t of frames) assert.ok(glow(t) >= 0 && glow(t) <= 1);
});

test('words (F7): every caption ≤ 7 words; nothing on screen after the end card but the card', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(DURATION <= 25, 'F18');
});

test('everything named stays inside the 3D band on every frame', () => {
  for (const t of frames.filter(t => t <= END_AT)) {
    const cam = cameraAt(t);
    for (const a of anchors(t)) {
      const q = project(a.p, cam, BAND);
      assert.ok(q.x > 40 && q.x < BAND.width - 40 && q.y > BAND.top + 15 && q.y < BAND.top + BAND.height - 15, `${a.name} off the band at ${t.toFixed(2)}`);
    }
  }
});

test('camera (F9): a slow push, a punch-in on the dark bulb before the answer, a zoom out for the second hook; no jumps', () => {
  const zooms = CAMERA.keys.map(k => k.to[0]);
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of zooms) { if (k > z) ins++; if (k < z) outs++; z = k; }
  assert.ok(ins >= 2 && outs >= 1);
  const punch = CAMERA.keys.find(k => k.dur <= 0.9 && k.to[0] > 1.3)!;
  assert.ok(punch.t >= T_STOP && punch.t + punch.dur <= ANSWER_AT);
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]).position, b = cameraAt(frames[i]).position;
    assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) < 0.15, `jump at ${frames[i]}`);
  }
  const zz = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[0];
  assert.ok(zz(ANSWER_AT) > 1.3);
});

test('sound (F14–F15): a snap per few turns as the coil winds, a shimmer when it is done, whooshes only on fast zooms', () => {
  const snaps = SOUND.hits.filter(h => h.kind === 'snap');
  assert.equal(snaps.length, 8);
  assert.ok(snaps.every(s => s.t < 2.4));
  assert.ok(SOUND.hits.some(h => h.kind === 'shimmer' && Math.abs(h.t - 2.4) < 0.05));
  const w = whooshesFor(CAMERA.start, CAMERA.keys);
  assert.deepEqual(SOUND.hits.filter(h => h.kind.startsWith('whoosh')), w);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SECOND]);
});

test('colours (F24): real copper; the field and the current told apart, colour-blind safe; so are the poles', () => {
  assert.ok(distinguishable(COLOURS.field, COLOURS.current));
  assert.ok(distinguishable(COLOURS.north, COLOURS.south));
});

test('F6: the cover is taken before the answer', () => {
  assert.ok(COVER_T < ANSWER_AT);
});
