import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, METALS, saltAt, colourAt, flameFlicker, electronShellAt,
  photonAt, PHOTON_EV, T_UP, T_DOWN, T_ORBIT, CAMERA, SOUND,
} from '../src/lib/pc006.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Chemistry, visualised #6 (predict-first): a barium salt in the flame turns it apple green (NCERT Class 11,
// s-block flame tests). Each metal's electrons, kicked up by the heat, fall back giving one colour: E = hc/λ.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const hue = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

test('the flame colours are NCERT\'s (Class 11, s-block) and match each metal\'s real emission lines', () => {
  const by = Object.fromEntries(METALS.map(m => [m.sym, m]));
  assert.deepEqual(METALS.map(m => m.sym), ['Li', 'Na', 'K', 'Ca', 'Ba'], 'barium last: it is the question');
  assert.deepEqual(METALS.map(m => m.ncert), ['crimson red', 'yellow', 'violet', 'brick red', 'apple green']);
  near(by.Li.nm[0], 670.8); near(by.Na.nm[0], 589.0); near(by.K.nm[0], 766.5); near(by.K.nm[1], 404.4); near(by.Ca.nm[0], 622); near(by.Ba.nm[0], 524);
  const h = (s: string) => hue(by[s].hex);
  assert.ok(h('Li') > 340 || h('Li') < 8, `Li hue ${h('Li')}`);
  assert.ok(h('Na') > 42 && h('Na') < 60, `Na hue ${h('Na')}`);
  assert.ok(h('K') > 255 && h('K') < 300, `K hue ${h('K')}`);
  assert.ok(h('Ca') > 8 && h('Ca') < 30, `Ca hue ${h('Ca')}`);
  assert.ok(h('Ba') > 85 && h('Ba') < 140, `Ba hue ${h('Ba')}`);
  assert.ok(by.Ba.nm.every(nm => nm >= 495 && nm <= 570), 'barium\'s lines are green light');
});

test('the answer, re-derived: barium → green; the photon is 1239.84 / 524 = 2.37 eV', () => {
  assert.match(OPTIONS[ANSWER], /green/);
  near(PHOTON_EV, 1239.84 / 524, 1e-9); assert.equal(PHOTON_EV.toFixed(2), '2.37');
  const ba = METALS[METALS.length - 1];
  near(ANSWER_AT, ba.at + 0.45);
  assert.ok(ANSWER_AT < 6, 'the answer comes within 6 s');
});

test('each flame is gas-blue until its salt goes in, then turns its colour and stays; the salts go in one by one', () => {
  for (let i = 0; i < METALS.length; i++) {
    const m = METALS[i];
    assert.equal(saltAt(i, m.at - 0.01), 0); near(saltAt(i, m.at + 0.6), 1); near(saltAt(i, END_AT), 1);
    for (const t of frames) { const s = saltAt(i, t); assert.ok(s >= 0 && s <= 1); }
    assert.equal(colourAt(i, 0), '#6fa8ff'); assert.equal(colourAt(i, m.at + 1), m.hex);
    if (i) assert.ok(m.at - METALS[i - 1].at >= 0.7, 'one at a time');
  }
});

test('something moves on every frame of the first 3 s: the flames flicker from frame 0', () => {
  for (let f = 1; f <= 90; f++) assert.ok(flameFlicker(0, f / 30) !== flameFlicker(0, (f - 1) / 30), `still at frame ${f}`);
  for (const t of frames) for (let i = 0; i < METALS.length; i++) { const v = flameFlicker(i, t); assert.ok(v > 0.75 && v < 1.25); }
});

test('the atom: the electron jumps up with the heat, falls back, and only then the photon flies', () => {
  assert.equal(electronShellAt(T_UP - 0.1), 1); assert.equal(electronShellAt((T_UP + T_DOWN) / 2), 3); assert.equal(electronShellAt(T_DOWN + 0.6), 1);
  for (let k = 1; k < frames.length; k++) assert.ok(Math.abs(electronShellAt(frames[k]) - electronShellAt(frames[k - 1])) < 0.5, `electron jumps at ${frames[k]}`);
  assert.equal(photonAt(T_DOWN - 0.01), null);
  const p = photonAt(T_DOWN + 0.5);
  assert.ok(p && p.travel > 0 && p.travel <= 1);
});

test('the camera: zooms in twice and out once, a punch-in on the answer, one orbit at the close only (60–120°)', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.4 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  let lo = Infinity, hi = -Infinity;
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.85 && b[0] <= 2.2 && Math.abs(b[0] - a[0]) < 0.1 && Math.abs(b[2] - a[2]) < 0.06, `camera jumps at ${frames[i]}`);
    if (frames[i] < T_ORBIT) near(b[2], 0, 1e-9);
    lo = Math.min(lo, b[2]); hi = Math.max(hi, b[2]);
  }
  const arc = ((hi - lo) * 180) / Math.PI;
  assert.ok(arc >= 60 && arc <= 120, `orbit ${arc}°`);
  assert.ok(T_ORBIT > ANSWER_AT && T_ORBIT >= CAPTIONS[CAPTIONS.length - 1].t0, 'the orbit is the closing moment');
  assert.ok(!CAMERA.keys.some(k => k.t >= T_ORBIT && k.dur <= 0.9), 'the orbit is slow (no whoosh)');
});

test('sound from the picture: the burners roar the whole time, the salt crackles as each goes in, whooshes on fast zooms', () => {
  const roar = SOUND.beds.filter(b => b.kind === 'roar');
  assert.equal(roar.length, 1); near(roar[0].t0, 0); assert.ok(roar[0].t1 >= END_AT);
  for (const m of METALS) {
    const cr = SOUND.hits.filter(h => h.kind === 'crack' && h.t >= m.at && h.t < m.at + 0.5);
    assert.ok(cr.length >= 2, `${m.sym}: ${cr.length} crackles`);
  }
  assert.ok(SOUND.hits.filter(h => h.kind === 'crack').every(h => METALS.some(m => h.t >= m.at && h.t < m.at + 0.5)), 'a crackle with no salt');
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  assert.equal(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
