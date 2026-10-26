// @pyqvault_ · Physics, visualised #16 (framework v1.34): your TV remote talks to the TV with radio, infrared or sound?
// Infrared. The timeline, beat table, physics and every text's place are in lib/pp016.ts. Frame 0 is close on a TV remote
// on the dark set; it fires; the electromagnetic spectrum builds as a ladder of seven rows (each its wave, shorter row by
// row, and an everyday object); the remote comes down the ladder comparing its wave and docks in infrared's slot; a phone
// camera shows its flash; the whole ladder is held still as a cheat sheet (F39), then everything rewinds to frame 0.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, tint } from './lib/palette.ts';
import {
  BANDS, ROW_Y, ICON_X, WAVE_X, REMOTE_WAVE, PHONE, TV, COVER_T, COLOURS as C, remoteAt, remoteScale, remoteTilt, remoteYaw, pressAt, burstAt, remoteWaveAt, docked, rowIn,
  sweepAt, phoneIn, tvIn, channelAt, answerGlow, storyTime, bigAt, cameraAt, textsAt, type Text,
} from './lib/pp016.ts';
import { FULL } from './lib/layout.ts';
import { Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { RealLight } from './realism.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const AMP = 0.065;
const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** The dark set (as Chemistry #11 and #12): no floor in view, a warm key, a cool rim, a little room light. */
function DarkSet() {
  return (
    <>
      <color attach="background" args={[C.board]} />
      <fog attach="fog" args={[C.board, 10, 17]} />
      <RealLight env={0.45} key={0.7} at={[-3, 7, 6]} span={6} />
      <directionalLight position={[2, 3, 6]} intensity={1.6} color="#fff1e0" />
      <directionalLight position={[1, 4, -6]} intensity={2.2} color="#9fdcff" />
      <hemisphereLight args={['#5b6a88', '#05070b', 0.35]} />
    </>
  );
}

/** A sine wave drawn as a glowing tube, from x0 to x1 at height y (phase in radians). */
function Wave({ x0, x1, y, z = 0, lambda, phase, colour, r = 0.012, k = 1.6, opacity = 1, amp = AMP }:
  { x0: number; x1: number; y: number; z?: number; lambda: number; phase: number; colour: string; r?: number; k?: number; opacity?: number; amp?: number }) {
  const geo = useMemo(() => {
    const n = Math.max(80, Math.ceil(((x1 - x0) / lambda) * 18)), pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; pts.push(new THREE.Vector3(x, y + amp * Math.sin((2 * Math.PI * (x - x0)) / lambda - phase), z)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, r, 8, false);
  }, [x0, x1, y, z, lambda, phase, r, amp]);
  return <mesh geometry={geo}><meshBasicMaterial color={glow(colour, k)} toneMapped={false} transparent opacity={opacity} depthWrite={false} /></mesh>;
}

/** The TV remote: a dark rounded body pointing left, buttons on top (the big one goes down on a press), the LED at its tip. */
function Remote({ t }: { t: number }) {
  const [x, y, z] = remoteAt(t), press = pressAt(t), b = burstAt(t), lit = b >= 0 ? 1 - b : 0;
  return (
    <group position={[x, y, z]} scale={remoteScale(t)} rotation={[remoteTilt(t), remoteYaw(t), 0]}>
      <mesh castShadow><RoundBox size={[0.36, 0.055, 0.11]} radius={0.025} /><meshPhysicalMaterial color="#2a2f38" roughness={0.45} clearcoat={0.6} /></mesh>
      <mesh position={[-0.11, 0.03 - 0.012 * press, 0]}><cylinderGeometry args={[0.02, 0.02, 0.016, 24]} /><meshPhysicalMaterial color="#e23b3b" roughness={0.4} emissive="#7a1010" emissiveIntensity={0.4} /></mesh>
      {['#3fbf72', '#facc15', '#3b82f6'].map((c, i) => (
        <mesh key={c} position={[-0.055, 0.03, -0.03 + 0.03 * i]}><cylinderGeometry args={[0.011, 0.011, 0.012, 16]} /><meshPhysicalMaterial color={c} roughness={0.4} /></mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0.0 + 0.035 * Math.floor(i / 3), 0.03, -0.03 + 0.03 * (i % 3)]}><boxGeometry args={[0.022, 0.01, 0.018]} /><meshPhysicalMaterial color="#9aa3b2" roughness={0.5} /></mesh>
      ))}
      <mesh position={[-0.175, 0, 0]}><boxGeometry args={[0.022, 0.05, 0.09]} /><meshPhysicalMaterial color="#140808" roughness={0.1} clearcoat={1} /></mesh>
      <mesh position={[-0.188, 0, 0]}><sphereGeometry args={[0.016, 16, 12]} />
        <meshBasicMaterial color={glow(lit > 0 ? '#ffd2c8' : '#ff5a5a', 0.6 + 4 * lit)} toneMapped={false} /></mesh>
    </group>
  );
}

/** The LED's burst: rings spreading from the tip and a short wave running left, drawn (infrared is invisible). */
function Burst({ t }: { t: number }) {
  const b = burstAt(t);
  if (b < 0) return null;
  const [x, y, z] = remoteAt(t), tip = x - 0.185 * remoteScale(t);
  return (
    <group>
      <mesh position={[tip, y, z]} scale={0.018 + 0.03 * (1 - b)}><sphereGeometry args={[1, 20, 14]} />
        <meshBasicMaterial color={glow('#fff1ea', 3)} toneMapped={false} transparent opacity={(1 - b) ** 2} depthWrite={false} /></mesh>
      {[0, 0.15, 0.3].map(d => { const k = b - d; if (k <= 0) return null; return (
        <mesh key={d} position={[tip, y, z]} scale={0.04 + 0.75 * k}><torusGeometry args={[1, 0.06, 10, 64]} />
          <meshBasicMaterial color={glow('#ff6b5a', 2.6)} toneMapped={false} transparent opacity={Math.max(0, 1 - k)} depthWrite={false} /></mesh>); })}
      <Wave x0={tip - 1.6 * b} x1={tip} y={y} z={z} lambda={REMOTE_WAVE * 0.7} phase={-b * 20} colour="#ff6b5a" amp={0.05} r={0.016} k={2.6} opacity={1 - b} />
    </group>
  );
}

// ---- the seven objects, each about 0.34 tall, centred on (ICON_X, row y) ----
function Tower() {
  const leg = (sx: number, sz: number) => {
    const a = new THREE.Vector3(sx * 0.09, -0.17, sz * 0.09), b = new THREE.Vector3(0, 0.17, 0), d = new THREE.Vector3().subVectors(b, a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return <mesh key={`${sx}${sz}`} position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q}><cylinderGeometry args={[0.007, 0.007, d.length(), 8]} /><meshPhysicalMaterial color="#c7ced8" metalness={0.6} roughness={0.35} /></mesh>;
  };
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => leg(a, b))}
      {[-0.08, 0.02, 0.1].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09 * (0.17 - y) / 0.34 + 0.005, 0.005, 6, 4]} /><meshPhysicalMaterial color="#c7ced8" metalness={0.6} roughness={0.35} /></mesh>)}
      <mesh position={[0, 0.18, 0]}><sphereGeometry args={[0.02, 16, 12]} /><meshBasicMaterial color={glow('#ff4d4d', 2.5)} toneMapped={false} /></mesh>
    </group>
  );
}
function Oven() {
  return (
    <group>
      <mesh><RoundBox size={[0.34, 0.2, 0.2]} radius={0.025} /><meshPhysicalMaterial color="#d9dee5" roughness={0.35} clearcoat={0.5} /></mesh>
      <mesh position={[-0.04, 0, 0.101]}><planeGeometry args={[0.2, 0.13]} /><meshBasicMaterial color={glow('#ffb35c', 0.9)} toneMapped={false} /></mesh>
      {[0.035, -0.035].map(y => <mesh key={y} position={[0.12, y, 0.105]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.016, 0.016, 0.012, 16]} /><meshPhysicalMaterial color="#59626c" /></mesh>)}
    </group>
  );
}
function Slot({ t }: { t: number }) {
  if (docked(t)) return null;
  return <mesh rotation={[0, 0, 0]}><torusGeometry args={[0.26, 0.006, 8, 48]} /><meshBasicMaterial color={glow('#ef4444', 1.2)} toneMapped={false} transparent opacity={0.6} /></mesh>;
}
function Prism() {
  const rainbow = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.12, 3]} /><meshPhysicalMaterial color="#dfefff" transparent opacity={0.45} roughness={0.02} clearcoat={1} envMapIntensity={2.4} /></mesh>
      <mesh position={[-0.17, 0.0, 0]} rotation={[0, 0, Math.PI / 2 - 0.25]}><cylinderGeometry args={[0.007, 0.007, 0.18, 8]} /><meshBasicMaterial color={glow('#ffffff', 2)} toneMapped={false} /></mesh>
      {rainbow.map((c, i) => <mesh key={c} position={[0.13, -0.02 - i * 0.015, 0]} rotation={[0, 0, Math.PI / 2 + 0.05 + i * 0.07]}><cylinderGeometry args={[0.005, 0.005, 0.16, 6]} /><meshBasicMaterial color={glow(c, 1.8)} toneMapped={false} /></mesh>)}
    </group>
  );
}
function Sun() {
  return (
    <group>
      <mesh><sphereGeometry args={[0.09, 32, 20]} /><meshBasicMaterial color={glow('#ffd166', 2.2)} toneMapped={false} /></mesh>
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return (
        <mesh key={i} position={[Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0]} rotation={[0, 0, a - Math.PI / 2]}><coneGeometry args={[0.015, 0.06, 8]} /><meshBasicMaterial color={glow('#a78bfa', 2)} toneMapped={false} /></mesh>); })}
    </group>
  );
}
function XrayFilm() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 160;
    const g = c.getContext('2d')!; g.fillStyle = '#0b2440'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#d8ecff';
    const bone = (x: number, y: number, w: number, h: number) => { g.beginPath(); g.roundRect(x, y, w, h, w / 2); g.fill(); };
    for (let i = 0; i < 4; i++) { const x = 30 + i * 18; bone(x, 22 + Math.abs(1.5 - i) * 8, 9, 26); bone(x, 52 + Math.abs(1.5 - i) * 6, 9, 24); bone(x - 1, 80, 11, 28); }
    bone(12, 78, 9, 22); bone(16, 100, 10, 22);                    // the thumb
    g.globalAlpha = 0.85; bone(28, 112, 72, 30);                    // the palm's bones, blurred together
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  return (
    <group>
      <mesh><RoundBox size={[0.26, 0.32, 0.015]} radius={0.012} /><meshPhysicalMaterial color="#0b2440" roughness={0.3} /></mesh>
      <mesh position={[0, 0, 0.009]}><planeGeometry args={[0.24, 0.3]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
}
function Nucleus({ t }: { t: number }) {
  const pts = useMemo(() => Array.from({ length: 14 }, (_, i) => { const phi = Math.acos(1 - (2 * (i + 0.5)) / 14), th = Math.PI * (1 + Math.sqrt(5)) * i; return [0.07 * Math.sin(phi) * Math.cos(th), 0.07 * Math.cos(phi), 0.07 * Math.sin(phi) * Math.sin(th)] as [number, number, number]; }), []);
  return (
    <group rotation={[0, storyTime(t) * 0.8, 0]}>
      {pts.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.042, 20, 14]} /><meshPhysicalMaterial color={i % 2 ? '#e05252' : '#5b8def'} roughness={0.35} clearcoat={0.6} /></mesh>)}
      <mesh><sphereGeometry args={[0.17, 24, 16]} /><meshBasicMaterial color={glow('#4ade80', 1.2)} toneMapped={false} transparent opacity={0.12} depthWrite={false} /></mesh>
    </group>
  );
}

/** One row of the ladder: its wave (shorter each row; visible in the rainbow's colours) and its object, popping in. */
function Row({ i, t }: { i: number; t: number }) {
  const a = rowIn(i, t);
  if (a <= 0) return null;
  const b = BANDS[i], y = ROW_Y[i], s = storyTime(t), sw = sweepAt(i, t), phase = s * 9, ag = answerGlow(t), lift = b.name === 'infrared' ? 2.5 * ag : -0.8 * ag;
  const icon = [<Tower key="t" />, <Oven key="o" />, <Slot key="s" t={t} />, <Prism key="p" />, <Sun key="u" />, <XrayFilm key="x" />, <Nucleus key="n" t={t} />][i];
  const x1 = WAVE_X[0] + (WAVE_X[1] - WAVE_X[0]) * a;
  const rainbow = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  return (
    <group>
      {b.name === 'visible'
        ? rainbow.map((c, k) => { const w = (x1 - WAVE_X[0]) / 6; return <Wave key={c} x0={WAVE_X[0] + k * w} x1={WAVE_X[0] + (k + 1) * w + 0.001} y={y} lambda={b.lambda} phase={phase - (2 * Math.PI * k * w) / b.lambda} colour={c} r={0.012 + 0.02 * sw} k={Math.max(0.5, 1.6 + 4 * sw + lift)} />; })
        : <Wave x0={WAVE_X[0]} x1={x1} y={y} lambda={b.lambda} phase={phase} colour={b.colour} r={0.012 + 0.02 * sw + (b.name === 'infrared' ? 0.01 * ag : 0)} k={Math.max(0.5, 1.5 + 4 * sw + lift)} />}
      <group position={[ICON_X, y, 0]} scale={0.4 + 0.6 * a}>{icon}</group>
    </group>
  );
}

/** The TV the remote flicks in the opening: a new saturated channel at each press, gone before the ladder. */
const CHANNELS = [['#1e293b', '#0f172a'], ['#f43f5e', '#7c3aed'], ['#22c55e', '#0ea5e9'], ['#f59e0b', '#ef4444'], ['#06b6d4', '#a855f7']];
function Tv({ t }: { t: number }) {
  const k = tvIn(t);
  const texes = useMemo(() => CHANNELS.map(([a, b]) => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 40;
    const g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 64, 40); gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 40);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }), []);
  if (k <= 0) return null;
  return (
    <group position={TV} scale={0.9 + 0.1 * k}>
      <mesh><RoundBox size={[0.78, 0.48, 0.04]} radius={0.02} /><meshPhysicalMaterial color="#0b0d12" roughness={0.3} clearcoat={1} transparent opacity={k} /></mesh>
      <mesh position={[0, 0, 0.022]}><planeGeometry args={[0.72, 0.42]} /><meshBasicMaterial map={texes[Math.min(CHANNELS.length - 1, channelAt(t))]} toneMapped={false} transparent opacity={k} /></mesh>
      <mesh position={[0, -0.3, 0]}><RoundBox size={[0.22, 0.04, 0.12]} radius={0.015} /><meshPhysicalMaterial color="#0b0d12" transparent opacity={k} /></mesh>
    </group>
  );
}

/** The remote's own wave, drawn across the row it is passing, so the match (or not) is seen. */
function RemoteWave({ t }: { t: number }) {
  const a = remoteWaveAt(t);
  if (a <= 0) return null;
  const [, y, z] = remoteAt(t);
  return <Wave x0={WAVE_X[0]} x1={WAVE_X[1]} y={y} z={z * 0.5 + 0.02} lambda={REMOTE_WAVE} phase={storyTime(t) * 6} colour="#ffffff" r={0.008} k={1.2} opacity={0.7 * a} />;
}

/** The phone: its camera sees the remote's flash as a violet-white glow. */
function Phone({ t }: { t: number }) {
  const k = phoneIn(t);
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 224;
    const g = c.getContext('2d')!, bg = g.createLinearGradient(0, 0, 0, 224); bg.addColorStop(0, '#3b4252'); bg.addColorStop(1, '#232833');
    g.fillStyle = bg; g.fillRect(0, 0, 128, 224);                                   // a lit camera view of a dim room
    g.fillStyle = '#5b6372'; g.beginPath(); g.roundRect(30, 76, 68, 148, 14); g.fill();    // the remote, seen end-on
    const grad = g.createRadialGradient(64, 94, 2, 64, 94, 56);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.22, 'rgba(225,190,255,0.98)'); grad.addColorStop(1, 'rgba(160,100,255,0)');
    g.fillStyle = grad; g.fillRect(0, 30, 128, 140);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3;                        // the viewfinder's corners
    for (const [x, y, dx, dy] of [[10, 22, 1, 1], [118, 22, -1, 1], [10, 200, 1, -1], [118, 200, -1, -1]]) { g.beginPath(); g.moveTo(x, y + 16 * dy); g.lineTo(x, y); g.lineTo(x + 16 * dx, y); g.stroke(); }
    g.fillStyle = '#ef4444'; g.beginPath(); g.arc(22, 12, 4, 0, Math.PI * 2); g.fill();    // recording
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  if (k <= 0) return null;
  return (
    <group position={[PHONE[0] - (1 - k) * 0.5, PHONE[1], PHONE[2]]} scale={1.6 * (0.6 + 0.4 * k)}>
      <mesh><RoundBox size={[0.21, 0.38, 0.022]} radius={0.032} /><meshPhysicalMaterial color="#4a5160" metalness={0.6} roughness={0.3} clearcoat={1} /></mesh>
      <mesh position={[0, 0, 0.0105]}><planeGeometry args={[0.195, 0.36]} /><meshBasicMaterial color="#05070b" /></mesh>
      <mesh position={[0, 0, 0.0115]}><planeGeometry args={[0.18, 0.32]} /><meshBasicMaterial map={tex} toneMapped={false} transparent opacity={k} /></mesh>
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <DarkSet />
      {BANDS.map((_, i) => <Row key={i} i={i} t={t} />)}
      <RemoteWave t={t} />
      <Tv t={t} />
      <Remote t={t} />
      <Burst t={t} />
      <Phone t={t} />
    </>
  );
}

function Words({ t }: { t: number }) {
  const big = bigAt(t);
  const halo = `0 0 18px ${C.board}, 0 0 6px ${C.board}`;
  const pill = (x: Text, border: string, fill: string, colour: string, font: React.CSSProperties) => (
    <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, width: x.box.w, height: x.box.h, boxSizing: 'border-box', borderRadius: x.box.h / 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: x.alpha, border: `2px solid ${border}`, background: fill, color: colour, whiteSpace: 'pre', ...font }}>{x.text}</div>
  );
  const line = (x: Text, font: React.CSSProperties, colour: string = P.ink) => (
    <div key={x.name} style={{ position: 'absolute', left: 0, width: 1080, top: x.y, transform: 'translateY(-50%)', textAlign: 'center', opacity: x.alpha, color: colour,
      whiteSpace: 'pre', ...font }}>{x.text}</div>
  );
  const at = (x: Text, font: React.CSSProperties, colour: string = P.ink) => (
    <div key={x.name} style={{ position: 'absolute', left: x.x, top: x.y, transform: 'translate(-50%, -50%)', opacity: x.alpha, color: colour, whiteSpace: 'pre',
      textShadow: halo, ...font }}>{x.text}</div>
  );
  return (
    <>
      {big > 0.01 && <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 620, opacity: big,
        background: `linear-gradient(to bottom, ${tint(C.board, 0.92)} 0%, ${tint(C.board, 0.78)} 70%, ${tint(C.board, 0)} 100%)` }} />}
      {textsAt(t).map(x => {
        switch (x.kind) {
          case 'label': return line(x, { font: `700 34px ${SOFT_UI}` }, P.muted);
          case 'header': return line(x, hand(x.size));
          case 'chip': return pill(x, tint(P.ink, 0.22), tint(C.board, 0.7), P.ink, hand(x.size));
          case 'nudge': return line(x, { font: `600 32px ${SOFT_UI}` }, P.muted);
          case 'tag': return line(x, { font: `600 30px ${SOFT_UI}`, letterSpacing: 0.5 }, P.muted);
          case 'line': return line(x, { font: `600 44px ${SOFT_UI}` });
          case 'caption': return at(x, { font: `600 46px ${SOFT_UI}` });
          case 'name': return at(x, { font: `800 ${x.size}px ${SOFT_UI}` }, x.colour ?? P.ink);
          case 'use': return at(x, { font: `600 ${x.size}px ${SOFT_UI}` }, x.colour ?? P.ink);
          case 'range': return at(x, { font: `500 ${x.size}px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' }, P.muted);
          case 'q': return at(x, { ...hand(x.size), fontWeight: 700 }, C.answer);
          case 'answer': return pill(x, C.answer, C.answer, C.board, { ...hand(x.size), fontWeight: 700, boxShadow: '0 0 30px rgba(255,244,224,0.5)' });
        }
      })}
    </>
  );
}

export function PvPhysics016({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: C.board }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(5,7,11,0) 55%, rgba(5,7,11,0.7) 100%)' }} />
        <Words t={t} />
        {cover && <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-016-spectrum-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
