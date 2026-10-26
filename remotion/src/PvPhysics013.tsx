// @pyqvault_ · Physics, visualised #13 ("You'd think" + Shock): lightning hits your car. What saves you? The metal body.
// The first Shock opening (F25, founder 2026-10-23): on frame 0 the leader is already zig-zagging down through the rain;
// at 0.2 s it strikes the roof: three return strokes, a white flash over everything, sparks, the camera shakes. Then the
// charge streams over the outside of the steel shell and arcs to the road right past the tyres; a punch-in on the cabin
// shows the crash-test dummy untouched, E = 0. Second hook (F26): "Is a convertible safe?": the roof folds away, a second
// bolt strikes into the open cabin and its path runs through the seat. Then field lines end on the metal, none inside. It
// loops into frame 0 (F27). Dark board, real glow (Bloom), steel from REAL (F24). Lib and beat table: lib/pp013.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LAB as P, VIVID, REAL, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, CAPTIONS, CHIPS_RESET, COVER_T, BAND, CAR, BOLT, BOLT2, BRANCHES, SKIN, DANGER,
  T_SECOND, T_FIELD, LOOP_AT, DUMMY_HEAD, ROOF_HIT, CABIN_HIT, leaderAt, boltGlow, leader2At, bolt2Glow, strokeLight, stroke2Light, flashAt, sparksAt,
  chargeAt, arcsAt, arcPath, roofOpen, dangerAlpha, fieldLines, fieldAlpha, rainAt, cameraAt, project, type V3,
} from './lib/pp013.ts';
import { Board, Caption, PredictHeader, Theme, useFonts } from './board.tsx';
import { RoundBox, softEdges } from './shapes.tsx';
import { BloomWarmUp } from './induction3d.tsx';

const V = VIVID.lab, STEEL = REAL.lab.steel;
const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const BOLT_C = '#d9d0ff', TYRE = '#16181d', RIM = '#c9d0d8', GLASS = '#1c2a3a', ROAD = '#1b2029', VERGE = '#121a16';
/** A colour pushed above 1 so Bloom makes it glow (toneMapped off). */
const hot = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const tube = (pts: V3[], r: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0), Math.max(8, pts.length * 3), r, 6, false);
const poly = (pts: V3[], r: number) => {          // straight segments (a bolt's kinks stay sharp)
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i - 1]), new THREE.Vector3(...pts[i])));
  return new THREE.TubeGeometry(path, pts.length * 2, r, 6, false);
};

/** Storm light: realism.tsx's room reflections (so steel looks like steel), but a dim moon for a key light that the
    flash lifts. (RealLight's own key-light prop is named `key`, which React keeps for itself, so it can't be dimmed.) */
function StormLight({ env, moon }: { env: number; moon: number }) {
  const { gl, scene } = useThree();
  const room = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = env;
  return <directionalLight position={[-6, 10, 6]} intensity={moon} color="#c9d4ff" />;
}

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 0.1; cam.far = 80;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A bolt: the drawn part of its channel, a hot core and a wide soft glow, plus its branches. */
function Bolt({ pts, branches, drawn, glow }: { pts: V3[]; branches: V3[][]; drawn: number; glow: number }) {
  if (glow <= 0.01 || drawn <= 0) return null;
  const n = Math.max(2, Math.ceil(pts.length * drawn)), part = pts.slice(0, n);
  return (
    <group>
      <mesh geometry={poly(part, 0.03)}><meshBasicMaterial color={hot(BOLT_C, 1 + 5 * glow)} toneMapped={false} transparent opacity={Math.min(1, 0.4 + glow)} /></mesh>
      <mesh geometry={poly(part, 0.11)}><meshBasicMaterial color={hot(BOLT_C, 1.2)} toneMapped={false} transparent opacity={0.22 * glow} depthWrite={false} /></mesh>
      {drawn >= 1 && branches.map((b, i) => (
        <mesh key={i} geometry={poly(b, 0.015)}><meshBasicMaterial color={hot(BOLT_C, 1 + 3 * glow)} toneMapped={false} transparent opacity={0.8 * glow} /></mesh>
      ))}
    </group>
  );
}

function Road() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial color={VERGE} roughness={1} /></mesh>
      {/* wet asphalt: low roughness, so the flash and the bolt reflect in it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[40, 4.2]} /><meshStandardMaterial color={ROAD} roughness={0.22} metalness={0.35} /></mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-18 + i * 4, 0.004, -1.6]}><RoundBox size={[1.8, 0.008, 0.1]} radius={0.003} /><meshBasicMaterial color="#8d939c" /></mesh>
      ))}
    </group>
  );
}

function Car({ open }: { open: number }) {
  const { body: b, cabin: c, wheel: w } = CAR;
  const steel = <meshStandardMaterial color={STEEL.fill} metalness={0.75} roughness={0.28} envMapIntensity={1.1} />;
  // The roof folds back about the cabin's rear foot and shrinks into the boot.
  const fold = open * (Math.PI * 0.55), shrink = 1 - 0.85 * open;
  return (
    <group>
      <mesh position={[0, (b.y0 + b.y1) / 2, 0]}><RoundBox size={[b.x1 - b.x0, b.y1 - b.y0, 2 * b.zh]} radius={0.2} />{steel}</mesh>
      {/* the cabin well and the seats, seen through the glass and once the roof is gone */}
      <mesh position={[(c.x0 + c.x1) / 2, b.y1 + 0.005, 0]}><RoundBox size={[c.x1 - c.x0 - 0.1, 0.01, 2 * c.zh - 0.1]} radius={0.004} /><meshStandardMaterial color="#0d1118" roughness={0.9} /></mesh>
      {[-0.3, 0.3].map(z => <mesh key={z} position={[-0.18, 1.2, z]}><RoundBox size={[0.14, 0.42, 0.42]} radius={0.06} /><meshStandardMaterial color="#2a303b" roughness={0.8} /></mesh>)}
      <group position={[c.x0, c.y0, 0]} rotation={[0, 0, fold]} scale={[shrink, shrink, 1]}>
        <group position={[-c.x0, -c.y0, 0]}>
          {/* roof panel and four pillars in steel; tinted glass between them */}
          <mesh position={[(c.x0 + c.x1) / 2 - 0.05, c.y1 - 0.04, 0]}><RoundBox size={[c.x1 - c.x0 - 0.35, 0.08, 2 * c.zh]} radius={0.04} />{steel}</mesh>
          {[[c.x1 - 0.12, 0.4], [c.x0 + 0.1, -0.2]].map(([x, lean]) => [-1, 1].map(s => (
            <mesh key={`${x}${s}`} position={[x, (c.y0 + c.y1) / 2, s * (c.zh - 0.04)]} rotation={[0, 0, lean]}><RoundBox size={[0.09, c.y1 - c.y0 + 0.04, 0.08]} radius={0.035} />{steel}</mesh>
          )))}
          <mesh position={[(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, 0]}><RoundBox size={[c.x1 - c.x0 - 0.12, c.y1 - c.y0 - 0.06, 2 * c.zh - 0.04]} radius={0.12} />
            <meshPhysicalMaterial color={GLASS} roughness={0.08} metalness={0.1} transparent opacity={0.42} depthWrite={false} /></mesh>
        </group>
      </group>
      {[-1, 1].map(sx => [-1, 1].map(sz => (
        <group key={`${sx}${sz}`} position={[sx * w.x, w.y, sz * w.z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh><cylinderGeometry args={[w.r, w.r, w.w, 32]} /><meshStandardMaterial color={TYRE} roughness={0.85} /></mesh>
          <mesh position={[0, sz * (w.w / 2 + 0.005), 0]}><cylinderGeometry args={[w.r * 0.58, w.r * 0.58, 0.02, 24]} /><meshStandardMaterial color={RIM} metalness={0.8} roughness={0.3} /></mesh>
        </group>
      )))}
      {[-0.6, 0.6].map(z => <mesh key={z} position={[b.x1 - 0.02, 0.78, z]}><sphereGeometry args={[0.09, 14, 14]} /><meshBasicMaterial color={hot('#fff3d0', 1.6)} toneMapped={false} /></mesh>)}
      {[-0.65, 0.65].map(z => <mesh key={`r${z}`} position={[b.x0 + 0.02, 0.8, z]}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color={hot('#ff3b3b', 1.3)} toneMapped={false} /></mesh>)}
    </group>
  );
}

/** A crash-test dummy in the driver's seat: yellow, with the black-and-yellow target on its head. */
function Dummy() {
  const yellow = <meshStandardMaterial color={V.yellow} roughness={0.45} />;
  return (
    <group>
      <mesh position={[DUMMY_HEAD[0], 1.13, DUMMY_HEAD[2]]}><RoundBox size={[0.26, 0.34, 0.3]} radius={0.1} />{yellow}</mesh>
      <mesh position={DUMMY_HEAD}><sphereGeometry args={[0.12, 24, 24]} />{yellow}</mesh>
      <mesh position={[DUMMY_HEAD[0], DUMMY_HEAD[1], DUMMY_HEAD[2] + 0.115]}><circleGeometry args={[0.05, 20, 0, Math.PI / 2]} /><meshBasicMaterial color="#111111" /></mesh>
      <mesh position={[DUMMY_HEAD[0], DUMMY_HEAD[1], DUMMY_HEAD[2] + 0.115]} rotation={[0, 0, Math.PI]}><circleGeometry args={[0.05, 20, 0, Math.PI / 2]} /><meshBasicMaterial color="#111111" /></mesh>
    </group>
  );
}

function Rain({ t }: { t: number }) {
  return (
    <group>
      {rainAt(t).map((p, i) => (
        <mesh key={i} position={p}><cylinderGeometry args={[0.007, 0.007, 0.38, 4]} /><meshBasicMaterial color="#9fb3cc" transparent opacity={0.42} depthWrite={false} /></mesh>
      ))}
    </group>
  );
}

function Scene({ t }: { t: number }) {
  const g1 = boltGlow(t), g2 = bolt2Glow(t), flash = flashAt(t), open = roofOpen(t), fa = fieldAlpha(t), da = dangerAlpha(t);
  const charge = chargeAt(t), arcs = arcsAt(t), skinA = charge.length ? charge[0].alpha : 0;
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[P.board]} />
      <fog attach="fog" args={[P.board, 14, 40]} />
      <StormLight env={0.22 + 2.4 * flash} moon={0.35 + 3 * flash} />
      <hemisphereLight args={['#8fa0c8', '#0b0e14', 0.25 + 2.2 * flash]} />
      {strokeLight(t) > 0.02 && <pointLight position={[ROOF_HIT[0], ROOF_HIT[1] + 0.6, ROOF_HIT[2]]} intensity={30 * strokeLight(t)} distance={12} color={BOLT_C} />}
      {stroke2Light(t) > 0.02 && <pointLight position={[CABIN_HIT[0], CABIN_HIT[1] + 0.6, CABIN_HIT[2]]} intensity={30 * stroke2Light(t)} distance={12} color={BOLT_C} />}
      <Road />
      <Car open={open} />
      <Dummy />
      <Bolt pts={BOLT} branches={BRANCHES[0]} drawn={leaderAt(t)} glow={g1} />
      <Bolt pts={BOLT2} branches={BRANCHES[1]} drawn={leader2At(t)} glow={g2} />
      {sparksAt(t).map((s, i) => (
        <mesh key={`s${i}`} position={s.pos}><sphereGeometry args={[0.022, 6, 6]} /><meshBasicMaterial color={hot(REAL.lab.flame.edge, 2.5)} toneMapped={false} transparent opacity={s.alpha} /></mesh>
      ))}
      {/* the charge's route over the shell, faint, and the charge itself streaming down it */}
      {skinA > 0 && SKIN.map((p, i) => (
        <mesh key={`k${i}`} geometry={poly(p.map(q => [q[0], q[1] + 0.015, q[2] + Math.sign(q[2]) * 0.015] as V3), 0.012)}>
          <meshBasicMaterial color={hot(V.cyan, 1.4)} toneMapped={false} transparent opacity={0.35 * skinA} depthWrite={false} /></mesh>
      ))}
      {charge.map((d, i) => (
        <mesh key={`c${i}`} position={[d.pos[0], d.pos[1] + 0.03, d.pos[2] + Math.sign(d.pos[2]) * 0.03]}><sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color={hot(V.cyan, 3)} toneMapped={false} transparent opacity={d.alpha} /></mesh>
      ))}
      {arcs.map((a, i) => (
        <mesh key={`a${i}`} geometry={poly(arcPath(a), 0.016)}><meshBasicMaterial color={hot('#bff6ff', 3.2)} toneMapped={false} transparent opacity={a.alpha} /></mesh>
      ))}
      {/* drawn over the dummy and the body like an X-ray, so the path through the cabin is seen */}
      {da > 0.01 && <mesh geometry={poly(DANGER, 0.045)} renderOrder={10}><meshBasicMaterial color={hot(V.red, 2.4 + 0.8 * Math.sin(t * 40))} toneMapped={false} transparent opacity={da} depthTest={false} /></mesh>}
      {fa > 0.01 && fieldLines().map((l, i) => (
        <group key={`f${i}`}>
          <mesh geometry={tube(l, 0.012)}><meshBasicMaterial color="#9fb6ff" transparent opacity={0.55 * fa} depthWrite={false} /></mesh>
          <mesh position={l[5]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.05, 0.14, 10]} /><meshBasicMaterial color="#9fb6ff" transparent opacity={0.7 * fa} /></mesh>
        </group>
      ))}
      <Rain t={t} />
      <EffectComposer multisampling={4}><Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.2} radius={0.65} /></EffectComposer>
      <BloomWarmUp />
    </>
  );
}

/** "E = 0" over the cabin while the punch-in shows it, and again with the field lines. */
function Labels({ t }: { t: number }) {
  const a = Math.max(prog(t, ANSWER_AT - 0.1, 0.3) * (1 - prog(t, T_SECOND + 0.1, 0.3)), prog(t, T_FIELD + 0.6, 0.4) * (1 - prog(t, LOOP_AT, 0.5)));
  if (a <= 0.01) return null;
  const p = project([DUMMY_HEAD[0], DUMMY_HEAD[1] + 0.05, 0] as V3, cameraAt(t));
  return (
    <div style={{ position: 'absolute', left: p.x - 140, width: 280, top: p.y - 150, textAlign: 'center', opacity: a }}>
      <span style={{ display: 'inline-block', padding: '8px 22px', borderRadius: 999, background: 'rgba(18,24,34,0.82)', font: `700 46px ${SOFT_UI}`, color: P.ink, fontVariantNumeric: 'tabular-nums' }}>E = 0</span>
    </div>
  );
}

export function PvPhysics013({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t), flash = cover ? 0 : flashAt(t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #13'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={300}
          brand={BRAND} until={CHIPS_RESET} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.08, left: 0.03, right: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        </div>
        <Labels t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {flash > 0.005 && <AbsoluteFill style={{ background: '#f4f1ff', opacity: flash }} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-013-lightning-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
