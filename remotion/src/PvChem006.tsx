// @pyqvault_ · Chemistry, visualised #6 (predict-first): a barium salt goes into the flame: yellow, green or red?
// Dark lab look (L22 rotation: C6 dark) so the flames glow. Five three.js burners; salts go in one by one and each flame
// takes its metal's colour while the spectrum below lights that metal's real lines (lib/pc006.ts). Then the why: an atom
// whose electron is kicked up by the heat and falls back, giving out one colour (barium: 524 nm, 2.37 eV). The closing
// moment is the one orbit (F22) round the five coloured flames. Framework v1.5.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, METALS, CAMERA, T_ORBIT, T_UP, T_DOWN, PHOTON_EV, saltAt, colourAt, flameFlicker,
  electronShellAt, photonAt,
} from './lib/pc006.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { t: 0.6, text: 'Yellow, green or red?', y: 1590, size: 64 };   // all flames still gas-blue: no spoiler
const BAND = { left: 0, top: 470, width: 1080, height: 640 };
const X = METALS.map((_, i) => -2.4 + 1.2 * i);
// A flame's outline: round at the base, tapering to a soft tip (r(u) for u = 0 at the base … 1 at the tip).
const FLAME = new THREE.LatheGeometry(Array.from({ length: 33 }, (_, k) => {
  const u = k / 32; return new THREE.Vector2(Math.max(0.0005, Math.sin(Math.PI * u ** 0.55) * (1 - u) ** 0.35), u);
}), 40);

// One camera pose for the 3D view and for the labels that follow the burners.
function pose(t: number) {
  const [zoom, focus, az] = tween(t, CAMERA.start, CAMERA.keys), d = 6.9 / zoom;
  const target = new THREE.Vector3(focus, 0.75, 0);
  return { target, position: new THREE.Vector3(focus + d * Math.sin(az), 0.75 + 1.5 / zoom, d * Math.cos(az)) };
}
function setCam(cam: THREE.PerspectiveCamera, t: number) {
  const { target, position } = pose(t);
  cam.position.copy(position); cam.fov = 30; cam.aspect = BAND.width / BAND.height; cam.lookAt(target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
}
function Rig({ t }: { t: number }) { const { camera } = useThree(); setCam(camera as THREE.PerspectiveCamera, t); return null; }
const LABEL_CAM = new THREE.PerspectiveCamera();
const toScreen = (t: number, x: number, y: number, z = 0) => {
  setCam(LABEL_CAM, t);
  const v = new THREE.Vector3(x, y, z).project(LABEL_CAM);
  return { x: BAND.left + ((v.x + 1) / 2) * BAND.width, y: BAND.top + ((1 - v.y) / 2) * BAND.height };
};

function Burner({ i, t }: { i: number; t: number }) {
  const x = X[i], col = new THREE.Color(colourAt(i, t)), f = flameFlicker(i, t), m = METALS[i];
  const pour = (t - (m.at - 0.35)) / 0.45;                    // the salt falls into the flame
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.05, 0]}><RoundBox size={[0.62, 0.1, 0.46]} radius={0.04} /><meshStandardMaterial color="#59606e" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.075, 0.085, 0.8, 24]} /><meshStandardMaterial color="#9aa3b2" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.11, 0.11, 0.12, 24]} /><meshStandardMaterial color="#7d889a" metalness={0.6} roughness={0.35} /></mesh>
      {/* the flame: a soft outer flame in the metal's colour round a pale inner cone */}
      <mesh geometry={FLAME} position={[0, 0.88, 0]} scale={[0.3, 1.05 * f, 0.3]}><meshBasicMaterial color={col} transparent opacity={0.22} depthWrite={false} /></mesh>
      <mesh geometry={FLAME} position={[0, 0.9, 0]} scale={[0.2, 0.85 * f, 0.2]}><meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} transparent opacity={0.75} depthWrite={false} /></mesh>
      <mesh geometry={FLAME} position={[0, 0.9, 0]} scale={[0.085, 0.3 * f, 0.085]}><meshStandardMaterial color="#cfe0ff" emissive="#9cc2ff" emissiveIntensity={0.9} transparent opacity={0.75} depthWrite={false} /></mesh>
      <pointLight position={[0, 1.2, 0.3]} intensity={2.4} distance={2.6} color={col} />
      {pour > 0 && pour < 1 && Array.from({ length: 9 }, (_, k) => (
        <mesh key={k} position={[0.06 * Math.sin(k * 2.3), 2.0 - pour * (0.75 + 0.06 * (k % 3)) - 0.05 * k, 0.06 * Math.cos(k * 1.7)]}>
          <sphereGeometry args={[0.022, 8, 8]} /><meshStandardMaterial color="#f4f1ea" emissive="#ffffff" emissiveIntensity={0.3} transparent opacity={1 - pour * 0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[-3, 6, 5]} intensity={1.4} />
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.2, 64]} /><meshStandardMaterial color="#1c2431" roughness={0.9} /></mesh>
      {METALS.map((_, i) => <Burner key={i} i={i} t={t} />)}
    </>
  );
}

// Each burner's symbol follows it on screen: muted until its salt goes in, then in its colour with its main line.
function Labels({ t }: { t: number }) {
  const a = prog(t, 0.2, 0.5) * (1 - prog(t, T_ORBIT, 0.5));
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      {METALS.map((m, i) => {
        const p = toScreen(t, X[i], -0.12, 0.25), s = saltAt(i, t);
        return (
          <div key={m.sym} style={{ position: 'absolute', left: p.x - 90, top: p.y, width: 180, textAlign: 'center' }}>
            <div style={{ ...hand(48), color: s > 0.5 ? m.hex : P.muted }}>{m.sym}</div>
            <div style={{ font: `600 24px ${SOFT_UI}`, color: P.muted, opacity: s, fontVariantNumeric: 'tabular-nums' }}>{Math.round(m.nm[0])} nm</div>
          </div>
        );
      })}
    </div>
  );
}

// Visible light, 380–780 nm, as colour (an approximation of the spectrum's look, for the bar and the lines).
function nmColor(nm: number) {
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else { r = 1; }
  const k = nm > 700 ? 0.3 + (0.7 * (780 - nm)) / 80 : nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : 1;
  return `rgb(${[r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * k)))).join(',')})`;
}
const SP = { x0: 120, x1: 960, y: 1236, h: 64, lo: 380, hi: 780 };
const sx = (nm: number) => SP.x0 + ((nm - SP.lo) / (SP.hi - SP.lo)) * (SP.x1 - SP.x0);
function Spectrum({ t }: { t: number }) {
  const a = Math.max(prog(t, 0.8, 0.5) * (1 - prog(t, 6.4, 0.4)), prog(t, 12.6, 0.4) * (1 - prog(t, T_ORBIT, 0.5)));
  if (a <= 0) return null;
  const stops = Array.from({ length: 21 }, (_, k) => SP.lo + (k / 20) * (SP.hi - SP.lo));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs><linearGradient id="spec">{stops.map(nm => <stop key={nm} offset={(nm - SP.lo) / (SP.hi - SP.lo)} stopColor={nmColor(nm)} />)}</linearGradient></defs>
      <rect x={SP.x0} y={SP.y} width={SP.x1 - SP.x0} height={SP.h} rx={SP.h / 2} fill="url(#spec)" opacity={0.18} />
      {METALS.flatMap((m, i) => m.nm.map(nm => {
        const s = saltAt(i, t);
        return s > 0 ? <rect key={m.sym + nm} x={sx(nm) - 4} y={SP.y - 6} width={8} height={SP.h + 12} rx={4} fill={nmColor(nm)} opacity={s} /> : null;
      }))}
      {[400, 500, 600, 700].map(nm => <text key={nm} x={sx(nm)} y={SP.y + SP.h + 38} textAnchor="middle" fill={P.muted} style={{ font: `600 24px ${SOFT_UI}` }}>{nm}</text>)}
      <text x={SP.x0} y={SP.y - 22} fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>light given out (nm)</text>
    </svg>
  );
}

// The why: shell 1 → shell 3 with the heat, back to shell 1, and one photon of barium's green flies out.
const AT = { x: 300, y: 1330, r0: 52, dr: 44 };
function Atom({ t }: { t: number }) {
  const a = prog(t, 6.6, 0.4) * (1 - prog(t, 12.4, 0.4));
  if (a <= 0) return null;
  const shell = electronShellAt(t), r = AT.r0 + (shell - 1) * AT.dr, ang = t * 2.4, ph = photonAt(t), green = METALS[4].hex;
  const ex = AT.x + r * Math.cos(ang), ey = AT.y - r * Math.sin(ang), heat = prog(t, T_UP - 0.4, 0.3) * (1 - prog(t, T_UP + 0.9, 0.3));
  const wave = (x0: number, len: number) => Array.from({ length: 41 }, (_, k) => `${k ? 'L' : 'M'}${(x0 + (k / 40) * len).toFixed(1)},${(AT.y + 18 * Math.sin((k / 40) * len / 22 - t * 9)).toFixed(1)}`).join(' ');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <rect x={60} y={1150} width={960} height={360} rx={48} fill={P.card} opacity={0.94} />
      {[1, 2, 3].map(n => <circle key={n} cx={AT.x} cy={AT.y} r={AT.r0 + (n - 1) * AT.dr} fill="none" stroke={tint(P.ink, 0.25)} strokeWidth={3} />)}
      <circle cx={AT.x} cy={AT.y} r={16} fill={P.amber} />
      <circle cx={ex} cy={ey} r={13} fill={P.blue} />
      <text x={AT.x} y={1490} textAnchor="middle" fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>barium atom</text>
      {heat > 0 && <text x={AT.x - 190} y={AT.y + 10} textAnchor="middle" fill="#ff8a3c" opacity={heat} style={{ ...hand(36) }}>heat 🔥</text>}
      {ph && <g>
        <path d={wave(AT.x + AT.r0 + 30, 520 * ph.travel)} fill="none" stroke={green} strokeWidth={6} strokeLinecap="round" />
        <text x={760} y={1255} textAnchor="middle" fill={green} opacity={prog(t, T_DOWN + 0.6, 0.4)} style={{ ...hand(40), fontVariantNumeric: 'tabular-nums' }}>524 nm · {PHOTON_EV.toFixed(2)} eV</text>
      </g>}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'One metal, one colour of light.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the chemistry.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #7' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem006({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'CHEMISTRY, VISUALISED  #6'} lines={['A barium salt goes into the flame.', 'The flame turns…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={52} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.12, left: 0.05, right: 0.05 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Labels t={t} />
        <Spectrum t={t} />
        <Atom t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-006-flame-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
