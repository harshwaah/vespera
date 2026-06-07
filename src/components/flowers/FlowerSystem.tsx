import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { FlowerConfig } from './FlowerConfig';
import Stem from './Stem';
import Bloom from './Bloom';

interface FlowerSystemProps {
  config: FlowerConfig;
  pinchDistancesRef: React.MutableRefObject<[number, number]>;
}

export default function FlowerSystem({ config, pinchDistancesRef }: FlowerSystemProps) {
  const groupRef  = useRef<THREE.Group>(null);
  // Shared growth value: written by Stem each frame, read by Bloom
  const growthRef = useRef<number>(0);

  // ── Stem curve: grows from bottom-left, arcs gracefully toward upper-center
  // All coordinates are local to the anchor group.
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0,  0.0,  0.0),   // root — at anchor
    new THREE.Vector3(0.4,  1.2,  0.15),  // first third — slight lean right
    new THREE.Vector3(1.0,  2.6,  0.35),  // mid sweep
    new THREE.Vector3(1.6,  3.9,  0.6),   // three-quarter
    new THREE.Vector3(2.0,  5.0,  0.8),   // tip — arcing toward screen center
  ], false, 'catmullrom', 0.5), []);

  // ── Very subtle idle sway — the plant breathes ───────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.028;
    groupRef.current.rotation.x = Math.sin(t * 0.27) * 0.018;
  });

  return (
    <group
      ref={groupRef}
      position={config.placement.anchor}
      scale={config.placement.scale}
    >
      <Stem
        config={config}
        curve={curve}
        pinchDistancesRef={pinchDistancesRef}
        onGrowthChange={(g) => { growthRef.current = g; }}
      />
      <Bloom
        config={config}
        curve={curve}
        pinchDistancesRef={pinchDistancesRef}
        growthRef={growthRef}
      />
    </group>
  );
}
