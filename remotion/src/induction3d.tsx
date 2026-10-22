// The 3D pieces both induction reels draw (framework-2 test, L61): coil, former, magnet, field lines, wires with current
// dots, a centre-zero galvanometer and a torch bulb. Geometry comes from lib/inductionScene.ts; each reel places them.
import { useEffect, useMemo, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundBox } from './shapes.tsx';
import { COIL3, MAG3, helix, type V3 } from './lib/inductionScene.ts';
import { fieldLine } from './lib/induction.ts';

/** Bloom draws only from the canvas's second render: advance one frame before Remotion takes the picture (as Physics #7). */
export function BloomWarmUp() {
  const advance = useThree(s => s.advance), [handle] = useState(() => delayRender('bloom warm-up'));
  useEffect(() => {
    const id = requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); });
    return () => cancelAnimationFrame(id);
  }, [advance, handle]);
  return null;
}

const tube = (pts: V3[], radius: number, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), Math.max(8, pts.length * 2), radius, 8, closed);

/** The copper winding: `turns` of a helix (r, h), drawn up to `upTo` (0–1) of its length, turned by `spin`. */
export function Coil({ r = COIL3.r, h = COIL3.h, y = 0, spin = 0, upTo = 1, color }: { r?: number; h?: number; y?: number; spin?: number; upTo?: number; color: string }) {
  const key = `${r.toFixed(3)}:${h.toFixed(3)}:${upTo.toFixed(3)}`;
  const geo = useMemo(() => {
    const all = helix(COIL3.turns, r, h), n = Math.max(2, Math.round(all.length * upTo));
    return tube(all.slice(0, n), 0.022);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (upTo <= 0.002) return null;
  return (
    <mesh geometry={geo} position={[0, y, 0]} rotation={[0, spin, 0]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.75} envMapIntensity={0.9} />
    </mesh>
  );
}

/** The clear tube the coil is wound on. */
export function Former({ at = [0, 0, 0], color, alpha = 1 }: { at?: V3; color: string; alpha?: number }) {
  return (
    <group position={at}>
      <mesh><cylinderGeometry args={[COIL3.r - 0.02, COIL3.r - 0.02, COIL3.h + 0.08, 40, 1, true]} />
        <meshStandardMaterial color={color} transparent opacity={0.22 * alpha} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      {[-1, 1].map(s => (
        <mesh key={s} position={[0, s * (COIL3.h / 2 + 0.04), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COIL3.r - 0.02, 0.018, 10, 40]} /><meshStandardMaterial color={color} transparent opacity={0.6 * alpha} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** The bar magnet standing on the axis, N pole (red) down, S (blue) up. */
export function Magnet({ y, north, south }: { y: number; north: string; south: string }) {
  const half = MAG3.h / 2;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, -half / 2, 0]}><cylinderGeometry args={[MAG3.r, MAG3.r, half, 40]} /><meshStandardMaterial color={north} roughness={0.35} metalness={0.1} /></mesh>
      <mesh position={[0, half / 2, 0]}><cylinderGeometry args={[MAG3.r, MAG3.r, half, 40]} /><meshStandardMaterial color={south} roughness={0.35} metalness={0.1} /></mesh>
    </group>
  );
}

// Dipole field lines (r = r0 sin²θ) in six planes round the axis; the dipole points down (N at the bottom), so the lines
// leave the bottom and return at the top. They ride with the magnet.
const R0 = [0.36, 0.52, 0.7];
export function FieldLines({ y, alpha, color, glow = 1.6 }: { y: number; alpha: number; color: string; glow?: number }) {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(glow), [color, glow]);
  const geos = useMemo(() => R0.flatMap(r0 => {
    const pts = fieldLine(r0, 60, 0.32);
    return Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2;
      return tube(pts.map(([x, yy]) => [x * Math.cos(a), -yy, x * Math.sin(a)] as V3), 0.0075);
    });
  }), []);
  if (alpha <= 0.01) return null;
  return (
    <group position={[0, y, 0]}>
      {geos.map((g, i) => <mesh key={i} geometry={g}><meshBasicMaterial color={c} transparent opacity={0.75 * alpha} toneMapped={false} depthWrite={false} /></mesh>)}
    </group>
  );
}

/** A wire along `pts`, drawn up to `upTo` (0–1). */
export function Wire({ pts, upTo = 1, color }: { pts: V3[]; upTo?: number; color: string }) {
  const n = Math.max(2, Math.round(pts.length * upTo)), key = `${n}:${pts[0].join(',')}:${pts.at(-1)!.join(',')}`;
  const geo = useMemo(() => tube(pts.slice(0, n), 0.016), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (upTo <= 0.02) return null;
  return <mesh geometry={geo}><meshStandardMaterial color={color} roughness={0.5} metalness={0.3} /></mesh>;
}

/** Current dots sliding along a wire: `phase` (∝ charge moved) slides them, so their speed follows the current. */
export function CurrentDots({ pts, phase, alpha, color, count = 6 }: { pts: V3[]; phase: number; alpha: number; color: string; count?: number }) {
  if (alpha <= 0.01) return null;
  const at = (s: number) => { const f = ((s % 1) + 1) % 1 * (pts.length - 1), i = Math.floor(f), k = f - i, a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k] as V3; };
  return <>{Array.from({ length: count }, (_, i) => (
    <mesh key={i} position={at(i / count + phase)}><sphereGeometry args={[0.028, 14, 14]} /><meshBasicMaterial color={color} transparent opacity={alpha} toneMapped={false} /></mesh>
  ))}</>;
}

/** A centre-zero galvanometer: rounded case, white face, tick arc, a needle at `deg` (+ = right). */
export function Galvanometer({ at, size, deg, body, face, ink, needleColor }: { at: V3; size: V3; deg: number; body: string; face: string; ink: string; needleColor: string }) {
  const [w, h, d] = size, pivot: V3 = [0, -h * 0.28, d / 2 + 0.012], len = h * 0.62;
  return (
    <group position={at}>
      <mesh><RoundBox size={size} radius={0.06} /><meshStandardMaterial color={body} roughness={0.45} metalness={0.2} /></mesh>
      <mesh position={[0, h * 0.06, d / 2 + 0.002]}><RoundBox size={[w * 0.84, h * 0.66, 0.01]} radius={0.04} /><meshStandardMaterial color={face} roughness={0.7} /></mesh>
      {Array.from({ length: 11 }, (_, i) => {
        const a = ((i - 5) / 5) * (50 * Math.PI / 180), r = len * 0.98, big = i === 5 || i === 0 || i === 10;
        return <mesh key={i} position={[pivot[0] + r * Math.sin(a), pivot[1] + r * Math.cos(a), pivot[2]]} rotation={[0, 0, -a]}>
          <boxGeometry args={[0.008, big ? 0.06 : 0.035, 0.004]} /><meshBasicMaterial color={ink} /></mesh>;
      })}
      <group position={pivot} rotation={[0, 0, -deg * Math.PI / 180]}>
        <mesh position={[0, len / 2, 0.004]}><boxGeometry args={[0.02, len, 0.006]} /><meshBasicMaterial color={needleColor} /></mesh>
      </group>
      <mesh position={pivot}><cylinderGeometry args={[0.022, 0.022, 0.02, 20]} /><meshStandardMaterial color={ink} /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[-w / 2 + 0.002, (s > 0 ? 0.15 : -0.15) + 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} /><meshStandardMaterial color={ink} roughness={0.3} metalness={0.6} /></mesh>)}
    </group>
  );
}

/** A torch bulb on a socket; `glow` 0–1 lights the filament (the halo is drawn on the page). */
export function Bulb({ at, glow, glass, socket, filament }: { at: V3; glow: number; glass: string; socket: string; filament: string }) {
  const hot = new THREE.Color(filament).lerp(new THREE.Color('#fff6c8'), glow).multiplyScalar(1 + 3 * glow);
  return (
    <group position={at}>
      <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.2, 40, 30]} />
        <meshStandardMaterial color={glass} transparent opacity={0.28 + 0.2 * glow} roughness={0.05} emissive={new THREE.Color('#ffd27a')} emissiveIntensity={0.9 * glow} depthWrite={false} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.05, 0.008, 8, 24, Math.PI]} /><meshBasicMaterial color={hot} toneMapped={false} /></mesh>
      <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.1, 0.1, 0.14, 28]} /><meshStandardMaterial color={socket} roughness={0.3} metalness={0.8} /></mesh>
      <mesh position={[0, -0.16, 0]}><RoundBox size={[0.32, 0.1, 0.24]} radius={0.04} /><meshStandardMaterial color="#2a3240" roughness={0.6} /></mesh>
    </group>
  );
}
