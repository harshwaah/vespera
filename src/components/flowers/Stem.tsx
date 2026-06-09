import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { FlowerConfig } from './FlowerConfig';

interface StemProps {
  config: FlowerConfig;
  curve: THREE.CatmullRomCurve3;
  pinchDistancesRef: React.MutableRefObject<[number, number]>;
  onGrowthChange?: (growth: number) => void;
}

const LEAF_COUNT = 5;

// Leaf attachment points along the curve and their display params.
// fanZ = rotation around Z to fan the leaf out (positive = left, negative = right of stem)
// tiltX = rotation around X to droop/lift the leaf (positive = forward toward camera)
const LEAF_DEFS = [
  { t: 0.18, fanZ:  1.05, tiltX: 0.30, tiltY:  0.20, scale: 0.95 },
  { t: 0.30, fanZ: -1.10, tiltX: 0.25, tiltY: -0.18, scale: 1.05 },
  { t: 0.44, fanZ:  1.00, tiltX: 0.35, tiltY:  0.15, scale: 1.10 },
  { t: 0.58, fanZ: -1.05, tiltX: 0.28, tiltY: -0.22, scale: 1.00 },
  { t: 0.70, fanZ:  0.92, tiltX: 0.32, tiltY:  0.12, scale: 0.88 },
];

export default function Stem({ config, curve, pinchDistancesRef, onGrowthChange }: StemProps) {
  const tubeMeshRef = useRef<THREE.Mesh>(null);
  const leavesRef   = useRef<THREE.InstancedMesh>(null);
  const budRef      = useRef<THREE.Mesh>(null);
  const stateRef    = useRef({ growth: 0 });
  const prevGeoRef  = useRef<THREE.BufferGeometry | null>(null);

  // ── Leaf texture (RGBA, transparent bg from Pillow processing) ──────────
  const leafMap = useTexture('/textures/leaf_albedo.png');
  leafMap.wrapS = leafMap.wrapT = THREE.ClampToEdgeWrapping;

  // ── Leaf geometry — flat oval, pivot at base ────────────────────────────
  // PlaneGeometry lies in XY plane. Its face normal points +Z (toward camera).
  // We rotate via Euler so the leaf fans out correctly.
  const leafGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.42, 1.25, 6, 12);
    const pos  = geom.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);      // -0.625 → +0.625
      const yN = (y + 0.625) / 1.25; // 0 (base) → 1 (tip)
      // Taper toward tip
      pos.setX(i, x * (1.0 - yN * 0.55));
      // Very slight concave cup across width
      pos.setZ(i, -Math.pow(x * 2.0, 2) * 0.05);
    }
    geom.computeVertexNormals();
    // Move pivot to leaf base so rotation fans from attachment point
    geom.translate(0, 0.625, 0);
    return geom;
  }, []);

  // ── Pre-bake curve attachment points (constant after mount) ─────────────
  const attachPoints = useMemo(() =>
    LEAF_DEFS.map(def => curve.getPoint(def.t))
  , [curve]);

  // ── Dummy for instancing (allocated once) ───────────────────────────────
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => () => {
    leafGeometry.dispose();
    prevGeoRef.current?.dispose();
  }, [leafGeometry]);

  useFrame((_, delta) => {
    // ── Growth ─────────────────────────────────────────────────────────────
    const leftDist     = pinchDistancesRef.current[0];
    const targetGrowth = THREE.MathUtils.clamp((leftDist - 0.05) / 0.20, 0, 1);
    stateRef.current.growth = THREE.MathUtils.lerp(
      stateRef.current.growth, targetGrowth, 3.5 * delta
    );
    const g = stateRef.current.growth;
    onGrowthChange?.(g);

    // ── Dynamic tube ────────────────────────────────────────────────────────
    if (tubeMeshRef.current) {
      if (g < 0.008) {
        tubeMeshRef.current.visible = false;
      } else {
        tubeMeshRef.current.visible = true;
        const segs = Math.max(4, Math.round(g * 48));
        const pts  = Array.from({ length: segs }, (_, i) =>
          curve.getPoint((i / (segs - 1)) * g)
        );
        const sub = new THREE.CatmullRomCurve3(pts);
        const rad = THREE.MathUtils.lerp(0.058, 0.034, g);
        const geo = new THREE.TubeGeometry(sub, Math.max(3, segs - 1), rad, 8, false);
        prevGeoRef.current?.dispose();
        tubeMeshRef.current.geometry = geo;
        prevGeoRef.current = geo;
      }
    }

    // ── Dormant bud ─────────────────────────────────────────────────────────
    if (budRef.current) {
      const tip = curve.getPoint(Math.max(g, 0.001));
      budRef.current.position.copy(tip);
      const budScale = THREE.MathUtils.clamp(1 - g * 12, 0, 1);
      budRef.current.scale.setScalar(budScale * 0.13);
      budRef.current.visible = budScale > 0.01;
    }

    // ── Leaves ──────────────────────────────────────────────────────────────
    if (!leavesRef.current) return;

    for (let i = 0; i < LEAF_DEFS.length; i++) {
      const def = LEAF_DEFS[i];

      // Emerge 0→1 over 8% of stem growth after passing the leaf's t position
      const progress = (g - def.t) / 0.08;
      const eased    = THREE.MathUtils.clamp(1 - Math.pow(1 - progress, 3), 0, 1);

      if (eased < 0.001) {
        // Park off-screen — scale zero AND far away
        dummy.position.set(0, -9999, 0);
        dummy.quaternion.identity();
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Position at pre-baked attachment point on curve
      dummy.position.copy(attachPoints[i]);

      // Simple Euler rotation — easy to reason about:
      // PlaneGeometry face normal = +Z (faces camera by default).
      // fanZ fans the leaf left (+) or right (-) away from the stem.
      // tiltX droops it forward toward the viewer.
      // tiltY gives a slight twist for naturalness.
      dummy.rotation.order = 'YXZ';
      dummy.rotation.set(def.tiltX, def.tiltY, def.fanZ);

      dummy.scale.setScalar(eased * def.scale);
      dummy.updateMatrix();
      leavesRef.current.setMatrixAt(i, dummy.matrix);
    }

    leavesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* ── Stem tube ────────────────────────────────────────────────── */}
      <mesh ref={tubeMeshRef} visible={false}>
        <meshPhysicalMaterial
          color={config.palette.stem}
          roughness={0.68}
          metalness={0.0}
          clearcoat={0.12}
          clearcoatRoughness={0.55}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── Dormant bud ──────────────────────────────────────────────── */}
      <mesh ref={budRef}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshPhysicalMaterial
          color="#2e5c2a"
          emissive="#5db844"
          emissiveIntensity={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* ── Leaves ───────────────────────────────────────────────────── */}
      <instancedMesh
        ref={leavesRef}
        args={[leafGeometry, undefined, LEAF_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color={config.palette.leaf}
          map={leafMap}
          transparent={true}
          alphaTest={0.08}
          roughness={0.7}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
