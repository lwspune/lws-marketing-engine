import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, T_HIT, SLOW, SPINS, BALL, COURT, V0, ANGLE, K_DRAG, K_LIFT,
  flightAt, landing, liftAccel, spinAngleAt, CAMERA, SOUND, flowMode,
} from '../src/lib/pp006.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Physics, visualised #6 (predict-first): the same tennis shot hit three ways: no spin, topspin, backspin.
// Model: gravity + quadratic drag + Magnus lift ½ρC_L A v² at right angles to the velocity, real tennis-ball numbers.
// Topspin's Magnus force points down, so it dips into the court; backspin's points up, so it floats long.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

// An independent check: plain Euler with a tiny step, written out here from the same physics.
function euler(spin: number) {
  let x = 0, y = BALL.h0, vx = V0 * Math.cos(ANGLE), vy = V0 * Math.sin(ANGLE), t = 0, netY = NaN;
  const dt = 2e-5;
  while (y > BALL.r) {
    const s = Math.hypot(vx, vy), ax = -K_DRAG * s * vx + spin * K_LIFT * s * vy, ay = -9.81 - K_DRAG * s * vy - spin * K_LIFT * s * vx;
    const px = x; x += vx * dt; y += vy * dt; vx += ax * dt; vy += ay * dt; t += dt;
    if (px < COURT.net && x >= COURT.net) netY = y;
  }
  return { x, t, netY };
}

test('the constants are a real tennis ball: 57 g, 6.6 cm, ρ = 1.2, C_D 0.55, C_L 0.25; 26 m/s at 14°', () => {
  const A = Math.PI * BALL.r ** 2;
  near(BALL.r, 0.033); near(K_DRAG, (1.2 * 0.55 * A) / (2 * 0.057)); near(K_LIFT, (1.2 * 0.25 * A) / (2 * 0.057));
  near(V0, 26); near(ANGLE, (14 * Math.PI) / 180);
  near(COURT.length, 23.77); near(COURT.net, 23.77 / 2); near(COURT.netH, 0.914);
});

test('the answer, re-derived: topspin dips (lands first and shortest, inside); no spin and backspin go out', () => {
  for (const spin of SPINS) {
    const e = euler(spin.s), l = landing(spin.key);
    near(l.x, e.x, 0.02); near(l.t, e.t, 0.002);
  }
  const top = landing('top'), none = landing('none'), back = landing('back');
  assert.ok(top.x < none.x && none.x < back.x && top.t < none.t && none.t < back.t);
  assert.ok(top.x < COURT.length && none.x > COURT.length && back.x > COURT.length, `${top.x} ${none.x} ${back.x}`);
  assert.ok(euler(1).netY > COURT.netH + BALL.r, 'topspin clears the net');
  assert.match(OPTIONS[ANSWER], /dip/);
  near(ANSWER_AT, T_HIT + top.t / SLOW + 0.45, 1e-9);
});

test('Magnus lift: at right angles to the velocity, ∝ v², down for topspin, up for backspin, none without spin', () => {
  for (const t of [0, 0.3, 0.6]) {
    for (const spin of SPINS) {
      const [vx, vy] = flightAt(spin.key, t).v, [ax, ay] = liftAccel(spin.key, t), s = Math.hypot(vx, vy);
      near(ax * vx + ay * vy, 0, 1e-9);
      near(Math.hypot(ax, ay), Math.abs(spin.s) * K_LIFT * s * s, 1e-9);
    }
    assert.ok(liftAccel('top', t)[1] < 0 && liftAccel('back', t)[1] > 0);
    near(Math.hypot(...liftAccel('none', t)), 0);
  }
});

test('slow motion: the balls wait on the machine, then fly at ×0.4 and stop where they land', () => {
  near(SLOW, 0.4);
  for (const spin of SPINS) {
    const l = landing(spin.key);
    assert.deepEqual(flightAt(spin.key, 0).p, [0, BALL.h0]);
    const end = flightAt(spin.key, 30).p;
    near(end[0], l.x, 1e-9); near(end[1], BALL.r, 1e-9);
    for (let k = 1; k < frames.length; k++) {                 // screen time → flight time, smooth: < 1.3 m per frame
      const a = flightAt(spin.key, Math.max(0, (frames[k - 1] - T_HIT) * SLOW)).p, b = flightAt(spin.key, Math.max(0, (frames[k] - T_HIT) * SLOW)).p;
      assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1]) < 1.3, `${spin.key} jumps at ${frames[k]}`);
    }
  }
});

test('something moves on every frame of the first 3 s: the balls spin on the machine from frame 0', () => {
  for (let f = 1; f <= 90; f++) for (const spin of SPINS.filter(s => s.s !== 0))
    assert.ok(spinAngleAt(spin.key, f / 30) !== spinAngleAt(spin.key, (f - 1) / 30), `${spin.key} still at frame ${f}`);
  assert.ok(spinAngleAt('top', 1) < spinAngleAt('top', 0), 'topspin turns forward (clockwise as seen, ball flying right)');
  assert.ok(spinAngleAt('back', 1) > spinAngleAt('back', 0));
  near(spinAngleAt('none', 2), spinAngleAt('none', 0));
});

test('the air picture: topspin first, then backspin, then gone before the end card', () => {
  assert.equal(flowMode(2), null);
  assert.equal(flowMode(8), 'top');
  assert.equal(flowMode(14), 'back');
  assert.equal(flowMode(END_AT), null);
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.85 && b[0] <= 2.2 && Math.abs(b[0] - a[0]) < 0.1 && Math.abs(b[1] - a[1]) < 1.2, `camera jumps at ${frames[i]}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.4 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound from the picture: the machine fires once, a bounce as each ball lands, whooshes on fast zooms', () => {
  const fire = SOUND.hits.filter(h => h.kind === 'whump');
  assert.equal(fire.length, 1); near(fire[0].t, T_HIT);
  const bounces = SOUND.hits.filter(h => h.kind === 'thunk');
  assert.equal(bounces.length, 3);
  for (const spin of SPINS) assert.ok(bounces.some(h => Math.abs(h.t - (T_HIT + landing(spin.key).t / SLOW)) < 1e-9), `${spin.key} lands silently`);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  assert.equal(SOUND.beds.length, 0);
  assert.equal(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
  assert.ok(T_HIT + landing('back').t / SLOW < CAPTIONS[2].t0, 'every ball has landed before the explaining starts');
});
