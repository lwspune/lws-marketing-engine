import test from 'node:test';
import assert from 'node:assert/strict';
import {
  R, F, A, GLASS, EYE, EP, AIM, N0, LANE_Y, U0, U1, BIKE_REST, DURATION, LOOP_AT, ANSWER_AT, T_STOP, T_MORPH, T_SPLIT,
  T_BIKE, T_WARN, COVER_T, LABEL, HEADER, OPTIONS, ANSWER, BRAND, SECOND_Q, mirrorPoint, mirrorNormal, reflect, viewWedge,
  shrink, sizeVsFlat, carU, carPos, morph, split, apparent, ghostAt, realAt, bikeAt, inGlass, wedgesAlpha, warnAlpha,
  glassCamera, mirrorsAt, mainCameraAt, project, BAND, MAP, mapPx, CAMERA, CAPTIONS, SECOND_HOOK, SHOWN, VOICE, MUSIC_HITS,
  SOUND, loopState, COLOURS, type V2,
} from '../src/lib/pp009b.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';
import { distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Physics, visualised #9, rebuilt to the framework of 2026-10-22 (F25 "You'd think" + morph, F26 second hook
// with a split, F27 loop, F29 told by the picture). A wing mirror is a convex mirror: the car in it is smaller than a flat
// mirror would show it, so it looks farther than it is; the curved glass also shows the blind spot a flat one misses.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const deg = (r: number) => (r * 180) / Math.PI;
const ang = (p: V2) => Math.atan2(p[1], p[0]);
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];

test('the glass: a real wing mirror (R = 1.4 m, 18 cm wide), set so the eye looks back along the next lane', () => {
  near(F, R / 2); near(A, GLASS.w / 2);
  near(EP, Math.hypot(...EYE));
  // At the pole, the eye's ray reflects onto the aim: the law of reflection, angle in = angle out about N0.
  const i: V2 = [-EYE[0] / EP, -EYE[1] / EP], r = reflect(i, N0);
  near(ang(r), AIM, 1e-9);
  near(dot(i, N0), -dot(r, N0), 1e-12);
});

test('the bulge: a flat glass (k = 0) is a plane; the curved one (k = 1) is a sphere of radius R, normals from its centre', () => {
  for (const s of [-A, -A / 2, 0, A / 2, A]) {
    const flat = mirrorPoint(s, 0), cur = mirrorPoint(s, 1), C: V2 = [-R * N0[0], -R * N0[1]];
    near(dot(flat, N0), 0, 1e-12);
    near(Math.hypot(cur[0] - C[0], cur[1] - C[1]), R, 1e-12);
    const n = mirrorNormal(s, 1);
    near(n[0], (cur[0] - C[0]) / R, 1e-12); near(n[1], (cur[1] - C[1]) / R, 1e-12);
  }
});

test('the view off the glass, by the law of reflection: the curved glass sees far wider; its picture is about 0.4× (F10)', () => {
  const flat = viewWedge(0), cur = viewWedge(1);
  assert.ok(deg(2 * flat.half) > 8 && deg(2 * flat.half) < 12, `flat view ${deg(2 * flat.half).toFixed(1)}°`);
  assert.ok(deg(2 * cur.half) > 2 * deg(2 * flat.half), `curved view ${deg(2 * cur.half).toFixed(1)}°`);
  near(shrink(0), 1);
  const k = shrink(1);
  assert.ok(k > 0.35 && k < 0.45, `shrink ${k}`);
  // Each edge ray obeys angle in = angle out about the local normal.
  for (const s of [-A, A]) {
    const M = mirrorPoint(s, 1), n = mirrorNormal(s, 1), L = Math.hypot(M[0] - EYE[0], M[1] - EYE[1]);
    const i: V2 = [(M[0] - EYE[0]) / L, (M[1] - EYE[1]) / L], r = reflect(i, n);
    near(dot(i, n), -dot(r, n), 1e-12);
  }
  // The mirror formula agrees: 1/v + 1/u = 1/f with f = −F. Seen at an angle θ, the glass focuses as F cos θ in the
  // horizontal plane, and the driver sees the car this much smaller than a flat mirror shows it, within 10%.
  const theta = Math.acos(-dot([-EYE[0] / EP, -EYE[1] / EP], N0));
  for (const u of [U1, U0]) {
    const paraxial = sizeVsFlat(u, F * Math.cos(theta));
    assert.ok(Math.abs(paraxial - k) / k < 0.1, `u = ${u}: formula ${paraxial.toFixed(3)} vs view ${k.toFixed(3)}`);
    assert.ok(sizeVsFlat(u, F) < 1 && sizeVsFlat(u, Infinity) === 1);
  }
});

test('so it looks farther: where the car seems to be, judged by its size, is over twice as far; at the answer 12 m looks ~33 m', () => {
  near(apparent(U1, 0), U1, 1e-9);
  for (const u of [U1, 14, U0]) {
    const a = apparent(u, 1);
    near(EP + a, (EP + u) / shrink(1), 1e-9);           // same size ⇒ distance ∝ 1 / size
    assert.ok(a > 2 * u, `${u} m looks ${a.toFixed(1)} m`);
  }
  assert.equal(Math.round(realAt(ANSWER_AT + 1).metres), 12);
  const g = Math.round(ghostAt(ANSWER_AT + 1).metres);
  assert.ok(g >= 30 && g <= 34, `looks ${g} m`);
  assert.match(OPTIONS[ANSWER], /closer/);
});

test('frame 0 (F4, F20, F25): the question, its options and the tag, 12 words: down from the old reel\'s ~20', () => {
  assert.deepEqual(HEADER, ['Looks far. Really?']);
  assert.deepEqual(OPTIONS, ['A  closer', 'B  farther', 'C  same']);
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const options = OPTIONS.map(o => o.replace(/^[A-C]\s+/, '')).join(' ');
  assert.equal(words(LABEL) + words(HEADER.join(' ')) + words(options) + words(BRAND), 12);
});

test('the hook move (F25 morph, F5): from frame 0 the flat glass bulges, the car in it shrinks, something moves every frame', () => {
  near(morph(0), 0); near(morph(T_MORPH), 1);
  const size = (t: number) => shrink(morph(t)) / (EP + carU(t));       // the car's angular size in the glass, ∝
  assert.ok(size(T_MORPH) < 0.5 * size(0), 'the car shrinks by more than half as the glass bulges');
  for (let f = 1; f <= 90; f++) {
    const a = (f - 1) / 30, b = f / 30;
    assert.ok(morph(a) !== morph(b) || carU(a) !== carU(b), `nothing moves at frame ${f}`);
  }
  assert.equal(ghostAt(0).alpha, 0, 'no map marks until the glass has bulged');
});

test('the car comes from 16 m to 12 m in the next lane; the flat glass and the curved glass both show it', () => {
  near(carU(0), U0); near(carU(T_STOP), U1); near(carU(T_SPLIT + 3), U1);
  for (const t of frames) {
    const p = carPos(t);
    near(p[1], LANE_Y); near(Math.hypot(...p), carU(t), 1e-9);
    assert.ok(inGlass(p, 0) && inGlass(p, 1), `car out of the glass at ${t.toFixed(2)}`);
  }
});

test('the answer at 8.4 s (after 8 s, L48): the real car lands on the map, closer than where it seemed', () => {
  assert.ok(ANSWER_AT > 8 && ANSWER_AT < 9);
  assert.equal(realAt(ANSWER_AT - 0.05).alpha, 0);
  assert.ok(realAt(ANSWER_AT + 0.5).alpha > 0.99);
  const g = ghostAt(ANSWER_AT + 0.5), r = realAt(ANSWER_AT + 0.5);
  assert.ok(g.alpha > 0.99 && g.metres > 2 * r.metres);
  // Same lane, as the driver reads it: only the distance is wrong.
  near(g.pos[1], LANE_Y, 1e-9); near(Math.hypot(...g.pos), g.metres, 1e-9);
});

test('the second hook (F26): ≤ 7 words as the answer settles; the mirror splits; the bike shows only in the curved glass', () => {
  assert.equal(SECOND_Q, 'So why curve it at all?');
  assert.equal(SECOND_HOOK.text, SECOND_Q);
  assert.ok(words(SECOND_Q) <= 7);
  assert.ok(SECOND_HOOK.t0 >= ANSWER_AT && SECOND_HOOK.t0 - ANSWER_AT <= 1.5);
  near(T_SPLIT, SECOND_HOOK.t0);
  near(split(T_SPLIT - 0.01), 0); near(split(T_SPLIT + 0.6), 1);
  const rest = bikeAt(T_BIKE + 2).pos;
  near(rest[0], BIKE_REST[0], 1e-9); near(rest[1], BIKE_REST[1], 1e-9);
  assert.ok(!inGlass(rest, 0) && inGlass(rest, 1), 'blind spot: not in the flat glass, in the curved one');
  // The map's wedges (law of reflection) agree: the bike is inside the curved glass's view, outside the flat one's.
  const inWedge = (p: V2, k: number) => { const w = viewWedge(k), a = ang(p); return a > w.lo && a < w.hi; };
  assert.ok(!inWedge(rest, 0) && inWedge(rest, 1));
  // On its way in, the flat glass loses it: seen far back, gone once it's beside us.
  assert.ok(inGlass(bikeAt(T_BIKE + 0.1).pos, 0), 'the flat glass sees it far back');
  assert.ok(CAPTIONS.some(c => c.t0 > T_SPLIT && /blind spot/.test(c.text)));
  assert.ok(wedgesAlpha(T_SPLIT - 0.01) === 0 && wedgesAlpha(T_SPLIT + 1) > 0.99);
});

test('the mirrors: one glass bulges, then splits into flat (left) and curved (right); inside the band, side by side', () => {
  const one = mirrorsAt(1), two = mirrorsAt(T_SPLIT + 1);
  assert.equal(one.filter(m => m.alpha > 0).length, 1);
  assert.deepEqual(two.map(m => m.k), [0, 1]);
  assert.ok(two[0].x + two[0].w < two[1].x, 'flat on the left, curved on the right, apart');
  for (const t of frames) for (const m of mirrorsAt(t).filter(m => m.alpha > 0.01)) {
    assert.ok(m.x > 30 && m.x + m.w < BAND.width - 30 && m.y > BAND.top + 20 && m.y + m.h < BAND.top + BAND.height - 20,
      `glass off the band at ${t.toFixed(2)}`);
    near(m.w / m.h, GLASS.w / GLASS.h, 0.02);
  }
});

test('the glass view camera sits at the eye\'s mirror image, aimed down the lane, its width the glass\'s view', () => {
  for (const k of [0, 0.5, 1]) {
    const c = glassCamera(k), w = viewWedge(k);
    const vf = (c.fov * Math.PI) / 180, hHalf = Math.atan(Math.tan(vf / 2) * c.aspect);
    near(hHalf, w.half, 1e-9);
    near(c.aspect, GLASS.w / GLASS.h);
    const d: V2 = [c.target[2] - c.position[2], c.target[0] - c.position[0]];
    near(ang(d), w.mid, 1e-9);
  }
  const c = glassCamera(0), E2: V2 = [c.position[2], c.position[0]];
  near(Math.hypot(...E2), EP, 1e-9);                       // the eye's mirror image is as far behind the glass
});

test('the map: every car, the bike and their labels inside the card; numbers live (metres) count as picture', () => {
  for (const t of frames) {
    const marks = [ghostAt(t), realAt(t)].filter(m => m.alpha > 0).map(m => m.pos);
    const b = bikeAt(t); if (b.alpha > 0) marks.push(b.pos);
    for (const p of marks) {
      const q = mapPx(p);
      assert.ok(q.x > MAP.left - 1 && q.x < MAP.right + 1 && q.y > MAP.top + 40 && q.y < MAP.bottom - 20,
        `${p.map(v => v.toFixed(1))} off the map at ${t.toFixed(2)}`);
    }
  }
});

test('colours (F24): real road and sky; the pairs the viewer must tell apart are colour-blind safe', () => {
  for (const [a, b] of [['ownCar', 'car'], ['car', 'bike'], ['ownCar', 'bike'], ['curved', 'flat']] as const)
    assert.ok(distinguishable(COLOURS[a], COLOURS[b]), `${a} vs ${b}`);
});

test('the loop (F27): the last frame is frame 0: one flat glass, the car back at 16 m, the map clear, the camera at rest', () => {
  const a = loopState(0), b = loopState(DURATION);
  assert.deepEqual(a, b);
  const z = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  z(DURATION - 1 / 30).forEach((v, k) => near(v, z(DURATION)[k], 2e-3));
  assert.ok(LOOP_AT < DURATION - 1.5);
  assert.equal(CAPTIONS.at(-1)!.t1 <= LOOP_AT, true);
});

test('the warning printed on real wing mirrors comes after the answer, in lines of ≤ 7 words', () => {
  assert.ok(T_WARN > T_SPLIT && warnAlpha(T_WARN - 0.01) === 0 && warnAlpha(T_WARN + 0.6) > 0.99);
});

test('the main camera: a slow push, a quick zoom out for the split, back to rest for the loop; no jumps', () => {
  for (let i = 1; i < frames.length; i++) {
    const a = mainCameraAt(frames[i - 1]), b = mainCameraAt(frames[i]);
    assert.ok(Math.hypot(b.position[0] - a.position[0], b.position[2] - a.position[2]) < 0.05, `jump at ${frames[i]}`);
  }
  const p = project([0, 0, 0], mainCameraAt(0));
  near(p.x, BAND.width / 2, 1); near(p.y, BAND.top + BAND.height / 2, 1);
});

test('the cover: after the bulge, before the answer, no real car on the map (F6)', () => {
  assert.ok(COVER_T > T_MORPH && COVER_T < ANSWER_AT && realAt(COVER_T).alpha === 0);
});

test('sound from the picture: a shimmer as the glass bulges, a thunk as the real car lands, a snap at the split', () => {
  const at = (kind: string) => SOUND.hits.filter(h => h.kind === kind).map(h => h.t);
  assert.deepEqual(at('shimmer'), [0]);
  assert.deepEqual(at('thunk'), [ANSWER_AT]);
  assert.deepEqual(at('snap'), [T_SPLIT]);
  assert.equal(SOUND.hits.filter(h => h.kind.startsWith('whoosh')).length, whooshesFor(CAMERA.start, CAMERA.keys).length);
  assert.equal(SOUND.duration, DURATION);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SPLIT]);
});

test('the voice reads only what is on screen, while it is (F23, F17); captions ≤ 7 words (F7); ≤ 25 s (F18)', () => {
  assert.ok(VOICE[0].t <= 0.2 && VOICE[0].text === HEADER.join(' '));
  for (const line of VOICE) assert.ok(onScreen(line, SHOWN), `"${line.text}" at ${line.t}`);
  for (let k = 1; k < VOICE.length; k++) assert.ok(VOICE[k].t >= VOICE[k - 1].until, 'lines overlap');
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, `too long: "${c.text}"`);
  assert.ok(DURATION <= 25);
});
