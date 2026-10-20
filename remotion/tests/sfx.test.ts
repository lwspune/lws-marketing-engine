import test from 'node:test';
import assert from 'node:assert/strict';
import { SR, HIT_KINDS, renderSfx, duckGain, mixWithMusic, whooshesFor, readWav, writeWav, type Score } from '../src/lib/sfx.ts';

// Reel-specific sound (founder, 2026-10-20): effects made in code from the reel's own timeline, so each one lands on
// its event in the picture. The music dips under them and comes back; the mix stays inside the house limits.
const rms = (a: Float32Array, t0: number, t1: number) => {
  let s = 0; const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR);
  for (let i = i0; i < i1; i++) s += a[i] * a[i];
  return Math.sqrt(s / Math.max(1, i1 - i0));
};
const peakOf = (a: Float32Array) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

test('every effect sounds at its own moment and not before', () => {
  for (const kind of HIT_KINDS) {
    const out = renderSfx({ duration: 3, hits: [{ kind, t: 1, gain: 1 }], beds: [] });
    assert.equal(rms(out, 0, 0.99), 0, `${kind} sounds early`);
    assert.ok(rms(out, 1, 1.15) > 0.01, `${kind} is silent`);
    assert.ok(peakOf(out) <= 1, `${kind} clips`);
  }
});

test('the same score always renders the same sound', () => {
  const score: Score = { duration: 2, hits: [{ kind: 'tap', t: 0.5, gain: 0.7 }], beds: [{ kind: 'roar', t0: 0.2, t1: 1.5, level: () => 1 }] };
  assert.deepEqual(renderSfx(score), renderSfx(score));
});

test('a bed (burner roar, friction scrape) sounds only while it runs and follows its level', () => {
  for (const kind of ['roar', 'scrape'] as const) {
    const out = renderSfx({ duration: 4, hits: [], beds: [{ kind, t0: 1, t1: 2, level: t => (t < 1.5 ? 1 : 0) }] });
    assert.equal(rms(out, 0, 0.99), 0, `${kind} before it starts`);
    assert.ok(rms(out, 1.1, 1.4) > 0.01, `${kind} silent while on`);
    assert.ok(rms(out, 1.75, 4) < 1e-3, `${kind} after its level drops to 0`);
  }
});

test('the music dips under effects, smoothly, and is untouched far from them', () => {
  const score: Score = { duration: 6, hits: [{ kind: 'crack', t: 1, gain: 1 }], beds: [{ kind: 'scrape', t0: 3, t1: 4, level: () => 1 }] };
  const g = duckGain(score);
  assert.equal(g[Math.round(0.5 * SR)], 1);
  assert.equal(g[Math.round(5.8 * SR)], 1);
  assert.ok(g[Math.round(1.05 * SR)] < 0.85, 'no dip under the crack');
  assert.ok(g[Math.round(3.5 * SR)] < 0.75, 'no dip under the scrape');
  for (let i = 1; i < g.length; i++) {
    assert.ok(g[i] >= 0.5 && g[i] <= 1, `gain ${g[i]} out of range`);
    assert.ok(Math.abs(g[i] - g[i - 1]) < 1e-3, `gain jumps at ${i / SR}s`);
  }
});

test('the mix keeps the peak at or below −3 dB, limiting only around loud moments, music untouched elsewhere', () => {
  const n = 4 * SR, music = [new Float32Array(n), new Float32Array(n)];
  for (let i = 0; i < n; i++) music[0][i] = music[1][i] = 0.5 * Math.sin((2 * Math.PI * 220 * i) / SR);   // music peaks −6 dB
  const { left, right } = mixWithMusic(music, { duration: 4, hits: [{ kind: 'thunk', t: 2, gain: 1 }], beds: [] });
  // −3.3 dB, not −3: AAC encoding can overshoot the WAV's peak by ~0.1 dB (reel 014 remake measured −2.9 dB after a −3.0 mix)
  assert.ok(Math.max(peakOf(left), peakOf(right)) <= 10 ** (-3.3 / 20) + 1e-6);
  for (const i of [1000, 5000, 20000, 3.5 * SR]) assert.ok(Math.abs(left[i] - music[0][i]) < 1e-6, `music changed at ${i / SR}s`);
});

test('only fast zooms get a whoosh: in for a zoom in, out for a zoom out, peaking as the move ends', () => {
  const keys = [{ t: 1, dur: 3, to: [1.6, 0] }, { t: 5, dur: 0.4, to: [2.2, 0] }, { t: 7, dur: 0.6, to: [1, 0] }];
  const w = whooshesFor([1, 0], keys);
  assert.deepEqual(w.map(h => h.kind), ['whoosh-in', 'whoosh-out']);
  for (const [h, k] of [[w[0], keys[1]], [w[1], keys[2]]] as const) {
    const out = renderSfx({ duration: 9, hits: [h], beds: [] });
    let best = 0, at = 0;
    for (let s = h.t; s < h.t + 1; s += 0.01) { const r = rms(out, s, s + 0.02); if (r > best) { best = r; at = s; } }
    assert.ok(Math.abs(at - (k.t + k.dur)) < 0.12, `whoosh peaks at ${at}, move ends at ${k.t + k.dur}`);
  }
});

test('WAV files round-trip (48 kHz, 16-bit stereo, like the music)', () => {
  const a = new Float32Array([0, 0.5, -0.5, 0.25]), b = new Float32Array([0.1, -0.1, 0, 1]);
  const back = readWav(writeWav([a, b], SR));
  assert.equal(back.sampleRate, SR);
  for (let i = 0; i < 4; i++) { assert.ok(Math.abs(back.channels[0][i] - a[i]) < 1e-4); assert.ok(Math.abs(back.channels[1][i] - b[i]) < 1e-4); }
});
