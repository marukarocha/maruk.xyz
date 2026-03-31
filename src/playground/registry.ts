import { lazy } from 'react';
import type { Experiment } from './types';

export const experiments: Experiment[] = [
  {
    id: 'particle-field',
    title: 'Particle Field',
    description: 'Campo de partículas flutuando em espaço 3D com movimento orgânico e blending aditivo.',
    tags: ['three.js', 'particles', '3d', 'webgl'],
    date: '2026-02-15',
    status: 'live',
    component: lazy(() => import('./experiments/particle-field')),
  },
  {
    id: 'banana-rain',
    title: 'Banana Rain',
    description: '10 bananas 3D caindo com depth of field cinematográfico, LOD automático e pós-processamento bokeh.',
    tags: ['three.js', 'glb', 'postprocessing', 'depth-of-field', 'lod'],
    date: '2026-02-15',
    status: 'live',
    component: lazy(() => import('./experiments/banana-rain')),
  },
  {
    id: 'drinks',
    title: 'Energy Drinks',
    description: 'Interactive 3D carousel with 9 energy drinks built in native Three.js — individual object rotation via quaternion slerp, per-mesh texture toggling with dark silhouette materials, real-time camera/light/DoF controls, BokehPass post-processing, GSAP-driven elastic transitions, mouse parallax with proximity zoom, product label inspection with can spin animation, and multilingual UI (EN/BR/ES).',
    tags: ['three.js', 'glb', 'quaternion', 'postprocessing', 'bokeh', 'gsap', 'parallax', 'i18n'],
    date: '2026-02-15',
    status: 'live',
    component: lazy(() => import('./experiments/heart')),
  },
  {
    id: 'animated-scene',
    title: 'Animated Scene',
    description: 'Interactive 3D animated character built in native Three.js — GLB animation playback with play/pause/rewind/scrubber controls, variable speed (0.25x–2x), animation clip switching with crossfade, mouse parallax with dynamic spotlight tracking, auto-rotation and distance sliders, real-time camera/light/DoF controls via BokehPass, GSAP entrance animations, shadow mapping, and multilingual UI (EN/BR/ES).',
    tags: ['three.js', 'glb', 'animation', 'postprocessing', 'bokeh', 'gsap', 'parallax', 'i18n', 'orbit-controls'],
    date: '2026-02-18',
    status: 'live',
    component: lazy(() => import('./experiments/animated-scene')),
  },
  {
    id: 'pdv-showcase',
    title: 'PDV Spatial Demo',
    description: 'Cena 3D de ponto de venda com hotspots clicaveis, HUD lateral, tour automatico e transicoes de camera para apresentar o ambiente em fluxo guiado.',
    tags: ['three.js', 'glb', 'pdv', 'hotspots', 'camera', 'gsap', 'ui'],
    date: '2026-03-23',
    status: 'live',
    component: lazy(() => import('./experiments/pdv-showcase')),
  },
  {
    id: 'bike-cargo',
    title: 'Bike Cargo Product',
    description: 'Experiencia de produto para uma bike cargo com viewer 3D, views guiadas e interface editorial para apresentar forma, carga e presenca visual.',
    tags: ['three.js', 'glb', 'product-page', 'camera', 'gsap', 'showcase'],
    date: '2026-03-29',
    status: 'wip',
    component: lazy(() => import('./experiments/bike-cargo')),
  },
];
