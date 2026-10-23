import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, T_GO, ANSWER_AT, T_REWIND, T_SECOND, T_PAUSE, T_RESUME, COVER_T, LABEL, HEADER, OPTIONS, ANSWER, BRAND, SECOND_Q,
  LIFT, G, WORK, heightAt, work, powerAt, paused, arrivals, BAND, CAMERA, cameraAt, anchors, CAPTIONS, SECOND_HOOK, END_LINES,
  MUSIC_HITS, SOUND, COLOURS, workTicks,
} from '../src/lib/pp012.ts';
import { project } from '../src/lib/inductionScene.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Physics, visualised #12 (P6, "Same lift, faster = more power"; remake of @sciencevisualised 1.33M): two
// lifts raise identical boxes the same height, one twice as fast. More work? The same: W = mgh. What speed changes is
// power, the work per second. Hook queue row 3: You'd think · Orbit 360°. The second L62 test (the joule counts).
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const DEG = Math.PI / 180;

test('frame 0 (F4, F20, F25 You\'d think): the question, three options, the tag; the answer is "the same"', () => {
  assert.equal(LABEL, 'PHYSICS, VISUALISED  #12');
  assert.deepEqual(HEADER, ['Same box, same height.', 'Faster lift, more work?']);
  assert.deepEqual(OPTIONS, ['A  more', 'B  the same', 'C  less']);
  assert.equal(OPTIONS[ANSWER], 'B  the same');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const options = OPTIONS.map(o => o.replace(/^[A-C]\s+/, '')).join(' ');
  assert.equal(words(LABEL) + words(HEADER.join(' ')) + words(options) + words(BRAND), 18);
});

test('F10: W = mgh = 50 × 9.8 × 3 = 1,470 J for both lifts; power = W ÷ t: 490 W in 3 s, 245 W in 6 s', () => {
  assert.equal(G, 9.8);
  near(WORK, 50 * 9.8 * 3);
  near(WORK, 1470);
  near(LIFT.fast.speed * 3, 3); near(LIFT.slow.speed * 6, 3);
  near(50 * 9.8 * LIFT.fast.speed, 490); near(50 * 9.8 * LIFT.slow.speed, 245);
  for (const t of frames) for (const k of ['fast', 'slow'] as const) near(work(k, t), 50 * 9.8 * heightAt(k, t));
});

test('the race: both start together; the fast lift arrives at 3.4 s, the slow at 6.4 s; both counts end on 1,470 J', () => {
  assert.equal(heightAt('fast', 0), 0); assert.ok(heightAt('fast', 1 / 30) === 0 && T_GO > 0);
  near(arrivals.fast[0], T_GO + 3); near(arrivals.slow[0], T_GO + 6);
  near(heightAt('fast', 5), 3); assert.ok(heightAt('slow', 5) < 3);
  near(work('fast', ANSWER_AT), 1470); near(work('slow', ANSWER_AT), 1470);
  assert.ok(ANSWER_AT > arrivals.slow[0], 'the answer once both have arrived');
});

test('L62: the counts are the answer and run again after it: rewound, then counting up in the replay', () => {
  assert.ok(T_REWIND > ANSWER_AT && T_SECOND > T_REWIND);
  near(heightAt('fast', T_SECOND), 0); near(heightAt('slow', T_SECOND), 0);
  near(work('fast', END_AT - 0.01), 1470);
  assert.ok(work('slow', T_RESUME + 2) > work('slow', T_RESUME), 'still counting well after the answer');
  for (const k of ['fast', 'slow'] as const) for (const t of workTicks(k)) assert.ok(t > T_GO && !paused(t));
});

test('the second hook (F26): "So what did speed change?" 1 s after the answer; the replay pauses mid-climb (⏸) on the power meters', () => {
  assert.equal(SECOND_Q, 'So what did speed change?');
  assert.equal(SECOND_HOOK.text, SECOND_Q);
  assert.ok(words(SECOND_Q) <= 7 && SECOND_HOOK.t0 === T_SECOND && T_SECOND - ANSWER_AT <= 1.5);
  assert.ok(T_PAUSE > T_SECOND && T_RESUME > T_PAUSE);
  const h = heightAt('fast', T_PAUSE + 0.5);
  assert.ok(h > 0.3 && h < 3, 'mid-climb');
  for (const t of frames.filter(t => t > T_PAUSE && t < T_RESUME)) {
    near(heightAt('fast', t), heightAt('fast', T_PAUSE)); near(heightAt('slow', t), heightAt('slow', T_PAUSE));
    near(powerAt('fast', t), 490); near(powerAt('slow', t), 245);       // the paused picture keeps its reading
  }
  const punch = CAMERA.keys.find(k => k.t === T_PAUSE)!;
  assert.ok(punch && punch.dur <= 0.9 && punch.to[0] > 1.5, 'a fast punch-in on the meters');
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && near2(h.t, T_PAUSE)), 'a thunk as they freeze');
});
const near2 = (a: number, b: number) => Math.abs(a - b) < 1e-6;

test('power: 490 W and 245 W while climbing, 0 once at the top or being reset', () => {
  near(powerAt('fast', T_GO + 1), 490); near(powerAt('slow', T_GO + 1), 245);
  near(powerAt('fast', 5), 0); near(powerAt('slow', ANSWER_AT), 0);
});

test('the opening orbit (F22): from frame 0, exactly 360°, smooth, back at the front by 3 s, no other orbit', () => {
  const az = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[3];
  near(Math.abs(az(0) - az(3.0)) / DEG, 360);
  near(az(3.0), 0);
  assert.ok(az(1 / 30) !== az(0));
  for (let i = 1; i < frames.length; i++) {
    const a = az(frames[i - 1]), b = az(frames[i]);
    assert.ok(b >= a - 1e-12 && b - a < 20 * DEG, `orbit jumps at ${frames[i]}`);
    if (frames[i] >= 3.0) near(b, 0);
  }
});

test('F5: something moves on every frame of the first 3 s (the orbit, and the lifts from T_GO)', () => {
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, heightAt('fast', t), heightAt('slow', t)]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
});

test('camera (F9): a punch-in landing on the slow lift\'s arrival before the answer; smooth zooms; ≥ 2 in, ≥ 1 out', () => {
  const punch = CAMERA.keys.find(k => k.t > 5 && k.t < ANSWER_AT)!;
  assert.ok(punch.dur <= 0.9 && punch.t + punch.dur <= ANSWER_AT && punch.to[0] > 1.3);
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1);
  const at = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (let i = 1; i < frames.length; i++) {
    const a = at(frames[i - 1]), b = at(frames[i]);
    assert.ok(Math.abs(Math.log(b[0] / a[0])) < 0.15 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 0.15, `jump at ${frames[i]}`);
  }
});

test('everything named stays inside the 3D band on every frame', () => {
  for (const t of frames.filter(t => t <= END_AT)) {
    const cam = cameraAt(t);
    for (const a of anchors(t)) {
      const q = project(a.p, cam, BAND);
      assert.ok(q.x > 40 && q.x < BAND.width - 40 && q.y > BAND.top + 15 && q.y < BAND.top + BAND.height - 15, `${a.name} off the band at ${t.toFixed(2)}: ${q.x.toFixed(0)}, ${q.y.toFixed(0)}`);
    }
  }
});

test('words (F7) and length (F18)', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT && DURATION <= 25);
  assert.ok(words(END_LINES[0]) <= 7);
});

test('sound (F14–F16): silent orbit, a thunk at each arrival and at the freeze, a tap per tenth of the work, whooshes on fast zooms, music hits on both hooks', () => {
  assert.ok(!SOUND.hits.some(h => h.t < 3.0 && h.kind !== 'tap'), 'nothing but the counts in the orbit');
  const thunks = SOUND.hits.filter(h => h.kind === 'thunk').map(h => h.t).sort((a, b) => a - b);
  assert.deepEqual(thunks, [...arrivals.fast, ...arrivals.slow, T_PAUSE].sort((a, b) => a - b));
  assert.equal(SOUND.hits.filter(h => h.kind === 'tap').length, workTicks('fast').length + workTicks('slow').length);
  assert.equal(workTicks('fast').length, 20);                     // 10 per climb, two climbs
  assert.deepEqual(SOUND.hits.filter(h => h.kind.startsWith('whoosh')), whooshesFor(CAMERA.start, CAMERA.keys));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SECOND]);
});

test('colours (F24): the fast and slow lifts told apart, colour-blind safe', () => {
  assert.ok(distinguishable(COLOURS.fast, COLOURS.slow));
});

test('F6: the cover is taken before the answer and before either lift has arrived', () => {
  assert.ok(COVER_T < arrivals.fast[0] && COVER_T < ANSWER_AT);
});
