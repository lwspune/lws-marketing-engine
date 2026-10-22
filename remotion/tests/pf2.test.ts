import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, HOOK, T_LOCK, T_ACT, MOVES, T_EXPLAIN, T_RECALL, T_TAKEAWAY, T_BRAND, PARTS, LABELS, PROCESS, PRINCIPLE, FORMULA,
  LAW_LABELS, ASSUMPTION, TAKEAWAY, BRAND, BAND, FULL_SCALE, CLOSED, magnetU, needle, fieldAlpha, partAt, labelAlpha, processAlpha,
  cameraAt, anchors, SOUND, MUSIC_HITS, COLOURS,
} from '../src/lib/pf2.ts';
import { emfAt, project } from '../src/lib/inductionScene.ts';
import { emf } from '../src/lib/induction.ts';
import { distinguishable } from '../src/lib/palette.ts';

// Reel A of the framework-2 test (L61): electromagnetic induction made exactly as `reels/pyqvault-framework-2.md` says
// (its P18 storyboard and §1.2 format): exploded parts → assemble → activate → explain with the formula → recall, on a
// dark navy board, ~30 s, no narration, a small PYQ Vault mark near the end. Our own framework's rules don't apply here.
const frames = Array.from({ length: Math.round(DURATION * 30) + 1 }, (_, i) => i / 30);
const words = (s: string) => s.split(/\s+/).filter(w => /\w/.test(w)).length;

test('format (§1.2): 30 s, inside the 20–35 s range; the hook is a 4–7 word question on frame 0', () => {
  assert.equal(DURATION, 30);
  assert.equal(HOOK, 'Can motion create voltage?');
  assert.ok(words(HOOK) >= 4 && words(HOOK) <= 7 && HOOK.endsWith('?'));
});

test('the storyboard grammar (§2, P18): hook 0–3 s, assemble 3–7 s, activate from 7 s, explain 17–23 s, recall 23–30 s', () => {
  assert.equal(T_LOCK, 7); assert.equal(T_ACT, 7); assert.equal(T_EXPLAIN, 17); assert.equal(T_RECALL, 23);
  for (const p of PARTS) assert.ok(p.at > 3 && p.at <= T_LOCK, `${p.name} locks at ${p.at}`);
  for (const p of PARTS) { assert.ok(partAt(p.name, 2.9) < 1, `${p.name} still apart in the hook`); assert.equal(partAt(p.name, T_LOCK), 1); }
  assert.equal(fieldAlpha(T_ACT - 0.05), 0);
  assert.ok(fieldAlpha(T_ACT + 0.8) > 0.99);
});

test('P18 beats: the magnet moves in and the needle swings; it stops and the needle returns to zero; out, and it reverses', () => {
  const [inn, out] = MOVES;
  assert.ok(inn.t0 >= 7 && inn.t1 <= 12 && out.t0 >= 12 && out.t1 <= 17);
  const swing = (a: number, b: number) => frames.filter(t => t > a && t < b).map(needle);
  const din = swing(inn.t0, inn.t1), dout = swing(out.t0, out.t1);
  const peakIn = din.reduce((m, v) => (Math.abs(v) > Math.abs(m) ? v : m), 0), peakOut = dout.reduce((m, v) => (Math.abs(v) > Math.abs(m) ? v : m), 0);
  assert.ok(Math.abs(peakIn) > 0.5 && Math.abs(peakOut) > 0.5, 'a clear deflection both ways');
  assert.ok(Math.sign(peakIn) === -Math.sign(peakOut), 'pulling away reverses the deflection');
  for (const t of frames.filter(t => t >= inn.t1 + 0.05 && t <= out.t0 - 0.05)) assert.equal(needle(t), 0, `still magnet, needle at zero (${t.toFixed(2)})`);
});

test('accuracy checks (P18): the needle is the EMF from Faraday\'s law, on a fixed scale, once the circuit is closed', () => {
  assert.equal(CLOSED, Math.max(...PARTS.map(p => p.at)));
  for (const t of frames.filter(t => t < CLOSED)) assert.equal(needle(t), 0, 'no current before the wires connect');
  for (const t of frames.filter(t => t >= CLOSED)) {
    const e = emfAt(magnetU, t);
    assert.ok(Math.abs(e) <= FULL_SCALE, `${e} V past full scale at ${t.toFixed(2)}`);
    assert.ok(Math.abs(needle(t) - e / FULL_SCALE) < 1e-12);
  }
  // A stationary magnet and coil induce nothing just because a field exists: the recall beat ends with it still inside.
  for (const t of frames.filter(t => t > T_TAKEAWAY)) { assert.equal(needle(t), 0); assert.ok(Math.abs(magnetU(t)) < 1e-9); }
  assert.ok(emf(0.02, 0.1) !== 0);
});

test('text density (§1.2): one hook, 2–4 component labels, one process label, one principle, one formula, one takeaway', () => {
  assert.ok(LABELS.length >= 2 && LABELS.length <= 4);
  assert.equal(typeof PROCESS, 'string'); assert.equal(typeof PRINCIPLE, 'string'); assert.equal(typeof TAKEAWAY, 'string');
  assert.equal(FORMULA, 'ℰ = −N dΦ/dt');
  assert.deepEqual(LAW_LABELS, ["Faraday's law", "Lenz's law"]);
  assert.equal(TAKEAWAY, 'No change in flux → no induced EMF');
  assert.equal(ASSUMPTION, 'Idealised coil and magnet');
  // Labels appear only when needed: each when its part locks, gone before the explanation.
  for (const l of LABELS) { assert.equal(labelAlpha(l.part, l.at - 0.05), 0); assert.ok(labelAlpha(l.part, l.at + 0.5) > 0.99); assert.equal(labelAlpha(l.part, T_EXPLAIN), 0); }
  // The process label shows only while the flux is changing.
  for (const t of frames) if (processAlpha(t) > 0.5) assert.ok(MOVES.some(m => t >= m.t0 - 0.3 && t <= m.t1 + 0.3), `process label at ${t}`);
});

test('branding (§1.2): a small PYQ Vault mark near the end only', () => {
  assert.equal(BRAND, 'PYQ Vault');
  assert.ok(T_BRAND >= DURATION - 5);
});

test('everything named stays inside the 3D band on every frame it is shown', () => {
  for (const t of frames) {
    const cam = cameraAt(t);
    for (const a of anchors(t)) {
      const q = project(a.p, cam, BAND);
      assert.ok(q.x > 40 && q.x < BAND.width - 40 && q.y > BAND.top + 20 && q.y < BAND.top + BAND.height - 20, `${a.name} off the band at ${t.toFixed(2)}`);
    }
  }
});

test('camera (§1.2): slow push-ins, one orbit during the assembly, no jumps', () => {
  for (let i = 1; i < frames.length; i++) {
    const a = cameraAt(frames[i - 1]).position, b = cameraAt(frames[i]).position;
    assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) < 0.06, `jump at ${frames[i]}`);
  }
});

test('sound (§1.2): a snap per part locking, a short activation sound, low impacts; no voice', () => {
  const snaps = SOUND.hits.filter(h => h.kind === 'snap').map(h => h.t);
  assert.deepEqual(snaps, PARTS.map(p => p.at));
  assert.ok(SOUND.hits.some(h => h.kind === 'shimmer' && Math.abs(h.t - T_ACT) < 0.05));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - MOVES[0].t1) < 0.05));
  assert.deepEqual(MUSIC_HITS, [T_ACT, T_EXPLAIN]);
});

test('the visual meaning system (§1.3): teal field and current, amber for the answer, apart for colour-blind viewers', () => {
  assert.ok(distinguishable(COLOURS.field, COLOURS.amber));
  assert.ok(distinguishable(COLOURS.north, COLOURS.south));
});
