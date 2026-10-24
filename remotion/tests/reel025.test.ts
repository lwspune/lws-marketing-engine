import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COLORS, N_BALLS, ROWS, SEED, BALLS, countsAt,
  landedBy, ballAt, pegX, pegY, binX, WALL_TOP, FLOOR, pileTop, pileHeight, choose, pegPaths, binPaths, EDGE_PATH, MIDDLE_PATHS,
  middleDoneAt, COIN_PATH, readoutAt, CAMERA, labelsAt, labelBox, discsAt, SOUND, FLAT_AT, EXPECTED_AT,
} from '../src/lib/reel025.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 025 (predict-first, framework F32–F33): 256 balls fall through 8 rows of fair pegs; which bin fills
// most? The middle (A). 70 of the 256 left/right paths end in the middle bin, 1 in each edge bin: Pascal's triangle.
// Caption: NDA 2018 (II) Q107, 8 coins, P(at least 6 heads) = (28 + 8 + 1)/256 = 37/256 (answer (c)).
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const all256 = Array.from({ length: 256 }, (_, n) => Array.from({ length: 8 }, (_, r) => (n >> r) & 1));
const heads = (s: number[]) => s.reduce((a, b) => a + b, 0);

test('the paths, counted: 2⁸ = 256 sequences; bin k gets ⁸Cₖ of them (1 8 28 56 70 56 28 8 1), each peg ʳCⱼ', () => {
  const byBin = Array(9).fill(0); for (const s of all256) byBin[heads(s)]++;
  assert.deepEqual(byBin, [1, 8, 28, 56, 70, 56, 28, 8, 1]);
  assert.deepEqual(binPaths(), byBin);
  for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++) {
    const reach = all256.filter(s => heads(s.slice(0, r)) === j).length / 2 ** (8 - r);
    assert.equal(pegPaths(r, j), reach); assert.equal(pegPaths(r, j), choose(r, j));
  }
  assert.equal(MIDDLE_PATHS.length, 70); assert.ok(MIDDLE_PATHS.every(s => heads(s) === 4));
  assert.equal(new Set(MIDDLE_PATHS.map(s => s.join(''))).size, 70);
  assert.deepEqual(EDGE_PATH, [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(heads(COIN_PATH), 4); assert.equal(COIN_PATH.length, 8);
});

test('NDA 2018 (II) Q107: 8 coins, at least 6 heads = 37/256; the trap line 256 ÷ 9 ≈ 28.4; the answer is the middle', () => {
  assert.equal(all256.filter(s => heads(s) >= 6).length, 37);
  assert.equal(binPaths().slice(6).reduce((a, b) => a + b, 0), 37);
  assert.ok(Math.abs(256 / 9 - 28.44) < 0.01);
  assert.match(OPTIONS[ANSWER], /^A\s+middle$/);
});

test('the balls: 256 fair runs from a seeded generator; a ball\'s bin is its number of rights; the seed rule holds', () => {
  assert.equal(BALLS.length, N_BALLS); assert.equal(N_BALLS, 256);
  for (const b of BALLS) { assert.equal(b.steps.length, 8); assert.equal(b.bin, heads(b.steps)); }
  const c = countsAt(DURATION); assert.equal(c.reduce((a, b) => a + b, 0), 256);
  const exp = binPaths(), sd = exp.map(e => Math.sqrt(256 * (e / 256) * (1 - e / 256)));
  for (let k = 0; k < 9; k++) assert.ok(Math.abs(c[k] - exp[k]) <= sd[k], `bin ${k}: ${c[k]} vs ${exp[k]}`);
  assert.ok(c[4] > Math.max(...c.filter((_, k) => k !== 4)), 'middle tallest at the end');
  const at = countsAt(ANSWER_AT); assert.ok(at[4] >= Math.max(...at.filter((_, k) => k !== 4)) + 5, 'middle clearly tallest at the answer');
  assert.ok(SEED >= 1 && SEED <= 50);
  const rights = BALLS.flatMap(b => b.steps).reduce((a, b) => a + b, 0); // fair coin: ≈ half of 2,048 steps
  assert.ok(Math.abs(rights - 1024) < 3 * Math.sqrt(512), `${rights} rights of 2,048`);
});

test('frame 0: balls in flight, none landed; the cover has ≤ 2 landed and comes before the first caption', () => {
  const flying = BALLS.filter(b => b.release <= 0 && b.lands > 0).length;
  assert.ok(flying >= 30 && landedBy(0) === 0, `${flying} in flight, ${landedBy(0)} landed`);
  assert.ok(landedBy(COVER_T) <= 2); assert.ok(COVER_T < CAPTIONS[0].t0);
  assert.equal(landedBy(DURATION), 256); assert.ok(Math.max(...BALLS.map(b => b.lands)) < 7.7);
});

test('motion from frame 0: some ball moves on every frame of the first 3 s', () => {
  for (let k = 1; k <= 90; k++) {
    const t0 = (k - 1) / 30, t1 = k / 30;
    assert.ok(BALLS.some(b => { const a = ballAt(b, t0), c = ballAt(b, t1); return a && c && (a.x !== c.x || a.y !== c.y); }), `still at frame ${k}`);
  }
});

test('a ball passes over its pegs and settles in its bin\'s pile, inside the walls, never below the floor', () => {
  for (const b of BALLS.slice(0, 40)) {
    for (const t of frames) { const p = ballAt(b, t); if (p) assert.ok(p.y <= FLOOR - 7.9 && p.x >= 72 && p.x <= 1008, `ball out at ${t}`); }
    const end = ballAt(b, DURATION)!; assert.ok(Math.abs(end.x - binX(b.bin)) <= 48 && end.y > WALL_TOP);
  }
});

test('piles fit their bins: the tallest stays below the wall tops and the bin labels; heights match the counts', () => {
  const c = countsAt(DURATION);
  for (let k = 0; k < 9; k++) {
    assert.ok(pileTop(k, DURATION) > WALL_TOP + 20, `bin ${k} pile too tall`);
    assert.ok(Math.abs(FLOOR - pileTop(k, DURATION) - pileHeight(c[k])) < 1e-9);
  }
  assert.equal(pileHeight(0), 0); assert.ok(pileHeight(70) > pileHeight(56) && pileHeight(1) > 0);
});

test('readout: live ball count, then 1 path, 70 paths, 256 paths, then the expected rule and ⁸Cₖ', () => {
  assert.equal(readoutAt(0), '0 / 256 balls');
  assert.equal(readoutAt(7.5), `${landedBy(7.5)} / 256 balls`);
  assert.equal(readoutAt(9.0), 'edge: 1 path');
  assert.equal(readoutAt(12.79), 'middle: 70 paths');
  assert.equal(middleDoneAt(12.75), 70);
  assert.equal(readoutAt(14), '256 paths in all');
  assert.equal(readoutAt(16), 'expected balls = paths');
  assert.equal(readoutAt(18), 'k heads: ⁸Cₖ ways');
  for (const t of frames) assert.ok(!/NaN|undefined/.test(readoutAt(t)));
});

test('labels and discs: inside the picture, no two overlap, on every frame; the trap tag clears the real piles', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const ls = labelsAt(t).filter(l => l.alpha > 0.05), boxes = [...ls.map(labelBox), ...discsAt(t)];
    const names = [...ls.map(l => l.text), ...discsAt(t).map((_, i) => `disc ${i}`)];
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 20 && b.x1 <= 1060 && b.y0 >= 20 && b.y1 <= 1000, `"${names[i]}" out at ${t.toFixed(2)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const own = /^disc (\d+)/.exec(names[j]);        // a peg number sits on its own disc
      if (own && ls[i]?.disc === Number(own[1])) continue;
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${names[i]}" overlaps "${names[j]}" at ${t.toFixed(2)}`);
    }
    const tag = ls.find(l => /all equal/.test(l.text));
    if (tag) { const b = labelBox(tag); for (let k = 0; k < 9; k++) if (binX(k) + 48 > b.x0 && binX(k) - 48 < b.x1) assert.ok(b.y1 < pileTop(k, t) - 4, `tag on bin ${k}'s pile at ${t}`); }
  }
});

test('bin numbers sit inside their bins, a clear row apart from row 7\'s peg numbers, above the pile and its outline', () => {
  for (const t of frames.filter(t => t < END_AT)) for (const l of labelsAt(t).filter(l => l.role === 'bin' && l.alpha > 0.05)) {
    const b = labelBox(l), k = EXPECTED_AT.indexOf(Number(l.text)) >= 0 ? Math.round((l.x - 540) / 104) + 4 : -1;
    assert.ok(b.y0 > WALL_TOP && b.y0 - (pegY(7) + 17) >= 40, `bin number "${l.text}" too close to row 7`);
    assert.ok(b.y1 < pileTop(k, t) - 4 && b.y1 < FLOOR - pileHeight(EXPECTED_AT[k]) - 8, `bin number "${l.text}" on its pile at ${t.toFixed(2)}`);
  }
});

test('the trap line sits at 256 ÷ 9 balls; the expected outline at ⁸Cₖ balls', () => {
  assert.ok(Math.abs(FLAT_AT - 256 / 9) < 1e-9);
  assert.deepEqual(EXPECTED_AT, binPaths());
});

test('camera: two zooms in, one out, a punch-in landing on the answer, smooth, the board inside the frame', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] >= 1.1 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05));
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), [zz, fx, fy] = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(zz - a[0]) < 0.1);
    const sx = (x: number) => 540 + (x - fx) * zz, sy = (y: number) => 515 + (y - fy) * zz;
    assert.ok(sx(72) >= 0 && sx(1008) <= 1080 && sy(948 + 8) <= 1000, `board out at ${frames[i]}`);
  }
});

test('sound: taps as balls land, a knock on the answer, a click per peg on the lone path, whooshes on fast zooms', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap' && h.t < 8).length >= 20);
  assert.ok(SOUND.hits.filter(h => h.kind === 'click' && h.t >= 8 && h.t < 9.8).length === 8);
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && h.t > 15 && h.t < 16));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: balls, lone path and web are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.ball, COLORS.edge, COLORS.web]) assert.ok(v.includes(c));
  assert.ok(distinguishable(COLORS.ball, COLORS.edge) && distinguishable(COLORS.ball, COLORS.web) && distinguishable(COLORS.edge, COLORS.web));
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the expected outline', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.length >= 2);
});

test('pegs: 8 rows, row r has r + 1 pegs, 104 px apart, inside the bins\' span', () => {
  for (let r = 0; r < ROWS; r++) {
    assert.ok(Math.abs(pegX(r, r) - pegX(r, 0) - r * 104) < 1e-9);
    assert.ok(pegX(r, 0) > 72 && pegX(r, r) < 1008 && pegY(r) < WALL_TOP);
  }
  assert.ok(binX(0) - 52 >= 72 - 1e-9 && binX(8) + 52 <= 1008 + 1e-9);
});
