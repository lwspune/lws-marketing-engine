// @pyqvault_ · Chemistry, visualised #11 (framework v1.30): the same hammer, the same hit, on a copper bar and a salt crystal:
// which shatters? The salt. The timeline, beat table, chemistry and every text's place are in lib/pc011.ts. The third Shock
// reel and the first under F37 (the aftershock): both hammers land at 0.2 s, then in slow motion the copper bends (1.2 s),
// cracks shoot across the salt (1.3 s, 2.2 s) and it bursts into cubes (3.2 s). The second hook dives into the bend: copper's
// + ions in a sea of electrons slide and stay held; salt's slide one step, + meets +, and the layers push apart. Then it
// rewinds to frame 0 (loop). Full-frame soft studio (F35, F36).
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import {
  BAR, SUPPORT, SALT, SALT_BLOCK, PIECE, CU_SLAB, PM, COVER_T, COLOURS as C, storyTime, sceneAt, barShape, hammerAt, cracksAt, flecksAt,
  dustAt, piecesAt, copperCoresAt, electronsAt, saltIonsAt, repelPairsAt, repelAt, cameraAt, textsAt, bigAt, T_BURST, type Text, type Ion,
} from './lib/pc011.ts';
import type { V3 } from './lib/inductionScene.ts';
import { FULL } from './lib/layout.ts';
import { Caption, Theme, hand, useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { RealLight } from './realism.tsx';
import { StudioSet, ContactShadow } from './studio.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

const steel = <meshPhysicalMaterial color={C.steel} metalness={0.75} roughness={0.28} clearcoat={0.4} />;
const copper = <meshPhysicalMaterial color={C.copper} metalness={0.85} roughness={0.26} clearcoat={0.5} />;
const salt = <meshPhysicalMaterial color={C.salt} roughness={0.18} clearcoat={1} transmission={0.25} thickness={0.3} ior={1.54} />;

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
function SaltCube({ pos, rot, size }: { pos: V3; rot: V3; size: number }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)), [size]);
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow><RoundBox size={[size, size, size]} radius={size * 0.04} />{salt}</mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color={C.saltEdge} transparent opacity={0.85} /></lineSegments>
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
    <group position={[h.x, h.face, 0]} rotation={[0, 0, h.tilt]}>
      <mesh position={[0, head.h / 2, 0]} castShadow><cylinderGeometry args={[head.r, head.r, head.h, 40]} />{steel}</mesh>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[head.r * 1.04, head.r * 1.04, 0.04, 40]} />
        <meshPhysicalMaterial color={C.steelEdge} metalness={0.8} roughness={0.22} /></mesh>
      <mesh position={[0, head.h - 0.02, 0]}><cylinderGeometry args={[head.r * 0.9, head.r * 1.02, 0.04, 40]} />
        <meshPhysicalMaterial color={C.steelEdge} metalness={0.8} roughness={0.22} /></mesh>
      <mesh position={[from[0] + dir[0] * len / 2, from[1] + dir[1] * len / 2, 0]} rotation={[0, 0, -side * (Math.PI / 2 - up)]} castShadow>
        <cylinderGeometry args={[0.042, 0.05, len, 20]} /><meshPhysicalMaterial color={C.wood} roughness={0.55} clearcoat={0.3} />
      </mesh>
    </group>
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

function Bench({ s }: { s: number }) {
  const pieces = piecesAt(s);
  return (
    <>
      <StudioSet colour={C.studio} />
      {[-1, 1].map(d => (
        <group key={d}>
          <mesh position={[BAR.x + d * BAR.support, SUPPORT.h / 2, 0]} castShadow receiveShadow><RoundBox size={[SUPPORT.w, SUPPORT.h, SUPPORT.d]} radius={0.03} />{steel}</mesh>
          <ContactShadow x={BAR.x + d * BAR.support} rx={0.24} rz={0.32} opacity={0.3} />
        </group>
      ))}
      <mesh position={[SALT.x, SALT_BLOCK.h / 2, 0]} castShadow receiveShadow><RoundBox size={[2 * SALT_BLOCK.hw, SALT_BLOCK.h, 2 * SALT_BLOCK.hd]} radius={0.04} />{steel}</mesh>
      <ContactShadow x={SALT.x} rx={0.48} rz={0.42} opacity={0.3} />
      <Bar s={s} />
      {s < T_BURST
        ? <SaltCube pos={[SALT.x, SALT.base + SALT.side / 2, 0]} rot={[0, 0, 0]} size={SALT.side} />
        : pieces.map((p, i) => <SaltCube key={i} pos={p.pos} rot={p.rot} size={PIECE * 0.985} />)}
      {cracksAt(s).map((c, i) => c.slice(1).map((p, j) => <Segment key={`${i}-${j}`} a={[c[j][0], c[j][1], c[j][2] + 0.004]} b={[p[0], p[1], p[2] + 0.004]} r={0.013} colour="#2b323b" />))}
      {flecksAt(s).map((f, i) => <mesh key={i} position={f.pos}><boxGeometry args={[0.03, 0.03, 0.03]} /><meshBasicMaterial color="#ffffff" transparent opacity={f.alpha} /></mesh>)}
      {dustAt(s).map((d, i) => (
        <mesh key={i} position={[d.x, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[d.r * 0.82, d.r, 48]} />
          <meshBasicMaterial color="#8d939c" transparent opacity={d.alpha} depthWrite={false} /></mesh>
      ))}
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
      <color attach="background" args={[C.studio]} />
      <RealLight env={0.9} key={1.1} at={[-30, 50, 60]} span={40} />
      <ambientLight intensity={0.4} />
      {scene === 'copper' && (
        <>
          {copperCoresAt(t).map((p, i) => (
            <group key={i}>
              <mesh position={p}><sphereGeometry args={[CU_SLAB.r * 0.97, 40, 28]} />{copper}</mesh>
              {p[2] === 0 && <Sign pos={p} r={CU_SLAB.r * 0.97} plus />}
            </group>
          ))}
          {electronsAt(t).map((p, i) => (
            <mesh key={`e${i}`} position={p}><sphereGeometry args={[0.3, 20, 14]} />
              <meshStandardMaterial color={C.electron} emissive={C.electron} emissiveIntensity={0.35} roughness={0.35} /></mesh>
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
                  <meshPhysicalMaterial color={x.ion === 'Na+' ? C.na : C.cl} roughness={0.3} clearcoat={0.6} /></mesh>
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
      {sceneAt(t) === 'macro' ? <Bench s={storyTime(t)} /> : <Atoms t={t} />}
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
  const at = (x: Text, font: React.CSSProperties, colour: string = P.ink) => (
    <div key={x.name} style={{ position: 'absolute', left: x.x, top: x.y, transform: 'translate(-50%, -50%)', opacity: x.alpha, color: colour, whiteSpace: 'pre',
      textShadow: `0 0 18px ${C.studio}, 0 0 6px ${C.studio}`, ...font }}>{x.text}</div>
  );
  return (
    <>
      {big > 0.01 && <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 620, opacity: big,
        background: `linear-gradient(to bottom, ${tint(C.studio, 0.92)} 0%, ${tint(C.studio, 0.8)} 70%, ${tint(C.studio, 0)} 100%)` }} />}
      {textsAt(t).map(x => {
        switch (x.kind) {
          case 'label': return line(x, { font: `700 34px ${SOFT_UI}` }, P.muted);
          case 'header': return line(x, hand(x.size));
          case 'chip': return pill(x, tint(P.ink, 0.16), 'rgba(255,255,255,0.7)', P.ink, hand(x.size));
          case 'nudge': return line(x, { font: `600 32px ${SOFT_UI}` }, P.muted);
          case 'tag': return line(x, { font: `600 30px ${SOFT_UI}`, letterSpacing: 0.5 }, P.muted);
          case 'line': return line(x, { font: `600 44px ${SOFT_UI}` });
          case 'caption': return at(x, { font: `600 46px ${SOFT_UI}` });
          case 'setTag': return pill(x, tint(P.ink, 0.14), 'rgba(255,255,255,0.88)', P.muted, { font: `600 ${x.size}px ${SOFT_UI}` });
          case 'answer': return pill(x, tint(P.amber, 0.8), 'rgba(255,248,240,0.95)', P.amber, { ...hand(x.size), boxShadow: `0 6px 22px ${tint(P.amber, 0.25)}` });
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
      <AbsoluteFill style={{ background: C.studio }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <Words t={t} />
        {cover && <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-011-hammer-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
