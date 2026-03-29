import { motion, MotionValue, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ExternalLink,
  Github,
  Code,
  ChevronDown,
  Rocket,
  Layers,
  ArrowLeft,
  Box,
  Camera,
  MousePointerClick,
  MonitorPlay,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ProjectData } from '../../data/projects';
import { useLanguage } from '../../i18n/LanguageContext';

interface ModalLayoutProps {
  project: ProjectData;
  scrollYProgress: MotionValue<number>;
  onClose: () => void;
}

function isDirectVideoAsset(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

type VisualAsset = {
  src: string;
  label: string;
  kind: 'image' | 'video';
  sizeLabel: string;
  resolution?: string;
};

const assetSrc = (path: string) => encodeURI(path);

function shuffleAssets<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

type EmbeddedVideoProvider = 'vimeo' | 'youtube';

let vimeoPlayerApiPromise: Promise<void> | null = null;
let youtubeIframeApiPromise: Promise<void> | null = null;

function isHostedVideoAsset(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getEmbeddedVideoProvider(url?: string): EmbeddedVideoProvider | null {
  if (!url) return null;
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  return null;
}

function getVideoSignature(url?: string) {
  if (!url) return null;

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) return `vimeo-${vimeoMatch[1]}`;

  const youtubeMatch =
    url.match(/youtube\.com\/watch\?v=([\w-]+)/i) ||
    url.match(/youtube\.com\/embed\/([\w-]+)/i) ||
    url.match(/youtu\.be\/([\w-]+)/i);

  if (youtubeMatch?.[1]) return `youtube-${youtubeMatch[1]}`;

  return url;
}

function getMotionEmbedUrl(url?: string) {
  if (!url) return null;

  if (url.includes('player.vimeo.com/video/')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.delete('background');
      parsed.searchParams.set('title', '0');
      parsed.searchParams.set('byline', '0');
      parsed.searchParams.set('portrait', '0');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
  }

  if (url.includes('youtube.com/embed/')) return url;

  const youtubeMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/i) || url.match(/youtu\.be\/([\w-]+)/i);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
  }

  return url;
}

function getVideoThumbnailUrl(url?: string) {
  const signature = getVideoSignature(url);
  if (!signature) return null;
  if (signature.startsWith('vimeo-')) return `https://vumbnail.com/${signature.replace('vimeo-', '')}.jpg`;
  if (signature.startsWith('youtube-')) return `https://img.youtube.com/vi/${signature.replace('youtube-', '')}/hqdefault.jpg`;
  return null;
}

function loadVimeoPlayerApi() {
  if (typeof window === 'undefined') return Promise.resolve();

  const globalWindow = window as typeof window & {
    Vimeo?: {
      Player?: new (element: HTMLIFrameElement | HTMLElement) => {
        on: (event: string, callback: () => void) => void;
        off?: (event: string, callback: () => void) => void;
        destroy?: () => void;
      };
    };
  };

  if (globalWindow.Vimeo?.Player) return Promise.resolve();
  if (vimeoPlayerApiPromise) return vimeoPlayerApiPromise;

  vimeoPlayerApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-vimeo-player-script="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar Vimeo Player API')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    script.dataset.vimeoPlayerScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Vimeo Player API'));
    document.head.appendChild(script);
  });

  return vimeoPlayerApiPromise;
}

function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.resolve();

  const globalWindow = window as typeof window & {
    YT?: {
      Player?: new (element: HTMLIFrameElement | HTMLElement, config: unknown) => { destroy?: () => void };
      PlayerState?: { ENDED?: number };
    };
    onYouTubeIframeAPIReady?: (() => void) | undefined;
  };

  if (globalWindow.YT?.Player) return Promise.resolve();
  if (youtubeIframeApiPromise) return youtubeIframeApiPromise;

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const previousReady = globalWindow.onYouTubeIframeAPIReady;
    globalWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api="true"]');
    if (existingScript) {
      existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar YouTube IFrame API')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.youtubeIframeApi = 'true';
    script.onerror = () => reject(new Error('Falha ao carregar YouTube IFrame API'));
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

const visualSpaceAssets: VisualAsset[] = [
  { src: assetSrc('/port/3d/intro.mp4'), label: 'intro.mp4', kind: 'video', sizeLabel: '9.1 MB' },
  { src: assetSrc('/port/3d/Character.mp4'), label: 'Character.mp4', kind: 'video', sizeLabel: '2.5 MB' },
  { src: assetSrc('/port/3d/CharacterII.mp4'), label: 'CharacterII.mp4', kind: 'video', sizeLabel: '14.6 MB' },
  { src: assetSrc('/port/3d/Craby-22.jpg'), label: 'Craby-22.jpg', kind: 'image', sizeLabel: '460 KB', resolution: '3472x1860' },
  { src: assetSrc('/port/3d/Dragon.jpg'), label: 'Dragon.jpg', kind: 'image', sizeLabel: '48 KB', resolution: '617x617' },
  { src: assetSrc('/port/3d/Hidromel.webp'), label: 'Hidromel.webp', kind: 'image', sizeLabel: '99 KB', resolution: '1536x1024' },
  { src: assetSrc('/port/3d/coletivo.webp'), label: 'coletivo.webp', kind: 'image', sizeLabel: '75 KB', resolution: '1536x1024' },
  { src: assetSrc('/port/3d/devconf.png'), label: 'devconf.png', kind: 'image', sizeLabel: '2.2 MB', resolution: '1536x1024' },
  { src: assetSrc('/port/3d/dinofim.webp'), label: 'dinofim.webp', kind: 'image', sizeLabel: '159 KB', resolution: '1536x1024' },
  { src: assetSrc('/port/3d/balão.mp4'), label: 'balão.mp4', kind: 'video', sizeLabel: '12.4 MB' },
  { src: assetSrc('/port/3d/capacete.mp4'), label: 'capacete.mp4', kind: 'video', sizeLabel: '3.1 MB' },
  { src: assetSrc('/port/3d/flyerWind.mp4'), label: 'flyerWind.mp4', kind: 'video', sizeLabel: '15.5 MB' },
  { src: assetSrc('/port/3d/fone_.mp4'), label: 'fone_.mp4', kind: 'video', sizeLabel: '7.8 MB' },
  { src: assetSrc('/port/3d/garra.mp4'), label: 'garra.mp4', kind: 'video', sizeLabel: '4.7 MB', resolution: '1280x720' },
  { src: assetSrc('/port/3d/rig olhos.mp4'), label: 'rig olhos.mp4', kind: 'video', sizeLabel: '3.4 MB' },
  { src: assetSrc('/port/3d/Stage1_VP8.webm'), label: 'Stage1_VP8.webm', kind: 'video', sizeLabel: '1.2 MB' },
  { src: assetSrc('/port/3d/CEnario Valor Carreira2.jpg'), label: 'CEnario Valor Carreira2.jpg', kind: 'image', sizeLabel: '139 KB', resolution: '1280x720' },
  { src: assetSrc('/port/3d/KOMBI.png'), label: 'KOMBI.png', kind: 'image', sizeLabel: '2.3 MB', resolution: '1080x1920' },
  { src: assetSrc('/port/3d/Maquete Laundex1.jpg'), label: 'Maquete Laundex1.jpg', kind: 'image', sizeLabel: '994 KB', resolution: '2048x1556' },
  { src: assetSrc('/port/3d/Maquete Laundex2.jpg'), label: 'Maquete Laundex2.jpg', kind: 'image', sizeLabel: '610 KB', resolution: '1624x920' },
  { src: assetSrc('/port/3d/Nova linha varejo Ultraprotec.png'), label: 'Nova linha varejo Ultraprotec.png', kind: 'image', sizeLabel: '169 KB', resolution: '1240x522' },
  { src: assetSrc('/port/3d/boidemamamao.png'), label: 'boidemamamao.png', kind: 'image', sizeLabel: '1.0 MB', resolution: '2800x2800' },
  { src: assetSrc('/port/3d/cama_dogs.png'), label: 'cama_dogs.png', kind: 'image', sizeLabel: '491 KB', resolution: '931x931' },
  { src: assetSrc('/port/3d/dragons.png'), label: 'dragons.png', kind: 'image', sizeLabel: '1.8 MB', resolution: '1080x1920' },
  { src: assetSrc('/port/3d/maquete1.png'), label: 'maquete1.png', kind: 'image', sizeLabel: '723 KB', resolution: '960x540' },
  { src: assetSrc('/port/3d/monkey.jpg'), label: 'monkey.jpg', kind: 'image', sizeLabel: '275 KB', resolution: '1816x972' },
  { src: assetSrc('/port/3d/pdv.jpeg'), label: 'pdv.jpeg', kind: 'image', sizeLabel: '353 KB', resolution: '1415x1000' },
  { src: assetSrc('/port/3d/pdv.png'), label: 'pdv.png', kind: 'image', sizeLabel: '1.2 MB', resolution: '1344x756' },
  { src: assetSrc('/port/3d/raul_blend.png'), label: 'raul_blend.png', kind: 'image', sizeLabel: '225 KB', resolution: '1024x583' },
];

function getAssetDimensions(asset: VisualAsset) {
  if (!asset.resolution) return null;
  const [width, height] = asset.resolution.split('x').map(Number);
  if (!width || !height) return null;
  return { width, height, ratio: width / height };
}

function getAssetGridClasses(asset: VisualAsset, index: number, expanded: boolean, ratio?: number | null) {
  const dimensions = getAssetDimensions(asset);
  const resolvedRatio = ratio ?? dimensions?.ratio;

  if (expanded) {
    if (resolvedRatio && resolvedRatio < 0.82) return 'md:col-span-1 xl:col-span-1 2xl:col-span-2';
    if (resolvedRatio && resolvedRatio > 1.85) return 'md:col-span-2 xl:col-span-3 2xl:col-span-3';
    if (resolvedRatio && resolvedRatio > 1.3) return 'md:col-span-2 xl:col-span-2 2xl:col-span-3';
    return 'md:col-span-2 xl:col-span-2 2xl:col-span-2';
  }

  if (asset.kind === 'video') {
    if (resolvedRatio && resolvedRatio > 1.65) return 'md:col-span-2 xl:col-span-2 2xl:col-span-3';
    if (resolvedRatio && resolvedRatio < 0.82) return 'md:col-span-1 xl:col-span-1 2xl:col-span-1';
    return 'md:col-span-1 xl:col-span-1 2xl:col-span-2';
  }

  if (resolvedRatio && resolvedRatio > 1.95) return 'md:col-span-2 xl:col-span-3 2xl:col-span-3';
  if (resolvedRatio && resolvedRatio > 1.45) return index % 3 === 0 ? 'md:col-span-2 xl:col-span-2 2xl:col-span-3' : 'md:col-span-2 xl:col-span-2 2xl:col-span-2';
  if (resolvedRatio && resolvedRatio < 0.82) return 'md:col-span-1 xl:col-span-1 2xl:col-span-1';
  return '';
}

function getTextGridClasses(index: number) {
  if (index % 3 === 0) return 'md:col-span-2 xl:col-span-2 2xl:col-span-2 md:-my-4 xl:-my-6';
  if (index % 3 === 1) return 'md:col-span-1 xl:col-span-1 2xl:col-span-1 md:-mt-8 xl:-mt-10 md:ml-auto';
  return 'md:col-span-2 xl:col-span-3 2xl:col-span-2 md:-mb-4 xl:-mb-6';
}

export function FrontendLayout({ project }: ModalLayoutProps) {
  const { title, problem, solution, techStack, images, links, deepDive } = project;
  const galleryImages = images?.gallery ?? [];
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = galleryImages[activeMediaIndex] || images?.hero;
  const deepDiveBlocks = deepDive?.blocks ?? [];

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project.id]);

  return (
    <>
      {/* SECTION 1: HERO */}
      <section className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] relative flex items-center justify-center pt-32 overflow-hidden">
        {isDirectVideoAsset(images?.heroVideo) && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            src={images.heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070c]/88 via-[#090b11]/74 to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-primary-500 font-mono text-sm uppercase tracking-widest mb-4 block"
          >
            Case Study
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-4xl mx-auto mb-12"
          >
            {images?.logo && (
              <img
                src={images.logo}
                alt={`${title} logo`}
                className="mx-auto mb-6 h-20 w-20 rounded-2xl border border-cyan-100/25 bg-black/35 p-2 object-contain shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              />
            )}
            <h1 className="text-5xl md:text-8xl font-black leading-tight mb-6">
              <span className="text-white">{title?.split(' ')[0]} </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                {title?.split(' ').slice(1).join(' ')}
              </span>
            </h1>
          </motion.div>

          <div className="flex flex-col gap-8 items-center">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed max-w-lg"
            >
              {problem || "Uma solução inovadora para problemas complexos trazendo alta performance e design de ponta."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {techStack?.slice(0, 4).map((tech, i) => (
                <span key={i} className="px-4 py-2 border border-white/20 rounded-full text-sm font-mono hover:bg-white/10 transition-colors">
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
          >
            <ChevronDown size={32} />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CONTEXT & ROLE */}
      <section className="min-h-screen bg-[#0f0f0f] relative flex items-center py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="text-primary-500 font-mono text-sm uppercase tracking-widest mb-4 block">The Mission</span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold mb-8"
              >
                Desafio &<br />
                Objetivos
              </motion.h2>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-6 rounded-xl border border-white/5"
                >
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Layers size={20} className="text-purple-400" /> O Problema
                  </h3>
                  <p className="text-gray-400 text-sm">{problem}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-6 rounded-xl border border-white/5"
                >
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Rocket size={20} className="text-cyan-400" /> A Solução
                  </h3>
                  <p className="text-gray-400 text-sm">{solution}</p>
                </motion.div>
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Large Featured Image / Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative w-full aspect-[16/9] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
              >
                {images?.hero ? (
                  <img src={images.hero} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">Mockup Area</div>
                )}

                {links?.live && (
                  <a
                    href={links.live}
                    target="_blank"
                    className="absolute bottom-6 right-6 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    Ver Projeto Ao Vivo <ExternalLink size={16} />
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ADVANCED ENGINEERING DEEP DIVE */}
      {deepDiveBlocks.length > 0 && (
        <section className="min-h-screen bg-[#090909] relative py-24 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="mb-14 max-w-4xl">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold tracking-tight"
              >
                Engenharia de Produto em Nível Avançado
              </motion.h2>
              {deepDive?.headline && (
                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.12 }}
                  viewport={{ once: true }}
                  className="mt-6 text-base leading-relaxed text-white/75 sm:text-lg"
                >
                  {deepDive.headline}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {deepDiveBlocks.map((block, index) => (
                <motion.article
                  key={`${block.title}-${index}`}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="relative overflow-hidden rounded-3xl border border-cyan-100/15 bg-gradient-to-br from-[#111722]/75 via-[#101010]/70 to-[#131f30]/75 p-6 sm:p-8"
                >
                  <span className="pointer-events-none absolute -right-1 top-0 text-6xl font-black text-cyan-100/10 sm:text-7xl">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mb-2 text-2xl font-semibold tracking-tight text-cyan-100">{block.title}</h3>
                  {block.summary && <p className="mb-5 text-sm leading-relaxed text-white/70 sm:text-base">{block.summary}</p>}
                  <ul className="space-y-3">
                    {block.points.map((point, pointIndex) => (
                      <li
                        key={`${point}-${pointIndex}`}
                        className="rounded-2xl border border-cyan-100/15 bg-black/20 px-4 py-3 text-sm leading-relaxed text-white/80"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: TECH ARSENAL DETAIL */}
      <section className="min-h-screen bg-[#0a0a0a] relative flex items-center py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Bastidores Técnicos
            </motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto">As tecnologias e decisões arquiteturais que tornaram este projeto possível.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="grid grid-cols-2 gap-4"
            >
              {techStack?.map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-[#161616] transition-all flex flex-col items-center justify-center text-center gap-3 group"
                >
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <Code size={22} className="text-gray-400 group-hover:text-white" />
                  </div>
                  <span className="font-mono text-sm sm:text-base font-medium">{tech}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-cyan-200/15 bg-gradient-to-br from-[#0f1726]/85 via-[#101010]/75 to-[#111f2f]/80 p-6"
            >
              <span className="pointer-events-none absolute -right-1 top-0 text-7xl font-black text-cyan-100/10 sm:text-8xl">
                03
              </span>
              <h3 className="mb-2 text-2xl font-semibold tracking-tight text-cyan-100">Mídias do Produto</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/70">
                Capturas reais do fluxo principal do Moto Diário dentro do contexto do arsenal tech.
              </p>

              <div className="relative mx-auto w-full max-w-[360px]">
                <div className="pointer-events-none absolute inset-x-12 -top-7 h-20 rounded-full bg-cyan-200/15 blur-3xl" />
                <div className="relative aspect-[9/16] overflow-hidden rounded-[2.2rem] border border-white/20 bg-black shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
                  <div className="absolute left-1/2 top-3 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/25" />
                  {activeMedia ? (
                    <img src={activeMedia} alt={`${title} mídia ${activeMediaIndex + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/45">Sem mídia disponível</div>
                  )}
                </div>
              </div>

              {galleryImages.length > 0 && (
                <div className="mt-5 grid grid-cols-5 gap-2">
                  {galleryImages.slice(0, 5).map((media, index) => (
                    <button
                      key={`${media}-${index}`}
                      onClick={() => setActiveMediaIndex(index)}
                      className={`overflow-hidden rounded-xl border transition ${
                        activeMediaIndex === index ? 'border-cyan-100/70' : 'border-white/15 hover:border-cyan-100/40'
                      }`}
                      aria-label={`Abrir mídia ${index + 1}`}
                    >
                      <img src={media} alt={`${title} miniatura ${index + 1}`} className="h-16 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </section>

      {/* SECTION 5: OUTRO / NEXT */}
      <section className="min-h-screen bg-white text-black relative flex items-center justify-center">
        <div className="text-center max-w-4xl px-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-12 tracking-tighter"
          >
            Gostou do que viu?
          </motion.h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {links?.github && (
              <a
                href={links.github}
                target="_blank"
                className="px-8 py-4 bg-black text-white rounded-full text-xl font-bold flex items-center gap-3 hover:bg-gray-800 transition-colors"
              >
                <Github size={24} /> Código Fonte
              </a>
            )}
            {links?.live && (
              <a
                href={links.live}
                target="_blank"
                className="px-8 py-4 border-2 border-black text-black rounded-full text-xl font-bold flex items-center gap-3 hover:bg-black hover:text-white transition-colors"
              >
                Acessar Projeto <ExternalLink size={24} />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function MotionMasonryCard({
  asset,
  index,
  expanded,
  onToggleExpand,
  cardRef,
}: {
  asset: VisualAsset;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  cardRef?: (node: HTMLElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const isNearViewport = useInView(articleRef, { once: true, margin: '320px 0px 320px 0px' });
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(asset.kind === 'image');
  const [shouldAutoplayVideo, setShouldAutoplayVideo] = useState(false);
  const dimensions = getAssetDimensions(asset);
  const ratio = asset.kind === 'video' ? videoRatio ?? 16 / 9 : dimensions?.ratio;

  useEffect(() => {
    if (asset.kind === 'image') return;
    if (expanded || isNearViewport) {
      setShouldLoadVideo(true);
    }
  }, [asset.kind, expanded, isNearViewport]);

  const playVideo = () => {
    if (!videoRef.current) return;
    const playPromise = videoRef.current.play();
    if (playPromise) {
      void playPromise.catch(() => {
        setShouldAutoplayVideo(false);
      });
    }
  };

  const seekToPreviewFrame = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = 0.01;
    } catch {
      // Some browsers can reject seeks before enough data is buffered.
    }
  };

  const handleMouseEnter = () => {
    if (asset.kind !== 'video') return;
    if (!shouldLoadVideo) {
      setShouldLoadVideo(true);
      setShouldAutoplayVideo(true);
      return;
    }
    setShouldAutoplayVideo(true);
    playVideo();
  };

  const handleMouseLeave = () => {
    if (asset.kind !== 'video' || !videoRef.current) return;
    setShouldAutoplayVideo(false);
    videoRef.current.pause();
    seekToPreviewFrame();
  };

  const toggleExpandedVideo = () => {
    if (asset.kind !== 'video') return;
    if (!expanded) {
      setShouldLoadVideo(true);
      setShouldAutoplayVideo(true);
      onToggleExpand();
      playVideo();
      return;
    }
    setShouldAutoplayVideo(false);
    onToggleExpand();
  };

  return (
    <motion.article
      ref={(node) => {
        articleRef.current = node;
        cardRef?.(node);
      }}
      initial={{ opacity: 0, y: 90 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, delay: (index % 5) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.08 }}
      className={`motion-space-panel group relative z-10 overflow-hidden bg-[#070b12] shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${getAssetGridClasses(
        asset,
        index,
        expanded,
        ratio
      )}`}
      style={ratio ? { aspectRatio: String(ratio) } : undefined}
    >
      {asset.kind === 'image' ? (
        <button type="button" onClick={onToggleExpand} className="block h-full w-full text-left" aria-label={`Expandir ${asset.label}`}>
          <img
            src={asset.src}
            alt={asset.label}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.01]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/26 via-transparent to-transparent" />
        </button>
      ) : (
        <div className="relative h-full w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="relative h-full w-full">
            {shouldLoadVideo ? (
              <video
                ref={videoRef}
                src={asset.src}
                muted
                loop
                playsInline
                preload="auto"
                onLoadedMetadata={(event) => {
                  const { videoWidth, videoHeight } = event.currentTarget;
                  if (videoWidth && videoHeight) {
                    setVideoRatio(videoWidth / videoHeight);
                  }
                }}
                onLoadedData={() => {
                  seekToPreviewFrame();
                  if (shouldAutoplayVideo) {
                    playVideo();
                  }
                }}
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,#08101c_0%,#04070d_100%)]" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/36 via-transparent to-transparent" />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleExpandedVideo();
            }}
            className="absolute bottom-4 right-4 bg-black/28 p-2 text-white/78 transition hover:text-cyan-100"
            aria-label={expanded ? `Recolher ${asset.label}` : `Expandir ${asset.label}`}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      )}
      {asset.kind === 'image' && (
        <div className="pointer-events-none absolute bottom-4 right-4 bg-black/28 p-2 text-white/78">
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </div>
      )}
    </motion.article>
  );
}

function MotionTextBlock({
  eyebrow,
  lines,
  body,
  index,
  ghost,
}: {
  eyebrow: string;
  lines: string[];
  body?: string;
  index: number;
  ghost?: string;
}) {
  const textRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start end', 'end start'],
  });
  const travel = index % 2 === 0 ? 56 : -48;
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [travel, 0, -travel]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.45, 1], [0.1, 0.5, 1, 0.75]);
  const textAlignClass = index % 3 === 1 ? 'text-right md:ml-auto' : 'text-left';

  return (
    <motion.article
      ref={textRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: (index % 4) * 0.05 }}
      viewport={{ once: true, amount: 0.18 }}
      className={`relative z-20 px-2 sm:px-4 ${getTextGridClasses(
        index
      )}`}
      style={{ y, opacity }}
    >
      <div className={`relative max-w-[34rem] ${textAlignClass}`}>
        {ghost && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
            <p className="text-[clamp(3.5rem,12vw,10rem)] font-black uppercase leading-none tracking-[-0.1em] text-white/[0.05] blur-[1px]">
              {ghost}
            </p>
          </div>
        )}
        <p className="relative z-10 text-[10px] font-mono uppercase tracking-[0.32em] text-white/34">{eyebrow}</p>
        <div className="relative z-10 mt-4 space-y-1">
          {lines.map((line, lineIndex) => (
            <p
              key={`${line}-${lineIndex}`}
              className={`text-[clamp(2.2rem,6vw,5.8rem)] font-black uppercase leading-[0.84] tracking-[-0.09em] ${
                lineIndex === lines.length - 1 ? 'text-cyan-100' : 'text-white'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
        {body && (
          <p
            className={`relative z-10 mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px] ${
              index % 3 === 1 ? 'ml-auto' : ''
            }`}
          >
            {body}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export function MotionLayout({ project, scrollYProgress, onClose }: ModalLayoutProps) {
  const { t } = useLanguage();
  const { shortDescription, role, tags, techStack, images, links } = project;
  const motionRootRef = useRef<HTMLDivElement>(null);
  const assetNodesRef = useRef<Record<string, HTMLElement | null>>({});
  const [expandedAssetSrc, setExpandedAssetSrc] = useState<string | null>(null);
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const isThreeDModule = project.id === 'pdv-showcase' || project.id.includes('3d');
  const threeDTexts = t.projectModal.threeD;

  const streamItems = useMemo(() => {
    if (!isThreeDModule) return [];

    const textBlocks = threeDTexts.textBlocks.map((block, index) => ({
      id: `text-${index + 1}`,
      ...block,
    }));

    const items: Array<{ type: 'asset'; asset: VisualAsset } | { type: 'text'; block: (typeof textBlocks)[number] }> = [];
    const shuffledImages = shuffleAssets(visualSpaceAssets.filter((asset) => asset.kind === 'image'));
    const shuffledVideos = shuffleAssets(visualSpaceAssets.filter((asset) => asset.kind === 'video'));
    const mixedAssets = [...shuffledImages];

    shuffledVideos.forEach((video, videoIndex) => {
      const insertAt = Math.min(mixedAssets.length, 2 + videoIndex * Math.max(3, Math.floor(shuffledImages.length / Math.max(1, shuffledVideos.length))));
      mixedAssets.splice(insertAt, 0, video);
    });

    const textInsertIndexes = [
      Math.max(1, Math.floor(mixedAssets.length * 0.16)),
      Math.max(4, Math.floor(mixedAssets.length * 0.46)),
      Math.max(8, Math.floor(mixedAssets.length * 0.76)),
    ];

    mixedAssets.forEach((asset, index) => {
      textInsertIndexes.forEach((insertIndex, textIndex) => {
        if (index === insertIndex) items.push({ type: 'text', block: textBlocks[textIndex] });
      });
      items.push({ type: 'asset', asset });
    });

    return items;
  }, [isThreeDModule, threeDTexts]);

  const motionVideos = useMemo(() => {
    if (isThreeDModule) return [];

    const candidates = [
      ...(images?.heroVideo ? [{ title: 'Video Principal', url: images.heroVideo }] : []),
      ...(links?.live ? [{ title: 'Video Principal', url: links.live }] : []),
      ...(project.videos ?? []),
    ];

    const signatures = new Set<string>();

    return candidates
      .map((video) => {
        const signature = getVideoSignature(video.url);
        const embedUrl = getMotionEmbedUrl(video.url);

        return {
          ...video,
          signature,
          embedUrl,
          thumbnailUrl: getVideoThumbnailUrl(video.url),
        };
      })
      .filter(
        (
          video
        ): video is {
          title: string;
          url: string;
          signature: string;
          embedUrl: string;
          thumbnailUrl: string | null;
        } => {
          if (!video.signature || !video.embedUrl || signatures.has(video.signature)) return false;
          signatures.add(video.signature);
          return true;
        }
      );
  }, [images?.heroVideo, isThreeDModule, links?.live, project.videos]);

  const shuffledMotionVideos = useMemo(() => {
    if (isThreeDModule) return [];
    const shuffled = [...motionVideos];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }, [isThreeDModule, motionVideos, project.id]);

  const [topStripVideos, bottomStripVideos] = useMemo(() => {
    if (isThreeDModule) return [[], []] as [typeof shuffledMotionVideos, typeof shuffledMotionVideos];

    const top = shuffledMotionVideos.filter((_, index) => index % 2 === 0);
    const bottom = shuffledMotionVideos.filter((_, index) => index % 2 !== 0);

    return [top, bottom.length > 0 ? bottom : top];
  }, [isThreeDModule, shuffledMotionVideos]);

  const [activeVideoSignature, setActiveVideoSignature] = useState<string | null>(motionVideos[0]?.signature ?? null);
  const [playerResetKey, setPlayerResetKey] = useState(0);
  const motionSectionRef = useRef<HTMLElement>(null);
  const stripViewportRef = useRef<HTMLDivElement>(null);
  const topStripRef = useRef<HTMLDivElement>(null);
  const bottomStripRef = useRef<HTMLDivElement>(null);
  const playerFrameRef = useRef<HTMLIFrameElement>(null);
  const [topStripOffset, setTopStripOffset] = useState(0);
  const [bottomStripOffset, setBottomStripOffset] = useState(0);
  const [motionSectionHeight, setMotionSectionHeight] = useState(1400);
  const motionCalloutWords = ['Vamos', 'criar', 'nosso', 'projeto', 'audiovisual'];

  useEffect(() => {
    if (!isThreeDModule && motionVideos.length > 0) {
      setActiveVideoSignature(motionVideos[0]?.signature ?? null);
      setPlayerResetKey((current) => current + 1);
      return;
    }

    if (isThreeDModule) {
      setExpandedAssetSrc(null);
    }
  }, [isThreeDModule, motionVideos, project.id]);

  useEffect(() => {
    if (!isThreeDModule && activeVideoSignature && motionVideos.some((video) => video.signature === activeVideoSignature)) return;
    if (!isThreeDModule) {
      setActiveVideoSignature(motionVideos[0]?.signature ?? null);
    }
  }, [activeVideoSignature, isThreeDModule, motionVideos]);

  useEffect(() => {
    if (!expandedAssetSrc || !isThreeDModule) return;

    const targetNode = assetNodesRef.current[expandedAssetSrc];
    if (!targetNode) return;

    let frameA = 0;
    let frameB = 0;

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      });
    });

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }, [expandedAssetSrc, isThreeDModule]);

  useEffect(() => {
    if (isThreeDModule) return;

    const sectionNode = motionSectionRef.current;
    const viewportNode = stripViewportRef.current;
    const topNode = topStripRef.current;
    const bottomNode = bottomStripRef.current;
    const modalContainer = sectionNode?.closest('.project-modal-container') as HTMLDivElement | null;

    if (!sectionNode || !viewportNode || !topNode || !bottomNode || !modalContainer) return;

    const updateHeight = () => {
      const maxStripOverflow = Math.max(
        0,
        topNode.scrollWidth - viewportNode.clientWidth,
        bottomNode.scrollWidth - viewportNode.clientWidth
      );
      const calculatedHeight = Math.max(modalContainer.clientHeight + maxStripOverflow + 260, Math.round(modalContainer.clientHeight * 1.55));
      setMotionSectionHeight(calculatedHeight);
    };

    const updateOffsets = () => {
      const currentViewport = stripViewportRef.current;
      const currentTop = topStripRef.current;
      const currentBottom = bottomStripRef.current;
      const currentSection = motionSectionRef.current;

      if (!currentViewport || !currentTop || !currentBottom || !currentSection) return;

      const topOverflow = Math.max(0, currentTop.scrollWidth - currentViewport.clientWidth);
      const bottomOverflow = Math.max(0, currentBottom.scrollWidth - currentViewport.clientWidth);
      const maxOverflow = Math.max(topOverflow, bottomOverflow);
      const sectionStart = currentSection.offsetTop;
      const sectionEnd = sectionStart + currentSection.offsetHeight - modalContainer.clientHeight;

      if (modalContainer.scrollTop <= sectionStart) {
        setTopStripOffset(0);
        setBottomStripOffset(-bottomOverflow);
        return;
      }

      if (modalContainer.scrollTop >= sectionEnd) {
        setTopStripOffset(-topOverflow);
        setBottomStripOffset(0);
        return;
      }

      if (maxOverflow <= 0 || sectionEnd <= sectionStart) {
        setTopStripOffset(0);
        setBottomStripOffset(0);
        return;
      }

      const progress = (modalContainer.scrollTop - sectionStart) / (sectionEnd - sectionStart);
      setTopStripOffset(-topOverflow * progress);
      setBottomStripOffset(-bottomOverflow + bottomOverflow * progress);
    };

    updateHeight();
    updateOffsets();

    const observer = new ResizeObserver(() => {
      updateHeight();
      updateOffsets();
    });

    observer.observe(topNode);
    observer.observe(bottomNode);
    observer.observe(viewportNode);

    modalContainer.addEventListener('scroll', updateOffsets, { passive: true });
    window.addEventListener('resize', updateHeight);
    window.addEventListener('resize', updateOffsets);

    return () => {
      observer.disconnect();
      modalContainer.removeEventListener('scroll', updateOffsets);
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('resize', updateOffsets);
    };
  }, [bottomStripVideos.length, isThreeDModule, topStripVideos.length]);

  useLayoutEffect(() => {
    if (!isThreeDModule) return;

    const root = motionRootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.motion-space-kicker', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45 })
        .fromTo(
          '.motion-space-word',
          { autoAlpha: 0, yPercent: 110, filter: 'blur(10px)' },
          { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.82, stagger: 0.1 },
          '-=0.08'
        )
        .fromTo('.motion-space-copy', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.58 }, '-=0.35')
        .fromTo('.motion-space-chip', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.05 }, '-=0.28')
        .fromTo('.motion-space-stream', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.72 }, '-=0.26');

      gsap.to('.motion-space-glow-a', { y: -18, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.motion-space-glow-b', { y: 16, duration: 2.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, root);

    return () => context.revert();
  }, [isThreeDModule]);

  const activeMotionVideo = motionVideos.find((video) => video.signature === activeVideoSignature) ?? motionVideos[0];
  const playerFrameId = activeMotionVideo?.signature ? `motion-player-${activeMotionVideo.signature}` : undefined;
  const activeMotionPlayerUrl = useMemo(() => {
    if (!activeMotionVideo?.embedUrl) return null;

    try {
      const parsed = new URL(activeMotionVideo.embedUrl);
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('playsinline', '1');

      const provider = getEmbeddedVideoProvider(activeMotionVideo.url);
      if (provider === 'youtube') {
        parsed.searchParams.set('mute', '1');
        parsed.searchParams.set('enablejsapi', '1');
        if (typeof window !== 'undefined') parsed.searchParams.set('origin', window.location.origin);
      }

      if (provider === 'vimeo' && playerFrameId) {
        parsed.searchParams.set('autopause', '0');
        parsed.searchParams.set('player_id', playerFrameId);
      }

      return parsed.toString();
    } catch {
      const separator = activeMotionVideo.embedUrl.includes('?') ? '&' : '?';
      return `${activeMotionVideo.embedUrl}${separator}autoplay=1&playsinline=1`;
    }
  }, [activeMotionVideo, playerFrameId, playerResetKey]);

  const selectMotionVideo = (signature: string | null) => {
    if (!signature) return;
    setActiveVideoSignature(signature);
    setPlayerResetKey((current) => current + 1);
  };

  const playNextMotionVideo = () => {
    if (motionVideos.length === 0) return;
    const currentIndex = motionVideos.findIndex((video) => video.signature === activeVideoSignature);
    const nextVideo = motionVideos[((currentIndex >= 0 ? currentIndex : 0) + 1) % motionVideos.length];
    if (nextVideo?.signature) {
      setActiveVideoSignature(nextVideo.signature);
      setPlayerResetKey((current) => current + 1);
    }
  };

  useEffect(() => {
    if (isThreeDModule || !activeMotionVideo || isHostedVideoAsset(activeMotionVideo.url) || !playerFrameRef.current) return;

    let disposed = false;
    let destroyPlayer: (() => void) | undefined;

    const setup = async () => {
      const provider = getEmbeddedVideoProvider(activeMotionVideo.url);
      if (!provider) return;

      if (provider === 'vimeo') {
        await loadVimeoPlayerApi();
        const globalWindow = window as typeof window & {
          Vimeo?: {
            Player?: new (element: HTMLIFrameElement | HTMLElement) => {
              on: (event: string, callback: () => void) => void;
              off?: (event: string, callback: () => void) => void;
              destroy?: () => void;
            };
          };
        };

        if (disposed || !globalWindow.Vimeo?.Player || !playerFrameRef.current) return;

        const player = new globalWindow.Vimeo.Player(playerFrameRef.current);
        const handleEnded = () => {
          if (!disposed) playNextMotionVideo();
        };

        player.on('ended', handleEnded);
        destroyPlayer = () => {
          player.off?.('ended', handleEnded);
          player.destroy?.();
        };
      }

      if (provider === 'youtube') {
        await loadYouTubeIframeApi();
        const globalWindow = window as typeof window & {
          YT?: {
            Player?: new (element: HTMLIFrameElement | HTMLElement, config: unknown) => { destroy?: () => void };
            PlayerState?: { ENDED?: number };
          };
        };

        if (disposed || !globalWindow.YT?.Player || !playerFrameRef.current) return;

        const player = new globalWindow.YT.Player(playerFrameRef.current, {
          events: {
            onStateChange: (event: { data: number }) => {
              const endedState = globalWindow.YT?.PlayerState?.ENDED ?? 0;
              if (!disposed && event.data === endedState) {
                playNextMotionVideo();
              }
            },
          },
        });

        destroyPlayer = () => {
          player.destroy?.();
        };
      }
    };

    void setup();

    return () => {
      disposed = true;
      destroyPlayer?.();
    };
  }, [activeMotionVideo, isThreeDModule, playerResetKey]);

  if (!isThreeDModule) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-0 sm:px-6 lg:px-8">
        <motion.div className="relative z-10" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          {motionVideos.length > 0 && (
            <section ref={motionSectionRef} className="relative mb-28" style={{ height: `${motionSectionHeight}px` }}>
              <div className="sticky top-0 flex h-screen items-center">
                <div className="w-full">
                  <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,0.62fr)] lg:gap-0">
                    <div className="relative overflow-visible">
                      <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_36px_90px_rgba(0,0,0,0.45)]">
                        {activeMotionVideo ? (
                          isHostedVideoAsset(activeMotionVideo.url) ? (
                            <video
                              key={`${activeMotionVideo.signature}-${playerResetKey}`}
                              className="h-full w-full object-cover"
                              src={activeMotionVideo.url}
                              autoPlay
                              muted
                              playsInline
                              onEnded={playNextMotionVideo}
                            />
                          ) : (
                            <iframe
                              key={`${activeMotionVideo.signature}-${playerResetKey}`}
                              ref={playerFrameRef}
                              id={playerFrameId}
                              src={activeMotionPlayerUrl ?? undefined}
                              className="h-full w-full"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                              allowFullScreen
                              title={`${activeMotionVideo.title} player`}
                            />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/40">Video indisponivel</div>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    </div>

                    <motion.aside
                      className="relative z-10 max-w-md bg-white/6 p-6 backdrop-blur-xl lg:-mb-10 lg:-ml-12 lg:p-7"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, duration: 0.4 }}
                    >
                      <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/45">Manifesto</span>
                      <h2 className="mt-5 text-4xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] text-[#f2f5f7] sm:text-5xl lg:text-6xl">
                        Movimento com intencao.
                      </h2>
                      <p className="mt-6 max-w-sm text-base leading-relaxed text-[#c0c5cc]">
                        Cada frame e construido para guiar leitura, emocao e memoracao da mensagem.
                      </p>
                      <p className="mt-4 max-w-sm text-base leading-relaxed text-[#8d949d]">
                        Do conceito ao acabamento: ritmo, direcao de arte e consistencia de marca em toda a entrega.
                      </p>
                      <p className="mt-8 max-w-sm text-[11px] font-mono uppercase leading-relaxed tracking-[0.24em] text-white/38">
                        {techStack.join(' · ')}
                      </p>
                    </motion.aside>
                  </div>

                  {motionVideos.length > 1 && (
                    <div className="relative left-1/2 z-20 mt-2 w-screen -translate-x-1/2 sm:mt-3 lg:mt-4">
                      <div className="origin-center lg:-rotate-[1.75deg]">
                        <div
                          ref={stripViewportRef}
                          className="overflow-hidden border-y border-white/10 bg-black/30 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm"
                        >
                          <div ref={topStripRef} className="flex w-max gap-0" style={{ transform: `translate3d(${topStripOffset}px, 0, 0)` }}>
                            {topStripVideos.map((video, index) => {
                              const isActive = activeMotionVideo?.signature === video.signature;

                              return (
                                <button
                                  key={`${video.title}-${index}-top`}
                                  onClick={() => selectMotionVideo(video.signature)}
                                  className={`group relative h-[112px] w-[208px] shrink-0 overflow-hidden border-r border-white/12 sm:h-[136px] sm:w-[272px] lg:h-[156px] lg:w-[332px] ${
                                    isActive ? 'border-cyan-100/55' : 'hover:border-cyan-100/30'
                                  }`}
                                  aria-label={`Exibir ${video.title}`}
                                >
                                  {video.thumbnailUrl ? (
                                    <img
                                      src={video.thumbnailUrl}
                                      alt={video.title}
                                      className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-78"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-[#1b2233] via-[#1a1129] to-[#121826]" />
                                  )}
                                  <div
                                    className={`absolute inset-0 z-10 transition-all duration-300 ${
                                      isActive ? 'bg-[#0d3249]/68' : 'bg-[#081b27]/84'
                                    } group-hover:bg-[#081b27]/56`}
                                  />
                                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#02070b]/94 via-[#0e3144]/62 to-[#17485f]/36 opacity-100 transition-opacity duration-300 group-hover:opacity-88" />
                                  <div className="absolute inset-0 z-30 flex items-center justify-center">
                                    <span
                                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/34 ${
                                        isActive ? 'border-cyan-100/85 bg-cyan-100/24 text-cyan-50' : 'border-white/55 bg-black/42 text-white'
                                      }`}
                                    >
                                      <Play size={17} className="ml-0.5" />
                                    </span>
                                  </div>
                                  <div className="absolute bottom-3 left-4 right-4 z-30 text-left">
                                    <p className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-white">{video.title}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div
                            ref={bottomStripRef}
                            className="flex w-max gap-0 border-t border-white/10"
                            style={{ transform: `translate3d(${bottomStripOffset}px, 0, 0)` }}
                          >
                            {bottomStripVideos.map((video, index) => {
                              const isActive = activeMotionVideo?.signature === video.signature;

                              return (
                                <button
                                  key={`${video.title}-${index}-bottom`}
                                  onClick={() => selectMotionVideo(video.signature)}
                                  className={`group relative h-[112px] w-[208px] shrink-0 overflow-hidden border-r border-white/12 sm:h-[136px] sm:w-[272px] lg:h-[156px] lg:w-[332px] ${
                                    isActive ? 'border-cyan-100/55' : 'hover:border-cyan-100/30'
                                  }`}
                                  aria-label={`Exibir ${video.title}`}
                                >
                                  {video.thumbnailUrl ? (
                                    <img
                                      src={video.thumbnailUrl}
                                      alt={video.title}
                                      className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-78"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-[#1b2233] via-[#1a1129] to-[#121826]" />
                                  )}
                                  <div
                                    className={`absolute inset-0 z-10 transition-all duration-300 ${
                                      isActive ? 'bg-[#0d3249]/68' : 'bg-[#081b27]/84'
                                    } group-hover:bg-[#081b27]/56`}
                                  />
                                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#02070b]/94 via-[#0e3144]/62 to-[#17485f]/36 opacity-100 transition-opacity duration-300 group-hover:opacity-88" />
                                  <div className="absolute inset-0 z-30 flex items-center justify-center">
                                    <span
                                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/34 ${
                                        isActive ? 'border-cyan-100/85 bg-cyan-100/24 text-cyan-50' : 'border-white/55 bg-black/42 text-white'
                                      }`}
                                    >
                                      <Play size={17} className="ml-0.5" />
                                    </span>
                                  </div>
                                  <div className="absolute bottom-3 left-4 right-4 z-30 text-left">
                                    <p className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-white">{video.title}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <motion.section
            className="mt-16 flex justify-center pb-4 pt-8 text-center"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.button
              onClick={() => {
                onClose();
                window.setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 180);
              }}
              className="group inline-flex max-w-4xl flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-center text-[#d7eff7] transition hover:text-white"
              aria-label="Ir para contato"
              whileHover="hover"
            >
              {motionCalloutWords.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="text-2xl font-medium tracking-tight sm:text-4xl"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.55, delay: motionCalloutWords.length * 0.08 }}
                variants={{ hover: { y: -2 } }}
                className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl"
              >
                juntos?
              </motion.span>
            </motion.button>
          </motion.section>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={motionRootRef} className="relative overflow-hidden bg-[#05070d] text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-px bg-white/8">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#d7dee4] via-[#7dd3fc] to-[#fb923c]"
          style={{ scaleX: progressScaleX }}
        />
      </div>

      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,_rgba(125,211,252,0.12),_transparent_28%),radial-gradient(circle_at_86%_12%,_rgba(251,146,60,0.1),_transparent_22%),linear-gradient(180deg,_#070b12_0%,_#05070d_42%,_#090f19_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:128px_128px]" />
        <div className="motion-space-glow-a absolute left-0 top-24 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="motion-space-glow-b absolute right-0 top-20 h-72 w-72 rounded-full bg-orange-300/8 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-24 sm:px-8 xl:px-12 2xl:px-16">
          <div className="mb-12 flex items-center justify-between">
            <span className="motion-space-kicker text-[11px] font-mono uppercase tracking-[0.32em] text-white/46">{threeDTexts.kicker}</span>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/72 transition hover:border-white/28 hover:text-white"
              aria-label="Voltar aos projetos"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </button>
          </div>

          <div>
            <div className="relative max-w-[1180px]">
              <div className="pointer-events-none absolute inset-x-0 top-10 hidden overflow-hidden xl:block">
                <p className="motion-space-word translate-y-10 text-[clamp(6rem,16vw,14rem)] font-black uppercase leading-[0.8] tracking-[-0.12em] text-white/[0.05] blur-[2px]">
                  {threeDTexts.backgroundWord}
                </p>
              </div>

              <div className="space-y-5 md:space-y-6">
                {threeDTexts.titleLines.map((label, index) => (
                  <div key={`${label}-${index}`} className="overflow-hidden py-1 md:py-2">
                    <div className="relative">
                      <p className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 text-[clamp(3.5rem,11vw,9rem)] font-black uppercase tracking-[-0.1em] text-white/[0.06] md:block">
                        {label}
                      </p>
                      <h1
                        className={`motion-space-word relative z-10 text-[clamp(3.8rem,11vw,8.8rem)] font-black uppercase leading-[0.88] tracking-[-0.1em] ${
                          index === threeDTexts.titleLines.length - 1 ? 'text-cyan-100' : 'text-white'
                        }`}
                      >
                        {label}
                      </h1>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="motion-space-copy mt-10 max-w-2xl text-sm leading-relaxed text-white/56 sm:text-base">{shortDescription}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[role, ...(tags ?? []).slice(0, 2)].filter(Boolean).map((item) => (
                <span
                  key={item}
                  className="motion-space-chip rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/74"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
              {techStack?.slice(0, 4).map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>

            <div className="motion-space-stream mt-16 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 [grid-auto-flow:dense]">
              {streamItems.map((item, index) =>
                item.type === 'asset' ? (
                  <MotionMasonryCard
                    key={`${item.asset.src}-${index}`}
                    asset={item.asset}
                    index={index}
                    expanded={expandedAssetSrc === item.asset.src}
                    cardRef={(node) => {
                      assetNodesRef.current[item.asset.src] = node;
                    }}
                    onToggleExpand={() =>
                      setExpandedAssetSrc((current) => (current === item.asset.src ? null : item.asset.src))
                    }
                  />
                ) : (
                  <MotionTextBlock
                    key={item.block.id}
                    eyebrow={item.block.eyebrow}
                    lines={item.block.lines}
                    body={item.block.body}
                    ghost={item.block.ghost}
                    index={index}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ThreeDLayout({ project, scrollYProgress, onClose }: ModalLayoutProps) {
  const { title, shortDescription, role, tags, problem, solution, techStack, images, links, deepDive, features, challenges } = project;
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const mediaGallery = useMemo(() => {
    const media = [images?.hero, ...(images?.gallery ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(media));
  }, [images?.gallery, images?.hero]);

  const activeMedia = mediaGallery[activeMediaIndex] ?? images?.hero;
  const deepDiveBlocks = deepDive?.blocks ?? [];
  const titleWords = title.split(' ');
  const kineticLines = [titleWords[0], titleWords.slice(1, 2).join(' '), titleWords.slice(2).join(' ')].filter(Boolean);

  const kineticBursts = useMemo(
    () =>
      Array.from(new Set([role, ...(tags ?? []).slice(0, 3), ...(techStack ?? []).slice(0, 2)].filter(Boolean) as string[])),
    [role, tags, techStack]
  );

  const rhythmCards = useMemo(
    () => [
      {
        index: '01',
        label: 'Desafio',
        title: 'Do modelo ao enredo',
        body: problem,
        Icon: Box,
      },
      {
        index: '02',
        label: 'Direcao',
        title: 'Spatial storytelling',
        body: solution,
        Icon: MonitorPlay,
      },
      {
        index: '03',
        label: 'Detalhe',
        title: 'Interacao refinada',
        body:
          challenges?.[0] ??
          'Cada hotspot, movimento e bloco textual foi desenhado para manter ritmo de leitura sem comprometer a fluidez da cena.',
        Icon: MousePointerClick,
      },
    ],
    [challenges, problem, solution]
  );

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project.id]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .fromTo('.three-kicker', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(
          '.three-kinetic-line',
          { autoAlpha: 0, yPercent: 110, skewY: 5, filter: 'blur(10px)' },
          { autoAlpha: 1, yPercent: 0, skewY: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.11 },
          '-=0.12'
        )
        .fromTo('.three-lead', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.65 }, '-=0.25')
        .fromTo('.three-chip', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05 }, '-=0.34')
        .fromTo('.three-panel', { autoAlpha: 0, y: 38, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08 }, '-=0.38');

      gsap.to('.three-float-a', { y: -18, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.three-float-b', { y: 14, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, root);

    return () => ctx.revert();
  }, [project.id]);

  return (
    <div ref={rootRef} className="relative overflow-hidden bg-[#04070d] text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-px bg-white/8">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#7dd3fc] via-[#38bdf8] to-[#fb923c]"
          style={{ scaleX: progressScaleX }}
        />
      </div>

      <section className="relative min-h-screen overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_38%),radial-gradient(circle_at_88%_18%,_rgba(251,146,60,0.18),_transparent_22%),linear-gradient(135deg,_#07111d_0%,_#04070d_52%,_#0d1627_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:140px_140px]" />
        <div className="three-float-a absolute -left-14 top-28 h-48 w-48 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="three-float-b absolute right-0 top-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-12 px-6 pb-16 pt-28 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <span className="three-kicker inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.32em] text-white/72">
              <Sparkles size={14} className="text-cyan-200" />
              3D Case Module
            </span>

            <div className="mt-8 space-y-1">
              {kineticLines.map((line, index) => (
                <div key={`${line}-${index}`} className="overflow-hidden">
                  <h1
                    className={`three-kinetic-line text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.08em] ${
                      index === kineticLines.length - 1 ? 'text-cyan-300' : 'text-white'
                    }`}
                  >
                    {line}
                  </h1>
                </div>
              ))}
            </div>

            <p className="three-lead mt-8 max-w-2xl text-base leading-relaxed text-white/74 sm:text-lg">{shortDescription}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {kineticBursts.map((item) => (
                <span
                  key={item}
                  className="three-chip rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/78"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              {links?.live && (
                <a
                  href={links.live}
                  target="_blank"
                  rel="noreferrer"
                  className="three-panel inline-flex items-center gap-3 rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-6 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-100/45 hover:bg-cyan-200/[0.14]"
                >
                  <span>Abrir experimento</span>
                  <ExternalLink size={16} />
                </a>
              )}
              <button
                onClick={onClose}
                className="three-panel inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/84 transition hover:border-white/28 hover:bg-white/[0.08]"
              >
                <span>Voltar aos projetos</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>

          <div className="three-panel relative">
            <div className="absolute -left-5 top-10 hidden rounded-3xl border border-white/12 bg-black/28 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.24em] text-white/62 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md md:block">
              Camera tour
            </div>
            <div className="absolute -bottom-5 right-8 hidden rounded-3xl border border-cyan-100/15 bg-cyan-200/[0.08] px-4 py-3 text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-50 shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-md md:block">
              Hotspots + HUD
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b14]/85 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
              {activeMedia ? (
                <img src={activeMedia} alt={`${title} visual principal`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/40">Visual em preparação</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#050910]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.34em] text-white/42">Rapid Frames</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Texto curto. Ritmo alto. Cena no centro.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
              A referencia de kinetic typography entra aqui como linguagem editorial: headlines grandes, blocos objetivos e intervalos visuais para a cena respirar.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {rhythmCards.map(({ index, label, title: cardTitle, body, Icon }) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48 }}
                viewport={{ once: true, amount: 0.2 }}
                className="three-panel relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0d1626] via-[#09111d] to-[#0b0d14] p-6"
              >
                <span className="pointer-events-none absolute right-5 top-4 text-6xl font-black tracking-[-0.08em] text-white/6">{index}</span>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-3 text-cyan-200">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">{label}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{cardTitle}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/70 sm:text-base">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#04070d]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.34em] text-white/42">Spatial Window</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">O experimento ao vivo entra como prova.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
              Em vez de descrever demais, o case abre uma janela direta para a cena 3D e deixa os blocos ao lado explicarem o por que de cada escolha.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
            <article className="three-panel overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b14]/88 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.07] p-3 text-cyan-100">
                    <Camera size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">Live viewport</p>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">PDV walkthrough</h3>
                  </div>
                </div>
                {links?.live && (
                  <a
                    href={links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/74 transition hover:border-white/28 hover:text-white"
                  >
                    Abrir fullscreen
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                {links?.live ? (
                  <iframe
                    src={links.live}
                    title={`${title} live experiment`}
                    className="aspect-[16/10] w-full"
                    loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center text-sm text-white/40">Experimento indisponivel</div>
                )}
              </div>
            </article>

            <div className="grid gap-4">
              {(deepDiveBlocks.length > 0 ? deepDiveBlocks.slice(0, 3) : []).map((block, index) => (
                <motion.article
                  key={`${block.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="three-panel rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/38">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{block.title}</h3>
                  {block.summary && <p className="mt-3 text-sm leading-relaxed text-white/58">{block.summary}</p>}
                  <p className="mt-4 text-sm leading-relaxed text-white/72">{block.points[0]}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#05080f]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="three-panel">
              <p className="text-[11px] font-mono uppercase tracking-[0.34em] text-white/42">Media Blocks</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Posters e frames para sustentar o discurso.</h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
                Como ainda estamos falando de projeto e apresentação, os visuais editoriais entram como quadros de apoio para explicar camera, fluxo e identidade do case.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {(features ?? []).slice(0, 4).map((feature, index) => (
                  <motion.span
                    key={`${feature}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
              <article className="three-panel overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111d]">
                {activeMedia ? (
                  <img src={activeMedia} alt={`${title} poster ${activeMediaIndex + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center text-sm text-white/40">Sem poster disponivel</div>
                )}
              </article>

              <div className="grid gap-4">
                {mediaGallery.map((media, index) => (
                  <button
                    key={`${media}-${index}`}
                    onClick={() => setActiveMediaIndex(index)}
                    className={`three-panel overflow-hidden rounded-[1.4rem] border text-left transition ${
                      activeMediaIndex === index
                        ? 'border-cyan-100/45 bg-cyan-100/[0.08]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/24'
                    }`}
                  >
                    <img src={media} alt={`${title} miniatura ${index + 1}`} className="h-36 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#06090f_0%,#0a1220_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.34em] text-white/42">System Layer</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Stack e fundamentos para escalar o modulo.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
              O case ja nasce com base para crescer: mais posters, mais capitulos, mais cenas e ate variantes com scroll choreography mais pesada.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <article className="three-panel rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.08] p-3 text-cyan-100">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">Tech stack</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {techStack?.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="rounded-full border border-cyan-100/18 bg-cyan-100/[0.06] px-4 py-2 text-sm text-cyan-50"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              {deepDiveBlocks.slice(0, 4).map((block, index) => (
                <motion.article
                  key={`${block.title}-detail-${index}`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.46, delay: index * 0.05 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="three-panel rounded-[1.7rem] border border-white/10 bg-[#09111c]/88 p-6"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/38">{block.title}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/72">
                    {block.points[1] ?? block.points[0]}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function DesignLayout({ project }: ModalLayoutProps) {
  const { title, shortDescription, role, tags, problem, solution, techStack } = project;

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <motion.div className="relative z-10" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
        <section className="mb-12 rounded-3xl border border-emerald-200/15 bg-gradient-to-br from-[#101e18]/80 via-[#101010]/70 to-[#111912]/80 p-8 backdrop-blur-[1px] sm:p-12">
          <motion.h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl text-emerald-100" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.65 }}>
            {title}
          </motion.h1>
          <motion.p className="mt-6 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.6 }}>
            {shortDescription}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-white/65" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.45 }}>
            {role && <span className="rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1.5 text-emerald-100">{role}</span>}
            {tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-white/12 px-3 py-1.5">
                {tag}
              </span>
            ))}
          </motion.div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.article className="relative overflow-hidden rounded-3xl border border-emerald-200/20 bg-gradient-to-br from-[#101e18]/80 via-[#101010]/70 to-[#111912]/80 p-6 backdrop-blur-[1px] sm:p-8" initial={{ opacity: 0, y: 26, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55 }} viewport={{ once: true, amount: 0.24 }}>
            <span className="pointer-events-none absolute -right-1 top-0 text-7xl font-black text-emerald-100/10 sm:text-8xl">01</span>
            <h3 className="mb-6 text-2xl font-semibold tracking-tight text-emerald-100 sm:text-3xl">Estratégia de Design</h3>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">{problem}</p>
          </motion.article>

          <motion.article className="relative overflow-hidden rounded-3xl border border-emerald-200/20 bg-gradient-to-br from-[#101e18]/80 via-[#101010]/70 to-[#111912]/80 p-6 backdrop-blur-[1px] sm:p-8" initial={{ opacity: 0, y: 26, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55 }} viewport={{ once: true, amount: 0.24 }}>
            <span className="pointer-events-none absolute -right-1 top-0 text-7xl font-black text-emerald-100/10 sm:text-8xl">02</span>
            <h3 className="mb-6 text-2xl font-semibold tracking-tight text-emerald-100 sm:text-3xl">Execução Visual</h3>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">{solution}</p>
          </motion.article>
        </section>

        <motion.article className="mt-6 relative overflow-hidden rounded-3xl border border-emerald-200/20 bg-gradient-to-br from-[#101e18]/80 via-[#101010]/70 to-[#111912]/80 p-6 backdrop-blur-[1px] sm:p-8" initial={{ opacity: 0, y: 26, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55 }} viewport={{ once: true, amount: 0.24 }}>
          <span className="pointer-events-none absolute -right-1 top-0 text-7xl font-black text-emerald-100/10 sm:text-8xl">03</span>
          <h3 className="mb-6 text-2xl font-semibold tracking-tight text-emerald-100 sm:text-3xl">Ferramentas & Metodologia</h3>
          <div className="flex flex-wrap gap-3">
            {techStack?.map((tech, index) => (
              <motion.span key={tech} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: index * 0.04, duration: 0.3 }} className="inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-emerald-100/[0.05] px-3.5 py-2 text-sm text-emerald-50">
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}
