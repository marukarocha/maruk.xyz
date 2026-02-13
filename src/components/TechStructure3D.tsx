import { useRef, useEffect, Suspense, useLayoutEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const DEFAULT_SCALE = 12; // Aumentado para preencher mais e impor presença
const MODEL_URL = "/3d/tvs.glb"; 
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

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
const TechModel = forwardRef(({ url, scale = DEFAULT_SCALE, rotation = DEFAULT_ROTATION }: ModelProps, ref) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  
  // Refs para as duas versões (Textura vs Wireframe)
  const wireframeRef = useRef<THREE.Group>(null);
  const texturedRef = useRef<THREE.Group>(null);
  
  // Create two distinct versions of the scene
  const [wireframeScene, setWireframeScene] = useState<THREE.Group | null>(null);
  const [texturedScene, setTexturedScene] = useState<THREE.Group | null>(null);

  // Expose groupRef to parent
  useImperativeHandle(ref, () => groupRef.current);

  useEffect(() => {
    if (!scene) return;

    // Correção de Texturas (V Axis Flip)
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
         
         materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
               if (mat.map) {
                 mat.map.flipY = true; 
                 mat.map.needsUpdate = true;                            
               }
            }
         });
      }
    });

    // 1. Setup Wireframe Version (Destino da transição - "Luminoso")
    const wf = scene.clone(true);
    wf.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          wireframe: true,
          color: new THREE.Color("#00ffff"),
          emissive: new THREE.Color("#00aa88"),
          emissiveIntensity: 3, 
          transparent: true,
          opacity: 0, // Começa invisível
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
      }
    });
    setWireframeScene(wf);

    // 2. Setup Textured Version (Origem - "Real")
    const tx = scene.clone(true);
    tx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const originalMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (originalMat) {
           const newMat = originalMat.clone();
           newMat.transparent = true;
           newMat.opacity = 1; // Começa visível
           newMat.side = THREE.DoubleSide;
           mesh.material = newMat;
        }
      }
    });
    setTexturedScene(tx);

  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current || !texturedRef.current || !wireframeRef.current) return;

    const ctx = gsap.context(() => {
      
      // Auto-rotation Linked to Scroll (Restored Feature)
      // This rotates the model 360 degrees as the user scrolls through the About section
      gsap.to(groupRef.current!.rotation, {
          y: Math.PI * 2, // 360 degrees
          ease: "none",
          scrollTrigger: {
              trigger: "#about",
              start: "top bottom",
              end: "bottom top", 
              scrub: 1
          }
      });

      // 2. Transição de Transformação (Textura -> Wireframe) - Mantida ligada ao scroll

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "center 40%", 
          end: "bottom top",
          scrub: true
        }
      });

      if (wireframeScene) {
          wireframeRef.current?.traverse((child) => {
             if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.Material;
                tl.to(mat, { opacity: 0.4, duration: 1 }, 0);
             }
          });
      }
      
      if (texturedScene) {
         texturedRef.current?.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
               const mat = (child as THREE.Mesh).material as THREE.Material;
               tl.to(mat, { opacity: 0, duration: 1 }, 0);
            }
         });
      }

    });

    return () => ctx.revert();
  }, [texturedScene, wireframeScene]);

  return (
    <group 
      ref={groupRef} 
      position={[0, -2, 0]} 
      scale={scale} 
      rotation={[0, Math.PI, 0]} 
    >
      <group ref={wireframeRef}>
        {wireframeScene && <primitive object={wireframeScene} />}
      </group>
      <group ref={texturedRef}>
        {texturedScene && <primitive object={texturedScene} />}
      </group>
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
          <Environment preset="night" /> 
          
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
});
