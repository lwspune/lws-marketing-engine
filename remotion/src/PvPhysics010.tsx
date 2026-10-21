// @pyqvault_ · Physics, visualised #10 ("Pick one"): 30° or 60°, same speed: which lands farther? The same. White board
// (L22: physics alternates, #9 was dark), bright balls from VIVID.white (F24), one lane each on a sand field. The race is
// already running on frame 0 (F25): the 30° and 60° balls in flight with their trails. 30° lands first at 79.5 m; 60°
// comes down on the same flag (the answer, a punch-in). Then the second hook (F26): all five angles fire; 45° lands
// farthest, 15° and 75° tie. Below, range against angle: a dot as each ball lands, then the sin 2θ curve. No end card:
// the field clears and the pair fires again, so the reel loops into its first frame (F27). "PYQ Vault · pyqvault.com"
// under the question (F20; `tag={false}` renders the before version for the founder's comparison). Lib: lib/pp010.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, VIVID, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  S, DEG, ANGLES, LANE, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, CHIPS_RESET, COVER_T, BAND, LOOP_AT, T_CURVE,
  range, ballsAt, trail, flagsAt, metres, graphDots, curveDrawn, cameraAt, project, type Angle, type V3,
} from './lib/pp010.ts';
import { Board, Caption, PredictHeader, Theme, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const V = VIVID.white;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
// Each angle its own bright colour (F24); the question's pair, 30° and 60°, the two most different.
const COLOUR: Record<Angle, string> = { 15: V.orange, 30: V.blue, 45: V.green, 60: V.red, 75: V.violet };
const BALL = 0.17, FLAG_H = 0.9, GROUND = '#ebe4d3', LANE_LINE = '#d8cfba';

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

function Field() {
  const len = 10.6, x0 = -0.5;
  return (
    <group>
      <mesh position={[x0 + len / 2, -0.04, 0]} receiveShadow><RoundBox size={[len, 0.06, 2.7]} radius={0.03} /><meshStandardMaterial color={GROUND} roughness={0.95} /></mesh>
      {[-0.75, -0.25, 0.25, 0.75].map(z => <mesh key={z} position={[x0 + len / 2, 0.0, z]}><boxGeometry args={[len - 0.1, 0.004, 0.02]} /><meshBasicMaterial color={LANE_LINE} /></mesh>)}
      {[2, 4, 6, 8].map(k => <mesh key={k} position={[k * 10 * S, 0.0, 0]}><boxGeometry args={[0.025, 0.005, 2.5]} /><meshBasicMaterial color={LANE_LINE} /></mesh>)}
    </group>
  );
}

// A small launcher in each lane: a rounded base and a barrel tilted to its angle, in the ball's colour.
function Launcher({ deg }: { deg: Angle }) {
  return (
    <group position={[0, 0, LANE[deg]]}>
      <mesh position={[-0.05, 0.07, 0]} castShadow><RoundBox size={[0.34, 0.14, 0.3]} radius={0.06} /><meshStandardMaterial color="#3b4458" roughness={0.5} /></mesh>
      <group position={[0, 0.14, 0]} rotation={[0, 0, deg * DEG - Math.PI / 2]}>
        <mesh position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.065, 0.075, 0.34, 24]} /><meshStandardMaterial color={COLOUR[deg]} roughness={0.35} /></mesh>
      </group>
    </group>
  );
}

function Trail({ deg, tau, alpha }: { deg: Angle; tau: number; alpha: number }) {
  if (tau < 0.02) return null;
  const pts = trail(deg, tau, 48).map(p => new THREE.Vector3(p[0], p[1] + BALL, p[2]));
  const curve = new THREE.CatmullRomCurve3(pts);
  return (
    <mesh><tubeGeometry args={[curve, 64, 0.022, 8, false]} />
      <meshBasicMaterial color={COLOUR[deg]} transparent opacity={0.55 * alpha} depthWrite={false} /></mesh>
  );
}

function Flag({ x, z, deg, alpha }: { x: number; z: number; deg: Angle; alpha: number }) {
  const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.32, -0.11), new THREE.Vector2(0, -0.22)]);
  return (
    <group position={[x, 0, z]} scale={[1, Math.max(0.001, alpha), 1]}>
      <mesh position={[0, FLAG_H / 2, 0]}><cylinderGeometry args={[0.018, 0.018, FLAG_H, 10]} /><meshStandardMaterial color="#4a5368" /></mesh>
      <mesh position={[0.01, FLAG_H, 0]}><shapeGeometry args={[shape]} /><meshStandardMaterial color={COLOUR[deg]} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function Scene({ t }: { t: number }) {
  const balls = ballsAt(t);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.6} />
      <ambientLight intensity={0.45} />
      <Field />
      {ANGLES.map(d => <Launcher key={d} deg={d} />)}
      {balls.map(b => <Trail key={`t${b.id}`} deg={b.deg} tau={b.tau} alpha={b.alpha} />)}
      {balls.map(b => (
        <mesh key={b.id} position={[b.pos[0], b.pos[1] + BALL, b.pos[2]]} castShadow>
          <sphereGeometry args={[BALL, 32, 32]} />
          <meshStandardMaterial color={COLOUR[b.deg]} roughness={0.3} transparent={b.alpha < 1} opacity={b.alpha} />
        </mesh>
      ))}
      {flagsAt(t).map(f => <Flag key={f.deg} {...f} />)}
    </>
  );
}

// Labels over the band: each flying ball's angle beside it, each flag's distance above it, and "balls not to scale".
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t), seen = new Set<string>();
  const chip = (p: { x: number; y: number }, s: string, color: string, op: number, key: string) => (
    <div key={key} style={{ position: 'absolute', left: p.x - 80, width: 160, top: p.y - 22, textAlign: 'center', opacity: op, font: `700 32px ${SOFT_UI}`, color, fontVariantNumeric: 'tabular-nums' }}>{s}</div>
  );
  return (
    <AbsoluteFill>
      {ballsAt(t).filter(b => !b.landed).map(b => {
        const p = project([b.pos[0], b.pos[1] + BALL, b.pos[2]] as V3, cam);
        return chip({ x: p.x + 46, y: p.y - 36 }, `${b.deg}°`, COLOUR[b.deg], prog(b.tau, 0.05, 0.2) * b.alpha, `b${b.id}`);
      })}
      {flagsAt(t).map(f => {
        const label = metres(f.metres);
        if (seen.has(label)) return null;                 // twins share a flag: one label
        seen.add(label);
        const p = project([f.x, FLAG_H + 0.1, f.z] as V3, cam);
        // Centred over the flag, kept inside the frame: 91.8 m sits near the right edge, beside 79.5 m.
        return chip({ x: Math.min(p.x - 20, BAND.width - 75), y: p.y - 30 }, label, P.ink, f.alpha, `f${f.deg}`);
      })}
      <div style={{ position: 'absolute', right: 70, top: BAND.top + 24, font: `600 24px ${SOFT_UI}`, color: P.muted }}>balls not to scale</div>
    </AbsoluteFill>
  );
}

// The card below: range against launch angle, 0–90°. A dot in the ball's colour when it lands; a dashed line joins equal
// ranges (twins); then R = v² sin 2θ / g draws itself through them, its top at 45°.
const GR = { x0: 150, x1: 930, top: 1240, bottom: 1440, mMax: 100 };   // headroom above the peak for the formula
const gx = (deg: number) => GR.x0 + (deg / 90) * (GR.x1 - GR.x0), gy = (m: number) => GR.bottom - (m / GR.mMax) * (GR.bottom - GR.top);
function BottomCard({ t }: { t: number }) {
  const dots = graphDots(t), drawn = curveDrawn(t), fade = 1 - prog(t, LOOP_AT, 0.5);
  const n = Math.round(90 * Math.min(1, drawn)), pts = Array.from({ length: n + 1 }, (_, k) => `${gx(k).toFixed(1)},${gy(range(k)).toFixed(1)}`);
  const lab = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = P.muted, size = 26, op = 1) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} opacity={op} style={{ font: `600 ${size}px ${SOFT_UI}` }}>{s}</text>;
  const twins = ([[15, 75], [30, 60]] as [Angle, Angle][]).filter(([a, b]) => dots.some(d => d.deg === a) && dots.some(d => d.deg === b));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={1140} width={960} height={380} rx={44} fill="#ffffff" />
      {lab(GR.x0, 1180, 'range (m)', 'start')}{lab(GR.x1, 1180, 'v = 30 m/s · no air', 'end')}
      <line x1={GR.x0} y1={GR.bottom} x2={GR.x1} y2={GR.bottom} stroke={P.axis} strokeWidth={3} />
      <line x1={GR.x0} y1={GR.bottom} x2={GR.x0} y2={GR.top} stroke={P.axis} strokeWidth={3} />
      {ANGLES.map(d => lab(gx(d), GR.bottom + 38, `${d}°`, 'middle', COLOUR[d], 26))}
      {lab(gx(90), GR.bottom + 38, 'angle', 'end')}
      {twins.map(([a, b]) => <line key={a} x1={gx(a)} y1={gy(range(a))} x2={gx(b)} y2={gy(range(b))} stroke={P.muted} strokeWidth={3} strokeDasharray="10 10" opacity={fade} />)}
      {n > 0 && <polyline points={pts.join(' ')} fill="none" stroke={V.green} strokeWidth={6} strokeLinecap="round" opacity={fade} />}
      {dots.map(d => <circle key={d.deg} cx={gx(d.deg)} cy={gy(d.metres)} r={13} fill={COLOUR[d.deg]} opacity={d.alpha} />)}
      {lab(gx(45), gy(range(45)) - 30, 'R = v² sin 2θ / g', 'middle', P.ink, 30, prog(t, T_CURVE + 1.0, 0.5) * fade)}
    </svg>
  );
}

export function PvPhysics010({ cover = false, voice = false, tag = true }: { cover?: boolean; voice?: boolean; tag?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #10'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={220}
          brand={tag ? BRAND : undefined} until={CHIPS_RESET} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.08, bottom: 0.08, left: 0.04, right: 0.04 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }} shadows><Scene t={t} /></ThreeCanvas>
        </div>
        <Labels t={t} />
        <BottomCard t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-physics-010-launch-angles-voice-mix.wav' : 'pv-physics-010-launch-angles-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
