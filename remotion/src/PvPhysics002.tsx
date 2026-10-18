// @pyqvault_ · Physics, visualised #2: why does squeezing a gas raise its pressure? (Boyle's law, Class 11.)
// A real three.js glass cylinder: a piston pushes down (4 → 2 → 1 L), the gas particles keep their speed and hit
// the piston more often (they light up when they do). Live readouts: V, P, P × V and hits per second, counted
// from the simulation. A P–V graph traces as the piston moves, then straightens into P against 1/V.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, N, R_BALL, R_GLASS, H_FULL, volumeAt, pressureAt, heightAt, particleAt, justHit, hitsPerSecond,
  flipAt, graphPoint, curveSamples,
} from './lib/pv002.ts';
import { Board, Caption, MathRow, EndCard, TitleCard, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 15.5, text: 'Squeeze a gas.\nWhy ×2 pressure?', y: 1575, size: 62 };
const BAND = { left: 0, top: 470, width: 640, height: 860 };
const appear = (t: number) => prog(t, 3.2, 0.7);

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera;
  const az = 0.14 * Math.sin((2 * Math.PI * t) / 24);      // a slow sway, so the glass always catches the light
  cam.position.set(7.4 * Math.sin(az), 3.1, 7.4 * Math.cos(az)); cam.fov = 30; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, 1.45, 0); cam.updateProjectionMatrix();
  return null;
}

function Scene({ t }: { t: number }) {
  const h = heightAt(t), a = appear(t), face = h + R_BALL;   // the piston's underside sits a ball's radius above the top centres
  const glassTop = H_FULL + R_BALL + 0.55, glassMid = (glassTop - R_BALL) / 2;
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[-3, 6, 5]} intensity={2.2} />
      <directionalLight position={[4, 2, -3]} intensity={0.6} />
      <group scale={[1, 1, 1]} visible={a > 0}>
        {/* floor of the cylinder */}
        <mesh position={[0, -R_BALL - 0.04, 0]}>
          <cylinderGeometry args={[R_GLASS + 0.04, R_GLASS + 0.04, 0.08, 64]} />
          <meshStandardMaterial color="#c9ced8" roughness={0.5} metalness={0.2} transparent opacity={a} />
        </mesh>
        {/* the gas */}
        {Array.from({ length: N }, (_, i) => {
          const [x, y, z] = particleAt(i, t), hit = justHit(i, t);
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[R_BALL, 20, 20]} />
              <meshStandardMaterial color={hit ? P.amber : P.blue} emissive={hit ? P.amber : '#000000'} emissiveIntensity={hit ? 0.5 : 0}
                roughness={0.35} metalness={0.1} transparent opacity={a} />
            </mesh>
          );
        })}
        {/* the piston and its rod */}
        <mesh position={[0, face + 0.08, 0]}>
          <cylinderGeometry args={[R_GLASS - 0.02, R_GLASS - 0.02, 0.16, 64]} />
          <meshStandardMaterial color="#aab3c2" roughness={0.28} metalness={0.65} transparent opacity={a} />
        </mesh>
        <mesh position={[0, (face + 0.16 + 3.75) / 2, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 3.75 - face - 0.16, 24]} />
          <meshStandardMaterial color="#8d97a8" roughness={0.3} metalness={0.7} transparent opacity={a} />
        </mesh>
        <mesh position={[0, 3.78, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.07, 48]} />
          <meshStandardMaterial color="#8d97a8" roughness={0.3} metalness={0.7} transparent opacity={a} />
        </mesh>
        {/* the glass: a thin see-through tube with two rims */}
        <mesh position={[0, glassMid, 0]} renderOrder={2}>
          <cylinderGeometry args={[R_GLASS + 0.02, R_GLASS + 0.02, glassTop + R_BALL, 72, 1, true]} />
          <meshPhysicalMaterial color="#dfe8f5" roughness={0.08} metalness={0} transparent opacity={0.2 * a} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {[-R_BALL, glassTop].map(y => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R_GLASS + 0.02, 0.018, 12, 96]} />
            <meshStandardMaterial color={P.ink} transparent opacity={0.45 * a} />
          </mesh>
        ))}
      </group>
    </>
  );
}

// P against V, straightening into P against 1/V. An SVG laid over the right of the frame.
const G = { x0: 700, y0: 1100, w: 330, h: 440, pMax: 4.6 };
function Graph({ t }: { t: number }) {
  const a = prog(t, 3.6, 0.7); if (a <= 0) return null;
  const k = flipAt(t), xMax = 4.6 + (1.15 - 4.6) * k;
  const X = (x: number) => G.x0 + (x / xMax) * G.w, Y = (p: number) => G.y0 - (p / G.pMax) * G.h;
  const pts = curveSamples(t, k), g = graphPoint(t), gx = g.V + (1 / g.V - g.V) * k;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.P).toFixed(1)}`).join(' ');
  const tickV = [1, 2, 3, 4], tickI = [0.25, 0.5, 0.75, 1];
  const lab = (x: number, y: number, s: string, o: number, anchor: 'middle' | 'end' = 'middle', color: string = P.muted, size = 34) =>
    o > 0 ? <text x={x} y={y} textAnchor={anchor} fill={color} opacity={o} style={{ ...hand(size) }}>{s}</text> : null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      <line x1={G.x0} y1={G.y0} x2={G.x0 + G.w + 20} y2={G.y0} stroke={P.axis} strokeWidth={2.5} />
      <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.y0 - G.h - 20} stroke={P.axis} strokeWidth={2.5} />
      {[1, 2, 3, 4].map(p => <React.Fragment key={p}>
        <line x1={G.x0 - 8} y1={Y(p)} x2={G.x0} y2={Y(p)} stroke={P.axis} strokeWidth={2} />
        {lab(G.x0 - 16, Y(p) + 10, String(p), 1, 'end')}
      </React.Fragment>)}
      {tickV.map(v => lab(X(v + (1 / v - v) * k), G.y0 + 40, String(v), 1 - k))}
      {tickI.map(v => lab(X(v), G.y0 + 40, String(v), k))}
      {lab(G.x0 + 6, G.y0 - G.h - 34, 'P', 1, 'middle', P.ink, 38)}
      {lab(G.x0 + G.w + 26, G.y0 + 82, 'V', 1 - k, 'end', P.ink, 38)}
      {lab(G.x0 + G.w + 26, G.y0 + 82, '1/V', k, 'end', P.ink, 38)}
      {pts.length > 1 && <path d={d} fill="none" stroke={P.green} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      <circle cx={X(gx)} cy={Y(g.P)} r={13} fill={P.green} stroke="#fff" strokeWidth={4} />
    </svg>
  );
}

function Readouts({ t }: { t: number }) {
  const a = prog(t, 3.6, 0.6), V = volumeAt(t), Pr = pressureAt(t), num = { fontVariantNumeric: 'tabular-nums' as const };
  return (
    <>
      <MathRow y={1372} size={46} opacity={a}>
        <span style={{ color: P.blue, marginRight: 56 }}>V <span style={num}>{V.toFixed(1)}</span> L</span>
        <span style={{ color: P.green, marginRight: 56 }}>P <span style={num}>{Pr.toFixed(1)}</span> atm</span>
        <span>P × V = <span style={num}>{(V * Pr).toFixed(1)}</span></span>
      </MathRow>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1408, textAlign: 'center', opacity: a, font: `600 38px ${SOFT_UI}`, color: P.muted }}>
        hits on the piston: <span style={{ color: P.amber, ...num }}>{hitsPerSecond(t)}</span> a second
      </div>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Half the space, twice the hits.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #3' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics002({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <TitleCard t={t} label={'PHYSICS, VISUALISED  #2'} lines={['Why does squeezing a gas', 'raise its pressure?']} size={70} />
      <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, opacity: appear(t) }}>
        <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}>
          <Scene t={t} />
        </ThreeCanvas>
      </div>
      <Graph t={t} />
      <Readouts t={t} />
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1560} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('pv-physics-002-boyle.wav')} />}
    </AbsoluteFill>
  );
}
