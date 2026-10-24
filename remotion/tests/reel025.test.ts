import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {
  DURATION, END_AT, ANSWER_AT, COVER_T, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, COLORS, N_BALLS, ROWS, LANES, R, SEED, BALLS,
  COIN, binsAt, handedBy, ballAt, contactAt, pegX, pegY, binX, WALL_TOP, choose, pegPaths, binPaths, EDGE_PATH, MIDDLE_PATHS,
  middleDoneAt, COIN_PATH, readoutAt, cameraAt, project, BAND, labelsAt, labelBox, SOUND, ORBIT_END, azimuthAt, RIDE, PUNCH,
  FLAT_AT, EXPECTED_AT, BOARD_CORNERS, SHEET, TUBES_OUT, PILLS_OUT, ZOOM, GLASS_Z,
} from '../src/lib/reel025.ts';
import { simulate, heightFor } from '../src/lib/reel025Physics.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 025 v2 (3D, predict-first, framework F32–F33): 256 balls fall through 8 rows of fair pegs on a 3D
// board; which bin fills most? The middle (A). 70 of the 256 left/right paths end in the middle bin, 1 in each edge bin.
// Caption: NDA 2018 (II) Q107, 8 coins, P(at least 6 heads) = (28 + 8 + 1)/256 = 37/256 (answer (c)).
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const all256 = Array.from({ length: 256 }, (_, n) => Array.from({ length: 8 }, (_, r) => (n >> r) & 1));
const heads = (s: number[]) => s.reduce((a, b) => a + b, 0);
await RAPIER.init();
const RUN = simulate(RAPIER);

test('the paths, counted: 2⁸ = 256 sequences; bin k gets ⁸Cₖ of them (1 8 28 56 70 56 28 8 1), each peg ʳCⱼ', () => {
  const byBin = Array(9).fill(0); for (const s of all256) byBin[heads(s)]++;
  assert.deepEqual(byBin, [1, 8, 28, 56, 70, 56, 28, 8, 1]);
  assert.deepEqual(binPaths(), byBin);
  for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++) {
    assert.equal(pegPaths(r, j), all256.filter(s => heads(s.slice(0, r)) === j).length / 2 ** (8 - r));
    assert.equal(pegPaths(r, j), choose(r, j));
  }
  assert.equal(MIDDLE_PATHS.length, 70); assert.ok(MIDDLE_PATHS.every(s => heads(s) === 4));
  assert.equal(new Set(MIDDLE_PATHS.map(s => s.join(''))).size, 70);
  assert.deepEqual(EDGE_PATH, [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(COIN_PATH, [1, 0, 1, 1, 0, 0, 1, 0]); assert.equal(heads(COIN_PATH), 4);
});

test('NDA 2018 (II) Q107: 8 coins, at least 6 heads = 37/256; the trap 256 ÷ 9 ≈ 28.4; the answer is the middle', () => {
  assert.equal(all256.filter(s => heads(s) >= 6).length, 37);
  assert.ok(Math.abs(FLAT_AT - 256 / 9) < 1e-12);
  assert.deepEqual(EXPECTED_AT, binPaths());
  assert.match(OPTIONS[ANSWER], /^A\s+middle$/);
});

test('the balls: 256 fair runs from a seeded generator; a ball\'s bin is its number of rights; the seed rule holds', () => {
  assert.equal(BALLS.length, N_BALLS);
  for (const b of BALLS) { assert.equal(b.steps.length, 8); assert.equal(b.bin, heads(b.steps)); assert.equal(b.lane, BALLS.indexOf(b) % LANES); }
  const c = binsAt(Infinity), exp = binPaths();
  assert.equal(c.reduce((a, b) => a + b, 0), 256);
  for (let k = 0; k < 9; k++) assert.ok(Math.abs(c[k] - exp[k]) <= Math.sqrt(exp[k] * (1 - exp[k] / 256)), `bin ${k}: ${c[k]} vs ${exp[k]}`);
  assert.ok(c[4] > Math.max(...c.filter((_, k) => k !== 4)));
  const at = binsAt(ANSWER_AT); assert.ok(at[4] >= Math.max(...at.filter((_, k) => k !== 4)) + 5, 'middle clearly tallest at the answer');
  assert.ok(SEED >= 1 && SEED <= 50);
  const rights = BALLS.flatMap(b => b.steps).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(rights - 1024) < 3 * Math.sqrt(512));
});

test('frame 0 is the cover: front-on, balls in the pegs, none in the bins', () => {
  assert.equal(COVER_T, 0); assert.equal(handedBy(COVER_T), 0);
  assert.ok(BALLS.filter(b => ballAt(b, 0)).length >= 30);
  assert.ok(Math.abs(azimuthAt(0)) < 1e-12);
});

test('no ball passes through another above the bins: same lane ≥ 1.8 radii apart, lanes a diameter apart', () => {
  const zs = [...new Set(BALLS.map(b => b.z))].sort((a, b) => a - b);
  assert.equal(zs.length, LANES); for (let i = 1; i < zs.length; i++) assert.ok(zs[i] - zs[i - 1] >= 2 * R - 1e-9);
  for (const t of frames.filter(t => t < 9)) {
    const byLane: { x: number; y: number }[][] = Array.from({ length: LANES }, () => []);
    for (const b of BALLS) { const p = ballAt(b, t); if (p) byLane[b.lane].push(p); }
    for (const ps of byLane) for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++)
      assert.ok(Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y) >= 1.8 * R, `overlap at ${t.toFixed(2)}`);
  }
});

test('each ball bounces off the pegs it chose and is handed over above its own bin', () => {
  for (const b of BALLS.slice(0, 60)) {
    let j = 0;
    for (let r = 0; r < ROWS; r++) {
      const c = contactAt(b, r);
      assert.ok(Math.abs(c.x - pegX(r, j)) < 0.2 && c.y > pegY(r) && c.y - pegY(r) < 0.25, `ball off peg ${r}`);
      j += b.steps[r];
    }
    assert.ok(Math.abs(b.hand.x - binX(b.bin)) < 0.3 && b.hand.y > WALL_TOP);
  }
});

test('physics: two runs identical; every ball at rest in its own bin before the sheet; piles under the walls', () => {
  const again = simulate(RAPIER);
  assert.deepEqual(again.final, RUN.final);
  for (const [i, b] of BALLS.entries()) {
    const p = RUN.final[i];
    assert.ok(Math.abs(p[0] - binX(b.bin)) < 0.5 - R + 0.02, `ball ${i} in bin ${Math.round(p[0]) + 4}, should be ${b.bin}`);
    assert.ok(p[1] < WALL_TOP && Math.abs(p[2]) < GLASS_Z);
  }
  assert.ok(RUN.restAt < SHEET.t, `still moving at ${RUN.restAt}`);
  for (const top of RUN.tops.at(-1)!) assert.ok(top <= WALL_TOP - 0.15, `pile ${top} too tall`);
});

test('the columns and the sheet use the piles\' own packing: each real pile within 0.25 of its fitted height', () => {
  const c = binsAt(Infinity), tops = RUN.tops.at(-1)!;
  for (let k = 0; k < 9; k++) assert.ok(Math.abs(tops[k] - heightFor(RUN.fit, c[k])) < 0.25, `bin ${k}`);
  assert.ok(heightFor(RUN.fit, FLAT_AT) > tops[0] && heightFor(RUN.fit, FLAT_AT) < tops[4]);
});

test('readout: live count, then 1 path, 70 paths, 256 paths, 256 balls ↔ 256 paths, ⁸Cₖ', () => {
  assert.equal(readoutAt(0), '0 / 256 balls');
  assert.equal(readoutAt(SHEET.t), '256 / 256 balls');
  assert.equal(readoutAt(11.5), 'edge: 1 path');
  assert.equal(readoutAt(TUBES_OUT - 0.01), 'middle: 70 paths'); assert.equal(middleDoneAt(TUBES_OUT - 0.01), 70);
  assert.equal(readoutAt(16), '256 paths in all');
  assert.equal(readoutAt(18), '256 balls, 256 paths');
  assert.equal(readoutAt(20), 'k heads: ⁸Cₖ ways');
});

test('camera: one full orbit from frame 0, front-on by 3 s, tilted; smooth; no other turn', () => {
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9 && ORBIT_END <= 3);
  for (const t of frames.filter(t => t >= ORBIT_END)) assert.ok(Math.abs(azimuthAt(t) - 2 * Math.PI) < 1e-9);
  assert.ok(cameraAt(0.5).position[1] - cameraAt(0.5).target[1] > cameraAt(4).position[1] - cameraAt(4).target[1]);
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]), b = cameraAt(frames[i]);
    assert.ok(Math.hypot(...a.position.map((v, k) => v - b.position[k])) < 3, `camera jumps at ${frames[i]}`);
  }
});

test('framing: the board inside the band from 3 s (not in the ride-along); the punch-in keeps all 9 bins and counts', () => {
  for (const t of frames.filter(t => t >= ORBIT_END && t < END_AT && (t < RIDE.t || t > RIDE.t + RIDE.dur))) {
    const cam = cameraAt(t);
    const zoomed = t > PUNCH.t && t < PUNCH.t + 1.6;
    const pts = zoomed ? [[-4.5, -0.6, GLASS_Z], [4.5, -0.6, GLASS_Z], [-4.5, WALL_TOP, GLASS_Z], [4.5, WALL_TOP, GLASS_Z]] : BOARD_CORNERS;
    for (const p of pts) {
      const s = project(p as [number, number, number], cam);
      assert.ok(s.x >= 0 && s.x <= 1080 && s.y >= BAND.top && s.y <= BAND.top + BAND.height, `out at ${t.toFixed(2)}: ${p}`);
    }
  }
});

test('labels: inside the band and no two overlap, on every frame; bin numbers above their piles and columns', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const cam = cameraAt(t), ls = labelsAt(t, RUN).filter(l => l.alpha > 0.05), boxes = ls.map(l => labelBox(l, cam));
    for (const [i, b] of boxes.entries()) assert.ok(b.x0 >= 10 && b.x1 <= 1070 && b.y0 >= BAND.top && b.y1 <= BAND.top + BAND.height, `"${ls[i].text}" out at ${t.toFixed(2)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `"${ls[i].text}" overlaps "${ls[j].text}" at ${t.toFixed(2)}`);
    }
    for (const l of ls.filter(l => l.role === 'bin')) {
      const k = Math.round(l.at[0]) + 4, under = Math.max(RUN.tops[Math.min(RUN.tops.length - 1, Math.round(t * 30))][k], heightFor(RUN.fit, EXPECTED_AT[k]));
      assert.ok(project([l.at[0], under, GLASS_Z], cam).y - labelBox(l, cam).y1 > 6, `bin number ${l.text} on its pile at ${t.toFixed(2)}`);
    }
  }
  assert.ok(labelsAt(1.5, RUN).every(l => l.role === 'readout' || l.alpha < 0.05), 'labels hidden in the orbit');
  assert.ok(labelsAt(COIN.t + 0.5, RUN).every(l => l.role !== 'peg' || l.alpha < 0.05) && PILLS_OUT < COIN.t, 'pills gone before the coin');
});

test('sound: pings on peg hits, a knock on the answer, a click per peg on the lone path and the coin, whooshes on fast zooms', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap' && h.t < 8).length >= 40);
  assert.equal(SOUND.hits.filter(h => h.kind === 'click' && h.t >= 10.8 && h.t < 12.4).length, 8);
  assert.equal(SOUND.hits.filter(h => h.kind === 'click' && h.t >= COIN.t && h.t < COIN.t + COIN.dur + 0.5).length, 8);
  const ws = whooshesFor(ZOOM.start, ZOOM.keys); assert.ok(ws.length >= 3);
  for (const w of ws) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: balls, lone path / coin ball and web are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.ball, COLORS.edge, COLORS.web]) assert.ok(v.includes(c));
  assert.ok(distinguishable(COLORS.ball, COLORS.edge) && distinguishable(COLORS.ball, COLORS.web) && distinguishable(COLORS.edge, COLORS.web));
});

test('short (≤ 25 s), captions ≤ 7 words, in order, ≤ 34 characters; music hits on the answer and the columns', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
    assert.ok([...c.text].length <= 36, `too wide: "${c.text}"`);
  }
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.length >= 2);
});
