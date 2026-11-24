import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';

// Configuration
const DEFAULT_SCALE = 3.2; 



interface ModelProps {
  url: string;
  scale?: number;
}

function EarthModel({ url, scale = DEFAULT_SCALE }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  // Smooth rotation state
  const targetRotation = useRef({ x: 0, y: 0 });
  
  useFrame((_, delta) => {
    if (modelRef.current) {
      // Calculate target rotation based on scroll
      const scrollY = window.scrollY;
      targetRotation.current.y = scrollY * 0.002;
      targetRotation.current.x = scrollY * 0.0005;

      // Smoothly interpolate current rotation to target with easing
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y, 
        targetRotation.current.y, 
        delta * 2 
      );
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x, 
        targetRotation.current.x, 
        delta * 2
      );
    }
  });

  return (
    // Position moved to right (x=5) so only half is visible
    <group ref={modelRef} position={[5, -1, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

const Earth3D = () => {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none grayscale opacity-60">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <spotLight position={[-10, -10, -5]} intensity={0.5} />
          <Environment files={`${import.meta.env.BASE_URL}hdri/potsdamer_platz_1k.hdr`} />
          
          <EarthModel url={`${import.meta.env.BASE_URL}3d/lowpoly_earth.glb`} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Earth3D;

// Preload the model
useGLTF.preload(`${import.meta.env.BASE_URL}3d/lowpoly_earth.glb`);
