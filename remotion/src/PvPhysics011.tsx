// @pyqvault_ · Physics, visualised #11 (framework v1.26): a magnet held still inside a coil. Bulb? Off. Reel B of the
// framework-2 test (L61); the timeline, the beat table and the reasons are in lib/pp011.ts, the physics in lib/induction.ts.
// From frame 0 the coil winds itself (Assemble, F25) while the magnet sinks towards it; it plunges in and out and the bulb
// flashes, the ℰ graph drawing itself below; it stops inside and the bulb goes dark (answer, 8.4 s). Then "Move the coil
// instead?": the coil slides over the still magnet and the bulb lights again (F26); a fast shake, brighter; end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, tint } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  LABEL, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, END_AT, END_LINES, COVER_T, BAND, BULB, SOCKET, READOUT_AT, GRAPH,
  COLOURS as C, magnetU, magnetY, coilY, relU, glow, emfNow, windUpTo, wiresUpTo, leadsAt, coilLabelAt, cameraAt, graphX, graphY,
} from './lib/pp011.ts';
import { MAG3, chargeAt, project, wire, type V3 } from './lib/inductionScene.ts';
import { Board, Caption, Card, EndCard, PredictHeader, Theme, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';
import { BloomWarmUp, Bulb, Coil, CurrentDots, FieldLines, Former, Magnet, Wire } from './induction3d.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const wiresAt = (t: number) => {
  const l = leadsAt(t);
  return [wire(l.top, [0.62, l.top[1] + 0.1, 0.05], SOCKET.a), wire(SOCKET.b, [0.6, l.bottom[1] - 0.2, 0.05], l.bottom)];
};

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

function Scene({ t }: { t: number }) {
  const [wa, wb] = wiresAt(t), q = chargeAt(relU, t), flow = Math.min(1, Math.abs(emfNow(t)) * 3);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.55} key={1.3} at={[-3, 6, 7]} span={6} />
      <ambientLight intensity={0.35} />
      <Former at={[0, coilY(t), 0]} color={C.glass} />
      <Coil y={coilY(t)} upTo={windUpTo(t)} color={C.copper} />
      <Magnet y={magnetY(t)} north={C.north} south={C.south} />
      <FieldLines y={magnetY(t)} alpha={0.55 + 0.45 * prog(t, 0, 0.6)} color={C.field} />
      <Wire pts={wa} upTo={wiresUpTo(t)} color={C.wire} />
      <Wire pts={wb} upTo={wiresUpTo(t)} color={C.wire} />
      <CurrentDots pts={wa} phase={q * 1.4} alpha={flow} color={C.current} />
      <CurrentDots pts={wb} phase={q * 1.4} alpha={flow} color={C.current} />
      <Bulb at={BULB} glow={glow(t)} glass={C.glass} socket={C.socket} filament={C.filament} />
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.0} radius={0.6} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

/** The bulb's halo, the live ℰ reading, the coil's label and the pole letters, where their 3D points land. */
function Overlay({ t }: { t: number }) {
  const cam = cameraAt(t), at = (p: V3) => project(p, cam, BAND), g = glow(t), b = at([BULB[0], BULB[1] + 0.2, BULB[2]]);
  const text = (p: V3, s: string, alpha: number, color: string, size: number, weight = 700) => {
    if (alpha <= 0.01) return null;
    const qq = at(p);
    return <div style={{ position: 'absolute', left: qq.x, top: qq.y, transform: 'translate(-50%, -50%)', opacity: alpha, font: `${weight} ${size}px ${SOFT_UI}`,
      color, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', textShadow: `0 2px 10px ${P.board}` }}>{s}</div>;
  };
  // The halo grows as the camera nears the bulb: its size on the page goes as 1 / distance.
  const e = Math.abs(emfNow(t)), y = magnetY(t), r = (210 * 4.8) / Math.hypot(cam.position[0] - BULB[0], cam.position[1] - BULB[1], cam.position[2] - BULB[2]);
  return (
    <>
      {g > 0.01 && <div style={{ position: 'absolute', left: b.x - r, top: b.y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, ${tint('#ffd27a', 0.75 * g)} 0%, ${tint('#ffb347', 0.35 * g)} 35%, rgba(255,179,71,0) 70%)` }} />}
      {text(READOUT_AT, `ℰ ${e.toFixed(1)} V`, prog(t, 2.2, 0.4), C.current, 42)}
      {text(coilLabelAt(t), 'coil · 2,000 turns', prog(t, 2.2, 0.4) * (1 - prog(t, 6.2, 0.5)), P.ink, 34, 600)}
      {text([0, y - MAG3.h / 4, MAG3.r + 0.01], 'N', 1, '#ffffff', 30)}
      {text([0, y + MAG3.h / 4, MAG3.r + 0.01], 'S', 1, '#ffffff', 30)}
    </>
  );
}

/** ℰ against time, drawing itself as the reel runs: flashes, a flat line while the magnet is still, the coil's pulses. */
function Graph({ t }: { t: number }) {
  const until = Math.min(t, END_AT), pts: string[] = [];
  for (let f = Math.round(2.2 * 30); f <= Math.round(until * 30); f++) pts.push(`${graphX(f / 30).toFixed(1)},${graphY(emfNow(f / 30)).toFixed(1)}`);
  const mid = graphY(0), tip = pts.at(-1)?.split(',').map(Number);
  return (
    <>
      <Card x={60} y={GRAPH.top - 30} w={960} h={GRAPH.bottom - GRAPH.top + 40} r={36} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={GRAPH.left} y1={mid} x2={GRAPH.right} y2={mid} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <text x={GRAPH.left - 8} y={GRAPH.top + 20} fill={C.current} style={{ font: `700 34px ${SOFT_UI}` }}>ℰ</text>
        <text x={GRAPH.right} y={mid + 40} textAnchor="end" fill={P.muted} style={{ font: `600 28px ${SOFT_UI}` }}>time</text>
        {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C.current} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />}
        {tip && t < END_AT && <circle cx={tip[0]} cy={tip[1]} r={9} fill={C.current} />}
      </svg>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 60, weight: 700, color: P.ink, text: END_LINES[0] },
  { at: 0.7, size: 48, weight: 700, color: C.current, text: END_LINES[1] },
  { at: 1.1, size: 40, weight: 600, color: P.muted, text: END_LINES[2] },
];

export function PvPhysics011({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={LABEL} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={60} chipW={230} brand={BRAND} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.06, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Overlay t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-011-induction-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
