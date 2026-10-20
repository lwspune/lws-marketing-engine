// Timing helpers, identical to reels/engine.js so a reel keeps its timings when it moves to Remotion.

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const prog = (t: number, t0: number, dur: number) => (dur <= 0 ? (t >= t0 ? 1 : 0) : ease(clamp01((t - t0) / dur)));

export type Caption = { t0: number; t1: number; text: string; size?: number; y?: number };

// The caption on screen at t, its opacity and how long it has been up. The opening caption is fully visible
// on frame 0 (it is the hook people see before scrolling); later ones fade in over 0.18 s, and every caption
// fades out over its last 0.25 s so consecutive ones cross-fade.
export function captionAt(captions: Caption[], t: number) {
  const caption = captions.find(c => t >= c.t0 && t < c.t1);
  if (!caption) return null;
  const fadeIn = caption.t0 === 0 ? 1 : clamp01((t - caption.t0) / 0.18);
  return { caption, alpha: fadeIn * clamp01((caption.t1 - t) / 0.25), age: t - caption.t0 };
}

// Camera moves (zoom in / out, founder 2026-10-20). Values start at `start`; each key glides them to `to` over `dur`
// seconds from `t`, eased like everything else. Keys run in order and shouldn't overlap.
export type Key = { t: number; dur: number; to: number[] };
export function tween(t: number, start: number[], keys: Key[]): number[] {
  let v = start.slice();
  for (const k of keys) { const p = prog(t, k.t, k.dur); v = v.map((x, i) => x + (k.to[i] - x) * p); }
  return v;
}
