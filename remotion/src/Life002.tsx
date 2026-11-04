// @lws.pune · NDA Life #2 (3D): 3 roads after NDA, on the white board. A toy-like diorama (a rounded slab of soil, grass
// on top): NDA's Sudan Block at the front with a gate; three roads, each in its own colour: west into the hills under
// snowy peaks to the Indian Military Academy, north to the Indian Naval Academy by the sea, east to the Air Force Academy
// beside a runway. A column of faceless cadets marches on each; the camera follows each in; the IMA's flag runs up,
// the ship sounds its horn and turns, a trainer takes off; the camera pulls up over the three glowing roads. Our own generic
// buildings: no crests, no insignia, no uniforms (storyboard § 8). Timeline: lib/life002.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  DURATION, COVER_T, END_AT, LABEL, HEADER, ROADS, VISITS, SLAB, NDA, GATE, SEA, BEACH, RUNWAY, GRASS, PEAKS, HILLS, PILL, PILLS,
  CAPTIONS, END_LINES, END_PANEL, COVER_CAPTION, BAND, TAG, FIG, PLANE, cameraAt, drawnAt, cadetsAt, focusAt, flagAt3, FLAG, FORECOURT, forecourtAt, UNIFORM, puffAt, shipAt, planeAt, SHIP, HORN_AT, ROLL_AT,
  tagAt, pillAt, dotState, skyAt, WHEELS_UP, type V3,
} from './lib/life002.ts';
import { Board, Caption, Theme, TourHeader, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { ClothFlag, GrassField, MiniatureFinish, Sea, Tree } from './miniature.tsx';
import { COL, rng, SudanBlock } from './sudanBlock.tsx';

const C = { soil: '#7b5a3e', soilDark: '#5e432d', grass: GRASS, hill: '#6f9550', peak: '#7d8a7a', snow: '#fbfbf8', road: '#d8c9a6',
  sand: '#e2d3a8', sea: '#2f8fd0', plain: '#c2b99c', tarmac: '#5d6168', pine: ['#2f5e2b', '#3a6b33', '#2b5328'], tree: ['#3f7a35', '#4d8a3c', '#5a9442'],
  trunk: '#6b5a45', navy: UNIFORM, belt: '#f4f1ea', skin: '#7d5238', wall: '#e8dcc0', brick: '#b2593c', white: '#f4f2ec', window: '#3a4250',
  hull: '#7c858f', deck: '#c9ccd0', plane: '#f6f6f2', stripe: '#e0392b', canopy: '#1c2a3a', hangar: '#a9adb2' };

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 1; cam.far = 4000;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}
/** Afternoon sun from the south-west; soft sky fill; a room environment for the water. */
function Light() {
  const { gl, scene } = useThree();
  const room = useMemo(() => { const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return tex; }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = 0.35;
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(-8, 0, -14); return o; }, []);
  if (!scene.children.includes(target)) scene.add(target);
  return <>
    <hemisphereLight args={['#d6e6ff', '#6b5a3a', 1.1]} />
    <directionalLight position={[-260, 330, 240]} target={target} intensity={3.0} color="#fff1d6" castShadow
      shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.4} shadow-radius={3}
      shadow-camera-left={-170} shadow-camera-right={170} shadow-camera-top={170} shadow-camera-bottom={-170} shadow-camera-near={50} shadow-camera-far={1200} />
  </>;
}

// ---- the diorama ---------------------------------------------------------------------------------------------------------
function Mound({ x, z, r, h, color, snow = 0 }: { x: number; z: number; r: number; h: number; color: string; snow?: number }) {
  const geo = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24; prof.push(new THREE.Vector2(Math.max(0.01, r * (1 - u)), h * (0.5 + 0.5 * Math.cos(Math.PI * (1 - u))) ** 0.8)); }
    return new THREE.LatheGeometry(prof, 36);
  }, [r, h]);
  // a snow cap: the top `snow` of the same shape, a hair bigger, in white
  const cap = useMemo(() => {
    if (!snow) return null;
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) { const u = 1 - snow + (snow * i) / 16; prof.push(new THREE.Vector2(Math.max(0.01, 1.02 * r * (1 - u)), 0.15 + h * (0.5 + 0.5 * Math.cos(Math.PI * (1 - u))) ** 0.8)); }
    return new THREE.LatheGeometry(prof, 36);
  }, [r, h, snow]);
  return <group position={[x, 0, z]}>
    <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.95} /></mesh>
    {cap && <mesh geometry={cap} castShadow><meshStandardMaterial color={C.snow} roughness={0.7} /></mesh>}
  </group>;
}
/** A flat strip along a polyline (a road, its coloured line), `upTo` metres of it, `w` wide, at height y. */
function strip(pts: [number, number][], w: number, upTo: number) {
  const left: number[] = [], right: number[] = [];
  let run = 0;
  const push = (x: number, z: number, d: [number, number]) => { const n = [-d[1], d[0]]; left.push(x + (n[0] * w) / 2, z + (n[1] * w) / 2); right.push(x - (n[0] * w) / 2, z - (n[1] * w) / 2); };
  for (let i = 1; i < pts.length && run < upTo; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), d: [number, number] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const u = Math.min(L, upTo - run);
    push(a[0], a[1], d); push(a[0] + d[0] * u, a[1] + d[1] * u, d);
    run += L;
  }
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < left.length / 2; i++) pos.push(left[2 * i], 0, left[2 * i + 1], right[2 * i], 0, right[2 * i + 1]);
  for (let i = 0; i + 1 < left.length / 2; i++) { const a = 2 * i; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** Within r metres of any road (so no tree or hill sits on one). */
function nearRoad(x: number, z: number, r: number) {
  return ROADS.some(rd => rd.pts.slice(1).some((b, i) => {
    const a = rd.pts[i], dx = b[0] - a[0], dz = b[1] - a[1], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz) < r;
  }));
}
const inBox = (x: number, z: number, cx: number, cz: number, hw: number, hd: number) => Math.abs(x - cx) < hw && Math.abs(z - cz) < hd;
function Trees({ t }: { t: number }) {
  const trees = useMemo(() => {
    // no tree between a close camera and what it looks at (stills: one hid the Air Force column, others crowded the shots)
    const sights = [...VISITS.flatMap(v => [v.settled + 0.5, v.arrive + 1.2]), WHEELS_UP + 0.5].map(s => cameraAt(s)).map(c => [c.position, c.target]);
    // nor between the camera and the ship at its horn (panel pass 2: a tree hid its stern)
    for (const s of [HORN_AT, HORN_AT + 0.8]) { const sh = shipAt(s); sights.push([cameraAt(s).position, [sh.x, 0, sh.z]]); }
    // nor between the camera and the trainer's roll and lift-off (stills: a tree clipped its tail at wheels-up)
    for (const s of [ROLL_AT + 0.5, WHEELS_UP - 0.3, WHEELS_UP, WHEELS_UP + 0.3]) for (const dz of [-PLANE.len / 2, PLANE.len / 2]) { const q = planeAt(s).pos; sights.push([cameraAt(s).position, [q[0], 0, q[2] + dz]]); }
    const inSight = (x: number, z: number) => sights.some(([a, b]) => {
      const dx = b[0] - a[0], dz = b[2] - a[2], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz)));
      return Math.hypot(x - a[0] - u * dx, z - a[2] - u * dz) < 12;
    });
    const r = rng(23), out: { p: V3; s: number; c: string; pine: boolean }[] = [];
    for (let n = 0; n < 1400 && out.length < 120; n++) {
      const x = SLAB.x0 + 8 + r() * (SLAB.x1 - SLAB.x0 - 16), z = SLAB.z0 + 8 + r() * (SLAB.z1 - SLAB.z0 - 16);
      if (z < BEACH.z1 + 4 || x > RUNWAY.x - 22 || nearRoad(x, z, 7) || inBox(x, z, NDA.x, NDA.z, 24, 14) || inBox(x, z, GATE[0], GATE[2], 8, 6) || inSight(x, z)) continue;
      if (ROADS.some(rd => inBox(x, z, rd.at[0], rd.at[2], rd.size[0] / 2 + 6, rd.size[2] / 2 + 8))) continue;
      if ([...PEAKS, ...HILLS].some(h => Math.hypot(x - h.x, z - h.z) < h.r * 0.8)) continue;
      const pine = x < -30, s = pine ? 2.2 + 1.4 * r() : 2.6 + 1.8 * r();
      out.push({ p: [x, 0, z], s, c: (pine ? C.pine : C.tree)[Math.floor(r() * 3)], pine });
    }
    return out;
  }, []);
  return <>{trees.map((tr, i) => <Tree key={i} {...tr} seed={i} t={t} />)}</>;
}
/** A generic academy block: walls, rows of windows, a roof, a porch facing its road, and a mast with a plain flag in the
 *  road's colour. Not a copy of any real building. */
function Academy({ k, t }: { k: number; t: number }) {
  const rd = ROADS[k], [w, h, d] = rd.size, wall = [C.brick, C.white, C.wall][k], roof = [COL.roof, '#3b5d8a', '#6d7682'][k];
  const frame = ['#efe2cf', '#c3ccd8', '#c9c0ac'][k];
  const glow = prog(t, VISITS[k].arrive, 0.6);
  return <group position={rd.at}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow><RoundBox size={[w, h, d]} radius={0.6} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>
    <mesh position={[0, h + 0.6, 0]} castShadow><RoundBox size={[w + 1.4, 1.2, d + 1.4]} radius={0.4} /><meshStandardMaterial color={roof} roughness={0.8} /></mesh>
    {[h * 0.3, h * 0.68].flatMap(y => Array.from({ length: 7 }, (_, i) => <mesh key={`${y}-${i}`} position={[-w / 2 + 2.2 + i * ((w - 4.4) / 6), y, d / 2 + 0.05]}>
      <boxGeometry args={[1.5, 1.7, 0.3]} /><meshStandardMaterial color={C.window} emissive="#ffc77a" emissiveIntensity={0.6 * glow} roughness={0.4} /></mesh>))}
    {/* the miniature look: a plinth, framed windows, a door and steps (founder 2026-11-04: keep improving quality) */}
    <mesh position={[0, 0.45, 0]} receiveShadow><RoundBox size={[w + 0.5, 0.9, d + 0.5]} radius={0.2} /><meshStandardMaterial color={frame} roughness={0.9} /></mesh>
    {[h * 0.3, h * 0.68].flatMap(y => Array.from({ length: 7 }, (_, i) => <mesh key={`f${y}-${i}`} position={[-w / 2 + 2.2 + i * ((w - 4.4) / 6), y, d / 2 + 0.02]}>
      <boxGeometry args={[2.0, 2.2, 0.2]} /><meshStandardMaterial color={frame} roughness={0.8} /></mesh>))}
    <mesh position={[0, 2.4, d / 2 + 1.4]} castShadow><RoundBox size={[6, 4.8, 2.8]} radius={0.3} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>
    <mesh position={[0, 1.7, d / 2 + 2.82]}><boxGeometry args={[2.4, 3.2, 0.12]} /><meshStandardMaterial color="#39404c" roughness={0.6} /></mesh>
    {[[6.4, 0.18, 1.3], [5.2, 0.5, 0.65]].map(([sw, y, dz], i) => <mesh key={`s${i}`} position={[0, y, d / 2 + 2.8 + dz]} castShadow receiveShadow>
      <boxGeometry args={[sw, 0.36, 1.3 - 0.65 * i]} /><meshStandardMaterial color={frame} roughness={0.9} /></mesh>)}
    <mesh position={[0, 5.0, d / 2 + 1.4]}><RoundBox size={[6.8, 0.5, 3.4]} radius={0.2} /><meshStandardMaterial color={roof} roughness={0.8} /></mesh>
  </group>;
}
/** The academy's mast and flag (big enough to read on a phone, across its arrival camera's view: panel pass 2). */
function Flag({ k, t }: { k: number; t: number }) {
  const { mast, y } = flagAt3(k, t), z = FLAG.alongZ[k];
  return <group position={mast} rotation={[0, z ? -Math.PI / 2 : FLAG.sign[k] < 0 ? Math.PI : 0, 0]}>
    <mesh position={[0, FLAG.mast / 2, 0]} castShadow><cylinderGeometry args={[0.2, 0.26, FLAG.mast, 8]} /><meshStandardMaterial color="#e6e3dc" metalness={0.4} roughness={0.4} /></mesh>
    <group position={[0, y, 0]}><ClothFlag w={FLAG.w} h={FLAG.h} color={ROADS[k].color} t={t + k} /></group>
  </group>;
}
function Gate() {
  return <group position={GATE}>
    {[-5, 5].map(x => <mesh key={x} position={[x, 3.2, 0]} castShadow><RoundBox size={[1.8, 6.4, 1.8]} radius={0.3} /><meshStandardMaterial color={COL.stone} roughness={0.9} /></mesh>)}
    <mesh position={[0, 6.9, 0]} castShadow><RoundBox size={[12, 1.2, 1.4]} radius={0.3} /><meshStandardMaterial color={COL.red} roughness={0.85} /></mesh>
  </group>;
}
function Runway({ t }: { t: number }) {
  const len = RUNWAY.z1 - RUNWAY.z0, cz = (RUNWAY.z0 + RUNWAY.z1) / 2;
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RUNWAY.x, 0.12, cz]} receiveShadow><planeGeometry args={[RUNWAY.w, len]} /><meshStandardMaterial color={C.tarmac} roughness={0.9} /></mesh>
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[RUNWAY.x, 0.16, RUNWAY.z0 + 6 + i * (len - 12) / 13]}>
      <planeGeometry args={[0.5, 4.5]} /><meshStandardMaterial color="#f4f4f0" roughness={0.7} /></mesh>)}
    {/* two hangars and a windsock */}
    {[-58, -38].map(z => <mesh key={z} position={[RUNWAY.x - 16, 0, z]} rotation={[0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[6.5, 6.5, 14, 20, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial color={C.hangar} metalness={0.3} roughness={0.55} side={THREE.DoubleSide} /></mesh>)}
    <group position={[RUNWAY.x - 9, 0, 20]}>
      <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.12, 0.15, 8, 6]} /><meshStandardMaterial color="#e6e3dc" /></mesh>
      <mesh position={[0, 7.6, -1.6]} rotation={[Math.PI / 2 + 0.15 * Math.sin(3.1 * t), 0.2 * Math.sin(1.3 * t), 0]}><coneGeometry args={[0.7, 3.4, 10, 1, true]} /><meshStandardMaterial color="#f07a1a" roughness={0.6} side={THREE.DoubleSide} /></mesh>
    </group>
  </group>;
}
function Diorama({ t }: { t: number }) {
  const W = SLAB.x1 - SLAB.x0, D = SLAB.z1 - SLAB.z0, cx = (SLAB.x0 + SLAB.x1) / 2, cz = (SLAB.z0 + SLAB.z1) / 2;
  const roads = useMemo(() => ROADS.map(r => strip(r.pts, 7, Infinity)), []);
  const shown = drawnAt(t);
  const lines = ROADS.map(r => strip(r.pts, 3.8, shown * r.length));   // wider: the colour carries the wide shots (panel)
  return <group>
    <mesh position={[cx, -SLAB.h / 2 - 0.05, cz]} castShadow receiveShadow><RoundBox size={[W, SLAB.h, D]} radius={4} /><meshStandardMaterial color={C.soil} roughness={1} /></mesh>
    <mesh position={[cx, -SLAB.h + 1, cz]}><RoundBox size={[W + 0.6, 2, D + 0.6]} radius={1} /><meshStandardMaterial color={C.soilDark} roughness={1} /></mesh>
    <GrassField x0={SLAB.x0 + 2} x1={SLAB.x1 - 2} z0={SLAB.z0 + 2} z1={SLAB.z1 - 2} y={0.02} color={C.grass} />
    {/* the sea along the back, its beach; the airfield's plain on the right */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.06, (BEACH.z0 + BEACH.z1) / 2]} receiveShadow><planeGeometry args={[W - 4, BEACH.z1 - BEACH.z0 + 4]} /><meshStandardMaterial color={C.sand} roughness={1} /></mesh>
    <Sea x0={SLAB.x0 + 2} x1={SLAB.x1 - 2} z0={SEA.z0 + 2} z1={SEA.z1} y={0.3} color={C.sea} t={t} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(RUNWAY.x - 28 + SLAB.x1 - 2) / 2, 0.05, (BEACH.z1 + SLAB.z1 - 2) / 2]} receiveShadow>
      <planeGeometry args={[SLAB.x1 - 2 - (RUNWAY.x - 28), SLAB.z1 - 2 - BEACH.z1]} /><meshStandardMaterial color={C.plain} roughness={1} /></mesh>
    {roads.map((g, i) => <mesh key={i} geometry={g} position={[0, 0.2, 0]} receiveShadow><meshStandardMaterial color={C.road} roughness={1} /></mesh>)}
    {lines.map((g, i) => {
      const glow = prog(t, VISITS[i].arrive, 0.6);
      return <mesh key={`l${i}`} geometry={g} position={[0, 0.3, 0]}><meshStandardMaterial color={ROADS[i].color} emissive={ROADS[i].color} emissiveIntensity={0.15 + 0.6 * glow} roughness={0.5} toneMapped={false} /></mesh>;
    })}
    {PEAKS.map((p, i) => <Mound key={`p${i}`} {...p} color={C.peak} snow={0.35} />)}
    {HILLS.map((h, i) => <Mound key={`h${i}`} {...h} color={C.hill} />)}
    <Trees t={t} />
    <Runway t={t} />
    <group position={[NDA.x, 0, NDA.z]} rotation={[0, Math.PI, 0]} scale={NDA.scale}><SudanBlock glow={0.15} /></group>
    <Gate />
    {ROADS.map((_, k) => <Academy key={k} k={k} t={t} />)}
    {ROADS.map((_, k) => <Flag key={`f${k}`} k={k} t={t} />)}
    {ROADS.map((_, k) => <mesh key={`p${k}`} position={[forecourtAt(k)[0], 0.36, forecourtAt(k)[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[FORECOURT.r, 40]} /><meshStandardMaterial color={FORECOURT.color} roughness={0.9} /></mesh>)}
  </group>;
}

// ---- moving things -------------------------------------------------------------------------------------------------------
/** The ship: a grey hull with a red waterline, a bridge, a mast, a funnel; a white steam puff from the funnel as the horn
 *  sounds (so the moment works muted). */
function Ship({ t }: { t: number }) {
  const s = shipAt(t), puff = puffAt(t), u = Math.max(0, t - HORN_AT);
  return <group position={[s.x, 0.3, s.z]} rotation={[0, s.heading, s.rock]}>
    <mesh position={[0, 1.2, 0]} castShadow><RoundBox size={[SHIP.beam, 2.6, SHIP.len]} radius={0.8} /><meshStandardMaterial color={C.hull} metalness={0.3} roughness={0.55} /></mesh>
    <mesh position={[0, 0.25, 0]}><RoundBox size={[SHIP.beam + 0.1, 0.5, SHIP.len - 0.6]} radius={0.2} /><meshStandardMaterial color={C.stripe} roughness={0.6} /></mesh>
    <mesh position={[0, 2.6, 0]}><RoundBox size={[SHIP.beam - 0.6, 0.3, SHIP.len - 2]} radius={0.15} /><meshStandardMaterial color={C.deck} roughness={0.7} /></mesh>
    {puff > 0.01 && [0, 1, 2].map(k => <mesh key={k} position={[0, 5.2 + 2.2 * k + 3 * u, 9 - 1.2 * k - 2 * u]} scale={(1.4 + 0.6 * k + 1.5 * u) * Math.min(1, puff * 2)}>
      <sphereGeometry args={[1, 12, 9]} /><meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.85 * puff} depthWrite={false} /></mesh>)}
    <mesh position={[0, 4.6, -2]} castShadow><RoundBox size={[3.6, 3.8, 7]} radius={0.4} /><meshStandardMaterial color={C.hull} metalness={0.3} roughness={0.5} /></mesh>
    <mesh position={[0, 8.6, -2]} castShadow><cylinderGeometry args={[0.15, 0.2, 5, 6]} /><meshStandardMaterial color="#d8dbe0" /></mesh>
    <mesh position={[0, 3.6, 9]}><cylinderGeometry args={[0.9, 0.9, 1.6, 10]} /><meshStandardMaterial color={C.hull} metalness={0.3} roughness={0.5} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -18]}><planeGeometry args={[5, 14]} /><meshBasicMaterial color="#e8f4fb" transparent opacity={0.4} depthWrite={false} /></mesh>
  </group>;
}
/** A small prop trainer: white with a red stripe, a dark canopy, a spinning propeller disc. */
function Plane({ t }: { t: number }) {
  // gone once the end card is up: by then it is a blurred speck off the model's edge (miniature look, 2026-11-04)
  if (t >= END_AT) return null;
  const p = planeAt(t), L = PLANE.len, span = PLANE.span;
  return <group position={[p.pos[0], p.pos[1] + 1.6, p.pos[2]]} rotation={[p.pitch, Math.PI, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.9, L - 2, 6, 12]} /><meshStandardMaterial color={C.plane} roughness={0.4} /></mesh>
    <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.93, 0.93, 1.2, 12]} /><meshStandardMaterial color={C.stripe} roughness={0.5} /></mesh>
    <mesh position={[0, -0.4, 1]} castShadow><RoundBox size={[span, 0.35, 2.6]} radius={0.15} /><meshStandardMaterial color={C.plane} roughness={0.4} /></mesh>
    {[-1, 1].map(s => <mesh key={s} position={[s * (span / 2 - 0.8), -0.38, 1]}><boxGeometry args={[1.6, 0.4, 2.62]} /><meshStandardMaterial color={C.stripe} roughness={0.5} /></mesh>)}
    <mesh position={[0, 0.2, -L / 2 + 1]}><RoundBox size={[5.4, 0.25, 1.6]} radius={0.1} /><meshStandardMaterial color={C.plane} roughness={0.4} /></mesh>
    <mesh position={[0, 1.6, -L / 2 + 1.2]} castShadow><RoundBox size={[0.25, 3, 2]} radius={0.1} /><meshStandardMaterial color={C.stripe} roughness={0.5} /></mesh>
    <mesh position={[0, 1.0, 2.5]}><sphereGeometry args={[0.85, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={C.canopy} metalness={0.7} roughness={0.15} /></mesh>
    <mesh position={[0, 0, L / 2 + 0.2]} rotation={[0, 0, 40 * t]}><circleGeometry args={[1.5, 20]} /><meshBasicMaterial color="#333" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} /></mesh>
  </group>;
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
// Faceless cadets (Life001's figure): a torso, legs and arms that swing on the step, a white belt, a head and a cap. Plain
// navy: no uniform is claimed (storyboard § 8); the caps carry the road's colour. Each faces along its road.
function Cadets({ t }: { t: number }) {
  const max = 27;
  const parts = useMemo(() => {
    const mk = (g: THREE.BufferGeometry, color: string, n = max) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), n); m.castShadow = true; m.frustumCulled = false; return m; };
    return { torso: mk(new THREE.CapsuleGeometry(0.42 * FIG, 0.75 * FIG, 4, 10), C.navy), legs: mk(new THREE.CapsuleGeometry(0.17 * FIG, 0.8 * FIG, 4, 8), C.navy, 2 * max),
      arms: mk(new THREE.CapsuleGeometry(0.13 * FIG, 0.7 * FIG, 4, 8), C.navy, 2 * max),
      belt: mk(new THREE.CylinderGeometry(0.47 * FIG, 0.47 * FIG, 0.28 * FIG, 12), C.belt), head: mk(new THREE.SphereGeometry(0.3 * FIG, 10, 8), C.skin),
      cap: mk(new THREE.CylinderGeometry(0.37 * FIG, 0.37 * FIG, 0.27 * FIG, 10), '#ffffff'),
      // the miniature look: a cap brim, hands, boots (founder 2026-11-04)
      brim: mk(new THREE.CylinderGeometry(0.44 * FIG, 0.44 * FIG, 0.05 * FIG, 14), '#1a2133'), hands: mk(new THREE.SphereGeometry(0.12 * FIG, 8, 6), C.skin, 2 * max),
      boots: mk(new THREE.BoxGeometry(0.3 * FIG, 0.2 * FIG, 0.44 * FIG), '#14171e', 2 * max) };
  }, []);
  // each column's caps in its road's colour: a colour code, not a uniform (panel pass 1: all navy read as the Navy)
  useMemo(() => { const c = new THREE.Color(); for (let i = 0; i < max; i++) parts.cap.setColorAt(i, c.set(ROADS[Math.floor(i / 9)].color)); parts.cap.instanceColor!.needsUpdate = true; }, [parts]);
  const fs = ROADS.flatMap((_, k) => cadetsAt(k, t));
  // place a part at local (lx, ly, lz) in the cadet's own frame (z = the way it marches), tilted by `tilt` about its x
  const put = (m: THREE.InstancedMesh, i: number, f: { x: number; z: number; heading: number }, lx: number, ly: number, lz: number, tilt = 0) => {
    const c = Math.cos(f.heading), s = Math.sin(f.heading);
    _e.set(tilt, f.heading, 0); _q.setFromEuler(_e);
    _m.compose(_p.set(f.x + lx * c + lz * s, 0.3 + ly, f.z - lx * s + lz * c), _q, _s); m.setMatrixAt(i, _m);
  };
  fs.forEach((f, i) => {
    const hip = 1.0 * FIG + 0.1 * FIG * Math.abs(f.step);
    [-1, 1].forEach((side, k) => { const a = 0.45 * side * f.step; put(parts.legs, 2 * i + k, f, side * 0.2 * FIG, hip - 0.5 * FIG * Math.cos(a), 0.5 * FIG * Math.sin(a), a); });
    [-1, 1].forEach((side, k) => { const L = 0.45 * FIG, b = -0.5 * side * f.step; put(parts.arms, 2 * i + k, f, side * 0.58 * FIG, hip + 1.0 * FIG - L * Math.cos(b), L * Math.sin(b), b); });
    put(parts.torso, i, f, 0, hip + 0.55 * FIG, 0); put(parts.belt, i, f, 0, hip + 0.2 * FIG, 0);
    put(parts.head, i, f, 0, hip + 1.38 * FIG, 0); put(parts.cap, i, f, 0, hip + 1.66 * FIG, 0); put(parts.brim, i, f, 0, hip + 1.54 * FIG, 0);
    [-1, 1].forEach((side, k) => { const a = 0.45 * side * f.step; put(parts.boots, 2 * i + k, f, side * 0.2 * FIG, hip - 1.02 * FIG * Math.cos(a), 0.08 * FIG - 0.07 * FIG * Math.sin(a)); });
    [-1, 1].forEach((side, k) => { const b = -0.5 * side * f.step; put(parts.hands, 2 * i + k, f, side * 0.58 * FIG, hip + 1.0 * FIG - 0.95 * FIG * Math.cos(b), -0.03 * FIG * Math.sin(b)); });
  });
  for (const m of [parts.torso, parts.belt, parts.head, parts.cap, parts.brim]) { m.count = fs.length; m.instanceMatrix.needsUpdate = true; }
  for (const m of [parts.legs, parts.arms, parts.hands, parts.boots]) { m.count = 2 * fs.length; m.instanceMatrix.needsUpdate = true; }
  return <>{Object.values(parts).map((m, i) => <primitive key={i} object={m} />)}</>;
}

/** A glowing disc in its road's colour under each column, only in the wide shots, so the three marching columns can be
 *  seen from far away (panel pass 1, Motion: the columns were invisible in the opening). */
function Markers({ t }: { t: number }) {
  const c = cameraAt(t), far = Math.min(1, Math.max(0, (Math.hypot(...c.position.map((v, i) => v - c.target[i]) as [number, number, number]) - 180) / 200));
  if (far < 0.01) return null;
  return <>{ROADS.map((r, k) => {
    const fs = cadetsAt(k, t), x = fs.reduce((a, f) => a + f.x, 0) / fs.length, z = fs.reduce((a, f) => a + f.z, 0) / fs.length;
    return <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.45, z]}><circleGeometry args={[6.5, 28]} />
      <meshBasicMaterial color={r.color} transparent opacity={0.75 * far * (0.8 + 0.2 * Math.sin(5 * t + k))} depthWrite={false} toneMapped={false} /></mesh>;
  })}</>;
}

function Scene({ t }: { t: number }) {
  return <>
    <CameraRig t={t} />
    <Light />
    <Diorama t={t} />
    <Markers t={t} />
    <Ship t={t} />
    <Plane t={t} />
    <Cadets t={t} />
    <MiniatureFinish {...focusAt(t)} />
  </>;
}

// ---- words over the picture ----------------------------------------------------------------------------------------------
/** Number tags over the academies, in their road's colour, in the opening only. */
function Tags({ t }: { t: number }) {
  return <>{ROADS.map((_, i) => {
    const g = tagAt(i, t), d = 2 * TAG.r;
    if (g.alpha <= 0.01) return null;
    return <div key={i} style={{ position: 'absolute', left: g.x - TAG.r, top: g.y - TAG.r, width: d, height: d, borderRadius: '50%', opacity: g.alpha,
      transform: `scale(${g.pop})`, background: g.color, border: '4px solid #fff', boxSizing: 'border-box', boxShadow: `0 6px 18px ${tint(P.ink, 0.35)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 30px ${SOFT_UI}`, color: '#fff' }}>{g.number}</div>;
  })}</>;
}
const PILL_H = 80;
function Pill({ t }: { t: number }) {
  const p = pillAt(t);
  if (!p) return null;
  const a = Math.min(prog(t, p.t0, 0.2), 1 - prog(t, p.t1 - 0.2, 0.2));
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: PILL.y - PILL_H / 2, height: PILL_H, display: 'flex', justifyContent: 'center', opacity: a }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 34px', height: PILL_H, borderRadius: PILL_H / 2, background: '#fff', boxShadow: `0 10px 30px ${tint(P.ink, 0.2)}`,
      font: `800 ${PILL.size}px ${SOFT_UI}`, color: P.ink, whiteSpace: 'pre' }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, background: p.color }} />{p.text}
    </div>
  </div>;
}
function EndPanel({ t }: { t: number }) {
  const { fps } = useVideoConfig(), a = prog(t, END_AT, 0.4);
  if (a <= 0) return null;
  return <>
    <div style={{ position: 'absolute', left: 100, top: END_PANEL.top, width: 880, height: END_PANEL.height, borderRadius: 40, background: '#fff', opacity: a, boxShadow: `0 18px 50px ${tint(P.ink, 0.18)}` }} />
    {END_LINES.map(l => {
      const u = t - END_AT - l.at, s = spring({ frame: u * fps, fps, config: { damping: 16 } });
      if (u < 0) return null;
      return <div key={l.text} style={{ position: 'absolute', left: 0, width: 1080, top: l.y - l.size * 0.65, height: l.size * 1.3, display: 'flex', alignItems: 'center',
        justifyContent: 'center', opacity: Math.min(1, u / 0.3), transform: `translateY(${(1 - s) * 18}px)`,
        font: `${l.weight} ${l.size}px ${SOFT_UI}`, color: l.text.startsWith('Follow') ? P.green : P.ink }}>{l.text}</div>;
    })}
  </>;
}
export function Life002({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t), sky = skyAt(t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        {!cover && <TourHeader t={t} label={LABEL} lines={HEADER} states={ROADS.map((_, i) => dotState(i, t))} starts={PILLS.map(p => p.t0)} colors={ROADS.map(r => r.color)} />}
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.1 }) }}>
          {sky > 0 && <div style={{ position: 'absolute', inset: 0, opacity: sky, background: 'linear-gradient(to bottom, #4f8fd0, #a9cdee 65%, #d9e9f6)' }} />}
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        <Tags t={t} />
        {!cover && <Pill t={t} />}
        {cover
          ? <Caption text={COVER_CAPTION.text} alpha={1} age={0} size={COVER_CAPTION.size} y={COVER_CAPTION.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} />}
        {!cover && <EndPanel t={t} />}
        {!cover && <Html5Audio src={staticFile('nda-life-002-roads-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
export const LIFE002_DURATION = DURATION;
