// Realism demo 5 (2026-10-20): a Bunsen flame made with three.quarks (MIT): the flame itself, sparks thrown up and a
// faint heat haze. three.quarks moves particles by clock time and Math.random, but Remotion draws frames out of order,
// so `flameAt(frame)` builds the effect fresh and replays it from 0 in fixed 1/30 s steps with a seeded random: a frame
// always comes out the same, whenever and wherever it is drawn.
import { AdditiveBlending, MeshBasicMaterial, NormalBlending, Scene, type Material } from 'three';
import {
  BatchedRenderer, ParticleSystem, RenderMode, ConeEmitter, PointEmitter, ConstantValue, IntervalValue, ColorRange, Gradient,
  ColorOverLife, SizeOverLife, PiecewiseBezier, Bezier, ApplyForce, Noise, Vector3, Vector4,
} from 'three.quarks';

export const STEP = 1 / 30;

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Runs fn with Math.random replaced by a seeded generator, then puts the real one back. */
export function withSeed<T>(seed: number, fn: () => T): T {
  const real = Math.random;
  Math.random = mulberry(seed);
  try { return fn(); } finally { Math.random = real; }
}

const grow = (a: number, b: number) => new SizeOverLife(new PiecewiseBezier([[new Bezier(a, a + (b - a) / 3, a + (2 * (b - a)) / 3, b), 0]]));

/** The flame at video frame `frame`: built and stepped from 0, so the same frame always gives the same particles.
 *  `glow` is the soft round sprite (additive) for flame and sparks; `haze` the faint smoke sprite (normal blending). */
export function flameAt(frame: number, glow: Material, haze: Material = glow) {
  return withSeed(2026, () => {
    const scene = new Scene(), renderer = new BatchedRenderer();   // three.quarks drops systems that aren't in a Scene
    scene.add(renderer);
    glow.blending = AdditiveBlending; glow.transparent = true; glow.depthWrite = false;
    if (haze !== glow) { haze.blending = NormalBlending; haze.transparent = true; haze.depthWrite = false; }
    const flame = new ParticleSystem({
      looping: true, duration: 1, shape: new ConeEmitter({ radius: 0.05, angle: 0.04, thickness: 1 }),
      startLife: new IntervalValue(0.35, 0.55), startSpeed: new IntervalValue(1.3, 1.8), startSize: new IntervalValue(0.14, 0.2),
      startColor: new ColorRange(new Vector4(0.55, 0.7, 1, 1), new Vector4(0.7, 0.8, 1, 1)), emissionOverTime: new ConstantValue(420),
      material: glow, renderMode: RenderMode.BillBoard,
      behaviors: [
        new ColorOverLife(new Gradient(
          [[new Vector3(0.6, 0.75, 1), 0], [new Vector3(1, 0.85, 0.45), 0.25], [new Vector3(1, 0.45, 0.1), 0.6], [new Vector3(0.6, 0.12, 0.04), 1]],
          [[0.9, 0], [0.75, 0.5], [0, 1]])),
        grow(1, 0.15), new Noise(new ConstantValue(5), new ConstantValue(0.06)), new ApplyForce(new Vector3(0, 0, 1), new ConstantValue(1.5)),
      ],
    });
    const sparks = new ParticleSystem({
      looping: true, duration: 1, shape: new PointEmitter(),
      startLife: new IntervalValue(0.5, 1.0), startSpeed: new IntervalValue(1.8, 3.2), startSize: new IntervalValue(0.025, 0.05),
      startColor: new ColorRange(new Vector4(1, 0.8, 0.35, 1), new Vector4(1, 0.95, 0.6, 1)), emissionOverTime: new IntervalValue(6, 14),
      material: glow, renderMode: RenderMode.BillBoard,
      behaviors: [new ApplyForce(new Vector3(0, 0, -1), new ConstantValue(3.5)),   // local −z = down (the emitter is turned to point up)
         new ColorOverLife(new Gradient(
        [[new Vector3(1, 0.9, 0.5), 0], [new Vector3(1, 0.4, 0.1), 1]], [[1, 0], [0, 1]]))],
    });
    const smoke = new ParticleSystem({
      looping: true, duration: 1, shape: new ConeEmitter({ radius: 0.12, angle: 0.15, thickness: 1 }),
      startLife: new IntervalValue(1.4, 2.2), startSpeed: new IntervalValue(0.5, 0.8), startSize: new IntervalValue(0.25, 0.4),
      startColor: new ColorRange(new Vector4(0.75, 0.78, 0.85, 0.12), new Vector4(0.85, 0.88, 0.92, 0.18)), emissionOverTime: new ConstantValue(18),
      material: haze, renderMode: RenderMode.BillBoard,
      behaviors: [grow(0.6, 2.4), new Noise(new ConstantValue(1.5), new ConstantValue(0.25)),
        new ColorOverLife(new Gradient([[new Vector3(1, 1, 1), 0], [new Vector3(1, 1, 1), 1]], [[0, 0], [1, 0.2], [0, 1]]))],
    });
    const systems = [flame, sparks, smoke];
    for (const s of systems) { s.emitter.rotation.x = -Math.PI / 2; scene.add(s.emitter); renderer.addSystem(s); }   // emit upwards
    sparks.emitter.position.y = 0.25; smoke.emitter.position.y = 0.6;
    for (let k = 0; k < frame; k++) renderer.update(STEP);
    return { scene, renderer, systems };
  });
}

// three.quarks sets something up on first use and draws random numbers while doing it, so the first build in a fresh
// page would differ from every later one. One throwaway build when this module loads (each render tab loads it once)
// makes every frame's build start from the same state.
flameAt(3, new MeshBasicMaterial());
