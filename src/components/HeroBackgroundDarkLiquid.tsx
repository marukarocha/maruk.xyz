import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

const LiquidShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Correct aspect ratio
      vec2 uv = vUv - 0.5;
      uv.x *= uResolution.x / uResolution.y;
      
      // Mouse interaction (Parallax look)
      uv -= uMouse * 0.1;
      
      // Much faster time for liquid flow perception
      float t = uTime * 0.8;
      
      // Base circle SDF
      float r = length(uv);
      
      // Complex liquid distortion
      // Layer 1: Large slow shape wobble
      float n1 = snoise(uv * 2.5 + vec2(t * 0.2, cos(t * 0.3)));
      
      // Layer 2: Fast surface ripples
      float n2 = snoise(uv * 5.0 - t);
      
      // Layer 3: Detail
      float n3 = snoise(uv * 10.0 + t * 2.0);

      // Combine for total distortion
      // We displace the radius reading based on noise
      float distortion = n1 * 0.12 + n2 * 0.04 + n3 * 0.01;
      
      // Distorted Radius
      float dist = r + distortion;
      
      // Define liquid shape
      float circleRadius = 0.32;
      float edgeSoftness = 0.005; // Sharp liquid edge
      float alpha = 1.0 - smoothstep(circleRadius - edgeSoftness, circleRadius + edgeSoftness, dist);
      
      // --- COLOR & LIGHTING ---
      
      // 1. Base Dark (Viscous fluid)
      vec3 baseColor = vec3(0.01, 0.01, 0.02);
      
      // 2. Internal Flow (Lighter patches moving)
      float flowMap = n1 * 0.6 + n2 * 0.4;
      vec3 flowColor = vec3(0.05, 0.05, 0.1); 
      vec3 fluidBody = mix(baseColor, flowColor, smoothstep(-0.5, 0.8, flowMap));
      
      // 3. Rim Lighting (The edge lighting)
      // Edge detection based on distance from center + distortion
      float rimIntensity = smoothstep(circleRadius - 0.1, circleRadius, dist);
      vec3 rimColor = vec3(0.2, 0.3, 0.5); // Blue-ish rim
      
      // 4. Specular Highlight (The shiny reflection simulated)
      // We create a fake "light source" reflection top-left
      vec2 lightPos = uMouse * 0.5 + vec2(-0.2, 0.2); // Follow mouse lightly
      float lightDist = distance(uv + distortion * 0.5, lightPos);
      float specular = 1.0 - smoothstep(0.05, 0.15, lightDist);
      // Warped highlights
      float warpHighlight = smoothstep(0.6, 0.8, n2 * n1);
      
      vec3 finalColor = fluidBody + rimColor * rimIntensity * 0.8;
      finalColor += vec3(1.0) * specular * 0.6; // Glint
      finalColor += vec3(0.5, 0.6, 0.8) * warpHighlight * 0.2; // Surface shine

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const LiquidPlane = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track mouse globally to avoid z-index blocking issues
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1..1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      
      // Smooth lerp
      const currentX = materialRef.current.uniforms.uMouse.value.x;
      const currentY = materialRef.current.uniforms.uMouse.value.y;
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      
      materialRef.current.uniforms.uMouse.value.x = currentX + (targetX - currentX) * 0.05;
      materialRef.current.uniforms.uMouse.value.y = currentY + (targetY - currentY) * 0.05;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) }
    }),
    [size.height, size.width]
  );

  return (
    <mesh scale={[10, 10, 1]}> 
      <planeGeometry args={[1, 1]} /> 
      <shaderMaterial
        ref={materialRef}
        vertexShader={LiquidShader.vertexShader}
        fragmentShader={LiquidShader.fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export const HeroBackgroundDarkLiquid = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#111] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2], fov: 75 }} gl={{ alpha: true }}>
        <LiquidPlane />
      </Canvas>
    </div>
  );
};
