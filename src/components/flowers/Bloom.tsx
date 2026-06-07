import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { FlowerConfig } from './FlowerConfig';

interface BloomProps {
  config: FlowerConfig;
  curve: THREE.CatmullRomCurve3;
  pinchDistancesRef: React.MutableRefObject<[number, number]>;
  growthRef: React.MutableRefObject<number>;
}

export default function Bloom({ config, curve, pinchDistancesRef, growthRef }: BloomProps) {
  const groupRef     = useRef<THREE.Group>(null);
  const petalMeshRef = useRef<THREE.InstancedMesh>(null);
  const stamenRef    = useRef<THREE.Mesh>(null);
  const stateRef     = useRef({ bloom: 0, velocity: 0, idlePhase: 0 });

  const { petalCount, layers, baseScale } = config.species;
  const totalPetals = petalCount * layers;

  // ── Textures ─────────────────────────────────────────────────────────────
  const [colorMap] = useTexture(['/textures/petal_albedo.png']);
  colorMap.wrapS = colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.premultiplyAlpha = false;

  // ── Petal geometry — botanically cupped shape ─────────────────────────────
  const petalGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.5, 1.8, 12, 18);
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // -0.9 (base) to +0.9 (tip)
      // Normalize y to 0→1 from base to tip
      const yN = (y + 0.9) / 1.8;
      // Cup the petal: concave along width, tapers at tip
      const cup = -Math.pow(x * 2.2, 2) * 0.18 * (1.0 - yN * 0.5);
      pos.setZ(i, cup);
      // Taper width progressively toward tip
      const taperFactor = 1.0 - yN * 0.55;
      pos.setX(i, x * taperFactor);
      // Very subtle up-curl at the very tip
      if (yN > 0.85) {
        const tipCurl = (yN - 0.85) / 0.15;
        pos.setZ(i, (pos.getZ(i) || 0) - tipCurl * tipCurl * 0.12);
      }
    }
    geom.computeVertexNormals();
    // Move pivot to base of petal (so rotation opens from center)
    geom.translate(0, 0.9, 0);
    return geom;
  }, []);

  // ── Stamen geometry — cluster of tiny stamens ─────────────────────────────
  const stamenGeometry = useMemo(() => new THREE.SphereGeometry(0.06, 8, 8), []);

  useFrame(({ clock }, delta) => {
    const [, rightDist] = pinchDistancesRef.current;
    const mapDist = (d: number) => THREE.MathUtils.clamp((d - 0.05) / 0.25, 0, 1);
    const targetBloom = mapDist(rightDist);

    // Spring physics for bloom open/close
    const tension  = 72;
    const friction = 13;
    const accel = tension * (targetBloom - stateRef.current.bloom) - friction * stateRef.current.velocity;
    stateRef.current.velocity += accel * delta;
    stateRef.current.bloom = THREE.MathUtils.clamp(
      stateRef.current.bloom + stateRef.current.velocity * delta,
      0, 1.08 // tiny overshoot allowed
    );

    // Idle breathing phase
    stateRef.current.idlePhase += delta * 0.6;
    const t = clock.elapsedTime;

    const g = growthRef.current;

    // ── Position bloom at exact stem tip ─────────────────────────────────
    if (groupRef.current) {
      const tip = curve.getPoint(Math.max(g, 0.001));
      groupRef.current.position.copy(tip);

      // Face toward camera with a slight presentation angle (NOT fully billboarded)
      // Rotate so petals spread in XZ plane, with a forward tilt toward viewer
      groupRef.current.rotation.set(
        Math.PI / 2.3,    // Tilt toward viewer — about 78° from vertical
        0.18 + Math.sin(t * 0.2) * 0.012, // very subtle lazy turn
        -0.08,            // slight lean for asymmetry
        'YXZ'
      );

      // Scale with stem growth; dormant bud = tiny closed sphere
      const baseVis = THREE.MathUtils.clamp(g * 6, 0, 1);
      // When barely grown, show very tiny closed bud (scale ~0.15)
      const minBudScale = 0.12;
      const visScale = THREE.MathUtils.lerp(minBudScale, 1.0, baseVis);
      groupRef.current.scale.setScalar(visScale * baseScale);
    }

    // ── Stamen: small sphere at center, only visible when open ───────────
    if (stamenRef.current) {
      const bloom = stateRef.current.bloom;
      const stamenScale = THREE.MathUtils.clamp(bloom * 3 - 0.5, 0, 1);
      stamenRef.current.scale.setScalar(stamenScale);
      // Idle bob
      stamenRef.current.position.y = 0.05 + Math.sin(t * 1.4) * 0.006;
    }

    // ── Petal instancing ──────────────────────────────────────────────────
    if (!petalMeshRef.current) return;

    const dummy = new THREE.Object3D();
    const bloom = stateRef.current.bloom;
    let index = 0;

    for (let layer = 0; layer < layers; layer++) {
      // Inner layer opens last (higher stagger offset)
      const layerDelay  = layer * 0.20;
      const layerScale  = 1.0 - layer * 0.18;
      // Inner layer petals are rotated slightly relative to outer
      const layerRotOffset = layer * (Math.PI / petalCount);

      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + layerRotOffset;

        // Stagger opening across petals: each petal opens slightly later
        const petalDelay = (i / petalCount) * 0.06;
        const rawProgress = THREE.MathUtils.clamp(
          (bloom - layerDelay - petalDelay) / (1 - layerDelay),
          0, 1
        );
        // Cubic ease-out for organic feel
        const eased = 1 - Math.pow(1 - rawProgress, 3);

        // Open angle: fully closed (bud) → fully open
        // Bud: petals nearly vertical (closed around center)
        // Full: petals spread outward
        const closedAngle = 0.06;  // nearly closed, forming bud tip shape
        const openAngle   = 0.52;  // fully spread, bowl-like
        const petalAngle  = THREE.MathUtils.lerp(closedAngle, openAngle, eased);

        // Idle breathing: tiny flutter when open
        const breathe = Math.sin(t * 1.1 + i * 0.8 + layer * 1.3) * 0.012 * eased;

        // Scale: starts tiny, grows as it opens
        const currentScale = THREE.MathUtils.lerp(0.25, 1.0, eased) * layerScale;

        dummy.position.set(0, 0, 0);
        dummy.rotation.set(petalAngle + breathe, angle, 0, 'YXZ');
        dummy.scale.setScalar(currentScale);
        dummy.updateMatrix();

        petalMeshRef.current.setMatrixAt(index, dummy.matrix);
        index++;
      }
    }
    petalMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* ── Petals ─────────────────────────────────────────────────────────── */}
      <instancedMesh
        ref={petalMeshRef}
        args={[petalGeometry, undefined, totalPetals]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          color={config.palette.secondary}
          map={colorMap}
          alphaMap={colorMap}
          emissive={config.palette.primary}
          emissiveIntensity={0.12}
          roughness={0.30}
          metalness={0.0}
          transmission={0.18}
          thickness={0.04}
          ior={1.4}
          attenuationDistance={0.8}
          attenuationColor={config.palette.primary}
          side={THREE.DoubleSide}
          transparent={true}
          alphaTest={0.06}
          depthWrite={false}
        />
      </instancedMesh>

      {/* ── Center stamen / pistil ─────────────────────────────────────────── */}
      <mesh ref={stamenRef} geometry={stamenGeometry} scale={0}>
        <meshPhysicalMaterial
          color="#f5e642"
          emissive="#e8c800"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>

      {/* Tiny stamen cluster (decorative) */}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2;
        return (
          <mesh
            key={k}
            geometry={stamenGeometry}
            position={[Math.cos(a) * 0.10, 0.04, Math.sin(a) * 0.10]}
            scale={0.5}
          >
            <meshPhysicalMaterial
              color="#f0d030"
              emissive="#d4a800"
              emissiveIntensity={0.5}
              roughness={0.45}
            />
          </mesh>
        );
      })}
    </group>
  );
}
