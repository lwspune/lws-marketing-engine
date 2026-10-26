// @pyqvault_ · Chemistry, visualised #10 ("You'd think" + Shock): explosive metal + poison gas = table salt. The second Shock
// opening (F25): on frame 0 a deflagrating spoon of burning sodium is already plunging into a jar of yellow-green chlorine;
// at 0.2 s it bursts into a blinding sodium-yellow flame, sparks fly, the camera shakes, and white smoke fills the jar as
// the green fades. A punch-in into the smoke washes white into the atoms: Na's lone outer electron hops into the gap in
// Cl's ring, Na shrinks to Na⁺ and Cl swells to Cl⁻ (real radii), they snap together and 62 more ions fly in and lock into
// a rock-salt cube, which turns into a crystal. Back at the jar, a punch-in on the spoon of cube crystals: C table salt.
// Second hook (F26): "Why does only salt water conduct?": dry salt between two electrodes leaves the bulb dark; water pours
// in, the ions drift free (Na⁺ to −, Cl⁻ to +) and it lights. End card (F27). Dark board, real glow (Bloom), real
// colours for chlorine, sodium, glass, steel, copper and water (F24). Lib and beat table: lib/pc010.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LAB as P, VIVID, REAL, SOFT_UI, tint } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  LABEL, HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, END_AT, END_LINES, COVER_T, BAND, JAR, BEAKER, ELECTRODES,
  T_HOP0, T_HOP1, T_PAIR, CUT1, CUT2, T_ENTER, T_POUR0, ANSWER2_AT, cupAt, flameAt, beadAt, flashAt, sparksAt, chlorineAt, smokeAt,
  depositAt, cupCrystalsAt, sceneAt, washAt, atomsAt, ionsAt, crystalAt, CRYSTAL_HALF, RADIUS_PM, UNIT_PM, waterLevel, pourAt,
  grainsAt, waterIonsAt, bulbGlow, cameraAt, project, type V3,
} from './lib/pc010.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, useFonts, type EndLine } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { BloomWarmUp, Bulb, CurrentDots, Wire } from './induction3d.tsx';

const V = VIVID.lab, R = REAL.lab;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const NA_FLAME = '#ffc81e', SMOKE = '#e8ecf1', SALT = '#f3f5f8', BENCH = '#1b222d';
const NA_ION = V.violet, CL_ION = R.chlorine.fill, ELECTRON = V.cyan;
/** A colour pushed above 1 so Bloom makes it glow (toneMapped off). */
const hot = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

function Light({ env, flame, cup }: { env: number; flame: number; cup: V3 }) {
  const { gl, scene } = useThree();
  const room = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = env;
  return (
    <>
      <directionalLight position={[-5, 9, 7]} intensity={1.1} color="#dfe6f5" />
      <hemisphereLight args={['#9fb0d0', '#0b0e14', 0.35]} />
      {flame > 0.02 && <pointLight position={[cup[0], cup[1] + 0.3, cup[2] + 0.2]} intensity={45 * flame} distance={8} color={NA_FLAME} />}
    </>
  );
}

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 0.05; cam.far = 90;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

const glass = (opacity = 0.18) => (
  <meshPhysicalMaterial color={R.glass.fill} roughness={0.05} metalness={0} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
);

function Bench() {
  return (
    <mesh position={[1.8, -0.06, 0]}><RoundBox size={[14, 0.12, 5]} radius={0.05} /><meshStandardMaterial color={BENCH} roughness={0.55} /></mesh>
  );
}

/** The gas jar: open glass cylinder, rim, base; the chlorine inside; white salt frosting the glass as the smoke settles. */
function Jar({ t }: { t: number }) {
  const { r, h, wall } = JAR, gas = chlorineAt(t), dep = depositAt(t);
  return (
    <group>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[r, r, h, 64, 1, true]} />{glass()}</mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.025, 10, 64]} /><meshStandardMaterial color={R.glass.edge} roughness={0.1} transparent opacity={0.8} /></mesh>
      <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[r + 0.02, r + 0.02, 0.06, 64]} />{glass(0.35)}</mesh>
      <mesh position={[0, (h - 0.04) / 2 + 0.06, 0]}><cylinderGeometry args={[r - wall, r - wall, h - 0.1, 64]} />
        <meshStandardMaterial color={R.chlorine.fill} transparent opacity={0.34 * gas} roughness={1} depthWrite={false} /></mesh>
      {dep > 0.01 && <>
        <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[r - 0.012, r - 0.012, h - 0.02, 64, 1, true]} />
          <meshStandardMaterial color={SALT} transparent opacity={0.05 * dep} roughness={0.9} side={THREE.DoubleSide} depthWrite={false} /></mesh>
        <mesh position={[0, 0.065, 0]}><cylinderGeometry args={[r - wall, r - wall, 0.012, 64]} /><meshStandardMaterial color={SALT} transparent opacity={0.85 * dep} roughness={0.9} /></mesh>
      </>}
    </group>
  );
}

/** The deflagrating spoon: a steel rod, a disc that closes the jar when the cup comes to rest, the cup with the sodium. */
function Spoon({ t }: { t: number }) {
  const c = cupAt(t), f = flameAt(t), bead = beadAt(t), steel = <meshStandardMaterial color={R.steel.fill} metalness={0.8} roughness={0.3} />;
  const lid = JAR.h + 0.03 - 1.3;   // the disc sits on the rim when the cup rests at 1.3
  return (
    <group position={c}>
      <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.022, 0.022, 3.1, 12]} />{steel}</mesh>
      <mesh position={[0, lid, 0]}><cylinderGeometry args={[JAR.r + 0.08, JAR.r + 0.08, 0.035, 64]} />{steel}</mesh>
      <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={R.steel.fill} metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
      {bead > 0.02 && <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.075 * bead, 24, 24]} />
        <meshStandardMaterial color={R.sodium.fill} metalness={0.6} roughness={0.25} emissive={new THREE.Color(NA_FLAME)} emissiveIntensity={0.4 + 2.5 * f} /></mesh>}
      {f > 0.02 && [0, 1, 2, 3, 4, 5].map(i => {
        const s = f * (0.55 + 0.45 * Math.sin(t * (23 + 7 * i) + i * 1.7) ** 2), h = 0.3 + 1.1 * s;
        return <mesh key={i} position={[0.09 * Math.sin(i * 2.1), 0.1 + h / 2, 0.09 * Math.cos(i * 2.1)]}><coneGeometry args={[0.1 + 0.26 * s, h, 18]} />
          <meshBasicMaterial color={hot(i % 2 ? NA_FLAME : '#fff1b0', 1.4 + 3 * f)} toneMapped={false} transparent opacity={Math.min(1, 0.3 + 0.55 * f)} depthWrite={false} /></mesh>;
      })}
      {/* the fireball: a glowing core and a soft halo that fill the jar while it burns hardest */}
      {f > 0.3 && <>
        <sprite position={[0, 0.3, 0]} scale={[0.9 * f, 0.9 * f, 1]}><spriteMaterial map={puff()} color={hot('#fff6c8', 3)} toneMapped={false} transparent opacity={0.9 * f} depthWrite={false} /></sprite>
        <sprite position={[0, 0.45, 0]} scale={[2.1 * f, 2.1 * f, 1]}><spriteMaterial map={puff()} color={hot(NA_FLAME, 2)} toneMapped={false} transparent opacity={0.6 * f} depthWrite={false} /></sprite>
      </>}
    </group>
  );
}

/** The burst as the sodium hits the chlorine: a hot shell that swells to the glass and fades in under half a second. */
function Burst({ t }: { t: number }) {
  const k = (t - T_ENTER) / 0.45;
  if (k < 0 || k >= 1) return null;
  const c = cupAt(T_ENTER), s = 0.4 + 1.6 * Math.sqrt(k);
  return <sprite position={[c[0], c[1] - 0.2, c[2]]} scale={[s, s, 1]}><spriteMaterial map={puff()} color={hot('#fff1b0', 4)} toneMapped={false} transparent opacity={1 - k} depthWrite={false} /></sprite>;
}

/** A soft round puff (white centre fading to nothing at the edge), drawn once: smoke and glow are sprites of it, so
    they have no hard edge (spheres looked like cotton balls in the first stills). */
let PUFF: THREE.CanvasTexture | null = null;
function puff() {
  if (PUFF) return PUFF;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  PUFF = new THREE.CanvasTexture(c);
  return PUFF;
}

function Smoke({ t }: { t: number }) {
  return <>{smokeAt(t).map((s, i) => (
    <sprite key={i} position={s.pos} scale={[2.6 * s.r, 2.6 * s.r, 1]}>
      <spriteMaterial map={puff()} color={SMOKE} transparent opacity={0.42 * s.alpha} depthWrite={false} /></sprite>
  ))}</>;
}

function Crystal({ pos, size, spin, alpha = 1 }: { pos: V3; size: number; spin: number; alpha?: number }) {
  return (
    <mesh position={pos} rotation={[0.3 * spin, spin, 0.2 * spin]}><RoundBox size={[size, size, size]} radius={size * 0.08} />
      <meshPhysicalMaterial color={SALT} roughness={0.25} clearcoat={0.6} transparent opacity={0.92 * alpha} /></mesh>
  );
}

// ---- the beaker, its electrodes and the circuit ----
const B = BEAKER, E = ELECTRODES, TERM = { neg: [B.battery[0] - 0.15, 0.38, B.battery[2]] as V3, pos: [B.battery[0] + 0.15, 0.38, B.battery[2]] as V3 };
const WIRE_NEG: V3[] = [TERM.neg, [TERM.neg[0], 1.4, 0.2], [TERM.neg[0], 2.25, 0.1], [2.8, 2.25, 0.05], [E.neg[0], 2.25, 0], [E.neg[0], E.top, 0]];
const WIRE_POS: V3[] = [[E.pos[0], E.top, 0], [E.pos[0], 2.25, 0], [4.4, 2.25, 0.05], [B.bulb[0], 2.25, 0.15], [B.bulb[0], 1.4, 0.25], [B.bulb[0], 0.62, B.bulb[2]]];
const WIRE_BACK: V3[] = [[B.bulb[0], 0.14, B.bulb[2] + 0.15], [3.6, 0.03, 0.55], [TERM.pos[0], 0.03, 0.5], [TERM.pos[0], TERM.pos[1], TERM.pos[2]]];

function Beaker({ t }: { t: number }) {
  const lvl = waterLevel(t), pour = pourAt(t), lit = bulbGlow(t), steel = <meshStandardMaterial color={R.steel.fill} metalness={0.8} roughness={0.3} />;
  const plateH = E.top - E.neg[1], phase = 0.6 * Math.max(0, t - ANSWER2_AT + 0.2);
  return (
    <group>
      <mesh position={[B.x, B.h / 2, 0]}><cylinderGeometry args={[B.r, B.r, B.h, 64, 1, true]} />{glass()}</mesh>
      <mesh position={[B.x, B.h, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[B.r, 0.022, 10, 64]} /><meshStandardMaterial color={R.glass.edge} transparent opacity={0.8} /></mesh>
      <mesh position={[B.x, 0.02, 0]}><cylinderGeometry args={[B.r + 0.02, B.r + 0.02, 0.04, 64]} />{glass(0.35)}</mesh>
      {lvl > 0.01 && <mesh position={[B.x, lvl / 2 + 0.04, 0]}><cylinderGeometry args={[B.r - 0.03, B.r - 0.03, lvl, 64]} />
        <meshPhysicalMaterial color={R.water.fill} transparent opacity={0.38} roughness={0.08} depthWrite={false} /></mesh>}
      {pour > 0.01 && <mesh position={[B.x - 0.15, (3.6 + lvl) / 2, 0.1]}><cylinderGeometry args={[0.045 * pour, 0.03 * pour, 3.6 - lvl, 16]} />
        <meshPhysicalMaterial color={R.water.edge} transparent opacity={0.6} roughness={0.05} /></mesh>}
      {grainsAt(t).map((g, i) => <Crystal key={i} pos={[g.pos[0], g.pos[1] + 0.04, g.pos[2]]} size={g.size} spin={g.spin} />)}
      {[E.neg, E.pos].map((e, i) => <mesh key={i} position={[e[0], e[1] + plateH / 2, 0]}><RoundBox size={[0.05, plateH, 0.34]} radius={0.015} />{steel}</mesh>)}
      {waterIonsAt(t).map((w, i) => (
        <mesh key={`w${i}`} position={w.pos}><sphereGeometry args={[w.ion === 'Na+' ? 0.04 : 0.06, 16, 16]} />
          <meshStandardMaterial color={w.ion === 'Na+' ? NA_ION : CL_ION} emissive={new THREE.Color(w.ion === 'Na+' ? NA_ION : CL_ION)} emissiveIntensity={0.5} roughness={0.4} /></mesh>
      ))}
      {/* the battery: a rounded cell on the bench, + and − terminals on top */}
      <mesh position={[B.battery[0], B.battery[1], B.battery[2]]}><RoundBox size={[0.5, 0.36, 0.3]} radius={0.06} /><meshStandardMaterial color="#2c3646" roughness={0.5} /></mesh>
      <mesh position={[B.battery[0], B.battery[1] + 0.06, B.battery[2] + 0.152]}><RoundBox size={[0.5, 0.08, 0.005]} radius={0.002} /><meshStandardMaterial color={V.orange} roughness={0.5} /></mesh>
      {[TERM.neg, TERM.pos].map((p, i) => <mesh key={`t${i}`} position={p}><cylinderGeometry args={[0.035, 0.035, 0.05, 16]} /><meshStandardMaterial color={R.steel.fill} metalness={0.8} roughness={0.3} /></mesh>)}
      <Bulb at={B.bulb} glow={lit} glass={R.glass.fill} socket={R.steel.fill} filament="#6b5a3a" />
      {lit > 0.02 && <pointLight position={[B.bulb[0], B.bulb[1] + 0.25, B.bulb[2] + 0.2]} intensity={6 * lit} distance={4} color="#ffd27a" />}
      {[WIRE_NEG, WIRE_POS, WIRE_BACK].map((w, i) => <Wire key={`r${i}`} pts={w} color={R.copper.fill} />)}
      {[WIRE_NEG, WIRE_POS, WIRE_BACK].map((w, i) => <CurrentDots key={`d${i}`} pts={w} phase={phase} alpha={lit} color={hot(ELECTRON, 2).getStyle()} count={7} />)}
    </group>
  );
}

function MacroScene({ t }: { t: number }) {
  const f = flameAt(t), c = cupAt(t);
  return (
    <>
      <Light env={0.35 + 2 * flashAt(t)} flame={f} cup={c} />
      <Bench />
      <Jar t={t} />
      <Spoon t={t} />
      {cupCrystalsAt(t).map((k, i) => <Crystal key={`c${i}`} pos={k.pos} size={k.size} spin={k.spin} />)}
      <Smoke t={t} />
      <Burst t={t} />
      {sparksAt(t).map((s, i) => (
        <mesh key={`s${i}`} position={s.pos}><sphereGeometry args={[0.018, 6, 6]} /><meshBasicMaterial color={hot(NA_FLAME, 2.6)} toneMapped={false} transparent opacity={s.alpha} /></mesh>
      ))}
      {t >= CUT2 && <Beaker t={t} />}
    </>
  );
}

// ---- the atoms ----
function Ion({ pos, r, color, alpha = 1 }: { pos: V3; r: number; color: string; alpha?: number }) {
  return (
    <mesh position={pos}><sphereGeometry args={[r, 48, 32]} />
      <meshStandardMaterial color={color} emissive={new THREE.Color(color)} emissiveIntensity={0.18} roughness={0.35} metalness={0.05} transparent={alpha < 1} opacity={alpha} /></mesh>
  );
}
function Electron({ pos, alpha = 1 }: { pos: V3; alpha?: number }) {
  return <mesh position={pos}><sphereGeometry args={[0.13, 20, 20]} /><meshBasicMaterial color={hot(ELECTRON, 2.6)} toneMapped={false} transparent opacity={alpha} /></mesh>;
}
function Shell({ pos, r, alpha }: { pos: V3; r: number; alpha: number }) {
  return <mesh position={[pos[0], pos[1], pos[2] + 0.001]}><torusGeometry args={[r, 0.025, 8, 96]} /><meshBasicMaterial color={hot(ELECTRON, 1.1)} toneMapped={false} transparent opacity={alpha} /></mesh>;
}

function MicroScene({ t }: { t: number }) {
  const a = atomsAt(t), lattice = t >= T_PAIR, cr = crystalAt(t), fade = 1 - 0.75 * cr;
  const naR = RADIUS_PM['Na+'] / UNIT_PM, clR = RADIUS_PM['Cl-'] / UNIT_PM;
  // The atom is drawn a little inside its ring, so the outer electrons sit on its edge (the atomic radius).
  return (
    <>
      <Light env={0.6} flame={0} cup={[0, 0, 0]} />
      <pointLight position={[-6, 8, 12]} intensity={60} distance={40} color="#ffffff" />
      {!lattice && <>
        <Ion pos={a.na.pos} r={a.na.r * 0.92} color={NA_ION} alpha={0.9} />
        <Ion pos={a.cl.pos} r={a.cl.r * 0.92} color={CL_ION} alpha={0.9} />
        <Shell pos={a.na.pos} r={a.na.r} alpha={0.45 * (1 - prog(t, T_HOP0, 0.4))} />
        <Shell pos={a.cl.pos} r={a.cl.r} alpha={0.45} />
        {[...a.na.electrons, ...a.cl.electrons].map((e, i) => <Electron key={i} pos={e} />)}
        {a.hop && [0, 0.04, 0.08, 0.12].map((lag, i) => {
          const h = atomsAt(Math.max(T_HOP0, t - lag)).hop;
          return h ? <Electron key={`h${i}`} pos={h} alpha={1 - i * 0.24} /> : null;
        })}
      </>}
      {lattice && ionsAt(t).map((s, i) => s.alpha > 0.01 && (
        <Ion key={i} pos={s.pos} r={(s.ion === 'Na+' ? naR : clR) * 0.97} color={s.ion === 'Na+' ? NA_ION : CL_ION} alpha={s.alpha * fade} />
      ))}
      {cr > 0.01 && <mesh><RoundBox size={[2 * CRYSTAL_HALF, 2 * CRYSTAL_HALF, 2 * CRYSTAL_HALF]} radius={0.35} />
        <meshPhysicalMaterial color={SALT} roughness={0.12} clearcoat={1} transparent opacity={0.62 * cr} depthWrite={false} /></mesh>}
    </>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      {sceneAt(t) === 'micro' ? <MicroScene t={t} /> : <MacroScene t={t} />}
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.1} radius={0.6} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

const ion = (sym: string, sign: string) => <>{sym}<sup style={{ fontSize: '0.62em', marginLeft: 2 }}>{sign}</sup></>;
const pill = (text: React.ReactNode, color: string, size = 44) => (
  <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, background: 'rgba(18,24,34,0.78)', font: `700 ${size}px ${SOFT_UI}`, color }}>{text}</span>
);
/** Symbols over the atoms (Na, Cl → Na⁺, Cl⁻) and the electrodes' signs. Symbols count as picture (F7, F29). */
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t), out: { x: number; y: number; node: React.ReactNode; a: number }[] = [];
  if (sceneAt(t) === 'micro' && t < T_PAIR + 0.6) {
    const a = atomsAt(t), charged = t >= T_HOP1 + 0.15, show = prog(t, CUT1 + 0.15, 0.3) * (1 - prog(t, T_PAIR + 0.2, 0.4));
    for (const [at, sym, col] of [[a.na, charged ? ion('Na', '+') : 'Na', NA_ION], [a.cl, charged ? ion('Cl', '−') : 'Cl', CL_ION]] as const) {
      const p = project([at.pos[0], at.pos[1] - at.r - 0.55, at.pos[2]], cam);
      out.push({ x: p.x, y: p.y, node: pill(sym, col), a: show });
    }
  }
  if (sceneAt(t) === 'macro' && t > T_POUR0 - 1.2) {
    for (const [e, sym] of [[E.neg, '−'], [E.pos, '+']] as const) {
      const p = project([e[0] + (sym === '−' ? -0.2 : 0.2), E.top + 0.05, 0], cam);
      out.push({ x: p.x, y: p.y, node: pill(sym, P.ink, 40), a: prog(t, T_POUR0 - 1.2, 0.4) * (1 - prog(t, END_AT, 0.3)) });
    }
  }
  return <>{out.map((o, i) => o.a > 0.01 && (
    <div key={i} style={{ position: 'absolute', left: o.x - 120, width: 240, top: o.y - 32, textAlign: 'center', opacity: o.a }}>{o.node}</div>
  ))}</>;
}

const END: EndLine[] = [
  { at: 0.2, size: 56, weight: 700, color: P.ink, text: END_LINES[0] },
  { at: 0.7, size: 48, weight: 700, color: P.green, text: END_LINES[1] },
  { at: 1.1, size: 40, weight: 600, color: P.muted, text: END_LINES[2] },
];

export function PvChem010({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t), flash = cover ? 0 : flashAt(t), wash = cover ? 0 : washAt(t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={LABEL} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={330} brand={BRAND} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
          {wash > 0.005 && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${SMOKE}, ${tint(SMOKE, 0.85)})`, opacity: wash }} />}
        </div>
        <Labels t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {flash > 0.005 && <AbsoluteFill style={{ background: '#fff7dc', opacity: flash }} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-010-salt-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}

