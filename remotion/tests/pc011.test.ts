import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, T_HIT, T_BEND1, T_CRACK1, T_CRACK2, T_BURST, ANSWER_AT, T_SHRINK, T_SECOND, CUT1, CUT2, CUT3, REW0, SECOND_ANSWER_AT, COVER_T,
  LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, SECOND_Q, BRAND, PM, SALT_SLAB, facingPairs, slideCu, slideSalt, splitAt,
  storyTime, sceneAt, bendAt, barShape, hammerAt, SALT, PIECE, piecesAt, cracksAt, supportAt, CAMERA, cameraAt, heroAt, textsAt, CAPTIONS,
  MUSIC_HITS, SOUND, COLOURS, shakeAt,
} from '../src/lib/pc011.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, heightShare, frameProblems } from '../src/lib/layout.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Chemistry, visualised #11 (C45, "Metal bends, salt shatters"): the same hammer, the same hit, on a copper
// bar and a salt crystal. Which shatters? The salt. In a metal, + ions sit in a sea of electrons: layers slide and the sea
// still holds them, so it bends. In a salt, + and − alternate: slide one step and + meets +, − meets −, they push apart and
// the crystal splits along its cube faces. The third Shock reel and the first made under F37 (the aftershock).
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const macro = (t: number) => sceneAt(t) === 'macro';

test('frame 0 (F4, F20, F25 Same start, two endings): the question, three options, the tag; the answer is the salt', () => {
  assert.equal(LABEL, 'CHEMISTRY, VISUALISED  #11');
  assert.deepEqual(HEADER, ['Same hammer. Same hit.', 'Which one shatters?']);
  assert.deepEqual(OPTIONS, ['A  copper', 'B  salt', 'C  both']);
  assert.equal(OPTIONS[ANSWER], 'B  salt');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(words(SHORT_Q) <= 7 && words(SECOND_Q) <= 7);
});

test('F10, the sizes: copper cores touch at 256 pm; Na⁺ and Cl⁻ touch at 282 pm (Shannon radii, 1 pm off)', () => {
  near(2 * PM.Cu, PM.CuSpacing, 1e-9);
  near(PM['Na+'] + PM['Cl-'], PM.NaClSpacing, 1.5);
  assert.equal(PM.CuSpacing, 256);
  assert.equal(PM.NaClSpacing, 282);
});

test('F10, the salt: before the slide every ion faces its opposite across the slip; one step later every pair is alike', () => {
  const before = facingPairs(0), after = facingPairs(1);
  assert.equal(before.length, SALT_SLAB.cols);
  assert.ok(before.every(([below, above]) => below !== above), 'unlike charges across the plane: they attract');
  assert.equal(after.length, SALT_SLAB.cols - 1);
  assert.ok(after.every(([below, above]) => below === above), '+ over +, − over −: they repel');
  assert.ok(after.some(([b]) => b === 'Na+') && after.some(([b]) => b === 'Cl-'));
});

test('F10, the metal: copper\'s layers slide one step and stay a solid (every core keeps touching its neighbours)', () => {
  const end = slideCu(CUT2 - 0.01);
  near(end, 1, 1e-9);
  assert.equal(slideCu(CUT1), 0);
  for (const t of frames.filter(t => sceneAt(t) === 'copper')) assert.ok(splitAt(t) === 0, 'copper never splits');
  assert.equal(slideSalt(CUT2), 0);
  near(slideSalt(T_SECOND + 6), 1, 1e-9);
  assert.ok(splitAt(CUT3 - 0.01) > 0.9, 'the salt splits after its slide');
});

test('F10, the crystal breaks into cubes along its cube faces: 27 equal cubes, the same salt in the same place at the hit', () => {
  const p0 = piecesAt(T_HIT);
  assert.equal(p0.length, 27);
  near(27 * PIECE ** 3, SALT.side ** 3, 1e-12);
  const xs = [...new Set(p0.map(p => +p.pos[0].toFixed(6)))].sort((a, b) => a - b);
  assert.equal(xs.length, 3);
  near(xs[1] - xs[0], PIECE, 1e-9);
  for (const p of p0) assert.ok(Math.abs(p.pos[0] - SALT.x) < SALT.side / 2 && p.pos[1] > SALT.base && p.pos[1] < SALT.base + SALT.side);
});

test('the burst: the pieces fly out only at the burst, never sink into the floor or the block, and are at rest by the time the camera comes back', () => {
  for (const s of [0, T_HIT, T_CRACK2, T_BURST - 0.01]) {
    const ps = piecesAt(s), p0 = piecesAt(0);
    ps.forEach((p, i) => assert.deepEqual(p.pos, p0[i].pos, `pieces still at ${s}`));
  }
  for (let s = T_BURST; s < T_BURST + 3; s += 1 / 60) for (const p of piecesAt(s))
    assert.ok(p.pos[1] - PIECE / 2 >= supportAt(p.pos[0], p.pos[2]) - 0.02, `a piece in the floor at ${s.toFixed(2)}`);
  const late = piecesAt(storyTime(CUT3)), later = piecesAt(storyTime(CUT3) + 0.2);
  late.forEach((p, i) => near(Math.hypot(p.pos[0] - later[i].pos[0], p.pos[1] - later[i].pos[1], p.pos[2] - later[i].pos[2]), 0, 1e-3));
  const moved = piecesAt(storyTime(CUT3)).filter((p, i) => Math.hypot(p.pos[0] - piecesAt(0)[i].pos[0], p.pos[2] - piecesAt(0)[i].pos[2]) > 0.2);
  assert.ok(moved.length >= 15, `most pieces scattered (${moved.length})`);
});

test('the copper bends into a V between its blocks; the ends over the blocks stay on them; no crack', () => {
  assert.equal(bendAt(0), 0);
  assert.equal(bendAt(T_HIT), 0);
  assert.ok(bendAt(T_BEND1) > 0.15, 'a deep V');
  const bar = barShape(T_BEND1);
  const mid = bar.find(p => Math.abs(p.x) < 1e-9)!, atBlock = bar.find(p => Math.abs(Math.abs(p.x) - 0.6) < 1e-9)!;
  near(mid.dy, -bendAt(T_BEND1), 1e-9);
  near(atBlock.dy, 0, 1e-9);
  assert.ok(bar.filter(p => Math.abs(p.x) > 0.6).every(p => p.dy > 0), 'the overhanging ends lift');
});

test('the hammers: the same height and the same speed on both until the hit (same start); each face never goes inside what it hits', () => {
  for (const s of [0, 0.05, 0.1, 0.15]) near(hammerAt('copper', s).lift, hammerAt('salt', s).lift);
  near(hammerAt('copper', T_HIT).lift, 0); near(hammerAt('salt', T_HIT).lift, 0);
  for (let s = 0; s < 6; s += 1 / 60) {
    assert.ok(hammerAt('copper', s).face >= hammerAt('copper', s).surface - 1e-9, `copper hammer at ${s}`);
    assert.ok(hammerAt('salt', s).face >= hammerAt('salt', s).surface - 1e-9, `salt hammer at ${s}`);
  }
});

test('F37, the aftershock: an event about every second in the first 3 s, each with its own sound, none fading out before 3 s', () => {
  const eventHits = SOUND.hits.filter(h => h.t < 3.5 && !h.kind.startsWith('whoosh') && h.kind !== 'tap');
  for (const [a, b] of [[0.1, 0.5], [0.9, 1.6], [1.9, 2.6], [2.9, 3.4]])
    assert.ok(eventHits.some(h => h.t >= a && h.t <= b), `no event between ${a} and ${b} s`);
  assert.ok(T_HIT <= 0.25 && Math.abs(T_BEND1 - 1.2) < 0.2 && Math.abs(T_CRACK2 - 2.2) < 0.2);
  assert.ok(cracksAt(T_CRACK1 + 0.3).length >= 1 && cracksAt(T_CRACK2 + 0.3).length > cracksAt(T_CRACK2 - 0.05).length, 'the cracks grow: the hint');
  assert.ok(T_BURST > 3 && ANSWER_AT > T_BURST, 'the answer lands after 3 s');
  // something moves on every frame of the first 3 s (F5), and no white wash or fade-out on the picture before 3 s
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, hammerAt('copper', storyTime(t)).lift, hammerAt('salt', storyTime(t)).lift, bendAt(storyTime(t)), cracksAt(storyTime(t))]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
  for (const t of frames.filter(t => t < 3)) assert.ok(macro(t));
});

test('the second hook (F26): asked within 1.5 s of the answer, with its own move (a dive into the bend), answered by the slide', () => {
  assert.equal(SECOND_Q, 'So why didn\'t the copper break?');
  assert.ok(T_SECOND - ANSWER_AT <= 1.5 && SECOND_ANSWER_AT > CUT1 && SECOND_ANSWER_AT < CUT2);
  assert.ok(SOUND.hits.some(h => h.kind === 'whoosh-in' && h.t > T_SECOND && h.t < CUT1), 'the dive');
});

test('scenes: macro, the copper\'s atoms, the salt\'s atoms, macro; the story holds while the atoms are on screen', () => {
  assert.equal(sceneAt(0), 'macro'); assert.equal(sceneAt(CUT1 + 0.01), 'copper'); assert.equal(sceneAt(CUT2 + 0.01), 'salt'); assert.equal(sceneAt(CUT3 + 0.01), 'macro');
  near(storyTime(1.7), 1.7);
  assert.ok(storyTime(CUT3 + 0.5) >= T_BURST + 1.5);
  near(storyTime(REW0 - 0.01), storyTime(CUT3));
});

test('F27, the loop: the rewind brings every piece, the bar, the hammers, the camera and the words back to frame 0', () => {
  near(storyTime(DURATION), 0, 1e-9);
  assert.ok(REW0 < DURATION - 1 && REW0 > CUT3 + 1);
  assert.deepEqual(piecesAt(storyTime(DURATION)).map(p => p.pos), piecesAt(0).map(p => p.pos));
  near(bendAt(storyTime(DURATION)), 0);
  for (const k of ['copper', 'salt'] as const) near(hammerAt(k, storyTime(DURATION)).lift, hammerAt(k, 0).lift);
  cameraAt(DURATION).position.forEach((v, i) => near(v, cameraAt(0).position[i], 1e-6));
  const names = (t: number) => textsAt(t).map(x => `${x.name}:${x.text}:${x.alpha.toFixed(2)}`);
  assert.deepEqual(names(DURATION), names(0));
  // the last frame is next to frame 0: no jump back
  const last = frames.at(-1)!;
  assert.ok(Math.hypot(...cameraAt(last).position.map((v, i) => v - cameraAt(0).position[i])) < 0.15);
});

test('camera (F9): smooth except at the three cuts; a punch-in lands on the bend before the dive; whooshes only on fast moves', () => {
  const cuts = [CUT1, CUT2, CUT3];
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1], b = frames[i];
    if (cuts.some(c => a < c && b >= c)) continue;
    const d = Math.hypot(...cameraAt(b).position.map((v, k) => v - cameraAt(a).position[k])) / Math.hypot(...cameraAt(a).position.map((v, k) => v - cameraAt(a).target[k]));
    assert.ok(d < 0.12, `jump at ${b.toFixed(2)} (${d.toFixed(3)})`);
  }
  const bend = project([CAMERA.cuX, 0.6, 0], cameraAt(CUT1 - 0.02), FULL);
  assert.ok(Math.abs(bend.x - 540) < 200 && Math.abs(bend.y - 960) < 400, 'the dive ends on the bend');
  for (const w of SOUND.hits.filter(h => h.kind.startsWith('whoosh'))) assert.ok(w.t > 0.5, 'no whoosh over the shock');
  assert.ok(whooshesFor(CAMERA.macro.start, CAMERA.macro.keys).length >= 1);
});

test('F35: the picture fills the frame (≥ 70 % of the width, or ≥ 60 % of the height) and stays on the page', () => {
  for (const t of frames.filter(t => !(t > T_SECOND && t < CUT1 + 0.9) && !(t > CUT2 - 0.1 && t < CUT2 + 0.1))) {
    const hero = heroAt(t), cam = cameraAt(t);
    const pts = hero.map(p => project(p, cam, FULL));
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.7 || heightShare(pts.map(p => p.y)) >= 0.6, `small picture at ${t.toFixed(2)}`);
    for (const p of pts) assert.ok(p.x > -40 && p.x < 1120 && p.y > 0 && p.y < 1920, `off the page at ${t.toFixed(2)}`);
  }
});

test('F35 + F4: the question opens big, shrinks to one line by 3.6 s; the tag on every frame', () => {
  assert.ok(T_SHRINK >= 2.6 && T_SHRINK <= 3.2);
  const at = (t: number) => textsAt(t).map(x => x.name);
  assert.ok(at(0).includes('header 1') && at(0).includes('chip A') && at(0).includes('tag'));
  assert.ok(!at(T_SHRINK + 0.6).some(n => n.startsWith('chip') || n.startsWith('header')));
  assert.ok(at(T_SHRINK + 0.6).includes('question line'));
  for (const t of frames) assert.ok(at(t).includes('tag'), `tag missing at ${t}`);
});

test('F35: the setups are named under each on the wide shots, the salt\'s tag lights as the answer', () => {
  for (const t of frames.filter(t => macro(t) && t >= 1.0 && t < T_SECOND)) {
    const names = textsAt(t).map(x => x.name);
    assert.ok(names.includes('tag copper') && names.includes('tag salt'), `tags missing at ${t.toFixed(2)}`);
  }
  const answer = textsAt(ANSWER_AT + 0.1).find(x => x.name === 'tag salt')!;
  assert.equal(answer.kind, 'answer');
  assert.equal(answer.text, 'B  salt');
  assert.equal(textsAt(ANSWER_AT - 0.1).find(x => x.name === 'tag salt')!.kind, 'setTag');
});

test('F35: every text inside Instagram\'s safe area and clear of every other text, on every frame', () => {
  for (const t of frames) assert.deepEqual(frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box }))), [], `at ${t.toFixed(2)} s`);
});

test('words (F7) and length (F18)', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= REW0 && DURATION <= 25);
});

test('sound (F14–F16): the hit on both, the bend\'s thump, a crack per crack, the burst, the pieces landing, the slides and the split', () => {
  const at = (kind: string, a: number, b: number) => SOUND.hits.some(h => h.kind === kind && h.t >= a && h.t <= b);
  assert.ok(at('crack', T_HIT - 0.01, T_HIT + 0.05) && at('boom', T_HIT - 0.01, T_HIT + 0.1), 'the hit');
  assert.ok(at('whump', T_BEND1 - 0.1, T_BEND1 + 0.1), 'the bend lands');
  assert.ok(at('crack', T_CRACK1 - 0.05, T_CRACK1 + 0.05) && at('crack', T_CRACK2 - 0.05, T_CRACK2 + 0.05));
  assert.ok(at('boom', T_BURST - 0.05, T_BURST + 0.1), 'the burst');
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap' && h.t > T_BURST && h.t < CUT1).length >= 3, 'pieces landing');
  assert.ok(SOUND.beds.some(b => b.kind === 'scrape' && b.t0 >= CUT2 && b.t1 <= CUT3), 'the salt layer sliding');
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SECOND]);
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION);
});

test('colours (F24): copper, its electrons, Na⁺ and Cl⁻ told apart (colour-blind safe); salt\'s edge and the text readable on the studio', () => {
  assert.ok(distinguishable(COLOURS.na, COLOURS.cl));
  assert.ok(distinguishable(COLOURS.copper, COLOURS.electron));
  assert.ok(contrast(COLOURS.saltEdge, COLOURS.studio) >= 3);
  assert.ok(contrast(COLOURS.muted, COLOURS.studio) >= 4.5 && contrast(COLOURS.ink, COLOURS.studio) >= 4.5);
});

test('F6: the cover is the hit, before any crack, with both setups in view', () => {
  assert.ok(COVER_T >= T_HIT && COVER_T < T_CRACK1 && COVER_T < ANSWER_AT);
  assert.ok(Math.hypot(...shakeAt(COVER_T)) < 0.05, 'not mid-shake');
  assert.ok(heroAt(COVER_T).length > 0);
});
