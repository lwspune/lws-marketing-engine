import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, T_HIT, T_BEND1, T_CRACK1, T_CRACK2, T_BURST, ANSWER_AT, T_SHRINK, T_SECOND, CUT1, CUT2, CUT3, REW0, SECOND_ANSWER_AT, COVER_T, T_LIKE, T_SPLIT,
  LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, SECOND_Q, BRAND, PM, SALT_SLAB, facingPairs, slideCu, slideSalt, splitAt,
  storyTime, sceneAt, bendAt, barShape, hammerAt, SALT, BAR, PIECE, piecesAt, cracksAt, supportAt, CAMERA, cameraAt, heroAt, textsAt, CAPTIONS,
  MUSIC_HITS, SOUND, COLOURS, shakeAt, WIDE, flashAt, chipsAt, shardsAt, dustCloudAt, MACRO_CUTS, sparksAt,
} from '../src/lib/pc011.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, heightShare, frameProblems } from '../src/lib/layout.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Chemistry, visualised #11 (C45, "Metal bends, salt shatters"): the same hammer, the same hit, on a copper
// bar and a salt crystal. Which shatters? The salt. In a metal, + ions sit in a sea of electrons: layers slide and the sea
// still holds them, so it bends. In a salt, + and − alternate: slide one step and + meets +, − meets −, they push apart and
// the crystal splits along its cube faces. The third Shock reel and the first made under F37 (the aftershock). Remade the
// same day for drama (founder: "not dramatic enough, pretty bland"): a dark set, a close-up opening, a real impact, a
// violent shatter.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const macro = (t: number) => sceneAt(t) === 'macro';
const wide = (t: number) => WIDE.some(([a, b]) => t >= a && t < b);
const saltOnPage = (t: number) => project([SALT.x, SALT.base + SALT.side / 2, 0], cameraAt(t), FULL);

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

// The review panel (F38), first run: Drama 5, Colour 5, Motion 6, Sound 5. These are its must-fixes, as tests.
test('panel: the burst has a cause: both hammers wind up and strike again at the burst (the first blow cracks, the second shatters)', () => {
  for (const k of ['copper', 'salt'] as const) {
    assert.ok(hammerAt(k, T_BURST - 0.25).lift > 0.4, `${k} hammer raised before the second blow`);
    near(hammerAt(k, T_BURST - 1e-6).lift, 0, 1e-4);   // in contact as it bursts
  }
  assert.ok(bendAt(T_BURST + 0.3) > bendAt(T_BURST - 0.1) + 0.03, 'the copper bends further, still whole');
  assert.ok(SOUND.hits.filter(h => h.t >= T_BURST - 0.05 && h.t <= T_BURST + 0.35 && h.kind !== 'tap').length <= 3, 'the burst not smeared under a pile of hits (pass 2)');
});

test('panel: the copper bends on camera (the whip lands at 1 s on a bar still mostly straight); the flash is short; the answer is held close', () => {
  assert.ok(bendAt(MACRO_CUTS[0]) < 0.2 * bendAt(T_BEND1), 'the bar still nearly straight when the cut lands on it (pass 2: the bend was over)');
  assert.ok(bendAt(T_BEND1) > 0.2, 'a deep V');
  assert.ok(flashAt(T_HIT + 0.15) < 0.1 && flashAt(T_BURST + 0.15) < 0.1, 'a flash of 2–3 frames, not a white-out');
  assert.ok(!wide(ANSWER_AT + 0.3) && Math.abs(saltOnPage(ANSWER_AT + 0.3).x - 540) < 260, 'the debris held close after the answer');
  assert.ok(WIDE[0][0] >= 4.2 && WIDE[0][1] - WIDE[0][0] >= 0.35, 'then a two-shot before the second question');
  const face = project([SALT.x, hammerAt('salt', 0).face + 0.21, 0], cameraAt(0), FULL);
  assert.ok(face.y > 520 && face.y < 1500, `frame 0: the hammer head below the question (${Math.round(face.y)} px)`);
});

test('panel (sound): a clang where metal is hit, the music shaped (a riser into the burst, a hole for it, a lift for the second question, quiet at the loop seam), whooshes on time', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'clang' && Math.abs(h.t - T_BEND1) < 0.05), 'the copper rings as its bend lands, on screen');
  assert.ok(!SOUND.hits.some(h => h.kind === 'clang' && h.t < MACRO_CUTS[0]), 'no metal ring over the salt close-up (pass 2: salt cracks, copper rings)');
  const shock = SOUND.hits.filter(h => Math.abs(h.t - T_HIT) < 0.05).reduce((a, h) => a + h.gain, 0);
  const cracks = SOUND.hits.filter(h => h.kind === 'crack' && h.t > 1 && h.t < T_BURST - 0.1);
  assert.ok(cracks.every(h => h.gain >= 0.3 * 0.55 - 1e-9) && cracks.length >= 4, 'the cracks loud enough to hear (pass 2)');
  assert.ok(shock >= 0.5, 'a heavier shock');
  const m = SOUND.music!;
  assert.ok(m, 'a music curve');
  assert.ok(m(2.5) < 0.6 && m(3.05) > m(2.5) + 0.15, 'no swell at 2.5 s: a riser into the burst');
  for (const t of [3.15, 3.25, 3.35]) assert.ok(m(t) <= 0.5, `the burst plays nearly alone (${t})`);
  assert.ok(m(T_SECOND - 0.4) >= 0.9 && m(T_SECOND + 0.05) >= 1.1, 'no sag before the second question, a lift on it (pass 2)');
  assert.ok(m(DURATION - 0.05) < 0.3, 'quiet at the loop seam');
  const whoosh = SOUND.hits.filter(h => h.kind.startsWith('whoosh'));
  assert.ok(whoosh.some(h => h.kind === 'whoosh-in' && h.t + 0.45 >= T_SECOND - 0.1 && h.t + 0.45 <= T_SECOND + 0.15), 'the dive whoosh peaks on the second question');
  assert.ok(!whoosh.some(h => h.t > ANSWER_AT - 0.1 && h.t < T_SECOND - 0.6), 'no stray whoosh between the answer and the dive');
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
  assert.ok(SOUND.hits.some(h => h.kind === 'whoosh-in' && h.t + 0.45 >= T_SECOND && h.t + 0.45 < CUT1), 'the dive (its whoosh peaks on the question)');
});

test('scenes: macro, the copper\'s atoms, the salt\'s atoms, macro; the story holds while the atoms are on screen', () => {
  assert.equal(sceneAt(0), 'macro'); assert.equal(sceneAt(CUT1 + 0.01), 'copper'); assert.equal(sceneAt(CUT2 + 0.01), 'salt'); assert.equal(sceneAt(CUT3 + 0.01), 'macro');
  near(storyTime(1.7), 1.7);
  assert.ok(storyTime(CUT3 + 0.5) >= T_BURST + 1.5);
  near(storyTime(REW0 - 0.01), storyTime(CUT3));
});

test('F27, the loop: the rewind brings every piece, the bar, the hammers, the camera and the words back to frame 0', () => {
  near(storyTime(DURATION), 0, 1e-9);
  assert.ok(REW0 < DURATION - 1 && REW0 > CUT3 + 1 && REW0 < CUT3 + 1.3, 'a short recap before the rewind (pass 2: it held 1.7 s)');
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
  const cuts = [...MACRO_CUTS, CUT1, CUT2, CUT3];
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

test('F35: on the wide shots and the atoms the picture fills the frame (≥ 70 % of the width, or ≥ 60 % of the height) and stays on the page', () => {
  for (const t of frames.filter(t => (wide(t) || !macro(t)) && !(t > T_SECOND && t < CUT1 + 0.9) && !(t > CUT2 - 0.1 && t < CUT2 + 0.1) && !(t > T_LIKE && t < T_SPLIT + 0.8))) {
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
  const after = WIDE.find(([a]) => a > ANSWER_AT && a < T_SECOND);
  assert.ok(after, 'a wide shot after the answer');
  for (const t of frames.filter(t => wide(t) && t < T_SECOND && t - WIDE.find(([a, b]) => t >= a && t < b)![0] > 0.25)) {
    const names = textsAt(t).map(x => x.name);
    assert.ok(names.includes('tag copper') && names.includes('tag salt'), `tags missing at ${t.toFixed(2)}`);
  }
  const answer = textsAt(after![0] + 0.3).find(x => x.name === 'tag salt')!;
  assert.equal(answer.kind, 'answer');
  assert.equal(answer.text, 'B  salt');
  assert.ok(!textsAt(ANSWER_AT - 0.1).some(x => x.kind === 'answer'), 'no answer before it lands');
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

test('colours (F24): copper, its electrons, Na⁺ and Cl⁻ told apart (colour-blind safe); salt\'s edge and the text readable on the dark set', () => {
  assert.ok(distinguishable(COLOURS.na, COLOURS.cl));
  assert.ok(distinguishable(COLOURS.copper, COLOURS.electron));
  assert.ok(contrast(COLOURS.saltEdge, COLOURS.board) >= 3 && contrast(COLOURS.copper, COLOURS.board) >= 3);
  assert.ok(contrast(COLOURS.muted, COLOURS.board) >= 4.5 && contrast(COLOURS.ink, COLOURS.board) >= 4.5);
});

test('F6: the cover is the hit in close-up, chips in the air, before any crack and past the flash', () => {
  assert.ok(COVER_T > T_HIT && COVER_T < T_CRACK1 && COVER_T < ANSWER_AT);
  assert.ok(flashAt(COVER_T) < 0.3, 'the flash has faded');
  assert.ok(chipsAt(storyTime(COVER_T)).length >= 10, 'chips in the air');
  const c = saltOnPage(COVER_T);
  assert.ok(Math.abs(c.x - 540) < 260 && c.y > 700 && c.y < 1500, 'the crystal mid-page');
});

test('drama: a close-up opening; the hit flashes, shakes, throws chips; the burst flashes, throws 150+ shards (some at the camera) and a cloud of salt dust', () => {
  const c0 = cameraAt(0), s0 = saltOnPage(0), y = SALT.base + SALT.side / 2, z = SALT.side / 2;
  const width = project([SALT.x + SALT.side / 2, y, z], c0, FULL).x - project([SALT.x - SALT.side / 2, y, z], c0, FULL).x;
  assert.ok(Math.abs(s0.x - 540) < 200 && width > 0.3 * 1080, `frame 0 close on the crystal (${Math.round(width)} px wide)`);
  assert.equal(flashAt(0), 0);
  assert.ok(flashAt(T_HIT + 0.03) > 0.7 && flashAt(T_HIT + 0.6) < 0.05, 'a flash at the hit, gone fast');
  assert.ok(flashAt(T_BURST + 0.03) > 0.7, 'a flash at the burst');
  assert.ok(Math.hypot(...shakeAt(T_HIT + 0.02)) > 0.04, 'a hard shake');
  assert.equal(chipsAt(T_HIT - 0.01).length, 0);
  assert.ok(chipsAt(T_HIT + 0.3).length >= 20);
  assert.equal(shardsAt(T_BURST - 0.01).length, 0);
  const sh = shardsAt(T_BURST + 0.15), later = shardsAt(T_BURST + 0.3);
  assert.ok(sh.length >= 150, `${sh.length} shards`);
  assert.ok(sh.filter((p, i) => later[i].pos[2] - p.pos[2] > 0.08).length >= 20, 'shards flying at the camera');
  for (let s = T_BURST; s < T_BURST + 2.5; s += 0.05) for (const p of shardsAt(s)) assert.ok(p.pos[1] >= supportAt(p.pos[0], p.pos[2]) - 1e-6, `a shard under the floor at ${s.toFixed(2)}`);
  assert.ok(dustCloudAt(T_BURST + 0.3).length >= 20 && dustCloudAt(T_BURST + 3).length === 0, 'a cloud that clears');
  assert.ok(!wide(0.5) && !wide(1.0), 'the close-up holds through the hit');
  assert.ok(!WIDE.some(([a]) => a < T_BURST), 'no wide, still shot before the burst (F37: it settled at 1.4–2.7 s, 1–2 % of pixels moving)');
  const bend = project([CAMERA.cuX, BAR.base, 0], cameraAt(T_BEND1), FULL);
  assert.ok(Math.abs(bend.x - 540) < 260 && bend.y > 500 && bend.y < 1500, 'the copper bend in close-up as it lands');
  assert.ok(Math.abs(saltOnPage(T_CRACK2 + 0.2).x - 540) < 260, 'the crystal in close-up as the cracks branch');
  assert.ok(!wide(T_BURST), 'the burst in close-up');
});

test('panel pass 2: hard cuts, not whip-pans; the first blow wounds the crystal; the split is a burst; amber sparks where steel hits steel', () => {
  assert.equal(MACRO_CUTS.length, 2);
  assert.ok(MACRO_CUTS[0] > T_HIT + 0.3 && MACRO_CUTS[0] < 1 && MACRO_CUTS[1] > T_BEND1 && MACRO_CUTS[1] < 1.9, 'cut to the copper, cut back to the salt');
  for (const c of MACRO_CUTS) assert.ok(SOUND.hits.some(h => h.kind === 'snap' && Math.abs(h.t - c) < 0.03), `a snap on the cut at ${c}`);
  assert.ok(cracksAt(T_HIT + 0.3).length >= 1, 'the first blow cracks it');
  assert.ok(chipsAt(T_HIT + 0.3).some(c => c.size >= 0.08), 'and knocks a corner off');
  assert.ok(flashAt(T_SPLIT + 0.03) > 0.5 && flashAt(T_SPLIT + 0.3) < 0.1, 'the atomic split flashes');
  assert.equal(sparksAt(T_BURST).length, 0);
  assert.ok(sparksAt(T_BURST + 0.25).length >= 12, 'sparks as the hammer hits the steel block');
  for (const t of [MACRO_CUTS[1] + 0.05, 2.0, 2.4]) assert.ok(Math.abs(saltOnPage(t).x - 540) < 280, `on the crystal at ${t}`);
});
