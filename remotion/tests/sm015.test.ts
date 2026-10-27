import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { layerCam } from '../src/lib/sm011.ts';
import { paintProblems, contrast } from '../src/lib/paint.ts';
import { SAFE } from '../src/lib/meStory.ts';
import {
  DURATION, MUSIC, THOUGHTS, thoughtAlpha, boxOf, ZONE, CUT, SHOTS, LAYERS, cameraAt, viewOf, LINES, textAlpha,
  readSeconds, toScreen, SIDE, BREATH_IN, BREATH_OUT, chestAt, eyesClosed, phoneLit, lampAt, SCENE, PAINT, SOUND, W, H,
} from '../src/lib/sm015.ts';

// @soundmindwithshivani racing-mind reel #1 (framework S23), "the 1 a.m. thoughts". Model: a 20 s reel studied
// 2026-10-27: a girl awake in bed while her worries pile up on screen in mixed sizes over a steady pulse, then a hard cut
// to near-silence, a top-down view of her lying calm, "Breathe…". Ours: Painted 2D (S21), in season, no voice.
const { unsafeClaims } = createRequire(import.meta.url)('../../soundmind/cards.js');
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shot = (id: string) => SHOTS.find(s => s.id === id)!;
const overlap = (a: ReturnType<typeof boxOf>, b: ReturnType<typeof boxOf>) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('20–26 s; the hook ("Why am I still awake?") is fully there on frame 0, alone', () => {
  assert.ok(DURATION >= 20 && DURATION <= 26);
  assert.match(THOUGHTS[0].text, /still awake/i);
  assert.equal(thoughtAlpha(THOUGHTS[0], 0), 1);
  assert.ok(THOUGHTS[1].t >= 1, 'the hook needs a second on its own');
});

test('the thoughts pile up faster and faster, then all vanish at the cut', () => {
  const gaps = THOUGHTS.slice(1).map((th, i) => th.t - THOUGHTS[i].t);
  assert.ok(THOUGHTS.length >= 16 && THOUGHTS.length <= 22);
  assert.ok(gaps.at(-1)! < gaps[0] / 2, 'they do not speed up');
  const visible = (t: number) => THOUGHTS.filter(th => thoughtAlpha(th, t) > 0).length;
  assert.ok(visible(CUT - 0.5) >= 2 * visible(3), `${visible(3)} at 3 s, ${visible(CUT - 0.5)} before the cut`);
  for (const t of frames.filter(t => t >= CUT)) assert.equal(visible(t), 0, `a thought left at ${t.toFixed(2)}`);
  assert.ok(THOUGHTS.at(-1)!.t < CUT - 1.1);
});

test('the last thought is the loudest: "I need to stop overthinking."', () => {
  const last = THOUGHTS.at(-1)!;
  assert.match(last.text, /stop overthinking/i);
  assert.ok(THOUGHTS.every(th => th === last || th.size < last.size));
});

test('each thought can be read: fully there at least 1.2 s, then it fades', () => {
  for (const th of THOUGHTS) {
    const full = frames.filter(t => thoughtAlpha(th, t) === 1).length / 30;
    assert.ok(full >= 1.2 - 1e-9, `"${th.text}" fully up only ${full.toFixed(2)} s`);
    assert.ok(th.text.split(/\s+/).length <= 8, th.text);
  }
  const old = THOUGHTS[2];
  assert.ok(thoughtAlpha(old, old.t + 4) < 0.6 && thoughtAlpha(old, old.t + 4) > 0, 'older thoughts dim, they do not just vanish');
});

test('thoughts never cover each other, stay in the safe band and above her', () => {
  for (const th of THOUGHTS) {
    const b = boxOf(th);
    assert.ok(b.x >= SAFE.left && b.x + b.w <= SAFE.right && b.y >= ZONE.y0 && b.y + b.h <= ZONE.y1, `"${th.text}" off: ${JSON.stringify(b)}`);
    assert.ok(ZONE.y0 >= SAFE.top);
  }
  for (const t of frames.filter(t => t < CUT)) {
    const on = THOUGHTS.filter(th => thoughtAlpha(th, t) > 0);
    for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
      assert.ok(!overlap(boxOf(on[i]), boxOf(on[j])), `"${on[i].text}" covers "${on[j].text}" at ${t.toFixed(2)}`);
    }
  }
});

test('the thoughts stay clear of her: the zone ends above her head all through the awake shot', () => {
  for (const t of frames.filter(t => t < CUT)) {
    const top = toScreen(cameraAt(t), SIDE.headX, SIDE.headY - SIDE.r - 40).y;
    assert.ok(ZONE.y1 <= top, `her head reaches ${top.toFixed(0)} px at ${t.toFixed(2)} s, the zone ends at ${ZONE.y1}`);
  }
});

test('the words: original, no health claims, readable on the dark room (WCAG AA)', () => {
  for (const s of [...THOUGHTS.map(t => t.text), ...LINES.map(l => l.text)]) assert.deepEqual(unsafeClaims(s), [], s);
  for (const bg of SCENE.behindText) assert.ok(contrast(SCENE.text, bg) >= 4.5, `text on ${bg}`);
  assert.deepEqual(paintProblems(PAINT), []);
});

test('three shots: awake (side), the empty beat, rest (from above); hard cuts between them', () => {
  assert.deepEqual(SHOTS.map(s => s.id), ['awake', 'gap', 'rest']);
  assert.equal(SHOTS[0].t0, 0); assert.equal(SHOTS.at(-1)!.t1, DURATION);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i].t0, SHOTS[i - 1].t1);
  assert.equal(shot('gap').t0, CUT);
  const g = shot('gap').t1 - shot('gap').t0;
  assert.ok(g >= 0.4 && g <= 0.7, 'the empty beat is about half a second');
  assert.ok(shot('awake').to.z > shot('awake').from.z, 'the camera creeps in while the thoughts pile up');
  for (const t of frames.concat(DURATION)) for (const d of Object.values(LAYERS)) {
    const v = viewOf(layerCam(cameraAt(t), d));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `layer ${d} off at ${t.toFixed(2)} s`);
  }
});

test('the empty beat: no words, no sound effects, the music silent', () => {
  const g = shot('gap');
  for (const t of frames.filter(t => t >= g.t0 && t < g.t1)) {
    assert.ok(LINES.every(l => textAlpha(l, t) === 0));
    assert.ok(SOUND.music!(t) <= 0.02, `music at ${t.toFixed(2)}`);
  }
  assert.ok(SOUND.hits.every(h => h.t < g.t0 - 0.05 || h.t > g.t1));
  assert.ok(SOUND.beds.every(b => b.t1 <= g.t0));
});

test('the pulse quickens and grows louder through the pile-up, then stops dead at the cut', () => {
  const beats = SOUND.hits.filter(h => h.kind === 'thunk' && h.t < CUT);
  assert.ok(beats.length >= 14);
  const firstGap = beats[2].t - beats[0].t, lastGap = beats.at(-1)!.t - beats.at(-3)!.t;
  assert.ok(lastGap < firstGap * 0.75, 'the heartbeat does not quicken');
  assert.ok(beats.at(-1)!.gain > beats[0].gain);
  assert.ok(SOUND.music!(DURATION - 2) >= 0.5, 'the piano comes in for the rest');
  assert.ok(SOUND.music!(DURATION - 2) <= SOUND.music!(CUT - 1), 'the quiet is quieter than the storm');
});

test('rest: she breathes in with "Breathe in…", out with "…and out.", closes her eyes; the phone is dark', () => {
  const [inn, out, last] = LINES;
  assert.equal(inn.t0, BREATH_IN[0]); assert.equal(inn.t1, BREATH_IN[1]); assert.equal(out.t0, BREATH_OUT[0]);
  assert.ok(BREATH_IN[1] - BREATH_IN[0] >= 3 && BREATH_OUT[1] - BREATH_OUT[0] >= BREATH_IN[1] - BREATH_IN[0], 'a slow breath, longer out than in');
  assert.equal(chestAt(BREATH_IN[0]), 0);
  assert.ok(chestAt(BREATH_IN[1]) > 0.99 && chestAt(BREATH_OUT[1]) < 0.01);
  assert.ok(!eyesClosed(shot('rest').t0 + 0.5) && eyesClosed(DURATION));
  assert.ok(phoneLit(2) && !phoneLit(shot('rest').t0 + 0.1));
  for (const l of LINES) assert.ok(l.t1 - l.t0 >= readSeconds(l.text) - 1e-9, l.text);
  assert.equal(last.t1, DURATION);
  assert.equal(textAlpha(last, DURATION), 1);
  assert.ok(lampAt(DURATION) < lampAt(shot('rest').t0) && lampAt(0) === 1);
  assert.ok(MUSIC.chime >= last.t0 && MUSIC.chime < DURATION - 1);
});

test('awake: she blinks and shifts while the thoughts pile up', () => {
  const closed = frames.filter(t => t < CUT && eyesClosed(t)).length;
  assert.ok(closed >= 3 && closed < 30, `${closed} closed frames`);
});
