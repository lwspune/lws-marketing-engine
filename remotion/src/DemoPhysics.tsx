// Realism demo 4 (2026-10-20, for the founder to judge): the same 40 gas molecules in a glass box, a lid squeezing
// them from 2 s. Top: how our reels move molecules today (they pass through each other). Bottom: the Rapier physics
// engine (they collide). Same start, same lighting; only the motion differs. Data: tools/simulate.ts.
import { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI } from './lib/palette.ts';
import { BOX, R, lidAt } from './lib/demoPhysics.ts';
import { Board, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';

type Runs = { plain: number[][][]; rapier: number[][][] };
const PANEL = { w: 1080, h: 820 };
const COLOURS = ['#3f7be0', '#e0533f', '#2aa876', '#e0a03f'];

function Rig() {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(3.1, 2.3, 5.7); cam.fov = 32; cam.aspect = PANEL.w / PANEL.h; cam.lookAt(0, -0.35, 0);
  cam.updateProjectionMatrix();
  return null;
}

function Box({ frame, at }: { frame: number; at: number[][] }) {
  const lid = lidAt(frame / 30);
  return (
    <>
      <Rig />
      <ambientLight intensity={1.15} />
      <directionalLight position={[-3, 6, 4]} intensity={2.0} />
      <mesh position={[0, -BOX.y - 0.06, 0]}><RoundBox size={[2 * BOX.x + 0.3, 0.12, 2 * BOX.z + 0.3]} radius={0.05} /><meshStandardMaterial color="#d9dee7" roughness={0.6} /></mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2 * BOX.x, 2 * BOX.y, 2 * BOX.z]} />
        <meshStandardMaterial color="#9fc3e6" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(2 * BOX.x, 2 * BOX.y, 2 * BOX.z)]} /><lineBasicMaterial color="#7d8aa3" /></lineSegments>
      <mesh position={[0, lid + 0.05, 0]}><RoundBox size={[2 * BOX.x - 0.02, 0.1, 2 * BOX.z - 0.02]} radius={0.04} /><meshStandardMaterial color="#8d97a8" metalness={0.5} roughness={0.35} /></mesh>
      <mesh position={[0, lid + 0.5, 0]}><cylinderGeometry args={[0.06, 0.06, 0.8, 20]} /><meshStandardMaterial color="#8d97a8" metalness={0.6} roughness={0.35} /></mesh>
      {at.map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}><sphereGeometry args={[R, 24, 24]} /><meshStandardMaterial color={COLOURS[i % 4]} roughness={0.35} /></mesh>
      ))}
    </>
  );
}

function Panel({ top, title, note, frame, at }: { top: number; title: string; note: string; frame: number; at: number[][] }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top, width: PANEL.w, height: PANEL.h }}>
        <ThreeCanvas width={PANEL.w} height={PANEL.h} gl={{ antialias: true, alpha: true }}><Box frame={frame} at={at} /></ThreeCanvas>
      </div>
      <div style={{ position: 'absolute', left: 60, top: top + 24, ...hand(46), color: P.ink }}>{title}</div>
      <div style={{ position: 'absolute', left: 60, top: top + 84, font: `600 30px ${SOFT_UI}`, color: P.muted }}>{note}</div>
    </>
  );
}

export function DemoPhysics() {
  useFonts();
  const frame = useCurrentFrame();
  const [runs, setRuns] = useState<Runs | null>(null);
  const [handle] = useState(() => delayRender('physics data'));
  useEffect(() => {
    fetch(staticFile('demo-physics.json')).then(r => r.json()).then((j: Runs) => { setRuns(j); continueRender(handle); });
  }, [handle]);
  if (!runs) return null;
  const k = Math.min(frame, runs.plain.length - 1);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 70, textAlign: 'center', font: `700 34px ${SOFT_UI}`, color: P.muted }}>REALISM DEMO 4 · PHYSICS (RAPIER)</div>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 120, textAlign: 'center', ...hand(40), color: P.ink }}>Same 40 molecules, same start · the lid squeezes from 2 s</div>
        <Panel top={210} title="Now: straight lines" note="they pass through each other" frame={frame} at={runs.plain[k]} />
        <Panel top={1060} title="Rapier: real collisions" note="they bounce off each other too" frame={frame} at={runs.rapier[k]} />
      </AbsoluteFill>
    </Theme>
  );
}
