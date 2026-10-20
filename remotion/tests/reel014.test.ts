import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ANSWER_AT, END_AT, BAND, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, thetaAt, coneFraction, tip, angleWithZ, cameraAt,
  azimuthAt, ORBIT_END, project, labels, triangleAlpha, CAMERA, SOUND, CLICKS,
} from '../src/lib/reel014.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · reel 014 remade (predict-first): r = (cos θ, sin θ, 1), θ keeps turning: its angle with the z-axis?
// |r| = √2 and its z-part is 1, so cos γ = 1/√2: γ = 45° for every θ; the arrow sweeps a cone.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;

test('the answer, re-derived: |r| = √2 and the angle with the z-axis is 45° on every frame', () => {
  for (const t of frames) {
    const r = tip(thetaAt(t));
    near(Math.hypot(...r), Math.SQRT2, 1e-12);
    near(Math.acos(r[2] / Math.hypot(...r)) / DEG, 45, 1e-9);
    near(angleWithZ(t), 45, 1e-9);
  }
  assert.match(OPTIONS[ANSWER], /45°/);
  for (const o of OPTIONS) assert.ok(o.length <= 10, `chip too long: "${o}"`);
});

test('θ turns on every frame, never jumps, and the first turn paints the whole cone early', () => {
  for (let i = 1; i < frames.length; i++) {
    const d = thetaAt(frames[i]) - thetaAt(frames[i - 1]);
    assert.ok(d > 0 && d < 0.25, `θ step ${d.toFixed(3)} at ${frames[i].toFixed(2)}`);
  }
  near(coneFraction(2.5), 1);
  assert.ok(coneFraction(1) > 0.2 && coneFraction(1) < 0.8);
});

test('one orbit shot in the opening: 60–120°, smooth, back at the explaining view before the triangle (F22)', () => {
  const arc = Math.abs(azimuthAt(0) - azimuthAt(ORBIT_END)) / DEG;
  assert.ok(arc >= 60 && arc <= 120, `orbit ${arc.toFixed(0)}°`);
  assert.ok(ORBIT_END <= frames.find(t => triangleAlpha(t) > 0)! && ORBIT_END < ANSWER_AT);
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(azimuthAt(frames[i]) - azimuthAt(frames[i - 1])) < 3 * DEG, 'the camera jumps');
});

test('while the triangle is shown, explained and answered, it is side-on to the camera (never edge-on)', () => {
  for (const t of frames.filter(t => t >= 2.6 && t <= 12.5)) {
    let d = ((thetaAt(t) - azimuthAt(t)) / DEG) % 360; if (d < 0) d += 360;
    assert.ok((d >= 55 && d <= 125) || (d >= 235 && d <= 305), `the triangle is ${d.toFixed(0)}° from the camera at ${t.toFixed(2)} s`);
  }
});

test('every visible label and the whole figure stay inside the 3D band on every frame', () => {
  for (const t of frames.filter((_, i) => i % 3 === 0)) {
    for (const l of labels(t).filter(l => l.alpha > 0)) {
      const p = project(l.at, cameraAt(t));
      assert.ok(p.x > 60 && p.x < BAND.width - 80 && p.y > BAND.top + 30 && p.y < BAND.top + BAND.height - 30, `${l.id} at ${t.toFixed(2)} s`);
    }
    for (const q of [[1.4, 0, 0], [0, 1.4, 0], [0, 0, 1.5], [1, 0, 1], [0, 1, 1], [-1, 0, 1], [0, -1, 1]] as [number, number, number][]) {
      const p = project(q, cameraAt(t));
      assert.ok(p.x > 10 && p.x < BAND.width - 10 && p.y > BAND.top + 10 && p.y < BAND.top + BAND.height - 10, `${q} at ${t.toFixed(2)} s`);
    }
  }
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(b[0] - a[0]) < 0.1, `zoom jumps at ${frames[i].toFixed(2)}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.2 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound from the picture: a click each time θ passes a 30° mark, a thunk on the answer, whooshes on fast zooms', () => {
  for (const c of CLICKS) { const d = thetaAt(c.t) / DEG; assert.ok(Math.abs(d / 30 - Math.round(d / 30)) < 0.05, `click at ${d.toFixed(2)}°`); }
  for (let s = 0; s < END_AT; s++) assert.ok(CLICKS.filter(c => c.t >= s && c.t < s + 1).length <= 6, `too many clicks in second ${s}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  near(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
