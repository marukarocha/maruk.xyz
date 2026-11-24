import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { useCharacterAnimator, CHAR_SCALE, CHAR_POS } from './useCharacterAnimator';
import { translations, type Lang } from './translations';
import { DoFPanel, CameraPanel, LightsPanel, CharacterGizmoPanel, CameraDirectorPanel } from './ScenePanels';
import { useCameraDirector } from './useCameraDirector';

const AnimatedScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const t = translations[lang];

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animProgress, setAnimProgress] = useState(0);
  const [animDuration, setAnimDuration] = useState(0);
  // Clips de personagem (subset filtrado)
  const [charAnimNames, setCharAnimNames] = useState<string[]>([]);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);

  // Camera state — distance/rotation are controlled by cameraDirector
  const [audioCurrent, setAudioCurrent] = useState(0);

  // Screen materials ref (for fire/red blink effect)
  const screenMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const screenOriginalEmissiveRef = useRef<{ color: THREE.Color; intensity: number }[]>([]);
  const screenOriginalMapsRef = useRef<(THREE.Texture | null)[]>([]);
  const fireTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const fireCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // camera director — shake/drift managed by useCameraDirector
  const screenPhaseOffsetsRef = useRef<number[]>([]);

  // Show lights
  type ShowLightsMode = 'off' | 'strobe' | 'sweep' | 'party' | 'auto';
  const [showLightsMode, setShowLightsMode] = useState<ShowLightsMode>('auto');
  const showLightsModeRef = useRef<ShowLightsMode>('auto');
  const showLightsRef = useRef<THREE.SpotLight[]>([]);
  const showConesRef = useRef<THREE.Mesh[]>([]);

  // Refs for Three.js
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<THREE.AnimationAction[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  // ── Character (character.glb) — hook handles loading + animation ──
  const {
    charModelRef,
    charMixerRef,
    charActionsRef,
    loadCharacter,
    switchClip: switchCharClip,
    tickByAudioTime,
    resetToStart: resetCharToStart,
  } = useCharacterAnimator();
  const bokehPassRef = useRef<BokehPass | null>(null);

  // ── Camera Director ──────────────────────────────────────────────────────
  const cameraDirector = useCameraDirector({ cameraRef, controlsRef, bokehPassRef });

  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);
  // lght_emit — empties no GLB que ancoram os show lights (um por luminária)
  const lghtEmitNodesRef = useRef<THREE.Object3D[]>([]);
  // ── Character Gizmo (TransformControls) ──
  const transformControlsRef = useRef<TransformControls | null>(null);
  const [showCharGizmo, setShowCharGizmo] = useState(false);
  const showCharGizmoRef = useRef(false);
  const [charPos, setCharPos] = useState({ x: 0, y: 0, z: 0 });
  const [charScale, setCharScale] = useState(1);
  const [charGizmoMode, setCharGizmoMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const charGizmoModeRef = useRef<'translate' | 'rotate' | 'scale'>('translate');
  const isPlayingRef = useRef(false);
  const animSpeedRef = useRef(1);
  const autoRotateRef = useRef(0.05);
  const modelRotationRef = useRef(0);
  const startedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { animSpeedRef.current = animSpeed; }, [animSpeed]);
  useEffect(() => { showLightsModeRef.current = showLightsMode; }, [showLightsMode]);
  useEffect(() => {
    showCharGizmoRef.current = showCharGizmo;
    const tc = transformControlsRef.current;
    const char = charModelRef.current;
    if (!tc) return;
    if (showCharGizmo && char) {
      tc.attach(char);
    } else {
      tc.detach();
    }
  }, [charModelRef, showCharGizmo]);
  useEffect(() => {
    charGizmoModeRef.current = charGizmoMode;
    const tc = transformControlsRef.current;
    if (tc) tc.setMode(charGizmoMode);
  }, [charGizmoMode]);

  const copyCharValues = useCallback(() => {
    const char = charModelRef.current;
    if (!char) return;
    const p = char.position;
    const s = char.scale.x;
    const text = `position: { x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}, z: ${p.z.toFixed(3)} }  scale: ${s.toFixed(4)}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [charModelRef]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) {
        if (next) { audio.play().catch(() => {}); }
        else { audio.pause(); }
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) audio.muted = next;
      return next;
    });
  }, []);

  const startExperience = useCallback(() => {
    setStarted(true);
    startedRef.current = true;
    setIsPlaying(true);
    isPlayingRef.current = true;
    // Start audio
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1;
      audio.play().catch(() => {});
    }
    // Cinematic intro: fade from dark + zoom out via CameraDirector
    const renderer = rendererRef.current;
    // The 5s ambient ramp in the animation loop handles the exposure fade
    if (renderer) {
      renderer.toneMappingExposure = 0;
    }
    cameraDirector.playIntro();
  }, [cameraDirector]);

  const endExperience = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    // Let audio continue playing until it ends naturally
    setIsPlaying(false);
    isPlayingRef.current = false;

    const renderer = rendererRef.current;

    // Fade all show lights out
    showLightsRef.current.forEach(sl => { gsap.to(sl, { intensity: 0, duration: 2 }); });
    showConesRef.current.forEach(c => {
      const mat = c.material as THREE.MeshBasicMaterial;
      gsap.to(mat, { opacity: 0, duration: 2, onComplete: () => { c.visible = false; } });
    });

    // Restore screen emissive to original
    const sMats = screenMatsRef.current;
    const sOrig = screenOriginalEmissiveRef.current;
    const sOrigMaps = screenOriginalMapsRef.current;
    for (let i = 0; i < sMats.length; i++) {
      if (sOrig[i]) {
        sMats[i].emissive.copy(sOrig[i].color);
        sMats[i].emissiveIntensity = sOrig[i].intensity;
        sMats[i].emissiveMap = sOrigMaps[i] || null;
        sMats[i].needsUpdate = true;
      }
    }

    // Restore scene lights to default
    if (spotLightRef.current) spotLightRef.current.intensity = 9;
    if (ambientLightRef.current) ambientLightRef.current.intensity = 0.3;

    // Fade to dark
    if (renderer) {
      gsap.to(renderer, {
        toneMappingExposure: 0,
        duration: 3,
        ease: 'power2.in',
      });
    }

    // Return camera via CameraDirector
    cameraDirector.playOutro();

    // Show finished state immediately (overlay appears during fade)
    setFinished(true);
  }, [cameraDirector]);

  const replayExperience = useCallback(() => {
    setFinished(false);
    finishedRef.current = false;

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    // Reset animation — scene voltam ao início; personagem volta ao Intro
    actionsRef.current.forEach(a => { a.time = 0; a.play(); });
    resetCharToStart();
    setAnimProgress(0);
    setCurrentCharIdx(0);
    animSpeedRef.current = 1;
    setAnimSpeed(1);
    // camera state reset is handled by cameraDirector.reset()

    // Reset scene lights to defaults
    if (spotLightRef.current) spotLightRef.current.intensity = 9;
    if (ambientLightRef.current) ambientLightRef.current.intensity = 0.3;
    // Restore screen emissive
    const sMats = screenMatsRef.current;
    const sOrig = screenOriginalEmissiveRef.current;
    const sOrigMaps = screenOriginalMapsRef.current;
    for (let i = 0; i < sMats.length; i++) {
      if (sOrig[i]) {
        sMats[i].emissive.copy(sOrig[i].color);
        sMats[i].emissiveIntensity = sOrig[i].intensity;
        sMats[i].emissiveMap = sOrigMaps[i] || null;
        sMats[i].needsUpdate = true;
      }
    }

    // Cinematic intro again via CameraDirector
    const renderer = rendererRef.current;
    if (renderer) renderer.toneMappingExposure = 0;
    cameraDirector.reset();
  }, [cameraDirector, resetCharToStart]);

  const rewindAnim = useCallback(() => {
    actionsRef.current.forEach(a => { a.time = 0; });
    // Character follows audio time — tickByAudioTime will re-sync on next frame
    setAnimProgress(0);
  }, []);

  const seekAnim = useCallback((time: number) => {
    actionsRef.current.forEach(a => { a.time = time; });
    // Character follows audio time — no direct seek needed
    setAnimProgress(time);
  }, []);

  // Troca pelo índice (seletor da UI)
  const switchCharAnim = useCallback((charIdx: number) => {
    const charActions = charActionsRef.current;
    if (!charActions[charIdx]) return;
    const clipName = charActions[charIdx].getClip().name;
    switchCharClip(clipName);
    setCurrentCharIdx(charIdx);
  }, [charActionsRef, switchCharClip]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initedRef.current) return;
    initedRef.current = true;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x0c0c14);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c14);
    scene.fog = new THREE.FogExp2(0x0c0c14, 0.06);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(22, w / h, 0.1, 200);
    camera.position.set(1.27, 1.46, 7.00);
    camera.lookAt(0.08, 1.01, 0);
    cameraRef.current = camera;

    // ── Post-processing ──
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bokehPass = new BokehPass(scene, camera, {
      focus: 7.3,
      aperture: 0.0002,
      maxblur: 0.024,
    });
    composer.addPass(bokehPass);
    bokehPassRef.current = bokehPass;
    composer.addPass(new OutputPass());

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    // Key light (spot)
    const spot = new THREE.SpotLight(0xfff5e8, 9, 30, 0.35, 0.7, 1);
    spot.position.set(3, 6, 5);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.radius = 4;
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 1, 0);
    scene.add(spotTarget);
    spot.target = spotTarget;
    scene.add(spot);
    spotLightRef.current = spot;

    // Rim light
    const back = new THREE.DirectionalLight(0x6688ff, 0.5);
    back.position.set(-4, 4, -4);
    scene.add(back);
    backLightRef.current = back;

    // Fill light from below
    const fill = new THREE.DirectionalLight(0x4455aa, 0.2);
    fill.position.set(0, -3, 2);
    scene.add(fill);

    // Subtle point accents
    const accent1 = new THREE.PointLight(0xff6644, 0.4, 10);
    accent1.position.set(3, 1, -2);
    scene.add(accent1);

    const accent2 = new THREE.PointLight(0x4488ff, 0.3, 10);
    accent2.position.set(-3, 2, 2);
    scene.add(accent2);

    // ── Show lights (animated) ──
    const showLightColors = [0xff0044, 0x00ff88, 0x4400ff, 0xff8800, 0x00aaff, 0xff00ff];
    const showLights: THREE.SpotLight[] = [];
    const showCones: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      // SpotLight for actual lighting — ângulo mais aberto e range menor para iluminar de perto
      const sl = new THREE.SpotLight(showLightColors[i], 0, 12, Math.PI / 4, 0.5, 1.5);
      sl.position.set(
        Math.cos((i / 6) * Math.PI * 2) * 5.5,
        7 + (i % 2) * 1,
        Math.sin((i / 6) * Math.PI * 2) * 5.5
      );
      const slTarget = new THREE.Object3D();
      slTarget.position.set(0, 0, 0);
      scene.add(slTarget);
      sl.target = slTarget;
      scene.add(sl);
      showLights.push(sl);

      // Visible cone beam mesh
      const coneGeo = new THREE.ConeGeometry(0.8, 5, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: showLightColors[i],
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.visible = false;
      scene.add(cone);
      showCones.push(cone);
    }
    showLightsRef.current = showLights;
    showConesRef.current = showCones;

    // ── Ground plane ──
    const groundGeo = new THREE.CircleGeometry(8, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    const groundRef = ground;

    // ── Controls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.08, 1.01, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    // Limit vertical rotation: tight band around current view (~15° up/down)
    controls.minPolarAngle = Math.PI * 0.35;
    controls.maxPolarAngle = Math.PI * 0.55;
    // Limit horizontal rotation to ~60 degrees from initial azimuth
    const initAzimuth = controls.getAzimuthalAngle();
    const azimuthHalf = (60 * Math.PI) / 180 / 2; // ±30° = 60° total
    controls.minAzimuthAngle = initAzimuth - azimuthHalf;
    controls.maxAzimuthAngle = initAzimuth + azimuthHalf;
    controls.update();
    controlsRef.current = controls;

    // ── Mouse parallax ──
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };
    const parallaxStrength = { x: 0.4, y: 0.2 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTarget.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    container.addEventListener('mousemove', onMouseMove);

    // ── Load model ──
    const loader = new GLTFLoader();
    const clock = clockRef.current;

    // ── Load Scene (Animated.glb) ──
    loader.load(
      `${import.meta.env.BASE_URL}3d/Animated.glb`,
      (gltf) => {
        const obj = gltf.scene;

        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        obj.scale.setScalar(scale);

        box.setFromObject(obj);
        box.getCenter(center);
        obj.position.x = -center.x;
        obj.position.z = -center.z;
        // Keep feet on ground
        const newBox = new THREE.Box3().setFromObject(obj);
        obj.position.y = -newBox.min.y;
        // Align ground plane with model's floor
        groundRef.position.y = -newBox.min.y;

        // Enable shadows + detect screen meshes
        const detectedScreenMats: THREE.MeshStandardMaterial[] = [];
        const detectedOriginals: { color: THREE.Color; intensity: number }[] = [];
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Each screen object (e.g. "Screen C.004" → "Cube.121") has 2 materials:
            //   - "Texture.001" = the frame/body (NOT the screen)
            //   - "Screen.001"  = the actual screen surface
            // Only match materials whose NAME contains "screen" to avoid coloring frames.
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            for (const mat of materials) {
              if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const stdMat = mat as THREE.MeshStandardMaterial;
                const matName = stdMat.name?.toLowerCase() || '';
                if (matName.includes('screen')) {
                  if (!detectedScreenMats.includes(stdMat)) {
                    console.log('[AnimatedScene] ✓ Screen material:', stdMat.name,
                      'on mesh:', child.name, 'parent:', child.parent?.name,
                      'emissive:', stdMat.emissive.getHexString(), 'intensity:', stdMat.emissiveIntensity);
                    detectedScreenMats.push(stdMat);
                    detectedOriginals.push({
                      color: stdMat.emissive.clone(),
                      intensity: stdMat.emissiveIntensity,
                    });
                  }
                }
              }
            }
          }
        });
        console.log(`[AnimatedScene] Found ${detectedScreenMats.length} screen materials`);
        screenMatsRef.current = detectedScreenMats;
        screenOriginalEmissiveRef.current = detectedOriginals;
        // Save original emissive maps
        screenOriginalMapsRef.current = detectedScreenMats.map(m => m.emissiveMap);
        // Generate random phase offsets for each screen (for independent flicker)
        screenPhaseOffsetsRef.current = detectedScreenMats.map(() => Math.random() * 100);

        // Create fire emoji canvas texture for screens
        const fireCanvas = document.createElement('canvas');
        fireCanvas.width = 256;
        fireCanvas.height = 64;
        fireCanvasRef.current = fireCanvas;
        const fireTex = new THREE.CanvasTexture(fireCanvas);
        fireTex.colorSpace = THREE.SRGBColorSpace;
        fireTextureRef.current = fireTex;

        // ── Encontrar todos os empties lght_emit ──
        const lghtEmitNodes: THREE.Object3D[] = [];
        obj.traverse((child) => {
          if (child.name === 'lght_emit') {
            lghtEmitNodes.push(child);
            console.log(`[AnimatedScene] ✓ lght_emit[${lghtEmitNodes.length - 1}] encontrado`,
              '| parent:', child.parent?.name,
              '| worldPos:', child.getWorldPosition(new THREE.Vector3()).toArray().map(v => v.toFixed(3)).join(', '));
          }
        });
        if (lghtEmitNodes.length === 0) {
          console.warn('[AnimatedScene] ⚠ Nenhum lght_emit encontrado. Nodes disponíveis:');
          obj.traverse((c) => console.log(' -', c.name, '(', c.type, ')'));
        } else {
          console.log(`[AnimatedScene] ${lghtEmitNodes.length} lght_emit(s) → mapeando show lights [0..${lghtEmitNodes.length - 1}]`);
        }
        lghtEmitNodesRef.current = lghtEmitNodes;

        scene.add(obj);
        modelRef.current = obj;

        // ── Scene Animations (Animated.glb — purely environment/scene clips) ──
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(obj);
          mixerRef.current = mixer;
          const sceneActions: THREE.AnimationAction[] = [];
          gltf.animations.forEach((clip, i) => {
            const action = mixer.clipAction(clip);
            action.play();
            sceneActions.push(action);
            console.log(`[AnimatedScene] 🎬 Clip de cena [${i}]:`, clip.name);
          });
          actionsRef.current = sceneActions;
          setAnimDuration(gltf.animations[0]?.duration || 0);
        }

        // Entrance animation for scene
        gsap.fromTo(obj.scale,
          { x: 0, y: 0, z: 0 },
          {
            x: scale, y: scale, z: scale,
            duration: 1.2,
            ease: 'elastic.out(1, 0.5)',
            delay: 0.2,
          }
        );

        gsap.fromTo(obj.rotation,
          { y: -Math.PI * 0.5 },
          {
            y: 0,
            duration: 1.5,
            ease: 'power3.out',
            delay: 0.1,
          }
        );

        // ── Load Character (character.glb) via hook ──
        loadCharacter(
          scene,
          (clipNames) => {
            const charObj = charModelRef.current;

            if (charObj) {
              // ── TransformControls for character gizmo ──
              const tc = new TransformControls(camera, renderer.domElement);
              tc.attach(charObj);
              tc.setMode('translate');
              tc.setSpace('world');
              tc.setSize(0.7);
              tc.detach(); // start detached (hidden)
              scene.add(tc as unknown as THREE.Object3D);
              transformControlsRef.current = tc;

              // Disable OrbitControls while dragging
              tc.addEventListener('dragging-changed', (event) => {
                controls.enabled = !(event.value as boolean);
              });

              // Sync sliders & readout while dragging
              tc.addEventListener('objectChange', () => {
                const p = charObj.position;
                const s = charObj.scale.x;
                setCharPos({ x: p.x, y: p.y, z: p.z });
                setCharScale(s);
                const elX = document.getElementById('as-char-pos-x');
                const elY = document.getElementById('as-char-pos-y');
                const elZ = document.getElementById('as-char-pos-z');
                const elS = document.getElementById('as-char-scale');
                if (elX) elX.textContent = p.x.toFixed(3);
                if (elY) elY.textContent = p.y.toFixed(3);
                if (elZ) elZ.textContent = p.z.toFixed(3);
                if (elS) elS.textContent = s.toFixed(4);
              });

              // Init gizmo state BEFORE GSAP overrides scale
              setCharPos({ x: CHAR_POS.x, y: CHAR_POS.y, z: CHAR_POS.z });
              setCharScale(CHAR_SCALE);

              // Entrance animation (GSAP fromTo immediately sets scale to 0)
              gsap.fromTo(charObj.scale,
                { x: 0, y: 0, z: 0 },
                {
                  x: CHAR_SCALE, y: CHAR_SCALE, z: CHAR_SCALE,
                  duration: 0.8,
                  ease: 'back.out(1.4)',
                  delay: 0.2,
                }
              );
            }

            setCharAnimNames(clipNames);
            setCurrentCharIdx(0);
            setLoading(false);
          },
          () => {
            // Character failed to load — scene still usable
            setLoading(false);
          }
        );
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`[AnimatedScene] Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        }
      },
      (err) => {
        console.error('[AnimatedScene] GLTFLoader error:', err);
        setError('Failed to load 3D model.');
        setLoading(false);
      }
    );

    // ── Animation loop ──
    let animId = 0;
    let alive = true;
    let frameCount = 0;

    const animate = () => {
      if (!alive) return;
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      frameCount++;

      // ── Character clip selection (audio-synced) — runs BEFORE mixer.update ──
      // Switch must happen before the tick so the mixer advances the CORRECT clip.
      {
        const aT = (startedRef.current && audioRef.current)
          ? audioRef.current.currentTime
          : 0;
        tickByAudioTime(aT);
      }

      // Update scene animation mixer
      if (mixerRef.current && isPlayingRef.current) {
        mixerRef.current.update(delta * animSpeedRef.current);
      }
      // Update character animation mixer — always runs so the character
      // animates even before the user clicks "Start"
      if (charMixerRef.current) {
        charMixerRef.current.update(delta * (isPlayingRef.current ? animSpeedRef.current : 1));
      }

      // (lght_emit nodes são aplicados após o bloco de show lights — ver abaixo)

      // Update progress (throttle state updates)
      if (frameCount % 6 === 0) {
        const actions = actionsRef.current;
        if (actions.length > 0) {
          const a = actions[0];
          if (a && a.getClip()) {
            setAnimProgress(a.time);
          }
        }
      }

      // Update live camera readout
      if (frameCount % 6 === 0) {
        const cam = cameraRef.current;
        if (cam) {
          const ex = document.getElementById('as-live-cam-x');
          const ey = document.getElementById('as-live-cam-y');
          const ez = document.getElementById('as-live-cam-z');
          if (ex) ex.textContent = cam.position.x.toFixed(2);
          if (ey) ey.textContent = cam.position.y.toFixed(2);
          if (ez) ez.textContent = cam.position.z.toFixed(2);
          const ctrl = controlsRef.current;
          if (ctrl) {
            const etx = document.getElementById('as-live-tgt-x');
            const ety = document.getElementById('as-live-tgt-y');
            const etz = document.getElementById('as-live-tgt-z');
            if (etx) etx.textContent = ctrl.target.x.toFixed(2);
            if (ety) ety.textContent = ctrl.target.y.toFixed(2);
            if (etz) etz.textContent = ctrl.target.z.toFixed(2);
          }
        }
      }

      // Auto-rotation on the CHARACTER: ping-pong within ±30° (60° total)
      // Faster rotation during fire section (40-60s)
      // Scene (Animated.glb) remains static; only the character rotates.
      const _rotTarget = charModelRef.current;
      if (_rotTarget && autoRotateRef.current > 0) {
        let rotSpeed = autoRotateRef.current;
        const aTime = audioRef.current ? audioRef.current.currentTime : 0;
        if (showLightsModeRef.current === 'auto' && aTime >= 40 && aTime < 60) {
          rotSpeed *= 3; // 3x faster rotation during fire
        }
        modelRotationRef.current += delta * rotSpeed;
        const halfAngle = (60 * Math.PI) / 180 / 2; // 30° in radians
        // Ping-pong: oscillate between -halfAngle and +halfAngle
        _rotTarget.rotation.y = Math.sin(modelRotationRef.current) * halfAngle;
      }

      // ── Camera Director tick (drift + shake + shot transitions) ──────────
      {
        const aT = (startedRef.current && audioRef.current)
          ? audioRef.current.currentTime
          : 0;
        cameraDirector.tick(aT, delta, clock.elapsedTime);
        // Update UI state for panel (throttled)
        if (frameCount % 6 === 0) setAudioCurrent(aT);
      }

      // Smooth mouse parallax
      const lerpFactor = 0.05;
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;

      // Apply parallax to spotlight for dynamic shadows
      if (spotLightRef.current) {
        spotLightRef.current.position.x = 3 + mouseCurrent.x * parallaxStrength.x * 3.75;
        spotLightRef.current.position.y = 6 - mouseCurrent.y * parallaxStrength.y * 2.5;
      }

      // Subtle camera offset from parallax (on top of orbit controls)
      controls.target.x = 0.08 + mouseCurrent.x * parallaxStrength.x * 0.375;
      controls.target.y = 1.01 - mouseCurrent.y * parallaxStrength.y * 0.5;
      controls.target.z = 0;

      // ── Show lights animation ──
      const slMode = showLightsModeRef.current;
      const elapsed = clock.elapsedTime;
      const audioTime = audioRef.current ? audioRef.current.currentTime : 0;

      // Helper: compute effective mode for 'auto' based on audio time
      let effectiveMode: 'off' | 'strobe' | 'sweep' | 'party' = 'off';
      // Per-light fade target (0..1) for auto mode
      const autoFade: number[] = new Array(showLights.length).fill(0);

      // ── Check for experience end ──
      // Trigger at 83s OR if audio ended/paused near the end
      const audioDur = audioRef.current?.duration || 999;
      const isNearEnd = audioTime >= 80 || (audioTime > 60 && audioTime >= audioDur - 0.5);
      if (isNearEnd && !finishedRef.current && startedRef.current) {
        console.log('[AnimatedScene] End triggered at audioTime:', audioTime, 'duration:', audioDur);
        endExperience();
      }

      // ── Screen effects ──
      const screenMats = screenMatsRef.current;
      const screenOriginals = screenOriginalEmissiveRef.current;
      const screenOrigMaps = screenOriginalMapsRef.current;
      const fireCanvas = fireCanvasRef.current;
      const fireTex = fireTextureRef.current;

      if (slMode === 'auto' && screenMats.length > 0 && screenOriginals.length > 0) {
        const sPhaseOffsets = screenPhaseOffsetsRef.current;
        if (audioTime >= 38 && audioTime < 40) {
          // BLACKOUT: Red blink strobe — each screen independent random
          for (let si = 0; si < screenMats.length; si++) {
            const off = sPhaseOffsets[si] || 0;
            const blinkPhase = Math.sin(audioTime * 25 + off * 10) > (Math.random() * 0.4 - 0.2);
            screenMats[si].emissive.set(blinkPhase ? 0xff0000 : 0x220000);
            screenMats[si].emissiveIntensity = blinkPhase ? 3 + Math.random() * 2 : 0.3;
            screenMats[si].emissiveMap = null;
            screenMats[si].needsUpdate = true;
          }
        } else if (audioTime >= 40 && audioTime < 60) {
          // FIRE GRADIENT STROBE with 🔥 emoji on screens (40-60s)
          if (fireCanvas && fireTex) {
            const ctx = fireCanvas.getContext('2d');
            if (ctx) {
              const hueShift = Math.sin(audioTime * 3) * 15;
              const grad = ctx.createLinearGradient(0, 0, fireCanvas.width, fireCanvas.height);
              grad.addColorStop(0, `hsl(${10 + hueShift}, 100%, ${20 + Math.sin(audioTime * 8) * 15}%)`);
              grad.addColorStop(0.5, `hsl(${25 + hueShift}, 100%, ${35 + Math.sin(audioTime * 6 + 1) * 15}%)`);
              grad.addColorStop(1, `hsl(${5 + hueShift}, 100%, ${15 + Math.sin(audioTime * 10 + 2) * 10}%)`);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, fireCanvas.width, fireCanvas.height);
              const emojis = ['🔥', '🔥', '❤️‍🔥', '🔥'];
              ctx.font = '28px serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              for (let ei = 0; ei < 5; ei++) {
                const ex = ((audioTime * 40 + ei * 67) % fireCanvas.width);
                const ey = 16 + Math.sin(audioTime * 5 + ei * 2.3) * 14;
                ctx.fillText(emojis[ei % emojis.length], ex, ey);
              }
              ctx.font = '40px serif';
              ctx.fillText('🔥', fireCanvas.width / 2 + Math.sin(audioTime * 4) * 30, fireCanvas.height / 2);
              fireTex.needsUpdate = true;
            }
          }
          // RANDOM flicker per screen — each has independent rhythm
          for (let si = 0; si < screenMats.length; si++) {
            const off = sPhaseOffsets[si] || 0;
            // Each screen flickers at its own random rate
            const flickerSpeed = 12 + off * 8; // different speed per screen
            const flickerOn = Math.sin(audioTime * flickerSpeed + off * 50) > (Math.random() * 0.6 - 0.3);
            const fireHue = 5 + Math.sin(audioTime * 6 + off * 20) * 20;
            const fireLum = flickerOn ? (35 + Math.random() * 25) : (5 + Math.random() * 8);
            const r = Math.min(255, Math.floor((fireLum / 100) * 255 * (1 + Math.sin(fireHue * 0.02))));
            const g = Math.floor(r * (0.15 + Math.sin(audioTime * 4 + off * 7) * 0.12));
            screenMats[si].emissive.setRGB(r / 255, g / 255, 0);
            screenMats[si].emissiveIntensity = flickerOn ? (2 + Math.random() * 3) : (0.2 + Math.random() * 0.3);
            if (fireTex) screenMats[si].emissiveMap = fireTex;
            screenMats[si].needsUpdate = true;
          }
        } else {
          // SUBTLE ANIMATED SCREEN COLORS — slow random hue shift so screens aren't static
          for (let si = 0; si < screenMats.length; si++) {
            const off = sPhaseOffsets[si] || 0;
            // Slow gentle hue cycling unique per screen
            const hue = (audioTime * 0.03 + off * 0.37) % 1;
            const sat = 0.4 + Math.sin(audioTime * 0.5 + off * 5) * 0.15; // 0.25-0.55
            const lum = 0.15 + Math.sin(audioTime * 0.7 + off * 3) * 0.05; // 0.10-0.20
            screenMats[si].emissive.setHSL(hue, sat, lum);
            screenMats[si].emissiveIntensity = 0.8 + Math.sin(audioTime * 0.4 + off * 8) * 0.3;
            screenMats[si].emissiveMap = screenOrigMaps[si] || null;
            screenMats[si].needsUpdate = true;
          }
        }
      }

      // ── Scene light dimming ──
      if (slMode === 'auto' && startedRef.current && !finishedRef.current) {
        const renderer = rendererRef.current;
        const spotL = spotLightRef.current;
        const ambL = ambientLightRef.current;
        if (audioTime >= 38 && audioTime < 40) {
          // BLACKOUT — screens glow red/fire
          if (renderer) renderer.toneMappingExposure = 0.12;
          if (spotL) spotL.intensity = 0.2;
          if (ambL) ambL.intensity = 0.015;
        } else if (audioTime >= 40 && audioTime < 40.5) {
          // Restore lights smoothly after blackout
          const t40 = (audioTime - 40) / 0.5;
          if (renderer) renderer.toneMappingExposure = 0.12 + t40 * 1.48;
          if (spotL) spotL.intensity = 0.2 + t40 * 8.8;
          if (ambL) ambL.intensity = 0.015 + t40 * 0.285;
        } else if (audioTime >= 40.5 && audioTime < 60) {
          // During fire screens (40-60s) — slightly dimmer for screen glow visibility
          if (renderer) renderer.toneMappingExposure = 1.2;
          if (spotL) spotL.intensity = 6;
          if (ambL) ambL.intensity = 0.2;
        } else if (audioTime >= 60 && audioTime < 60.5) {
          // Restore to full after fire screens
          const t60 = (audioTime - 60) / 0.5;
          if (renderer) renderer.toneMappingExposure = 1.2 + t60 * 0.4;
          if (spotL) spotL.intensity = 6 + t60 * 3;
          if (ambL) ambL.intensity = 0.2 + t60 * 0.1;
        } else if (audioTime >= 72) {
          // Fade out at end
          const fadeOut = 1 - Math.min((audioTime - 72) / 8, 1);
          if (renderer) renderer.toneMappingExposure = 1.6 * fadeOut;
        } else if (audioTime > 0 && audioTime < 5) {
          // Gradual ambient ramp over 5 seconds at start
          const ramp5 = audioTime / 5; // 0→1 over 5s
          if (renderer) renderer.toneMappingExposure = ramp5 * 1.6;
          if (ambL) ambL.intensity = 0.05 + ramp5 * 0.25;
        } else if (audioTime >= 5 && audioTime < 38) {
          // Normal exposure
          if (renderer && renderer.toneMappingExposure < 1.5) {
            renderer.toneMappingExposure += delta * 0.5;
            if (renderer.toneMappingExposure > 1.6) renderer.toneMappingExposure = 1.6;
          }
        }
      }

      if (slMode === 'auto') {
        // Timeline synced to audio (83s = 1:23):
        // 0s:     light 1 sweep starts with scene (ambient ramps 5s)
        // 5-7s:   STROBE beat #1
        // 7s:     light 2 joins sweep
        // 10s:    lights 3,4,5,6 join sweep
        // 15s:    all 6 sweep
        // 21-23s: STROBE beat #2 + camera shake
        // 23s:    sweep resumes
        // 34-38s: STROBE beat #3 (extended) + camera shake
        // 38-40s: BLACKOUT (screens red blink)
        // 40-60s: STROBE + fire screens with 🔥 (speed 1.5x)
        // 60s:    party mode
        // 72s:    fade out begins
        // 80s+:   almost dark
        if (audioTime >= 72) {
          const fadeOut = 1 - Math.min((audioTime - 72) / 8, 1);
          effectiveMode = 'party';
          autoFade.fill(fadeOut);
        } else if (audioTime >= 60) {
          effectiveMode = 'party';
          autoFade.fill(1);
        } else if (audioTime >= 40) {
          // Strobe returns after blackout (with fire screens)
          effectiveMode = 'strobe';
          const f40 = Math.min((audioTime - 40) / 0.5, 1);
          autoFade.fill(f40);
        } else if (audioTime >= 38) {
          // BLACKOUT: all show lights off
          effectiveMode = 'off';
          autoFade.fill(0);
        } else if (audioTime >= 34) {
          // STROBE beat #3 (34-38s) — extended + camera shake
          effectiveMode = 'strobe';
          autoFade.fill(1);
          // shake is already handled by cameraSystem shot config (strobe2)
        } else if (audioTime >= 23) {
          // Sweep resumes after strobe beat #2
          effectiveMode = 'sweep';
          autoFade.fill(1);
        } else if (audioTime >= 21) {
          // STROBE beat #2 (21-23s) + camera shake
          effectiveMode = 'strobe';
          autoFade.fill(1);
          // shake handled by cameraSystem shot config (strobe1)
        } else if (audioTime >= 15) {
          // All 6 lights sweep
          effectiveMode = 'sweep';
          autoFade.fill(1);
        } else if (audioTime >= 10) {
          // Lights 3,4 join
          effectiveMode = 'sweep';
          const f10 = Math.min((audioTime - 10) / 2, 1);
          autoFade[0] = 1; autoFade[1] = 1;
          autoFade[2] = f10; autoFade[3] = f10;
          autoFade[4] = f10 * 0.5; autoFade[5] = f10 * 0.5;
        } else if (audioTime >= 7) {
          // Light 2 joins sweep (after first strobe beat)
          effectiveMode = 'sweep';
          const f7 = Math.min((audioTime - 7) / 2, 1);
          autoFade[0] = 1; autoFade[1] = f7;
        } else if (audioTime >= 5) {
          // STROBE beat #1 (5-7s)
          effectiveMode = 'strobe';
          autoFade.fill(1);
        } else if (audioTime >= 0) {
          // Light 1 sweep from the very start
          effectiveMode = 'sweep';
          const f0 = Math.min(audioTime / 2, 1); // 2s fade-in
          autoFade[0] = f0;
        }
      } else if (slMode !== 'off') {
        effectiveMode = slMode as 'strobe' | 'sweep' | 'party';
        autoFade.fill(1);
      }

      for (let i = 0; i < showLights.length; i++) {
        const sl = showLights[i];
        const cone = showCones[i];
        const coneMat = cone.material as THREE.MeshBasicMaterial;
        const fade = autoFade[i];

        if (fade <= 0 || effectiveMode === 'off') {
          sl.intensity *= 0.9; // smooth fade out
          if (sl.intensity < 0.01) { sl.intensity = 0; cone.visible = false; }
          else { coneMat.opacity *= 0.9; }
        } else {
          cone.visible = true;
          let posX: number, posY: number, posZ: number;
          let intensity: number;
          let coneOpacity: number;

          if (effectiveMode === 'strobe') {
            const baseAngle = (i / showLights.length) * Math.PI * 2;
            posX = Math.cos(baseAngle) * 2.2;
            posZ = Math.sin(baseAngle) * 2.2;
            posY = 2.5 + Math.sin(elapsed * 3 + i) * 0.5;
            const phase = (elapsed * 8 + i * 1.05) % 1;
            intensity = (phase < 0.12 ? 25 : 0) * fade;
            coneOpacity = (phase < 0.12 ? 0.12 : 0) * fade;
          } else if (effectiveMode === 'sweep') {
            const angle = elapsed * 0.6 + (i / showLights.length) * Math.PI * 2;
            const radius = 2.0 + Math.sin(elapsed * 0.4 + i) * 0.8;
            posX = Math.cos(angle) * radius;
            posZ = Math.sin(angle) * radius;
            posY = 2.5 + Math.sin(elapsed * 0.8 + i * 0.9) * 1.0;
            intensity = (12 + Math.sin(elapsed * 1.5 + i * 1.2) * 6) * fade;
            coneOpacity = (0.06 + Math.sin(elapsed * 1.5 + i * 1.2) * 0.03) * fade;
          } else {
            // party
            const angle = elapsed * 1.8 + (i / showLights.length) * Math.PI * 2;
            const radius = 1.8 + Math.sin(elapsed * 1.2 + i * 0.6) * 0.8;
            posX = Math.cos(angle) * radius;
            posZ = Math.sin(angle) * radius;
            posY = 1.5 + Math.abs(Math.sin(elapsed * 2.5 + i * 0.8)) * 2.0;
            const pulse = Math.sin(elapsed * 5 + i * 1.3);
            intensity = (pulse > 0.2 ? 30 : 1) * fade;
            coneOpacity = (pulse > 0.2 ? 0.1 : 0.01) * fade;
            const hue = ((elapsed * 0.12 + i / showLights.length) % 1);
            sl.color.setHSL(hue, 1, 0.5);
            coneMat.color.setHSL(hue, 1, 0.5);
          }

          sl.position.set(posX, posY, posZ);
          sl.target.position.set(0, 0.5, 0);
          sl.intensity = intensity;

          // Orient cone beam: wide base at light source, tip pointing at target
          const targetPt = new THREE.Vector3(0, 0.5, 0);
          const lightPos = sl.position.clone();
          const beamDir = targetPt.clone().sub(lightPos); // light → target
          const beamLen = beamDir.length();

          // Position at midpoint so cone spans light→target
          cone.position.lerpVectors(lightPos, targetPt, 0.5);

          // Scale Y to match beam length (original cone height = 5)
          cone.scale.set(1, beamLen / 5, 1);

          // Align cone +Y (tip) toward target
          const up = new THREE.Vector3(0, 1, 0);
          const quat = new THREE.Quaternion().setFromUnitVectors(up, beamDir.normalize());
          cone.setRotationFromQuaternion(quat);
          coneMat.opacity = coneOpacity;
        }
      }

      // ── lght_emit: TODOS os show lights saem do pivot animado do GLB ──
      // Lógica invertida: as posições orbitantes do timeline (posX/Y/Z) viram os
      // DESTINOS (targets) dos feixes. O lght_emit vira a ORIGEM de todos os 6 lights.
      {
        const lghtEmitNodes = lghtEmitNodesRef.current;
        if (lghtEmitNodes.length > 0) {
          const _wPos = new THREE.Vector3();

          for (let i = 0; i < showLights.length; i++) {
            // Se houver só 1 node, todos os lights saem dele (i % N)
            const node = lghtEmitNodes[i % lghtEmitNodes.length];
            node.updateWorldMatrix(true, false);
            node.getWorldPosition(_wPos);

            const sl   = showLights[i];
            const cone = showCones[i];

            // A posição orbital calculada pelo timeline (era onde a luz ficava)
            // vira o ponto de destino do feixe — aponta para fora da cena
            const beamTarget = sl.position.clone();

            // Move a origem do feixe para o pivot animado
            sl.position.copy(_wPos);
            sl.target.position.copy(beamTarget);
            sl.target.updateMatrixWorld();

            // ── Cone: base no pivot (origem), ponta no beamTarget (destino) ──
            if (cone.visible) {
              const beamVec  = beamTarget.clone().sub(_wPos);
              const beamLen  = beamVec.length();
              if (beamLen < 0.001) continue;

              // Centro do cone = ponto médio entre origem e destino
              cone.position.lerpVectors(_wPos, beamTarget, 0.5);
              // Escala Y para cobrir toda a distância (cone original tem height=5)
              cone.scale.set(1, beamLen / 5, 1);

              // ConeGeometry: ponta em +Y, base em -Y
              // Para cone fino no emissor e largo no destino:
              // alinha +Y com destino→origem (direção negada)
              const up        = new THREE.Vector3(0, 1, 0);
              const beamDirN  = beamVec.clone().normalize();
              const coneUp    = beamDirN.clone().negate(); // destino → origem
              const dot = up.dot(coneUp);
              if (Math.abs(dot) < 0.9999) {
                cone.setRotationFromQuaternion(
                  new THREE.Quaternion().setFromUnitVectors(up, coneUp)
                );
              } else {
                cone.rotation.set(dot < 0 ? Math.PI : 0, 0, 0);
              }
            }
          }
        }
      }

      // (safety clamps + shake handled inside cameraDirector.tick)

      // ── Dynamic animation speed: 1.25x during 40-60s ──
      if (slMode === 'auto' && startedRef.current && !finishedRef.current) {
        if (audioTime >= 40 && audioTime < 60) {
          animSpeedRef.current = 1.25;
        } else if (audioTime >= 60 && audioTime < 60.5) {
          // Smooth return to normal
          const t60 = (audioTime - 60) / 0.5;
          animSpeedRef.current = 1.25 - t60 * 0.25;
        } else if (audioTime >= 60.5) {
          animSpeedRef.current = 1;
        }
      }

      controls.update();
      composer.render();
    };
    animate();

    // ── Keyboard ──
    const onKeyDown = (e: KeyboardEvent) => {
      if (!startedRef.current) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => {
          const next = !prev;
          const audio = audioRef.current;
          if (audio) {
            if (next) audio.play().catch(() => {});
            else audio.pause();
          }
          return next;
        });
      } else if (e.code === 'KeyR') {
        actionsRef.current.forEach(a => { a.time = 0; });
        // Character follows audio time — resetCharToStart() re-activates Intro
        resetCharToStart();
        setAnimProgress(0);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // ── Audio ended event (backup for endExperience) ──
    const audioEl = audioRef.current;
    const onAudioEnded = () => {
      if (!finishedRef.current && startedRef.current) {
        console.log('[AnimatedScene] Audio ended event fired, triggering endExperience');
        endExperience();
      }
    };
    if (audioEl) {
      audioEl.addEventListener('ended', onAudioEnded);
    }

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
      if (audioEl) audioEl.removeEventListener('ended', onAudioEnded);

      // Dispose TransformControls
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
        transformControlsRef.current.dispose();
        transformControlsRef.current = null;
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current = [];

      // Stop audio
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }

      controls.dispose();

      // Dispose show light cones
      showCones.forEach(c => {
        (c.material as THREE.MeshBasicMaterial).dispose();
        c.geometry.dispose();
      });

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
  }, [cameraDirector, charMixerRef, charModelRef, endExperience, loadCharacter, resetCharToStart, tickByAudioTime]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-animated-scene" />

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
              004
            </p>

            {/* Language selector */}
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
              className={`pointer-events-auto w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-sm shrink-0 ${finished ? 'opacity-0 pointer-events-none' : ''}`}
              aria-label="Toggle controls"
            >
              <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-white/40 transition-transform duration-500 ${showControls ? 'rotate-90 text-white/60' : ''}`}>
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          {/* ─── Advanced controls panel ─── */}
          {showControls && (
            <div className="absolute top-14 right-4 z-30 pointer-events-auto flex items-start gap-2 overflow-x-auto max-w-[calc(100%-32px)] p-2 animate-fade-in-scene">
              <CameraDirectorPanel
                director={cameraDirector}
                bokehPassRef={bokehPassRef}
                cameraRef={cameraRef}
                controlsRef={controlsRef}
                audioTime={audioCurrent}
              />
              <DoFPanel bokehPassRef={bokehPassRef} />
              <CameraPanel cameraRef={cameraRef} rendererRef={rendererRef} controlsRef={controlsRef} />
              <LightsPanel spotLightRef={spotLightRef} ambientLightRef={ambientLightRef} backLightRef={backLightRef} />
              <CharacterGizmoPanel
                charModelRef={charModelRef}
                showCharGizmo={showCharGizmo}
                setShowCharGizmo={setShowCharGizmo}
                charPos={charPos}
                setCharPos={setCharPos}
                charScale={charScale}
                setCharScale={setCharScale}
                charGizmoMode={charGizmoMode}
                setCharGizmoMode={setCharGizmoMode}
                copyCharValues={copyCharValues}
              />
            </div>
          )}

          {/* ─── SVG Decorative Overlays ─── */}
          <svg className="absolute top-16 right-8 w-48 h-48 opacity-[0.04]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.3" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="0.2" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeWidth="0.2" />
          </svg>

          <svg className="absolute bottom-40 left-6 w-48 h-48 opacity-[0.03]" viewBox="0 0 200 200" fill="none">
            <polygon points="100,10 190,60 170,170 30,170 10,60" stroke="white" strokeWidth="0.5" />
            <polygon points="100,40 160,75 145,145 55,145 40,75" stroke="white" strokeWidth="0.3" strokeDasharray="6 4" />
          </svg>

          {/* ─── Left side: Show Lights ─── */}
          <div className={`pointer-events-auto absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4 transition-opacity duration-1000 ${finished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Show Lights */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[7px] font-mono text-white/25 uppercase tracking-widest as-writing-vertical mb-1">Lights</span>
              {([
                { key: 'auto', icon: '▶' },
                { key: 'off', icon: '○' },
                { key: 'strobe', icon: '⚡' },
                { key: 'sweep', icon: '◑' },
                { key: 'party', icon: '✦' },
              ] as const).map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => setShowLightsMode(key)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 border ${
                    showLightsMode === key
                      ? key === 'auto'
                        ? 'bg-indigo-500/25 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                        : key === 'party'
                        ? 'bg-pink-500/25 border-pink-400/40 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                        : key === 'strobe'
                        ? 'bg-yellow-500/25 border-yellow-400/40 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                        : key === 'sweep'
                        ? 'bg-cyan-500/25 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-white/10 border-white/20'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15'
                  }`}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Bottom: 2-column — Title left + Mini Player right ─── */}
          <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-1000 ${finished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="pointer-events-auto mx-4 md:mx-10 mb-6 flex items-end justify-between gap-4">
              {/* Left col: Title */}
              <div className="flex flex-col gap-1.5 min-w-0 shrink">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent" />
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">{t.hint}</p>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.9] truncate"
                  style={{ textShadow: '0 4px 30px rgba(100, 120, 255, 0.15)' }}>
                  {t.title}
                </h2>
                <p className="text-xs text-white/20 font-light">{t.subtitle}</p>
              </div>

              {/* Right col: Mini player */}
              <div className="shrink-0 bg-black/30 backdrop-blur-xl rounded-xl border border-white/[0.06] px-3 py-2 flex items-center gap-2">
                {/* Rewind */}
                <button onClick={rewindAnim}
                  className="group w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06] hover:border-white/15 flex items-center justify-center transition-all duration-200 active:scale-90"
                  aria-label={t.rewind}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white/35 group-hover:text-white/80 transition-colors">
                    <path d="M11 19V5l-7 7 7 7zm7 0V5l-7 7 7 7z" fill="currentColor"/>
                  </svg>
                </button>

                {/* Play/Pause */}
                <button onClick={togglePlay}
                  className={`group w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 border ${
                    isPlaying ? 'bg-indigo-500/20 border-indigo-400/25' : 'bg-white/[0.05] border-white/[0.08]'
                  }`}
                  aria-label={isPlaying ? t.pause : t.play}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-indigo-300">
                      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white/60">
                      <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" fill="currentColor"/>
                    </svg>
                  )}
                </button>

                {/* Scrubber */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-mono text-white/20 w-8 text-right">{formatTime(animProgress)}</span>
                  <input type="range" min="0" max={animDuration || 1} step="0.01" value={animProgress}
                    onChange={(e) => seekAnim(parseFloat(e.target.value))}
                    className="w-16 md:w-24 h-0.5 accent-indigo-400/80 cursor-pointer" />
                  <span className="text-[7px] font-mono text-white/15 w-8">{formatTime(animDuration)}</span>
                </div>

                {/* Speed chips */}
                <div className="hidden md:flex items-center gap-0.5">
                  {[0.5, 1, 2].map((spd) => (
                    <button key={spd} onClick={() => setAnimSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[7px] font-mono transition-all duration-150 ${
                        animSpeed === spd
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/25'
                          : 'text-white/25 hover:text-white/50 border border-transparent'
                      }`}>{spd}x</button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/[0.06]" />

                {/* Mute toggle */}
                <button onClick={toggleMute}
                  className="group w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06] hover:border-white/15 flex items-center justify-center transition-all duration-200"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                      <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>

                {/* Seletor de animação do personagem */}
                {charAnimNames.length > 1 && (
                  <>
                    <div className="w-px h-5 bg-white/[0.06]" />
                    <div className="flex items-center gap-1">
                      <span className="text-white/25 text-[7px] font-mono uppercase tracking-wider">char</span>
                      <select
                        value={currentCharIdx}
                        onChange={e => switchCharAnim(Number(e.target.value))}
                        className="bg-transparent border border-white/10 rounded text-[8px] font-mono text-white/50 hover:text-white/80 hover:border-white/20 transition-all px-1 py-0.5 cursor-pointer outline-none max-w-[90px]"
                      >
                        {charAnimNames.map((name, i) => (
                          <option key={i} value={i} className="bg-[#1a1a2e] text-white/80">
                            {name.length > 12 ? name.slice(0, 12) + '…' : name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/50 to-transparent pointer-events-none -z-10" />
          </div>

          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0c0c18]/80 to-transparent pointer-events-none" />

          {/* Center glow */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05] animate-pulse-slow-scene"
            style={{ background: 'radial-gradient(circle, #6677ee 0%, #4455aa 30%, transparent 70%)' }}
          />
        </div>
      )}

      {/* ─── Glass intro popup ─── */}
      {!loading && !error && !started && (
        <div className="absolute inset-0 z-40 flex items-center justify-center as-intro-backdrop">
          <div className="as-glass-card relative flex flex-col items-center gap-5 px-10 py-8 max-w-sm mx-4 text-center">
            {/* Decorative ring */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-indigo-400/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-indigo-300">
                  <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" fill="currentColor"/>
                </svg>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.5em] mb-2">004</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{t.startTitle}</h3>
              <p className="text-xs text-white/30 mt-1.5 leading-relaxed">{t.startSub}</p>
            </div>

            <button
              onClick={startExperience}
              className="group relative w-full py-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/20 hover:border-indigo-400/40 transition-all duration-300 active:scale-[0.97]"
            >
              <span className="text-sm font-semibold text-indigo-200 group-hover:text-white transition-colors">{t.startBtn}</span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(100,120,255,0.1), transparent 70%)' }} />
            </button>

            <p className="text-[7px] font-mono text-white/15 uppercase tracking-widest">
              <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 inline mr-1 -mt-0.5 text-white/20">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {t.startHint}
            </p>
          </div>
        </div>
      )}

      {/* ─── Replay overlay ─── */}
      {finished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center as-intro-backdrop">
          <div className="as-glass-card relative flex flex-col items-center gap-4 px-8 py-6 max-w-xs mx-4 text-center">
            {/* Decorative ring */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white/50">
                  <path d="M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-xl font-bold text-white/90 tracking-tight">{t.replayTitle}</h3>
              <p className="text-[11px] text-white/25 mt-1">{t.replaySub}</p>
            </div>

            <button
              onClick={replayExperience}
              className="group relative w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] transition-all duration-300 active:scale-[0.97]"
            >
              <span className="flex items-center justify-center gap-2 text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <path d="M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
                {t.replayBtn}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Audio element */}
      <audio ref={audioRef} src="/audio/foguinho.ogg" preload="auto" />

      {/* Scoped styles */}
      <style>{`
        .bg-gradient-animated-scene {
          background: linear-gradient(135deg, #0c0c14 0%, #0e1020 25%, #10122a 50%, #0e1020 75%, #0c0c14 100%);
          background-size: 400% 400%;
          animation: gradientShiftScene 12s ease-in-out infinite;
        }
        @keyframes gradientShiftScene {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-pulse-slow-scene {
          animation: pulseSlowScene 4s ease-in-out infinite;
        }
        @keyframes pulseSlowScene {
          0%, 100% { opacity: 0.04; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.07; transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-fade-in-scene {
          animation: fadeInScene 0.3s ease-out both;
        }
        @keyframes fadeInScene {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .as-writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        .as-intro-backdrop {
          background: rgba(8, 8, 16, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: asIntroIn 0.6s ease-out both;
        }
        @keyframes asIntroIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .as-glass-card {
          background: rgba(16, 16, 32, 0.55);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          animation: asCardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        @keyframes asCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedScene;
