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

// How high a sound sits: for a sine of frequency f the energy of its sample-to-sample differences is 4 sin²(πf/SR) of its
// own, so this ratio gives a rough "brightness" in Hz without an FFT.
const brightness = (a: Float32Array, t0: number, t1: number) => {
  let e = 0, d = 0; const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR);
  for (let i = i0 + 1; i < i1; i++) { e += a[i] * a[i]; d += (a[i] - a[i - 1]) ** 2; }
  return (SR / Math.PI) * Math.asin(Math.min(1, Math.sqrt(d / e) / 2));
};

// Modelled on a studied reel's sounds (2026-10-21, measured, never copied): a bright snap on a cut to a new screen
// (centred near 5 kHz, gone in ~0.2 s) and an airy shimmer under a camera move (6–7 kHz, fading over ~2 s).
test('snap: a bright, short hit for a pattern break (a flip to a new screen)', () => {
  const out = renderSfx({ duration: 2, hits: [{ kind: 'snap', t: 0.5, gain: 1 }], beds: [] });
  assert.ok(brightness(out, 0.5, 0.6) > 3000, `snap too dull: ${brightness(out, 0.5, 0.6).toFixed(0)} Hz`);
  assert.ok(rms(out, 0.5, 0.55) > 0.05, 'snap too quiet');
  assert.ok(rms(out, 0.8, 2) < 1e-4, 'snap still ringing after 0.3 s');
});

test('shimmer: an airy swell that rises, then fades over about 2 s', () => {
  const out = renderSfx({ duration: 4, hits: [{ kind: 'shimmer', t: 0.5, gain: 1 }], beds: [] });
  assert.ok(brightness(out, 0.5, 2.5) > 4500, `shimmer too dull: ${brightness(out, 0.5, 2.5).toFixed(0)} Hz`);
  assert.ok(rms(out, 0.7, 0.9) > 2 * rms(out, 0.5, 0.55), 'shimmer should swell in, not start at full');
  assert.ok(rms(out, 1.5, 1.8) > 0.2 * rms(out, 0.7, 0.9), 'shimmer gone too soon');
  assert.ok(rms(out, 3.2, 4) < 1e-4, 'shimmer still sounding after 2.7 s');
});

// The review panel's sound critic (F38, Chemistry #11): a metal hit had only a thud, which phone speakers barely play, so
// "copper rings, salt cracks" was lost. A clang: bright metal partials (1–4 kHz), ringing about 0.4 s.
test('clang: a bright metallic ring that phone speakers can play, gone in about half a second', () => {
  const out = renderSfx({ duration: 2, hits: [{ kind: 'clang', t: 0.5, gain: 1 }], beds: [] });
  const b = brightness(out, 0.5, 0.8);
  assert.ok(b > 1000 && b < 4500, `clang should sit at 1–4 kHz: ${b.toFixed(0)} Hz`);
  assert.ok(rms(out, 0.5, 0.55) > 0.08, 'clang too quiet');
  assert.ok(rms(out, 0.8, 0.9) > 0.1 * rms(out, 0.5, 0.55), 'clang should ring, not stop dead');
  assert.ok(rms(out, 1.4, 2) < 1e-3, 'clang still ringing after 0.9 s');
});

// The sound critic again: a music swell can bury a beat, or ride over a burst. A reel can shape its music's level over time
// (`music`), on top of the dips under each effect.
test('a reel can shape its music: the level curve multiplies the music, and only the music', () => {
  const n = 2 * SR, tone = Float32Array.from({ length: n }, (_, i) => 0.2 * Math.sin((2 * Math.PI * 300 * i) / SR));
  const plain = mixWithMusic([tone, tone], { duration: 2, hits: [], beds: [] });
  const shaped = mixWithMusic([tone, tone], { duration: 2, hits: [], beds: [], music: t => (t < 1 ? 1 : 0.5) });
  assert.ok(Math.abs(rms(shaped.left, 0.2, 0.8) - rms(plain.left, 0.2, 0.8)) < 1e-6, 'untouched where the curve is 1');
  assert.ok(Math.abs(rms(shaped.left, 1.2, 1.8) / rms(plain.left, 1.2, 1.8) - 0.5) < 0.01, 'halved where the curve is 0.5');
  const fx = mixWithMusic([new Float32Array(n), new Float32Array(n)], { duration: 2, hits: [{ kind: 'snap', t: 1.2, gain: 1 }], beds: [], music: () => 0 });
  assert.ok(rms(fx.left, 1.2, 1.3) > 0.01, 'the effects are not touched by the music curve');
});

test('the same score always renders the same sound', () => {
  const score: Score = { duration: 2, hits: [{ kind: 'tap', t: 0.5, gain: 0.7 }], beds: [{ kind: 'roar', t0: 0.2, t1: 1.5, level: () => 1 }] };
  assert.deepEqual(renderSfx(score), renderSfx(score));
});

test('a bed (burner roar, friction scrape, rain, dawn) sounds only while it runs and follows its level', () => {
  for (const kind of ['roar', 'scrape', 'rain', 'dawn'] as const) {
    const out = renderSfx({ duration: 4, hits: [], beds: [{ kind, t0: 1, t1: 2, level: t => (t < 1.5 ? 1 : 0) }] });
    assert.equal(rms(out, 0, 0.99), 0, `${kind} before it starts`);
    assert.ok(rms(out, 1.1, 1.4) > 0.01, `${kind} silent while on`);
    assert.ok(rms(out, 1.75, 4) < 1e-3, `${kind} after its level drops to 0`);
  }
});

test('rain: a steady hiss with the patter of drops, and the music stays put under it', () => {
  const score: Score = { duration: 3, hits: [], beds: [{ kind: 'rain', t0: 0, t1: 3, level: () => 1 }] };
  const out = renderSfx(score), w = [0.2, 0.7, 1.2, 1.7, 2.2].map(a => rms(out, a, a + 0.5));
  for (const v of w) assert.ok(v > 0.02 && Math.abs(v - w[0]) / w[0] < 0.2, `rain isn't steady: ${w.map(x => x.toFixed(3))}`);
  let ticks = 0;                                              // drops: short peaks well above the hiss
  for (let i = Math.round(0.2 * SR); i < out.length; i += Math.round(0.02 * SR)) {
    let m = 0; for (let j = i; j < i + Math.round(0.02 * SR) && j < out.length; j++) m = Math.max(m, Math.abs(out[j]));
    if (m > 3.5 * w[0]) ticks++;
  }
  assert.ok(ticks >= 20, `only ${ticks} drops heard in 2.8 s`);
  assert.ok(duckGain(score).every(g => g === 1), 'the music dips under the rain');
});

test('dawn (One Day, 2026-10-27): a quiet wind under bird chirps, a few a second, and the music stays put under it', () => {
  const score: Score = { duration: 4, hits: [], beds: [{ kind: 'dawn', t0: 0, t1: 4, level: () => 1 }] };
  const out = renderSfx(score), base = rms(out, 0.2, 3.8);
  assert.ok(base > 0.005 && base < 0.06, `dawn level ${base.toFixed(4)}: a bed under the music, not over it`);
  let chirps = 0, inChirp = false;                             // chirps: 20 ms windows well above the wind
  for (let i = Math.round(0.2 * SR); i < out.length; i += Math.round(0.02 * SR)) {
    let m = 0; for (let j = i; j < i + Math.round(0.02 * SR) && j < out.length; j++) m = Math.max(m, Math.abs(out[j]));
    const loud = m > 4 * base;
    if (loud && !inChirp) chirps++;
    inChirp = loud;
  }
  assert.ok(chirps >= 6 && chirps <= 40, `${chirps} chirps in 3.8 s`);
  assert.ok(duckGain(score).every(g => g === 1), 'the music dips under the dawn bed');
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
