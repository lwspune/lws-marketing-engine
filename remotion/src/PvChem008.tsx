// @pyqvault_ · Chemistry, visualised #8 (predict-first): stack oranges in a box: the best you can fill it? 74%. Dark look
// (L22 rotation: chemistry alternates, #7 was white), bright objects (F24, VIVID.lab). One cubic unit cell with glowing
// cyan edges; eight oranges drop into its corners from frame 0 while the camera orbits (F22). Each orange is cut exactly at
// the box's faces (three.js clipping planes): the part inside stays solid, the part outside fades to a ghost, because the
// neighbouring boxes share it. The radii change between the three stackings and the live "% filled" and the bars follow
// (lib/pc008.ts). Then the fruit-seller's pyramid builds and turns copper. Silent + voiced renders.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, VIVID, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, HEADER, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, HALF, T_SC, T_CELL_OUT, T_PYR, COVER_T, BAND,
  CORNERS, FACES, BODY, PYRAMID, PYR_R, FILLS, radiiAt, fillAt, barsAt, dropY, pyramidDrop, metalAt, cameraAt, type V3,
} from './lib/pc008.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const V = VIVID.lab;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const ORANGE = V.orange, FLESH = '#ffb04a', EDGE = V.cyan, LEAF = V.green, COPPER = '#b87333', WOOD = '#8b5a2b';   // copper and wood keep their real look

// The box's six faces as clipping planes: three.js keeps the side where the plane's signed distance is positive.
const PLANES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(n => new THREE.Plane(new THREE.Vector3(...n), HALF));

function Rig({ t }: { t: number }) {
  const { camera, gl } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  gl.localClippingEnabled = true;
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

// One orange of the box: the part inside the box (clipped; its inside drawn flat in the fruit's colour, so a cut reads as a
// solid slice, not a hollow peel) and the whole orange (solid while it drops and settles, then fading to a faintly glowing
// ghost from T_SC: the neighbouring boxes share that part). `show` fades the whole box out before the pyramid.
function CellOrange({ at, r, lift = 0, t, show }: { at: V3; r: number; lift?: number; t: number; show: number }) {
  if (r <= 1e-4 || show <= 0) return null;
  const landed = lift === 0, whole = landed ? 1 - 0.84 * prog(t, T_SC, 0.6) : 1;
  const pos: V3 = [at[0], at[1] + lift, at[2]];
  return (
    <group>
      {landed && <mesh position={pos}><sphereGeometry args={[r, 40, 40]} />
        <meshStandardMaterial color={ORANGE} roughness={0.55} clippingPlanes={PLANES} transparent={show < 1} opacity={show} /></mesh>}
      {landed && <mesh position={pos}><sphereGeometry args={[r, 40, 40]} />
        <meshBasicMaterial color={FLESH} clippingPlanes={PLANES} side={THREE.BackSide} transparent={show < 1} opacity={show} /></mesh>}
      <mesh position={pos}><sphereGeometry args={[r * 1.001, 40, 40]} />
        <meshStandardMaterial color={ORANGE} roughness={0.55} emissive={ORANGE} emissiveIntensity={0.45 * (1 - whole)} transparent
          opacity={whole * show * (landed ? 1 : Math.min(1, 2.5 * (1 - lift / 1.3)))} depthWrite={whole > 0.9} /></mesh>
    </group>
  );
}

// The box: twelve glowing cyan edges and faint faces.
function Box({ show }: { show: number }) {
  if (show <= 0) return null;
  const h = HALF, edges: [V3, V3][] = [];
  for (const a of [-h, h]) for (const b of [-h, h]) edges.push([[-h, a, b], [h, a, b]], [[a, -h, b], [a, h, b]], [[a, b, -h], [a, b, h]]);
  return (
    <group>
      {edges.map(([p, q], i) => {
        const mid: V3 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], axis = p[0] !== q[0] ? 'x' : p[1] !== q[1] ? 'y' : 'z';
        const rot: V3 = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
        return <mesh key={i} position={mid} rotation={rot}><cylinderGeometry args={[0.018, 0.018, 2 * h, 10]} /><meshBasicMaterial color={EDGE} toneMapped={false} transparent opacity={show} /></mesh>;
      })}
      <mesh><boxGeometry args={[2 * h, 2 * h, 2 * h]} /><meshBasicMaterial color={EDGE} transparent opacity={0.05 * show} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

// The fruit-seller's pyramid on a wooden tray; each orange drops in, then they all turn copper.
function Pyramid({ t }: { t: number }) {
  if (t < T_PYR) return null;
  const k = metalAt(t), col = new THREE.Color(ORANGE).lerp(new THREE.Color(COPPER), k), tray = prog(t, T_PYR, 0.3);
  return (
    <group>
      <mesh position={[0, PYRAMID[0][1] - PYR_R - 0.05, 0]} scale={tray}><RoundBox size={[2.4, 0.1, 2.4]} radius={0.04} /><meshStandardMaterial color={WOOD} roughness={0.8} /></mesh>
      {PYRAMID.map((p, i) => {
        const lift = pyramidDrop(i, t);
        if (lift >= 1.8) return null;                               // not dropped yet
        return (
          <group key={i} position={[p[0], p[1] + lift, p[2]]}>
            <mesh><sphereGeometry args={[PYR_R, 36, 36]} /><meshStandardMaterial color={col} metalness={k} roughness={0.55 - 0.3 * k} /></mesh>
            {k < 1 && <mesh position={[0, PYR_R * 0.97, 0]} scale={1 - k}><sphereGeometry args={[PYR_R * 0.16, 12, 12]} /><meshStandardMaterial color={LEAF} roughness={0.6} /></mesh>}
          </group>
        );
      })}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  const r = radiiAt(t), show = 1 - prog(t, T_CELL_OUT, 0.4);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.55} />
      <ambientLight intensity={0.35} />
      <Box show={show} />
      {CORNERS.map((c, i) => <CellOrange key={`c${i}`} at={c} r={r.corner} lift={dropY(i, t)} t={t} show={show} />)}
      {FACES.map((f, i) => <CellOrange key={`f${i}`} at={f} r={r.face} t={t} show={show} />)}
      <CellOrange at={BODY} r={r.body} t={t} show={show} />
      <Pyramid t={t} />
    </>
  );
}

// The live share of the box that's orange, top left of the band, while the box is up.
function Fill({ t }: { t: number }) {
  const a = prog(t, T_SC, 0.4) * (1 - prog(t, T_CELL_OUT, 0.4));
  if (a <= 0) return null;
  const won = t >= ANSWER_AT;
  return (
    <div style={{ position: 'absolute', left: 50, top: BAND.top + 20, opacity: a, background: P.card, borderRadius: 30, padding: '10px 26px 14px', textAlign: 'center' }}>
      <div style={{ ...hand(84), lineHeight: '96px', color: won ? P.amber : P.ink, fontVariantNumeric: 'tabular-nums' }}>{(fillAt(t) * 100).toFixed(1)}%</div>
      <div style={{ font: `600 26px ${SOFT_UI}`, color: P.muted }}>of the box is orange</div>
    </div>
  );
}

// Three bars, one per stacking, each counting up once it has settled; the winner glows after the answer.
const FINAL = [FILLS.sc, FILLS.bcc, FILLS.fcc], NAMES = ['simple cubic', 'body-centred', 'face-centred'], BX = [250, 540, 830], BASE = 1440, MAXH = 240;
function Bars({ t }: { t: number }) {
  const bars = barsAt(t), win = prog(t, ANSWER_AT, 0.4);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={1140} width={960} height={370} rx={44} fill={P.card} />
      <line x1={110} y1={BASE} x2={970} y2={BASE} stroke={P.axis} strokeWidth={3} />
      {bars.map((v, k) => {
        const h = v * MAXH, glow = k === 2 ? win : 0;
        return (
          <g key={k}>
            <rect x={BX[k] - 70} y={BASE - h} width={140} height={h} rx={14} fill={k === 2 && glow > 0 ? V.green : ORANGE} opacity={0.85 + 0.15 * glow} />
            {v > 0 && <text x={BX[k]} y={BASE - h - 14} textAnchor="middle" fill={P.ink} opacity={v / FINAL[k]} style={{ ...hand(38), fontVariantNumeric: 'tabular-nums' }}>{(FINAL[k] * 100).toFixed(1)}%</text>}
            <text x={BX[k]} y={BASE + 38} textAnchor="middle" fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>{NAMES[k]}</text>
          </g>
        );
      })}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 42, weight: 400, color: P.muted, text: 'Simple 52% · body-centred 68% · face-centred 74%' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: '74% is as tight as it gets' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #9' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem008({ cover = false, voice = false }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'CHEMISTRY, VISUALISED  #8'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={220} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.08, bottom: 0.1, left: 0.04, right: 0.04 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Fill t={t} />
        <Bars t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1600} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-chem-008-packing-voice-mix.wav' : 'pv-chem-008-packing-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
