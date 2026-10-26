import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COLORS, R, N_RINGS, RING_W, DEPTH,
  unroll, sAt, ringOutline, liftAt, UNROLL, ROLLBACK, SWEEP, litCount, readoutAt, FORMULA, INTEGRAL_AT, TRAP, HEIGHT,
  cameraAt, project, BAND, ORBIT_END, azimuthAt, ZOOM, labelsAt, labelBox, FORMULA_BOX, SOUND, ppu,
} from '../src/lib/reel027.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 027 (3D, predict-first): unroll each ring of a circle and stack them: what shape? A triangle (B), base
// 2πr (the rim), height r (the bottom radius, which never moves), area ½ × 2πr × r = πr². Caption: NDA 2019 (I) Q76,
// f(r) = perimeter ÷ area = 2/r, f(1) + f(2) = 3 (c). Storyboard: reels/nda-maths-027-circle-area.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const SS = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1];
const PHIS = Array.from({ length: 721 }, (_, i) => -Math.PI + (2 * Math.PI * i) / 720);
const polyLength = (pts: [number, number][]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const shoelace = (pts: [number, number][]) => Math.abs(pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

test('the map: the circle at s = 0; at s = 1 a point (ρ, φ) lands at (ρφ, −ρ): the exact triangle, base 2πR, height R', () => {
  for (const rho of [0.3, 1, R]) for (const phi of [-3, -1, 0, 0.5, 2.9]) {
    const [x0, y0] = unroll(rho, phi, 0);
    assert.ok(close(x0, rho * Math.sin(phi), 1e-12) && close(y0, -rho * Math.cos(phi), 1e-12));
    const [x1, y1] = unroll(rho, phi, 1);
    assert.ok(close(x1, rho * phi, 1e-12) && close(y1, -rho, 1e-12));
    const [xn, yn] = unroll(rho, phi, 1 - 1e-7);                       // continuous into s = 1
    assert.ok(close(xn, x1, 1e-5) && close(yn, y1, 1e-5));
  }
  const [bl] = unroll(R, -Math.PI, 1), [br] = unroll(R, Math.PI, 1);
  assert.ok(close(br - bl, 2 * Math.PI * R, 1e-12), 'base 2πR');
  assert.deepEqual(unroll(0, 1, 1).map(v => Math.abs(v)), [0, 0]);     // apex at the centre: height R
});

test('every ring keeps its length 2πρ at every s; the bottom radius never moves', () => {
  for (const s of SS) for (const rho of [RING_W, 0.8, R]) {
    const len = polyLength(PHIS.map(p => unroll(rho, p, s)));
    assert.ok(Math.abs(len / (2 * Math.PI * rho) - 1) < 0.005, `s ${s}, ρ ${rho}: ${len}`);
  }
  for (const s of SS) for (const rho of [0, 0.7, R]) {
    const [x, y] = unroll(rho, 0, s);
    assert.ok(close(x, 0, 1e-12) && close(y, -rho, 1e-12), `bottom radius moved at s ${s}`);
  }
});

test('no two rings ever cross: each is a scaled copy about the centre, and every ray from the centre meets it once', () => {
  for (const s of SS) {
    for (const phi of [-2.5, 0.3, 3]) {
      const u = unroll(1, phi, s), v = unroll(1.37, phi, s);
      assert.ok(close(v[0], 1.37 * u[0], 1e-12) && close(v[1], 1.37 * u[1], 1e-12));
    }
    // the angle seen from the centre turns one way along the curve, so a ray meets it at most once
    let prev = -Infinity;
    for (const phi of PHIS.slice(1, -1)) {
      const [x, y] = unroll(1, phi, s), ang = Math.atan2(x, -y);
      assert.ok(ang > prev - 1e-12, `s ${s}: turns back at φ ${phi.toFixed(3)}`);
      prev = ang;
    }
  }
});

test('areas: the unrolled disc is πR², half the 2πR × R rectangle; each ring is a trapezoid of its own area', () => {
  let total = 0;
  for (let k = 0; k < N_RINGS; k++) {
    const a = shoelace(ringOutline(k, 1, 360)), r0 = k * RING_W, r1 = (k + 1) * RING_W;
    assert.ok(close(a, Math.PI * (r1 ** 2 - r0 ** 2), 1e-9), `ring ${k}`);
    assert.ok(close(a, 0.5 * (2 * Math.PI * r0 + 2 * Math.PI * r1) * (r1 - r0), 1e-9));
    total += a;
  }
  assert.ok(close(total, Math.PI * R * R, 1e-9));
  assert.ok(close(total, 0.5 * (2 * Math.PI * R) * R, 1e-9), 'half the rectangle');
  assert.ok(close(N_RINGS * RING_W, R, 1e-12) && N_RINGS === 10);
});

test('the formula line and the caption PYQ, re-derived: ½ × 2πr × r = πr² = ∫₀ʳ 2πx dx; NDA 2019 (I) Q76 = 3', () => {
  const r = R, n = 100000;
  let integral = 0; for (let i = 0; i < n; i++) integral += 2 * Math.PI * ((i + 0.5) * r / n) * (r / n);
  assert.ok(close(0.5 * 2 * Math.PI * r * r, Math.PI * r * r, 1e-12) && close(integral, Math.PI * r * r, 1e-6));
  const f = (x: number) => (2 * Math.PI * x) / (Math.PI * x * x);
  assert.ok(close(f(1) + f(2), 3, 1e-12));
  assert.match(OPTIONS[ANSWER], /^B\s+triangle$/);
});

test('timeline: still disc, then the unroll (eased), held, then the roll-back to the disc before the end card', () => {
  assert.equal(sAt(0), 0); assert.equal(sAt(UNROLL.t), 0); assert.equal(sAt(UNROLL.t + UNROLL.dur), 1);
  assert.ok(UNROLL.t + UNROLL.dur <= ANSWER_AT + 1e-9, 'triangle complete when B lights');
  for (const t of frames.filter(t => t >= ANSWER_AT && t <= ROLLBACK.t)) assert.equal(sAt(t), 1);
  assert.equal(sAt(ROLLBACK.t + ROLLBACK.dur), 0); assert.ok(ROLLBACK.t + ROLLBACK.dur <= END_AT);
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(sAt(frames[i]) - sAt(frames[i - 1])) < 0.06, `s jumps at ${frames[i]}`);
});

test('frame 0 moves and the cover gives nothing away: the closed disc, a ring already lifting, no labels', () => {
  assert.ok(liftAt(0, 0) > 0.05, 'the first ring is lifting on frame 0');
  assert.ok(COVER_T > 0.3 && COVER_T < ORBIT_END && sAt(COVER_T) === 0);
  assert.ok(labelsAt(COVER_T).every(l => l.alpha < 0.05));
  // something changes on every frame of the first 3 s (F5): the orbit and the ripple
  for (let i = 1; i < 90; i++) assert.ok(azimuthAt(frames[i]) !== azimuthAt(frames[i - 1]) || liftAt(0, frames[i]) !== liftAt(0, frames[i - 1]));
});

test('the live sum: rings light from the apex; the readout counts π(0.1r)² … π(0.9r)² → πr², matching the strips\' area', () => {
  assert.equal(litCount(SWEEP.t - 0.01), 0); assert.equal(litCount(SWEEP.t + SWEEP.dur), N_RINGS);
  assert.equal(readoutAt(SWEEP.t - 0.01), null);
  for (let n = 1; n < N_RINGS; n++) {
    const t = SWEEP.t + (n - 0.5) * (SWEEP.dur / N_RINGS);
    assert.equal(litCount(t), n);
    assert.equal(readoutAt(t), `area so far = π(0.${n}r)²`);
    let a = 0; for (let k = 0; k < n; k++) a += shoelace(ringOutline(k, 1, 360));
    assert.ok(close(a, Math.PI * (n * RING_W) ** 2, 1e-9));
  }
  assert.equal(readoutAt(SWEEP.t + SWEEP.dur + 0.01), 'area = πr²');
  assert.ok(INTEGRAL_AT >= SWEEP.t + SWEEP.dur - 1e-9 && INTEGRAL_AT < ROLLBACK.t);
  assert.ok(FORMULA.result > FORMULA.strike && FORMULA.strike > FORMULA.terms.at(-1)! && FORMULA.terms[0] >= HEIGHT.t + 1.9);
});

test('camera: one full orbit from frame 0, front-on by 3 s, tilted; smooth; ≥ 2 zooms in and ≥ 1 out; a punch-in on the answer', () => {
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9 && ORBIT_END <= 3);
  for (const t of frames.filter(t => t >= ORBIT_END)) assert.ok(Math.abs(azimuthAt(t) - 2 * Math.PI) < 1e-9);
  assert.ok(cameraAt(0.5).position[1] - cameraAt(0.5).target[1] > cameraAt(4).position[1] - cameraAt(4).target[1]);
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]), b = cameraAt(frames[i]);
    assert.ok(Math.hypot(...a.position.map((v, k) => v - b.position[k])) < 3, `camera jumps at ${frames[i]}`);
  }
  const ins = ZOOM.keys.filter((k, i) => k.to[0] > (i ? ZOOM.keys[i - 1].to[0] : ZOOM.start[0])), outs = ZOOM.keys.length - ins.length;
  assert.ok(ins.length >= 2 && outs >= 1);
  const punch = ZOOM.keys.find(k => Math.abs(k.t + k.dur - ANSWER_AT) < 1e-9);
  assert.ok(punch && punch.dur <= 0.9 && punch.to[0] > 1, 'punch-in lands on the answer');
  assert.ok(close(ppu(1), 86, 1), `${ppu(1)} px a unit at ×1`);
  assert.ok(close(2 * Math.PI * R * ppu(1), 860, 10), 'base ≈ 860 px at ×1');
});

/** Every point of the shape's outline (both faces) on screen at t. */
function shapeOnScreen(t: number) {
  const cam = cameraAt(t), s = sAt(t), pts: { x: number; y: number }[] = [];
  for (const k of [N_RINGS - 1]) for (const [x, y] of ringOutline(k, s, 120)) for (const z of [-DEPTH / 2, DEPTH / 2 + liftAt(k, t)]) pts.push(project([x, y, z], cam));
  return pts;
}
test('framing: the whole shape inside the band with ≥ 20 px to spare on every frame from 3 s, except the height push-in', () => {
  for (const t of frames.filter(t => t >= ORBIT_END && t < END_AT && !(t > HEIGHT.t && t < HEIGHT.t + HEIGHT.dur + 0.6))) {
    for (const p of shapeOnScreen(t))
      assert.ok(p.x >= 20 && p.x <= 1060 && p.y >= BAND.top + 20 && p.y <= BAND.top + BAND.height - 20, `out at ${t.toFixed(2)}: ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`);
    if (t >= TRAP.t && t < TRAP.out + 0.4) for (const [x, y] of [[-Math.PI * R, -R], [Math.PI * R, 0]] as [number, number][]) {
      const p = project([x, y, DEPTH / 2], cameraAt(t));
      assert.ok(p.x >= 20 && p.x <= 1060 && p.y >= BAND.top + 20, `trap rectangle out at ${t.toFixed(2)}`);
    }
  }
  // the orbit keeps the disc in the band too
  for (const t of frames.filter(t => t < ORBIT_END)) for (const p of shapeOnScreen(t)) assert.ok(p.y >= BAND.top && p.y <= BAND.top + BAND.height && p.x > 0 && p.x < 1080);
  // the height push-in keeps the pink radius whole
  for (const t of frames.filter(t => t > HEIGHT.t && t < HEIGHT.t + HEIGHT.dur)) for (const y of [0, -R]) {
    const p = project([0, y, DEPTH / 2], cameraAt(t));
    assert.ok(p.y >= BAND.top + 20 && p.y <= BAND.top + BAND.height - 20 && p.x > 20 && p.x < 1060);
  }
  // nothing of the shape reaches the formula line while it shows
  for (const t of frames.filter(t => t >= FORMULA.terms[0] && t < END_AT)) {
    const low = Math.max(...shapeOnScreen(t).map(p => p.y));
    assert.ok(low < FORMULA_BOX.y0 - 8, `shape on the formula at ${t.toFixed(2)}: ${low.toFixed(0)}`);
  }
});

test('labels: inside the band and no two overlap on every frame; hidden in the orbit and the roll-back', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const cam = cameraAt(t), ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(l => labelBox(l, cam));
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 10 && b.x1 <= 1070 && b.y0 >= BAND.top && b.y1 <= BAND.top + BAND.height, `"${ls[i].text}" out at ${t.toFixed(2)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
  for (const t of [1, 2.5, ROLLBACK.t + 0.6, ROLLBACK.t + 1.5]) assert.ok(labelsAt(t).every(l => l.role === 'formula' || l.alpha < 0.05), `labels at ${t}`);
  assert.ok(labelsAt(3.8).some(l => l.text === 'r' && l.alpha > 0.9));
  assert.ok(labelsAt(HEIGHT.t + 1).some(l => l.text === 'r' && l.alpha > 0.9));
  assert.ok(labelsAt(10).some(l => l.text === '2πr' && l.alpha > 0.9));
});

test('colours: rings cyan / blue, rim orange, radius red: VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[], cs = [COLORS.ringA, COLORS.ringB, COLORS.rim, COLORS.radius];
  for (const c of cs) assert.ok(v.includes(c));
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) assert.ok(distinguishable(cs[i], cs[j]), `${cs[i]} vs ${cs[j]}`);
});

test('sound: a tap per ring in the ripple, a snap on the cut, a thunk on the answer, a tick per ring in the sweep, whooshes on fast zooms', () => {
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap' && h.t < ORBIT_END).length >= 15);
  assert.ok(SOUND.hits.some(h => h.kind === 'snap' && h.t > 3.5 && h.t <= 4.4));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && Math.abs(h.t - FORMULA.result) < 1e-9));
  assert.equal(SOUND.hits.filter(h => h.kind === 'click' && h.t >= SWEEP.t && h.t < SWEEP.t + SWEEP.dur).length, N_RINGS);
  const ws = whooshesFor(ZOOM.start, ZOOM.keys); assert.ok(ws.length >= 3);
  for (const w of ws) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  assert.ok(!ws.some(w => w.t >= ROLLBACK.t), 'the slow roll-back has no whoosh');
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('short (≤ 25 s), captions ≤ 7 words, ≤ 36 characters, in order; music hits on the answer and on πr²', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
    assert.ok([...c.text].length <= 36, `too wide: "${c.text}"`);
  }
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, FORMULA.result]);
  assert.ok(tween(ANSWER_AT, ZOOM.start, ZOOM.keys)[0] > 1);
});
