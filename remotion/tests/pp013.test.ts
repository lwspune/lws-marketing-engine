import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, LOOP_AT, T_LEADER, STROKES, T_STRIKE, STROKES2, HEADER, OPTIONS, ANSWER, BRAND, T_TYRES, ANSWER_AT, T_SECOND,
  ANSWER2_AT, T_FIELD, T_SAFE, FLOW_END, CAR, ROOF_HIT, CABIN_HIT, CLOUD_Y, BOLT, BOLT2, leaderAt, boltGlow, flashAt, shakeAt,
  strokeLight, sparksAt, SKIN, chargeAt, arcsAt, shellDistance, insideCabin, roofOpen, DANGER, dangerAlpha, fieldLines, fieldAlpha, E_INSIDE,
  rainAt, RAIN_SPEED, BAND, CAMERA, cameraAt, project, CAPTIONS, SECOND_HOOK, MUSIC_HITS, SOUND, COVER_T, CHIPS_RESET, DUMMY_HEAD,
  loopState, type V3,
} from '../src/lib/pp013.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { LAB, VIVID, REAL, distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Physics, visualised #13 (You'd think + Shock): lightning hits a car; the metal body, not the rubber tyres,
// keeps you safe: the charge rides the outside of the metal shell to the road, and inside a closed conductor E = 0.
// Class 12 Physics · Electrostatics (conductors, Gauss's law). Framework v1.28: the Shock opening (F25), F26, F27, F20.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const strikes = [...STROKES, ...STROKES2];

test('the shock lands in the first second (F25 Shock): the leader is already coming down on frame 0, the strike at 0.2 s', () => {
  assert.ok(leaderAt(0) > 0.5 && leaderAt(0) < 0.8, `leader ${leaderAt(0)} drawn on frame 0`);
  // On frame 0 the leader's tip is already well inside the picture, not hidden above the band.
  const tip = BOLT[Math.ceil(BOLT.length * leaderAt(0)) - 1], tp = project(tip, cameraAt(0));
  assert.ok(tp.y > BAND.top + 0.25 * BAND.height, `leader tip at y ${tp.y.toFixed(0)}`);
  assert.equal(strokeLight(0), 0, 'no light on the roof before the strike');
  assert.equal(strokeLight(DURATION - 0.05), 0, 'nor on the last frames before the loop');
  assert.ok(strokeLight(T_STRIKE) > 0.9);
  assert.ok(leaderAt(T_STRIKE) >= 0.999 && T_STRIKE <= 0.25);
  // A real flash is a few return strokes down the same channel, tens of milliseconds apart.
  assert.equal(STROKES.length, 3);
  for (let k = 1; k < STROKES.length; k++) { const gap = STROKES[k] - STROKES[k - 1]; assert.ok(gap >= 0.04 && gap <= 0.1, `gap ${gap}`); }
  for (const s of STROKES) assert.ok(flashAt(s) > 0.45 && boltGlow(s) > 0.9, `no flash at ${s}`);
  assert.ok(flashAt(STROKES.at(-1)! + 0.05) < 0.2, 'the flash clears within 50 ms, so the bolt is seen');
  assert.equal(flashAt(T_STRIKE - 0.01), 0);
  assert.ok(Math.hypot(...shakeAt(T_STRIKE + 0.1)) > 0.03, 'the camera shakes on the strike');
  assert.ok(Math.hypot(...shakeAt(1.6)) < 0.004, 'the shake has died away by 1.6 s');
  assert.ok(sparksAt(T_STRIKE + 0.15).length >= 30, 'sparks burst off the roof');
  assert.equal(boltGlow(1.2), 0, 'the channel is gone by 1.2 s');
});

test('something changes on every frame of the first 3 s (F5): rain falls, the bolt draws, the charge flows', () => {
  for (let f = 1; f <= 90; f++) {
    const a = rainAt((f - 1) / 30), b = rainAt(f / 30);
    assert.ok(a.some((p, i) => p[1] !== b[i][1]), `nothing moves at frame ${f}`);
  }
  near(RAIN_SPEED, 9, 0.5);   // real raindrops fall at about 9 m/s
});

test('the bolt runs from the cloud to the roof; the second from the cloud into the open cabin', () => {
  near(BOLT[0][1], CLOUD_Y, 1e-9); BOLT.at(-1)!.forEach((v, k) => near(v, ROOF_HIT[k], 1e-9));
  near(BOLT2[0][1], CLOUD_Y, 1e-9); BOLT2.at(-1)!.forEach((v, k) => near(v, CABIN_HIT[k], 1e-9));
  for (let i = 1; i < BOLT.length; i++) assert.ok(BOLT[i][1] <= BOLT[i - 1][1] + 1e-9, 'the bolt only comes down');
  near(ROOF_HIT[1], CAR.cabin.y1, 1e-9);
  assert.ok(BOLT.length >= 12, 'jagged, not a straight line');
});

test('the physics: the charge rides the OUTSIDE of the metal shell, never through the cabin (conductor, Gauss)', () => {
  for (const path of SKIN) {
    path[0].forEach((v, k) => near(v, ROOF_HIT[k], 1e-9));
    for (const p of path) assert.ok(Math.abs(shellDistance(p)) < 1e-9, `${p} is not on the shell`);
  }
  for (const t of frames) for (const d of chargeAt(t)) {
    assert.ok(Math.abs(shellDistance(d.pos)) < 0.08, `charge off the shell at ${t}: ${d.pos.map(v => v.toFixed(2))}`);
    assert.ok(!insideCabin(d.pos), `charge inside the cabin at ${t}`);
  }
  assert.equal(chargeAt(T_STRIKE - 0.01).length, 0);
  assert.ok(chargeAt(2).length >= 24, 'the charge streams over the shell');
  assert.equal(chargeAt(FLOW_END + 0.7).length, 0);
  assert.equal(E_INSIDE, 0);
});

test('it reaches the road by jumping past the tyres: every arc runs from the wheel arch to the wet road outside the tyre', () => {
  const live = arcsAt(T_TYRES + 0.3);
  assert.equal(live.length, 4);
  for (const a of live) {
    near(a.from[1], CAR.wheel.y + CAR.wheel.r + CAR.wheel.gap, 1e-9);
    near(a.to[1], 0, 1e-9);
    assert.ok(Math.abs(a.to[2]) > Math.abs(CAR.wheel.z) + CAR.wheel.w / 2, 'the arc lands outside the tyre');
  }
  assert.ok(arcsAt(T_TYRES + 0.3)[0].alpha > arcsAt(2.4)[0].alpha, 'brighter while the tyres are shown');
  assert.equal(arcsAt(T_STRIKE).length, 0);
});

test('the answer: B metal body, at ~5.4 s, after the tyres are ruled out', () => {
  assert.match(OPTIONS[ANSWER], /metal body/);
  assert.ok(ANSWER_AT > T_TYRES + 1 && ANSWER_AT < 6.5);
  assert.ok(CAPTIONS.some(c => c.t0 === T_TYRES && /tyres/.test(c.text)), 'the tyres caption comes first');
});

test('the second hook (F26): "Is a convertible safe?" as the answer lands; the roof folds away and a second bolt hits the cabin', () => {
  assert.equal(SECOND_HOOK.text, 'Is a convertible safe?');
  assert.ok(SECOND_HOOK.t0 >= ANSWER_AT && SECOND_HOOK.t0 - ANSWER_AT <= 1.5);
  assert.ok(words(SECOND_HOOK.text) <= 7);
  near(SECOND_HOOK.t0, T_SECOND);
  assert.equal(roofOpen(T_SECOND - 0.01), 0); assert.equal(roofOpen(T_SECOND + 0.9), 1);
  assert.equal(chargeAt(T_SECOND).length, 0, 'the charge has gone before the roof moves (no dots left in mid-air)');
  assert.equal(arcsAt(T_SECOND).length, 0);
  assert.ok(STROKES2[0] > T_SECOND + 0.8 && STROKES2[0] < ANSWER2_AT);
  for (const s of STROKES2) assert.ok(flashAt(s) > 0.45);
  // No roof, no cage: now the current's path runs through the cabin.
  assert.ok(DANGER.some(p => insideCabin(p)), 'the convertible path goes through the cabin');
  assert.equal(dangerAlpha(STROKES2[0] - 0.01), 0); assert.ok(dangerAlpha(ANSWER2_AT) > 0.6);
  assert.ok(CAPTIONS.some(c => c.t0 === ANSWER2_AT && /no cage/i.test(c.text)));
});

test('the why (F29): field lines from the cloud end on the outside of the metal; none inside the cabin', () => {
  const lines = fieldLines();
  assert.ok(lines.length >= 12 && lines.length <= 16, `${lines.length} lines: enough to read, few enough to see the car`);
  let onCar = 0;
  for (const l of lines) {
    near(l[0][1], CLOUD_Y, 1e-9);
    for (const p of l) assert.ok(!insideCabin(p), 'a field line enters the cabin');
    const end = l.at(-1)!;
    if (end[1] > 0) { onCar++; assert.ok(Math.abs(shellDistance(end)) < 1e-9, 'a line stops in mid-air'); }
  }
  assert.ok(onCar >= 4, 'some lines end on the car');
  assert.equal(fieldAlpha(T_FIELD - 0.01), 0); assert.ok(fieldAlpha(T_FIELD + 1) > 0.9); assert.equal(fieldAlpha(LOOP_AT + 0.6), 0);
});

test('the loop (F27): the last frame runs on into frame 0; the roof is back, the car is clear, the chips reset', () => {
  const a = loopState(0), b = loopState(DURATION);
  assert.deepEqual(a, b);
  assert.deepEqual([a.charge, a.sparks, a.roof, a.field, a.danger, a.caption, a.flash], [0, 0, 0, 0, 0, false, 0]);
  near(CHIPS_RESET, LOOP_AT);
  assert.ok(DURATION + T_LEADER > LOOP_AT + 0.6, 'the car is clear before the next leader starts');
  for (const t of frames.filter(t => t >= LOOP_AT + 0.6)) {
    assert.equal(chargeAt(t).length, 0); assert.equal(sparksAt(t).length, 0); assert.equal(roofOpen(t), 0);
  }
  const z = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (const t of [1 / 30, DURATION - 1 / 30]) z(t).forEach((v, k) => near(v, z(t < 1 ? 0 : DURATION)[k], 2e-3));
});

test('the camera: zooms in at least twice and out once, a punch-in landing on the answer, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.85 && b[0] <= 1.8 && Math.abs(b[0] - a[0]) < 0.1, `camera jumps at ${frames[i]}`);
  }
});

test('what the beat table says to keep in frame stays inside the 3D band (runbook step 2)', () => {
  const { body, cabin, wheel } = CAR;
  const carPts: V3[] = [];
  for (const x of [body.x0, body.x1]) for (const z of [-body.zh, body.zh]) carPts.push([x, 0, z], [x, body.y1, z]);
  for (const x of [cabin.x0, cabin.x1]) carPts.push([x, cabin.y1, 0]);
  const frontWheel: V3[] = [[wheel.x, 0, wheel.z], [wheel.x, wheel.y + wheel.r + wheel.gap, wheel.z]];
  const cabinPts: V3[] = [DUMMY_HEAD, [cabin.x0, cabin.y1, 0], [cabin.x1, cabin.y1, 0], [0, body.y0, body.zh]];
  for (const t of frames) {
    const cam = cameraAt(t);
    const keep = t >= T_TYRES - 0.5 && t < ANSWER_AT - 0.35 ? frontWheel
      : t >= ANSWER_AT - 0.35 && t < T_SECOND + 0.4 ? cabinPts
        : t >= STROKES2[0] + 0.5 && t < T_FIELD - 0.4 ? cabinPts
          : [...carPts, ROOF_HIT];
    for (const p of keep) {
      const s = project(p, cam);
      assert.ok(s.x > 40 && s.x < BAND.width - 40 && s.y > BAND.top + 30 && s.y < BAND.top + BAND.height - 30,
        `${p.map(v => v.toFixed(2))} off band at ${t.toFixed(2)} (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`);
    }
  }
  // The strike is seen: the last metre of the bolt above the roof is inside the band at the strike.
  const top = BOLT.find(p => p[1] < ROOF_HIT[1] + 1.2)!, s = project(top, cameraAt(T_STRIKE));
  assert.ok(s.y > BAND.top && s.y < BAND.top + BAND.height);
});

test('the cover: the strike, before any answer (F6)', () => {
  assert.ok(COVER_T < 1 && COVER_T > T_STRIKE && boltGlow(COVER_T) > 0.4 && COVER_T < ANSWER_AT);
});

test('sound from the picture (F14): a crack per return stroke and thunder after each strike, the roof fold whooshes, rain under it', () => {
  const at = (kind: string) => SOUND.hits.filter(h => h.kind === kind).map(h => h.t);
  for (const s of strikes) assert.ok(at('crack').some(t => Math.abs(t - s) < 1e-9), `no crack at ${s}`);
  for (const s of [STROKES[0], STROKES2[0]]) assert.ok(at('boom').some(t => t > s && t - s < 0.2), `no thunder after ${s}`);
  assert.ok(at('whoosh-out').some(t => t >= T_SECOND && t <= T_SECOND + 0.8), 'no whoosh while the roof folds');
  assert.equal(SOUND.hits.filter(h => h.kind.startsWith('whoosh')).length, whooshesFor(CAMERA.start, CAMERA.keys).length);
  assert.ok(SOUND.beds.some(b => b.kind === 'roar' && b.t0 === 0 && b.t1 === DURATION), 'the rain runs the whole reel');
  assert.equal(SOUND.duration, DURATION);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, ANSWER2_AT]);
});

test('short (≤ 25 s), lines ≤ 7 words, the question from frame 0 with the tag (F4, F7, F18, F20)', () => {
  assert.ok(DURATION <= 25);
  for (const c of [...CAPTIONS, ...HEADER.map(text => ({ text }))]) assert.ok(words(c.text) <= 7, `too long: "${c.text}"`);
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(CAPTIONS[0].t0 >= 2.5, 'no caption competes with the question in the first seconds');
  for (let k = 1; k < CAPTIONS.length; k++) assert.ok(CAPTIONS[k].t0 >= CAPTIONS[k - 1].t1 - 1e-9, 'captions overlap');
  assert.ok(CAPTIONS.at(-1)!.t1 <= LOOP_AT && T_SAFE < LOOP_AT);
});

test('colours (F24): the steel body is real; the charge and the danger path are told apart, colour-blind safe; all read on the dark board', () => {
  assert.ok(distinguishable(VIVID.lab.cyan, VIVID.lab.red), 'charge vs danger');
  assert.ok(distinguishable(VIVID.lab.cyan, REAL.lab.steel.fill), 'charge vs the steel body');
  assert.ok(distinguishable(VIVID.lab.red, REAL.lab.steel.fill), 'danger vs the steel body');
  assert.ok(distinguishable(VIVID.lab.yellow, VIVID.lab.red), 'the dummy vs the danger path');
  assert.ok(LAB.board.startsWith('#'));
});
