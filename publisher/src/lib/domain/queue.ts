// Queue page rules: list order per tab, and stepping through a carousel's slides.

/** Ready lists oldest first (queue order = posting order, the top card goes out next); other tabs newest first. */
export const newestFirst = (tab: string): boolean => tab !== "ready";

/** The slide after moving by `delta`, kept inside 0…count-1 (no wrap: the ends are the ends). */
export function stepSlide(index: number, count: number, delta: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, index + delta));
}

export function slideStepForKey(key: string): -1 | 0 | 1 {
  return key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
}

/** Horizontal finger travel (px, end − start) → step. Under `threshold` is a tap or a wobble, not a swipe. */
export function swipeStep(dx: number, threshold = 40): -1 | 0 | 1 {
  return dx <= -threshold ? 1 : dx >= threshold ? -1 : 0;
}
