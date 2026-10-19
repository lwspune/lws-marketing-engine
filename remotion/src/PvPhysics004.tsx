// @pyqvault_ · Physics, visualised #4 (predict-first): tilt a ramp; when does the block slide? White look (L22: P4 white).
// Frame 0: the question with A/B/C (no still title card, L29). A three.js plank tilts; live arrows for the pull down the
// slope (amber) and friction (green); bars compare the pull with the most friction can give; it slips at 35°.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question at the end, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import { END_AT, CAPTIONS, OPTIONS, ANSWER, MU_S, T_SLIP, PLANK, BLOCK, tiltAt, blockAt, forcesAt, M, G } from './lib/pp004.ts';
import { Board, Caption, EndCard, PredictHeader, hand, useFonts, type EndLine } from './board.tsx';

const DEG = 180 / Math.PI;
const COVER = { t: T_SLIP - 0.05, text: 'When does it slide?', y: 1590, size: 62 };
const BAND = { left: 0, top: 470, width: 1080, height: 700 };
const HINGE = new THREE.Vector3(1.55, 0, 0);               // the low end of the plank, on the floor
const along = (th: number, s: number, up = 0) =>            // a point s along the plank from the hinge, `up` above its top face
  new THREE.Vector3(HINGE.x - s * Math.cos(th) - up * Math.sin(th), HINGE.y + 0.06 + s * Math.sin(th) + up * Math.cos(th), 0);

function Rig() {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera;
  cam.position.set(0.5, 1.6, 6.1); cam.fov = 32; cam.aspect = BAND.width / BAND.height; cam.lookAt(0.1, 0.85, 0); cam.updateProjectionMatrix();
  return null;
}
function Arrow({ from, dir, len, color }: { from: THREE.Vector3; dir: THREE.Vector3; len: number; color: string }) {
  if (len < 0.03) return null;
  const d = dir.clone().normalize(), head = Math.min(0.24, len * 0.45), end = from.clone().add(d.clone().multiplyScalar(len - head));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  return <>
    <mesh position={from.clone().add(end).multiplyScalar(0.5)} quaternion={q}><cylinderGeometry args={[0.055, 0.055, len - head, 16]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
    <mesh position={end.clone().add(d.clone().multiplyScalar(head / 2))} quaternion={q}><coneGeometry args={[0.13, head, 24]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
  </>;
}
function Scene({ t }: { t: number }) {
  const th = tiltAt(t), s = blockAt(t), f = forcesAt(t), k = 0.19;           // arrow length per newton
  const centre = along(th, s, BLOCK.h / 2), down = new THREE.Vector3(Math.cos(th), -Math.sin(th), 0);
  const topEnd = along(th, PLANK.len);
  return (
    <>
      <Rig />
      <ambientLight intensity={1.3} />
      <directionalLight position={[-3, 5, 5]} intensity={2.3} />
      {/* floor */}
      <mesh position={[0, -0.02, 0]}><boxGeometry args={[5.6, 0.04, 1.6]} /><meshStandardMaterial color="#e4dfd4" roughness={0.9} /></mesh>
      {/* the plank (hinged at the low end) and the stand that lifts its other end */}
      <mesh position={along(th, PLANK.len / 2, -0.06)} rotation={[0, 0, -th]}>
        <boxGeometry args={[PLANK.len, 0.12, 1.0]} /><meshStandardMaterial color="#c9a27a" roughness={0.65} />
      </mesh>
      {topEnd.y > 0.12 && <mesh position={[topEnd.x + 0.05, (topEnd.y - 0.06) / 2, 0]}>
        <boxGeometry args={[0.12, Math.max(0.01, topEnd.y - 0.06), 0.5]} /><meshStandardMaterial color="#8d97a8" metalness={0.5} roughness={0.35} />
      </mesh>}
      {/* the bottom stop */}
      <mesh position={along(th, PLANK.stop - BLOCK.len / 2 - 0.05, 0.1)} rotation={[0, 0, -th]}>
        <boxGeometry args={[0.08, 0.2, 1.0]} /><meshStandardMaterial color="#8d97a8" />
      </mesh>
      {/* the block */}
      <mesh position={centre} rotation={[0, 0, -th]}>
        <boxGeometry args={[BLOCK.len, BLOCK.h, 0.5]} /><meshStandardMaterial color={P.blue} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* forces along the slope: the pull down it, friction up it */}
      <Arrow from={centre.clone().add(new THREE.Vector3(0, 0, 0.3))} dir={down} len={f.pull * k} color={P.amber} />
      <Arrow from={along(th, s - BLOCK.len / 2, 0.06).add(new THREE.Vector3(0, 0, 0.3))} dir={down.clone().negate()} len={f.friction * k} color={P.green} />
    </>
  );
}

function Bars({ t }: { t: number }) {
  const f = forcesAt(t), a = prog(t, 1.2, 0.5), W = 700, N = M * G * 0.8;      // scale: 7.84 N = full bar
  const row = (y: number, label: string, v: number, color: string) => (
    <div style={{ position: 'absolute', left: 190, top: y, width: W + 200 }}>
      <div style={{ position: 'absolute', left: -190, top: 2, width: 178, textAlign: 'right', font: `600 28px ${SOFT_UI}`, color, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 40, borderRadius: 12, background: tint(P.ink, 0.07) }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: (W * Math.min(1, v / N)), height: 40, borderRadius: 12, background: color }} />
      <div style={{ position: 'absolute', left: W + 14, top: -2, ...hand(34), color: P.ink, fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(1)} N</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1180, textAlign: 'center', ...hand(48), color: P.ink, fontVariantNumeric: 'tabular-nums' }}>
        θ = {Math.round(f.theta * DEG)}°
      </div>
      {row(1262, 'pull', f.pull, P.amber)}
      {row(1322, 'friction max', f.maxFriction, P.green)}
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'tan θ = μ = 0.7 → 35°' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #5' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics004({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <PredictHeader t={t} label={'PHYSICS, VISUALISED  #4'} lines={['Tilt the ramp.', 'When does the block slide?']}
        options={OPTIONS} answer={ANSWER} at={T_SLIP + 0.5} />
      <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height }}>
        <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
      </div>
      <Bars t={t} />
      {!cover && t > T_SLIP + 3.6 && t < END_AT && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1418, textAlign: 'center', ...hand(42), color: P.muted, opacity: prog(t, T_SLIP + 3.8, 0.4) }}>
          tan 35° = {Math.tan(35 / DEG).toFixed(2)} = μ ({MU_S})
        </div>
      )}
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1570} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('pv-physics-004-slope.wav')} />}
    </AbsoluteFill>
  );
}
