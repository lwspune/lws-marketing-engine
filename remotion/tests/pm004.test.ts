import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, LABEL, BRAND, TITLE, SOURCE, SOURCE_BEATS, BEATS, GEARS, GEAR_IDS, xTurns, turns, angle, countersAt, cardAt,
  headlineAt, titleAt, rateTagsAt, SET, counterBumpAt, textsAt, mascotAt, cameraAt, gearPoints, SOUND, MUSIC_HITS, COVER_T, type GearId,
} from '../src/lib/pm004.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, frameProblems, widthShare } from '../src/lib/layout.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Maths, visualised #4 (idea M10; framework F40, the first imitation, founder 2026-10-28): the chain rule as a
// gear train, copied shot for shot from @learnara.math's "Chain Rule visualized!" (86k views, 7.1× their typical reel;
// study copy study/reels/DerDcmpqINc.mp4). Ours: the soft studio in 3D, our words, the V mascot, the tag, a loop.

const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const frac = (v: number) => v - Math.round(v);

test('F10, the maths: u turns twice per turn of x, y three times per turn of u, so y turns 6 times per turn of x', () => {
  assert.equal(GEARS.x.teeth / GEARS.u.teeth, 2);
  assert.equal(GEARS.u.teeth / GEARS.y.teeth, 3);
  for (const t of [0, 5.3, 14.2, 28.1]) {
    near(turns('u', t), 2 * turns('x', t), 1e-9);
    near(turns('y', t), 3 * turns('u', t), 1e-9);
  }
  // the gears really mesh: same tooth size, centres a pitch radius apart, on one line
  for (const id of GEAR_IDS) near(GEARS[id].r / GEARS[id].teeth, GEARS.x.r / GEARS.x.teeth, 1e-9);
  near(GEARS.u.cx - GEARS.y.cx, GEARS.u.r + GEARS.y.r, 1e-9);
  near(GEARS.x.cx - GEARS.u.cx, GEARS.x.r + GEARS.u.r, 1e-9);
  // meshing gears turn opposite ways: x and y one way, u the other
  const d = (id: GearId) => Math.sign(angle(id, 5.0) - angle(id, 4.5));
  assert.equal(d('x'), d('y'));
  assert.equal(d('u'), -d('x'));
});

test('F10: where the teeth meet, a tooth of one gear sits in a gap of the other, all reel long', () => {
  // how far (in teeth) the contact point is from a tooth's centre on each gear: 0 = a tooth there, ½ = a gap. x and u
  // touch at x's left (π) and u's right (0); u and y at u's left (π) and y's right (0). The two gears turn opposite ways,
  // so one count rises as the other falls: their sum stays at ½ (a tooth of one in a gap of the other) as they turn.
  const toothPhase = (id: GearId, at: number, t: number) => ((at - angle(id, t)) / (2 * Math.PI)) * GEARS[id].teeth;
  for (const t of [0, 3.3, 9.0, 17.0, 33.9]) {
    near(frac(toothPhase('x', Math.PI, t) + toothPhase('u', 0, t) - 0.5), 0, 1e-6);
    near(frac(toothPhase('u', Math.PI, t) + toothPhase('y', 0, t) - 0.5), 0, 1e-6);
  }
});

test('F40, copied: the beats land when the source\'s do (within 0.6 s), and the reel is the source\'s length', () => {
  assert.equal(SOURCE.url, 'https://www.instagram.com/reel/DerDcmpqINc/');
  for (const k of Object.keys(SOURCE_BEATS) as (keyof typeof SOURCE_BEATS)[])
    assert.ok(Math.abs(BEATS[k] - SOURCE_BEATS[k]) <= 0.6, `${k}: ours ${BEATS[k]} s, theirs ${SOURCE_BEATS[k]} s`);
  assert.ok(Math.abs(DURATION - SOURCE.duration) <= 0.5);
});

test('frame 0: the gears already turning under the title; the tag and the series label from frame 0 (F20)', () => {
  assert.deepEqual(TITLE, ['Chain Rule', 'Visualised']);
  assert.equal(LABEL, 'MATHS, VISUALISED  #4');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(xTurns(1 / 30) > xTurns(0), 'x turns from frame 0');
  for (const t of frames) assert.ok(textsAt(t).some(x => x.kind === 'tag' && x.text === BRAND && x.alpha > 0.5), `tag at ${t.toFixed(2)}`);
  assert.ok(titleAt(1.2) > 0.9 && titleAt(BEATS.lesson + 0.4) < 0.01);
});

test('no still stretch before the lesson: the gears keep turning on every frame until 3 s (motion report: 0.1% at 2.6 s)', () => {
  for (const t of frames.filter(t => t > 0 && t < BEATS.lesson - 1 / 30)) assert.ok(xTurns(t) > xTurns(t - 1 / 30) + 1e-4, `still at ${t.toFixed(2)}`);
  near(xTurns(BEATS.lesson), 1.0, 1e-9);
});

test('the counters tell the story: 2 turns of u, then 3 of y, then 6 of y for one turn of x', () => {
  const at = (t: number) => Object.fromEntries(countersAt(t).map(c => [c.id, c.n]));
  assert.deepEqual(at(BEATS.uRate - 0.3), { u: 2, x: 1 });
  assert.deepEqual(at(BEATS.yRate - 0.3), { y: 3, u: 1 });
  assert.deepEqual(at(BEATS.reveal + 0.1), { y: 6, x: 1 });
  assert.deepEqual(at(BEATS.multiply - 0.3), { y: 3, u: 2 });    // y counts per u turn, u twice
  assert.deepEqual(at(BEATS.summary + 0.5), { y: 6, u: 2, x: 1 });
  assert.deepEqual(at(1.0), {}, 'no counters under the title');
  // a counter only ever goes up by one, and only while its gear turns
  for (let i = 1; i < frames.length; i++) for (const c of countersAt(frames[i])) {
    const prev = countersAt(frames[i - 1]).find(p => p.id === c.id);
    if (prev) assert.ok(c.n - prev.n === 0 || c.n - prev.n === 1 || c.n === 0, `${c.id} jumps at ${frames[i].toFixed(2)}`);
  }
});

test('the card: "?", the wrong guess 3 + 2 = 5?, it breaks into 6, then 3 + 3, then 3 × 2, then the chain rule', () => {
  const seq = [
    [BEATS.lesson + 0.5, '?'], [BEATS.guess + 0.5, '3 + 2 = 5?'], [BEATS.reveal + 0.8, '6'], [BEATS.steps + 0.5, '? + ? = 6'],
    [BEATS.multiply - 0.2, '3 + 3 = 6'], [BEATS.multiply + 0.5, '3 × 2 = 6'], [BEATS.chainRule + 0.5, 'dy/du × du/dx = 6'],
    [BEATS.everyLink + 0.5, 'dy/dx = dy/du · du/dx'],
  ] as const;
  for (const [t, text] of seq) assert.equal(cardAt(t)?.text, text, `at ${t}`);
  assert.equal(cardAt(BEATS.guess + 0.5)?.tone, 'wrong');
  assert.equal(cardAt(BEATS.multiply + 0.5)?.tone, 'right');
  assert.ok(cardAt(BEATS.reveal + 0.1)?.shatter! > 0, 'the 3 + 2 breaks apart as the 6 lands');
  assert.equal(cardAt(1.0), null, 'no card under the title');
  // the half-filled card waits for the counter: "3 + ?" only once u has made its first turn
  const firstU = frames.find(t => t > BEATS.steps && countersAt(t).find(c => c.id === 'u')?.n === 1)!;
  assert.ok(cardAt(firstU - 0.1)?.text === '? + ? = 6' && cardAt(firstU + 0.2)?.text === '3 + ? = 6', `at ${firstU}`);
});

test('the rate tags appear when each rate is found and stay: du/dx = 2, then dy/du = 3', () => {
  assert.equal(rateTagsAt(BEATS.uRate - 0.2).du, 0);
  assert.ok(rateTagsAt(BEATS.uRate + 0.5).du > 0.9 && rateTagsAt(BEATS.uRate + 0.5).dy === 0);
  assert.ok(rateTagsAt(BEATS.yRate + 0.5).dy > 0.9);
  assert.ok(rateTagsAt(BEATS.summary + 1).du > 0.9 && rateTagsAt(BEATS.summary + 1).dy > 0.9);
});

test('our words, short (F7 where the source leaves it open): every headline ≤ 7 words; none is the source\'s line', () => {
  const theirs = ['How fast does y spin?', 'Turn x once', 'u spins 2× as fast as x', 'Now turn u once', 'y spins 3× as fast as u',
    'Add them? 3 + 2 = 5', 'Turn x once. Is it 5?', '6, not 5!', 'Each u turn: 3 y turns', 'Multiply: 3 × 2 = 6', "That's the chain rule",
    'Every link multiplies', 'The chain rule'];
  const seen = new Set<string>();
  for (const t of frames) { const h = headlineAt(t); if (h) seen.add(h.title); }
  assert.ok(seen.size >= 11, `${seen.size} headlines`);
  for (const h of seen) {
    assert.ok(h.split(/\s+/).length <= 7, h);
    assert.ok(!theirs.includes(h), `"${h}" is their wording`);
  }
});

test('F35/F20 layout: every text inside the safe area and clear of the others, on every frame', () => {
  for (const t of frames) {
    const problems = frameProblems(textsAt(t).filter(x => x.alpha > 0.05));
    assert.deepEqual(problems, [], `at ${t.toFixed(2)}`);
  }
});

test('the gear train fills the width, and the words stay above the gears', () => {
  for (const t of [1, 5, 16, 28]) {
    const pts = gearPoints(t).map(p => project(p, cameraAt(t), FULL));
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.8, `width ${widthShare(pts.map(p => p.x)).toFixed(2)} at ${t}`);
    const gearTop = Math.min(...pts.map(p => p.y));
    for (const x of textsAt(t).filter(x => ['headline', 'sub', 'card'].includes(x.kind) && x.alpha > 0.05))
      assert.ok(x.box.y + x.box.h <= gearTop + 10, `${x.name} over the gears at ${t}`);
  }
});

test('F24: the three gears are told apart by everyone (colour-blind too) and stand out on the white set', () => {
  const ids = GEAR_IDS;
  for (let i = 0; i < ids.length; i++) {
    assert.ok(contrast(GEARS[ids[i]].colour, SET) >= 3, `${ids[i]} on the set`);
    for (let j = i + 1; j < ids.length; j++) assert.ok(distinguishable(GEARS[ids[i]].colour, GEARS[ids[j]].colour), `${ids[i]} vs ${ids[j]}`);
  }
});

test('the mascot: V (our brand, never theirs) reacts: thinks at the guess, laughs at the 6', () => {
  assert.equal(mascotAt(BEATS.guess + 0.5).pose, 'think');
  assert.equal(mascotAt(BEATS.reveal + 0.5).pose, 'laugh');
  for (const t of frames) assert.ok(['idle', 'talk', 'think', 'laugh'].includes(mascotAt(t).pose));
});

test('F27, the loop: the last frame is frame 0 (gears at the same place and speed, the title back)', () => {
  const dt = 1 / 30;
  for (const id of GEAR_IDS) {
    // the same pose: the gear's angle, modulo one tooth's turn and a whole turn alike
    near(frac(turns(id, DURATION) - turns(id, 0)), 0, 1e-9);
    near((turns(id, DURATION) - turns(id, DURATION - dt)), (turns(id, dt) - turns(id, 0)), 2e-3);
  }
  near(titleAt(DURATION), titleAt(0), 1e-6);
  assert.deepEqual(textsAt(DURATION).map(x => x.name).sort(), textsAt(0).map(x => x.name).sort());
});

test('sound: a click on every counter step, a thunk on the wrong guess, a crack as it breaks, a shimmer on the tick', () => {
  const hitsNear = (kind: string, t: number, eps = 0.05) => SOUND.hits.some(h => h.kind === kind && Math.abs(h.t - t) <= eps);
  for (let i = 1; i < frames.length; i++) for (const c of countersAt(frames[i])) {
    const prev = countersAt(frames[i - 1]).find(p => p.id === c.id);
    if (prev && c.n === prev.n + 1) assert.ok(['click', 'snap', 'crack'].some(k => hitsNear(k, frames[i], 0.04)), `a sound for ${c.id} → ${c.n} at ${frames[i].toFixed(2)}`);
  }
  assert.ok(hitsNear('thunk', BEATS.guess));
  assert.ok(hitsNear('crack', BEATS.reveal));
  assert.ok(hitsNear('shimmer', BEATS.multiply));
  assert.deepEqual(SOUND.hits.map(h => h.t), [...SOUND.hits.map(h => h.t)].sort((a, b) => a - b));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION && h.gain > 0 && h.gain <= 1);
  assert.deepEqual(MUSIC_HITS, [BEATS.reveal]);   // one music accent: the break is the peak (Sound, pass 1)
  assert.ok(COVER_T > 0 && COVER_T < BEATS.lesson, 'the cover is the title over the gears');
});

test('panel pass 1 (Drama, Motion): words on screen on every frame; the gears move again from 31 s; counters bump as they tick', () => {
  for (const t of frames) assert.ok(textsAt(t).some(x => ['title', 'headline', 'card'].includes(x.kind) && x.alpha > 0.3) || t < BEATS.title + 0.2 || t > BEATS.end,
    `no words at ${t.toFixed(2)}`);
  assert.ok(xTurns(31.3) > xTurns(31.0) + 1e-4 && xTurns(30.9) === xTurns(30.0), 'the spin-up for the loop starts at 31 s');
  const tick = frames.find(t => t > 4 && countersAt(t).find(c => c.id === 'u')?.n === 1)!;
  assert.ok(counterBumpAt('u', tick) > 0.9 && counterBumpAt('u', tick + 0.4) === 0);
});

test('panel pass 1 (Sound): one click a frame at most; the break at 16 s is the biggest hit, alone on its frame', () => {
  const clicks = SOUND.hits.filter(h => h.kind === 'click');
  assert.equal(new Set(clicks.map(h => h.t.toFixed(3))).size, clicks.length, 'two clicks on one frame stack into a level jump');
  const crack = SOUND.hits.find(h => h.kind === 'crack')!;
  assert.ok(crack.gain >= 0.9 && SOUND.hits.every(h => h === crack || h.gain < crack.gain), 'the crack is the loudest hit');
  assert.ok(!SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - BEATS.reveal) < 0.15), 'no click smearing the crack');
  assert.ok(SOUND.music!(BEATS.reveal) < 0.6, 'the music dips under the crack, not after it');
  for (const h of SOUND.hits.filter(h => h.kind === 'tap' || h.kind === 'click')) assert.ok(h.gain >= 0.5, `${h.kind} at ${h.t} too quiet`);
});
