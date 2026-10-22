// @pyqvault_ · framework-2 test, reel A (L61): electromagnetic induction made by `reels/pyqvault-framework-2.md` (its P18
// storyboard; the timeline and the reasons are in lib/pf2.ts). Exploded parts → assemble → the field switches on → the
// magnet moves in, stops, pulls out while a galvanometer swings → Faraday's law → "No change in flux → no induced EMF".
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, MATH_FONT, tint } from './lib/palette.ts';
import {
  HOOK, PROCESS, PRINCIPLE, LAW_LABELS, ASSUMPTION, TAKEAWAY, BRAND, BAND, COVER_T, LABELS, LABEL_AT, LEADS, TERMINALS,
  BENDS, METER_SIZE, NEEDLE_MAX_DEG, COLOURS as C, CLOSED, magnetU, magnetY, needle, fieldAlpha, partAt, formerAt, meterAt,
  windingAt, labelAlpha, processAlpha, hookAlpha, explainAlpha, takeawayAlpha, brandAlpha, cameraAt,
} from './lib/pf2.ts';
import { MAG3, chargeAt, project, wire, type V3 } from './lib/inductionScene.ts';
import { Board, Caption, Card, Theme, useFonts } from './board.tsx';
import { softEdges } from './shapes.tsx';
import { RealLight } from './realism.tsx';
import { BloomWarmUp, Coil, CurrentDots, FieldLines, Former, Galvanometer, Magnet, Wire } from './induction3d.tsx';

const WIRE_A = wire(LEADS.top, BENDS.a, TERMINALS.a), WIRE_B = wire(TERMINALS.b, BENDS.b, LEADS.bottom);
const COVER = { text: HOOK, y: 1430, size: 62 };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

function Scene({ t }: { t: number }) {
  const w = windingAt(t), q = chargeAt(magnetU, t), flow = Math.min(1, Math.abs(needle(t)) * 5);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <RealLight env={0.55} key={1.3} at={[-3, 6, 7]} span={6} />
      <ambientLight intensity={0.35} />
      <Former at={formerAt(t)} color={C.glass} alpha={0.4 + 0.6 * partAt('former', t)} />
      <Coil r={w.r} h={w.h} y={w.y} spin={w.spin} color={C.copper} />
      <Magnet y={magnetY(t)} north={C.north} south={C.south} />
      <FieldLines y={magnetY(t)} alpha={fieldAlpha(t)} color={C.field} />
      <Wire pts={WIRE_A} upTo={partAt('wireA', t)} color={C.wire} />
      <Wire pts={WIRE_B} upTo={partAt('wireB', t)} color={C.wire} />
      {t >= CLOSED && <>
        <CurrentDots pts={WIRE_A} phase={q * 1.2} alpha={flow} color={C.current} />
        <CurrentDots pts={WIRE_B} phase={q * 1.2} alpha={flow} color={C.current} />
      </>}
      <Galvanometer at={meterAt(t)} size={METER_SIZE} deg={needle(t) * NEEDLE_MAX_DEG} body="#2a3240" face="#c4ccd6" ink="#1b2330" needleColor="#b3261e" />
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={0.9} radius={0.55} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

/** Labels and the pole letters, placed on the page where their 3D points land. */
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t), at = (p: V3) => project(p, cam, BAND);
  const label = (p: V3, text: string, alpha: number, align: 'center' | 'right' = 'center', color: string = P.ink, size = 36) => {
    if (alpha <= 0.01) return null;
    const q = at(p);
    return <div key={text} style={{ position: 'absolute', left: q.x, top: q.y, transform: `translate(${align === 'right' ? '-100%' : '-50%'}, -50%)`,
      opacity: alpha, font: `600 ${size}px ${SOFT_UI}`, color, whiteSpace: 'nowrap', textShadow: `0 2px 10px ${P.board}` }}>{text}</div>;
  };
  const y = magnetY(t);
  return (
    <>
      {label([0, y - MAG3.h / 4, MAG3.r + 0.01], 'N', 1, 'center', '#ffffff', 30)}
      {label([0, y + MAG3.h / 4, MAG3.r + 0.01], 'S', 1, 'center', '#ffffff', 30)}
      {LABELS.map(l => label(LABEL_AT[l.part](t), l.text, labelAlpha(l.part, t), l.part === 'magnet' ? 'right' : 'center'))}
      {label([0.78, 0.78, 0], PROCESS, processAlpha(t), 'center', C.field, 42)}
    </>
  );
}

function FormulaCard({ t }: { t: number }) {
  const a = explainAlpha(t);
  if (a <= 0.01) return null;
  return (
    <div style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 150, textAlign: 'center', font: `700 58px/72px ${SOFT_UI}`, color: P.ink, whiteSpace: 'pre-line' }}>
        {PRINCIPLE.replace(' induces', '\ninduces')}
      </div>
      <Card x={120} y={1290} w={840} h={290} r={36} />
      <div style={{ position: 'absolute', left: 120, width: 840, top: 1318, textAlign: 'center', font: `400 92px/1 ${MATH_FONT}`, color: P.ink }}>
        ℰ = <span style={{ color: C.amber }}>−</span>N <span style={{ color: C.field }}>dΦ/dt</span>
      </div>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 1440, display: 'flex', justifyContent: 'center', gap: 56, font: `600 34px ${SOFT_UI}` }}>
        <span style={{ color: C.field }}>{LAW_LABELS[0]}</span><span style={{ color: C.amber }}>− : {LAW_LABELS[1]}</span>
      </div>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 1506, textAlign: 'center', font: `600 28px ${SOFT_UI}`, color: P.muted }}>{ASSUMPTION}</div>
    </div>
  );
}

export function PvF2Induction({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = cover ? COVER_T : frame / fps;
  const hook = cover ? 0 : hookAlpha(t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <div style={{ position: 'absolute', left: BAND.width * 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.06, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Labels t={t} />
        {hook > 0.01 && (
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 170, textAlign: 'center', opacity: hook, font: `700 72px/86px ${SOFT_UI}`, color: P.ink }}>{HOOK}</div>
        )}
        <FormulaCard t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : takeawayAlpha(t) > 0 && <Caption text={TAKEAWAY} alpha={takeawayAlpha(t)} age={t - 25.3} size={48} y={1440} />}
        {!cover && brandAlpha(t) > 0.01 && (
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1540, textAlign: 'center', opacity: brandAlpha(t), font: `700 30px ${SOFT_UI}`, color: tint(P.muted, 0.9), letterSpacing: 1 }}>{BRAND}</div>
        )}
        {!cover && <Html5Audio src={staticFile('pv-f2-induction-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
