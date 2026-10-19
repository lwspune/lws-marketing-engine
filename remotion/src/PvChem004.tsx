// @pyqvault_ · Chemistry, visualised #4 (predict-first): Charles's law. Dark lab look (L22: C4 lab).
// Frame 0: "Heat a gas from 0 °C to 273 °C. Its volume becomes? A ×1.5 · B ×2 · C ×273". A flame heats a three.js
// cylinder; the molecules speed up and the free lid rises to twice the volume. Then the V–T line runs back to zero at
// −273 °C: counted from there, 273 K → 546 K. House settings: short labels, no exam question, pyqvault.com at the end.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, T_HEAT, T_DONE, T_LINE, N, R_BALL, R_GLASS, H1, celsiusAt, kelvinAt, volumeAt, heightAt, particleAt, lineV,
} from './lib/pc004.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 8.4, text: 'Guess before you watch', y: 1590, size: 60 };   // before the answer lights (predict-first)
const BAND = { left: 0, top: 470, width: 640, height: 700 };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, az = 0.12 * Math.sin((2 * Math.PI * t) / 20);
  cam.position.set(7.6 * Math.sin(az), 1.7, 7.6 * Math.cos(az)); cam.fov = 30; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, 0.85, 0); cam.updateProjectionMatrix();
  return null;
}
function Scene({ t }: { t: number }) {
  const face = heightAt(t) + R_BALL, top = H1 * 2 + R_BALL + 0.62, heat = prog(t, T_HEAT - 0.6, 0.6), warm = celsiusAt(t) / 273;
  const flick = (k: number) => 1 + 0.12 * Math.sin(t * 17 + k * 2.1) + 0.06 * Math.sin(t * 31 + k);
  const ball = new THREE.Color(P.blue).lerp(new THREE.Color(P.amber), warm * 0.85);
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[-3, 6, 5]} intensity={2.0} />
      <pointLight position={[0, -0.6, 0.8]} intensity={10 * heat} color={P.amber} />
      {/* burner + flames under the floor */}
      <mesh position={[0, -0.86, 0]}><cylinderGeometry args={[0.55, 0.65, 0.16, 40]} /><meshStandardMaterial color="#5b6576" metalness={0.6} roughness={0.35} /></mesh>
      {heat > 0 && [-0.32, 0, 0.32].map((x, k) => (
        <mesh key={x} position={[x, -0.52, 0]} scale={[1, flick(k) * heat, 1]}>
          <coneGeometry args={[0.14, 0.5, 20]} />
          <meshStandardMaterial color="#ff7a2e" emissive="#ff5a1a" emissiveIntensity={0.7} roughness={0.6} transparent opacity={0.92} />
        </mesh>
      ))}
      <mesh position={[0, -R_BALL - 0.04, 0]}>
        <cylinderGeometry args={[R_GLASS + 0.04, R_GLASS + 0.04, 0.08, 64]} />
        <meshStandardMaterial color={new THREE.Color('#8d97a8').lerp(new THREE.Color(P.amber), warm * 0.5)} roughness={0.5} metalness={0.3} />
      </mesh>
      {Array.from({ length: N }, (_, i) => {
        const [x, y, z] = particleAt(i, t);
        return <mesh key={i} position={[x, y, z]}><sphereGeometry args={[R_BALL, 18, 18]} /><meshStandardMaterial color={ball} roughness={0.3} metalness={0.1} emissive={ball} emissiveIntensity={0.15} /></mesh>;
      })}
      <mesh position={[0, face + 0.08, 0]}>
        <cylinderGeometry args={[R_GLASS - 0.02, R_GLASS - 0.02, 0.16, 64]} /><meshStandardMaterial color="#aab3c2" roughness={0.28} metalness={0.65} />
      </mesh>
      <mesh position={[0, face + 0.3, 0]}><boxGeometry args={[0.5, 0.28, 0.5]} /><meshStandardMaterial color="#7d889a" roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[0, (top - R_BALL) / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[R_GLASS + 0.02, R_GLASS + 0.02, top + R_BALL, 72, 1, true]} />
        <meshPhysicalMaterial color="#cfe0ff" roughness={0.1} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-R_BALL, top].map(y => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R_GLASS + 0.02, 0.018, 12, 96]} /><meshStandardMaterial color={P.ink} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// V against T (°C): the dot climbs from (0 °C, 1 L) to (273 °C, 2 L); then the dashed line runs back to zero at −273 °C.
const GR = { x0: 650, x1: 1040, y0: 1090, h: 440, tMin: -300, tMax: 300, vMax: 2.4 };
const gx = (c: number) => GR.x0 + ((c - GR.tMin) / (GR.tMax - GR.tMin)) * (GR.x1 - GR.x0), gy = (v: number) => GR.y0 - (v / GR.vMax) * GR.h;
function Graph({ t }: { t: number }) {
  const a = prog(t, 1.0, 0.6), c = celsiusAt(t), back = prog(t, T_LINE, 1.4), zero = prog(t, T_LINE + 1.2, 0.5);
  const lab = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = P.muted, size = 28) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(size) }}>{s}</text>;
  const bx = 273 - back * 546;                                  // the backward line's far end, in °C
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <line x1={GR.x0} y1={GR.y0} x2={GR.x1} y2={GR.y0} stroke={P.axis} strokeWidth={2.5} />
      <line x1={gx(0)} y1={GR.y0} x2={gx(0)} y2={GR.y0 - GR.h - 10} stroke={P.axis} strokeWidth={2.5} />
      {[1, 2].map(v => <g key={v}><line x1={gx(0) - 7} y1={gy(v)} x2={gx(0) + 7} y2={gy(v)} stroke={P.axis} strokeWidth={2} />{lab(gx(0) - 14, gy(v) + 9, `${v} L`, 'end')}</g>)}
      {lab(gx(0), GR.y0 + 34, '0 °C')}{lab(gx(273), GR.y0 + 34, '273')}
      {lab(GR.x1, GR.y0 + 68, 'T (°C)', 'end', P.ink, 30)}{lab(gx(0) + 10, GR.y0 - GR.h - 20, 'V', 'start', P.ink, 34)}
      {back > 0 && <line x1={gx(273)} y1={gy(2)} x2={gx(bx)} y2={gy(lineV(bx))} stroke={tint(P.green, 0.7)} strokeWidth={3} strokeDasharray="9 9" />}
      <line x1={gx(0)} y1={gy(1)} x2={gx(c)} y2={gy(lineV(c))} stroke={P.green} strokeWidth={6} strokeLinecap="round" />
      <circle cx={gx(c)} cy={gy(lineV(c))} r={12} fill={P.green} stroke={P.board} strokeWidth={4} />
      {zero > 0 && <g opacity={zero}>
        <circle cx={gx(-273)} cy={GR.y0} r={13} fill={P.amber} style={{ filter: `drop-shadow(0 0 10px ${tint(P.amber, 0.9)})` }} />
        {lab(gx(-273) + 6, GR.y0 + 40, '−273 °C', 'start', P.amber, 30)}{lab(gx(-273) + 6, GR.y0 + 74, '= 0 K', 'start', P.amber, 28)}
      </g>}
    </svg>
  );
}

function Readouts({ t }: { t: number }) {
  const a = prog(t, 1.0, 0.5), num = { fontVariantNumeric: 'tabular-nums' as const };
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1210, textAlign: 'center', opacity: a, ...hand(44), color: P.ink }}>
      <span style={{ color: P.amber, ...num }}>{Math.round(celsiusAt(t))} °C</span>
      <span style={{ color: P.muted }}>{' = '}</span>
      <span style={{ ...num }}>{Math.round(kelvinAt(t))} K</span>
      <span style={{ color: P.green, marginLeft: 48, ...num }}>V {volumeAt(t).toFixed(2)} L</span>
      <span style={{ color: P.muted, marginLeft: 48, font: `600 34px ${SOFT_UI}` }}>same pressure</span>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Double the kelvin, double the volume.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the chemistry.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #5' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem004({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'CHEMISTRY, VISUALISED  #4'} lines={['Heat a gas from 0 °C to 273 °C.', 'Its volume becomes?']}
          options={OPTIONS} answer={ANSWER} at={T_DONE + 0.3} size={54} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Graph t={t} />
        <Readouts t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1560} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-004-charles.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
