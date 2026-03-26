import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowRight, CircleDot, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

type HotspotId = 'checkout' | 'microwave' | 'pickupA' | 'pickupB' | 'seating';

interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration?: number;
}

interface HotspotBlueprint {
  id: HotspotId;
  label: string;
  eyebrow: string;
  description: string;
  detail: string;
  metric: string;
  accent: string;
  nodePatterns: string[];
  fallback: [number, number, number];
  markerLift?: number;
  camera: CameraPose;
}

interface ResolvedHotspot extends HotspotBlueprint {
  position: THREE.Vector3;
}

const OVERVIEW_POSE: CameraPose = {
  position: [11.6, 8.2, 13.8],
  target: [0.6, 3.2, -1.1],
  fov: 34,
  duration: 1.4,
};

const INTRO_POSE: CameraPose = {
  position: [18, 11.5, 19.5],
  target: [0.3, 2.8, -1.4],
  fov: 38,
  duration: 2.3,
};

const MODEL_ROTATION_Y = THREE.MathUtils.degToRad(160);

const HOTSPOT_BLUEPRINTS: HotspotBlueprint[] = [
  {
    id: 'checkout',
    label: 'Checkout',
    eyebrow: 'Fluxo de venda',
    description: 'Caixa principal com ponto de interação para abrir cardápio, cupom e formas de pagamento.',
    detail: 'Aqui a câmera encosta no núcleo do PDV para demonstrar checkout guiado, badges dinâmicos e CTA contextual.',
    metric: 'Câmera 01',
    accent: '#f97316',
    nodePatterns: ['Plane', 'Cube.002', 'Cube.005', 'model_8.001'],
    fallback: [-0.2, 3.8, 0.5],
    markerLift: 0.45,
    camera: {
      position: [5.9, 5.1, 8.8],
      target: [-0.15, 3.7, 0.25],
      fov: 27,
      duration: 1.25,
    },
  },
  {
    id: 'microwave',
    label: 'Heat Station',
    eyebrow: 'Autoatendimento',
    description: 'Estação lateral para aquecimento e retirada rápida com affordance claro para toque.',
    detail: 'O foco aproxima do equipamento para vender a ideia de menu contextual por equipamento e estado operacional.',
    metric: 'Câmera 02',
    accent: '#38bdf8',
    nodePatterns: ['Stand MIcroonda.006', 'meubleMicroOnde.obj.cleaner.materialmerger.gles'],
    fallback: [2.35, 4.9, 1.45],
    markerLift: 0.5,
    camera: {
      position: [8.7, 7.2, 6.2],
      target: [2.4, 4.95, 1.55],
      fov: 28,
      duration: 1.35,
    },
  },
  {
    id: 'pickupA',
    label: 'Pickup One',
    eyebrow: 'Retirada quente',
    description: 'Primeira ilha de refeição destacando o fluxo de produção, confirmação e retirada.',
    detail: 'O menu lateral pode trocar entre status de preparo, tempo e prioridade de retirada sem sair da cena.',
    metric: 'Câmera 03',
    accent: '#34d399',
    nodePatterns: ['Refeicao Null'],
    fallback: [1.42, 4.85, -3.35],
    markerLift: 0.52,
    camera: {
      position: [7.1, 6.1, 1.7],
      target: [1.45, 4.85, -3.35],
      fov: 26,
      duration: 1.25,
    },
  },
  {
    id: 'pickupB',
    label: 'Pickup Two',
    eyebrow: 'Retirada fria',
    description: 'Segunda ilha para reforçar navegação por setores e múltiplos focos de operação no mesmo ambiente.',
    detail: 'Serve como prova de que a interface aguenta vários pontos ativos com animação de câmera sem perder contexto.',
    metric: 'Câmera 04',
    accent: '#a78bfa',
    nodePatterns: ['Refeicao Null.001'],
    fallback: [-5.1, 3.95, -3.9],
    markerLift: 0.46,
    camera: {
      position: [0.7, 5.7, 2.7],
      target: [-5.08, 3.95, -3.92],
      fov: 28,
      duration: 1.3,
    },
  },
  {
    id: 'seating',
    label: 'Cafe Corner',
    eyebrow: 'Ambientação',
    description: 'Mesa e banquetas como área de apoio para testar storytelling, navegação e transições mais amplas.',
    detail: 'Esse enquadramento abre um respiro de composição e mostra como o PDV pode vender atmosfera, não só operação.',
    metric: 'Câmera 05',
    accent: '#facc15',
    nodePatterns: ['cafe_table', 'cafe_stool_1', 'cafe_stool_2'],
    fallback: [8.25, 3.95, 0.95],
    markerLift: 0.42,
    camera: {
      position: [13.4, 6.4, 7.9],
      target: [8.3, 3.95, 0.95],
      fov: 29,
      duration: 1.2,
    },
  },
];

const normalizeName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const averageVectors = (vectors: THREE.Vector3[]) => {
  const result = new THREE.Vector3();

  if (!vectors.length) return result;

  vectors.forEach((vector) => result.add(vector));
  return result.divideScalar(vectors.length);
};

const toCssColor = (color: string, alpha: number) => {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((part) => `${part}${part}`).join('') : hex;
  const numeric = Number.parseInt(full, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const createOverviewPose = (hotspots: ResolvedHotspot[]): CameraPose => {
  if (!hotspots.length) return OVERVIEW_POSE;

  const box = new THREE.Box3().setFromPoints(hotspots.map((hotspot) => hotspot.position));
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const spanX = Math.max(size.x, 8);
  const spanZ = Math.max(size.z, 10);
  const verticalLift = Math.max(size.y * 1.08, 3.8);

  return {
    position: [center.x + spanX * 0.12, center.y + verticalLift, center.z + spanZ * 2.28],
    target: [center.x, center.y + 0.12, center.z - spanZ * 0.08],
    fov: 29,
    duration: 1.5,
  };
};

const createIntroPose = (overviewPose: CameraPose): CameraPose => ({
  position: [
    overviewPose.position[0] + 1.2,
    overviewPose.position[1] + 1.4,
    overviewPose.position[2] + 10.5,
  ],
  target: overviewPose.target,
  fov: Math.min(overviewPose.fov + 4, 36),
  duration: 2.4,
});

const PDVShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const hotspotMeshesRef = useRef<Record<HotspotId, THREE.Mesh>>({} as Record<HotspotId, THREE.Mesh>);
  const hotspotButtonsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const cameraTweenRef = useRef<gsap.core.Timeline | null>(null);
  const tourTimeoutRef = useRef<number | null>(null);
  const wheelLockUntilRef = useRef(0);
  const revealTimeoutsRef = useRef<number[]>([]);
  const hotspotsRef = useRef<ResolvedHotspot[]>([]);
  const overviewPoseRef = useRef<CameraPose>(OVERVIEW_POSE);
  const activeHotspotIdRef = useRef<HotspotId | null>(null);
  const revealedHotspotIdsRef = useRef<HotspotId[]>([]);
  const pointerTargetRef = useRef(new THREE.Vector2());
  const pointerCurrentRef = useRef(new THREE.Vector2());
  const previousCameraOffsetRef = useRef(new THREE.Vector3());
  const previousTargetOffsetRef = useRef(new THREE.Vector3());
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedHotspots, setResolvedHotspots] = useState<ResolvedHotspot[]>([]);
  const [activeHotspotId, setActiveHotspotId] = useState<HotspotId | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<HotspotId | null>(null);
  const [revealedHotspotIds, setRevealedHotspotIds] = useState<HotspotId[]>([]);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const stopTour = useCallback(() => {
    if (tourTimeoutRef.current) {
      window.clearTimeout(tourTimeoutRef.current);
      tourTimeoutRef.current = null;
    }
    setIsTourActive(false);
  }, []);

  const animateCamera = useCallback((pose: CameraPose, onComplete?: () => void) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    cameraTweenRef.current?.kill();

    const duration = pose.duration ?? 1.2;
    const fovProxy = { value: camera.fov };
    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete,
    });

    timeline.to(
      camera.position,
      {
        x: pose.position[0],
        y: pose.position[1],
        z: pose.position[2],
        duration,
        onUpdate: () => {
          controls.update();
        },
      },
      0,
    );

    timeline.to(
      controls.target,
      {
        x: pose.target[0],
        y: pose.target[1],
        z: pose.target[2],
        duration,
        onUpdate: () => {
          controls.update();
        },
      },
      0,
    );

    timeline.to(
      fovProxy,
      {
        value: pose.fov,
        duration: duration * 0.9,
        onUpdate: () => {
          camera.fov = fovProxy.value;
          camera.updateProjectionMatrix();
        },
      },
      0,
    );

    cameraTweenRef.current = timeline;
  }, []);

  const focusOverview = useCallback(() => {
    stopTour();
    setActiveHotspotId(null);
    animateCamera(overviewPoseRef.current);
  }, [animateCamera, stopTour]);

  const focusHotspot = useCallback(
    (hotspotId: HotspotId, options?: { keepTour?: boolean }) => {
      const hotspot = hotspotsRef.current.find((item) => item.id === hotspotId);
      if (!hotspot) return;

      if (!options?.keepTour) stopTour();

      setActiveHotspotId(hotspotId);
      animateCamera(hotspot.camera);
    },
    [animateCamera, stopTour],
  );

  useEffect(() => {
    hotspotsRef.current = resolvedHotspots;
  }, [resolvedHotspots]);

  useEffect(() => {
    activeHotspotIdRef.current = activeHotspotId;
  }, [activeHotspotId]);

  useEffect(() => {
    revealedHotspotIdsRef.current = revealedHotspotIds;
  }, [revealedHotspotIds]);

  useEffect(() => {
    revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    revealTimeoutsRef.current = [];
    setRevealedHotspotIds([]);

    if (!resolvedHotspots.length) return;

    resolvedHotspots.forEach((hotspot, index) => {
      const timeoutId = window.setTimeout(() => {
        setRevealedHotspotIds((current) =>
          current.includes(hotspot.id) ? current : [...current, hotspot.id],
        );
      }, 320 + index * 180);

      revealTimeoutsRef.current.push(timeoutId);
    });

    return () => {
      revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      revealTimeoutsRef.current = [];
    };
  }, [resolvedHotspots]);

  useEffect(() => {
    if (!isTourActive || !resolvedHotspots.length) return;

    const ordered = resolvedHotspots;
    const currentIndex = ordered.findIndex((item) => item.id === activeHotspotId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ordered.length;
    const delay = currentIndex === -1 ? 600 : 3600;

    tourTimeoutRef.current = window.setTimeout(() => {
      focusHotspot(ordered[nextIndex].id, { keepTour: true });
    }, delay);

    return () => {
      if (tourTimeoutRef.current) {
        window.clearTimeout(tourTimeoutRef.current);
        tourTimeoutRef.current = null;
      }
    };
  }, [activeHotspotId, focusHotspot, isTourActive, resolvedHotspots]);

  useEffect(() => {
    if (!resolvedHotspots.length) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        setIsTourActive((current) => !current);
        return;
      }

      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

      event.preventDefault();
      stopTour();

      const ordered = resolvedHotspots;
      const currentIndex = ordered.findIndex((item) => item.id === activeHotspotId);
      const baseIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        event.key === 'ArrowRight'
          ? (baseIndex + 1) % ordered.length
          : (baseIndex - 1 + ordered.length) % ordered.length;

      focusHotspot(ordered[nextIndex].id);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeHotspotId, focusHotspot, resolvedHotspots, stopTour]);

  useEffect(() => {
    if (!resolvedHotspots.length) return;

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now < wheelLockUntilRef.current) return;

      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      event.preventDefault();
      stopTour();
      wheelLockUntilRef.current = now + 720;

      const ordered = [null, ...resolvedHotspots.map((item) => item.id)] as Array<HotspotId | null>;
      const currentIndex = ordered.findIndex((item) => item === activeHotspotIdRef.current);
      const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        direction > 0
          ? (safeCurrentIndex + 1) % ordered.length
          : (safeCurrentIndex - 1 + ordered.length) % ordered.length;

      const nextTarget = ordered[nextIndex];
      if (nextTarget === null) {
        focusOverview();
        return;
      }

      focusHotspot(nextTarget);
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => window.removeEventListener('wheel', onWheel);
  }, [focusHotspot, focusOverview, resolvedHotspots, stopTour]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initedRef.current) return;
    initedRef.current = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06070a');
    scene.fog = new THREE.Fog('#06070a', 18, 42);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(OVERVIEW_POSE.fov, container.clientWidth / container.clientHeight, 0.1, 120);
    camera.position.set(...INTRO_POSE.position);
    camera.lookAt(new THREE.Vector3(...INTRO_POSE.target));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.26;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.minDistance = 4;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.target.set(...INTRO_POSE.target);
    controls.update();
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight('#ffffff', 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35);
    keyLight.position.set(8, 13, 9);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight('#22d3ee', 40, 26, 2);
    fillLight.position.set(10, 6, 10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight('#f97316', 24, 28, 2);
    rimLight.position.set(-9, 7, -8);
    scene.add(rimLight);

    const hazeLight = new THREE.PointLight('#ffffff', 10, 24, 2);
    hazeLight.position.set(0, 10, 6);
    scene.add(hazeLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, 64),
      new THREE.MeshBasicMaterial({ color: '#07111a', transparent: true, opacity: 0.85 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-1.5, -0.62, -0.5);
    scene.add(floor);

    const loader = new GLTFLoader();

    const findPatternMatches = (root: THREE.Object3D, pattern: string) => {
      const normalizedPattern = normalizeName(pattern);
      const matches: THREE.Object3D[] = [];

      root.traverse((object) => {
        if (!object.name) return;
        if (normalizeName(object.name).includes(normalizedPattern)) {
          matches.push(object);
        }
      });

      return matches;
    };

    const resolveHotspots = (root: THREE.Object3D) =>
      HOTSPOT_BLUEPRINTS.map((blueprint) => {
        const collected = blueprint.nodePatterns.flatMap((pattern) => findPatternMatches(root, pattern));
        const unique = Array.from(new Set(collected));
        const positions = unique.map((object) => object.getWorldPosition(new THREE.Vector3()));
        const basePosition = positions.length ? averageVectors(positions) : new THREE.Vector3(...blueprint.fallback);
        basePosition.y += blueprint.markerLift ?? 0.4;

        return {
          ...blueprint,
          position: basePosition,
        };
      });

    loader.load(
      '/3d/PDVII.glb',
      (gltf) => {
        const model = gltf.scene;
        model.rotation.y = MODEL_ROTATION_Y;
        model.updateMatrixWorld(true);

        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;

          object.frustumCulled = true;

          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.needsUpdate = true;
          });
        });

        scene.add(model);

        const resolved = resolveHotspots(model);
        const overviewPose = createOverviewPose(resolved);
        const introPose = createIntroPose(overviewPose);
        hotspotsRef.current = resolved;
        overviewPoseRef.current = overviewPose;
        setResolvedHotspots(resolved);
        setLoadingProgress(100);

        resolved.forEach((hotspot) => {
          const geometry = new THREE.SphereGeometry(0.11, 24, 24);
          const material = new THREE.MeshBasicMaterial({
            color: hotspot.accent,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          });
          const marker = new THREE.Mesh(geometry, material);
          marker.position.copy(hotspot.position);
          marker.userData.hotspotId = hotspot.id;
          scene.add(marker);
          hotspotMeshesRef.current[hotspot.id] = marker;
        });

        camera.position.set(...introPose.position);
        camera.fov = introPose.fov;
        camera.updateProjectionMatrix();
        controls.target.set(...introPose.target);
        controls.update();

        setLoading(false);
        animateCamera(overviewPose);
      },
      (event) => {
        if (!event.total) return;
        setLoadingProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      },
      () => {
        setError('Nao foi possivel carregar o arquivo PDVII.glb.');
        setLoading(false);
      },
    );

    const onResize = () => {
      const currentContainer = containerRef.current;
      const currentCamera = cameraRef.current;
      const currentRenderer = rendererRef.current;

      if (!currentContainer || !currentCamera || !currentRenderer) return;

      currentCamera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
      currentCamera.updateProjectionMatrix();
      currentRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    };

    const onPointerDown = (event: PointerEvent) => {
      const currentRenderer = rendererRef.current;
      const currentCamera = cameraRef.current;
      if (!currentRenderer || !currentCamera) return;

      const rect = currentRenderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, currentCamera);
      const meshes = Object.values(hotspotMeshesRef.current);
      const [hit] = raycasterRef.current.intersectObjects(meshes, false);

      if (!hit?.object.userData.hotspotId) return;

      focusHotspot(hit.object.userData.hotspotId as HotspotId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const currentRenderer = rendererRef.current;
      const currentCamera = cameraRef.current;
      if (!currentRenderer || !currentCamera) return;

      const rect = currentRenderer.domElement.getBoundingClientRect();
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      pointerTargetRef.current.set(normalizedX, normalizedY);
      pointerRef.current.set(normalizedX, normalizedY);

      raycasterRef.current.setFromCamera(pointerRef.current, currentCamera);
      const meshes = Object.values(hotspotMeshesRef.current);
      const [hit] = raycasterRef.current.intersectObjects(meshes, false);
      setHoveredHotspotId((hit?.object.userData.hotspotId as HotspotId | undefined) ?? null);
    };

    const onPointerLeave = () => {
      pointerTargetRef.current.set(0, 0);
      setHoveredHotspotId(null);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    const projected = new THREE.Vector3();
    const orbitAxis = new THREE.Vector3(0, 1, 0);
    const rotatedDirection = new THREE.Vector3();
    const baseDirection = new THREE.Vector3();
    const cameraOffset = new THREE.Vector3();
    const targetOffset = new THREE.Vector3();
    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate);

      const currentScene = sceneRef.current;
      const currentCamera = cameraRef.current;
      const currentRenderer = rendererRef.current;
      const currentControls = controlsRef.current;

      if (!currentScene || !currentCamera || !currentRenderer || !currentControls) return;

      const elapsed = performance.now() * 0.001;
      currentCamera.position.sub(previousCameraOffsetRef.current);
      currentControls.target.sub(previousTargetOffsetRef.current);
      previousCameraOffsetRef.current.set(0, 0, 0);
      previousTargetOffsetRef.current.set(0, 0, 0);

      pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.05);

      const motionFactor = activeHotspotIdRef.current === null ? 1 : 0.35;
      baseDirection.copy(currentCamera.position).sub(currentControls.target);
      rotatedDirection.copy(baseDirection);

      if (activeHotspotIdRef.current === null) {
        const orbitAngle = Math.sin(elapsed * 0.18) * 0.055;
        rotatedDirection.applyAxisAngle(orbitAxis, orbitAngle);
      }

      cameraOffset.copy(rotatedDirection).sub(baseDirection);
      cameraOffset.x += pointerCurrentRef.current.x * 0.65 * motionFactor;
      cameraOffset.y += pointerCurrentRef.current.y * 0.28 * motionFactor;
      cameraOffset.z += Math.abs(pointerCurrentRef.current.x) * 0.16 * motionFactor;

      targetOffset.set(
        pointerCurrentRef.current.x * 0.18 * motionFactor,
        pointerCurrentRef.current.y * 0.11 * motionFactor,
        0,
      );

      currentCamera.position.add(cameraOffset);
      currentControls.target.add(targetOffset);
      previousCameraOffsetRef.current.copy(cameraOffset);
      previousTargetOffsetRef.current.copy(targetOffset);
      currentControls.update();

      hotspotsRef.current.forEach((hotspot, index) => {
        const marker = hotspotMeshesRef.current[hotspot.id];
        if (!marker) return;

        marker.position.y = hotspot.position.y + Math.sin(elapsed * 1.4 + index * 0.7) * 0.08;

        const button = hotspotButtonsRef.current[hotspot.id];
        if (!button) return;

        projected.copy(marker.position).project(currentCamera);

        const isVisible = projected.z < 1 && projected.z > -1;
        const x = ((projected.x + 1) * 0.5) * currentRenderer.domElement.clientWidth;
        const y = ((-projected.y + 1) * 0.5) * currentRenderer.domElement.clientHeight;
        const inBounds = x >= 0 && x <= currentRenderer.domElement.clientWidth && y >= 0 && y <= currentRenderer.domElement.clientHeight;
        const isRevealed = revealedHotspotIdsRef.current.includes(hotspot.id);
        const visible = isVisible && inBounds && isRevealed;

        button.style.opacity = visible ? '1' : '0';
        button.style.pointerEvents = visible ? 'auto' : 'none';
        button.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      });

      currentRenderer.render(currentScene, currentCamera);
    };

    animate();

    return () => {
      initedRef.current = false;
      stopTour();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      cameraTweenRef.current?.kill();
      cameraTweenRef.current = null;
      revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      revealTimeoutsRef.current = [];
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);

      Object.values(hotspotMeshesRef.current).forEach((marker) => {
        marker.geometry.dispose();
        (marker.material as THREE.Material).dispose();
      });

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });

      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      hotspotsRef.current = [];
      hotspotMeshesRef.current = {} as Record<HotspotId, THREE.Mesh>;
      pointerTargetRef.current.set(0, 0);
      pointerCurrentRef.current.set(0, 0);
      previousCameraOffsetRef.current.set(0, 0, 0);
      previousTargetOffsetRef.current.set(0, 0, 0);
      revealedHotspotIdsRef.current = [];

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [animateCamera, focusHotspot, stopTour]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#06070a] text-white">
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_38%,_rgba(2,6,12,0.22)_72%,_rgba(1,3,8,0.68)_100%),linear-gradient(to_bottom,_rgba(3,8,16,0.08),_rgba(2,6,12,0.26)_58%,_rgba(1,3,8,0.46)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_50%_32%,_rgba(255,255,255,0.08),_transparent_28%),radial-gradient(circle_at_52%_78%,_rgba(56,189,248,0.08),_transparent_22%)]" />

      <div className="pointer-events-none absolute inset-0">
        {resolvedHotspots.map((hotspot) => {
          const isHovered = hoveredHotspotId === hotspot.id;
          const isActive = activeHotspotId === hotspot.id;
          const isExpanded = isHovered || isActive;

          return (
            <div
              key={hotspot.id}
              ref={(element) => {
                hotspotButtonsRef.current[hotspot.id] = element;
              }}
              className="pointer-events-auto absolute left-0 top-0"
              style={{
                opacity: 0,
              }}
            >
              <button
                onClick={() => focusHotspot(hotspot.id)}
                onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                onMouseLeave={() => setHoveredHotspotId((current) => (current === hotspot.id ? null : current))}
                className={`flex items-center rounded-full border bg-black/55 text-[10px] font-mono uppercase tracking-[0.22em] text-white/88 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md duration-300 transition-[border-color,background-color,box-shadow,padding,gap] ${
                  isExpanded ? 'gap-2 px-3 py-1.5' : 'gap-0 px-2.5 py-2'
                }`}
                style={{
                  borderColor: toCssColor(hotspot.accent, isExpanded ? 0.75 : 0.42),
                  backgroundColor: isExpanded ? toCssColor('#05070a', 0.82) : toCssColor('#05070a', 0.52),
                  boxShadow: `0 0 0 1px ${toCssColor(hotspot.accent, isExpanded ? 0.26 : 0.16)}, 0 18px 45px rgba(0, 0, 0, 0.35)`,
                }}
              >
                <span
                  className={`rounded-full transition-all duration-300 ${isExpanded ? 'h-2.5 w-2.5' : 'h-3 w-3'}`}
                  style={{
                    backgroundColor: hotspot.accent,
                    boxShadow: `0 0 16px ${toCssColor(hotspot.accent, 0.9)}`,
                  }}
                />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                  }`}
                >
                  {hotspot.label}
                </span>
              </button>

              {isActive && (
                <div
                  className="mt-3 w-[300px] rounded-[24px] border bg-black/72 p-4 text-left backdrop-blur-xl"
                  style={{
                    borderColor: toCssColor(hotspot.accent, 0.3),
                    boxShadow: `0 24px 60px ${toCssColor('#000000', 0.38)}`,
                  }}
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: hotspot.accent }}>
                    {hotspot.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-white/94">
                    {hotspot.label}
                  </h3>
                  <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">
                    {hotspot.metric}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/72">
                    {hotspot.description}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/44">
                    {hotspot.detail}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pb-6 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
          <div className="pointer-events-auto max-w-xl rounded-[28px] border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-xl">
            <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.42em] text-cyan-200/60">
              // lab 005
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                PDV Spatial Demo
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/58 sm:text-[15px]">
                Amostra de um ponto de venda 3D com hotspots, menu contextual e direcao de camera para contar o fluxo do ambiente.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isTourActive) {
                stopTour();
                return;
              }

              setIsTourActive(true);
              if (activeHotspotId === null) {
                focusHotspot(resolvedHotspots[0]?.id ?? 'checkout', { keepTour: true });
              }
            }}
            className={`pointer-events-auto hidden h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-5 text-[10px] font-mono uppercase tracking-[0.24em] transition md:inline-flex ${
              isTourActive
                ? 'border-cyan-200/30 bg-cyan-400/12 text-cyan-100'
                : 'border-white/10 bg-black/35 text-white/58 hover:border-white/20 hover:text-white/90'
            }`}
          >
            {isTourActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isTourActive ? 'Pause tour' : 'Auto tour'}</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-6 md:pl-10 lg:pl-14">
        <aside
          className="pointer-events-auto w-[208px] rounded-[26px] border border-white/10 bg-black/42 p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:w-[228px] sm:p-4 md:w-[248px] md:p-5"
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={focusOverview}
              className={`rounded-[18px] border px-3 py-3 text-left text-[10px] font-mono uppercase tracking-[0.24em] transition ${
                activeHotspotId === null
                  ? 'border-white/25 bg-white/12 text-white'
                  : 'border-white/10 bg-white/5 text-white/52 hover:border-white/20 hover:text-white/90'
              }`}
            >
              <span>Overview</span>
            </button>

            {resolvedHotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => focusHotspot(hotspot.id)}
                className={`rounded-[20px] border px-3 py-3 text-left transition ${
                  activeHotspotId === hotspot.id
                    ? 'text-white'
                    : 'border-white/10 bg-white/5 text-white/52 hover:border-white/20 hover:text-white/90'
                }`}
                style={
                  activeHotspotId === hotspot.id
                    ? {
                        borderColor: toCssColor(hotspot.accent, 0.65),
                        backgroundColor: toCssColor(hotspot.accent, 0.14),
                        boxShadow: `0 0 0 1px ${toCssColor(hotspot.accent, 0.18)}`,
                      }
                    : undefined
                }
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.28em]" style={{ color: activeHotspotId === hotspot.id ? hotspot.accent : undefined }}>
                  {hotspot.eyebrow}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-white/92">
                  {hotspot.label}
                </p>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.24em] text-white/35">
                  {hotspot.metric}
                </p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="pointer-events-auto hidden w-[320px] rounded-[26px] border border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:block">
          <button
            onClick={() => setIsNotesOpen((current) => !current)}
            className="flex w-full items-center justify-between text-left"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/34">
              Interaction notes
            </p>
            {isNotesOpen ? <ChevronDown size={16} className="text-white/42" /> : <ChevronUp size={16} className="text-white/42" />}
          </button>
          {isNotesOpen && (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/56">
              <p className="flex items-center gap-2">
                <CircleDot size={14} className="text-cyan-200/70" />
                Hotspots projetados diretamente na cena, com leitura clara e sem poluir o ambiente.
              </p>
              <p className="flex items-center gap-2">
                <ArrowRight size={14} className="text-orange-300/70" />
                Cada clique aproxima a camera para apresentar o fluxo daquele ponto do PDV.
              </p>
              <p className="flex items-center gap-2">
                <CircleDot size={14} className="text-emerald-300/70" />
                O painel lateral funciona como navegacao rapida entre setores do ambiente.
              </p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06070a]/92 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border border-white/15 border-t-cyan-200/80" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.36em] text-white/34">
                Carregando cena
              </p>
              <p className="mt-2 text-sm text-white/56">
                {loadingProgress !== null
                  ? `Preparando o arquivo PDVII.glb para navegacao. ${loadingProgress}%`
                  : 'Preparando o arquivo PDVII.glb para navegacao. O arquivo e grande e pode levar alguns segundos.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06070a]/92 px-6 text-center">
          <div className="max-w-md rounded-[28px] border border-red-400/20 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.34em] text-red-300/70">
              Falha na cena
            </p>
            <p className="mt-3 text-base text-white/82">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.24em] text-white/64 transition hover:border-white/22 hover:text-white"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDVShowcase;
