// Reel 025's bins (v2, 3D): from the moment a ball reaches its bin's mouth (reel025.ts hands it over with the speed of
// its last hop), the Rapier physics engine (Apache 2.0) piles it up: balls, bin walls, floor, glass and backboard are
// real colliders, so balls land, bounce, roll off the heap and settle. Fixed step 1/120 s; one position per ball per
// video frame from its hand-over until it rests (the reel holds the last one). Remotion draws frames out of order, so
// this runs once (tools/simulate025.ts → public/nda-maths-025-physics.json) and the reel only plays it back.
import type RAPIER_T from '@dimforge/rapier3d-compat';
import {
  BALLS, COIN_BALL, G, R, ROWS, WALL_TOP, FLOOR_Y, GLASS_Z, BACK_Z, DURATION, SHEET, binX, binsAt, type Ball, type Fit, type RunInfo,
} from './reel025.ts';
export { heightFor } from './reel025.ts';

export const STEP = 1 / 120, FPS = 30, PER_FRAME = Math.round(1 / FPS / STEP), REST_SPEED = 0.05;
export type Run = RunInfo & { start: number[]; frames: number[][]; final: number[][]; restAt: number };
const round = (v: number) => Math.round(v * 1000) / 1000;

export function simulate(RAPIER: typeof RAPIER_T): Run {
  const world = new RAPIER.World({ x: 0, y: -G, z: 0 });
  world.timestep = STEP;
  const fixed = (x: number, y: number, z: number, hx: number, hy: number, hz: number) =>
    world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setFriction(0.35).setRestitution(0.3));
  const depth = (GLASS_Z - BACK_Z) / 2;
  fixed(0, FLOOR_Y - 0.1, 0, 5, 0.1, depth + 0.1);
  for (let i = 0; i <= ROWS + 1; i++) fixed(binX(i) - 0.5, (FLOOR_Y + WALL_TOP + 0.6) / 2, 0, 0.015, (WALL_TOP + 0.6 - FLOOR_Y) / 2, depth + 0.1);
  fixed(0, 1.5, BACK_Z - 0.05, 5, 1.5, 0.05); fixed(0, 1.5, GLASS_Z + 0.05, 5, 1.5, 0.05);

  const all: Ball[] = [...BALLS, COIN_BALL], n = all.length, nFrames = Math.round(DURATION * FPS);
  const order = all.map((_, i) => i).sort((a, b) => all[a].hand.t - all[b].hand.t);
  const bodies: (RAPIER_T.RigidBody | null)[] = Array(n).fill(null), start = Array(n).fill(-1), frames: number[][] = all.map(() => []);
  const movingUntil = Array(n).fill(0), done = Array(n).fill(false), tops: number[][] = [];
  let next = 0;
  for (let f = 0; f < nFrames; f++) {
    for (let s = 0; s < PER_FRAME; s++) {
      const t = (f * PER_FRAME + s) * STEP;
      while (next < n && all[order[next]].hand.t <= t) {
        const i = order[next++], b = all[i], dt = t - b.hand.t;
        const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(b.hand.x + b.hand.vx * dt, b.hand.y + b.hand.vy * dt - 0.5 * G * dt * dt, b.z)
          .setLinvel(b.hand.vx, b.hand.vy - G * dt, 0).setLinearDamping(0.4).setAngularDamping(3).setCcdEnabled(true));   // marbles stop rolling
        world.createCollider(RAPIER.ColliderDesc.ball(R).setRestitution(0.35).setFriction(0.35).setDensity(1), body);
        bodies[i] = body;
      }
      world.step();
    }
    const t = (f + 1) / FPS, top = Array(ROWS + 1).fill(0);
    for (let i = 0; i < n; i++) {
      const body = bodies[i];
      if (!body) continue;
      const p = body.translation(), v = body.linvel();
      if (start[i] < 0) start[i] = f + 1;
      if (Math.hypot(v.x, v.y, v.z) > REST_SPEED && (i === BALLS.length || t < COIN_BALL.hand.t)) movingUntil[i] = t;   // the orange ball's landing nudges the pile: wanted
      if (!done[i]) frames[i].push(round(p.x), round(p.y), round(p.z));
      if (!done[i] && t - movingUntil[i] > 0.3 && t < COIN_BALL.hand.t) done[i] = true;
      if (i < BALLS.length) { const k = Math.round(p.x) + 4; if (k >= 0 && k <= ROWS) top[k] = Math.max(top[k], p.y + R); }
    }
    tops.push(top.map(round));
  }
  const final = bodies.map(b => { const p = b!.translation(); return [round(p.x), round(p.y), round(p.z)]; });
  world.free();
  const restAt = Math.max(...movingUntil.slice(0, BALLS.length));   // before the orange ball lands
  return { start, frames, final, restAt, tops, fit: fitPiles(tops[Math.round(SHEET.t * FPS)]) };
}

/** Least squares: pile top against ball count, over the bins that have balls (all landed by the sheet). */
function fitPiles(top: number[]): Fit {
  const c = binsAt(Infinity), ks = c.map((_, k) => k).filter(k => c[k] > 0);
  const mx = ks.reduce((s, k) => s + c[k], 0) / ks.length, my = ks.reduce((s, k) => s + top[k], 0) / ks.length;
  const b = ks.reduce((s, k) => s + (c[k] - mx) * (top[k] - my), 0) / ks.reduce((s, k) => s + (c[k] - mx) ** 2, 0);
  return { a: my - b * mx, b };
}
