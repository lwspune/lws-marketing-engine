// Sudan Block (our own model, from public photos; storyboard nda-story-001-one-day § 8), its facades and a palm, shared by
// the reels set at NDA: One Day (Story001) and NDA Life #1 (Life001). Moved here unchanged from Story001.tsx.
import { useMemo } from 'react';
import * as THREE from 'three';
import { BLOCK, BAY, DRUM, DOME, FINIAL, DOME_Z, DOME_BASE, type V3 } from './lib/story001.ts';

export const SEED = 1;
export function rng(seed: number) {                                   // mulberry32: the same windows light up every render
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const COL = { stone: '#9c8e7c', stoneDark: '#827564', red: '#b04a33', roof: '#a9472f', frame: '#e4dccb', glass: '#2a2724',
  lit: '#ffc77a', dome: '#c8653f', rib: '#8a3622', gold: '#d6a84a', lawn: '#4d7a33', field: '#3c5a2a', path: '#a34b36',
  hedge: '#2c5524', iron: '#16161a', palm: '#2f5e2b', trunk: '#6b5a45' };

// ---- facades: drawn once on canvases (a colour map and a glow map for the lit windows) -------------------------------
export function facade(wM: number, hM: number, floors: number[], opts: { arches?: number; seed: number }) {
  const px = 24, W = Math.round(wM * px), H = Math.round(hM * px);
  const c = document.createElement('canvas'), e = document.createElement('canvas');
  c.width = e.width = W; c.height = e.height = H;
  const g = c.getContext('2d')!, ge = e.getContext('2d')!, r = rng(opts.seed);
  g.fillStyle = COL.stone; g.fillRect(0, 0, W, H);
  for (let i = 0; i < W * H / 60; i++) { g.fillStyle = r() < 0.5 ? COL.stoneDark : '#ab9d8a'; g.globalAlpha = 0.25; g.fillRect(r() * W, r() * H, 3, 2); }
  g.globalAlpha = 1; ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  const y = (m: number) => H - m * px;
  g.fillStyle = COL.red;
  g.fillRect(0, y(1.1), W, 1.1 * px);                                            // plinth
  for (const f of floors) g.fillRect(0, y(f + 0.35), W, 0.35 * px);              // floor bands
  g.fillRect(0, 0, W, 0.6 * px);                                                 // cornice under the eave
  const bay = 3.6, cols = Math.floor(wM / bay);
  const levels = [1.6, ...floors.map(f => f + 0.9)];
  levels.forEach((base, li) => {
    for (let k = 0; k < cols; k++) {
      const cx = (k + 0.5) * (wM / cols), arch = opts.arches && li === 0 && Math.abs(k - (cols - 1) / 2) < opts.arches / 2;
      const ww = arch ? 2.4 : 1.3, wh = arch ? 3.6 : 2.3, x0 = (cx - ww / 2) * px, y0 = y(base + wh);
      g.fillStyle = arch ? COL.red : COL.frame; g.fillRect(x0 - 5, y0 - 5, ww * px + 10, wh * px + 5);
      g.fillStyle = COL.glass; g.beginPath();
      g.moveTo(x0, y(base)); g.lineTo(x0, y0 + ww * px / 2); g.arc(x0 + ww * px / 2, y0 + ww * px / 2, ww * px / 2, Math.PI, 0); g.lineTo(x0 + ww * px, y(base)); g.fill();
      if (r() < 0.15) { ge.fillStyle = COL.lit; ge.fillRect(x0 + 3, y0 + ww * px / 2, ww * px - 6, y(base) - y0 - ww * px / 2); }
    }
  });
  const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  return { map: tex(c), glow: tex(e) };
}
export function Facade({ size, at, floors, arches, seed, glow }: { size: V3; at: V3; floors: number[]; arches?: number; seed: number; glow: number }) {
  const f = useMemo(() => ({ front: facade(size[0], size[1], floors, { arches, seed }), side: facade(size[2], size[1], floors, { seed: seed + 7 }) }), [size, floors, arches, seed]);
  const mat = (m: { map: THREE.Texture; glow: THREE.Texture }) =>
    new THREE.MeshStandardMaterial({ map: m.map, emissiveMap: m.glow, emissive: new THREE.Color('#ffffff'), emissiveIntensity: glow, roughness: 0.92 });
  const mats = useMemo(() => {
    const roof = new THREE.MeshStandardMaterial({ color: COL.roof, roughness: 0.9 });
    return [mat(f.side), mat(f.side), roof, roof, mat(f.front), mat(f.front)];
  }, [f]);
  mats.forEach((m, i) => { if (i !== 2 && i !== 3) (m as THREE.MeshStandardMaterial).emissiveIntensity = glow; });
  return <mesh position={at} material={mats} castShadow receiveShadow><boxGeometry args={size} /></mesh>;
}

// ---- Sudan Block ------------------------------------------------------------------------------------------------------
export function Dome({ r, h, at, ribs = 24 }: { r: number; h: number; at: V3; ribs?: number }) {
  const { shell, ribCurves } = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 32; i++) { const u = i / 32, a = (u * Math.PI) / 2; prof.push(new THREE.Vector2(Math.max(0.001, r * Math.cos(a) ** 0.85), h * Math.sin(a))); }
    const ribCurves = Array.from({ length: ribs }, (_, k) => {
      const az = (2 * Math.PI * k) / ribs;
      return new THREE.CatmullRomCurve3(prof.slice(0, 30).map(p => new THREE.Vector3((p.x + 0.06) * Math.sin(az), p.y + 0.02, (p.x + 0.06) * Math.cos(az))));
    });
    return { shell: new THREE.LatheGeometry(prof, ribs * 2), ribCurves };
  }, [r, h, ribs]);
  return <group position={at}>
    <mesh geometry={shell} castShadow receiveShadow><meshStandardMaterial color={COL.dome} roughness={0.75} /></mesh>
    {ribCurves.map((c, k) => <mesh key={k} castShadow><tubeGeometry args={[c, 24, r * 0.012, 5]} /><meshStandardMaterial color={COL.rib} roughness={0.8} /></mesh>)}
  </group>;
}
export function Drum({ r, h, y }: { r: number; h: number; y: number }) {
  const f = useMemo(() => facade(2 * Math.PI * r, h, [], { seed: SEED + 3 }), [r, h]);
  return <group>
    <mesh position={[0, y + h / 2, DOME_Z]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 48, 1, true]} />
      <meshStandardMaterial map={f.map} emissiveMap={f.glow} emissive="#ffffff" emissiveIntensity={0.5} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, y + h + 0.25, DOME_Z]} castShadow><cylinderGeometry args={[r + 0.5, r + 0.5, 0.5, 48]} /><meshStandardMaterial color={COL.red} /></mesh>
    <mesh position={[0, y + 0.3, DOME_Z]} castShadow><cylinderGeometry args={[r + 0.6, r + 0.6, 0.6, 48]} /><meshStandardMaterial color={COL.red} /></mesh>
  </group>;
}
export function Kiosk({ x, z }: { x: number; z: number }) {                // the small domed corner towers on the central bay
  return <group position={[x, BAY.h, z]}>
    {[-1, 1].flatMap(a => [-1, 1].map(b => <mesh key={`${a}${b}`} position={[0.8 * a, 1.2, 0.8 * b]} castShadow><boxGeometry args={[0.3, 2.4, 0.3]} /><meshStandardMaterial color={COL.stone} /></mesh>))}
    <mesh position={[0, 2.55, 0]} castShadow><boxGeometry args={[2.2, 0.3, 2.2]} /><meshStandardMaterial color={COL.red} /></mesh>
    <Dome r={1.05} h={1.3} at={[0, 2.7, 0]} ribs={12} />
  </group>;
}
export function SudanBlock({ glow }: { glow: number }) {
  const zc = DOME_Z;
  return <group>
    <Facade size={[BLOCK.len, BLOCK.h, BLOCK.depth]} at={[0, BLOCK.h / 2, zc]} floors={[5, 10]} seed={SEED} glow={glow} />
    <mesh position={[0, BLOCK.h + 0.35, zc]} castShadow receiveShadow><boxGeometry args={[BLOCK.len + 1.6, 0.7, BLOCK.depth + 1.6]} /><meshStandardMaterial color={COL.roof} roughness={0.85} /></mesh>
    <Facade size={[BAY.w, BAY.h, BLOCK.depth + 2 * BAY.proud]} at={[0, BAY.h / 2, zc]} floors={[5, 10, 15]} arches={3} seed={SEED + 1} glow={glow} />
    <mesh position={[0, BAY.h + 0.35, zc]} castShadow receiveShadow><boxGeometry args={[BAY.w + 1.6, 0.7, BLOCK.depth + 2 * BAY.proud + 1.6]} /><meshStandardMaterial color={COL.roof} roughness={0.85} /></mesh>
    <Drum r={DRUM.r} h={DRUM.h} y={BAY.h} />
    <Dome r={DOME.r} h={DOME.h} at={[0, DOME_BASE + 0.5, zc]} />
    <mesh position={[0, DOME_BASE + DOME.h + 0.6, zc]} castShadow><cylinderGeometry args={[0.35, 0.6, 0.8, 16]} /><meshStandardMaterial color={COL.gold} metalness={0.6} roughness={0.35} /></mesh>
    <mesh position={[0, DOME_BASE + DOME.h + FINIAL, zc]} castShadow><sphereGeometry args={[0.32, 16, 12]} /><meshStandardMaterial color={COL.gold} metalness={0.6} roughness={0.35} /></mesh>
    {[-1, 1].map(s => <Kiosk key={s} x={s * (BAY.w / 2 - 1.4)} z={zc + BLOCK.depth / 2 - 0.4} />)}
    {/* the front steps */}
    {[0, 1, 2].map(i => <mesh key={i} position={[0, 0.2 + 0.4 * i, BAY.proud + 3 - i]} receiveShadow castShadow><boxGeometry args={[12 - 2 * i, 0.4, 2]} /><meshStandardMaterial color={COL.red} roughness={0.9} /></mesh>)}
  </group>;
}

export function Palm({ at, h, lean, seed }: { at: V3; h: number; lean: number; seed: number }) {
  const r = rng(seed), fronds = Array.from({ length: 10 }, (_, k) => ({ az: (2 * Math.PI * k) / 10 + r() * 0.4, droop: 0.5 + r() * 0.5 }));
  return <group position={at} rotation={[0, 0, lean]}>
    <mesh position={[0, h / 2, 0]} castShadow><cylinderGeometry args={[0.2, 0.3, h, 8]} /><meshStandardMaterial color={COL.trunk} roughness={1} /></mesh>
    {fronds.map((f, k) => <mesh key={k} position={[1.6 * Math.sin(f.az), h - 0.3 - 0.4 * f.droop, 1.6 * Math.cos(f.az)]} rotation={[0, f.az, 0]} castShadow>
      <group rotation={[f.droop, 0, 0]}><mesh scale={[0.5, 0.12, 2.1]} castShadow><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={COL.palm} roughness={0.9} /></mesh></group>
    </mesh>)}
  </group>;
}
