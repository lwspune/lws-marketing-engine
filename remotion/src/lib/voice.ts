// The voiceover trial (L43, founder-approved 2026-10-20): Kokoro (Apache 2.0, runs offline) speaks lines that are
// already on screen. A reel lists its lines (VOICE: start time, the time its words leave the screen, the text);
// tools/voice.ts turns them into clips and this file's pure helpers place them and check them. The reel must still
// work muted (framework F17), so a line may only repeat words that are on screen while it plays.
import { SR } from './sfx.ts';

export const VOICE_SR = 24000;                                // Kokoro's output rate; the mix runs at 48 kHz
export const VOICE = { name: 'af_heart', speed: 1 };         // Kokoro's best-rated voice (grade A), normal pace
export const VOICE_RMS = 0.1;                                 // every line at −20 dBFS RMS: speech peaks land ~−6 dB

/** A spoken line: starts at t, must be finished by `until` (when its words leave the screen). `say` overrides the
 *  spoken form when Kokoro misreads the on-screen text; the on-screen check still uses `text`. */
export type VoiceLine = { t: number; until: number; text: string; say?: string };
export type Shown = { t0: number; t1: number; text: string };

/** 24 → 48 kHz: keeps every sample and fills each gap with a cubic (Catmull-Rom) midpoint. */
export function upsample2x(x: Float32Array): Float32Array {
  const n = x.length, y = new Float32Array(2 * n), at = (i: number) => x[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n; i++) {
    y[2 * i] = x[i];
    y[2 * i + 1] = (-at(i - 1) + 9 * at(i) + 9 * at(i + 1) - at(i + 2)) / 16;
  }
  return y;
}

/** Cuts the silence Kokoro leaves before and after a line, keeping a 50 ms breath each side. */
export function trimSilence(x: Float32Array, threshold = 0.01, pad = 0.05): Float32Array {
  let a = 0, b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < threshold) a++;
  while (b > a && Math.abs(x[b]) < threshold) b--;
  if (a >= x.length) return new Float32Array(0);
  const p = Math.round(pad * SR);
  return x.slice(Math.max(0, a - p), Math.min(x.length, b + 1 + p));
}

/** Scales a clip to the given RMS, so every line sits at the same level. */
export function levelTo(x: Float32Array, rms: number): Float32Array {
  const r = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / Math.max(1, x.length));
  return r > 0 ? x.map(v => (v * rms) / r) : x.slice();
}

/** The voice track (mono, 48 kHz) and the spans [start, end] in seconds where someone is speaking. */
export function placeVoice(clips: { t: number; samples: Float32Array }[], duration: number) {
  const track = new Float32Array(Math.ceil(duration * SR)), spans: [number, number][] = [];
  for (const c of clips) {
    const at = Math.round(c.t * SR);
    for (let i = 0; i < c.samples.length && at + i < track.length; i++) track[at + i] += c.samples[i];
    spans.push([c.t, c.t + c.samples.length / SR]);
  }
  return { track, spans };
}

/** Lines whose clip (durations[i] seconds) runs past its `until` or into the next line. */
export function overruns(lines: VoiceLine[], durations: number[]) {
  return lines.map((l, i) => ({ ...l, seconds: durations[i] }))
    .filter((l, i) => l.t + l.seconds > l.until + 1e-6 || (i + 1 < lines.length && l.t + l.seconds > lines[i + 1].t + 1e-6));
}

/** A short hash of what Kokoro is asked to say, so unchanged lines are not made again. */
export function voiceKey(line: VoiceLine, voice: string, speed: number): string {
  const s = JSON.stringify([line.say ?? line.text, voice, speed]);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).slice(0, 12);
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
/** True when the line's words are on screen, word for word, for the whole time it may play. */
export const onScreen = (line: VoiceLine, shown: Shown[]) =>
  shown.some(s => norm(s.text) === norm(line.text) && line.t >= s.t0 && line.until <= s.t1);
