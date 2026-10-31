import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, LABEL, BRAND, SET, SOURCE, SOURCE_BEATS, BEATS, THETA, ALONG, NORMAL, FORCES, FORCE_IDS, force, COMPONENTS,
  EQUATIONS, CLOSER, arrowsAt, textsAt, characterAt, ropeAt, crateCorners, SOUND, MUSIC_HITS, COVER_T, type ForceId,
} from '../src/lib/pvForces.ts';
import { frameProblems } from '../src/lib/layout.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Physics, visualised #17 (idea P7; framework F40, founder 2026-10-31): every force on a crate on a slope,
// copied shot for shot from @sciencevisualised's "Acting Forces on Object" (1.45M views, 83× their typical reel; study
// copy study/reels/Dc9MzBgKwJS.mp4). Four characters of our own, one per force; the soft studio, our words, the tag, a loop.

const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(...a);
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test('F10, the maths: weight splits into mg sin θ down the slope and mg cos θ into it, at 90°, and adds back to mg', () => {
  near(dot(ALONG, NORMAL), 0);
  near(len(ALONG), 1); near(len(NORMAL), 1);
  assert.ok(ALONG[0] > 0 && ALONG[1] > 0, 'the slope rises to the right, as theirs');
  const mg = force('mg'), { sin, cos } = COMPONENTS;
  near(len(sin), len(mg) * Math.sin(THETA));
  near(len(cos), len(mg) * Math.cos(THETA));
  near(dot(sin, cos), 0);
  const sum = add(sin, cos);
  for (const i of [0, 1, 2]) near(sum[i], mg[i]);
  assert.ok(dot(sin, ALONG) < 0, 'mg sin θ points down the slope');
  assert.ok(dot(cos, NORMAL) < 0, 'mg cos θ points into the slope');
  assert.ok(mg[1] < 0 && Math.abs(mg[0]) < 1e-12, 'weight points straight down');
});

test('F10: F pulls up the slope, friction down it, and N balances mg cos θ (N = mg cos θ)', () => {
  near(dot(force('F'), ALONG), len(force('F')));
  near(dot(force('f'), ALONG), -len(force('f')));
  const n = force('N');
  near(dot(n, NORMAL), len(n));
  near(len(n), len(COMPONENTS.cos));
  assert.ok(len(force('F')) > len(force('f')) + len(COMPONENTS.sin), 'F wins: the crate accelerates up the slope (= ma > 0)');
  assert.deepEqual(EQUATIONS, ['F − f − mg sin θ = ma', 'N − mg cos θ = 0', 'N = mg cos θ', 'f = μN']);
});

test('F10: the ropes run along the slope, as F and f do, from the crate\'s faces to the hands', () => {
  for (const id of ['F', 'f'] as const) {
    const r = ropeAt(id, 2.0), d: V = [r.to[0] - r.from[0], r.to[1] - r.from[1], r.to[2] - r.from[2]];
    const c = dot(d, ALONG) / len(d);
    assert.ok(Math.abs(Math.abs(c) - 1) < 1e-3, `${id}'s rope is ${Math.acos(Math.min(1, Math.abs(c))) * 57.3}° off the slope`);
    assert.ok(Math.sign(c) === (id === 'F' ? 1 : -1), `${id}'s rope leads ${id === 'F' ? 'up' : 'down'} the slope`);
  }
  // the crate sits on the slope: its two lower corners on the surface, upright to it
  const [a, b] = crateCorners();
  near(dot(a, NORMAL), 0, 1e-9); near(dot(b, NORMAL), 0, 1e-9);
});

test('F10: the characters who pull stand on the slope; the weight hangs straight down under the crate', () => {
  for (const id of ['F', 'f'] as const) near(dot(characterAt(id, 1.0).feet, NORMAL), 0, 1e-6);
  const g = characterAt('mg', 1.0);
  assert.ok(g.feet[1] < g.hands[1], 'mg hangs below its hands');
  near(g.feet[0], g.hands[0], 0.05);
});

test('F40, copied: the beats land when the source\'s do (within 0.6 s), and the reel is the source\'s length (± 0.5 s)', () => {
  assert.equal(SOURCE.url, 'https://www.instagram.com/reel/Dc9MzBgKwJS/');
  assert.ok(SOURCE.views >= 100_000, 'a proven source (F40, ≥ 100k views)');
  for (const k of Object.keys(SOURCE_BEATS) as (keyof typeof SOURCE_BEATS)[])
    assert.ok(Math.abs(BEATS[k] - SOURCE_BEATS[k]) <= 0.6, `${k}: ours ${BEATS[k]} s, theirs ${SOURCE_BEATS[k]} s`);
  assert.ok(Math.abs(DURATION - SOURCE.duration) <= 0.5);
});

test('frame 0, as theirs: all four forces drawn and named, the scene complete; the label and the tag from frame 0 (F20)', () => {
  assert.equal(LABEL, 'PHYSICS, VISUALISED  #17');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  const a0 = arrowsAt(0).filter(a => a.alpha > 0.9).map(a => a.name);
  for (const id of FORCE_IDS) assert.ok(a0.includes(id), `${id}'s arrow on frame 0`);
  const names = textsAt(0).filter(x => x.alpha > 0.9).map(x => x.name);
  for (const id of FORCE_IDS) assert.ok(names.includes(`name ${id}`), `${id} named on frame 0`);
  for (const t of frames) {
    const xs = textsAt(t);
    assert.ok(xs.some(x => x.kind === 'tag' && x.text === BRAND && x.alpha > 0.5), `tag at ${t.toFixed(2)}`);
    assert.ok(xs.some(x => x.kind === 'label' && x.text === LABEL && x.alpha > 0.5), `label at ${t.toFixed(2)}`);
  }
});

test('the story in order: weight splits at 4.3 s, N appears at 6.3 s, the four equations stack from 7.5 s, the closer at 9.3 s', () => {
  const on = (t: number, name: string) => arrowsAt(t).some(a => a.name === name && a.alpha > 0.9);
  assert.ok(!on(BEATS.split - 0.1, 'mg sin') && on(BEATS.split + 0.6, 'mg sin') && on(BEATS.split + 0.6, 'mg cos'));
  assert.ok(on(BEATS.normal + 0.6, 'N'));
  const eqs = (t: number) => textsAt(t).filter(x => x.kind === 'equation' && x.alpha > 0.9).map(x => x.text);
  assert.deepEqual(eqs(BEATS.eq1 - 0.05), []);
  assert.deepEqual(eqs(BEATS.eq4 + 0.4), EQUATIONS);
  assert.ok(eqs(BEATS.eq2 - 0.05).length === 1 && eqs(BEATS.eq3 - 0.05).length === 2, 'one line at a time');
  assert.ok(textsAt(BEATS.remember + 0.3).some(x => x.kind === 'closer' && x.text === CLOSER && x.alpha > 0.9));
  assert.ok(!textsAt(BEATS.remember - 0.1).some(x => x.kind === 'closer' && x.alpha > 0.01));
  assert.notEqual(CLOSER, 'Remember this.', 'our words, not theirs');
});

test('F27, the loop: the last frame is frame 0 (same texts, same arrows)', () => {
  const sig = (t: number) => ({
    texts: textsAt(t).filter(x => x.alpha > 0.02).map(x => `${x.name}:${x.text}:${x.alpha.toFixed(2)}`).sort(),
    arrows: arrowsAt(t).filter(a => a.alpha > 0.02).map(a => `${a.name}:${a.alpha.toFixed(2)}`).sort(),
  });
  assert.deepEqual(sig(DURATION), sig(0));
  for (const id of FORCE_IDS) {
    const a = characterAt(id, 0), b = characterAt(id, DURATION);
    for (const i of [0, 1, 2]) near(a.hands[i], b.hands[i], 1e-3);
    near(a.lean, b.lean, 1e-3);
  }
});

test('F35, F7: every text inside the safe area, none colliding, on every frame; labels of 7 words or fewer', () => {
  for (const t of frames) assert.deepEqual(frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box }))), [], `at ${t.toFixed(2)} s`);
  // the words: equations and the parts' maths are the source's content (F40 wins over F7 there), not labels
  for (const t of frames) for (const x of textsAt(t).filter(x => x.kind !== 'equation' && x.kind !== 'part'))
    assert.ok(x.text.split(/\s+/).length <= 7, `"${x.text}"`);
});

test('F24: the four force colours are told apart, and every coloured text reads on the studio white', () => {
  for (let i = 0; i < FORCE_IDS.length; i++) for (let j = i + 1; j < FORCE_IDS.length; j++)
    assert.ok(distinguishable(FORCES[FORCE_IDS[i]].colour, FORCES[FORCE_IDS[j]].colour), `${FORCE_IDS[i]} vs ${FORCE_IDS[j]}`);
  for (const id of FORCE_IDS) assert.ok(contrast(FORCES[id].ink, SET) >= 4.5, `${id}'s text ${contrast(FORCES[id].ink, SET).toFixed(2)}:1`);
});

test('sound: hits inside the reel, in order; a tap for each equation line; the split and N get an accent', () => {
  const ts = SOUND.hits.map(h => h.t);
  assert.deepEqual(ts, [...ts].sort((a, b) => a - b));
  assert.ok(ts.every(t => t >= 0 && t <= DURATION));
  for (const k of ['eq1', 'eq2', 'eq3', 'eq4'] as const) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - BEATS[k]) < 0.05), k);
  for (const k of ['split', 'normal'] as const) assert.ok(SOUND.hits.some(h => h.kind === 'snap' && Math.abs(h.t - BEATS[k]) < 0.05), k);
  assert.ok(MUSIC_HITS.every(t => t > 0 && t < DURATION));
  assert.ok(COVER_T > 0 && COVER_T < DURATION);
});

test('every force id has its character, colour and name', () => {
  const ids: ForceId[] = ['F', 'f', 'N', 'mg'];
  assert.deepEqual(FORCE_IDS, ids);
  for (const id of ids) assert.ok(FORCES[id].name.length > 0 && characterAt(id, 0));
});
