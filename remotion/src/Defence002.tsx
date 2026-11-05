// @lws.pune · Defence #2 (3D showcase, F4 v1.17): 4 fighter jets of the Indian Air Force. Tejas, Mirage 2000, Su-30MKI and
// Rafale in a diamond above the clouds, part-lit, under the promise and four numbered dots; the camera turns once round them,
// then visits each: it lights up, a ring shows the part that tells it apart, then one sourced line. The Rafale rolls; the
// camera swoops below and all four fly over. Our own simplified models, not to scale: no roundels, no squadron badges, no
// tail numbers (storyboard § 8). Timeline: lib/defence002.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  DURATION, COVER_T, END_AT, HEADER, JETS, VISITS, BAND, CAPTIONS, END_LINES, END_PANEL, COVER_CAPTION, PILL, PILL_H, TAG, RING_COLOR,
  SILHOUETTE, ROLL, cameraAt, jetPose, litAt, tagAt, ringAt, pillAt, dotState, clouds, type JetSpec,
} from './lib/defence002.ts';
import { Board, Caption, Theme, TourHeader, useFonts } from './board.tsx';
import { softEdges } from './shapes.tsx';

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 0.5; cam.far = 4000;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

/** High sun, a sky-blue fill from above, a room environment so the canopies and the grey paint catch the light. */
function Light({ t }: { t: number }) {
  const { gl, scene } = useThree();
  const room = useMemo(() => { const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return tex; }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = 0.5;
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  const c = cameraAt(t).target;
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(...c);
  if (!scene.children.includes(target)) scene.add(target);
  return <>
    <hemisphereLight args={['#cfe3ff', '#a9bccf', 1.25]} />
    {/* light off the clouds onto the undersides, so the fly-over keeps the jets' grey (panel, Colour) */}
    <directionalLight position={[c[0] + 120, c[1] - 400, c[2] + 200]} target={target} intensity={0.9} color="#e8eef6" />
    <directionalLight position={[c[0] - 200, c[1] + 500, c[2] + 150]} target={target} intensity={2.6} color="#fff6e8" />
  </>;
}

// ---- the jets, built from their outlines ----------------------------------------------------------------------------------
/** A half-planform ([x, z] points, x ≥ 0) as a thin plate, both sides. */
function plate(half: [number, number][], thick = 0.22) {
  const make = (s: number) => {
    const sh = new THREE.Shape();
    half.forEach(([x, z], i) => (i ? sh.lineTo(s * x, -z) : sh.moveTo(s * x, -z)));
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, -thick / 2, 0);
    return g;
  };
  return [make(1), make(-1)];
}
function finGeo(f: JetSpec['fins'][number]) {
  const sh = new THREE.Shape();
  sh.moveTo(-f.z0, 0); sh.lineTo(-f.z1, 0); sh.lineTo(-f.top1, f.h); sh.lineTo(-f.top0, f.h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: false });
  g.rotateY(Math.PI / 2); g.translate(f.x, 0, 0); g.rotateZ(-f.cant);
  return g;
}
function Jet({ i, t }: { i: number; t: number }) {
  const j = JETS[i], pose = jetPose(i, t), lit = litAt(i, t);
  const parts = useMemo(() => ({
    wing: plate(j.wing), canard: j.canard ? plate(j.canard, 0.14) : [], tail: j.tailplane ? plate(j.tailplane, 0.16) : [], fins: j.fins.map(finGeo),
  }), [j]);
  const paint = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.25 }), []);
  paint.color.set(SILHOUETTE).lerp(new THREE.Color(j.lit), lit);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1d2b3c', roughness: 0.08, metalness: 0.6 }), []);
  // nozzles glow as the jet lights, and hot through the Rafale's roll
  const hot = 0.4 * lit + (i === JETS.length - 1 ? 2.2 * Math.max(0, Math.sin(Math.PI * prog(t, ROLL.t0 - 0.2, ROLL.t1 - ROLL.t0 + 0.4))) : 0);
  const body = j.nose - j.tail - 3.2;
  return <group position={pose.pos} rotation={new THREE.Euler(pose.pitch, pose.yaw, pose.roll, 'YXZ')}>
    <mesh material={paint} position={[0, 0, (j.nose + j.tail) / 2 - 0.4]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[j.r, body, 6, 16]} /></mesh>
    <mesh material={paint} position={[0, 0, j.nose - 1.6]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[j.r * 0.95, 3.2, 16]} /></mesh>
    <mesh material={glass} position={[0, j.r * 0.75, j.nose - 4.2]} scale={[0.55, 0.45, 1.6]}><sphereGeometry args={[1, 16, 10]} /></mesh>
    {[...parts.wing, ...parts.canard, ...parts.tail].map((g, k) => <mesh key={k} geometry={g} material={paint} position={[0, k >= parts.wing.length && k < parts.wing.length + parts.canard.length ? 0.4 : 0, 0]} />)}
    {parts.fins.map((g, k) => <mesh key={`f${k}`} geometry={g} material={paint} />)}
    {j.nozzles.map((n, k) => <group key={`n${k}`} position={[n.x, 0, n.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.55, 0.62, 1.2, 14]} /><meshStandardMaterial color="#3a3f47" roughness={0.6} metalness={0.5} /></mesh>
      <mesh position={[0, 0, -0.62]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.45, 14]} /><meshStandardMaterial color="#ff8a2a" emissive="#ff6a00" emissiveIntensity={hot} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    </group>)}
  </group>;
}

/** Clouds far below: soft white puffs the formation streams over. */
function Clouds() {
  const puffs = useMemo(clouds, []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.92 }), puffs.length);
    const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    puffs.forEach((c, k) => { mm.compose(p.set(...c.p), q, sc.set(c.s, c.s * 0.55, c.s)); m.setMatrixAt(k, mm); });
    m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; return m;
  }, [puffs]);
  return <primitive object={mesh} />;
}

function Scene({ t }: { t: number }) {
  return <>
    <CameraRig t={t} />
    <Light t={t} />
    <Clouds />
    {JETS.map((_, i) => <Jet key={i} i={i} t={t} />)}
  </>;
}

// ---- words over the picture ----------------------------------------------------------------------------------------------
/** Number tags (matching the header's dots), in the opening only. */
function Tags({ t }: { t: number }) {
  return <>{JETS.map((_, i) => {
    const g = tagAt(i, t), d = 2 * TAG.r;
    if (g.alpha <= 0.01) return null;
    return <div key={i} style={{ position: 'absolute', left: g.x - TAG.r, top: g.y - TAG.r, width: d, height: d, borderRadius: '50%', opacity: g.alpha,
      transform: `scale(${g.pop})`, background: P.ink, border: '4px solid #fff', boxSizing: 'border-box', boxShadow: `0 6px 18px ${tint(P.ink, 0.35)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 30px ${SOFT_UI}`, color: '#fff' }}>{g.number}</div>;
  })}</>;
}
/** The ring on the part that tells the jet apart: a bright amber circle with a dark edge, pulsing. */
function Ring({ t }: { t: number }) {
  const r = ringAt(t);
  if (!r || r.alpha <= 0.01) return null;
  // a thick amber ring between two dark navy edges, so it reads on grey wings and white cloud alike (panel, Colour)
  return <div style={{ position: 'absolute', left: r.x - r.r, top: r.y - r.r, width: 2 * r.r, height: 2 * r.r, borderRadius: '50%', opacity: r.alpha,
    transform: `scale(${r.pop})`, border: `13px solid ${RING_COLOR}`, boxShadow: `0 0 0 5px ${P.ink}, inset 0 0 0 5px ${P.ink}, 0 0 18px 6px ${tint(P.ink, 0.45)}`, boxSizing: 'border-box' }} />;
}
function Pill({ t }: { t: number }) {
  const p = pillAt(t);
  if (!p) return null;
  const a = Math.min(prog(t, p.t0, 0.2), 1 - prog(t, p.t1 - 0.2, 0.2));
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: PILL.y - PILL_H / 2, height: PILL_H, display: 'flex', justifyContent: 'center', opacity: a }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 36px', height: PILL_H, borderRadius: PILL_H / 2, background: '#fff', boxShadow: `0 10px 30px ${tint(P.ink, 0.2)}`,
      font: `800 ${PILL.size}px ${SOFT_UI}`, color: P.ink }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, background: P.green }} />{p.text}
    </div>
  </div>;
}
function EndPanel({ t }: { t: number }) {
  const { fps } = useVideoConfig(), a = prog(t, END_AT, 0.4);
  if (a <= 0) return null;
  return <>
    <div style={{ position: 'absolute', left: 100, top: END_PANEL.top, width: 880, height: END_PANEL.height, borderRadius: 40, background: '#fff', opacity: a, boxShadow: `0 18px 50px ${tint(P.ink, 0.18)}` }} />
    {END_LINES.map(l => {
      const u = t - END_AT - l.at, s = spring({ frame: u * fps, fps, config: { damping: 16 } });
      if (u < 0) return null;
      return <div key={l.text} style={{ position: 'absolute', left: 0, width: 1080, top: l.y - l.size * 0.65, height: l.size * 1.3, display: 'flex', alignItems: 'center',
        justifyContent: 'center', opacity: Math.min(1, u / 0.3), transform: `translateY(${(1 - s) * 18}px)`,
        font: `${l.weight} ${l.size}px ${SOFT_UI}`, color: l.text.startsWith('Follow') ? P.green : P.ink }}>{l.text}</div>;
    })}
  </>;
}

export function Defence002({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        {!cover && <TourHeader t={t} label={'DEFENCE  ·  IAF JETS'} lines={HEADER} states={JETS.map((_, i) => dotState(i, t))} starts={VISITS.map(v => v.go)} />}
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.1, bottom: 0.1 }) }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #2f6fd6, #7fb4ea 55%, #d4e7f8)' }} />
          <ThreeCanvas width={BAND.width} height={BAND.height} gl={{ antialias: true, alpha: true }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        <Tags t={t} />
        {!cover && <Ring t={t} />}
        {!cover && <Pill t={t} />}
        {cover
          ? <Caption text={COVER_CAPTION.text} alpha={1} age={0} size={COVER_CAPTION.size} y={COVER_CAPTION.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} />}
        {!cover && <EndPanel t={t} />}
        {!cover && <Html5Audio src={staticFile('nda-defence-002-jets-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
export const DEFENCE002_DURATION = DURATION;
