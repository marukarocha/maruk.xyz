import { useRef, useEffect, Suspense, useLayoutEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const DEFAULT_SCALE = 12; // Aumentado para preencher mais e impor presença
const MODEL_URL = `${import.meta.env.BASE_URL}3d/tvs.glb`; 
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

// Hologram Shader (converted from TSL to GLSL)
const HOLOGRAM_VERTEX = `
  varying vec3 vNormalView;
  varying vec3 vPositionLocal;

  void main() {
    vPositionLocal = position;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HOLOGRAM_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uFlickerAmount;
  uniform float uIntensity;
  uniform float uOpacity;

  varying vec3 vNormalView;
  varying vec3 vPositionLocal;

  float scanlines(float posy, float t) {
    float val = fract(posy * 30.0 - t * 0.5);
    return smoothstep(0.5, 0.95, val);
  }

  float fresnel(vec3 viewNormal) {
    float x2 = viewNormal.x * viewNormal.x;
    float y2 = viewNormal.y * viewNormal.y;
    return pow(sqrt(x2 + y2), 5.0);
  }

  float flicker(float t, float amount) {
    float f1 = fract(t * 28.7);
    float f2 = fract(t * 35.3);
    float s = smoothstep(0.6, 0.8, f1 * f2);
    return 1.0 - s * 0.3 * amount;
  }

  void main() {
    float scan = scanlines(vPositionLocal.y, uTime);
    float fres = fresnel(vNormalView);
    float flick = flicker(uTime, uFlickerAmount);

    float compose = (0.05 + fres * 1.0 + scan * fres * uIntensity) * flick;
    compose = clamp(compose, 0.0, 1.0);

    vec3 finalColor = uBaseColor * compose;
    gl_FragColor = vec4(finalColor, compose * uOpacity);
  }
`;

interface ModelProps {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-24 h-[1px] bg-white/20 mb-2 relative overflow-hidden">
          <div 
            className="absolute top-0 z-10 left-0 h-full bg-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

// Wrap TechModel with forwardRef to expose rotation control
const TechModel = forwardRef(({ url }: ModelProps, ref) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  
  // Ref para a versão holográfica
  const hologramRef = useRef<THREE.Group>(null);
  
  const [hologramScene, setHologramScene] = useState<THREE.Group | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Ref to store hologram material uniforms for time update
  const hologramMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);

  // Expose groupRef to parent
  useImperativeHandle(ref, () => groupRef.current);

  useEffect(() => {
    if (!scene) return;

    // Setup Hologram Version - única versão visível
    const hologramMats: THREE.ShaderMaterial[] = [];
    const holo = scene.clone(true);
    holo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const holoMat = new THREE.ShaderMaterial({
          vertexShader: HOLOGRAM_VERTEX,
          fragmentShader: HOLOGRAM_FRAGMENT,
          uniforms: {
            uTime: { value: 0 },
            uBaseColor: { value: new THREE.Color(0.0, 1.0, 0.8) }, // Cyan/teal hologram
            uFlickerAmount: { value: 0.5 },
            uIntensity: { value: 1.31 },
            uOpacity: { value: 1 }, // Visível desde o início
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        mesh.material = holoMat;
        hologramMats.push(holoMat);
      }
    });
    hologramMaterialsRef.current = hologramMats;
    setHologramScene(holo);

  }, [scene]);

  // Update hologram shader time uniform every frame
  useFrame((_, delta) => {
    hologramMaterialsRef.current.forEach((mat) => {
      mat.uniforms.uTime.value += delta;
    });
  });

  useLayoutEffect(() => {
    if (!groupRef.current || !hologramRef.current) return;

    const ctx = gsap.context(() => {

      const group = groupRef.current!;

      // ===== AUTOMATIC ENTRANCE (anticipated for flow continuity) =====
      gsap.set(group.scale, { x: 0, y: 0, z: 0 });
      gsap.set(group.position, { y: 6 });
      gsap.set(group.rotation, { x: 0, y: 0, z: 0 });

      // Auto entrance: smooth scale up + gentle drop + spin
      ScrollTrigger.create({
        trigger: "#about",
        start: "top bottom-=100",
        once: true,
        onEnter: () => {
          gsap.to(group.scale, { 
            x: DEFAULT_SCALE, y: DEFAULT_SCALE, z: DEFAULT_SCALE, 
            duration: 2.5, ease: "power3.out" 
          });
          gsap.to(group.position, { 
            y: -2, duration: 2.2, ease: "power2.out" 
          });
          gsap.to(group.rotation, { 
            y: Math.PI * 2, // 360 degrees — smooth, not frantic
            duration: 3, ease: "power2.out" 
          });
        }
      });

      // ===== SCROLL-LINKED ROTATION (additive, continuous through pin) =====
      // Uses += so it adds on top of the entrance rotation instead of conflicting
      gsap.to(group.rotation, {
        y: `+=${Math.PI * 3}`, // 1.5 turns over the entire pin — slow and fluid
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "top top",
          end: "+=2400",
          scrub: 3, // higher scrub = smoother/laggier rotation
        }
      });

      // ===== SCROLL-LINKED EXIT (synced with About pin end) =====
      // Timeline matches About.tsx: 18 units over +=2400px
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top top",
          end: "+=2400",
          scrub: 0.8,
        }
      });

      // --- Exit synced with last slide fadeout at position 15 — slow and gentle ---
      masterTl
        .to(group.scale, { x: 0, y: 0, z: 0, duration: 2, ease: "power1.inOut" }, 15)
        .to(group.position, { y: 4, duration: 2, ease: "power1.inOut" }, 15);

    });

    return () => ctx.revert();
  }, [hologramScene]);

  // Click interaction: random spin between 30° and 360°, smooth mechanical arm feel
  const handleClick = useCallback(() => {
    if (!groupRef.current) return;
    const randomDeg = 30 + Math.random() * 330; // 30 to 360 degrees
    const randomRad = (randomDeg * Math.PI) / 180;
    const direction = Math.random() > 0.5 ? 1 : -1;
    gsap.to(groupRef.current.rotation, {
      y: `+=${randomRad * direction}`,
      duration: 2.5,
      ease: "power4.out",
      overwrite: "auto",
    });
  }, []);

  return (
    <group 
      ref={groupRef} 
      position={[0, 6, 0]} 
      scale={0} 
      rotation={[0, 0, 0]} 
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <group ref={hologramRef}>
        {hologramScene && <primitive object={hologramScene} />}
      </group>
      {/* HUD "Click" label on hover */}
      {isHovered && (
        <Html center distanceFactor={4} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center gap-1 select-none">
            <span 
              className="text-[10px] font-mono uppercase tracking-[0.3em] px-3 py-1 rounded-full border animate-pulse"
              style={{
                color: '#ffaa00',
                borderColor: 'rgba(255, 170, 0, 0.4)',
                background: 'rgba(255, 170, 0, 0.08)',
                backdropFilter: 'blur(4px)',
                textShadow: '0 0 8px rgba(255, 170, 0, 0.5)',
              }}
            >
              Click
            </span>
          </div>
        </Html>
      )}
    </group>
  );
});

function CameraController() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(6, -1.50, 14); 
      
      gsap.to(camera.position, {
        z: 5.8, 
        y: -0.7,
        x: 0,
        duration: 2.5,
        ease: "power2.out",
        delay: 0.5
      });
      
      initialized.current = true;
    }
  }, [camera]);

  return null;
}

// Forward ref to TechStructure3D to pass down to TechModel
export const TechStructure3D = forwardRef(({ scale, rotation = DEFAULT_ROTATION }: { scale?: number, rotation?: [number, number, number] }, ref) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true
        }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} shadow-mapSize={2048} castShadow />
          
          <TechModel ref={ref} url={MODEL_URL} scale={scale} rotation={rotation} />
          
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          <Environment files={`${import.meta.env.BASE_URL}hdri/dikhololo_night_1k.hdr`} />
          
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
});
