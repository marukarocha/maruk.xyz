import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Compass, LifeBuoy, MapPinned, Play, ShieldCheck, Sunrise, Waves } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type TourCategory = 'mar' | 'trilha' | 'aventura';
interface Tour {
  id: string;
  title: string;
  category: TourCategory;
  duration: string;
  summary: string;
  image: string;
  priceFrom: string;
  experienceWindow: string;
  details: string[];
  gallery: string[];
  video?: string;
}

interface Testimonial {
  quote: string;
  author: string;
}

const WHATSAPP_URL = 'https://wa.me/5571997392215';
const INSTAGRAM_URL = 'https://www.instagram.com/gabrielcruz.tour/';
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${encodeURI(path.replace(/^\/+/, ''))}`;
const passeioAsset = (fileName: string, version = 1) => assetPath(`lab/turism/passeios/${fileName}?v=${version}`);

const heroImages = [
  assetPath('lab/turism/coqueirosmorrowide.jpg?v=3'),
  assetPath('lab/turism/widemorere.jpg?v=3'),
  assetPath('lab/turism/morro-de-sao-paulo-bahia.webp?v=3'),
];
const guideImage = assetPath('lab/turism/GabrielTour.png?v=1');
const VIMEO_PLAYER_URL = 'https://player.vimeo.com/video/803966970?autoplay=1&title=0&byline=0&portrait=0';
const heroGalleryFrames = [
  {
    src: heroImages[0],
    alt: 'Faixa de areia e coqueiros em Morro de Sao Paulo',
    place: 'Segunda Praia',
    slot: 'main',
    rotation: 5,
    drift: -14,
  },
  {
    src: heroImages[1],
    alt: 'Aguas claras em Morere',
    place: 'Morere',
    slot: 'top',
    rotation: -8,
    drift: 16,
  },
  {
    src: heroImages[2],
    alt: 'Vista do farol e mar aberto',
    place: 'Farol',
    slot: 'bottom',
    rotation: 7,
    drift: -18,
  },
  {
    src: assetPath('lab/turism/pordosol.jpg?v=3'),
    alt: 'Por do sol em tons dourados na Gamboa',
    place: 'Gamboa',
    slot: 'accent',
    rotation: -6,
    drift: 12,
  },
] as const;

const tours: Tour[] = [
  {
    id: 'volta-ilha',
    title: 'Volta a Ilha',
    category: 'mar',
    duration: '7 a 8 horas',
    summary: 'Piscinas naturais, Boipeba e pontos exclusivos em um roteiro completo com paisagens cinematograficas.',
    image: passeioAsset('Volta a Ilha.jpeg'),
    priceFrom: 'A partir de R$ 220 por pessoa',
    experienceWindow: 'Saida pela manha',
    details: [
      'Paradas em Garapua e Morere.',
      'Pausa para almoco em Boipeba.',
      'Som e cooler a bordo para um passeio mais confortavel.',
    ],
    gallery: [
      passeioAsset('piscinasNaturais.jpg'),
      passeioAsset('praia-de-garapua.jpg'),
      passeioAsset('Barflutuante.webp'),
    ],
  },
  {
    id: 'off-road',
    title: 'Off-Road Manguezal',
    category: 'trilha',
    duration: 'Meio periodo',
    summary: '4x4 e caiaque em uma experiencia que mistura aventura, cultura local e natureza em aguas cristalinas.',
    image: passeioAsset('OffRoad.jpeg'),
    priceFrom: 'A partir de R$ 180 por pessoa',
    experienceWindow: 'Conforme mare',
    details: [
      'Trecho em 4x4 por trilhas de coqueirais.',
      'Experiencia de caiaque pelo manguezal.',
      'Narrativa local sobre historia e cultura da ilha.',
    ],
    gallery: [
      passeioAsset('OffRoad1.jpeg'),
      passeioAsset('OffRoad2.jpeg'),
      passeioAsset('offroad3.webp'),
    ],
  },
  {
    id: 'bike',
    title: 'Bike Mangaba + Encanto',
    category: 'trilha',
    duration: '15 km',
    summary: 'Pedalada guiada no melhor horario de mare baixa com retorno beira-mar e visual inesquecivel.',
    image: passeioAsset('passeiobike.jpg'),
    priceFrom: 'A partir de R$ 140 por pessoa',
    experienceWindow: 'Mare baixa',
    details: [
      'Pedalada em ritmo confortavel para grupos.',
      'Passagem pelo vilarejo Zimbo.',
      'Retorno pela beira-mar com vista aberta da ilha.',
    ],
    gallery: [
      passeioAsset('passerio-bike.jpg'),
      passeioAsset('passeiobike.jpg'),
      assetPath('lab/turism/widemorere.jpg?v=3'),
    ],
  },
  {
    id: 'quadriciclo',
    title: 'Quadriciclo para Garapua',
    category: 'aventura',
    duration: 'Passeio em grupo',
    summary: 'Rota para quem quer liberdade e adrenalina com briefing, apoio local e parada em praias icones.',
    image: passeioAsset('quadriciclo.jpg'),
    priceFrom: 'A partir de R$ 250 por quadriciclo',
    experienceWindow: 'Turnos diarios',
    details: [
      'Passeio guiado com orientacao inicial.',
      'Quadriciclo para ate 2 pessoas.',
      'Necessario habilitacao para conduzir.',
    ],
    gallery: [
      passeioAsset('quadriciclo2.jpg'),
      passeioAsset('quadriciclo.webp'),
      passeioAsset('praia-de-garapua2.jpg'),
    ],
  },
  {
    id: 'por-sol',
    title: 'Por do Sol Gamboa',
    category: 'mar',
    duration: 'Fim da tarde',
    summary: 'Lancha exclusiva em grupos pequenos para assistir ao por do sol tocando o mar da Gamboa.',
    image: passeioAsset('pordosolgamboa.jpg'),
    priceFrom: 'A partir de R$ 160 por pessoa',
    experienceWindow: 'Saida no fim da tarde',
    details: [
      'Passeio intimista em grupos pequenos.',
      'Vista para falesias e mar aberto.',
      'Tempo ideal para fotos no golden hour.',
    ],
    gallery: [
      passeioAsset('pordosolgamboa2.jpg'),
      passeioAsset('pordosolgamboa3.jpg'),
      assetPath('lab/turism/pordosol.jpg?v=3'),
    ],
  },
  {
    id: 'tirolesa',
    title: 'Tirolesa do Farol',
    category: 'aventura',
    duration: '10h as 17h',
    summary: 'Descida de 340 metros saindo de um dos cenarios mais iconicos de Morro de Sao Paulo.',
    image: passeioAsset('Farol-do-Morro-tirolesa.jpg'),
    priceFrom: 'A partir de R$ 90 por pessoa',
    experienceWindow: 'Funcionamento diario',
    details: [
      'Partida do farol a 57 metros de altura.',
      'Percurso completo ate a Primeira Praia.',
      'Experiencia perfeita para quem curte aventura rapida.',
    ],
    gallery: [
      passeioAsset('Tirolesa.jpg'),
      passeioAsset('Tirolesa2.jpg'),
      passeioAsset('Tirolesa3.webp'),
    ],
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'Minha experiencia com Gabriel Gruia sempre foi incrivel. Ja fui mais uma vez e sempre a mesma experiencia incrivel. Atendimento deles e encantador. Sem duvidas, voltarei mais vezes com Gabriel Gruia.',
    author: 'Daniel Pimenta',
  },
  {
    quote:
      'Estava com receio por que ja tive problemas com outras agencias, mas com Gabriel Gruia deu tudo certo, saiu nos horarios combinados e nao teve nenhum atraso, tanto na ida, quanto na volta.',
    author: 'Adauana Santos',
  },
  {
    quote:
      'Eu e minha familia tivemos uma experiencia maravilhosa, toda receptividade desde a hora que comecou o passeio ate o final.',
    author: 'Camila Cipriano',
  },
];

const categoryLabelMap: Record<TourCategory, string> = {
  mar: 'Mar',
  trilha: 'Trilha',
  aventura: 'Aventura',
};

const guideHighlights = [
  {
    icon: ShieldCheck,
    title: 'Operacao segura',
    body: 'Equipe credenciada e rotas planejadas conforme mar e clima.',
  },
  {
    icon: MapPinned,
    title: 'Guias locais',
    body: 'Leitura cultural da ilha com experiencia real de quem vive o destino.',
  },
  {
    icon: Waves,
    title: 'Roteiro sem estresse',
    body: 'Horarios respeitados e suporte rapido.',
  },
] as const;

const faqItems = [
  {
    title: 'Como funciona a reserva do passeio?',
    body: 'Voce chama no WhatsApp, confirma o roteiro ideal para seu perfil e recebe orientacoes sobre horario, ponto de encontro e pagamento.',
  },
  {
    title: 'Os roteiros mudam conforme mare e clima?',
    body: 'Sim. Gabriel ajusta a operacao de acordo com as condicoes do dia para preservar seguranca, conforto e a melhor experiencia visual.',
  },
  {
    title: 'Atendem casal, familia e grupo?',
    body: 'Sim. Os roteiros podem ser pensados para casal, familia, pequenos grupos e viajantes que querem atendimento mais proximo e personalizado.',
  },
] as const;

const EditorialImageCluster = ({
  mainImage,
  topImage,
  bottomImage,
}: {
  mainImage: { src: string; alt: string };
  topImage: { src: string; alt: string };
  bottomImage: { src: string; alt: string };
}) => (
  <div data-editorial-cluster className="gabriel-editorial-cluster">
    <div data-editorial-piece className="gabriel-editorial-card gabriel-editorial-card-main">
      <img src={mainImage.src} alt={mainImage.alt} loading="lazy" className="h-full w-full object-cover" />
    </div>

    <div data-editorial-piece className="gabriel-editorial-card gabriel-editorial-card-top">
      <img src={topImage.src} alt={topImage.alt} loading="lazy" className="h-full w-full object-cover" />
    </div>

    <div data-editorial-piece className="gabriel-editorial-card gabriel-editorial-card-bottom">
      <img src={bottomImage.src} alt={bottomImage.alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  </div>
);

const LomoHeroGallery = () => (
  <div className="gabriel-lomo-gallery">
    <div className="gabriel-lomo-glow gabriel-lomo-glow-left" />
    <div className="gabriel-lomo-glow gabriel-lomo-glow-right" />

    {heroGalleryFrames.map((frame, index) => (
      <figure
        key={frame.place}
        className={`gabriel-lomo-card gabriel-lomo-card-${frame.slot} gabriel-float`}
        style={{
          animationDelay: `${index * 0.35}s`,
          rotate: `${frame.rotation}deg`,
          ['--card-drift' as string]: `${frame.drift}px`,
        }}
      >
        <div data-hero-card className="gabriel-lomo-card-motion">
          <div className="gabriel-lomo-photo">
            <img src={frame.src} alt={frame.alt} loading="eager" className="h-full w-full object-cover" />
          </div>
          <figcaption className="gabriel-lomo-caption">{frame.place}</figcaption>
        </div>
      </figure>
    ))}
  </div>
);

const moleculeWavePath =
  'M520 165C566 214 588 284 576 350C563 425 518 495 444 528C380 555 311 560 246 542C170 521 101 474 75 399C50 326 64 247 106 189C149 129 216 94 285 82C366 67 459 99 520 165Z';

const moleculeWaveLines = [
  {
    scale: 0.8,
    className: 'gabriel-molecule-line-1',
    strokeWidth: 1.15,
    filterId: 'gabriel-molecule-filter-1',
    turbulenceBase: '0.008 0.02',
    turbulenceTo: '0.018 0.035',
    displacementBase: '9',
    displacementTo: '15',
    duration: '8s',
  },
  {
    scale: 0.9,
    className: 'gabriel-molecule-line-2',
    strokeWidth: 1.85,
    filterId: 'gabriel-molecule-filter-2',
    turbulenceBase: '0.01 0.024',
    turbulenceTo: '0.021 0.04',
    displacementBase: '11',
    displacementTo: '18',
    duration: '9.6s',
  },
  {
    scale: 1.02,
    className: 'gabriel-molecule-line-3',
    strokeWidth: 2.35,
    filterId: 'gabriel-molecule-filter-3',
    turbulenceBase: '0.012 0.028',
    turbulenceTo: '0.024 0.044',
    displacementBase: '13',
    displacementTo: '20',
    duration: '10.8s',
  },
  {
    scale: 1.14,
    className: 'gabriel-molecule-line-4',
    strokeWidth: 3,
    filterId: 'gabriel-molecule-filter-4',
    turbulenceBase: '0.013 0.03',
    turbulenceTo: '0.026 0.048',
    displacementBase: '14',
    displacementTo: '22',
    duration: '12s',
  },
] as const;

const MoleculeWaveBackground = () => (
  <div className="gabriel-molecule" aria-hidden="true">
    <svg className="gabriel-molecule-svg" viewBox="0 0 640 640" preserveAspectRatio="xMidYMid meet">
      <defs>
        {moleculeWaveLines.map((item) => (
          <filter
            key={item.filterId}
            id={item.filterId}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={item.turbulenceBase}
              numOctaves="2"
              seed="8"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur={item.duration}
                values={`${item.turbulenceBase}; ${item.turbulenceTo}; ${item.turbulenceBase}`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={item.displacementBase} xChannelSelector="R" yChannelSelector="B">
              <animate
                attributeName="scale"
                dur={item.duration}
                values={`${item.displacementBase}; ${item.displacementTo}; ${item.displacementBase}`}
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        ))}
      </defs>

      {moleculeWaveLines.map((item) => (
        <g key={item.className} transform={`translate(320 320) scale(${item.scale}) translate(-320 -320)`}>
          <g data-molecule-line className={`gabriel-molecule-line ${item.className}`}>
            <path
              data-molecule-path
              d={moleculeWavePath}
              fill="none"
              style={{ strokeWidth: item.strokeWidth }}
              filter={`url(#${item.filterId})`}
            />
          </g>
        </g>
      ))}
    </svg>
  </div>
);

const TourArcBackground = () => (
  <div className="gabriel-tour-arc-background" aria-hidden="true">
    <svg className="gabriel-tour-arc-background-svg" viewBox="0 0 640 640" preserveAspectRatio="xMidYMid meet">
      <defs>
        {moleculeWaveLines.map((item, index) => (
          <filter
            key={`tour-${item.filterId}`}
            id={`tour-${item.filterId}`}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={item.turbulenceBase}
              numOctaves="2"
              seed={`${12 + index}`}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur={item.duration}
                values={`${item.turbulenceBase}; ${item.turbulenceTo}; ${item.turbulenceBase}`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={item.displacementBase} xChannelSelector="R" yChannelSelector="B">
              <animate
                attributeName="scale"
                dur={item.duration}
                values={`${item.displacementBase}; ${item.displacementTo}; ${item.displacementBase}`}
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        ))}
      </defs>

      {moleculeWaveLines.map((item, index) => (
        <g
          key={`tour-line-${item.className}`}
          transform={`translate(320 320) scale(${0.78 + index * 0.1}) translate(-320 -320)`}
          className={`gabriel-tour-arc-background-line gabriel-tour-arc-background-line-${index + 1}`}
        >
          <path
            data-tour-arc-path
            className={`gabriel-tour-arc-background-path gabriel-tour-arc-background-path-${index + 1}`}
            d={moleculeWavePath}
            filter={`url(#tour-${item.filterId})`}
          />
        </g>
      ))}
    </svg>
  </div>
);

const TourArcSlider = ({
  items,
  onSelect,
}: {
  items: Tour[];
  onSelect: (tour: Tour) => void;
}) => (
  <div className="gabriel-tour-arc-shell">
    <TourArcBackground />
    <div className="gabriel-tour-arc-sticky">
      <div data-tour-arc-rail className="gabriel-tour-arc-rail">
        {items.map((tour) => (
          <article key={tour.id} data-tour-arc-card className="gabriel-tour-arc-card">
            <button type="button" onClick={() => onSelect(tour)} className="gabriel-tour-arc-card-inner">
              <div className="gabriel-tour-arc-image">
                <img src={tour.image} alt={tour.title} className="h-full w-full object-cover" />
              </div>
              <div className="gabriel-tour-arc-copy">
                <h3 className="gabriel-title text-base gabriel-strong-text md:text-lg">{tour.title}</h3>
              </div>
            </button>
          </article>
        ))}
      </div>
    </div>
  </div>
);

const TourDetailContent = ({ tour }: { tour: Tour }) => (
  <div className="grid h-full gap-0 lg:grid-cols-[0.92fr_1.08fr]">
    <div className="flex h-full flex-col">
      <div className="relative z-[1]">
        <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover md:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#c7dbf4]/60 to-transparent" />
      </div>

      <div className="relative z-[1] flex-1 p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#b1cbed] bg-[#eff5ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] gabriel-chip-text">
            {categoryLabelMap[tour.category]}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] gabriel-chip-text">{tour.duration}</span>
        </div>

        <h3 className="gabriel-title text-2xl gabriel-strong-text md:text-[2rem]">{tour.title}</h3>
        <p className="mt-3 text-sm leading-relaxed gabriel-soft-text md:text-base">{tour.summary}</p>
        <p className="mt-4 text-sm font-semibold text-[#2e7dff] md:text-base">{tour.priceFrom}</p>
        <p className="text-xs uppercase tracking-[0.13em] gabriel-chip-text">{tour.experienceWindow}</p>
      </div>
    </div>

    <div className="gabriel-tour-glass-pane h-full border-t border-[rgba(200,217,240,0.82)] px-5 py-5 md:px-6 lg:border-l lg:border-t-0">
      <div className="grid h-full gap-5">
        <div>
          <h4 className="gabriel-title text-lg gabriel-strong-text">Detalhes da experiencia</h4>
          <ul className="mt-3 grid gap-2 text-sm gabriel-soft-text">
            {tour.details.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2e7dff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 rounded-full bg-[#2e7dff] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-transform hover:-translate-y-0.5"
          >
            Reservar este passeio
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {tour.gallery.map((image, galleryIndex) => (
              <div key={`${tour.id}-gallery-${galleryIndex}`} className="overflow-hidden rounded-xl border border-[#c8d9f0] bg-white">
                <img src={image} alt={`${tour.title} galeria ${galleryIndex + 1}`} className="h-20 w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="gabriel-tour-video-frame">
            {tour.video ? (
              <video
                src={tour.video}
                controls
                muted
                playsInline
                preload="none"
                className="gabriel-tour-video"
              />
            ) : (
              <div className="gabriel-tour-media-fallback">
                <img
                  src={tour.gallery[0] ?? tour.image}
                  alt={`${tour.title} destaque`}
                  className="gabriel-tour-video"
                />
                <div className="gabriel-tour-media-copy">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">galeria do passeio</p>
                    <p className="mt-1 text-sm font-semibold text-white">Mais fotos reais do roteiro enquanto o video nao entra.</p>
                  </div>
                  <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur">
                    fotos reais
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TourismGuideLab = () => {
  const initialTourId = tours[tours.length - 1]?.id ?? null;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const selectedTourPanelRef = useRef<HTMLElement | null>(null);
  const tourLayerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tourTransitionRef = useRef<gsap.core.Timeline | null>(null);
  const isTourTransitioningRef = useRef(false);
  const pendingTourIdRef = useRef<string | null>(null);
  const activeTourIdRef = useRef<string | null>(initialTourId);
  const hasTours = tours.length > 0;

  const scrollToTourDetails = () => {
    const scroller = rootRef.current;
    const target = selectedTourPanelRef.current;

    if (!scroller || !target) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = scroller.scrollTop + targetRect.top - scrollerRect.top - 28;

    scroller.scrollTo({ top, behavior: 'smooth' });
  };

  const showTourLayer = (tourId: string, source: 'scroll' | 'click' | 'initial' = 'scroll') => {
    const incomingLayer = tourLayerRefs.current[tourId];
    const allLayers = Object.values(tourLayerRefs.current).filter((layer): layer is HTMLDivElement => Boolean(layer));
    const currentTourId = activeTourIdRef.current;
    const outgoingLayer = currentTourId ? tourLayerRefs.current[currentTourId] : null;

    if (!incomingLayer || !allLayers.length) return;

    if (currentTourId === tourId || source === 'initial') {
      tourTransitionRef.current?.kill();
      gsap.set(allLayers, { autoAlpha: 0, y: 0, visibility: 'hidden', pointerEvents: 'none' });
      gsap.set(incomingLayer, { autoAlpha: 1, y: 0, visibility: 'visible', pointerEvents: 'auto' });
      activeTourIdRef.current = tourId;
      isTourTransitioningRef.current = false;
      pendingTourIdRef.current = null;
      return;
    }

    if (isTourTransitioningRef.current) {
      pendingTourIdRef.current = tourId;
      return;
    }

    tourTransitionRef.current?.kill();
    isTourTransitioningRef.current = true;
    gsap.set(allLayers, { pointerEvents: 'none' });
    gsap.set(incomingLayer, { autoAlpha: 0, y: 20, scale: 0.985, visibility: 'visible' });

    const transition = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        gsap.set(allLayers, { autoAlpha: 0, y: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(incomingLayer, { autoAlpha: 1, y: 0, scale: 1, visibility: 'visible', pointerEvents: 'auto' });
        activeTourIdRef.current = tourId;
        isTourTransitioningRef.current = false;

        if (pendingTourIdRef.current && pendingTourIdRef.current !== tourId) {
          const nextTourId = pendingTourIdRef.current;
          pendingTourIdRef.current = null;
          requestAnimationFrame(() => {
            showTourLayer(nextTourId, 'scroll');
          });
          return;
        }

        pendingTourIdRef.current = null;
      },
    });

    if (outgoingLayer) {
      transition.to(
        outgoingLayer,
        { autoAlpha: 0, y: -18, scale: 1.015, duration: 0.22, ease: 'power1.out' },
        0,
      );
    }

    transition.to(
      incomingLayer,
      { autoAlpha: 1, y: 0, scale: 1, duration: source === 'click' ? 0.34 : 0.3, ease: 'power2.out' },
      0.08,
    );
    tourTransitionRef.current = transition;
  };

  const handleTourArcSelect = (tour: Tour) => {
    showTourLayer(tour.id, 'click');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTourDetails();
      });
    });
  };

  useEffect(() => {
    const preloaders = tours
      .flatMap((tour) => [tour.image, ...tour.gallery])
      .map((src) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
        return image;
      });

    return () => {
      preloaders.forEach((image) => {
        image.src = '';
      });
    };
  }, []);

  useEffect(() => {
    if (!initialTourId) return;
    requestAnimationFrame(() => {
      showTourLayer(initialTourId, 'initial');
    });
    return () => {
      tourTransitionRef.current?.kill();
    };
  }, [initialTourId]);

  useEffect(() => {
    if (!rootRef.current || !heroSectionRef.current) return;

    const ctx = gsap.context(() => {
      const scroller = rootRef.current ?? undefined;
      const heroCards = gsap.utils.toArray<HTMLElement>('[data-hero-card]');
      const heroText = gsap.utils.toArray<HTMLElement>('[data-hero-text]');
      const scrollBlocks = gsap.utils.toArray<HTMLElement>('[data-scroll-fade]');
      const editorialPieces = gsap.utils.toArray<HTMLElement>('[data-editorial-piece]');
      const videoCues = gsap.utils.toArray<HTMLElement>('[data-video-cue]');
      const heroGalleryWrap = rootRef.current?.querySelector<HTMLElement>('[data-hero-gallery-wrap]');
      const guideTitle = rootRef.current?.querySelector<HTMLElement>('[data-guide-title]');
      const guideSection = rootRef.current?.querySelector<HTMLElement>('[data-guide-section]');
      const guidePinTarget = rootRef.current?.querySelector<HTMLElement>('[data-guide-pin]');
      const guideVisualInner = rootRef.current?.querySelector<HTMLElement>('[data-guide-visual-inner]');
      const guideFeatures = gsap.utils.toArray<HTMLElement>('[data-guide-feature]');
      const moleculePaths = gsap.utils.toArray<SVGPathElement>('[data-molecule-path]');
      const tourArcSection = rootRef.current?.querySelector<HTMLElement>('[data-tour-arc-section]');
      const tourArcPinTarget = rootRef.current?.querySelector<HTMLElement>('[data-tour-arc-pin]');
      const tourArcBackground = rootRef.current?.querySelector<HTMLElement>('.gabriel-tour-arc-background');
      const tourArcCards = gsap.utils.toArray<HTMLElement>('[data-tour-arc-card]');
      const tourArcTitle = rootRef.current?.querySelector<HTMLElement>('[data-tour-arc-title]');
      const tourArcLead = rootRef.current?.querySelector<HTMLElement>('[data-tour-arc-lead]');
      const tourArcPaths = gsap.utils.toArray<SVGPathElement>('[data-tour-arc-path]');
      const tourPanelSection = rootRef.current?.querySelector<HTMLElement>('[data-tour-panel-section]');
      const tourPanelPinTarget = rootRef.current?.querySelector<HTMLElement>('[data-tour-panel-pin]');

      gsap.set(heroCards, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(heroText, { autoAlpha: 0, y: 18 });

      gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: heroSectionRef.current,
          scroller,
          start: 'top 80%',
          end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
      })
        .to(heroText, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
        .from(
          heroCards,
          { y: 42, scale: 0.96, duration: 0.95, stagger: 0.13, ease: 'power3.out' },
          0.08,
        );

      heroCards.forEach((card, index) => {
        gsap.to(card, {
          y: index === 1 ? -16 : index === 2 ? 14 : -8,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      if (heroGalleryWrap && guideSection && guidePinTarget && window.matchMedia('(min-width: 1024px)').matches) {
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          scroller,
          start: 'top 10%',
          end: '+=1200',
          pin: heroGalleryWrap,
          pinSpacing: false,
        });

        ScrollTrigger.create({
          trigger: guideSection,
          scroller,
          start: 'center center',
          end: '+=1000',
          pin: guidePinTarget,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        heroCards.forEach((card, index) => {
          gsap.set(card, {
            rotation: 0,
            scale: 1,
            autoAlpha: 1,
          });

          gsap.to(card, {
            y: 236 + index * 42,
            rotation: index % 2 === 0 ? -11 : 11,
            scale: Math.max(0.02, 0.08 - index * 0.01),
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: guideSection,
              scroller,
              start: 'top 70%',
              end: '+=360',
              scrub: 1.2,
            },
          });
        });
      }

      scrollBlocks.forEach((block) => {
        if (guideSection && block === guideSection) return;

        gsap.fromTo(
          block,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: block,
              scroller,
              start: 'top 88%',
              end: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      editorialPieces.forEach((piece, index) => {
        gsap.to(piece, {
          y: index === 0 ? -12 : index === 1 ? 14 : -14,
          rotation: 0,
          ease: 'sine.inOut',
          scrollTrigger: {
            trigger: piece,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      if (guideTitle && guideSection) {
        gsap.set(guideTitle, { autoAlpha: 0, y: -150 });

        gsap.fromTo(
          guideTitle,
          { y: -150, autoAlpha: 0 },
          {
            y: -8,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: guideSection,
              scroller,
              start: 'top 90%',
              end: 'top 34%',
              scrub: 1,
            },
          },
        );
      }

      if (moleculePaths.length && guideSection) {
        moleculePaths.forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            autoAlpha: 1,
          });
        });

        const moleculeTl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: guideSection,
            scroller,
            start: 'top 82%',
            end: 'top 42%',
            scrub: 0.9,
          },
        });

        moleculeTl.to(
          moleculePaths,
          {
            strokeDashoffset: 0,
            duration: 1,
            stagger: 0.12,
          },
          0,
        );
      }

      if (guideVisualInner && guideSection) {
        gsap.fromTo(
          guideVisualInner,
          { autoAlpha: 0, scale: 1.18 },
          {
            autoAlpha: 1,
            scale: 1.22,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: guideSection,
              scroller,
              start: 'top 88%',
              end: 'top 52%',
              scrub: 0.9,
            },
          },
        );
      }

      if (guideFeatures.length && guideSection) {
        gsap.set(guideFeatures, { autoAlpha: 0, y: 36, scale: 0.94 });
        gsap.to(guideFeatures, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: guideSection,
            scroller,
            start: 'center center',
            end: '+=220',
            scrub: 1,
          },
        });
      }

      videoCues.forEach((cue, index) => {
        gsap.to(cue, {
          scale: index === 0 ? 1.08 : 0.96,
          opacity: index === 0 ? 0.95 : 0.65,
          repeat: -1,
          yoyo: true,
          duration: 1.8 + index * 0.2,
          ease: 'sine.inOut',
        });
      });

      if (tourArcSection && tourArcPinTarget && tourArcCards.length && tourPanelSection && tourPanelPinTarget) {
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const stepX = isDesktop ? 228 : 142;
        const baseDrop = isDesktop ? 46 : 34;
        const introStartProgress = -0.58;
        const detailPinDistance = Math.max(isDesktop ? 1320 : 960, tours.length * (isDesktop ? 220 : 170));

        const setArcState = (progress: number, introProgress = 1) => {
          const maxIndex = Math.max(tourArcCards.length - 1, 1);
          const active = (1 - progress) * maxIndex;

          tourArcCards.forEach((card, index) => {
            const offset = index - active;
            const distance = Math.min(Math.abs(offset), 3.6);
            const x = offset * stepX;
            const y = Math.pow(distance, 1.7) * baseDrop + (isDesktop ? 24 : 18);
            const rotation = offset * 7.5;
            const baseScale = Math.max(0.72, 1.1 - distance * 0.12);
            const scale = gsap.utils.interpolate(0.7, baseScale, introProgress);
            const opacity = gsap.utils.interpolate(0, Math.max(0.18, 1 - distance * 0.22), introProgress);
            const blur = Math.max(0, distance - 1.2) * 1.4;
            const startY = isDesktop ? 338 + index * 20 : 256 + index * 18;
            const lift = Math.sin(introProgress * Math.PI) * (isDesktop ? 154 : 108);
            const introY = gsap.utils.interpolate(startY, y, introProgress) - lift;
            const introRotation = gsap.utils.interpolate(-90 + index * 3, rotation, introProgress);

            gsap.set(card, {
              xPercent: -50,
              x,
              y: introY,
              rotation: introRotation,
              scale,
              autoAlpha: opacity,
              zIndex: 40 - Math.round(distance * 10),
              filter: `blur(${blur}px)`,
            });
          });
        };

        const syncTourFromProgress = (progress: number) => {
          const maxIndex = Math.max(tours.length - 1, 0);
          const clamped = gsap.utils.clamp(0, 1, progress);
          const rawIndex = (1 - clamped) * maxIndex;
          const nextIndex = Math.round(rawIndex);
          const nextTour = tours[nextIndex];
          const currentIndex = tours.findIndex((tour) => tour.id === activeTourIdRef.current);

          if (
            currentIndex !== -1 &&
            nextIndex !== currentIndex &&
            Math.abs(rawIndex - currentIndex) < 0.38
          ) {
            return;
          }

          if (!nextTour || activeTourIdRef.current === nextTour.id) return;

          showTourLayer(nextTour.id, 'scroll');
        };

        setArcState(introStartProgress, 0);
        if (tourArcBackground) {
          gsap.set(tourArcBackground, { y: 0, opacity: 0.78 });
        }

        const tourArcTextNodes = [tourArcTitle, tourArcLead].filter((node): node is HTMLElement => Boolean(node));
        if (tourArcTextNodes.length) {
          gsap.set(tourArcTextNodes, { autoAlpha: 0, y: 28 });
        }

        if (tourArcPaths.length) {
          tourArcPaths.forEach((path) => {
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
              autoAlpha: 0.22,
            });
          });
        }

        ScrollTrigger.create({
          trigger: tourArcSection,
          scroller,
          start: 'top 88%',
          endTrigger: tourPanelSection,
          end: 'top 24%',
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const textProgress = gsap.utils.clamp(0, 1, self.progress * 1.08);
            const introProgress = gsap.utils.clamp(0, 1, self.progress * 1.12);
            const pathProgress = gsap.utils.interpolate(introStartProgress, 0, introProgress);

            if (tourArcTitle) {
              gsap.set(tourArcTitle, {
                autoAlpha: textProgress,
                y: gsap.utils.interpolate(26, 0, textProgress),
              });
            }

            if (tourArcLead) {
              const leadTextProgress = gsap.utils.clamp(0, 1, (textProgress - 0.08) / 0.92);
              gsap.set(tourArcLead, {
                autoAlpha: leadTextProgress,
                y: gsap.utils.interpolate(18, 0, leadTextProgress),
              });
            }

            setArcState(pathProgress, introProgress);
            syncTourFromProgress(pathProgress);
          },
        });

        ScrollTrigger.create({
          trigger: tourPanelSection,
          pin: tourPanelPinTarget,
          scroller,
          start: 'top 24%',
          end: `+=${detailPinDistance}`,
          pinSpacing: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const detailProgress = gsap.utils.clamp(0, 1, self.progress);
            const backdropProgress = gsap.utils.clamp(0, 1, detailProgress / 0.28);

            setArcState(detailProgress, 1);
            syncTourFromProgress(detailProgress);

            if (tourArcBackground) {
              gsap.set(tourArcBackground, {
                y: gsap.utils.interpolate(0, isDesktop ? 236 : 158, backdropProgress),
                opacity: gsap.utils.interpolate(0.78, 0.56, backdropProgress),
              });
            }
          },
        });

        ScrollTrigger.create({
          trigger: tourPanelSection,
          pin: tourArcPinTarget,
          scroller,
          start: 'top 24%',
          end: `+=${detailPinDistance}`,
          pinSpacing: false,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        });

        if (tourArcPaths.length) {
          ScrollTrigger.create({
            trigger: tourArcSection,
            scroller,
            start: 'top bottom',
            end: 'top 42%',
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const pathProgress = gsap.utils.clamp(0, 1, self.progress * 1.15);

              tourArcPaths.forEach((path, index) => {
                const length = path.getTotalLength();
                const localProgress = gsap.utils.clamp(0, 1, pathProgress * 1.08 - index * 0.08);

                gsap.set(path, {
                  strokeDashoffset: length * (1 - localProgress),
                  autoAlpha: gsap.utils.interpolate(0.12, 0.42, localProgress),
                });
              });
            },
          });
        }
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="gabriel-lp relative h-full overflow-x-hidden overflow-y-auto bg-[#f8fbff] text-[#071a2e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Fraunces:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

        .gabriel-lp {
          --brand-card-soft: #ffffff;
          --brand-border: #c8d9f0;
          --brand-cyan: #1f5fd1;
          --brand-sand: #1f5fd1;
          width: 100%;
          overflow-x: clip;
          font-family: "DM Sans", "Segoe UI", sans-serif;
          color: #071a2e;
          background-image:
            radial-gradient(circle at 12% 10%, rgba(80, 145, 255, 0.18), transparent 34%),
            radial-gradient(circle at 88% 92%, rgba(66, 124, 219, 0.12), transparent 30%),
            linear-gradient(130deg, #f9fcff 0%, #f4f9ff 45%, #eef5ff 100%);
        }

        .gabriel-lp > div {
          overflow-x: visible;
        }

        .gabriel-lp :where(h1, h2, h3, h4, h5, h6, p, li, label, summary) {
          color: #071a2e;
        }

        .gabriel-lp .gabriel-soft-text {
          color: #17385f;
        }

        .gabriel-lp .gabriel-strong-text {
          color: #071a2e;
        }

        .gabriel-lp .gabriel-chip-text {
          color: #0c2d57;
        }

        .gabriel-lp .gabriel-button-solid {
          color: #ffffff;
        }

        .gabriel-title {
          font-family: "Sora", "Segoe UI", sans-serif;
          letter-spacing: -0.02em;
        }

        .gabriel-editorial-title {
          font-family: "Fraunces", Georgia, serif;
          letter-spacing: -0.05em;
        }

        .gabriel-grid {
          background-image:
            linear-gradient(rgba(89, 142, 218, 0.11) 1px, transparent 1px),
            linear-gradient(90deg, rgba(89, 142, 218, 0.11) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at center, black 34%, transparent 92%);
          opacity: 0.4;
        }

        .gabriel-reveal {
          opacity: 0;
          transform: translateY(24px);
          animation: gabriel-reveal 0.7s ease forwards;
        }

        .gabriel-float {
          animation: gabriel-float 9s ease-in-out infinite;
        }

        .gabriel-outline {
          position: absolute;
          border: 1px solid rgba(70, 129, 219, 0.35);
          border-radius: 0;
          pointer-events: none;
        }

        .gabriel-hero-card {
          overflow: hidden;
          border-radius: 9999px;
          border: 0;
          box-shadow: none;
          background: transparent;
        }

        .gabriel-lomo-gallery {
          position: relative;
          min-height: 34rem;
          width: calc(100% + 3rem);
          margin-left: -0.5rem;
          overflow: visible;
        }

        .gabriel-lomo-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(30px);
          opacity: 0.6;
          pointer-events: none;
        }

        .gabriel-lomo-glow-left {
          left: 6%;
          top: 10%;
          width: 12rem;
          height: 12rem;
          background: rgba(95, 157, 255, 0.16);
        }

        .gabriel-lomo-glow-right {
          right: 4%;
          bottom: 8%;
          width: 14rem;
          height: 14rem;
          background: rgba(28, 92, 195, 0.14);
        }

        .gabriel-lomo-card {
          position: absolute;
          width: 13rem;
          transform-origin: center;
        }

        .gabriel-lomo-card-motion {
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(198, 214, 238, 0.95);
          border-radius: 2px;
          padding: 0.8rem 0.8rem 1rem;
          box-shadow: 0 20px 45px rgba(29, 78, 155, 0.14);
        }

        .gabriel-lomo-photo {
          overflow: hidden;
          border-radius: 0.45rem;
          background: #dbeaff;
        }

        .gabriel-lomo-caption {
          margin-top: 0.8rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0c2d57;
        }

        .gabriel-lomo-card .gabriel-lomo-photo {
          height: 11rem;
        }

        .gabriel-lomo-card-main {
          top: -0.5rem;
          right: -2%;
          width: 19rem;
        }

        .gabriel-lomo-card-main .gabriel-lomo-photo {
          height: 15.5rem;
        }

        .gabriel-lomo-card-top {
          top: 1.5rem;
          left: 0;
          width: 12rem;
        }

        .gabriel-lomo-card-top .gabriel-lomo-photo {
          height: 12rem;
        }

        .gabriel-lomo-card-bottom {
          bottom: 0.75rem;
          left: 18%;
          width: 14rem;
        }

        .gabriel-lomo-card-bottom .gabriel-lomo-photo {
          height: 11.5rem;
        }

        .gabriel-lomo-card-accent {
          right: 1%;
          bottom: -0.75rem;
          width: 11rem;
        }

        .gabriel-lomo-card-accent .gabriel-lomo-photo {
          height: 8.5rem;
        }

        .gabriel-guide-layout {
          position: relative;
          overflow: visible;
        }

        .gabriel-guide-copy {
          position: relative;
          z-index: 2;
          max-width: 43rem;
        }

        .gabriel-guide-copy-inner {
          position: relative;
        }

        .gabriel-guide-pin-shell {
          position: relative;
          isolation: isolate;
        }

        .gabriel-molecule {
          position: absolute;
          inset: -2.5rem -6% auto auto;
          width: min(42rem, 72%);
          height: 34rem;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
        }

        .gabriel-molecule-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .gabriel-molecule-line {
          transform-box: fill-box;
          transform-origin: center;
          animation: gabriel-molecule-drift 13s ease-in-out infinite;
        }

        .gabriel-molecule-line path {
          stroke: rgba(43, 121, 255, 0.38);
          stroke-linecap: round;
          stroke-linejoin: round;
          will-change: stroke-dashoffset, filter;
          filter: drop-shadow(0 0 10px rgba(64, 135, 255, 0.14));
        }

        .gabriel-molecule-line-1 {
          animation-duration: 12s;
        }

        .gabriel-molecule-line-2 {
          animation-duration: 14s;
          animation-delay: -1.2s;
        }

        .gabriel-molecule-line-3 {
          animation-duration: 15.5s;
          animation-delay: -2.5s;
        }

        .gabriel-molecule-line-4 {
          animation-duration: 17s;
          animation-delay: -3.4s;
        }

        .gabriel-guide-visual {
          position: relative;
          z-index: 1;
          margin-top: 2rem;
        }

        .gabriel-guide-highlights {
          margin-top: -2rem;
          display: grid;
          gap: 1rem;
          position: relative;
          z-index: 4;
        }

        .gabriel-guide-highlight {
          border-radius: 1.35rem;
          border: 1px solid rgba(200, 217, 240, 0.95);
          background: rgba(255, 255, 255, 0.92);
          padding: 1.2rem 1.2rem 1.3rem;
          box-shadow: 0 20px 42px rgba(37, 85, 153, 0.12);
          backdrop-filter: blur(12px);
        }

        .gabriel-guide-mobile-image {
          display: block;
          width: 100%;
          max-width: 34rem;
          margin-left: auto;
          object-fit: contain;
        }

        .gabriel-guide-desktop-art {
          display: none;
        }

        .gabriel-video-frame {
          position: relative;
          overflow: hidden;
          border-radius: 2.4rem;
          border: 1px solid rgba(104, 145, 212, 0.28);
          background:
            radial-gradient(circle at 20% 20%, rgba(111, 184, 255, 0.45), transparent 24%),
            radial-gradient(circle at 78% 78%, rgba(18, 57, 122, 0.22), transparent 28%),
            linear-gradient(135deg, #2f7ff4 0%, #1f5fd1 52%, #0d2f64 100%);
          padding: 0.9rem;
          box-shadow: 0 26px 70px rgba(26, 83, 170, 0.18);
        }

        .gabriel-video-shell {
          position: relative;
          overflow: hidden;
          border-radius: 1.9rem;
          aspect-ratio: 16 / 8.4;
          background:
            linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)),
            linear-gradient(130deg, rgba(9, 33, 72, 0.56), rgba(26, 93, 183, 0.3)),
            url(${heroImages[0]}) center / cover no-repeat;
        }

        .gabriel-video-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 34px 34px;
          opacity: 0.45;
          pointer-events: none;
        }

        .gabriel-video-trigger {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, rgba(8, 27, 63, 0.18), rgba(8, 27, 63, 0.44));
          cursor: pointer;
        }

        .gabriel-video-trigger::after {
          content: "";
          position: absolute;
          inset: 1.1rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          pointer-events: none;
        }

        .gabriel-video-pulse {
          position: absolute;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          pointer-events: none;
        }

        .gabriel-video-pulse-one {
          width: 7rem;
          height: 7rem;
          background: rgba(255, 255, 255, 0.08);
        }

        .gabriel-video-pulse-two {
          width: 9.5rem;
          height: 9.5rem;
          opacity: 0.75;
        }

        .gabriel-video-play {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 5.8rem;
          height: 5.8rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.16);
          color: white;
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 40px rgba(10, 31, 73, 0.22);
        }

        .gabriel-video-iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }

        .gabriel-tour-arc-shell {
          position: relative;
          min-height: 17.75rem;
          padding-top: 0.1rem;
          isolation: isolate;
        }

        .gabriel-tour-arc-pin-wrap {
          position: relative;
          z-index: 0;
        }

        .gabriel-tour-arc-background {
          position: absolute;
          inset: -8rem -18% -10rem -18%;
          height: auto;
          z-index: 0;
          opacity: 0.78;
          pointer-events: none;
        }

        .gabriel-tour-arc-background-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .gabriel-tour-arc-background-line {
          transform-box: fill-box;
          transform-origin: center;
          animation: gabriel-molecule-drift 13s ease-in-out infinite;
        }

        .gabriel-tour-arc-background-path {
          fill: none;
          stroke: rgba(43, 121, 255, 0.34);
          stroke-linecap: round;
          stroke-linejoin: round;
          will-change: stroke-dashoffset, filter;
          filter: drop-shadow(0 0 10px rgba(64, 135, 255, 0.14));
        }

        .gabriel-tour-arc-background-path-1 {
          stroke-width: 1.15;
        }

        .gabriel-tour-arc-background-path-2 {
          stroke-width: 1.85;
        }

        .gabriel-tour-arc-background-path-3 {
          stroke-width: 2.35;
        }

        .gabriel-tour-arc-background-path-4 {
          stroke-width: 3;
        }

        .gabriel-tour-arc-background-line-1 {
          animation-duration: 12s;
        }

        .gabriel-tour-arc-background-line-2 {
          animation-duration: 14s;
          animation-delay: -1.2s;
        }

        .gabriel-tour-arc-background-line-3 {
          animation-duration: 15.5s;
          animation-delay: -2.5s;
        }

        .gabriel-tour-arc-background-line-4 {
          animation-duration: 17s;
          animation-delay: -3.4s;
        }

        .gabriel-tour-arc-sticky {
          position: relative;
          z-index: 2;
        }

        .gabriel-tour-panel-section {
          position: relative;
          z-index: 4;
        }

        .gabriel-tour-arc-rail {
          position: relative;
          height: 16.2rem;
          overflow: visible;
        }

        .gabriel-tour-arc-card {
          position: absolute;
          left: 50%;
          bottom: -1.95rem;
          width: 10.85rem;
          transform-origin: center bottom;
          will-change: transform, opacity, filter;
        }

        .gabriel-tour-arc-card-inner {
          display: block;
          width: 100%;
          background: transparent;
          border: 0;
          padding: 0;
          text-align: center;
          cursor: pointer;
        }

        .gabriel-tour-arc-image {
          overflow: hidden;
          border-radius: 1.3rem;
          border: 1px solid rgba(200, 217, 240, 0.95);
          background: white;
          box-shadow: 0 18px 38px rgba(37, 85, 153, 0.12);
          aspect-ratio: 0.84;
        }

        .gabriel-tour-arc-copy {
          margin-top: 0.9rem;
        }

        .gabriel-editorial-cluster {
          position: relative;
          min-height: 24rem;
          padding: 0.6rem 0 0.8rem;
        }

        .gabriel-editorial-card {
          position: absolute;
          overflow: hidden;
          border-radius: 1.7rem;
          border: 1px solid rgba(200, 217, 240, 0.9);
          background: white;
          box-shadow: 0 22px 44px rgba(37, 85, 153, 0.14);
          transform-origin: center;
        }

        .gabriel-editorial-card-main {
          top: 5.2rem;
          right: 0;
          width: min(82%, 28rem);
          height: 13.8rem;
          transform: none;
          z-index: 1;
        }

        .gabriel-editorial-card-top {
          top: 0;
          left: 0.5rem;
          width: 56%;
          height: 7.8rem;
          transform: none;
          z-index: 3;
        }

        .gabriel-editorial-card-bottom {
          right: -0.75rem;
          bottom: 0;
          width: 52%;
          height: 6.4rem;
          transform: none;
          z-index: 4;
        }

        .gabriel-tour-shell {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          min-height: 44rem;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(244, 248, 255, 0.74) 100%);
          backdrop-filter: blur(24px) saturate(155%);
          -webkit-backdrop-filter: blur(24px) saturate(155%);
          transform: translateZ(0);
          backface-visibility: hidden;
          box-shadow:
            0 22px 52px rgba(37, 85, 153, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.76);
        }

        .gabriel-tour-stage {
          position: relative;
          min-height: inherit;
        }

        .gabriel-tour-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          min-height: inherit;
          will-change: opacity, transform;
          backface-visibility: hidden;
          transform: translateZ(0);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .gabriel-tour-glass-pane {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.54) 0%, rgba(245, 249, 255, 0.46) 100%);
          backdrop-filter: blur(18px) saturate(145%);
          -webkit-backdrop-filter: blur(18px) saturate(145%);
        }

        .gabriel-tour-video-frame {
          overflow: hidden;
          border-radius: 1rem;
          border: 1px solid rgba(200, 217, 240, 0.88);
          background: rgba(238, 245, 255, 0.68);
          backdrop-filter: blur(12px) saturate(135%);
          -webkit-backdrop-filter: blur(12px) saturate(135%);
        }

        .gabriel-tour-video {
          width: 100%;
          height: 12rem;
          background: #eaf2ff;
          object-fit: cover;
        }

        .gabriel-tour-media-fallback {
          position: relative;
          height: 12rem;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(7, 26, 46, 0.08), rgba(7, 26, 46, 0.36)),
            #eaf2ff;
        }

        .gabriel-tour-media-fallback img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gabriel-tour-media-copy {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
          color: #ffffff;
        }

        .gabriel-faq-shell {
          display: grid;
          gap: 2.5rem;
        }

        .gabriel-faq-heading {
          max-width: 11ch;
        }

        .gabriel-faq-list {
          border-top: 1px solid rgba(200, 217, 240, 0.92);
        }

        .gabriel-faq-item {
          border-bottom: 1px solid rgba(200, 217, 240, 0.92);
        }

        .gabriel-faq-item summary {
          list-style: none;
        }

        .gabriel-faq-item summary::-webkit-details-marker {
          display: none;
        }

        .gabriel-faq-summary {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.35rem 0;
          cursor: pointer;
        }

        .gabriel-faq-summary-title {
          font-family: "Sora", "Segoe UI", sans-serif;
          max-width: 20rem;
          font-size: clamp(1.45rem, 2.8vw, 2.1rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
          color: #071a2e;
        }

        .gabriel-faq-toggle {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          margin-top: 0.15rem;
          border-radius: 9999px;
          border: 1px solid rgba(168, 197, 234, 0.95);
          color: #17385f;
          transition: transform 220ms ease;
        }

        .gabriel-faq-item[open] .gabriel-faq-toggle {
          transform: rotate(45deg);
        }

        .gabriel-faq-answer {
          padding: 0 0 1.25rem;
          max-width: 34rem;
          font-size: 0.98rem;
          line-height: 1.7;
          color: #5c7393;
        }

        @media (min-width: 1024px) {
          .gabriel-lomo-gallery {
            min-height: 34rem;
            width: calc(100% + 8rem);
            margin-left: -2rem;
          }

          .gabriel-lomo-card {
          }

          .gabriel-lomo-card-motion {
            padding: 0.95rem 0.95rem 1.15rem;
          }

          .gabriel-lomo-card-main {
            top: -1rem;
            right: -1%;
            width: 28rem;
          }

          .gabriel-lomo-card-main .gabriel-lomo-photo {
            height: 21rem;
          }

          .gabriel-lomo-card-top {
            top: 1rem;
            left: 1%;
            width: 15rem;
          }

          .gabriel-lomo-card-top .gabriel-lomo-photo {
            height: 14rem;
          }

          .gabriel-lomo-card-bottom {
            bottom: 2rem;
            left: 16%;
            width: 18rem;
          }

          .gabriel-lomo-card-bottom .gabriel-lomo-photo {
            height: 13.5rem;
          }

          .gabriel-lomo-card-accent {
            right: -1%;
            bottom: -1rem;
            width: 13rem;
          }

          .gabriel-lomo-card-accent .gabriel-lomo-photo {
            height: 9.5rem;
          }

          .gabriel-guide-layout {
            display: grid;
            grid-template-columns: 0.9fr 1.1fr;
            align-items: start;
            min-height: 36rem;
            padding-top: 1.5rem;
          }

          .gabriel-molecule {
            inset: -4rem -8% auto auto;
            width: min(48rem, 68%);
            height: 40rem;
            opacity: 0.62;
          }

          .gabriel-guide-highlights {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
            margin-top: -2rem;
          }

          .gabriel-guide-highlight {
            min-height: 12.5rem;
            padding: 1.35rem 1.35rem 1.5rem;
          }

          .gabriel-guide-copy-inner {
            margin-right: -13rem;
          }

          .gabriel-guide-visual {
            grid-column: 2;
            grid-row: 1;
            margin-top: 0;
            min-height: 36rem;
            overflow: visible;
          }

          .gabriel-guide-mobile-image {
            display: none;
          }

          .gabriel-guide-desktop-art {
            display: block;
            width: 118%;
            min-height: 36rem;
            background-image: var(--gabriel-guide-image);
            background-position: left top;
            background-repeat: no-repeat;
            background-size: contain;
            transform: translate(-4rem, -5.25rem) scale(1.22);
            transform-origin: top left;
          }

          .gabriel-tour-arc-shell {
            min-height: 22rem;
            padding-top: 0.15rem;
          }

          .gabriel-tour-video {
            height: 14.5rem;
          }

          .gabriel-tour-shell {
            min-height: 37rem;
          }

          .gabriel-faq-shell {
            grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
            gap: 4rem;
          }

          .gabriel-faq-heading {
            max-width: 7ch;
          }

          .gabriel-faq-list-wrap {
            padding-top: 4rem;
          }

          .gabriel-faq-summary-title {
            max-width: 28rem;
            font-size: clamp(2rem, 2.6vw, 2.35rem);
          }

          .gabriel-tour-arc-background {
            inset: -12rem -22% -14rem -22%;
          }

          .gabriel-tour-arc-sticky {
            margin-top: 0;
          }

          .gabriel-tour-arc-rail {
            height: 18.5rem;
          }

          .gabriel-tour-arc-card {
            width: 15rem;
            bottom: -2.35rem;
          }

          .gabriel-tour-arc-copy {
            margin-top: 1rem;
          }

          .gabriel-editorial-cluster {
            min-height: 31rem;
            padding-bottom: 1.2rem;
          }

          .gabriel-editorial-card-main {
            top: 5.9rem;
            right: 0.25rem;
            width: min(84%, 38rem);
            height: 22.5rem;
            transform: none;
          }

          .gabriel-editorial-card-bottom {
            right: -2.1rem;
            bottom: 0.25rem;
            width: 48%;
            height: 8.8rem;
            transform: none;
          }

          .gabriel-editorial-card-top {
            top: -6.65rem;
            left: 0.2rem;
            width: 99%;
            height: 11.2rem;
            transform: none;
          }

          .gabriel-experience-contour {
            width: 10rem;
            height: 14rem;
          }

        }

        @keyframes gabriel-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, var(--card-drift, -12px), 0); }
        }

        @keyframes gabriel-molecule-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(0.6rem, -0.9rem, 0) scale(1.035) rotate(5deg); }
        }

        @keyframes gabriel-reveal {
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 gabriel-grid" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-10 md:pt-12">
        <section ref={heroSectionRef} className="relative overflow-visible py-4 md:py-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-0 h-56 w-56 rounded-full bg-[#d6e6ff]/55 blur-3xl md:h-72 md:w-72" />
            <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-[#cfe0ff]/45 blur-3xl md:h-80 md:w-80" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b6cdf0] to-transparent" />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <article className="relative z-10 pt-2 md:pt-6">
              <p data-hero-text className="text-[10px] uppercase tracking-[0.34em] gabriel-chip-text">gabriel gruia tour</p>

              <svg className="pointer-events-none absolute -left-8 top-12 h-[220px] w-[350px] opacity-90 md:h-[260px] md:w-[410px]" viewBox="0 0 410 260" fill="none" aria-hidden="true">
                <path d="M356.8 36.2C286.2 5.8 168.7 22.9 95.4 82.8C22.1 142.6 -2.5 225.8 49.6 244.7C119.1 269.8 252.9 231.3 333.7 163.4C414.5 95.6 427.4 67.2 356.8 36.2Z" stroke="#5b93ff" strokeOpacity="0.9" strokeWidth="1.2" />
              </svg>

              <h1 data-hero-text className="gabriel-editorial-title relative z-10 mt-7 text-4xl font-extrabold uppercase leading-[1.02] tracking-[-0.04em] gabriel-strong-text md:text-[58px]">
                <span className="inline-block bg-[#d9e8ff] px-2 py-1 gabriel-chip-text">Experiencias Inesqueciveis</span>
                <span className="block mt-2">de Viagem</span>
                <span className="block mt-2">
                  com <span className="inline-block bg-[#d9e8ff] px-2 py-1 gabriel-chip-text">Impacto Positivo</span>
                </span>
              </h1>

              <p data-hero-text className="relative z-20 mt-5 max-w-[520px] text-sm gabriel-soft-text">
                Passeios guiados, experiencias reais e roteiros com alma local em Morro de Sao Paulo.
              </p>

              <div data-hero-text className="relative z-20 mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#a8c5ea] bg-white px-2.5 py-1.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#90b5e4] bg-[#eff5ff] text-[11px] gabriel-chip-text">{'>'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] gabriel-chip-text">abrir video</span>
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="gabriel-button-solid inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-cyan)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5"
                >
                  <LifeBuoy size={15} />
                  Quero meu roteiro
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#a8c5ea] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] gabriel-chip-text transition-colors hover:border-[#7ba9e3]"
                >
                  <Compass size={15} />
                  @gabrielcruz.tour
                </a>
              </div>
            </article>

            <article data-hero-gallery-wrap className="relative z-10 overflow-visible">
              <LomoHeroGallery />

              <div className="mt-4 flex justify-end gap-2 pr-1 md:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8ca9cf]" />
                <span className="h-1.5 w-1.5 rounded-full border border-[#4d77ae]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#8ca9cf]" />
              </div>
            </article>
          </div>
        </section>

        <section data-scroll-fade data-guide-section className="relative z-30 isolate mt-4 overflow-visible px-0 pt-4 md:pt-8">
          <div data-guide-pin className="gabriel-guide-pin-shell px-2 md:px-0">
            <MoleculeWaveBackground />

            <div className="gabriel-guide-layout">
              <div className="gabriel-guide-copy">
                <div className="gabriel-guide-copy-inner">
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#dd6e00]">guia em destaque</p>
                  <h2
                    data-guide-title
                    className="gabriel-editorial-title mt-2 max-w-[4.4ch] font-extrabold tracking-[-0.09em] text-[#112552] lg:max-w-none"
                    style={{ fontSize: 'clamp(4.5rem, 9vw, 10rem)', lineHeight: '0.8' }}
                  >
                    Gabriel
                    <span className="block">Gruia</span>
                  </h2>
                  <p className="mt-8 max-w-[39rem] text-base leading-relaxed text-[#264a73] md:text-[1.18rem] lg:max-w-[41rem] lg:text-[1.24rem]">
                    Atendimento humano, pontualidade e acompanhamento real do grupo do inicio ao fim do roteiro.
                    Experiencias guiadas com ritmo leve, cuidado e memoria de viagem.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#ed9f3a] px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
                    >
                      Reservar com Gabriel
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#d9b68a] bg-transparent px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#264a73] transition-colors hover:border-[#b98a4d]"
                    >
                      Ver Instagram
                    </a>
                  </div>
                </div>
              </div>

              <div className="gabriel-guide-visual pointer-events-none">
                <div
                  data-guide-visual-inner
                  className="gabriel-guide-desktop-art"
                  style={{ ['--gabriel-guide-image' as string]: `url(${guideImage})` }}
                />
                <img
                  data-guide-visual-inner
                  src={guideImage}
                  alt="Gabriel Gruia, guia de turismo"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = assetPath('lab/turism/pordosol.jpg?v=3');
                  }}
                  className="gabriel-guide-mobile-image md:max-w-[40rem]"
                />
              </div>
            </div>

            <div className="gabriel-guide-highlights">
              {guideHighlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} data-guide-feature className="gabriel-guide-highlight">
                    <Icon size={18} className="text-[#2e7dff]" />
                    <h3 className="gabriel-title mt-3 text-xl gabriel-strong-text">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed gabriel-soft-text">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section data-scroll-fade className="mt-8">
          <div data-video-frame className="gabriel-video-frame">
            <div className="gabriel-video-shell">
              {isVideoOpen ? (
                <iframe
                  src={VIMEO_PLAYER_URL}
                  title="Gabriel Gruia tour video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="gabriel-video-iframe"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="gabriel-video-trigger"
                  aria-label="Reproduzir video do roteiro no Vimeo"
                >
                  <span data-video-cue className="gabriel-video-pulse gabriel-video-pulse-two" />
                  <span data-video-cue className="gabriel-video-pulse gabriel-video-pulse-one" />
                  <span className="gabriel-video-play">
                    <Play size={28} fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        <section data-scroll-fade className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Passeios', value: '10+' },
            { label: 'Avaliacao', value: '5.0' },
            { label: 'Atendimento', value: '24h' },
            { label: 'Saidas', value: 'Diarias' },
          ].map((item, index) => (
            <div
              key={item.label}
              className="gabriel-reveal rounded-2xl border border-[#c8d9f0] bg-white px-3 py-3 text-center"
              style={{ animationDelay: `${110 + index * 70}ms` }}
            >
              <p className="text-lg font-extrabold text-[#2e7dff]">{item.value}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] gabriel-chip-text">{item.label}</p>
            </div>
          ))}
        </section>

        <section data-tour-arc-section className="mt-4">
          <div data-tour-arc-pin className="gabriel-tour-arc-pin-wrap">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] gabriel-chip-text">passeios disponiveis</p>
                <h2 data-tour-arc-title className="gabriel-title mt-2 text-3xl gabriel-strong-text md:text-4xl">
                  Nossos Passeios
                </h2>
              </div>

              <p data-tour-arc-lead className="max-w-[28rem] text-sm leading-relaxed gabriel-soft-text">
                O scroll segue natural ate a caixa final. Dali, os roteiros voltam trocando o passeio ativo e revelando cada informacao.
              </p>
            </div>

            <TourArcSlider
              items={tours}
              onSelect={handleTourArcSelect}
            />
          </div>
        </section>

        {hasTours ? (
          <section data-tour-panel-section className="gabriel-tour-panel-section mt-8">
            <article
              ref={(node) => {
                selectedTourPanelRef.current = node;
              }}
              data-tour-panel-pin
              data-tour-panel={initialTourId ?? 'tour-panel'}
              className="gabriel-tour-shell overflow-hidden rounded-[1.7rem] border border-[rgba(200,217,240,0.88)]"
            >
              <div className="gabriel-tour-stage">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    ref={(node) => {
                      tourLayerRefs.current[tour.id] = node;
                    }}
                    className="gabriel-tour-layer"
                    data-tour-layer={tour.id}
                  >
                    <TourDetailContent tour={tour} />
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        <section data-scroll-fade className="mt-12 rounded-[2rem] border border-[#c8d9f0] bg-white p-6 md:p-8">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] gabriel-chip-text">depoimentos reais</p>
          <h2 className="gabriel-title mt-3 text-center text-3xl gabriel-strong-text md:text-4xl">As melhores experiencias e na Gabriel Gruia!</h2>
          <p className="mt-2 text-center text-sm gabriel-soft-text">O que nossos clientes dizem:</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="gabriel-reveal rounded-3xl border border-[#c8d9f0] bg-[#f7fbff] p-5">
                <p className="text-sm leading-relaxed gabriel-soft-text">&quot;{item.quote}&quot;</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#2e7dff]">{item.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section data-scroll-fade className="mt-12 rounded-[2.35rem] border border-[#c8d9f0] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(37,85,153,0.08)] md:px-8 md:py-8">
          <div className="gabriel-faq-shell">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] gabriel-chip-text">duvidas frequentes</p>
              <h2 className="gabriel-editorial-title gabriel-faq-heading mt-4 text-[2.9rem] leading-[0.88] text-[#112552] md:text-[4.35rem]">
                Um roteiro bem explicado antes mesmo do embarque.
              </h2>
            </div>

            <div className="gabriel-faq-list-wrap">
              <div className="gabriel-faq-list">
                {faqItems.map((item) => (
                  <details key={item.title} className="gabriel-faq-item">
                    <summary className="gabriel-faq-summary">
                      <span className="gabriel-faq-summary-title">{item.title}</span>
                      <span className="gabriel-faq-toggle" aria-hidden="true">+</span>
                    </summary>
                    <p className="gabriel-faq-answer">{item.body}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section data-scroll-fade className="gabriel-reveal mt-12 overflow-visible rounded-[2.5rem] border border-[#c8d9f0] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(37,85,153,0.08)] md:px-8 md:py-8" style={{ animationDelay: '680ms' }}>
          <div className="grid items-end gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-10">
            <div className="max-w-[22rem] lg:pb-6">
              <p className="text-[10px] uppercase tracking-[0.32em] gabriel-chip-text">fechamento da viagem</p>
              <h2 className="gabriel-editorial-title mt-4 text-[2.6rem] leading-[0.95] text-[#112552] md:text-[3.6rem]">
                O melhor roteiro para viver Morro com calma e visual inesquecivel.
              </h2>
              <p className="mt-4 text-sm leading-relaxed gabriel-soft-text md:text-base">
                Monte seu passeio com atendimento direto, saidas organizadas e paisagens que ficam na memoria.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#071a2e] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
                >
                  <Sunrise size={15} />
                  Reservar agora
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#a8c5ea] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] gabriel-chip-text transition-colors hover:border-[#7ba9e3]"
                >
                  Ver Instagram
                </a>
              </div>
            </div>

            <EditorialImageCluster
              mainImage={{ src: heroImages[0], alt: 'Vista do destino em Morro de Sao Paulo' }}
              topImage={{ src: heroImages[1], alt: 'Mergulho nas aguas cristalinas' }}
              bottomImage={{ src: heroImages[2], alt: 'Passeio em alta energia no destino' }}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default TourismGuideLab;
