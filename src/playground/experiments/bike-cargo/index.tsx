import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Moon, SunMedium } from 'lucide-react';
import {
  BIKE_HOTSPOTS,
  BIKE_STAGES,
  FRAME_SEALS,
  FINAL_STAGE_ID,
  INTRO_POSE,
  LOOP_ANIMATION_CLIP_NAME,
  ORANGE_CARGO_LOGO_URL,
} from './config';
import FrameSealRail from './FrameSealRail';
import SizeGuideOverlay from './SizeGuideOverlay';
import StageTextPanel from './StageTextPanel';
import type { CameraPose, FrameSealId, HotspotId, StageId } from './types';

const REAR_SEQUENCE_SCROLL_DISTANCE = 2500;
const REAR_SEQUENCE_CAMERA_PORTION = 0.72;
const REAR_SEQUENCE_END_POSE: CameraPose = {
  position: [4.48, 2.42, 8.06],
  target: [0.34, 1.14, 0.42],
  fov: 22.4,
  duration: 0,
};
const BIKE_GALLERY_HERO_IMAGE = '/lab/bike/gallery/01.webp';
const BIKE_GALLERY_ITEMS = [
  {
    type: 'image' as const,
    src: '/lab/bike/gallery/02.webp',
    alt: 'Orange Cargo em vista editorial 1',
    aspect: 'aspect-[4/5]',
    offsetClass: 'md:translate-y-4',
  },
  {
    type: 'text' as const,
    id: 'gallery-copy-1',
    eyebrow: 'urban utility',
    title: 'DETALHES E PRESENCA',
    body: 'A galeria amplia a leitura do produto com enquadramentos mais editoriais, textura de materiais e presenca urbana.',
    offsetClass: 'md:-translate-y-3',
  },
  {
    type: 'image' as const,
    src: '/lab/bike/gallery/03.webp',
    alt: 'Orange Cargo em vista editorial 2',
    aspect: 'aspect-[4/3]',
    offsetClass: 'md:-translate-y-2',
  },
  {
    type: 'image' as const,
    src: '/lab/bike/gallery/04.png',
    alt: 'Orange Cargo em vista editorial 3',
    aspect: 'aspect-[3/4]',
    offsetClass: 'md:translate-y-6',
  },
  {
    type: 'image' as const,
    src: '/lab/bike/gallery/05.png',
    alt: 'Orange Cargo em vista editorial 4',
    aspect: 'aspect-[5/4]',
    offsetClass: 'md:-translate-y-4',
  },
  {
    type: 'image' as const,
    src: '/lab/bike/gallery/07.png',
    alt: 'Orange Cargo em vista editorial 5',
    aspect: 'aspect-[4/5]',
    offsetClass: 'md:-translate-y-1',
  },
];
const BIKE_GALLERY_ENDCAP = {
  src: '/lab/bike/gallery/06.png',
  alt: 'Orange Cargo em composição final editorial',
  eyebrow: 'city cargo',
  title: 'CADA ENTREGA VIRA CENA',
  body: 'No fechamento, o produto deixa de ser só transporte e passa a ser presença. A composição mistura utilidade, memória e pequenos rituais urbanos em uma leitura mais emocional do uso real.',
};

function tuneBikeSurfaceMaterial(material: THREE.Material, isDark: boolean) {
  if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial)) return;
  if (!material.name.toLowerCase().includes('orange rigged cargo bike')) return;

  if (material.map) {
    material.map.colorSpace = THREE.SRGBColorSpace;
    material.map.needsUpdate = true;
  }

  if (material.metalness > 0.65) {
    material.metalness = isDark ? 0.58 : 0.34;
  }

  material.roughness = Math.max(material.roughness, isDark ? 0.58 : 0.72);
  material.envMapIntensity = isDark ? 0.9 : 0.55;
  material.needsUpdate = true;
}

const OrangeBikeExperiment = () => {
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number | null>(null);
  const cameraTweenRef = useRef<gsap.core.Timeline | null>(null);
  const wheelLockUntilRef = useRef(0);
  const pointerTargetRef = useRef(new THREE.Vector2());
  const pointerCurrentRef = useRef(new THREE.Vector2());
  const previousCameraOffsetRef = useRef(new THREE.Vector3());
  const previousTargetOffsetRef = useRef(new THREE.Vector3());
  const modelRootRef = useRef<THREE.Group | null>(null);
  const modelMeshesRef = useRef<THREE.Mesh[]>([]);
  const frameFocusRootRef = useRef<THREE.Object3D | null>(null);
  const hotspotNodeRefs = useRef<Partial<Record<HotspotId, THREE.Object3D | null>>>({});
  const animationClockRef = useRef(new THREE.Clock());
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const loopActionRef = useRef<THREE.AnimationAction | null>(null);
  const loopActionStopRef = useRef<gsap.core.Tween | null>(null);
  const modelRotationTweenRef = useRef<gsap.core.Tween | null>(null);
  const cargoBoxesRef = useRef<THREE.Object3D[]>([]);
  const cargoBoxesTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const cargoDogRef = useRef<THREE.Group | null>(null);
  const cargoDogMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const cargoDogSeatActionRef = useRef<THREE.AnimationAction | null>(null);
  const cargoDogTweenRef = useRef<gsap.core.Timeline | null>(null);
  const cargoDogLoadStartedRef = useRef(false);
  const frameIsolationActiveRef = useRef(false);
  const activeStageIdRef = useRef<StageId>('overview');
  const rearSequenceProgressRef = useRef(0);
  const modelBaseYRef = useRef(0);
  const autoRotationRef = useRef(0);
  const userOrbitingRef = useRef(false);
  const hotspotRefs = useRef<Record<HotspotId, HTMLButtonElement | null>>({
    deck: null,
    cockpit: null,
    frame: null,
    rear: null,
  });
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTargetPositionRef = useRef({ x: 0, y: 0 });
  const cursorCurrentPositionRef = useRef({ x: 0, y: 0 });
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<StageId>('overview');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<HotspotId | null>(null);
  const [openedHotspotId, setOpenedHotspotId] = useState<HotspotId | null>(null);
  const [selectedFrameSealId, setSelectedFrameSealId] = useState<FrameSealId | null>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorAction, setCursorAction] = useState(false);
  const [cursorPressed, setCursorPressed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [rearSequenceProgress, setRearSequenceProgress] = useState(0);

  const setRearSequenceProgressValue = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    rearSequenceProgressRef.current = clamped;
    setRearSequenceProgress((current) => (Math.abs(current - clamped) < 0.0001 ? current : clamped));
  }, []);

  const animateCamera = useCallback((pose: CameraPose) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    cameraTweenRef.current?.kill();

    const duration = pose.duration ?? 1.2;
    const fovProxy = { value: camera.fov };
    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
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
        duration: duration * 0.92,
        onUpdate: () => {
          camera.fov = fovProxy.value;
          camera.updateProjectionMatrix();
        },
      },
      0,
    );

    cameraTweenRef.current = timeline;
  }, []);

  const playLoopStageAnimation = useCallback(() => {
    const action = loopActionRef.current;
    const mixer = mixerRef.current;
    if (!action || !mixer) return;

    loopActionStopRef.current?.kill();
    loopActionStopRef.current = null;
    mixer.stopAllAction();
    mixer.setTime(0);
    action.reset();
    action.enabled = true;
    action.paused = false;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);
    action.fadeIn(0.45);
    action.play();
  }, []);

  const stopLoopStageAnimation = useCallback(() => {
    const action = loopActionRef.current;
    if (!action) return;

    loopActionStopRef.current?.kill();
    loopActionStopRef.current = null;
    action.fadeOut(0.24);
    loopActionStopRef.current = gsap.delayedCall(0.26, () => {
      action.stop();
    });
  }, []);

  const syncLoopStageAnimation = useCallback((stageId: StageId) => {
    if (stageId === FINAL_STAGE_ID) {
      playLoopStageAnimation();
      return;
    }

    stopLoopStageAnimation();
  }, [playLoopStageAnimation, stopLoopStageAnimation]);

  const setCargoBoxesVisible = useCallback((visible: boolean) => {
    cargoBoxesRef.current.forEach((box) => {
      box.visible = visible;
    });
  }, []);

  const animateCargoBoxes = useCallback((visible: boolean) => {
    const boxes = cargoBoxesRef.current;
    cargoBoxesTimelineRef.current?.kill();
    cargoBoxesTimelineRef.current = null;

    if (!boxes.length) return;

    if (!visible) {
      const timeline = gsap.timeline({
        onComplete: () => {
          setCargoBoxesVisible(false);
          boxes.forEach((box) => {
            const targetPosition = box.userData.cargoTargetPosition as THREE.Vector3 | undefined;
            const targetRotation = box.userData.cargoTargetRotation as THREE.Euler | undefined;
            const baseScale = box.userData.cargoBaseScale as THREE.Vector3 | undefined;
            if (targetPosition) box.position.copy(targetPosition);
            if (targetRotation) box.rotation.copy(targetRotation);
            if (baseScale) box.scale.copy(baseScale);
          });
        },
      });

      boxes
        .slice()
        .reverse()
        .forEach((box, reverseIndex) => {
          const targetPosition = box.userData.cargoTargetPosition as THREE.Vector3 | undefined;
          const targetRotation = box.userData.cargoTargetRotation as THREE.Euler | undefined;
          const baseScale = box.userData.cargoBaseScale as THREE.Vector3 | undefined;
          if (!targetPosition || !targetRotation || !baseScale) return;

          timeline.to(
            box.position,
            {
              x: targetPosition.x - 0.16 - reverseIndex * 0.015,
              y: targetPosition.y + 0.42 + reverseIndex * 0.04,
              z: targetPosition.z + 0.14,
              duration: 0.44,
              ease: 'power2.in',
            },
            reverseIndex * 0.05,
          );
          timeline.to(
            box.rotation,
            {
              x: targetRotation.x + 0.16,
              y: targetRotation.y,
              z: targetRotation.z + (reverseIndex % 2 === 0 ? -0.16 : 0.16),
              duration: 0.4,
              ease: 'power2.in',
            },
            reverseIndex * 0.05,
          );
          timeline.to(
            box.scale,
            {
              x: baseScale.x * 0.94,
              y: baseScale.y * 0.94,
              z: baseScale.z * 0.94,
              duration: 0.34,
              ease: 'power2.in',
            },
            reverseIndex * 0.05,
          );
        });

      cargoBoxesTimelineRef.current = timeline;
      return;
    }

    setCargoBoxesVisible(true);

    const timeline = gsap.timeline();
    boxes.forEach((box, index) => {
      const targetPosition = box.userData.cargoTargetPosition as THREE.Vector3 | undefined;
      const targetRotation = box.userData.cargoTargetRotation as THREE.Euler | undefined;
      const baseScale = box.userData.cargoBaseScale as THREE.Vector3 | undefined;
      if (!targetPosition || !targetRotation || !baseScale) return;

      box.position.copy(targetPosition).add(new THREE.Vector3(0, 0.48 + index * 0.035, 0.18 + index * 0.03));
      box.rotation.copy(targetRotation);
      box.rotation.x -= 0.18;
      box.rotation.z += index % 2 === 0 ? -0.14 : 0.14;
      box.scale.copy(baseScale).multiplyScalar(0.92);

      timeline.to(
        box.position,
        {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 0.78,
          ease: 'power3.out',
        },
        index * 0.08,
      );
      timeline.to(
        box.rotation,
        {
          x: targetRotation.x,
          y: targetRotation.y,
          z: targetRotation.z,
          duration: 0.82,
          ease: 'power3.out',
        },
        index * 0.08,
      );
      timeline.to(
        box.scale,
        {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.74,
          ease: 'back.out(1.35)',
        },
        index * 0.08,
      );
    });

    cargoBoxesTimelineRef.current = timeline;
  }, [setCargoBoxesVisible]);

  const syncCargoDog = useCallback((visible: boolean) => {
    const dog = cargoDogRef.current;
    if (!dog) return;
    const seatAction = cargoDogSeatActionRef.current;
    const mixer = cargoDogMixerRef.current;
    const baseScale = (dog.userData.baseScale as THREE.Vector3 | undefined)?.clone() ?? dog.scale.clone();
    const basePosition = (dog.userData.basePosition as THREE.Vector3 | undefined)?.clone() ?? dog.position.clone();

    cargoDogTweenRef.current?.kill();
    cargoDogTweenRef.current = null;

      if (visible) {
        dog.scale.copy(baseScale);
        dog.position.copy(basePosition);
        dog.visible = true;

      if (seatAction) {
        mixer?.stopAllAction();
        mixer?.setTime(0);
        seatAction.reset();
        seatAction.enabled = true;
        seatAction.paused = false;
        seatAction.clampWhenFinished = false;
        seatAction.setLoop(THREE.LoopRepeat, Infinity);
        seatAction.setEffectiveTimeScale(1);
        seatAction.setEffectiveWeight(1);
        seatAction.play();
      }

      const timeline = gsap.timeline();
      timeline.fromTo(
        dog.scale,
        { x: baseScale.x * 0.8, y: baseScale.y * 0.8, z: baseScale.z * 0.8 },
        { x: baseScale.x, y: baseScale.y, z: baseScale.z, duration: 0.7, ease: 'back.out(1.3)' },
      );
      timeline.fromTo(
        dog.position,
        { x: basePosition.x, y: basePosition.y + 0.12, z: basePosition.z + 0.04 },
        { x: basePosition.x, y: basePosition.y, z: basePosition.z, duration: 0.62, ease: 'power3.out' },
        0,
      );
      cargoDogTweenRef.current = timeline;
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        dog.scale.copy(baseScale);
        dog.position.copy(basePosition);
        dog.visible = false;
        seatAction?.stop();
        mixer?.setTime(0);
      },
    });
    timeline.to(dog.scale, {
      x: baseScale.x * 0.84,
      y: baseScale.y * 0.84,
      z: baseScale.z * 0.84,
      duration: 0.28,
      ease: 'power2.in',
    });
    timeline.to(
      dog.position,
      {
        x: basePosition.x,
        y: basePosition.y - 0.1,
        z: basePosition.z + 0.03,
        duration: 0.28,
        ease: 'power2.in',
      },
      0,
    );
    cargoDogTweenRef.current = timeline;
  }, []);

  const loadCargoDog = useCallback(() => {
    if (cargoDogLoadStartedRef.current || cargoDogRef.current) return;

    const cargoSpotNode = hotspotNodeRefs.current.deck;
    if (!cargoSpotNode) return;

    cargoDogLoadStartedRef.current = true;
    const dogLoader = new GLTFLoader();

    dogLoader.load(
      '/3d/dog-lowpolly.glb',
      (dogGltf) => {
        const dog = dogGltf.scene;
        dog.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.castShadow = true;
          object.receiveShadow = true;
        });

        const dogBox = new THREE.Box3().setFromObject(dog);
        const dogSize = dogBox.getSize(new THREE.Vector3());
        const dogScale = 4.75 / Math.max(dogSize.y || 1, 0.001);
        dog.scale.setScalar(dogScale);

        const normalizedDogBox = new THREE.Box3().setFromObject(dog);
        const dogCenter = normalizedDogBox.getCenter(new THREE.Vector3());
        dog.position.x -= dogCenter.x;
        dog.position.z -= dogCenter.z;
        dog.position.y -= normalizedDogBox.min.y;
        dog.position.set(0.5, -1.02, 1.24);
        dog.rotation.y = -Math.PI * 0.4;
        dog.rotation.z = THREE.MathUtils.degToRad(-5);
        dog.visible = activeStageIdRef.current === FINAL_STAGE_ID;
        dog.userData.basePosition = dog.position.clone();
        dog.userData.baseScale = dog.scale.clone();

        const seatClip = THREE.AnimationClip.findByName(dogGltf.animations, 'Seat');
        if (seatClip) {
          const dogMixer = new THREE.AnimationMixer(dog);
          const seatAction = dogMixer.clipAction(seatClip);
          seatAction.enabled = true;
          seatAction.clampWhenFinished = true;
          cargoDogMixerRef.current = dogMixer;
          cargoDogSeatActionRef.current = seatAction;
        } else {
          cargoDogMixerRef.current = null;
          cargoDogSeatActionRef.current = null;
        }

        cargoSpotNode.add(dog);
        cargoDogRef.current = dog;
        syncCargoDog(activeStageIdRef.current === FINAL_STAGE_ID);
      },
      undefined,
      () => {
        cargoDogLoadStartedRef.current = false;
        cargoDogRef.current = null;
        cargoDogMixerRef.current = null;
        cargoDogSeatActionRef.current = null;
      },
    );
  }, [syncCargoDog]);

  const syncFrameIsolation = useCallback((stageId: StageId) => {
    const frameRoot = frameFocusRootRef.current;
    const meshes = modelMeshesRef.current;
    if (!meshes.length) return;

    const isolateFrame = stageId === 'frame';
    const wasIsolated = frameIsolationActiveRef.current;
    if (!isolateFrame && !wasIsolated) return;

    frameIsolationActiveRef.current = isolateFrame;

    meshes.forEach((mesh) => {
      const isFrameMesh = Boolean(frameRoot && (mesh === frameRoot || frameRoot.children.includes(mesh) || frameRoot.getObjectById(mesh.id)));
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((material) => {
        const materialState =
          (material.userData.bikeBaseState as
            | {
                opacity: number;
                transparent: boolean;
                depthWrite: boolean;
              }
            | undefined) ??
          (() => {
            const baseState = {
              opacity: material.opacity,
              transparent: material.transparent,
              depthWrite: material.depthWrite,
            };
            material.userData.bikeBaseState = baseState;
            return baseState;
          })();

        if (!isolateFrame) {
          gsap.killTweensOf(material);
          if (isFrameMesh) {
            material.opacity = materialState.opacity;
            material.transparent = materialState.transparent;
            material.depthWrite = materialState.depthWrite;
            material.needsUpdate = true;
            return;
          }

          material.transparent = true;
          material.depthWrite = false;
          gsap.to(material, {
            opacity: materialState.opacity,
            duration: 0.42,
            ease: 'power2.inOut',
            onUpdate: () => {
              material.needsUpdate = true;
            },
            onComplete: () => {
              material.transparent = materialState.transparent;
              material.depthWrite = materialState.depthWrite;
              material.needsUpdate = true;
            },
          });
          return;
        }

        gsap.killTweensOf(material);
        if (isFrameMesh) {
          material.opacity = materialState.opacity;
          material.transparent = materialState.transparent;
          material.depthWrite = materialState.depthWrite;
          material.needsUpdate = true;
          return;
        }

        material.transparent = true;
        material.depthWrite = false;
        gsap.to(material, {
          opacity: Math.max(0.12, materialState.opacity * 0.16),
          duration: 0.46,
          ease: 'power2.inOut',
          onUpdate: () => {
            material.needsUpdate = true;
          },
        });
      });
    });
  }, []);

  const focusStage = useCallback(
    (stageId: StageId) => {
      const stage = BIKE_STAGES.find((item) => item.id === stageId);
      if (!stage) return;
      if (stageId !== FINAL_STAGE_ID || activeStageIdRef.current !== FINAL_STAGE_ID) {
        setRearSequenceProgressValue(0);
      }
      setActiveStageId(stageId);
      setSelectedFrameSealId(null);
      animateCamera(stage.camera);
      animateCargoBoxes(stageId === 'cargo');

      modelRotationTweenRef.current?.kill();
      modelRotationTweenRef.current = gsap.to(autoRotationRef, {
        current: stageId === FINAL_STAGE_ID ? 0 : stageId === 'size' ? Math.PI / 2 : -0.42,
        duration: stageId === FINAL_STAGE_ID ? 1.1 : 0.9,
        ease: 'power3.inOut',
      });
    },
    [animateCamera, animateCargoBoxes, setRearSequenceProgressValue],
  );

  const focusFrameSeal = useCallback(
    (sealId: FrameSealId) => {
      if (activeStageIdRef.current !== 'frame') return;

      setSelectedFrameSealId((current) => {
        const nextSealId = current === sealId ? null : sealId;
        const pose = nextSealId
          ? FRAME_SEALS.find((seal) => seal.id === nextSealId)?.camera
          : BIKE_STAGES.find((stage) => stage.id === 'frame')?.camera;

        if (pose) {
          animateCamera(pose);
        }

        return nextSealId;
      });
    },
    [animateCamera],
  );

  useEffect(() => {
    activeStageIdRef.current = activeStageId;
    if (activeStageId === FINAL_STAGE_ID) {
      loadCargoDog();
    }
    syncLoopStageAnimation(activeStageId);
    syncCargoDog(activeStageId === FINAL_STAGE_ID);
    syncFrameIsolation(activeStageId);
  }, [activeStageId, loadCargoDog, syncCargoDog, syncFrameIsolation, syncLoopStageAnimation]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      if (activeStageId === FINAL_STAGE_ID) {
        const shell = shellRef.current;
        const canScrollGalleryDown =
          direction > 0 && rearSequenceProgressRef.current >= 1 && Boolean(shell);
        const canScrollGalleryUp = direction < 0 && (shell?.scrollTop ?? 0) > 0;

        if (canScrollGalleryDown || canScrollGalleryUp) {
          return;
        }

        const currentProgress = rearSequenceProgressRef.current;
        const nextProgress = Math.max(0, Math.min(1, currentProgress + event.deltaY / REAR_SEQUENCE_SCROLL_DISTANCE));

        if (nextProgress !== currentProgress) {
          setHasScrolled(true);
          event.preventDefault();
          setRearSequenceProgressValue(nextProgress);
          return;
        }

        if (direction > 0) {
          setHasScrolled(true);
          event.preventDefault();
          return;
        }
      }

      const now = performance.now();
      if (now < wheelLockUntilRef.current) return;

      setHasScrolled(true);
      event.preventDefault();
      wheelLockUntilRef.current = now + 760;

      const currentIndex = BIKE_STAGES.findIndex((item) => item.id === activeStageId);
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        direction > 0
          ? Math.min(safeIndex + 1, BIKE_STAGES.length - 1)
          : Math.max(safeIndex - 1, 0);

      if (nextIndex === safeIndex) return;
      focusStage(BIKE_STAGES[nextIndex].id);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

      event.preventDefault();

      if (activeStageId === FINAL_STAGE_ID) {
        if (event.key === 'ArrowDown') {
          setRearSequenceProgressValue(rearSequenceProgressRef.current + 180 / REAR_SEQUENCE_SCROLL_DISTANCE);
          return;
        }

        if (rearSequenceProgressRef.current > 0) {
          setRearSequenceProgressValue(rearSequenceProgressRef.current - 180 / REAR_SEQUENCE_SCROLL_DISTANCE);
          return;
        }
      }

      const currentIndex = BIKE_STAGES.findIndex((item) => item.id === activeStageId);
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        event.key === 'ArrowDown'
          ? Math.min(safeIndex + 1, BIKE_STAGES.length - 1)
          : Math.max(safeIndex - 1, 0);

      if (nextIndex === safeIndex) return;
      focusStage(BIKE_STAGES[nextIndex].id);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeStageId, focusStage, setRearSequenceProgressValue]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (activeStageId !== FINAL_STAGE_ID || rearSequenceProgress < 1) {
      shell.scrollTop = 0;
    }
  }, [activeStageId, rearSequenceProgress]);

  useEffect(() => {
    const eyebrow = eyebrowRef.current;
    const titleWrap = titleWrapRef.current;
    const titleLines = titleWrap?.querySelectorAll('[data-title-line]');
    const subtitle = subtitleRef.current;
    if (!eyebrow || !titleWrap || !titleLines?.length || !subtitle) return;

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .fromTo(eyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.32 })
      .fromTo(
        titleLines,
        { opacity: 0, y: 42 },
        { opacity: 1, y: 0, duration: 0.72, stagger: 0.08 },
        '-=0.08',
      )
      .fromTo(subtitle, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.46 }, '-=0.34');

    return () => {
      timeline.kill();
    };
  }, [activeStageId]);

  useEffect(() => {
    const hint = scrollHintRef.current;
    if (!hint || hasScrolled) return;

    const dot = hint.querySelector('[data-scroll-dot]');
    const outline = hint.querySelector('[data-scroll-outline]');

    const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
    timeline
      .fromTo(
        dot,
        { y: -5, opacity: 0.18, scaleY: 0.9 },
        { y: 7, opacity: 1, scaleY: 1, duration: 0.78 },
      )
      .to(dot, { y: 10, opacity: 0.05, duration: 0.38 }, '-=0.06')
      .set(dot, { y: -5, opacity: 0.18, scaleY: 0.9 });

    gsap.to(outline, {
      borderColor: 'rgba(255,155,71,0.38)',
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      timeline.kill();
      gsap.killTweensOf(outline);
    };
  }, [hasScrolled]);

  useEffect(() => {
    const hint = scrollHintRef.current;
    if (!hint || !hasScrolled) return;

    const tween = gsap.to(hint, {
      opacity: 0,
      y: -14,
      duration: 0.34,
      ease: 'power2.out',
      pointerEvents: 'none',
    });

    return () => {
      tween.kill();
    };
  }, [hasScrolled]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.enableRotate = activeStageId !== 'size' && activeStageId !== FINAL_STAGE_ID;
    if (activeStageId === 'size' || activeStageId === FINAL_STAGE_ID) {
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.update();
    }
  }, [activeStageId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initedRef.current) return;
    initedRef.current = true;

    const pointerTarget = pointerTargetRef.current;
    const pointerCurrent = pointerCurrentRef.current;
    const previousCameraOffset = previousCameraOffsetRef.current;
    const previousTargetOffset = previousTargetOffsetRef.current;
    const isDark = theme === 'dark';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? '#07080b' : '#f8f4ec');
    scene.fog = new THREE.Fog(isDark ? '#07080b' : '#f8f4ec', 16, 34);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(INTRO_POSE.fov, container.clientWidth / container.clientHeight, 0.1, 120);
    camera.position.set(...INTRO_POSE.position);
    camera.lookAt(new THREE.Vector3(...INTRO_POSE.target));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.18 : 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.8;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.target.set(...INTRO_POSE.target);
    controls.update();
    controlsRef.current = controls;

    const handleControlsStart = () => {
      userOrbitingRef.current = true;
      setHasScrolled(true);
    };

    const handleControlsEnd = () => {
      userOrbitingRef.current = false;
    };

    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('end', handleControlsEnd);

    const ambientLight = new THREE.AmbientLight(isDark ? '#f8f3ea' : '#fffaf2', isDark ? 1.58 : 1.32);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      isDark ? '#b7d6ff' : '#fff9f1',
      isDark ? '#4c3624' : '#d8b187',
      isDark ? 0.72 : 0.52,
    );
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(isDark ? '#fff7ed' : '#fffaf3', isDark ? 1.42 : 1.14);
    keyLight.position.set(8, 12, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1536, 1536);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.00004;
    keyLight.shadow.normalBias = 0.028;
    keyLight.shadow.radius = 8;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(isDark ? '#ffc67e' : '#ffe0bc', isDark ? 22 : 13.5, 22, 2);
    fillLight.position.set(9.5, 5.8, 10.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight('#ff8a1e', isDark ? 17 : 11, 24, 2);
    rimLight.position.set(-9, 6.5, -8);
    scene.add(rimLight);

    const bounceLight = new THREE.PointLight(isDark ? '#ffd7aa' : '#fff1df', isDark ? 8 : 5.5, 18, 2);
    bounceLight.position.set(0.4, 1.1, 5.8);
    scene.add(bounceLight);

    const studioLight = new THREE.PointLight(isDark ? '#fff4e8' : '#fffdf8', isDark ? 12 : 8.5, 20, 2);
    studioLight.position.set(-2.8, 7.4, 6.2);
    scene.add(studioLight);

    const floorBase = new THREE.Mesh(
      new THREE.CircleGeometry(12.4, 96),
      new THREE.MeshStandardMaterial({
        color: isDark ? '#0f0d0a' : '#eadcc8',
        roughness: isDark ? 0.94 : 0.88,
        metalness: 0.02,
        transparent: true,
        opacity: isDark ? 0.98 : 0.92,
      }),
    );
    floorBase.rotation.x = -Math.PI / 2;
    floorBase.position.set(0, -0.085, 0);
    floorBase.scale.set(1.9, 0.82, 1);
    floorBase.receiveShadow = true;
    scene.add(floorBase);

    const floorShadow = new THREE.Mesh(
      new THREE.CircleGeometry(8.8, 72),
      new THREE.ShadowMaterial({ opacity: isDark ? 0.16 : 0.09 }),
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, -0.015, 0);
    floorShadow.scale.set(1.92, 0.84, 1);
    floorShadow.receiveShadow = true;
    scene.add(floorShadow);

    const floorShadowFeather = new THREE.Mesh(
      new THREE.CircleGeometry(10.4, 72),
      new THREE.ShadowMaterial({ opacity: isDark ? 0.07 : 0.04 }),
    );
    floorShadowFeather.rotation.x = -Math.PI / 2;
    floorShadowFeather.position.set(0, -0.02, 0);
    floorShadowFeather.scale.set(2.04, 0.92, 1);
    floorShadowFeather.receiveShadow = true;
    scene.add(floorShadowFeather);

    const floorPlate = new THREE.Mesh(
      new THREE.CircleGeometry(10.8, 80),
      new THREE.MeshPhysicalMaterial({
        color: isDark ? '#21170f' : '#f8ecda',
        transparent: true,
        opacity: 0.98,
        roughness: isDark ? 0.42 : 0.36,
        metalness: isDark ? 0.08 : 0.03,
        clearcoat: isDark ? 0.42 : 0.3,
        clearcoatRoughness: isDark ? 0.56 : 0.42,
        reflectivity: isDark ? 0.34 : 0.2,
        sheen: isDark ? 0.18 : 0.08,
        sheenColor: new THREE.Color(isDark ? '#ffbf84' : '#fff7ed'),
        emissive: isDark ? '#25170d' : '#fff7eb',
        emissiveIntensity: isDark ? 0.1 : 0.06,
      }),
    );
    floorPlate.rotation.x = -Math.PI / 2;
    floorPlate.position.set(0, -0.05, 0);
    floorPlate.scale.set(1.68, 0.72, 1);
    floorPlate.receiveShadow = true;
    scene.add(floorPlate);

    const floorInnerPlate = new THREE.Mesh(
      new THREE.CircleGeometry(9.1, 80),
      new THREE.MeshPhysicalMaterial({
        color: isDark ? '#2a1d12' : '#fff5e8',
        transparent: true,
        opacity: isDark ? 0.5 : 0.34,
        roughness: isDark ? 0.26 : 0.22,
        metalness: 0.02,
        clearcoat: isDark ? 0.6 : 0.48,
        clearcoatRoughness: isDark ? 0.32 : 0.24,
      }),
    );
    floorInnerPlate.rotation.x = -Math.PI / 2;
    floorInnerPlate.position.set(0, -0.032, 0);
    floorInnerPlate.scale.set(1.28, 0.56, 1);
    floorInnerPlate.receiveShadow = true;
    scene.add(floorInnerPlate);

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(9.6, 72),
      new THREE.MeshBasicMaterial({ color: '#ffb15a', transparent: true, opacity: isDark ? 0.06 : 0.09 }),
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, -0.045, 0);
    floorGlow.scale.set(1.84, 0.8, 1);
    scene.add(floorGlow);

    const floorRing = new THREE.Mesh(
      new THREE.RingGeometry(9.9, 10.45, 80),
      new THREE.MeshBasicMaterial({
        color: '#ffb15a',
        transparent: true,
        opacity: isDark ? 0.12 : 0.1,
        side: THREE.DoubleSide,
      }),
    );
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.set(0, -0.04, 0);
    floorRing.scale.set(1.66, 0.72, 1);
    scene.add(floorRing);

    const floorOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(10.65, 11.75, 96),
      new THREE.MeshBasicMaterial({
        color: isDark ? '#ffb15a' : '#f0bf8c',
        transparent: true,
        opacity: isDark ? 0.06 : 0.05,
        side: THREE.DoubleSide,
      }),
    );
    floorOuterRing.rotation.x = -Math.PI / 2;
    floorOuterRing.position.set(0, -0.075, 0);
    floorOuterRing.scale.set(1.82, 0.8, 1);
    scene.add(floorOuterRing);

    const loader = new GLTFLoader();
    animationClockRef.current = new THREE.Clock();
    loader.load(
      '/3d/bike.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRootRef.current = model;
        hotspotNodeRefs.current = {};
        cargoBoxesRef.current = [];

        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.castShadow = true;
          object.receiveShadow = true;
          const clonedMaterial = Array.isArray(object.material)
            ? object.material.map((material) => material.clone())
            : object.material.clone();
          object.material = clonedMaterial;
          modelMeshesRef.current.push(object);
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            tuneBikeSurfaceMaterial(material, isDark);
            material.userData.bikeBaseState = {
              opacity: material.opacity,
              transparent: material.transparent,
              depthWrite: material.depthWrite,
            };
            material.needsUpdate = true;
          });
        });

        const initialBox = new THREE.Box3().setFromObject(model);
        const initialSize = initialBox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(initialSize.x, initialSize.y, initialSize.z) || 1;
        const scale = 6.8 / maxDimension;
        model.scale.setScalar(scale);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= box.min.y;
        model.position.x += 0.82;
        modelBaseYRef.current = model.position.y;
        autoRotationRef.current = -0.42;
        model.rotation.y = autoRotationRef.current;

        BIKE_HOTSPOTS.forEach((hotspot) => {
          hotspotNodeRefs.current[hotspot.id] = hotspot.nodeName ? model.getObjectByName(hotspot.nodeName) : null;
        });
        frameFocusRootRef.current =
          model.getObjectByName('Frame.001_22') ?? model.getObjectByName('Frame.001') ?? model.getObjectByName('frame') ?? null;

        const cargoBoxes: THREE.Object3D[] = [];
        model.traverse((object) => {
          if (/^box_\d+$/i.test(object.name)) {
            cargoBoxes.push(object);
          }
        });
        cargoBoxesRef.current = cargoBoxes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        cargoBoxesRef.current.forEach((box) => {
          box.userData.cargoBasePosition = box.position.clone();
          box.userData.cargoBaseRotation = box.rotation.clone();
          box.userData.cargoBaseScale = box.scale.clone();
          box.userData.cargoTargetPosition = box.position.clone();
          box.userData.cargoTargetRotation = box.rotation.clone();
        });
        animateCargoBoxes(activeStageIdRef.current === 'cargo');

        scene.add(model);

        if (gltf.animations.length > 0) {
          const loopClip = THREE.AnimationClip.findByName(gltf.animations, LOOP_ANIMATION_CLIP_NAME);

          if (loopClip) {
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(loopClip);
            action.clampWhenFinished = false;
            action.enabled = true;
            mixerRef.current = mixer;
            loopActionRef.current = action;
            syncLoopStageAnimation(activeStageIdRef.current);
          }
        }

        syncFrameIsolation(activeStageIdRef.current);

        setLoadingProgress(100);
        setLoading(false);
        animateCamera(BIKE_STAGES[0].camera);
      },
      (event) => {
        if (!event.total) return;
        setLoadingProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      },
      () => {
        setError('Nao foi possivel carregar o arquivo bike.glb.');
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

    const onPointerMove = (event: PointerEvent) => {
      const currentRenderer = rendererRef.current;
      if (!currentRenderer) return;

      const rect = currentRenderer.domElement.getBoundingClientRect();
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerTarget.set(normalizedX, normalizedY);
    };

    const onPointerLeave = () => {
      pointerTarget.set(0, 0);
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.style.touchAction = 'none';
    window.addEventListener('resize', onResize);

    const cameraOffset = new THREE.Vector3();
    const targetOffset = new THREE.Vector3();
    const hotspotPoint = new THREE.Vector3();
    const rearDesiredPosition = new THREE.Vector3();
    const rearDesiredTarget = new THREE.Vector3();
    const rearBasePose = BIKE_STAGES.find((stage) => stage.id === FINAL_STAGE_ID)?.camera ?? REAR_SEQUENCE_END_POSE;
    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate);

      const currentScene = sceneRef.current;
      const currentCamera = cameraRef.current;
      const currentRenderer = rendererRef.current;
      const currentControls = controlsRef.current;
      const currentModel = modelRootRef.current;

      if (!currentScene || !currentCamera || !currentRenderer || !currentControls) return;

      const delta = animationClockRef.current.getDelta();
      mixerRef.current?.update(delta);
      cargoDogMixerRef.current?.update(delta);

      currentCamera.position.sub(previousCameraOffset);
      currentControls.target.sub(previousTargetOffset);
      previousCameraOffset.set(0, 0, 0);
      previousTargetOffset.set(0, 0, 0);

      pointerCurrent.lerp(pointerTarget, 0.05);

      if (activeStageIdRef.current === 'size') {
        cameraOffset.set(
          pointerCurrent.x * 0.22,
          0,
          pointerCurrent.y * 0.16,
        );

        targetOffset.set(
          pointerCurrent.x * 0.06,
          0,
          pointerCurrent.y * 0.05,
        );
      } else {
        cameraOffset.set(
          pointerCurrent.x * 0.45,
          pointerCurrent.y * 0.18,
          Math.abs(pointerCurrent.x) * 0.08,
        );

        targetOffset.set(
          pointerCurrent.x * 0.08,
          pointerCurrent.y * 0.05,
          0,
        );
      }

      currentCamera.position.add(cameraOffset);
      currentControls.target.add(targetOffset);
      previousCameraOffset.copy(cameraOffset);
      previousTargetOffset.copy(targetOffset);

      if (activeStageIdRef.current === FINAL_STAGE_ID) {
        const basePose = rearBasePose;
        const rearCameraProgress = Math.min(rearSequenceProgressRef.current / REAR_SEQUENCE_CAMERA_PORTION, 1);
        const easedRearCameraProgress = rearCameraProgress * rearCameraProgress * (3 - 2 * rearCameraProgress);

        rearDesiredPosition.set(
          THREE.MathUtils.lerp(basePose.position[0], REAR_SEQUENCE_END_POSE.position[0], easedRearCameraProgress),
          THREE.MathUtils.lerp(basePose.position[1], REAR_SEQUENCE_END_POSE.position[1], easedRearCameraProgress),
          THREE.MathUtils.lerp(basePose.position[2], REAR_SEQUENCE_END_POSE.position[2], easedRearCameraProgress),
        );
        rearDesiredTarget.set(
          THREE.MathUtils.lerp(basePose.target[0], REAR_SEQUENCE_END_POSE.target[0], easedRearCameraProgress),
          THREE.MathUtils.lerp(basePose.target[1], REAR_SEQUENCE_END_POSE.target[1], easedRearCameraProgress),
          THREE.MathUtils.lerp(basePose.target[2], REAR_SEQUENCE_END_POSE.target[2], easedRearCameraProgress),
        );

        currentCamera.position.lerp(rearDesiredPosition, 0.12);
        currentControls.target.lerp(rearDesiredTarget, 0.12);
        currentCamera.fov = THREE.MathUtils.lerp(currentCamera.fov, THREE.MathUtils.lerp(basePose.fov, REAR_SEQUENCE_END_POSE.fov, easedRearCameraProgress), 0.12);
        currentCamera.updateProjectionMatrix();
      }

      if (currentModel) {
        if (!userOrbitingRef.current && activeStageIdRef.current !== FINAL_STAGE_ID && activeStageIdRef.current !== 'size') {
          autoRotationRef.current += 0.00075;
        }
        currentModel.rotation.y = autoRotationRef.current;
        currentModel.position.y = modelBaseYRef.current;
        currentModel.updateMatrixWorld(true);
      }

      const viewportWidth = currentRenderer.domElement.clientWidth;
      const viewportHeight = currentRenderer.domElement.clientHeight;
      BIKE_HOTSPOTS.forEach((hotspot) => {
        const element = hotspotRefs.current[hotspot.id];
        if (!element || !currentModel) return;

        if (activeStageIdRef.current === 'size') {
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          return;
        }

        const hotspotNode = hotspotNodeRefs.current[hotspot.id];
        if (hotspotNode) {
          hotspotNode.getWorldPosition(hotspotPoint);
        } else {
          hotspotPoint.set(...hotspot.position);
          currentModel.localToWorld(hotspotPoint);
        }
        hotspotPoint.project(currentCamera);

        const isVisible =
          hotspotPoint.z < 1 &&
          hotspotPoint.z > -1 &&
          hotspotPoint.x > -1.15 &&
          hotspotPoint.x < 1.15 &&
          hotspotPoint.y > -1.15 &&
          hotspotPoint.y < 1.15;

        if (!isVisible) {
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          return;
        }

        const x = (hotspotPoint.x * 0.5 + 0.5) * viewportWidth;
        const y = (-hotspotPoint.y * 0.5 + 0.5) * viewportHeight;

        element.style.opacity = hotspot.stageId === activeStageIdRef.current ? '1' : '0.72';
        element.style.pointerEvents = 'auto';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
      });

      const cursorElement = cursorRef.current;
      if (cursorElement) {
        cursorCurrentPositionRef.current.x += (cursorTargetPositionRef.current.x - cursorCurrentPositionRef.current.x) * 0.22;
        cursorCurrentPositionRef.current.y += (cursorTargetPositionRef.current.y - cursorCurrentPositionRef.current.y) * 0.22;
        cursorElement.style.transform = `translate3d(${cursorCurrentPositionRef.current.x}px, ${cursorCurrentPositionRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      currentControls.update();
      currentRenderer.render(currentScene, currentCamera);
    };

    animate();

    return () => {
      initedRef.current = false;
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      cameraTweenRef.current?.kill();
      loopActionStopRef.current?.kill();
      modelRotationTweenRef.current?.kill();
      cargoBoxesTimelineRef.current?.kill();
      cargoDogTweenRef.current?.kill();
      loopActionRef.current?.stop();
      mixerRef.current?.stopAllAction();
      cargoDogSeatActionRef.current?.stop();
      cargoDogMixerRef.current?.stopAllAction();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', handleControlsStart);
      controls.removeEventListener('end', handleControlsEnd);

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });

      controls.dispose();
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      mixerRef.current = null;
      loopActionRef.current = null;
      loopActionStopRef.current = null;
      modelRotationTweenRef.current = null;
      cargoBoxesTimelineRef.current = null;
      cargoDogTweenRef.current = null;
      cargoBoxesRef.current = [];
      cargoDogRef.current = null;
      cargoDogLoadStartedRef.current = false;
      modelMeshesRef.current = [];
      frameFocusRootRef.current = null;
      cargoDogMixerRef.current = null;
      cargoDogSeatActionRef.current = null;
      hotspotNodeRefs.current = {};
      pointerTarget.set(0, 0);
      pointerCurrent.set(0, 0);
      previousCameraOffset.set(0, 0, 0);
      previousTargetOffset.set(0, 0, 0);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [animateCamera, animateCargoBoxes, syncFrameIsolation, syncLoopStageAnimation, theme]);

  const activeStage = BIKE_STAGES.find((item) => item.id === activeStageId) ?? BIKE_STAGES[0];
  const isDark = theme === 'dark';
  const isCargoStage = activeStage.id === 'cargo';
  const isFrameStage = activeStage.id === 'frame';
  const isSizeStage = activeStage.id === 'size';
  const isPageLoading = loading;
  const loadingPercent = Math.max(0, Math.min(100, loadingProgress ?? 0));
  const loadingMarkerPosition = Math.min(95, Math.max(5, loadingPercent || 5));
  const shouldMountGallery = activeStageId === FINAL_STAGE_ID && rearSequenceProgress > REAR_SEQUENCE_CAMERA_PORTION;
  const galleryRevealProgress = Math.max(
    0,
    Math.min((rearSequenceProgress - REAR_SEQUENCE_CAMERA_PORTION) / (1 - REAR_SEQUENCE_CAMERA_PORTION), 1),
  );
  const hudOpacity = Math.max(0, 1 - galleryRevealProgress * 1.15);
  const hudLift = -galleryRevealProgress * 18;
  const galleryLift = (1 - galleryRevealProgress) * 18;
  const galleryBackdropOpacity = 0.02 + galleryRevealProgress * 0.08;
  const galleryHeroProgress = Math.min(1, Math.max(0, (galleryRevealProgress - 0.08) / 0.42));
  const galleryHeroOpacity = galleryHeroProgress;
  const galleryHeroLift = (1 - galleryHeroProgress) * 34;

  return (
    <div
      ref={shellRef}
      className={`relative h-full w-full overflow-hidden ${
        isDark ? 'bg-[#07080b] text-[#f5e9dc]' : 'bg-[#f8f4ec] text-[#201610]'
      } ${activeStageId === FINAL_STAGE_ID && rearSequenceProgress >= 1 ? 'overflow-y-auto' : 'overflow-hidden'} md:cursor-none [&_button]:md:cursor-none [&_a]:md:cursor-none`}
      onPointerMoveCapture={(event) => {
        if (event.pointerType !== 'mouse') return;
        cursorTargetPositionRef.current = { x: event.clientX, y: event.clientY };
        setCursorVisible(true);
        setCursorAction(Boolean((event.target as HTMLElement | null)?.closest('button, a, [data-cursor-action="true"]')));
      }}
      onPointerOverCapture={(event) => {
        if (event.pointerType !== 'mouse') return;
        cursorTargetPositionRef.current = { x: event.clientX, y: event.clientY };
        cursorCurrentPositionRef.current = { x: event.clientX, y: event.clientY };
        setCursorVisible(true);
      }}
      onPointerLeave={() => {
        setCursorVisible(false);
        setCursorPressed(false);
        setCursorAction(false);
      }}
      onPointerDownCapture={(event) => {
        if (event.pointerType !== 'mouse') return;
        setCursorPressed(true);
      }}
      onPointerUpCapture={(event) => {
        if (event.pointerType !== 'mouse') return;
        setCursorPressed(false);
      }}
      onPointerDown={() => setOpenedHotspotId(null)}
    >
      {!isPageLoading && (
        <div
          ref={cursorRef}
          className={`pointer-events-none fixed left-0 top-0 z-[95] hidden md:block transition-opacity duration-200 ${
            cursorVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`relative transition-transform duration-200 ${cursorPressed ? 'scale-90' : 'scale-100'}`}>
            <span
              className={`block h-3.5 w-3.5 rounded-full transition-colors duration-200 ${
                cursorAction
                  ? 'bg-[#ff8a1e] shadow-[0_0_18px_rgba(255,138,30,0.55)]'
                  : isDark
                    ? 'bg-[#fff1e3]'
                    : 'bg-[#24150d]'
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${
                cursorAction
                  ? 'border-[#ff8a1e]/70 scale-100'
                  : isDark
                    ? 'border-white/18 scale-90'
                    : 'border-[#7b5330]/22 scale-90'
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${
                cursorAction
                  ? 'border-[#ffb15a]/42 opacity-100 scale-100'
                  : 'border-transparent opacity-0 scale-75'
              }`}
            />
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 z-0 will-change-transform"
        style={{
          transform: 'translate3d(0, 0, 0)',
          opacity: 1,
        }}
      >
        <div ref={containerRef} className="h-full w-full" />

        <div
          className={`pointer-events-none absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(circle_at_top_left,_rgba(255,138,30,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,111,26,0.18),_transparent_30%),radial-gradient(circle_at_center_right,_rgba(255,177,90,0.08),_transparent_22%)]'
              : 'bg-[radial-gradient(circle_at_top_left,_rgba(255,138,30,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,111,26,0.16),_transparent_30%),radial-gradient(circle_at_center_right,_rgba(255,177,90,0.12),_transparent_22%)]'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(circle_at_center,_transparent_42%,_rgba(2,6,12,0.22)_72%,_rgba(1,3,8,0.52)_100%),linear-gradient(to_bottom,_rgba(3,8,16,0.06),_rgba(2,6,12,0.18)_58%,_rgba(1,3,8,0.3)_100%)]'
              : 'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_0%,_transparent_46%),linear-gradient(to_bottom,_rgba(255,255,255,0.12),_rgba(248,244,236,0.08)_55%,_rgba(224,210,194,0.14)_100%)]'
          }`}
        />

        <SizeGuideOverlay active={isSizeStage} isDark={isDark} />

        <div
          className="pointer-events-none absolute inset-0 z-[45] transition-[opacity,transform] duration-500"
          style={{
            opacity: hudOpacity,
            transform: `translate3d(0, ${hudLift}px, 0)`,
          }}
        >
        {BIKE_HOTSPOTS.map((hotspot) => {
          const isOpen = openedHotspotId === hotspot.id || hoveredHotspotId === hotspot.id;
          const isStageHotspot = activeStageId === hotspot.stageId;

          return (
            <button
              key={hotspot.id}
              ref={(node) => {
                hotspotRefs.current[hotspot.id] = node;
              }}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
              onMouseLeave={() => setHoveredHotspotId((current) => (current === hotspot.id ? null : current))}
              onClick={(event) => {
                event.stopPropagation();
                setHasScrolled(true);
                focusStage(hotspot.stageId);
                setOpenedHotspotId((current) => (current === hotspot.id ? null : hotspot.id));
              }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-left transition-opacity duration-300"
              style={{ left: 0, top: 0, opacity: 0 }}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border ${
                    isDark
                      ? 'border-[#ffb15a]/55 bg-[rgba(21,12,5,0.72)]'
                      : 'border-[#d57b2b]/40 bg-[rgba(255,250,245,0.94)]'
                  } ${isStageHotspot ? 'scale-100' : 'scale-[0.92]'}`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isDark ? 'bg-[#ffb15a]' : 'bg-[#d96b15]'
                    }`}
                    style={{
                      boxShadow: isStageHotspot ? '0 0 18px rgba(255,138,30,0.45)' : '0 0 10px rgba(255,138,30,0.24)',
                    }}
                  />
                  <span className="absolute inset-0 animate-ping rounded-full border border-[#ffb15a]/28" />
                </span>
                <span
                  className={`overflow-hidden rounded-[22px] border px-4 py-3 backdrop-blur-xl transition-all duration-300 ${
                    isOpen ? 'max-w-[18rem] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2 px-0 py-0 border-transparent'
                  } ${
                    isDark
                      ? 'bg-[rgba(18,9,4,0.82)] text-[#f4e7d9] border-[#ff9b47]/18 shadow-[0_18px_34px_rgba(0,0,0,0.24)]'
                      : 'bg-[rgba(255,251,246,0.96)] text-[#2c180c] border-[#df9d63]/28 shadow-[0_18px_34px_rgba(183,118,49,0.16)]'
                  }`}
                >
                  <span className="block whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.28em] text-[#d97d1f]">
                    hotspot ilustrativo
                  </span>
                  <span className="mt-2 block whitespace-normal text-sm font-semibold sm:text-[15px]">
                    {hotspot.title}
                  </span>
                  <span className={`mt-1 block whitespace-normal text-xs leading-relaxed sm:text-[13px] ${isDark ? 'text-[#eadbce]/78' : 'text-[#5a3b27]/78'}`}>
                    {hotspot.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
        </div>

        <div
          className="pointer-events-none fixed right-5 top-20 z-[80] transition-[opacity,transform] duration-500 sm:right-8 sm:top-24"
          style={{
            opacity: hudOpacity,
            transform: `translate3d(0, ${hudLift}px, 0)`,
          }}
        >
        <button
          onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ff9b47]/28 bg-[rgba(18,9,4,0.76)] text-[#ffd9b8] shadow-[0_8px_22px_rgba(0,0,0,0.18)] transition hover:border-[#ffb15a]/45"
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {isDark ? <SunMedium size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 px-5 pb-6 pt-5 transition-[opacity,transform] duration-500 sm:px-8"
          style={{
            opacity: hudOpacity,
            transform: `translate3d(0, ${hudLift}px, 0)`,
          }}
        >
        <div className="mx-auto flex w-full max-w-7xl justify-between gap-4">
          <div className="flex max-w-[52rem] flex-col gap-4">
            <StageTextPanel
              activeStage={activeStage}
              eyebrowRef={eyebrowRef}
              titleWrapRef={titleWrapRef}
              subtitleRef={subtitleRef}
              isCargoStage={isCargoStage}
              isDark={isDark}
            />

            <AnimatePresence mode="wait">
              {isFrameStage && (
                <FrameSealRail key="frame-seal-rail" isDark={isDark} selectedSealId={selectedFrameSealId} onSelect={focusFrameSeal} />
              )}
            </AnimatePresence>
          </div>

          <div
            ref={scrollHintRef}
            className={`pointer-events-none absolute right-0 top-4 transition-opacity duration-300 sm:right-2 ${
              hasScrolled ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden="true"
          >
            <div
              data-scroll-outline
              className={`flex h-16 w-10 items-start justify-center rounded-full border p-2 backdrop-blur-xl ${
                isDark
                  ? 'border-[#ff9b47]/22 bg-[#150c05]/55'
                  : 'border-[#d88b3e]/35 bg-[rgba(255,248,240,0.96)] shadow-[0_10px_24px_rgba(186,120,49,0.16)]'
              }`}
            >
              <span
                data-scroll-dot
                className={`block h-3.5 w-[3px] rounded-full ${
                  isDark
                    ? 'bg-[#ffb261] shadow-[0_0_16px_rgba(255,140,40,0.45)]'
                    : 'bg-[#c96510] shadow-[0_0_16px_rgba(201,101,16,0.30)]'
                }`}
              />
            </div>
          </div>
        </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 transition-[opacity,transform] duration-500 sm:pr-8"
          style={{
            opacity: hudOpacity,
            transform: `translate3d(0, ${hudLift}px, 0)`,
          }}
        >
        <div
          className={`pointer-events-auto relative flex flex-col gap-2 rounded-[28px] border px-3 py-3 backdrop-blur-2xl ${
            isDark
              ? 'border-[#ff9b47]/16 bg-[#120904]/72 shadow-[0_18px_40px_rgba(0,0,0,0.24)]'
              : 'border-[#ff9b47]/18 bg-[rgba(255,248,240,0.86)] shadow-[0_18px_40px_rgba(184,126,64,0.14)]'
          }`}
        >
          <span className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#ff9b47]/24 to-transparent" />
          {BIKE_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => focusStage(stage.id)}
              aria-label={stage.id}
              className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
            >
              <span
                className={`block rounded-full border transition-all duration-300 ${
                  activeStageId === stage.id ? 'h-3 w-6' : 'h-2.5 w-2.5'
                }`}
                style={{
                  borderColor: activeStageId === stage.id ? 'rgba(255,201,142,0.45)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(143,104,70,0.12)',
                  background:
                    activeStageId === stage.id
                      ? `linear-gradient(90deg, ${stage.accent} 0%, #ffd19f 100%)`
                      : isDark
                        ? 'rgba(255,255,255,0.14)'
                        : 'rgba(153,113,78,0.16)',
                  boxShadow: activeStageId === stage.id ? `0 0 22px ${stage.accent}` : 'none',
                }}
              />
            </button>
          ))}
        </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5 transition-[opacity,transform] duration-500 sm:px-8 sm:pb-8"
          style={{
            opacity: hudOpacity,
            transform: `translate3d(0, ${hudLift}px, 0)`,
          }}
        >
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4">
          <div
            className={`pointer-events-auto rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-[0.26em] backdrop-blur-xl ${
              isDark
                ? 'border-[#ff9b47]/18 bg-[#120904]/64 text-[#ffd1aa]/62'
                : 'border-[#ff9b47]/18 bg-[rgba(255,248,240,0.84)] text-[#8f643d]/74'
            }`}
          >
            passo {BIKE_STAGES.findIndex((item) => item.id === activeStageId) + 1} / {BIKE_STAGES.length}
          </div>
          <div className="pointer-events-auto shrink-0">
            {!logoFailed ? (
              <img
                src={ORANGE_CARGO_LOGO_URL}
                alt="Orange Cargo"
                onError={() => setLogoFailed(true)}
                className="block h-auto w-[205px] max-w-none object-contain transition-[filter,opacity] duration-300 [filter:brightness(0)_saturate(0)] opacity-80 hover:opacity-100 hover:[filter:none] sm:w-[250px] md:w-[295px]"
              />
            ) : (
              <p className={`text-[11px] font-mono uppercase tracking-[0.42em] ${isDark ? 'text-[#e8d3bd]/70' : 'text-[#4a2811]'}`}>
                Orange Cargo
              </p>
            )}
          </div>
        </div>
        </div>
      </div>

      {shouldMountGallery && (
        <div className="relative z-[12] pt-[56vh]">
          <div
            className="will-change-transform"
            style={{
              transform: `translate3d(0, ${galleryLift}vh, 0)`,
              opacity: galleryRevealProgress === 0 ? 0 : 1,
              pointerEvents: galleryRevealProgress > 0.08 ? 'auto' : 'none',
            }}
          >
            <div
              className={`relative ${isDark ? 'text-[#f5e9dc]' : 'text-[#22160f]'}`}
              style={{
                backgroundColor: isDark
                  ? `rgba(8, 9, 13, ${galleryBackdropOpacity})`
                  : `rgba(245, 239, 230, ${galleryBackdropOpacity})`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="mx-auto flex min-h-screen w-full max-w-[72rem] flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">
                <section
                  className="relative mb-10 overflow-visible sm:mb-12"
                  style={{
                    opacity: galleryHeroOpacity,
                    transform: `translate3d(0, ${galleryHeroLift}px, 0)`,
                  }}
                >
                  <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:gap-0">
                    <figure
                      className={`relative overflow-hidden rounded-[34px] border ${
                        isDark
                          ? 'border-[#ff9b47]/16 bg-[rgba(12,8,6,0.74)]'
                          : 'border-[#dfb48a]/24 bg-[rgba(255,252,248,0.86)]'
                      }`}
                    >
                      <div className="relative h-[23rem] sm:h-[31rem]">
                        <img
                          src={BIKE_GALLERY_HERO_IMAGE}
                          alt="Orange Cargo destaque editorial"
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,5,0.08)_0%,rgba(7,6,5,0.2)_42%,rgba(7,6,5,0.5)_100%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,177,90,0.24),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(255,138,30,0.14),transparent_24%)]" />
                      </div>
                    </figure>

                    <div className="relative z-[2] px-1 lg:-ml-20 lg:pb-10 xl:-ml-28">
                      <div className="max-w-[46rem]">
                        <h2 className="text-[clamp(3.7rem,9vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.09em]">
                          <span className="bg-gradient-to-b from-[#ffb15a] via-[#ff8a1e] to-[#bf4d00] bg-clip-text text-transparent">
                            Carregue
                          </span>
                          <span className={isDark ? 'text-[#fff2e4]' : 'text-[#3d210f]'}> Momentos</span>
                        </h2>
                        <p
                          className={`mt-6 max-w-[24rem] text-[clamp(1rem,1.8vw,1.28rem)] font-medium leading-[1.35] tracking-[-0.03em] lg:ml-28 xl:ml-36 ${
                            isDark ? 'text-[#f1dfcd]/82' : 'text-[#5b3a24]/82'
                          }`}
                        >
                          A narrativa deixa o palco 3D respirar ao fundo enquanto imagens, enquadramentos e fragmentos editoriais constroem o clima final do produto.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 xl:columns-3">
              {BIKE_GALLERY_ITEMS.map((item) => {
                if (item.type === 'text') {
                  return (
                    <article
                      key={item.id}
                      className={`mb-4 break-inside-avoid overflow-hidden rounded-[30px] border px-6 py-7 transition-transform duration-500 sm:mb-5 sm:px-7 sm:py-8 ${item.offsetClass} ${
                        isDark
                          ? 'border-[#ff9b47]/14 bg-[linear-gradient(180deg,rgba(23,14,9,0.7),rgba(10,8,7,0.56))] text-[#f8eadb]'
                          : 'border-[#dfb48a]/20 bg-[linear-gradient(180deg,rgba(255,251,246,0.66),rgba(246,238,227,0.52))] text-[#2d1a0e]'
                      }`}
                    >
                      <p className={`text-[10px] font-mono uppercase tracking-[0.28em] ${isDark ? 'text-[#ffbf81]/72' : 'text-[#a5672d]/74'}`}>
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-4 text-[clamp(2rem,4vw,3.6rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">
                        {item.title}
                      </h3>
                      <p className={`mt-4 max-w-sm text-sm leading-relaxed sm:text-[15px] ${isDark ? 'text-[#ebdbc9]/78' : 'text-[#5f3d27]/78'}`}>
                        {item.body}
                      </p>
                    </article>
                  );
                }

                return (
                  <figure
                    key={item.src}
                    data-cursor-action="true"
                    className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-[28px] border transition-transform duration-500 sm:mb-5 ${item.offsetClass} ${
                      isDark
                        ? 'border-[#ff9b47]/14 bg-[rgba(12,8,6,0.62)]'
                        : 'border-[#dfb48a]/18 bg-[rgba(255,252,248,0.58)]'
                    }`}
                  >
                    <div className={`${item.aspect} overflow-hidden`}>
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(10,8,7,0.32)] via-transparent to-transparent opacity-70" />
                  </figure>
                );
              })}
            </div>

            <section
              className={`mt-6 grid gap-4 overflow-hidden rounded-[30px] border p-4 sm:mt-8 sm:p-5 lg:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] ${
                isDark
                  ? 'border-[#ff9b47]/14 bg-[rgba(10,8,7,0.28)]'
                  : 'border-[#dfb48a]/22 bg-[rgba(255,251,246,0.34)]'
              }`}
            >
              <figure
                data-cursor-action="true"
                className={`group relative overflow-hidden rounded-[24px] border ${
                  isDark
                    ? 'border-[#ff9b47]/14 bg-[rgba(12,8,6,0.76)]'
                    : 'border-[#dfb48a]/24 bg-[rgba(255,252,248,0.9)]'
                }`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={BIKE_GALLERY_ENDCAP.src}
                    alt={BIKE_GALLERY_ENDCAP.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(10,8,7,0.28)] via-transparent to-transparent opacity-70" />
              </figure>

              <div className="flex min-h-full flex-col justify-center px-1 py-3 sm:px-3">
                <p className={`text-[10px] font-mono uppercase tracking-[0.28em] ${isDark ? 'text-[#ffbf81]/72' : 'text-[#a5672d]/74'}`}>
                  {BIKE_GALLERY_ENDCAP.eyebrow}
                </p>
                <h3 className="mt-4 max-w-3xl text-[clamp(2.6rem,5vw,5.4rem)] font-black uppercase leading-[0.88] tracking-[-0.07em]">
                  {BIKE_GALLERY_ENDCAP.title}
                </h3>
                <p className={`mt-5 max-w-2xl text-sm leading-relaxed sm:text-[16px] ${isDark ? 'text-[#ebdbc9]/78' : 'text-[#5f3d27]/78'}`}>
                  {BIKE_GALLERY_ENDCAP.body}
                </p>
              </div>
            </section>

            <footer
              className={`mt-10 flex flex-col items-start justify-between gap-5 rounded-[30px] border px-6 py-6 sm:mt-12 sm:flex-row sm:items-end sm:px-8 ${
                isDark
                  ? 'border-[#ff9b47]/14 bg-[rgba(10,8,7,0.28)]'
                  : 'border-[#dfb48a]/20 bg-[rgba(255,251,246,0.32)]'
              }`}
            >
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-[0.28em] ${isDark ? 'text-[#ffbf81]/72' : 'text-[#a5672d]/74'}`}>
                  orange cargo
                </p>
                <p className={`mt-3 max-w-md text-sm leading-relaxed sm:text-[15px] ${isDark ? 'text-[#ebdbc9]/76' : 'text-[#5f3d27]/78'}`}>
                  Fechamento da apresentacao com galeria editorial, reforcando materialidade, escala e presenca do produto.
                </p>
              </div>

              <div className="shrink-0">
                {!logoFailed ? (
                  <img
                    src={ORANGE_CARGO_LOGO_URL}
                    alt="Orange Cargo"
                    onError={() => setLogoFailed(true)}
                    className="block h-auto w-[180px] object-contain opacity-85 transition-[filter,opacity] duration-300 hover:opacity-100 sm:w-[220px]"
                  />
                ) : (
                  <p className={`text-[11px] font-mono uppercase tracking-[0.42em] ${isDark ? 'text-[#e8d3bd]/70' : 'text-[#4a2811]'}`}>
                    Orange Cargo
                  </p>
                )}
              </div>
            </footer>
            </div>
          </div>
        </div>
        </div>
      )}

      {isPageLoading && (
        <div
          className={`fixed inset-0 z-[90] flex items-center justify-center backdrop-blur-md ${
            isDark ? 'bg-[#160a03]/96' : 'bg-[#f0dfca]'
          }`}
        >
          <div className="relative w-full">
            <div
              className={`relative h-[4px] w-full overflow-visible ${
                isDark ? 'bg-[#ffb15a]/18' : 'bg-[#efb47d]/38'
              }`}
            >
              <div
                className="absolute left-0 top-0 h-[4px] bg-[#ff8a1e] shadow-[0_0_24px_rgba(255,138,30,0.52)] transition-[width] duration-300 ease-out"
                style={{ width: `${loadingPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-300 ease-out"
                style={{ left: `${loadingMarkerPosition}%` }}
              >
                <span className="block text-[clamp(3rem,10vw,7rem)] font-black tracking-[-0.08em] text-[#e66d0d] drop-shadow-[0_0_24px_rgba(255,138,30,0.24)]">
                  {loadingPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className={`absolute inset-0 flex items-center justify-center px-6 text-center ${
            isDark ? 'bg-[#06070a]/92' : 'bg-[rgba(248,244,236,0.94)]'
          }`}
        >
          <div
            className={`max-w-md rounded-[28px] border border-red-400/20 p-6 backdrop-blur-xl ${
              isDark ? 'bg-black/45' : 'bg-[rgba(255,248,240,0.92)]'
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.34em] text-red-300/70">
              Falha na cena
            </p>
            <p className={`mt-3 text-base ${isDark ? 'text-white/82' : 'text-[#3b2a1f]/82'}`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`mt-5 rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-[0.24em] transition ${
                isDark
                  ? 'border-white/12 bg-white/5 text-white/64 hover:border-white/22 hover:text-white'
                  : 'border-[#d5b18a]/40 bg-white/40 text-[#7b5534] hover:border-[#c3874f] hover:text-[#4d2b11]'
              }`}
            >
              Recarregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrangeBikeExperiment;
