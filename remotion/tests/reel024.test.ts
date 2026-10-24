import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COVER_T, COLORS, X, Y, f, FLIGHTS, ARROWS, GHOST,
  outputsAt, RANGE, NEVER_HIT, readoutAt, isFunction, ballAt, dot, CAMERA, toScreen, OVAL, labelsAt, labelBox, SOUND,
} from '../src/lib/reel024.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 024 (predict-first): f(x) = x² from X = {−2, …, 2} to Y = {0, …, 4}. What is the range? {0, 1, 4}
// (answer A). B is the codomain, C the domain. Caption: NDA 2022 (II) Q13, highest prime factor on {7, …, 16} → 6.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: the squares of −2 … 2 are 4, 1, 0, 1, 4, so the range is {0, 1, 4}', () => {
  assert.deepEqual(X, [-2, -1, 0, 1, 2]);
  assert.deepEqual(Y, [0, 1, 2, 3, 4]);
  assert.deepEqual(X.map(f), [4, 1, 0, 1, 4]);
  for (const x of X) assert.ok(Y.includes(f(x)), `f(${x}) is not in Y`);
  assert.deepEqual(RANGE, [0, 1, 4]);
  assert.deepEqual(NEVER_HIT, [2, 3]);
  assert.match(OPTIONS[ANSWER], /^A\s+\{0, 1, 4\}$/);
  assert.match(OPTIONS[1], /^B\s+\{0, …, 4\}$/);   // the codomain: the trap
  assert.match(OPTIONS[2], /^C\s+\{−2, …, 2\}$/);  // the domain
});

test('NDA 2022 (II) Q13: highest prime factor on {7, …, 16} takes 6 values', () => {
  const hpf = (n: number) => { let p = 2, best = 1; while (n > 1) { if (n % p === 0) { best = p; n /= p; } else p++; } return best; };
  const values = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(hpf);
  assert.deepEqual(values, [7, 2, 3, 5, 11, 3, 13, 7, 5, 2]);
  assert.deepEqual([...new Set(values)].sort((a, b) => a - b), [2, 3, 5, 7, 11, 13]);
});

test('a function: each input has exactly one arrow; two inputs on one output is fine; the ghost arrow breaks it', () => {
  assert.equal(ARROWS.length, X.length);
  assert.ok(isFunction(ARROWS));
  assert.ok(ARROWS.filter(([, y]) => y === 4).length === 2);                 // −2 and 2 both → 4: still a function
  assert.deepEqual([GHOST.from, GHOST.to], [1, 0]);
  assert.ok(!isFunction([...ARROWS, [GHOST.from, GHOST.to]]));               // 1 → 1 and 1 → 0: not a function
  assert.ok(!NEVER_HIT.includes(GHOST.to), 'the ghost arrow must not land on a "never hit" number');
});

test('the outputs list grows in landing order, then merges into the range pill before the answer', () => {
  assert.deepEqual(outputsAt(0), []);
  assert.deepEqual(outputsAt(COVER_T), []);
  const last = FLIGHTS.at(-1)!;
  assert.deepEqual(outputsAt(last.t + last.dur), [4, 1, 0, 1, 4]);
  for (const fl of FLIGHTS) assert.ok(outputsAt(fl.t + fl.dur).includes(f(fl.x)));
  assert.equal(readoutAt(0), 'Outputs:');
  assert.equal(readoutAt(last.t + last.dur + 0.05), 'Outputs: 4, 1, 0, 1, 4');
  assert.equal(readoutAt(ANSWER_AT), 'Range = {0, 1, 4}');
  assert.equal(readoutAt(END_AT - 0.1), 'Range = {0, 1, 4}');
});

test('motion from frame 0: a ball is in the air on every frame of the first 3 s and moves', () => {
  for (let k = 0; k <= 90; k++) {
    const t = k / 30, live = FLIGHTS.map((_, i) => ballAt(t, i)).filter(Boolean);
    assert.ok(live.length > 0, `no ball in the air at ${t.toFixed(2)}`);
  }
  const a = ballAt(0, 0)!, b = ballAt(1 / 30, 0)!;
  assert.ok(Math.hypot(b.x - a.x, b.y - a.y) > 0.5);
  // each flight ends on its output's dot edge, never past it
  for (const [i, fl] of FLIGHTS.entries()) {
    const end = ballAt(fl.t + fl.dur - 1e-6, i)!, target = dot('Y', Y.indexOf(f(fl.x)));
    assert.ok(Math.hypot(end.x - target.x, end.y - target.y) <= 40, `ball ${i} misses its output`);
  }
});

test('camera: the ovals stay in frame and below the set labels at every zoom, above the readout', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const top = toScreen(t, OVAL.X.cx, OVAL.X.cy - OVAL.ry), bottom = toScreen(t, OVAL.X.cx, OVAL.X.cy + OVAL.ry);
    const left = toScreen(t, OVAL.X.cx - OVAL.rx, OVAL.X.cy), right = toScreen(t, OVAL.Y.cx + OVAL.rx, OVAL.Y.cy);
    assert.ok(left.x >= 10 && right.x <= 1070, `ovals out sideways at ${t.toFixed(2)}`);
    const setLabels = labelsAt(t).filter(l => l.role === 'set').map(labelBox);
    for (const b of setLabels) assert.ok(top.y >= b.y1 + 4, `oval top under a set label at ${t.toFixed(2)}`);
    const pill = labelsAt(t).filter(l => l.role === 'readout').map(labelBox)[0];
    assert.ok(bottom.y <= pill.y0 - 20, `oval bottom on the readout at ${t.toFixed(2)}`);
  }
});

test('camera: two zooms in, two out, a punch-in landing on the answer, smooth', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 2, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] >= 1.08 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05));
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(b[0] - a[0]) < 0.1, `zoom jumps at ${frames[i]}`);
  }
});

test('labels: every visible label stays inside the picture and no two overlap, on every frame', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = ls.map(labelBox);
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 20 && b.x1 <= 1060 && b.y0 >= 32 && b.y1 <= 990, `"${ls[i].text}" out at ${t.toFixed(2)}: ${JSON.stringify(b)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
  }
});

test('labels: the set labels follow their ovals under the zoom, and name the sets after the answer', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const [lx, ly] = labelsAt(t).filter(l => l.role === 'set');
    assert.ok(Math.abs(lx.x - toScreen(t, OVAL.X.cx, 0).x) < 1e-9 && Math.abs(ly.x - toScreen(t, OVAL.Y.cx, 0).x) < 1e-9);
  }
  const names = (t: number) => labelsAt(t).filter(l => l.role === 'set').map(l => l.text);
  assert.deepEqual(names(0), ['X', 'Y']);
  assert.deepEqual(names(END_AT - 0.1), ['X · domain', 'Y · codomain']);
  const never = labelsAt(END_AT - 0.1).find(l => l.text === '2, 3: never hit');
  assert.ok(never && never.alpha > 0.9);
});

test('the cover gives nothing away: no output lit, no range pill, no set named', () => {
  assert.deepEqual(outputsAt(COVER_T), []);
  assert.equal(readoutAt(COVER_T), 'Outputs:');
  const texts = labelsAt(COVER_T).filter(l => l.alpha > 0.05).map(l => l.text);
  for (const s of texts) assert.ok(!/domain|range|never/i.test(s), `cover shows "${s}"`);
  assert.ok(ballAt(COVER_T, 0), 'the first ball is in the air on the cover');
});

test('sound: a click as each ball lands, a knock on the answer, a snap on the cross, whooshes on the fast zooms', () => {
  const clicks = SOUND.hits.filter(h => h.kind === 'click');
  for (const fl of FLIGHTS) assert.ok(clicks.some(h => Math.abs(h.t - (fl.t + fl.dur)) < 1e-9), `no click at ${fl.t + fl.dur}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'snap' && Math.abs(h.t - (GHOST.t + GHOST.dur)) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: domain, codomain and range are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.domain, COLORS.codomain, COLORS.range]) assert.ok(v.includes(c));
  assert.ok(distinguishable(COLORS.domain, COLORS.codomain));
  assert.ok(distinguishable(COLORS.domain, COLORS.range));
  assert.ok(distinguishable(COLORS.codomain, COLORS.range));
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  for (const c of CAPTIONS) assert.ok(!/\b[AB] ·|set A|set B/.test(c.text), `"${c.text}" names a set with an option letter`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
