// Realism demo 5 (2026-10-20, for the founder to judge): one Bunsen burner, two flames. Top: the flame our reels draw
// today (Chemistry #6: three soft cone shapes that flicker). Bottom: three.quarks particles (flame, sparks, heat haze),
// replayed from 0 for every frame with a seeded random (lib/demoParticles.ts). Dark board: glowing particles add light,
// which vanishes on our white board.
import { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI } from './lib/palette.ts';
import { flameAt } from './lib/demoParticles.ts';
import { Board, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';

const PANEL = { w: 1080, h: 820 };
const FLAME = new THREE.LatheGeometry(Array.from({ length: 33 }, (_, k) => {
  const u = k / 32; return new THREE.Vector2(Math.max(0.0005, Math.sin(Math.PI * u ** 0.55) * (1 - u) ** 0.35), u);
}), 40);
// A soft round sprite for the particles, drawn once.
const sprite = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!, r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const GLOW = new THREE.MeshBasicMaterial({ map: sprite }), HAZE = new THREE.MeshBasicMaterial({ map: sprite });

function Rig() {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(0, 1.2, 4.2); cam.fov = 30; cam.aspect = PANEL.w / PANEL.h; cam.lookAt(0, 0.95, 0); cam.updateProjectionMatrix();
  return null;
}

function Burner() {
  return (
    <>
      <mesh position={[0, 0.05, 0]}><RoundBox size={[0.62, 0.1, 0.46]} radius={0.04} /><meshStandardMaterial color="#59606e" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.075, 0.085, 0.8, 24]} /><meshStandardMaterial color="#9aa3b2" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.11, 0.11, 0.12, 24]} /><meshStandardMaterial color="#7d889a" metalness={0.6} roughness={0.35} /></mesh>
    </>
  );
}

// Today's flame (as in PvChem006, gas-blue turning orange): outer flame, bright body, pale inner cone, flickering.
function ConeFlame({ t }: { t: number }) {
  const f = 1 + 0.1 * Math.sin(t * 17) + 0.06 * Math.sin(t * 31), col = new THREE.Color('#ff8a3d');
  return (
    <>
      <mesh geometry={FLAME} position={[0, 0.88, 0]} scale={[0.3, 1.05 * f, 0.3]}><meshBasicMaterial color={col} transparent opacity={0.22} depthWrite={false} /></mesh>
      <mesh geometry={FLAME} position={[0, 0.9, 0]} scale={[0.2, 0.85 * f, 0.2]}><meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} transparent opacity={0.75} depthWrite={false} /></mesh>
      <mesh geometry={FLAME} position={[0, 0.9, 0]} scale={[0.085, 0.3 * f, 0.085]}><meshStandardMaterial color="#cfe0ff" emissive="#9cc2ff" emissiveIntensity={0.9} transparent opacity={0.75} depthWrite={false} /></mesh>
      <pointLight position={[0, 1.2, 0.3]} intensity={2.4} distance={2.6} color={col} />
    </>
  );
}

function ParticleFlame({ frame }: { frame: number }) {
  const scene = useMemo(() => { const s = flameAt(frame, GLOW, HAZE).scene; s.position.set(0, 0.9, 0); return s; }, [frame]);
  return (<><primitive object={scene} /><pointLight position={[0, 1.2, 0.3]} intensity={2.4 + 0.4 * Math.sin(frame * 0.9)} distance={2.6} color="#ff8a3d" /></>);
}

function Panel({ top, title, note, children }: { top: number; title: string; note: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top, width: PANEL.w, height: PANEL.h }}>
        <ThreeCanvas width={PANEL.w} height={PANEL.h} gl={{ antialias: true, alpha: true }}>
          <Rig /><ambientLight intensity={0.55} /><directionalLight position={[-3, 6, 5]} intensity={1.4} />
          <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.2, 64]} /><meshStandardMaterial color="#1c2431" roughness={0.9} /></mesh>
          <Burner />{children}
        </ThreeCanvas>
      </div>
      <div style={{ position: 'absolute', left: 60, top: top + 24, ...hand(46), color: P.ink }}>{title}</div>
      <div style={{ position: 'absolute', left: 60, top: top + 84, font: `600 30px ${SOFT_UI}`, color: P.muted }}>{note}</div>
    </>
  );
}

export function DemoParticles() {
  useFonts();
  const frame = useCurrentFrame(), t = frame / 30;
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 70, textAlign: 'center', font: `700 34px ${SOFT_UI}`, color: P.muted }}>REALISM DEMO 5 · PARTICLES (THREE.QUARKS)</div>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 120, textAlign: 'center', ...hand(40), color: P.ink }}>One Bunsen burner, two ways to draw the flame</div>
        <Panel top={210} title="Now: cone shapes" note="three soft cones that flicker"><ConeFlame t={t} /></Panel>
        <Panel top={1060} title="three.quarks: particles" note="flame, sparks and heat haze"><ParticleFlame frame={frame} /></Panel>
      </AbsoluteFill>
    </Theme>
  );
}
