import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, F, R, POLE_X, H, APERTURE, U_START, U_END, T_RAYS, T_AT_F, T_LEAVE_F, HEADER, OPTIONS,
  ANSWER, imageDistance, magnification, uAt, mirrorX, imageAt, rayPaths, raysDrawn, flicker, CAMERA, cameraAt, project, BAND,
  CAPTIONS, SHOWN, VOICE, SOUND, MUSIC_HITS, type V2,
} from '../src/lib/pp008.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';

// @pyqvault_ · Physics, visualised #8 (predict-first): a flame in a spoon (a concave mirror) is upside down; bring it
// inside F and the image turns upright and bigger. Class 12 Physics · Ray Optics (mirror formula 1/v + 1/u = 1/f).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;
// Distance from point p to the line through a and b (2D).
const offLine = (p: V2, a: V2, b: V2) => Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);

test('the answer, re-derived from the mirror formula (1/v + 1/u = 1/f, m = −v/u)', () => {
  near(R, 2 * F);
  // Far (u = 2.5f): real, upside down, smaller. At C (u = 2f): same size. Inside F (u = 0.6f): behind the mirror, upright, ×2.5.
  near(imageDistance(2.5 * F), (5 / 3) * F); near(magnification(2.5 * F), -2 / 3);
  near(imageDistance(2 * F), 2 * F); near(magnification(2 * F), -1);
  near(imageDistance(0.6 * F), -1.5 * F); near(magnification(0.6 * F), 2.5);
  for (const u of [3, 2.2, 1.5, 0.9, 0.5, 0.3]) near(1 / imageDistance(u) + 1 / u, 1 / F, 1e-12);
  assert.match(OPTIONS[ANSWER], /upright/);
  near(uAt(ANSWER_AT), U_END); assert.ok(magnification(U_END) > 1, 'upright and bigger');
});

test('the candle: starts at 2.5f, slides in, holds at F, then stops inside F at the answer; never jumps or goes back', () => {
  near(U_START, 2.5 * F); near(U_END, 0.6 * F);
  near(uAt(0), U_START); near(uAt(T_AT_F), F); near(uAt(T_LEAVE_F), F); near(uAt(DURATION), U_END);
  assert.ok(T_LEAVE_F - T_AT_F >= 0.8, 'holds at F long enough to see the parallel rays');
  for (let i = 1; i < frames.length; i++) {
    const a = uAt(frames[i - 1]), b = uAt(frames[i]);
    assert.ok(b <= a + 1e-12 && a - b < 0.08, `candle jumps ${a} → ${b} at ${frames[i]}`);
  }
});

test('the image: upside down (m < 0) before F, none at F, upright (m > 0) after; shown only where it fits the frame', () => {
  for (const t of frames) {
    const im = imageAt(t);
    assert.ok(im.alpha >= 0 && im.alpha <= 1);
    if (im.alpha === 0) continue;
    assert.ok(t >= T_RAYS, 'no image before the rays reach it');
    if (t < T_AT_F) assert.ok(im.m < 0 && !im.virtual, `upright before F at ${t}`);
    if (t > T_LEAVE_F) assert.ok(im.m > 0 && im.virtual, `upside down after F at ${t}`);
    assert.ok(Math.abs(im.m) <= 3.4 && im.x <= 2.6 && im.x >= -3.0, `off frame at ${t}`);
    near(im.x, POLE_X + imageDistance(im.u)); near(im.y, im.m * H);
  }
  for (const t of frames.filter(t => t >= T_AT_F && t <= T_LEAVE_F)) assert.equal(imageAt(t).alpha, 0, `an image at F (${t})`);
  assert.equal(imageAt(ANSWER_AT).alpha, 1);
});

test('every ray obeys the textbook rules: all reflected rays meet at the image (or spread from it, behind the mirror)', () => {
  for (const t of [3.5, 5, 6.5, ANSWER_AT, 15]) {
    const u = uAt(t), v = imageDistance(u), img: V2 = [POLE_X + v, magnification(u) * H], tip: V2 = [POLE_X + u, H];
    const paths = rayPaths(t);
    assert.ok(paths.length >= 6);
    for (const p of paths) {
      near(p.inc[0][0], tip[0]); near(p.inc[0][1], tip[1]);                        // every ray leaves the flame's tip
      near(p.inc[1][0], mirrorX(p.inc[1][1]));                                      // …and lands on the spoon
      assert.ok(Math.abs(p.inc[1][1]) <= APERTURE);
      near(offLine(img, p.out[0], p.out[1]), 0, 1e-9);                              // its reflection lines up with the image
      assert.equal(!!p.back, v < 0, 'a dashed extension behind the mirror only for the virtual image');
    }
    // The two rule rays: parallel to the axis → through F; at the pole → reflected symmetrically.
    const par = paths.find(p => p.rule === 'parallel')!, pole = paths.find(p => p.rule === 'pole')!;
    // Rays land on the curved bowl and head for the image (the textbook's paraxial drawing), so the parallel ray passes
    // F to within the bowl's depth at that height, not exactly: under 0.07 of f, a few pixels.
    near(par.inc[1][1], H); assert.ok(offLine([POLE_X + F, 0], par.out[0], par.out[1]) < 0.07, 'the parallel ray misses F');
    near(pole.inc[1][1], 0);
    const din = [pole.inc[1][0] - pole.inc[0][0], pole.inc[1][1] - pole.inc[0][1]], dout = [pole.out[1][0] - pole.out[0][0], pole.out[1][1] - pole.out[0][1]];
    near(Math.atan2(din[1], -din[0]), Math.atan2(dout[1], dout[0]), 1e-9);       // mirrored in the axis: angle in = angle out
  }
});

test('at F the reflected rays are all parallel (no image anywhere)', () => {
  const paths = rayPaths((T_AT_F + T_LEAVE_F) / 2), dir = (p: { out: [V2, V2] }) => Math.atan2(p.out[1][1] - p.out[0][1], p.out[1][0] - p.out[0][0]);
  for (const p of paths) near(dir(p), dir(paths[0]), 1e-9);
});

test('the rays draw from T_RAYS (incoming first, then reflected) and stay up', () => {
  assert.equal(raysDrawn(T_RAYS - 0.01), 0); near(raysDrawn(T_RAYS + 1.2), 1);
  assert.ok(T_RAYS >= 2.8, 'the rays wait for the orbit to end at the front');
  for (const t of frames.filter(t => t > T_RAYS + 1.2)) near(raysDrawn(t), 1);
});

test('the opening orbit: from frame 0, exactly 360°, smooth, back at the front by 3 s, and no other orbit (F22)', () => {
  const az = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[2];
  near(Math.abs(az(0) - az(3.0)) / DEG, 360, 1e-6); near(az(3.0), 0);
  assert.ok(az(1 / 30) !== az(0), 'turning on frame 1');
  for (let i = 1; i < frames.length; i++) {
    const a = az(frames[i - 1]), b = az(frames[i]);
    assert.ok(b >= a - 1e-12 && b - a < 20 * DEG, `orbit jumps at ${frames[i]}`);
    if (frames[i] >= 3.0) near(b, 0);
  }
});

test('something moves on every frame of the first 3 s: the orbit and the flame', () => {
  for (let f = 1; f <= 90; f++) {
    const t = f / 30, p = t - 1 / 30;
    const turned = tween(t, CAMERA.start, CAMERA.keys)[2] !== tween(p, CAMERA.start, CAMERA.keys)[2];
    assert.ok(turned || flicker(t) !== flicker(p), `still at frame ${f}`);
    assert.ok(flicker(t) !== flicker(p), `flame still at frame ${f}`);
  }
});

test('the camera: zooms in twice and out once, a punch-in landing on the answer, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 1.6 && Math.abs(b - a) < 0.1, `camera jumps at ${frames[i]}`);
  }
});

test('the projection puts the spoon, F, C and the candle inside the 3D band at the front view', () => {
  for (const t of [3.0, 6, ANSWER_AT, 14]) {
    const cam = cameraAt(t);
    for (const p of [[POLE_X, 0, 0], [POLE_X + F, 0, 0], [POLE_X + uAt(t), H, 0]] as [number, number, number][]) {
      const s = project(p, cam);
      assert.ok(s.x > 0 && s.x < BAND.width && s.y > BAND.top && s.y < BAND.top + BAND.height, `${p} off band at ${t}`);
    }
  }
});

test('the cover is taken at the front view after the rays meet, before the answer (F6)', () => {
  assert.ok(COVER_T < ANSWER_AT && raysDrawn(COVER_T) === 1 && imageAt(COVER_T).m < 0);
  near(tween(COVER_T, CAMERA.start, CAMERA.keys)[2], 0);
});

test('sound from the picture: a scrape only while the candle slides, a thunk where it stops, whooshes on fast zooms', () => {
  const beds = SOUND.beds;
  assert.ok(beds.length >= 1 && beds.every(b => b.kind === 'scrape'));
  for (const t of frames) {
    const moving = Math.abs(uAt(t + 1 / 60) - uAt(t - 1 / 60)) > 1e-6;
    const level = beds.reduce((s, b) => s + (t >= b.t0 && t < b.t1 ? b.level(t) : 0), 0);
    if (!moving) assert.ok(level < 0.02, `scrape with the candle still at ${t}`);
  }
  const thunks = SOUND.hits.filter(h => h.kind === 'thunk').map(h => h.t);
  assert.deepEqual(thunks.map(t => Math.round(t * 10) / 10), [T_AT_F, ANSWER_AT].map(t => Math.round(t * 10) / 10));
  const whooshes = whooshesFor(CAMERA.start, CAMERA.keys);
  assert.equal(SOUND.hits.length, thunks.length + whooshes.length);
  assert.equal(SOUND.duration, DURATION);
});

test('the voice reads only what is on screen, while it is on screen; the question from frame 0 (F4, F17)', () => {
  assert.ok(VOICE[0].t <= 0.2 && VOICE[0].text === HEADER.join(' '));
  for (const line of VOICE) assert.ok(onScreen(line, SHOWN), `"${line.text}" at ${line.t}`);
  for (let k = 1; k < VOICE.length; k++) assert.ok(VOICE[k].t >= VOICE[k - 1].until, 'lines overlap');
  assert.ok(VOICE.at(-1)!.until <= END_AT);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
