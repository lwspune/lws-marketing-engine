// @lws.pune · reel 025 v2 (3D, predict-first, F32–F33): 256 balls, 8 rows of pegs; which bin fills most? A real 3D
// Galton board on the white look: a wood frame, steel pegs that flash when hit, a glass front, glossy blue marbles in
// five lanes. A tilted orbit opens (F22) while the rain starts; the balls bounce down the pegs and the Rapier physics
// engine piles them in the bins (played back from public/nda-maths-025-physics.json, `npm run simulate:025`). Then an
// "all equal" sheet, one orange tube to the edge, 70 green tubes to the middle, Pascal's numbers, glass columns at the
// expected heights, and one orange ball as coin tosses with a ride-along camera. Timeline: lib/reel025.ts.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, REAL, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, ROWS, BALLS, COIN_BALL, R, PEG_R, WALL_TOP, GLASS_Z, BACK_Z,
  FRAME_TOP, FRAME_X, SPAWN_Y, FUNNEL_TOP, BAND, EXPECTED_AT, EDGE_PATH, MIDDLE_PATHS, EDGE, TUBES_OUT, SHEET, SHEET_OUT,
  COLUMNS, ballAt, ballDim, pegFlash, pegX, pegY, binX, pathPoints, webPathAt, cameraAt, labelsAt, labelBox,
  heightFor, sheetYFor, type RunInfo, type V3,
} from './lib/reel025.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RealLight } from './realism.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

type Phys = RunInfo & { start: number[]; frames: number[][] };
const COVER = { text: 'Middle, edges or all equal?', y: 1590, size: 60 };
const DEPTH = GLASS_Z - BACK_Z, WOOD = REAL.white.wood, STEEL = REAL.white.steel, GLASS = REAL.white.glass;

/** Ball i's position at t: its flight above the bins, then the physics run's, held once it rests. */
function ballPos(i: number, t: number, phys: Phys): { p: V3; squash: number; flying: boolean } | null {
  const b = i < BALLS.length ? BALLS[i] : COIN_BALL, a = ballAt(b, t);
  if (a) return { p: [a.x, a.y, a.z], squash: a.squash, flying: true };
  if (t < b.release) return null;
  const f = Math.round(t * 30), s = phys.start[i], fr = phys.frames[i];
  if (s < 0 || f < s || !fr.length) return { p: [b.hand.x, b.hand.y, b.z], squash: 1, flying: false };
  const k = Math.min(f - s, fr.length / 3 - 1);
  return { p: [fr[3 * k], fr[3 * k + 1], fr[3 * k + 2]], squash: 1, flying: false };
}

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

function Frame() {
  const bar = (x: number, y: number, w: number, h: number) => (
    <mesh position={[x, y, 0]} castShadow receiveShadow><RoundBox size={[w, h, DEPTH + 0.24]} radius={0.06} />
      <meshStandardMaterial color={WOOD.fill} roughness={0.55} /></mesh>);
  const funnel = (s: number) => {
    const x0 = s * 1.3, y0 = FUNNEL_TOP, x1 = s * (R + 0.08), y1 = SPAWN_Y - 0.12, len = Math.hypot(x1 - x0, y1 - y0);
    return <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, Math.atan2(y1 - y0, x1 - x0)]} castShadow>
      <RoundBox size={[len, 0.08, DEPTH]} radius={0.03} /><meshStandardMaterial color={WOOD.fill} roughness={0.55} /></mesh>;
  };
  return (
    <>
      {/* glass on both faces, so the orbit's back view still shows the pegs and the balls */}
      <mesh position={[0, (FRAME_TOP - 0.2) / 2, BACK_Z - 0.01]}>
        <boxGeometry args={[2 * FRAME_X - 0.4, FRAME_TOP - 0.2, 0.02]} />
        <meshPhysicalMaterial color={GLASS.fill} transparent opacity={0.14} roughness={0.05} metalness={0} clearcoat={1} depthWrite={false} />
      </mesh>
      {bar(-FRAME_X + 0.1, (FRAME_TOP - 0.2) / 2, 0.2, FRAME_TOP + 0.2)}{bar(FRAME_X - 0.1, (FRAME_TOP - 0.2) / 2, 0.2, FRAME_TOP + 0.2)}
      {bar(0, -0.1, 2 * FRAME_X, 0.2)}{bar(0, FRAME_TOP - 0.1, 2 * FRAME_X, 0.2)}
      {funnel(-1)}{funnel(1)}
      {Array.from({ length: ROWS + 2 }, (_, i) => binX(i) - 0.5).map(x => (
        <mesh key={x} position={[x, WALL_TOP / 2, 0]} castShadow receiveShadow><RoundBox size={[0.04, WALL_TOP, DEPTH]} radius={0.015} />
          <meshStandardMaterial color={STEEL.fill} metalness={0.7} roughness={0.3} /></mesh>))}
      <mesh position={[0, (FRAME_TOP - 0.2) / 2, GLASS_Z + 0.01]}>
        <boxGeometry args={[2 * FRAME_X - 0.4, FRAME_TOP - 0.2, 0.02]} />
        <meshPhysicalMaterial color={GLASS.fill} transparent opacity={0.1} roughness={0.05} metalness={0} clearcoat={1} depthWrite={false} />
      </mesh>
    </>
  );
}

function Pegs({ t }: { t: number }) {
  return <>{Array.from({ length: ROWS }, (_, r) => Array.from({ length: r + 1 }, (_, j) => {
    const f = pegFlash(r, j, t);
    return <mesh key={`${r}-${j}`} position={[pegX(r, j), pegY(r), 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + 0.03 * f} castShadow>
      <cylinderGeometry args={[PEG_R, PEG_R, DEPTH, 20]} />
      <meshStandardMaterial color={STEEL.edge} metalness={0.6} roughness={0.3} emissive="#ffffff" emissiveIntensity={0.9 * f} />
    </mesh>;
  }))}</>;
}

const GHOSTS = [{ k: 1, a: 0.3, s: 0.92 }, { k: 2, a: 0.18, s: 0.84 }, { k: 3, a: 0.08, s: 0.76 }];
function Balls({ t, phys }: { t: number; phys: Phys }) {
  const main = useRef<THREE.InstancedMesh>(null), ghosts = useRef<(THREE.InstancedMesh | null)[]>([]);
  const geo = useMemo(() => new THREE.SphereGeometry(R, 28, 20), []);
  const dim = ballDim(t), color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {                                     // before the frame is drawn (runbook: instanced meshes)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
    if (!main.current) return;
    for (let i = 0; i < BALLS.length; i++) {
      const b = ballPos(i, t, phys);
      if (!b) { main.current.setMatrixAt(i, hide); ghosts.current.forEach(g => g?.setMatrixAt(i, hide)); continue; }
      const w = 1 + (1 - b.squash) * 0.8;
      main.current.setMatrixAt(i, m.compose(v.set(...b.p), q, s.set(w, b.squash, w)));
      GHOSTS.forEach((g, n) => {
        const mesh = ghosts.current[n]; if (!mesh) return;
        const p = b.flying ? ballAt(BALLS[i], t - g.k / 30) : null;
        mesh.setMatrixAt(i, p ? m.compose(v.set(p.x, p.y, p.z), q, s.setScalar(g.s)) : hide);
      });
    }
    main.current.instanceMatrix.needsUpdate = true;
    ghosts.current.forEach(g => { if (g) g.instanceMatrix.needsUpdate = true; });
  }, [t, phys]);
  color.set(COLORS.ball).lerp(new THREE.Color(P.board), 1 - dim);
  return (
    <>
      <instancedMesh ref={main} args={[geo, undefined, BALLS.length]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.14} metalness={0.05} envMapIntensity={1.2} />
      </instancedMesh>
      {GHOSTS.map((g, n) => (
        <instancedMesh key={n} ref={el => { ghosts.current[n] = el; }} args={[geo, undefined, BALLS.length]}>
          <meshBasicMaterial color={COLORS.ball} transparent opacity={g.a * dim} depthWrite={false} />
        </instancedMesh>))}
    </>
  );
}

function CoinBall({ t, phys }: { t: number; phys: Phys }) {
  const b = ballPos(BALLS.length, t, phys);
  if (!b || t > END_AT) return null;
  const w = 1 + (1 - b.squash) * 0.8;
  return <mesh position={b.p} scale={[w, b.squash, w]} castShadow>
    <sphereGeometry args={[R * 1.05, 32, 24]} /><meshStandardMaterial color={COLORS.edge} roughness={0.14} emissive={COLORS.edge} emissiveIntensity={0.15} />
  </mesh>;
}

/** A path as a tube that grows along its length (fraction p), with a bead of light at its head. */
function Tube({ pts, p, color, radius, opacity }: { pts: V3[]; p: number; color: string; radius: number; opacity: number }) {
  const { geo, curve, segs } = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < pts.length; i++) curve.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i - 1]), new THREE.Vector3(...pts[i])));
    const segs = 180;
    return { geo: new THREE.TubeGeometry(curve, segs, radius, 10, false), curve, segs };
  }, [pts, radius]);
  geo.setDrawRange(0, Math.floor(segs * Math.min(1, p)) * 10 * 6);
  const head = curve.getPointAt(Math.min(1, Math.max(0, p)));
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={opacity} depthWrite={false} /></mesh>
      {p > 0 && p < 1 && <mesh position={head}><sphereGeometry args={[radius * 2.2, 16, 12]} /><meshBasicMaterial color={color} /></mesh>}
    </>
  );
}

function Paths({ t }: { t: number }) {
  const edge = useMemo(() => pathPoints(EDGE_PATH), []), webs = useMemo(() => MIDDLE_PATHS.map(pathPoints), []);
  const fade = 1 - prog(t, TUBES_OUT, 0.4);
  if (t < EDGE.t || fade <= 0) return null;
  return (
    <>
      {webs.map((pts, i) => { const p = webPathAt(i, t); return p > 0 && <Tube key={i} pts={pts} p={p} color={COLORS.web} radius={0.036} opacity={0.45 * fade} />; })}
      <Tube pts={edge} p={prog(t, EDGE.t, EDGE.dur)} color={COLORS.edge} radius={0.045} opacity={0.95 * fade} />
    </>
  );
}

function SheetAndColumns({ t, phys }: { t: number; phys: Phys }) {
  const s = prog(t, SHEET.t, SHEET.dur) * (1 - prog(t, SHEET_OUT, 0.3)), c = prog(t, COLUMNS.t, COLUMNS.dur), y = sheetYFor(phys);
  return (
    <>
      {s > 0 && <mesh position={[(1 - prog(t, SHEET.t, SHEET.dur)) * 10, y, 0]}>
        <RoundBox size={[9, 0.05, DEPTH - 0.04]} radius={0.02} />
        <meshPhysicalMaterial color={P.muted} transparent opacity={0.4 * s} roughness={0.6} depthWrite={false} />
      </mesh>}
      {c > 0 && EXPECTED_AT.map((n, k) => {
        const h = heightFor(phys.fit, n) * c;
        return h > 0.01 && <mesh key={k} position={[binX(k), h / 2, 0]}>
          <RoundBox size={[0.9, h, DEPTH - 0.06]} radius={Math.min(0.05, h / 2 - 1e-3)} />
          <meshPhysicalMaterial color={COLORS.web} transparent opacity={0.2} roughness={0.15} depthWrite={false} />
        </mesh>;
      })}
    </>
  );
}

function Scene({ t, phys }: { t: number; phys: Phys }) {
  return (
    <>
      <CameraRig t={t} />
      <RealLight env={0.9} at={[-4, 10, 12]} span={8} />
      <Frame />
      <Pegs t={t} />
      <Balls t={t} phys={phys} />
      <CoinBall t={t} phys={phys} />
      <Paths t={t} />
      <SheetAndColumns t={t} phys={phys} />
    </>
  );
}

// Labels: HTML in Cambria on top of the canvas, placed with project() (the same perspective as three.js).
function Labels({ t, phys }: { t: number; phys: Phys }) {
  const cam = cameraAt(t);
  return <>{labelsAt(t, phys).filter(l => l.alpha > 0.01).map((l, i) => {
    const b = labelBox(l, cam), pill = l.role === 'peg' || l.role === 'tag' || l.role === 'readout';
    const color = l.role === 'count' || l.role === 'tag' ? P.muted : l.role === 'bin' ? COLORS.web : P.ink;
    return <div key={i} style={{ position: 'absolute', left: b.x0 - (pill ? 10 : 0), top: b.y0 - (pill ? 2 : 0), width: b.x1 - b.x0 + (pill ? 20 : 0),
      height: b.y1 - b.y0 + (pill ? 4 : 0), display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l.alpha,
      ...hand(l.size), fontWeight: l.role === 'bin' || l.role === 'coin' ? 800 : 600, color, whiteSpace: 'pre',
      background: pill ? tint('#ffffff', l.role === 'readout' ? 0.75 : 0.92) : undefined, borderRadius: 999,
      boxShadow: l.role === 'peg' ? `0 3px 8px ${tint(P.ink, 0.15)}` : undefined }}>{l.text}</div>;
  })}</>;
}

const END: EndLine[] = [
  { at: 0.3, size: 58, weight: 600, color: P.ink, text: 'Most paths,' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'most balls.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel025({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  const [phys, setPhys] = useState<Phys | null>(null), [handle] = useState(() => delayRender('physics data'));
  useEffect(() => {
    fetch(staticFile('nda-maths-025-physics.json')).then(r => r.json()).then((j: Phys) => { setPhys(j); continueRender(handle); });
  }, [handle]);
  if (!phys) return null;
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  PROBABILITY'} lines={['256 balls, 8 rows of pegs.', 'Which bin fills most?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={240} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.03, bottom: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
            <Scene t={t} phys={phys} />
          </ThreeCanvas>
        </div>
        <Labels t={t} phys={phys} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-025-galton-board-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
