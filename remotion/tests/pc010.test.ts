import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, HEADER, OPTIONS, ANSWER, BRAND, T_ENTER, T_FLAME_OUT, CUT1, T_HOP0, T_HOP1, T_SIZE1, T_PAIR, T_LATTICE0,
  T_LATTICE1, T_CRYSTAL, CUT2, ANSWER_AT, T_SECOND, T_POUR0, T_POUR1, T_DISSOLVE0, ANSWER2_AT, SHELLS, PROTONS, RADIUS_PM, NACL_PM,
  UNIT_PM, JAR, cupAt, flameAt, flashAt, shakeAt, sparksAt, chlorineAt, smokeAt, depositAt, cupCrystalsAt, sceneAt, washAt,
  atomsAt, SITES, PAIR_SITES, ionsAt, crystalAt, CRYSTAL_HALF, BEAKER, ELECTRODES, waterLevel, pourAt, grainsAt, waterIonsAt,
  bulbGlow, MACRO_CAMERA, MICRO_CAMERA, cameraAt, project, BAND, CAPTIONS, SECOND_HOOK, END_LINES, MUSIC_HITS, SOUND, COVER_T,
  type V3,
} from '../src/lib/pc010.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { VIVID, REAL, distinguishable } from '../src/lib/palette.ts';

// @pyqvault_ · Chemistry, visualised #10 (You'd think + Shock): an explosive metal and a poison gas make table salt.
// Sodium burns in chlorine; one electron moves from Na to Cl; Na⁺ and Cl⁻ stack into the cubic rock-salt lattice, which is
// why a salt grain is a cube. Second hook: dry salt doesn't conduct, salt water does (the ions can move).
// Class 11 Chemistry · Chemical bonding (ionic bond). Framework v1.28: Shock (F25), F26, end card (F27), F20.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const inFrame = (t: number, pts: V3[], what: string) => {
  const cam = cameraAt(t);
  for (const p of pts) {
    const s = project(p, cam);
    assert.ok(s.x > 30 && s.x < BAND.width - 30 && s.y > BAND.top + 20 && s.y < BAND.top + BAND.height - 20,
      `${what} ${p.map(v => v.toFixed(2))} off band at ${t.toFixed(2)} (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`);
  }
};
const box = (c: V3, h: number[]): V3[] => [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [c[0] + x * h[0], c[1] + y * h[1], c[2] + z * h[2]] as V3)));

test('the shock lands in the first second (F25): the burning spoon is already plunging on frame 0 and enters the gas at 0.2 s', () => {
  assert.ok(cupAt(0)[1] > JAR.h && cupAt(0)[1] < JAR.h + 0.6, 'the cup starts just above the jar mouth, inside the picture');
  assert.ok(cupAt(1 / 30)[1] < cupAt(0)[1], 'and is already moving down on frame 0');
  assert.ok(T_ENTER <= 0.25);
  near(cupAt(T_ENTER)[1], JAR.h, 1e-6);
  assert.ok(flameAt(0) > 0 && flameAt(0) < 0.3, 'a small flame on the bead before it enters');
  assert.ok(flameAt(T_ENTER + 0.1) > 0.9, 'the burst');
  assert.equal(flashAt(T_ENTER - 0.01), 0);
  assert.ok(flashAt(T_ENTER) > 0.45, 'white flash');
  assert.ok(flashAt(T_ENTER + 0.15) < 0.2, 'the flash clears fast, so the flame is seen');
  assert.ok(Math.hypot(...shakeAt(T_ENTER + 0.1)) > 0.02, 'the camera shakes');
  assert.ok(Math.hypot(...shakeAt(1.8)) < 0.004, 'and settles');
  assert.ok(sparksAt(T_ENTER + 0.15).length >= 30, 'sodium sparks');
  assert.equal(flameAt(T_FLAME_OUT + 0.05), 0, 'the flame is out');
  assert.ok(T_FLAME_OUT < CUT1);
});

test('something changes on every frame of the first 3 s (F5)', () => {
  const state = (t: number) => JSON.stringify([cupAt(t), flameAt(t), smokeAt(t).length, smokeAt(t)[0]?.pos, chlorineAt(t), cameraAt(t).position]);
  for (let f = 1; f <= 90; f++) assert.notEqual(state((f - 1) / 30), state(f / 30), `nothing moves at frame ${f}`);
});

test('the reaction (F10): the green gas is used up, white smoke fills the jar and settles as salt', () => {
  near(chlorineAt(0), 1);
  assert.ok(chlorineAt(CUT1) < 0.3, 'most of the chlorine is gone');
  assert.ok(smokeAt(1.5).length >= 40, 'white smoke');
  for (const t of frames.filter(t => t < CUT1)) for (const s of smokeAt(t)) {
    assert.ok(Math.hypot(s.pos[0], s.pos[2]) + s.r <= JAR.r - JAR.wall + 1e-6, `smoke through the glass at ${t}`);
    assert.ok(s.pos[1] - s.r >= 0 && s.pos[1] + s.r <= JAR.h + 0.05, `smoke out of the jar at ${t}`);
  }
  assert.equal(smokeAt(CUT2).length, 0, 'settled by the time we come back');
  assert.ok(depositAt(CUT2) > 0.95 && depositAt(0) === 0);
  assert.equal(cupCrystalsAt(0).length, 0);
  assert.ok(cupCrystalsAt(ANSWER_AT).length >= 10, 'salt crystals in the spoon');
  for (const c of cupCrystalsAt(ANSWER_AT)) assert.ok(c.size > 0.04);
});

test('the chemistry (F10): one electron moves; both ions end with a full shell of 8; charges +1 and −1; sizes are real', () => {
  assert.deepEqual(SHELLS.Na, [2, 8, 1]); assert.deepEqual(SHELLS.Cl, [2, 8, 7]);
  assert.deepEqual(SHELLS['Na+'], [2, 8]); assert.deepEqual(SHELLS['Cl-'], [2, 8, 8]);
  assert.equal(sum(SHELLS.Na), PROTONS.Na); assert.equal(sum(SHELLS.Cl), PROTONS.Cl);
  assert.equal(PROTONS.Na - sum(SHELLS['Na+']), 1); assert.equal(PROTONS.Cl - sum(SHELLS['Cl-']), -1);
  assert.equal(sum(SHELLS.Na) + sum(SHELLS.Cl), sum(SHELLS['Na+']) + sum(SHELLS['Cl-']), 'no electron made or lost');
  assert.equal(SHELLS['Na+'].at(-1), 8); assert.equal(SHELLS['Cl-'].at(-1), 8);
  // Sodium shrinks when it loses its outer shell; chlorine swells when it gains an electron (atomic → ionic radii).
  assert.ok(RADIUS_PM['Na+'] < RADIUS_PM.Na && RADIUS_PM['Cl-'] > RADIUS_PM.Cl);
  // In rock salt the ions touch: r(Na⁺) + r(Cl⁻) is the Na–Cl distance, half the cubic cell's edge (564 pm).
  near(RADIUS_PM['Na+'] + RADIUS_PM['Cl-'], NACL_PM, NACL_PM * 0.01);
  near(NACL_PM * 2, 564, 1);
});

test('the hop: the lone outer electron of Na jumps into the gap in the ring of Cl; then Na shrinks to Na⁺ and Cl swells to Cl⁻', () => {
  const r = (k: keyof typeof RADIUS_PM) => RADIUS_PM[k] / UNIT_PM;
  const before = atomsAt(T_HOP0 - 0.05), after = atomsAt(T_SIZE1);
  assert.equal(before.na.electrons.length, 1); assert.equal(before.cl.electrons.length, 7);
  for (const e of before.na.electrons) near(dist(e, before.na.pos), before.na.r, 1e-6);
  for (const e of before.cl.electrons) near(dist(e, before.cl.pos), before.cl.r, 1e-6);
  near(before.na.r, r('Na'), 1e-6); near(before.cl.r, r('Cl'), 1e-6);
  assert.deepEqual([before.na.charge, before.cl.charge], [0, 0]);
  const mid = atomsAt((T_HOP0 + T_HOP1) / 2);
  assert.ok(mid.hop, 'the electron is in flight');
  assert.equal(mid.na.electrons.length + mid.cl.electrons.length, 7);
  const leave = atomsAt(T_HOP0).hop!, land = atomsAt(T_HOP1 - 1e-6).hop!;
  near(dist(leave, atomsAt(T_HOP0).na.pos), r('Na'), 1e-3);
  near(dist(land, atomsAt(T_HOP1).cl.pos), atomsAt(T_HOP1).cl.r, 0.02);
  assert.equal(after.na.electrons.length, 0); assert.equal(after.cl.electrons.length, 8);
  near(after.na.r, r('Na+'), 1e-6); near(after.cl.r, r('Cl-'), 1e-6);
  assert.deepEqual([after.na.charge, after.cl.charge], [1, -1]);
  for (const e of after.cl.electrons) near(dist(e, after.cl.pos), after.cl.r, 1e-6);
});

test('+ meets −: the ions snap together onto two neighbouring sites of the lattice, never overlapping on the way', () => {
  for (const t of frames.filter(t => t >= CUT1 && t < T_LATTICE0 + 0.01)) {
    const a = atomsAt(t);
    assert.ok(dist(a.na.pos, a.cl.pos) >= a.na.r + a.cl.r - 0.02, `the atoms overlap at ${t}`);
  }
  const p = atomsAt(T_PAIR);
  near(dist(p.na.pos, p.cl.pos), NACL_PM / UNIT_PM, 1e-6);
  p.na.pos.forEach((v, k) => near(v, SITES[PAIR_SITES[0]].pos[k], 1e-6));
  p.cl.pos.forEach((v, k) => near(v, SITES[PAIR_SITES[1]].pos[k], 1e-6));
  assert.equal(SITES[PAIR_SITES[0]].ion, 'Na+'); assert.equal(SITES[PAIR_SITES[1]].ion, 'Cl-');
});

test('the lattice is real rock salt: 4 × 4 × 4, 32 Na⁺ and 32 Cl⁻, every neighbour the opposite ion, nothing overlapping', () => {
  const d = NACL_PM / UNIT_PM, r = (ion: 'Na+' | 'Cl-') => RADIUS_PM[ion] / UNIT_PM;
  assert.equal(SITES.length, 64);
  assert.equal(SITES.filter(s => s.ion === 'Na+').length, 32);
  for (const a of SITES) {
    const nbrs = SITES.filter(b => Math.abs(dist(a.pos, b.pos) - d) < 1e-6);
    assert.ok(nbrs.length >= 3 && nbrs.length <= 6);
    for (const b of nbrs) assert.notEqual(a.ion, b.ion, 'two like ions side by side');
  }
  for (const t of frames.filter(t => t >= T_PAIR && t < CUT2)) {
    const ions = ionsAt(t).filter(i => i.alpha > 0.05);
    for (let i = 0; i < ions.length; i++) for (let j = i + 1; j < ions.length; j++)
      assert.ok(dist(ions[i].pos, ions[j].pos) >= r(ions[i].ion) + r(ions[j].ion) - 0.03, `ions overlap at ${t.toFixed(2)}`);
  }
  const done = ionsAt(T_LATTICE1);
  assert.equal(done.length, 64);
  for (const [i, ion] of done.entries()) { ion.pos.forEach((v, k) => near(v, SITES[i].pos[k], 1e-6)); assert.ok(ion.alpha > 0.99); }
  assert.ok(ionsAt(T_LATTICE0 + 0.3).filter(i => i.alpha > 0.05).length < 64, 'the cube builds, it is not just there');
});

test('the lattice becomes a crystal: a cube round the ions, as the scene cuts back', () => {
  assert.equal(crystalAt(T_CRYSTAL - 0.01), 0);
  assert.ok(crystalAt(CUT2 - 0.05) > 0.9);
  const far = Math.max(...SITES.flatMap(s => s.pos.map(Math.abs))) + RADIUS_PM['Cl-'] / UNIT_PM;
  assert.ok(CRYSTAL_HALF >= far - 1e-6 && CRYSTAL_HALF < far + 0.5);
});

test('the cuts: the smoke washes the screen white at each scale change; the camera jumps only there', () => {
  for (const c of [CUT1, CUT2]) assert.ok(washAt(c) > 0.95 && washAt(c - 1 / 30) > 0.6 && washAt(c + 1 / 30) > 0.6, `wash at ${c}`);
  assert.equal(washAt(0), 0); assert.equal(washAt(ANSWER_AT), 0);
  for (const t of frames) assert.equal(sceneAt(t), t >= CUT1 && t < CUT2 ? 'micro' : 'macro');
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]), b = cameraAt(frames[i]);
    const crossesCut = [CUT1, CUT2].some(c => frames[i - 1] < c && frames[i] >= c);
    if (crossesCut) continue;
    const step = dist(a.position, b.position) / dist(a.position, a.target);
    assert.ok(step < 0.16, `camera jumps at ${frames[i].toFixed(2)} (${step.toFixed(3)})`);
  }
});

test('the answer: C table salt, after we come back to the spoon of cubes, with a punch-in landing on it', () => {
  assert.match(OPTIONS[ANSWER], /table salt/);
  assert.ok(ANSWER_AT > CUT2 && ANSWER_AT < CUT2 + 1);
  assert.ok(MACRO_CAMERA.keys.some(k => k.dur > 0 && k.dur <= 0.5 && k.to[0] > 2 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  assert.ok(CAPTIONS.some(c => c.t0 === ANSWER_AT && /cube/.test(c.text)));
});

test('the second hook (F26): "Why does only salt water conduct?"; dry salt leaves the bulb dark, water frees the ions and it lights', () => {
  assert.equal(SECOND_HOOK.text, 'Why does only salt water conduct?');
  assert.ok(SECOND_HOOK.t0 > ANSWER_AT && SECOND_HOOK.t0 - ANSWER_AT <= 1.5 && words(SECOND_HOOK.text) <= 7);
  near(SECOND_HOOK.t0, T_SECOND);
  // Dry salt: the ions are locked in the crystal, so no current.
  for (const t of frames.filter(t => t < ANSWER2_AT - 0.2)) assert.equal(bulbGlow(t), 0, `lit too early at ${t}`);
  assert.equal(waterLevel(T_POUR0 - 0.01), 0); assert.ok(pourAt(T_POUR0 + 0.2) > 0.5); assert.equal(pourAt(T_POUR1 + 0.3), 0);
  const heapTop = Math.max(...grainsAt(T_SECOND).map(g => g.pos[1] + g.size / 2));
  assert.ok(waterLevel(T_DISSOLVE0) > heapTop, 'the salt is under water before it dissolves');
  assert.ok(grainsAt(T_SECOND).length >= 12);
  assert.equal(grainsAt(ANSWER2_AT).length, 0, 'dissolved by the time it lights');
  assert.equal(waterIonsAt(T_DISSOLVE0 - 0.01).length, 0, 'no free ions in the dry salt');
  assert.ok(bulbGlow(ANSWER2_AT + 0.4) > 0.8);
  assert.ok(CAPTIONS.some(c => c.t0 === ANSWER2_AT && /ions can move/.test(c.text)));
  // In water the ions move: Na⁺ toward the − electrode, Cl⁻ toward the +.
  const mean = (t: number, ion: string) => { const xs = waterIonsAt(t).filter(i => i.ion === ion).map(i => i.pos[0]); return sum(xs) / xs.length; };
  const t0 = ANSWER2_AT, t1 = END_AT - 0.1;
  assert.ok(ELECTRODES.neg[0] < ELECTRODES.pos[0]);
  assert.ok(mean(t1, 'Na+') < mean(t0, 'Na+') - 0.1, 'Na⁺ drifts to the − electrode');
  assert.ok(mean(t1, 'Cl-') > mean(t0, 'Cl-') + 0.1, 'Cl⁻ drifts to the + electrode');
  for (const t of frames.filter(t => t >= T_DISSOLVE0)) for (const i of waterIonsAt(t)) {
    assert.ok(Math.abs(i.pos[0] - BEAKER.x) < BEAKER.r - 0.08 && Math.abs(i.pos[2]) < BEAKER.r - 0.08, `ion through the glass at ${t}`);
    assert.ok(i.pos[1] > 0.05 && i.pos[1] < waterLevel(t), `ion out of the water at ${t}`);
    assert.ok(i.pos[0] >= ELECTRODES.neg[0] - 1e-9 && i.pos[0] <= ELECTRODES.pos[0] + 1e-9, 'an ion went past an electrode');
  }
});

test('the camera (F9): zooms in at least twice and out once on each scale, no slow zoom left unexplained', () => {
  for (const cam of [MACRO_CAMERA, MICRO_CAMERA]) {
    let z = cam.start[0], ins = 0, outs = 0;
    for (const k of cam.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
    assert.ok(ins >= 1 && outs >= 1, `${ins} in, ${outs} out`);
  }
  let z = MACRO_CAMERA.start[0], ins = 0;
  for (const k of MACRO_CAMERA.keys) { if (k.to[0] > z) ins++; z = k.to[0]; }
  assert.ok(ins >= 3);
});

test('what each beat must keep in frame stays inside the 3D band (runbook step 2)', () => {
  const jar = box([0, JAR.h / 2, 0], [JAR.r, JAR.h / 2, JAR.r]);
  const bk = box([BEAKER.x, BEAKER.h / 2, 0], [BEAKER.r, BEAKER.h / 2, BEAKER.r]);
  for (const t of frames) {
    if (t < 2.85) inFrame(t, [...jar, cupAt(t)], 'jar');
    else if (t >= CUT1 + 0.1 && t < T_LATTICE0) {
      const a = atomsAt(t);
      for (const at of [a.na, a.cl]) inFrame(t, [[at.pos[0] - at.r, at.pos[1] - at.r, at.pos[2]], [at.pos[0] + at.r, at.pos[1] + at.r, at.pos[2]]], 'atom');
    } else if (t >= T_LATTICE0 + 1.0 && t < CUT2) inFrame(t, box([0, 0, 0], [CRYSTAL_HALF, CRYSTAL_HALF, CRYSTAL_HALF]), 'lattice');
    else if (t >= CUT2 && t < CUT2 + 0.15) inFrame(t, jar, 'jar');
    else if (t >= ANSWER_AT && t < T_SECOND) inFrame(t, cupCrystalsAt(t).map(c => c.pos), 'crystals');
    else if (t >= T_SECOND + 0.7 && t < 11.3) inFrame(t, [...bk, BEAKER.bulb, BEAKER.battery], 'beaker');
    else if (t >= 11.75 && t < 12.9) inFrame(t, [ELECTRODES.neg, ELECTRODES.pos], 'electrodes');
    else if (t >= 14.1 && t < END_AT) inFrame(t, [...jar, ...bk], 'both');
  }
});

test('ends on the end card (F27: the last two reels looped); captions end before it', () => {
  assert.ok(END_AT < DURATION && DURATION - END_AT >= 2);
  assert.ok(END_LINES.includes('pyqvault.com'));
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
});

test('the cover: the burst, before any answer (F6)', () => {
  assert.ok(COVER_T > T_ENTER && COVER_T < 1 && flameAt(COVER_T) > 0.8 && flashAt(COVER_T) < 0.1);
});

test('sound from the picture (F14): the burst, the hop, the snap, the stacking, the pour, the bulb', () => {
  const at = (kind: string) => SOUND.hits.filter(h => h.kind === kind).map(h => h.t);
  const has = (kind: string, t: number, eps = 1e-6) => assert.ok(at(kind).some(x => Math.abs(x - t) < eps), `no ${kind} at ${t}`);
  has('whump', T_ENTER); assert.ok(at('boom').some(t => t > T_ENTER && t - T_ENTER < 0.15));
  has('click', T_HOP0); has('snap', T_HOP1); has('thunk', T_PAIR); has('shimmer', T_CRYSTAL);
  const taps = SOUND.hits.filter(h => h.kind === 'tap' && h.t > T_LATTICE0 && h.t <= T_LATTICE1 + 1e-6);
  assert.ok(taps.length >= 6, 'the ions click into place');
  for (let i = 1; i < taps.length; i++) assert.ok((taps[i].pitch ?? 1) > (taps[i - 1].pitch ?? 1), 'rising');
  assert.ok(at('shimmer').some(t => Math.abs(t - ANSWER2_AT) < 0.25), 'the bulb lights');
  assert.ok(SOUND.beds.some(b => b.kind === 'rain' && b.t0 === T_POUR0 && b.t1 === T_POUR1), 'the pour');
  assert.ok(SOUND.beds.some(b => b.kind === 'roar' && b.t0 === 0 && b.level(T_ENTER + 0.1) > b.level(0)), 'the burning');
  const fast = whooshesFor(MACRO_CAMERA.start, MACRO_CAMERA.keys.filter(k => k.dur > 0)).length + whooshesFor(MICRO_CAMERA.start, MICRO_CAMERA.keys).length;
  assert.equal(SOUND.hits.filter(h => h.kind.startsWith('whoosh')).length, fast);
  assert.equal(SOUND.duration, DURATION);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, ANSWER2_AT]);
});

test('short (≤ 25 s), lines ≤ 7 words, the question from frame 0 with the tag (F4, F7, F18, F20)', () => {
  assert.ok(DURATION <= 25);
  for (const c of [...CAPTIONS, ...HEADER.map(text => ({ text })), ...END_LINES.map(text => ({ text }))]) assert.ok(words(c.text) <= 7, `too long: "${c.text}"`);
  assert.equal(BRAND, 'PYQ Vault · pyqvault.com');
  assert.ok(CAPTIONS[0].t0 >= 2.4, 'no caption competes with the question in the first seconds');
  for (let k = 1; k < CAPTIONS.length; k++) assert.ok(CAPTIONS[k].t0 >= CAPTIONS[k - 1].t1 - 1e-9, 'captions overlap');
  for (const c of CAPTIONS) assert.ok(c.t1 - c.t0 >= 0.8, `"${c.text}" is up too short to read`);
});

test('colours (F24): chlorine is chlorine from gas to ion, sodium a violet ion; the pairs read apart, colour-blind safe', () => {
  assert.ok(REAL.lab.sodium, 'sodium is a REAL material');
  assert.ok(distinguishable(VIVID.lab.violet, REAL.lab.chlorine.fill), 'Na⁺ vs Cl⁻');
  assert.ok(distinguishable(VIVID.lab.cyan, VIVID.lab.violet), 'the electron vs Na');
  assert.ok(distinguishable(VIVID.lab.cyan, REAL.lab.chlorine.fill), 'the electron vs Cl');
});
