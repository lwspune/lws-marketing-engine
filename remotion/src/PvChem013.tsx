// @pyqvault_ · Chemistry, visualised #13 (framework v1.34): add NaOH to iron(III) chloride: the cloud is white, blue or
// rust-brown? Rust-brown. The timeline, beat table, chemistry and every text's place are in lib/pc013.ts. A dropper puts one
// drop of NaOH into aluminium, copper and iron(II) salts, the camera following it: a white, a blue and a dirty-green cloud
// bloom and settle; iron(III) waits under a "?" until the answer; then more NaOH dissolves aluminium's white cloud. The
// whole table is held still as a cheat sheet (F39), then everything rewinds to frame 0. Dark set (Chemistry #11 and #12).
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, tint } from './lib/palette.ts';
import {
  MEMBERS, GLASS, COVER_T, COLOURS as C, tubeX, cloudAt, liquidColour, dropAt, dropperAt, bigAt, cameraAt, textsAt, type Member, type Text,
} from './lib/pc013.ts';
import { FULL } from './lib/layout.ts';
import { clamp01 } from './lib/motion.ts';
import { Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { ContactShadow } from './studio.tsx';
import { RealLight } from './realism.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const BOTTOM = 0.12, RACK_H = 0.12;

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** The dark set (as Chemistry #12): a matt floor in a warm spotlight, a cool rim light, a little room light. */
function DarkSet() {
  const spot = useMemo(() => { const l = new THREE.SpotLight('#fff1e0', 40, 16, 0.62, 0.8, 1.3); l.position.set(0.3, 7, 4); l.castShadow = true; l.shadow.mapSize.set(2048, 2048); return l; }, []);
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(0, 1, 0); return o; }, []);
  spot.target = target;
  return (
    <>
      <color attach="background" args={[C.board]} />
      <fog attach="fog" args={[C.board, 10, 17]} />
      <RealLight env={0.45} key={0.6} at={[-3, 7, 6]} span={6} />
      <primitive object={spot} /><primitive object={target} />
      <directionalLight position={[1, 4, -6]} intensity={2.6} color="#9fdcff" />
      <hemisphereLight args={['#5b6a88', '#05070b', 0.3]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#06080c" roughness={0.9} /></mesh>
    </>
  );
}

/** Specks of precipitate, fixed per tube (seeded), so the cloud reads as a solid forming in the liquid. */
const SPECKS = Array.from({ length: 70 }, (_, i) => ({ a: (i * 2.399) % (Math.PI * 2), r: ((i * 0.618) % 1) * 0.8, v: ((i * 0.377) % 1), s: 0.006 + ((i * 0.53) % 1) * 0.008 }));

const mixHex = (a: string, b: string, p: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(p)).getHexString();

/** One test tube: the liquid column painted in bands (a see-through cloud inside the see-through liquid didn't render):
 *  below the cloud, the solution; the cloud itself, solid, in the precipitate's colour (blooming down from the surface,
 *  then packing towards the bottom); above it, the clearing solution with specks still falling. Then the clear tube, the
 *  falling drop, its contact shadow. */
function Tube({ m, t }: { m: Member; t: number }) {
  const x = tubeX(m.id), c = cloudAt(m.id, t), drop = dropAt(m.id, t), liquid = liquidColour(m.id, t);
  const r = GLASS.r - 0.014, top = GLASS.liquid, len = top - BOTTOM;
  const bloomDepth = len * clamp01(c.amount / 0.98 + (c.settle > 0 ? 1 : 0)), settledTop = BOTTOM + 0.38;
  const cTop = top - (top - settledTop) * c.settle, cBot = Math.max(BOTTOM, top - bloomDepth);
  const show = c.amount > 0.02 && cTop - cBot > 0.01;
  const cloud = mixHex(liquid, m.cloud, 0.25 + 0.75 * c.amount);
  const clear = { transmission: 0.55, thickness: 0.25, roughness: 0.04, ior: 1.33, clearcoat: 1, specularIntensity: 1, emissiveIntensity: 0.1 };
  const solid = { roughness: 0.55, clearcoat: 0.4, emissiveIntensity: 0.2 + 0.25 * (c.settle > 0 ? 0 : c.amount) * (1 - c.amount) * 4 };   // a soft glow while it blooms
  const band = (y0: number, y1: number, colour: string, mat: object, key: string) => (y1 - y0 > 0.002 &&
    <mesh key={key} position={[x, (y0 + y1) / 2, 0]}><cylinderGeometry args={[r, r, y1 - y0, 40, 1, true]} /><meshPhysicalMaterial color={colour} emissive={colour} {...mat} /></mesh>);
  const atBottom = show && cBot <= BOTTOM + 1e-3, falling = show ? (c.settle > 0 ? 1 - c.settle : c.amount) : 0;   // specks while it blooms and settles
  return (
    <group>
      <mesh position={[x, BOTTOM, 0]}><sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color={atBottom ? cloud : liquid} emissive={atBottom ? cloud : liquid} {...(atBottom ? solid : clear)} /></mesh>
      {show ? [band(BOTTOM, cBot, liquid, clear, 'lo'), band(cBot, cTop, cloud, solid, 'cl'), band(cTop, top, liquid, clear, 'up')] : band(BOTTOM, top, liquid, clear, 'all')}
      <mesh position={[x, top, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 40]} />
        <meshPhysicalMaterial color={show && cTop >= top - 1e-3 ? cloud : liquid} {...clear} /></mesh>
      <mesh position={[x, top + 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r - 0.004, 0.009, 8, 40]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} /></mesh>
      {falling > 0.02 && SPECKS.map((p, i) => {
        const y = cTop + (top - cTop) * p.v * falling;
        return <mesh key={i} position={[x + Math.cos(p.a) * p.r * r * 0.9, y, Math.sin(p.a) * p.r * r * 0.9]}><sphereGeometry args={[p.s, 8, 6]} />
          <meshStandardMaterial color={m.cloud} roughness={0.6} emissive={m.cloud} emissiveIntensity={0.2} /></mesh>;
      })}
      {drop && <mesh position={drop} scale={[0.04, 0.055, 0.04]}><sphereGeometry args={[1, 18, 14]} />
        <meshPhysicalMaterial color="#e8f2fb" roughness={0.05} clearcoat={1} transparent opacity={0.85} emissive="#cfe6ff" emissiveIntensity={0.4} /></mesh>}
      <mesh position={[x, BOTTOM + (GLASS.h - BOTTOM) / 2, 0]}><cylinderGeometry args={[GLASS.r, GLASS.r, GLASS.h - BOTTOM, 40, 1, true]} />
        <meshPhysicalMaterial color="#e9f3ff" transparent opacity={0.07} roughness={0.02} clearcoat={1} envMapIntensity={2.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[x, BOTTOM, 0]}><sphereGeometry args={[GLASS.r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#e9f3ff" transparent opacity={0.07} roughness={0.02} clearcoat={1} envMapIntensity={2.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[x, GLASS.h, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[GLASS.r, 0.012, 10, 40]} /><meshBasicMaterial color="#dfe9f7" transparent opacity={0.85} depthWrite={false} /></mesh>
      <ContactShadow x={x} rx={0.22} opacity={0.5} />
    </group>
  );
}

/** The dropper: a light glass body with a bright rim, a red rubber bulb, NaOH (clear) inside. */
function Dropper({ t }: { t: number }) {
  const p = dropperAt(t);
  if (!p) return null;
  return (
    <group position={p}>
      <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.045, 0.016, 0.32, 28]} />
        <meshPhysicalMaterial color="#eef6ff" transparent opacity={0.55} roughness={0.02} clearcoat={1} envMapIntensity={2.6} emissive="#9fb8d6" emissiveIntensity={0.25} depthWrite={false} /></mesh>
      <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.032, 0.013, 0.19, 24]} />
        <meshPhysicalMaterial color="#dcebf7" emissive="#bcd6ee" emissiveIntensity={0.4} transparent opacity={0.85} /></mesh>
      <mesh position={[0, 0.32, 0]}><torusGeometry args={[0.047, 0.008, 8, 28]} /><meshBasicMaterial color="#dfe9f7" /></mesh>
      <mesh position={[0, 0.38, 0]} scale={[1, 1.2, 1]}><sphereGeometry args={[0.07, 28, 20]} />
        <meshPhysicalMaterial color="#d7344a" roughness={0.4} clearcoat={0.6} emissive="#7a1424" emissiveIntensity={0.4} /></mesh>
    </group>
  );
}

/** A soft lightbox behind the rack (a lab's light panel): clear liquid reads see-through and bright, not empty. */
function Lightbox() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 128;
    const g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#0b1018'); gr.addColorStop(0.3, '#3b4d63'); gr.addColorStop(0.75, '#4a5f78'); gr.addColorStop(1, '#1a2230');
    g.fillStyle = gr; g.fillRect(0, 0, 8, 128);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  return <mesh position={[0, 1.15, -0.9]}><planeGeometry args={[3.4, 2.6]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
}

function Rack() {
  return (
    <mesh position={[0, RACK_H / 2, 0]} castShadow receiveShadow><RoundBox size={[4 * 0.55 + 0.1, RACK_H, 0.36]} radius={0.05} />
      <meshPhysicalMaterial color="#3a4354" roughness={0.4} clearcoat={0.5} /></mesh>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <DarkSet />
      <Lightbox />
      <Rack />
      {MEMBERS.map(m => <Tube key={m.id} m={m} t={t} />)}
      <Dropper t={t} />
    </>
  );
}

function Words({ t }: { t: number }) {
  const big = bigAt(t);
  const halo = `0 0 18px ${C.board}, 0 0 6px ${C.board}`;
  const pill = (x: Text, border: string, fill: string, colour: string, font: React.CSSProperties) => (
    <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, width: x.box.w, height: x.box.h, boxSizing: 'border-box', borderRadius: x.box.h / 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: x.alpha, border: `3px solid ${border}`, background: fill, color: colour, whiteSpace: 'pre', ...font }}>{x.text}</div>
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
          case 'colour': return pill(x, x.colour ?? P.ink, tint(C.board, 0.94), P.ink, { font: `700 ${x.size}px ${SOFT_UI}` });
          case 'ion': return at(x, { font: `800 ${x.size}px ${SOFT_UI}` });
          case 'hydroxide': return at(x, { font: `600 ${x.size}px ${SOFT_UI}` }, '#c8d0dc');
          case 'note': return at(x, { font: `600 ${x.size}px ${SOFT_UI}` }, C.answer);
          case 'q': return at(x, { ...hand(x.size), fontWeight: 700 }, C.answer);
          case 'answer': return pill(x, C.answer, C.answer, C.board, { ...hand(x.size), fontWeight: 700, boxShadow: '0 0 30px rgba(255,244,224,0.5)' });
        }
      })}
    </>
  );
}

export function PvChem013({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: C.board }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(5,7,11,0) 50%, rgba(5,7,11,0.75) 100%), linear-gradient(to bottom, rgba(5,7,11,0) 65%, rgba(5,7,11,0.55) 100%)' }} />
        <Words t={t} />
        {cover && <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-013-hydroxides-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
