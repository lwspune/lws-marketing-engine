import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, A, HEADER, OPTIONS, ANSWER, T_DROP_END, T_SC, T_BCC0, T_BCC1, T_FCC0, T_FCC1, T_PYR, T_METAL,
  FILLS, CORNERS, FACES, BODY, radiiAt, fillAt, barsAt, dropY, PYRAMID, PYR_R, pyramidDrop, metalAt,
  CAMERA, cameraAt, project, BAND, CAPTIONS, SHOWN, VOICE, SOUND, MUSIC_HITS, type V3,
} from '../src/lib/pc008.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';

// @pyqvault_ · Chemistry, visualised #8 (predict-first): stack oranges in a box: the best you can fill it? 74%.
// Class 12 Chemistry · Solid State (MHT-CET): packing efficiency 52.4% (simple cubic), 68% (bcc), 74% (fcc).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;
const dist = (p: V3, q: V3) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

test('the three packing efficiencies, re-derived: π/6, √3π/8, π/(3√2)', () => {
  near(FILLS.sc, Math.PI / 6); near(FILLS.bcc, (Math.sqrt(3) * Math.PI) / 8); near(FILLS.fcc, Math.PI / (3 * Math.SQRT2));
  assert.equal((FILLS.sc * 100).toFixed(1), '52.4'); assert.equal((FILLS.bcc * 100).toFixed(0), '68'); assert.equal((FILLS.fcc * 100).toFixed(0), '74');
  assert.match(OPTIONS[ANSWER], /74/);
  // The edge–radius relations: a = 2r, 4r/√3, 2√2 r.
  near(radiiAt(T_SC + 0.5).corner, A / 2); near(radiiAt(T_BCC1).body, (Math.sqrt(3) * A) / 4); near(radiiAt(T_FCC1).face, A / (2 * Math.SQRT2));
});

test('the live fill is the real share of the box: 1/8 of each corner orange, ½ of each face one, all of the centre one', () => {
  for (const t of frames) {
    const r = radiiAt(t);
    assert.ok(r.corner <= A / 2 + 1e-12 && r.face <= A / 2 && r.body <= A / 2, 'cut exactly by the faces (r ≤ a/2)');
    const inside = 8 * (r.corner ** 3) / 8 + 6 * (r.face ** 3) / 2 + r.body ** 3;
    near(fillAt(t), ((4 / 3) * Math.PI * inside) / A ** 3, 1e-12);
  }
  near(fillAt(T_BCC0 - 0.1), FILLS.sc); near(fillAt(T_FCC0 - 0.1), FILLS.bcc); near(fillAt(T_FCC1 + 0.1), FILLS.fcc); near(fillAt(ANSWER_AT), FILLS.fcc);
});

test('oranges never overlap, on any frame, and touch when each stacking settles', () => {
  for (const t of frames) {
    const r = radiiAt(t), all: [V3, number][] = [...CORNERS.map(p => [p, r.corner] as [V3, number]), ...FACES.map(p => [p, r.face] as [V3, number]), [BODY, r.body]];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      if (all[i][1] === 0 || all[j][1] === 0) continue;
      assert.ok(dist(all[i][0], all[j][0]) >= all[i][1] + all[j][1] - 1e-9, `overlap at ${t.toFixed(2)}`);
    }
  }
  const touch = (t: number, p: V3, q: V3, rp: number, rq: number) => near(dist(p, q), rp + rq, 1e-9);
  const sc = radiiAt(T_SC + 0.5), bcc = radiiAt(T_BCC1 + 0.1), fcc = radiiAt(T_FCC1 + 0.1);
  touch(T_SC, CORNERS[0], CORNERS[1], sc.corner, sc.corner);                 // along an edge
  touch(T_BCC1, CORNERS[0], BODY, bcc.corner, bcc.body);                       // along the body diagonal
  touch(T_FCC1, CORNERS[0], FACES.find(f => dist(f, CORNERS[0]) < A)!, fcc.corner, fcc.face);   // along a face diagonal
});

test('the bars fill one by one, each to its stacking\'s value when it settles', () => {
  const b = (t: number) => barsAt(t);
  near(b(T_SC + 0.5)[0], FILLS.sc); assert.equal(b(T_SC + 0.5)[1], 0);
  near(b(T_FCC0 - 0.05)[1], FILLS.bcc); near(b(ANSWER_AT)[2], FILLS.fcc);
  for (let i = 1; i < frames.length; i++) for (let k = 0; k < 3; k++) assert.ok(b(frames[i])[k] >= b(frames[i - 1])[k] - 1e-12, 'a bar shrinks');
});

test('the fruit-seller\'s pyramid is a face-centred stacking: 9 + 4 + 1, each orange touching its neighbours', () => {
  assert.equal(PYRAMID.length, 14);
  const d = 2 * PYR_R;
  for (const p of PYRAMID) {
    const nearest = Math.min(...PYRAMID.filter(q => q !== p).map(q => dist(p, q)));
    near(nearest, d, 1e-9);
  }
  const heights = [...new Set(PYRAMID.map(p => p[1].toFixed(9)))].map(Number).sort((x, y) => x - y);
  assert.equal(heights.length, 3); near(heights[1] - heights[0], d / Math.SQRT2); near(heights[2] - heights[1], d / Math.SQRT2);
  for (let k = 0; k < 14; k++) { assert.ok(pyramidDrop(k, T_PYR - 0.01) > 0); near(pyramidDrop(k, T_METAL), 0); }
  assert.equal(metalAt(T_METAL - 0.01), 0); near(metalAt(T_METAL + 1), 1);
});

test('the opening: the eight oranges drop in from frame 0 and land by T_DROP_END, as the camera orbits', () => {
  for (let i = 0; i < 8; i++) { assert.ok(dropY(i, 0) > 0); near(dropY(i, T_DROP_END), 0); }
  assert.ok(T_DROP_END <= T_SC);
  for (let f = 1; f <= 90; f++) {
    const t = f / 30, p = t - 1 / 30;
    const moved = [...Array(8).keys()].some(i => dropY(i, t) !== dropY(i, p)) || tween(t, CAMERA.start, CAMERA.keys)[1] !== tween(p, CAMERA.start, CAMERA.keys)[1];
    assert.ok(moved, `still at frame ${f}`);
  }
});

test('the opening orbit: from frame 0, exactly 360°, smooth, back at the front by 3 s, and no other orbit (F22)', () => {
  const az = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[1], front = az(3.0);
  near(Math.abs(az(0) - front) / DEG, 360, 1e-6);
  for (let i = 1; i < frames.length; i++) {
    const a = az(frames[i - 1]), b = az(frames[i]);
    assert.ok(b >= a - 1e-12 && b - a < 20 * DEG, `orbit jumps at ${frames[i]}`);
    if (frames[i] >= 3.0) near(b, front);
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

test('what the beat table keeps in frame stays inside the 3D band: the box with its oranges, then the pyramid', () => {
  for (const t of frames.filter(t => t >= 3.0 && t < END_AT)) {
    // The drawn edges of each corner orange: straight out along each axis, and out along its diagonal.
    const cam = cameraAt(t), rc = radiiAt(t).corner, k = rc / Math.sqrt(3);
    const keep: V3[] = t < T_PYR
      ? CORNERS.flatMap(([x, y, z]) => { const sx = Math.sign(x), sy = Math.sign(y), sz = Math.sign(z);
        return [[x + sx * rc, y, z], [x, y + sy * rc, z], [x, y, z + sz * rc], [x + sx * k, y + sy * k, z + sz * k]] as V3[]; })
      : PYRAMID.map(p => [p[0], p[1] + PYR_R, p[2]] as V3);
    for (const p of keep) {
      const s = project(p, cam);
      assert.ok(s.x > 30 && s.x < BAND.width - 30 && s.y > BAND.top + 20 && s.y < BAND.top + BAND.height - 20, `${p.map(v => v.toFixed(2))} off band at ${t.toFixed(2)}`);
    }
  }
});

test('the cover: the box filled in straight rows, the camera at the front, before the answer (F6)', () => {
  assert.ok(COVER_T < T_BCC0 && COVER_T > T_DROP_END);
  near(tween(COVER_T, CAMERA.start, CAMERA.keys)[1], tween(3.0, CAMERA.start, CAMERA.keys)[1]);
});

test('sound from the picture: a soft thud as each orange lands, whooshes on the fast zooms, nothing else', () => {
  const thuds = SOUND.hits.filter(h => h.kind === 'thunk');
  assert.equal(thuds.length, 8 + 14);
  const landings = [...[...Array(8).keys()].map(i => frames.find(t => dropY(i, t) === 0)!), ...[...Array(14).keys()].map(k => frames.find(t => t >= T_PYR && pyramidDrop(k, t) === 0)!)];
  for (const t of landings) assert.ok(thuds.some(h => Math.abs(h.t - t) <= 1 / 30 + 1e-9), `no thud at ${t}`);
  assert.equal(SOUND.hits.length, thuds.length + whooshesFor(CAMERA.start, CAMERA.keys).length);
  assert.equal(SOUND.beds.length, 0); assert.equal(SOUND.duration, DURATION);
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
