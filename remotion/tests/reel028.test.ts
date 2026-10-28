import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, THETA_DEG, CENTRE, R, VOICE, BEATS, TITLES, SUBTITLES, figure, toScreen, beatAt, segmentsAt, labelsAt, labelBox,
  titleAt, subtitleAt, rippleAt, glitchAt, zoomAt, SOUND, MUSIC_HITS, COVER_T, DRAW, CUTS,
} from '../src/lib/reel028.ts';

// @lws.pune · reel 028, remade the founder's way (2026-10-28: "make the exact one"): @official_neutron_and_numbers'
// trig reel in their look (dark starfield, neon 2D lines, a title per step, continuous narration in af_heart), with the
// one change the founder chose: cot and cosec drawn where they really are (theirs sends cosec up-left, off θ's ray).
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const rad = (d: number) => (d * Math.PI) / 180;
const len = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

test('the figure: each of the six lines has its ratio\'s length; T on x = 1, C on y = 1, both on θ\'s own ray', () => {
  const f = figure(THETA_DEG), th = rad(THETA_DEG);
  assert.ok(close(len(f.P, f.M), Math.sin(th), 1e-12) && close(len([0, 0], f.M), Math.cos(th), 1e-12));
  assert.ok(close(len(f.A, f.T), Math.tan(th), 1e-12) && close(len([0, 0], f.T), 1 / Math.cos(th), 1e-12));
  assert.ok(close(len(f.B, f.C), 1 / Math.tan(th), 1e-12) && close(len([0, 0], f.C), 1 / Math.sin(th), 1e-12));
  assert.ok(close(f.T[0], 1, 1e-12) && close(f.C[1], 1, 1e-12));
  // the correction: cosec runs along θ's ray, and cot runs to the right of the y-axis (theirs went the other way)
  for (const q of [f.P, f.T, f.C]) assert.ok(close(Math.atan2(q[1], q[0]), th, 1e-12));
  assert.ok(f.C[0] > 0);
});

test('the six coloured lines, once drawn, are exactly those lengths on screen (R px per unit)', () => {
  const end = segmentsAt(DURATION - 0.5), th = rad(THETA_DEG);
  const want: Record<string, number> = { sin: Math.sin(th), cos: Math.cos(th), tan: Math.tan(th), sec: 1 / Math.cos(th), cot: 1 / Math.tan(th), csc: 1 / Math.sin(th) };
  for (const [id, v] of Object.entries(want)) {
    const s = end.find(x => x.id === id)!;
    assert.ok(s && s.drawn === 1 && s.alpha > 0.9, id);
    assert.ok(close(len(s.a, s.b), v * R, 0.5), `${id}: ${len(s.a, s.b)} vs ${v * R}`);
  }
  assert.deepEqual(toScreen([0, 0]), CENTRE);
});

test('the beats follow the narration: each step starts with its line, in their order', () => {
  const order = ['circle', 'angle', 'sin', 'cos', 'why', 'touch', 'extend', 'tan', 'sec', 'cut', 'top', 'cot', 'csc', 'six'];
  assert.deepEqual(BEATS.map(b => b.id), order);
  assert.equal(VOICE.length, BEATS.length);
  BEATS.forEach((b, i) => assert.ok(close(b.t, VOICE[i].t, 1e-9), b.id));
  for (let i = 1; i < VOICE.length; i++) assert.ok(VOICE[i].t >= VOICE[i - 1].until - 1e-9, 'lines overlap');
  assert.ok(VOICE[0].t > 0 && VOICE[0].t < 0.6 && VOICE.at(-1)!.until <= DURATION);
  assert.ok(DURATION >= 40 && DURATION <= 50, `${DURATION} s (theirs 44.8 s)`);
  assert.equal(beatAt(0), null); assert.equal(beatAt(BEATS[3].t + 0.1), 'cos');
});

test('their titles, one per step, in each line\'s colour; the two subtitles under the figure', () => {
  assert.deepEqual(TITLES.map(t => t.text), ['Start with a circle of radius 1', 'Choose an angle θ', 'Sine is the Height', 'Cosine is the Base',
    'Why is it called Tangent?', 'Secant Cuts the Circle', 'Cotangent at the Top', 'Cosecant', 'Six Actual Lines']);
  assert.deepEqual(SUBTITLES.map(t => t.text), ['Tangent = Touching', 'Secant = To Cut']);
  for (let i = 1; i < TITLES.length; i++) assert.ok(TITLES[i].t > TITLES[i - 1].t);
  assert.equal(titleAt(0.1), null);
  assert.equal(titleAt(DURATION - 0.1)!.text, 'Six Actual Lines');
  assert.equal(subtitleAt(BEATS.find(b => b.id === 'tan')!.t + 1)!.text, 'Tangent = Touching');
});

test('their effects: a ripple off the circle, a glitch at the tangent, nothing else glitching', () => {
  const ripple = frames.filter(t => rippleAt(t) > 0), glitch = frames.filter(t => glitchAt(t) > 0);
  assert.ok(ripple.length && ripple[0] < BEATS[1].t + 0.5 && ripple.at(-1)! - ripple[0] < 1.2);
  assert.ok(glitch.length && glitch.length <= 12, `${glitch.length} glitch frames`);
  const tan = BEATS.find(b => b.id === 'tan')!.t;
  assert.ok(glitch.every(t => t >= tan - 0.6 && t <= tan + 0.6));
});

test('labels: every label inside the frame and clear of the title and subtitle bands; no two overlap, every frame', () => {
  for (const t of frames) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(labelBox);
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 20 && b.x1 <= 1060 && b.y0 >= 280 && b.y1 <= 1260, `"${ls[i].text}" at ${t.toFixed(2)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
  const last = labelsAt(DURATION - 0.5).filter(l => l.alpha > 0.9).map(l => l.text);
  for (const n of ['sin θ', 'cos θ', 'tan θ', 'sec θ', 'cot θ', 'csc θ', 'θ', '1']) assert.ok(last.includes(n), n);
});

test('the figure fits the frame: every line and the circle inside x 20–1060, below the title', () => {
  for (const t of [5, 20, 30, DURATION - 0.5]) for (const s of segmentsAt(t)) for (const p of [s.a, s.b]) assert.ok(p[0] >= 20 && p[0] <= 1060 && p[1] >= 300 && p[1] <= 1300, `${s.id} at ${t}`);
  assert.ok(CENTRE[0] - R >= 20 && CENTRE[0] + R <= 1060 && CENTRE[1] + R <= 1300);
});

test('sound: a soft tap as each line is drawn, a snap where each slant cuts the circle; the cover is the full figure', () => {
  for (const id of ['sin', 'cos', 'tan', 'sec', 'cot', 'csc'] as const) {
    assert.ok(SOUND.hits.some(h => h.kind === 'tap' && close(h.t, DRAW[id], 1e-9)), id);
    const beat = BEATS.findIndex(b => b.id === id);
    assert.ok(DRAW[id] >= BEATS[beat].t && DRAW[id] < (BEATS[beat + 1]?.t ?? DURATION), `${id} draws inside its beat`);
  }
  for (const c of CUTS) assert.ok(SOUND.hits.some(h => h.kind === 'snap' && close(h.t, c, 1e-9)));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.3);
  assert.ok(MUSIC_HITS.length >= 1);
  assert.ok(COVER_T > BEATS.at(-1)!.t && COVER_T < DURATION);
});

test('their gentle camera: a push in on the cosine step and on the tangent, back to 1 in between; all inside the frame', () => {
  assert.equal(zoomAt(0), 1); assert.ok(zoomAt(BEATS[3].t + 1.5) > 1.1); assert.ok(close(zoomAt(BEATS[4].t + 0.5), 1, 1e-9));
  assert.ok(zoomAt(BEATS.find(b => b.id === 'tan')!.t + 1.5) > 1.04); assert.ok(close(zoomAt(DURATION - 1), 1, 1e-9));
  const z = Math.max(...frames.map(zoomAt));
  assert.ok(CENTRE[0] - R * z >= 0 && CENTRE[0] + R * z <= 1080 && CENTRE[1] - R * z > 280, 'the zoomed circle stays in frame, below the title');
});
