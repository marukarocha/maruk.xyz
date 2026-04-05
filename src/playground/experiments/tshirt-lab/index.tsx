import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import shirtModelUrl from './3d/shirt.gltf?url';
import shirtBinUrl from './3d/shirt.bin?url';
import sceneBinUrl from './3d/scene.bin?url';
import gltfDropTextureUrl from './3d/01_drop.png?url';

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
};

const SHIRT_COLORS: ColorOption[] = [
  { id: 'graphite', label: 'Graphite', value: '#30343b' },
  { id: 'chalk', label: 'Chalk', value: '#f2efe9' },
  { id: 'sand', label: 'Sand', value: '#cfb89d' },
  { id: 'cobalt', label: 'Cobalt', value: '#27438f' },
  { id: 'forest', label: 'Forest', value: '#285245' },
  { id: 'ember', label: 'Ember', value: '#8b2e2f' },
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
  return /(?:_|-)vert$/i.test(stampTextureId.trim());
}

function resolveStampUvTransform(stampTextureId: string): StampUvTransform {
  const isVerticalStamp = isVerticalStampId(stampTextureId);
  if (isVerticalStamp) {
    // Estampa vertical: espelha no eixo X e corrige o "achatamento" no eixo Y.
    const verticalRepeatY = 0.78;
    return {
      repeatX: -1,
      repeatY: -verticalRepeatY,
      offsetX: 1,
      offsetY: 0.5 + verticalRepeatY * 0.5,
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

const CHECKOUT_STEPS = ['Produto', 'Extras', 'Checkout', 'Pagamento', 'Finalizacao'] as const;
const MAX_BACK_TEXT_CHARS = 16;
const BACK_TEXT_EXTRA_PRICE = 22;
const GIFT_WRAP_PRICE = 18;
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
  backTextEnabled: boolean;
  backTextFontFamily: string;
  backTextFontWeight: number;
  backTextFontRefreshKey: number;
  showStampPin: boolean;
  stampFocusActive: boolean;
  previewSide: 'front' | 'back';
  modelScale: [number, number, number];
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
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
    return 'Arquivos do modelo ausentes/corrompidos em src/playground/experiments/tshirt-lab/3d/ (shirt.gltf + .bin).';
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
  fittedBox.getSize(new THREE.Vector3());
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
    const outwardDirection = worldPosition.clone().sub(modelCenter).normalize();
    if (markerNormal.dot(outwardDirection) < 0) markerNormal.multiplyScalar(-1);

    const lifted = worldPosition.clone().addScaledVector(markerNormal, 0.08);
    const localPosition = root.worldToLocal(lifted);
    return {
      position: [localPosition.x, localPosition.y, localPosition.z],
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
  backTextEnabled,
  backTextFontFamily,
  backTextFontWeight,
  backTextFontRefreshKey,
  showStampPin,
  stampFocusActive,
  previewSide,
  modelScale,
  stampPinWorldRef,
  onLoadStateChange,
  onVisualStateChange,
}: TShirtModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const stampPinRef = useRef<THREE.Group>(null);
  const stampWorldPositionRef = useRef(new THREE.Vector3());
  const [loadedShirt, setLoadedShirt] = useState<LoadedShirtModel | null>(null);
  const [stampTexture, setStampTexture] = useState<THREE.Texture | null>(null);
  const [backTextTexture, setBackTextTexture] = useState<THREE.Texture | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const baseRotationY = stampFocusActive ? 0 : previewSide === 'back' ? Math.PI : 0;
    const targetRotationY = stampFocusActive
      ? baseRotationY
      : baseRotationY + state.pointer.x * 0.24 + Math.sin(state.clock.elapsedTime * 0.35) * 0.05;
    const targetRotationX = stampFocusActive ? 0 : state.pointer.y * 0.12;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);

    if (showStampPin && stampPinRef.current) {
      const worldPosition = stampPinRef.current.getWorldPosition(stampWorldPositionRef.current);
      if (!stampPinWorldRef.current) {
        stampPinWorldRef.current = worldPosition.clone();
      } else {
        stampPinWorldRef.current.copy(worldPosition);
      }
    } else {
      stampPinWorldRef.current = null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.endsWith('shirt.bin')) return shirtBinUrl;
      if (url.endsWith('scene.bin')) return sceneBinUrl;
      if (url.endsWith('01_drop.png')) return gltfDropTextureUrl;
      return url;
    });

    const loader = new GLTFLoader(manager);
    onLoadStateChange({ status: 'loading' });

    const load = async () => {
      try {
        const [gltfResponse, textureResponse] = await Promise.all([
          fetch(shirtModelUrl),
          fetch(gltfDropTextureUrl),
        ]);

        if (!gltfResponse.ok) {
          throw new Error(`Nao foi possivel ler shirt.gltf (${gltfResponse.status}).`);
        }
        if (!textureResponse.ok) throw new Error('Textura de estampa nao encontrada.');

        type GltfBufferDef = { uri?: string; byteLength?: number };
        type GltfMeta = { buffers?: GltfBufferDef[] };
        const gltfMeta = (await gltfResponse.json()) as GltfMeta;
        const bufferDef = gltfMeta.buffers?.[0];

        if (bufferDef?.uri) {
          const resolvedBinUrl = bufferDef.uri.endsWith('scene.bin') ? sceneBinUrl : shirtBinUrl;
          const binResponse = await fetch(resolvedBinUrl);
          if (!binResponse.ok) throw new Error(`Arquivo ${bufferDef.uri} nao encontrado.`);

          const bufferData = await binResponse.arrayBuffer();
          if (bufferDef.byteLength && bufferData.byteLength < bufferDef.byteLength) {
            throw new Error(`Arquivo ${bufferDef.uri} invalido: esperado ${bufferDef.byteLength} bytes, recebido ${bufferData.byteLength}.`);
          }
        }
      } catch (error) {
        if (cancelled) return;
        setLoadedShirt(null);
        onLoadStateChange({ status: 'error', message: formatModelLoadError(error) });
        return;
      }

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

    void load();

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
      ? buildBackTextTexture(backText, stampColor, backTextFontFamily, backTextFontWeight)
      : null;
    setBackTextTexture(nextTexture);
    return () => {
      nextTexture?.dispose();
    };
  }, [backText, backTextEnabled, stampColor, backTextFontFamily, backTextFontWeight, backTextFontRefreshKey]);

  useEffect(() => {
    if (!loadedShirt) return;

    const hasStampTexture = Boolean(stampTexture);
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
          const mapChanged = targetMaterial.map !== stampTexture;
          targetMaterial.transparent = true;
          targetMaterial.alphaTest = 0.35;
          targetMaterial.side = THREE.DoubleSide;
          targetMaterial.depthWrite = false;
          targetMaterial.polygonOffset = true;
          targetMaterial.polygonOffsetFactor = -1;
          targetMaterial.polygonOffsetUnits = -1;
          targetMaterial.map = stampTexture;
          targetMaterial.color.set(stampColor);
          targetMaterial.opacity = hasStampTexture ? 1 : 0;
          if (mapChanged) targetMaterial.needsUpdate = true;
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
          targetMaterial.color.set(shirtColor);
        }
      });
    });
  }, [loadedShirt, shirtColor, stampTexture, stampColor, backTextTexture, backTextEnabled, previewSide, useVerticalStamp]);

  return (
    <group ref={groupRef} position={[0, -0.08, 0]} scale={modelScale}>
      {loadedShirt ? (
        <primitive object={loadedShirt.root}>
          {loadedShirt.stampPinAnchor && showStampPin ? (
            <group ref={stampPinRef} position={loadedShirt.stampPinAnchor.position} />
          ) : null}
        </primitive>
      ) : null}
    </group>
  );
};

type StampPinProjectorProps = {
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  pinAnchorRef: React.MutableRefObject<HTMLSpanElement | null>;
  pinLineRef: React.MutableRefObject<HTMLSpanElement | null>;
  pinLineEndRef: React.MutableRefObject<HTMLSpanElement | null>;
  pinButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  showPin: boolean;
};

const StampPinProjector = ({ stampPinWorldRef, pinAnchorRef, pinLineRef, pinLineEndRef, pinButtonRef, showPin }: StampPinProjectorProps) => {
  const { camera, size } = useThree();
  const projectedRef = useRef(new THREE.Vector3());
  const buttonPointRef = useRef(new THREE.Vector2());
  const anchorPointRef = useRef(new THREE.Vector2());
  const lineRevealRef = useRef(0);
  const wasVisibleRef = useRef(false);

  useFrame(() => {
    const pinAnchor = pinAnchorRef.current;
    const pinLine = pinLineRef.current;
    const pinLineEnd = pinLineEndRef.current;
    const pinButton = pinButtonRef.current;
    const worldPoint = stampPinWorldRef.current;
    if (!pinButton || !pinAnchor || !pinLine || !pinLineEnd || !showPin || !(camera instanceof THREE.PerspectiveCamera) || !worldPoint) {
      lineRevealRef.current = 0;
      wasVisibleRef.current = false;
      if (pinAnchor) {
        pinAnchor.style.opacity = '0';
      }
      if (pinLine) {
        pinLine.style.opacity = '0';
      }
      if (pinLineEnd) {
        pinLineEnd.style.opacity = '0';
      }
      if (pinButton) {
        pinButton.style.opacity = '0';
        pinButton.style.pointerEvents = 'none';
      }
      return;
    }

    projectedRef.current.copy(worldPoint).project(camera);
    const anchorX = ((projectedRef.current.x + 1) * 0.5) * size.width;
    const anchorY = ((-projectedRef.current.y + 1) * 0.5) * size.height;
    const inDepth = projectedRef.current.z < 1 && projectedRef.current.z > -1;
    const inBounds = anchorX >= 0 && anchorX <= size.width && anchorY >= 0 && anchorY <= size.height;
    const visible = inDepth && inBounds;
    if (!visible) {
      lineRevealRef.current = 0;
      wasVisibleRef.current = false;
      pinAnchor.style.opacity = '0';
      pinLine.style.opacity = '0';
      pinLineEnd.style.opacity = '0';
      pinButton.style.opacity = '0';
      pinButton.style.pointerEvents = 'none';
      return;
    }

    if (!wasVisibleRef.current) {
      lineRevealRef.current = 0;
    }
    wasVisibleRef.current = true;
    lineRevealRef.current = THREE.MathUtils.lerp(lineRevealRef.current, 1, 0.28);

    pinAnchor.style.opacity = '1';
    pinAnchor.style.transform = `translate(${anchorX}px, ${anchorY}px) translate(-50%, -50%)`;

    const side = anchorX > size.width * 0.58 ? -1 : 1;
    const targetX = THREE.MathUtils.clamp(anchorX + side * 148, 72, size.width - 72);
    const targetY = THREE.MathUtils.clamp(anchorY + 92, 52, size.height - 52);
    anchorPointRef.current.set(anchorX, anchorY);
    buttonPointRef.current.set(targetX, targetY);

    const dx = buttonPointRef.current.x - anchorPointRef.current.x;
    const dy = buttonPointRef.current.y - anchorPointRef.current.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const revealedLength = length * lineRevealRef.current;

    pinLine.style.opacity = '1';
    pinLine.style.width = `${revealedLength}px`;
    pinLine.style.transform = `translate(${anchorX}px, ${anchorY}px) rotate(${angle}rad)`;

    const endX = anchorX + Math.cos(angle) * revealedLength;
    const endY = anchorY + Math.sin(angle) * revealedLength;
    pinLineEnd.style.opacity = '1';
    pinLineEnd.style.transform = `translate(${endX}px, ${endY}px) translate(-50%, -50%)`;

    const buttonOpacity = THREE.MathUtils.clamp((lineRevealRef.current - 0.84) / 0.16, 0, 1);
    pinButton.style.opacity = `${buttonOpacity}`;
    pinButton.style.pointerEvents = buttonOpacity > 0.98 ? 'auto' : 'none';
    pinButton.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
  });

  return null;
};

type CameraDirectorProps = {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  stampPinWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  stampFocusActive: boolean;
};

const CameraDirector = ({ controlsRef, stampPinWorldRef, stampFocusActive }: CameraDirectorProps) => {
  const { camera } = useThree();
  const defaultPosition = useMemo(() => new THREE.Vector3(0, 0.82, 5.2), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);
  const focusOffset = useMemo(() => new THREE.Vector3(0, 0.02, 0.38), []);
  const focusPosition = useRef(new THREE.Vector3());
  const focusTarget = useRef(new THREE.Vector3());
  const wasFocusActiveRef = useRef(false);
  const returnFramesRef = useRef(0);
  const lastFovRef = useRef(camera instanceof THREE.PerspectiveCamera ? camera.fov : 33);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) return;

    const stampPinPosition = stampPinWorldRef.current;
    if (stampFocusActive && stampPinPosition) {
      wasFocusActiveRef.current = true;
      focusTarget.current.copy(stampPinPosition);
      focusPosition.current.copy(stampPinPosition).add(focusOffset);
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
  const stampPinAnchorRef = useRef<HTMLSpanElement | null>(null);
  const stampPinLineRef = useRef<HTMLSpanElement | null>(null);
  const stampPinLineEndRef = useRef<HTMLSpanElement | null>(null);
  const stampPinButtonRef = useRef<HTMLButtonElement | null>(null);
  const stampRailRef = useRef<HTMLDivElement | null>(null);
  const suppressStampClickUntilRef = useRef(0);
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0].value);
  const [stampColor, setStampColor] = useState(STAMP_COLORS[1].value);
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

  const selectedModel = useMemo(() => SHIRT_MODELS.find((item) => item.id === shirtModelId) ?? SHIRT_MODELS[0], [shirtModelId]);
  const selectedSize = useMemo(() => SHIRT_SIZES.find((item) => item.id === shirtSizeId) ?? SHIRT_SIZES[2], [shirtSizeId]);
  const selectedStamp = useMemo(() => STAMP_OPTIONS.find((item) => item.id === stampId) ?? STAMP_OPTIONS[0], [stampId]);
  const selectedStampTextureUrl = useMemo(() => selectedStamp.textureUrl ?? null, [selectedStamp.textureUrl]);
  const useVerticalStamp = useMemo(() => isVerticalStampId(selectedStamp.id), [selectedStamp.id]);
  const selectedStampColorLabel = useMemo(
    () => STAMP_COLORS.find((item) => item.value === stampColor)?.label ?? 'Custom',
    [stampColor]
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
    const normalized = value
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7EÀ-ÖØ-öø-ÿ]/g, '')
      .slice(0, MAX_BACK_TEXT_CHARS);
    setBackText(normalized);
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
    setPreviewSide('front');
    setStampFocusActive(false);
    stampPinWorldRef.current = null;
    setCheckoutName('');
    setCheckoutEmail('');
    setCheckoutAddress('');
    setPaymentMethod(null);
    setOrderNumber(null);
    setOrderPlacedAt(null);
  };

  useEffect(() => {
    if (activeStep !== 1) {
      setPreviewSide('front');
      return;
    }
    setPreviewSide(backTextEnabled ? 'back' : 'front');
  }, [activeStep, backTextEnabled]);

  useEffect(() => {
    if (previewSide === 'back' || stampId === 'none') {
      setStampFocusActive(false);
      stampPinWorldRef.current = null;
    }
  }, [previewSide, stampId]);

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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(255,255,255,0.06)_0%,rgba(8,9,12,0.8)_68%,rgba(5,6,9,0.97)_100%)]" />
              <Canvas shadows camera={{ position: [0, 0.82, 5.2], fov: 33 }} className="!absolute !inset-0">
                <ambientLight intensity={0.5} />
                <directionalLight
                  position={[2.8, 4, 2.2]}
                  intensity={1.25}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <spotLight position={[-2.4, 2.8, 3]} intensity={0.62} angle={0.48} penumbra={0.65} />
                <TShirtModel
                  shirtColor={shirtColor}
                  stampTextureId={stampId}
                  stampTextureUrl={selectedStampTextureUrl}
                  useVerticalStamp={useVerticalStamp}
                  stampColor={stampColor}
                  backText={cleanedBackText}
                  backTextEnabled={backTextEnabled}
                  backTextFontFamily={selectedBackTextFont.family}
                  backTextFontWeight={selectedBackTextFont.weight}
                  backTextFontRefreshKey={backTextFontRefreshKey}
                  showStampPin={previewSide === 'front' && stampId !== 'none'}
                  stampFocusActive={stampFocusActive}
                  previewSide={previewSide}
                  modelScale={selectedModel.scale}
                  stampPinWorldRef={stampPinWorldRef}
                  onLoadStateChange={setModelState}
                  onVisualStateChange={setViewerVisualState}
                />
                <StampPinProjector
                  stampPinWorldRef={stampPinWorldRef}
                  pinAnchorRef={stampPinAnchorRef}
                  pinLineRef={stampPinLineRef}
                  pinLineEndRef={stampPinLineEndRef}
                  pinButtonRef={stampPinButtonRef}
                  showPin={modelState.status === 'ready' && previewSide === 'front' && stampId !== 'none'}
                />
                <CameraDirector controlsRef={controlsRef} stampPinWorldRef={stampPinWorldRef} stampFocusActive={stampFocusActive} />
                <ContactShadows position={[0, -1.02, 0]} scale={5.2} blur={2.6} opacity={0.42} far={3.2} />
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
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_44%,rgba(6,7,10,0.48)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-[18]">
                <span
                  ref={stampPinAnchorRef}
                  className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full border border-white/70 bg-white/95 opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.72)]"
                  style={{ transform: 'translate(-100vw, -100vh)' }}
                />
                <span
                  ref={stampPinLineRef}
                  className="absolute left-0 top-0 h-px origin-left bg-white/80 opacity-0"
                  style={{ transform: 'translate(-100vw, -100vh)' }}
                />
                <span
                  ref={stampPinLineEndRef}
                  className="absolute left-0 top-0 h-2 w-2 rounded-full border border-white/80 bg-white opacity-0 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                  style={{ transform: 'translate(-100vw, -100vh)' }}
                />
                <button
                  ref={stampPinButtonRef}
                  type="button"
                  onClick={() => {
                    if (!stampPinWorldRef.current) return;
                    setStampFocusActive((current) => !current);
                    setPreviewSide('front');
                  }}
                  className="group pointer-events-auto absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/58 bg-black/68 text-white/88 opacity-0 shadow-[0_14px_28px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors duration-150 hover:border-white/90"
                  style={{ transform: 'translate(-100vw, -100vh)' }}
                  aria-label={stampFocusActive ? 'Voltar visao geral' : 'Zoom estampa'}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]" />
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/16 bg-black/84 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.14em] text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition ${
                      stampFocusActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {stampFocusActive ? 'voltar visao' : 'zoom estampa'}
                  </span>
                </button>
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

                <div className={`${stampId === 'none' ? 'opacity-45' : 'opacity-100'}`}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/45">Cor da Estampa</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STAMP_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setStampColor(color.value)}
                        aria-label={color.label}
                        disabled={stampId === 'none'}
                        className={`h-6 w-6 rounded-full border ${stampColor === color.value ? 'border-white/80' : 'border-white/25 hover:border-white/50'} disabled:cursor-not-allowed`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
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
                      src={stamp.textureUrl}
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
