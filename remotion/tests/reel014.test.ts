import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DURATION, ANSWER_AT, END_AT, BAND, CAPTIONS, thetaAt, coneFraction, arrowGrow, tip, cameraAt, project, labels, working,
} from '../src/lib/reel014.ts';

// Reel 014, NDA 2026 (II) Q68: r = (cos θ) î + (sin θ) ĵ + k̂ makes π/4 with the z-axis for every θ.
const PI = Math.PI;
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const times = (step = 1 / 30) => Array.from({ length: Math.round(END_AT / step) }, (_, i) => i * step);

test('tip: |r| = √2 and the angle with the z-axis is π/4 for every θ (the answer, re-derived)', () => {
  for (const th of [0, 0.7, 2, PI, 5.5]) {
    const [x, y, z] = tip(th), len = Math.hypot(x, y, z);
    near(len, Math.SQRT2); near(Math.acos(z / len), PI / 4);
  }
});

test('arrow grows in from 3.2 s; θ holds at 0 until the sweep starts at 7.2 s', () => {
  assert.equal(arrowGrow(3.1), 0); assert.equal(arrowGrow(4.5), 1);
  assert.equal(thetaAt(0), 0); assert.equal(thetaAt(7.2), 0);
});

test('the first sweep paints the whole cone by 12 s, then θ keeps turning from 17 s', () => {
  assert.equal(coneFraction(7.2), 0);
  assert.ok(coneFraction(9.6) > 0.3 && coneFraction(9.6) < 0.7);
  assert.equal(coneFraction(12.0), 1);
  near(thetaAt(14), thetaAt(16.9));           // frozen while the triangle is explained
  near(thetaAt(21.4) - thetaAt(16.9), 2 * PI + PI / 3); // one more full turn (and 60°) under the counter
});

test('θ never jumps: at most 0.25 rad between frames', () => {
  const ts = times();
  for (let i = 1; i < ts.length; i++) assert.ok(Math.abs(thetaAt(ts[i]) - thetaAt(ts[i - 1])) < 0.25, `jump at ${ts[i]}`);
});

test('while the triangle is explained, answered and trapped (12–17 s, 21.8–28.5 s) it faces the camera', () => {
  const ts = [...times(0.1).filter(t => (t >= 12.2 && t <= 17) || t >= 21.8)];
  for (const t of ts) {
    const [px, py] = cameraAt(t).position, th = thetaAt(t);
    // The triangle's plane holds the z-axis and the direction θ; it faces the camera when they are ~90° apart.
    const apart = Math.abs(Math.sin(Math.atan2(py, px) - th));
    assert.ok(apart > 0.85, `edge-on at ${t.toFixed(1)} s (|sin| = ${apart.toFixed(2)})`);
  }
});

test('camera circles at a steady pace from frame 0 (something always moving)', () => {
  const a = cameraAt(0).position, b = cameraAt(1).position, c = cameraAt(20).position;
  assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.05, 'moving at 0 s');
  near(Math.hypot(a[0], a[1]), Math.hypot(c[0], c[1]), 1e-9); // same distance from the z-axis
  near(a[2], c[2]);                                              // same height
});

test('project: the target lands in the middle of the 3D band', () => {
  const p = project(cameraAt(5).target, cameraAt(5));
  near(p.x, BAND.width / 2, 1e-6); near(p.y, BAND.top + BAND.height / 2, 1e-6);
});

test('every visible 3D label stays inside the band, clear of its edges, on every frame', () => {
  for (const t of times()) for (const l of labels(t)) {
    if (l.alpha <= 0) continue;
    const p = project(l.at, cameraAt(t));
    assert.ok(p.x > 60 && p.x < BAND.width - 120, `${l.id} x=${p.x.toFixed(0)} at ${t.toFixed(2)} s`);
    assert.ok(p.y > BAND.top + 30 && p.y < BAND.top + BAND.height - 30, `${l.id} y=${p.y.toFixed(0)} at ${t.toFixed(2)} s`);
  }
});

test('the whole figure (axes ends, circle at height 1) stays inside the band', () => {
  const pts: [number, number, number][] = [[0, 0, 0], [0, 0, 1.45], [1.35, 0, 0], [0, 1.35, 0], [-1, 0, 1], [0, -1, 1], [1, 0, 1], [0, 1, 1]];
  for (const t of times(0.25)) for (const q of pts) {
    const p = project(q, cameraAt(t));
    assert.ok(p.x > 20 && p.x < BAND.width - 20 && p.y > BAND.top + 10 && p.y < BAND.top + BAND.height - 10, `${q} → ${p.x.toFixed(0)},${p.y.toFixed(0)} at ${t}`);
  }
});

test('working line: |r| first, then cos γ, then the live θ counter, then the trap', () => {
  assert.equal(working(11).kind, 'none');
  assert.equal(working(13).kind, 'length');
  assert.equal(working(15.5).kind, 'cos');
  const c = working(19);
  assert.equal(c.kind, 'counter'); assert.ok(c.deg! >= 0 && c.deg! < 360);
  assert.equal(working(26).kind, 'trap');
});

test('timeline: answer at 21.8 s, captions run without gaps up to the end card', () => {
  assert.equal(ANSWER_AT, 21.8); assert.equal(DURATION, 31.5);
  assert.equal(CAPTIONS[0].t0, 0); assert.equal(CAPTIONS.at(-1)!.t1, END_AT);
  for (let i = 1; i < CAPTIONS.length; i++) assert.equal(CAPTIONS[i].t0, CAPTIONS[i - 1].t1);
});

test('music spec matches the timeline (length and chime on the answer)', () => {
  const spec = JSON.parse(readFileSync(new URL('../music/nda-maths-014-cone.json', import.meta.url), 'utf8'));
  assert.equal(spec.duration, DURATION); assert.equal(spec.music.chime, ANSWER_AT);
});
