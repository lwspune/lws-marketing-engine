import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, REW0, T_SHRINK, ANSWER_AT, ANSWER_LIT, COVER_T, SHEET, LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, BRAND, SHEET_TITLE,
  MEMBERS, DROPS, EXCESS, cloudAt, liquidColour, tubeX, dropperAt, dropAt, storyTime, CAMERA, cameraAt, heroAt, textsAt,
  CAPTIONS, SOUND, MUSIC_HITS, COLOURS, musicLevel, type Id,
} from '../src/lib/pc013.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, frameProblems } from '../src/lib/layout.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { contrast } from '../src/lib/paint.ts';
import { readFileSync } from 'node:fs';

// @pyqvault_ · Chemistry, visualised #13 (C49, "Hydroxide clouds"; framework v1.34): a drop of NaOH into four metal salts
// makes four coloured clouds; iron(III) chloride's is rust-brown. The third F39 reel (made to send): the payoff is the
// salt-analysis table, every ion with its hydroxide and colour, held still as a cheat sheet before the loop.

test('panel pass 2: the excess stirs aluminium\'s white layer back up, then thins it in three steps you can see', () => {
  assert.ok(cloudAt('al', EXCESS[0] + 0.35).settle < 0.1, 'stirred back up through the tube');
  const a = EXCESS.map(d => cloudAt('al', d + 0.3).amount);
  assert.ok(a[0] > a[1] + 0.2 && a[1] > a[2] + 0.2, `three steps: ${a.map(v => v.toFixed(2))}`);
  assert.ok(cloudAt('al', EXCESS[2] + 0.6).amount < 0.05, 'clear after the third');
});

test('panel pass 1: the dropper never reaches the words at the top; the chips hold their words; the labels are big enough to screenshot', () => {
  for (const t of frames.filter(t => t < REW0)) {                     // (the rewind is a fast reverse of all of it)
    const d = dropperAt(t);
    if (!d) continue;
    const bulbTop = project([d[0], d[1] + 0.45, d[2]], cameraAt(t), FULL).y;
    assert.ok(bulbTop >= 330 || bulbTop < -50, `the dropper in the text band at ${t.toFixed(2)} (${bulbTop.toFixed(0)} px)`);
  }
  for (const x of textsAt(0).filter(x => x.kind === 'chip')) assert.ok([...x.text].length * x.size * 0.55 <= x.box.w - 16, `${x.text} fits its chip`);
  const sheet = textsAt(SHEET[0] + 0.1);
  for (const x of sheet.filter(x => x.kind === 'ion' || x.kind === 'hydroxide' || x.kind === 'note')) assert.ok(x.size >= 36, `${x.name} at ${x.size} px`);
});
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const IDS = MEMBERS.map(m => m.id);

test('frame 0 (F4, F20, F25 Pick one): the question, three options, the tag; the answer is rust-brown', () => {
  assert.equal(LABEL, 'CHEMISTRY, VISUALISED  #13');
  assert.deepEqual(HEADER, ['Add NaOH to iron(III) chloride.', 'The cloud is…']);
  assert.deepEqual(OPTIONS, ['A  white', 'B  blue', 'C  rust-brown']);
  assert.equal(OPTIONS[ANSWER], 'C  rust-brown');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(words(SHORT_Q) <= 7);
});

test('F10, the chemistry (Class 12 salt analysis): four ions, their hydroxides and colours; aluminium\'s dissolves in excess', () => {
  assert.deepEqual(MEMBERS.map(m => [m.ion, m.hydroxide, m.colourName]), [
    ['Al³⁺', 'Al(OH)₃', 'white'], ['Cu²⁺', 'Cu(OH)₂', 'blue'], ['Fe²⁺', 'Fe(OH)₂', 'dirty green'], ['Fe³⁺', 'Fe(OH)₃', 'rust-brown'],
  ]);
  const al = MEMBERS.find(m => m.id === 'al')!;
  assert.ok(al.amphoteric && MEMBERS.filter(m => m.amphoteric).length === 1, 'only Al(OH)₃ dissolves in excess NaOH');
  assert.ok(cloudAt('al', EXCESS[0] - 0.1).amount > 0.9, 'a full white cloud before the excess');
  assert.ok(cloudAt('al', REW0 - 0.1).amount < 0.05, 'gone after it (aluminate is colourless)');
  for (const id of IDS) if (id !== 'al') assert.ok(cloudAt(id, REW0 - 0.1).amount > 0.9, `${id} stays`);
});

test('the opening (F25, F37): a drop lands in the first frames, then a new cloud about every 0.6 s; iron(III) waits', () => {
  assert.ok(DROPS.al <= 0.2);
  const opening = (['al', 'cu', 'fe2'] as Id[]).map(id => DROPS[id]);
  for (let i = 1; i < opening.length; i++) assert.ok(opening[i] - opening[i - 1] <= 0.7);
  const events = [...opening, 2.3, T_SHRINK].sort((a, b) => a - b);
  for (let i = 1; i < events.length; i++) assert.ok(events[i] - events[i - 1] <= 1.0, `a gap before ${events[i]}`);
  near(DROPS.fe3, ANSWER_AT);
  for (const id of IDS) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - DROPS[id]) < 1e-9), `a drop sound for ${id}`);
  assert.ok(dropAt('al', 0), 'a drop already falling on frame 0');
  const d0 = dropperAt(0)!;
  near(d0[0], tubeX('al'));
});

test('the answer: iron(III)\'s cloud only once its drop lands; its colour and the lit option after', () => {
  assert.equal(cloudAt('fe3', ANSWER_AT - 0.01).amount, 0);
  assert.ok(cloudAt('fe3', ANSWER_AT + 0.8).amount > 0.9);
  const at = (t: number) => textsAt(t);
  assert.ok(at(ANSWER_AT - 0.5).some(x => x.name === 'colour fe3' && x.text === '?'));
  assert.ok(at(ANSWER_AT + 0.8).some(x => x.name === 'colour fe3' && x.text === 'rust-brown'));
  assert.ok(at(ANSWER_LIT + 0.3).some(x => x.kind === 'answer' && x.text === OPTIONS[ANSWER]));
  assert.ok(ANSWER_LIT - ANSWER_AT <= 0.6);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
});

test('F39 made to send: the table held still ≥ 1.8 s, every tube with its ion, hydroxide and colour; the title', () => {
  assert.ok(SHEET[1] - SHEET[0] >= 1.8 - 1e-9 && SHEET[1] <= REW0);
  const a = SHEET[0] + 0.02, b = SHEET[1] - 0.02;
  assert.deepEqual(cameraAt(a), cameraAt(b));
  for (const id of IDS) { assert.deepEqual(cloudAt(id, a), cloudAt(id, b)); assert.equal(liquidColour(id, a), liquidColour(id, b)); }
  const texts = textsAt(a);
  assert.ok(texts.some(x => x.name === 'note al' && x.text.replace('\n', ' ') === 'dissolves in excess'), 'the aluminium note');
  // aluminium's pill says what the screenshot shows: white, then clear (panel pass 2: "white" over clear glass)
  for (const m of MEMBERS) for (const [k, v] of [['ion', m.ion], ['hydroxide', m.hydroxide], ['colour', m.id === 'al' ? 'white → clear' : m.colourName]] as const)
    assert.ok(texts.some(x => x.name === `${k} ${m.id}` && x.text === v), `${k} of ${m.id}`);
  assert.equal(texts.find(x => x.name === 'caption')!.text, SHEET_TITLE);
  assert.ok(words(SHEET_TITLE) <= 7);
  assert.deepEqual(textsAt(a).map(x => [x.name, x.text, x.alpha]), textsAt(b).map(x => [x.name, x.text, x.alpha]));
  assert.ok(!texts.some(x => x.name === 'question line'), 'no double header');
});

test('F27 loop: the rewind takes everything back, so the last frame is frame 0', () => {
  near(storyTime(0), 0); near(storyTime(DURATION), 0);
  const r6 = (v: number[]) => v.map(x => +x.toFixed(6));
  assert.deepEqual(r6(cameraAt(DURATION).position), r6(cameraAt(0).position));
  for (const id of IDS) { assert.deepEqual(cloudAt(id, DURATION), cloudAt(id, 0)); assert.equal(liquidColour(id, DURATION), liquidColour(id, 0)); }
  assert.deepEqual(r6(dropperAt(DURATION)!), r6(dropperAt(0)!));
  assert.deepEqual(textsAt(DURATION).map(x => [x.name, x.text]), textsAt(0).map(x => [x.name, x.text]));
});

test('F35: the rack fills the frame once the opening is done', () => {
  for (const t of frames.filter(t => t >= 3.0 && t < REW0)) {
    const pts = heroAt(t).map(p => project(p, cameraAt(t), FULL));
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.7, `small picture at ${t.toFixed(2)}`);
  }
});

test('F35 + F4: the question opens big, shrinks to one line, returns big for the loop; the tag stays all reel', () => {
  const at = (t: number) => textsAt(t).map(x => x.name);
  assert.ok(at(0).includes('header 1') && at(0).includes('chip A') && at(0).includes('tag'));
  assert.ok(!at(T_SHRINK + 0.6).some(n => n.startsWith('chip') || n.startsWith('header')));
  assert.ok(at(T_SHRINK + 0.6).includes('question line'));
  for (const t of frames) assert.ok(at(t).includes('tag'), `tag missing at ${t}`);
});

test('F35: every text inside Instagram\'s safe area and clear of every other text; a tube\'s labels together or not at all', () => {
  for (const t of frames) {
    assert.deepEqual(frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box }))), [], `at ${t.toFixed(2)} s`);
    const names = new Set(textsAt(t).map(x => x.name));
    for (const id of IDS) { const n = ['ion', 'hydroxide'].filter(k => names.has(`${k} ${id}`)).length; assert.ok(n === 0 || n === 2, `${id} split at ${t.toFixed(2)}`); }
  }
});

test('F5: something moves on every frame of the first 3 s', () => {
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, IDS.map(id => cloudAt(id, t)), dropperAt(t), IDS.map(id => dropAt(id, t))]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
});

test('camera (F9): close on the first tube, follows the dropper, pulls back, a punch-in on the answer; smooth', () => {
  assert.ok(CAMERA.start[0] >= 1.8);
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 1 && outs >= 2);
  // the camera is close on iron(III) by the time its drop lands (panel: the drop came from a dropper you couldn't see)
  assert.ok(CAMERA.keys.some(k => k.to[0] > 1.6 && k.t + k.dur <= ANSWER_AT && ANSWER_AT - (k.t + k.dur) <= 0.8), 'close on iron(III) for the answer');
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
});

test('sound (F14, F16): a tap per drop, a thunk at the answer, drops for the excess; the music dips under the hits and is seamless', () => {
  for (const t of EXCESS) assert.ok(SOUND.hits.some(h => h.kind === 'tap' && Math.abs(h.t - t) < 1e-9));
  // a whoosh on each real move (the pull-back, the pan to aluminium, the zoom-out, the rewind), none on frame 0 (panel)
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh')).map(h => h.t);
  for (const [a, b] of [[2.1, 3.0], [5.3, 6.0], [7.5, 8.2], [REW0, DURATION]]) assert.ok(ws.some(t => t >= a && t <= b), `a whoosh in ${a}–${b} s`);
  assert.ok(!ws.some(t => t < 0.3), 'no whoosh over the still first frames');
  void whooshesFor;
  assert.ok(musicLevel(ANSWER_AT + 0.05) <= 0.6 && musicLevel(ANSWER_AT + 0.4) >= 0.95 && musicLevel(DURATION) >= 0.95);
  for (let i = 1; i < SOUND.hits.length; i++) assert.ok(SOUND.hits[i].t >= SOUND.hits[i - 1].t);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, SHEET[0]]);
  const spec = JSON.parse(readFileSync(new URL('../music/pv-chem-013-hydroxides.json', import.meta.url), 'utf8'));
  assert.equal(spec.music.seamless, true, 'a looping reel: no fade at the seam');
  near(spec.duration, DURATION);
});

test('WCAG AA on the dark set', () => {
  assert.ok(contrast(COLOURS.muted, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.ink, COLOURS.board) >= 4.5);
  assert.ok(contrast(COLOURS.board, COLOURS.answer) >= 4.5);
});

test('F6: the cover is before the answer: three clouds made, iron(III) still clear under its "?", the question big', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T < T_SHRINK);
  for (const id of ['al', 'cu', 'fe2'] as Id[]) assert.ok(cloudAt(id, COVER_T).amount > 0.9, id);
  assert.equal(cloudAt('fe3', COVER_T).amount, 0);
  assert.ok(textsAt(COVER_T).some(x => x.name === 'chip C'));
});
