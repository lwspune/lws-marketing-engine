import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ANSWER_AT, ANSWER_LIT, T_SHRINK, COVER_T, SHEET, REW0, LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, BRAND, MEMBERS, START_ORDER, FLOOD,
  LANDS, GLASS, indicatorColour, liquidColour, floodAt, glassPos, storyTime, stripX, CAMERA, cameraAt, heroAt, textsAt, CAPTIONS,
  SHEET_TITLE, MUSIC_HITS, SOUND, COLOURS, STRIP, LIFT, TAG_DY, stripIn, stripTopY, dropperAt, dropAt, CAPTIONS as CAPS, type Id,
} from '../src/lib/pc012.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, frameProblems } from '../src/lib/layout.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Chemistry, visualised #12 (C9, "The pH chart"; framework v1.34): seven everyday liquids get a drop of
// universal indicator, sort themselves along a pH strip, and milk lands last, just below 7: slightly acidic. The first
// F39 reel (made to send): the payoff is the whole chart, held still as a cheat sheet before the loop.
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const rgb = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const IDS = MEMBERS.map(m => m.id);

test('frame 0 (F4, F20, F25 You\'d think): the question, three options, the tag; the answer is "acidic"', () => {
  assert.equal(LABEL, 'CHEMISTRY, VISUALISED  #12');
  assert.deepEqual(HEADER, ['One drop of indicator.', 'Milk is…']);
  assert.deepEqual(OPTIONS, ['A  acidic', 'B  neutral', 'C  basic']);
  assert.equal(OPTIONS[ANSWER], 'A  acidic');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(words(SHORT_Q) <= 7);
});

test('F10, the chemistry: seven everyday liquids at their typical pH, in order; milk is just below 7', () => {
  assert.deepEqual(MEMBERS.map(m => [m.name, m.pH]), [
    ['lemon juice', 2], ['soda water', 4], ['milk', 6.5], ['water', 7], ['baking soda', 8], ['soap', 10], ['drain cleaner', 13],
  ]);
  for (let i = 1; i < MEMBERS.length; i++) assert.ok(MEMBERS[i].pH > MEMBERS[i - 1].pH);
  const milk = MEMBERS.find(m => m.id === 'milk')!;
  assert.ok(milk.pH > 6 && milk.pH < 7, 'milk: slightly acidic (6.4–6.8)');
  assert.ok(!MEMBERS.some(m => /bleach/.test(m.name)), 'no bleach: it bleaches the indicator itself');
});

test('F10, universal indicator: red in acid, green at 7, blue to violet in base', () => {
  const [r2, g2, b2] = rgb(indicatorColour(2)), [r7, g7, b7] = rgb(indicatorColour(7)), [r13, g13, b13] = rgb(indicatorColour(13));
  assert.ok(r2 > 180 && g2 < 90 && b2 < 90, 'pH 2 red');
  assert.ok(g7 > r7 + 60 && g7 > b7 + 60, 'pH 7 green');
  assert.ok(b13 > g13 + 60 && r13 > g13, 'pH 13 violet');
  const [r4, g4] = rgb(indicatorColour(4));
  assert.ok(r4 > 200 && g4 > 90 && g4 < 180, 'pH 4 orange');
  const [r10, g10, b10] = rgb(indicatorColour(10));
  assert.ok(b10 > r10 + 80 && b10 > g10 + 40, 'pH 10 blue');
  const [r65, g65] = rgb(indicatorColour(6.5));
  assert.ok(r65 > 100 && g65 > 150, 'pH 6.5 yellow-green');
});

test('frame 0 and the opening (F2, F25 Colour flood, F37 aftershock): colour from frame 0, milk by 0.6 s, a new event about every second to 3 s (F37), each with its sound', () => {
  const times = IDS.map(id => FLOOD[id]).sort((a, b) => a - b);
  assert.ok(times[0] <= 0.1, 'the first colour lands in the first frames');
  assert.ok(FLOOD.milk <= 0.6, 'milk floods early');
  const events = [...times, ...SOUND.hits.filter(h => (h.kind === 'snap' || h.kind === 'shimmer') && h.t < 3).map(h => h.t), 3.0].sort((a, b) => a - b);
  for (let i = 1; i < events.length; i++) assert.ok(events[i] - events[i - 1] <= 1.0, `a quiet gap before ${events[i]} s`);
  const snap = SOUND.hits.find(h => h.kind === 'snap')!;
  assert.ok(snap.t > T_SHRINK && snap.t < 4.0, 'the strip locks after the question shrinks, before the sort');
  for (const t of times.filter(t => t >= 0)) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - t) < 1e-9), `a drop sound at ${t}`);
  assert.ok(IDS.some(id => floodAt(id, 0) > 0.2), 'colour already running on frame 0');
  for (const id of IDS) { if (FLOOD[id] >= 0) assert.equal(floodAt(id, 0), 0); assert.equal(floodAt(id, 3.5), 1); }
  assert.ok(START_ORDER.indexOf('milk') === 3, 'milk in the middle for the close-up');
});

test('the sort: every glass ends in pH order on its own slot; milk lands last, at the answer; nothing collides (glasses that cross pass in different depth lanes)', () => {
  const xs = (t: number) => IDS.map(id => glassPos(id, t)[0]);
  const end = xs(SHEET[0]);
  for (let i = 1; i < end.length; i++) assert.ok(end[i] > end[i - 1] + 2 * GLASS.r, 'sorted left to right by pH');
  near(LANDS.milk, ANSWER_AT);
  for (const id of IDS) if (id !== 'milk') assert.ok(LANDS[id] < LANDS.milk);
  for (const t of frames.filter(t => t < REW0)) {
    const ps = IDS.map(id => glassPos(id, t));
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++)
      if (Math.abs(ps[i][1] - ps[j][1]) < GLASS.h)
        assert.ok(Math.hypot(ps[i][0] - ps[j][0], ps[i][2] - ps[j][2]) >= 2 * GLASS.r, `${IDS[i]} hits ${IDS[j]} at ${t.toFixed(2)}`);
  }
  for (const id of IDS) { assert.equal(glassPos(id, 0)[1], 0); assert.equal(glassPos(id, SHEET[0])[1], 0); }
});

test('F39 made to send: the whole chart held still ≥ 1.8 s, every glass named with its pH, the title on screen', () => {
  assert.ok(SHEET[1] - SHEET[0] >= 1.8 && SHEET[1] <= REW0);
  const a = SHEET[0] + 0.02, b = SHEET[1] - 0.02;
  assert.deepEqual(cameraAt(a), cameraAt(b));
  for (const id of IDS) { assert.deepEqual(glassPos(id, a), glassPos(id, b)); assert.equal(liquidColour(id, a), liquidColour(id, b)); }
  const texts = textsAt(a), names = texts.map(x => x.name);
  for (const m of MEMBERS) {
    assert.ok(texts.some(x => x.name === `name ${m.id}` && x.text.replace('\n', ' ') === m.name), `${m.name} named`);
    assert.ok(texts.some(x => x.name === `pH ${m.id}` && x.text === `pH ${m.pH}`), `${m.name} pH`);
  }
  assert.ok(names.includes('caption') && texts.find(x => x.name === 'caption')!.text === SHEET_TITLE);
  assert.ok(words(SHEET_TITLE) <= 7);
  assert.deepEqual(textsAt(a).map(x => [x.name, x.text, x.alpha]), textsAt(b).map(x => [x.name, x.text, x.alpha]), 'the words hold still too');
  for (const n of ['acid', 'neutral', 'base']) assert.ok(names.includes(n), `${n} under the strip`);
});

test('F27 loop: the rewind takes everything back, so the last frame is frame 0', () => {
  near(storyTime(0), 0); near(storyTime(DURATION), 0);
  assert.ok(storyTime(REW0 - 0.01) > ANSWER_AT);
  const cam = (t: number) => cameraAt(t).position.map(v => +v.toFixed(6));
  assert.deepEqual(cam(DURATION), cam(0));
  for (const id of IDS) {
    assert.deepEqual(glassPos(id, DURATION).map(v => +v.toFixed(6)), glassPos(id, 0).map(v => +v.toFixed(6)));
    assert.equal(liquidColour(id, DURATION), liquidColour(id, 0));
  }
  assert.deepEqual(textsAt(DURATION).map(x => [x.name, x.text]), textsAt(0).map(x => [x.name, x.text]));
});

test('the answer: milk\'s pH and the lit option only once it lands; "?" over it while it hovers', () => {
  const at = (t: number) => textsAt(t);
  assert.ok(!at(ANSWER_AT - 0.05).some(x => x.name === 'pH milk'));
  assert.ok(at(ANSWER_AT - 0.5).some(x => x.name === 'pH milk?' && x.text === '?'));
  assert.ok(at(ANSWER_AT + 0.3).some(x => x.name === 'pH milk' && x.text === 'pH 6.5'));
  assert.ok(at(ANSWER_LIT + 0.3).some(x => x.kind === 'answer' && x.text === OPTIONS[ANSWER]));
  assert.ok(ANSWER_LIT - ANSWER_AT <= 0.6, 'the option lights within a beat of the landing');
  for (const m of MEMBERS) if (m.id !== 'milk') assert.ok(at(LANDS[m.id] + 0.3).some(x => x.name === `pH ${m.id}`), `${m.id} pH on landing`);
});

test('F35: the row fills the frame (≥ 70 % of the width) once the opening is done', () => {
  for (const t of frames.filter(t => t >= 3 && t < REW0)) {
    const pts = heroAt(t).map(p => project(p, cameraAt(t), FULL));
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.7, `small picture at ${t.toFixed(2)}`);
  }
});

test('F35 + F4: the question opens big, then shrinks to one line; it comes back big for the loop; the tag stays all reel', () => {
  const at = (t: number) => textsAt(t).map(x => x.name);
  assert.ok(at(0).includes('header 1') && at(0).includes('chip A') && at(0).includes('tag'));
  assert.ok(!at(T_SHRINK + 0.6).some(n => n.startsWith('chip') || n.startsWith('header')));
  assert.ok(at(T_SHRINK + 0.6).includes('question line'));
  for (const t of frames) assert.ok(at(t).includes('tag'), `tag missing at ${t}`);
});

test('F35: every text inside Instagram\'s safe area and clear of every other text, on every frame', () => {
  for (const t of frames) assert.deepEqual(frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box }))), [], `at ${t.toFixed(2)} s`);
});

test('F35: no caption or answer sits on the pH strip (a 3D object, so the text tests miss it)', () => {
  for (const t of frames) {
    if (stripIn(t) < 0.5) continue;
    for (const x of textsAt(t).filter(x => x.kind === 'caption' || x.kind === 'answer'))
      assert.ok(x.box.y + x.box.h + 12 <= stripTopY(t), `${x.name} on the strip at ${t.toFixed(2)}`);
  }
});

test('F5: something moves on every frame of the first 3 s', () => {
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, IDS.map(id => liquidColour(id, t)), dropperAt(t), IDS.map(id => dropAt(id, t))]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
});

test('camera (F9): starts close on the milk, pulls back; a punch-in on the answer; smooth', () => {
  assert.ok(CAMERA.start[0] >= 1.8, 'frame 0 is close on milk and its neighbours');
  const p0 = project(glassPos('milk', 0), cameraAt(0), FULL);
  assert.ok(Math.abs(p0.x - 540) < 120, 'the milk glass in the middle of frame 0');
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 1 && outs >= 2);
  assert.ok(CAMERA.keys.some(k => k.to[0] > 1.5 && Math.abs(k.t + k.dur - (ANSWER_AT + 0.6)) < 0.25), 'the punch-in lands on the answer');
  const at = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (let i = 1; i < frames.length; i++) {
    const a = at(frames[i - 1]), b = at(frames[i]);
    assert.ok(Math.abs(Math.log(b[0] / a[0])) < 0.15 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 0.3, `jump at ${frames[i]}`);
  }
});

test('words (F7) and length (F18)', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(DURATION <= 25);
  for (const m of MEMBERS) assert.ok(words(m.name) <= 3);
});

test('sound (F14): a tap per drop and per landing, a snap as the strip locks, a thunk at the answer, whooshes on fast moves only', () => {
  for (const id of IDS) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - LANDS[id]) < 1e-9) || id === 'milk', `${id} lands`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'snap'));
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh')).map(h => `${h.kind}@${h.t.toFixed(3)}`);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(ws.includes(`${w.kind}@${w.t.toFixed(3)}`), `the camera's ${w.kind} at ${w.t}`);
  for (let i = 1; i < SOUND.hits.length; i++) assert.ok(SOUND.hits[i].t >= SOUND.hits[i - 1].t);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, SHEET[0]]);
});

test('WCAG AA on the dark set: the tag and the words ≥ 4.5:1; the answer\'s dark text on its amber fill ≥ 4.5:1', () => {
  assert.ok(contrast(COLOURS.muted, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.ink, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.board, COLOURS.answer) >= 4.5);
});

test('F6: the cover is taken before the answer and the shrink, with every tube full (panel: a half-filled tube looked broken)', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T < T_SHRINK);
  for (const id of IDS) assert.equal(floodAt(id, COVER_T), 1, `${id} full on the cover`);
});

test('panel pass 1: milk is tagged from frame 0 to the shrink, and on the last frame (the loop)', () => {
  assert.ok(textsAt(0).some(x => x.name === 'milk tag' && x.text === 'milk'), 'milk tag on frame 0');
  for (const t of frames.filter(t => t < T_SHRINK)) {
    const m = glassPos('milk', t), on = project([m[0], m[1] + GLASS.liquid - TAG_DY, m[2] + GLASS.r], cameraAt(t), FULL), tag = textsAt(t).find(x => x.name === 'milk tag');
    if (tag) assert.ok(Math.abs(tag.x - on.x) < 1, `the tag sits on the milk tube at ${t.toFixed(2)}`);
    else assert.ok(on.x < 60 || on.x > 900, `milk in view without its tag at ${t.toFixed(2)}`);   // hidden only off-page or under the buttons
  }
  assert.ok(textsAt(DURATION).some(x => x.name === 'milk tag'));
  assert.ok(!textsAt(T_SHRINK + 0.5).some(x => x.name === 'milk tag'));
});

test('panel pass 1: a dropper puts each drop in; it is over milk with a drop falling on frame 0, and each drop lands in its tube\'s mouth', () => {
  const d0 = dropperAt(0), m0 = glassPos('milk', 0);
  assert.ok(d0 && Math.abs(d0[0] - m0[0]) < 1e-6, 'over the milk at frame 0');
  assert.ok(dropAt('milk', 0), 'a drop already falling into the milk');
  for (const id of IDS) if (FLOOD[id] > 0) {
    const d = dropAt(id, FLOOD[id] - 0.02), g = glassPos(id, FLOOD[id]);
    assert.ok(d && Math.abs(d[0] - g[0]) < 1e-6 && d[1] < GLASS.h && d[1] > GLASS.liquid, `${id}: the drop is inside the tube's mouth as it lands`);
  }
  for (let i = 0; i < frames.length; i++) if (frames[i] < 3) assert.ok(dropperAt(frames[i]) === null || dropperAt(frames[i])![1] > GLASS.h, 'the dropper stays above the tubes');
});

test('panel pass 1: a lifted tube never reaches the strip', () => {
  assert.ok(LIFT + GLASS.h < STRIP.y0 - 0.02);
});

test('panel pass 1: each pan has landed before its caption comes in', () => {
  const acids = CAPS.find(c => /acids/.test(c.text))!, bases = CAPS.find(c => /bases/.test(c.text))!;
  const landed = (t: number) => { const k = CAMERA.keys.filter(k => k.t <= t).at(-1)!; return t >= k.t + k.dur - 0.06; };
  assert.ok(landed(acids.t0) && landed(bases.t0));
  const title = CAPS.find(c => c.text === SHEET_TITLE)!;
  assert.ok(landed(title.t0) || title.t0 >= SHEET[0] - 0.5);
});

test('the strip: pH 1 to 14 left to right, under the row', () => {
  assert.ok(stripX(1) < stripX(7) && stripX(7) < stripX(14));
  near(stripX(7), 0);
});

test('the start order is a shuffle: not already in pH order', () => {
  assert.notDeepEqual([...START_ORDER], IDS);
  assert.deepEqual([...START_ORDER].sort(), [...IDS].sort());
});

const _types: Id = 'milk';
void _types;

// The Sound critic (F38, on the final MP4): the landing taps were 12–22 dB under the music, the answer's thunk didn't punch
// through (no dip, a whoosh 0.1 s later), and a music beat ran 0.15 s ahead of the strip's snap.
test('sound (F16, panel): the music dips under the landings, the strip\'s snap and the answer\'s thunk; the reveals ring out; the loop seam fades', () => {
  const m = SOUND.music!;
  for (const id of IDS) if (id !== 'milk') assert.ok(m(LANDS[id]) <= 0.6, `music down under ${id}'s landing`);
  assert.ok(m(ANSWER_AT + 0.05) <= 0.6, 'a dip for the thunk');
  assert.ok(m(3.65) <= 0.55, 'a dip for the snap');
  assert.ok(m(ANSWER_AT + 0.35) >= 0.95 && m(SHEET[0] + 0.1) >= 0.95, 'the two reveals at full level');
  assert.ok(m(DURATION) <= 0.15, 'faded at the loop seam');
  const landTaps = SOUND.hits.filter(h => h.kind === 'tap' && IDS.some(id => id !== 'milk' && Math.abs(h.t - LANDS[id]) < 1e-9));
  assert.ok(landTaps.every(h => h.gain >= 0.45), 'landing taps loud enough to count');
  const near = SOUND.hits.filter(h => h.kind.startsWith('whoosh') && Math.abs(h.t - ANSWER_AT) < 0.3);
  assert.ok(near.every(h => h.gain <= 0.15), 'no loud whoosh on top of the thunk');
  assert.ok(SOUND.hits.some(h => Math.abs(h.t - ANSWER_LIT) < 1e-9), '"A acidic" lights with a sound');
  assert.ok(SOUND.hits.some(h => h.kind.startsWith('whoosh') && h.t > 9.6 && h.t < 10.3), 'the move to the base end has its whoosh, like the acid end');
});
