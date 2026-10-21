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

// ---- cadence (founder, 2026-10-21: "the voiceover doesn't seem to have cadence"). Measured on Chemistry #8: punctuating
// the lines for speech and speaking the script in one pass didn't add pitch movement (7.1 and 7.4 semitones vs 8.3), and
// Kokoro ignores "…" pauses: the flatness is the engine's. These helpers stay to judge other voices. -------------------

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
  'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numberWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred` + (n % 100 ? ` ${numberWords(n % 100)}` : '');
  return String(n);
}
const words = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'")
  .replace(/(\d+)\s*%/g, (_, d: string) => `${numberWords(Number(d))} percent`)
  .replace(/\d+/g, d => numberWords(Number(d)))
  .replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).join(' ');
/** True when a spoken form says exactly the on-screen words: only punctuation, case and numbers-as-words may differ
 *  (F17: the voice never says what isn't on screen). */
export const sameWords = (text: string, say: string) => words(text) === words(say);

/** Pitch movement of a clip: the share of sounding frames that are voiced, the median pitch (Hz) and the spread between
 *  its 10th and 90th percentiles in semitones. A flat, read-out-a-label line spreads little; a lively one more.
 *  Autocorrelation on 40 ms frames every 10 ms, after averaging down to ~12 kHz; pitch searched over 75–400 Hz. */
export function pitchStats(x: Float32Array, sr: number) {
  const k = Math.max(1, Math.floor(sr / 12000)), rate = sr / k, y = new Float32Array(Math.floor(x.length / k));
  for (let i = 0; i < y.length; i++) { let s = 0; for (let j = 0; j < k; j++) s += x[i * k + j]; y[i] = s / k; }
  const win = Math.round(0.04 * rate), hop = Math.round(0.01 * rate), lo = Math.floor(rate / 400), hi = Math.ceil(rate / 75);
  let peak = 0; for (const v of y) peak = Math.max(peak, Math.abs(v));
  const f0s: number[] = []; let sounding = 0;
  for (let at = 0; at + win + hi < y.length; at += hop) {
    let e = 0; for (let i = 0; i < win; i++) e += y[at + i] ** 2;
    if (peak === 0 || Math.sqrt(e / win) < 0.05 * peak) continue;
    sounding++;
    let best = 0, lag = 0;
    for (let L = lo; L <= hi; L++) {
      let c = 0, e2 = 0;
      for (let i = 0; i < win; i++) { c += y[at + i] * y[at + i + L]; e2 += y[at + i + L] ** 2; }
      const r = c / Math.sqrt(e * e2 + 1e-12);
      if (r > best) { best = r; lag = L; }
    }
    if (best > 0.6) f0s.push(rate / lag);
  }
  if (!f0s.length) return { voiced: 0, median: 0, range: 0 };
  const st = f0s.map(f => 12 * Math.log2(f)).sort((a, b) => a - b), q = (p: number) => st[Math.min(st.length - 1, Math.floor(p * st.length))];
  return { voiced: f0s.length / sounding, median: 2 ** (q(0.5) / 12), range: q(0.9) - q(0.1) };
}

/** Sets the whole script's loudness with one gain, so each line keeps its own emphasis (instead of levelTo per line). */
export function levelTogether(clips: Float32Array[], rms: number): Float32Array[] {
  let s = 0, n = 0;
  for (const c of clips) { for (const v of c) s += v * v; n += c.length; }
  const g = s > 0 ? rms / Math.sqrt(s / n) : 1;
  return clips.map(c => c.map(v => v * g));
}
