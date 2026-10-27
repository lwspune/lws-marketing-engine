import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, ORBIT_END, CAPTIONS, SHOWN, VOICE, MUSIC_HITS, OPTIONS, ANSWER, OPTION_LINES, COLORS,
  PULSES, STRETCH, SWEEP_START, CUTS, TOP, THETA0, LANE, figure, thetaAt, kAt, segmentsAt, readoutsAt, formulaAt, FORMULAS,
  cameraAt, project, azimuthAt, glassAlphaAt, ZOOM, BAND, ppu, labelsAt, labelBox, SOUND, type Segment,
} from '../src/lib/reel028.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { onScreen } from '../src/lib/voice.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 028 (3D, predict-first): on a circle of radius 1, which line is tan θ? B, the piece of the line that
// touches the circle at (1, 0): stretch the sin–cos triangle until its base is 1 and its height is sin θ ÷ cos θ. The
// slant that cuts the circle is sec θ; the same at the top gives cot θ and cosec θ. Caption: NDA 2024 (II) Q79,
// lim θ→π/2 (sec θ − tan θ) = 0 (B). Storyboard: reels/nda-maths-028-trig-lines.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const rad = (d: number) => (d * Math.PI) / 180;
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const seg = (t: number, id: string) => segmentsAt(t).find(s => s.id === id)!;
const len = (s: Segment) => dist(s.a, s.b);

test('the figure: P on the circle, T on x = 1, C on y = 1, O-P-T-C on one ray; the six lengths are the six ratios', () => {
  for (const d of [28, 40, 45, 62]) {
    const f = figure(d), th = rad(d);
    assert.ok(close(Math.hypot(...f.P), 1, 1e-12));
    assert.ok(close(f.T[0], 1, 1e-12) && close(f.C[1], 1, 1e-12));
    for (const q of [f.P, f.T, f.C]) assert.ok(close(Math.atan2(q[1], q[0]), th, 1e-12), 'on θ\'s ray');
    assert.ok(close(dist(f.P, f.M), Math.sin(th), 1e-12));
    assert.ok(close(dist([0, 0], f.M), Math.cos(th), 1e-12));
    assert.ok(close(dist(f.A, f.T), Math.tan(th), 1e-12));
    assert.ok(close(dist([0, 0], f.T), 1 / Math.cos(th), 1e-12));
    assert.ok(close(dist(f.B, f.C), 1 / Math.tan(th), 1e-12));
    assert.ok(close(dist([0, 0], f.C), 1 / Math.sin(th), 1e-12));
    // the identities, from the right angles at A and at B
    assert.ok(close(1 + Math.tan(th) ** 2, (1 / Math.cos(th)) ** 2, 1e-12) && close(1 + (1 / Math.tan(th)) ** 2, (1 / Math.sin(th)) ** 2, 1e-12));
  }
});

test('the stretch: scale 1 → 1/cos θ about O takes M to A and P to T, so the height becomes tan θ; B is the answer', () => {
  const f = figure(THETA0), k = 1 / Math.cos(rad(THETA0));
  assert.equal(kAt(STRETCH.t), 1);
  assert.ok(close(kAt(STRETCH.t + STRETCH.dur), k, 1e-12));
  assert.ok(close(f.M[0] * k, 1, 1e-12) && close(f.P[1] * k, f.T[1], 1e-12));
  assert.ok(STRETCH.t + STRETCH.dur <= ANSWER_AT);
  const h = seg(STRETCH.t + STRETCH.dur + 0.01, 'height');
  assert.ok(close(h.a[0], 1, 1e-9) && close(h.b[1], f.T[1], 1e-9), 'the grown height sits on A → T');
  assert.equal(OPTIONS.length, 3); assert.equal(OPTION_LINES[ANSWER], 'tan');
  assert.deepEqual([...OPTION_LINES], ['sin', 'tan', 'sec']);
});

test('frame 0 has everything to answer: the circle, θ, the three candidate lines tagged A, B, C, the touching line', () => {
  const ids = segmentsAt(0).filter(s => s.alpha > 0.5).map(s => s.id);
  for (const id of ['radius', 'height', 'tan', 'sec']) assert.ok(ids.includes(id), id);
  // the touching line has no cause on screen yet: it appears at its own beat (review panel, pass 1)
  assert.ok(segmentsAt(0).every(s => s.id !== 'touchRight' || s.alpha < 0.01));
  const tags = labelsAt(0).filter(l => l.role === 'tag' && l.alpha > 0.9).map(l => l.text);
  assert.deepEqual(tags.sort(), ['A', 'B', 'C']);
  assert.ok(labelsAt(0).some(l => l.text === 'θ' && l.alpha > 0.9));
  // something changes on every frame of the first 3 s (F5): the orbit
  for (let i = 1; i < 90; i++) assert.ok(azimuthAt(frames[i]) !== azimuthAt(frames[i - 1]));
  assert.ok(PULSES.length === 3 && PULSES.every(p => p < ORBIT_END));
  // each candidate pulses while the figure faces the camera, its tag up (never edge-on or from behind)
  for (const p of PULSES) for (const dt of [0, 0.3]) assert.ok(labelsAt(p + dt).filter(l => l.role === 'tag').every(l => l.alpha > 0.9), `tags at ${p + dt}`);
  // the back of the turn is a whip: from 50° to 310° in under 0.7 s
  const side = frames.filter(t => t < ORBIT_END && Math.cos(azimuthAt(t)) < Math.cos(50 * Math.PI / 180));
  assert.ok(side.length && side.at(-1)! - side[0] < 0.7, `side-on for ${side.at(-1)! - side[0]} s`);
  // the glass fades while it faces away: no grey plate in the whip (review panel, pass 2)
  for (const t of frames.filter(t => t < ORBIT_END)) if (Math.cos(azimuthAt(t)) < 0) assert.ok(glassAlphaAt(t) < 0.01, `glass at ${t.toFixed(2)}`);
  assert.ok(glassAlphaAt(0) > 0.25 && glassAlphaAt(ORBIT_END) > 0.25);
  // moving from frame 0: the orbit already turning
  assert.ok(azimuthAt(1 / 30) > 0.4 * Math.PI / 180);
});

test('the cover gives nothing away: front view, the tags up, B not lit, no name, no formula', () => {
  assert.ok(COVER_T > ORBIT_END && COVER_T < ANSWER_AT && COVER_T >= CAPTIONS[0].t1);
  const ls = labelsAt(COVER_T).filter(l => l.alpha > 0.05);
  assert.ok(ls.filter(l => l.role === 'tag').length === 3);
  assert.ok(!ls.some(l => /tan|sec|sin|cos|cot/.test(l.text)), ls.map(l => l.text).join());
  assert.equal(formulaAt(COVER_T), null);
});

test('the names arrive in order, each line lit at its beat; sec and cosec in their own lanes, never one rod', () => {
  const lit = (id: string, t: number) => (segmentsAt(t).find(s => s.id === id)?.alpha ?? 0) > 0.9;
  assert.ok(!lit('tan', ANSWER_AT - 1) && lit('tan', ANSWER_AT + 0.6));
  assert.ok(!lit('sec', 11) && lit('sec', 12.2));
  assert.ok(!lit('cot', 15) && lit('cot', 16));
  assert.ok(!lit('cosec', 16) && lit('cosec', 17));
  assert.ok(lit('sin', 8.5) && lit('cos', 10));
  for (const t of [12, 17, 19.5, 21.7]) {
    const s = seg(t, 'sec'), c = seg(t, 'cosec'), th = rad(thetaAt(t));
    const side = (p: number[]) => p[0] * Math.sin(th) - p[1] * Math.cos(th);           // > 0: the clockwise side
    assert.ok(close(side(s.a), LANE, 1e-9) && close(side(s.b), LANE, 1e-9), 'sec on the clockwise lane');
    assert.ok(close(side(c.a), -LANE, 1e-9) && close(side(c.b), -LANE, 1e-9), 'cosec on the other lane');
    assert.ok(close(len(s), 1 / Math.cos(th), 1e-9) && close(len(c), 1 / Math.sin(th), 1e-9));
  }
});

test('the sweep: θ 40° → 62° → 28° → 40°, smooth; all six lengths follow θ on every frame', () => {
  assert.equal(thetaAt(0), THETA0); assert.equal(thetaAt(SWEEP_START - 0.01), THETA0);
  const ths = frames.map(thetaAt);
  assert.ok(close(Math.max(...ths), 62, 1e-6) && close(Math.min(...ths), 28, 1e-6));
  assert.ok(close(thetaAt(END_AT), THETA0, 1e-9));
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(ths[i] - ths[i - 1]) < 1.2, `θ jumps at ${frames[i]}`);
  for (const t of frames.filter(t => t >= SWEEP_START && t < END_AT)) {
    const th = rad(thetaAt(t));
    assert.ok(close(len(seg(t, 'sin')), Math.sin(th), 1e-9) && close(len(seg(t, 'cos')), Math.cos(th), 1e-9));
    assert.ok(close(len(seg(t, 'tan')), Math.tan(th), 1e-9) && close(len(seg(t, 'cot')), 1 / Math.tan(th), 1e-9));
  }
});

test('live numbers: readouts are the true values to 2 dp; the pill shows 1/cos θ; the formula line in order', () => {
  const r = readoutsAt(SWEEP_START + 0.5)!;
  assert.ok(r);
  const want = (d: number) => { const th = rad(d); return [Math.sin(th), Math.cos(th), Math.tan(th), 1 / Math.cos(th), 1 / Math.tan(th), 1 / Math.sin(th)]; };
  for (const t of [SWEEP_START + 0.5, 19.3, 20.2, 21.5, 23]) {
    const v = want(thetaAt(t)), got = readoutsAt(t)!;
    got.forEach((g, i) => assert.equal(g.value, v[i].toFixed(2), `${g.name} at ${t}`));
  }
  assert.deepEqual(readoutsAt(SWEEP_START + 1)!.map(g => g.name), ['sin', 'cos', 'tan', 'sec', 'cot', 'cosec']);
  assert.equal(readoutsAt(SWEEP_START - 0.5), null);
  assert.equal((1 / Math.cos(rad(40))).toFixed(2), '1.31');
  assert.ok(labelsAt(STRETCH.t + STRETCH.dur).some(l => l.text === '× 1/cos θ = 1.31'));
  assert.deepEqual(FORMULAS.map(f => f.text), ['tan θ = sin θ ÷ cos θ', '1 + tan²θ = sec²θ', '1 + cot²θ = cosec²θ']);
  assert.ok(FORMULAS[0].t > ANSWER_AT && FORMULAS[2].t < SWEEP_START);
  assert.equal(formulaAt(SWEEP_START + 1), null);
  // the caption PYQ, NDA 2024 (II) Q79: lim θ→π/2 (sec θ − tan θ) = 0 (B)
  for (const e of [1e-3, 1e-5]) { const th = Math.PI / 2 - e; assert.ok(Math.abs(1 / Math.cos(th) - Math.tan(th)) < 2 * e); }
  assert.ok(close(1 / Math.cos(rad(40)) - Math.tan(rad(40)), 0.47, 0.005) && close(1 / Math.cos(rad(62)) - Math.tan(rad(62)), 0.25, 0.005));
});

test('camera: one full orbit from frame 0, front by 3 s; smooth; zooms in and out; a punch-in landing on the answer', () => {
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9 && ORBIT_END <= 3);
  for (const t of frames.filter(t => t >= ORBIT_END)) assert.ok(Math.abs(azimuthAt(t) - 2 * Math.PI) < 1e-9);
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]), b = cameraAt(frames[i]);
    // the orbit's whip round the back is fast on purpose (≤ 18° a frame); after it, no step over 1.5 units
    assert.ok(Math.hypot(...a.position.map((v, k) => v - b.position[k])) < (frames[i] <= ORBIT_END ? 1.9 : 1.5), `camera jumps at ${frames[i]}`);
  }
  let z = ZOOM.start[0], ins = 0, outs = 0;
  for (const k of ZOOM.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 2);
  for (let i = 1; i < ZOOM.keys.length; i++) assert.ok(ZOOM.keys[i].t >= ZOOM.keys[i - 1].t + ZOOM.keys[i - 1].dur - 1e-9, 'keys overlap');
  const punch = ZOOM.keys.find(k => Math.abs(k.t + k.dur - ANSWER_AT) < 1e-9);
  assert.ok(punch && punch.dur <= 0.9);
  assert.ok(close(ppu(1), 297, 3), `${ppu(1)} px a unit at ×1`);
});

/** The figure's furthest points on screen at t: the circle, the lines, the touching lines. */
function figureOnScreen(t: number) {
  const cam = cameraAt(t), pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 72; i++) pts.push(project([Math.cos(i * Math.PI / 36), Math.sin(i * Math.PI / 36), 0], cam));
  for (const s of segmentsAt(t).filter(s => s.alpha > 0.05)) pts.push(project([...s.a, 0] as [number, number, number], cam), project([...s.b, 0] as [number, number, number], cam));
  return pts;
}
const PUNCH = { from: ANSWER_AT - 0.35, to: 9.4 };
test('framing: the whole figure inside the band (≥ 20 px spare) on every frame after the orbit, but the punch-in, which keeps tan θ whole; clear of the formula line', () => {
  for (const t of frames.filter(t => t > PUNCH.from && t < PUNCH.to)) {
    const s = seg(t, 'tan'), cam = cameraAt(t);
    for (const q of [s.a, s.b, [0, 0], [Math.cos(rad(THETA0)), 0]]) {
      const p = project([q[0], q[1], 0], cam);
      assert.ok(p.x >= 20 && p.x <= 1060 && p.y >= BAND.top + 20 && p.y <= BAND.top + BAND.height - 20, `punch crops the key lines at ${t.toFixed(2)}`);
    }
  }
  for (const t of frames.filter(t => t >= ORBIT_END && t < END_AT && !(t > PUNCH.from && t < PUNCH.to)))
    for (const p of figureOnScreen(t))
      assert.ok(p.x >= 20 && p.x <= 1060 && p.y >= BAND.top + 20 && p.y <= BAND.top + BAND.height - 20, `out at ${t.toFixed(2)}: ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`);
  for (const t of frames.filter(t => t < ORBIT_END)) for (const p of figureOnScreen(t)) assert.ok(p.y >= BAND.top && p.y <= BAND.top + BAND.height && p.x > 0 && p.x < 1080);
  for (const t of frames.filter(t => formulaAt(t))) {
    const top = Math.min(...figureOnScreen(t).map(p => p.y)), f = labelsAt(t).find(l => l.role === 'formula')!, b = labelBox(f, cameraAt(t));
    assert.ok(top > b.y1 + 8, `figure under the formula at ${t.toFixed(2)}: ${top.toFixed(0)}`);
  }
});

test('labels: inside the band and no two overlap on every frame; sin and cos labels hidden in the sweep', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const cam = cameraAt(t), ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(l => labelBox(l, cam));
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 10 && b.x1 <= 1070 && b.y0 >= BAND.top && b.y1 <= BAND.top + BAND.height, `"${ls[i].text}" out at ${t.toFixed(2)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
  for (const t of frames.filter(t => t > SWEEP_START + 0.5 && t < END_AT)) assert.ok(!labelsAt(t).some(l => (l.text === 'sin θ' || l.text === 'cos θ') && l.alpha > 0.05));
  for (const [t, text] of [[ANSWER_AT + 0.6, 'tan θ'], [12.5, 'sec θ'], [16.2, 'cot θ'], [17.2, 'cosec θ']] as const)
    assert.ok(labelsAt(t).some(l => l.text === text && l.alpha > 0.9), `${text} at ${t}`);
  // tags fade as the view turns side-on and are back at the front
  assert.ok(labelsAt(1.5).filter(l => l.role === 'tag').every(l => l.alpha < 0.05));
});

test('colours: six VIVID colours, every pair that meets is told apart (colour-blind safe); chips take their line\'s colour', () => {
  const v = Object.values(VIVID.white) as string[], six = ['sin', 'cos', 'tan', 'sec', 'cot', 'cosec'] as const;
  for (const n of six) assert.ok(v.includes(COLORS[n]), n);
  assert.equal(new Set(six.map(n => COLORS[n])).size, 6);
  const meet: [typeof six[number], typeof six[number]][] = [['sin', 'cos'], ['sin', 'sec'], ['cos', 'sec'], ['sec', 'cosec'], ['tan', 'sec'], ['cot', 'cosec'], ['sin', 'cosec'], ['cos', 'cosec'], ['sin', 'tan']];
  for (const [a, b] of meet) assert.ok(distinguishable(COLORS[a], COLORS[b]), `${a} vs ${b}`);
});

test('voice: the question then each caption, word for word while on screen, in order, inside the reel', () => {
  assert.ok(VOICE[0].t <= 0.2);
  for (const line of VOICE) assert.ok(onScreen(line, SHOWN), `"${line.text}" at ${line.t}`);
  for (let k = 1; k < VOICE.length; k++) assert.ok(VOICE[k].t >= VOICE[k - 1].until - 1e-9, 'lines overlap');
  assert.ok(VOICE.at(-1)!.until <= DURATION);
  assert.equal(VOICE.length, CAPTIONS.length - 1 + 2, 'the question, every caption but the opening one, the end card');
});

test('sound: a tap on each pulse, a thunk on the answer, a snap at each cut, ticks through the sweep, whooshes on fast zooms', () => {
  for (const p of PULSES) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && close(h.t, p, 1e-9)));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && close(h.t, ANSWER_AT, 1e-9)));
  assert.equal(SOUND.hits.filter(h => h.kind === 'snap').length, 2);
  // the sweep: a tick every 5° (2–4 a second, never a rattle), a tap at each turnaround (62°, 28°)
  const ticks = SOUND.hits.filter(h => h.kind === 'click' && h.t >= SWEEP_START && h.t < END_AT).map(h => h.t);
  assert.ok(ticks.length >= 10 && ticks.length <= 16, `${ticks.length} ticks`);
  for (let i = 1; i < ticks.length; i++) assert.ok(ticks[i] - ticks[i - 1] > 0.12, `ticks ${ticks[i - 1].toFixed(2)}, ${ticks[i].toFixed(2)}`);
  for (const d of [62, 28]) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && close(thetaAt(h.t), d, 0.5)), `turnaround ${d}°`);
  // the answer is the loudest hit; the cosec snap lands with the music's accent; no two onsets within 0.25 s of it
  const loud = Math.max(...SOUND.hits.map(h => h.gain));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && close(h.t, ANSWER_AT, 1e-9) && h.gain === loud));
  assert.ok(MUSIC_HITS.includes(CUTS[1]) && !SOUND.hits.some(h => h.t > CUTS[1] && h.t < CUTS[1] + 0.25));
  assert.ok(SOUND.hits.some(h => close(h.t, TOP.t, 1e-9)), 'the top line draws with a sound');
  assert.ok(SOUND.hits.some(h => h.t >= END_AT && h.t < END_AT + 0.5), 'the end card arrives with a sound');
  const ws = whooshesFor(ZOOM.start, ZOOM.keys); assert.ok(ws.length >= 3);
  for (const w of ws) assert.ok(SOUND.hits.some(s => s.kind === w.kind && close(s.t, w.t, 1e-9)));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('shape: a "why" build ≤ 30 s (F18), captions ≤ 7 words and ≤ 40 characters, in order; music hits on the answer and the top pair', () => {
  assert.ok(DURATION <= 30 && END_AT < DURATION);
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
    assert.ok([...c.text].length <= 40, `too wide: "${c.text}"`);
  }
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.equal(MUSIC_HITS[0], ANSWER_AT);
  assert.ok(tween(ANSWER_AT, ZOOM.start, ZOOM.keys)[0] > tween(ANSWER_AT - 0.4, ZOOM.start, ZOOM.keys)[0]);
});
