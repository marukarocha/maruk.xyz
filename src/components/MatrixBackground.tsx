import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useInView } from 'framer-motion';
import * as THREE from 'three';

const MatrixShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ff00') }, // Default green, can be overridden
    uResolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = vUv;
        
        // Grid config
        float columns = 40.0;
        float rows = 20.0;
        
        // Discretize UV
        vec2 gridUv = vec2(floor(uv.x * columns), floor(uv.y * rows));
        
        // Random speed for each column
        float speed = random(vec2(gridUv.x, 1.0)) * 0.5 + 0.1;
        
        // Falling trail
        float fall = mod(uTime * speed + uv.y, 1.0); // Simple slide down
        
        // The "head" of the drop is brighter
        float head = smoothstep(0.9, 1.0, fall);
        
        // The trail
        float trail = smoothstep(0.0, 1.0, fall);
        
        // Random characters flickering (simulated by noise)
        float flick = step(0.5, random(vec2(gridUv.x, gridUv.y + floor(uTime * 10.0))));
        
        // Combine
        float alpha = (head + trail * 0.3) * flick;
        
        // Fade out at edges
        alpha *= smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
        
        gl_FragColor = vec4(uColor, alpha * 0.6); // Reduced opacity
    }
  `
};

const MatrixPlane = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Create shader material instance
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#10b981') }, // Emerald-500 equivalent
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: MatrixShaderMaterial.vertexShader,
    fragmentShader: MatrixShaderMaterial.fragmentShader,
    transparent: true,
  }), []);

  useFrame((state) => {
    if (mesh.current) {
      (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -1]} scale={[20, 10, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} />
    </mesh>
  );
};

export const MatrixBackground = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "0px 0px -100px 0px" });

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 opacity-40 h-full w-full">
      {isInView && (
        <Canvas camera={{ position: [0, 0, 1] }} gl={{ powerPreference: "high-performance", alpha: true }}>
          <MatrixPlane />
        </Canvas>
      )}
    </div>
  );
};
