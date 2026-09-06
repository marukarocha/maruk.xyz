import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import shirtModelUrl from './3d/Shirt.glb?url';

type StampId = string;

type ColorOption = {
  id: string;
  label: string;
  value: string;
};

type StampOption = {
  id: StampId;
  label: string;
  description: string;
  textureUrl?: string;
  thumbnailUrl?: string;
};

const SHIRT_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', value: '#f2f4f7' },
  { id: 'black', label: 'Black', value: '#050608' },
  { id: 'navy', label: 'Navy', value: '#05084d' },
  { id: 'orange', label: 'Orange', value: '#ff5b00' },
  { id: 'green', label: 'Green', value: '#00a514' },
  { id: 'red', label: 'Red', value: '#ff1010' },
  { id: 'yellow', label: 'Yellow', value: '#e9ef00' },
  { id: 'blue', label: 'Blue', value: '#0b5bcf' },
  { id: 'pink', label: 'Pink', value: '#ec13a3' },
  { id: 'light-gray', label: 'Light Gray', value: '#b8bcc1' },
  { id: 'wine', label: 'Wine', value: '#960303' },
  { id: 'gray', label: 'Gray', value: '#7d838b' },
  { id: 'cyan', label: 'Cyan', value: '#12b7df' },
  { id: 'dark-green', label: 'Dark Green', value: '#234f3c' },
  { id: 'amber', label: 'Amber', value: '#f2a317' },
];

const STAMP_COLORS: ColorOption[] = [
  { id: 'onyx', label: 'Onyx', value: '#0e1116' },
  { id: 'cloud', label: 'Cloud', value: '#f7f4ef' },
  { id: 'cyan', label: 'Cyan', value: '#33c3d8' },
  { id: 'lime', label: 'Lime', value: '#a8cf45' },
  { id: 'coral', label: 'Coral', value: '#f2785c' },
];

const STAMP_TEXTURES = import.meta.glob('./3d/textures/stamps/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

const STAMP_THUMBNAILS = import.meta.glob('./3d/textures/stamps/thumbs/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

const STAMP_THUMBNAILS_BY_ID = Object.entries(STAMP_THUMBNAILS).reduce<Record<string, string>>((acc, [path, url]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
  if (fileName) acc[fileName] = url;
  return acc;
}, {});

function formatStampLabel(fileName: string) {
  const noPrefix = fileName.replace(/^\d+[_-]?/, '');
  return noPrefix
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const GENERATED_STAMP_OPTIONS: StampOption[] = Object.entries(STAMP_TEXTURES)
  .map(([path, textureUrl]) => {
    const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? path;
    return {
      id: fileName,
      label: formatStampLabel(fileName),
      description: `Estampa ${formatStampLabel(fileName)} em PNG transparente.`,
      textureUrl,
      thumbnailUrl: STAMP_THUMBNAILS_BY_ID[fileName] ?? textureUrl,
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

const STAMP_OPTIONS: StampOption[] = [
  { id: 'none', label: 'Sem Estampa', description: 'Visual clean sem arte frontal.' },
  ...GENERATED_STAMP_OPTIONS,
];

const DEFAULT_STAMP_ID = STAMP_OPTIONS.find((stamp) => stamp.id !== 'none')?.id ?? 'none';
const stampTextureCache = new Map<string, THREE.Texture>();

type StampUvTransform = {
  repeatX: number;
  repeatY: number;
  offsetX: number;
  offsetY: number;
};

function isVerticalStampId(stampTextureId: string) {
  const normalized = stampTextureId.trim();
  return /(?:^|[_-])vert(?:[_-]|$)/i.test(normalized);
}

function isStampColorCustomizable(stampTextureId: string) {
  const normalized = stampTextureId.trim().toLowerCase();
  if (!normalized || normalized === 'none') return false;
  // Convenção por nome: termos de "color/fixed/nocolor" indicam arte já colorida (cor fixa).
  return !/(?:nocolor|no_color|fixed|fullcolor|multicolor|colorida|colors?)/i.test(normalized);
}

function resolveStampUvTransform(stampTextureId: string): StampUvTransform {
  const isVerticalStamp = isVerticalStampId(stampTextureId);
  if (isVerticalStamp) {
    // Estampa vertical: mantém orientação natural (sem flip) e centraliza no recorte vertical.
    const verticalRepeatY = 0.78;
    return {
      repeatX: 1,
      repeatY: verticalRepeatY,
      offsetX: 0,
      offsetY: 0.5 - verticalRepeatY * 0.5,
    };
  }

  return {
    repeatX: 1,
    repeatY: -1,
    offsetX: 0,
    offsetY: 1,
  };
}

type ShirtModelId = 'regular' | 'oversized' | 'slim';
type ShirtSizeId = 'PP' | 'P' | 'M' | 'G' | 'GG';

type ShirtModelOption = {
  id: ShirtModelId;
  label: string;
  description: string;
  basePrice: number;
  scale: [number, number, number];
};

type ShirtSizeOption = {
  id: ShirtSizeId;
  label: string;
  priceDelta: number;
};

type PaymentMethod = 'pix' | 'card' | 'boleto';
type BackTextFontId = 'bebas' | 'montserrat' | 'oswald';

type BackTextFontOption = {
  id: BackTextFontId;
  label: string;
  family: string;
  weight: number;
};

type SavedTshirtLabConfig = {
  version: 1;
  shirtColor: string;
  stampColor: string;
  backTextColor: string;
  stampId: StampId;
  shirtModelId: ShirtModelId;
  shirtSizeId: ShirtSizeId;
  giftWrapEnabled: boolean;
  backTextEnabled: boolean;
  backText: string;
  backTextFontId: BackTextFontId;
};

const CHECKOUT_STEPS = ['Produto', 'Extras', 'Checkout', 'Pagamento', 'Finalizacao'] as const;
const MAX_BACK_TEXT_CHARS = 16;
const BACK_TEXT_EXTRA_PRICE = 22;
const GIFT_WRAP_PRICE = 18;
const TSHIRT_LAB_STORAGE_KEY = 'tshirt-lab:last-config:v1';
const GOOGLE_FONTS_STYLESHEET_URL =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@600;700&family=Oswald:wght@500;600;700&display=swap';
const GOOGLE_FONTS_LINK_ID = 'tshirt-lab-google-fonts';

const BACK_TEXT_FONT_OPTIONS: BackTextFontOption[] = [
  { id: 'bebas', label: 'Bebas Neue', family: 'Bebas Neue', weight: 700 },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', weight: 700 },
  { id: 'oswald', label: 'Oswald', family: 'Oswald', weight: 600 },
];

const SHIRT_MODELS: ShirtModelOption[] = [
  {
    id: 'regular',
    label: 'Regular',
    description: 'Corte clássico equilibrado.',
    basePrice: 129,
    scale: [1, 1, 1],
  },
  {
    id: 'oversized',
    label: 'Oversized',
    description: 'Mais solta com visual street.',
    basePrice: 149,
    scale: [1.11, 1.04, 1.07],
  },
  {
    id: 'slim',
    label: 'Slim',
    description: 'Silhueta ajustada e limpa.',
    basePrice: 139,
    scale: [0.94, 1.02, 0.92],
  },
];

const SHIRT_SIZES: ShirtSizeOption[] = [
  { id: 'PP', label: 'PP', priceDelta: -10 },
  { id: 'P', label: 'P', priceDelta: -4 },
  { id: 'M', label: 'M', priceDelta: 0 },
  { id: 'G', label: 'G', priceDelta: 6 },
  { id: 'GG', label: 'GG', priceDelta: 12 },
];

function normalizeBackTextInput(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7EÀ-ÖØ-öø-ÿ]/g, '')
    .slice(0, MAX_BACK_TEXT_CHARS);
}

type BackTextPlacement = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
};

type BackTextOverlay = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type StampPinAnchor = {
  position: [number, number, number];
  normal: [number, number, number];
};

type ColorTransitionShader = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

type ViewerVisualState = {
  status: 'idle' | 'loading' | 'applying';
  message: string;
};

type TShirtModelProps = {
  shirtColor: string;
  stampTextureId: StampId;
  stampTextureUrl: string | null;
  useVerticalStamp: boolean;
  stampColor: string;
  backText: string;
  backTextColor: string;
  backTextEnabled: boolean;
  backTextFontFamily: string;
  backTextFontWeight: number;
  backTextFontRefreshKey: number;
  showStampPin: boolean;
  stampFocusActive: boolean;
  previewSide: 'front' | 'back';
  modelScale: [number, number, number];
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  backTextFocusWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  stampPinFacingRef: React.MutableRefObject<boolean>;
  onStampHoverChange: (hovered: boolean) => void;
  onLoadStateChange: (state: { status: 'loading' | 'ready' | 'error'; message?: string }) => void;
  onVisualStateChange: (state: ViewerVisualState) => void;
};

type LoadedShirtModel = {
  root: THREE.Group;
  backTextPlacement: BackTextPlacement;
  backTextOverlay: BackTextOverlay | null;
  stampPinAnchor: StampPinAnchor | null;
};

function formatModelLoadError(error: unknown) {
  const fallback = 'Falha ao carregar o modelo 3D da camisa.';
  if (!(error instanceof Error)) return fallback;

  const message = error.message || fallback;
  if (message.includes('Invalid typed array length')) {
    return 'Arquivo do modelo ausente/corrompido em src/playground/experiments/tshirt-lab/3d/Shirt.glb.';
  }
  return message;
}

function normalizeLoadedShirt(scene: THREE.Group): LoadedShirtModel {
  const root = scene.clone(true);
  const bbox = new THREE.Box3().setFromObject(root);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());
  const safeHeight = size.y > 0.0001 ? size.y : 1;
  const scale = 2.3 / safeHeight;

  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -center.y * scale + 0.22, -center.z * scale);
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const fittedBox = new THREE.Box3().setFromObject(root);
  const fittedSize = fittedBox.getSize(new THREE.Vector3());
  const modelCenter = fittedBox.getCenter(new THREE.Vector3());

  root.updateMatrixWorld(true);

  const resolvePlacement = (): BackTextPlacement => {
    // Prioriza o marcador vazio do Blender para posição de texto nas costas.
    const source =
      root.getObjectByName('back_text') ??
      root.getObjectByName('text_back');

    if (!source) {
      return {
        position: [0, 0.95, -0.7],
        rotation: [0, Math.PI, 0],
        size: [0.85, 0.35],
      };
    }

    const worldPosition = source.getWorldPosition(new THREE.Vector3());
    const worldQuaternion = source.getWorldQuaternion(new THREE.Quaternion());
    const faceOutQuaternion = worldQuaternion.clone();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(faceOutQuaternion).normalize();
    const outDirection = worldPosition.clone().sub(modelCenter);

    if (normal.dot(outDirection) < 0) {
      const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      faceOutQuaternion.multiply(flip);
      normal.applyQuaternion(flip).normalize();
    }

    worldPosition.addScaledVector(normal, 0.012);
    const localPosition = root.worldToLocal(worldPosition.clone());
    const rootWorldQuaternion = root.getWorldQuaternion(new THREE.Quaternion());
    const localQuaternion = rootWorldQuaternion.invert().multiply(faceOutQuaternion);
    const localEuler = new THREE.Euler().setFromQuaternion(localQuaternion);

    if (source instanceof THREE.Mesh) {
      const sourceBox = new THREE.Box3().setFromObject(source);
      const sourceSize = sourceBox.getSize(new THREE.Vector3());
      return {
        position: [localPosition.x, localPosition.y, localPosition.z],
        rotation: [localEuler.x, localEuler.y, localEuler.z],
        size: [Math.max(0.35, sourceSize.x * 0.95), Math.max(0.2, sourceSize.y * 0.95)],
      };
    }

    return {
      position: [localPosition.x, localPosition.y, localPosition.z],
      rotation: [localEuler.x, localEuler.y, localEuler.z],
      size: [0.78, 0.34],
    };
  };

  const resolveBackTextOverlay = (): BackTextOverlay | null => {
    const textBackMesh = root.getObjectByName('text_back');
    if (!(textBackMesh instanceof THREE.Mesh)) return null;

    const localEuler = new THREE.Euler().setFromQuaternion(textBackMesh.quaternion);
    return {
      geometry: textBackMesh.geometry.clone(),
      position: [textBackMesh.position.x, textBackMesh.position.y, textBackMesh.position.z],
      rotation: [localEuler.x, localEuler.y, localEuler.z],
      scale: [textBackMesh.scale.x, textBackMesh.scale.y, textBackMesh.scale.z],
    };
  };

  const resolveStampPinAnchor = (): StampPinAnchor | null => {
    const marker = root.getObjectByName('Front-stamp');
    if (!marker) return null;

    const worldPosition = marker.getWorldPosition(new THREE.Vector3());
    const worldQuaternion = marker.getWorldQuaternion(new THREE.Quaternion());
    const markerNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion).normalize();
    const markerRight = new THREE.Vector3(1, 0, 0).applyQuaternion(worldQuaternion).normalize();
    const outwardDirection = worldPosition.clone().sub(modelCenter).normalize();
    if (markerNormal.dot(outwardDirection) < 0) markerNormal.multiplyScalar(-1);

    // Desloca o pin para a extremidade direita da área da estampa para não cobrir a arte.
    const sideOffset = Math.max(0.24, fittedSize.x * 0.18);
    const lifted = worldPosition.clone().addScaledVector(markerRight, sideOffset).addScaledVector(markerNormal, 0.08);
    const localPosition = root.worldToLocal(lifted);
    const rootWorldQuaternion = root.getWorldQuaternion(new THREE.Quaternion());
    const localNormal = markerNormal
      .clone()
      .applyQuaternion(rootWorldQuaternion.invert())
      .normalize();
    return {
      position: [localPosition.x, localPosition.y, localPosition.z],
      normal: [localNormal.x, localNormal.y, localNormal.z],
    };
  };

  return {
    root,
    backTextPlacement: resolvePlacement(),
    backTextOverlay: resolveBackTextOverlay(),
    stampPinAnchor: resolveStampPinAnchor(),
  };
}

function buildBackTextCanvas(text: string, color: string, fontFamily: string, fontWeight: number) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} 118px "${fontFamily}", "Arial Black", Arial, sans-serif`;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.lineWidth = 8;

  const safe = trimmed;
  const words = safe.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > 720 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const finalLines = lines.slice(0, 2);
  const baseY = finalLines.length === 1 ? 520 : 470;
  finalLines.forEach((entry, index) => {
    const y = baseY + index * 130;
    ctx.strokeText(entry, 512, y);
    ctx.fillText(entry, 512, y);
  });

  return canvas;
}

function buildBackTextTexture(text: string, color: string, fontFamily: string, fontWeight: number) {
  const canvas = buildBackTextCanvas(text, color, fontFamily, fontWeight);
  if (!canvas) return null;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1);
  texture.offset.set(0, 1);
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

const TShirtModel = ({
  shirtColor,
  stampTextureId,
  stampTextureUrl,
  useVerticalStamp,
  stampColor,
  backText,
  backTextColor,
  backTextEnabled,
  backTextFontFamily,
  backTextFontWeight,
  backTextFontRefreshKey,
  showStampPin,
  stampFocusActive,
  previewSide,
  modelScale,
  stampPinWorldRef,
  backTextFocusWorldRef,
  stampPinFacingRef,
  onStampHoverChange,
  onLoadStateChange,
  onVisualStateChange,
}: TShirtModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const stampPinRef = useRef<THREE.Group>(null);
  const backTextFocusRef = useRef<THREE.Group>(null);
  const stampWorldPositionRef = useRef(new THREE.Vector3());
  const backTextFocusWorldPositionRef = useRef(new THREE.Vector3());
  const stampWorldNormalRef = useRef(new THREE.Vector3());
  const stampToCameraRef = useRef(new THREE.Vector3());
  const stampQuaternionRef = useRef(new THREE.Quaternion());
  const isHoveringStampRef = useRef(false);
  const stampMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const shirtMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const colorPulseRef = useRef(0);
  const stampRevealProgressRef = useRef(1);
  const stampRevealDirectionRef = useRef<'vertical' | 'horizontal'>('vertical');
  const colorTransitionProgressRef = useRef(1);
  const colorTransitionFromRef = useRef(new THREE.Color(shirtColor));
  const colorTransitionToRef = useRef(new THREE.Color(shirtColor));
  const colorTransitionAxisRef = useRef<'vertical' | 'horizontal'>('vertical');
  const lastShirtColorRef = useRef(shirtColor);
  const [loadedShirt, setLoadedShirt] = useState<LoadedShirtModel | null>(null);
  const [stampTexture, setStampTexture] = useState<THREE.Texture | null>(null);
  const [backTextTexture, setBackTextTexture] = useState<THREE.Texture | null>(null);
  const stampColorCustomizable = useMemo(() => isStampColorCustomizable(stampTextureId), [stampTextureId]);

  const ensureShirtColorTransitionShader = (material: THREE.MeshStandardMaterial, mesh: THREE.Mesh) => {
    const transitionData = ((material.userData.colorTransition ??= {}) as {
      patched?: boolean;
      shader?: ColorTransitionShader;
      rangeX?: [number, number];
      rangeY?: [number, number];
    });

    if (!transitionData.rangeX || !transitionData.rangeY) {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const bbox = mesh.geometry.boundingBox;
      transitionData.rangeX = bbox ? [bbox.min.x, bbox.max.x] : [-0.5, 0.5];
      transitionData.rangeY = bbox ? [bbox.min.y, bbox.max.y] : [-0.5, 0.5];
    }

    if (transitionData.patched) return;
    transitionData.patched = true;

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uColorTransitionProgress = { value: 1 };
      shader.uniforms.uColorTransitionFrom = { value: colorTransitionToRef.current.clone() };
      shader.uniforms.uColorTransitionTo = { value: colorTransitionToRef.current.clone() };
      shader.uniforms.uColorTransitionAxis = { value: new THREE.Vector3(0, 1, 0) };
      shader.uniforms.uColorTransitionRange = { value: new THREE.Vector2(...(transitionData.rangeY ?? [-0.5, 0.5])) };
      shader.uniforms.uColorTransitionSoftness = { value: 0.12 };
      shader.uniforms.uColorTransitionTime = { value: 0 };

      shader.vertexShader = `
varying float vColorTransitionCoord;
varying vec3 vColorTransitionPos;
uniform vec3 uColorTransitionAxis;
` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vColorTransitionCoord = dot(transformed, uColorTransitionAxis);
vColorTransitionPos = transformed;`
      );

      shader.fragmentShader = `
varying float vColorTransitionCoord;
varying vec3 vColorTransitionPos;
uniform float uColorTransitionProgress;
uniform vec3 uColorTransitionFrom;
uniform vec3 uColorTransitionTo;
uniform vec2 uColorTransitionRange;
uniform float uColorTransitionSoftness;
uniform float uColorTransitionTime;
uniform vec3 uColorTransitionAxis;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise2(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    amplitude *= 0.5;
  }
  return value;
}
` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float transitionSpan = max(0.0001, uColorTransitionRange.y - uColorTransitionRange.x);
float transitionCoord = clamp((vColorTransitionCoord - uColorTransitionRange.x) / transitionSpan, 0.0, 1.0);

float axisIsVertical = step(0.5, abs(uColorTransitionAxis.y));
float perpCoord = mix(
  vColorTransitionPos.y * 1.1 + vColorTransitionPos.z * 0.55,
  vColorTransitionPos.x * 1.1 + vColorTransitionPos.z * 0.55,
  axisIsVertical
);
float n1 = fbm(vec2(perpCoord * 2.8, transitionCoord * 5.4 + uColorTransitionTime * 1.25));
float n2 = fbm(vec2(perpCoord * 5.7 + 5.3, transitionCoord * 8.2 - uColorTransitionTime * 0.9));
float splashNoise = (n1 * 0.7 + n2 * 0.3) - 0.5;
float ripple = sin(perpCoord * 11.0 + uColorTransitionTime * 6.5) * 0.03;
float organicOffset = splashNoise * 0.22 + ripple;
float transitionCoordOrganic = clamp(transitionCoord + organicOffset, 0.0, 1.0);

float sweep = mix(
  -uColorTransitionSoftness,
  1.0 + uColorTransitionSoftness,
  uColorTransitionProgress
);
float transitionMix = 1.0 - smoothstep(
  sweep - uColorTransitionSoftness,
  sweep + uColorTransitionSoftness,
  transitionCoordOrganic
);
diffuseColor.rgb = mix(uColorTransitionFrom, uColorTransitionTo, transitionMix);`
      );

      transitionData.shader = shader as unknown as ColorTransitionShader;
    };

    material.customProgramCacheKey = () => 'tshirt-color-transition-v1';
    material.needsUpdate = true;
  };

  const ensureStampRevealShader = (material: THREE.MeshStandardMaterial) => {
    const stampRevealData = ((material.userData.stampReveal ??= {}) as {
      patched?: boolean;
      shader?: ColorTransitionShader;
    });
    if (stampRevealData.patched) return;
    stampRevealData.patched = true;

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uStampRevealProgress = { value: 1 };
      shader.uniforms.uStampRevealDirection = { value: 0 };
      shader.uniforms.uStampRevealTime = { value: 0 };

      shader.fragmentShader = `
uniform float uStampRevealProgress;
uniform float uStampRevealDirection;
uniform float uStampRevealTime;

float stampHash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float stampNoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = stampHash12(i);
  float b = stampHash12(i + vec2(1.0, 0.0));
  float c = stampHash12(i + vec2(0.0, 1.0));
  float d = stampHash12(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float stampFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * stampNoise2(p);
    p = p * 2.03 + vec2(19.7, 7.1);
    a *= 0.5;
  }
  return v;
}
` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
float stampAxisCoord = mix(vMapUv.y, vMapUv.x, uStampRevealDirection);
float stampNoiseA = stampFbm(vMapUv * 7.8 + vec2(0.0, uStampRevealTime * 0.45));
float stampNoiseB = stampFbm(vMapUv.yx * 11.0 + vec2(uStampRevealTime * 0.26, 3.7));
float splashNoise = (stampNoiseA * 0.68 + stampNoiseB * 0.32) - 0.5;
float splashAmp = (1.0 - smoothstep(0.72, 1.0, uStampRevealProgress)) * 0.34;
float stampSplash = splashNoise * splashAmp;
float stampSweep = mix(1.32, -0.32, uStampRevealProgress);
float stampMask = smoothstep(stampSweep - 0.14, stampSweep + 0.14, stampAxisCoord + stampSplash);
stampMask = max(stampMask, smoothstep(0.97, 1.0, uStampRevealProgress));
float stampFinalize = smoothstep(0.88, 1.0, uStampRevealProgress);
stampMask = mix(stampMask, 1.0, stampFinalize);
float stampEdge = smoothstep(0.0, 0.24, stampMask) * (1.0 - smoothstep(0.78, 1.0, stampMask));
diffuseColor.rgb += stampEdge * 0.08;
diffuseColor.a *= stampMask;`
      );

      stampRevealData.shader = shader as unknown as ColorTransitionShader;
    };

    material.customProgramCacheKey = () => 'tshirt-stamp-reveal-v1';
    material.needsUpdate = true;
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const baseRotationY = stampFocusActive ? 0 : previewSide === 'back' ? Math.PI : 0;
    const targetRotationY = stampFocusActive
      ? baseRotationY
      : baseRotationY + state.pointer.x * 0.24 + Math.sin(state.clock.elapsedTime * 0.35) * 0.05;
    const targetRotationX = stampFocusActive ? 0 : state.pointer.y * 0.12;
    const floatAmplitude = stampFocusActive ? 0.014 : 0.036;
    const targetFloatY = 0.06 + Math.sin(state.clock.elapsedTime * 1.12) * floatAmplitude;
    const pulseTarget = colorPulseRef.current > 0.001 ? colorPulseRef.current : 0;
    if (pulseTarget > 0) {
      colorPulseRef.current = THREE.MathUtils.lerp(colorPulseRef.current, 0, 0.09);
    } else {
      colorPulseRef.current = 0;
    }
    const pulseTime = state.clock.elapsedTime;
    const pulseOsc = Math.sin(pulseTime * 18) * 0.5 + 0.5;
    const pulseEnergy = colorPulseRef.current * (0.45 + pulseOsc * 0.55);
    const scaleBoost = 1 + colorPulseRef.current * 0.028 + Math.sin(pulseTime * 24) * 0.009 * colorPulseRef.current;
    const yScaleBoost = 1 + colorPulseRef.current * 0.012;
    if (colorTransitionProgressRef.current < 0.999) {
      colorTransitionProgressRef.current = THREE.MathUtils.lerp(colorTransitionProgressRef.current, 1, 0.085);
    } else {
      colorTransitionProgressRef.current = 1;
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetFloatY, 0.08);
    groupRef.current.scale.set(
      modelScale[0] * scaleBoost,
      modelScale[1] * yScaleBoost,
      modelScale[2] * scaleBoost
    );

    if (stampRevealProgressRef.current < 0.999) {
      stampRevealProgressRef.current = THREE.MathUtils.lerp(stampRevealProgressRef.current, 1, 0.18);
    } else {
      stampRevealProgressRef.current = 1;
    }

    if (shirtMaterialsRef.current.length > 0) {
      const transitionAxis = colorTransitionAxisRef.current === 'horizontal' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      for (const material of shirtMaterialsRef.current) {
        // Pulso criativo de troca de cor: brilho suave + tecido temporariamente mais acetinado.
        material.roughness = THREE.MathUtils.lerp(0.94, 0.62, pulseEnergy);
        material.envMapIntensity = THREE.MathUtils.lerp(0.18, 0.56, pulseEnergy);
        material.emissive.set('#ffffff');
        material.emissiveIntensity = 0.075 * pulseEnergy;

        const transitionData = material.userData.colorTransition as
          | {
              shader?: ColorTransitionShader;
              rangeX?: [number, number];
              rangeY?: [number, number];
            }
          | undefined;
        const shader = transitionData?.shader;
        if (!shader) continue;

        const activeRange = colorTransitionAxisRef.current === 'horizontal' ? transitionData.rangeX : transitionData.rangeY;
        const rangeStart = activeRange?.[0] ?? -0.5;
        const rangeEnd = activeRange?.[1] ?? 0.5;

        (shader.uniforms.uColorTransitionProgress.value as number) = colorTransitionProgressRef.current;
        (shader.uniforms.uColorTransitionFrom.value as THREE.Color).copy(colorTransitionFromRef.current);
        (shader.uniforms.uColorTransitionTo.value as THREE.Color).copy(colorTransitionToRef.current);
        (shader.uniforms.uColorTransitionAxis.value as THREE.Vector3).copy(transitionAxis);
        (shader.uniforms.uColorTransitionRange.value as THREE.Vector2).set(rangeStart, rangeEnd);
        (shader.uniforms.uColorTransitionSoftness.value as number) =
          colorTransitionAxisRef.current === 'horizontal' ? 0.1 : 0.12;
        (shader.uniforms.uColorTransitionTime.value as number) = pulseTime;
      }
    }

    if (stampMaterialsRef.current.length > 0) {
      const stampDirection = 0;
      for (const material of stampMaterialsRef.current) {
        const stampRevealData = material.userData.stampReveal as { shader?: ColorTransitionShader } | undefined;
        const shader = stampRevealData?.shader;
        if (!shader) continue;
        (shader.uniforms.uStampRevealProgress.value as number) = stampRevealProgressRef.current;
        (shader.uniforms.uStampRevealDirection.value as number) = stampDirection;
        (shader.uniforms.uStampRevealTime.value as number) = pulseTime;
      }
    }

    if (showStampPin && stampPinRef.current) {
      const worldPosition = stampPinRef.current.getWorldPosition(stampWorldPositionRef.current);
      if (!stampPinWorldRef.current) {
        stampPinWorldRef.current = worldPosition.clone();
      } else {
        stampPinWorldRef.current.copy(worldPosition);
      }

      if (loadedShirt?.stampPinAnchor) {
        const worldQuaternion = stampPinRef.current.getWorldQuaternion(stampQuaternionRef.current);
        stampWorldNormalRef.current
          .set(...loadedShirt.stampPinAnchor.normal)
          .applyQuaternion(worldQuaternion)
          .normalize();
        stampToCameraRef.current.copy(state.camera.position).sub(worldPosition).normalize();
        stampPinFacingRef.current = stampWorldNormalRef.current.dot(stampToCameraRef.current) > 0.1;
      } else {
        stampPinFacingRef.current = false;
      }
    } else {
      stampPinWorldRef.current = null;
      stampPinFacingRef.current = false;
    }

    if (backTextFocusRef.current) {
      const worldPosition = backTextFocusRef.current.getWorldPosition(backTextFocusWorldPositionRef.current);
      if (!backTextFocusWorldRef.current) {
        backTextFocusWorldRef.current = worldPosition.clone();
      } else {
        backTextFocusWorldRef.current.copy(worldPosition);
      }
    } else {
      backTextFocusWorldRef.current = null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    onLoadStateChange({ status: 'loading' });

    const load = () => {
      loader.load(
        shirtModelUrl,
        (gltf) => {
          if (cancelled) return;
          const source = gltf.scene || gltf.scenes?.[0];
          if (!source) {
            onLoadStateChange({ status: 'error', message: 'Modelo inválido: cena principal não encontrada.' });
            return;
          }
          setLoadedShirt(normalizeLoadedShirt(source));
          onLoadStateChange({ status: 'ready' });
        },
        undefined,
        (error) => {
          if (cancelled) return;
          setLoadedShirt(null);
          onLoadStateChange({ status: 'error', message: formatModelLoadError(error) });
        }
      );
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [onLoadStateChange]);

  useEffect(() => {
    let cancelled = false;
    if (!stampTextureUrl) {
      setStampTexture(null);
      onVisualStateChange({ status: 'idle', message: '' });
      return () => {
        cancelled = true;
      };
    }

    const uvTransform = resolveStampUvTransform(stampTextureId);
    const cacheKey = `${stampTextureUrl}|${uvTransform.repeatX}|${uvTransform.repeatY}|${uvTransform.offsetX}|${uvTransform.offsetY}`;
    const cachedTexture = stampTextureCache.get(cacheKey);
    if (cachedTexture) {
      setStampTexture(cachedTexture);
      onVisualStateChange({ status: 'idle', message: '' });
      return () => {
        cancelled = true;
      };
    }

    onVisualStateChange({ status: 'loading', message: 'carregando estampa...' });
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      stampTextureUrl,
      (texture) => {
        if (cancelled) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.x = uvTransform.repeatX;
        texture.repeat.y = uvTransform.repeatY;
        texture.offset.x = uvTransform.offsetX;
        texture.offset.y = uvTransform.offsetY;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 2;
        texture.needsUpdate = true;
        stampTextureCache.set(cacheKey, texture);
        setStampTexture(texture);
        onVisualStateChange({ status: 'idle', message: '' });
      },
      undefined,
      () => {
        if (cancelled) return;
        setStampTexture(null);
        onVisualStateChange({ status: 'idle', message: '' });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [stampTextureId, stampTextureUrl, onVisualStateChange]);

  useEffect(() => {
    const nextTexture = backTextEnabled
      ? buildBackTextTexture(backText, backTextColor, backTextFontFamily, backTextFontWeight)
      : null;
    setBackTextTexture(nextTexture);
    return () => {
      nextTexture?.dispose();
    };
  }, [backText, backTextEnabled, backTextColor, backTextFontFamily, backTextFontWeight, backTextFontRefreshKey]);

  useEffect(() => {
    if (lastShirtColorRef.current === shirtColor) return;
    colorTransitionFromRef.current.set(lastShirtColorRef.current);
    colorTransitionToRef.current.set(shirtColor);
    colorTransitionProgressRef.current = 0;
    colorTransitionAxisRef.current = colorTransitionAxisRef.current === 'vertical' ? 'horizontal' : 'vertical';
    lastShirtColorRef.current = shirtColor;
    colorPulseRef.current = 1;
  }, [shirtColor]);

  useEffect(() => {
    if (!stampTexture) {
      stampRevealProgressRef.current = 1;
      return;
    }
    stampRevealProgressRef.current = 0;
    stampRevealDirectionRef.current = 'vertical';
  }, [stampTexture]);

  useEffect(() => {
    if (!loadedShirt) return;

    const hasStampTexture = Boolean(stampTexture);
    const nextStampMaterials: THREE.MeshStandardMaterial[] = [];
    const nextShirtMaterials: THREE.MeshStandardMaterial[] = [];
    const findObjectByName = (patterns: string[]): THREE.Object3D | null => {
      for (const pattern of patterns) {
        const exact = loadedShirt.root.getObjectByName(pattern);
        if (exact) return exact;
      }
      const loweredPatterns = patterns.map((pattern) => pattern.toLowerCase());
      let found: THREE.Object3D | null = null;
      loadedShirt.root.traverse((child) => {
        if (found) return;
        const name = child.name?.toLowerCase() ?? '';
        if (loweredPatterns.some((pattern) => name === pattern || name.includes(pattern))) {
          found = child;
        }
      });
      return found;
    };

    const mainStampObject = findObjectByName(['stamp_m']);
    const verticalStampObject = findObjectByName(['stamp_vert', 'stamp-vert', 'vertical_stamp', 'vert_stamp']);
    const canUseVerticalStamp = useVerticalStamp && Boolean(verticalStampObject);
    const shouldShowVerticalStamp = hasStampTexture && canUseVerticalStamp;
    const shouldShowMainStamp = hasStampTexture && !shouldShowVerticalStamp;

    if (mainStampObject) mainStampObject.visible = shouldShowMainStamp;
    if (verticalStampObject) verticalStampObject.visible = shouldShowVerticalStamp;

    loadedShirt.root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || !('color' in material)) return;
        const targetMaterial = material as THREE.MeshStandardMaterial;
        const materialName = targetMaterial.name?.toLowerCase() ?? '';
        const meshName = child.name?.toLowerCase() ?? '';
        const isStampMaterial = materialName.includes('stamp') || meshName.includes('stamp');
        const isBackTextMaterial = materialName.includes('text_texture') || meshName.includes('text_back') || meshName.includes('back_text');

        if (isStampMaterial) {
          ensureStampRevealShader(targetMaterial);
          const mapChanged = targetMaterial.map !== stampTexture;
          const useOriginalStampColors = !stampColorCustomizable;
          const desiredEmissiveMap = useOriginalStampColors ? stampTexture : null;
          const emissiveMapChanged = targetMaterial.emissiveMap !== desiredEmissiveMap;
          const desiredToneMapped = !useOriginalStampColors;
          const toneMappedChanged = targetMaterial.toneMapped !== desiredToneMapped;
          targetMaterial.transparent = true;
          targetMaterial.alphaTest = 0.02;
          targetMaterial.side = THREE.DoubleSide;
          targetMaterial.depthWrite = false;
          targetMaterial.polygonOffset = true;
          targetMaterial.polygonOffsetFactor = -1;
          targetMaterial.polygonOffsetUnits = -1;
          targetMaterial.map = stampTexture;
          targetMaterial.color.set(useOriginalStampColors ? '#ffffff' : stampColor);
          targetMaterial.emissiveMap = desiredEmissiveMap;
          if (useOriginalStampColors) {
            // Estampa de cor fixa: mantém leitura original da arte, sem "lavar" por tint.
            targetMaterial.emissive.set('#ffffff');
            targetMaterial.emissiveIntensity = hasStampTexture ? 0.75 : 0;
            targetMaterial.toneMapped = false;
          } else {
            targetMaterial.emissiveMap = null;
            targetMaterial.emissive.set('#000000');
            targetMaterial.emissiveIntensity = 0;
            targetMaterial.toneMapped = true;
          }
          targetMaterial.metalness = 0;
          targetMaterial.roughness = 1;
          targetMaterial.opacity = hasStampTexture ? 1 : 0;
          if (mapChanged || emissiveMapChanged || toneMappedChanged) targetMaterial.needsUpdate = true;
          if (!nextStampMaterials.includes(targetMaterial)) {
            nextStampMaterials.push(targetMaterial);
          }
        } else if (isBackTextMaterial) {
          const mapChanged = targetMaterial.map !== backTextTexture;
          targetMaterial.transparent = true;
          targetMaterial.alphaTest = 0.08;
          targetMaterial.side = THREE.DoubleSide;
          targetMaterial.depthWrite = false;
          targetMaterial.polygonOffset = true;
          targetMaterial.polygonOffsetFactor = -2;
          targetMaterial.polygonOffsetUnits = -2;
          targetMaterial.map = backTextTexture;
          targetMaterial.color.set('#ffffff');
          targetMaterial.opacity = backTextEnabled && backTextTexture ? 1 : 0;
          targetMaterial.toneMapped = false;
          targetMaterial.depthWrite = false;
          if (mapChanged) targetMaterial.needsUpdate = true;
        } else {
          // Look de tecido: quase sem reflexo metálico, alta rugosidade e baixa influência de ambiente.
          ensureShirtColorTransitionShader(targetMaterial, child);
          targetMaterial.color.set(shirtColor);
          targetMaterial.metalness = 0;
          targetMaterial.roughness = 0.94;
          targetMaterial.envMapIntensity = 0.18;
          targetMaterial.emissive.set('#000000');
          targetMaterial.emissiveIntensity = 0;
          targetMaterial.transparent = false;
          targetMaterial.opacity = 1;
          targetMaterial.alphaTest = 0;
          targetMaterial.depthWrite = true;
          targetMaterial.polygonOffset = false;
          targetMaterial.toneMapped = true;
          targetMaterial.needsUpdate = true;
          if (!nextShirtMaterials.includes(targetMaterial)) {
            nextShirtMaterials.push(targetMaterial);
          }
        }
      });
    });
    stampMaterialsRef.current = nextStampMaterials;
    shirtMaterialsRef.current = nextShirtMaterials;
  }, [
    loadedShirt,
    shirtColor,
    stampTexture,
    stampColor,
    stampColorCustomizable,
    backTextTexture,
    backTextEnabled,
    previewSide,
    useVerticalStamp,
  ]);

  useEffect(() => {
    if (showStampPin) return;
    if (isHoveringStampRef.current) {
      isHoveringStampRef.current = false;
      onStampHoverChange(false);
    }
  }, [showStampPin, onStampHoverChange]);

  const isStampSurfaceObject = (object: THREE.Object3D | null | undefined) => {
    if (!object) return false;
    const source = object instanceof THREE.Mesh ? object : object.parent;
    if (!(source instanceof THREE.Mesh)) return false;
    const meshName = source.name?.toLowerCase() ?? '';
    if (meshName.includes('stamp')) return true;
    const materials = Array.isArray(source.material) ? source.material : [source.material];
    return materials.some((material) => {
      const materialName = (material as THREE.Material | undefined)?.name?.toLowerCase() ?? '';
      return materialName.includes('stamp');
    });
  };

  const updateStampHoverState = (nextHovered: boolean) => {
    if (isHoveringStampRef.current === nextHovered) return;
    isHoveringStampRef.current = nextHovered;
    onStampHoverChange(nextHovered);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!showStampPin) return;
    const isStampSurface = isStampSurfaceObject(event.object);
    updateStampHoverState(isStampSurface);
    if (isStampSurface) event.stopPropagation();
  };

  const handlePointerOut = () => {
    updateStampHoverState(false);
  };

  return (
    <group ref={groupRef} position={[0, 0.06, 0]} scale={modelScale}>
      {loadedShirt ? (
        <primitive
          object={loadedShirt.root}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onPointerMissed={handlePointerOut}
          onPointerCancel={handlePointerOut}
        >
          {loadedShirt.stampPinAnchor && showStampPin ? (
            <group ref={stampPinRef} position={loadedShirt.stampPinAnchor.position} />
          ) : null}
          <group ref={backTextFocusRef} position={loadedShirt.backTextPlacement.position} />
        </primitive>
      ) : null}
    </group>
  );
};

type StampPinProjectorProps = {
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  stampPinFacingRef: React.MutableRefObject<boolean>;
  pinAnchorRef: React.MutableRefObject<HTMLButtonElement | null>;
  showPin: boolean;
};

const StampPinProjector = ({
  stampPinWorldRef,
  stampPinFacingRef,
  pinAnchorRef,
  showPin,
}: StampPinProjectorProps) => {
  const { camera, size } = useThree();
  const projectedRef = useRef(new THREE.Vector3());
  const revealRef = useRef(0);

  useFrame(() => {
    const pinAnchor = pinAnchorRef.current;
    const worldPoint = stampPinWorldRef.current;
    if (!pinAnchor) return;

    if (!stampPinFacingRef.current || !(camera instanceof THREE.PerspectiveCamera) || !worldPoint) {
      revealRef.current = THREE.MathUtils.lerp(revealRef.current, 0, 0.25);
      pinAnchor.style.opacity = `${revealRef.current}`;
      pinAnchor.style.transform = 'translate(-100vw, -100vh)';
      return;
    }

    projectedRef.current.copy(worldPoint).project(camera);
    const anchorX = ((projectedRef.current.x + 1) * 0.5) * size.width;
    const anchorY = ((-projectedRef.current.y + 1) * 0.5) * size.height;
    const inDepth = projectedRef.current.z < 1 && projectedRef.current.z > -1;
    const inBounds = anchorX >= 0 && anchorX <= size.width && anchorY >= 0 && anchorY <= size.height;
    const visible = inDepth && inBounds;
    if (!visible) {
      revealRef.current = THREE.MathUtils.lerp(revealRef.current, 0, 0.2);
      pinAnchor.style.opacity = `${revealRef.current}`;
      pinAnchor.style.transform = 'translate(-100vw, -100vh)';
      return;
    }

    const targetReveal = showPin ? 1 : 0;
    revealRef.current = THREE.MathUtils.lerp(revealRef.current, targetReveal, 0.24);
    pinAnchor.style.opacity = `${revealRef.current}`;
    pinAnchor.style.transform = `translate(${anchorX}px, ${anchorY}px) translate(-50%, -50%)`;
  });

  return null;
};

type CameraDirectorProps = {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  backTextFocusWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  stampFocusActive: boolean;
  backTextFocusActive: boolean;
};

const CameraDirector = ({
  controlsRef,
  stampPinWorldRef,
  backTextFocusWorldRef,
  stampFocusActive,
  backTextFocusActive,
}: CameraDirectorProps) => {
  const { camera } = useThree();
  const defaultPosition = useMemo(() => new THREE.Vector3(0, 0.82, 5.2), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);
  const stampFocusOffset = useMemo(() => new THREE.Vector3(0, 0.02, 0.38), []);
  const backTextFocusOffset = useMemo(() => new THREE.Vector3(0, 0.06, 0.48), []);
  const focusPosition = useRef(new THREE.Vector3());
  const focusTarget = useRef(new THREE.Vector3());
  const wasFocusActiveRef = useRef(false);
  const returnFramesRef = useRef(0);
  const lastFovRef = useRef(camera instanceof THREE.PerspectiveCamera ? camera.fov : 33);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) return;

    const backTextFocusPosition = backTextFocusWorldRef.current;
    if (backTextFocusActive && backTextFocusPosition) {
      wasFocusActiveRef.current = true;
      focusTarget.current.copy(backTextFocusPosition);
      focusPosition.current.copy(backTextFocusPosition).add(backTextFocusOffset);
      camera.position.lerp(focusPosition.current, 0.2);
      controls.target.lerp(focusTarget.current, 0.2);
      camera.fov = THREE.MathUtils.lerp(camera.fov, 20, 0.2);
      if (Math.abs(camera.fov - lastFovRef.current) > 0.001) {
        camera.updateProjectionMatrix();
        lastFovRef.current = camera.fov;
      }
      controls.update();
      return;
    }

    const stampPinPosition = stampPinWorldRef.current;
    if (stampFocusActive && stampPinPosition) {
      wasFocusActiveRef.current = true;
      focusTarget.current.copy(stampPinPosition);
      focusPosition.current.copy(stampPinPosition).add(stampFocusOffset);
      camera.position.lerp(focusPosition.current, 0.24);
      controls.target.lerp(focusTarget.current, 0.24);
      camera.fov = THREE.MathUtils.lerp(camera.fov, 18, 0.24);
      if (Math.abs(camera.fov - lastFovRef.current) > 0.001) {
        camera.updateProjectionMatrix();
        lastFovRef.current = camera.fov;
      }
      controls.update();
      return;
    }

    if (wasFocusActiveRef.current) {
      wasFocusActiveRef.current = false;
      returnFramesRef.current = 18;
    }

    if (returnFramesRef.current > 0) {
      focusTarget.current.copy(defaultTarget);
      focusPosition.current.copy(defaultPosition);
      camera.position.lerp(focusPosition.current, 0.2);
      controls.target.lerp(focusTarget.current, 0.2);
      camera.fov = THREE.MathUtils.lerp(camera.fov, 33, 0.2);
      if (Math.abs(camera.fov - lastFovRef.current) > 0.001) {
        camera.updateProjectionMatrix();
        lastFovRef.current = camera.fov;
      }
      controls.update();
      returnFramesRef.current -= 1;
      return;
    }
  });

  return null;
};

const TshirtLab = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const stampPinWorldRef = useRef<THREE.Vector3 | null>(null);
  const backTextFocusWorldRef = useRef<THREE.Vector3 | null>(null);
  const stampPinFacingRef = useRef(false);
  const stampPinAnchorRef = useRef<HTMLButtonElement | null>(null);
  const stampRailRef = useRef<HTMLDivElement | null>(null);
  const quickBackTextInputRef = useRef<HTMLInputElement | null>(null);
  const previousStepRef = useRef(0);
  const hasRestoredSessionRef = useRef(false);
  const hasSkippedInitialPersistRef = useRef(false);
  const suppressStampClickUntilRef = useRef(0);
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0].value);
  const [stampColor, setStampColor] = useState(STAMP_COLORS[1].value);
  const [backTextColor, setBackTextColor] = useState(STAMP_COLORS[1].value);
  const [stampId, setStampId] = useState<StampId>(DEFAULT_STAMP_ID);
  const [shirtModelId, setShirtModelId] = useState<ShirtModelId>('regular');
  const [shirtSizeId, setShirtSizeId] = useState<ShirtSizeId>('M');
  const [giftWrapEnabled, setGiftWrapEnabled] = useState(false);
  const [backTextEnabled, setBackTextEnabled] = useState(false);
  const [backText, setBackText] = useState('');
  const [backTextFontId, setBackTextFontId] = useState<BackTextFontId>('bebas');
  const [backTextFontRefreshKey, setBackTextFontRefreshKey] = useState(0);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [activeStep, setActiveStep] = useState(0);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderPlacedAt, setOrderPlacedAt] = useState<string | null>(null);
  const [modelState, setModelState] = useState<{ status: 'loading' | 'ready' | 'error'; message?: string }>({
    status: 'loading',
  });
  const [viewerVisualState, setViewerVisualState] = useState<ViewerVisualState>({ status: 'idle', message: '' });
  const hasMountedColorStateRef = useRef(false);
  const [stampFocusActive, setStampFocusActive] = useState(false);
  const [stampHoverActive, setStampHoverActive] = useState(false);
  const [pinUiHoverActive, setPinUiHoverActive] = useState(false);
  const [quickBackTextEditorOpen, setQuickBackTextEditorOpen] = useState(false);

  const selectedModel = useMemo(() => SHIRT_MODELS.find((item) => item.id === shirtModelId) ?? SHIRT_MODELS[0], [shirtModelId]);
  const selectedSize = useMemo(() => SHIRT_SIZES.find((item) => item.id === shirtSizeId) ?? SHIRT_SIZES[2], [shirtSizeId]);
  const selectedStamp = useMemo(() => STAMP_OPTIONS.find((item) => item.id === stampId) ?? STAMP_OPTIONS[0], [stampId]);
  const selectedStampTextureUrl = useMemo(() => selectedStamp.textureUrl ?? null, [selectedStamp.textureUrl]);
  const useVerticalStamp = useMemo(() => isVerticalStampId(selectedStamp.id), [selectedStamp.id]);
  const stampColorCustomizable = useMemo(() => isStampColorCustomizable(selectedStamp.id), [selectedStamp.id]);
  const selectedStampColorLabel = useMemo(
    () => (stampColorCustomizable ? STAMP_COLORS.find((item) => item.value === stampColor)?.label ?? 'Custom' : 'Cores originais'),
    [stampColor, stampColorCustomizable]
  );
  const selectedBackTextFont = useMemo(
    () => BACK_TEXT_FONT_OPTIONS.find((font) => font.id === backTextFontId) ?? BACK_TEXT_FONT_OPTIONS[0],
    [backTextFontId]
  );
  const cleanedBackText = useMemo(() => backText.trim(), [backText]);

  const money = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    []
  );

  const shirtUnitPrice = useMemo(
    () => selectedModel.basePrice + selectedSize.priceDelta + (stampId === 'none' ? 0 : 14),
    [selectedModel.basePrice, selectedSize.priceDelta, stampId]
  );

  const orderLines = useMemo(
    () => {
      const baseLines = [
        {
          id: 'shirt-main',
          name: `Camiseta ${selectedModel.label}`,
          meta: `Tam ${selectedSize.label} • ${selectedStamp.id === 'none' ? 'Sem estampa' : `${selectedStamp.label} / ${selectedStampColorLabel}`}`,
          quantity: 1,
          unitPrice: shirtUnitPrice,
        },
      ];

      if (giftWrapEnabled) {
        baseLines.push({
          id: 'gift-wrap',
          name: 'Marcar para Presente',
          meta: 'Embalagem especial + cartão',
          quantity: 1,
          unitPrice: GIFT_WRAP_PRICE,
        });
      }

      if (backTextEnabled && cleanedBackText.length > 0) {
        baseLines.push({
          id: 'back-text',
          name: 'Texto Personalizado (Costas)',
          meta: `"${cleanedBackText}"`,
          quantity: 1,
          unitPrice: BACK_TEXT_EXTRA_PRICE,
        });
      }

      return baseLines;
    },
    [
      selectedModel.label,
      selectedSize.label,
      selectedStamp.id,
      selectedStamp.label,
      selectedStampColorLabel,
      shirtUnitPrice,
      giftWrapEnabled,
      backTextEnabled,
      cleanedBackText,
    ]
  );

  const itemsTotal = useMemo(
    () => orderLines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [orderLines]
  );
  const shipping = useMemo(() => (itemsTotal > 0 ? 18 : 0), [itemsTotal]);
  const grandTotal = useMemo(() => itemsTotal + shipping, [itemsTotal, shipping]);
  const extraCount = useMemo(
    () => (giftWrapEnabled ? 1 : 0) + (backTextEnabled && cleanedBackText.length > 0 ? 1 : 0),
    [giftWrapEnabled, backTextEnabled, cleanedBackText]
  );

  const checkoutReady = useMemo(
    () => checkoutName.trim().length > 2 && checkoutEmail.includes('@') && checkoutAddress.trim().length > 6,
    [checkoutName, checkoutEmail, checkoutAddress]
  );

  const canGoNext = useMemo(() => {
    if (activeStep === 0) return modelState.status === 'ready';
    if (activeStep === 1) return !backTextEnabled || cleanedBackText.length > 0;
    if (activeStep === 2) return checkoutReady;
    if (activeStep === 3) return paymentMethod !== null;
    return true;
  }, [activeStep, modelState.status, checkoutReady, paymentMethod, backTextEnabled, cleanedBackText]);

  const handleBackTextChange = (value: string) => {
    const normalized = normalizeBackTextInput(value);
    setBackText(normalized);
  };

  const handleOpenQuickBackTextEditor = () => {
    setBackTextEnabled(true);
    setStampFocusActive(false);
    setStampHoverActive(false);
    setPinUiHoverActive(false);
    setPreviewSide('back');
    setQuickBackTextEditorOpen(true);
  };

  const handleConfirmQuickBackTextEditor = () => {
    setQuickBackTextEditorOpen(false);
    setPreviewSide('front');
  };

  const handleNextStep = () => {
    if (!canGoNext) return;
    if (activeStep === 3) {
      const serial = Math.random().toString(36).slice(2, 8).toUpperCase();
      setOrderNumber(`TS-${serial}`);
      setOrderPlacedAt(new Date().toLocaleString('pt-BR'));
      setActiveStep(4);
      return;
    }
    setActiveStep((current) => Math.min(current + 1, 4));
  };

  const handlePreviousStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleResetFlow = () => {
    setActiveStep(0);
    setGiftWrapEnabled(false);
    setBackTextEnabled(false);
    setBackText('');
    setBackTextColor(STAMP_COLORS[1].value);
    setQuickBackTextEditorOpen(false);
    setPreviewSide('front');
    setStampFocusActive(false);
    stampPinWorldRef.current = null;
    backTextFocusWorldRef.current = null;
    setCheckoutName('');
    setCheckoutEmail('');
    setCheckoutAddress('');
    setPaymentMethod(null);
    setOrderNumber(null);
    setOrderPlacedAt(null);
  };

  useEffect(() => {
    if (hasRestoredSessionRef.current) return;
    hasRestoredSessionRef.current = true;

    try {
      const raw = window.localStorage.getItem(TSHIRT_LAB_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SavedTshirtLabConfig> | null;
      if (!parsed || parsed.version !== 1) return;

      const validShirtColor = SHIRT_COLORS.some((color) => color.value === parsed.shirtColor);
      if (validShirtColor && parsed.shirtColor) setShirtColor(parsed.shirtColor);

      const validStampColor = STAMP_COLORS.some((color) => color.value === parsed.stampColor);
      if (validStampColor && parsed.stampColor) setStampColor(parsed.stampColor);

      const validBackTextColor = STAMP_COLORS.some((color) => color.value === parsed.backTextColor);
      if (validBackTextColor && parsed.backTextColor) setBackTextColor(parsed.backTextColor);

      const validStampId = STAMP_OPTIONS.some((stamp) => stamp.id === parsed.stampId);
      if (validStampId && parsed.stampId) setStampId(parsed.stampId);

      const validModelId = SHIRT_MODELS.some((model) => model.id === parsed.shirtModelId);
      if (validModelId && parsed.shirtModelId) setShirtModelId(parsed.shirtModelId);

      const validSizeId = SHIRT_SIZES.some((size) => size.id === parsed.shirtSizeId);
      if (validSizeId && parsed.shirtSizeId) setShirtSizeId(parsed.shirtSizeId);

      if (typeof parsed.giftWrapEnabled === 'boolean') setGiftWrapEnabled(parsed.giftWrapEnabled);
      if (typeof parsed.backTextEnabled === 'boolean') setBackTextEnabled(parsed.backTextEnabled);

      if (typeof parsed.backText === 'string') setBackText(normalizeBackTextInput(parsed.backText));

      const validFontId = BACK_TEXT_FONT_OPTIONS.some((font) => font.id === parsed.backTextFontId);
      if (validFontId && parsed.backTextFontId) setBackTextFontId(parsed.backTextFontId);
    } catch {
      // Ignora sessão inválida e mantém defaults.
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredSessionRef.current) return;
    if (!hasSkippedInitialPersistRef.current) {
      hasSkippedInitialPersistRef.current = true;
      return;
    }
    try {
      const payload: SavedTshirtLabConfig = {
        version: 1,
        shirtColor,
        stampColor,
        backTextColor,
        stampId,
        shirtModelId,
        shirtSizeId,
        giftWrapEnabled,
        backTextEnabled,
        backText: normalizeBackTextInput(backText),
        backTextFontId,
      };
      window.localStorage.setItem(TSHIRT_LAB_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Sem quota/permissão de storage: segue sem persistência.
    }
  }, [
    shirtColor,
    stampColor,
    backTextColor,
    stampId,
    shirtModelId,
    shirtSizeId,
    giftWrapEnabled,
    backTextEnabled,
    backText,
    backTextFontId,
  ]);

  useEffect(() => {
    if (quickBackTextEditorOpen) {
      setPreviewSide('back');
      previousStepRef.current = activeStep;
      return;
    }

    const previousStep = previousStepRef.current;
    previousStepRef.current = activeStep;

    if (activeStep !== 1) {
      setPreviewSide('front');
      return;
    }
    if (!backTextEnabled) {
      setPreviewSide('front');
      return;
    }
    if (previousStep !== 1) {
      setPreviewSide('back');
    }
  }, [activeStep, backTextEnabled, quickBackTextEditorOpen]);

  useEffect(() => {
    if (!quickBackTextEditorOpen) return;
    const timeout = window.setTimeout(() => {
      quickBackTextInputRef.current?.focus();
      quickBackTextInputRef.current?.select();
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [quickBackTextEditorOpen]);

  useEffect(() => {
    if (backTextEnabled) return;
    setQuickBackTextEditorOpen(false);
  }, [backTextEnabled]);

  useEffect(() => {
    if (previewSide === 'back' || stampId === 'none') {
      setStampFocusActive(false);
      setStampHoverActive(false);
      setPinUiHoverActive(false);
      stampPinWorldRef.current = null;
      stampPinFacingRef.current = false;
    }
  }, [previewSide, stampId]);

  const stampPinVisible =
    modelState.status === 'ready' &&
    previewSide === 'front' &&
    stampId !== 'none' &&
    (stampHoverActive || pinUiHoverActive || stampFocusActive);

  useEffect(() => {
    const existing = document.getElementById(GOOGLE_FONTS_LINK_ID);
    if (!existing) {
      const link = document.createElement('link');
      link.id = GOOGLE_FONTS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_STYLESHEET_URL;
      document.head.appendChild(link);
    }

    let cancelled = false;
    const loadFonts = async () => {
      if (!('fonts' in document)) {
        setBackTextFontRefreshKey((current) => current + 1);
        return;
      }

      const loads = BACK_TEXT_FONT_OPTIONS.map((font) => document.fonts.load(`${font.weight} 100px "${font.family}"`));
      await Promise.allSettled(loads);
      if (!cancelled) setBackTextFontRefreshKey((current) => current + 1);
    };

    void loadFonts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (modelState.status !== 'ready') return;
    if (!hasMountedColorStateRef.current) {
      hasMountedColorStateRef.current = true;
      return;
    }

    setViewerVisualState((current) =>
      current.status === 'loading' ? current : { status: 'applying', message: 'aplicando cores...' }
    );

    const timeout = window.setTimeout(() => {
      setViewerVisualState((current) =>
        current.status === 'applying' ? { status: 'idle', message: '' } : current
      );
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shirtColor, stampColor, modelState.status]);

  useEffect(() => {
    const rail = stampRailRef.current;
    if (!rail) return;

    let frameId = 0;
    let isPointerDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let targetScrollLeft = rail.scrollLeft;

    const clampScroll = (value: number) =>
      THREE.MathUtils.clamp(value, 0, Math.max(0, rail.scrollWidth - rail.clientWidth));

    const animate = () => {
      if (!isDragging) {
        rail.scrollLeft = THREE.MathUtils.lerp(rail.scrollLeft, targetScrollLeft, 0.16);
      }
      frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);

    const onMouseMove = (event: MouseEvent) => {
      if (isPointerDown || !rail.matches(':hover')) return;
      const rect = rail.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const easedRatio = THREE.MathUtils.smoothstep(ratio, 0, 1);
      targetScrollLeft = clampScroll((rail.scrollWidth - rail.clientWidth) * easedRatio);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isPointerDown = true;
      isDragging = false;
      dragStartX = event.clientX;
      dragStartScrollLeft = rail.scrollLeft;
      rail.classList.add('cursor-grabbing');
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = event.clientX - dragStartX;
      if (!isDragging && Math.abs(dx) > 4) isDragging = true;
      if (!isDragging) return;
      const nextScroll = clampScroll(dragStartScrollLeft - dx);
      rail.scrollLeft = nextScroll;
      targetScrollLeft = nextScroll;
    };

    const endDrag = () => {
      if (!isPointerDown) return;
      if (isDragging) suppressStampClickUntilRef.current = Date.now() + 140;
      isPointerDown = false;
      isDragging = false;
      rail.classList.remove('cursor-grabbing');
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const next = clampScroll(rail.scrollLeft + event.deltaY * 0.7);
      rail.scrollLeft = next;
      targetScrollLeft = next;
    };

    rail.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('pointercancel', endDrag, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rail.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      rail.classList.remove('cursor-grabbing');
      rail.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('mousemove', onMouseMove);
      rail.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <section className="h-[100dvh] w-full overflow-hidden bg-[#06070a] px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-2 sm:gap-3">
        <div className="grid gap-3 md:grid-cols-[minmax(240px,auto)_1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] px-5 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.34em] text-white/38">lab 007</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white/92 sm:text-2xl">T-Shirt 3D Store</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] px-5 py-4">
            <p className="text-sm leading-relaxed text-white/58">Customização da camisa no viewer e jornada de compra em etapas.</p>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0c11] shadow-[0_24px_72px_rgba(0,0,0,0.6)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_390px] md:grid-rows-1">
          <div className="flex min-h-0 flex-col">
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#05070c_0%,#090d15_56%,#0d1119_100%)]" />
              <div className="absolute inset-0 opacity-45 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(120,154,220,0.16)_0%,rgba(30,43,72,0.08)_38%,transparent_72%)]" />
              <Canvas shadows camera={{ position: [0, 0.82, 5.2], fov: 33 }} className="!absolute !inset-0">
                <ambientLight intensity={0.44} />
                <hemisphereLight args={['#d9e3f7', '#131826', 0.24]} />
                <directionalLight
                  position={[0.35, 4.2, 2.45]}
                  intensity={0.78}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                  shadow-bias={-0.0005}
                  shadow-normalBias={0.035}
                  shadow-radius={4}
                  shadow-camera-near={0.5}
                  shadow-camera-far={14}
                  shadow-camera-left={-3.4}
                  shadow-camera-right={3.4}
                  shadow-camera-top={3.2}
                  shadow-camera-bottom={-3.2}
                />
                <spotLight position={[0.2, 2.4, 2.65]} intensity={0.18} angle={0.58} penumbra={0.9} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.03, 0]} receiveShadow>
                  <planeGeometry args={[8, 8]} />
                  <shadowMaterial transparent opacity={0.08} />
                </mesh>
                <TShirtModel
                  shirtColor={shirtColor}
                  stampTextureId={stampId}
                  stampTextureUrl={selectedStampTextureUrl}
                  useVerticalStamp={useVerticalStamp}
                  stampColor={stampColor}
                  backText={cleanedBackText}
                  backTextColor={backTextColor}
                  backTextEnabled={backTextEnabled}
                  backTextFontFamily={selectedBackTextFont.family}
                  backTextFontWeight={selectedBackTextFont.weight}
                  backTextFontRefreshKey={backTextFontRefreshKey}
                  showStampPin={previewSide === 'front' && stampId !== 'none'}
                  stampFocusActive={stampFocusActive}
                  previewSide={previewSide}
                  modelScale={selectedModel.scale}
                  stampPinWorldRef={stampPinWorldRef}
                  backTextFocusWorldRef={backTextFocusWorldRef}
                  stampPinFacingRef={stampPinFacingRef}
                  onStampHoverChange={setStampHoverActive}
                  onLoadStateChange={setModelState}
                  onVisualStateChange={setViewerVisualState}
                />
                <StampPinProjector
                  stampPinWorldRef={stampPinWorldRef}
                  stampPinFacingRef={stampPinFacingRef}
                  pinAnchorRef={stampPinAnchorRef}
                  showPin={stampPinVisible}
                />
                <CameraDirector
                  controlsRef={controlsRef}
                  stampPinWorldRef={stampPinWorldRef}
                  backTextFocusWorldRef={backTextFocusWorldRef}
                  stampFocusActive={stampFocusActive}
                  backTextFocusActive={quickBackTextEditorOpen}
                />
                <ContactShadows position={[0, -1.01, 0]} scale={3.8} blur={3.6} opacity={0.16} far={2.25} />
                <Environment preset="studio" />
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  minDistance={3.4}
                  maxDistance={6.6}
                  minPolarAngle={Math.PI / 3.2}
                  maxPolarAngle={Math.PI / 1.9}
                />
              </Canvas>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_54%,rgba(0,0,0,0.28)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-[18]">
                <button
                  ref={stampPinAnchorRef}
                  type="button"
                  onClick={() => {
                    if (!stampPinWorldRef.current) return;
                    setStampFocusActive((current) => !current);
                    setPreviewSide('front');
                  }}
                  onMouseEnter={() => setPinUiHoverActive(true)}
                  onMouseLeave={() => setPinUiHoverActive(false)}
                  onFocus={() => setPinUiHoverActive(true)}
                  onBlur={() => setPinUiHoverActive(false)}
                  aria-label={stampFocusActive ? 'Voltar visao geral' : 'Detalhe da estampa'}
                  className="group pointer-events-auto absolute left-0 top-0 flex items-center gap-2 rounded-full border border-black/15 bg-white/93 px-2 py-1 opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-colors duration-150 hover:bg-white"
                  style={{ transform: 'translate(-100vw, -100vh)' }}
                >
                  <span className="relative h-4 w-4 rounded-full border-2 border-[#ff5b00] bg-black shadow-[0_0_0_2px_rgba(255,91,0,0.2)]">
                    <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5b00]" />
                  </span>
                  <span
                    className={`pointer-events-none whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.14em] text-black/80 transition-opacity ${
                      stampPinVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {stampFocusActive ? 'voltar' : 'detalhe'}
                  </span>
                </button>
              </div>

              <div className="absolute right-4 top-4 z-[19] flex flex-col items-end gap-2">
                {!quickBackTextEditorOpen ? (
                  <button
                    type="button"
                    onClick={handleOpenQuickBackTextEditor}
                    disabled={modelState.status !== 'ready'}
                    className="rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white/88 backdrop-blur transition-colors hover:border-white/60 hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    adicionar texto
                  </button>
                ) : (
                  <div className="w-[252px] rounded-2xl border border-white/15 bg-[#0b0f18]/93 p-3 shadow-[0_16px_34px_rgba(0,0,0,0.45)] backdrop-blur">
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/65">Texto nas costas</p>
                    <input
                      ref={quickBackTextInputRef}
                      value={backText}
                      onChange={(event) => handleBackTextChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleConfirmQuickBackTextEditor();
                        }
                      }}
                      placeholder="Ex: TEAM MARUK"
                      maxLength={MAX_BACK_TEXT_CHARS}
                      className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/55"
                    />
                    <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">Cor do texto</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {STAMP_COLORS.map((color) => (
                        <button
                          key={`quick-back-text-color-${color.id}`}
                          type="button"
                          aria-label={color.label}
                          onClick={() => setBackTextColor(color.value)}
                          className={`h-5 w-5 rounded-full border ${
                            backTextColor === color.value ? 'border-white/85' : 'border-white/30 hover:border-white/60'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-white/55">
                      <span>{backText.length}/{MAX_BACK_TEXT_CHARS}</span>
                      <button
                        type="button"
                        onClick={handleConfirmQuickBackTextEditor}
                        className="rounded-md border border-emerald-300/55 bg-emerald-500/18 px-2.5 py-1 font-mono uppercase tracking-[0.1em] text-emerald-100 hover:bg-emerald-500/24"
                      >
                        ok
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {modelState.status !== 'ready' ? (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-8">
                  <div className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                    {modelState.status === 'loading' ? 'carregando modelo 3d...' : `erro no modelo: ${modelState.message ?? 'arquivo ausente'}`}
                  </div>
                </div>
              ) : null}

              {modelState.status === 'ready' && viewerVisualState.status !== 'idle' ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-8">
                  <div className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                    {viewerVisualState.message || 'atualizando visual...'}
                  </div>
                </div>
              ) : null}

            </div>

            <div className="border-t border-white/10 bg-[#090b10]/92 px-4 py-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/45">Cor da Camisa</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SHIRT_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={color.label}
                        onClick={() => setShirtColor(color.value)}
                        className={`h-7 w-7 rounded-full border ${shirtColor === color.value ? 'border-white/85' : 'border-white/20 hover:border-white/50'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className={`${stampId === 'none' || !stampColorCustomizable ? 'opacity-45' : 'opacity-100'}`}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/45">Cor da Estampa</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STAMP_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setStampColor(color.value)}
                        aria-label={color.label}
                        disabled={stampId === 'none' || !stampColorCustomizable}
                        className={`h-6 w-6 rounded-full border ${stampColor === color.value ? 'border-white/80' : 'border-white/25 hover:border-white/50'} disabled:cursor-not-allowed`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                  {stampId !== 'none' && !stampColorCustomizable ? (
                    <p className="mt-2 text-[10px] text-white/50">Estampa colorida fixa: usando cores originais.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <aside className="relative flex min-h-0 flex-col border-t border-white/10 bg-[#0d0f14] p-4 md:border-l md:border-t-0 md:p-6">
            <div className="grid grid-cols-5 gap-1.5">
              {CHECKOUT_STEPS.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-md px-1 py-2 text-center text-[9px] font-mono uppercase tracking-[0.08em] ${
                    index === activeStep
                      ? 'bg-white/14 text-white'
                      : index < activeStep
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-white/[0.03] text-white/35'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
              {activeStep === 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Modelo</p>
                    <div className="mt-2 space-y-2">
                      {SHIRT_MODELS.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setShirtModelId(model.id)}
                          className={`w-full rounded-xl border px-3 py-2.5 text-left ${
                            shirtModelId === model.id ? 'border-white/55 bg-white/10' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/90">{model.label}</span>
                            <span className="text-xs text-white/55">{money.format(model.basePrice)}</span>
                          </div>
                          <p className="mt-1 text-xs text-white/45">{model.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Tamanho</p>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {SHIRT_SIZES.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setShirtSizeId(size.id)}
                          className={`rounded-lg border py-2 text-xs font-mono ${
                            shirtSizeId === size.id ? 'border-white/60 bg-white/12 text-white' : 'border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
                    <p>Modelo: {selectedModel.label}</p>
                    <p className="mt-1">Tamanho: {selectedSize.label}</p>
                    <p className="mt-1">{selectedStamp.id === 'none' ? 'Sem estampa' : `Estampa: ${selectedStamp.label}`}</p>
                    <p className="mt-2 text-sm text-white">{money.format(shirtUnitPrice)}</p>
                  </div>
                </div>
              ) : null}

              {activeStep === 1 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Itens Extras</p>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-white/88">Texto Personalizado nas Costas</p>
                        <p className="mt-1 text-xs text-white/45">Ative, digite e visualize a camisa virando para as costas.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBackTextEnabled((current) => {
                            const next = !current;
                            setPreviewSide(next ? 'back' : 'front');
                            return next;
                          });
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.1em] ${
                          backTextEnabled
                            ? 'border-emerald-300/60 bg-emerald-500/18 text-emerald-100'
                            : 'border-white/20 text-white/75 hover:border-white/50'
                        }`}
                      >
                        {backTextEnabled ? 'ativo' : 'adicionar'}
                      </button>
                    </div>

                    {backTextEnabled ? (
                      <div className="mt-3">
                        <div className="mb-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewSide('back')}
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.08em] ${
                              previewSide === 'back' ? 'border-white/65 bg-white/12 text-white' : 'border-white/20 text-white/65'
                            }`}
                          >
                            ver costas
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewSide('front')}
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.08em] ${
                              previewSide === 'front' ? 'border-white/65 bg-white/12 text-white' : 'border-white/20 text-white/65'
                            }`}
                          >
                            ver frente
                          </button>
                        </div>
                        <input
                          value={backText}
                          onChange={(event) => handleBackTextChange(event.target.value)}
                          onFocus={() => setPreviewSide('back')}
                          placeholder="Ex: TEAM MARUK"
                          maxLength={MAX_BACK_TEXT_CHARS}
                          className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/45"
                        />
                        <div className="mt-2">
                          <p className="text-[11px] text-white/55">Fonte (Google)</p>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {BACK_TEXT_FONT_OPTIONS.map((font) => (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => setBackTextFontId(font.id)}
                                className={`rounded-lg border px-2 py-1.5 text-xs ${
                                  backTextFontId === font.id
                                    ? 'border-white/60 bg-white/12 text-white'
                                    : 'border-white/15 text-white/70 hover:border-white/40'
                                }`}
                                style={{ fontFamily: `"${font.family}", sans-serif` }}
                              >
                                {font.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-[11px] text-white/55">Cor do texto</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {STAMP_COLORS.map((color) => (
                              <button
                                key={`back-text-color-step-${color.id}`}
                                type="button"
                                aria-label={color.label}
                                onClick={() => setBackTextColor(color.value)}
                                className={`h-5 w-5 rounded-full border ${
                                  backTextColor === color.value ? 'border-white/85' : 'border-white/25 hover:border-white/50'
                                }`}
                                style={{ backgroundColor: color.value }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
                          <span>{backText.length}/{MAX_BACK_TEXT_CHARS} caracteres</span>
                          <span>+ {money.format(BACK_TEXT_EXTRA_PRICE)}</span>
                        </div>

                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-white/88">Marcar para Presente</p>
                        <p className="mt-1 text-xs text-white/45">Valor único, sem quantidade.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGiftWrapEnabled((current) => !current)}
                        className={`rounded-lg border px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.1em] ${
                          giftWrapEnabled
                            ? 'border-emerald-300/60 bg-emerald-500/18 text-emerald-100'
                            : 'border-white/20 text-white/75 hover:border-white/50'
                        }`}
                      >
                        {giftWrapEnabled ? 'marcado' : 'marcar'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-white/60">+ {money.format(GIFT_WRAP_PRICE)}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/55">
                    Extras selecionados: {extraCount}
                  </div>
                </div>
              ) : null}

              {activeStep === 2 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Checkout</p>
                  <input
                    value={checkoutName}
                    onChange={(event) => setCheckoutName(event.target.value)}
                    placeholder="Nome completo"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/45"
                  />
                  <input
                    value={checkoutEmail}
                    onChange={(event) => setCheckoutEmail(event.target.value)}
                    placeholder="E-mail"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/45"
                  />
                  <textarea
                    value={checkoutAddress}
                    onChange={(event) => setCheckoutAddress(event.target.value)}
                    placeholder="Endereço de entrega"
                    rows={3}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/45"
                  />

                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    {orderLines.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-white/70">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{money.format(item.quantity * item.unitPrice)}</span>
                      </div>
                    ))}
                    <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between text-sm text-white">
                      <span>Total parcial</span>
                      <strong>{money.format(itemsTotal)}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 3 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Pagamento</p>
                  {(
                    [
                      { id: 'pix', label: 'Pix', desc: 'Aprovação rápida' },
                      { id: 'card', label: 'Cartão', desc: 'Crédito em até 12x' },
                      { id: 'boleto', label: 'Boleto', desc: 'Compensa em até 2 dias' },
                    ] as const
                  ).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left ${
                        paymentMethod === method.id ? 'border-emerald-300/60 bg-emerald-500/14' : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      <p className="text-sm text-white/90">{method.label}</p>
                      <p className="mt-1 text-xs text-white/45">{method.desc}</p>
                    </button>
                  ))}

                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
                    <div className="flex items-center justify-between text-white/65">
                      <span>Subtotal</span>
                      <span>{money.format(itemsTotal)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-white/65">
                      <span>Frete</span>
                      <span>{money.format(shipping)}</span>
                    </div>
                    <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between text-white">
                      <span>Total</span>
                      <strong>{money.format(grandTotal)}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 4 ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/14 p-3">
                    <p className="text-xs font-mono uppercase tracking-[0.18em] text-emerald-200/80">pedido concluído</p>
                    <p className="mt-2 text-sm text-white/90">Seu pedido foi finalizado com sucesso.</p>
                    <p className="mt-1 text-xs text-white/55">#{orderNumber ?? 'TS-XXXXXX'} • {orderPlacedAt ?? 'agora'}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    {orderLines.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-white/70">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{money.format(item.quantity * item.unitPrice)}</span>
                      </div>
                    ))}
                    <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between text-white">
                      <span>Total pago</span>
                      <strong>{money.format(grandTotal)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetFlow}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.14em] text-white/85 hover:border-white/60"
                  >
                    iniciar novo pedido
                  </button>
                </div>
              ) : null}
            </div>

            {activeStep < 4 ? (
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={activeStep === 0}
                  className="rounded-lg border border-white/20 px-4 py-2 text-xs font-mono uppercase tracking-[0.12em] text-white/75 hover:border-white/45 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  voltar
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canGoNext}
                  className="rounded-lg border border-emerald-300/40 bg-emerald-500/16 px-4 py-2 text-xs font-mono uppercase tracking-[0.12em] text-emerald-100 hover:border-emerald-200/80 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {activeStep === 3 ? 'finalizar pedido' : 'próximo passo'}
                </button>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/10 bg-[#0d0f14]/92 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45">Estampas</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/35">mouse + arrastar</p>
          </div>
          <div
            ref={stampRailRef}
            className="cursor-grab select-none overflow-x-auto overflow-y-hidden pb-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex min-w-max gap-3 pr-3">
              {STAMP_OPTIONS.map((stamp) => (
                <button
                  key={stamp.id}
                  type="button"
                  onClick={() => {
                    if (Date.now() < suppressStampClickUntilRef.current) return;
                    setStampId(stamp.id);
                  }}
                  title={stamp.label}
                  className={`w-32 shrink-0 rounded-xl border p-2 transition sm:w-36 md:w-40 ${
                    stampId === stamp.id
                      ? 'border-white/75 bg-white/12'
                      : 'border-white/20 bg-white/[0.03] hover:border-white/50'
                  }`}
                >
                  {stamp.textureUrl ? (
                    <img
                      src={stamp.thumbnailUrl ?? stamp.textureUrl}
                      alt={stamp.label}
                      loading="lazy"
                      className="h-20 w-full rounded-lg bg-black/25 object-contain p-1 sm:h-24"
                    />
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-mono uppercase tracking-[0.12em] text-white/60 sm:h-24">
                      sem
                    </div>
                  )}
                  <p className="mt-1 truncate text-[10px] font-mono uppercase tracking-[0.08em] text-white/75">{stamp.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TshirtLab;
