// Electromagnetic induction, shared by the two reels of the framework-2 test (L61, founder 2026-10-22): the same topic made
// once by `reels/pyqvault-framework-2.md` (PvF2Induction) and once by our framework (PvPhysics011).
// A bar magnet, modelled as a point dipole on the axis of a 2,000-turn coil, moves through it. Faraday: ℰ = −dΛ/dt with
// Λ the flux linkage, so ℰ = −Λ′(u)·du/dt, u = the magnet's distance from the coil's centre. Pure functions, SI units.

export const MU0 = 4e-7 * Math.PI;
export const COIL = { a: 0.025, L: 0.06, N: 2000 };          // radius, length (m), turns: a classroom demo coil
export const MAGNET = { moment: 12, length: 0.05, radius: 0.0125 };  // A·m², m: a 25 × 50 mm neodymium magnet, fits inside

const K = (MU0 * MAGNET.moment * COIL.N) / (2 * COIL.L);
/** Flux linkage NΦ (Wb-turns) with the magnet u metres from the coil's centre along its axis: the sum over the turns of
 *  μ0·m·a²/(2(a²+z²)^1.5), N/L of them per metre, in closed form. */
export function linkage(u: number) {
  const { a, L } = COIL, p = u + L / 2, q = u - L / 2;
  return K * (p / Math.hypot(a, p) - q / Math.hypot(a, q));
}
/** dΛ/du (Wb-turns per metre). */
export function dLinkage(u: number) {
  const { a, L } = COIL, p = u + L / 2, q = u - L / 2;
  return K * a * a * (1 / Math.hypot(a, p) ** 3 - 1 / Math.hypot(a, q) ** 3);
}
/** The induced EMF (V) with the magnet at u moving at v = du/dt (m/s). Exactly 0 when it is still. */
export const emf = (u: number, v: number) => (v === 0 ? 0 : -dLinkage(u) * v);

/** A torch bulb's filament: its glow (0–1) follows the electrical power with a thermal lag of about 0.08 s. */
export function filament(power: number[], dt: number, tau = 0.08) {
  const k = 1 - Math.exp(-dt / tau), out: number[] = [];
  let y = 0;
  for (const p of power) { y += (Math.max(0, Math.min(1, p)) - y) * k; out.push(y); }
  return out;
}

/** One field line of a dipole pointing along +y: r = r0·sin²θ, as [x, y] points (x across the axis, ≥ 0). */
export function fieldLine(r0: number, n: number, from = 0.12) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const th = from + ((Math.PI - 2 * from) * i) / n, r = r0 * Math.sin(th) ** 2;
    pts.push([r * Math.sin(th), r * Math.cos(th)]);
  }
  return pts;
}
