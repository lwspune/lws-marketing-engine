// @pyqvault_ · Physics, visualised #9 (predict-first): a car in your wing mirror: closer or farther than it looks?
// Closer. Dark look (L22 rotation: physics alternates, #8 was white), bright objects from VIVID.lab (F24): a blue car
// driving in on an asphalt road, a red wing-mirror housing round real silver glass (a convex mirror). The 360° opening
// orbit (F22); five rays from the car's roof to the glass, each its own colour, reflecting back out as if from a small
// upright image behind the glass (dashed lines back to it). Below: magnification against distance, always under the
// flat mirror's ×1, and "what you see" from the driver's seat (flat vs wing mirror, computed from angular sizes). Then
// the eye's view off flat vs convex glass, and the warning printed on wing mirrors (lib/pp009.ts). Silent + voiced.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, VIVID, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, HEADER, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, F, R, POLE_X, APERTURE, U_START, T_RAYS, T_VIEW, T_WARN, COVER_T,
  BAND, EYE, uAt, wheelTurn, imageAt, rayPaths, raysDrawn, viewWedge, sizeVsFlat, magnification, cameraAt, project, type V2, type Ray,
} from './lib/pp009.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const V = VIVID.lab;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
// Bright objects (F24); real materials keep their look: silver glass, dark window glass, rubber tyres, asphalt.
const CAR = V.blue, HOUSING = V.red, GLASS = '#dfe3ea', WINDOW = '#1c2430', TYRE = '#15181d', ROAD = '#2a303a', LIGHT = V.yellow;
const RAYS = [V.cyan, V.pink, V.yellow, V.green, V.violet];

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A thin glowing tube from a to b in the z = 0 plane. */
function Seg({ a, b, r, color, opacity = 1 }: { a: V2; b: V2; r: number; color: string; opacity?: number }) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  if (len < 1e-4 || opacity <= 0) return null;
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
      <cylinderGeometry args={[r, r, len, 10]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
const lerp = (a: V2, b: V2, k: number): V2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const lenOf = ([a, b]: [V2, V2]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
function Dashed({ seg, r, color, opacity }: { seg: [V2, V2]; r: number; color: string; opacity: number }) {
  const L = lenOf(seg);
  return <>{Array.from({ length: Math.floor(L / 0.12) }, (_, i) =>
    <Seg key={i} a={lerp(seg[0], seg[1], (i * 0.12) / L)} b={lerp(seg[0], seg[1], Math.min(1, (i * 0.12 + 0.07) / L))} r={r} color={color} opacity={opacity} />)}</>;
}

// One ray: in to the glass, then back out; light dots run along it; a dashed line back to the image behind the glass.
function RayView({ ray, i, t, drawn }: { ray: Ray; i: number; t: number; drawn: number }) {
  const rule = ray.rule !== null, r = rule ? 0.015 : 0.01, col = RAYS[i];
  const kIn = Math.min(1, drawn * 2), kOut = Math.max(0, drawn * 2 - 1);
  const L1 = lenOf(ray.inc), L2 = lenOf(ray.out), reach = kIn * L1 + kOut * L2, dots: V2[] = [];
  for (let s = ((t - T_RAYS) * 1.6) % 0.5; s < reach; s += 0.5) dots.push(s < L1 ? lerp(ray.inc[0], ray.inc[1], s / L1) : lerp(ray.out[0], ray.out[1], (s - L1) / L2));
  return (
    <group>
      <Seg a={ray.inc[0]} b={lerp(ray.inc[0], ray.inc[1], kIn)} r={r} color={col} opacity={0.95} />
      {kOut > 0 && <Seg a={ray.out[0]} b={lerp(ray.out[0], ray.out[1], kOut)} r={r} color={col} opacity={0.95} />}
      {dots.map((d, k) => <mesh key={k} position={[d[0], d[1], 0]}><sphereGeometry args={[rule ? 0.03 : 0.024, 10, 10]} /><meshBasicMaterial color={col} toneMapped={false} /></mesh>)}
      {kOut >= 1 && <Dashed seg={ray.back} r={r * 0.8} color={col} opacity={0.45 + 0.4 * prog(t, ANSWER_AT, 0.5)} />}
    </group>
  );
}

// The car, facing the mirror: hood towards −x, the roof's front corner at the local origin's height H (the rays' point).
// Its image: the same car scaled by m and turned to face the glass (x flipped), half see-through.
function Car({ x, m = 1, t, ghost = 0 }: { x: number; m?: number; t: number; ghost?: number }) {
  const real = ghost === 0, op = real ? 1 : ghost, spin = wheelTurn(t);
  const mat = (color: string, extra = {}) => <meshStandardMaterial color={color} roughness={0.35} transparent={!real} opacity={op} depthWrite={real} {...extra} />;
  return (
    <group position={[x, 0, 0]} scale={[real ? 1 : -m, m, m]}>
      <mesh position={[0.15, 0.26, 0]}><RoundBox size={[0.9, 0.24, 0.44]} radius={0.08} />{mat(CAR, { metalness: 0.3 })}</mesh>
      <mesh position={[0.26, 0.45, 0]}><RoundBox size={[0.52, 0.2, 0.38]} radius={0.07} />{mat(CAR, { metalness: 0.3 })}</mesh>
      <mesh position={[0.26, 0.45, 0]}><RoundBox size={[0.54, 0.13, 0.39]} radius={0.05} />{mat(WINDOW, { metalness: 0.6, roughness: 0.15 })}</mesh>
      {[-0.3, 0.6].map(dx => [-0.2, 0.2].map(dz => (
        <group key={`${dx}${dz}`} position={[dx * 0.9 + 0.09, 0.1, dz]} rotation={[0, 0, real ? spin : 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />{mat(TYRE)}</mesh>
          <mesh position={[0, 0, dz > 0 ? 0.032 : -0.032]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.01, 6]} />{mat('#c9ced8')}</mesh>
        </group>
      )))}
      {[-0.13, 0.13].map(dz => <mesh key={dz} position={[-0.3, 0.27, dz]}><sphereGeometry args={[0.04, 14, 14]} /><meshBasicMaterial color={LIGHT} toneMapped={false} transparent opacity={op} /></mesh>)}
    </group>
  );
}

// The wing mirror: real silver glass, a convex cap of a sphere (radius R round C = pole − R), in a red housing on a stalk.
const CAP = Math.asin(APERTURE / R);
function WingMirror() {
  return (
    <group>
      <group position={[POLE_X - R, 0, 0]} scale={[1, 1, 1.35]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}><sphereGeometry args={[R, 72, 24, 0, 2 * Math.PI, 0, CAP]} />
          <meshStandardMaterial color={GLASS} metalness={1} roughness={0.06} side={THREE.DoubleSide} /></mesh>
      </group>
      <mesh position={[POLE_X - 0.2, 0, 0]}><RoundBox size={[0.2, 1.42, 1.86]} radius={0.09} /><meshStandardMaterial color={HOUSING} roughness={0.4} /></mesh>
      <mesh position={[POLE_X - 0.24, -0.5, -1.15]}><RoundBox size={[0.16, 0.16, 0.6]} radius={0.06} /><meshStandardMaterial color={HOUSING} roughness={0.4} /></mesh>
    </group>
  );
}

function Road() {
  return (
    <group>
      <mesh position={[POLE_X + 2.7, -0.03, 0]}><RoundBox size={[5.0, 0.05, 1.5]} radius={0.02} /><meshStandardMaterial color={ROAD} roughness={0.9} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[POLE_X + 0.55 + i * 0.55, 0.0, 0.55]}><boxGeometry args={[0.28, 0.006, 0.05]} /><meshBasicMaterial color="#e6ebf3" /></mesh>)}
    </group>
  );
}

function Eye({ t }: { t: number }) {
  const a = prog(t, T_VIEW, 0.4);
  if (a <= 0) return null;
  const gaze = Math.atan2(0 - EYE[1], POLE_X - EYE[0]);
  return (
    <group position={[EYE[0], EYE[1], 0]} scale={a}>
      <mesh><sphereGeometry args={[0.15, 32, 32]} /><meshStandardMaterial color="#ffffff" roughness={0.25} /></mesh>
      <mesh position={[0.13 * Math.cos(gaze), 0.13 * Math.sin(gaze), 0.02]} rotation={[0, 0, gaze - Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.04, 28]} /><meshStandardMaterial color={V.violet} roughness={0.3} /></mesh>
    </group>
  );
}

// The eye's view off the glass: lines to the glass's edges, then the reflected view out to the road. The convex glass's
// view is a filled green wedge; a flat mirror's the same size would show only the narrow dashed one.
function ViewWedges({ t }: { t: number }) {
  const a = prog(t, T_VIEW + 0.2, 0.6);
  if (a <= 0) return null;
  const L = 3.0, cv = viewWedge('convex'), fl = viewWedge('flat');
  const end = ([M, d]: [V2, V2]): V2 => [M[0] + d[0] * L, M[1] + d[1] * L];
  const shape = new THREE.Shape([cv.top[0], end(cv.top), end(cv.bottom), cv.bottom[0]].map(([x, y]) => new THREE.Vector2(x, y)));
  return (
    <group>
      <mesh position={[0, 0, -0.01]}><shapeGeometry args={[shape]} /><meshBasicMaterial color={V.green} transparent opacity={0.2 * a} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {[cv.top, cv.bottom].map(([M], k) => <Seg key={`e${k}`} a={EYE} b={M} r={0.008} color="#e6ebf3" opacity={0.5 * a} />)}
      {[cv.top, cv.bottom].map((e, k) => <Seg key={`c${k}`} a={e[0]} b={end(e)} r={0.014} color={V.green} opacity={a} />)}
      {[fl.top, fl.bottom].map((e, k) => <Dashed key={`f${k}`} seg={[e[0], end(e)]} r={0.009} color="#e6ebf3" opacity={0.7 * a} />)}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  const u = uAt(t), im = imageAt(t), drawn = raysDrawn(t);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.55} />
      <ambientLight intensity={0.35} />
      <Seg a={[-3.6, 0]} b={[3.6, 0]} r={0.006} color="#e6ebf3" opacity={0.3} />
      <mesh position={[POLE_X - F, 0, 0]} scale={prog(t, 2.8, 0.3)}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color={V.violet} /></mesh>
      <Road />
      <WingMirror />
      <Car x={POLE_X + u} t={t} />
      {im.alpha > 0 && <Car x={im.x} m={im.m} t={t} ghost={0.85 * im.alpha} />}
      {drawn > 0 && rayPaths(t).map((ray, i) => <RayView key={i} ray={ray} i={i} t={t} drawn={drawn} />)}
      <ViewWedges t={t} />
      <Eye t={t} />
    </>
  );
}

// Labels over the 3D band: F behind the glass; "wing mirror" and "flat mirror" at the view wedges' ends; "not to scale".
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t), a = prog(t, 2.8, 0.3), w = prog(t, T_VIEW + 0.4, 0.5), f = project([POLE_X - F, 0, 0], cam);
  const cv = viewWedge('convex'), fl = viewWedge('flat'), tip = ([M, d]: [V2, V2], L: number) => project([M[0] + d[0] * L, M[1] + d[1] * L, 0], cam);
  const txt = (x: number, y: number, s: string, color: string, op: number, size = 30) =>
    <text x={x} y={y} textAnchor="middle" fill={color} opacity={op} style={{ font: `600 ${size}px ${SOFT_UI}` }}>{s}</text>;
  // The wedges reach above the band: keep their labels inside it, clear of the answer chips.
  const inBand = (p: { x: number; y: number }) => ({ x: Math.min(BAND.width - 110, p.x), y: Math.max(BAND.top + 70, p.y) });
  const g = inBand(tip(cv.top, 0.9)), fm = inBand(tip(fl.top, 1.5));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <text x={f.x} y={f.y + 50} textAnchor="middle" fill={P.ink} opacity={a} style={{ ...hand(40) }}>F</text>
      {txt(g.x + 10, g.y - 18, 'wing mirror', V.green, w)}
      {txt(fm.x + 40, fm.y - 18, 'flat mirror', P.muted, w)}
      {txt(BAND.width - 120, BAND.top + 44, 'not to scale', P.muted, a * 0.8, 24)}
    </svg>
  );
}

function Readout({ t }: { t: number }) {
  const a = prog(t, T_RAYS + 0.8, 0.3);
  if (a <= 0) return null;
  const m = imageAt(t).m;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: BAND.top + BAND.height - 64, textAlign: 'center', opacity: a }}>
      <span style={{ background: P.card, borderRadius: 30, padding: '10px 30px', boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4)`,
        font: `600 34px ${SOFT_UI}`, color: P.ink, fontVariantNumeric: 'tabular-nums' }}>image ×{m.toFixed(2)}  upright, smaller</span>
    </div>
  );
}

// The bottom card. Left: m against distance (closer to the right), drawing as the car comes; the flat mirror's ×1 dashed
// above it, never reached. Right: what the driver sees, flat mirror vs wing mirror, sized by the angular-size ratio.
const G = { x0: 110, x1: 560, top: 1200, bottom: 1460, uMax: 3.8, mMax: 1.1 };
const gx = (u: number) => G.x0 + ((G.uMax - u) / G.uMax) * (G.x1 - G.x0), gy = (m: number) => G.bottom - (m / G.mMax) * (G.bottom - G.top);
function CarIcon({ cx, cy, w, color }: { cx: number; cy: number; w: number; color: string }) {
  const h = w * 0.62;
  return (
    <g transform={`translate(${cx - w / 2} ${cy - h / 2})`}>
      <rect x={0} y={h * 0.38} width={w} height={h * 0.42} rx={h * 0.14} fill={color} />
      <rect x={w * 0.16} y={0} width={w * 0.68} height={h * 0.5} rx={h * 0.14} fill={color} />
      <rect x={w * 0.24} y={h * 0.08} width={w * 0.52} height={h * 0.3} rx={h * 0.08} fill={WINDOW} />
      {[0.2, 0.8].map(k => <circle key={k} cx={w * k} cy={h * 0.6} r={h * 0.07} fill={LIGHT} />)}
      {[0.18, 0.82].map(k => <rect key={k} x={w * k - w * 0.08} y={h * 0.78} width={w * 0.16} height={h * 0.22} rx={h * 0.04} fill={TYRE} />)}
    </g>
  );
}
function BottomCard({ t }: { t: number }) {
  const start = T_RAYS + 0.8, u = uAt(t), m = magnification(u), ratio = sizeVsFlat(u);
  const pts = Array.from({ length: 81 }, (_, k) => U_START + ((u - U_START) * k) / 80).map(x => `${gx(x).toFixed(1)},${gy(magnification(x)).toFixed(1)}`);
  const panel = prog(t, ANSWER_AT - 0.8, 0.5), warn = prog(t, T_WARN, 0.5);
  const lab = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = P.muted, size = 24) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ font: `600 ${size}px ${SOFT_UI}` }}>{s}</text>;
  const flatW = 120 * Math.min(1, 2.4 / (1.5 + u)), wingW = flatW * ratio;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={1140} width={960} height={380} rx={44} fill={P.card} />
      <line x1={G.x0} y1={G.bottom} x2={G.x1} y2={G.bottom} stroke={P.axis} strokeWidth={3} />
      <line x1={G.x0} y1={gy(1)} x2={G.x1} y2={gy(1)} stroke={P.muted} strokeWidth={2} strokeDasharray="8 8" />
      {lab(G.x0, gy(1) - 12, 'flat mirror ×1', 'start')}{lab(G.x1, G.top - 26, 'image size · closer →', 'end')}
      {t >= start && <polyline points={pts.join(' ')} fill="none" stroke={V.orange} strokeWidth={6} strokeLinecap="round" />}
      {t >= start && <circle cx={gx(u)} cy={gy(m)} r={11} fill={V.orange} />}
      <g opacity={panel}>
        {lab(800, 1190, 'what you see', 'middle', P.ink, 26)}
        <rect x={610} y={1215} width={170} height={150} rx={14} fill="none" stroke={P.muted} strokeWidth={3} />
        <rect x={820} y={1215} width={170} height={150} rx={46} fill="none" stroke={V.green} strokeWidth={4} />
        <CarIcon cx={695} cy={1290} w={flatW} color={CAR} />
        <CarIcon cx={905} cy={1290} w={wingW} color={CAR} />
        {lab(695, 1398, 'flat mirror')}{lab(905, 1398, 'wing mirror', 'middle', V.green)}
        {lab(905, 1430, `×${ratio.toFixed(2)} as big`, 'middle', P.ink, 26)}
        <g opacity={warn}>{lab(800, 1474, 'OBJECTS IN MIRROR ARE', 'middle', P.ink, 20)}{lab(800, 1500, 'CLOSER THAN THEY APPEAR', 'middle', P.ink, 20)}</g>
      </g>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 44, weight: 400, color: P.muted, text: 'Wing mirror: convex, image always smaller.' },
  { at: 0.5, size: 58, weight: 600, color: P.ink, text: 'So the car is closer than it looks' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #10' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics009({ cover = false, voice = false }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #9'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={52} chipW={240} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.08, bottom: 0.1, left: 0.04, right: 0.04 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Labels t={t} />
        <Readout t={t} />
        <BottomCard t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1600} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-physics-009-wing-mirror-voice-mix.wav' : 'pv-physics-009-wing-mirror-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
