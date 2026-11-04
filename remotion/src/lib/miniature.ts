// The miniature look's pure rules (components in src/miniature.tsx; tests in tests/miniature.test.ts). World units are
// metres on the model. Every motion is a smooth function of t, so a frame renders the same every time.
export type V3 = [number, number, number];

/** The tilt-shift focus band: a horizontal band through the subject (`y` on the canvas, 0 = bottom) that stays sharp; the
 *  picture softens above and below it. Wide shots get the strong miniature look (more blur, a narrower band); close shots
 *  a gentle one, so a followed column stays sharp. */
export function focusBand(focusY: number, distance: number) {
  const k = Math.min(1, Math.max(0, Math.log(Math.max(distance, 30) / 30) / Math.log(600 / 30)));
  return { y: Math.min(0.95, Math.max(0.05, focusY)), blur: 0.07 + 0.06 * k, taper: 0.38 - 0.16 * k };
}

/** A tree in the breeze: its lean (radians) at t; `seed` gives each tree its own pace and phase. */
export const sway = (t: number, seed: number) =>
  0.025 * Math.sin((2 * Math.PI * t) / (3.6 + (seed % 5) * 0.35) + seed * 1.7) + 0.01 * Math.sin((2 * Math.PI * t) / 1.7 + seed * 0.9);

/** The sea's height (m) at (x, z): three slow swells crossing, moving with t. */
export const wave = (x: number, z: number, t: number) =>
  0.14 * Math.sin(0.11 * x + 1.3 * t + 0.05 * z) + 0.08 * Math.sin(0.23 * x - 0.9 * t + 0.17 * z) + 0.05 * Math.sin(0.05 * x + 2.1 * t);

/** A flag's cloth: how far (m) the point (u along from the mast 0…1, v down 0…1) stands out of its plane, for a flag `w`
 *  wide. Still on the mast, a travelling ripple that grows towards the free end. */
export const flagWave = (u: number, v: number, t: number, w: number) =>
  u <= 0 ? 0 : u ** 1.2 * w * (0.07 * Math.sin(2 * Math.PI * 1.6 * t - 5 * u + 0.6 * v) + 0.03 * Math.sin(2 * Math.PI * 2.7 * t - 9 * u));

/** The grass's shade at (x, z), as a multiplier on its colour: broad soft patches, fixed in place. */
export const grassTint = (x: number, z: number) =>
  1 + 0.05 * Math.sin(0.061 * x + 0.9) * Math.sin(0.047 * z + 0.3) + 0.035 * Math.sin(0.13 * x + 0.11 * z + 2.1) + 0.01 * Math.sin(0.29 * x - 0.23 * z);
