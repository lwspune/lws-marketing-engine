// @pyqvault_ · Chemistry, visualised #7 (predict-first): 64 atoms, two half-lives: how many are left? White look (L22
// rotation: C7 white). A three.js tray of 64 unstable atoms, glowing and pulsing from frame 0; each decays at random
// (a flash, a particle flying off, the atom turns stable teal) while a Geiger counter clicks, the count halves and the
// N–t graph draws itself (lib/pc007.ts). The clock pauses on 16 for the answer, then runs on: 8, 4, 2, 1, the same
// half-life every time. The graph's axis then turns into years for carbon-14 and a bone is dated live. Two renders:
// silent, and with the voiceover (L43), from the same picture.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, N0, HEADER, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, RESUME, CAMERA, T_CARBON, COVER_T, C14_YEARS, DECAY_H,
  halfLivesAt, countAt, decayTimeOf, sinceDecay, glowAt, survivorsLit, carbonAge,
} from './lib/pc007.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const BAND = { left: 0, top: 470, width: 1080, height: 640 };
const HOT = '#ff5a36', HOT_GLOW = '#ff8a3d', STABLE = '#4fa9b8', FLASH = '#ffd23f';
const GAP = 0.46, pos = (i: number) => [((i % 8) - 3.5) * GAP, 0.2, (Math.floor(i / 8) - 3.5) * GAP] as const;
// A fixed random direction for each atom's particle (the same every render).
const DIR = Array.from({ length: N0 }, (_, i) => { const a = i * 2.399963, up = 0.55 + 0.4 * ((i * 0.618) % 1); return [Math.cos(a) * (1 - up), up, Math.sin(a) * (1 - up)]; });

function setCam(cam: THREE.PerspectiveCamera, t: number) {
  const [zoom] = tween(t, CAMERA.start, CAMERA.keys), d = 7.4 / zoom;
  cam.position.set(0, d * 0.72, d * 0.7); cam.fov = 30; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, -0.15, 0.15); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
}
function Rig({ t }: { t: number }) { const { camera } = useThree(); setCam(camera as THREE.PerspectiveCamera, t); return null; }

function Atom({ i, t }: { i: number; t: number }) {
  const [x, y, z] = pos(i), s = sinceDecay(i, t);
  if (s === null) {
    const g = glowAt(i, t), lit = survivorsLit(t), col = new THREE.Color(HOT);
    return (
      <mesh position={[x, y + 0.03 * g, z]} scale={1 + 0.06 * g + 0.12 * lit}>
        <sphereGeometry args={[0.17, 28, 28]} />
        <meshStandardMaterial color={col} emissive={HOT_GLOW} emissiveIntensity={0.35 + 0.45 * g + 0.6 * lit} roughness={0.35} />
      </mesh>
    );
  }
  const settle = prog(s, 0, 0.35), flash = Math.max(0, 1 - s / 0.45), fly = Math.min(1, s / 0.7), d = DIR[i];
  const col = new THREE.Color(HOT).lerp(new THREE.Color(STABLE), settle);
  return (
    <group>
      <mesh position={[x, y, z]} scale={1 - 0.22 * settle}>
        <sphereGeometry args={[0.17, 28, 28]} /><meshStandardMaterial color={col} roughness={0.45} emissive={FLASH} emissiveIntensity={1.2 * flash} />
      </mesh>
      {flash > 0 && <mesh position={[x, y, z]} scale={1 + 2.2 * (1 - flash)}>
        <sphereGeometry args={[0.17, 20, 20]} /><meshBasicMaterial color={FLASH} transparent opacity={0.45 * flash} depthWrite={false} />
      </mesh>}
      {fly < 1 && <mesh position={[x + d[0] * 2.2 * fly, y + d[1] * 2.2 * fly, z + d[2] * 2.2 * fly]}>
        <sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={FLASH} emissive={FLASH} emissiveIntensity={1.5} transparent opacity={1 - fly} />
      </mesh>}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[-3, 7, 4]} intensity={2.0} />
      <mesh position={[0, -0.02, 0]}><RoundBox size={[4.0, 0.14, 4.0]} radius={0.07} /><meshStandardMaterial color="#d9dee7" roughness={0.6} /></mesh>
      {Array.from({ length: N0 }, (_, i) => <Atom key={i} i={i} t={t} />)}
    </>
  );
}

// The live count, the half-life clock (with a pause sign while it holds on the answer) and the Geiger counter, each on
// a soft card so they stay readable when the camera pushes in and atoms pass behind them.
const HUD_CARD = { position: 'absolute', background: 'rgba(255, 255, 255, 0.92)', borderRadius: 30, boxShadow: `0 10px 30px ${tint(P.ink, 0.1)}` } as const;
function Hud({ t, fade }: { t: number; fade: number }) {
  const n = countAt(t), h = halfLivesAt(t), held = t >= ANSWER_AT && t < RESUME;
  let led = 0;
  for (let k = 0; k < DECAY_H.length; k++) { const d = t - decayTimeOf(k); if (d >= 0 && d < 0.25) led = Math.max(led, Math.exp(-d / 0.06)); }
  const pop = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - ANSWER_AT) / 0.5)));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <div style={{ ...HUD_CARD, left: 40, top: 462, width: 200, padding: '10px 0 16px', textAlign: 'center' }}>
        <div style={{ ...hand(100), lineHeight: '106px', color: n === 16 && held ? P.amber : P.ink, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.12 * pop})` }}>{n}</div>
        <div style={{ font: `600 28px ${SOFT_UI}`, color: P.muted }}>atoms left</div>
      </div>
      <div style={{ ...HUD_CARD, right: 40, top: 462, padding: '8px 26px', font: `600 28px ${SOFT_UI}`, color: P.muted, fontVariantNumeric: 'tabular-nums' }}>
        half-lives <span style={{ ...hand(46), color: P.blue }}>{h.toFixed(1)}</span>{held && <span style={{ color: P.amber }}> ⏸</span>}
      </div>
      <div style={{ ...HUD_CARD, right: 40, top: 556, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 14, font: `600 24px ${SOFT_UI}`, color: P.muted }}>
        <svg width={86} height={50}>
          <rect x={2} y={2} width={82} height={46} rx={14} fill="#ffffff" stroke={tint(P.ink, 0.25)} strokeWidth={3} />
          <circle cx={24} cy={25} r={11} fill={led > 0.05 ? FLASH : tint(P.ink, 0.12)} opacity={0.35 + 0.65 * led} />
          <path d="M 44 18 h 28 M 44 32 h 18" stroke={tint(P.ink, 0.3)} strokeWidth={5} strokeLinecap="round" />
        </svg>
        Geiger counter
      </div>
    </div>
  );
}

// N against half-lives, drawing itself as the clock runs; at T_CARBON the axes turn into C-14 % and years.
const G = { x0: 170, x1: 980, top: 1190, bottom: 1420, hMax: 6 };
const gx = (h: number) => G.x0 + (h / G.hMax) * (G.x1 - G.x0), gy = (n: number) => G.bottom - (n / N0) * (G.bottom - G.top);
const years = (h: number) => (h * C14_YEARS).toLocaleString('en-IN');
function Graph({ t }: { t: number }) {
  const a = 1;                                                  // up from frame 0: the cover shows the empty axes
  const hNow = Math.min(G.hMax, halfLivesAt(t)), c = prog(t, T_CARBON, 0.6);
  const path = Array.from({ length: 121 }, (_, k) => { const h = (k / 120) * hNow; return `${k ? 'L' : 'M'}${gx(h).toFixed(1)},${gy(N0 * 2 ** -h).toFixed(1)}`; }).join(' ');
  // Carbon dating: a bone's C-14 falls from 100 % to 25 % → two half-lives → 11,460 years.
  const f = 1 - 0.75 * prog(t, T_CARBON + 0.5, 2.6), hb = Math.log2(1 / f);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <rect x={60} y={1140} width={960} height={350} rx={44} fill="#ffffff" opacity={0.96} />
      <line x1={G.x0} y1={G.bottom} x2={G.x1} y2={G.bottom} stroke={P.axis} strokeWidth={3} />
      <line x1={G.x0} y1={G.top - 10} x2={G.x0} y2={G.bottom} stroke={P.axis} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5, 6].map(h => (
        <g key={h}>
          <text x={gx(h)} y={G.bottom + 34} textAnchor="middle" fill={P.muted} opacity={1 - c} style={{ font: `600 24px ${SOFT_UI}` }}>{h}</text>
          {h % 2 === 0 && <text x={gx(h)} y={G.bottom + 34} textAnchor="middle" fill={P.muted} opacity={c} style={{ font: `600 22px ${SOFT_UI}` }}>{years(h)}</text>}
        </g>
      ))}
      {[[64, '100%'], [32, '50%'], [16, '25%']].map(([n, pc]) => (
        <g key={n}>
          <text x={G.x0 - 16} y={gy(n as number) + 8} textAnchor="end" fill={P.muted} opacity={1 - c} style={{ font: `600 24px ${SOFT_UI}` }}>{n}</text>
          <text x={G.x0 - 16} y={gy(n as number) + 8} textAnchor="end" fill={P.muted} opacity={c} style={{ font: `600 22px ${SOFT_UI}` }}>{pc}</text>
        </g>
      ))}
      <text x={G.x1} y={G.top - 6} textAnchor="end" fill={P.muted} style={{ font: `600 24px ${SOFT_UI}` }} opacity={1 - c}>atoms left vs half-lives</text>
      <text x={G.x1} y={G.top - 6} textAnchor="end" fill={P.muted} style={{ font: `600 24px ${SOFT_UI}` }} opacity={c}>C-14 left vs years</text>
      <path d={path} fill="none" stroke={HOT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5, 6].filter(h => h <= hNow + 1e-9).map(h => (
        <circle key={h} cx={gx(h)} cy={gy(N0 * 2 ** -h)} r={h === 2 ? 11 : 8} fill={h === 2 && t >= ANSWER_AT ? P.amber : HOT} opacity={1 - 0.6 * c} />
      ))}
      {c > 0 && <g opacity={c}>
        <line x1={gx(hb)} y1={gy(N0 * f)} x2={gx(hb)} y2={G.bottom} stroke={P.blue} strokeWidth={3} strokeDasharray="8 8" />
        <circle cx={gx(hb)} cy={gy(N0 * f)} r={13} fill={P.blue} />
      </g>}
    </svg>
  );
}

// The dated bone: its C-14 gauge falls to 25 % while the age counts up to 11,460 years (age = 5,730 × log₂(1/f)).
function Bone({ t }: { t: number }) {
  const a = prog(t, T_CARBON + 0.2, 0.5);
  if (a <= 0) return null;
  const f = 1 - 0.75 * prog(t, T_CARBON + 0.5, 2.6), age = carbonAge(f);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <rect x={110} y={560} width={860} height={470} rx={48} fill="#ffffff" />
      {/* the bone: its shapes drawn twice, a wider outline pass then the fill, so the outline is one clean silhouette */}
      {[{ fill: '#b9a782', grow: 5 }, { fill: '#efe6d2', grow: 0 }].map(({ fill, grow }) => (
        <g key={fill} transform="translate(540 700) rotate(-12)" fill={fill}>
          <rect x={-230 - grow} y={-34 - grow} width={460 + 2 * grow} height={68 + 2 * grow} rx={34 + grow} />
          {[-1, 1].map(s => <g key={s}><circle cx={s * 240} cy={-36} r={44 + grow} /><circle cx={s * 240} cy={36} r={44 + grow} /></g>)}
        </g>
      ))}
      <text x={540} y={860} textAnchor="middle" fill={P.muted} style={{ font: `600 30px ${SOFT_UI}` }}>C-14 left</text>
      <rect x={240} y={884} width={600} height={34} rx={17} fill={tint(P.ink, 0.08)} />
      <rect x={240} y={884} width={600 * f} height={34} rx={17} fill={P.blue} />
      <text x={540} y={990} textAnchor="middle" fill={P.ink} style={{ ...hand(52), fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(f * 100)}% → {age.toLocaleString('en-IN')} years old
      </text>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 46, weight: 400, color: P.muted, text: 'Which atom goes? Random.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'How many? Exactly half.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #8' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem007({ cover = false, voice = false }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t), dim = 1 - 0.75 * prog(t, T_CARBON, 0.5);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'CHEMISTRY, VISUALISED  #7'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={52} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, opacity: dim, ...softEdges({ top: 0.1, bottom: 0.12, left: 0.05, right: 0.05 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Hud t={t} fade={1 - prog(t, T_CARBON, 0.4)} />
        <Bone t={t} />
        <Graph t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile(voice ? 'pv-chem-007-halflife-voice-mix.wav' : 'pv-chem-007-halflife-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
