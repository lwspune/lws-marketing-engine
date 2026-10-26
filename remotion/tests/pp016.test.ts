import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, REW0, T_SHRINK, ANSWER_AT, ANSWER_LIT, COVER_T, SHEET, LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, BRAND, SHEET_TITLE,
  BANDS, ROW_SHOWN, ROW_Y, ICON_X, WAVE_X, REMOTE_WAVE, PRESSES, remoteAt, storyTime, rowIn, CAMERA, cameraAt, heroAt, textsAt,
  CAPTIONS, SOUND, MUSIC_HITS, COLOURS, musicLevel, phoneIn, remoteTilt, tvIn,
} from '../src/lib/pp016.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, heightShare, frameProblems } from '../src/lib/layout.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Physics, visualised #16 (P74, "One spectrum"; framework v1.34): a TV remote talks to the TV with radio,
// infrared or sound? Infrared. The second F39 reel (made to send): the payoff is the whole electromagnetic spectrum, seven
// bands with their uses and NCERT's wavelength ranges, held still as a cheat sheet before the loop.
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test('frame 0 (F4, F20, F25 Everyday puzzle): the question, three options, the tag; the answer is infrared', () => {
  assert.equal(LABEL, 'PHYSICS, VISUALISED  #16');
  assert.deepEqual(HEADER, ['Your TV remote talks', 'to the TV with…']);
  assert.deepEqual(OPTIONS, ['A  radio', 'B  infrared', 'C  sound']);
  assert.equal(OPTIONS[ANSWER], 'B  infrared');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(words(SHORT_Q) <= 7);
});

test('F10, the physics: NCERT\'s seven bands (Class 12, Table 8.1), longest wave first; the remote is infrared', () => {
  assert.deepEqual(BANDS.map(b => b.name), ['radio', 'microwave', 'infrared', 'visible', 'ultraviolet', 'X-ray', 'gamma']);
  assert.deepEqual(BANDS.map(b => b.range), ['> 0.1 m', '0.1 m – 1 mm', '1 mm – 700 nm', '700 – 400 nm', '400 nm – 1 nm', '1 nm – 10⁻³ nm', '< 10⁻³ nm']);
  assert.deepEqual(BANDS.map(b => b.use), ['radio, TV', 'radar, ovens', 'TV remotes', 'what we see', 'sterilising', 'bone scans', 'cancer therapy']);
  for (let i = 1; i < BANDS.length; i++) assert.ok(BANDS[i].lambda < BANDS[i - 1].lambda, 'each row\'s drawn wave is shorter than the one above');
  const ir = BANDS.findIndex(b => b.name === 'infrared');
  near(REMOTE_WAVE, BANDS[ir].lambda);
  assert.ok(!BANDS.some(b => /sound/i.test(b.name)), 'sound is not on the spectrum: it is not light');
});

test('the opening (F25 Everyday puzzle, F37): a press and a burst at 0.2 s, then more (flicking channels), the remote flies up as the camera pulls back by 3 s', () => {
  assert.ok(PRESSES[0] <= 0.15, 'the first burst lands in the first frames');
  assert.ok(PRESSES.length >= 3 && PRESSES.every((p, i) => !i || p - PRESSES[i - 1] <= 0.8), 'a burst at least every 0.8 s');
  for (const p of PRESSES) assert.ok(SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - p) < 1e-9), `a click at ${p}`);
  const events = [...PRESSES, 2.2, 3.0];
  for (let i = 1; i < events.length; i++) assert.ok(events[i] - events[i - 1] <= 1.1, 'a new event about every second');
  assert.ok(CAMERA.start[0] >= 2.5, 'frame 0 is close on the remote');
  const p0 = project(remoteAt(0), cameraAt(0), FULL);
  assert.ok(Math.abs(p0.x - 540) < 140 && p0.y > 620, 'the remote big in the middle, under the question');
});

test('the ladder: rows build top to bottom after the question shrinks, all seven up before the remote comes down', () => {
  for (let i = 0; i < BANDS.length; i++) {
    assert.ok(ROW_SHOWN[i] > T_SHRINK, `row ${i} after the shrink`);
    if (i) assert.ok(ROW_SHOWN[i] > ROW_SHOWN[i - 1]);
    assert.equal(rowIn(i, ROW_SHOWN[i] - 0.01), 0);
    assert.equal(rowIn(i, ROW_SHOWN[i] + 0.5), 1);
  }
  assert.ok(ROW_SHOWN[6] + 0.5 < ANSWER_AT - 0.6);
  for (let i = 1; i < 7; i++) assert.ok(ROW_Y[i] < ROW_Y[i - 1]);
});

test('the answer: the remote docks in the infrared row\'s slot at the answer, after passing radio and microwave', () => {
  const ir = 2, dock = remoteAt(ANSWER_AT);
  near(dock[0], ICON_X); near(dock[1], ROW_Y[ir], 1e-3);
  const before = remoteAt(ANSWER_AT - 0.6);
  assert.ok(before[1] > ROW_Y[ir] + 0.1 && before[1] < ROW_Y[0] + 0.2, 'coming down the ladder');
  const passes = SOUND.hits.filter(h => h.t > ROW_SHOWN[6] && h.t < ANSWER_AT);
  assert.ok(passes.length >= 2, 'a sound as it passes each wrong row');
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  const at = (t: number) => textsAt(t);
  assert.ok(at(ANSWER_AT - 0.3).some(x => x.name === 'use infrared' && x.text === '?'));
  assert.ok(at(ANSWER_AT + 0.4).some(x => x.name === 'use infrared' && x.text === 'TV remotes'));
  assert.ok(at(ANSWER_LIT + 0.3).some(x => x.kind === 'answer' && x.text === OPTIONS[ANSWER]));
  assert.ok(ANSWER_LIT - ANSWER_AT <= 0.6);
});

test('after the answer: the phone camera that sees the remote\'s light, then something else to watch (L62)', () => {
  assert.equal(phoneIn(ANSWER_AT), 0);
  assert.ok(phoneIn(8.5) > 0.9);
  assert.ok(CAPTIONS.some(c => /phone cameras/.test(c.text) && c.t0 > ANSWER_AT));
});

test('F39 made to send: the whole spectrum held still ≥ 1.8 s, every band with its use and range, the title on screen', () => {
  assert.ok(SHEET[1] - SHEET[0] >= 1.8 && SHEET[1] <= REW0);
  const a = SHEET[0] + 0.02, b = SHEET[1] - 0.02;
  assert.deepEqual(cameraAt(a), cameraAt(b));
  assert.deepEqual(remoteAt(a), remoteAt(b));
  const texts = textsAt(a);
  for (const band of BANDS) for (const [k, v] of [['name', band.name], ['use', band.use], ['range', band.range]] as const)
    assert.ok(texts.some(x => x.name === `${k} ${band.name}` && x.text === v), `${k} of ${band.name}`);
  assert.equal(texts.find(x => x.name === 'caption')!.text, SHEET_TITLE);
  assert.ok(words(SHEET_TITLE) <= 7);
  assert.deepEqual(textsAt(a).map(x => [x.name, x.text, x.alpha]), textsAt(b).map(x => [x.name, x.text, x.alpha]));
  assert.ok(!texts.some(x => x.name === 'question line'), 'no double header on the sheet');
});

test('F27 loop: the rewind takes everything back, so the last frame is frame 0', () => {
  near(storyTime(0), 0); near(storyTime(DURATION), 0);
  const r6 = (v: number[]) => v.map(x => +x.toFixed(6));
  assert.deepEqual(r6(cameraAt(DURATION).position), r6(cameraAt(0).position));
  assert.deepEqual(r6(remoteAt(DURATION)), r6(remoteAt(0)));
  assert.deepEqual(textsAt(DURATION).map(x => [x.name, x.text]), textsAt(0).map(x => [x.name, x.text]));
});

test('F35: the ladder fills the frame once the opening is done', () => {
  for (const t of frames.filter(t => t >= 3.3 && t < REW0)) {
    const pts = heroAt(t).map(p => project(p, cameraAt(t), FULL));
    if (!pts.length) continue;
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.7 || heightShare(pts.map(p => p.y)) >= 0.6, `small picture at ${t.toFixed(2)}`);
  }
});

test('F35 + F4: the question opens big, shrinks to one line, comes back big for the loop; the tag stays all reel', () => {
  const at = (t: number) => textsAt(t).map(x => x.name);
  assert.ok(at(0).includes('header 1') && at(0).includes('chip A') && at(0).includes('tag'));
  assert.ok(!at(T_SHRINK + 0.6).some(n => n.startsWith('chip') || n.startsWith('header')));
  assert.ok(at(T_SHRINK + 0.6).includes('question line'));
  for (const t of frames) assert.ok(at(t).includes('tag'), `tag missing at ${t}`);
});

test('F35: every text inside Instagram\'s safe area and clear of every other text, on every frame', () => {
  for (const t of frames) assert.deepEqual(frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box }))), [], `at ${t.toFixed(2)} s`);
});

test('F5: something moves on every frame of the first 3 s', () => {
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, remoteAt(t)]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
});

test('camera (F9): close on the remote, a pull-back, a punch-in on the answer, the two ends, smooth', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 1 && outs >= 2);
  // a modest punch-in: tighter, and the infrared row's labels (the answer's "TV remotes") or the remote fall off the frame
  assert.ok(CAMERA.keys.some(k => k.to[0] > 1.2 && Math.abs(k.t + k.dur - (ANSWER_AT + 0.6)) < 0.25), 'the punch-in lands on the answer');
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
  for (const b of BANDS) assert.ok(words(b.use) <= 3);
});

test('sound (F14, F16): the presses click, each row appears with a tap rising in pitch, a thunk at the answer; the music dips under the hits; whooshes on the camera\'s fast moves', () => {
  for (let i = 0; i < BANDS.length; i++) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - ROW_SHOWN[i]) < 1e-9), `row ${i}`);
  const taps = BANDS.map((_, i) => SOUND.hits.find(h => h.kind === 'tap' && Math.abs(h.t - ROW_SHOWN[i]) < 1e-9)!.pitch!);
  for (let i = 1; i < taps.length; i++) assert.ok(taps[i] > taps[i - 1], 'shorter waves, higher taps');
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh')).map(h => `${h.kind}@${h.t.toFixed(3)}`);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(ws.includes(`${w.kind}@${w.t.toFixed(3)}`));
  assert.ok(musicLevel(ANSWER_AT + 0.05) <= 0.6 && musicLevel(ANSWER_AT + 0.4) >= 0.95 && musicLevel(4.5) <= 0.7 && musicLevel(10.5) <= 0.7);
  for (let i = 1; i < SOUND.hits.length; i++) assert.ok(SOUND.hits[i].t >= SOUND.hits[i - 1].t);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, SHEET[0]]);
});

test('WCAG AA on the dark set: the tag, the words and the answer pill', () => {
  assert.ok(contrast(COLOURS.muted, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.ink, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.board, COLOURS.answer) >= 4.5);
});

test('F6: the cover is taken before the answer, with the whole ladder built and the remote hovering', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T > ROW_SHOWN[6] + 0.5);
  for (let i = 0; i < 7; i++) assert.equal(rowIn(i, COVER_T), 1);
  assert.ok(remoteAt(COVER_T)[1] > ROW_Y[2] + 0.2, 'not docked yet');
});

test('the waves sit in the middle column, between the labels and the objects', () => {
  assert.ok(WAVE_X[0] < WAVE_X[1] && WAVE_X[1] < ICON_X);
});

// The review panel, pass 1 (Drama 4, Colour 5, Motion 5).
test('panel: a row\'s three labels show together or not at all (they dropped out one by one in the punch-in)', () => {
  for (const t of frames) {
    const names = new Set(textsAt(t).map(x => x.name));
    for (const b of BANDS) {
      const n = ['name', 'use', 'range'].filter(k => names.has(`${k} ${b.name}`)).length;
      assert.ok(n === 0 || n === 3, `${b.name} split at ${t.toFixed(2)}`);
    }
  }
});

test('panel: no question line over the phone close-up; the cover\'s words clear its "Guess before you watch" pill', () => {
  assert.ok(!textsAt(8.7).some(x => x.name === 'question line'));
  for (const x of textsAt(COVER_T)) assert.ok(x.box.y + x.box.h <= 1530, `${x.name} under the cover pill`);
});

test('panel: the remote always shows its buttons (tilted to the camera); it docks hard; the TV it flicks leaves before the ladder', () => {
  for (const t of frames) assert.ok(remoteTilt(t) >= 0.6);
  const settle = remoteAt(ANSWER_AT + 0.15)[1];
  assert.ok(settle < ROW_Y[2] - 0.01, 'it overshoots into the slot');
  assert.ok(Math.abs(remoteAt(ANSWER_AT + 0.5)[1] - ROW_Y[2]) < 1e-3, 'and settles');
  assert.equal(tvIn(0), 1);
  assert.equal(tvIn(3.0), 0);
});
