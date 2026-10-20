// @pyqvault_ · Physics, visualised #7 (predict-first): lift the wall between a hot gas and a cold gas: after a while?
// Dark lab look (L22 rotation: P7 lab). A three.js glass box of 2,400 molecules from one simulation (lib/pp007.ts), each
// coloured by its own speed, the fast ones glowing (bloom, @react-three/postprocessing). The wall lifts, collisions pass
// the speed along, both thermometers settle at 300 K; a heat arrow draws itself between them (@remotion/paths) and thins
// as the gap closes; the graph draws both temperatures meeting. Framework v1.6.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { evolvePath } from '@remotion/paths';
import * as THREE from 'three';
import { LAB as P, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, N, BOX, FPS, T_LIFTED, T_HOT0, T_COLD0, CAMERA, positionsAt, speedSqAt,
  tempOfSpeedSq, shownTemps, smoothTemps, wallBottomAt, heatArrowAt,
} from './lib/pp007.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { t: 0.8, text: 'Hot meets cold. Then what?', y: 1590, size: 60 };   // the wall still down: no spoiler
const BAND = { left: 0, top: 470, width: 1080, height: 600 };
const R_DRAW = 0.02;

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, [zoom, focus] = tween(t, CAMERA.start, CAMERA.keys);
  const target = new THREE.Vector3(focus * 0.9, 0.45, 0);
  cam.position.copy(target.clone().add(new THREE.Vector3(0, 1.25, 4.4).divideScalar(zoom)));
  cam.fov = 30; cam.aspect = BAND.width / BAND.height; cam.lookAt(target); cam.updateProjectionMatrix();
  return null;
}

// A molecule's colour from its own temperature: blue (slow) → violet → amber → near-white (fast). Above 1 the bloom
// pass makes it glow, so only the fast molecules shine.
const STOPS: [number, THREE.Color][] = [
  [70, new THREE.Color('#3f6bff')], [170, new THREE.Color('#86a8ff')], [260, new THREE.Color('#c58bff')],
  [430, new THREE.Color('#ffb35c')], [780, new THREE.Color('#fff1c9')],
];
function colourOf(T: number, out: THREE.Color) {
  const k = STOPS.findIndex(([at]) => T < at);
  if (k <= 0) out.copy(STOPS[k === 0 ? 0 : STOPS.length - 1][1]);
  else { const [a, ca] = STOPS[k - 1], [b, cb] = STOPS[k]; out.copy(ca).lerp(cb, (T - a) / (b - a)); }
  return out.multiplyScalar(0.75 + 1.6 * Math.max(0, Math.min(1, (T - 380) / 420)));
}

// The bloom pass only draws from the canvas's second render, and Remotion captures the first frame a tab renders after
// one: hold that frame until the scene has rendered once more, or the cover and each tab's first frame come out blank.
function BloomWarmUp() {
  const advance = useThree(s => s.advance), [handle] = useState(() => delayRender('bloom warm-up'));
  useEffect(() => {
    const id = requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); });
    return () => cancelAnimationFrame(id);
  }, [advance, handle]);
  return null;
}

function Molecules({ t }: { t: number }) {
  const ref = useRef<THREE.InstancedMesh>(null), f = Math.min(Math.round(t * FPS), Math.round(END_AT * FPS) + 30);
  const geo = useMemo(() => new THREE.SphereGeometry(R_DRAW, 10, 8), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  useLayoutEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const p = positionsAt(f), s = speedSqAt(f), m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      mesh.setMatrixAt(i, m.makeTranslation(p[3 * i], p[3 * i + 1], p[3 * i + 2]));
      mesh.setColorAt(i, colourOf(tempOfSpeedSq(s[i]), c));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [f]);
  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />;
}

function Box({ t }: { t: number }) {
  const { l, h, d } = BOX, bottom = wallBottomAt(t), fade = 1 - prog(t, T_LIFTED, 0.5);
  return (
    <>
      {/* glass box with soft rounded edges, a darker floor */}
      <mesh position={[0, h / 2, 0]} renderOrder={2}><RoundBox size={[2 * l + 0.08, h + 0.08, 2 * d + 0.08]} radius={0.06} />
        <meshPhysicalMaterial color="#cfe0ff" roughness={0.1} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -0.06, 0]}><RoundBox size={[2 * l + 0.24, 0.08, 2 * d + 0.24]} radius={0.04} /><meshStandardMaterial color="#5f6880" roughness={0.5} metalness={0.4} /></mesh>
      {/* the dividing wall slides up out of the box, then fades */}
      {fade > 0 && <mesh position={[0, bottom + h / 2, 0]} renderOrder={1}><RoundBox size={[0.05, h, 2 * d + 0.04]} radius={0.02} />
        <meshStandardMaterial color="#aab3c2" roughness={0.35} metalness={0.6} transparent opacity={0.92 * fade} /></mesh>}
    </>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[-3, 6, 5]} intensity={1.8} />
      <Box t={t} />
      <Molecules t={t} />
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.1} radius={0.6} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

// The thermometers under each end, with the heat arrow between them (drawn by @remotion/paths' evolvePath, as thick as
// the temperature gap, gone once they read the same).
const ARROW = 'M 400 1140 L 680 1140';
function Thermometers({ t }: { t: number }) {
  const a = prog(t, 0.3, 0.5), s = shownTemps(t), arrow = heatArrowAt(t), num = { fontVariantNumeric: 'tabular-nums' as const };
  const col = (T: number) => (T >= 450 ? P.amber : T <= 250 ? P.blue : '#c58bff');
  const read = (cx: number, label: string, T: number) => (
    <div style={{ position: 'absolute', left: cx - 170, width: 340, top: 1080, textAlign: 'center' }}>
      <div style={{ font: `600 30px ${SOFT_UI}`, color: P.muted }}>{label}</div>
      <div style={{ ...hand(64), color: col(T), ...num }}>{T} K</div>
    </div>
  );
  const ev = evolvePath(arrow.draw, ARROW), head = arrow.draw > 0.97 ? arrow.opacity : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      {read(220, 'hot side', s.left)}{read(860, 'cold side', s.right)}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: arrow.opacity }}>
        <path d={ARROW} fill="none" stroke={P.amber} strokeWidth={arrow.width} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        <path d={`M 676 ${1140 - 14 - arrow.width} L ${716 + arrow.width} 1140 L 676 ${1140 + 14 + arrow.width} Z`} fill={P.amber} stroke={P.amber} strokeWidth={6} strokeLinejoin="round" opacity={head} />
        <text x={540} y={1112 - arrow.width / 2} textAnchor="middle" fill={P.amber} style={{ ...hand(36) }} opacity={arrow.draw}>heat</text>
      </svg>
    </div>
  );
}

// Temperature against time: both sides' 2 s averages draw themselves and meet at the 300 K line.
const GR = { x0: 170, x1: 910, y0: 1462, h: 210, tMax: 16, lo: 150, hi: 650 };
const gx = (t: number) => GR.x0 + (t / GR.tMax) * (GR.x1 - GR.x0), gy = (T: number) => GR.y0 - ((T - GR.lo) / (GR.hi - GR.lo)) * GR.h;
function Graph({ t }: { t: number }) {
  const a = prog(t, 0.6, 0.5), until = Math.min(t, GR.tMax), n = Math.max(2, Math.round(until * 10));
  const pts = Array.from({ length: n + 1 }, (_, i) => smoothTemps((i / n) * until));
  const path = (side: 'left' | 'right') => pts.map((s, i) => `${i ? 'L' : 'M'}${gx((i / n) * until).toFixed(1)},${gy(s[side]).toFixed(1)}`).join(' ');
  const end = pts[pts.length - 1], lab = (x: number, y: number, s: string, color: string, anchor: 'start' | 'end' = 'start') =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(26) }}>{s}</text>;
  const meet = prog(t, ANSWER_AT, 0.5);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <line x1={GR.x0} y1={GR.y0} x2={GR.x1} y2={GR.y0} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={GR.x0} y1={GR.y0} x2={GR.x0} y2={GR.y0 - GR.h - 8} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
      {lab(GR.x1, GR.y0 + 34, 'time', P.ink, 'end')}{lab(GR.x0 - 12, GR.y0 - GR.h + 6, 'T', P.ink, 'end')}
      {lab(GR.x0 - 12, gy(T_HOT0) + 8, '600', P.muted, 'end')}{lab(GR.x0 - 12, gy(T_COLD0) + 8, '200', P.muted, 'end')}
      {meet > 0 && <g opacity={meet}>
        <line x1={GR.x0} y1={gy(300)} x2={GR.x1} y2={gy(300)} stroke={P.green} strokeWidth={3} strokeDasharray="10 12" />
        {lab(GR.x1, gy(300) - 14, '300 K', P.green, 'end')}
      </g>}
      <path d={path('left')} fill="none" stroke={P.amber} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('right')} fill="none" stroke={P.blue} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={gx(until)} cy={gy(end.left)} r={10} fill={P.amber} stroke={P.board} strokeWidth={3} />
      <circle cx={gx(until)} cy={gy(end.right)} r={10} fill={P.blue} stroke={P.board} strokeWidth={3} />
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'Heat flows hot → cold. Never back.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #8' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics007({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #7'} lines={['Lift the wall: hot gas meets cold.', 'Their temperatures end up…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.12, left: 0.05, right: 0.05 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: false }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Thermometers t={t} />
        <Graph t={t} />
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1012, textAlign: 'center', font: `500 26px ${SOFT_UI}`, color: P.muted, opacity: prog(t, 0.6, 0.5) }}>
          2,400 molecules, slowed down · colour = speed
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-007-heat-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
