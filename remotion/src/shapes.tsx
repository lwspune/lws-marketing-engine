// Rounded 3D shapes (founder, 2026-10-20: avoid corners where we can; soft edges read as friendlier and more premium).
// RoundedBoxGeometry ships with three.js, so no new package.
import { useMemo } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** A box with rounded edges and corners; `radius` defaults to a quarter of its smallest side. */
export function RoundBox({ size, radius }: { size: [number, number, number]; radius?: number }) {
  const [w, h, d] = size, r = radius ?? Math.min(w, h, d) / 4;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, Math.min(w, h, d) / 2 - 1e-4)), [w, h, d, r]);
  return <primitive object={geo} attach="geometry" />;
}

/** Soft edges for a 3D area (framework F8): it fades into the board on the given sides instead of a hard crop line,
 *  which shows when the camera zooms in. Each side is the fade's share of the area (e.g. 0.1 = the outer 10 %). */
export function softEdges({ top = 0, bottom = 0, left = 0, right = 0 }: { top?: number; bottom?: number; left?: number; right?: number }) {
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const v = `linear-gradient(to bottom, transparent, #000 ${pct(top)}, #000 ${pct(1 - bottom)}, transparent)`;
  const h = `linear-gradient(to right, transparent, #000 ${pct(left)}, #000 ${pct(1 - right)}, transparent)`;
  return { maskImage: `${v}, ${h}`, WebkitMaskImage: `${v}, ${h}`, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } as const;
}
