import test from 'node:test';
import assert from 'node:assert/strict';
import { layerCam } from '../src/lib/sm011.ts';
import { paintProblems, contrast } from '../src/lib/paint.ts';
import {
  DURATION, MUSIC, HOOK, LINE2, SHOTS, WIDE, LAYERS, shotAt, cameraAt, viewOf, dissolveAt, DISSOLVE, textAlpha, W, H,
  KETTLE, steamAt, STEAM, TAIL_LIGHT, WATER_Y, reflect, PUDDLE, ripplesAt, AWNING_EDGE, dripsAt, bulbAt, sipAt, leanAt,
  eyesClosed, BLINKS, SCENE, PAINT, SOUND,
} from '../src/lib/sm012.ts';

// @soundmindwithshivani pause reel #2 (framework S20), "tapri at dusk": the richer 2D look (founder, 2026-10-24: "lets try
// richer 2d in remotion"). An original scene: a street-side tea stall under a tin roof at dusk in the rain; a young woman
// with a kulhad of chai; her scooter in the rain. Wide (she sips) → the kettle → the scooter's tail light in a puddle →
// wide (she leans back). 12–15 s, made to loop. Painted, not outlined: every edge is a darker shade of its own colour.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shot = (id: string) => SHOTS.find(s => s.id === id)!;
const inView = (t: number, x: number, y: number) => { const v = viewOf(cameraAt(t)); return x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1; };

test('12–15 s; the message is fully there on frame 0; the second line stays to the end', () => {
  assert.ok(DURATION >= 12 && DURATION <= 15);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /slow/i);
  assert.equal(LINE2.t1, DURATION);
  assert.equal(textAlpha(LINE2, DURATION), 1);
});

test('four shots back to back: wide, the kettle, the scooter, wide; text only on the wide shots', () => {
  assert.deepEqual(SHOTS.map(s => s.id), ['wide', 'kettle', 'scooter', 'rest']);
  assert.equal(SHOTS[0].t0, 0); assert.equal(SHOTS.at(-1)!.t1, DURATION);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i].t0, SHOTS[i - 1].t1);
  for (const s of SHOTS) assert.ok(s.t1 - s.t0 >= 2.5 && s.t1 - s.t0 <= 4.5, s.id);
  for (const id of ['kettle', 'scooter']) assert.ok(shot(id).from.z >= 2 && shot(id).to.z >= 2, `${id} isn't a close-up`);
  for (const id of ['wide', 'rest']) assert.ok(shot(id).from.z <= 1.2 && shot(id).to.z <= 1.2, `${id} isn't wide`);
  assert.ok(HOOK.t1 <= shot('kettle').t0 && LINE2.t0 >= shot('rest').t0 + DISSOLVE);
});

test('no layer ever looks past the drawing, and the camera ends where it began (the loop)', () => {
  for (const t of frames.concat(DURATION)) for (const d of Object.values(LAYERS)) {
    const v = viewOf(layerCam(cameraAt(t), d));
    assert.ok(v.x0 >= -0.01 && v.y0 >= -0.01 && v.x1 <= W + 0.01 && v.y1 <= H + 0.01, `layer ${d} off at ${t.toFixed(2)} s`);
  }
  assert.deepEqual(cameraAt(0), WIDE);
  assert.deepEqual(cameraAt(DURATION), WIDE);
  assert.equal(dissolveAt(0), null);
  for (let i = 1; i < SHOTS.length; i++) assert.ok(dissolveAt(SHOTS[i].t0 + DISSOLVE / 2)!.k > 0.3);
});

test('the close-ups hold their subject: the kettle and its steam; the tail light and its reflection in the puddle', () => {
  for (const t of frames.filter(t => shotAt(t).id === 'kettle')) {
    assert.ok(inView(t, KETTLE.x, KETTLE.y) && inView(t, KETTLE.x, KETTLE.y - STEAM.rise - 30), `kettle cut off at ${t.toFixed(2)}`);
  }
  const r = reflect(TAIL_LIGHT);
  assert.ok(r.y > WATER_Y && r.y < PUDDLE.y + PUDDLE.ry, 'the reflection is not in the puddle');
  for (const t of frames.filter(t => shotAt(t).id === 'scooter')) {
    assert.ok(inView(t, TAIL_LIGHT.x, TAIL_LIGHT.y) && inView(t, r.x, r.y), `tail light or reflection cut off at ${t.toFixed(2)}`);
  }
});

test('the kettle keeps steaming: at every frame at least three wisps show, each rising and fading', () => {
  for (const t of frames) assert.ok([0, 1, 2, 3].filter(i => steamAt(i, t).alpha > 0.2).length >= 3, `steam thin at ${t.toFixed(2)}`);
  assert.ok(steamAt(0, 0.4).rise > steamAt(0, 0.1).rise);
});

test('reflections mirror about the water line', () => {
  for (const p of [{ x: 100, y: 900 }, TAIL_LIGHT, { x: 700, y: WATER_Y - 5 }]) {
    const r = reflect(p);
    assert.equal(r.x, p.x);
    assert.ok(Math.abs((r.y - WATER_Y) - (WATER_Y - p.y)) < 1e-9);
  }
});

test('it is always raining off the tin roof: a curtain of drips along the edge, every frame', () => {
  for (const t of frames) {
    const d = dripsAt(t);
    assert.ok(d.length >= 8, `only ${d.length} drips at ${t.toFixed(2)}`);
    for (const p of d) assert.ok(p.x >= AWNING_EDGE.x0 && p.x <= AWNING_EDGE.x1 && p.y >= AWNING_EDGE.y, 'a drip off the edge');
  }
});

test('rings spread on the puddle: each grows and fades, and some are always there', () => {
  for (const t of frames) {
    const rs = ripplesAt(t);
    assert.ok(rs.length >= 2);
    for (const r of rs) assert.ok(r.alpha >= 0 && r.alpha <= 1 && r.rx >= 0 && r.rx <= PUDDLE.rx);
  }
  const a = ripplesAt(1.0)[0], b = ripplesAt(1.05)[0];
  assert.ok(b.rx > a.rx || b.alpha > a.alpha, 'rings don\\u2019t move');
});

test('the bulb is alive but never goes out: a slight flicker between 85 % and full', () => {
  const vs = frames.map(bulbAt);
  assert.ok(Math.min(...vs) >= 0.85 && Math.max(...vs) <= 1);
  assert.ok(Math.max(...vs) - Math.min(...vs) > 0.05, 'no flicker');
});

test('she sips in the first shot, blinks in the wide shots, and leans back with her eyes closed at the end', () => {
  assert.equal(sipAt(0), 0);
  const top = frames.filter(t => sipAt(t) === 1);
  assert.ok(top.length && top.every(t => shotAt(t).id === 'wide' && eyesClosed(t)));
  assert.equal(sipAt(shot('kettle').t0 - 0.2), 0);
  for (const b of BLINKS) assert.ok(eyesClosed(b + 0.05) && !eyesClosed(b + 0.2), `blink at ${b}`);
  assert.equal(leanAt(shot('rest').t0), 0);
  assert.ok(leanAt(DURATION) > 0.99 && eyesClosed(DURATION));
  assert.ok(MUSIC.chime >= LINE2.t0 && MUSIC.chime < DURATION - 1);
});

test('painted, not outlined: every edge is a darker shade of its own colour, never black ink (Painted 2D)', () => {
  assert.deepEqual(paintProblems(PAINT), []);
});

test('the words are readable: white on the dusk sky and on the wet road (WCAG AA)', () => {
  for (const bg of [SCENE.skyTop, SCENE.skyMid]) assert.ok(contrast(SCENE.text, bg) >= 4.5, `text on ${bg}: ${contrast(SCENE.text, bg).toFixed(2)}`);
  assert.ok(contrast(SCENE.text, SCENE.road) >= 4.5);
});

test('the sound: rain from the first frame to the last', () => {
  assert.equal(MUSIC.style, 'calm');
  const rain = SOUND.beds.filter(b => b.kind === 'rain');
  assert.equal(rain.length, 1); assert.equal(rain[0].t0, 0); assert.equal(rain[0].t1, DURATION);
});
