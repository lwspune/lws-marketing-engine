// Shared rules for Sound Mind's "ME" story reels (soundmind/brand.md → Reels): text timing, the close-up, the
// word-labels and Instagram's safe band. Each reel's own timeline (sm001.ts, sm002.ts, …) builds on these.
import { clamp01, ease } from './motion.ts';

export type TextItem = { text: string; t0: number; t1: number };

// Instagram draws its buttons on the right and the caption at the bottom: text stays inside this band.
export const SAFE = { top: 220, bottom: 1600, left: 60, right: 960 };
export const TEXT_BOXES = [
  { id: 'hook', x: 100, y: 230, w: 840, h: 260 },
  { id: 'line2', x: 100, y: 1380, w: 840, h: 170 },
  { id: 'handle', x: 290, y: 1560, w: 500, h: 36 },
];

// Word-labels: rounded pills in Kalam 34 px capitals (readable on a phone).
export const SCREEN_W = 1080, MARGIN = 20;
export const LABEL_H = 72;
export const labelWidth = (label: string) => Math.round(label.length * 19.5 + 48);

/** Text opacity: the hook is fully there on frame 0; others fade in over 0.3 s; all fade out over their last 0.4 s
 *  unless they stay until the end of the reel. */
export function textAlpha(item: TextItem, t: number, duration: number) {
  if (t < item.t0 || t > item.t1) return 0;
  const fadeIn = item.t0 === 0 ? 1 : clamp01((t - item.t0) / 0.3);
  return Math.min(fadeIn, item.t1 >= duration ? 1 : clamp01((item.t1 - t) / 0.4));
}

export type Zoom = { t0: number; t1: number; peak: number };
/** Close-up on ME: a slow push in and back out. */
export function zoomAt(t: number, zoom: Zoom) {
  const mid = (zoom.t0 + zoom.t1) / 2;
  if (t <= zoom.t0 || t >= zoom.t1) return 1;
  return t < mid ? 1 + (zoom.peak - 1) * ease((t - zoom.t0) / (mid - zoom.t0)) : zoom.peak - (zoom.peak - 1) * ease((t - mid) / (zoom.t1 - mid));
}
