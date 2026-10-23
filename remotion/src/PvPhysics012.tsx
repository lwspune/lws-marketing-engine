// @pyqvault_ · Physics, visualised #12 (framework v1.27): same box, same height; does the faster lift do more work? The
// same. The timeline, beat table and physics are in lib/pp012.ts. From frame 0 the camera orbits two lift towers while
// both crates rise (F22), their joule counts climbing (L62); the fast one arrives at 3.4 s, the slow at 6.4 s, both at
// 1,470 J; answer at 6.8 s. Then "So what did speed change?": a replay that pauses mid-climb on the power meters
// (490 W vs 245 W, F26), the graph's slopes labelled; it runs on to the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  LABEL, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, END_AT, END_LINES, COVER_T, BAND, LIFT, GROUND, CRATE, TOWER,
  MOTOR, GRAPH, T_SLOPES, T_REWIND, T_SECOND, T_RESUME, COLOURS as C, MASS, platformY, meterAt, work, powerAt,
  paused, cameraAt, graphX, graphY, tagAt, type Lift,
} from './lib/pp012.ts';
import { project, type V3 } from './lib/inductionScene.ts';
import { Board, Caption, Card, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const LIFTS: Lift[] = ['fast', 'slow'];
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

const steel = <meshStandardMaterial color={C.steel} metalness={0.6} roughness={0.35} />;

/** One lift: two rails behind, a top beam, the motor with its drum, the cable, the platform and the crate. */
function Tower({ k, t }: { k: Lift; t: number }) {
  const x = LIFT[k].x, py = platformY(k, t), railH = TOWER.top - GROUND, cable = MOTOR.y - MOTOR.size[1] / 2 - (py + CRATE + 0.02);
  return (
    <group position={[x, 0, 0]}>
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * TOWER.railX, GROUND + railH / 2, TOWER.railZ]}><cylinderGeometry args={[0.035, 0.035, railH, 16]} />{steel}</mesh>
      ))}
      <mesh position={[0, TOWER.top, TOWER.railZ]}><RoundBox size={[2 * TOWER.railX + 0.12, 0.08, 0.1]} radius={0.03} />{steel}</mesh>
      <mesh position={[0, MOTOR.y, 0]}><RoundBox size={MOTOR.size} radius={0.07} /><meshStandardMaterial color="#e6e9ef" roughness={0.4} metalness={0.2} /></mesh>
      <mesh position={[0, MOTOR.y - MOTOR.size[1] / 2 - 0.05, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.3, 20]} />{steel}</mesh>
      {cable > 0.01 && <mesh position={[0, py + CRATE + 0.02 + cable / 2, 0]}><cylinderGeometry args={[0.012, 0.012, cable, 8]} /><meshStandardMaterial color={C.steelEdge} /></mesh>}
      {/* the platform, a stripe in the lift's colour on its front edge, the crate on it */}
      <mesh position={[0, py - 0.03, 0]}><RoundBox size={[0.7, 0.06, 0.6]} radius={0.025} />{steel}</mesh>
      <mesh position={[0, py - 0.03, 0.302]}><RoundBox size={[0.7, 0.05, 0.01]} radius={0.004} /><meshStandardMaterial color={C[k]} roughness={0.5} /></mesh>
      <mesh position={[0, py + CRATE / 2, 0]}><RoundBox size={[CRATE, CRATE, CRATE]} radius={0.03} /><meshStandardMaterial color={C.crate} roughness={0.7} /></mesh>
      {[-1, 1].map(s => (                                                   // two darker slats across the crate's front
        <mesh key={s} position={[0, py + CRATE / 2 + s * 0.1, CRATE / 2 + 0.003]}><RoundBox size={[CRATE - 0.02, 0.05, 0.01]} radius={0.004} />
          <meshStandardMaterial color={C.crateEdge} roughness={0.7} /></mesh>
      ))}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.6} key={1.3} at={[-3, 6, 7]} span={6} />
      <ambientLight intensity={0.55} />
      <mesh position={[0, GROUND - 0.05, 0]}><RoundBox size={[3.2, 0.1, 1.6]} radius={0.04} /><meshStandardMaterial color="#d9dee7" roughness={0.6} /></mesh>
      {LIFTS.map(k => <Tower key={k} k={k} t={t} />)}
    </>
  );
}

/** The meter needle follows the power with a quick lag (a real needle swings, it doesn't jump). */
function needle(k: Lift, t: number) {
  let v = 0;
  for (let s = Math.max(0, t - 1); s <= t + 1e-9; s += 1 / 60) v += (powerAt(k, s) - v) * (1 - Math.exp(-(1 / 60) / 0.12));
  return v;
}

/** The power meters on the motors, the lift tags and the crate labels, clipped to the band (a label whose object is off
 *  screen mustn't float over the graph); the meters and crate labels sit on front faces, so they fade out when the orbit
 *  is behind them. Then the replay badge. */
function Overlay({ t }: { t: number }) {
  const cam = cameraAt(t), at = (p: V3) => { const q = project(p, cam, BAND); return { ...q, y: q.y - BAND.top }; };
  const front = (z: number) => Math.min(1, Math.max(0, (cam.position[2] - z) / 1.5));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, overflow: 'hidden' }}>
      {LIFTS.map(k => {
        const m = at(meterAt(k)), scale = 7.6 / m.depth, v = needle(k, t), a = (-90 + (Math.min(v, 500) / 500) * 180) * (Math.PI / 180);
        const tag = at(tagAt(k)), crate = at([LIFT[k].x, platformY(k, t) + CRATE / 2, CRATE / 2 + 0.01]);
        const r = 54;
        return (
          <div key={k}>
            <div style={{ position: 'absolute', left: m.x, top: m.y, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center', opacity: front(meterAt(k)[2]) }}>
              <svg width={150} height={104} style={{ display: 'block', overflow: 'visible' }}>
                <rect x={2} y={2} width={146} height={100} rx={18} fill="#ffffff" stroke={tint(P.ink, 0.2)} strokeWidth={2} />
                <path d={`M ${75 - r} 78 A ${r} ${r} 0 0 1 ${75 + r} 78`} fill="none" stroke={tint(P.ink, 0.18)} strokeWidth={8} strokeLinecap="round" />
                <path d={`M ${75 - r} 78 A ${r} ${r} 0 0 1 ${75 + r * Math.sin(a)} ${78 - r * Math.cos(a)}`} fill="none" stroke={C[k]} strokeWidth={8} strokeLinecap="round" opacity={v > 2 ? 1 : 0} />
                <line x1={75} y1={78} x2={75 + (r - 6) * Math.sin(a)} y2={78 - (r - 6) * Math.cos(a)} stroke={P.ink} strokeWidth={4} strokeLinecap="round" />
                <circle cx={75} cy={78} r={6} fill={P.ink} />
                <text x={75} y={98} textAnchor="middle" fill={C[k]} style={{ font: `700 18px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' }}>{Math.round(v)} W</text>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: tag.x, top: tag.y, transform: 'translate(-50%, -50%)', padding: '4px 18px', borderRadius: 999,
              background: C[k], color: '#ffffff', font: `700 28px ${SOFT_UI}`, opacity: Math.min(1, Math.max(0, (tag.y - 30) / 40)) }}>{k}</div>
            <div style={{ position: 'absolute', left: crate.x, top: crate.y, transform: `translate(-50%, -50%) scale(${7.6 / crate.depth})`, color: '#ffffff', opacity: front(CRATE / 2),
              font: `700 22px ${SOFT_UI}`, textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>{MASS} kg</div>
          </div>
        );
      })}
      </div>
      <Badge t={t} />
    </>
  );
}

function Badge({ t }: { t: number }) {
  const rewind = prog(t, T_REWIND, 0.15) * (1 - prog(t, T_SECOND - 0.1, 0.2)), pause = paused(t) ? 1 : 0, play = prog(t, T_RESUME, 0.1) * (1 - prog(t, T_RESUME + 0.6, 0.3));
  const show = (text: string, a: number) => a > 0.01 && (
    <div style={{ position: 'absolute', left: 540, top: BAND.top + 40, transform: 'translate(-50%, 0)', opacity: a, padding: '6px 22px', borderRadius: 999,
      background: 'rgba(255,255,255,0.94)', boxShadow: `0 6px 20px ${tint(P.ink, 0.12)}`, font: `700 30px ${SOFT_UI}`, color: P.muted }}>{text}</div>);
  return <>{show('⏪ replay', rewind)}{show('⏸ paused', pause)}{show('▶', play)}</>;
}

// The work counts (L62), one per lift in the band's lower sides (clear of the crates and meters at both punch-ins): big,
// counting the joules as each crate rises.
function Counts({ t }: { t: number }) {
  const pop = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - ANSWER_AT) / 0.5)));
  return (
    <>
      {LIFTS.map((k, i) => {
        const done = t >= ANSWER_AT && t < T_REWIND;
        return (
          <div key={k} style={{ position: 'absolute', left: i === 0 ? 30 : 840, top: 1040, width: 210, padding: '8px 0 12px', textAlign: 'center', borderRadius: 30,
            background: 'rgba(255, 255, 255, 0.94)', boxShadow: `0 10px 30px ${tint(P.ink, 0.1)}`, outline: done ? `4px solid ${tint(C[k], 0.55)}` : 'none' }}>
            <div style={{ ...hand(70), lineHeight: '84px', color: C[k], fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.1 * pop * (done ? 1 : 0)})` }}>{fmt(work(k, t))}</div>
            <div style={{ font: `700 26px ${SOFT_UI}`, color: P.muted }}>J · {k} lift</div>
          </div>
        );
      })}
    </>
  );
}

/** Work against time for the first race: both end at 1,470 J; the slope is the power (labelled from T_SLOPES). */
function Graph({ t }: { t: number }) {
  const until = Math.min(t, T_REWIND), slopes = prog(t, T_SLOPES, 0.4);
  const line = (k: Lift) => Array.from({ length: Math.round(until * 30) + 1 }, (_, f) => `${graphX(f / 30).toFixed(1)},${graphY(work(k, f / 30)).toFixed(1)}`);
  const mid = (k: Lift) => { const tm = 0.4 + 1.5 / LIFT[k].speed; return [graphX(tm), graphY(MASS * 9.8 * 1.5)]; };
  return (
    <>
      <Card x={60} y={GRAPH.top - 40} w={960} h={GRAPH.bottom - GRAPH.top + 80} r={36} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={GRAPH.left} y1={GRAPH.bottom} x2={GRAPH.right} y2={GRAPH.bottom} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <line x1={GRAPH.left} y1={GRAPH.bottom} x2={GRAPH.left} y2={GRAPH.top - 10} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <line x1={GRAPH.left} y1={graphY(1470)} x2={GRAPH.right} y2={graphY(1470)} stroke={tint(P.ink, 0.18)} strokeWidth={2} strokeDasharray="8 8" />
        <text x={GRAPH.left - 14} y={graphY(1470) + 9} textAnchor="end" fill={P.muted} style={{ font: `600 24px ${SOFT_UI}` }}>1,470 J</text>
        <text x={GRAPH.right} y={GRAPH.bottom + 34} textAnchor="end" fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>time</text>
        {LIFTS.map(k => { const pts = line(k), tip = pts.at(-1)!.split(',').map(Number); return (
          <g key={k}>
            {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C[k]} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />}
            {t < T_REWIND && <circle cx={tip[0]} cy={tip[1]} r={9} fill={C[k]} />}
          </g>); })}
        {slopes > 0.01 && LIFTS.map(k => { const [x, y] = mid(k); return (
          <text key={k} x={x + (k === 'fast' ? -22 : 22)} y={y + (k === 'fast' ? -14 : 30)} textAnchor={k === 'fast' ? 'end' : 'start'} opacity={slopes}
            fill={C[k]} style={{ font: `700 30px ${SOFT_UI}` }}>{k === 'fast' ? '490 W' : '245 W'}</text>); })}
        {slopes > 0.01 && <text x={GRAPH.right} y={GRAPH.top + 4} textAnchor="end" opacity={slopes} fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>slope = power</text>}
      </svg>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 64, weight: 700, color: P.ink, text: END_LINES[0] },
  { at: 0.7, size: 48, weight: 700, color: C.slow, text: END_LINES[1] },
  { at: 1.1, size: 40, weight: 600, color: P.muted, text: END_LINES[2] },
];

export function PvPhysics012({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={LABEL} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={260} brand={BRAND} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.05, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Overlay t={t} />
        <Counts t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-012-lift-power-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
