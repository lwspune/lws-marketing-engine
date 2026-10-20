// Realism demo 4 (2026-10-20): 40 gas molecules in a glass box, a lid squeezing them from 2 s (Boyle). Two runs from
// the same start: `simulatePlain` moves them the way our reels do today (straight lines, bouncing off the walls, passing
// through each other); `simulateRapier` uses the Rapier physics engine (Apache 2.0), so they also collide. Both step at
// a fixed 1/120 s and keep one position per molecule per video frame (30 fps): Remotion draws frames out of order, so
// the motion is worked out once (tools/simulate.ts → public/demo-physics.json) and only played back.
import type RAPIER_T from '@dimforge/rapier3d-compat';

export const BOX = { x: 1, y: 1.2, z: 1 };                    // inner half-sizes; the floor is at y = −BOX.y
export const N = 40, R = 0.09, SPEED = 2.6, SECONDS = 5, FPS = 30, STEP = 1 / 120;
export const FRAMES = SECONDS * FPS;
const PER_FRAME = Math.round(1 / FPS / STEP);

/** The lid's height (its underside): still until 2 s, then down to 0.35 of the way by 4 s. */
export const lidAt = (t: number) => {
  const p = Math.min(1, Math.max(0, (t - 2) / 2)), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
  return BOX.y - e * (BOX.y - (-BOX.y + 0.35 * 2 * BOX.y));
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** The same 40 molecules for both runs: spread on a jittered grid (no overlaps), random directions at one speed. */
function start() {
  const r = rng(7), out: { p: number[]; v: number[] }[] = [];
  for (let i = 0; i < N; i++) {
    const gx = i % 4, gy = Math.floor(i / 16), gz = Math.floor(i / 4) % 4;
    const p = [-0.66 + gx * 0.44 + (r() - 0.5) * 0.08, -0.9 + gy * 0.6 + (r() - 0.5) * 0.08, -0.66 + gz * 0.44 + (r() - 0.5) * 0.08];
    const u = 2 * r() - 1, a = 2 * Math.PI * r(), s = Math.sqrt(1 - u * u);
    out.push({ p, v: [SPEED * s * Math.cos(a), SPEED * u, SPEED * s * Math.sin(a)] });
  }
  return out;
}
const round = (p: number[]) => p.map(x => Math.round(x * 1e4) / 1e4);

/** Today's way: each molecule flies straight and bounces off the walls and the lid, ignoring the others. */
export function simulatePlain(): number[][][] {
  const ms = start().map(m => ({ p: m.p.slice(), v: m.v.slice() })), frames: number[][][] = [];
  for (let k = 0; k < FRAMES; k++) {
    frames.push(ms.map(m => round(m.p)));
    for (let s = 0; s < PER_FRAME; s++) {
      const t = (k * PER_FRAME + s + 1) * STEP, top = lidAt(t) - R;
      for (const m of ms) {
        for (let d = 0; d < 3; d++) m.p[d] += m.v[d] * STEP;
        for (const [d, lo, hi] of [[0, -BOX.x + R, BOX.x - R], [1, -BOX.y + R, top], [2, -BOX.z + R, BOX.z - R]] as const) {
          if (m.p[d] < lo) { m.p[d] = 2 * lo - m.p[d]; m.v[d] = Math.abs(m.v[d]); }
          if (m.p[d] > hi) { m.p[d] = Math.max(lo, 2 * hi - m.p[d]); m.v[d] = -Math.abs(m.v[d]); }
        }
      }
    }
  }
  return frames;
}

/** Rapier: the same molecules as frictionless, perfectly bouncy balls in a box of fixed walls with a moving lid. */
export function simulateRapier(RAPIER: typeof RAPIER_T): number[][][] {
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.timestep = STEP;
  world.integrationParameters.numSolverIterations = 8;        // firmer walls while the lid squeezes (default 4)
  const wall = (x: number, y: number, z: number, hx: number, hy: number, hz: number, body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z))) => {
    world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setRestitution(1).setFriction(0).setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max), body);
    return body;
  };
  const T = 0.5;                                                // wall thickness
  wall(-BOX.x - T, 0, 0, T, BOX.y + T, BOX.z + T); wall(BOX.x + T, 0, 0, T, BOX.y + T, BOX.z + T);
  wall(0, 0, -BOX.z - T, BOX.x + T, BOX.y + T, T); wall(0, 0, BOX.z + T, BOX.x + T, BOX.y + T, T);
  wall(0, -BOX.y - T, 0, BOX.x + T, T, BOX.z + T);
  const lid = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, BOX.y + T, 0));
  wall(0, 0, 0, BOX.x + T, T, BOX.z + T, lid);
  const balls = start().map(m => {
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(m.p[0], m.p[1], m.p[2])
      .setLinvel(m.v[0], m.v[1], m.v[2]).setLinearDamping(0).setAngularDamping(0).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.ball(R).setRestitution(1).setFriction(0).setDensity(1), b);
    return b;
  });
  const frames: number[][][] = [];
  for (let k = 0; k < FRAMES; k++) {
    frames.push(balls.map(b => { const p = b.translation(); return round([p.x, p.y, p.z]); }));
    for (let s = 0; s < PER_FRAME; s++) {
      lid.setNextKinematicTranslation({ x: 0, y: lidAt((k * PER_FRAME + s + 1) * STEP) + T, z: 0 });
      world.step();
    }
  }
  world.free();
  return frames;
}
