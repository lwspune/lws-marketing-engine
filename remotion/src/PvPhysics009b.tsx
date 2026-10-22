// @pyqvault_ · Physics, visualised #9, rebuilt (2026-10-22, framework v1.26): a car in your wing mirror looks far. Is it?
// Closer. Dark board, like the first version, so the two compare on the framework alone. The wing mirror is seen from the
// driver's seat; inside each glass, a real 3D road seen from the eye's mirror image, flipped as a mirror flips it, as wide
// as the law of reflection says (lib/pp009b.ts). From frame 0 the flat glass bulges and the blue car in it shrinks
// ("You'd think" + Morph, F25). Below, a top-down map: an outline car where the car seems to be, judged by its size, and
// at the answer the real car, much nearer. Then "So why curve it at all?": the mirror splits into flat and curved and a
// motorbike rides into the blind spot that only the curved glass shows (F26). It loops into frame 0 (F27). Silent + voiced.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  GLASS, EYE, LANE_Y, LABEL, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, LOOP_AT, COVER_T, CAPTIONS, WARNING, BAND, MAP, COLOURS,
  carPos, bikeAt, ghostAt, realAt, viewWedge, wedgesAlpha, warnAlpha, glassCamera, mirrorsAt, mainCameraAt, split, mapPx,
  MAP_SCALE, type V2, type V3,
} from './lib/pp009b.ts';
import { Board, Caption, PredictHeader, Theme, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const C = COLOURS;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const W3 = (p: V2, h = 0): V3 => [p[1], h, p[0]];           // map (x back, y out) + height → three.js (y, h, x)

// ---- the road seen in a glass ----
function GlassRig({ k }: { k: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = glassCamera(k);
  cam.position.set(...c.position); cam.up.set(0, 1, 0); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 0.1; cam.far = 400;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A car facing us (driving towards −x), its nose at the front: body, cabin, dark glass, headlights, tyres. */
function Car({ at, color }: { at: V2; color: string }) {
  return (
    <group position={W3(at)}>
      <mesh position={[0, 0.62, 0]}><RoundBox size={[1.8, 0.66, 4.4]} radius={0.22} /><meshStandardMaterial color={color} roughness={0.5} envMapIntensity={0.35} /></mesh>
      <mesh position={[0, 1.17, 0.35]}><RoundBox size={[1.58, 0.56, 2.3]} radius={0.2} /><meshStandardMaterial color={color} roughness={0.5} envMapIntensity={0.35} /></mesh>
      <mesh position={[0, 1.16, 0.35]}><RoundBox size={[1.62, 0.36, 2.34]} radius={0.14} /><meshStandardMaterial color={C.window} roughness={0.35} metalness={0.1} envMapIntensity={0.25} /></mesh>
      {[-0.62, 0.62].map(x => <mesh key={x} position={[x, 0.66, -2.2]}><sphereGeometry args={[0.13, 16, 16]} /><meshBasicMaterial color="#fff6d8" toneMapped={false} /></mesh>)}
      {[-1.4, 1.4].map(z => [-0.86, 0.86].map(x => (
        <mesh key={`${x}${z}`} position={[x, 0.33, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.33, 0.33, 0.24, 24]} /><meshStandardMaterial color={C.tyre} roughness={0.8} /></mesh>
      )))}
    </group>
  );
}

function Bike({ at, alpha }: { at: V2; alpha: number }) {
  if (alpha <= 0.01) return null;
  const m = (color: string) => <meshStandardMaterial color={color} roughness={0.4} transparent={alpha < 1} opacity={alpha} />;
  return (
    <group position={W3(at)}>
      {[-0.68, 0.68].map(z => <mesh key={z} position={[0, 0.32, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 0.12, 24]} />{m(C.tyre)}</mesh>)}
      <mesh position={[0, 0.62, 0]}><RoundBox size={[0.34, 0.42, 1.5]} radius={0.12} />{m(C.bike)}</mesh>
      <mesh position={[0, 1.15, 0.15]}><RoundBox size={[0.46, 0.66, 0.36]} radius={0.15} />{m('#2b3140')}</mesh>
      <mesh position={[0, 1.62, 0.1]}><sphereGeometry args={[0.2, 20, 20]} />{m(C.bike)}</mesh>
      <mesh position={[0, 0.8, -0.78]}><sphereGeometry args={[0.1, 14, 14]} /><meshBasicMaterial color="#fff6d8" toneMapped={false} transparent opacity={alpha} /></mesh>
    </group>
  );
}

const ROAD = { from: -6, to: 220, inner: LANE_Y - 1.75 - 3.5, outer: LANE_Y + 1.75 };
function Road() {
  const len = ROAD.to - ROAD.from, mid = (ROAD.from + ROAD.to) / 2, w = ROAD.outer - ROAD.inner;
  const line = (y: number, dash: boolean) => dash
    ? Array.from({ length: Math.floor(len / 9) }, (_, i) => (
      <mesh key={i} position={W3([ROAD.from + i * 9 + 1.5, y], 0.012)}><RoundBox size={[0.14, 0.01, 3]} radius={0.004} /><meshBasicMaterial color={C.line} /></mesh>))
    : <mesh position={W3([mid, y], 0.012)}><RoundBox size={[0.14, 0.01, len]} radius={0.004} /><meshBasicMaterial color={C.line} /></mesh>;
  return (
    <group>
      <mesh position={[0, -0.02, mid]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, len + 40]} /><meshStandardMaterial color={C.grass} roughness={1} /></mesh>
      <mesh position={W3([mid, (ROAD.inner + ROAD.outer) / 2], 0)} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[w, len]} /><meshStandardMaterial color={C.asphalt} roughness={0.95} /></mesh>
      {line(ROAD.inner + 0.15, false)}{line(ROAD.outer - 0.15, false)}{line(LANE_Y - 1.75, true)}
      {/* roadside posts every 10 m and a tree line: things of known size along the road, as on a real one */}
      {Array.from({ length: 22 }, (_, i) => [ROAD.outer + 1.2, ROAD.inner - 1.2].map(y => (
        <mesh key={`${i}${y}`} position={W3([i * 10 + 4, y], 0.5)}><cylinderGeometry args={[0.06, 0.06, 1, 10]} /><meshStandardMaterial color={C.pole} /></mesh>)))}
      {Array.from({ length: 30 }, (_, i) => [ROAD.outer + 7 + (i % 3), ROAD.inner - 7 - (i % 2) * 2].map(y => (
        <mesh key={`t${i}${y}`} position={W3([i * 8 + 6, y], 2.4)}><sphereGeometry args={[2.2, 18, 14]} /><meshStandardMaterial color="#3f8f3b" roughness={0.9} /></mesh>)))}
    </group>
  );
}

/** Our own car's flank (the curved glass catches a sliver of it at its inner edge, as a real one does). */
function OwnCar() {
  return <mesh position={W3([0.85, -1.075], 0.72)}><RoundBox size={[1.75, 1.44, 4.5]} radius={0.25} /><meshStandardMaterial color={C.ownCar} roughness={0.35} metalness={0.25} /></mesh>;
}

function GlassScene({ t, k }: { t: number; k: number }) {
  const b = bikeAt(t);
  return (
    <>
      <GlassRig k={k} />
      <color attach="background" args={[C.sky]} />
      <fog attach="fog" args={[C.sky, 60, 220]} />
      <RealLight env={0.4} key={1.1} at={[-20, 40, 30]} span={60} />
      <ambientLight intensity={0.55} />
      <Road />
      <OwnCar />
      <Car at={carPos(t)} color={C.car} />
      <Bike at={b.pos} alpha={b.alpha} />
    </>
  );
}

// The picture inside one glass: rendered at a fixed size, scaled onto the glass, flipped left–right as a mirror does.
const GW = 600, GH = Math.round((GW * GLASS.h) / GLASS.w);
function GlassView({ t, m }: { t: number; m: ReturnType<typeof mirrorsAt>[number] }) {
  if (m.alpha <= 0.01) return null;
  const s = m.w / GW, r = GH * 0.22, warn = m.k > 0.99 ? warnAlpha(t) : 0;
  return (
    <div style={{ position: 'absolute', left: m.x, top: m.y, width: GW, height: GH, transform: `scale(${s})`, transformOrigin: '0 0',
      borderRadius: r, overflow: 'hidden', opacity: m.alpha, boxShadow: '0 0 0 3px #0b0f15' }}>
      <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>
        <ThreeCanvas width={GW} height={GH} gl={{ antialias: true }}><GlassScene t={t} k={m.k} /></ThreeCanvas>
      </div>
      {/* The glass itself: a straight sheen on flat glass; a round highlight and darker rim as it bulges. */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 60% at 32% 26%, rgba(255,255,255,${0.32 * m.k}), rgba(255,255,255,0) 60%),
          linear-gradient(118deg, rgba(255,255,255,0) 34%, rgba(255,255,255,${0.2 * (1 - m.k)}) 40%, rgba(255,255,255,0) 47%)`,
        boxShadow: `inset 0 0 ${18 + 50 * m.k}px rgba(0,0,0,${0.15 + 0.35 * m.k})` }} />
      {warn > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 0 16px', textAlign: 'center', opacity: warn, whiteSpace: 'nowrap',
          background: 'rgba(8, 11, 16, 0.62)', font: `800 38px/46px ${SOFT_UI}`, color: '#ffffff', letterSpacing: 0.5 }}>
          {WARNING.map(l => <div key={l}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

// ---- the wing mirror(s), from the driver's seat ----
function MainRig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = mainCameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}
function Housing({ cx, alpha, back }: { cx: number; alpha: number; back: number }) {
  if (alpha <= 0.01) return null;
  const mat = <meshStandardMaterial color={C.ownCar} roughness={0.32} metalness={0.2} transparent={alpha < 1} opacity={alpha} />;
  return (
    <group position={[cx, 0, -back]}>
      <mesh position={[0, 0, -0.05]}><RoundBox size={[GLASS.w + 0.05, GLASS.h + 0.045, 0.1]} radius={0.035} />{mat}</mesh>
      <mesh position={[0, 0, -0.004]}><RoundBox size={[GLASS.w + 0.008, GLASS.h + 0.008, 0.01]} radius={0.026} /><meshStandardMaterial color="#0b0f15" roughness={0.6} /></mesh>
      <mesh position={[-0.055, -0.11, -0.08]}><RoundBox size={[0.04, 0.07, 0.04]} radius={0.015} />{mat}</mesh>
    </group>
  );
}
function MainScene({ t }: { t: number }) {
  const [flat, curved] = mirrorsAt(t);
  return (
    <>
      <MainRig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.6} at={[-1, 2, 2]} span={1} />
      <ambientLight intensity={0.4} />
      <Housing cx={flat.cx} alpha={flat.alpha} back={0.02} />
      <Housing cx={curved.cx} alpha={curved.alpha} back={0} />
      {/* The door's top edge and the window's rubber seal: the mirror is on a car. */}
      <mesh position={[0, -0.16, -0.1]}><RoundBox size={[1.4, 0.045, 0.08]} radius={0.02} /><meshStandardMaterial color={C.ownCar} roughness={0.32} /></mesh>
      <mesh position={[0, -0.13, -0.11]}><RoundBox size={[1.4, 0.016, 0.03]} radius={0.007} /><meshStandardMaterial color="#0b0f15" roughness={0.7} /></mesh>
    </>
  );
}

// Above each glass once split: a flat line or an arc, the glass's shape seen from above (a picture, not a word).
function ShapeMarks({ t }: { t: number }) {
  const a = prog(t, ANSWER_AT + 1.6, 0.4) * split(t);
  if (a <= 0.01) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {mirrorsAt(t).map(m => {
        const cx = m.x + m.w / 2, y = m.y - 46, half = m.w * 0.28;
        return m.k > 0.5
          ? <path key="c" d={`M ${cx - half} ${y + 12} Q ${cx} ${y - 22} ${cx + half} ${y + 12}`} fill="none" stroke={C.curved} strokeWidth={7} strokeLinecap="round" opacity={a} />
          : <line key="f" x1={cx - half} y1={y} x2={cx + half} y2={y} stroke={C.flat} strokeWidth={7} strokeLinecap="round" opacity={a} />;
      })}
    </svg>
  );
}

// ---- the map: top-down, our car on the left, the road behind us to the right ----
function TopCar({ at, color, dashed = false, alpha, scale = 1 }: { at: V2; color: string; dashed?: boolean; alpha: number; scale?: number }) {
  if (alpha <= 0.01) return null;
  const p = mapPx(at), L = 4.4 * MAP_SCALE * scale, Wd = 1.8 * MAP_SCALE * scale;
  return (
    <g opacity={alpha} transform={`translate(${p.x} ${p.y})`}>
      {dashed
        ? <rect x={-L / 2} y={-Wd / 2} width={L} height={Wd} rx={Wd * 0.35} fill="none" stroke={color} strokeWidth={4} strokeDasharray="9 7" />
        : <>
          <rect x={-L / 2} y={-Wd / 2} width={L} height={Wd} rx={Wd * 0.35} fill={color} />
          <rect x={-L * 0.22} y={-Wd * 0.36} width={L * 0.18} height={Wd * 0.72} rx={Wd * 0.15} fill={C.window} />
        </>}
    </g>
  );
}
function MapCard({ t }: { t: number }) {
  const g = ghostAt(t), r = realAt(t), b = bikeAt(t), wa = wedgesAlpha(t);
  const road = (y: number) => mapPx([0, y]).y, x0 = mapPx([MAP.x0, 0]).x, x1 = mapPx([MAP.x1, 0]).x;
  const drop = 1 + 0.6 * (1 - prog(t, ANSWER_AT, 0.3));
  const label = (p: V2, s: string, color: string, alpha: number, weight = 700) => {
    const q = mapPx(p);
    return <text x={q.x} y={q.y - 30} textAnchor="middle" opacity={alpha} fill={color} style={{ font: `${weight} 34px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' }}>{s}</text>;
  };
  const wedge = (k: number) => {
    const w = viewWedge(k), far = (e: (typeof w.edges)[number]) => [e.M[0] + e.r[0] * 80, e.M[1] + e.r[1] * 80] as V2;
    const pts = [w.edges[0].M, far(w.edges[0]), far(w.edges[1]), w.edges[1].M].map(mapPx).map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
    return k > 0.5
      ? <polygon key="c" points={pts} fill={C.curved} fillOpacity={0.2} stroke={C.curved} strokeWidth={4} opacity={wa} />
      : <polygon key="f" points={pts} fill={C.flat} fillOpacity={0.06} stroke={C.flat} strokeWidth={3} strokeDasharray="10 9" opacity={wa} />;
  };
  const arrow = prog(t, ANSWER_AT + 0.35, 0.4) * r.alpha, gq = mapPx(g.pos), rq = mapPx(r.pos);
  const eye = mapPx(EYE), pole = mapPx([0, 0]);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><clipPath id="card"><rect x={60} y={MAP.top} width={960} height={MAP.bottom - MAP.top} rx={44} /></clipPath></defs>
      <rect x={60} y={MAP.top} width={960} height={MAP.bottom - MAP.top} rx={44} fill={P.card} />
      <g clipPath="url(#card)">
        <rect x={x0 - 40} y={road(ROAD.outer)} width={x1 - x0 + 80} height={road(ROAD.inner) - road(ROAD.outer)} fill={C.asphalt} />
        {[ROAD.inner + 0.15, ROAD.outer - 0.15].map(y => <line key={y} x1={x0 - 40} y1={road(y)} x2={x1 + 40} y2={road(y)} stroke={C.line} strokeWidth={2} opacity={0.8} />)}
        <line x1={x0 - 40} y1={road(LANE_Y - 1.75)} x2={x1 + 40} y2={road(LANE_Y - 1.75)} stroke={C.line} strokeWidth={2} strokeDasharray="22 26" opacity={0.8} />
        {wedge(0)}{wedge(1)}
        <TopCar at={[0.85, -1.075]} color={C.ownCar} alpha={1} />
        <circle cx={pole.x} cy={pole.y} r={7} fill={C.ownCar} stroke="#ffffff" strokeWidth={2} />
        <circle cx={eye.x} cy={eye.y} r={6} fill="#ffffff" />
        <TopCar at={g.pos} color={C.car} dashed alpha={g.alpha} />
        {label(g.pos, `${Math.round(g.metres)} m`, C.car, g.alpha, 600)}
        {arrow > 0.01 && <line x1={gq.x - 50} y1={gq.y} x2={rq.x + 52} y2={rq.y} stroke={P.ink} strokeWidth={4} strokeDasharray="10 8" opacity={arrow} markerEnd="url(#tip)" />}
        <defs><marker id="tip" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={P.ink} /></marker></defs>
        <TopCar at={r.pos} color={C.car} alpha={r.alpha} scale={drop} />
        {label(r.pos, `${Math.round(r.metres)} m`, P.ink, r.alpha)}
        {b.alpha > 0.01 && (() => { const q = mapPx(b.pos), L = 2.0 * MAP_SCALE, Wd = 0.7 * MAP_SCALE;
          return <rect x={q.x - L / 2} y={q.y - Wd / 2} width={L} height={Wd} rx={Wd / 2} fill={C.bike} opacity={b.alpha} />; })()}
      </g>
    </svg>
  );
}

export function PvPhysics009b({ cover = false, voice = false }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={LABEL} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={60} chipW={230}
          brand={BRAND} until={LOOP_AT} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.06, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><MainScene t={t} /></ThreeCanvas>
        </div>
        {mirrorsAt(t).map((m, i) => <GlassView key={i} t={t} m={m} />)}
        <ShapeMarks t={t} />
        <MapCard t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-physics-009b-wing-mirror-voice-mix.wav' : 'pv-physics-009b-wing-mirror-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
