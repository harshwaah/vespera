import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { DEFAULT_FLOWER_CONFIG } from './FlowerConfig';
import FlowerSystem from './FlowerSystem';

interface FlowerCanvasProps {
  pinchDistancesRef: React.MutableRefObject<[number, number]>;
}

export default function FlowerCanvas({ pinchDistancesRef }: FlowerCanvasProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        {/* ── Cinematic lighting rig ────────────────────────────────────────── */}
        {/* Ambient fill — warm, not harsh */}
        <ambientLight intensity={0.55} color="#ffe8d4" />

        {/* Key light: upper-left, warm white — primary shadow caster */}
        <directionalLight
          position={[-4, 9, 5]}
          intensity={1.8}
          color="#fff5e8"
        />

        {/* Cool rim / back light — makes petals translucent from behind */}
        <directionalLight
          position={[6, -2, -4]}
          intensity={0.7}
          color="#b8d4ff"
        />

        {/* Soft under-fill so leaves don't go pure black */}
        <directionalLight
          position={[0, -6, 4]}
          intensity={0.3}
          color="#e8f4d4"
        />

        {/* Environment preset gives IBL for realistic material reflections */}
        <Environment preset="studio" />

        <FlowerSystem
          config={DEFAULT_FLOWER_CONFIG}
          pinchDistancesRef={pinchDistancesRef}
        />
      </Canvas>
    </div>
  );
}
