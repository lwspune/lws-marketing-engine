// @pyqvault_ · Chemistry, visualised #9 (framework v1.27): one battery splits water into two tubes. Which fills first?
// Hydrogen, twice as fast. The timeline, beat table and reasons are in lib/pc009.ts. From frame 0 one water molecule
// fills the band; it bursts (both H to the left tube, the O to the right) as the camera pulls back to the two tubes
// already racing, the mL counts ticking above them (L62). Answer at 7.0 s; then "Why exactly twice as fast?": a punch-in
// on one molecule that splits in slow motion, its two H lit (F26); the counts run on to 34 : 17; end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  LABEL, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, END_AT, END_LINES, COVER_T, ZOOM_LABEL, BAND, TANK, TUBE, TUBES, ELECTRODE,
  BENCH, BATTERY, WIRE_PATHS, ML, GRAPH, ZOOM_LABEL_AT, ACID_LABEL_AT, COLOURS as C, BUBBLES, bubbleAt, moleculeAt, zoomLabelAlpha, acidLabelAlpha,
  interfaceY, volume, count, cameraAt, graphX, graphY, terminalAt,
} from './lib/pc009.ts';
import { project, wire, type V3 } from './lib/inductionScene.ts';
import { Board, Caption, Card, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';
import { Wire } from './induction3d.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const GASES = ['H2', 'O2'] as const;
const GAS_COLOUR = { H2: C.H, O2: C.O };
const WIRES = { H2: wire(WIRE_PATHS.H2.from, WIRE_PATHS.H2.bend, WIRE_PATHS.H2.to), O2: wire(WIRE_PATHS.O2.from, WIRE_PATHS.O2.bend, WIRE_PATHS.O2.to) };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** One inverted tube: water from the mouth up to the gas, the gas above it (tinted by which gas), glass round both. */
function Tube({ gas, t }: { gas: 'H2' | 'O2'; t: number }) {
  const x = TUBES[gas], y = interfaceY(gas, t), water = y - TUBE.mouth, col = TUBE.top - y, capGas = Math.min(1, volume(gas, t) / 0.6);
  return (
    <group position={[x, 0, 0]}>
      {water > 0.001 && <mesh position={[0, TUBE.mouth + water / 2, 0]} renderOrder={2}><cylinderGeometry args={[TUBE.inner, TUBE.inner, water, 40]} />
        <meshStandardMaterial color={C.water} transparent opacity={0.22} roughness={0.2} depthWrite={false} /></mesh>}
      {col > 0.001 && <mesh position={[0, y + col / 2, 0]} renderOrder={3}><cylinderGeometry args={[TUBE.inner, TUBE.inner, col, 40]} />
        <meshStandardMaterial color={GAS_COLOUR[gas]} transparent opacity={0.45} roughness={0.2} depthWrite={false} /></mesh>}
      <mesh position={[0, TUBE.top, 0]} renderOrder={3}><sphereGeometry args={[TUBE.inner, 40, 20, 0, 2 * Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={capGas > 0.5 ? GAS_COLOUR[gas] : C.water} transparent opacity={capGas > 0.5 ? 0.45 : 0.22} roughness={0.2} depthWrite={false} /></mesh>
      {/* the glass: an open cylinder, a domed top, a rim at the mouth */}
      <mesh position={[0, (TUBE.mouth + TUBE.top) / 2, 0]} renderOrder={4}><cylinderGeometry args={[TUBE.r, TUBE.r, TUBE.top - TUBE.mouth, 48, 1, true]} />
        <meshStandardMaterial color={C.glass} transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, TUBE.top, 0]} renderOrder={4}><sphereGeometry args={[TUBE.r, 48, 24, 0, 2 * Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.glass} transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, TUBE.mouth, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[TUBE.r, 0.012, 10, 48]} /><meshStandardMaterial color={C.glassEdge} roughness={0.2} /></mesh>
      {/* the scale: a ring every 10 mL, and the gas's edge as a bright line */}
      {[10, 20, 30].map(v => (
        <mesh key={v} position={[0, TUBE.top - ML * v, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[TUBE.r + 0.002, 0.006, 8, 48]} /><meshStandardMaterial color={C.glassEdge} /></mesh>
      ))}
      {col > 0.01 && <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[TUBE.inner, 0.008, 8, 48]} /><meshStandardMaterial color={GAS_COLOUR[gas]} /></mesh>}
    </group>
  );
}

function Apparatus({ t }: { t: number }) {
  const waterH = TANK.water - (TANK.y - TANK.h / 2) - 0.03;
  return (
    <>
      {/* bench, then a stand rod behind each tube (hidden by it) with an arm forward to its clamp */}
      <mesh position={[0, BENCH.y, 0]}><RoundBox size={[BENCH.w, BENCH.h, BENCH.d]} radius={0.03} /><meshStandardMaterial color="#d9dee7" roughness={0.6} /></mesh>
      {GASES.map(g => (
        <group key={g}>
          <mesh position={[TUBES[g], -0.27, -0.62]}><cylinderGeometry args={[0.03, 0.03, 2.14, 16]} /><meshStandardMaterial color={C.electrode} metalness={0.6} roughness={0.35} /></mesh>
          <mesh position={[TUBES[g], 0.55, -0.31]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.62, 12]} />
            <meshStandardMaterial color={C.electrode} metalness={0.6} roughness={0.35} /></mesh>
          <mesh position={[TUBES[g], 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[TUBE.r + 0.025, 0.02, 10, 40]} /><meshStandardMaterial color={C.electrode} metalness={0.6} roughness={0.35} /></mesh>
        </group>
      ))}
      {/* electrodes (platinum: steel grey) standing up through the tank's floor into each tube's mouth */}
      {GASES.map(g => (
        <mesh key={g} position={[TUBES[g], (ELECTRODE.tip + ELECTRODE.base) / 2, 0]}><cylinderGeometry args={[ELECTRODE.r, ELECTRODE.r, ELECTRODE.tip - ELECTRODE.base, 16]} />
          <meshStandardMaterial color={C.electrode} metalness={0.7} roughness={0.3} /></mesh>
      ))}
      {GASES.map(g => <Wire key={g} pts={WIRES[g]} color={C.wire} />)}
      {/* battery: a rounded block with its two terminals, − (to the hydrogen side) and + */}
      <mesh position={BATTERY.at}><RoundBox size={BATTERY.size} radius={0.06} /><meshStandardMaterial color="#2f3b55" roughness={0.45} /></mesh>
      <mesh position={[BATTERY.at[0], BATTERY.at[1] + BATTERY.size[1] / 2 - 0.05, BATTERY.at[2]]}><RoundBox size={[BATTERY.size[0] + 0.005, 0.1, BATTERY.size[2] + 0.005]} radius={0.04} />
        <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.3} /></mesh>
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[terminalAt(s)[0], terminalAt(s)[1] - 0.03, terminalAt(s)[2]]}><cylinderGeometry args={[0.035, 0.035, 0.07, 16]} />
          <meshStandardMaterial color={C.electrode} metalness={0.7} roughness={0.3} /></mesh>
      ))}
      {/* bubbles: opaque, so the water and glass in front only tint them */}
      {BUBBLES.map((b, i) => { const p = bubbleAt(b, t); return p && (
        <mesh key={i} position={p}><sphereGeometry args={[b.r, 14, 10]} /><meshStandardMaterial color={GAS_COLOUR[b.gas]} roughness={0.15} /></mesh>); })}
      {GASES.map(g => <Tube key={g} gas={g} t={t} />)}
      {/* the tank: water, then its glass */}
      <mesh position={[0, TANK.y - TANK.h / 2 + 0.03 + waterH / 2, 0]} renderOrder={1}><RoundBox size={[TANK.w - 0.06, waterH, TANK.d - 0.06]} radius={0.04} />
        <meshStandardMaterial color={C.water} transparent opacity={0.28} roughness={0.15} depthWrite={false} /></mesh>
      <mesh position={[0, TANK.y, 0]} renderOrder={5}><RoundBox size={[TANK.w, TANK.h, TANK.d]} radius={0.06} />
        <meshPhysicalMaterial color={C.glass} transparent opacity={0.16} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </>
  );
}

function Molecule({ t }: { t: number }) {
  return <>{moleculeAt(t).map((a, i) => (
    <mesh key={i} position={a.p}><sphereGeometry args={[Math.max(0.001, a.r), 40, 28]} />
      <meshStandardMaterial color={a.el === 'H' ? C.H : C.O} roughness={0.35} transparent={a.alpha < 1} opacity={a.alpha}
        emissive={new THREE.Color(a.el === 'H' ? C.H : '#000000')} emissiveIntensity={0.6 * a.lit} /></mesh>
  ))}</>;
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.6} key={1.3} at={[-3, 6, 7]} span={6} />
      <ambientLight intensity={0.55} />
      <Apparatus t={t} />
      <Molecule t={t} />
    </>
  );
}

/** Labels that sit on 3D points: the zoom label, the lit H atoms' halos, the battery's signs and the tank's contents. */
function Overlay({ t }: { t: number }) {
  const cam = cameraAt(t), at = (p: V3) => project(p, cam, BAND);
  const text = (p: V3, s: string, alpha: number, color: string, size: number, weight = 700) => {
    if (alpha <= 0.01) return null;
    const q = at(p);
    return <div style={{ position: 'absolute', left: q.x, top: q.y, transform: 'translate(-50%, -50%)', opacity: alpha, font: `${weight} ${size}px ${SOFT_UI}`,
      color, whiteSpace: 'nowrap', textShadow: `0 0 8px ${P.board}, 0 0 14px ${P.board}` }}>{s}</div>;
  };
  const halos = moleculeAt(t).filter(a => a.el === 'H' && a.lit > 0.01).map((a, i) => {
    const q = at(a.p), r = 150 * a.lit * (a.r / 0.075);
    return <div key={i} style={{ position: 'absolute', left: q.x - r, top: q.y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', pointerEvents: 'none',
      // a ring of light round the atom, clear in the middle so the atom itself stays sharp
      background: `radial-gradient(circle, rgba(37,99,235,0) 44%, ${tint(C.H, 0.42 * a.lit * a.alpha)} 52%, ${tint(C.H, 0.14 * a.lit * a.alpha)} 70%, rgba(37,99,235,0) 100%)` }} />;
  });
  const wide = prog(t, 2.0, 0.4) * (1 - prog(t, 6.0, 0.3)) + prog(t, 11.2, 0.4);
  return (
    <>
      {halos}
      {text(ZOOM_LABEL_AT, ZOOM_LABEL, zoomLabelAlpha(t), P.muted, 28, 600)}
      {text(ACID_LABEL_AT, 'water + a little acid', acidLabelAlpha(t), P.muted, 30, 600)}
      {([-1, 1] as const).map(s => text([terminalAt(s)[0], terminalAt(s)[1] + 0.13, terminalAt(s)[2]], s < 0 ? '−' : '+', wide, P.ink, 40))}
    </>
  );
}

// The two counts (L62), in the band's top corners on their tube's side (clear of the tubes even at the punch-in): big,
// ticking a whole mL at a time, popping on each tick and at the answer.
function Counts({ t }: { t: number }) {
  const pop = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - ANSWER_AT) / 0.5)));
  return (
    <>
      {GASES.map((g, i) => {
        const n = count(g, t), since = t - n / (g === 'H2' ? 2 : 1), tick = n > 0 && since < 0.15 ? 1 - since / 0.15 : 0;
        const won = g === 'H2' && t >= ANSWER_AT;
        return (
          <div key={g} style={{ position: 'absolute', left: i === 0 ? 40 : 850, top: 492, width: 190, padding: '6px 0 12px', textAlign: 'center', borderRadius: 30,
            background: 'rgba(255, 255, 255, 0.94)', boxShadow: `0 10px 30px ${tint(P.ink, 0.1)}`, outline: won ? `4px solid ${tint(C.H, 0.55)}` : 'none' }}>
            <div style={{ ...hand(92), lineHeight: '100px', color: GAS_COLOUR[g], fontVariantNumeric: 'tabular-nums',
              transform: `scale(${1 + 0.06 * tick + (g === 'H2' ? 0.12 * pop : 0)})` }}>{n}</div>
            <div style={{ font: `700 30px ${SOFT_UI}`, color: P.muted }}>mL {g === 'H2' ? 'H₂' : 'O₂'}</div>
          </div>
        );
      })}
    </>
  );
}

/** mL against time for both gases, drawing itself: the hydrogen line climbs twice as steeply. */
function Graph({ t }: { t: number }) {
  const until = Math.min(t, END_AT), line = (g: 'H2' | 'O2') => {
    const pts: string[] = [];
    for (let f = 0; f <= Math.round(until * 30); f++) pts.push(`${graphX(f / 30).toFixed(1)},${graphY(volume(g, f / 30)).toFixed(1)}`);
    return pts;
  };
  return (
    <>
      <Card x={60} y={GRAPH.top - 40} w={960} h={GRAPH.bottom - GRAPH.top + 80} r={36} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={GRAPH.left} y1={GRAPH.bottom} x2={GRAPH.right} y2={GRAPH.bottom} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <line x1={GRAPH.left} y1={GRAPH.bottom} x2={GRAPH.left} y2={GRAPH.top - 10} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <text x={GRAPH.left - 16} y={GRAPH.top + 6} textAnchor="end" fill={P.muted} style={{ font: `600 28px ${SOFT_UI}` }}>mL</text>
        <text x={GRAPH.right} y={GRAPH.bottom + 34} textAnchor="end" fill={P.muted} style={{ font: `600 28px ${SOFT_UI}` }}>time</text>
        {GASES.map(g => { const pts = line(g), tip = pts.at(-1)!.split(',').map(Number); return (
          <g key={g}>
            {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={GAS_COLOUR[g]} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />}
            <circle cx={tip[0]} cy={tip[1]} r={9} fill={GAS_COLOUR[g]} />
            <text x={tip[0] + 16} y={tip[1] + 10} fill={GAS_COLOUR[g]} style={{ font: `700 30px ${SOFT_UI}` }}>{g === 'H2' ? 'H₂' : 'O₂'}</text>
          </g>); })}
      </svg>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 60, weight: 700, color: P.ink, text: END_LINES[0] },
  { at: 0.7, size: 48, weight: 700, color: C.H, text: END_LINES[1] },
  { at: 1.1, size: 40, weight: 600, color: P.muted, text: END_LINES[2] },
];

export function PvChem009({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={LABEL} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={60} chipW={290} brand={BRAND} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.06, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Overlay t={t} />
        <Counts t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-009-electrolysis-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
