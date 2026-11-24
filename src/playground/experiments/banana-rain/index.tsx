import * as THREE from 'three';
import { useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Detailed, Environment } from '@react-three/drei';
import { EffectComposer, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import type { GLTF } from 'three-stdlib';

interface BananaData {
  y: number;
  x: number;
  spin: number;
  rX: number;
  rZ: number;
}

type BananaGLTF = GLTF & {
  nodes: {
    banana_high: THREE.Mesh;
    banana_mid: THREE.Mesh;
    banana_low: THREE.Mesh;
  };
  materials: {
    skin: THREE.Material;
  };
};

function Banana({ index, z, speed }: { index: number; z: number; speed: number }) {
  const ref = useRef<THREE.LOD>(null);
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -z]);
  const { nodes, materials } = useGLTF(`${import.meta.env.BASE_URL}3d/banana-v1-transformed.glb`) as unknown as BananaGLTF;

  const [data] = useState<BananaData>({
    y: THREE.MathUtils.randFloatSpread(height * 2),
    x: THREE.MathUtils.randFloatSpread(2),
    spin: THREE.MathUtils.randFloat(8, 12),
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });

  useFrame((state, dt) => {
    if (!ref.current) return;
    if (dt < 0.1) {
      ref.current.position.set(
        index === 0 ? 0 : data.x * width,
        (data.y += dt * speed),
        -z
      );
    }
    ref.current.rotation.set(
      (data.rX += dt / data.spin),
      Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
      (data.rZ += dt / data.spin)
    );
    if (data.y > height * (index === 0 ? 4 : 1)) {
      data.y = -(height * (index === 0 ? 4 : 1));
    }
  });

  return (
    <Detailed ref={ref} distances={[0, 65, 80]}>
      <mesh geometry={nodes.banana_high.geometry} material={materials.skin} material-emissive="#ff9f00" />
      <mesh geometry={nodes.banana_mid.geometry} material={materials.skin} material-emissive="#ff9f00" />
      <mesh geometry={nodes.banana_low.geometry} material={materials.skin} material-emissive="#ff9f00" />
    </Detailed>
  );
}

const BananaRain = () => {
  const [speed, setSpeed] = useState(1);
  const count = 10;
  const depth = 40;
  const easing = (x: number) => Math.sqrt(1 - Math.pow(x - 1, 2));

  return (
    <div className="w-full h-full relative bg-[#ffbf40]">
      <Canvas
        flat
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#ffbf40']} />
        <spotLight position={[10, 20, 10]} penumbra={1} decay={0} intensity={3} color="orange" />
        {Array.from({ length: count }, (_, i) => (
          <Banana key={i} index={i} z={Math.round(easing(i / count) * depth)} speed={speed} />
        ))}
        <Environment files={`${import.meta.env.BASE_URL}hdri/venice_sunset_1k.hdr`} />
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <DepthOfField target={[0, 0, 10]} focalLength={0.05} bokehScale={3} height={480} />
          <ToneMapping />
        </EffectComposer>
      </Canvas>

      {/* Speed slider */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <input
          type="range"
          min="0"
          max="10"
          value={speed}
          step="1"
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-32 -rotate-90 origin-left accent-[#1a1a1a] cursor-pointer"
        />
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-8 left-8 max-w-md z-10">
        <p className="text-xs font-mono text-black/30 uppercase tracking-widest mb-2">
          Experiment 002
        </p>
        <h2 className="text-2xl font-bold text-black/80 mb-2">Banana Rain</h2>
        <p className="text-sm text-black/50 leading-relaxed">
          10 bananas 3D caindo com depth of field cinematográfico. 
          LOD automático, pós-processamento com bokeh e tone mapping.
          Use o slider para controlar a velocidade.
        </p>
      </div>

      {/* Credit */}
      <div className="absolute bottom-8 right-8 z-10">
        <p className="text-[10px] font-mono text-black/25">
          Based on 0xca0a/B4N4N4S • Model by thesidekick (CC-BY-4.0)
        </p>
      </div>
    </div>
  );
};

export default BananaRain;
