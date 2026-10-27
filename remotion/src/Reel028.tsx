// @lws.pune · reel 028 (3D, predict-first): on a circle of radius 1, which line is tan θ? B. A glossy ring on a thin glass
// disc turns in a full orbit (F22) while three candidate lines pulse with their chips; the sin–cos triangle fills and grows
// from the centre by 1/cos θ until its base is 1, so its height lands on the line touching the circle and becomes tan θ;
// that touching line glows (tangent = touching), the slant that cuts the circle lights (secant = cutting), the same build
// at the top gives cot θ and cosec θ (θ marked again where the ray meets the top line), the two identities, then θ sweeps
// and all six lines change with live readouts. Every line comes from the tested `segmentsAt`. Timeline: lib/reel028.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import type { Platform } from './lib/platform.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, OPTION_LINES, PULSES, COVER_T, COLORS, HEADER, BAND, FORMULA_Y, FORMULA_SIZE,
  ARC_C, SWEEP_START, PINGS, CUTS, END_LINES, END_AT_LINE, figure, thetaAt, segmentsAt, slabAt, cameraAt, labelsAt, labelBox,
  type Segment, type V3,
} from './lib/reel028.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RealLight } from './realism.tsx';
import { softEdges } from './shapes.tsx';

// the cover has no header: the profile grid's 3:4 crop (y 240–1680) would cut it through the question (review panel)
const COVER = { text: 'Which line is tan θ?', y: 1590, size: 72 };
// lines sit just in front of the glass, each family on its own depth so overlapping rods never flicker
const DEPTH: Record<string, number> = { radius: 0.02, ray: 0.012, touchRight: 0.01, touchTop: 0.01, base: 0.024, height: 0.032, sin: 0.03,
  cos: 0.034, tan: 0.03, sec: 0.028, cot: 0.03, cosec: 0.028 };

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

/** A glossy rod from a to b (round ends, F8). */
function Rod({ s }: { s: Segment }) {
  if (s.alpha <= 0.01) return null;
  const z = DEPTH[s.id] ?? 0.02, a = new THREE.Vector3(s.a[0], s.a[1], z), b = new THREE.Vector3(s.b[0], s.b[1], z);
  const len = a.distanceTo(b);
  if (len < 1e-4) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  const mat = <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.18 + s.glow} roughness={0.35} metalness={0.05}
    transparent={s.alpha < 1} opacity={s.alpha} toneMapped={false} />;
  return <>
    <mesh position={mid} quaternion={q} castShadow><capsuleGeometry args={[s.r, len, 6, 16]} />{mat}</mesh>
  </>;
}

function Slab({ t }: { t: number }) {
  const { pts, alpha } = slabAt(t);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    return g;
  }, []);
  const arr = geo.attributes.position.array as Float32Array;
  pts.forEach((p, i) => { arr[3 * i] = p[0]; arr[3 * i + 1] = p[1]; arr[3 * i + 2] = 0.006; });
  geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
  if (alpha <= 0.01) return null;
  return <mesh geometry={geo}><meshBasicMaterial color={P.blue} transparent opacity={alpha} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
}

/** An arc of angle th (radians) round `at`, starting at angle `from`. */
function Arc({ at, from, th, r, opacity }: { at: V3; from: number; th: number; r: number; opacity: number }) {
  if (opacity <= 0.01) return null;
  return <mesh position={at} rotation={[0, 0, from]}>
    <torusGeometry args={[r, 0.008, 8, 48, th]} />
    <meshStandardMaterial color={COLORS.circle} roughness={0.4} transparent={opacity < 1} opacity={opacity} />
  </mesh>;
}

/** A ring that spreads and fades where a touching line touches the circle. */
function Ping({ at, t0, t, color }: { at: V3; t0: number; t: number; color: string }) {
  const u = (t - (t0 - 0.2)) / 0.8;
  if (u <= 0 || u >= 1) return null;
  return <mesh position={at}><torusGeometry args={[0.05 + 0.2 * u, 0.012, 8, 48]} />
    <meshBasicMaterial color={color} transparent opacity={0.9 * (1 - u)} toneMapped={false} /></mesh>;
}

function Scene({ t }: { t: number }) {
  const f = figure(thetaAt(t)), segs = segmentsAt(t), sweep = 1 - prog(t, SWEEP_START, 0.4);
  const cut = Math.max(...CUTS.map(c => (t >= c - 0.1 && t < c + 0.5 ? Math.sin((Math.PI * (t - c + 0.1)) / 0.6) : 0)));
  return (
    <>
      <CameraRig t={t} />
      <RealLight env={0.9} at={[-3, 6, 9]} span={4} />
      {/* the glass the figure is drawn on, and the circle as a glossy tube */}
      <mesh position={[0.1, 0.1, -0.05]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.32, 1.32, 0.05, 96]} />
        {/* light and see-through: from behind (the orbit's whip) it must not read as a grey plate */}
        <meshPhysicalMaterial color="#f4f7fc" roughness={0.15} metalness={0} transparent opacity={0.3} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh castShadow><torusGeometry args={[1, 0.024, 20, 200]} />
        <meshStandardMaterial color={COLORS.circle} roughness={0.3} metalness={0.15} /></mesh>
      {[[[-1.2, 0], [1.3, 0]], [[0, -1.2], [0, 1.3]]].map(([a, b], i) =>
        <Rod key={i} s={{ id: 'axis', a: a as [number, number], b: b as [number, number], color: P.muted, alpha: 0.55, glow: 0, r: 0.007 }} />)}
      <Slab t={t} />
      {segs.map(s => <Rod key={s.id} s={s} />)}
      <Arc at={[0, 0, 0.02]} from={0} th={f.th} r={0.2} opacity={1} />
      <Arc at={[f.C[0], 1, 0.02]} from={Math.PI} th={f.th} r={0.2} opacity={prog(t, ARC_C, 0.3) * sweep} />
      {/* the point on the circle, and its flash where a slant cuts through */}
      <mesh position={[f.P[0], f.P[1], 0.04]}><sphereGeometry args={[0.04 + 0.04 * cut, 20, 20]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3 + 1.2 * cut} roughness={0.3} toneMapped={false} /></mesh>
      {PINGS.map(p => <Ping key={p.at} at={p.at === 'A' ? [1, 0, 0.04] : [0, 1, 0.04]} t0={p.t} t={t} color={p.at === 'A' ? COLORS.tan : COLORS.cot} />)}
    </>
  );
}

// Labels: HTML in Cambria on top of the canvas, placed with project(); names on white pills in their line's colour.
const NAMES = /(cosec|sin|cos|tan|sec|cot)/;
const colourOf = (w: string) => (COLORS as Record<string, string>)[w];
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t);
  return <>{labelsAt(t).filter(l => l.alpha > 0.01 && l.role !== 'formula').map((l, i) => {
    const b = labelBox(l, cam), tag = l.role === 'tag', pill = l.role !== 'theta', px = tag ? 18 : pill ? 10 : 0, py = tag ? 6 : pill ? 2 : 0;
    return <div key={i} style={{ position: 'absolute', left: b.x0 - px, top: b.y0 - py, width: b.x1 - b.x0 + 2 * px,
      height: b.y1 - b.y0 + 2 * py, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l.alpha,
      ...hand(l.size), fontWeight: l.role === 'name' || tag || l.role === 'readout' ? 800 : 600, color: l.color, whiteSpace: 'pre',
      background: pill ? (tag ? tint(l.color, 0.14) : tint('#ffffff', 0.9)) : undefined, borderRadius: 999,
      border: tag ? `3px solid ${tint(l.color, 0.75)}` : undefined, boxSizing: 'border-box',
      boxShadow: l.role === 'pill' ? `0 3px 10px ${tint(P.ink, 0.15)}` : undefined }}>{l.text}</div>;
  })}</>;
}

/** The identity line at the top of the band, each ratio's name in its line's colour. */
function Formula({ t }: { t: number }) {
  const l = labelsAt(t).find(x => x.role === 'formula')!;
  if (l.alpha <= 0.01) return null;
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: FORMULA_Y - FORMULA_SIZE * 0.62, textAlign: 'center', opacity: l.alpha,
    ...hand(FORMULA_SIZE), color: P.ink, whiteSpace: 'pre' }}>
    {l.text.split(NAMES).map((w, i) => (colourOf(w) && NAMES.test(w) ? <span key={i} style={{ color: colourOf(w), fontWeight: 800 }}>{w}</span> : <span key={i}>{w}</span>))}
  </div>;
}

export function Reel028({ cover = false, voice = false, platform = 'instagram' }: { cover?: boolean; voice?: boolean; platform?: Platform }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  const END: EndLine[] = [
    { at: END_AT_LINE[0], size: 60, weight: 600, color: P.ink, text: END_LINES[0] },
    { at: END_AT_LINE[1], size: 60, weight: 600, color: P.ink, text: END_LINES[1] },
    { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
  ];
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        {!cover && <PredictHeader t={t} label={'NDA MATHS  ·  TRIGONOMETRY'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={150}
          chipColors={OPTION_LINES.map(n => COLORS[n])} chipPulses={PULSES} />}
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.03, bottom: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        <Labels t={t} />
        {!cover && <Formula t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 46} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} platform={platform} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'nda-maths-028-trig-lines-voice-mix.wav' : 'nda-maths-028-trig-lines-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
