// Realistic light for 3D reels (2026-10-20, founder-approved): three.js's own tools, no package. A soft room reflected
// in every surface (RoomEnvironment through PMREM), one key light casting soft shadows, and the film-style tone mapping
// React Three Fiber already uses. Put <RealLight /> in the scene and pass `shadows` to the ThreeCanvas; meshes that
// should cast or catch a shadow need castShadow / receiveShadow.
import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function RealLight({ env = 0.8, key = 1.6, at = [-4, 8, 9] as [number, number, number], span = 8 }:
  { env?: number; key?: number; at?: [number, number, number]; span?: number }) {
  const { gl, scene } = useThree();
  const room = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl), tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  if (scene.environment !== room) scene.environment = room;
  scene.environmentIntensity = env;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  return (
    <>
      <directionalLight position={at} intensity={key} castShadow shadow-mapSize={[2048, 2048]} shadow-radius={6}
        shadow-bias={-0.0005} shadow-camera-left={-span} shadow-camera-right={span} shadow-camera-top={span}
        shadow-camera-bottom={-span} shadow-camera-near={0.5} shadow-camera-far={60} />
      <ambientLight intensity={0.2} />
    </>
  );
}
