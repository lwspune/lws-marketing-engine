import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ANSWER_AT, TOUR, ZOOM_OUT, LOOP_AT, COVER_T, OPTIONS, ANSWER, LAST3, COUNTING, NODES, HUB, REGION, card, SLOTS, WRITE, FLIPS,
  writeAt, focusAt, hubAnswerAt, flipAt, finalAt, predictAnswerAt, toScreen, CAPTIONS, CAMERA, SOUND, MUSIC_HITS,
} from '../src/lib/reel017.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { VIVID } from '../src/lib/palette.ts';

// @lws.pune · Map #1 (founder, 2026-10-21): "which chapter has the most NDA maths questions now?" Probability (41 of the
// last 360), then all of NDA probability on one map, built node by node, ending on a frame worth a screenshot that loops
// back to frame 0. Model: a "formula map" reel studied 2026-10-21 (study/reels/DdttI7oyswS.mp4), remade our way.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const cam = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;

test('the answer, re-derived from the question bank snapshot: Probability is the biggest chapter of the last 3 papers', () => {
  for (let p = 0; p < 3; p++) assert.equal(LAST3.reduce((s, r) => s + (r[1 + p] as number), 0), 120, `paper ${p} must hold 120 questions`);
  const total = (name: string) => { const r = LAST3.find(x => x[0] === name)!; return r[1] + r[2] + r[3]; };
  const ranked = [...LAST3].sort((a, b) => (b[1] + b[2] + b[3]) - (a[1] + a[2] + a[3]));
  assert.equal(ranked[0][0], 'Probability'); assert.equal(total('Probability'), 41);
  assert.match(OPTIONS[ANSWER], /Probability/);
  assert.ok(total('Matrices & Determinants') < 41 && total('Trigonometric Identities') < 41, 'the other options really are smaller');
  assert.ok(CAPTIONS.some(c => /41 of 360/.test(c.text)), 'the caption states the real count');
  assert.deepEqual(COUNTING, { counting: 90, total: 176 });
  assert.ok(FLIPS[0].lines.join(' ').includes('90 of 176'));
});

// Every formula on the map, checked by counting outcomes of two (or four) dice.
const dice2 = [1, 2, 3, 4, 5, 6].flatMap(a => [1, 2, 3, 4, 5, 6].map(b => [a, b]));
const P = (f: (o: number[]) => boolean, space = dice2) => space.filter(f).length / space.length;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-12, `${a} ≠ ${b}`);

test('every formula on the map is true (F10), checked on the 36 outcomes of two dice', () => {
  const A = (o: number[]) => o[0] % 2 === 0, B = (o: number[]) => o[1] === 6, S7 = (o: number[]) => o[0] + o[1] === 7;
  close(P(S7), 6 / 36);                                                                   // counting: favourable ÷ total
  close(P(o => o[0] === 6 || o[1] === 6), 1 - P(o => o[0] !== 6 && o[1] !== 6));          // at least one = 1 − none
  const C = (o: number[]) => o[0] + o[1] >= 9;
  close(P(o => A(o) || C(o)), P(A) + P(C) - P(o => A(o) && C(o)));                         // A or B
  const two = (o: number[]) => o[0] + o[1] === 2, twelve = (o: number[]) => o[0] + o[1] === 12;
  close(P(o => two(o) && twelve(o)), 0);                                                   // exclusive: overlap 0…
  assert.ok(P(two) * P(twelve) > 0, '…so exclusive events are NOT independent (the trap)');
  close(P(o => A(o) && B(o)), P(A) * P(B));                                                // independent: multiply
  const given = dice2.filter(B);
  close(P(S7, given), P(o => S7(o) && B(o)) / P(B));                                       // given B: B is the new whole
  close(P(B, dice2.filter(S7)), (P(S7, given) * P(B)) / P(S7));                            // Bayes turns it around
  const dice4 = dice2.flatMap(a => dice2.map(b => [...a, ...b]));
  const sixes = (o: number[]) => o.filter(d => d === 6).length, nCr = (n: number, r: number): number => (r === 0 ? 1 : (n * nCr(n - 1, r - 1)) / r);
  for (let r = 0; r <= 4; r++) close(P(o => sixes(o) === r, dice4), nCr(4, r) * (1 / 6) ** r * (5 / 6) ** (4 - r));
  const mean = dice4.reduce((s, o) => s + sixes(o), 0) / dice4.length, vr = dice4.reduce((s, o) => s + (sixes(o) - mean) ** 2, 0) / dice4.length;
  close(mean, 4 / 6); close(vr, 4 * (1 / 6) * (5 / 6));                                   // mean np, variance npq
});

test('the map: 8 nodes, each its own VIVID colour, cards inside the picture area and never overlapping', () => {
  assert.equal(NODES.length, 8);
  const colours = new Set(NODES.map(n => n.color));
  assert.equal(colours.size, 8);
  for (const n of NODES) assert.ok(Object.values(VIVID.white).includes(n.color as never), `${n.title}: not a VIVID colour`);
  const boxes = NODES.map((_, i) => card(i));
  for (const b of boxes) assert.ok(b.x >= 40 && b.x + b.w <= 1040 && b.y >= REGION.top + 20 && b.y + b.h <= REGION.top + REGION.h - 20, 'card off the area');
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const a = boxes[i], b = boxes[j];
    assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h + 10 <= b.y || b.y + b.h + 10 <= a.y, `${NODES[i].title} overlaps ${NODES[j].title}`);
  }
  for (const b of boxes) {
    const dx = Math.max(b.x - HUB.x, 0, HUB.x - (b.x + b.w)), dy = Math.max(b.y - HUB.y, 0, HUB.y - (b.y + b.h));
    assert.ok(Math.hypot(dx, dy) > HUB.r + 20, 'a card touches the hub');
  }
});

test('labels stay short (F7): titles ≤ 12 characters, formula lines ≤ 2, captions and flip lines ≤ 7 words', () => {
  for (const n of NODES) { assert.ok(n.title.length <= 12, n.title); assert.ok(n.lines.length >= 1 && n.lines.length <= 2, n.title); }
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, `too long: "${c.text}"`);
  for (const f of FLIPS) for (const l of f.lines) assert.ok(words(l) <= 7, `too long: "${l}"`);
});

test('frame 0 asks the question with the map already up and moving; the hub hides the answer until it lands (F4, F5, F6)', () => {
  for (let i = 0; i < 8; i++) assert.equal(writeAt(i, 0), 0);
  assert.equal(hubAnswerAt(0), 0); assert.equal(hubAnswerAt(ANSWER_AT - 0.21), 0); assert.ok(hubAnswerAt(ANSWER_AT + 0.4) > 0.99);
  assert.equal(predictAnswerAt(0), ANSWER_AT);
  for (let f = 1; f <= 90; f++) assert.ok(cam(f / 30).some((v, i) => v !== cam((f - 1) / 30)[i]), `still at frame ${f}`);
  assert.ok(COVER_T < ANSWER_AT - 0.2 && hubAnswerAt(COVER_T) === 0 && NODES.every((_, i) => writeAt(i, COVER_T) === 0));
});

test('the tour in order: each node written while the camera is on it, both flips between nodes, then the zoom out', () => {
  assert.ok(ANSWER_AT < TOUR && TOUR === SLOTS[0]);
  for (let i = 1; i < 8; i++) assert.ok(SLOTS[i] > SLOTS[i - 1] + 1.4, `node ${i} too soon`);
  assert.ok(SLOTS[7] + 1.4 <= ZOOM_OUT && ZOOM_OUT < LOOP_AT && LOOP_AT < DURATION);
  for (let i = 0; i < 8; i++) {
    const s = SLOTS[i] + 1.2;
    assert.ok(writeAt(i, s) > 0.99, `${NODES[i].title} not written by ${s}`);
    assert.ok(focusAt(i, s) > 0.9, `${NODES[i].title} not in focus`);
    const [z] = cam(s), b = card(i), tl = toScreen(cam(s), b.x, b.y), br = toScreen(cam(s), b.x + b.w, b.y + b.h);
    assert.ok(z >= 1.4, `${NODES[i].title}: camera not zoomed in`);
    assert.ok(tl[0] >= 0 && br[0] <= 1080 && tl[1] >= REGION.top && br[1] <= REGION.top + REGION.h, `${NODES[i].title} cropped while explained`);
    if (i > 0) assert.ok(writeAt(i, SLOTS[i] - 0.05) === 0, `${NODES[i].title} written early`);
  }
  for (const f of FLIPS) {
    assert.ok(f.t1 - f.t0 >= 1.3, 'a flip must stay long enough to read');
    assert.ok(SLOTS.every(s => s >= f.t1 - 1e-9 || s + 1.4 <= f.t0), 'a flip covers a node');
    assert.ok(flipAt(f, (f.t0 + f.t1) / 2) === 1 && flipAt(f, f.t0 - 0.01) === 0 && flipAt(f, f.t1 + 0.01) === 0);
  }
  assert.equal(FLIPS.length, 2);
});

test('the end: the whole map, every label on, held ≥ 3 s for a screenshot, then back to frame 0 so it loops', () => {
  const held = ZOOM_OUT + 0.8;
  assert.ok(LOOP_AT - held >= 3, 'hold the full map at least 3 s');
  for (let t = held; t < LOOP_AT; t += 0.1) {
    assert.ok(NODES.every((_, i) => writeAt(i, t) > 0.99) && finalAt(t) > 0.99 && Math.abs(cam(t)[0] - 1) < 1e-9);
    for (let i = 0; i < 8; i++) { const b = card(i), tl = toScreen(cam(t), b.x, b.y), br = toScreen(cam(t), b.x + b.w, b.y + b.h); assert.ok(tl[1] >= REGION.top && br[1] <= REGION.top + REGION.h); }
  }
  const last = frames[frames.length - 1];
  cam(last).forEach((v, i) => assert.ok(Math.abs(v - CAMERA.start[i]) < 0.01, 'the last frame’s camera must match frame 0'));
  assert.ok(NODES.every((_, i) => writeAt(i, last) < 0.02) && hubAnswerAt(last) < 0.02 && finalAt(last) < 0.02);
  assert.equal(predictAnswerAt(last), Infinity, 'the question shows unanswered again, as on frame 0');
  assert.ok(finalAt(ZOOM_OUT + 1.5) === 1 && predictAnswerAt(ZOOM_OUT + 1.5) === Infinity, 'the pill unlights only while hidden');
});

test('the camera: a punch-in on the answer, in on every node, out at the end, no jumps the viewer can see (F9)', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  const hidden = (t: number) => FLIPS.some(f => flipAt(f, t) === 1);
  for (let i = 1; i < frames.length; i++) {
    if (hidden(frames[i]) || hidden(frames[i - 1])) continue;
    const a = cam(frames[i - 1]), b = cam(frames[i]);
    assert.ok(b[0] >= 0.6 && b[0] <= 1.9 && Math.abs(b[0] - a[0]) < 0.1 && Math.abs(b[1] - a[1]) < 45 && Math.abs(b[2] - a[2]) < 45, `camera jumps at ${frames[i]}`);
  }
});

test('sound from the picture: a click per spoke pulse, a thunk on the answer, a tap per node, a whump per flip, whooshes', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.equal(SOUND.hits.filter(h => h.kind === 'click' && h.t < ANSWER_AT).length, 8);
  const taps = SOUND.hits.filter(h => h.kind === 'tap' && h.t >= TOUR && h.t < ZOOM_OUT);
  assert.equal(taps.length, 8);
  for (let i = 0; i < 8; i++) {
    assert.ok(taps.some(h => Math.abs(h.t - WRITE[i]) < 1e-9), `no tap as ${NODES[i].title} writes`);
    assert.ok(writeAt(i, WRITE[i] - 0.01) === 0 && writeAt(i, WRITE[i] + 0.1) > 0, `${NODES[i].title} doesn't start writing on its tap`);
  }
  for (const f of FLIPS) assert.ok(SOUND.hits.some(h => h.kind === 'whump' && Math.abs(h.t - f.t0) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  assert.equal(SOUND.duration, DURATION);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, ZOOM_OUT]);
});

test('short (≤ 25 s, F18)', () => assert.ok(DURATION <= 25));
