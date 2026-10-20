// @pyqvault_ · Chemistry, visualised #5 (predict-first): double the temperature, halve the volume: the pressure?
// White look (L22 rotation: C5 white). A three.js cylinder over a burner: heated with the lid locked (P × 2), then held
// at 600 K and squeezed to half (P × 2 again): × 4. Live P dial, V and T bars, and P·V ÷ T worked out live: it never
// moves. Framework v1.4: question over a moving picture, the first orbit shot (F22), zooms, rounded shapes with soft
// edges and the experiment's own sound (SOUND in lib/pc005.ts).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, T_UNLOCK, N, R_BALL, R_GLASS, H2, CAMERA, tempAt, volumeAt, pressureAt, heightAt,
  particleAt, flameAt,
} from './lib/pc005.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { t: 1.0, text: '×1, ×2 or ×4?', y: 1590, size: 64 };   // mid-orbit, burner just lit: no spoiler
const BAND = { left: 0, top: 470, width: 640, height: 700 };
const HOT = new THREE.Color(P.amber), COLD = new THREE.Color(P.blue);

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, [zoom, lookY, az] = tween(t, CAMERA.start, CAMERA.keys);
  const d = 7.6 / zoom;                                      // zoom = closer; az = the orbit around the cylinder
  cam.position.set(d * Math.sin(az), lookY + 0.85 / zoom, d * Math.cos(az)); cam.fov = 30; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, lookY, 0); cam.updateProjectionMatrix();
  return null;
}

function Scene({ t }: { t: number }) {
  const face = heightAt(t) + R_BALL, top = H2 + R_BALL + 0.62, heat = flameAt(t), warm = (tempAt(t) - 300) / 300;
  const flick = (k: number) => 1 + 0.12 * Math.sin(t * 17 + k * 2.1) + 0.06 * Math.sin(t * 31 + k);
  const ball = COLD.clone().lerp(HOT, warm * 0.85), unlock = prog(t, T_UNLOCK, 0.3);
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[-3, 6, 5]} intensity={2.1} />
      <pointLight position={[0, -0.6, 0.8]} intensity={9 * heat} color={P.amber} />
      <mesh position={[0, -0.86, 0]}><cylinderGeometry args={[0.55, 0.65, 0.16, 40]} /><meshStandardMaterial color="#8d97a8" metalness={0.5} roughness={0.35} /></mesh>
      {heat > 0 && [-0.32, 0, 0.32].map((x, k) => (
        <mesh key={x} position={[x, -0.52, 0]} scale={[1, flick(k) * heat, 1]}>
          <coneGeometry args={[0.14, 0.5, 20]} />
          <meshStandardMaterial color="#ff7a2e" emissive="#ff5a1a" emissiveIntensity={0.7} roughness={0.6} transparent opacity={0.92} />
        </mesh>
      ))}
      <mesh position={[0, -R_BALL - 0.04, 0]}>
        <cylinderGeometry args={[R_GLASS + 0.04, R_GLASS + 0.04, 0.08, 64]} />
        <meshStandardMaterial color={new THREE.Color('#9aa3b2').lerp(HOT, warm * 0.5)} roughness={0.5} metalness={0.3} />
      </mesh>
      {Array.from({ length: N }, (_, i) => {
        const [x, y, z] = particleAt(i, t);
        return <mesh key={i} position={[x, y, z]}><sphereGeometry args={[R_BALL, 18, 18]} /><meshStandardMaterial color={ball} roughness={0.3} emissive={ball} emissiveIntensity={0.12} /></mesh>;
      })}
      <mesh position={[0, face + 0.08, 0]}><cylinderGeometry args={[R_GLASS - 0.02, R_GLASS - 0.02, 0.16, 64]} /><meshStandardMaterial color="#aab3c2" roughness={0.28} metalness={0.65} /></mesh>
      <mesh position={[0, face + 0.5, 0]}><cylinderGeometry args={[0.08, 0.08, 0.7, 24]} /><meshStandardMaterial color="#8d97a8" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, face + 0.9, 0]}><RoundBox size={[0.7, 0.16, 0.34]} radius={0.07} /><meshStandardMaterial color="#7d889a" metalness={0.6} roughness={0.4} /></mesh>
      {/* the lock: two pins through the glass hold the piston while it heats, then slide out */}
      {unlock < 1 && [-1, 1].map(s => (
        <mesh key={s} position={[s * (R_GLASS + 0.12 + unlock * 0.5), face + 0.26, 0]}>
          <RoundBox size={[0.42, 0.12, 0.16]} radius={0.05} /><meshStandardMaterial color={P.red} roughness={0.4} transparent opacity={1 - unlock} />
        </mesh>
      ))}
      <mesh position={[0, (top - R_BALL) / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[R_GLASS + 0.02, R_GLASS + 0.02, top + R_BALL, 72, 1, true]} />
        <meshPhysicalMaterial color="#cfe0ff" roughness={0.1} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-R_BALL, top].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R_GLASS + 0.02, 0.018, 12, 96]} /><meshStandardMaterial color={P.ink} transparent opacity={0.45} /></mesh>)}
    </>
  );
}

// Right column: a pressure dial (0–5 atm) and bars for V (0–2.5 L) and T (0–700 K), all live.
function Gauges({ t }: { t: number }) {
  const a = prog(t, 0.2, 0.5), p = pressureAt(t), v = volumeAt(t), T = tempAt(t), num = { fontVariantNumeric: 'tabular-nums' as const };
  const cx = 850, cy = 720, r = 150, ang = Math.PI * (1 - Math.min(5, p) / 5);
  const bar = (y: number, label: string, frac: number, value: string, color: string) => (
    <g>
      <text x={672} y={y + 26} fill={P.ink} style={{ ...hand(34) }}>{label}</text>
      <rect x={720} y={y} width={300} height={34} rx={17} fill={tint(P.ink, 0.07)} />
      <rect x={720} y={y} width={Math.max(34, 300 * frac)} height={34} rx={17} fill={color} />
      <text x={1030} y={y + 76} textAnchor="end" fill={color} style={{ ...hand(38), ...num }}>{value}</text>
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={tint(P.ink, 0.12)} strokeWidth={22} strokeLinecap="round" />
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r * Math.cos(ang)},${cy - r * Math.sin(ang)}`} fill="none" stroke={P.green} strokeWidth={22} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map(k => { const q = Math.PI * (1 - k / 5); return <text key={k} x={cx + (r - 44) * Math.cos(q)} y={cy - (r - 44) * Math.sin(q) + 10} textAnchor="middle" fill={P.muted} style={{ ...hand(24) }}>{k}</text>; })}
      <line x1={cx} y1={cy} x2={cx + (r - 18) * Math.cos(ang)} y2={cy - (r - 18) * Math.sin(ang)} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={12} fill={P.ink} />
      <text x={cx} y={cy + 62} textAnchor="middle" fill={P.green} style={{ ...hand(48), ...num }}>P {p.toFixed(2)} atm</text>
      {bar(860, 'V', v / 2.5, `${v.toFixed(2)} L`, P.blue)}
      {bar(990, 'T', T / 700, `${Math.round(T)} K`, P.amber)}
    </svg>
  );
}

// P · V ÷ T, worked out live from the gauges: it never moves.
function Constant({ t }: { t: number }) {
  const a = prog(t, 0.6, 0.5), p = pressureAt(t), v = volumeAt(t), T = tempAt(t), num = { fontVariantNumeric: 'tabular-nums' as const };
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1206, textAlign: 'center', opacity: a }}>
      <span style={{ ...hand(42), color: P.muted, ...num }}>
        <span style={{ color: P.green }}>{p.toFixed(2)}</span> × <span style={{ color: P.blue }}>{v.toFixed(2)}</span> ÷ <span style={{ color: P.amber }}>{Math.round(T)}</span> =
      </span>
      <span style={{ ...hand(52), color: P.ink, marginLeft: 16, ...num }}>{((p * v) / T).toFixed(4)}</span>
      <div style={{ font: `600 30px ${SOFT_UI}`, color: P.muted, marginTop: 6 }}>P · V ÷ T</div>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: '×2 from heat, ×2 from squeeze: ×4.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the chemistry.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #6' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem005({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'CHEMISTRY, VISUALISED  #5'} lines={['Double the temperature, halve the volume.', 'Pressure becomes?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={50} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.1, right: 0.12 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Gauges t={t} />
        <Constant t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-005-pvt-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
