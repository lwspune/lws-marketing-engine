// @pyqvault_ · Physics, visualised #5 (predict-first): squeeze an insulated gas to half its volume: its temperature?
// Dark lab look (L22 rotation: P5 lab). Two three.js cylinders squeezed together: insulated (left, molecules warm and
// speed up, 300 → 476 K) and standing in water (right, heat drifts out, stays 300 K). Live T and P under each, and the
// P–V graph draws itself: the insulated curve is steeper. Framework v1.3 (reels/pyqvault-framework.md): question over a
// moving picture, rounded shapes with soft edges, camera zooms (CAMERA) and the experiment's own sound (SOUND).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, T0, GAMMA, T_SQ, T_DONE, N, R_BALL, R_GLASS, H1, CAMERA, volumeAt, tempAt, pressureAt, heightAt,
  particleAt, pistonSpeedAt, type Side,
} from './lib/pp005.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { t: 0.8, text: 'Hotter, colder or same?', y: 1590, size: 60 };   // before the squeeze: no spoiler
const BAND = { left: 0, top: 470, width: 1080, height: 600 };
const X: Record<Side, number> = { ins: -1.3, water: 1.3 };
const HOT = new THREE.Color(P.amber), COLD = new THREE.Color(P.blue);
const warmth = (side: Side, t: number) => (tempAt(side, t) - T0) / (T0 * 2 ** (2 / 3) - T0);   // 0 … 1

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, [zoom, focus] = tween(t, CAMERA.start, CAMERA.keys);
  const target = new THREE.Vector3(focus * 1.3, 0.85, 0);
  cam.position.copy(target.clone().add(new THREE.Vector3(0, 1.0, 7.0).divideScalar(zoom)));
  cam.fov = 30; cam.aspect = BAND.width / BAND.height; cam.lookAt(target); cam.updateProjectionMatrix();
  return null;
}

function Cylinder({ side, t }: { side: Side; t: number }) {
  const x = X[side], face = heightAt(t) + R_BALL, top = H1 + R_BALL + 0.5, w = warmth(side, t);
  const ball = COLD.clone().lerp(HOT, w * 0.9), squeeze = pistonSpeedAt(t) / ((H1 * 0.5 * 2) / (T_DONE - T_SQ));   // 0 … 1
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, -R_BALL - 0.04, 0]}><cylinderGeometry args={[R_GLASS + 0.05, R_GLASS + 0.05, 0.08, 64]} /><meshStandardMaterial color="#8d97a8" roughness={0.5} metalness={0.3} /></mesh>
      {Array.from({ length: N }, (_, i) => {
        const [px, py, pz] = particleAt(side, i, t);
        return <mesh key={i} position={[px, py, pz]}><sphereGeometry args={[R_BALL, 16, 16]} /><meshStandardMaterial color={ball} roughness={0.3} emissive={ball} emissiveIntensity={0.18 + 0.3 * w} /></mesh>;
      })}
      {/* piston + handle */}
      <mesh position={[0, face + 0.08, 0]}><cylinderGeometry args={[R_GLASS - 0.02, R_GLASS - 0.02, 0.16, 64]} /><meshStandardMaterial color="#aab3c2" roughness={0.28} metalness={0.65} /></mesh>
      <mesh position={[0, face + 0.5, 0]}><cylinderGeometry args={[0.07, 0.07, 0.7, 24]} /><meshStandardMaterial color="#8d97a8" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, face + 0.9, 0]}><RoundBox size={[0.6, 0.14, 0.3]} radius={0.06} /><meshStandardMaterial color="#7d889a" metalness={0.6} roughness={0.4} /></mesh>
      {/* glass */}
      <mesh position={[0, (top - R_BALL) / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[R_GLASS + 0.02, R_GLASS + 0.02, top + R_BALL, 72, 1, true]} />
        <meshPhysicalMaterial color="#cfe0ff" roughness={0.1} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {side === 'ins'
        ? <>{/* insulation: a warm felt jacket with soft bands */}
            <mesh position={[0, (top - R_BALL) / 2, 0]} renderOrder={3}>
              <cylinderGeometry args={[R_GLASS + 0.14, R_GLASS + 0.14, top + R_BALL, 72, 1, true]} />
              <meshStandardMaterial color="#d8a878" roughness={0.9} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {[0.15, 0.75, 1.35, 1.95].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R_GLASS + 0.15, 0.045, 12, 96]} /><meshStandardMaterial color="#c89466" roughness={0.85} /></mesh>)}
          </>
        : <>{/* water bath, and heat drifting out of the cylinder while it's squeezed */}
            <mesh position={[0, 0.7, 0]} renderOrder={3}><RoundBox size={[2.15, 1.55, 2.15]} radius={0.18} /><meshPhysicalMaterial color="#5aa9ff" roughness={0.15} transparent opacity={0.16} depthWrite={false} /></mesh>
            {squeeze > 0.02 && Array.from({ length: 12 }, (_, k) => {
              const a = (k / 12) * Math.PI * 2 + 0.4, d = ((t * 0.55 + k * 0.37) % 1) * 0.55, r = R_GLASS + 0.08 + d;
              return <mesh key={k} position={[r * Math.cos(a), 0.3 + ((k * 0.29) % 1) * 1.0, r * Math.sin(a)]}>
                <sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={P.amber} emissive={P.amber} emissiveIntensity={0.8} transparent opacity={Math.min(1, squeeze * 1.4) * (1 - d / 0.55)} />
              </mesh>;
            })}
          </>}
      {[-R_BALL, top].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R_GLASS + 0.02, 0.018, 12, 96]} /><meshStandardMaterial color={P.ink} transparent opacity={0.5} /></mesh>)}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.05} />
      <directionalLight position={[-3, 6, 5]} intensity={2.0} />
      <pointLight position={[X.ins, 0.8, 1.2]} intensity={6 * warmth('ins', t)} color={P.amber} />
      <Cylinder side="ins" t={t} />
      <Cylinder side="water" t={t} />
    </>
  );
}

// Under each cylinder: what it is, its temperature (the answer), and its pressure.
function Readouts({ t }: { t: number }) {
  const a = prog(t, 0.3, 0.5), num = { fontVariantNumeric: 'tabular-nums' as const };
  const col = (side: Side, cx: number, label: string) => {
    const T = tempAt(side, t), hot = warmth(side, t);
    return (
      <div style={{ position: 'absolute', left: cx - 260, width: 520, top: 1066, textAlign: 'center' }}>
        <div style={{ font: `600 30px ${SOFT_UI}`, color: P.muted }}>{label}</div>
        <div style={{ ...hand(56), color: hot > 0.05 ? P.amber : P.blue, ...num }}>{Math.round(T)} K</div>
        <div style={{ ...hand(32), color: P.muted, ...num }}>P × {pressureAt(side, t).toFixed(2)}</div>
      </div>
    );
  };
  return <div style={{ position: 'absolute', inset: 0, opacity: a }}>{col('ins', 270, 'insulated')}{col('water', 810, 'in water')}</div>;
}

// P against V: both start at (1, 1); squeezing moves left. Insulated follows PV^γ (steeper), water PV = const.
const GR = { x0: 190, x1: 890, y0: 1452, h: 230, vMin: 0.4, vMax: 1.1, pMax: 3.4 };
const gx = (v: number) => GR.x0 + ((v - GR.vMin) / (GR.vMax - GR.vMin)) * (GR.x1 - GR.x0), gy = (p: number) => GR.y0 - (p / GR.pMax) * GR.h;
function Graph({ t }: { t: number }) {
  const a = prog(t, 0.6, 0.5), v = volumeAt(t);
  const path = (f: (v: number) => number) => Array.from({ length: 41 }, (_, i) => { const vi = 1 - (i / 40) * (1 - v); return `${i ? 'L' : 'M'}${gx(vi).toFixed(1)},${gy(f(vi)).toFixed(1)}`; }).join(' ');
  const lab = (x: number, y: number, s: string, color: string, anchor: 'start' | 'end' = 'start') => <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(26) }}>{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <line x1={GR.x0} y1={GR.y0} x2={GR.x1} y2={GR.y0} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={GR.x0} y1={GR.y0} x2={GR.x0} y2={GR.y0 - GR.h - 8} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
      {lab(GR.x1, GR.y0 + 34, 'V', P.ink, 'end')}{lab(GR.x0 - 12, GR.y0 - GR.h, 'P', P.ink, 'end')}
      <path d={path(x => 1 / x)} fill="none" stroke={P.blue} strokeWidth={5} strokeLinecap="round" />
      <path d={path(x => x ** -GAMMA)} fill="none" stroke={P.amber} strokeWidth={5} strokeLinecap="round" />
      <circle cx={gx(v)} cy={gy(1 / v)} r={10} fill={P.blue} stroke={P.board} strokeWidth={3} />
      <circle cx={gx(v)} cy={gy(v ** -GAMMA)} r={10} fill={P.amber} stroke={P.board} strokeWidth={3} />
      {v < 0.9 && <g opacity={prog(t, 2.4, 0.5)}>{lab(gx(v) - 20, gy(v ** -GAMMA) + 8, 'insulated', P.amber, 'end')}{lab(gx(v) - 20, gy(1 / v) + 8, 'in water', P.blue, 'end')}</g>}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'Squeeze it: your work becomes heat.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #6' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics005({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #5'} lines={['Squeeze an insulated gas to half.', 'Its temperature?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.12 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Readouts t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-005-adiabatic-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}

