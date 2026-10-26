// @pyqvault_ · Physics, visualised #15 (framework v1.29): ice at the top or at the bottom: which cools a drink faster? The
// top. The timeline, beat table, physics model and every text's place are in lib/pp015.ts. The first full-frame studio
// reel (F35, F36): the picture fills the page on a white seamless set; the question shrinks to one line at 3 s; each text
// sits beside what it names. Frame 0 is a close-up of the floating ice with cold water already streaming down; the camera
// pulls back to both glasses; 5 minutes run in 8 s; the answer at 8.6 s; then "So where should the freezer go?": the
// camera swings to a cut-away fridge whose cold air falls from the freezer at the top and rises again at the front.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { prog } from './lib/motion.ts';
import {
  GLASS, GX, DRINK_TOP, MESH_Y, CUBE, FRIDGE, SWAP, END_AT, END_LINES, COVER_T, T_SHRINK, COLOURS as C, profile, cubes, cubeScale,
  drinkPixels, airPath, airTemp, tempColour, cameraAt, textsAt, type Glass, type Text,
} from './lib/pp015.ts';
import { FULL } from './lib/layout.ts';
import { Caption, EndCard, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import { StudioSet, ContactShadow } from './studio.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const GLASSES: Glass[] = ['top', 'bottom'];
const TEX = { w: 64, h: 96 };

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** One glass: the drink (its colour is its temperature, layer by layer, with the falling cold), the ice, the mesh that
 *  holds the bottom ice down, and the glass itself (clear, reflecting the studio). */
function DrinkGlass({ k, t }: { k: Glass; t: number }) {
  const tex = useMemo(() => {
    const d = new THREE.DataTexture(new Uint8Array(TEX.w * TEX.h * 4), TEX.w, TEX.h, THREE.RGBAFormat);
    d.colorSpace = THREE.SRGBColorSpace; d.magFilter = THREE.LinearFilter; d.minFilter = THREE.LinearFilter;
    return d;
  }, []);
  tex.image.data!.set(drinkPixels(k, t, TEX.w, TEX.h)); tex.needsUpdate = true;
  const x = GX[k], h = DRINK_TOP - GLASS.base, r = GLASS.rIn - 0.004, s = cubeScale(k, t), top = profile(k, t)[profile(k, t).length - 1];
  // the drink is see-through (it writes no depth, so the ice and the mesh inside draw over it untinted: white ice in a
  // coloured drink; on the first stills the drink tinted them and the ice read as orange blocks)
  const drink = { transmission: 0.8, thickness: 0.8, roughness: 0.16, ior: 1.33, clearcoat: 0.4, depthWrite: false } as const;
  const steel = <meshStandardMaterial color={C.steelEdge} metalness={0.7} roughness={0.3} transparent />;
  return (
    <group>
      <mesh position={[x, GLASS.base + h / 2, 0]}><cylinderGeometry args={[r, r, h, 64, 1, true]} />
        <meshPhysicalMaterial map={tex} side={THREE.DoubleSide} {...drink} /></mesh>
      <mesh position={[x, DRINK_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 64]} />
        <meshPhysicalMaterial color={tempColour(top)} {...drink} /></mesh>
      {s > 0.02 && cubes(k).map((p, i) => (
        <mesh key={i} position={p} rotation={[0, (i * 0.7) % 1.2 - 0.6, ((i * 0.37) % 0.3) - 0.15]} scale={s} castShadow>
          <RoundBox size={[CUBE, CUBE, CUBE]} radius={0.035} />
          <meshPhysicalMaterial color={C.ice} roughness={0.12} clearcoat={1} emissive="#e6f6fc" emissiveIntensity={0.3} transparent opacity={0.92} />
        </mesh>
      ))}
      {k === 'bottom' && (
        <group position={[x, MESH_Y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[GLASS.rIn - 0.02, 0.016, 12, 64]} />{steel}</mesh>
          {[-0.16, -0.05, 0.06, 0.17].map(z => (
            <mesh key={z} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.01, 0.01, 2 * Math.sqrt(Math.max(0, (GLASS.rIn - 0.02) ** 2 - z * z)), 8]} />{steel}</mesh>
          ))}
        </group>
      )}
      {/* the glass: a clear wall, a heavier rim and base */}
      <mesh position={[x, GLASS.base + (GLASS.wall - GLASS.base) / 2, 0]}><cylinderGeometry args={[GLASS.rOut, GLASS.rOut, GLASS.wall - GLASS.base, 64, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.03} clearcoat={1} envMapIntensity={1.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[x, GLASS.wall, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[(GLASS.rIn + GLASS.rOut) / 2, 0.013, 12, 64]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.55} roughness={0.03} clearcoat={1} envMapIntensity={1.8} depthWrite={false} /></mesh>
      <mesh position={[x, GLASS.base / 2, 0]} castShadow><cylinderGeometry args={[GLASS.rOut, GLASS.rOut, GLASS.base, 64]} />
        <meshPhysicalMaterial color={C.glass} transparent opacity={0.45} roughness={0.05} clearcoat={1} envMapIntensity={1.6} depthWrite={false} /></mesh>
      <ContactShadow x={x} rx={0.55} opacity={0.28} />
    </group>
  );
}

// A mint body (a white fridge vanished into the white studio on the first stills), a white inside.
const body = <meshPhysicalMaterial color="#7fcbb4" roughness={0.3} clearcoat={0.7} />;
const white = <meshPhysicalMaterial color="#f7f8fa" roughness={0.4} />;
/** A single-door fridge, cut away at the front (door swung open), with the freezer at the top, two glass shelves and some
 *  food; the air goes round it: down at the back from the freezer, up at the front. */
function Fridge({ t }: { t: number }) {
  const { x, w, h, d, wall, freezer } = FRIDGE, inner = w - 2 * wall, show = prog(t, SWAP - 0.6, 0.4);
  if (show <= 0) return null;
  // the air: 80 puffs round the loop, each with a short fading trail so the flow reads as a flow
  const air = Array.from({ length: 80 }, (_, i) => [0, 1, 2, 3].map(j => {
    const u = (((i / 80 + t * 0.16 - j * 0.012) % 1) + 1) % 1, p = airPath(u), ax = (((i * 0.618) % 1) - 0.5) * (inner - 0.2);
    return { p: [x + ax, p.y, p.z] as [number, number, number], colour: tempColour(((airTemp(u) + 5) / 13) * 16), a: 1 - j * 0.24, r: 0.03 - j * 0.004 };
  })).flat();
  return (
    <group>
      <mesh position={[x, h / 2, -d / 2 + wall / 2]} castShadow receiveShadow><RoundBox size={[w, h, wall]} radius={0.02} />{body}</mesh>
      <mesh position={[x, h / 2, -d / 2 + wall + 0.005]} receiveShadow><planeGeometry args={[inner, h - 0.2]} />{white}</mesh>
      {[-1, 1].map(s => <mesh key={s} position={[x + s * (w / 2 - wall / 2), h / 2, 0]} castShadow receiveShadow><RoundBox size={[wall, h, d]} radius={0.02} />{body}</mesh>)}
      <mesh position={[x, h - wall / 2, 0]} castShadow><RoundBox size={[w, wall, d]} radius={0.02} />{body}</mesh>
      <mesh position={[x, 0.07, 0]} castShadow receiveShadow><RoundBox size={[w, 0.14, d]} radius={0.03} />{body}</mesh>
      {/* the freezer: a frosty box across the top, its flap open a crack, frost on its lip */}
      <mesh position={[x, (freezer.y0 + freezer.y1) / 2, -0.03]} receiveShadow><RoundBox size={[inner - 0.04, freezer.y1 - freezer.y0, d - 0.12]} radius={0.04} />
        <meshPhysicalMaterial color="#cfe6f5" roughness={0.5} emissive="#b9dcf2" emissiveIntensity={0.35} /></mesh>
      <mesh position={[x, freezer.y0 + 0.01, (d - 0.12) / 2 - 0.03 + 0.012]}><RoundBox size={[inner - 0.06, 0.03, 0.03]} radius={0.012} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.7} emissive="#e8f6ff" emissiveIntensity={0.5} /></mesh>
      {/* two glass shelves */}
      {[0.62, 1.22].map(y => <mesh key={y} position={[x, y, 0.02]}><RoundBox size={[inner, 0.025, d - 0.1]} radius={0.01} />
        <meshPhysicalMaterial color={C.glass} transparent opacity={0.4} roughness={0.05} clearcoat={1} depthWrite={false} /></mesh>)}
      {/* food: a green bottle and a jug on the lower shelf, a bowl of tomatoes above */}
      <mesh position={[x - 0.3, 0.635 + 0.22, -0.05]} castShadow><cylinderGeometry args={[0.07, 0.075, 0.44, 32]} /><meshPhysicalMaterial color="#2f8a4c" roughness={0.15} clearcoat={1} /></mesh>
      <mesh position={[x + 0.22, 0.635 + 0.15, -0.02]} castShadow><RoundBox size={[0.22, 0.3, 0.18]} radius={0.05} /><meshPhysicalMaterial color="#fbfbfb" roughness={0.3} /></mesh>
      <mesh position={[x + 0.05, 1.235 + 0.06, 0]} rotation={[Math.PI, 0, 0]} castShadow><sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial color="#f2f2f2" roughness={0.3} side={THREE.DoubleSide} /></mesh>
      {[[-0.06, 0.02], [0.08, -0.03], [0.02, 0.07]].map(([dx, dz], i) => <mesh key={i} position={[x + 0.05 + dx, 1.235 + 0.1, dz]} castShadow><sphereGeometry args={[0.07, 24, 16]} /><meshPhysicalMaterial color="#d63b2f" roughness={0.25} clearcoat={0.8} /></mesh>)}
      {/* the door, swung open to the right */}
      <group position={[x + w / 2, 0, d / 2]} rotation={[0, 2.2, 0]}>
        <mesh position={[-w / 2, h / 2 + 0.04, 0.04]} castShadow><RoundBox size={[w, h - 0.12, 0.08]} radius={0.03} />{body}</mesh>
      </group>
      {/* the air going round */}
      {air.map((a, i) => <mesh key={i} position={a.p}><sphereGeometry args={[a.r, 12, 8]} /><meshBasicMaterial color={a.colour} transparent opacity={0.85 * a.a * show} depthWrite={false} /></mesh>)}
      <ContactShadow x={x} rx={w * 0.75} rz={d * 0.8} opacity={0.3} />
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <StudioSet colour={C.studio} />
      {t < SWAP + 0.6 && GLASSES.map(k => <DrinkGlass key={k} k={k} t={t} />)}
      <Fridge t={t} />
    </>
  );
}

/** Every text from textsAt(), in its kind's style. */
function Words({ t }: { t: number }) {
  const big = 1 - prog(t, T_SHRINK, 0.3);
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
      {/* a soft wash behind the big question so it reads over the close-up; gone with it */}
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
          case 'temp': return at(x, { font: `700 60px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' }, x.colour);
          case 'clock': return at(x, { font: `700 40px ${SOFT_UI}`, fontVariantNumeric: 'tabular-nums' });
          case 'glassTag': case 'freezer': return pill(x, tint(P.ink, 0.14), 'rgba(255,255,255,0.88)', P.muted, { font: `600 ${x.size}px ${SOFT_UI}` });
          case 'answer': return pill(x, tint(P.amber, 0.8), 'rgba(255,248,240,0.95)', P.amber, { ...hand(x.size), boxShadow: `0 6px 22px ${tint(P.amber, 0.25)}` });
        }
      })}
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 64, weight: 700, color: P.ink, text: END_LINES[0] },
  { at: 0.7, size: 48, weight: 700, color: C.cold, text: END_LINES[1] },
  { at: 1.1, size: 40, weight: 600, color: P.muted, text: END_LINES[2] },
];

export function PvPhysics015({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: C.studio }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <Words t={t} />
        {cover && <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-015-ice-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
