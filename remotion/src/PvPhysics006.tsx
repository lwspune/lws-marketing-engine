// @pyqvault_ · Physics, visualised #6 (predict-first): the same tennis shot with topspin: does it dip, float or neither?
// White look (L22 rotation: P6 white). A three.js court seen from the side: one ball machine fires three balls together
// (no spin, topspin, backspin) at ×0.4 slow motion; the flights are the real equations (lib/pp006.ts), with live trails,
// Magnus force arrows and live distances, IN or OUT. Then the why: a close-up of a spinning ball throwing the air one way,
// pushed the other. Framework v1.5: question over a moving picture, zooms, rounded shapes, the picture's own sound.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, SPINS, BALL, COURT, CAMERA, flightAt, flightTime, landing, landsAt, liftAccel,
  spinAngleAt, flowMode, type SpinKey,
} from './lib/pp006.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { t: 0.8, text: 'Topspin: dip or float?', y: 1590, size: 64 };   // balls still on the machine: no spoiler
const BAND = { left: 0, top: 470, width: 1080, height: 660 };
const DRAW_R = BALL.r * 8;                                   // balls drawn 8× their size (labelled), or they'd be a dot
const LANE: Record<SpinKey, number> = { top: 1.9, none: 0, back: -1.9 };
const COLOR: Record<SpinKey, string> = { none: '#7d869a', top: P.green, back: P.blue };
const FELT = '#cfe24a';

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, [zoom, focus] = tween(t, CAMERA.start, CAMERA.keys);
  // Seen from high up, behind and to the side of the machine, so the court runs away from us and fills the frame.
  const target = new THREE.Vector3(focus, 1.4, 0), d = 27 / zoom, el = 0.42, az = 0.62;
  cam.position.copy(target.clone().add(new THREE.Vector3(-d * Math.sin(az) * Math.cos(el), d * Math.sin(el), d * Math.cos(az) * Math.cos(el))));
  cam.fov = 30; cam.aspect = BAND.width / BAND.height; cam.lookAt(target); cam.updateProjectionMatrix();
  return null;
}

// Court lines (singles): baselines, sidelines, service lines 6.40 m from the net, the centre service line.
const HALF_W = 8.23 / 2, SERVICE = 6.4;
const LINES: [number, number, number, number][] = [               // x0, z0, x1, z1
  [0, -HALF_W, 0, HALF_W], [COURT.length, -HALF_W, COURT.length, HALF_W],
  [0, -HALF_W, COURT.length, -HALF_W], [0, HALF_W, COURT.length, HALF_W],
  [COURT.net - SERVICE, -HALF_W, COURT.net - SERVICE, HALF_W], [COURT.net + SERVICE, -HALF_W, COURT.net + SERVICE, HALF_W],
  [COURT.net - SERVICE, 0, COURT.net + SERVICE, 0],
];

function Court() {
  return (
    <>
      <mesh position={[16, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[42, 13]} /><meshStandardMaterial color="#b9d3c4" roughness={0.9} /></mesh>
      <mesh position={[COURT.length / 2, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[COURT.length, 2 * HALF_W]} /><meshStandardMaterial color="#5f9a86" roughness={0.85} /></mesh>
      {LINES.map(([x0, z0, x1, z1], i) => (
        <mesh key={i} position={[(x0 + x1) / 2, -0.005, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.max(0.1, Math.abs(x1 - x0)), Math.max(0.1, Math.abs(z1 - z0))]} /><meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* the net: a see-through panel with a white top band, between two round posts */}
      <mesh position={[COURT.net, COURT.netH / 2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[2 * HALF_W + 0.9, COURT.netH]} /><meshStandardMaterial color="#23304a" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[COURT.net, COURT.netH, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 2 * HALF_W + 0.9, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[COURT.net, 0.53, s * (HALF_W + 0.45)]}><cylinderGeometry args={[0.07, 0.07, 1.07, 16]} /><meshStandardMaterial color="#5f6880" metalness={0.4} roughness={0.4} /></mesh>)}
      {/* the ball machine behind the baseline */}
      <mesh position={[-1.0, 0.45, 0]}><RoundBox size={[1.1, 0.9, 5.0]} radius={0.3} /><meshStandardMaterial color="#e3e7ef" roughness={0.5} /></mesh>
      {SPINS.map(s => <mesh key={s.key} position={[-0.8, BALL.h0 - 0.1, LANE[s.key]]} rotation={[0, 0, Math.PI / 2 - 0.24]}><cylinderGeometry args={[0.32, 0.36, 0.8, 32]} /><meshStandardMaterial color="#9aa3b2" metalness={0.5} roughness={0.35} /></mesh>)}
    </>
  );
}

function Ball({ k, t }: { k: SpinKey; t: number }) {
  const tau = flightTime(t), { p } = flightAt(k, tau), landed = t >= landsAt(k), z = LANE[k];
  const pts = Array.from({ length: 48 }, (_, i) => { const q = flightAt(k, (tau * i) / 47).p; return new THREE.Vector3(q[0], q[1], z); });
  const [ax, ay] = liftAccel(k, tau), a = Math.hypot(ax, ay), len = Math.min(2.2, a * 0.3), ang = Math.atan2(ax, -ay);   // turns the local −y arrow onto the force
  const show = tau > 0.01 && !landed && a > 0;
  return (
    <>
      {tau > 0.01 && <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(pts), 96, 0.08, 10, false]} /><meshStandardMaterial color={COLOR[k]} roughness={0.5} /></mesh>}
      <group position={[p[0], landed ? DRAW_R : Math.max(DRAW_R, p[1]), z]}>
        <group rotation={[0, 0, spinAngleAt(k, t)]}>
          <mesh><sphereGeometry args={[DRAW_R, 32, 32]} /><meshStandardMaterial color={FELT} roughness={0.75} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[DRAW_R * 1.005, 0.025, 10, 48]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[DRAW_R * 0.97, 0, 0]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color={COLOR[k]} /></mesh>
        </group>
        {show && (
          <group rotation={[0, 0, ang]}>{/* the Magnus force: length ∝ force */}
            <mesh position={[0, -(DRAW_R + len / 2), 0]}><cylinderGeometry args={[0.07, 0.07, len, 12]} /><meshStandardMaterial color={COLOR[k]} /></mesh>
            <mesh position={[0, -(DRAW_R + len + 0.18), 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.36, 20]} /><meshStandardMaterial color={COLOR[k]} /></mesh>
          </group>
        )}
      </group>
      {landed && <mesh position={[landing(k).x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.32, 0.5, 40]} /><meshBasicMaterial color={COLOR[k]} transparent opacity={0.9 * prog(t, landsAt(k), 0.25)} /></mesh>}
    </>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[-6, 14, 10]} intensity={2.0} />
      <Court />
      {SPINS.map(s => <Ball key={s.key} k={s.key} t={t} />)}
    </>
  );
}

// Under the court: each ball's distance so far, and IN / OUT once it lands (the court is 23.77 m long).
function Rows({ t }: { t: number }) {
  const a = prog(t, 0.3, 0.5) * (1 - prog(t, 6.0, 0.4)), num = { fontVariantNumeric: 'tabular-nums' as const };
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 150, width: 780, top: 1170, opacity: a }}>
      {(['top', 'none', 'back'] as SpinKey[]).map((k, i) => {
        const x = flightAt(k, flightTime(t)).p[0], landed = t >= landsAt(k), inside = landing(k).x <= COURT.length;
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', height: 74, top: i * 74 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: COLOR[k], marginRight: 22 }} />
            <div style={{ font: `600 38px ${SOFT_UI}`, color: P.ink, width: 250 }}>{SPINS.find(s => s.key === k)!.label}</div>
            <div style={{ ...hand(46), color: P.ink, width: 230, textAlign: 'right', ...num }}>{x.toFixed(1)} m</div>
            {landed && <div style={{ marginLeft: 34, padding: '4px 22px', borderRadius: 26, font: `700 34px ${SOFT_UI}`, color: '#fff',
              background: inside ? P.green : P.amber, opacity: prog(t, landsAt(k), 0.25) }}>{inside ? 'IN' : 'OUT'}</div>}
          </div>
        );
      })}
      <div style={{ font: `500 27px ${SOFT_UI}`, color: P.muted, marginTop: 8 }}>26 m/s at 14° · court 23.77 m · balls drawn 8× size</div>
    </div>
  );
}

// The why, close up: the ball flies right, so the air streams past it to the left. A spinning ball drags the air round
// and throws it off one way (up for topspin, down for backspin); the air is pushed one way, the ball the other.
const FC = { x: 540, y: 1330, r: 88 };
function Flow({ t }: { t: number }) {
  const a = Math.min(prog(t, 6.3, 0.4), 1 - prog(t, 15.0, 0.4));
  if (a <= 0) return null;
  const top = flowMode(t) !== 'back', tilt = Math.tan((15 * Math.PI) / 180), k: SpinKey = top ? 'top' : 'back';
  const line = (y0: number) => Array.from({ length: 61 }, (_, i) => {
    const x = 420 - i * 14, bulge = ((FC.r * FC.r * y0) / Math.max(x * x + y0 * y0, FC.r * FC.r)) * 0.9;
    const wake = x < 0 ? Math.min(1, -x / 120) * -x * tilt : 0;     // behind the ball the air leaves tilted
    return `${i ? 'L' : 'M'}${(FC.x + x).toFixed(1)},${(FC.y + y0 + bulge + (top ? -wake : wake)).toFixed(1)}`;
  }).join(' ');
  const push = top ? 1 : -1, col = COLOR[k], spin = spinAngleAt(k, t) * (180 / Math.PI);   // push +1: down on screen
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs><clipPath id="flowcard"><rect x={60} y={1140} width={960} height={380} rx={48} /></clipPath></defs>
      <rect x={60} y={1140} width={960} height={380} rx={48} fill="#ffffff" opacity={0.94} />
      <g clipPath="url(#flowcard)">
        {[-140, -100, -60, 60, 100, 140].map(y0 => <path key={y0} d={line(y0)} fill="none" stroke={tint(P.ink, 0.3)} strokeWidth={5} strokeLinecap="round" strokeDasharray="20 18" strokeDashoffset={-t * 150} />)}
      </g>
      <g transform={`translate(${FC.x},${FC.y})`}>
        <circle r={FC.r} fill={FELT} />
        <g transform={`rotate(${-spin})`}><path d={`M${-FC.r * 0.95},-20 Q0,${-FC.r * 0.55} ${FC.r * 0.95},-20 M${-FC.r * 0.95},20 Q0,${FC.r * 0.55} ${FC.r * 0.95},20`} fill="none" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" /></g>
        <line x1={0} y1={push * (FC.r + 8)} x2={0} y2={push * (FC.r + 70)} stroke={col} strokeWidth={12} strokeLinecap="round" />
        <path d={`M -22 ${push * (FC.r + 62)} L 0 ${push * (FC.r + 96)} L 22 ${push * (FC.r + 62)} Z`} fill={col} strokeLinejoin="round" stroke={col} strokeWidth={6} />
      </g>
      {/* labels sit in the quiet corners: the wake leaves on the left, the oncoming air is calm on the right */}
      <text x={210} y={top ? 1182 : 1500} textAnchor="middle" fill={P.ink} style={{ ...hand(32) }}>{top ? 'air thrown up' : 'air thrown down'}</text>
      <text x={FC.x + 150} y={top ? 1500 : 1182} textAnchor="start" fill={col} style={{ ...hand(34) }}>{top ? 'ball pushed down' : 'ball pushed up'}</text>
      <text x={900} y={top ? 1182 : 1500} textAnchor="middle" fill={P.muted} style={{ ...hand(30) }}>{top ? 'topspin' : 'backspin'}</text>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'Air thrown up, ball pushed down.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #7' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics006({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #6'} lines={['Same shot, now with topspin.', 'The ball will…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.08, bottom: 0.1, left: 0.04, right: 0.04 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Rows t={t} />
        <Flow t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-006-topspin-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
