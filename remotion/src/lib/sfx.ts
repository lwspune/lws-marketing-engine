// Reel-specific sound effects (founder, 2026-10-20), made in code like the music, never a recording. A reel describes
// its sounds as a score built from its own timeline (a click at each degree, a scrape while the block slides…), so every
// effect lands on its event in the picture. mixWithMusic() dips the music under the effects and keeps the peak at −3 dB.
// 48 kHz, like the music WAVs from reels/tools/music.mjs. Pure functions: tested in tests/sfx.test.ts.
import type { Key } from './motion.ts';

export const SR = 48000;
export const HIT_KINDS = ['click', 'crack', 'thunk', 'whump', 'tap', 'boom', 'whoosh-in', 'whoosh-out', 'snap', 'shimmer'] as const;
export type HitKind = (typeof HIT_KINDS)[number];
/** A one-off sound at time t. `pitch` scales the click / tap tone (1 = its normal pitch). */
export type Hit = { kind: HitKind; t: number; gain: number; pitch?: number };
/** A sound that runs from t0 to t1, as loud as level(t) (0…1): a burner's roar, a friction scrape, rain. */
export type Bed = { kind: 'roar' | 'scrape' | 'rain'; t0: number; t1: number; level: (t: number) => number };
export type Score = { duration: number; hits: Hit[]; beds: Bed[] };

const TAU = 2 * Math.PI;

// ---- building blocks ------------------------------------------------------------------------------------------------
function rng(seed: number) {                                  // mulberry32: the same seed always gives the same noise
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const white = (r: () => number) => r() * 2 - 1;

class Biquad {                                                // RBJ cookbook band-pass / low-pass
  b0 = 0; b1 = 0; b2 = 0; a1 = 0; a2 = 0; x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  set(type: 'band' | 'low', f: number, q: number) {
    const w = (TAU * Math.min(f, SR * 0.45)) / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w), a0 = 1 + al;
    if (type === 'band') { this.b0 = al / a0; this.b1 = 0; this.b2 = -al / a0; }
    else { this.b0 = (1 - c) / 2 / a0; this.b1 = (1 - c) / a0; this.b2 = (1 - c) / 2 / a0; }
    this.a1 = (-2 * c) / a0; this.a2 = (1 - al) / a0;
    return this;
  }
  run(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// ---- one-off sounds: each returns its samples (mono), loudest around 0.5–0.9 ----------------------------------------
const len = (s: number) => new Float32Array(Math.round(s * SR));
const WHOOSH_PEAK = 0.45;                                     // a whoosh is loudest this long after it starts

const HIT: Record<HitKind, (r: () => number, pitch: number) => Float32Array> = {
  // A ratchet tooth: a tiny noise tick and a short bright ping.
  click(r, pitch) {
    const out = len(0.06), f = 2300 * pitch;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = 0.45 * white(r) * Math.exp(-t / 0.0012) + 0.4 * Math.sin(TAU * f * t) * Math.exp(-t / 0.007) + 0.15 * Math.sin(TAU * 1.5 * f * t) * Math.exp(-t / 0.004);
    }
    return out;
  },
  // Static friction letting go: a sharp snap over a low knock.
  crack(r) {
    const out = len(0.4), bp = new Biquad().set('band', 2200, 0.8);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = 0.9 * bp.run(white(r)) * Math.exp(-t / 0.025) + 0.4 * Math.sin(TAU * 95 * t) * Math.exp(-t / 0.08);
    }
    return out;
  },
  // A wooden block hitting a stop: a falling low knock, a woody body and a short click.
  thunk(r) {
    const out = len(0.55), body = new Biquad().set('band', 240, 4), lp = new Biquad().set('low', 3000, 0.7);
    let ph = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR; ph += (TAU * (70 + 70 * Math.exp(-t / 0.05))) / SR;
      out[i] = 0.6 * Math.sin(ph) * Math.exp(-t / 0.09) + 2.2 * body.run(white(r)) * Math.exp(-t / 0.03) + 0.3 * lp.run(white(r)) * Math.exp(-t / 0.004);
    }
    return out;
  },
  // A gas burner lighting: a soft rush of air that opens up and settles, over a low thump.
  whump(r) {
    const out = len(1.0), lp = new Biquad();
    for (let i = 0; i < out.length; i++) {
      const t = i / SR, open = Math.min(1, t / 0.06) * Math.exp(-Math.max(0, t - 0.06) / 0.2);
      lp.set('low', 160 + 1500 * open, 0.9);
      out[i] = 0.9 * lp.run(white(r)) * Math.min(1, t / 0.025) * Math.exp(-t / 0.3) + 0.45 * Math.sin(TAU * 55 * t) * Math.min(1, t / 0.01) * Math.exp(-t / 0.2);
    }
    return out;
  },
  // A molecule hitting the metal lid: a tiny high tick.
  tap(r, pitch) {
    const out = len(0.045), f = 3600 * pitch;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = 0.3 * white(r) * Math.exp(-t / 0.0008) + 0.35 * Math.sin(TAU * f * t) * Math.exp(-t / 0.006);
    }
    return out;
  },
  // A deep, soft boom for a big reveal (absolute zero).
  boom(r) {
    const out = len(2.2), lp = new Biquad().set('low', 120, 0.7);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR, a = Math.min(1, t / 0.015);
      out[i] = a * (0.55 * Math.sin(TAU * 48 * t) + 0.2 * Math.sin(TAU * 96 * t)) * Math.exp(-t / 0.6) + 1.5 * a * lp.run(white(r)) * Math.exp(-t / 0.3);
    }
    return out;
  },
  // A pattern break (a cut to a new screen): a bright noise snap and a short high ping over a small low knock.
  snap(r, pitch) {
    const out = len(0.25), bp = new Biquad().set('band', 5000 * pitch, 0.9), f = 6200 * pitch;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = 1.1 * bp.run(white(r)) * Math.exp(-t / 0.012) + 0.22 * Math.sin(TAU * f * t) * Math.exp(-t / 0.02) + 0.18 * Math.sin(TAU * 180 * t) * Math.exp(-t / 0.025);
    }
    return out;
  },
  // Air and glints under a camera move: high noise and three high partials that swell in over 0.25 s, shimmer, and
  // fade over about 2 s.
  shimmer(r, pitch) {
    const out = len(2.6), bp = new Biquad().set('band', 7000 * pitch, 0.7), parts = [5200, 6900, 8300].map(f => f * pitch);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR, env = Math.min(1, (t / 0.25) ** 2) * Math.exp(-Math.max(0, t - 0.25) / 0.6) * Math.min(1, (2.6 - t) / 0.2);
      const glint = parts.reduce((a, f, k) => a + Math.sin(TAU * f * t) * (0.5 + 0.5 * Math.sin(TAU * (3 + 2 * k) * t + k)), 0) / 3;
      out[i] = env * (0.75 * bp.run(white(r)) + 0.1 * glint);
    }
    return out;
  },
  'whoosh-in': (r) => whoosh(r, 350, 3200),
  'whoosh-out': (r) => whoosh(r, 3000, 300),
};
// Air rushing past: band-passed noise sweeping from f0 to f1, swelling to its peak at WHOOSH_PEAK, then gone.
function whoosh(r: () => number, f0: number, f1: number) {
  const out = len(0.62), bp = new Biquad();
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, u = Math.min(1, t / WHOOSH_PEAK);
    const fc = f0 * Math.pow(f1 / f0, u); bp.set('band', fc, 1.1);
    const env = t <= WHOOSH_PEAK ? Math.pow(u, 1.5) : Math.max(0, 1 - (t - WHOOSH_PEAK) / 0.17);
    out[i] = 2.4 * Math.sqrt(500 / fc) * bp.run(white(r)) * env;   // even loudness across the sweep
  }
  return out;
}

// ---- beds: write into `out` between t0 and t1 (plus a short tail), following level(t) -------------------------------
function bed(b: Bed, out: Float32Array, r: () => number) {
  const i0 = Math.max(0, Math.round(b.t0 * SR)), i1 = Math.min(out.length, Math.round((b.t1 + 0.3) * SR));
  const k = 1 - Math.exp(-1 / (0.015 * SR));                 // level smoothing (15 ms): no clicks when it changes
  const f1 = new Biquad(), f2 = new Biquad();
  const f3 = new Biquad();
  let lev = 0, brown = 0, grain = 0, drop = 0, dropF = 0, dropPh = 0;
  if (b.kind === 'roar') { f1.set('low', 700, 0.7); f2.set('band', 180, 0.8); }
  if (b.kind === 'rain') { f1.set('band', 2400, 0.5); f2.set('low', 500, 0.7); f3.set('band', 6500, 0.9); }
  for (let i = i0; i < i1; i++) {
    const t = i / SR, target = t < b.t1 ? Math.max(0, Math.min(1, b.level(t))) : 0;
    lev += (target - lev) * k;
    const n = white(r);
    if (b.kind === 'roar') {
      // A gas burner: rumbling brown noise, flickering at the same rates as the drawn flames.
      brown = 0.985 * brown + 0.06 * n;
      const flicker = 1 + 0.18 * Math.sin(t * 17) + 0.08 * Math.sin(t * 31);
      out[i] += lev * flicker * (0.16 * f1.run(brown) + 0.16 * f2.run(n));   // sits ~8 dB under the music
    } else if (b.kind === 'rain') {
      // Rain on leaves and a balcony rail: a soft broadband hiss, a low wash, and ~40 drops a second, each a tiny
      // pitched tick (1.5–5 kHz) that dies away in a few milliseconds.
      brown = 0.985 * brown + 0.06 * n;
      if (r() < 40 / SR) { drop = 0.25 + 0.75 * r(); dropF = 1500 + 3500 * r(); dropPh = 0; }
      drop *= 0.9975; dropPh += (TAU * dropF) / SR;
      out[i] += lev * (0.2 * f1.run(n) + 0.12 * f2.run(brown) + 0.06 * f3.run(n) + 0.35 * drop * Math.sin(dropPh));
    } else {
      // Kinetic friction: gritty noise whose pitch and stick-slip grain rate rise with speed.
      f1.set('band', 500 + 900 * lev, 1.5);
      grain = (grain + (25 + 60 * lev) / SR) % 1;
      const stick = 0.55 + 0.45 * Math.exp(-grain * 6);
      out[i] += lev * stick * 1.05 * f1.run(n);
    }
  }
}

/** The effects alone (mono). */
export function renderSfx(score: Score, seed = 7): Float32Array {
  const out = new Float32Array(Math.ceil(score.duration * SR));
  score.hits.forEach((h, n) => {
    const s = HIT[h.kind](rng(seed * 1009 + n), h.pitch ?? 1), at = Math.round(h.t * SR);
    for (let i = 0; i < s.length && at + i < out.length; i++) out[at + i] += h.gain * s[i];
  });
  score.beds.forEach((b, n) => bed(b, out, rng(seed * 7919 + n)));
  return out;
}

// ---- ducking: how far the music dips under each effect --------------------------------------------------------------
const DUCK_HIT: Record<HitKind, { depth: number; hold: number }> = {
  click: { depth: 0, hold: 0 }, tap: { depth: 0, hold: 0 },
  crack: { depth: 0.35, hold: 0.3 }, thunk: { depth: 0.35, hold: 0.35 }, whump: { depth: 0.4, hold: 0.6 },
  boom: { depth: 0.4, hold: 1.2 }, 'whoosh-in': { depth: 0.25, hold: 0.55 }, 'whoosh-out': { depth: 0.2, hold: 0.55 },
  snap: { depth: 0.2, hold: 0.25 }, shimmer: { depth: 0.15, hold: 1.2 },
};
const DUCK_BED = { roar: 0.25, scrape: 0.45, rain: 0 }, FLOOR = 0.5;   // rain is the room the music plays in: no dip

// Under a voiceover (L43) the music drops to 0.4 (−8 dB), from just before each line until just after it.
const VOICE_DUCK = 0.4, VOICE_LEAD = 0.12, VOICE_HOLD = 0.15;
export type VoiceTrack = { track: Float32Array; spans: [number, number][] };

/** The music's gain on every sample: 1, dipping (never below 0.5) under effects and to 0.4 under a voice;
 *  60 ms down, 180 ms back up. */
export function duckGain(score: Score, voiceSpans: [number, number][] = []): Float32Array {
  const n = Math.ceil(score.duration * SR), target = new Float32Array(n);
  for (const h of score.hits) {
    const d = DUCK_HIT[h.kind], i0 = Math.round(h.t * SR), i1 = Math.min(n, Math.round((h.t + d.hold) * SR));
    for (let i = Math.max(0, i0); i < i1; i++) target[i] = Math.max(target[i], d.depth * Math.min(1, h.gain));
  }
  for (const b of score.beds) {
    const i0 = Math.max(0, Math.round(b.t0 * SR)), i1 = Math.min(n, Math.round(b.t1 * SR));
    for (let i = i0; i < i1; i += 48) {                         // every 1 ms is plenty for a level curve
      const v = DUCK_BED[b.kind] * Math.max(0, Math.min(1, b.level(i / SR)));
      for (let j = i; j < Math.min(i1, i + 48); j++) target[j] = Math.max(target[j], v);
    }
  }
  const voiced = new Uint8Array(n);
  for (const [a, b] of voiceSpans) voiced.fill(1, Math.max(0, Math.round((a - VOICE_LEAD) * SR)), Math.min(n, Math.round((b + VOICE_HOLD) * SR)));
  const down = 1 - Math.exp(-1 / (0.06 * SR)), up = 1 - Math.exp(-1 / (0.18 * SR)), g = new Float32Array(n);
  let v = 1;
  for (let i = 0; i < n; i++) {
    const want = voiced[i] ? Math.min(VOICE_DUCK, Math.max(FLOOR, 1 - target[i])) : Math.max(FLOOR, 1 - target[i]);
    v += (want - v) * (want < v ? down : up);
    if (want === 1 && 1 - v < 1e-4) v = 1;
    g[i] = v;
  }
  return g;
}

// House limit: the MP4's peak ≤ −3 dB (reels/tools/check-video.mjs). The WAV is limited 0.3 dB lower, because AAC
// encoding can overshoot it by ~0.1 dB (the reel 014 remake: a −3.0 dB mix measured −2.9 dB in the MP4).
const LIMIT = 10 ** (-3.3 / 20);

/** Music (stereo) dipped under the effects (and a voice, if any), plus both, through a peak limiter at −3 dB.
 *  `scale` = deepest limiting. */
export function mixWithMusic(music: Float32Array[], score: Score, seed = 7, voice?: VoiceTrack) {
  const fx = renderSfx(score, seed), g = duckGain(score, voice?.spans), n = music[0].length;
  const left = new Float32Array(n), right = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const gi = i < g.length ? g[i] : 1, e = (i < fx.length ? fx[i] : 0) + (voice && i < voice.track.length ? voice.track[i] : 0);
    left[i] = music[0][i] * gi + e; right[i] = music[1][i] * gi + e;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }
  // Peak limiter: only where a sample would pass −3 dB, the gain dips just enough (2 ms in, 60 ms back), so the music
  // keeps its loudness everywhere else. Both passes stay at or below what each sample needs: the limit always holds.
  const lim = new Float64Array(n), rel = 1 - Math.exp(-1 / (0.06 * SR)), atk = 1 - Math.exp(-1 / (0.002 * SR));
  for (let i = 0, v = 1; i < n; i++) {
    const x = Math.max(Math.abs(left[i]), Math.abs(right[i])), need = x > LIMIT ? LIMIT / x : 1;
    v = Math.min(need, v + (1 - v) * rel); if (1 - v < 1e-6) v = Math.min(need, 1); lim[i] = v;
  }
  for (let i = n - 2; i >= 0; i--) { const back = lim[i + 1] + (1 - lim[i + 1]) * atk; lim[i] = Math.min(lim[i], 1 - back < 1e-6 ? 1 : back); }
  let out = 0, least = 1;
  for (let i = 0; i < n; i++) {
    left[i] *= lim[i]; right[i] *= lim[i]; least = Math.min(least, lim[i]);
    out = Math.max(out, Math.abs(left[i]), Math.abs(right[i]));
  }
  return { left, right, peak: out, scale: least };
}

/** Whooshes for the fast camera moves only (≤ 0.9 s): in for a zoom in, out for a zoom out, loudest as the move ends.
 *  Slow drifts stay silent: a whoosh on every move would just be noise. Zoom is the first value of each key. */
export function whooshesFor(start: number[], keys: Key[], fast = 0.9): Hit[] {
  const out: Hit[] = [];
  let z = start[0];
  for (const k of keys) {
    if (k.dur <= fast && k.to[0] !== z) {
      const zoomIn = k.to[0] > z;
      out.push({ kind: zoomIn ? 'whoosh-in' : 'whoosh-out', t: Math.max(0, k.t + k.dur - WHOOSH_PEAK), gain: zoomIn ? 0.4 : 0.28 });
    }
    z = k.to[0];
  }
  return out;
}

// ---- WAV (16-bit PCM), the same layout the engine writes -------------------------------------------------------------
export function writeWav(channels: Float32Array[], sampleRate: number): Uint8Array {
  const n = channels[0].length, k = channels.length, b = new Uint8Array(44 + n * k * 2), v = new DataView(b.buffer);
  const str = (at: number, s: string) => { for (let i = 0; i < s.length; i++) b[at + i] = s.charCodeAt(i); };
  str(0, 'RIFF'); v.setUint32(4, b.length - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, k, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * k * 2, true); v.setUint16(32, k * 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * k * 2, true);
  for (let i = 0, at = 44; i < n; i++) for (let c = 0; c < k; c++, at += 2) {
    const s = Math.max(-1, Math.min(1, channels[c][i]));
    v.setInt16(at, Math.round(s < 0 ? s * 32768 : s * 32767), true);
  }
  return b;
}

export function readWav(buf: Uint8Array) {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), tag = (at: number) => String.fromCharCode(...buf.subarray(at, at + 4));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a WAV file');
  let at = 12, k = 0, sampleRate = 0, bits = 0;
  while (at + 8 <= buf.length) {
    const id = tag(at), size = v.getUint32(at + 4, true), body = at + 8;
    if (id === 'fmt ') { k = v.getUint16(body + 2, true); sampleRate = v.getUint32(body + 4, true); bits = v.getUint16(body + 14, true); }
    if (id === 'data') {
      if (bits !== 16) throw new Error(`only 16-bit WAV, not ${bits}-bit`);
      const n = Math.floor(size / (2 * k)), channels = Array.from({ length: k }, () => new Float32Array(n));
      for (let i = 0, p = body; i < n; i++) for (let c = 0; c < k; c++, p += 2) channels[c][i] = v.getInt16(p, true) / 32768;
      return { sampleRate, channels };
    }
    at = body + size + (size & 1);
  }
  throw new Error('WAV has no data');
}
