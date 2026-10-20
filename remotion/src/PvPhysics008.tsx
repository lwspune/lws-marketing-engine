// @pyqvault_ · Physics, visualised #8 (predict-first): a flame in a spoon looks upside down; bring it close and it turns
// upright and bigger. White look (L22 rotation: physics is due white). A three.js optical bench: a shiny spoon (its
// bowl a concave mirror, R = 2f), a candle whose flame flickers from frame 0, the full 360° opening orbit (F22), then
// six rays from the flame's tip to the bowl and on to the image, light travelling along them. The candle slides in: the
// upside-down image grows and runs away, at F the rays leave parallel, inside F the image appears behind the spoon,
// upright and ×2.5, with dashed lines tracing the rays back to it. Below, magnification against distance draws itself
// and flips sign across F (lib/pp008.ts). Two renders: silent, and with the voiceover (L43).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, HEADER, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, F, R, POLE_X, APERTURE, U_START, T_RAYS, COVER_T, BAND, EYE,
  uAt, imageAt, rayPaths, raysDrawn, flicker, cameraAt, project, magnification, type V2, type Ray,
} from './lib/pp008.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const FLAME = '#ffb020', FLAME_CORE = '#fff2b0', WAX = '#d64b3c', RAY = '#f08a24', RAY_RULE = '#e0601c', BACK = '#3f56a0';

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A thin glowing tube from a to b in the z = 0 plane (a ray, or one dash of a traced-back line). */
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

// One ray: the incoming part draws first, then the reflection; light dots run along it at a steady speed.
function RayView({ ray, t, drawn }: { ray: Ray; t: number; drawn: number }) {
  const rule = ray.rule !== null, r = rule ? 0.016 : 0.008, col = rule ? RAY_RULE : RAY, op = rule ? 0.95 : 0.55;
  const kIn = Math.min(1, drawn * 2), kOut = Math.max(0, drawn * 2 - 1);
  const inEnd = lerp(ray.inc[0], ray.inc[1], kIn), outEnd = lerp(ray.out[0], ray.out[1], kOut);
  const L1 = lenOf(ray.inc), L2 = lenOf(ray.out), reach = kIn * L1 + kOut * L2, dots: V2[] = [];
  for (let s = ((t - T_RAYS) * 1.6) % 0.55; s < reach; s += 0.55) dots.push(s < L1 ? lerp(ray.inc[0], ray.inc[1], s / L1) : lerp(ray.out[0], ray.out[1], (s - L1) / L2));
  const back = ray.back, trace = prog(t, 12.4, 0.5);
  return (
    <group>
      <Seg a={ray.inc[0]} b={inEnd} r={r} color={col} opacity={op} />
      {kOut > 0 && <Seg a={ray.out[0]} b={outEnd} r={r} color={col} opacity={op} />}
      {dots.map((d, i) => (
        <mesh key={i} position={[d[0], d[1], 0]}><sphereGeometry args={[rule ? 0.03 : 0.022, 10, 10]} />
          <meshBasicMaterial color={FLAME_CORE} toneMapped={false} /></mesh>
      ))}
      {back && Array.from({ length: Math.floor(lenOf(back) / 0.14) }, (_, i) => {
        const L = lenOf(back), a = lerp(back[0], back[1], (i * 0.14) / L), b = lerp(back[0], back[1], (i * 0.14 + 0.08) / L);
        return <Seg key={`b${i}`} a={a} b={b} r={r * 0.8} color={BACK} opacity={(rule ? 0.55 : 0.3) + 0.35 * trace} />;
      })}
    </group>
  );
}

// The candle (or its image, scaled by m: negative = upside down). Its base sits on the axis, the flame's tip at y = H.
function Candle({ x, m = 1, t, ghost = 0 }: { x: number; m?: number; t: number; ghost?: number }) {
  const k = flicker(t), real = ghost === 0, op = real ? 1 : ghost;
  const mat = (color: string, extra = {}) => <meshStandardMaterial color={color} roughness={0.55} transparent={!real} opacity={op} depthWrite={real} {...extra} />;
  return (
    <group position={[x, 0, 0]} scale={[Math.abs(m), m, Math.abs(m)]}>
      {real && <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.17, 0.19, 0.06, 40]} /><meshStandardMaterial color="#c9ced8" metalness={0.6} roughness={0.3} /></mesh>}
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.075, 0.08, 0.36, 32]} />{mat(WAX)}</mesh>
      <mesh position={[0, 0.375, 0]}><cylinderGeometry args={[0.006, 0.006, 0.03, 6]} />{mat('#3a3029')}</mesh>
      <mesh position={[0.004 * Math.sin(t * 9), 0.425, 0]} scale={[0.62 + 0.06 * k, 1.25 + 0.18 * k, 0.62 + 0.06 * k]}>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshBasicMaterial color={FLAME} toneMapped={false} transparent opacity={op} />
      </mesh>
      <mesh position={[0, 0.415, 0]} scale={[0.5, 0.9, 0.5]}><sphereGeometry args={[0.05, 16, 16]} /><meshBasicMaterial color={FLAME_CORE} toneMapped={false} transparent opacity={op} /></mesh>
      {real && <mesh position={[0, 0.43, 0]}><sphereGeometry args={[0.17 + 0.03 * k, 20, 20]} />
        <meshBasicMaterial color={FLAME} transparent opacity={0.16} depthWrite={false} toneMapped={false} /></mesh>}
    </group>
  );
}

// The spoon: its bowl is a slice of a sphere of radius R round C, squashed a little front to back so it reads as a spoon
// in the orbit (the side view, where the rays are, is unchanged), a rolled rim and a handle curving away below.
const CAP = Math.asin(APERTURE / R), RIM_X = POLE_X + R - Math.sqrt(R * R - APERTURE * APERTURE);
function Spoon() {
  const steel = <meshStandardMaterial color="#dfe3ea" metalness={1} roughness={0.16} side={THREE.DoubleSide} />;
  return (
    <group>
      <group position={[POLE_X + R, 0, 0]} scale={[1, 1, 0.78]}>
        <mesh rotation={[0, 0, Math.PI / 2]}><sphereGeometry args={[R, 72, 24, 0, 2 * Math.PI, 0, CAP]} />{steel}</mesh>
      </group>
      <group position={[RIM_X, 0, 0]} scale={[1, 1, 0.78]}>
        <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[APERTURE, 0.022, 12, 96]} />{steel}</mesh>
      </group>
      <mesh position={[RIM_X - 0.12, -APERTURE - 0.78, 0]} rotation={[0, 0, -0.16]}>
        <RoundBox size={[0.13, 1.7, 0.26]} radius={0.06} /><meshStandardMaterial color="#dfe3ea" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Eye({ t }: { t: number }) {
  const a = prog(t, 12.2, 0.4);
  if (a <= 0) return null;
  const look = Math.atan2(0 - EYE[1], POLE_X - EYE[0]);           // the pupil faces the spoon
  return (
    <group position={[EYE[0], EYE[1], 0]} scale={a}>
      <mesh><sphereGeometry args={[0.17, 32, 32]} /><meshStandardMaterial color="#ffffff" roughness={0.25} /></mesh>
      <mesh position={[0.15 * Math.cos(look), 0.15 * Math.sin(look), 0.02]} rotation={[0, 0, look - Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.04, 28]} /><meshStandardMaterial color={P.blue} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Scene({ t }: { t: number }) {
  const u = uAt(t), im = imageAt(t), drawn = raysDrawn(t), marks = prog(t, 2.8, 0.3);
  return (
    <>
      <Rig t={t} />
      <RealLight env={0.9} />
      <ambientLight intensity={0.6} />
      <Seg a={[-3.8, 0]} b={[3.4, 0]} r={0.007} color={P.ink} opacity={0.35} />
      {[F, R].map(d => <mesh key={d} position={[POLE_X + d, 0, 0]} scale={marks}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color={P.ink} /></mesh>)}
      <Spoon />
      <Candle x={POLE_X + u} t={t} />
      {im.alpha > 0 && <Candle x={im.x} m={im.m} t={t} ghost={(im.virtual ? 0.7 : 0.85) * im.alpha} />}
      {drawn > 0 && rayPaths(t).map((ray, i) => <RayView key={i} ray={ray} t={t} drawn={drawn} />)}
      <Eye t={t} />
    </>
  );
}

// "F" and "C" under their points on the axis, drawn over the 3D band once the orbit is back at the front.
function AxisLabels({ t }: { t: number }) {
  const a = prog(t, 2.8, 0.3), cam = cameraAt(t);
  if (a <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      {([['F', F], ['C', R]] as const).map(([l, d]) => {
        const s = project([POLE_X + d, 0, 0], cam);
        return <text key={l} x={s.x} y={s.y + 52} textAnchor="middle" fill={P.ink} style={{ ...hand(40) }}>{l}</text>;
      })}
    </svg>
  );
}

// What the image is doing right now, on a soft card at the band's foot.
function Readout({ t }: { t: number }) {
  const a = prog(t, T_RAYS + 0.8, 0.3);
  if (a <= 0) return null;
  const im = imageAt(t), atF = !Number.isFinite(im.v), shown = im.alpha > 0.5;
  const text = atF ? 'no image: the rays never meet' : !shown ? 'image: far away' : `image ×${Math.abs(im.m).toFixed(1)}  ${im.m < 0 ? 'upside down' : 'upright'}`;
  const tone = shown && im.m > 0 ? P.green : P.ink;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: BAND.top + BAND.height - 64, textAlign: 'center', opacity: a }}>
      <span style={{ background: 'rgba(255, 255, 255, 0.94)', borderRadius: 30, padding: '10px 30px', boxShadow: `0 10px 30px ${tint(P.ink, 0.1)}`,
        font: `600 34px ${SOFT_UI}`, color: tone, fontVariantNumeric: 'tabular-nums' }}>{text}</span>
    </div>
  );
}

// Magnification against the candle's distance from the spoon (closer to the right), drawing itself as the candle moves:
// below the line = upside down, above = upright, and the curve flips across F.
const G = { x0: 150, x1: 990, top: 1190, bottom: 1470, uMax: 2.6, mMax: 3.5 };
const gx = (u: number) => G.x0 + ((G.uMax - u) / G.uMax) * (G.x1 - G.x0), mid = (G.top + G.bottom) / 2;
const gy = (m: number) => mid - (m / G.mMax) * ((G.bottom - G.top) / 2);
function Graph({ t }: { t: number }) {
  const start = T_RAYS + 0.8, u = uAt(t);
  const pts = (from: number, to: number) => Array.from({ length: 81 }, (_, k) => from + ((to - from) * k) / 80)
    .map(x => [x, magnification(x)] as const).filter(([, m]) => Math.abs(m) <= G.mMax);
  const path = (p: readonly (readonly [number, number])[]) => p.map(([x, m], k) => `${k ? 'L' : 'M'}${gx(x).toFixed(1)},${gy(m).toFixed(1)}`).join(' ');
  const far = t >= start ? pts(U_START, Math.max(u, F + 1e-6)) : [], near = u < F ? pts(F - 1e-6, u) : [];
  const m = Number.isFinite(magnification(u)) && Math.abs(u - F) > 1e-9 ? magnification(u) : NaN, dot = t >= start && Math.abs(m) <= G.mMax;
  const label = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = P.muted) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ font: `600 24px ${SOFT_UI}` }}>{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={1140} width={960} height={370} rx={44} fill="#ffffff" opacity={0.96} />
      <line x1={G.x0} y1={mid} x2={G.x1} y2={mid} stroke={P.axis} strokeWidth={3} />
      <line x1={gx(F)} y1={G.top} x2={gx(F)} y2={G.bottom} stroke={P.axis} strokeWidth={2} strokeDasharray="8 8" />
      {label(gx(F), mid + 34, 'F', 'middle', P.ink)}{label(gx(R), mid + 34, 'C', 'middle', P.ink)}
      {label(G.x0, G.top + 4, 'upright ↑', 'start', P.green)}{label(G.x0, G.bottom + 2, 'upside down ↓', 'start', P.amber)}
      {label(G.x1, G.top - 14, 'image size  ·  closer →', 'end')}
      {far.length > 1 && <path d={path(far)} fill="none" stroke={P.amber} strokeWidth={6} strokeLinecap="round" />}
      {near.length > 1 && <path d={path(near)} fill="none" stroke={P.green} strokeWidth={6} strokeLinecap="round" />}
      {dot && <circle cx={gx(u)} cy={gy(m)} r={12} fill={m > 0 ? P.green : P.amber} />}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'Far: upside down. Inside F: upright.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'A spoon is a concave mirror' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #9' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics008({ cover = false, voice = false }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #8'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={52} chipW={320} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.08, bottom: 0.1, left: 0.04, right: 0.04 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <AxisLabels t={t} />
        <Readout t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1590} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-physics-008-spoon-voice-mix.wav' : 'pv-physics-008-spoon-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
