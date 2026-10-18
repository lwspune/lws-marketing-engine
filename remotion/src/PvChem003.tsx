// @pyqvault_ · Chemistry, visualised #3: Avogadro's law. White look (L22 rotation: C3 white).
// A real three.js cylinder with a free lid; gas is added twice through a valve (new particles arrive green). The lid
// rises so V grows with n, and the live count of hits on the lid stays level: same pressure.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, ADDS, NMAX, R_BALL, R_GLASS, H1, countAt, volumeAt, heightAt, present, particleAt, justHit, hitsPerSecond,
} from './lib/pc003.ts';
import { Board, Caption, MathRow, EndCard, TitleCard, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 13.4, text: 'Twice the gas,\ntwice the space', y: 1615, size: 60 };
const BAND = { left: 0, top: 470, width: 640, height: 860 };
const appear = (t: number) => prog(t, 3.2, 0.7);
const arrivedAgo = (i: number, t: number) => {
  for (const a of ADDS) if (i >= a.from && i < a.to) return t - (a.t0 + ((i - a.from + 0.5) / (a.to - a.from)) * (a.t1 - a.t0));
  return 99;
};

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, az = 0.14 * Math.sin((2 * Math.PI * t) / 24);
  cam.position.set(8.2 * Math.sin(az), 3.4, 8.2 * Math.cos(az)); cam.fov = 30; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, 1.55, 0); cam.updateProjectionMatrix();
  return null;
}

function Scene({ t }: { t: number }) {
  const h = heightAt(t), a = appear(t), face = h + R_BALL, top = H1 * 4 + R_BALL + 0.5, adding = ADDS.some(x => t >= x.t0 - 0.2 && t <= x.t1 + 0.2);
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[-3, 6, 5]} intensity={2.2} />
      <directionalLight position={[4, 2, -3]} intensity={0.6} />
      <group visible={a > 0}>
        <mesh position={[0, -R_BALL - 0.04, 0]}>
          <cylinderGeometry args={[R_GLASS + 0.04, R_GLASS + 0.04, 0.08, 64]} />
          <meshStandardMaterial color="#c9ced8" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* the valve: a pipe into the bottom left, glowing while gas comes in */}
        <mesh position={[-R_GLASS - 0.35, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.7, 24]} />
          <meshStandardMaterial color={adding ? P.green : '#8d97a8'} emissive={adding ? P.green : '#000000'} emissiveIntensity={adding ? 0.4 : 0} roughness={0.3} metalness={0.5} />
        </mesh>
        {Array.from({ length: NMAX }, (_, i) => {
          if (!present(i, t)) return null;
          const [x, y, z] = particleAt(i, t), fresh = arrivedAgo(i, t) < 1.2, hit = justHit(i, t);
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[R_BALL, 18, 18]} />
              <meshStandardMaterial color={hit ? P.amber : fresh ? P.green : P.blue} emissive={hit ? P.amber : '#000000'} emissiveIntensity={hit ? 0.5 : 0}
                roughness={0.35} metalness={0.1} />
            </mesh>
          );
        })}
        {/* the free lid, with a small weight on top (that's the steady pressure it keeps) */}
        <mesh position={[0, face + 0.08, 0]}>
          <cylinderGeometry args={[R_GLASS - 0.02, R_GLASS - 0.02, 0.16, 64]} />
          <meshStandardMaterial color="#aab3c2" roughness={0.28} metalness={0.65} />
        </mesh>
        <mesh position={[0, face + 0.3, 0]}>
          <boxGeometry args={[0.5, 0.28, 0.5]} />
          <meshStandardMaterial color="#6f7a8c" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, (top - R_BALL) / 2, 0]} renderOrder={2}>
          <cylinderGeometry args={[R_GLASS + 0.02, R_GLASS + 0.02, top + R_BALL, 72, 1, true]} />
          <meshPhysicalMaterial color="#dfe8f5" roughness={0.08} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {[-R_BALL, top].map(y => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R_GLASS + 0.02, 0.018, 12, 96]} />
            <meshStandardMaterial color={P.ink} transparent opacity={0.45} />
          </mesh>
        ))}
      </group>
    </>
  );
}

// V against n: the dot climbs a straight line through the origin.
const G = { x0: 700, y0: 1100, w: 300, h: 420 };
function Graph({ t }: { t: number }) {
  const a = prog(t, 3.6, 0.7); if (a <= 0) return null;
  const X = (n: number) => G.x0 + (n / 52) * G.w, Y = (v: number) => G.y0 - (v / 4.4) * G.h, n = countAt(t), v = volumeAt(t);
  const lab = (x: number, y: number, s: string, anchor: 'middle' | 'end' = 'middle', color: string = P.muted, size = 32) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(size) }}>{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      <line x1={G.x0} y1={G.y0} x2={G.x0 + G.w + 20} y2={G.y0} stroke={P.axis} strokeWidth={2.5} />
      <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.y0 - G.h - 20} stroke={P.axis} strokeWidth={2.5} />
      {[1, 2, 3, 4].map(k => <g key={k}><line x1={G.x0 - 8} y1={Y(k)} x2={G.x0} y2={Y(k)} stroke={P.axis} strokeWidth={2} />{lab(G.x0 - 16, Y(k) + 10, String(k), 'end')}</g>)}
      {[12, 24, 48].map(k => lab(X(k), G.y0 + 40, String(k)))}
      {lab(G.x0 + 6, G.y0 - G.h - 34, 'V', 'middle', P.ink, 38)}
      {lab(G.x0 + G.w + 26, G.y0 + 82, 'n', 'end', P.ink, 38)}
      <line x1={X(0)} y1={Y(0)} x2={X(48)} y2={Y(4)} stroke={P.green} strokeWidth={3} strokeDasharray="8 10" opacity={0.5} />
      <line x1={X(12)} y1={Y(1)} x2={X(n)} y2={Y(v)} stroke={P.green} strokeWidth={6} strokeLinecap="round" />
      <circle cx={X(n)} cy={Y(v)} r={13} fill={P.green} stroke="#fff" strokeWidth={4} />
    </svg>
  );
}

function Readouts({ t }: { t: number }) {
  const a = prog(t, 3.6, 0.6), num = { fontVariantNumeric: 'tabular-nums' as const };
  return (
    <>
      <MathRow y={1394} size={46} opacity={a}>
        <span style={{ color: P.green, marginRight: 50 }}>particles <span style={num}>{countAt(t)}</span></span>
        <span style={{ color: P.blue, marginRight: 50 }}>V <span style={num}>{volumeAt(t).toFixed(1)}</span> L</span>
        <span>P 1.0 atm</span>
      </MathRow>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1430, textAlign: 'center', opacity: a, font: `600 38px ${SOFT_UI}`, color: P.muted }}>
        hits on the lid: <span style={{ color: P.amber, ...num }}>{hitsPerSecond(t)}</span> a second
      </div>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Twice the gas, twice the space.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the chemistry.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #4' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem003({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <TitleCard t={t} label={'CHEMISTRY, VISUALISED  #3'} lines={['Add gas: why does', 'the volume grow?']} size={74} />
      <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, opacity: appear(t) }}>
        <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
      </div>
      <Graph t={t} />
      <Readouts t={t} />
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('pv-chem-003-avogadro.wav')} />}
    </AbsoluteFill>
  );
}
