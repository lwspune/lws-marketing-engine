// Reel 014, NDA 2026 (II) Q68: r = (cos θ) î + (sin θ) ĵ + k̂ makes π/4 with the z-axis for every θ.
// The first 3D reel: a real three.js scene (the arrow sweeping its cone, the "up 1, across 1" triangle)
// under a camera that circles from frame 0, with the question card, captions and working as HTML on top.
import React, { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  BAND, ANSWER_AT, END_AT, CAPTIONS, thetaAt, coneFraction, arrowGrow, tip, cameraAt, project, labels, working,
  spokeAlpha, triangleAlpha, arcAlpha, trapAlpha, type V3,
} from './lib/reel014.ts';
import { Board, Card, Caption, MathRow, C, Chips, EndCard, hand, useFonts, type EndLine } from './board.tsx';

const PI = Math.PI;
const COVER = { t: 12.1, text: 'θ changes.\nThe angle doesn’t.', y: 1440, size: 76 };
const v = (p: V3) => new THREE.Vector3(...p);

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

// A rounded line between two points (WebGL lines are always 1 px, so lines are thin tubes).
function Rod({ from, to, r, color, opacity = 1, basic = false, shadow = false }:
  { from: V3; to: V3; r: number; color: string; opacity?: number; basic?: boolean; shadow?: boolean }) {
  const a = v(from), b = v(to), len = a.distanceTo(b);
  if (opacity <= 0 || len < 1e-4) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q} castShadow={shadow}>
      <cylinderGeometry args={[r, r, len, 20]} />
      {basic
        ? <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
        : <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.45} metalness={0.05} />}
    </mesh>
  );
}
function Dashed({ from, to, r, color, opacity }: { from: V3; to: V3; r: number; color: string; opacity: number }) {
  if (opacity <= 0) return null;
  const a = v(from), b = v(to), n = Math.max(2, Math.round(a.distanceTo(b) / 0.1));
  return <>{Array.from({ length: n }, (_, i) => {
    const p0 = a.clone().lerp(b, i / n), p1 = a.clone().lerp(b, (i + 0.55) / n);
    return <Rod key={i} from={p0.toArray() as V3} to={p1.toArray() as V3} r={r} color={color} opacity={opacity} basic />;
  })}</>;
}
function Tube({ points, r, color, opacity = 1 }: { points: V3[]; r: number; color: string; opacity?: number }) {
  const geo = useMemo(() => points.length < 2 ? null : new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v)), Math.max(8, points.length * 2), r, 12, false), [points, r]);
  if (!geo || opacity <= 0) return null;
  return <mesh geometry={geo}><meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.5} /></mesh>;
}
function Arrow({ to, color, r = 0.028, opacity = 1 }: { to: V3; color: string; r?: number; opacity?: number }) {
  const e = v(to), len = e.length(); if (len < 1e-3 || opacity <= 0) return null;
  const head = Math.min(0.17, len * 0.4), dir = e.clone().normalize(), base = dir.clone().multiplyScalar(len - head);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <>
      <Rod from={[0, 0, 0]} to={base.toArray() as V3} r={r} color={color} opacity={opacity} shadow />
      <mesh position={base.clone().add(dir.clone().multiplyScalar(head / 2))} quaternion={q} castShadow>
        <coneGeometry args={[r * 2.7, head, 28]} />
        <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.45} />
      </mesh>
    </>
  );
}
// A filled flat shape (triangle fan from the first point).
function Fan({ points, color, opacity }: { points: V3[]; color: string; opacity: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), pos: number[] = [];
    for (let i = 1; i < points.length - 1; i++) pos.push(...points[0], ...points[i], ...points[i + 1]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  }, [points]);
  if (opacity <= 0 || points.length < 3) return null;
  return <mesh geometry={geo}><meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
}

function Scene({ t }: { t: number }) {
  const th = thetaAt(t), g = arrowGrow(t), frac = coneFraction(t), [c, s] = [Math.cos(th), Math.sin(th)], P1 = tip(th);
  const tri = triangleAlpha(t), arc = arcAlpha(t), trap = trapAlpha(t), spoke = spokeAlpha(t);
  // The cone the arrow has swept (side surface), its rim at height 1, and ghost arrows every 30° it has passed.
  const rim: V3[] = [], swept = frac * 2 * PI;
  for (let i = 0; i <= Math.ceil(64 * frac); i++) { const a = Math.min(swept, (i / 64) * 2 * PI); rim.push([Math.cos(a), Math.sin(a), 1]); }
  const ghosts = Array.from({ length: Math.floor(swept / (PI / 6) + 1e-9) }, (_, i) => tip((i + 1) * PI / 6)).filter(() => frac < 1 || true);
  const arcPts: V3[] = Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * (PI / 4); return [0.42 * Math.sin(a) * c, 0.42 * Math.sin(a) * s, 0.42 * Math.cos(a)]; });
  const grid: V3[] = [];
  for (let x = -1.25; x <= 1.2501; x += 0.25) for (let y = -1.25; y <= 1.2501; y += 0.25) if (Math.abs(x) + Math.abs(y) > 0.01) grid.push([x, y, 0]);
  const sq = 0.13, sh: V3 = [c, s, 0];
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[-3, -4, 7]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <mesh receiveShadow position={[0, 0, -0.001]}><planeGeometry args={[8, 8]} /><shadowMaterial transparent opacity={0.1} /></mesh>
      {grid.map((p, i) => <mesh key={i} position={p}><circleGeometry args={[0.011, 10]} /><meshBasicMaterial color={P.ink} transparent opacity={0.16} /></mesh>)}
      {/* axes */}
      <Rod from={[0, 0, 0]} to={[1.35, 0, 0]} r={0.008} color={P.ink} opacity={0.45} basic />
      <Rod from={[0, 0, 0]} to={[0, 1.35, 0]} r={0.008} color={P.ink} opacity={0.45} basic />
      <Rod from={[0, 0, 0]} to={[0, 0, 1.45]} r={0.008} color={P.ink} opacity={0.45} basic />
      {/* the cone swept so far */}
      <Fan points={[[0, 0, 0], ...rim]} color={P.green} opacity={0.14 * Math.min(1, frac * 4)} />
      <Fan points={[[0, 0, 1], ...rim]} color={P.green} opacity={0.06 * Math.min(1, frac * 4)} />
      <Tube points={rim} r={0.012} color={P.blue} opacity={0.85} />
      {ghosts.map((p, i) => <Rod key={i} from={[0, 0, 0]} to={p} r={0.006} color={P.blue} opacity={0.22} basic />)}
      {/* the arrow, its height-1 point on the z-axis and the dashed "across 1" */}
      <mesh position={[0, 0, 1]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color={P.ink} transparent opacity={0.6 * spoke} /></mesh>
      <Dashed from={[0, 0, 1]} to={P1} r={0.007} color={P.muted} opacity={spoke * (1 - tri)} />
      <Arrow to={[P1[0] * g, P1[1] * g, P1[2] * g]} color={P.blue} />
      {/* the triangle: up 1 (z-axis), across 1 (radius at height 1), long side √2 (the arrow); γ at the origin */}
      <Fan points={[[0, 0, 0], [0, 0, 1], P1]} color={P.green} opacity={0.24 * tri} />
      <Rod from={[0, 0, 0]} to={[0, 0, 1]} r={0.017} color={P.green} opacity={tri} />
      <Rod from={[0, 0, 1]} to={P1} r={0.017} color={P.green} opacity={tri} />
      <Tube points={arcPts} r={0.012} color={P.green} opacity={arc} />
      {/* trap (a): the floor shadow is at 90° to the z-axis */}
      <Dashed from={[0, 0, 0]} to={sh} r={0.008} color={P.muted} opacity={trap} />
      <Dashed from={sh} to={P1} r={0.005} color={P.muted} opacity={trap * 0.6} />
      <Tube points={[[sq * c, sq * s, 0], [sq * c, sq * s, sq], [0, 0, sq]]} r={0.006} color={P.muted} opacity={trap} />
    </>
  );
}

// Labels for the 3D figure, set in Cambria on top of the canvas at their projected positions.
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t), tone = { axis: P.muted, blue: P.blue, green: P.green, muted: P.muted };
  return <>{labels(t).filter(l => l.alpha > 0).map(l => {
    const p = project(l.at, cam), size = l.tone === 'axis' ? 34 : 40;
    return <div key={l.id} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', opacity: l.alpha, color: tone[l.tone],
      ...hand(size), whiteSpace: 'pre', textShadow: `0 0 6px ${P.board}, 0 0 12px ${P.board}` }}>{l.text}</div>;
  })}</>;
}

const Vec = ({ children }: { children: React.ReactNode }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>{children}
    <span style={{ position: 'absolute', left: '50%', top: '-0.62em', transform: 'translateX(-50%)', fontSize: '0.62em' }}>→</span></span>
);
function QuestionCard({ t }: { t: number }) {
  return (
    <>
      <Card x={110} y={460} w={860} h={380} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 515 - 28, textAlign: 'center', font: `600 34px ${SOFT_UI}`, color: P.muted, whiteSpace: 'pre' }}>
        NDA 2026 (II)  ·  Maths  ·  Q68
      </div>
      <MathRow y={612} size={54}><C color={P.blue}><Vec>r</Vec></C> = (cos θ) î + (sin θ) ĵ + k̂</MathRow>
      <MathRow y={684} size={42}>angle with the +z-axis = ?</MathRow>
      <Chips t={t} labels={['(a) π/2', '(b) π/3', '(c) π/4', '(d) π/6']} answer={2} at={ANSWER_AT} top={726} />
    </>
  );
}

function Working({ t }: { t: number }) {
  const w = working(t), Y = 1556;
  const a = (t0: number, t1: number) => prog(t, t0, 0.4) * (1 - prog(t, t1 - 0.3, 0.3));
  return (
    <>
      <MathRow y={Y} size={50} opacity={w.kind === 'length' ? a(12.6, 14.9) : 0}>
        |<Vec>r</Vec>| = √(cos²θ + sin²θ + 1) = <C color={P.green}>√2</C>
      </MathRow>
      <MathRow y={Y} size={52} opacity={w.kind === 'cos' ? a(14.9, 17.0) : 0}>
        cos γ = 1 / √2   ⇒   γ = <C color={P.green}>45°</C>
      </MathRow>
      <MathRow y={Y} size={56} opacity={w.kind === 'counter' ? prog(t, 17.0, 0.4) : 0}>
        θ = <span style={{ display: 'inline-block', width: 120, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w.deg ?? 0}°</span>
        <span style={{ display: 'inline-block', width: 90 }} />γ = <C color={P.green}>45°</C>
      </MathRow>
      <MathRow y={Y} size={46} opacity={w.kind === 'trap' ? prog(t, 25.0, 0.4) : 0}>
        <C color={P.muted}>|<Vec>r</Vec>| = √2, not 2  ·  shadow ⟂ z-axis</C>
      </MathRow>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Up 1, across 1?' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'Always 45°, for any θ.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel014({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <QuestionCard t={t} />
      <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height }}>
        <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
          <Scene t={t} />
        </ThreeCanvas>
      </div>
      <Labels t={t} />
      {!cover && <Working t={t} />}
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} rise={cap.caption.t0 > 0} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('nda-maths-014-cone.wav')} />}
    </AbsoluteFill>
  );
}
