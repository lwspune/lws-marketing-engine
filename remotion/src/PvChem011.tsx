// @pyqvault_ · Chemistry, visualised #11 (framework v1.30): the same hammer, the same hit, on a copper bar and a salt crystal:
// which shatters? The salt. The timeline, beat table, chemistry and every text's place are in lib/pc011.ts. The third Shock
// reel and the first under F37 (the aftershock): both hammers land at 0.2 s, then in slow motion the copper bends (1.2 s),
// cracks shoot across the salt (1.3 s, 2.2 s) and it bursts into cubes (3.2 s). The second hook dives into the bend: copper's
// + ions in a sea of electrons slide and stay held; salt's slide one step, + meets +, and the layers push apart. Then it
// rewinds to frame 0 (loop). Remade the same day for drama (founder: "not dramatic enough, pretty bland"): a dark set under a
// spotlight, a close-up opening, a white flash and chips at the hit, and at the burst a flash, 180 shards (a third flying at
// the camera) and a cloud of salt dust, with real glow (Bloom). Full frame (F35); dark, not the studio (F36 is on test).
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAB as P, SOFT_UI, tint } from './lib/palette.ts';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import {
  BAR, SUPPORT, SALT, SALT_BLOCK, PIECE, CU_SLAB, PM, COVER_T, COLOURS as C, storyTime, sceneAt, barShape, hammerAt, cracksAt, flecksAt,
  dustAt, piecesAt, copperCoresAt, electronsAt, saltIonsAt, repelPairsAt, repelAt, cameraAt, textsAt, bigAt, T_BURST, flashAt, chipsAt,
  shardsAt, dustCloudAt, shiverAt, sparksAt, type Text, type Ion,
} from './lib/pc011.ts';
import type { V3 } from './lib/inductionScene.ts';
import { FULL } from './lib/layout.ts';
import { Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { RealLight } from './realism.tsx';
import { ContactShadow } from './studio.tsx';
import { BloomWarmUp } from './induction3d.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

// Colours after the review panel (Colour 5/10: grey on grey, copper like wood): dark gunmetal blocks, the salt the brightest
// thing in frame (cool white, bright edges), polished salmon copper, a dark wooden handle that doesn't pull the eye.
const steel = <meshPhysicalMaterial color={C.steel} metalness={0.75} roughness={0.28} clearcoat={0.4} />;
const gunmetal = <meshPhysicalMaterial color="#474e58" metalness={0.8} roughness={0.38} clearcoat={0.3} />;
const copper = <meshPhysicalMaterial color={C.copperEdge} metalness={0.7} roughness={0.24} clearcoat={0.7} envMapIntensity={3} emissive="#b5602f" emissiveIntensity={0.28} />;   // salmon copper, not a brown plank (all three critics)
const salt = <meshPhysicalMaterial color="#e4eaf2" roughness={0.1} clearcoat={1} transmission={0.25} thickness={0.4} ior={1.54} />;
/** A colour pushed above 1 so Bloom makes it glow (toneMapped off). */
const hot = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

/** The dark set: a matt floor in a spotlight's pool, a rim light from behind for the edges, a little room light for the
 *  metal's reflections, and a light at the point of impact while the flash lasts. */
function DarkSet({ t }: { t: number }) {
  const spot = useMemo(() => { const l = new THREE.SpotLight('#ffd9b3', 45, 14, 0.5, 0.75, 1.4); l.position.set(0.2, 6.5, 3.2); l.castShadow = true; l.shadow.mapSize.set(2048, 2048); return l; }, []);
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(0, 0.5, 0); return o; }, []);
  spot.target = target;
  const f = flashAt(t), at: V3 = [SALT.x, t < T_BURST ? SALT.base + SALT.side : SALT.base + SALT.side / 2, 0.15];
  return (
    <>
      <color attach="background" args={[C.board]} />
      <fog attach="fog" args={[C.board, 9, 15]} />
      <RealLight env={0.35} key={0.5} at={[-3, 7, 6]} span={6} />
      <primitive object={spot} /><primitive object={target} />
      <pointLight position={[BAR.x + 0.3, 1.4, 1.2]} intensity={7} distance={3.5} color="#ffd0a8" />
      <directionalLight position={[1, 4, -6]} intensity={2.8} color="#7fd4ff" />
      <hemisphereLight args={['#5b6a88', '#05070b', 0.25]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color={C.floor} roughness={0.85} /></mesh>
      {f > 0.02 && <pointLight position={at} intensity={25 * f} distance={6} color="#ffffff" />}
      {f > 0.02 && <mesh position={at}><sphereGeometry args={[0.03 + 0.08 * f, 24, 16]} /><meshBasicMaterial color={hot('#ffffff', 1 + 5 * f)} toneMapped={false} transparent opacity={f} /></mesh>}
    </>
  );
}

/** A thin bar from a to b (a crack, an edge): a cylinder turned to lie along the segment. */
function Segment({ a, b, r, colour, opacity = 1 }: { a: V3; b: V3; r: number; colour: string; opacity?: number }) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), l = d.length();
  if (l < 1e-6) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} quaternion={q}>
      <cylinderGeometry args={[r, r, l, 6]} /><meshBasicMaterial color={colour} transparent opacity={opacity} />
    </mesh>
  );
}

/** A cube with dark edges so the clear-white salt reads on the white studio (F24: an edge of its own colour). */
function SaltCube({ pos, rot, size, edge = C.saltEdge }: { pos: V3; rot: V3; size: number; edge?: string }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)), [size]);
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow><RoundBox size={[size, size, size]} radius={size * 0.04} />{salt}</mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color={edge} /></lineSegments>
    </group>
  );
}

/** A hammer at its striking pose: a steel head (face down), a wooden handle out to the side and up. */
function Hammer({ k, s }: { k: 'copper' | 'salt'; s: number }) {
  const h = hammerAt(k, s), side = k === 'copper' ? -1 : 1, head = { r: 0.14, h: 0.42 };
  // the handle leaves the head's side at mid-height, out and 25° up (a cylinder's axis is +y: turned by θ it points
  // (−sin θ, cos θ), so θ = −side·(90° − 25°))
  const up = 0.44, len = 1.3, dir = [side * Math.cos(up), Math.sin(up)], from = [side * head.r * 0.8, head.h * 0.55];
  return (
    <>
    <group position={[h.x, h.face, 0]} rotation={[0, 0, h.tilt]}>
      <mesh position={[0, head.h / 2, 0]} castShadow><cylinderGeometry args={[head.r, head.r, head.h, 40]} />{steel}</mesh>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[head.r * 1.04, head.r * 1.04, 0.04, 40]} />
        <meshPhysicalMaterial color={C.steelEdge} metalness={0.8} roughness={0.22} /></mesh>
      <mesh position={[0, head.h - 0.02, 0]}><cylinderGeometry args={[head.r * 0.9, head.r * 1.02, 0.04, 40]} />
        <meshPhysicalMaterial color={C.steelEdge} metalness={0.8} roughness={0.22} /></mesh>
      <mesh position={[from[0] + dir[0] * len / 2, from[1] + dir[1] * len / 2, 0]} rotation={[0, 0, -side * (Math.PI / 2 - up)]} castShadow>
        <cylinderGeometry args={[0.042, 0.05, len, 20]} /><meshPhysicalMaterial color="#5a4029" roughness={0.6} clearcoat={0.2} />
      </mesh>
    </group>
    </>
  );
}

/** The copper bar, bent: a chain of short segments along its centre line. */
function Bar({ s }: { s: number }) {
  const pts = barShape(s);
  return (
    <group position={[BAR.x, BAR.base + BAR.thick / 2, 0]}>
      {pts.slice(1).map((p, i) => {
        const a = pts[i], len = Math.hypot(p.x - a.x, p.dy - a.dy);
        return (
          <mesh key={i} position={[(a.x + p.x) / 2, (a.dy + p.dy) / 2, 0]} rotation={[0, 0, Math.atan2(p.dy - a.dy, p.x - a.x)]} castShadow>
            <boxGeometry args={[len + 0.012, BAR.thick, BAR.depth]} />{copper}
          </mesh>
        );
      })}
    </group>
  );
}

/** A soft round puff (a radial gradient), for the salt dust. */
const puff = (() => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!, grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.4, 'rgba(255,255,255,0.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();

function Bench({ s, t }: { s: number; t: number }) {
  const pieces = piecesAt(s), white = <meshStandardMaterial color="#c6d5ea" roughness={0.35} />;   // cool white shards, no glow (the panel)
  return (
    <>
      <DarkSet t={t} />
      {[-1, 1].map(d => (
        <group key={d}>
          <mesh position={[BAR.x + d * BAR.support, SUPPORT.h / 2, 0]} castShadow receiveShadow><RoundBox size={[SUPPORT.w, SUPPORT.h, SUPPORT.d]} radius={0.03} />{gunmetal}</mesh>
          <ContactShadow x={BAR.x + d * BAR.support} rx={0.24} rz={0.32} opacity={0.3} />
        </group>
      ))}
      <mesh position={[SALT.x, SALT_BLOCK.h / 2, 0]} castShadow receiveShadow><RoundBox size={[2 * SALT_BLOCK.hw, SALT_BLOCK.h, 2 * SALT_BLOCK.hd]} radius={0.04} />{gunmetal}</mesh>
      <ContactShadow x={SALT.x} rx={0.48} rz={0.42} opacity={0.3} />
      <Bar s={s} />
      {s < T_BURST
        ? <SaltCube pos={[SALT.x + shiverAt(s)[0], SALT.base + SALT.side / 2, shiverAt(s)[1]]} rot={[0, 0, 0]} size={SALT.side} />
        : pieces.map((p, i) => <SaltCube key={i} pos={p.pos} rot={p.rot} size={PIECE * 0.985} edge="#5d6b7d" />)}   // dark edges: each piece reads
      <group position={[shiverAt(s)[0], 0, shiverAt(s)[1]]}>
        {cracksAt(s).map((c, i) => c.slice(1).map((p, j) => <Segment key={`${i}-${j}`} a={[c[j][0], c[j][1], c[j][2] + 0.006]} b={[p[0], p[1], p[2] + 0.006]} r={0.004} colour="#2f3b4a" />))}
        {cracksAt(s).map((c, i) => c.slice(1).map((p, j) => <Segment key={`h${i}-${j}`} a={[c[j][0] + 0.006, c[j][1] + 0.006, c[j][2] + 0.008]} b={[p[0] + 0.006, p[1] + 0.006, p[2] + 0.008]} r={0.0022} colour="#bfe9ff" />))}
      </group>
      {sparksAt(s).map((k, i) => <mesh key={'k' + i} position={k.pos}><sphereGeometry args={[0.012, 8, 6]} /><meshBasicMaterial color={hot('#ffb347', 3)} toneMapped={false} transparent opacity={k.alpha} /></mesh>)}
      {flecksAt(s).map((f, i) => <mesh key={i} position={f.pos}><boxGeometry args={[0.03, 0.03, 0.03]} /><meshBasicMaterial color="#ffffff" transparent opacity={f.alpha} /></mesh>)}
      {dustAt(s).map((d, i) => (
        <mesh key={i} position={[d.x, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[d.r * 0.82, d.r, 48]} />
          <meshBasicMaterial color="#8d939c" transparent opacity={d.alpha} depthWrite={false} /></mesh>
      ))}
      {chipsAt(s).map((p, i) => <mesh key={'c' + i} position={p.pos} rotation={p.rot} castShadow><boxGeometry args={[p.size, p.size, p.size]} />{white}</mesh>)}
      {shardsAt(s).map((p, i) => <mesh key={'s' + i} position={p.pos} rotation={p.rot} castShadow><boxGeometry args={[p.size, p.size, p.size]} />{white}</mesh>)}
      {dustCloudAt(s).map((d, i) => <sprite key={'d' + i} position={d.pos} scale={[d.r * 2.6, d.r * 2.6, 1]}>
        <spriteMaterial map={puff} color="#9fb3cc" transparent opacity={d.alpha * 0.4} depthWrite={false} /></sprite>)}
      <Hammer k="copper" s={s} />
      <Hammer k="salt" s={s} />
    </>
  );
}

/** A "+" or "−" on the front of an ion, in white (part of the picture, F29). */
function Sign({ pos, r, plus }: { pos: V3; r: number; plus: boolean }) {
  const w = Math.min(0.9, r * 0.8), th = w * 0.22, white = <meshBasicMaterial color="#ffffff" />;
  return (
    <group position={[pos[0], pos[1], pos[2] + r + 0.02]}>
      <mesh><boxGeometry args={[w, th, 0.04]} />{white}</mesh>
      {plus && <mesh><boxGeometry args={[th, w, 0.04]} />{white}</mesh>}
    </group>
  );
}

function Atoms({ t }: { t: number }) {
  const scene = sceneAt(t);
  return (
    <>
      <color attach="background" args={[C.board]} />
      <RealLight env={0.6} key={1.2} at={[-30, 50, 60]} span={40} />
      <directionalLight position={[10, 20, -40]} intensity={1.2} color="#9fb7ff" />
      <ambientLight intensity={0.2} />
      {scene === 'copper' && (
        <>
          {copperCoresAt(t).map((p, i) => (
            <group key={i}>
              <mesh position={p}><sphereGeometry args={[CU_SLAB.r * 0.97, 40, 28]} />{copper}</mesh>
              {p[2] === 0 && <Sign pos={p} r={CU_SLAB.r * 0.97} plus />}
            </group>
          ))}
          {electronsAt(t).map((p, i) => (
            <mesh key={`e${i}`} position={p}><sphereGeometry args={[0.45, 20, 14]} />
              <meshBasicMaterial color={hot(C.electron, 1.6)} toneMapped={false} /></mesh>
          ))}
        </>
      )}
      {scene === 'salt' && (
        <>
          {saltIonsAt(t).map((x, i) => {
            const r = (PM[x.ion] / 100) * 0.97;
            return (
              <group key={i}>
                <mesh position={x.pos}><sphereGeometry args={[r, 40, 28]} />
                  <meshPhysicalMaterial color={x.ion === 'Na+' ? C.na : new THREE.Color(C.cl).multiplyScalar(0.72)} emissive={x.ion === 'Na+' ? C.na : '#000000'} emissiveIntensity={0.3} roughness={0.3} clearcoat={0.6} /></mesh>
                {x.pos[2] === 0 && <Sign pos={x.pos} r={r} plus={x.ion === 'Na+'} />}
              </group>
            );
          })}
          {repelPairsAt(t).map((pr, i) => <Push key={i} a={pr.a} b={pr.b} ion={pr.ion} k={repelAt(t)} />)}
        </>
      )}
    </>
  );
}

/** Like charges facing: a red pulse between them and two red arrowheads pushing them apart. */
function Push({ a, b, k, ion }: { a: V3; b: V3; k: number; ion: Ion }) {
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(a[2], b[2]) + (PM[ion] / 100) + 0.1];
  const red = <meshBasicMaterial color={C.push} transparent opacity={0.9 * k} />;
  return (
    <group position={mid}>
      <mesh><circleGeometry args={[0.6 + 0.5 * k, 32]} /><meshBasicMaterial color={C.push} transparent opacity={0.4 * k} /></mesh>
      <mesh position={[0, 0.95, 0.02]}><coneGeometry args={[0.45, 0.8, 16]} />{red}</mesh>
      <mesh position={[0, -0.95, 0.02]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.45, 0.8, 16]} />{red}</mesh>
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      {sceneAt(t) === 'macro' ? <Bench s={storyTime(t)} t={t} /> : <Atoms t={t} />}
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.2} intensity={0.8} radius={0.55} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

/** Every text from textsAt(), in its kind's style. */
function Words({ t }: { t: number }) {
  const big = bigAt(t);
  const pill = (x: Text, border: string, fill: string, colour: string, font: React.CSSProperties) => (
    <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, width: x.box.w, height: x.box.h, boxSizing: 'border-box', borderRadius: x.box.h / 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: x.alpha, border: `2px solid ${border}`, background: fill, color: colour, whiteSpace: 'pre', ...font }}>{x.text}</div>
  );
  const line = (x: Text, font: React.CSSProperties, colour: string = P.ink) => (
    <div key={x.name} style={{ position: 'absolute', left: 0, width: 1080, top: x.y, transform: 'translateY(-50%)', textAlign: 'center', opacity: x.alpha, color: colour,
      whiteSpace: 'pre', ...font }}>{x.text}</div>
  );
  return (
    <>
      {big > 0.01 && <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 620, opacity: big,
        background: `linear-gradient(to bottom, ${tint(C.board, 0.92)} 0%, ${tint(C.board, 0.8)} 70%, ${tint(C.board, 0)} 100%)` }} />}
      {flashAt(t) > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: 0.3 * flashAt(t), background: 'radial-gradient(circle at 50% 62%, #ffffff 0%, rgba(255,255,255,0.4) 12%, rgba(255,255,255,0) 32%)' }} />}
      {textsAt(t).map(x => {
        switch (x.kind) {
          case 'label': return line(x, { font: `700 34px ${SOFT_UI}` }, P.muted);
          case 'header': return line(x, hand(x.size));
          case 'chip': return pill(x, tint(P.ink, 0.22), 'rgba(27,35,48,0.82)', P.ink, hand(x.size));
          case 'nudge': return line(x, { font: `600 32px ${SOFT_UI}` }, P.muted);
          case 'tag': return line(x, { font: `600 30px ${SOFT_UI}`, letterSpacing: 0.5 }, P.muted);
          case 'line': return line(x, { font: `600 44px ${SOFT_UI}` });
          case 'caption': return pill(x, 'rgba(0,0,0,0)', 'rgba(10,14,20,0.72)', P.ink, { font: `600 ${x.size}px ${SOFT_UI}` });
          case 'setTag': return pill(x, tint(P.ink, 0.55), 'rgba(12,16,22,0.95)', '#ffffff', { font: `600 ${x.size}px ${SOFT_UI}` });
          case 'answer': return pill(x, P.amber, 'rgba(12,16,22,0.95)', '#ffd79a', { ...hand(x.size), boxShadow: `0 0 26px ${tint(P.amber, 0.35)}` });
        }
      })}
    </>
  );
}

export function PvChem011({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: C.board }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        {sceneAt(t) === 'macro' && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 62%, rgba(5,7,11,0) 55%, rgba(5,7,11,0.65) 100%)' }} />}
        <Words t={t} />
        {cover && <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-011-hammer-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
