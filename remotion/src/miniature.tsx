// The "miniature look" (founder, 2026-11-04: "we need to keep improving the quality of reels"): the finish every @lws.pune
// 3D diorama shares, so the model reads as a crafted miniature rather than plastic toys. Contact shadows where things meet
// (N8AO), a tilt-shift focus band through the subject (how real miniature photos are made: a lens tilted so one band of the
// picture is sharp; the depth-of-field effect lost the canvas's transparency, so the board showed black), a soft glow on
// what is lit (windows, the roads' colour), filmic tone mapping last. Pure rules: lib/miniature.ts.
import { useMemo } from 'react';
import * as THREE from 'three';
import { Bloom, EffectComposer, N8AO, TiltShift2, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { BloomWarmUp } from './induction3d.tsx';
import { flagWave, focusBand, grassTint, sway, wave, type V3 } from './lib/miniature.ts';

/** `focusY`: the subject's height on the canvas (0 = bottom, 1 = top); `distance`: the camera's distance to it (m). */
export function MiniatureFinish({ focusY, distance }: { focusY: number; distance: number }) {
  const b = focusBand(focusY, distance);
  return <>
    <EffectComposer multisampling={4}>
      <N8AO screenSpaceRadius aoRadius={42} distanceFalloff={0.6} intensity={2.4} quality="high" halfRes={false} />
      <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.25} intensity={0.45} radius={0.5} />
      <TiltShift2 blur={b.blur} taper={b.taper} start={[0, b.y]} end={[1, b.y]} direction={[1, 0]} samples={14} />
      <TiltShift2 blur={b.blur} taper={b.taper} start={[0, b.y]} end={[1, b.y]} direction={[0, 1]} samples={14} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
    <BloomWarmUp />
  </>;
}

// ---- shared scene pieces: the model's living details ----------------------------------------------------------------------
/** A round tree (three soft clumps of leaves) or a pine (three stacked cones), leaning in the breeze about its base. */
export function Tree({ p, s, c, pine, seed, t }: { p: V3; s: number; c: string; pine: boolean; seed: number; t: number }) {
  const lean = sway(t, seed), lean2 = sway(t + 1.3, seed + 11) * 0.6;
  if (pine) return <group position={p} rotation={[lean2, 0, lean]}>
    {[0, 1, 2].map(k => <mesh key={k} position={[0, s * (1.3 + 1.15 * k), 0]} castShadow receiveShadow>
      <coneGeometry args={[s * (1.15 - 0.27 * k), s * (2.0 - 0.3 * k), 9]} /><meshStandardMaterial color={c} roughness={0.9} /></mesh>)}
    <mesh position={[0, s * 0.4, 0]}><cylinderGeometry args={[0.22 * s, 0.3 * s, s * 0.8, 6]} /><meshStandardMaterial color="#6b5a45" roughness={1} /></mesh>
  </group>;
  return <group position={p} rotation={[lean2, 0, lean]}>
    <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.35, 0.45, 3.2, 6]} /><meshStandardMaterial color="#6b5a45" roughness={1} /></mesh>
    {[[0, 3.2 + s * 0.7, 0, 1], [s * 0.55, 3.0 + s * 0.45, s * 0.25, 0.7], [-s * 0.45, 3.1 + s * 0.5, -s * 0.3, 0.68]].map(([x, y, z, k], i) =>
      <mesh key={i} position={[x, y, z]} scale={[s * k, s * k * 0.9, s * k]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={c} roughness={0.9} /></mesh>)}
  </group>;
}

/** A field of grass with soft lighter and darker patches (grassTint), lying flat at height y. */
export function GrassField({ x0, x1, z0, z1, y = 0, color }: { x0: number; x1: number; z0: number; z1: number; y?: number; color: string }) {
  const geo = useMemo(() => {
    const nx = Math.ceil((x1 - x0) / 3), nz = Math.ceil((z1 - z0) / 3), pos: number[] = [], col: number[] = [], idx: number[] = [], base = new THREE.Color(color);
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx, z = z0 + ((z1 - z0) * j) / nz, k = grassTint(x, z);
      pos.push(x, 0, z); col.push(base.r * k, base.g * k, base.b * k);
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }, [x0, x1, z0, z1, color]);
  return <mesh geometry={geo} position={[0, y, 0]} receiveShadow><meshStandardMaterial vertexColors roughness={1} /></mesh>;
}

/** The sea: a gently moving swell (wave) that catches the light. */
export function Sea({ x0, x1, z0, z1, y = 0, color, t }: { x0: number; x1: number; z0: number; z1: number; y?: number; color: string; t: number }) {
  const geo = useMemo(() => {
    const nx = Math.ceil((x1 - x0) / 2), nz = Math.max(2, Math.ceil((z1 - z0) / 2)), pos: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) pos.push(x0 + ((x1 - x0) * i) / nx, 0, z0 + ((z1 - z0) * j) / nz);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
  }, [x0, x1, z0, z1]);
  const p = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, wave(p.getX(i), p.getZ(i), t));
  p.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo} position={[0, y, 0]} receiveShadow><meshStandardMaterial color={color} roughness={0.1} metalness={0.25} /></mesh>;
}

/** A cloth flag `w` × `h`, its edge on the mast at x = 0, flying along +x and rippling (flagWave). */
export function ClothFlag({ w, h, color, t }: { w: number; h: number; color: string; t: number }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(w, h, 18, 6), [w, h]);
  const p = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + w / 2) / w, v = (h / 2 - p.getY(i)) / h; p.setZ(i, flagWave(u, v, t, w)); }
  p.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo} position={[w / 2 + 0.1, 0, 0]} castShadow><meshStandardMaterial color={color} roughness={0.75} side={THREE.DoubleSide} /></mesh>;
}
