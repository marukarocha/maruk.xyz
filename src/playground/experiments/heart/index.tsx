import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';

// ── Translations ──
type Lang = 'br' | 'en' | 'es';

const translations: Record<Lang, Record<string, string>> = {
  br: {
    loading: 'Carregando modelo...',
    collection: 'Coleção de Energy Drinks',
    label: 'Rótulo',
    productInfo: 'Informações do Produto',
    nutritionInfo: 'Informação Nutricional',
    description: 'Descrição',
    descText: 'Bebida energética gaseificada. Contém cafeína, taurina e vitaminas do complexo B. Porção de 100ml. Consumo moderado recomendado.',
    energy: 'Energia',
    caffeine: 'Cafeína',
    taurine: 'Taurina',
    sugars: 'Açúcares',
    slideBack: 'Deslize para fechar',
    keys: '↑ ↓ teclas',
  },
  en: {
    loading: 'Loading model...',
    collection: 'Energy Drink Collection',
    label: 'Label',
    productInfo: 'Product Information',
    nutritionInfo: 'Nutrition Facts',
    description: 'Description',
    descText: 'Carbonated energy drink. Contains caffeine, taurine and B-complex vitamins. Per 100ml serving. Moderate consumption recommended.',
    energy: 'Energy',
    caffeine: 'Caffeine',
    taurine: 'Taurine',
    sugars: 'Sugars',
    slideBack: 'Slide to close',
    keys: '↑ ↓ keys',
  },
  es: {
    loading: 'Cargando modelo...',
    collection: 'Colección de Energy Drinks',
    label: 'Etiqueta',
    productInfo: 'Información del Producto',
    nutritionInfo: 'Información Nutricional',
    description: 'Descripción',
    descText: 'Bebida energética carbonatada. Contiene cafeína, taurina y vitaminas del complejo B. Porción de 100ml. Consumo moderado recomendado.',
    energy: 'Energía',
    caffeine: 'Cafeína',
    taurine: 'Taurina',
    sugars: 'Azúcares',
    slideBack: 'Desliza para cerrar',
    keys: '↑ ↓ teclas',
  },
};

// Ordered list: GLB node name → display name
// This is the exact order the user navigates through
const DRINK_ORDER: { nodeName: string; displayName: string }[] = [
  { nodeName: 'Battery', displayName: 'Battery' },
  { nodeName: 'EdBottle', displayName: 'Ed Drink' },
  { nodeName: 'MegaForce', displayName: 'Mega Force' },
  { nodeName: 'MegaForceSugarFree', displayName: 'Mega Force Zero' },
  { nodeName: 'Monster', displayName: 'Monster' },
  { nodeName: 'JumpStart', displayName: 'Jump Start' },
  { nodeName: 'KongStrong', displayName: 'Kong Strong' },
  { nodeName: 'Es', displayName: 'Energy Cring' },
  { nodeName: 'RedBull', displayName: 'Red Bull' },
];

interface DrinkInfo {
  name: string;
  angle: number;
  node: THREE.Object3D;
  baseScale: THREE.Vector3;
  baseY: number;
  bobSpeed: number;
  bobAmount: number;
  baseRotX: number;
  baseRotY: number;
  baseRotZ: number;
  meshes: THREE.Mesh[];
  originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
}

type BokehUniformKey = 'focus' | 'aperture' | 'maxblur';
type BokehUniforms = Record<BokehUniformKey, { value: number }>;

// Dark silhouette material for non-active cans
const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0a14,
  roughness: 0.95,
  metalness: 0,
  emissive: new THREE.Color(0x111122),
  emissiveIntensity: 0.15,
});

const DrinksExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalDrinks, setTotalDrinks] = useState(0);
  const [showInactiveTextures, setShowInactiveTextures] = useState(false);
  const showInactiveTexturesRef = useRef(false);
  const [showControls, setShowControls] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];
  const [labelSlider, setLabelSlider] = useState<{ open: boolean; drinkName: string; drinkIndex: number } | null>(null);
  const labelSliderRef = useRef<{ open: boolean; drinkName: string; drinkIndex: number } | null>(null);
  const labelRotatingRef = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Refs for GSAP text animations
  const titleRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const prevNameRef = useRef('');

  // Imperative refs for Three.js ↔ React communication
  const modelRef = useRef<THREE.Object3D | null>(null);
  const targetRotationRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const drinksRef = useRef<DrinkInfo[]>([]);
  const currentIdxRef = useRef(0);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const spotTargetRef = useRef<THREE.Object3D | null>(null);
  const activeFloatTweenRef = useRef<gsap.core.Timeline | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);
  const bottomLightRef = useRef<THREE.DirectionalLight | null>(null);
  const labelOrigQuatRef = useRef<THREE.Quaternion | null>(null);
  const labelSpinObjRef = useRef<{ t: number }>({ t: 0 });

  const highlightDrink = useCallback((idx: number, prevIdx: number) => {
    const drinks = drinksRef.current;
    if (!drinks.length) return;

    // Kill previous active float animation and smoothly reset that drink
    if (activeFloatTweenRef.current) {
      activeFloatTweenRef.current.kill();
      activeFloatTweenRef.current = null;
    }

    drinks.forEach((drink, i) => {
      const isActive = i === idx;
      const wasPrev = i === prevIdx;

      if (isActive) {
        // ── Active: restore original materials, scale up ──
        drink.meshes.forEach((mesh) => {
          const orig = drink.originalMaterials.get(mesh);
          if (orig) mesh.material = orig;
        });

        gsap.to(drink.node.scale, {
          x: drink.baseScale.x * 1.5,
          y: drink.baseScale.y * 1.5,
          z: drink.baseScale.z * 1.5,
          duration: 1,
          ease: 'elastic.out(1, 0.4)',
        });

        // ── Floating + micro-rotation for the active can ──
        // Start from current position, float gently
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.fromTo(drink.node.position,
          { y: drink.baseY },
          { y: drink.baseY + 0.08, duration: 2, ease: 'sine.inOut' },
          0
        );
        tl.fromTo(drink.node.rotation,
          { x: drink.baseRotX, z: drink.baseRotZ },
          { x: drink.baseRotX + 0.025, z: drink.baseRotZ + 0.035, duration: 2.6, ease: 'sine.inOut' },
          0
        );
        activeFloatTweenRef.current = tl;

      } else {
        // ── Non-active: dark material or original textures, smaller scale ──
        if (showInactiveTexturesRef.current) {
          drink.meshes.forEach((mesh) => {
            const orig = drink.originalMaterials.get(mesh);
            if (orig) mesh.material = orig;
          });
        } else {
          drink.meshes.forEach((mesh) => {
            mesh.material = darkMaterial;
          });
        }

        if (wasPrev) {
          // Smoothly reset position & rotation back to base for the previously active drink
          gsap.to(drink.node.position, {
            y: drink.baseY,
            duration: 0.5,
            ease: 'power2.out',
          });

          gsap.to(drink.node.rotation, {
            x: drink.baseRotX,
            z: drink.baseRotZ,
            duration: 0.5,
            ease: 'power2.out',
          });

          gsap.to(drink.node.scale, {
            x: drink.baseScale.x * 0.75,
            y: drink.baseScale.y * 0.75,
            z: drink.baseScale.z * 0.75,
            duration: 0.6,
            ease: 'power2.out',
          });
        }
      }
    });

    // Move spotlight to target the active drink
    if (spotTargetRef.current && modelRef.current) {
      const activeDrink = drinks[idx];
      const worldPos = new THREE.Vector3();
      activeDrink.node.getWorldPosition(worldPos);
      gsap.to(spotTargetRef.current.position, {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, []);

  const goTo = useCallback((index: number) => {
    const drinks = drinksRef.current;
    if (!drinks.length || !modelRef.current || isAnimatingRef.current) return;

    // Auto-close label slider if open
    const slider = labelSliderRef.current;
    if (slider) {
      const prevDrink = drinks[slider.drinkIndex];
      // Animate rotation back smoothly via quaternion slerp
      const curQuat = prevDrink.node.quaternion.clone();
      const origQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(prevDrink.baseRotX, prevDrink.baseRotY, prevDrink.baseRotZ)
      );
      const spinBack = { t: 0 };
      gsap.to(spinBack, {
        t: 1,
        duration: 0.5,
        ease: 'power3.out',
        onUpdate: () => {
          prevDrink.node.quaternion.slerpQuaternions(curQuat, origQuat, spinBack.t);
        },
        onComplete: () => {
          prevDrink.node.rotation.set(prevDrink.baseRotX, prevDrink.baseRotY, prevDrink.baseRotZ);
        },
      });
      // Animate scale back
      gsap.to(prevDrink.node.scale, {
        x: prevDrink.baseScale.x * 1.5,
        y: prevDrink.baseScale.y * 1.5,
        z: prevDrink.baseScale.z * 1.5,
        duration: 0.5,
        ease: 'power3.out',
      });
      labelRotatingRef.current = false;
      labelOrigQuatRef.current = null;
      labelSliderRef.current = null;
      setLabelSlider(null);
    }

    const count = drinks.length;
    const idx = ((index % count) + count) % count;
    const drink = drinks[idx];
    const prevIdx = currentIdxRef.current;

    // Target rotation: bring this drink to face the camera
    const target = -(drink.angle);

    isAnimatingRef.current = true;

    // Elastic rotation!
    gsap.to(targetRotationRef, {
      current: target,
      duration: 1.2,
      ease: 'elastic.out(1, 0.6)',
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // Highlight scale
    highlightDrink(idx, prevIdx);

    // Determine direction before updating refs
    const direction = idx > prevIdx ? 1 : (idx < prevIdx ? -1 : 1);

    currentIdxRef.current = idx;
    setCurrentIndex(idx);

    // ── GSAP text transition ──
    const els = [titleRef.current, counterRef.current, subtitleRef.current].filter(Boolean);

    // Exit old text
    gsap.to(els, {
      y: direction * -30,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(6px)',
      duration: 0.15,
      ease: 'power3.in',
      stagger: 0.02,
      onComplete: () => {
        prevNameRef.current = drink.name;
        setCurrentName(drink.name);
        // Set up for entrance
        gsap.set(els, { y: direction * 30, scale: 1.04, filter: 'blur(8px)' });
        // Enter new text
        gsap.to(els, {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.35,
          ease: 'power3.out',
          stagger: 0.03,
        });
      },
    });
  }, [highlightDrink]);

  const goPrev = useCallback(() => goTo(currentIdxRef.current - 1), [goTo]);
  const goNext = useCallback(() => goTo(currentIdxRef.current + 1), [goTo]);

  // ── Label modal: rotate can 160° and scale up ──
  const openLabel = useCallback(() => {
    const drinks = drinksRef.current;
    const idx = currentIdxRef.current;
    if (!drinks.length || labelRotatingRef.current) return;
    const drink = drinks[idx];

    labelRotatingRef.current = true;

    // Kill floating animation
    if (activeFloatTweenRef.current) {
      activeFloatTweenRef.current.kill();
      activeFloatTweenRef.current = null;
    }

    // Scale up the individual can
    gsap.to(drink.node.scale, {
      x: drink.baseScale.x * 2.2,
      y: drink.baseScale.y * 2.2,
      z: drink.baseScale.z * 2.2,
      duration: 1,
      ease: 'power3.out',
    });

    // Store original quaternion and compute target with world-Y spin
    const startQuat = drink.node.quaternion.clone();
    labelOrigQuatRef.current = startQuat;

    const spinQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), // world Y axis
      Math.PI * 0.89 // ~160°
    );
    // World-space rotation: spin * start (pre-multiply)
    const targetQuat = spinQuat.multiply(startQuat);

    // Animate via slerp parameter
    const spinObj = { t: 0 };
    labelSpinObjRef.current = spinObj;
    gsap.to(spinObj, {
      t: 1,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        drink.node.quaternion.slerpQuaternions(startQuat, targetQuat, spinObj.t);
      },
    });

    const data = { open: true, drinkName: drink.name, drinkIndex: idx };
    labelSliderRef.current = data;
    setLabelSlider(data);
  }, []);

  const closeLabel = useCallback(() => {
    const drinks = drinksRef.current;
    const slider = labelSliderRef.current;
    if (!slider || !drinks.length) return;
    const drink = drinks[slider.drinkIndex];

    // Restore scale
    gsap.to(drink.node.scale, {
      x: drink.baseScale.x * 1.5,
      y: drink.baseScale.y * 1.5,
      z: drink.baseScale.z * 1.5,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Spin back using quaternion slerp from current to original
    const currentQuat = drink.node.quaternion.clone();
    const origQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(drink.baseRotX, drink.baseRotY, drink.baseRotZ)
    );
    const spinObj = { t: 0 };
    gsap.to(spinObj, {
      t: 1,
      duration: 1,
      ease: 'power3.out',
      onUpdate: () => {
        drink.node.quaternion.slerpQuaternions(currentQuat, origQuat, spinObj.t);
      },
      onComplete: () => {
        // Ensure exact restoration via Euler
        drink.node.rotation.set(drink.baseRotX, drink.baseRotY, drink.baseRotZ);
        labelRotatingRef.current = false;
        labelOrigQuatRef.current = null;
        // Restart float animation
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.fromTo(drink.node.position,
          { y: drink.baseY },
          { y: drink.baseY + 0.08, duration: 2, ease: 'sine.inOut' },
          0
        );
        tl.fromTo(drink.node.rotation,
          { x: drink.baseRotX, z: drink.baseRotZ },
          { x: drink.baseRotX + 0.025, z: drink.baseRotZ + 0.035, duration: 2.6, ease: 'sine.inOut' },
          0
        );
        activeFloatTweenRef.current = tl;
      },
    });

    // Animate slider out
    labelSliderRef.current = null;
    if (sliderRef.current) {
      gsap.to(sliderRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => setLabelSlider(null),
      });
    } else {
      setLabelSlider(null);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initedRef.current) return;
    initedRef.current = true;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'low-power',
      stencil: true,
      alpha: false,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(w, h);
    renderer.setClearColor(0x0c0c14);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.80;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c14);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(26, w / h, 0.1, 200);
    camera.position.set(0, 2.2, 7.0);
    camera.lookAt(0, 0.35, 0);
    cameraRef.current = camera;

    // ── Post-processing ──
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Depth of field — focus on front drink (~distance 6)
    const bokehPass = new BokehPass(scene, camera, {
      focus: 4.8,
      aperture: 0.0045,
      maxblur: 0.014,
    });
    composer.addPass(bokehPass);
    bokehPassRef.current = bokehPass;

    // Output (tone mapping + color space)
    composer.addPass(new OutputPass());

    // ── Lights ──
    // Low ambient so non-lit cans stay dark
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    // Spotlight — follows the active drink
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 1, 0);
    scene.add(spotTarget);
    spotTargetRef.current = spotTarget;

    const spot = new THREE.SpotLight(0xfff8f0, 14, 25, Math.PI / 6, 0.6, 1);
    spot.position.set(0, 3, 9);
    spot.target = spotTarget;
    spot.castShadow = false;
    scene.add(spot);
    spotLightRef.current = spot;

    // Subtle rim light from behind
    const back = new THREE.DirectionalLight(0x8899ee, 0.3);
    back.position.set(-3, 4, -5);
    scene.add(back);
    backLightRef.current = back;
    // Faint bottom fill
    const bottomLight = new THREE.DirectionalLight(0x5566aa, 0.15);
    bottomLight.position.set(0, -5, 2);
    scene.add(bottomLight);
    bottomLightRef.current = bottomLight;

    // ── Controls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.35, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();
    controlsRef.current = controls;

    // ── Mouse parallax ──
    const baseCamPos = { x: 0, y: 2.2, z: 7.0 };
    const mouseTarget = { x: 0, y: 0 }; // normalized -1..1
    const mouseCurrent = { x: 0, y: 0 };
    const parallaxStrength = { x: 0.3, y: 0.15 }; // how much the camera shifts
    const zoomRange = 0.4; // max zoom-in when cursor is at center

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;  // -1..1
      mouseTarget.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;  // -1..1
    };
    container.addEventListener('mousemove', onMouseMove);

    // ── Load model ──
    const loader = new GLTFLoader();

    loader.load(
      '/3d/energy_drinks.glb',
      (gltf) => {
        const obj = gltf.scene;

        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        obj.scale.setScalar(scale);

        box.setFromObject(obj);
        box.getCenter(center);
        obj.position.sub(center);
        obj.position.y += (size.y * scale) / 2;

        scene.add(obj);
        modelRef.current = obj;

        // ── Find drinks by name, keep user-defined order ──
        const nodeMap = new Map<string, THREE.Object3D>();
        obj.traverse((child) => {
          if (child.name && !nodeMap.has(child.name)) {
            nodeMap.set(child.name, child);
          }
        });

        const drinkNodes: DrinkInfo[] = [];
        for (const entry of DRINK_ORDER) {
          const node = nodeMap.get(entry.nodeName);
          if (!node) {
            console.warn(`[Drinks] Node "${entry.nodeName}" not found in GLB`);
            continue;
          }
          const worldPos = new THREE.Vector3();
          node.getWorldPosition(worldPos);
          const angle = Math.atan2(worldPos.x, worldPos.z);

          // Collect meshes and store original materials
          const meshes: THREE.Mesh[] = [];
          const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
          node.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshes.push(child);
              originalMaterials.set(child, child.material);
            }
          });

          // Random tilt for personality
          const tiltX = (Math.random() - 0.5) * 0.15;
          const tiltZ = (Math.random() - 0.5) * 0.15;
          node.rotation.x += tiltX;
          node.rotation.z += tiltZ;

          // Store the FULL rotation after tilt (model rotation + random tilt)
          const baseRotX = node.rotation.x;
          const baseRotY = node.rotation.y;
          const baseRotZ = node.rotation.z;

          drinkNodes.push({
            name: entry.displayName,
            angle,
            node,
            baseScale: node.scale.clone(),
            baseY: node.position.y,
            bobSpeed: 0.8 + Math.random() * 0.6,
            bobAmount: 0.03 + Math.random() * 0.04,
            baseRotX,
            baseRotY,
            baseRotZ,
            meshes,
            originalMaterials,
          });
        }

        drinksRef.current = drinkNodes;
        setTotalDrinks(drinkNodes.length);

        console.log('[Drinks] Order:', drinkNodes.map((d, i) =>
          `${i + 1}. ${d.name} → ${(d.angle * 180 / Math.PI).toFixed(0)}°`
        ));

        // Start at first drink
        if (drinkNodes.length > 0) {
          const first = drinkNodes[0];
          targetRotationRef.current = -(first.angle);
          obj.rotation.y = targetRotationRef.current;
          setCurrentName(first.name);
          setCurrentIndex(0);
          currentIdxRef.current = 0;

          // Scale up the first drink with entrance animation
          gsap.fromTo(first.node.scale,
            { x: 0, y: 0, z: 0 },
            {
              x: first.baseScale.x * 1.5,
              y: first.baseScale.y * 1.5,
              z: first.baseScale.z * 1.5,
              duration: 1.2,
              ease: 'elastic.out(1, 0.4)',
              delay: 0.3,
            }
          );

          // Make non-active cans dark + small
          drinkNodes.forEach((d, i) => {
            if (i !== 0) {
              if (!showInactiveTexturesRef.current) {
                d.meshes.forEach((mesh) => {
                  mesh.material = darkMaterial;
                });
              }
              d.node.scale.set(
                d.baseScale.x * 0.75,
                d.baseScale.y * 0.75,
                d.baseScale.z * 0.75
              );
            }
          });


          // Start floating animation for first drink
          const tl = gsap.timeline({ repeat: -1, yoyo: true });
          tl.fromTo(first.node.position,
            { y: first.baseY },
            { y: first.baseY + 0.08, duration: 2, ease: 'sine.inOut' },
            0
          );
          tl.fromTo(first.node.rotation,
            { x: first.baseRotX, z: first.baseRotZ },
            { x: first.baseRotX + 0.025, z: first.baseRotZ + 0.035, duration: 2.6, ease: 'sine.inOut' },
            0
          );
          activeFloatTweenRef.current = tl;

          // Point spotlight at first drink
          if (spotTargetRef.current) {
            const wp = new THREE.Vector3();
            first.node.getWorldPosition(wp);
            spotTargetRef.current.position.copy(wp);
          }
        }

        setLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`[Drinks] Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        }
      },
      (err) => {
        console.error('[Drinks] GLTFLoader error:', err);
        setError('Falha ao carregar o modelo 3D.');
        setLoading(false);
      }
    );

    // ── Animation loop ──
    let animId = 0;
    let alive = true;

    const animate = () => {
      if (!alive) return;
      animId = requestAnimationFrame(animate);

      if (modelRef.current) {
        modelRef.current.rotation.y = targetRotationRef.current;
      }

      // Smooth mouse parallax interpolation
      const lerpFactor = 0.06;
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;

      // Distance from center (0..1) — closer to center = more zoom
      const dist = Math.sqrt(mouseCurrent.x ** 2 + mouseCurrent.y ** 2);
      const proximity = Math.max(0, 1 - dist); // 1 at center, 0 at edges
      const zoomOffset = proximity * zoomRange;

      // Apply parallax offset + proximity zoom to camera
      camera.position.x = baseCamPos.x + mouseCurrent.x * parallaxStrength.x;
      camera.position.y = baseCamPos.y - mouseCurrent.y * parallaxStrength.y;
      camera.position.z = baseCamPos.z - zoomOffset;

      // Keep spotlight tracking the active drink through rotations
      const drinks = drinksRef.current;
      if (spotTargetRef.current && drinks.length > 0) {
        const activeDrink = drinks[currentIdxRef.current];
        const wp = new THREE.Vector3();
        activeDrink.node.getWorldPosition(wp);
        spotTargetRef.current.position.lerp(wp, 0.1);
      }

      controls.update();
      composer.render();
    };
    animate();

    // ── Keyboard ──
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        container.dispatchEvent(new CustomEvent('drink-prev'));
      } else if (e.key === 'ArrowRight') {
        container.dispatchEvent(new CustomEvent('drink-next'));
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // ── Resize ──
    const onResize = () => {
      const rw = container.clientWidth || window.innerWidth;
      const rh = container.clientHeight || window.innerHeight;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
      composer.setSize(rw, rh);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ──
    return () => {
      alive = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('mousemove', onMouseMove);
      gsap.killTweensOf(targetRotationRef);

      drinksRef.current.forEach((d) => gsap.killTweensOf(d.node.scale));
      drinksRef.current.forEach((d) => gsap.killTweensOf(d.node.position));
      drinksRef.current.forEach((d) => gsap.killTweensOf(d.node.rotation));
      if (spotTargetRef.current) gsap.killTweensOf(spotTargetRef.current.position);
      if (activeFloatTweenRef.current) activeFloatTweenRef.current.kill();

      controls.dispose();

      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
        modelRef.current = null;
      }

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      initedRef.current = false;
    };
  }, [highlightDrink]);

  // Keyboard events bridge
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handlePrev = () => goPrev();
    const handleNext = () => goNext();
    container.addEventListener('drink-prev', handlePrev);
    container.addEventListener('drink-next', handleNext);
    return () => {
      container.removeEventListener('drink-prev', handlePrev);
      container.removeEventListener('drink-next', handleNext);
    };
  }, [goPrev, goNext]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-animated" />

      {/* Three.js canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#0c0c14]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border border-white/20 rounded-full animate-spin border-t-white/60" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              {t.loading}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#0c0c14]">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center">
              <span className="text-red-400">!</span>
            </div>
            <p className="text-xs text-white/40">{error}</p>
          </div>
        </div>
      )}

      {/* UI Overlay */}
      {!loading && !error && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">

          {/* ─── Top ─── */}
          <div className="relative flex items-start justify-between px-4 md:px-8 pt-4">
            <p className="text-[10px] font-mono text-white/15 uppercase tracking-[0.5em] shrink-0">
              003
            </p>

            {/* Language selector — centered */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 pointer-events-auto flex items-center bg-white/[0.04] backdrop-blur-sm rounded-full border border-white/[0.08] overflow-hidden">
              {(['en', 'br', 'es'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 ${
                    lang === l
                      ? 'text-white bg-white/[0.10]'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}
                >
                  {l === 'br' ? 'BR' : l === 'en' ? 'EN' : 'ES'}
                </button>
              ))}
            </div>

            {/* Gear toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="pointer-events-auto w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-sm shrink-0"
              aria-label="Toggle controls"
            >
              <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-white/40 transition-transform duration-500 ${showControls ? 'rotate-90 text-white/60' : ''}`}>
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          {/* ─── Controls panel (collapsible) ─── */}
          {showControls && (
            <div className="absolute top-14 right-4 z-30 pointer-events-auto flex items-start gap-2 overflow-x-auto max-w-[calc(100%-32px)] p-2 animate-fade-in">

            {/* DoF Controls */}
            <div className="pointer-events-auto flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0">
              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Depth of Field</p>
              {[
                { label: 'Focus', key: 'focus' as const, min: 0.5, max: 20, step: 0.1, initial: 4.8 },
                { label: 'Aperture', key: 'aperture' as const, min: 0, max: 0.01, step: 0.0001, initial: 0.0045 },
                { label: 'Blur', key: 'maxblur' as const, min: 0, max: 0.03, step: 0.001, initial: 0.014 },
              ].map(({ label, key, min, max, step, initial }) => (
                <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span className="w-14">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={initial}
                    className="w-24 h-1 accent-white/50"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const bp = bokehPassRef.current;
                      if (bp) {
                        const uniforms = bp.uniforms as BokehUniforms;
                        uniforms[key].value = val;
                      }
                      const span = document.getElementById(`dof-${key}`);
                      if (span) span.textContent = val.toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : 1);
                    }}
                  />
                  <span className="w-12 text-right text-white/25" id={`dof-${key}`}>{initial}</span>
                </label>
              ))}

              {/* Toggle: show textures on inactive cans */}
              <div className="h-px w-full bg-white/5 my-1" />
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40 cursor-pointer">
                <span className="w-14">Texturas</span>
                <button
                  onClick={() => {
                    const next = !showInactiveTexturesRef.current;
                    showInactiveTexturesRef.current = next;
                    setShowInactiveTextures(next);
                    // Apply immediately to all non-active cans
                    const drinks = drinksRef.current;
                    const idx = currentIdxRef.current;
                    drinks.forEach((drink, i) => {
                      if (i !== idx) {
                        if (next) {
                          drink.meshes.forEach((mesh) => {
                            const orig = drink.originalMaterials.get(mesh);
                            if (orig) mesh.material = orig;
                          });
                        } else {
                          drink.meshes.forEach((mesh) => {
                            mesh.material = darkMaterial;
                          });
                        }
                      }
                    });
                  }}
                  className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${
                    showInactiveTextures ? 'bg-indigo-500/60' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white/80 transition-transform duration-300 ${
                      showInactiveTextures ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-white/25">{showInactiveTextures ? 'ON' : 'OFF'}</span>
              </label>
            </div>

            {/* Camera Controls */}
            <div className="pointer-events-auto flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0">
              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Camera</p>
              {[
                { label: 'FOV', key: 'fov', min: 10, max: 90, step: 1, initial: 26 },
                { label: 'Pos Y', key: 'posY', min: -2, max: 6, step: 0.1, initial: 2.2 },
                { label: 'Pos Z', key: 'posZ', min: 3, max: 15, step: 0.1, initial: 7.0 },
                { label: 'Target Y', key: 'targetY', min: -1, max: 3, step: 0.05, initial: 0.35 },
                { label: 'Exposure', key: 'exposure', min: 0.2, max: 3, step: 0.05, initial: 1.80 },
              ].map(({ label, key, min, max, step, initial }) => (
                <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span className="w-14">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={initial}
                    className="w-24 h-1 accent-white/50"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const cam = cameraRef.current;
                      const ctrl = controlsRef.current;
                      if (key === 'fov' && cam) {
                        cam.fov = val;
                        cam.updateProjectionMatrix();
                      } else if (key === 'posY' && cam) {
                        cam.position.y = val;
                      } else if (key === 'posZ' && cam) {
                        cam.position.z = val;
                      } else if (key === 'targetY' && ctrl) {
                        ctrl.target.y = val;
                        ctrl.update();
                      } else if (key === 'exposure') {
                        const r = rendererRef.current;
                        if (r) r.toneMappingExposure = val;
                      }
                      const span = document.getElementById(`cam-${key}`);
                      if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
                    }}
                  />
                  <span className="w-12 text-right text-white/25" id={`cam-${key}`}>{initial}</span>
                </label>
              ))}
            </div>

            {/* Lights Controls */}
            <div className="pointer-events-auto flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0 max-h-[70vh] overflow-y-auto">
              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Lights</p>

              {/* ── Spotlight ── */}
              <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest mt-0.5">Spot</p>
              {[
                { label: 'Intensity', key: 'spot-int', min: 0, max: 40, step: 0.5, initial: 14 },
                { label: 'Pos X', key: 'spot-px', min: -10, max: 10, step: 0.5, initial: 0 },
                { label: 'Pos Y', key: 'spot-py', min: -5, max: 15, step: 0.5, initial: 3 },
                { label: 'Pos Z', key: 'spot-pz', min: -10, max: 15, step: 0.5, initial: 9 },
                { label: 'Angle', key: 'spot-angle', min: 0.1, max: 1.5, step: 0.05, initial: 0.52 },
                { label: 'Penumbra', key: 'spot-pen', min: 0, max: 1, step: 0.05, initial: 0.6 },
              ].map(({ label, key, min, max, step, initial }) => (
                <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span className="w-14">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={initial}
                    className="w-24 h-1 accent-white/50"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const s = spotLightRef.current;
                      if (!s) return;
                      if (key === 'spot-int') s.intensity = val;
                      else if (key === 'spot-px') s.position.x = val;
                      else if (key === 'spot-py') s.position.y = val;
                      else if (key === 'spot-pz') s.position.z = val;
                      else if (key === 'spot-angle') s.angle = val;
                      else if (key === 'spot-pen') s.penumbra = val;
                      const span = document.getElementById(`lit-${key}`);
                      if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
                    }}
                  />
                  <span className="w-12 text-right text-white/25" id={`lit-${key}`}>{initial}</span>
                </label>
              ))}
              {/* Spot Color */}
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <span className="w-14">Color</span>
                <input
                  type="color"
                  defaultValue="#fff8f0"
                  className="w-6 h-4 border-0 bg-transparent cursor-pointer"
                  onChange={(e) => {
                    const s = spotLightRef.current;
                    if (s) s.color.set(e.target.value);
                  }}
                />
                <span className="text-white/25 text-[8px]">#fff8f0</span>
              </label>

              <div className="h-px w-full bg-white/5 my-1" />

              {/* ── Ambient ── */}
              <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Ambient</p>
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <span className="w-14">Intensity</span>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.01}
                  defaultValue={0.15}
                  className="w-24 h-1 accent-white/50"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const a = ambientLightRef.current;
                    if (a) a.intensity = val;
                    const span = document.getElementById('lit-amb-int');
                    if (span) span.textContent = val.toFixed(2);
                  }}
                />
                <span className="w-12 text-right text-white/25" id="lit-amb-int">0.15</span>
              </label>
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <span className="w-14">Color</span>
                <input
                  type="color"
                  defaultValue="#ffffff"
                  className="w-6 h-4 border-0 bg-transparent cursor-pointer"
                  onChange={(e) => {
                    const a = ambientLightRef.current;
                    if (a) a.color.set(e.target.value);
                  }}
                />
                <span className="text-white/25 text-[8px]">#ffffff</span>
              </label>

              <div className="h-px w-full bg-white/5 my-1" />

              {/* ── Rim / Back ── */}
              <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Rim</p>
              {[
                { label: 'Intensity', key: 'rim-int', min: 0, max: 3, step: 0.05, initial: 0.3 },
                { label: 'Pos X', key: 'rim-px', min: -10, max: 10, step: 0.5, initial: -3 },
                { label: 'Pos Y', key: 'rim-py', min: -10, max: 10, step: 0.5, initial: 4 },
                { label: 'Pos Z', key: 'rim-pz', min: -10, max: 10, step: 0.5, initial: -5 },
              ].map(({ label, key, min, max, step, initial }) => (
                <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span className="w-14">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={initial}
                    className="w-24 h-1 accent-white/50"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const b = backLightRef.current;
                      if (!b) return;
                      if (key === 'rim-int') b.intensity = val;
                      else if (key === 'rim-px') b.position.x = val;
                      else if (key === 'rim-py') b.position.y = val;
                      else if (key === 'rim-pz') b.position.z = val;
                      const span = document.getElementById(`lit-${key}`);
                      if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
                    }}
                  />
                  <span className="w-12 text-right text-white/25" id={`lit-${key}`}>{initial}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <span className="w-14">Color</span>
                <input
                  type="color"
                  defaultValue="#8899ee"
                  className="w-6 h-4 border-0 bg-transparent cursor-pointer"
                  onChange={(e) => {
                    const b = backLightRef.current;
                    if (b) b.color.set(e.target.value);
                  }}
                />
                <span className="text-white/25 text-[8px]">#8899ee</span>
              </label>

              <div className="h-px w-full bg-white/5 my-1" />

              {/* ── Bottom Fill ── */}
              <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Fill</p>
              {[
                { label: 'Intensity', key: 'fill-int', min: 0, max: 2, step: 0.05, initial: 0.15 },
                { label: 'Pos X', key: 'fill-px', min: -10, max: 10, step: 0.5, initial: 0 },
                { label: 'Pos Y', key: 'fill-py', min: -10, max: 10, step: 0.5, initial: -5 },
                { label: 'Pos Z', key: 'fill-pz', min: -10, max: 10, step: 0.5, initial: 2 },
              ].map(({ label, key, min, max, step, initial }) => (
                <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                  <span className="w-14">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={initial}
                    className="w-24 h-1 accent-white/50"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const bl = bottomLightRef.current;
                      if (!bl) return;
                      if (key === 'fill-int') bl.intensity = val;
                      else if (key === 'fill-px') bl.position.x = val;
                      else if (key === 'fill-py') bl.position.y = val;
                      else if (key === 'fill-pz') bl.position.z = val;
                      const span = document.getElementById(`lit-${key}`);
                      if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
                    }}
                  />
                  <span className="w-12 text-right text-white/25" id={`lit-${key}`}>{initial}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <span className="w-14">Color</span>
                <input
                  type="color"
                  defaultValue="#5566aa"
                  className="w-6 h-4 border-0 bg-transparent cursor-pointer"
                  onChange={(e) => {
                    const bl = bottomLightRef.current;
                    if (bl) bl.color.set(e.target.value);
                  }}
                />
                <span className="text-white/25 text-[8px]">#5566aa</span>
              </label>
            </div>

            </div>
          )}

          {/* ─── Center glow (pulses subtly) ─── */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #6677ee 0%, #4455aa 30%, transparent 70%)' }}
          />

          {/* ─── SVG Decorative Overlays ─── */}
          {/* Top-right geometric shape */}
          <svg className="absolute top-16 right-8 w-48 h-48 opacity-[0.04]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.3" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="0.2" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeWidth="0.2" />
          </svg>

          {/* Bottom-left angular shape */}
          <svg className="absolute bottom-32 left-6 w-64 h-64 opacity-[0.03]" viewBox="0 0 300 300" fill="none">
            <polygon points="150,20 280,100 250,250 50,250 20,100" stroke="white" strokeWidth="0.5" />
            <polygon points="150,60 240,120 220,220 80,220 60,120" stroke="white" strokeWidth="0.3" strokeDasharray="8 4" />
            <line x1="150" y1="20" x2="150" y2="250" stroke="white" strokeWidth="0.2" />
          </svg>

          {/* Right-side vertical line + dots */}
          <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-64 opacity-[0.06]" viewBox="0 0 16 256" fill="none">
            <line x1="8" y1="0" x2="8" y2="256" stroke="white" strokeWidth="0.5" />
            <circle cx="8" cy="40" r="2" fill="white" opacity="0.4" />
            <circle cx="8" cy="128" r="3" fill="white" opacity="0.6" />
            <circle cx="8" cy="216" r="2" fill="white" opacity="0.4" />
          </svg>

          {/* Left decorative arc */}
          <svg className="absolute left-4 top-1/3 w-32 h-80 opacity-[0.03]" viewBox="0 0 120 300" fill="none">
            <path d="M 100 0 Q 0 150 100 300" stroke="white" strokeWidth="0.5" />
            <path d="M 80 30 Q 20 150 80 270" stroke="white" strokeWidth="0.3" strokeDasharray="6 8" />
          </svg>

          {/* ─── Navigation Cluster — center-left, vertical stack ─── */}
          <div className="pointer-events-auto absolute left-[20%] md:left-[24%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            {/* Prev arrow */}
            <button
              onClick={goPrev}
              className="group relative w-[56px] h-[56px] md:w-[64px] md:h-[64px] flex items-center justify-center"
              aria-label="Previous drink"
            >
              <div className="absolute inset-0 rounded-t-2xl bg-white/[0.04] group-hover:bg-white/[0.10] backdrop-blur-xl border border-white/[0.08] group-hover:border-white/20 border-b-0 transition-all duration-500 group-active:scale-[0.92]" />
              <div className="absolute inset-0 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 80%, rgba(100,120,255,0.12), transparent 70%)' }} />
              <svg viewBox="0 0 24 24" fill="none" className="relative w-5 h-5 text-white/40 group-hover:text-white/90 transition-all duration-300 group-hover:-translate-y-0.5">
                <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Next arrow */}
            <button
              onClick={goNext}
              className="group relative w-[56px] h-[56px] md:w-[64px] md:h-[64px] flex items-center justify-center"
              aria-label="Next drink"
            >
              <div className="absolute inset-0 bg-white/[0.04] group-hover:bg-white/[0.10] backdrop-blur-xl border border-white/[0.08] group-hover:border-white/20 border-t-0 transition-all duration-500 group-active:scale-[0.92]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(100,120,255,0.12), transparent 70%)' }} />
              <svg viewBox="0 0 24 24" fill="none" className="relative w-5 h-5 text-white/40 group-hover:text-white/90 transition-all duration-300 group-hover:translate-y-0.5">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Divider */}
            <div className="w-full h-px bg-white/[0.06]" />

            {/* Rótulo toggle — opens/closes slider */}
            <button
              onClick={() => labelSlider?.open ? closeLabel() : openLabel()}
              className={`group relative w-[56px] md:w-[64px] flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-300 ${
                labelSlider?.open ? '' : ''
              }`}
              aria-label={t.label}
            >
              <div className={`absolute inset-0 rounded-b-2xl backdrop-blur-xl border border-white/[0.08] border-t-0 transition-all duration-500 group-active:scale-[0.92] ${
                labelSlider?.open
                  ? 'bg-indigo-500/25 border-indigo-400/30'
                  : 'bg-white/[0.04] group-hover:bg-indigo-500/15 group-hover:border-indigo-400/20'
              }`} />
              <svg viewBox="0 0 24 24" fill="none" className={`relative w-4 h-4 transition-all duration-300 ${
                labelSlider?.open ? 'text-indigo-300' : 'text-white/40 group-hover:text-indigo-300'
              }`}>
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M7 9.5h10M7 12.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className={`relative text-[6px] font-mono uppercase tracking-[0.15em] transition-colors duration-300 leading-none ${
                labelSlider?.open ? 'text-indigo-300/80' : 'text-white/25 group-hover:text-indigo-300/60'
              }`}>
                {t.label}
              </span>
            </button>

            {/* ─── Slider panel — slides out to the right from this cluster ─── */}
            {labelSlider?.open && (
              <div
                ref={sliderRef}
                className="absolute left-full top-0 ml-3 w-[280px] z-30 animate-slider-in"
              >
                <div className="bg-[#12121e]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{t.productInfo}</span>
                    </div>
                    <button
                      onClick={closeLabel}
                      className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="w-2.5 h-2.5 text-white/40">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-3 space-y-3">
                    {/* Product name */}
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{labelSlider.drinkName}</h3>
                      <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-0.5">Energy Drink</p>
                    </div>

                    {/* Nutrition info */}
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-mono text-white/25 uppercase tracking-widest">{t.nutritionInfo}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {[
                          [t.energy, '45 kcal'],
                          [t.caffeine, '32 mg'],
                          [t.taurine, '400 mg'],
                          [t.sugars, '11 g'],
                          ['Vitamina B6', '0.5 mg'],
                          ['Vitamina B12', '0.4 µg'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-[9px] text-white/35">{label}</span>
                            <span className="text-[9px] font-mono text-white/50">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-mono text-white/25 uppercase tracking-widest">{t.description}</p>
                      <p className="text-[10px] text-white/30 leading-relaxed">
                        {t.descText}
                      </p>
                    </div>

                    {/* Close hint */}
                    <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                      <svg viewBox="0 0 16 16" fill="none" className="w-2.5 h-2.5 text-white/15">
                        <path d="M12 8H4M4 8l3-3M4 8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[7px] font-mono text-white/15 uppercase tracking-widest">{t.slideBack}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Bottom — title + dots ─── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-14 pb-10">
            <div className="flex flex-col items-start gap-3">
              {/* Counter */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-px bg-gradient-to-r from-white/30 to-transparent" />
                <p ref={counterRef} className="text-[10px] font-mono text-white/25 uppercase tracking-[0.5em]">
                  {currentIndex + 1} / {totalDrinks}
                </p>
              </div>

              {/* Title — big, composing with the 3D */}
              <h2
                ref={titleRef}
                className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight leading-[0.9]"
                style={{ textShadow: '0 4px 40px rgba(100, 120, 255, 0.2)', willChange: 'transform, opacity, filter' }}
              >
                {currentName}
              </h2>

              {/* Subtitle */}
              <p ref={subtitleRef} className="text-sm md:text-lg text-white/25 font-light max-w-sm leading-relaxed">
                {t.collection}
              </p>

              {/* Dot indicators */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalDrinks }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`pointer-events-auto rounded-full transition-all duration-500 ${
                        i === currentIndex
                          ? 'w-7 h-1.5 bg-white/70'
                          : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/35'
                      }`}
                      aria-label={`Go to drink ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Hint */}
                <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest ml-2 hidden md:block">
                  {t.keys}
                </p>
              </div>
            </div>
          </div>

          {/* Gradients */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0c0c18]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Scoped styles for animated background */}
      <style>{`
        .bg-gradient-animated {
          background: linear-gradient(
            135deg,
            #0c0c14 0%,
            #0e1020 25%,
            #10122a 50%,
            #0e1020 75%,
            #0c0c14 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 12s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.04; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.08; transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slider-in {
          animation: sliderIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes sliderIn {
          from { opacity: 0; transform: translateX(-20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DrinksExperience;
