import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, T_BURST, ANSWER_AT, T_SECOND, T_SLOW, T_LIT, T_FLY2, COVER_T, LABEL, HEADER, OPTIONS, ANSWER, BRAND, SECOND_Q,
  ZOOM_LABEL, REACTION, atoms, RATE, volume, count, ticks, interfaceY, TUBE, BUBBLES, BUBBLE_RATE, bubbleAt, moleculeAt,
  zoomLabelAlpha, ZOOM_LABEL_AT, BAND, CAMERA, cameraAt, zoomAt, anchors, CAPTIONS, SECOND_HOOK, END_LINES, MUSIC_HITS, SOUND, COLOURS,
} from '../src/lib/pc009.ts';
import { project } from '../src/lib/inductionScene.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { tween } from '../src/lib/motion.ts';
import { distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Chemistry, visualised #9 (C8, "Split water"): one battery, two tubes, which fills first? Hydrogen, twice as
// fast (2 H₂O → 2 H₂ + O₂, Avogadro). Hook queue row 2: Race · Split apart; the first L62 test (a running count).
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

test('frame 0 (F4, F20): the question, three options, the tag; the answer is hydrogen', () => {
  assert.equal(LABEL, 'CHEMISTRY, VISUALISED  #9');
  assert.deepEqual(HEADER, ['Two tubes. Which fills first?']);
  assert.deepEqual(OPTIONS, ['A  hydrogen', 'B  oxygen', 'C  together']);
  assert.equal(OPTIONS[ANSWER], 'A  hydrogen');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const options = OPTIONS.map(o => o.replace(/^[A-C]\s+/, '')).join(' ');
  assert.equal(words(LABEL) + words(HEADER.join(' ')) + words(options) + words(BRAND), 14);
  assert.ok(words(ZOOM_LABEL) <= 7, 'F7');
});

test('F10: 2 H₂O → 2 H₂ + O₂ balances, so hydrogen comes out as 2 molecules for every O₂', () => {
  assert.deepEqual(atoms(REACTION.left), atoms(REACTION.right));
  assert.deepEqual(atoms(REACTION.left), { H: 4, O: 2 });
  assert.equal(REACTION.right.H2 / REACTION.right.O2, 2);
});

test('F10: equal molecules, equal space (Avogadro): the hydrogen volume is exactly twice the oxygen at every moment', () => {
  assert.equal(RATE.H2 / RATE.O2, REACTION.right.H2 / REACTION.right.O2);
  for (const t of frames) assert.ok(near(volume('H2', t), 2 * volume('O2', t)), `at ${t}`);
  assert.equal(BUBBLE_RATE.H2, 2 * BUBBLE_RATE.O2, 'twice the bubbles, too');
});

test('L62: the counts run from frame 0, are the answer at the answer (14 : 7) and keep running past it to 34 : 17', () => {
  assert.equal(count('H2', 0), 0); assert.equal(count('O2', 0), 0);
  assert.equal(count('H2', ANSWER_AT), 14); assert.equal(count('O2', ANSWER_AT), 7);
  assert.equal(count('H2', END_AT), 34); assert.equal(count('O2', END_AT), 17);
  assert.ok(count('H2', END_AT) > count('H2', ANSWER_AT), 'still counting after the answer');
  for (const g of ['H2', 'O2'] as const) {
    const tk = ticks(g);
    assert.equal(tk.length, count(g, END_AT));
    for (const t of tk) assert.equal(count(g, t + 1e-6), count(g, t - 1e-6) + 1, `${g} ticks once at ${t}`);
  }
});

test('the gas columns: each tube\'s gas grows with its volume and stays inside the tube, above its mouth', () => {
  for (const t of frames) for (const g of ['H2', 'O2'] as const) {
    const y = interfaceY(g, t);
    assert.ok(y <= TUBE.top && y > TUBE.mouth + 0.3, `${g} gas edge ${y} at ${t}`);
  }
  assert.ok(interfaceY('H2', END_AT) < interfaceY('O2', END_AT));
});

test('bubbles rise from the electrodes and vanish into their own tube\'s gas; the hydrogen stream is busier', () => {
  for (const t of [1, 5, ANSWER_AT, 12, END_AT]) {
    const live = { H2: 0, O2: 0 };
    for (const b of BUBBLES) { const p = bubbleAt(b, t); if (!p) continue; live[b.gas]++; assert.ok(p[1] < interfaceY(b.gas, t)); }
    assert.ok(live.H2 >= live.O2 && live.O2 >= 3, `${t}: ${live.H2} vs ${live.O2}`);
  }
  // Fewer live in the hydrogen tube than its rate suggests (its gas is lower, so the trip is shorter): count arrivals.
  const arrived = { H2: 0, O2: 0 };
  for (const b of BUBBLES) if (frames.some(t => t > 1 && t <= END_AT && bubbleAt(b, t)) && !bubbleAt(b, END_AT)) arrived[b.gas]++;
  assert.ok(Math.abs(arrived.H2 / arrived.O2 - 2) < 0.15, `${arrived.H2} vs ${arrived.O2}`);
});

test('the hook (F25 Split apart, F5): one big water molecule at frame 0, bursting at 0.5 s; something moves on every frame of 0–3 s', () => {
  const m0 = moleculeAt(0);
  assert.deepEqual(m0.map(a => a.el).sort(), ['H', 'H', 'O']);
  assert.ok(zoomAt(0) > 3 && zoomLabelAlpha(0) === 1, 'shown big, labelled as zoomed');
  assert.equal(moleculeAt(T_BURST + 2.1).length, 0, 'its atoms have reached the tubes');
  const sig = (t: number) => JSON.stringify([moleculeAt(t).map(a => a.p.map(v => v.toFixed(4))), cameraAt(t).position.map(v => v.toFixed(4)),
    BUBBLES.map(b => bubbleAt(b, t)?.[1].toFixed(4)).filter(Boolean)]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `nothing moves at frame ${f}`);
  const hx = moleculeAt(T_BURST + 1.2).filter(a => a.el === 'H').map(a => a.p[0]), ox = moleculeAt(T_BURST + 1.2).find(a => a.el === 'O')!.p[0];
  assert.ok(hx.every(x => x < 0) && ox > 0, 'both H fly to the hydrogen tube (left), the O to the oxygen tube');
});

test('the answer at 7.0 s, after a punch-in on the gas columns (F9) that lands on it', () => {
  const punch = CAMERA.keys.find(k => k.t > 5 && k.t < ANSWER_AT)!;
  assert.ok(punch.dur <= 0.9 && punch.t + punch.dur <= ANSWER_AT && punch.to[0] > 1.3);
  assert.ok(zoomAt(ANSWER_AT) > 1.3);
});

test('the second hook (F26): "Why exactly twice as fast?" 1 s after the answer, with a punch-in on one molecule that splits in slow motion, its two H lit', () => {
  assert.equal(SECOND_Q, 'Why exactly twice as fast?');
  assert.equal(SECOND_HOOK.text, SECOND_Q);
  assert.ok(words(SECOND_Q) <= 7 && SECOND_HOOK.t0 === T_SECOND && T_SECOND - ANSWER_AT <= 1.5);
  const punch = CAMERA.keys.find(k => k.t === T_SECOND)!;
  assert.ok(punch.dur <= 0.9 && punch.to[0] > 3);
  const gap = (t: number) => { const m = moleculeAt(t), o = m.find(a => a.el === 'O')!.p, h = m.find(a => a.el === 'H')!.p; return Math.hypot(h[0] - o[0], h[1] - o[1]); };
  assert.ok(gap(T_SLOW + 1.4) > 1.5 * gap(T_SLOW), 'the H atoms pull away from the O');
  assert.ok(gap(T_SLOW + 0.5) < gap(T_SLOW + 1.0), 'slowly, over more than a second');
  assert.ok(moleculeAt(T_LIT + 0.5).filter(a => a.el === 'H').every(a => a.lit > 0.9));
  assert.ok(moleculeAt(T_LIT + 0.5).filter(a => a.el === 'O').every(a => a.lit === 0), 'only the two H light up');
  assert.ok(zoomLabelAlpha(T_SECOND + 1) > 0.9, 'the zoom is labelled again');
  assert.equal(moleculeAt(T_FLY2 + 1.05).length, 0);
});

test('words (F7) and length (F18): every caption ≤ 7 words, captions end before the end card, ≤ 25 s', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9, 'no overlap');
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(DURATION <= 25);
  assert.ok(words(END_LINES[0]) <= 7);
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

test('the zoom label sits between the two counter cards (they end at x 230 and start at 850) whenever it shows', () => {
  for (const t of frames.filter(t => zoomLabelAlpha(t) > 0.05 && !(t >= T_SECOND && t < T_SECOND + 0.8))) {
    const x = project(ZOOM_LABEL_AT, cameraAt(t), BAND).x;
    assert.ok(x - 210 > 240 && x + 210 < 840, `label centre ${x.toFixed(0)} at ${t.toFixed(2)} (about 420 px wide)`);
  }
});

test('camera (F9): pulls back, pushes, two fast punch-ins and a zoom out; smooth (no jumps between frames)', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1);
  // A jump is a cut, not a fast zoom: per frame the zoom changes by under 15 % and the aim by under 0.15.
  const at = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (let i = 1; i < frames.length; i++) {
    const a = at(frames[i - 1]), b = at(frames[i]);
    assert.ok(Math.abs(Math.log(b[0] / a[0])) < 0.15 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 0.15, `jump at ${frames[i]}`);
  }
});

test('sound (F14–F16): a crack on each split, a tap on every counter tick, whooshes only on fast zooms, music hits on both hooks', () => {
  const cracks = SOUND.hits.filter(h => h.kind === 'crack').map(h => h.t);
  assert.deepEqual(cracks, [T_BURST, T_SLOW]);
  const taps = SOUND.hits.filter(h => h.kind === 'tap').map(h => h.t);
  assert.equal(taps.length, [...ticks('H2'), ...ticks('O2')].filter(t => t > T_BURST + 0.2).length);
  assert.deepEqual(SOUND.hits.filter(h => h.kind.startsWith('whoosh')), whooshesFor(CAMERA.start, CAMERA.keys));
  assert.ok(whooshesFor(CAMERA.start, CAMERA.keys).length >= 3);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SECOND]);
});

test('colours (F24): hydrogen and oxygen told apart, colour-blind safe', () => {
  assert.ok(distinguishable(COLOURS.H, COLOURS.O));
});

test('F6: the cover is taken before the answer, while both counts still read 0', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T < T_BURST);
  assert.equal(count('H2', COVER_T), 0); assert.equal(count('O2', COVER_T), 0);
});
