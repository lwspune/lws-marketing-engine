// @lws.pune · defence story 001 "ONE DAY" (3D): a pre-dawn orbit round Sudan Block (our own model, from public photos:
// a long basalt block with red bands and a red roof edge, a taller central bay with arches, a drum, a ribbed red dome,
// two small corner domes); the camera drops behind a student at the closed iron gate; the sun clears the dome and its
// light reaches him; looking down, his shadow on the red path becomes a cadet's (cap, rifle at the slope); the gate opens
// and he walks in; the camera rises to the dome. His shadow is drawn (a texture of rounded strokes, lib/story001.ts), so
// it can change; everything else's shadow is real (the sun's shadow map). Timeline: lib/story001.ts.
import { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TEXT_FONT } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import { useFonts } from './board.tsx';
import { RoundBox } from './shapes.tsx';
import {
  COVER_T, COVER_TITLE, SUN_UP, PATH_W, GATE_Z, GATE_HALF, GATE_H, SIL_H,
  CAPTIONS, TITLE, cameraAt, project, sunDir, sunlight, dawnAt, shadowLength, morphAt,
  silhouetteAt, studentZAt, strideAt, headLiftAt, gateAngleAt, titleAlpha, type V3,
} from './lib/story001.ts';
import { COL, SEED, rng, SudanBlock, Palm } from './sudanBlock.tsx';

// ---- the grounds ------------------------------------------------------------------------------------------------------
/** Red brick pavers (22 × 11 cm) in a running bond with soft grout, a little variation brick to brick. */
function pavers() {
  const c = document.createElement('canvas'); c.width = 384; c.height = 256;
  const g = c.getContext('2d')!, r = rng(SEED + 9), bw = 32, bh = 16;
  g.fillStyle = '#9a5843'; g.fillRect(0, 0, c.width, c.height);
  for (let row = 0; row * bh < c.height; row++) for (let x = (row % 2) * -bw / 2; x < c.width; x += bw) {
    const v = 0.9 + 0.2 * r(); g.fillStyle = `rgb(${Math.round(163 * v)}, ${Math.round(75 * v)}, ${Math.round(54 * v)})`;
    g.fillRect(x + 1, row * bh + 1, bw - 2, bh - 2);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(PATH_W / (12 * 0.22), 144 / (16 * 0.11)); t.anisotropy = 16;
  return t;
}
function Grounds() {
  const paths = useMemo(pavers, []);
  const palms = useMemo(() => {
    const out: { at: V3; h: number; lean: number; seed: number }[] = [];
    for (let z = 18; z <= 112; z += 13) for (const s of [-1, 1]) out.push({ at: [s * 11, 0, z], h: 11 + ((z * 7) % 3), lean: s * 0.03, seed: z * 3 + s });
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) out.push({ at: [s * (60 + 4 * k), 0, 6 + 5 * (k % 3)], h: 13 + (k % 3), lean: s * 0.05, seed: 100 + k * 2 + s });
    return out;
  }, []);
  const hedges = useMemo(() => {
    const out: V3[] = [];
    for (let z = 6; z < 116; z += 9) for (const s of [-1, 1]) out.push([s * (PATH_W / 2 + 1.2), 0.4, z + 3.5]);
    return out;
  }, []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 40]} receiveShadow><planeGeometry args={[8000, 8000]} /><meshStandardMaterial color={COL.field} roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 62]} receiveShadow><planeGeometry args={[90, 124]} /><meshStandardMaterial color={COL.lawn} roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 72]} receiveShadow><planeGeometry args={[PATH_W, 144]} /><meshStandardMaterial map={paths} roughness={0.95} /></mesh>
    {hedges.map((p, i) => <mesh key={i} position={p} castShadow receiveShadow><boxGeometry args={[0.8, 0.8, 7]} /><meshStandardMaterial color={COL.hedge} roughness={1} /></mesh>)}
    {palms.map((p, i) => <Palm key={i} {...p} />)}
  </group>;
}
function Gate({ angle }: { angle: number }) {
  const leaf = (side: -1 | 1) => (
    <group position={[side * GATE_HALF, 0, GATE_Z]} rotation={[0, side === -1 ? angle : -angle, 0]}>
      {Array.from({ length: 15 }, (_, k) => {
        const x = -side * (0.07 + (k * (GATE_HALF - 0.14)) / 14);
        return <group key={k}>
          <mesh position={[x, GATE_H / 2, 0]}><cylinderGeometry args={[0.02, 0.02, GATE_H, 6]} /><meshStandardMaterial color={COL.iron} metalness={0.5} roughness={0.5} /></mesh>
          <mesh position={[x, GATE_H + 0.08, 0]}><coneGeometry args={[0.04, 0.16, 6]} /><meshStandardMaterial color={COL.gold} metalness={0.6} roughness={0.4} /></mesh>
        </group>;
      })}
      {[0.25, 1.2, 2.2].map(y => <mesh key={y} position={[-side * GATE_HALF / 2, y, 0]}><boxGeometry args={[GATE_HALF, 0.05, 0.04]} /><meshStandardMaterial color={COL.iron} metalness={0.5} roughness={0.5} /></mesh>)}
    </group>
  );
  // The bars and pillars cast no shadow: on the path they would stripe across his or read as a hole (the low wall still does).
  return <group>
    {leaf(-1)}{leaf(1)}
    {[-1, 1].map(s => <group key={s}>
      <mesh position={[s * (GATE_HALF + 0.45), 1.6, GATE_Z]} receiveShadow><boxGeometry args={[0.8, 3.2, 0.8]} /><meshStandardMaterial color={COL.stone} roughness={0.95} /></mesh>
      <mesh position={[s * (GATE_HALF + 0.45), 3.3, GATE_Z]}><boxGeometry args={[1, 0.25, 1]} /><meshStandardMaterial color={COL.red} /></mesh>
      <mesh position={[s * 24, 0.35, GATE_Z]} castShadow receiveShadow><boxGeometry args={[42, 0.7, 0.5]} /><meshStandardMaterial color={COL.stone} roughness={0.95} /></mesh>
      {Array.from({ length: 70 }, (_, k) => <mesh key={k} position={[s * (3.4 + 0.6 * k), 1.2, GATE_Z]}><cylinderGeometry args={[0.018, 0.018, 1.0, 5]} /><meshStandardMaterial color={COL.iron} /></mesh>)}
    </group>)}
  </group>;
}

// ---- the student (seen only from behind) ------------------------------------------------------------------------------
function Student({ t }: { t: number }) {
  const z = studentZAt(t), { swing, bob } = strideAt(t), lift = headLiftAt(t);
  const skin = '#7d5238', shirt = '#2d5fb8', jeans = '#2a2a33';   // a royal-blue top: apart from the grey stone and the red path
  const limb = (len: number, r: number, color: string) => <mesh position={[0, -len / 2, 0]}><capsuleGeometry args={[r, len - 2 * r, 6, 12]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>;
  return <group position={[0, bob, z]}>
    {[-1, 1].map(s => <group key={s} position={[s * 0.1, 0.92, 0]} rotation={[s * swing, 0, 0]}>
      {limb(0.86, 0.075, jeans)}
      <mesh position={[0, -0.88, -0.05]}><boxGeometry args={[0.11, 0.08, 0.27]} /><meshStandardMaterial color="#ececec" roughness={0.7} /></mesh>
    </group>)}
    <mesh position={[0, 1.18, 0]}><capsuleGeometry args={[0.17, 0.36, 8, 16]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
    <mesh position={[0, 1.42, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.075, 0.3, 6, 12]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
    {[-1, 1].map(s => <group key={s} position={[s * 0.22, 1.4, 0]} rotation={[-s * swing * 0.8, 0, s * 0.08]}>{limb(0.58, 0.05, shirt)}
      <mesh position={[0, -0.62, 0]}><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh></group>)}
    <mesh position={[0, 1.52, 0]}><cylinderGeometry args={[0.045, 0.05, 0.1, 10]} /><meshStandardMaterial color={skin} /></mesh>
    <group position={[0, 1.58, 0]} rotation={[lift, 0, 0]}>
      <mesh position={[0, 0.08, 0]} scale={[0.95, 1.1, 1]}><sphereGeometry args={[0.1, 20, 16]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
      <mesh position={[0, 0.12, 0.012]} scale={[1, 0.95, 1.02]}><sphereGeometry args={[0.105, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial color="#120f0e" roughness={0.7} /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[s * 0.095, 0.07, 0]}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color={skin} /></mesh>)}
    </group>
    {/* the bag, on his right shoulder, its strap over it */}
    <mesh position={[0.17, 1.13, 0.16]} rotation={[0.08, 0, -0.08]}><RoundBox size={[0.27, 0.38, 0.15]} radius={0.05} /><meshStandardMaterial color="#6b7148" roughness={0.9} /></mesh>
    <mesh position={[0.18, 1.38, 0.02]} rotation={[0.9, 0, 0]}><boxGeometry args={[0.05, 0.3, 0.02]} /><meshStandardMaterial color="#2b2f22" /></mesh>
  </group>;
}

// ---- his shadow: rounded strokes drawn on a canvas, laid on the path towards the camera -------------------------------
const SHADOW_W = 1.4, CW = 420, CH = 615;
function ShadowOfHim({ t }: { t: number }) {
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = CW; canvas.height = CH;
    return { canvas, tex: new THREE.CanvasTexture(canvas) };
  }, []);
  const g = canvas.getContext('2d')!, sil = silhouetteAt(morphAt(t)), sx = CW / SHADOW_W, sy = CH / SIL_H;
  g.clearRect(0, 0, CW, CH); g.filter = 'blur(3px)'; g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineCap = 'round';
  for (const p of sil.parts) {
    if (p.r < 0.004) continue;
    g.lineWidth = 2 * p.r * sx; g.beginPath();
    g.moveTo(CW / 2 + p.a[0] * sx, p.a[1] * sy); g.lineTo(CW / 2 + p.b[0] * sx + 0.01, p.b[1] * sy); g.stroke();
  }
  tex.needsUpdate = true;
  const z = studentZAt(t), len = shadowLength(t), a = 0.82 * sunlight(t);
  if (a < 0.01) return null;
  // canvas top (h = 0) at his feet, the far end (h = SIL_H) towards the camera
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z + len / 2]} renderOrder={2}>
    <planeGeometry args={[SHADOW_W, len]} />
    <meshBasicMaterial color="#1c1630" alphaMap={tex} transparent opacity={a} depthWrite={false} />
  </mesh>;
}

// ---- sky, light, camera -----------------------------------------------------------------------------------------------
const SKY_VERT = `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = `uniform vec3 uSun; uniform float uDawn; uniform float uDisc; varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir); float el = max(d.y, 0.0), toSun = max(dot(d, normalize(vec3(0.0, 0.05, -1.0))), 0.0);
  vec3 zen = mix(vec3(0.07, 0.09, 0.24), vec3(0.22, 0.38, 0.66), uDawn);
  vec3 hor = mix(vec3(0.62, 0.42, 0.42), vec3(1.0, 0.66, 0.38), uDawn);
  vec3 c = mix(hor, zen, pow(el, 0.45));
  c += vec3(1.0, 0.6, 0.28) * pow(toSun, 10.0) * (0.2 + 0.3 * uDawn) * (1.0 - el);
  float s = max(dot(d, uSun), 0.0);
  c += vec3(1.0, 0.68, 0.32) * pow(s, 40.0) * 0.8 * uDisc + vec3(1.0, 0.8, 0.42) * smoothstep(0.99895, 0.99925, s) * 1.6 * uDisc;
  if (d.y < 0.0) c = mix(hor, vec3(0.2, 0.2, 0.18), clamp(-d.y * 4.0, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;
function Sky({ t }: { t: number }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false,
    uniforms: { uSun: { value: new THREE.Vector3() }, uDawn: { value: 0 }, uDisc: { value: 0 } } }), []);
  mat.uniforms.uSun.value.set(...sunDir(t)); mat.uniforms.uDawn.value = dawnAt(t); mat.uniforms.uDisc.value = sunlight(t);
  return <mesh material={mat} renderOrder={-1} frustumCulled={false}><sphereGeometry args={[3000, 48, 24]} /></mesh>;
}
function Light({ t }: { t: number }) {
  const { gl, scene } = useThree(), d = sunDir(t), dawn = dawnAt(t), sun = sunlight(t);
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.65 - 0.5 * sun;   // lifted before sunrise so frame 0 reads gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(0, 0, 70); return o; }, []);
  if (!scene.children.includes(target)) scene.add(target);
  const at: V3 = [d[0] * 300, d[1] * 300, 70 + d[2] * 300];
  // haze: the far ground melts into the horizon's colour, so the world has no edge (both pass-1 critics)
  const haze = new THREE.Color('#6f5468').lerp(new THREE.Color('#e0a47a'), dawn);
  if (!(scene.fog instanceof THREE.Fog)) scene.fog = new THREE.Fog(haze, 260, 1400);
  (scene.fog as THREE.Fog).color.copy(haze);
  return <>
    <hemisphereLight args={['#a9bbec', '#3a3326', 0.95 + 0.55 * dawn]} />
    <directionalLight position={[20, 60, 160]} intensity={(0.7 + 0.4 * dawn) * (1 - 0.6 * sun)} color="#c9d4f2" />
    {/* once the sun is up, warm light on the faces we see (the morning glow off the sky): the ending stays sunlit */}
    <directionalLight position={[-30, 70, 260]} intensity={1.5 * sun} color="#ffb47a" />
    <directionalLight position={at} target={target} intensity={3.4 * sun} color="#ffd9a6" castShadow
      shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.04}
      shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={95} shadow-camera-bottom={-95} shadow-camera-near={10} shadow-camera-far={700} />
  </>;
}
function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect; cam.near = 0.1; cam.far = 5000;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}
function Scene({ t }: { t: number }) {
  const glow = 0.9 * (1 - 0.75 * prog(t, SUN_UP - 0.4, 1.2));
  return <>
    <CameraRig t={t} />
    <Sky t={t} />
    <Light t={t} />
    <SudanBlock glow={glow} />
    <Grounds />
    <Gate angle={gateAngleAt(t)} />
    <Student t={t} />
    <ShadowOfHim t={t} />
  </>;
}

// ---- words and the sun's flare (HTML over the 3D) ---------------------------------------------------------------------
function Flare({ t }: { t: number }) {
  const cam = cameraAt(t), d = sunDir(t), p = project([cam.position[0] + d[0] * 2000, cam.position[1] + d[1] * 2000, cam.position[2] + d[2] * 2000], cam);
  const flash = prog(t, SUN_UP - 0.05, 0.1) * (1 - prog(t, SUN_UP + 0.1, 1.0)), a = sunlight(t) * (p.depth > 0 ? 1 : 0);
  if (a < 0.01 && flash < 0.01) return null;
  return <>
    {a > 0.01 && <>
      <div style={{ position: 'absolute', left: p.x - 700, top: p.y - 700, width: 1400, height: 1400, borderRadius: '50%', opacity: (0.22 + 0.4 * flash) * a, mixBlendMode: 'screen',
        background: 'repeating-conic-gradient(from 0deg, rgba(255,200,120,0.55) 0deg 4deg, rgba(255,200,120,0) 4deg 15deg)',
        WebkitMaskImage: 'radial-gradient(circle, #000 8%, rgba(0,0,0,0.5) 30%, transparent 65%)', transform: `rotate(${(t - SUN_UP) * 6}deg)` }} />
      <div style={{ position: 'absolute', left: p.x - 320, top: p.y - 320, width: 640, height: 640, borderRadius: '50%', opacity: 0.45 * a, mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,226,160,0.95) 0%, rgba(255,180,90,0.5) 16%, rgba(255,140,60,0.14) 42%, rgba(255,140,60,0) 70%)' }} />
    </>}
    <AbsoluteFill style={{ background: 'rgba(255,190,110,1)', opacity: 0.22 * flash, mixBlendMode: 'screen' }} />
  </>;
}
function Title({ t, force }: { t: number; force: boolean }) {
  const a = force ? 1 : Math.min(1, titleAlpha(t));
  if (a < 0.01) return null;
  if (force) return <div style={{ position: 'absolute', left: 0, width: 1080, top: COVER_TITLE.y0, height: COVER_TITLE.y1 - COVER_TITLE.y0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', font: `700 ${COVER_TITLE.size}px ${TEXT_FONT}`, letterSpacing: '0.14em', color: '#fffaf0', paddingLeft: '0.14em',
    textShadow: '0 0 10px rgba(20,12,30,0.9), 0 0 36px rgba(20,12,30,0.7), 0 4px 16px rgba(20,12,30,0.7)' }}>{TITLE.text}</div>;
  // a soft dark band behind it, so it reads on the bright sunrise sky too
  return <>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: TITLE.y1 + 160, opacity: a,
      background: 'linear-gradient(rgba(12,10,30,0.55) 0%, rgba(12,10,30,0.42) 55%, rgba(12,10,30,0) 100%)' }} />
    <div style={{ position: 'absolute', left: 0, width: 1080, top: TITLE.y0, height: TITLE.y1 - TITLE.y0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', opacity: a, font: `700 ${TITLE.size}px ${TEXT_FONT}`, letterSpacing: '0.14em', color: '#fffaf0', paddingLeft: '0.14em',
      textShadow: '0 0 10px rgba(20,12,30,0.85), 0 0 34px rgba(20,12,30,0.6), 0 4px 16px rgba(20,12,30,0.6)' }}>{TITLE.text}</div>
  </>;
}
function Line({ t }: { t: number }) {
  const cap = captionAt(CAPTIONS, t);
  if (!cap) return null;
  const size = cap.caption.size ?? 60, y = cap.caption.y ?? 330;
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: y - size, height: 2 * size, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cap.alpha }}>
    <div style={{ font: `600 ${size}px ${TEXT_FONT}`, color: '#fffaf0', background: 'rgba(12,14,32,0.86)', borderRadius: 999, padding: `${size * 0.18}px ${size * 0.5}px`,
      transform: `translateY(${(1 - Math.min(1, cap.age / 0.25)) * 12}px)` }}>{cap.caption.text}</div>
  </div>;
}

function useBoldTitle() {
  const [handle] = useState(() => delayRender('title font'));
  useEffect(() => { document.fonts.load(`700 ${TITLE.size}px Cambria`).then(() => continueRender(handle)); }, [handle]);
}

export function Story001({ cover = false }: { cover?: boolean }) {
  useFonts(); useBoldTitle();
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = cover ? COVER_T : frame / fps;
  return (
    <AbsoluteFill style={{ background: '#0d1022' }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true }}>
        <Scene t={t} />
      </ThreeCanvas>
      <Flare t={t} />
      <Title t={t} force={cover} />
      {!cover && <Line t={t} />}
      {!cover && <Html5Audio src={staticFile('nda-story-001-one-day-mix.wav')} />}
    </AbsoluteFill>
  );
}
