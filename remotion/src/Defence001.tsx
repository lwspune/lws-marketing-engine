// @lws.pune · defence #1 (3D, predict-first): Indian Army officer ranks on a shoulder strap. An olive strap with brass
// badges turns once round (F22) under "Which rank wears this?"; B Brigadier lights, a gold line joins its three stars, one
// slides off (Colonel, the trap); then the badges land rank by rank, Lieutenant to General, beside a ladder of the ranks,
// and the Field Marshal last. Our own simplified drawings of the badges (storyboard § 8); the emblem only ever as part of a
// badge. Timeline: lib/defence001.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { captionAt } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, STRAP, STAR_R, EMBLEM, WREATH_R, TRIANGLE_PTS, LADDER,
  BAND, badgesAt, popAt, flashAt, triangleAt, cameraAt, ladderAt, rankNameAt, type BadgeKind, type V3,
} from './lib/defence001.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, useFonts, type EndLine } from './board.tsx';
import { RealLight } from './realism.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Which rank wears this?', y: 1590, size: 60 };
const FRONT = STRAP.t / 2;

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

/** The strap's outline: straight sides, a blunt point at the top, rounded corners. */
function strapShape() {
  const { w, len, point } = STRAP, h = len / 2, r = 0.06, s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h); s.lineTo(w / 2 - r, -h); s.quadraticCurveTo(w / 2, -h, w / 2, -h + r);
  s.lineTo(w / 2, h - point); s.lineTo(0.08, h - 0.03); s.quadraticCurveTo(0, h + 0.01, -0.08, h - 0.03);
  s.lineTo(-w / 2, h - point); s.lineTo(-w / 2, -h + r); s.quadraticCurveTo(-w / 2, -h, -w / 2 + r, -h);
  return s;
}

function Strap() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(strapShape(), { depth: STRAP.t - 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 4, curveSegments: 24 });
    g.translate(0, 0, -(STRAP.t - 0.03) / 2);
    return g;
  }, []);
  // stitching: a dashed darker line just inside the edge
  const seam = useMemo(() => {
    const pts = strapShape().getSpacedPoints(160).map(p => new THREE.Vector3(p.x * 0.9, p.y * 0.965, FRONT + 0.002));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: COLORS.strapEdge, dashSize: 0.02, gapSize: 0.012 }));
    line.computeLineDistances();
    return line;
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.strap} roughness={0.92} metalness={0} />
      </mesh>
      <primitive object={seam} />
      <mesh position={[0, STRAP.button.y, FRONT + 0.01]} scale={[1, 1, 0.45]} castShadow>
        <sphereGeometry args={[STRAP.button.r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.brass} metalness={0.9} roughness={0.32} />
      </mesh>
    </group>
  );
}

const extrude = (shape: THREE.Shape, depth = 0.018) =>
  new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 3, curveSegments: 16 });
function starShape(R: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.42 : R, x = r * Math.cos(a), y = r * Math.sin(a);
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}
function box(x0: number, y0: number, x1: number, y1: number) {
  const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath(); return s;
}
const ellipse = (x: number, y: number, rx: number, ry: number) => { const s = new THREE.Shape(); s.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, 0); return s; };
/** A lion's maned head: a circle with a scalloped edge. */
function mane(x: number, y: number, r: number) {
  const s = new THREE.Shape();
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2, k = r * (0.88 + 0.12 * Math.abs(Math.cos(6 * a)));
    if (i) s.lineTo(x + k * Math.cos(a), y + k * Math.sin(a)); else s.moveTo(x + k * Math.cos(a), y + k * Math.sin(a));
  }
  return s;
}
/** The national emblem, simplified: three lions on an abacus with a wheel. The middle lion faces us (a maned head over a
 *  chest and forelegs); the outer two are in profile, their muzzles pointing out. Raised parts stand proud of the rest. */
function emblemParts() {
  const W = EMBLEM.w, b = -EMBLEM.h / 2;
  return {
    base: [box(-W / 2, b, W / 2, b + 0.07),
      ellipse(-0.085, b + 0.16, 0.05, 0.085), ellipse(0.085, b + 0.16, 0.05, 0.085),
      box(-0.04, b + 0.07, -0.018, b + 0.14), box(0.018, b + 0.07, 0.04, b + 0.14), ellipse(0, b + 0.16, 0.055, 0.07)],
    heads: [mane(-0.09, b + 0.285, 0.055), mane(0.09, b + 0.285, 0.055), ellipse(-0.145, b + 0.275, 0.032, 0.02), ellipse(0.145, b + 0.275, 0.032, 0.02),
      mane(0, b + 0.31, 0.07)],
    face: ellipse(0, b + 0.3, 0.032, 0.038),
    wheel: [0, b + 0.035] as [number, number],
  };
}

function Brass({ glow = 0, opacity = 1 }: { glow?: number; opacity?: number }) {
  return <meshStandardMaterial color={COLORS.brass} metalness={0.75} roughness={0.28} emissive={COLORS.brass} emissiveIntensity={0.12 + glow}
    transparent={opacity < 1} opacity={opacity} />;
}

/** A straight rod from a to b (x, y) at height z off the badge. */
function Rod2({ a, b, r, z = 0.02, opacity, glow = 0 }: { a: [number, number]; b: [number, number]; r: number; z?: number; opacity: number; glow?: number }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]} rotation={[0, 0, ang - Math.PI / 2]} castShadow>
    <cylinderGeometry args={[r, r, len, 16]} /><Brass opacity={opacity} glow={glow} />
  </mesh>;
}
function Baton({ angle, opacity }: { angle: number; opacity: number }) {
  const h = 0.3, c = Math.cos(angle), s = Math.sin(angle), a: [number, number] = [-h * c, -h * s], b: [number, number] = [h * c, h * s];
  return <>
    <Rod2 a={a} b={b} r={0.026} z={0.03} opacity={opacity} />
    {[a, b].map((p, i) => <mesh key={i} position={[p[0], p[1], 0.03]} castShadow><sphereGeometry args={[0.038, 16, 12]} /><Brass opacity={opacity} /></mesh>)}
  </>;
}
function Sabre({ opacity }: { opacity: number }) {
  const geo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.22, -0.2, 0.02), new THREE.Vector3(0.02, 0.1, 0.02), new THREE.Vector3(0.33, 0.2, 0.02));
    return new THREE.TubeGeometry(curve, 32, 0.017, 8, false);
  }, []);
  return <>
    <mesh geometry={geo} castShadow><Brass opacity={opacity} /></mesh>
    {/* the hilt: a guard across the blade and a grip */}
    <Rod2 a={[-0.27, -0.15]} b={[-0.17, -0.25]} r={0.016} opacity={opacity} />
    <Rod2 a={[-0.22, -0.2]} b={[-0.31, -0.29]} r={0.022} opacity={opacity} />
  </>;
}

function Badge({ kind, id, t, opacity }: { kind: BadgeKind; id: string; t: number; opacity: number }) {
  const star = useMemo(() => extrude(starShape(STAR_R)), []);
  const em = useMemo(() => {
    const p = emblemParts();
    return { base: p.base.map(s => extrude(s, 0.016)), heads: p.heads.map(s => extrude(s, 0.03)), face: extrude(p.face, 0.045), wheel: p.wheel };
  }, []);
  if (kind === 'star') return <mesh geometry={star} castShadow><Brass glow={0.9 * flashAt(id, t)} opacity={opacity} /></mesh>;
  if (kind === 'emblem') return <group>
    {[...em.base, ...em.heads, em.face].map((g, i) => <mesh key={i} geometry={g} castShadow><Brass opacity={opacity} /></mesh>)}
    {/* the wheel on the abacus: rim, hub and spokes, standing proud */}
    <group position={[em.wheel[0], em.wheel[1], 0.04]}>
      <mesh><torusGeometry args={[0.026, 0.006, 8, 28]} /><Brass opacity={opacity} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.007, 0.007, 0.012, 10]} /><Brass opacity={opacity} /></mesh>
      {[0, 1, 2, 3].map(i => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}><cylinderGeometry args={[0.0028, 0.0028, 0.05, 6]} /><Brass opacity={opacity} /></mesh>)}
    </group>
  </group>;
  if (kind === 'swordBaton') return <group>
    <group rotation={[0, 0, 0]}><Sabre opacity={opacity} /></group>
    <Baton angle={-0.62} opacity={opacity} />
  </group>;
  // the field marshal's: two crossed batons in a wreath of leaves (the leaves drawn plainly, not named)
  const leaves: { x: number; y: number; a: number }[] = [];
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const ang = -Math.PI / 2 + side * (0.25 + i * 0.25), x = WREATH_R * Math.cos(ang), y = WREATH_R * Math.sin(ang);
    leaves.push({ x, y, a: ang + (side * Math.PI) / 2 });
  }
  return <group>
    <Baton angle={0.7} opacity={opacity} /><Baton angle={-0.7} opacity={opacity} />
    {leaves.map((l, i) => <mesh key={i} position={[l.x, l.y, 0.02]} rotation={[0, 0, l.a]} scale={[0.055, 0.024, 0.014]} castShadow>
      <sphereGeometry args={[1, 16, 10]} /><Brass opacity={opacity} />
    </mesh>)}
  </group>;
}

function Badges({ t }: { t: number }) {
  return <>{badgesAt(t).filter(b => b.alpha > 0.01).map(b => (
    <group key={`${b.id}-${b.kind}`} position={[b.x, b.y, FRONT + 0.004 + b.z]} scale={popAt(b, t)}>
      <Badge kind={b.kind} id={b.id} t={t} opacity={b.alpha} />
    </group>
  ))}</>;
}

function Triangle({ t }: { t: number }) {
  const { drawn, alpha } = triangleAt(t);
  if (drawn <= 0 || alpha <= 0.01) return null;
  const segs = TRIANGLE_PTS.length - 1, out = [];
  for (let i = 0; i < segs; i++) {
    const p = Math.min(1, Math.max(0, drawn * segs - i)); if (p <= 0) break;
    const a = TRIANGLE_PTS[i], b = TRIANGLE_PTS[i + 1], e: [number, number] = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
    const len = Math.hypot(e[0] - a[0], e[1] - a[1]), ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
    out.push(<mesh key={i} position={[(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, FRONT + 0.004]} rotation={[0, 0, ang - Math.PI / 2]}>
      <cylinderGeometry args={[0.014, 0.014, len, 10]} />
      <meshBasicMaterial color={COLORS.line} transparent opacity={alpha} toneMapped={false} />
    </mesh>);
  }
  return <>{out}</>;
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <CameraRig t={t} />
      <RealLight env={0.9} at={[-3, 6, 8]} span={4} />
      <pointLight position={[2.5, 1.5, 3]} intensity={6} color="#fff3d6" />
      {/* the strap's back, seen for ~0.6 s in the orbit: lit, so it stays olive cloth, not a black slab (panel pass 1) */}
      <directionalLight position={[1, 3, -8]} intensity={4} color="#fff6e6" />
      <Strap />
      <Badges t={t} />
      <Triangle t={t} />
    </>
  );
}

function Ladder({ t }: { t: number }) {
  return <>{ladderAt(t).filter(r => r.alpha > 0.01).map(r => (
    <div key={r.text} style={{ position: 'absolute', left: LADDER.x, top: r.y - LADDER.size * 0.6, height: LADDER.size * 1.2, display: 'flex', alignItems: 'center',
      opacity: r.alpha, font: `${r.weight} ${LADDER.size}px ${SOFT_UI}`, color: r.state === 'lit' ? COLORS.lit : r.state === 'next' ? P.muted : P.ink, whiteSpace: 'pre' }}>
      {r.marker && <div style={{ position: 'absolute', left: -30, width: 16, height: 16, borderRadius: 8, background: COLORS.lit }} />}
      {r.text}
    </div>
  ))}</>;
}

function RankName({ t }: { t: number }) {
  const { fps } = useVideoConfig(), n = rankNameAt(t);
  if (!n || n.alpha <= 0.01) return null;
  const s = spring({ frame: (n.age - 0.15) * fps, fps, config: { damping: 14, mass: 0.6 } });
  return <div style={{ position: 'absolute', left: n.x, top: n.y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * s})`, opacity: n.alpha,
    font: `800 ${n.size}px ${SOFT_UI}`, color: P.ink, whiteSpace: 'pre', textShadow: `0 2px 10px ${tint(P.board, 0.9)}` }}>{n.text}</div>;
}

const END: EndLine[] = [
  { at: 0.3, size: 62, weight: 700, color: P.ink, text: '9 ranks.' },
  { at: 0.6, size: 58, weight: 600, color: P.ink, text: 'Lieutenant to General.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Defence001({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA  ·  ARMY RANKS'} lines={['Which rank wears this?', 'Look at the shoulder.']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={290} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.03, bottom: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        {!cover && <Ladder t={t} />}
        {!cover && <RankName t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-defence-001-army-ranks-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
export type { V3 };
