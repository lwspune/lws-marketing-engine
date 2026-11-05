// @lws.pune · NDA Life #1 (3D): NDA campus tour on the white board. A toy-like model of the campus (a rounded slab of soil
// with grass on top: hills, a lake, Sudan Block, a squadron building and its lawn, a pool, a riding ring, Khetarpal Ground,
// buildings, trees) turns once under "6 places every NDA cadet knows", six numbered pins and a gold route on it; the camera
// visits each place (each with its own movement: the squadron's PT, swimmers, horses, sails), then the ground, where the
// passing-out course marches over the gold Antim Pag band; three jets pass; the light goes low and warm under the end card.
// Our own model, not to scale, no crest, everyone faceless (storyboard § 8). Sudan Block and the palms: sudanBlock.tsx
// (One Day's). Timeline: lib/life001.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  DURATION, COVER_T, GROUND_AT, END_AT, HEADER, BASE, GROUND, LINE, LAKE, HILLS, BUILDINGS, SUDAN, SQUADRON, LAWN, POOL, RING,
  PINS, PIN, BAND, CAPTIONS, END_LINES, END_PANEL, COVER_CAPTION, PILL, PLACES, ROUTE, NOW, STOPS, cameraAt, pinAt, pillAt, figuresAt,
  ptAt, swimmersAt, horsesAt, routeAt, routeDots, dotState, lineFlashAt, jetsAt, JET, lightAt, boatsAt, skyAt, ANTIM, GRASS, WATER, type Figure, type V3,
} from './lib/life001.ts';
import { Board, Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { COL, rng, SudanBlock, Palm } from './sudanBlock.tsx';

const C = { soil: '#7b5a3e', soilDark: '#5e432d', grass: GRASS, grass2: '#6b9a4c', stripeA: '#82b65e', stripeB: '#73a651',
  hill: '#6f9550', hillDark: '#5c7f41', road: '#d8c9a6', sand: '#e2d3a8', water: WATER, tree: ['#3f7a35', '#4d8a3c', '#5a9442'],
  trunk: '#6b5a45', navy: '#1f2a4a', belt: '#f4f1ea', skin: '#7d5238', jet: '#4a525e', sail: '#fbfaf5', hull: '#f2efe8',
  wall: '#e8dcc0', window: '#3a4250', lawn: '#8cc063', deck: '#ece6d8', pool: '#1683d4', lane: '#ffffff', capRed: '#e0392b',
  sandRing: '#f0dfba', rail: '#fbfaf5', horse: ['#7a4a2a', '#5b3a24', '#9a6a3e'], mane: '#2e2118', gold: '#f5b301' };

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 1; cam.far = 6000;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

/** Afternoon sun from the left, going low and orange in the pull-back; soft sky fill; a room environment for the water. */
function Light({ t }: { t: number }) {
  const { gl, scene } = useThree(), l = lightAt(t);
  const room = useMemo(() => { const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return tex; }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = 0.35;
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const e = (l.elevation * Math.PI) / 180, a = (l.azimuth * Math.PI) / 180, R = 700;
  const at: V3 = [20 + R * Math.cos(e) * Math.sin(a), R * Math.sin(e), -75 + R * Math.cos(e) * Math.cos(a)];
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(20, 0, -75); return o; }, []);
  if (!scene.children.includes(target)) scene.add(target);
  const sun = new THREE.Color('#fff1d6').lerp(new THREE.Color('#ff5a10'), l.warm);
  return <>
    <hemisphereLight args={[new THREE.Color('#d6e6ff').lerp(new THREE.Color('#ffb98a'), 0.6 * l.warm), '#6b5a3a', 1.1 - 0.65 * l.warm]} />
    <directionalLight position={at} target={target} intensity={l.intensity} color={sun} castShadow
      shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.6} shadow-radius={3}
      shadow-camera-left={-300} shadow-camera-right={300} shadow-camera-top={300} shadow-camera-bottom={-300} shadow-camera-near={50} shadow-camera-far={1600} />
  </>;
}

// ---- the model ---------------------------------------------------------------------------------------------------------
function mownStripes() {
  const c = document.createElement('canvas'); c.width = 720; c.height = 360;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? C.stripeA : C.stripeB; g.fillRect((i * c.width) / 12, 0, c.width / 12 + 1, c.height); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(14, 14, c.width - 28, c.height - 28);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function lakeShape(grow = 0) {
  const s = new THREE.Shape();
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2, w = 1 + 0.08 * Math.sin(3 * a + 1) + 0.05 * Math.sin(5 * a);
    const x = LAKE.x + (LAKE.rx + grow) * w * Math.cos(a), y = -(LAKE.z + (LAKE.rz + grow) * w * Math.sin(a));
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  return s;
}
function Hill({ x, z, r, h }: { x: number; z: number; r: number; h: number }) {
  const geo = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24; prof.push(new THREE.Vector2(Math.max(0.01, r * (1 - u)), h * (0.5 + 0.5 * Math.cos(Math.PI * (1 - u))) ** 0.8)); }
    return new THREE.LatheGeometry(prof, 40);
  }, [r, h]);
  return <mesh geometry={geo} position={[x, 0, z]} castShadow receiveShadow><meshStandardMaterial color={C.hill} roughness={0.95} /></mesh>;
}
const inside = (x: number, z: number, x0: number, x1: number, z0: number, z1: number) => x > x0 && x < x1 && z > z0 && z < z1;
/** Within r metres of the tour's route (so no tree hides its dots). */
function nearRoute(x: number, z: number, r: number) {
  return ROUTE.slice(1).some((b, i) => {
    const a = ROUTE[i], dx = b[0] - a[0], dz = b[2] - a[2], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(x - a[0] - u * dx, z - a[2] - u * dz) < r;
  });
}
function Trees() {
  const { canopy, trunks } = useMemo(() => {
    const r = rng(41), canopy: { p: V3; s: number; c: string }[] = [];
    while (canopy.length < 150) {
      const x = BASE.x0 + 12 + r() * (BASE.x1 - BASE.x0 - 24), z = BASE.z0 + 12 + r() * (BASE.z1 - BASE.z0 - 24);
      const lake = ((x - LAKE.x) / (LAKE.rx + 10)) ** 2 + ((z - LAKE.z) / (LAKE.rz + 10)) ** 2 < 1;
      const busy = inside(x, z, GROUND.x0 - 12, GROUND.x1 + 12, GROUND.z0 - 40, GROUND.z1 + 12) || lake
        || BUILDINGS.some(b => inside(x, z, b.x - b.w / 2 - 6, b.x + b.w / 2 + 6, b.z - b.d / 2 - 6, b.z + b.d / 2 + 6))
        || HILLS.some(h => Math.hypot(x - h.x, z - h.z) < h.r * 0.75)
        // the squadron, its lawn, and the view onto it from the front (a near tree hid the PT, pass 2)
        || inside(x, z, SQUADRON.x - SQUADRON.w / 2 - 6, SQUADRON.x + SQUADRON.w / 2 + 30, SQUADRON.z - SQUADRON.d / 2 - 6, LAWN.z + LAWN.d / 2 + 40)
        || inside(x, z, POOL.x - POOL.w / 2 - 8, POOL.x + POOL.w / 2 + 8, POOL.z - POOL.d / 2 - 8, POOL.z + POOL.d / 2 + 8)
        || ((x - RING.x) / (RING.rx + 8)) ** 2 + ((z - RING.z) / (RING.rz + 8)) ** 2 < 1
        || nearRoute(x, z, 6);
      if (busy) continue;
      const s = 3.5 + 2.5 * r();
      canopy.push({ p: [x, 4 + s * 0.8, z], s, c: C.tree[Math.floor(r() * 3)] });
    }
    return { canopy, trunks: canopy.map(c => [c.p[0], 2.2, c.p[2]] as V3) };
  }, []);
  return <>
    {canopy.map((c, i) => <mesh key={i} position={c.p} scale={[c.s, c.s * 0.9, c.s]} castShadow receiveShadow><sphereGeometry args={[1, 12, 9]} /><meshStandardMaterial color={c.c} roughness={0.9} /></mesh>)}
    {trunks.map((p, i) => <mesh key={i} position={p}><cylinderGeometry args={[0.45, 0.6, 4.4, 6]} /><meshStandardMaterial color={C.trunk} roughness={1} /></mesh>)}
  </>;
}
function Buildings() {
  return <>{BUILDINGS.map((b, i) => <group key={i} position={[b.x, 0, b.z]}>
    <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow><RoundBox size={[b.w, b.h, b.d]} radius={0.8} /><meshStandardMaterial color={COL.stone} roughness={0.9} /></mesh>
    <mesh position={[0, b.h + 0.6, 0]} castShadow><RoundBox size={[b.w + 1.4, 1.2, b.d + 1.4]} radius={0.5} /><meshStandardMaterial color={COL.roof} roughness={0.85} /></mesh>
  </group>)}</>;
}
function Model({ glow }: { glow: number }) {
  const stripes = useMemo(mownStripes, []);
  const water = useMemo(() => new THREE.ShapeGeometry(lakeShape(), 64), []), shore = useMemo(() => new THREE.ShapeGeometry(lakeShape(5), 64), []);
  const W = BASE.x1 - BASE.x0, D = BASE.z1 - BASE.z0, cx = (BASE.x0 + BASE.x1) / 2, cz = (BASE.z0 + BASE.z1) / 2;
  const palms = useMemo(() => [-1, 1].flatMap(s => [0, 1, 2].map(k => ({ at: [s * (64 + 9 * k), 0, SUDAN.z + 8 + (k % 2) * 3] as V3, h: 11 + k, lean: s * 0.04, seed: 300 + k * 2 + s }))), []);
  return <group>
    {/* the slab: soil sides, grass on top */}
    <mesh position={[cx, -BASE.h / 2 - 0.05, cz]} castShadow receiveShadow><RoundBox size={[W, BASE.h, D]} radius={5} /><meshStandardMaterial color={C.soil} roughness={1} /></mesh>
    <mesh position={[cx, -BASE.h + 1, cz]}><RoundBox size={[W + 0.6, 2, D + 0.6]} radius={1} /><meshStandardMaterial color={C.soilDark} roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, cz]} receiveShadow><planeGeometry args={[W - 4, D - 4]} /><meshStandardMaterial color={C.grass} roughness={1} /></mesh>
    {/* roads: round the ground, up to Sudan Block, along the lake */}
    {([[0, GROUND.z1 + 7, GROUND.x1 - GROUND.x0 + 30, 8], [0, SUDAN.z + 7, 150, 8], [GROUND.x0 - 11, (GROUND.z0 + GROUND.z1) / 2, 8, GROUND.z1 - GROUND.z0 + 20],
      [GROUND.x1 + 11, (GROUND.z0 + GROUND.z1) / 2, 8, GROUND.z1 - GROUND.z0 + 20], [LAKE.x - LAKE.rx - 14, -40, 7, 210]] as number[][]).map(([x, z, w, d], i) =>
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.06, z]} receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial color={C.road} roughness={1} /></mesh>)}
    {/* Khetarpal Ground: mown stripes and a white border */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(GROUND.x0 + GROUND.x1) / 2, 0.1, (GROUND.z0 + GROUND.z1) / 2]} receiveShadow>
      <planeGeometry args={[GROUND.x1 - GROUND.x0, GROUND.z1 - GROUND.z0]} /><meshStandardMaterial map={stripes} roughness={1} />
    </mesh>
    {/* the lake: a sand shore and water that catches the light */}
    <mesh geometry={shore} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow><meshStandardMaterial color={C.sand} roughness={1} /></mesh>
    <mesh geometry={water} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} receiveShadow><meshStandardMaterial color={C.water} roughness={0.12} metalness={0.25} /></mesh>
    {HILLS.map((h, i) => <Hill key={i} {...h} />)}
    <Buildings />
    <SquadronBuilding />
    <Pool />
    <Ring />
    <Trees />
    <group position={[SUDAN.x, 0, SUDAN.z]}><SudanBlock glow={glow} /></group>
    {palms.map((p, i) => <Palm key={i} {...p} />)}
  </group>;
}

/** A squadron building: a long two-storey block, two rows of windows, a porch; its lawn in front (joining instructions:
 *  "Squadron Building: Cadets' Home"). No crest, no name board. */
function SquadronBuilding() {
  const { w, d, h } = SQUADRON;
  return <group position={[SQUADRON.x, 0, SQUADRON.z]}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow><RoundBox size={[w, h, d]} radius={0.8} /><meshStandardMaterial color={C.wall} roughness={0.85} /></mesh>
    <mesh position={[0, h + 0.7, 0]} castShadow><RoundBox size={[w + 1.6, 1.4, d + 1.6]} radius={0.5} /><meshStandardMaterial color={COL.roof} roughness={0.85} /></mesh>
    {[3.6, 8.4].flatMap(y => Array.from({ length: 10 }, (_, k) => <mesh key={`${y}-${k}`} position={[-w / 2 + 3.4 + k * 4.15, y, d / 2 + 0.05]}>
      <boxGeometry args={[2.2, 2.4, 0.3]} /><meshStandardMaterial color={C.window} roughness={0.4} /></mesh>))}
    <mesh position={[0, 2.6, d / 2 + 1.6]} castShadow><RoundBox size={[8, 5.2, 3.2]} radius={0.4} /><meshStandardMaterial color={C.wall} roughness={0.85} /></mesh>
    <mesh position={[0, 5.5, d / 2 + 1.6]}><RoundBox size={[9, 0.6, 3.8]} radius={0.25} /><meshStandardMaterial color={COL.roof} roughness={0.85} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LAWN.x - SQUADRON.x, 0.08, LAWN.z - SQUADRON.z]} receiveShadow><planeGeometry args={[LAWN.w, LAWN.d]} /><meshStandardMaterial color={C.lawn} roughness={1} /></mesh>
  </group>;
}
/** One of the pools: a paved deck, bright water, white lane lines. */
function Pool() {
  const lane = POOL.d / POOL.lanes;
  return <group position={[POOL.x, 0, POOL.z]}>
    <mesh position={[0, 0.3, 0]} receiveShadow castShadow><RoundBox size={[POOL.w + 6, 0.6, POOL.d + 6]} radius={0.6} /><meshStandardMaterial color={C.deck} roughness={0.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.64, 0]} receiveShadow><planeGeometry args={[POOL.w, POOL.d]} /><meshStandardMaterial color={C.pool} roughness={0.08} metalness={0.2} /></mesh>
    {Array.from({ length: POOL.lanes - 1 }, (_, k) => <mesh key={k} position={[0, 0.68, -POOL.d / 2 + lane * (k + 1)]}><boxGeometry args={[POOL.w - 2, 0.05, 0.28]} /><meshStandardMaterial color={C.lane} roughness={0.6} /></mesh>)}
  </group>;
}
/** The riding ring: sand inside a white rail on posts. */
function Ring() {
  const { sand, rail, posts } = useMemo(() => {
    const e = new THREE.EllipseCurve(0, 0, RING.rx, RING.rz, 0, 2 * Math.PI, false, 0), pts = e.getPoints(96);
    const sand = new THREE.ShapeGeometry(new THREE.Shape(pts), 64);
    const curve = new THREE.CatmullRomCurve3(pts.slice(0, -1).map(p => new THREE.Vector3(p.x, 1.4, p.y)), true);
    return { sand, rail: new THREE.TubeGeometry(curve, 160, 0.2, 6, true), posts: e.getPoints(28).map(p => [p.x, 0.75, p.y] as V3) };
  }, []);
  return <group position={[RING.x, 0, RING.z]}>
    <mesh geometry={sand} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow><meshStandardMaterial color={C.sandRing} roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={rail} castShadow><meshStandardMaterial color={C.rail} roughness={0.6} /></mesh>
    {posts.map((p, i) => <mesh key={i} position={p} castShadow><cylinderGeometry args={[0.18, 0.18, 1.5, 6]} /><meshStandardMaterial color={C.rail} roughness={0.6} /></mesh>)}
  </group>;
}
/** The tour's route: gold discs drawn from 1 to 6 in the opening, then fainter. */
function Route({ t }: { t: number }) {
  const dots = useMemo(routeDots, []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.7, 1.7, 0.3, 16), new THREE.MeshStandardMaterial({ color: C.gold, emissive: '#ffc21a', emissiveIntensity: 0.35, roughness: 0.4, transparent: true }), dots.length);
    dots.forEach((d, i) => { _m.makeTranslation(...d.p); m.setMatrixAt(i, _m); });
    m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; return m;
  }, [dots]);
  const r = routeAt(t);
  mesh.count = dots.filter(d => d.f <= r.shown).length;
  (mesh.material as THREE.MeshStandardMaterial).opacity = r.alpha;
  return <primitive object={mesh} />;
}

// ---- moving things -------------------------------------------------------------------------------------------------------
function Boats({ t }: { t: number }) {
  const boats = boatsAt(t);
  const sail = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 9); s.lineTo(4.6, 0.6); s.closePath(); return new THREE.ShapeGeometry(s); }, []);
  return <>{boats.map((b, i) => <group key={i} position={[b.x, 0.5, b.z]} rotation={[0, b.heading, b.rock]}>
    <mesh scale={[1.3, 0.7, 3.4]} castShadow><sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color={C.hull} roughness={0.5} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 5, 0.6]} castShadow><cylinderGeometry args={[0.12, 0.12, 10, 6]} /><meshStandardMaterial color="#8a7a63" /></mesh>
    <mesh geometry={sail} position={[0, 0.8, 0.6]} rotation={[0, -Math.PI / 2 + 0.35, 0]} castShadow><meshStandardMaterial color={b.sail} roughness={0.7} side={THREE.DoubleSide} /></mesh>
    {/* its wake: a soft pale V on the water behind it */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, -6]}><planeGeometry args={[3.2, 9]} /><meshBasicMaterial color="#e8f4fb" transparent opacity={0.35} depthWrite={false} /></mesh>
  </group>)}</>;
}
function Birds({ t }: { t: number }) {
  if (t > 9) return null;
  return <>{[0, 1, 2, 3, 4].map(k => {
    const x = -260 + 55 * t + 14 * k, z = -120 + 10 * k + 6 * Math.sin(k), y = 95 + 6 * Math.sin(k * 2), flap = 0.5 * Math.sin(14 * t + k);
    return <group key={k} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      {[-1, 1].map(s => <mesh key={s} position={[s * 1.4, 0, 0]} rotation={[0, 0, s * flap]}><boxGeometry args={[2.8, 0.15, 0.7]} /><meshStandardMaterial color="#2b2b30" /></mesh>)}
    </group>;
  })}</>;
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
// Faceless cadets, a third bigger than life on the model (panel pass 1: they read as barcodes): a torso, two legs that
// swing on the step, a thick white belt, a head and a cap. Plain navy: no uniform is claimed (storyboard § 8).
const FIG = 1.3;
function Cadets({ t }: { t: number }) {
  const max = 8 * 30 + 40;
  const parts = useMemo(() => {
    const mk = (g: THREE.BufferGeometry, color: string, n = max) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), n); m.castShadow = true; m.frustumCulled = false; return m; };
    return { torso: mk(new THREE.CapsuleGeometry(0.42 * FIG, 0.75 * FIG, 4, 10), C.navy), legs: mk(new THREE.CapsuleGeometry(0.17 * FIG, 0.8 * FIG, 4, 8), C.navy, 2 * max),
      arms: mk(new THREE.CapsuleGeometry(0.13 * FIG, 0.7 * FIG, 4, 8), C.navy, 2 * max),
      belt: mk(new THREE.CylinderGeometry(0.47 * FIG, 0.47 * FIG, 0.28 * FIG, 12), C.belt), head: mk(new THREE.SphereGeometry(0.3 * FIG, 10, 8), C.skin),
      cap: mk(new THREE.CylinderGeometry(0.37 * FIG, 0.37 * FIG, 0.24 * FIG, 10), C.navy) };
  }, []);
  const fs: Figure[] = [...figuresAt(t), ...ptAt(t)];
  const put = (m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, tilt = 0, roll = 0) => {
    _q.setFromEuler(new THREE.Euler(tilt, 0, roll)); _m.compose(_p.set(x, y, z), _q, _s.set(1, 1, 1)); m.setMatrixAt(i, _m);
  };
  fs.forEach((f, i) => {
    const lift = 0.1 * FIG * Math.abs(f.step), hip = f.y + 1.0 * FIG + lift;
    [-1, 1].forEach((side, k) => {                               // each leg hangs from the hip: swings on the step, opens on a jump
      const a = 0.45 * side * f.step, sp = 0.5 * f.spread;
      put(parts.legs, 2 * i + k, f.x + side * (0.2 * FIG + 0.5 * FIG * Math.sin(sp)), hip - 0.5 * FIG * Math.cos(a) * Math.cos(sp), f.z + 0.5 * FIG * Math.sin(a), a, side * sp);
    });
    [-1, 1].forEach((side, k) => {                               // arms from the shoulders: swing on the step, up overhead on a jump
      const L = 0.45 * FIG, a = 0.15 + 2.6 * f.spread, b = -0.5 * side * f.step, sx = f.x + side * 0.55 * FIG, sy = hip + 1.0 * FIG;
      put(parts.arms, 2 * i + k, sx + side * L * Math.sin(a), sy - L * Math.cos(a) * Math.cos(b), f.z + L * Math.sin(b), b, side * a);
    });
    put(parts.torso, i, f.x, hip + 0.55 * FIG, f.z); put(parts.belt, i, f.x, hip + 0.2 * FIG, f.z);
    put(parts.head, i, f.x, hip + 1.38 * FIG, f.z); put(parts.cap, i, f.x, hip + 1.66 * FIG, f.z);
  });
  for (const m of [parts.torso, parts.belt, parts.head, parts.cap]) { m.count = fs.length; m.instanceMatrix.needsUpdate = true; }
  for (const m of [parts.legs, parts.arms]) { m.count = 2 * fs.length; m.instanceMatrix.needsUpdate = true; }
  return <>{Object.values(parts).map((m, i) => <primitive key={i} object={m} />)}</>;
}
function AntimPag({ t }: { t: number }) {
  if (t < GROUND_AT - 0.2) return null;
  const f = lineFlashAt(t), a = prog(t, GROUND_AT - 0.2, 0.4);
  // a thick saturated gold band on a dark edge, flashing as each rank steps over it (panel pass 1: the hairline vanished)
  return <group position={[0, 0, LINE.z]}>
    <mesh position={[0, 0.16, 0]}><boxGeometry args={[2 * LINE.half + 2.4, 0.2, LINE.width + 2.4]} /><meshStandardMaterial color={ANTIM.edge} transparent opacity={a} /></mesh>
    <mesh position={[0, 0.32, 0]}>
      <boxGeometry args={[2 * LINE.half, 0.2, LINE.width]} />
      <meshStandardMaterial color={ANTIM.gold} emissive="#ffb000" emissiveIntensity={0.25 + 2.6 * f} metalness={0.3} roughness={0.3} transparent opacity={a} toneMapped={false} />
    </mesh>
  </group>;
}
/** Swimmers doing lengths: a body, a red cap at the head end, a white splash behind. */
function Swimmers({ t }: { t: number }) {
  return <>{swimmersAt(t).map((s, i) => {
    const kick = 0.75 + 0.25 * Math.abs(Math.sin(9 * t + i));
    return <group key={i} position={[s.x, 0.7, s.z]} scale={[1.35 * s.dir, 1.35, 1.35]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.34, 1.7, 4, 8]} /><meshStandardMaterial color={C.skin} roughness={0.7} /></mesh>
      <mesh position={[1.25, 0.08, 0]}><sphereGeometry args={[0.36, 10, 8]} /><meshStandardMaterial color={C.capRed} roughness={0.5} /></mesh>
      <mesh position={[-1.7, 0.05, 0]} scale={[1.3 * kick, 0.18, 0.9 * kick]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.85} /></mesh>
    </group>;
  })}</>;
}
/** Horses with riders trotting round the ring: diagonal pairs of legs swing together, a small bob on each stride. */
function Horses({ t }: { t: number }) {
  return <>{horsesAt(t).map((h, i) => {
    const bob = 0.14 * Math.abs(h.stride), col = C.horse[i % 3];
    return <group key={i} position={[h.x, bob, h.z]} rotation={[0, h.heading, 0]}>
      <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.72, 1.9, 4, 10]} /><meshStandardMaterial color={col} roughness={0.7} /></mesh>
      <mesh position={[0, 2.85, 1.35]} rotation={[-0.55, 0, 0]} castShadow><boxGeometry args={[0.5, 1.4, 0.65]} /><meshStandardMaterial color={col} roughness={0.7} /></mesh>
      <mesh position={[0, 3.45, 1.85]} rotation={[0.35, 0, 0]} castShadow><boxGeometry args={[0.45, 0.5, 1.05]} /><meshStandardMaterial color={col} roughness={0.7} /></mesh>
      <mesh position={[0, 3.0, 1.15]} rotation={[-0.55, 0, 0]}><boxGeometry args={[0.18, 1.3, 0.3]} /><meshStandardMaterial color={C.mane} roughness={0.9} /></mesh>
      <mesh position={[0, 1.8, -1.75]} rotation={[0.5, 0, 0]}><boxGeometry args={[0.2, 1.2, 0.25]} /><meshStandardMaterial color={C.mane} roughness={0.9} /></mesh>
      {([[-0.4, 0.95, 1], [0.4, 0.95, -1], [-0.4, -0.95, -1], [0.4, -0.95, 1]] as const).map(([x, z, sgn], k) => {
        const a = 0.4 * sgn * h.stride;
        return <mesh key={k} position={[x, 1.45 - 0.7 * Math.cos(a), z + 0.7 * Math.sin(a)]} rotation={[a, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 1.5, 6]} /><meshStandardMaterial color={col} roughness={0.7} /></mesh>;
      })}
      {/* the rider: faceless, plain navy */}
      <mesh position={[0, 3.25, -0.15]} castShadow><capsuleGeometry args={[0.36, 0.6, 4, 8]} /><meshStandardMaterial color={C.navy} roughness={0.8} /></mesh>
      <mesh position={[0, 4.0, -0.15]}><sphereGeometry args={[0.28, 10, 8]} /><meshStandardMaterial color={C.skin} roughness={0.8} /></mesh>
      <mesh position={[0, 4.25, -0.15]}><cylinderGeometry args={[0.32, 0.32, 0.2, 10]} /><meshStandardMaterial color={C.navy} roughness={0.8} /></mesh>
    </group>;
  })}</>;
}
function Jets({ t }: { t: number }) {
  const js = jetsAt(t);
  const wing = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, 6); s.lineTo(JET.span / 2, -5); s.lineTo(JET.span / 2 - 1.2, -7); s.lineTo(0, -5.5); s.lineTo(-JET.span / 2 + 1.2, -7); s.lineTo(-JET.span / 2, -5); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false });
  }, []);
  if (!js.length) return null;
  return <>{js.map((j, i) => {
    const yaw = Math.atan2(j.dir[0], j.dir[2]);
    return <group key={i} position={j.pos} rotation={[0, yaw, 0]} scale={JET.len / 30}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[1.1, 0.9, 30, 14]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>
      <mesh position={[0, 0, 15 + 2.4]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[1.1, 4.8, 14]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>
      <mesh geometry={wing} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -2]} castShadow><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} side={THREE.DoubleSide} /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[s * 1.6, 2.6, -15 + 3]} rotation={[0, 0, s * 0.25]}><boxGeometry args={[0.3, 4.6, 4.2]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>)}
      <mesh position={[0, 0.6, 7]}><sphereGeometry args={[1.0, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#1c2a3a" metalness={0.8} roughness={0.15} /></mesh>
      {/* speed streaks off the wingtips: thin and pale, not smoke (a Su-30 fly-past has none) */}
      {[-1, 1].map(s => <mesh key={`w${s}`} position={[s * 10.4, -0.1, -15 - 14]}><boxGeometry args={[0.18, 0.18, 30]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} /></mesh>)}
    </group>;
  })}</>;
}

function Scene({ t }: { t: number }) {
  return <>
    <CameraRig t={t} />
    <Light t={t} />
    <Model glow={lightAt(t).glow} />
    <Route t={t} />
    <Swimmers t={t} />
    <Horses t={t} />
    <Boats t={t} />
    <Birds t={t} />
    <Cadets t={t} />
    <AntimPag t={t} />
    <Jets t={t} />
  </>;
}

// ---- words over the picture ----------------------------------------------------------------------------------------------
// Dark pins with a white number (green on the grass and blue on the water vanished in the first version's panel); each pops
// in turn in the opening and pulses once its place is on screen.
function Pins({ t }: { t: number }) {
  const ps = PINS.map((_, i) => pinAt(i, t)).filter(p => p.alpha > 0.01).sort((a, b) => b.depth - a.depth);
  return <>{ps.map(p => {
    const d = 2 * PIN.r;
    return <div key={p.number} style={{ position: 'absolute', left: p.x - PIN.r, top: p.y - d - PIN.tip, width: d, height: d + PIN.tip, opacity: p.alpha,
      transform: `scale(${p.pop})`, transformOrigin: '50% 100%' }}>
      <div style={{ position: 'absolute', left: PIN.r - 13, top: d - 6, width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: `${PIN.tip + 6}px solid ${p.color}` }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, borderRadius: '50%', background: p.color, border: '4px solid #fff', boxSizing: 'border-box',
        boxShadow: `0 8px 20px ${tint(P.ink, 0.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 34px ${SOFT_UI}`, color: '#fff' }}>{p.number}</div>
    </div>;
  })}</>;
}
function Pill({ t }: { t: number }) {
  const p = pillAt(t);
  if (!p) return null;
  const a = Math.min(prog(t, p.t0, 0.2), 1 - prog(t, p.t1 - 0.2, 0.2));
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: PILL.y - 36, height: 72, display: 'flex', justifyContent: 'center', opacity: a }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 32px', height: 72, borderRadius: 36, background: '#fff', boxShadow: `0 10px 30px ${tint(P.ink, 0.16)}`,
      font: `700 ${PILL.size}px ${SOFT_UI}`, color: P.ink }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: NOW }} />{p.text}
    </div>
  </div>;
}
function EndPanel({ t }: { t: number }) {
  const { fps } = useVideoConfig(), a = prog(t, END_AT, 0.4);
  if (a <= 0) return null;
  return <>
    <div style={{ position: 'absolute', left: 100, top: END_PANEL.top, width: 880, height: END_PANEL.height, borderRadius: 40, background: '#fff', opacity: 0.94 * a, boxShadow: `0 18px 50px ${tint(P.ink, 0.18)}` }} />
    {END_LINES.map(l => {
      const u = t - END_AT - l.at, s = spring({ frame: u * fps, fps, config: { damping: 16 } });
      if (u < 0) return null;
      return <div key={l.text} style={{ position: 'absolute', left: 0, width: 1080, top: l.y - l.size * 0.65, height: l.size * 1.3, display: 'flex', alignItems: 'center',
        justifyContent: 'center', opacity: Math.min(1, u / 0.3), transform: `translateY(${(1 - s) * 18}px)`,
        font: `${l.weight} ${l.size}px ${SOFT_UI}`, color: l.text.startsWith('Follow') ? P.green : P.ink }}>{l.text}</div>;
    })}
  </>;
}
/** The header: the label, the hook, and six numbered dots that count through the tour (green = now, dark = visited). */
function TourHeader({ t }: { t: number }) {
  const size = 54, top = 150 + HEADER.length * size * 1.2 + 34, D = 62, GAP = 20, x0 = 540 - (PLACES.length * D + (PLACES.length - 1) * GAP) / 2;
  return <>
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 96, textAlign: 'center', font: `700 34px ${SOFT_UI}`, color: P.muted, whiteSpace: 'pre' }}>{'NDA LIFE  ·  CAMPUS TOUR'}</div>
    {HEADER.map((l, i) => <div key={l} style={{ position: 'absolute', left: 0, width: 1080, top: 150 + i * size * 1.2, textAlign: 'center', ...hand(size), color: P.ink }}>{l}</div>)}
    {PLACES.map((_, i) => {
      const st = dotState(i, t), u = t - STOPS[i].go, k = st === 'now' ? 1.15 + 0.18 * Math.sin(Math.min(1, Math.max(0, u / 0.35)) * Math.PI) : 1;
      const fill = st === 'now' ? NOW : st === 'done' ? P.ink : '#fff';
      return <div key={i} style={{ position: 'absolute', left: x0 + i * (D + GAP), top, width: D, height: D, borderRadius: '50%', background: fill, transform: `scale(${k})`,
        border: `4px solid ${st === 'next' ? P.ink : '#fff'}`, boxSizing: 'border-box', boxShadow: `${st === 'now' ? `0 0 0 4px ${NOW}, ` : ''}0 6px 16px ${tint(P.ink, 0.18)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 30px ${SOFT_UI}`, color: st === 'next' ? P.ink : '#fff' }}>{i + 1}</div>;
    })}
  </>;
}
/** Tilt-shift: the top and bottom of the picture soften, so the campus reads as a model on a table. */
function TiltShift() {
  const band = (top: number, dir: 'to bottom' | 'to top') => <div style={{ position: 'absolute', left: 0, top, width: BAND.width, height: 210, backdropFilter: 'blur(5px)',
    WebkitMaskImage: `linear-gradient(${dir}, #000, transparent)`, maskImage: `linear-gradient(${dir}, #000, transparent)` }} />;
  return <>{band(BAND.top, 'to bottom')}{band(BAND.top + BAND.height - 210, 'to top')}</>;
}

export function Life001({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  const warm = lightAt(t).warm;
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        {!cover && <TourHeader t={t} />}
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.1 }),
          // evening: the picture deepens as the light goes low (sepia turned it olive; the orange is the sunlight's own)
          filter: `saturate(${1 + 0.3 * warm}) contrast(${1 + 0.06 * warm})` }}>
          {skyAt(t) > 0 && <div style={{ position: 'absolute', inset: 0, opacity: skyAt(t), background: 'linear-gradient(to bottom, #4f8fd0, #a9cdee 70%, #d9e9f6)' }} />}
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        <TiltShift />
        <Pins t={t} />
        {!cover && <Pill t={t} />}
        {cover
          ? <Caption text={COVER_CAPTION.text} alpha={1} age={0} size={COVER_CAPTION.size} y={COVER_CAPTION.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} />}
        {!cover && <EndPanel t={t} />}
        {!cover && <Html5Audio src={staticFile('nda-life-001-campus-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
export const LIFE001_DURATION = DURATION;
