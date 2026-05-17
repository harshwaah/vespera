import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader   from '../shaders/vertex.glsl?raw';
import fragmentShader from '../shaders/fragment.glsl?raw';
import type { BoxCoords } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EFFECT_NAMES = [
  'Inferno',
  'Neon',
  'Thermal',
  'Matrix',
  'Glitch',
  'Edges',
  'Constellation',
  'Glass',
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EffectsCanvasProps {
  videoRef:    React.MutableRefObject<HTMLVideoElement | null>;
  boxRef:      React.MutableRefObject<BoxCoords>;
  quadRef:     React.MutableRefObject<number[]>;
  effectIndex: number;
  isTripleMode?: boolean;
}

interface ShaderPlaneProps {
  videoRef:    React.MutableRefObject<HTMLVideoElement | null>;
  boxRef:      React.MutableRefObject<BoxCoords>;
  quadRef:     React.MutableRefObject<number[]>;
  effectIndex: number;
  isTripleMode?: boolean;
}

// ─── ShaderPlane — lives inside <Canvas> ─────────────────────────────────────

function ShaderPlane({ videoRef, boxRef, quadRef, effectIndex, isTripleMode = false }: ShaderPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create texture imperatively, update every frame
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useFrame(({ gl }) => {
    const video = videoRef.current;
    const mesh = meshRef.current;
    if (!video || !mesh) return;

    // Create texture on first frame that has data
    if (!textureRef.current && video.readyState >= 2 && video.videoWidth > 0) {
      const tex = new THREE.VideoTexture(video);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBAFormat;
      tex.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = tex;
      
      const mat = mesh.material as THREE.ShaderMaterial;
      mat.uniforms.uTexture.value = tex;
      mat.needsUpdate = true;
      console.log('[VESPERA] Texture assigned in useFrame, videoWidth:', video.videoWidth);
    }

    // Force update every frame
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }

    // Update other uniforms
    const mat = mesh.material as THREE.ShaderMaterial;
    if (mat.uniforms) {
      const quad = quadRef.current;
      mat.uniforms.uQuadTop.value.set(quad[0], quad[1], quad[2], quad[3]);
      mat.uniforms.uQuadBottom.value.set(quad[4], quad[5], quad[6], quad[7]);

      mat.uniforms.uTime.value += gl.info.render.frame ? 0.016 : 0.016;
      mat.uniforms.uBox.value.set(...boxRef.current);
      mat.uniforms.uEffect.value = THREE.MathUtils.lerp(
        mat.uniforms.uEffect.value, effectIndex, 0.06
      );
      mat.uniforms.uMode.value = isTripleMode ? 1.0 : 0.0;
      mat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uTime: { value: 0 },
    uBox: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuadTop: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuadBottom: { value: new THREE.Vector4(0, 0, 0, 0) },
    uEffect: { value: 0.0 },
    uMode: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  }), []);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Effect name HUD (outside R3F tree) ──────────────────────────────────────

function EffectHUD({ effectIndex }: { effectIndex: number }) {
  const [color, setColor] = useState('rgba(255,255,255,0.30)');

  useEffect(() => {
    setColor('rgba(255,255,255,0.70)');
    const id = setTimeout(() => setColor('rgba(255,255,255,0.30)'), 100);
    return () => clearTimeout(id);
  }, [effectIndex]);

  return (
    <div
      style={{
        position:      'absolute',
        bottom:        '1.5rem',
        right:         '1.5rem',
        fontFamily:    'monospace',
        fontSize:      '0.75rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        color,
        transition:    'color 2s ease',
        zIndex:        10,
      }}
    >
      {EFFECT_NAMES[effectIndex]}
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export default function EffectsCanvas({ videoRef, boxRef, quadRef, effectIndex, isTripleMode = false }: EffectsCanvasProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1, position: [0, 0, 0.5] }}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <ShaderPlane videoRef={videoRef} boxRef={boxRef} quadRef={quadRef} effectIndex={effectIndex} isTripleMode={isTripleMode} />
      </Canvas>

      <EffectHUD effectIndex={effectIndex} />
    </div>
  );
}
