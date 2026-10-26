// @pyqvault_ · Chemistry, visualised #12 (framework v1.34): one drop of universal indicator: is milk acidic, neutral or
// basic? Slightly acidic. The timeline, beat table, chemistry and every text's place are in lib/pc012.ts. Frame 0: a
// dropper over the milk with a drop falling, two tubes beside it already coloured; the dropper visits each tube in turn as
// the camera pulls back; the tubes sort themselves in their rack under a pH strip, and milk lands last, just left of
// water's green. The first F39 reel: the whole chart is held still as a cheat sheet, then everything rewinds to frame 0
// (the loop). Full frame (F35) on Chemistry #11's dark set (review panel, pass 1).
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, tint } from './lib/palette.ts';
import {
  MEMBERS, GLASS, STRIP, SLOT_DX, COVER_T, COLOURS as C, glassPos, frontAt, bloomAt, dropAt, dropperAt, tintOf, indicatorColour,
  stripX, stripIn, bigAt, cameraAt, textsAt, storyTime, LANDS, ANSWER_AT, type Member, type Text,
} from './lib/pc012.ts';
import { FULL } from './lib/layout.ts';
import { clamp01 } from './lib/motion.ts';
import { Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { ContactShadow } from './studio.tsx';
import { RealLight } from './realism.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const BOTTOM = 0.1, RACK_H = 0.12;                                   // the round bottom's centre; the rack's height

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** The dark set (as Chemistry #11): a matt floor in a warm spotlight's pool, a cool rim light from behind for the glass
 *  edges, a little room light for reflections. */
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

/** A thin rod between two points (the pointer from a tube to its pH on the strip). */
function Rod({ a, b, r, colour, opacity }: { a: THREE.Vector3; b: THREE.Vector3; r: number; colour: string; opacity: number }) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length(), mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}><cylinderGeometry args={[r, r, len, 10]} />
      <meshBasicMaterial color={colour} transparent opacity={opacity} depthWrite={false} /></mesh>
  );
}

/** One test tube: the liquid (the indicator's colour runs down it from the top as the drop mixes in, over the liquid's own
 *  colour; milk opaque cream, the rest clear), a cloud at the colour's front, a bright meniscus, the clear tube with its
 *  round bottom and rim, its contact shadow, and once it has landed, its pointer up to its pH on the strip. */
function Tube({ m, t }: { m: Member; t: number }) {
  const [x, y, z] = glassPos(m.id, t), front = frontAt(m.id, t), bloom = bloomAt(m.id, t), drop = dropAt(m.id, t);
  const r = GLASS.r - 0.014, y0 = y + BOTTOM, len = GLASS.liquid - BOTTOM, milk = m.id === 'milk';
  const tint_ = tintOf(m), own = m.base;
  const clear = { transmission: 0.3, thickness: 0.25, roughness: 0.04, ior: 1.33, clearcoat: 1, specularIntensity: 1 };
  const look = (c: string, coloured: boolean) => milk
    ? { color: c, roughness: 0.3, clearcoat: 0.7, emissive: c, emissiveIntensity: coloured ? 0.12 : 0.05 }
    : { color: c, ...clear, emissive: c, emissiveIntensity: coloured ? 0.32 : 0.04 };   // the indicator's colour glows a little on the dark set
  const top = len * front, under = len - top;                      // coloured from the top down; the rest still its own colour
  const shown = clamp01((storyTime(t) - LANDS[m.id]) / 0.25);
  const hh = 0.06 + 0.1 * (1 - bloom);
  return (
    <group>
      <mesh position={[x, y0, z]}><sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial {...look(front >= 1 ? tint_ : own, front >= 1)} /></mesh>
      {under > 0.002 && <mesh position={[x, y0 + under / 2, z]}><cylinderGeometry args={[r, r, under, 40]} />
        <meshPhysicalMaterial {...look(own, false)} /></mesh>}
      {top > 0.002 && <mesh position={[x, y0 + under + top / 2, z]}><cylinderGeometry args={[r, r, top, 40]} />
        <meshPhysicalMaterial {...look(tint_, true)} /></mesh>}
      <mesh position={[x, y + GLASS.liquid, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 40]} />
        <meshPhysicalMaterial {...look(front > 0 ? tint_ : own, front > 0)} /></mesh>
      {/* the meniscus: a bright ring where the liquid meets the glass */}
      <mesh position={[x, y + GLASS.liquid + 0.008, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r - 0.004, 0.009, 8, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} /></mesh>
      {bloom > 0 && bloom < 1 && <mesh position={[x, Math.min(y0 + under, y + GLASS.liquid - hh), z]} scale={[r * 0.98, hh, r * 0.98]}>
        <sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color={new THREE.Color(indicatorColour(m.pH)).multiplyScalar(1.35)} toneMapped={false} transparent opacity={0.85 * (1 - bloom)} depthWrite={false} /></mesh>}
      {drop && <group position={drop}>
        <mesh scale={[0.055, 0.075, 0.055]}><sphereGeometry args={[1, 18, 14]} />
          <meshPhysicalMaterial color="#3fbf72" roughness={0.08} clearcoat={1} emissive="#3fbf72" emissiveIntensity={0.7} /></mesh>
        <mesh position={[0, 0.09, 0]} scale={[0.02, 0.08, 0.02]}><sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#5fd18c" transparent opacity={0.35} depthWrite={false} /></mesh>
      </group>}
      {/* the tube: a clear wall, a round bottom, a rim that catches the light */}
      <mesh position={[x, y + BOTTOM + (GLASS.h - BOTTOM) / 2, z]}><cylinderGeometry args={[GLASS.r, GLASS.r, GLASS.h - BOTTOM, 40, 1, true]} />
        <meshPhysicalMaterial color="#e9f3ff" transparent opacity={0.07} roughness={0.02} clearcoat={1} envMapIntensity={2.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[x, y0, z]}><sphereGeometry args={[GLASS.r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#e9f3ff" transparent opacity={0.07} roughness={0.02} clearcoat={1} envMapIntensity={2.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[x, y + GLASS.h, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[GLASS.r, 0.012, 10, 40]} />
        <meshBasicMaterial color="#dfe9f7" transparent opacity={0.85} depthWrite={false} /></mesh>
      <ContactShadow x={x} z={z} rx={0.2} opacity={0.5 * (1 - clamp01(y / 0.2) * 0.7)} />
      {milk && t >= ANSWER_AT && t < ANSWER_AT + 0.8 && (() => { const k = (t - ANSWER_AT) / 0.8; return (
        <mesh position={[x, y + 0.9, z]} rotation={[Math.PI / 2, 0, 0]} scale={1 + 2.2 * k}><torusGeometry args={[GLASS.r + 0.03, 0.012, 10, 48]} />
          <meshBasicMaterial color={new THREE.Color(C.answer).multiplyScalar(1.6)} toneMapped={false} transparent opacity={1 - k} depthWrite={false} /></mesh>); })()}
      {shown > 0 && <Rod a={new THREE.Vector3(x, GLASS.h + 0.02, z)} b={new THREE.Vector3(stripX(m.pH), STRIP.y0, STRIP.z)} r={0.008} colour={tint_} opacity={0.9 * shown} />}
    </group>
  );
}

/** The dropper: a glass tube with a red rubber bulb, its tip where the drops start. */
function Dropper({ t }: { t: number }) {
  const p = dropperAt(t);
  if (!p) return null;
  return (
    <group position={p}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.05, 0.016, 0.4, 28]} />
        <meshPhysicalMaterial color="#eef6ff" transparent opacity={0.55} roughness={0.02} clearcoat={1} envMapIntensity={2.6} emissive="#9fb8d6" emissiveIntensity={0.25} depthWrite={false} /></mesh>
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.036, 0.013, 0.24, 24]} />
        <meshPhysicalMaterial color="#3fbf72" emissive="#3fbf72" emissiveIntensity={0.6} transparent opacity={0.92} /></mesh>
      <mesh position={[0, 0.4, 0]}><torusGeometry args={[0.052, 0.008, 8, 28]} />
        <meshBasicMaterial color="#dfe9f7" /></mesh>
      <mesh position={[0, 0.5, 0]} scale={[1, 1.3, 1]}><sphereGeometry args={[0.1, 28, 20]} />
        <meshPhysicalMaterial color="#d7344a" roughness={0.4} clearcoat={0.6} emissive="#7a1424" emissiveIntensity={0.4} /></mesh>
    </group>
  );
}

/** The rack: a low, rounded block the tubes stand in (they lift clear of it to swap places). */
function Rack() {
  return (
    <mesh position={[0, RACK_H / 2, 0]} castShadow receiveShadow><RoundBox size={[7 * SLOT_DX + 0.12, RACK_H, 0.34]} radius={0.05} />
      <meshPhysicalMaterial color="#3a4354" roughness={0.4} clearcoat={0.5} /></mesh>
  );
}

/** The pH strip, 0 to 14, in the indicator's own colours (glowing a little); it slides in from the left and locks. */
function Strip({ t }: { t: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 8;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 512; i++) { g.fillStyle = indicatorColour((i / 511) * 14); g.fillRect(i, 0, 1, 8); }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }, []);
  const s = stripIn(t);
  if (s <= 0) return null;
  const w = 2 * STRIP.half, hgt = STRIP.y1 - STRIP.y0;
  return (
    <group position={[(1 - s) * -4.5, 0, 0]}>
      <mesh position={[0, (STRIP.y0 + STRIP.y1) / 2, STRIP.z]}><RoundBox size={[w, hgt, 0.05]} radius={0.025} />
        <meshPhysicalMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.35} clearcoat={0.6} /></mesh>
      <mesh position={[stripX(7), (STRIP.y0 + STRIP.y1) / 2, STRIP.z + 0.03]}><boxGeometry args={[0.012, hgt * 1.25, 0.005]} />
        <meshBasicMaterial color="#ffffff" /></mesh>
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <DarkSet />
      <Strip t={t} />
      <Rack />
      {MEMBERS.map(m => <Tube key={m.id} m={m} t={t} />)}
      <Dropper t={t} />
    </>
  );
}

/** Every text from textsAt(), in its kind's style. */
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
      {/* a soft wash behind the big question so it reads over the close-up; gone with it, back for the loop */}
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
          case 'pH': return x.colour
            ? pill(x, C.answer, C.answer, C.board, { font: `800 ${x.size}px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums', boxShadow: '0 0 24px rgba(255,244,224,0.45)' })
            : pill(x, tint(P.ink, 0.45), tint(C.board, 0.94), P.ink, { font: `700 ${x.size}px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' });
          case 'tag2': return pill(x, tint(P.ink, 0.6), tint(C.board, 0.9), P.ink, { font: `700 ${x.size}px ${SOFT_UI}` });
          case 'name': return at(x, { font: `600 ${x.size}px ${SOFT_UI}`, textAlign: 'center', lineHeight: 1.3 });
          case 'scale': return at(x, { font: `600 30px ${SOFT_UI}` }, P.muted);
          case 'q': return at(x, { ...hand(x.size), fontWeight: 700 }, C.answer);
          case 'answer': return pill(x, C.answer, C.answer, C.board, { ...hand(x.size), fontWeight: 700, boxShadow: '0 0 30px rgba(255,244,224,0.5)' });
        }
      })}
    </>
  );
}

export function PvChem012({ cover = false }: { cover?: boolean }) {
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
        {!cover && <Html5Audio src={staticFile('pv-chem-012-ph-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
