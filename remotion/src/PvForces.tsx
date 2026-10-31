// @pyqvault_ · Physics, visualised #17 (framework v1.36, F40): every force on a crate on a slope, imitating
// @sciencevisualised's "Acting Forces on Object" shot for shot. The timeline, the maths and every text's place are in
// lib/pvForces.ts. A rounded crate on a 35° slab in the soft studio (F36), with one character of our own per force: the
// up-slope puller (F), the down-slope puller (friction f), the one holding it off the slope (N) and the one hanging under
// it (mg). Arrows and words are drawn flat over the scene from projected points.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI } from './lib/palette.ts';
import {
  ALONG, CENTRE, COMPONENTS, COVER_T, CRATE, FOOT, FORCES, FORCE_IDS, K, NORMAL, RIG, SET, THETA, arrowsAt, cameraAt, characterAt, rightAngleAt,
  ropeAt, screen, textsAt, type ForceId, type Text,
} from './lib/pvForces.ts';
import { FULL } from './lib/layout.ts';
import { clamp01 } from './lib/motion.ts';
import { Theme, useFonts } from './board.tsx';
import { StudioSet, ContactShadow } from './studio.tsx';
import { RoundBox } from './shapes.tsx';
import type { V3 } from './lib/inductionScene.ts';

const MATH = `'Cambria Math', Cambria, serif`;
const SLAB = '#aaa69e', WOOD = '#c98f55', WOOD_DARK = '#8f5e31', ROPE = '#b9925f', PUPIL = '#1f2430';
const v = (p: V3) => new THREE.Vector3(p[0] + RIG[0], p[1] + RIG[1], p[2] + RIG[2]);   // slope space → studio

function Rig({ t }: { t: number }) {
  const { camera, gl, scene } = useThree();
  // less of the room's reflected light than the set gives (0.9): at that level the force colours went pastel
  scene.environmentIntensity = 0.45; gl.toneMappingExposure = 1.08;
  const cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A capsule from a to b (limbs, ropes). */
function Rod({ a, b, r, colour, rough = 0.55 }: { a: THREE.Vector3; b: THREE.Vector3; r: number; colour: string; rough?: number }) {
  const d = b.clone().sub(a), l = d.length();
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), [d.x, d.y, d.z]);
  return (
    <mesh position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q} castShadow>
      <capsuleGeometry args={[r, Math.max(0.001, l), 6, 16]} />
      <meshStandardMaterial color={colour} roughness={rough} envMapIntensity={0.35} />
    </mesh>
  );
}

/** One of our characters: a soft bean body leaning about its feet, big eyes looking at the crate, brows set by effort,
 *  arms to its hands, two short legs. */
function Critter({ id, t }: { id: ForceId; t: number }) {
  const c = characterAt(id, t), colour = FORCES[id].colour;
  const feet = v(c.feet), hands = v(c.hands), up = new THREE.Vector3(Math.sin(c.lean), Math.cos(c.lean), 0);
  const along = (k: number) => feet.clone().add(up.clone().multiplyScalar(k));
  const hip = along(0.36 * K), body = along(0.75 * K), shoulder = along(0.7 * K), face = along(0.96 * K);
  const look = v(CENTRE).sub(face).setZ(0).normalize().multiplyScalar(0.022 * K);
  const lid = clamp01(c.blink), brow = 0.25 + 0.35 * c.effort;
  const side = (z: number) => new THREE.Vector3(0, 0, z);
  // the hanging one raises its arms in a V (seen from the front, arms one behind the other read as one rod)
  const spread = (s: number) => new THREE.Vector3(id === 'mg' ? 0.11 * K * s : 0, 0, 0);
  const across = (k: number) => new THREE.Vector3(Math.cos(c.lean) * k, -Math.sin(c.lean) * k, 0);   // sideways in the picture
  return (
    <group>
      <mesh position={body} rotation={[0, 0, -c.lean]} castShadow>
        <capsuleGeometry args={[0.2 * K, 0.46 * K, 8, 24]} />
        <meshStandardMaterial color={colour} roughness={0.7} envMapIntensity={0.22} />
      </mesh>
      {[-1, 1].map(s => {
        const eye = face.clone().add(new THREE.Vector3(0.085 * K * s * Math.cos(c.lean), -0.085 * K * s * Math.sin(c.lean), 0.17 * K));
        return (
          <group key={s}>
            <mesh position={eye} scale={[1, 1 - 0.9 * lid, 1]}><sphereGeometry args={[0.068 * K, 24, 16]} /><meshStandardMaterial color="#ffffff" roughness={0.3} /></mesh>
            <mesh position={eye.clone().add(look).add(side(0.055 * K))} scale={[1, 1 - 0.9 * lid, 1]}><sphereGeometry args={[0.032 * K, 16, 12]} /><meshBasicMaterial color={PUPIL} /></mesh>
            <mesh position={eye.clone().add(new THREE.Vector3(0, 0.1 * K, 0.02 * K))} rotation={[0, 0, -c.lean + s * brow]}>
              <boxGeometry args={[0.1 * K, 0.022 * K, 0.02 * K]} /><meshBasicMaterial color={PUPIL} />
            </mesh>
          </group>
        );
      })}
      <mesh position={face.clone().add(up.clone().multiplyScalar(-0.17 * K)).add(new THREE.Vector3(0, 0, 0.19 * K))} rotation={[0, 0, -c.lean]}>
        <boxGeometry args={[(0.07 + 0.06 * c.effort) * K, 0.022 * K, 0.02 * K]} /><meshBasicMaterial color={PUPIL} /></mesh>
      {[-1, 1].map(s => <Rod key={`arm${s}`} a={shoulder.clone().add(side(0.19 * K * s)).add(spread(s))} b={hands.clone().add(side(0.05 * s)).add(spread(1.6 * s))} r={0.03 * K} colour={colour} />)}
      {[-1, 1].map(s => <mesh key={`hand${s}`} position={hands.clone().add(side(0.05 * s)).add(spread(1.6 * s))} castShadow><sphereGeometry args={[0.055 * K, 16, 12]} />
        <meshStandardMaterial color={colour} roughness={0.62} envMapIntensity={0.35} /></mesh>)}
      {[-1, 1].map(s => <Rod key={`leg${s}`} a={hip.clone().add(across(0.09 * K * s))} b={feet.clone().add(across(0.13 * K * s))} r={0.055 * K} colour={colour} />)}
    </group>
  );
}

function Crate() {
  const c = v(CENTRE), braces = [THETA + Math.PI / 4, THETA - Math.PI / 4];
  return (
    <group position={c} rotation={[0, 0, THETA]}>
      <mesh castShadow receiveShadow><RoundBox size={[CRATE, CRATE, CRATE]} radius={0.05} />
        <meshStandardMaterial color={WOOD} roughness={0.75} /></mesh>
      {/* the front's frame and its X, as a crate's planks */}
      {[[0, CRATE / 2 - 0.06, CRATE, 0.1], [0, -CRATE / 2 + 0.06, CRATE, 0.1], [CRATE / 2 - 0.06, 0, 0.1, CRATE], [-CRATE / 2 + 0.06, 0, 0.1, CRATE]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, CRATE / 2 + 0.01]}><boxGeometry args={[w, h, 0.03]} /><meshStandardMaterial color={WOOD_DARK} roughness={0.8} /></mesh>)}
      {braces.map((a, i) => <mesh key={`x${i}`} position={[0, 0, CRATE / 2 + 0.012]} rotation={[0, 0, a - THETA]}>
        <boxGeometry args={[CRATE * 1.25, 0.09, 0.03]} /><meshStandardMaterial color={WOOD_DARK} roughness={0.8} /></mesh>)}
    </group>
  );
}

function Slope() {
  const mid = v([ALONG[0] * 1.0 - NORMAL[0] * 0.25, ALONG[1] * 1.0 - NORMAL[1] * 0.25, 0]);
  return (
    <mesh position={mid} rotation={[0, 0, THETA]} castShadow receiveShadow>
      <boxGeometry args={[12, 0.5, 1.8]} />
      <meshStandardMaterial color={SLAB} roughness={0.85} />
    </mesh>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      {/* the set's own key light only: a second one washed the colours to pastel */}
      <StudioSet colour={SET} />
      <Rig t={t} />
      <Slope />
      <Crate />
      {(['F', 'f'] as const).map(id => { const r = ropeAt(id, t); return <Rod key={id} a={v(r.from)} b={v(r.to)} r={0.022} colour={ROPE} rough={0.9} />; })}
      {FORCE_IDS.map(id => <Critter key={id} id={id} t={t} />)}
      <ContactShadow x={v(characterAt('mg', t).feet).x} z={1.25} rx={0.35} opacity={0.18} />
    </>
  );
}

/** The arrows: thick lines with heads, drawn from projected points; dashed guides; the 90° mark. */
function Arrows({ t }: { t: number }) {
  const ra = rightAngleAt(t), c = screen(CENTRE, t), k = 0.2;
  const unit = (p: V3) => { const l = Math.hypot(...p); return [p[0] / l, p[1] / l, 0] as V3; };
  const s = unit(COMPONENTS.sin), o = unit(COMPONENTS.cos);
  const corner = [screen([CENTRE[0] + s[0] * k, CENTRE[1] + s[1] * k, 0], t), screen([CENTRE[0] + (s[0] + o[0]) * k, CENTRE[1] + (s[1] + o[1]) * k, 0], t),
    screen([CENTRE[0] + o[0] * k, CENTRE[1] + o[1] * k, 0], t)];
  return (
    <svg width={FULL.width} height={FULL.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      {arrowsAt(t).map(a => {
        const p = screen(a.from, t), q0 = screen(a.to, t), q = { x: p.x + (q0.x - p.x) * a.grow, y: p.y + (q0.y - p.y) * a.grow };
        const dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, head = a.dashed ? 0 : 30, w = a.dashed ? 4 : 10;
        const end = { x: q.x - ux * head * 0.8, y: q.y - uy * head * 0.8 };
        return (
          <g key={a.name} opacity={a.alpha}>
            <line x1={p.x} y1={p.y} x2={end.x} y2={end.y} stroke={a.colour} strokeWidth={w} strokeLinecap="round" strokeDasharray={a.dashed ? '12 12' : undefined}
              style={{ filter: a.dashed ? undefined : 'drop-shadow(0 2px 3px rgba(35,48,74,0.35))' }} />
            {!a.dashed && l > 20 && <polygon points={`${q.x},${q.y} ${q.x - ux * head - uy * head * 0.55},${q.y - uy * head + ux * head * 0.55} ${q.x - ux * head + uy * head * 0.55},${q.y - uy * head - ux * head * 0.55}`}
              fill={a.colour} />}
          </g>
        );
      })}
      {(() => { const f = screen(FOOT, t), up = screen([FOOT[0] + ALONG[0], FOOT[1] + ALONG[1], FOOT[2]], t), a = Math.atan2(up.y - f.y, up.x - f.x), r = 84;
        return <path d={`M ${f.x + r} ${f.y} A ${r} ${r} 0 0 0 ${f.x + r * Math.cos(a)} ${f.y + r * Math.sin(a)}`} fill="none" stroke="#5b6475" strokeWidth={3} />; })()}
      {ra > 0.01 && <polyline points={corner.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#5b6475" strokeWidth={3} opacity={ra} />}
      {ra > 0.01 && <circle cx={c.x} cy={c.y} r={7} fill="#2b3242" opacity={ra} />}
    </svg>
  );
}

/** Maths in Cambria: letters italic, an arrow over a vector's symbol (F, f, N) where `vec`. */
function MathLine({ text, size, colour, vec = false }: { text: string; size: number; colour: string; vec?: boolean }) {
  return (
    <span style={{ font: `${size}px ${MATH}`, color: colour, whiteSpace: 'pre' }}>
      {text.split(/(\s+)/).map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i} style={{ display: 'inline-block', width: '0.42em' }} />;   // a plain space collapsed between the inline blocks
        const italic = /^[A-Za-zθμ]+$/.test(tok) && !/^(sin|cos)$/.test(tok);
        const arrow = vec && /^[FfN]$/.test(tok);
        return (
          <span key={i} style={{ fontStyle: italic ? 'italic' : 'normal', position: 'relative', display: 'inline-block' }}>
            {arrow && <span style={{ position: 'absolute', left: '-0.05em', right: '-0.05em', top: '-0.42em', fontSize: '0.62em', textAlign: 'center', fontStyle: 'normal' }}>→</span>}
            {tok}
          </span>
        );
      })}
    </span>
  );
}

function Word({ x }: { x: Text }) {
  const b = x.box, base: React.CSSProperties = { position: 'absolute', opacity: x.alpha };
  switch (x.kind) {
    case 'label': return <div style={{ ...base, left: b.x, top: b.y, font: `700 28px ${SOFT_UI}`, letterSpacing: 1.5, color: x.colour }}>{x.text}</div>;
    case 'tag': return <div style={{ ...base, left: b.x, top: b.y, width: b.w, textAlign: 'right', font: `600 28px ${SOFT_UI}`, color: x.colour }}>{x.text}</div>;
    case 'pill': return <div style={{ ...base, left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: b.h / 2, background: '#1f2430', color: x.colour,
      display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 ${x.size}px ${SOFT_UI}`, boxShadow: '0 10px 24px rgba(35,48,74,0.18)' }}>{x.text}</div>;
    case 'note': return <div style={{ ...base, left: b.x, top: b.y, width: b.w, textAlign: 'right', font: `800 ${x.size}px ${SOFT_UI}`, letterSpacing: 1, color: x.colour, textTransform: 'uppercase' }}>{x.text}</div>;
    case 'name': {
      const words = x.text.split(' '), sym = words.pop()!;
      return <div style={{ ...base, left: b.x, top: b.y, width: b.w, display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'flex-start', whiteSpace: 'pre' }}>
        <span style={{ font: `700 ${x.size * 0.82}px ${SOFT_UI}`, color: x.colour }}>{words.join(' ')}</span>
        <MathLine text={sym} size={x.size * 1.15} colour={x.colour} vec />
      </div>;
    }
    case 'symbol': return <div style={{ ...base, left: x.x, top: x.y, transform: 'translate(-50%, -50%)' }}><MathLine text={x.text} size={x.size * 1.2} colour={x.colour} vec /></div>;
    case 'part': return <div style={{ ...base, left: b.x, top: b.y, width: b.w, textAlign: 'center' }}><MathLine text={x.text} size={x.size} colour={x.colour} /></div>;
    case 'equation': return <div style={{ ...base, left: 0, width: FULL.width, top: x.y, transform: 'translateY(-50%)', textAlign: 'center' }}>
      <MathLine text={x.text} size={x.size} colour={x.colour} vec={x.text.startsWith('F')} /></div>;
    case 'closer': return <div style={{ ...base, left: 0, width: FULL.width, top: x.y, transform: 'translateY(-50%)', textAlign: 'center', font: `800 ${x.size}px ${SOFT_UI}`,
      color: x.colour, letterSpacing: -0.5, textShadow: '0 2px 12px rgba(242,239,233,0.9)' }}>{x.text}</div>;
  }
}

export function PvForces({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: SET }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <Arrows t={t} />
        {textsAt(t).map(x => <Word key={x.name} x={x} />)}
        {!cover && <Html5Audio src={staticFile('pv-physics-017-forces-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
