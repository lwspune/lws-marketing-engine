import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COVER_T, COLORS, STEPS, FAST_STEPS, phaseAt, waveAt, pillAt,
  CAMERA, panelX, panelAt, labelsAt, labelBox, SOUND,
} from '../src/lib/reel023.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 023 (predict-first): differentiate sin x four times → sin x (answer A). Each derivative slides the wave
// a quarter turn left: sin → cos → −sin → −cos → sin. Two turns give −y; for sin 2x each turn also doubles the height,
// so y″ = −4y. Caption: NDA 2019 (I) Q83, y = a cos 2x + b sin 2x ⇒ y″ + 4y = 0 (answer (d)).
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const d = (g: (x: number) => number) => (x: number) => (g(x + 1e-5) - g(x - 1e-5)) / 2e-5;

test('the answer, re-derived: each derivative of sin(x + kπ/2) is sin(x + (k + 1)π/2); four of them give sin x back', () => {
  for (let k = 0; k < 4; k++) for (const x of [-2, -0.3, 0.9, 2.5]) near(d(u => Math.sin(u + (k * Math.PI) / 2))(x), Math.sin(x + ((k + 1) * Math.PI) / 2), 1e-5);
  near(phaseAt(ANSWER_AT), 2 * Math.PI, 1e-12);
  for (const x of [-3, -1, 0.4, 2, 5]) near(waveAt(ANSWER_AT)(x), Math.sin(x), 1e-9);
  assert.match(OPTIONS[ANSWER], /^A\s+sin x$/);
});

test('(sin 2x)″ = −4 sin 2x, and NDA 2019 (I) Q83: y = a cos 2x + b sin 2x satisfies y″ + 4y = 0', () => {
  const s2 = (x: number) => Math.sin(2 * x);
  for (const x of [-1.2, 0.3, 2.2]) near(d(d(s2))(x), -4 * s2(x), 1e-3);
  for (const [a, b] of [[1, 0], [0, 1], [2, -3], [-0.5, 1.5]]) {
    const y = (x: number) => a * Math.cos(2 * x) + b * Math.sin(2 * x);
    for (const x of [-1, 0.2, 1.7]) near(d(d(y))(x) + 4 * y(x), 0, 1e-3);
  }
  const end = FAST_STEPS.at(-1)!; for (const x of [-2, 0.5, 1.3]) near(waveAt(end.t + end.dur)(x), -4 * Math.sin(2 * x), 1e-9);
});

test('motion from frame 0: the wave slides on every frame of the first 3 s, a quarter turn per step', () => {
  for (let k = 1; k <= 90; k++) assert.ok(phaseAt(k / 30) > phaseAt((k - 1) / 30), `still at frame ${k}`);
  STEPS.forEach((s, i) => near(phaseAt(s.t + s.dur), ((i + 1) * Math.PI) / 2, 1e-12));
});

test('the pill counts in the reel\'s own notation (never "× n"), and the cover still says y = sin x', () => {
  const seen: string[] = [...new Set(frames.map(pillAt))];
  for (const p of seen) assert.ok(!/×/.test(p), `"${p}" reads as multiply`);
  for (const p of ['y = sin x', 'y′ = cos x', 'y″ = −sin x', 'y‴ = −cos x', 'y⁗ = sin x', 'y″ = −y', "y′ = 2 cos 2x", 'y″ = −4 sin 2x', 'y″ + 4y = 0']) assert.ok(seen.includes(p), `missing "${p}"`);
  assert.equal(pillAt(COVER_T), 'y = sin x');
  assert.ok(COVER_T < STEPS[0].t + STEPS[0].dur);
});

test('the punch-in zooms only the wave panel and keeps its ends and peaks inside the picture', () => {
  for (const t of frames) {
    const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), p = panelAt(t);
    const sx = (x: number) => 540 + (x - fx) * z, sy = (y: number) => 515 + (y - fy) * z;
    assert.ok(sx(panelX(-Math.PI)) >= 0 && sx(panelX(2 * Math.PI)) <= 1080, `panel ends out at ${t}`);
    const amp = p.amp * p.maxY;                                   // the tallest wave on screen at t, in px
    assert.ok(sy(p.cy - amp) >= 0 && sy(p.cy + amp) <= 1030, `panel peaks out at ${t}`);
  }
});

test('labels: every visible label stays inside the picture and no two overlap, on every frame', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(labelBox);
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 20 && b.x1 <= 1060 && b.y0 >= 20 && b.y1 <= 965, `"${ls[i].text}" out at ${t.toFixed(2)}: ${JSON.stringify(b)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
});

test('camera: two zooms in, one out, a punch-in landing on the answer, smooth, still while the panel rescales', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] >= 1.1 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05));
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(b[0] - a[0]) < 0.1, `zoom jumps at ${frames[i]}`);
    if (frames[i] > 8.5 && frames[i] < 9.3) assert.deepEqual(a, b, `camera moves during the rescale at ${frames[i]}`);
  }
});

test('sound: a tick as each slide lands, a whoosh in and a knock on the answer, a whump as the mirror wave finishes', () => {
  const ticks = SOUND.hits.filter(h => h.kind === 'click');
  for (const s of [...STEPS.slice(0, 3), ...FAST_STEPS]) assert.ok(ticks.some(h => Math.abs(h.t - (s.t + s.dur)) < 1e-9), `no tick at ${s.t + s.dur}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'whump'));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: the wave and the pointer / mirror wave are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  assert.ok(v.includes(COLORS.wave) && v.includes(COLORS.mirror));
  assert.ok(distinguishable(COLORS.wave, COLORS.mirror));
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the last step', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  const last = FAST_STEPS.at(-1)!;
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(last.t + last.dur));
});
