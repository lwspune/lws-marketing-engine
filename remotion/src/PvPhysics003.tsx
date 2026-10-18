// @pyqvault_ · Physics, visualised #3: where does a pendulum's energy go? Dark lab look (L22 rotation).
// A real three.js pendulum; live bars for height (PE), speed (KE) and heat; a stacked chart of the energy over time that
// always fills to the same 4.20 J line, until the air turns part of it into heat.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import { END_AT, RELEASE, DRAG_ON, E0, L, THETA0, CAPTIONS, stateAt, energyAt } from './lib/pp003.ts';
import { Board, Caption, EndCard, TitleCard, Theme, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 10.55, text: 'Where does the\nenergy go?', y: 1590, size: 60 };
const BAND = { left: 0, top: 470, width: 640, height: 700 };
const PIVOT = new THREE.Vector3(0, 1.3, 0), C = { pe: P.blue, ke: P.green, heat: P.amber };
const bobAt = (th: number) => new THREE.Vector3(L * Math.sin(th), PIVOT.y - L * Math.cos(th), 0);

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, az = 0.1 * Math.sin((2 * Math.PI * t) / 20);
  cam.position.set(4.0 * Math.sin(az), 0.85, 4.0 * Math.cos(az)); cam.fov = 34; cam.aspect = BAND.width / BAND.height;
  cam.lookAt(0, 0.62, 0); cam.updateProjectionMatrix();
  return null;
}
function Rod({ a, b, r, color, opacity = 1, metal = 0.2 }: { a: THREE.Vector3; b: THREE.Vector3; r: number; color: string; opacity?: number; metal?: number }) {
  const len = a.distanceTo(b); if (len < 1e-4 || opacity <= 0) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return <mesh position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q}>
    <cylinderGeometry args={[r, r, len, 16]} />
    <meshStandardMaterial color={color} roughness={0.35} metalness={metal} transparent={opacity < 1} opacity={opacity} />
  </mesh>;
}
function Scene({ t }: { t: number }) {
  const { theta, omega } = stateAt(t), bob = bobAt(theta), a = prog(t, 3.0, 0.6);
  const arc = Array.from({ length: 41 }, (_, i) => bobAt(-THETA0 + (2 * THETA0 * i) / 40));
  const tangent = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).multiplyScalar(omega * 0.16); // velocity direction × speed
  const low = bobAt(0);
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[-2, 4, 4]} intensity={2.4} />
      <pointLight position={[2, 1, 2]} intensity={6} color={P.blue} />
      <group visible={a > 0}>
        <Rod a={new THREE.Vector3(-0.7, PIVOT.y + 0.04, 0)} b={new THREE.Vector3(0.7, PIVOT.y + 0.04, 0)} r={0.035} color="#8d97a8" metal={0.7} />
        {arc.slice(1).map((p, i) => i % 2 === 0 && <Rod key={i} a={arc[i]} b={p} r={0.008} color={P.muted} opacity={0.5} />)}
        <Rod a={new THREE.Vector3(-0.9, low.y, 0)} b={new THREE.Vector3(0.9, low.y, 0)} r={0.006} color={P.muted} opacity={0.4} />
        <Rod a={PIVOT} b={bob} r={0.012} color="#cfd6e2" metal={0.4} />
        <mesh position={bob}><sphereGeometry args={[0.13, 40, 40]} /><meshStandardMaterial color="#b9c6ff" roughness={0.18} metalness={0.55} /></mesh>
        {Math.abs(omega) > 0.15 && <Rod a={bob} b={bob.clone().add(tangent)} r={0.022} color={C.ke} />}
        {/* height above the lowest point (PE) */}
        {bob.y - low.y > 0.02 && <Rod a={new THREE.Vector3(bob.x, low.y, 0.02)} b={new THREE.Vector3(bob.x, bob.y - 0.13, 0.02)} r={0.012} color={C.pe} />}
      </group>
    </>
  );
}

// Three live bars on the right, in joules, against the starting 4.20 J.
function Bars({ t }: { t: number }) {
  const e = energyAt(t), a = prog(t, 3.2, 0.6), H = 420, base = 1080;
  const bars: [string, number, string][] = [['height', e.pe, C.pe], ['speed', e.ke, C.ke], ['heat', Math.max(0, e.heat), C.heat]];
  return (
    <div style={{ position: 'absolute', left: 660, top: base - H - 90, width: 380, height: H + 160, opacity: a }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 50, borderTop: `2px dashed ${tint(P.ink, 0.35)}` }} />
      <div style={{ position: 'absolute', right: 0, top: 12, font: `600 26px ${SOFT_UI}`, color: P.muted }}>{E0.toFixed(2)} J</div>
      {bars.map(([label, v, color], i) => {
        const h = (H - 40) * Math.max(0, Math.min(1, v / E0));
        return <div key={label} style={{ position: 'absolute', left: 20 + i * 120, width: 92, top: 52, height: H - 40 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: tint(P.ink, 0.06) }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, borderRadius: 14, background: color,
            boxShadow: `0 0 18px ${tint(color, 0.45)}` }} />
          <div style={{ position: 'absolute', left: -14, right: -14, bottom: h + 8, textAlign: 'center', ...hand(30), color: P.ink,
            fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(1)}</div>
          <div style={{ position: 'absolute', left: -20, right: -20, top: H - 26, textAlign: 'center', font: `600 30px ${SOFT_UI}`, color }}>{label}</div>
        </div>;
      })}
    </div>
  );
}

// The energy over time, stacked: speed (bottom), height, heat (top). The stack always reaches the 4.20 J line.
const CH = { x0: 70, x1: 1010, y0: 1400, h: 200 };
function Chart({ t }: { t: number }) {
  const a = prog(t, RELEASE, 0.5); if (a <= 0) return null;
  const X = (s: number) => CH.x0 + ((s - RELEASE) / (END_AT - RELEASE)) * (CH.x1 - CH.x0), Y = (j: number) => CH.y0 - (j / E0) * CH.h;
  const n = Math.max(2, Math.round((Math.min(t, END_AT) - RELEASE) * 30)), ts = Array.from({ length: n + 1 }, (_, i) => RELEASE + ((Math.min(t, END_AT) - RELEASE) * i) / n);
  const es = ts.map(energyAt);
  const band = (lo: (i: number) => number, hi: (i: number) => number) =>
    ts.map((s, i) => `${i ? 'L' : 'M'}${X(s).toFixed(1)},${Y(hi(i)).toFixed(1)}`).join(' ') + ' ' +
    [...ts].reverse().map((s, j) => `L${X(s).toFixed(1)},${Y(lo(ts.length - 1 - j)).toFixed(1)}`).join(' ') + ' Z';
  const ke = (i: number) => es[i].ke, pe = (i: number) => es[i].ke + es[i].pe, all = (i: number) => es[i].ke + es[i].pe + Math.max(0, es[i].heat);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <line x1={CH.x0} y1={Y(E0)} x2={CH.x1} y2={Y(E0)} stroke={tint(P.ink, 0.35)} strokeWidth={2} strokeDasharray="8 8" />
      <line x1={CH.x0} y1={CH.y0} x2={CH.x1} y2={CH.y0} stroke={P.axis} strokeWidth={2} />
      <path d={band(() => 0, ke)} fill={tint(C.ke, 0.85)} />
      <path d={band(ke, pe)} fill={tint(C.pe, 0.85)} />
      <path d={band(pe, all)} fill={tint(C.heat, 0.9)} />
      <line x1={X(DRAG_ON)} y1={CH.y0 + 8} x2={X(DRAG_ON)} y2={Y(E0) - 8} stroke={tint(P.ink, 0.4)} strokeWidth={2} opacity={t >= DRAG_ON ? 1 : 0} />
      <text x={X(DRAG_ON) + 10} y={Y(E0) - 14} fill={P.muted} opacity={t >= DRAG_ON ? 1 : 0} style={{ font: `600 26px ${SOFT_UI}` }}>air on</text>
      <text x={CH.x0} y={CH.y0 + 36} fill={P.muted} style={{ font: `600 26px ${SOFT_UI}` }}>energy over time</text>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Height ⇄ speed, then heat.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the physics.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #4' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvPhysics003({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <TitleCard t={t} label={'PHYSICS, VISUALISED  #3'} lines={['Where does a swinging', 'pendulum’s energy go?']} size={70} color={P.green} />
        <div style={{ position: 'absolute', left: BAND.left, top: BAND.top, width: BAND.width, height: BAND.height, opacity: prog(t, 3.0, 0.6) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Bars t={t} />
        {!cover && <Chart t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1560} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-003-pendulum.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
