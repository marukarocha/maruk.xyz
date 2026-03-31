import type { BikeHotspot, BikeStage, CameraPose, FrameSeal, StageId } from './types';

export const ORANGE_CARGO_LOGO_URL = '/lab/bike/orangecargo.png?v=5';
export const FINAL_STAGE_ID: StageId = 'rear';
export const LOOP_ANIMATION_CLIP_NAME = 'play_animation';

export const BIKE_STAGES: BikeStage[] = [
  {
    id: 'overview',
    titleLines: ['ORANGE', 'CARGO'],
    accentLine: 1,
    ghostWord: 'UTILITY',
    supportLabel: 'urban cargo platform',
    subtitleLines: [
      'Cargo bike pensada para cidade e entrega,',
      'com presenca visual guiada pela camera.',
    ],
    accent: '#ff8a1e',
    camera: {
      position: [6.3, 4.1, 8.2],
      target: [0.3, 1.28, 0.35],
      fov: 27,
      duration: 1.35,
    },
  },
  {
    id: 'cargo',
    titleLines: ['CARGA', 'FRONTAL'],
    accentLine: 1,
    ghostWord: 'FRONTAL',
    supportLabel: 'front deck access',
    subtitleLines: [
      'A plataforma frontal destaca volume util,',
      'acesso rapido e operacao urbana.',
    ],
    accent: '#ff9a3d',
    camera: {
      position: [4.2, 3.5, 6.4],
      target: [0.35, 1.18, 1.55],
      fov: 27,
      duration: 1.2,
    },
  },
  {
    id: 'frame',
    titleLines: ['QUADRO', 'ESTRUTURA'],
    accentLine: 1,
    ghostWord: 'FRAME',
    supportLabel: 'rigid urban frame',
    subtitleLines: [
      'A leitura lateral revela a estrutura',
      'como design, funcao e presenca.',
    ],
    accent: '#ffb15a',
    camera: {
      position: [0.4, 2.98, 6.45],
      target: [-0.92, 1.12, -0.02],
      fov: 20.4,
      duration: 1.25,
    },
  },
  {
    id: 'size',
    titleLines: ['TAMANHO', 'REAL'],
    accentLine: 1,
    ghostWord: 'SIZE',
    supportLabel: 'top view dimensions',
    subtitleLines: [
      'Vista superior revela 2,60 m de comprimento',
      'e 0,70 m de largura em leitura compacta.',
    ],
    accent: '#ffb15a',
    camera: {
      position: [0.08, 13.9, 2.18],
      target: [0.08, 0.98, 0.02],
      fov: 18.6,
      duration: 1.18,
    },
  },
  {
    id: 'rear',
    titleLines: ['USO', 'URBANO'],
    accentLine: 1,
    ghostWord: 'MOTION',
    supportLabel: 'city-ready motion',
    subtitleLines: [
      'O enquadramento final amarra mobilidade,',
      'utilidade e presenca na cidade.',
    ],
    accent: '#ff6f1a',
    camera: {
      position: [0.12, 2.08, 11.8],
      target: [-0.42, 1.14, 0.08],
      fov: 24,
      duration: 1.28,
    },
  },
];

export const INTRO_POSE: CameraPose = {
  position: [8.9, 5.4, 12.6],
  target: [0, 1.2, 0],
  fov: 31,
  duration: 2,
};

export const FRAME_SEALS: FrameSeal[] = [
  {
    id: 'aluminium-triple',
    label: 'Aluminium Triple',
    description: 'Perfil em aluminio com leitura estrutural limpa, pensado para rigidez e distribuicao uniforme das cargas.',
    camera: {
      position: [0.72, 2.42, 4.48],
      target: [-0.62, 1.26, 0.22],
      fov: 14.5,
      duration: 0.9,
    },
  },
  {
    id: 'weld-reinforcement',
    label: 'Reforco soldas',
    description: 'Pontos criticos do quadro recebem reforcos para reduzir concentracao de esforco e ampliar a durabilidade.',
    camera: {
      position: [1.04, 2.06, 4.24],
      target: [-0.1, 1.02, 0.58],
      fov: 14.2,
      duration: 0.9,
    },
  },
  {
    id: 'robotic-welds',
    label: 'Soldas roboticas',
    description: 'Processo automatizado garante repeticao precisa, acabamento consistente e melhor controle de uniao entre pecas.',
    camera: {
      position: [0.38, 2.54, 4.08],
      target: [-0.42, 1.52, 0.08],
      fov: 14,
      duration: 0.9,
    },
  },
  {
    id: 'high-strength',
    label: 'Alta resistencia',
    description: 'Conjunto calibrado para uso urbano intenso, com foco em estabilidade, confianca visual e vida util prolongada.',
    camera: {
      position: [1.26, 1.86, 4.56],
      target: [-0.98, 0.78, 0.18],
      fov: 14.8,
      duration: 0.9,
    },
  },
];

export const BIKE_HOTSPOTS: BikeHotspot[] = [
  {
    id: 'deck',
    stageId: 'cargo',
    title: 'Plataforma frontal',
    description: 'Area de carga ilustrativa para caixas leves, delivery e uso urbano diario.',
    position: [2.45, 1.18, 0.95],
    nodeName: 'spot_cargo',
  },
  {
    id: 'cockpit',
    stageId: 'overview',
    title: 'Cockpit elevado',
    description: 'Postura de pilotagem alta para leitura melhor do entorno e controle da frente.',
    position: [0.52, 1.92, 0.18],
  },
  {
    id: 'frame',
    stageId: 'frame',
    title: 'Quadro reforcado',
    description: 'Estrutura pensada para estabilidade visual e distribuicao mais segura da carga.',
    position: [-0.65, 1.05, 0.08],
  },
  {
    id: 'rear',
    stageId: 'rear',
    title: 'Conjunto traseiro',
    description: 'Fechamento traseiro ilustrativo para mobilidade, manutencao e apoio em uso diario.',
    position: [-2.8, 1.08, -0.38],
  },
];
