import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, MUSIC, HOOK, LINE2, SHOTS, WIDE, shotAt, cameraAt, viewOf, CUP, cupAt, sipAt, leanAt, eyesClosed, steamAt, STEAM,
  rainStreak, RAIN_N, TULSI, LEAVES, LEAF_HITS, leafBob, railDripAt, SCENE, SOUND, textAlpha, W, H, HER, toWorld,
  LAYERS, layerCam, dissolveAt, DISSOLVE, BLINKS, focusBlur, headTiltAt,
} from '../src/lib/sm011.ts';

// @soundmindwithshivani reel #11, the first "pause" reel (framework S20): "You don't have to earn rest." A woman takes
// her chai on the balcony in the rain: wide (she sips) → close-up of the glass and the steam → close-up of the tulsi in
// the rain → wide again, she leans back and closes her eyes. 12–15 s, made to loop.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shot = (id: string) => SHOTS.find(s => s.id === id)!;
const inView = (t: number, x: number, y: number) => { const v = viewOf(cameraAt(t)); return x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1; };
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('12–15 s; the message is fully on screen at frame 0; the second line stays to the end', () => {
  assert.ok(DURATION >= 12 && DURATION <= 15);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /rest/i);
  assert.equal(LINE2.t1, DURATION);
  assert.ok(textAlpha(LINE2, DURATION) === 1 && textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('four shots, back to back: wide, the cup, the tulsi, wide; no text over the close-ups', () => {
  assert.deepEqual(SHOTS.map(s => s.id), ['wide', 'cup', 'tulsi', 'rest']);
  assert.equal(SHOTS[0].t0, 0); assert.equal(SHOTS.at(-1)!.t1, DURATION);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i].t0, SHOTS[i - 1].t1);
  for (const s of SHOTS) assert.ok(s.t1 - s.t0 >= 2.5 && s.t1 - s.t0 <= 4.5, `${s.id} lasts ${s.t1 - s.t0} s`);
  for (const id of ['cup', 'tulsi']) { assert.ok(shot(id).from.z >= 2 && shot(id).to.z >= 2, `${id} isn't a close-up`); }
  for (const id of ['wide', 'rest']) { assert.ok(shot(id).from.z <= 1.2 && shot(id).to.z <= 1.2, `${id} isn't wide`); }
  assert.ok(HOOK.t1 <= shot('cup').t0 && LINE2.t0 >= shot('rest').t0);
  assert.equal(shotAt(0).id, 'wide'); assert.equal(shotAt(DURATION).id, 'rest'); assert.equal(shotAt(5).id, 'cup');
});

test('the camera never looks past the drawing, and the reel ends where it began, so the loop has no jump', () => {
  for (const t of frames.concat(DURATION)) {
    const v = viewOf(cameraAt(t));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `off the drawing at ${t.toFixed(2)} s`);
  }
  assert.deepEqual(cameraAt(0), WIDE);
  assert.deepEqual(cameraAt(DURATION), WIDE);
});

test('the close-ups hold what they are about: her face, the glass and its steam; the tulsi and the leaves the drops hit', () => {
  for (const t of frames.filter(t => shotAt(t).id === 'cup')) {
    const c = cupAt(t);
    assert.ok(inView(t, c.x, c.y + 40) && inView(t, c.x, c.y - STEAM.rise - 40), `cup or steam cut off at ${t.toFixed(2)} s`);
    const top = toWorld({ x: HER.x, y: HER.headY - HER.r - 20 }), chin = toWorld({ x: HER.x, y: HER.headY + HER.r });
    assert.ok(inView(t, top.x, top.y) && inView(t, chin.x, chin.y), `her head cut off at ${t.toFixed(2)} s`);
  }
  for (const t of frames.filter(t => shotAt(t).id === 'tulsi')) {
    assert.ok(inView(t, TULSI.x, TULSI.y), `pot cut off at ${t.toFixed(2)} s`);
    for (const h of LEAF_HITS) { const l = LEAVES[h.leaf]; assert.ok(inView(t, l.x, l.y), `leaf ${h.leaf} out of view`); }
  }
});

test('she sips in the first shot: the glass rises to her lips, she closes her eyes, then it is back down before the cut', () => {
  assert.equal(sipAt(0), 0);
  const top = frames.filter(t => sipAt(t) === 1);
  assert.ok(top.length > 0 && top.every(t => shotAt(t).id === 'wide'));
  assert.ok(top.every(t => eyesClosed(t)), 'eyes open while she sips');
  assert.equal(sipAt(shot('cup').t0 - 0.2), 0);
  assert.ok(cupAt(top[0]).y < CUP.rest.y - 100);
  assert.deepEqual(cupAt(0), { ...CUP.rest, tilt: 0 });
});

test('the ending: she leans back, eyes closed, the glass in her lap', () => {
  assert.equal(leanAt(shot('rest').t0), 0);
  assert.ok(leanAt(DURATION) > 0.99);
  assert.ok(eyesClosed(DURATION) && !eyesClosed(shot('rest').t0) && !eyesClosed(shot('cup').t0 + 1));
  const end = cupAt(DURATION);
  assert.ok(Math.abs(end.x - CUP.lap.x) < 1 && Math.abs(end.y - CUP.lap.y) < 1);
  assert.ok(MUSIC.chime >= LINE2.t0 && MUSIC.chime < DURATION - 1);
});

test('steam keeps rising: at every frame at least three wisps show, each rising and fading out', () => {
  for (const t of frames) assert.ok([0, 1, 2, 3].filter(i => steamAt(i, t).alpha > 0.2).length >= 3, `steam thin at ${t.toFixed(2)} s`);
  const a = steamAt(0, 0.1), b = steamAt(0, 0.4);
  assert.ok(b.rise > a.rise);
});

test('it rains the whole time: every streak moves between frames and falls down and slightly sideways', () => {
  for (let i = 0; i < RAIN_N; i += 7) for (const t of [0, 3.3, 7.7, 13.9]) {
    const p = rainStreak(i, t), q = rainStreak(i, t + 1 / 30);
    assert.ok(p.y !== q.y, `streak ${i} stuck at ${t}`);
    if (q.y > p.y) assert.ok(q.x > p.x && q.x - p.x < (q.y - p.y) * 0.4, `streak ${i} falls the wrong way`);
  }
});

test('in the tulsi close-up drops hit its leaves; each leaf dips, springs back and settles', () => {
  assert.ok(LEAF_HITS.length >= 2);
  for (const h of LEAF_HITS) {
    assert.equal(shotAt(h.t).id, 'tulsi');
    assert.equal(leafBob(h.leaf, h.t - 0.05), 0);
    assert.ok(Math.abs(leafBob(h.leaf, h.t + 0.1)) > 3, `leaf ${h.leaf} doesn't move when hit`);
  }
  assert.ok(LEAVES.every((_, i) => Math.abs(leafBob(i, DURATION)) < 0.5));
  const drip = frames.filter(t => shotAt(t).id === 'tulsi').map(railDripAt);
  assert.ok(drip.some(d => d.falling) && drip.some(d => !d.falling), 'no drop gathers and falls from the rail');
});

test('the sound: rain from first frame to last, a drop tap on each leaf hit, calm piano', () => {
  assert.equal(MUSIC.style, 'calm');
  const rain = SOUND.beds.filter(b => b.kind === 'rain');
  assert.equal(rain.length, 1); assert.equal(rain[0].t0, 0); assert.equal(rain[0].t1, DURATION);
  for (const h of LEAF_HITS) assert.ok(SOUND.hits.some(x => x.kind === 'tap' && Math.abs(x.t - h.t) < 0.02), `no tap for the drop at ${h.t}`);
});

test('the words are readable: the message on the rainy sky, the handle on the floor (WCAG AA)', () => {
  for (const bg of [SCENE.skyTop, SCENE.skyLow]) assert.ok(contrast(SCENE.ink, bg) >= 4.5, `ink on ${bg}: ${contrast(SCENE.ink, bg).toFixed(2)}`);
  for (const bg of SCENE.floor) assert.ok(contrast(SCENE.ink, bg) >= 4.5, `ink on ${bg}: ${contrast(SCENE.ink, bg).toFixed(2)}`);
});

test('depth: every layer moves with the camera at its own depth, never past the drawing; far layers move less', () => {
  const depths = Object.values(LAYERS);
  assert.ok(depths.every(d => d >= 0 && d <= 1) && LAYERS.balcony === 1 && LAYERS.sky === 0);
  for (const t of frames) for (const d of depths) {
    const v = viewOf(layerCam(cameraAt(t), d));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `layer ${d} off the drawing at ${t.toFixed(2)} s`);
  }
  const s = shot('wide'), move = (d: number) => Math.abs(layerCam(s.to, d).cx - layerCam(s.from, d).cx) + Math.abs(layerCam(s.to, d).cy - layerCam(s.from, d).cy);
  assert.ok(move(LAYERS.balcony) > 40, 'the wide shot barely moves');
  assert.ok(move(LAYERS.hills) < move(LAYERS.town) && move(LAYERS.town) < move(LAYERS.trees) && move(LAYERS.trees) < move(LAYERS.balcony));
});

test('soft dissolves at each cut, none on frame 0; the outgoing shot holds its last framing', () => {
  assert.equal(dissolveAt(0), null);
  assert.ok(DISSOLVE >= 0.3 && DISSOLVE <= 0.8);
  for (let i = 1; i < SHOTS.length; i++) {
    const s = SHOTS[i], a = dissolveAt(s.t0 + 0.01)!, b = dissolveAt(s.t0 + DISSOLVE / 2)!;
    assert.ok(a.k < 0.05 && b.k > 0.3 && b.k < 0.7, `dissolve into ${s.id}`);
    assert.deepEqual(a.prev, SHOTS[i - 1].to);
    assert.equal(dissolveAt(s.t0 + DISSOLVE + 0.01), null);
  }
  assert.ok(HOOK.t1 <= shot('cup').t0 && LINE2.t0 >= shot('rest').t0 + DISSOLVE, 'text over a dissolve');
});

test('she is alive: short blinks (two in the cup close-up), her head tips back to sip and turns toward the rain', () => {
  for (const b of BLINKS) assert.ok(eyesClosed(b + 0.05) && !eyesClosed(b + 0.2), `blink at ${b} too long`);
  assert.ok(BLINKS.filter(b => shotAt(b).id === 'cup').length >= 2);
  const sip = frames.find(t => sipAt(t) === 1)!;
  assert.ok(headTiltAt(sip) < -3, 'head doesn’t tip back to sip');
  assert.ok(frames.some(t => shotAt(t).id === 'cup' && headTiltAt(t) > 4), 'she never turns toward the rain');
  assert.equal(headTiltAt(0), 0);
});

test('soft focus: the background blurs only in the close-ups', () => {
  for (const s of SHOTS) assert.equal(focusBlur(s) > 0, s.id === 'cup' || s.id === 'tulsi', s.id);
});
