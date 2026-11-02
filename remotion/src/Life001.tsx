// @lws.pune · NDA Life #1 (3D, predict-first): NDA as a miniature on the white board. A toy-like model of the campus (a
// rounded slab of soil with grass on top: hills, a lake, Sudan Block, Khetarpal Ground, buildings, trees) turns once under
// "Where is the passing-out parade held?"; the camera visits Sudan Block (A ✗), Peacock Bay (C ✗) and the ground, where
// blocks of cadets are set down, B lights ✓ and the passing-out course marches over the gold Antim Pag line; three jets
// pass; the light goes low and orange and the dome lights under the end card. Our own model, not to scale, no crest, the
// cadets faceless (storyboard § 8). Sudan Block and the palms: sudanBlock.tsx (One Day's). Timeline: lib/life001.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  DURATION, COVER_T, ANSWER_AT, END_AT, OPTIONS, ANSWER, HEADER, CROSSED, BASE, GROUND, LINE, LAKE, HILLS, BUILDINGS, SUDAN,
  PINS, PIN, BAND, CAPTIONS, END_LINES, END_PANEL, COVER_CAPTION, PILL, cameraAt, pinAt, pillAt, figuresAt, lineFlashAt, jetsAt, JET,
  lightAt, type V3,
} from './lib/life001.ts';
import { Board, Caption, PredictHeader, Theme, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { COL, rng, SudanBlock, Palm } from './sudanBlock.tsx';

const C = { soil: '#7b5a3e', soilDark: '#5e432d', grass: '#79a858', grass2: '#6b9a4c', stripeA: '#82b65e', stripeB: '#73a651',
  hill: '#6f9550', hillDark: '#5c7f41', road: '#d8c9a6', sand: '#e2d3a8', water: '#3d8fc4', tree: ['#3f7a35', '#4d8a3c', '#5a9442'],
  trunk: '#6b5a45', navy: '#1f2a4a', belt: '#f4f1ea', skin: '#7d5238', jet: '#5f6873', sail: '#fbfaf5', hull: '#f2efe8' };

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
  const sun = new THREE.Color('#fff1d6').lerp(new THREE.Color('#ff7a2e'), l.warm);
  return <>
    <hemisphereLight args={[new THREE.Color('#d6e6ff').lerp(new THREE.Color('#ffb98a'), 0.6 * l.warm), '#6b5a3a', 1.1 - 0.55 * l.warm]} />
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
function Trees() {
  const { canopy, trunks } = useMemo(() => {
    const r = rng(41), canopy: { p: V3; s: number; c: string }[] = [];
    while (canopy.length < 150) {
      const x = BASE.x0 + 12 + r() * (BASE.x1 - BASE.x0 - 24), z = BASE.z0 + 12 + r() * (BASE.z1 - BASE.z0 - 24);
      const lake = ((x - LAKE.x) / (LAKE.rx + 10)) ** 2 + ((z - LAKE.z) / (LAKE.rz + 10)) ** 2 < 1;
      const busy = inside(x, z, GROUND.x0 - 12, GROUND.x1 + 12, GROUND.z0 - 40, GROUND.z1 + 12) || lake
        || BUILDINGS.some(b => inside(x, z, b.x - b.w / 2 - 6, b.x + b.w / 2 + 6, b.z - b.d / 2 - 6, b.z + b.d / 2 + 6))
        || HILLS.some(h => Math.hypot(x - h.x, z - h.z) < h.r * 0.75);
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
    <Trees />
    <group position={[SUDAN.x, 0, SUDAN.z]}><SudanBlock glow={glow} /></group>
    {palms.map((p, i) => <Palm key={i} {...p} />)}
  </group>;
}

// ---- moving things -------------------------------------------------------------------------------------------------------
function Boats({ t }: { t: number }) {
  const boats = [0, 1, 2, 3, 4].map(k => {
    const a = 0.9 * k + 0.09 * t * (k % 2 ? 1 : -1), rr = 0.35 + 0.12 * (k % 3);
    const x = LAKE.x + LAKE.rx * rr * Math.cos(a), z = LAKE.z + LAKE.rz * rr * 1.2 * Math.sin(a);
    const heading = Math.atan2(-LAKE.rx * Math.sin(a), LAKE.rz * 1.2 * Math.cos(a)) + (k % 2 ? 0 : Math.PI);
    return { x, z, heading, rock: 0.05 * Math.sin(2.1 * t + k) };
  });
  const sail = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 9); s.lineTo(4.6, 0.6); s.closePath(); return new THREE.ShapeGeometry(s); }, []);
  return <>{boats.map((b, i) => <group key={i} position={[b.x, 0.5, b.z]} rotation={[0, b.heading, b.rock]}>
    <mesh scale={[1.3, 0.7, 3.4]} castShadow><sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color={C.hull} roughness={0.5} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 5, 0.6]} castShadow><cylinderGeometry args={[0.12, 0.12, 10, 6]} /><meshStandardMaterial color="#8a7a63" /></mesh>
    <mesh geometry={sail} position={[0, 0.8, 0.6]} rotation={[0, -Math.PI / 2 + 0.35, 0]} castShadow><meshStandardMaterial color={i === 2 ? '#e9663a' : C.sail} roughness={0.7} side={THREE.DoubleSide} /></mesh>
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
function Cadets({ t }: { t: number }) {
  const max = 8 * 30;
  const { body, belt, head, cap } = useMemo(() => {
    const mk = (g: THREE.BufferGeometry, color: string) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), max); m.castShadow = true; m.frustumCulled = false; return m; };
    return { body: mk(new THREE.CapsuleGeometry(0.42, 1.5, 4, 10), C.navy), belt: mk(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 10), C.belt),
      head: mk(new THREE.SphereGeometry(0.3, 10, 8), C.skin), cap: mk(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 10), C.navy) };
  }, []);
  const fs = figuresAt(t);
  const put = (m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, tilt = 0) => {
    _q.setFromEuler(new THREE.Euler(tilt, 0, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(1, 1, 1)); m.setMatrixAt(i, _m);
  };
  fs.forEach((f, i) => {
    const bob = 0.12 * Math.abs(f.step), tilt = 0.06 * f.step;
    put(body, i, f.x, f.y + 1.2 + bob, f.z, tilt); put(belt, i, f.x, f.y + 1.25 + bob, f.z);
    put(head, i, f.x, f.y + 2.5 + bob, f.z); put(cap, i, f.x, f.y + 2.78 + bob, f.z);
  });
  for (const m of [body, belt, head, cap]) { m.count = fs.length; m.instanceMatrix.needsUpdate = true; }
  return <><primitive object={body} /><primitive object={belt} /><primitive object={head} /><primitive object={cap} /></>;
}
function AntimPag({ t }: { t: number }) {
  if (t < ANSWER_AT - 0.2) return null;
  const f = lineFlashAt(t), a = prog(t, ANSWER_AT - 0.2, 0.4);
  return <mesh position={[0, 0.18, LINE.z]}>
    <boxGeometry args={[2 * LINE.half, 0.12, 0.9]} />
    <meshStandardMaterial color="#e2b23a" emissive="#ffcc55" emissiveIntensity={0.35 + 2.2 * f} metalness={0.5} roughness={0.35} transparent opacity={a} />
  </mesh>;
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
    return <group key={i} position={j.pos} rotation={[0, yaw, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[1.1, 0.9, JET.len, 14]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>
      <mesh position={[0, 0, JET.len / 2 + 2.4]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[1.1, 4.8, 14]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>
      <mesh geometry={wing} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -2]} castShadow><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} side={THREE.DoubleSide} /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[s * 1.6, 2.6, -JET.len / 2 + 3]} rotation={[0, 0, s * 0.25]}><boxGeometry args={[0.3, 4.6, 4.2]} /><meshStandardMaterial color={C.jet} metalness={0.5} roughness={0.45} /></mesh>)}
      <mesh position={[0, 0.6, 7]}><sphereGeometry args={[1.0, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#1c2a3a" metalness={0.8} roughness={0.15} /></mesh>
    </group>;
  })}</>;
}

function Scene({ t }: { t: number }) {
  return <>
    <CameraRig t={t} />
    <Light t={t} />
    <Model glow={lightAt(t).glow} />
    <Boats t={t} />
    <Birds t={t} />
    <Cadets t={t} />
    <AntimPag t={t} />
    <Jets t={t} />
  </>;
}

// ---- words over the picture ----------------------------------------------------------------------------------------------
function Pins({ t }: { t: number }) {
  const ps = PINS.map((_, i) => pinAt(i, t)).filter(p => p.alpha > 0.01).sort((a, b) => b.depth - a.depth);
  return <>{ps.map(p => {
    const fill = p.state === 'crossed' ? '#9aa3ad' : p.color, d = 2 * PIN.r;
    return <div key={p.letter} style={{ position: 'absolute', left: p.x - PIN.r, top: p.y - d - PIN.tip, width: d, height: d + PIN.tip, opacity: p.alpha }}>
      <div style={{ position: 'absolute', left: PIN.r - 13, top: d - 6, width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: `${PIN.tip + 6}px solid ${fill}` }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, borderRadius: '50%', background: fill, border: '4px solid #fff', boxSizing: 'border-box',
        boxShadow: p.state === 'right' ? `0 0 0 8px ${tint(p.color, 0.35)}, 0 8px 22px ${tint(P.ink, 0.35)}` : `0 8px 20px ${tint(P.ink, 0.3)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 34px ${SOFT_UI}`, color: '#fff' }}>{p.letter}</div>
      {p.mark && <div style={{ position: 'absolute', left: d - 18, top: -14, width: 36, height: 36, borderRadius: 18, background: '#fff', boxShadow: `0 3px 10px ${tint(P.ink, 0.3)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 26px ${SOFT_UI}`, color: p.state === 'right' ? P.green : '#c2410c' }}>{p.mark}</div>}
    </div>;
  })}</>;
}
function Pill({ t }: { t: number }) {
  const p = pillAt(t);
  if (!p) return null;
  const a = Math.min(prog(t, p.t0, 0.2), 1 - prog(t, p.t1 - 0.2, 0.2)), pin = PINS['ABC'.indexOf(p.text[0])];
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: PILL.y - 36, height: 72, display: 'flex', justifyContent: 'center', opacity: a }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 32px', height: 72, borderRadius: 36, background: '#fff', boxShadow: `0 10px 30px ${tint(P.ink, 0.16)}`,
      font: `700 ${PILL.size}px ${SOFT_UI}`, color: P.ink }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: pin.color }} />{p.text}
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
        {!cover && <PredictHeader t={t} label={'NDA LIFE  ·  THE CAMPUS'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT}
          size={54} chipW={300} crossed={CROSSED} />}
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.1 }),
          // evening: only the picture warms as the light goes low (a tint over the band would colour the board too)
          filter: `sepia(${0.35 * warm}) saturate(${1 + 0.35 * warm})` }}>
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
