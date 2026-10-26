import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, T_SHRINK, T_SECOND, SECOND_ANSWER_AT, COVER_T, CLOCK, LABEL, HEADER, OPTIONS, ANSWER, SHORT_Q, BRAND,
  SECOND_Q, START, ROOM, N, ICE_G, density, profile, meanTemp, iceLeft, sinking, clockText, realSeconds, waterHeatLost, meltHeat, roomHeat,
  airPath, airTemp, CAMERA, cameraAt, heroAt, textsAt, CAPTIONS, SECOND_HOOK, END_LINES, MUSIC_HITS, SOUND, COLOURS, tempColour, textColour, drinkPixels,
  type Glass,
} from '../src/lib/pp015.ts';
import { project } from '../src/lib/inductionScene.ts';
import { FULL, widthShare, heightShare, frameProblems } from '../src/lib/layout.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @pyqvault_ · Physics, visualised #15 (P36, "Ice at the top"): two glasses of the same drink, the same ice; in one it
// floats at the top, in the other a mesh holds it at the bottom. Which cools the drink faster? The top: cold water sinks
// from the ice and stirs the whole glass (convection); cold made at the bottom stays there. The first full-frame studio
// reel (framework v1.29: F35 one picture, full frame; F36 soft studio).
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const GLASSES: Glass[] = ['top', 'bottom'];

test('frame 0 (F4, F20, F25 Everyday puzzle): the question, three options, the tag; the answer is "top"', () => {
  assert.equal(LABEL, 'PHYSICS, VISUALISED  #15');
  assert.deepEqual(HEADER, ['Ice at the top or the bottom:', 'which cools a drink faster?']);
  assert.deepEqual(OPTIONS, ['A  top', 'B  bottom', 'C  the same']);
  assert.equal(OPTIONS[ANSWER], 'A  top');
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(words(SHORT_Q) <= 7);
});

test('F10, water: densest at 4 °C (textbook values to 0.1 kg/m³)', () => {
  near(density(4), 1000, 1e-9);
  near(density(20), 998.2, 0.1);
  near(density(0), 999.84, 0.1);
  assert.ok(density(2) < density(4) && density(6) < density(4) && density(25) < density(10));
});

test('F10, the start: both drinks at room temperature, the same ice in each', () => {
  for (const k of GLASSES) {
    assert.ok(profile(k, 0).every(T => T === START));
    near(iceLeft(k, 0), ICE_G);
  }
  assert.equal(START, ROOM);
  assert.equal(profile('top', 0).length, N);
});

test('F10, the answer after 5 minutes: ice on top cools the whole drink; ice at the bottom leaves the top warm', () => {
  const end = CLOCK.t1;
  assert.equal(CLOCK.real, 300);
  const top = profile('top', end), bottom = profile('bottom', end);
  assert.ok(meanTemp('top', end) < 11, `top-ice drink ${meanTemp('top', end)}`);
  assert.ok(Math.max(...top) - Math.min(...top) < 1.5, 'stirred: the top-ice drink is nearly one temperature');
  assert.ok(meanTemp('bottom', end) > 15, `bottom-ice drink ${meanTemp('bottom', end)}`);
  assert.ok(bottom.at(-1)! > 24.5, 'the top of the bottom-ice drink is still at room temperature');
  assert.ok(bottom[0] < 4, 'its bottom is ice-cold');
  assert.ok(meanTemp('bottom', end) - meanTemp('top', end) > 5, 'a clear win, not a tie');
  for (const t of frames.filter(t => t > 2 && t <= end)) assert.ok(meanTemp('top', t) < meanTemp('bottom', t), `top cooler at ${t}`);
});

test('F10, the ice does the work: the ice on top melts far more; heat lost by the drink + heat in from the room = heat to melt the ice (334 J/g)', () => {
  const end = CLOCK.t1;
  assert.ok(ICE_G - iceLeft('top', end) > 1.5 * (ICE_G - iceLeft('bottom', end)));
  for (const k of GLASSES) {
    const lost = waterHeatLost(k, end), room = roomHeat(k, end), melt = meltHeat(k, end);
    near(melt, (ICE_G - iceLeft(k, end)) * 334, 1e-6);
    assert.ok(room >= 0 && room < 0.1 * melt, `${k}: the room adds a little (${room.toFixed(0)} J)`);
    assert.ok(Math.abs(lost + room - melt) / melt < 0.01, `${k}: drink lost ${lost.toFixed(0)} J + room ${room.toFixed(0)} J, ice took ${melt.toFixed(0)} J`);
    for (const t of frames) assert.ok(iceLeft(k, t) >= 0 && iceLeft(k, t) <= ICE_G);
  }
});

test('F10, convection: cold water sinks only from ice at the top; no layer ever sits on lighter water', () => {
  assert.ok(sinking('top', 1) > 0.3, 'cold water pouring down from the floating ice');
  for (const t of frames) {
    assert.equal(sinking('bottom', t), 0, 'nothing sinks from ice that is already at the bottom');
    for (const k of GLASSES) {
      const p = profile(k, t);
      for (let i = 1; i < p.length; i++) assert.ok(density(p[i]) <= density(p[i - 1]) + 1e-6, `${k} unstable at ${t}, layer ${i}`);
    }
  }
});

test('the drink\'s picture: each layer in its temperature\'s colour; cold streaks fall below the top ice, never in the other glass', () => {
  const W = 32, H = 48, rgb = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const base = (k: Glass, t: number, row: number) => rgb(tempColour(profile(k, t)[Math.min(N - 1, Math.floor(((row + 0.5) / H) * N))]));
  for (const t of [0.5, 1, 3, 6, 9]) {
    const px = drinkPixels('bottom', t, W, H);
    for (let row = 0; row < H; row++) for (let u = 0; u < W; u++)
      assert.deepEqual([...px.slice((row * W + u) * 4, (row * W + u) * 4 + 3)], base('bottom', t, row), `bottom glass at ${t}, row ${row}`);
  }
  const px = drinkPixels('top', 1, W, H), edgeRow = Math.floor(H * (N - 8) / N);
  let streak = 0;
  for (let row = 0; row < edgeRow; row++) for (let u = 0; u < W; u++) {
    const p = [...px.slice((row * W + u) * 4, (row * W + u) * 4 + 3)], b = base('top', 1, row);
    if (p[2] - p[0] > b[2] - b[0] + 20) streak++;                  // bluer than its layer
  }
  assert.ok(streak > 20, `cold streaks under the ice (${streak} px)`);
  assert.equal(px.length, W * H * 4);
});

test('the clock: 0:00 to 5:00 over the race, then held; the counts stop with it', () => {
  assert.equal(clockText(0), '0:00');
  assert.equal(clockText(CLOCK.t1), '5:00');
  assert.equal(clockText(DURATION), '5:00');
  near(realSeconds((CLOCK.t0 + CLOCK.t1) / 2), 150);
  near(meanTemp('top', ANSWER_AT), meanTemp('top', CLOCK.t1));
  assert.ok(CLOCK.t1 < ANSWER_AT, 'the answer once the clock has stopped');
});

test('the second answer (F26): the fridge\'s cold air leaves the freezer at the top, sinks, warms over the food, rises again', () => {
  assert.equal(SECOND_Q, 'So where should the freezer go?');
  assert.ok(words(SECOND_Q) <= 7 && SECOND_HOOK.t0 === T_SECOND && T_SECOND - ANSWER_AT <= 1.5);
  const pts = Array.from({ length: 101 }, (_, i) => airPath(i / 100));
  const temps = Array.from({ length: 101 }, (_, i) => airTemp(i / 100));
  assert.ok(pts[0].y > pts[50].y, 'it leaves the freezer at the top and goes down');
  const fall = pts.findIndex((p, i) => i > 0 && p.y >= pts[i - 1].y);
  assert.ok(fall > 20, 'a long fall first');
  for (let i = 1; i < fall; i++) assert.ok(temps[i] >= temps[i - 1], 'it warms as it falls past the food');
  assert.equal(Math.min(...temps), temps[0], 'coldest as it leaves the freezer');
  near(airPath(0).y, airPath(1).y, 1e-9); near(airPath(0).z, airPath(1).z, 1e-9);   // a closed loop
  assert.ok(SECOND_ANSWER_AT > T_SECOND + 2);
});

test('F35: the picture fills the frame (≥ 70 % of the width, or ≥ 60 % of the height for the tall fridge) once the opening zoom is done', () => {
  for (const t of frames.filter(t => t >= 1.8 && t < END_AT)) {
    const cam = cameraAt(t), hero = heroAt(t);
    if (!hero.length) continue;
    const pts = hero.map(p => project(p, cam, FULL));
    assert.ok(widthShare(pts.map(p => p.x)) >= 0.7 || heightShare(pts.map(p => p.y)) >= 0.6, `small picture at ${t.toFixed(2)}`);
  }
});

test('F35 + F4: the question opens big, then shrinks to one line by 3.6 s; no box stays all reel except the tag', () => {
  assert.ok(T_SHRINK >= 2.6 && T_SHRINK <= 3.2);
  const at = (t: number) => textsAt(t).map(x => x.name);
  assert.ok(at(0).includes('header 1') && at(0).includes('chip A') && at(0).includes('tag'));
  assert.ok(!at(T_SHRINK + 0.6).some(n => n.startsWith('chip') || n.startsWith('header')), 'chips and the big question gone');
  assert.ok(at(T_SHRINK + 0.6).includes('question line'));
  for (const t of frames.filter(t => t < END_AT)) assert.ok(at(t).includes('tag'), `tag missing at ${t}`);
});

test('F35: no label quietly hidden: on the wide shots both glasses show their temperature and tag, and the clock runs', () => {
  for (const t of frames.filter(t => (t >= 2 && t < 4.9) || (t >= 7.7 && t < 9.5))) {
    const names = textsAt(t).map(x => x.name);
    for (const n of ['temp top', 'temp bottom', 'tag top', 'tag bottom', 'clock']) assert.ok(names.includes(n), `${n} missing at ${t.toFixed(2)}`);
  }
  for (const t of frames.filter(t => t >= 10.6 && t < END_AT)) assert.ok(textsAt(t).some(x => x.name === 'freezer'), `freezer label missing at ${t.toFixed(2)}`);
});

test('F35: every text inside Instagram\'s safe area and clear of every other text, on every frame', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const problems = frameProblems(textsAt(t).map(x => ({ name: x.name, box: x.box })));
    assert.deepEqual(problems, [], `at ${t.toFixed(2)} s`);
  }
});

test('F5: something moves on every frame of the first 3 s (the zoom, the sinking cold, the temperatures)', () => {
  const sig = (t: number) => JSON.stringify([cameraAt(t).position, meanTemp('top', t), meanTemp('bottom', t)]);
  for (let f = 1; f <= 90; f++) assert.notEqual(sig((f - 1) / 30), sig(f / 30), `frame ${f}`);
});

test('camera (F9, F25 Zoom opening): starts close on the floating ice, pulls back; punch-ins land on the warm top and the freezer; smooth', () => {
  assert.ok(CAMERA.start[0] >= 2.2, 'frame 0 is a close-up');
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 2);
  const at = (t: number) => tween(t, CAMERA.start, CAMERA.keys);
  for (let i = 1; i < frames.length; i++) {
    const a = at(frames[i - 1]), b = at(frames[i]);
    assert.ok(Math.abs(Math.log(b[0] / a[0])) < 0.15 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 0.3, `jump at ${frames[i]}`);
  }
});

test('words (F7) and length (F18)', () => {
  for (const c of CAPTIONS) assert.ok(words(c.text) <= 7, c.text);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT && DURATION <= 25);
  assert.ok(words(END_LINES[0]) <= 7);
  const warm = CAPTIONS.find(c => /still 25 °C/.test(c.text))!;
  assert.ok(warm && Math.round(profile('bottom', warm.t0).at(-1)!) === 25, 'the caption\'s number is the model\'s');
});

test('sound (F14–F16): ice clinks at the start, a click each minute, a thunk as the clock stops, whooshes on fast moves only', () => {
  const minutes = SOUND.hits.filter(h => h.kind === 'click').map(h => h.t);
  assert.equal(minutes.length, 5);
  minutes.forEach((t, i) => near(realSeconds(t), 60 * (i + 1), 1e-6));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - CLOCK.t1) < 1e-9));
  assert.ok(SOUND.hits.filter(h => h.kind === 'tap' && h.t < 1).length >= 2, 'clinks');
  assert.deepEqual(SOUND.hits.filter(h => h.kind.startsWith('whoosh')), whooshesFor(CAMERA.start, CAMERA.keys));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_SECOND]);
});

test('colours (F24): warm and cold told apart, colour-blind safe; the scale runs warm → cold', () => {
  assert.ok(distinguishable(COLOURS.warm, COLOURS.cold));
  assert.equal(tempColour(ROOM), COLOURS.warm);
  assert.equal(tempColour(0), COLOURS.cold);
});

test('F20 + WCAG AA on the studio: the tag ≥ 4.5:1, the temperatures ≥ 3:1 (large text) at every temperature', () => {
  assert.ok(contrast(COLOURS.muted, COLOURS.studio) >= 4.5);
  assert.ok(contrast(COLOURS.ink, COLOURS.studio) >= 4.5);
  for (let T = 0; T <= ROOM; T += 0.5) assert.ok(contrast(textColour(T), COLOURS.studio) >= 3, `${T} °C`);
  assert.equal(textColour(ROOM), COLOURS.warm);
});

test('F6: the cover is taken before the answer, with both glasses in view', () => {
  assert.ok(COVER_T < ANSWER_AT && COVER_T < T_SHRINK);
  assert.ok(heroAt(COVER_T).length > 0);
});
