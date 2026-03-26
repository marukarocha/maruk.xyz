/**
 * cameraSystem.ts — Sistema declarativo de câmeras para AnimatedScene
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  COMO ADICIONAR UM NOVO SHOT                                            │
 * │                                                                         │
 * │  1. Declare um ANCHOR abaixo (ou reutilize um existente)                │
 * │  2. Adicione um CameraShot em CAMERA_SHOTS com:                         │
 * │       from / to  → intervalo em segundos no áudio                       │
 * │       position   → nome de anchor OU Vector3 literal                   │
 * │       target     → nome de anchor OU Vector3 literal                   │
 * │       fov        → campo de visão (graus)                               │
 * │       dof        → configuração de Depth-of-Field (opcional)           │
 * │       transition → tipo + duração de entrada                            │
 * │       shake / drift / zoom → modificadores opcionais                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Os shots são ordenados por `from` automaticamente.
 * O sistema aplica crossfade de câmera via GSAP com easing configurável.
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export type EasingName =
  | 'power1.in'  | 'power1.out'  | 'power1.inOut'
  | 'power2.in'  | 'power2.out'  | 'power2.inOut'
  | 'power3.in'  | 'power3.out'  | 'power3.inOut'
  | 'sine.in'    | 'sine.out'    | 'sine.inOut'
  | 'expo.in'    | 'expo.out'    | 'expo.inOut'
  | 'circ.in'    | 'circ.out'    | 'circ.inOut'
  | 'back.out'   | 'elastic.out'
  | 'none';

export type TransitionKind = 'cut' | 'ease' | 'cinematic' | 'snap';

export interface DoFConfig {
  /** Distância de foco (metros) */
  focus: number;
  /** Abertura — controla desfoque (0..0.01) */
  aperture: number;
  /** Intensidade máxima de blur (0..0.03) */
  maxblur: number;
}

export interface CameraTransition {
  kind: TransitionKind;
  /** Duração da transição em segundos */
  duration: number;
  easing?: EasingName;
}

export interface ShakeConfig {
  /** Intensidade do tremor (0.01 = sutil, 0.08 = forte) */
  intensity: number;
  /** Decaimento por frame (0.90..0.99) */
  decay: number;
}

export interface DriftConfig {
  /** Amplitude X/Z do drift (0 = desligado) */
  horizontal: number;
  /** Amplitude Y */
  vertical: number;
  /** Velocidade base do drift */
  speed: number;
}

export interface ZoomConfig {
  /** Distância inicial (sobrescreve position.z implícito) */
  from: number;
  /** Distância final */
  to: number;
  /** Duração do zoom em segundos */
  duration: number;
  easing?: EasingName;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Um ponto de ancoragem nomeado na cena */
export interface CameraAnchor {
  name: string;
  position: Vec3;
  /** Ponto de foco da câmera neste anchor */
  target: Vec3;
  /** FOV sugerido */
  fov?: number;
  /** DoF sugerido */
  dof?: DoFConfig;
}

/** Um shot = configuração completa da câmera para um intervalo de tempo */
export interface CameraShot {
  /** ID único (usado para referência no painel) */
  id: string;
  /** Início no áudio (segundos) */
  from: number;
  /** Fim no áudio (segundos) — Infinity = até o próximo shot */
  to: number;
  /** Nome de anchor OU posição literal */
  position: string | Vec3;
  /** Nome de anchor (target) OU target literal */
  target: string | Vec3;
  fov?: number;
  dof?: DoFConfig;
  transition?: CameraTransition;
  shake?: ShakeConfig;
  drift?: DriftConfig;
  zoom?: ZoomConfig;
  /** Label exibido no painel */
  label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Anchors — pontos de referência nomeados na cena
//
// REFERÊNCIA REAL da câmera (copiada do index.tsx):
//   position  → (1.27, 1.46, 2.35)
//   target    → (0.08, 1.01, 0.00)
//   fov       → 22
//
// Todos os outros anchors derivam desta base.
// ─────────────────────────────────────────────────────────────────────────────

export const CAMERA_ANCHORS: Record<string, CameraAnchor> = {

  // ── Posição de referência — exatamente a câmera inicial do index.tsx ──────
  default: {
    name: 'default',
    position: { x: 1.27, y: 1.46, z: 7.00 },
    target:   { x: 0.08, y: 1.01, z: 0.00 },
    fov: 22,
    dof: { focus: 7.3, aperture: 0.0002, maxblur: 0.024 },
  },

  // ── Plano médio — ligeiramente mais perto, focando no torso/cabeça ────────
  medium: {
    name: 'medium',
    position: { x: 0.80, y: 1.50, z: 4.50 },
    target:   { x: 0.06, y: 1.15, z: 0.00 },
    fov: 24,
    dof: { focus: 5.0, aperture: 0.0003, maxblur: 0.022 },
  },

  // ── Wide — recuado, mostra toda a cena ────────────────────────────────────
  wide: {
    name: 'wide',
    position: { x: 1.80, y: 2.00, z: 11.00 },
    target:   { x: 0.04, y: 0.90, z: 0.00 },
    fov: 32,
    dof: { focus: 14.0, aperture: 0.00008, maxblur: 0.008 },
  },

  // ── Low angle — de baixo para cima, dramático ─────────────────────────────
  lowAngle: {
    name: 'lowAngle',
    position: { x: 0.90, y: 0.50, z: 4.80 },
    target:   { x: 0.05, y: 1.40, z: 0.00 },
    fov: 26,
    dof: { focus: 5.5, aperture: 0.0003, maxblur: 0.022 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DOF defaults por "estilo"
// ─────────────────────────────────────────────────────────────────────────────

export const DOF_PRESETS: Record<string, DoFConfig> = {
  sharp:    { focus: 20.0,  aperture: 0.00005, maxblur: 0.004 },
  subtle:   { focus: 8.0,   aperture: 0.0001,  maxblur: 0.014 },
  cinematic:{ focus: 5.0,   aperture: 0.0003,  maxblur: 0.024 },
  portrait: { focus: 3.0,   aperture: 0.0006,  maxblur: 0.032 },
  dreamy:   { focus: 2.0,   aperture: 0.0010,  maxblur: 0.040 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Camera shots — sequência sincronizada ao áudio
//
// Regra: poucos cortes, transições suaves. Apenas muda quando faz sentido
// narrativo. Cada shot cobre uma seção inteira da música.
// ─────────────────────────────────────────────────────────────────────────────

export const CAMERA_SHOTS: CameraShot[] = [

  // ── ABERTURA (0–18s) — posição de referência com zoom-out inicial ─────────
  {
    id:    'opening',
    from:  0,
    to:    18,
    position: 'default',
    target:   'default',
    fov:      22,
    label:    'Opening',
    transition: { kind: 'cut', duration: 0, easing: 'none' },
    zoom:     { from: 2.0, to: 7.1, duration: 5, easing: 'power2.out' },
    drift:    { horizontal: 0.010, vertical: 0.004, speed: 0.20 },
  },

  // ── DANÇA (18–40s) — plano médio, deixa o personagem respirar ────────────
  {
    id:    'dance',
    from:  18,
    to:    40,
    position: 'medium',
    target:   'medium',
    label:    'Dance',
    transition: { kind: 'ease', duration: 2.0, easing: 'power2.inOut' },
    drift:    { horizontal: 0.018, vertical: 0.007, speed: 0.18 },
  },

  // ── FOGO (40–60s) — low angle dramático + drift maior ────────────────────
  {
    id:    'fire',
    from:  40,
    to:    60,
    position: 'lowAngle',
    target:   'lowAngle',
    fov:      26,
    label:    'Fire 🔥',
    transition: { kind: 'cinematic', duration: 1.5, easing: 'power2.out' },
    shake:    { intensity: 0.025, decay: 0.93 },
    drift:    { horizontal: 0.025, vertical: 0.010, speed: 0.35 },
  },

  // ── FESTA (60–72s) — wide revelador ──────────────────────────────────────
  {
    id:    'party',
    from:  60,
    to:    72,
    position: 'wide',
    target:   'wide',
    label:    'Party',
    transition: { kind: 'cinematic', duration: 2.0, easing: 'power3.inOut' },
    drift:    { horizontal: 0.014, vertical: 0.005, speed: 0.15 },
  },

  // ── FINALE (72–∞) — volta para referência, zoom out lento até o fim ───────
  {
    id:    'finale',
    from:  72,
    to:    Infinity,
    position: 'default',
    target:   'default',
    fov:      22,
    label:    'Finale',
    transition: { kind: 'ease', duration: 3.0, easing: 'power2.inOut' },
    zoom:     { from: 7.1, to: 12.0, duration: 10, easing: 'power1.out' },
    drift:    { horizontal: 0.006, vertical: 0.003, speed: 0.12 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve um Vec3 a partir de nome de anchor ou literal */
export function resolvePosition(ref: string | Vec3): Vec3 {
  if (typeof ref === 'string') {
    const anchor = CAMERA_ANCHORS[ref];
    if (!anchor) {
      console.warn(`[cameraSystem] Anchor "${ref}" não encontrado — usando default`);
      return CAMERA_ANCHORS.default.position;
    }
    return anchor.position;
  }
  return ref;
}

export function resolveTarget(ref: string | Vec3): Vec3 {
  if (typeof ref === 'string') {
    const anchor = CAMERA_ANCHORS[ref];
    if (!anchor) {
      console.warn(`[cameraSystem] Anchor "${ref}" não encontrado — usando default.target`);
      return CAMERA_ANCHORS.default.target;
    }
    return anchor.target;
  }
  return ref;
}

export function resolveDoF(_ref: string | Vec3 | undefined, shot: CameraShot): DoFConfig {
  if (shot.dof) return shot.dof;
  if (typeof shot.position === 'string') {
    const anchor = CAMERA_ANCHORS[shot.position];
    if (anchor?.dof) return anchor.dof;
  }
  return CAMERA_ANCHORS.default.dof!;
}

/** Retorna o shot ativo para um dado audioTime */
export function getShotAt(audioTime: number): CameraShot | null {
  const sorted = [...CAMERA_SHOTS].sort((a, b) => a.from - b.from);
  for (const shot of sorted) {
    if (audioTime >= shot.from && audioTime < shot.to) return shot;
  }
  return null;
}

/** Converte Vec3 para THREE.Vector3 */
export function toThree(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}
