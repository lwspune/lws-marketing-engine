import test from 'node:test';
import assert from 'node:assert/strict';
import {
  V0, G, S, DEG, ANGLES, PAIR, LANE, range, flightTime, topHeight, flight, HEADER, OPTIONS, ANSWER, BRAND, TAU0, DURATION,
  LOOP_AT, T_FAN, SHOTS, landsAt, ANSWER_AT, T_45, ballsAt, trail, flagsAt, metres, T_CURVE, curveDrawn, graphDots, CAMERA,
  cameraAt, project, BAND, CHIPS_RESET, COVER_T, CAPTIONS, SECOND_HOOK, SHOWN, VOICE, MUSIC_HITS, SOUND, loopState, type V3,
} from '../src/lib/pp010.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';
import { WHITE } from '../src/lib/palette.ts';

// @pyqvault_ · Physics, visualised #10 ("Pick one"): 30° and 60° at the same speed land on the same spot (R = v² sin 2θ / g),
// and 45° goes farthest. Class 11 Physics · Motion in a Plane. Framework v1.15: F25 hook, F26 second hook, F27 loop, F20 tag.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;

test('projectile range, re-derived from the motion: the ball is back on the ground at T = 2v sin θ / g, at R = v² sin 2θ / g', () => {
  for (const deg of ANGLES) {
    const th = deg * DEG, T = flightTime(deg);
    near(V0 * Math.sin(th) * T - (G * T * T) / 2, 0, 1e-9);                 // y(T) = 0
    near(V0 * Math.cos(th) * T, range(deg), 1e-9);                          // x(T) = R
    near(range(deg), (V0 * V0 * 2 * Math.sin(th) * Math.cos(th)) / G, 1e-9);
    near(topHeight(deg), (V0 * Math.sin(th)) ** 2 / (2 * G), 1e-12);
    const [x, y] = flight(deg, T / 2);                                     // top of the arc, halfway along
    near(x, range(deg) / 2, 1e-9); near(y, topHeight(deg), 1e-9);
  }
});

test('the answer: 30° and 60° land on the same spot, 79.5 m; so do 15° and 75° (45.9 m); 45° goes farthest (91.8 m)', () => {
  near(range(30), range(60), 1e-9); near(range(15), range(75), 1e-9);
  assert.equal(metres(range(30)), '79.5 m'); assert.equal(metres(range(15)), '45.9 m'); assert.equal(metres(range(45)), '91.8 m');
  for (let d = 1; d < 90; d++) if (d !== 45) assert.ok(range(d) < range(45), `${d}° beats 45°`);
  assert.match(OPTIONS[ANSWER], /same/);
  assert.ok(flightTime(30) < flightTime(60), '30° lands first, 60° later: the race looks like 30° wins');
});

test('the race is running on frame 0 (F25, F5): both balls in the air, moving on every frame of the first 3 s', () => {
  const b0 = ballsAt(0);
  assert.deepEqual(b0.map(b => b.deg).sort(), [...PAIR].sort());
  for (const b of b0) { near(b.tau, TAU0); assert.ok(b.pos[1] > 0 && !b.landed); }
  for (let f = 1; f <= 90; f++) {
    const a = ballsAt((f - 1) / 30), b = ballsAt(f / 30);
    assert.ok(a.some((x, i) => x.pos[0] !== b[i].pos[0]), `nothing moves at frame ${f}`);
  }
});

test('each ball follows its arc, lands at its range and rests there; a trail runs from the launcher to the ball', () => {
  for (const t of frames) for (const b of ballsAt(t)) {
    const [x, y] = flight(b.deg, b.tau);
    near(b.pos[0], x * S); near(b.pos[1], y * S); near(b.pos[2], LANE[b.deg]);
    if (b.landed) { near(b.pos[0], range(b.deg) * S, 1e-9); near(b.pos[1], 0); }
    const tr = trail(b.deg, b.tau);
    near(tr[0][0], 0); near(tr[0][1], 0); near(tr.at(-1)![0], b.pos[0]); near(tr.at(-1)![1], b.pos[1]);
  }
});

test('the answer lands at ~5 s: the 60° ball comes down on the 30° flag; flags show the real ranges', () => {
  assert.ok(ANSWER_AT > 4 && ANSWER_AT < 6, `answer at ${ANSWER_AT}`);
  const at = flagsAt(ANSWER_AT + 0.4);
  assert.deepEqual(at.map(f => f.deg).sort(), [30, 60]);
  near(at[0].x, at[1].x, 1e-9);
  assert.ok(flagsAt(ANSWER_AT - 0.1).length === 1, 'only the 30° flag before the answer');
});

test('the second hook (F26): on screen as the answer lands, ≤ 7 words, and the five balls fire with it', () => {
  assert.equal(SECOND_HOOK.text, 'Then which angle goes farthest?');
  assert.ok(SECOND_HOOK.t0 - ANSWER_AT <= 1.5 && SECOND_HOOK.t0 >= ANSWER_AT, 'the second question comes at the answer');
  assert.ok(words(SECOND_HOOK.text) <= 7);
  near(T_FAN, SECOND_HOOK.t0);
  assert.deepEqual(SHOTS.filter(s => s.t0 === T_FAN).map(s => s.deg), [...ANGLES]);
  near(T_45, T_FAN + flightTime(45)); assert.ok(SECOND_HOOK.t1 <= T_45 + 1e-9, 'its answer follows when 45° lands');
  assert.ok(CAPTIONS.some(c => Math.abs(c.t0 - T_45) < 1e-9 && /45° goes farthest/.test(c.text)));
});

test('the graph: a dot for each angle once it lands, the sin 2θ curve after the twins have landed', () => {
  assert.equal(graphDots(T_FAN - 0.01).length, 2);
  assert.equal(graphDots(T_CURVE).length, 5);
  for (const d of graphDots(T_CURVE)) near(d.metres, range(d.deg));
  assert.ok(T_CURVE > landsAt(SHOTS.find(s => s.deg === 75 && s.t0 === T_FAN)!), 'the curve waits for the last twin');
  assert.equal(curveDrawn(T_CURVE - 0.01), 0);
});

test('the loop (F27): the last frame runs on into frame 0, the field clears, the chips reset, no end card', () => {
  const a = loopState(0), b = loopState(DURATION);
  assert.equal(a.balls.length, b.balls.length);
  a.balls.forEach((p, i) => p.forEach((v, k) => near(v, b.balls[i][k], 1e-9)));
  assert.deepEqual([a.flags, a.dots, a.curve, a.caption], [0, 0, 0, false]);
  assert.deepEqual([b.flags, b.dots, b.curve, b.caption], [0, 0, 0, false]);
  a.camera.forEach((v, k) => near(v, b.camera[k], 1e-9));
  // The camera is at rest at both ends, so the seam doesn't jolt.
  const z = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (const t of [1 / 30, DURATION - 1 / 30]) z(t).forEach((v, k) => near(v, z(t < 1 ? 0 : DURATION)[k], 2e-3));
  near(CHIPS_RESET, LOOP_AT); assert.ok(LOOP_AT < DURATION - TAU0 - 0.5, 'the field is clear before the pair fires again');
  for (const t of frames.filter(t => t >= LOOP_AT + 0.6 && t < DURATION - TAU0)) assert.equal(ballsAt(t).length, 0);
});

test('the camera: zooms in twice and out at least once, a punch-in landing on the answer, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.85 && b[0] <= 1.7 && Math.abs(b[0] - a[0]) < 0.1, `camera jumps at ${frames[i]}`);
  }
});

test('what the beat table says to keep in frame stays inside the 3D band (runbook step 2)', () => {
  const FLAG_H = 0.9;
  const punch = (t: number) => t >= ANSWER_AT - 0.35 && t < T_FAN + 0.7;
  for (const t of frames) {
    const cam = cameraAt(t), keep: V3[] = [];
    const balls = ballsAt(t).filter(b => b.alpha > 0.5);
    if (punch(t)) keep.push(...balls.filter(b => PAIR.includes(b.deg) && b.landed).map(b => b.pos));
    else {
      keep.push(...ANGLES.map(d => [0, 0, LANE[d]] as V3), ...balls.map(b => b.pos));
      keep.push(...flagsAt(t).map(f => [f.x, FLAG_H, f.z] as V3));
    }
    for (const p of keep) {
      const s = project(p, cam);
      assert.ok(s.x > 40 && s.x < BAND.width - 40 && s.y > BAND.top + 30 && s.y < BAND.top + BAND.height - 30,
        `${p.map(v => v.toFixed(2))} off band at ${t.toFixed(2)} (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`);
    }
  }
});

test('the cover: before the answer, the race on (30° down, 60° still up), no caption (F6)', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T > landsAt(SHOTS[0]));
  const b = ballsAt(COVER_T);
  assert.ok(b.find(x => x.deg === 30)!.landed && !b.find(x => x.deg === 60)!.landed);
});

test('sound from the picture: a pop for each volley on screen, a thunk at every landing, whooshes on fast zooms', () => {
  const at = (kind: string) => SOUND.hits.filter(h => h.kind === kind).map(h => h.t);
  assert.deepEqual(at('whump'), [T_FAN, DURATION - TAU0]);
  const landings = SHOTS.filter(s => s.until !== Infinity).map(landsAt).filter(t => t < DURATION).sort((a, b) => a - b);
  assert.deepEqual(at('thunk'), landings);
  assert.equal(SOUND.hits.filter(h => h.kind.startsWith('whoosh')).length, whooshesFor(CAMERA.start, CAMERA.keys).length);
  assert.equal(SOUND.duration, DURATION);
});

test('the voice reads only what is on screen, while it is on screen; the question from frame 0 (F4, F17)', () => {
  assert.ok(VOICE[0].t <= 0.2 && VOICE[0].text === HEADER.join(' '));
  for (const line of VOICE) assert.ok(onScreen(line, SHOWN), `"${line.text}" at ${line.t}`);
  for (let k = 1; k < VOICE.length; k++) assert.ok(VOICE[k].t >= VOICE[k - 1].until, 'lines overlap');
  assert.ok(VOICE.at(-1)!.until <= LOOP_AT);
});

test('short (≤ 25 s), labels ≤ 7 words, music hits on both answers', () => {
  assert.ok(DURATION <= 25);
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, `too long: "${c.text}"`);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_45]);
});

test('the tag (F20): "PYQ Vault · pyqvault.com", no www, in a colour with ≥ 4.5:1 contrast on the white board', () => {
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const lum = (hex: string) => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  assert.ok(ratio(WHITE.muted, WHITE.board) >= 4.5, `muted on board ${ratio(WHITE.muted, WHITE.board).toFixed(2)}:1`);
  assert.ok(ratio(WHITE.muted, WHITE.edge) >= 4.5, `muted on the board's edge ${ratio(WHITE.muted, WHITE.edge).toFixed(2)}:1`);
});
