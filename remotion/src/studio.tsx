// The soft studio (framework F36, founder 2026-10-26): the look of the studied quantum-numbers reel (study only): a white
// seamless set whose floor curves up into the back wall (no horizon line), soft room light reflected in every surface, one
// key light casting soft shadows, and a soft contact shadow under each object. three.js's own tools, no package. Use with
// a full-frame ThreeCanvas (F35, lib/layout.ts) and `shadows`; meshes that cast or catch a shadow need castShadow /
// receiveShadow.
import { useMemo } from 'react';
import * as THREE from 'three';
import { RealLight } from './realism.tsx';

/** The set: floor, cove and back wall in one matt colour. `back` is the wall's z; the cove's radius is `cove`. */
export function StudioSet({ colour, back = -2.4, cove = 2.4, width = 40, span = 6, key = 1.2 }:
  { colour: string; back?: number; cove?: number; width?: number; span?: number; key?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, 1, 1, 32), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const phi = (pos.getY(i) + 0.5) * (Math.PI / 2);              // 0 at the floor, π/2 at the wall
      pos.setXYZ(i, pos.getX(i), cove - cove * Math.cos(phi), back + cove - cove * Math.sin(phi));
    }
    g.computeVertexNormals();
    return g;
  }, [back, cove, width]);
  const matt = <meshStandardMaterial color={colour} roughness={0.95} metalness={0} side={THREE.DoubleSide} />;
  return (
    <>
      <color attach="background" args={[colour]} />
      <RealLight env={0.9} key={key} at={[-3, 7, 6]} span={span} />
      <ambientLight intensity={0.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, back + cove + 15]} receiveShadow><planeGeometry args={[width, 30]} />{matt}</mesh>
      <mesh geometry={geo} receiveShadow>{matt}</mesh>
      <mesh position={[0, cove + 15, back]} receiveShadow><planeGeometry args={[width, 30]} />{matt}</mesh>
    </>
  );
}

/** A soft dark pool under an object where it meets the floor (the contact shadow a studio photo has). */
export function ContactShadow({ x, z = 0, rx, rz = rx, opacity = 0.32 }: { x: number; z?: number; rx: number; rz?: number; opacity?: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!, grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.45, 'rgba(0,0,0,0.55)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, z]}>
      <planeGeometry args={[rx * 2, rz * 2]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} color="#1d2433" />
    </mesh>
  );
}
