import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, F, R, POLE_X, H, APERTURE, U_START, U_END, T_RAYS, T_STOP, T_VIEW, HEADER, OPTIONS,
  ANSWER, EYE, imageDistance, magnification, uAt, mirrorX, mirrorNormal, imageAt, rayPaths, raysDrawn, eyeDistance,
  sizeVsFlat, viewWedge, wheelTurn, CAMERA, cameraAt, project, BAND, CAPTIONS, SHOWN, VOICE, SOUND, MUSIC_HITS, type V2,
} from '../src/lib/pp009.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';

// @pyqvault_ · Physics, visualised #9 (predict-first): a car in your wing mirror (a convex mirror) is closer than it
// looks: its image is always upright and smaller (m = f/(u + f) < 1), so it looks farther. Class 12 Physics · Ray Optics.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;
const offLine = (p: V2, a: V2, b: V2) => Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);

test('the convex mirror, re-derived: 1/v + 1/u = 1/f with f = −F; the image is behind the mirror, upright and smaller', () => {
  near(R, 2 * F);
  for (const u of [U_START, 3, 2, 1, U_END, 0.3]) {
    const v = imageDistance(u), m = magnification(u);
    near(1 / v + 1 / u, -1 / F, 1e-12);
    assert.ok(v < 0 && -v < F, `virtual, within F (u = ${u})`);
    near(m, -v / u); near(m, F / (u + F));
    assert.ok(m > 0 && m < 1, 'upright and smaller, however close');
  }
  assert.match(OPTIONS[ANSWER], /closer/);
});

test('it looks smaller than in a flat mirror, from the driver\'s seat: that is why it looks farther away', () => {
  // A flat mirror shows the car at its real size, u behind the glass; the eye sees it at a distance d + u. The convex
  // mirror's image is m times as tall, |v| behind the glass, seen from d + |v|. Angular size ratio = m (d + u)/(d + |v|).
  const d = eyeDistance;
  near(d, Math.hypot(EYE[0] - POLE_X, EYE[1]));
  for (const u of [U_START, 2, U_END]) {
    const v = imageDistance(u), m = magnification(u);
    near(sizeVsFlat(u), (m * (d + u)) / (d - v));
    assert.ok(sizeVsFlat(u) < 1, 'smaller than a flat mirror shows it');
  }
});

test('the car drives in from frame 0 and stops at T_STOP; never jumps or backs up', () => {
  near(uAt(0), U_START); near(uAt(T_STOP), U_END); near(uAt(DURATION), U_END);
  assert.ok(uAt(1 / 30) < uAt(0), 'moving on frame 1');
  for (let i = 1; i < frames.length; i++) {
    const a = uAt(frames[i - 1]), b = uAt(frames[i]);
    assert.ok(b <= a + 1e-12 && a - b < 0.05, `car jumps at ${frames[i]}`);
  }
  assert.ok(T_STOP <= ANSWER_AT, 'stopped before the answer');
});

test('the image: appears once the rays reach it, always upright, smaller and behind the mirror, inside the band', () => {
  for (const t of frames) {
    const im = imageAt(t);
    if (im.alpha === 0) continue;
    assert.ok(t >= T_RAYS);
    assert.ok(im.m > 0 && im.m < 1 && im.x < POLE_X && im.x > POLE_X - F);
    near(im.x, POLE_X + imageDistance(im.u)); near(im.y, im.m * H);
  }
  assert.equal(imageAt(T_RAYS - 0.01).alpha, 0); assert.equal(imageAt(ANSWER_AT).alpha, 1);
});

test('every ray obeys the textbook rules: the reflections spread out as if from the image behind the mirror', () => {
  for (const t of [4, 6, ANSWER_AT, 15]) {
    const u = uAt(t), img: V2 = [POLE_X + imageDistance(u), magnification(u) * H], tip: V2 = [POLE_X + u, H];
    const paths = rayPaths(t);
    assert.ok(paths.length >= 5);
    for (const p of paths) {
      near(p.inc[0][0], tip[0]); near(p.inc[0][1], tip[1]);
      near(p.inc[1][0], mirrorX(p.inc[1][1])); assert.ok(Math.abs(p.inc[1][1]) <= APERTURE);
      near(offLine(img, p.out[0], p.out[1]), 0, 1e-9);
      assert.ok(p.out[1][0] > p.out[0][0], 'reflected rays head back out, away from the mirror');
      near(p.back[0][0], p.out[0][0]); near(p.back[1][0], img[0]); near(p.back[1][1], img[1]);
    }
    const par = paths.find(p => p.rule === 'parallel')!, pole = paths.find(p => p.rule === 'pole')!;
    near(par.inc[1][1], H); assert.ok(offLine([POLE_X - F, 0], par.out[0], par.out[1]) < 0.06, 'the parallel ray seems to come from F');
    near(pole.inc[1][1], 0);
    const din = [pole.inc[1][0] - pole.inc[0][0], pole.inc[1][1] - pole.inc[0][1]], dout = [pole.out[1][0] - pole.out[0][0], pole.out[1][1] - pole.out[0][1]];
    near(Math.atan2(din[1], -din[0]), Math.atan2(dout[1], dout[0]), 1e-9);
  }
});

test('the wider view: the convex mirror reflects the eye\'s view over a wider angle than a flat one (true reflection law)', () => {
  const spread = (w: ReturnType<typeof viewWedge>) => Math.abs(Math.atan2(w.top[1][1], w.top[1][0]) - Math.atan2(w.bottom[1][1], w.bottom[1][0]));
  const flat = viewWedge('flat'), convex = viewWedge('convex');
  assert.ok(spread(convex) > 2 * spread(flat), `convex ${(spread(convex) / DEG).toFixed(0)}° vs flat ${(spread(flat) / DEG).toFixed(0)}°`);
  // Reflection law at each edge: angle in = angle out about the surface normal.
  for (const w of [flat, convex]) for (const [M, d] of [w.top, w.bottom]) {
    const n = w === flat ? [1, 0] : mirrorNormal(M[1]), i = [M[0] - EYE[0], M[1] - EYE[1]], li = Math.hypot(i[0], i[1]);
    const r = [i[0] / li - 2 * ((i[0] * n[0] + i[1] * n[1]) / li) * n[0], i[1] / li - 2 * ((i[0] * n[0] + i[1] * n[1]) / li) * n[1]];
    near(d[0], r[0]); near(d[1], r[1]);
  }
  assert.ok(T_VIEW > ANSWER_AT);
});

test('the opening orbit: from frame 0, exactly 360°, smooth, back at the front by 3 s, and no other orbit (F22)', () => {
  const az = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[2];
  near(Math.abs(az(0) - az(3.0)) / DEG, 360, 1e-6); near(az(3.0), 0);
  for (let i = 1; i < frames.length; i++) {
    const a = az(frames[i - 1]), b = az(frames[i]);
    assert.ok(b >= a - 1e-12 && b - a < 20 * DEG, `orbit jumps at ${frames[i]}`);
    if (frames[i] >= 3.0) near(b, 0);
  }
});

test('something moves on every frame of the first 3 s: the car drives and its wheels turn', () => {
  for (let f = 1; f <= 90; f++) {
    assert.ok(uAt(f / 30) !== uAt((f - 1) / 30), `car still at frame ${f}`);
    assert.ok(wheelTurn(f / 30) !== wheelTurn((f - 1) / 30), `wheels still at frame ${f}`);
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

test('what the beat table says to keep in frame stays inside the 3D band (runbook step 2)', () => {
  for (const t of frames.filter(t => t >= 3.0 && t < END_AT)) {
    const cam = cameraAt(t), im = imageAt(t), u = uAt(t);
    const keep: [number, number, number][] = [[POLE_X, APERTURE, 0], [POLE_X, -APERTURE, 0], [POLE_X + u, H, 0], [POLE_X + u + 0.3, 0, 0]];
    if (im.alpha > 0) keep.push([im.x, im.y, 0]);
    if (t >= T_VIEW) keep.push([EYE[0], EYE[1], 0]);
    for (const p of keep) {
      const s = project(p, cam);
      assert.ok(s.x > 40 && s.x < BAND.width - 40 && s.y > BAND.top + 30 && s.y < BAND.top + BAND.height - 30, `${p.map(v => v.toFixed(2))} off band at ${t.toFixed(2)}`);
    }
  }
});

test('the cover: front view, rays drawn and the image up, before the answer (F6)', () => {
  assert.ok(COVER_T < ANSWER_AT && raysDrawn(COVER_T) === 1 && imageAt(COVER_T).alpha === 1);
  near(tween(COVER_T, CAMERA.start, CAMERA.keys)[2], 0);
});

test('sound from the picture: the engine hums as loud as the car moves, silent once it stops; whooshes on fast zooms', () => {
  const beds = SOUND.beds;
  assert.ok(beds.length === 1 && beds[0].kind === 'roar');
  for (const t of frames) {
    const level = t >= beds[0].t0 && t < beds[0].t1 ? beds[0].level(t) : 0;
    if (t >= T_STOP) assert.ok(level < 0.02, `engine at ${t} after the stop`);
  }
  assert.equal(SOUND.hits.length, whooshesFor(CAMERA.start, CAMERA.keys).length);
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
