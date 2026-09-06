import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { interpolate } from 'flubber';
import Lenis from 'lenis';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Database,
  FileText,
  Globe2,
  Instagram,
  LineChart,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Mic,
  Newspaper,
  Radio,
  Search,
  MessageSquare,
  ShieldCheck,
  Target,
  ThumbsUp,
  Tv,
  Users,
  X,
  Youtube,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type DataSource = {
  title: string;
  body: string;
  icon: typeof FileText;
};

type NetworkNode = {
  icon: typeof FileText;
  size?: 'sm' | 'md' | 'lg';
  color: '#3F83EE' | '#6FC256' | '#B5BDC7';
  angle: number;
  radius: number;
  duration: number;
  direction: 1 | -1;
};

type Step = {
  value: string;
  title: string;
  body: string;
};

const dataSources: DataSource[] = [
  {
    title: 'Jornal',
    body: 'Sinais editoriais e noticias relevantes.',
    icon: FileText,
  },
  {
    title: 'Blog',
    body: 'Opinioes especializadas e tendencias emergentes.',
    icon: Globe2,
  },
  {
    title: 'Radio',
    body: 'Narrativas locais, entrevistas e repercussao publica.',
    icon: MessageSquare,
  },
  {
    title: 'Pesquisa',
    body: 'Indicadores e evidências para decisão.',
    icon: BarChart3,
  },
  {
    title: 'Redes',
    body: 'Conversas, menções e movimentos de comunidade.',
    icon: MessageSquare,
  },
  {
    title: 'Portal',
    body: 'Cobertura digital e temas em circulacao.',
    icon: Globe2,
  },
];

const methodSteps: Step[] = [
  {
    value: '01',
    title: 'Monitoramento',
    body: 'Acompanhe o que importa em tempo real.',
  },
  {
    value: '02',
    title: 'Interpretação',
    body: 'Entenda contexto, impacto e significado.',
  },
  {
    value: '03',
    title: 'Decisão',
    body: 'Atue com prioridade, clareza e inteligência.',
  },
];

const processSteps: Step[] = [
  {
    value: '1',
    title: 'Escutar',
    body: 'Coletamos sinais relevantes.',
  },
  {
    value: '2',
    title: 'Organizar',
    body: 'Transformamos dados em informação.',
  },
  {
    value: '3',
    title: 'Interpretar',
    body: 'Revelamos padrões e significados.',
  },
  {
    value: '4',
    title: 'Recomendar',
    body: 'Geramos direções e prioridades.',
  },
];

const homeSolutions = [
  {
    title: 'Consultoria estratégica em comunicação e marketing',
    body: 'Convertemos dados da opinião pública em planos de ação claros para sua comunicação.',
    icon: Target,
  },
  {
    title: 'Pesquisas quanti e quali',
    body: 'Pesquisas de opinião, grupos focais, etnografia, netnografia e entrevistas em profundidade.',
    icon: Users,
  },
  {
    title: 'Monitoramento de imprensa e mídias sociais',
    body: 'Analisamos menções e comentários para identificar tendências e antecipar crises.',
    icon: Newspaper,
  },
  {
    title: 'Gestão de crise',
    body: 'Antecipamos pequenos problemas e organizamos respostas quando a crise exige ação imediata.',
    icon: ShieldCheck,
  },
  {
    title: 'Diagnósticos e relatórios de performance',
    body: 'Avaliamos seu desempenho com base nas métricas que realmente orientam decisões.',
    icon: LineChart,
  },
  {
    title: 'Análise de dados',
    body: 'Desenvolvemos projetos personalizados para interpretar dados em larga escala.',
    icon: Database,
  },
] as const;

const testimonials = [
  {
    quote:
      'Em um mundo em que está cada vez mais difícil lidar com o excesso de informações e conseguir identificar, nesse amontoado de dados disponíveis, quais são os mais relevantes para uma tomada de decisão, o apoio da empresa Eldonita tem sido essencial para conseguir alinhar ações estratégicas de comunicação que tenham resultado efetivo. É importante poder contar com essas análises criteriosas para que o governo não fique preso, perca tempo e dedique esforços em prioridades falsas.',
    name: 'Thiago Santaella',
    role: 'Diretor de Imprensa - SECOM/SC',
    initials: 'TS',
  },
  {
    quote:
      'Meus 30 anos de experiência em marketing político e eleitoral me ensinaram o valor de ter acesso rápido a informações precisas para o planejamento e a tomada de decisão. É aí que a Eldonita vem se destacando: uma plataforma inteligente que faz a ponte entre informação e ação com um nível de agilidade e profundidade que fazem toda a diferença. A empresa chega ao mercado com soluções que realmente ajudam a transformar dados em estratégias eficazes. Grande parceria para clientes públicos ou privados. Recomendo fortemente!',
    name: 'Rejane Benvenuto',
    role: 'Especialista em comunicação e marketing',
    initials: 'RB',
  },
  {
    quote:
      'Muitas empresas dizem trabalhar com dados. Mas quando o assunto é aplicar esses dados em estratégias de comunicação que realmente geram resultado, a Eldonita é referência.',
    name: 'Samuel M. Jacques',
    role: 'Coordenador de Comunicação',
    initials: 'SJ',
  },
  {
    quote:
      'A equipe da Eldonita tem sido uma parceria essencial para a comunicação do partido e do mandato. Eles nos ajudam a entender a opinião pública, saber se estamos no caminho correto e antecipar possíveis problemas. Graças aos conselhos da Eldonita, conseguimos moldar nossa narrativa e identificar oportunidades valiosas. Recomendo a todos que buscam se comunicar de maneira eficiente.',
    name: 'João Batista Costa',
    role: 'Dirigente partidário e assessor parlamentar',
    initials: 'JC',
  },
] as const;

const methodTabs = [
  {
    title: 'Diagnóstico',
    subtitle: 'Separando o joio do trigo',
    body: 'Coletamos, filtramos e interpretamos dados relevantes para revelar sinais úteis sobre percepção pública, reputação e eficiência da comunicação.',
  },
  {
    title: 'Coleta e análise',
    subtitle: 'Fontes conectadas',
    body: 'Integramos redes sociais, notícias, pesquisas e canais offline para criar uma leitura consistente do ambiente.',
  },
  {
    title: 'Estratégias de comunicação',
    subtitle: 'Direção acionável',
    body: 'Transformamos achados em prioridades, narrativas, alertas e recomendações para decisões mais seguras.',
  },
  {
    title: 'Monitoramento',
    subtitle: 'Acompanhamento contínuo',
    body: 'Observamos sinais em ciclos curtos para antecipar crises, medir reações e ajustar rotas com agilidade.',
  },
] as const;

const methodSources = [
  {
    title: 'Monitoramento de redes sociais',
    subtitle: 'O mundo não para de falar. Nós te ajudamos a ouvir, entender e agir.',
    items: [
      'Instagram, Facebook, TikTok, X, YouTube, LinkedIn, Threads, Bluesky e e-mail.',
      'Leitura contínua de menções, comentários, dados analíticos e performance.',
      'Identificação de tendências, temas relevantes, sentimentos e influenciadores.',
    ],
    icon: MessageSquare,
  },
  {
    title: 'Clipping de notícias',
    subtitle: 'As notícias correm, você entende e transforma em estratégia.',
    items: [
      'Monitoramento completo em digital, TV, rádio e jornal.',
      'Curadoria humana com apoio de inteligência artificial e interface clara.',
      'Alertas personalizados por WhatsApp, e-mail ou canal preferencial.',
    ],
    icon: FileText,
  },
  {
    title: 'Pesquisas e análises',
    subtitle: 'Um método para cada necessidade.',
    items: [
      'Pesquisas de opinião, grupos focais, etnografia, netnografia e entrevistas em profundidade.',
      'Cruzamento de dados públicos e privados.',
      'Análise 360 para examinar públicos, comportamentos e resultados de comunicação.',
    ],
    icon: BarChart3,
  },
] as const;

const sourceNetworkSets: NetworkNode[][] = [
  [
    { icon: Youtube, color: '#3F83EE', angle: 8, radius: 42, duration: 54, direction: 1, size: 'md' },
    { icon: Linkedin, color: '#6FC256', angle: 74, radius: 42, duration: 62, direction: -1, size: 'sm' },
    { icon: Instagram, color: '#B5BDC7', angle: 142, radius: 42, duration: 58, direction: 1, size: 'sm' },
    { icon: ThumbsUp, color: '#6FC256', angle: 206, radius: 31, duration: 46, direction: -1, size: 'md' },
    { icon: MessageCircle, color: '#3F83EE', angle: 274, radius: 31, duration: 50, direction: 1, size: 'md' },
    { icon: Users, color: '#B5BDC7', angle: 334, radius: 31, duration: 44, direction: -1, size: 'sm' },
  ],
  [
    { icon: Newspaper, color: '#3F83EE', angle: 14, radius: 42, duration: 60, direction: -1, size: 'md' },
    { icon: Tv, color: '#B5BDC7', angle: 82, radius: 42, duration: 52, direction: 1, size: 'sm' },
    { icon: Radio, color: '#6FC256', angle: 150, radius: 42, duration: 66, direction: -1, size: 'md' },
    { icon: Bell, color: '#3F83EE', angle: 214, radius: 31, duration: 48, direction: 1, size: 'sm' },
    { icon: Mail, color: '#B5BDC7', angle: 282, radius: 31, duration: 56, direction: -1, size: 'md' },
    { icon: Search, color: '#6FC256', angle: 342, radius: 31, duration: 45, direction: 1, size: 'sm' },
  ],
  [
    { icon: Users, color: '#6FC256', angle: 20, radius: 42, duration: 64, direction: 1, size: 'md' },
    { icon: Database, color: '#3F83EE', angle: 88, radius: 42, duration: 56, direction: -1, size: 'sm' },
    { icon: Target, color: '#B5BDC7', angle: 156, radius: 42, duration: 61, direction: 1, size: 'md' },
    { icon: Mic, color: '#3F83EE', angle: 220, radius: 31, duration: 49, direction: -1, size: 'md' },
    { icon: Search, color: '#6FC256', angle: 288, radius: 31, duration: 53, direction: 1, size: 'sm' },
    { icon: LineChart, color: '#B5BDC7', angle: 348, radius: 31, duration: 47, direction: -1, size: 'sm' },
  ],
];

const seaScenarios = [
  {
    title: 'Mar calmo',
    body: 'Quando o cenário está estável, o monitoramento contínuo mede percepção pública, acompanha performance e mantém a comunicação preparada.',
  },
  {
    title: 'Mar agitado',
    body: 'Quando surgem ruídos, a análise organiza menções, sentimentos e focos de atenção para orientar respostas e ajustes.',
  },
  {
    title: 'Tsunami',
    body: 'Em crises, o tracking diário, dashboards em tempo real e alertas rápidos ajudam a priorizar decisões assertivas.',
  },
] as const;

const closingWords = [
  'clareza',
  'sinais',
  'previsão',
  'contexto',
  'estratégia',
  'inteligência',
  'direção',
] as const;

const seaWaveStates = [
  [
    'M-140 820 L-140 560 C 80 522, 204 598, 394 552 S 736 512, 930 558 S 1210 602, 1580 538 L1580 820 Z',
    'M-140 820 L-140 610 C 96 574, 238 644, 452 602 S 790 566, 1012 612 S 1304 646, 1580 586 L1580 820 Z',
    'M-140 820 L-140 650 C 70 606, 216 694, 420 642 S 770 594, 974 650 S 1270 700, 1580 624 L1580 820 Z',
    'M-140 820 L-140 700 C 110 670, 270 724, 500 690 S 860 660, 1092 700 S 1360 728, 1580 682 L1580 820 Z',
  ],
  [
    'M-140 820 L-140 610 C 22 470, 170 680, 336 520 S 650 678, 828 492 S 1162 674, 1580 472 L1580 820 Z',
    'M-140 820 L-140 654 C 70 548, 210 718, 408 574 S 748 708, 956 548 S 1282 690, 1580 530 L1580 820 Z',
    'M-140 820 L-140 704 C 30 610, 204 756, 382 634 S 720 748, 908 606 S 1240 734, 1580 590 L1580 820 Z',
    'M-140 820 L-140 744 C 104 690, 278 776, 494 704 S 850 774, 1074 688 S 1370 764, 1580 668 L1580 820 Z',
  ],
  [
    'M-140 820 L-140 680 C 56 650, 150 438, 330 458 C 512 478, 560 180, 778 164 C 1004 148, 1062 510, 1580 250 L1580 820 Z',
    'M-140 820 L-140 718 C 78 692, 198 524, 386 542 C 590 562, 646 286, 842 278 C 1054 270, 1128 574, 1580 360 L1580 820 Z',
    'M-140 820 L-140 748 C 102 724, 248 608, 450 622 C 654 638, 734 424, 920 416 C 1120 408, 1200 636, 1580 468 L1580 820 Z',
    'M-140 820 L-140 776 C 120 758, 306 684, 520 694 C 736 704, 812 552, 1008 548 C 1210 544, 1300 692, 1580 590 L1580 820 Z',
  ],
] as const;

const orbitDots = [
  { sourceIndex: 0, radius: 40, angle: 18, size: 2.45, color: '#3F83EE', duration: 42, direction: 1 },
  { sourceIndex: 1, radius: 35, angle: 118, size: 2.25, color: '#6FC256', duration: 36, direction: -1 },
  { sourceIndex: 2, radius: 28, angle: 228, size: 2.1, color: '#B5BDC7', duration: 31, direction: 1 },
  { sourceIndex: 3, radius: 46, angle: 310, size: 2.15, color: '#7D8794', duration: 48, direction: -1 },
  { sourceIndex: 4, radius: 50, angle: 76, size: 1.45, color: '#3F83EE', duration: 56, direction: -1 },
  { sourceIndex: 5, radius: 22, angle: 164, size: 1.35, color: '#6FC256', duration: 28, direction: 1 },
] as const;

const ambientOrbitDots = [
  { radius: 45, angle: 252, size: 0.78, color: '#3F83EE', duration: 52, direction: 1 },
  { radius: 31, angle: 42, size: 0.58, color: '#6FC256', duration: 44, direction: -1 },
  { radius: 18, angle: 286, size: 0.48, color: '#3F83EE', duration: 34, direction: -1 },
  { radius: 52, angle: 188, size: 0.64, color: '#6FC256', duration: 62, direction: 1 },
] as const;

const OrbitalMark = ({
  compact = false,
  interactive = !compact,
  animated = true,
}: {
  compact?: boolean;
  interactive?: boolean;
  animated?: boolean;
}) => {
  const markRef = useRef<HTMLDivElement | null>(null);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = markRef.current;
    if (!root || !animated || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(
        [
          '.eldonita-ring-slow',
          '.eldonita-ring-fast',
          '.eldonita-blue-outer',
          '.eldonita-blue-inner',
          '.eldonita-green-mid',
          '.eldonita-green-inner',
          '.eldonita-silver-arcs',
          '.eldonita-core-blue',
        ],
        { transformOrigin: '50% 50%' },
      );

      gsap.fromTo(
        '.eldonita-mark-svg',
        { autoAlpha: 0, scale: 0.88, rotate: -8 },
        { autoAlpha: compact ? 0.82 : 1, scale: 1, rotate: 0, duration: 1.1, ease: 'power3.out' },
      );

      gsap.to('.eldonita-ring-slow', {
        rotate: 360,
        duration: compact ? 42 : 58,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-ring-fast', {
        rotate: -360,
        duration: compact ? 34 : 46,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-blue-outer', {
        rotate: 360,
        duration: compact ? 35 : 52,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-blue-inner', {
        rotate: -360,
        duration: compact ? 24 : 36,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-green-mid', {
        rotate: -360,
        duration: compact ? 40 : 58,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-green-inner', {
        rotate: 360,
        duration: compact ? 28 : 42,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-silver-arcs', {
        rotate: 360,
        duration: compact ? 52 : 70,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.eldonita-core-blue', {
        rotate: -360,
        duration: compact ? 20 : 30,
        ease: 'none',
        repeat: -1,
      });

      gsap.utils.toArray<HTMLElement>('.eldonita-orbit-dot').forEach((dot) => {
        const face = dot.querySelector<HTMLElement>('.eldonita-orbit-face');
        const duration = Number(dot.dataset.duration ?? 24);
        const angle = Number(dot.dataset.angle ?? 0);
        const direction = Number(dot.dataset.direction ?? 1);
        const rotation = direction >= 0 ? '+=360' : '-=360';
        const faceRotation = direction >= 0 ? '-=360' : '+=360';

        gsap.to(dot, {
          rotate: rotation,
          duration,
          ease: 'none',
          repeat: -1,
        });

        if (face) {
          gsap.set(face, { transformOrigin: '50% 50%', rotate: -angle });
          gsap.to(face, {
            rotate: faceRotation,
            duration,
            ease: 'none',
            repeat: -1,
          });
        }
      });

      gsap.utils.toArray<HTMLElement>('.eldonita-ambient-dot').forEach((dot) => {
        const duration = Number(dot.dataset.duration ?? 48);
        const direction = Number(dot.dataset.direction ?? 1);
        gsap.to(dot, {
          rotate: direction >= 0 ? '+=360' : '-=360',
          duration,
          ease: 'none',
          repeat: -1,
        });
      });

      gsap.to('.eldonita-scanline', {
        strokeDashoffset: -90,
        duration: 12,
        ease: 'none',
        repeat: -1,
      });
    }, root);

    return () => ctx.revert();
  }, [animated, compact]);

  return (
    <div
      ref={markRef}
      className={`relative isolate aspect-square ${compact ? 'w-28' : 'w-[min(82vw,720px)]'}`}
      aria-hidden={!interactive}
    >
      <svg
        className="eldonita-mark-svg pointer-events-none h-full w-full overflow-visible drop-shadow-[0_0_34px_rgba(63,131,238,0.16)]"
        viewBox="0 0 520 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="eldonita-ring-slow" opacity="0.58">
          <circle cx="260" cy="260" r="224" stroke="white" strokeOpacity="0.09" />
          <circle
            className="eldonita-scanline"
            cx="260"
            cy="260"
            r="188"
            stroke="#4F84DF"
            strokeOpacity="0.14"
            strokeDasharray="0.6 16"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-ring-fast" opacity="0.62">
          <circle cx="260" cy="260" r="154" stroke="#4F84DF" strokeOpacity="0.2" />
          <circle cx="260" cy="260" r="96" stroke="#6FC256" strokeOpacity="0.14" />
          <circle cx="260" cy="260" r="206" stroke="#3F83EE" strokeOpacity="0.06" />
        </g>

        <g className="eldonita-blue-outer">
          <circle
            cx="260"
            cy="260"
            r="174"
            stroke="#3F83EE"
            strokeWidth={compact ? 5 : 7}
            strokeDasharray="132 110 64 128"
            strokeDashoffset="18"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-blue-inner">
          <circle
            cx="260"
            cy="260"
            r="62"
            stroke="#3F83EE"
            strokeWidth={compact ? 4 : 6}
            strokeDasharray="74 66 32 90"
            strokeDashoffset="24"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-green-mid">
          <circle
            cx="260"
            cy="260"
            r="132"
            stroke="#6FC256"
            strokeWidth={compact ? 4 : 6}
            strokeDasharray="98 92 62 108"
            strokeDashoffset="34"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-green-inner">
          <circle
            cx="260"
            cy="260"
            r="83"
            stroke="#6FC256"
            strokeWidth={compact ? 4 : 5}
            strokeDasharray="54 70 30 104"
            strokeDashoffset="12"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-silver-arcs">
          <circle
            cx="260"
            cy="260"
            r="150"
            stroke="#B5BDC7"
            strokeWidth={compact ? 4 : 6}
            strokeDasharray="128 152 54 136"
            strokeDashoffset="96"
            strokeLinecap="round"
          />
        </g>

        <g className="eldonita-core">
          <circle cx="260" cy="260" r="44" stroke="#6FC256" strokeOpacity="0.2" />
          <g className="eldonita-core-blue">
            <circle
              cx="260"
              cy="260"
              r="47"
              stroke="#3F83EE"
              strokeWidth={compact ? 4 : 5}
              strokeDasharray="74 104"
              strokeDashoffset="28"
              strokeOpacity="0.82"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {ambientOrbitDots.map((dot) => (
        <div
          key={`${dot.color}-${dot.angle}`}
          className="eldonita-ambient-dot pointer-events-none absolute inset-0"
          data-duration={dot.duration}
          data-direction={dot.direction}
          style={{ transform: `rotate(${dot.angle}deg)` }}
        >
          <span
            className="absolute left-1/2 z-10 block rounded-full border border-white/10"
            style={{
              top: `${50 - dot.radius}%`,
              width: `${dot.size}rem`,
              height: `${dot.size}rem`,
              backgroundColor: dot.color,
              boxShadow: `0 0 20px ${dot.color}55`,
              transform: 'translate(-50%, -50%)',
              opacity: compact ? 0.28 : 0.52,
            }}
          />
        </div>
      ))}

      {orbitDots.map((dot) => {
        const source = dataSources[dot.sourceIndex];
        const Icon = source.icon;

        return (
          <div
            key={source.title}
            className="eldonita-orbit-dot pointer-events-none absolute inset-0"
            data-duration={dot.duration}
            data-angle={dot.angle}
            data-direction={dot.direction}
            style={{ transform: `rotate(${dot.angle}deg)` }}
          >
            {!interactive ? (
              <span
                className="eldonita-orbit-pulse absolute left-1/2 z-20 block rounded-full"
                style={{
                  top: `${50 - dot.radius}%`,
                  width: `${dot.size * 0.52}rem`,
                  height: `${dot.size * 0.52}rem`,
                  backgroundColor: dot.color,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ) : (
              <button
                type="button"
                aria-label={`Fonte: ${source.title}`}
                className="eldonita-orbit-pulse pointer-events-auto absolute left-1/2 z-20 flex items-center justify-center rounded-full border border-white/25 bg-[#061725]/85 text-white shadow-[0_0_22px_rgba(63,131,238,0.32)] outline-none transition-[border-color,box-shadow] hover:border-white/55 hover:shadow-[0_0_32px_rgba(101,160,255,0.48)] focus-visible:border-white"
                style={{
                  top: `${50 - dot.radius}%`,
                  width: `${dot.size}rem`,
                  height: `${dot.size}rem`,
                  color: dot.color,
                  transform: 'translate(-50%, -50%)',
                }}
                onPointerEnter={() => setActiveSourceIndex(dot.sourceIndex)}
                onPointerLeave={() => setActiveSourceIndex(null)}
                onMouseEnter={() => setActiveSourceIndex(dot.sourceIndex)}
                onMouseLeave={() => setActiveSourceIndex(null)}
                onFocus={() => setActiveSourceIndex(dot.sourceIndex)}
                onBlur={() => setActiveSourceIndex(null)}
              >
                <span className="eldonita-orbit-face relative flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.8} />
                  {activeSourceIndex === dot.sourceIndex && (
                    <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.55rem)] z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12 bg-[#061725]/92 px-3 py-1.5 text-[0.72rem] font-medium text-white shadow-[0_16px_36px_rgba(0,0,0,0.28)] backdrop-blur-md">
                      Fonte: {source.title}
                    </span>
                  )}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const LogoMark = ({ className = '' }: { className?: string }) => {
  const logoRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set('.eldonita-logo-ring, .eldonita-logo-dots', {
        svgOrigin: '56 56',
      });
      gsap.to('.eldonita-logo-ring-outer', {
        rotate: 360,
        duration: 22,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.eldonita-logo-ring-mid', {
        rotate: -360,
        duration: 29,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.eldonita-logo-ring-inner', {
        rotate: 360,
        duration: 18,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.eldonita-logo-dots', {
        rotate: -360,
        duration: 34,
        repeat: -1,
        ease: 'none',
      });
    }, logo);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={logoRef}
      className={className}
      viewBox="-12 -10 710 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path d="M0 20h64v14H16v16h45v13H16v19h50v14H0V20Z" />
        <path d="M78 20h16v62h45v14H78V20Z" />
        <path d="M152 20h42c27 0 45 15 45 38s-18 38-45 38h-42V20Zm40 62c18 0 30-9 30-24s-12-24-30-24h-24v48h24Z" />
        <path d="M378 20h17l55 52V20h16v76h-17l-55-52v52h-16V20Z" />
        <path d="M483 20h16v76h-16V20Z" />
        <path d="M512 20h82v14h-33v62h-16V34h-33V20Z" />
        <path d="M591 96l37-76h18l37 76h-18l-8-17h-40l-8 17h-18Zm32-30h28l-14-30-14 30Z" />
      </g>
      <g transform="translate(246 0)">
        <g className="eldonita-logo-ring eldonita-logo-ring-mid">
          <circle cx="56" cy="56" r="43" stroke="#C9D0D8" strokeWidth="7" strokeDasharray="108 58" strokeDashoffset="52" strokeLinecap="round" />
        </g>
        <g className="eldonita-logo-ring eldonita-logo-ring-outer">
          <circle cx="56" cy="56" r="54" stroke="#0D67D8" strokeWidth="7" strokeDasharray="116 72 36 46" strokeDashoffset="18" strokeLinecap="round" />
        </g>
        <g className="eldonita-logo-ring eldonita-logo-ring-inner">
          <circle cx="56" cy="56" r="31" stroke="#2FAA3F" strokeWidth="7" strokeDasharray="92 44" strokeLinecap="round" />
          <circle cx="56" cy="56" r="22" stroke="#2FAA3F" strokeWidth="6" strokeDasharray="86 78" strokeDashoffset="18" strokeLinecap="round" />
        </g>
        <g className="eldonita-logo-dots">
          <circle cx="101" cy="22" r="8" fill="#0D67D8" />
          <circle cx="20" cy="90" r="8" fill="#0D67D8" />
        </g>
      </g>
    </svg>
  );
};

const Wordmark = () => (
  <div className="leading-none text-white">
    <LogoMark className="h-auto w-[9.25rem] text-white md:w-[11.5rem]" />
    <div className="mt-1 text-[0.42rem] tracking-[0.42em] text-white/55 md:text-[0.5rem]">
      INTELIGÊNCIA
    </div>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="h-px w-9 bg-[#6fc256]" />
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#65a0ff]">
      {children}
    </p>
  </div>
);

const ELDONITA_ROUTE_TRANSITION_EVENT = 'eldonita:route-transition';
const ELDONITA_ROUTE_REVEAL_EVENT = 'eldonita:route-reveal';
const ELDONITA_ROUTE_COVER_DELAY = 1520;
const ELDONITA_ROUTE_REVEAL_DELAY = 40;
const ELDONITA_ROUTE_REVEAL_DURATION = 980;

const useEldonitaNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (to: string, delay = 0) => {
    const targetUrl = new URL(to, window.location.origin);
    const currentPath = `${location.pathname}${location.search}`;
    const targetPath = `${targetUrl.pathname}${targetUrl.search}`;
    const hash = targetUrl.hash.slice(1);
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollToHash = (wait = 120) => {
      if (!hash) {
        return;
      }

      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, wait);
    };

    if (currentPath === targetPath) {
      scrollToHash();
      return;
    }

    const changePage = () => {
      navigate(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
      scrollToHash(900);
      window.setTimeout(() => {
        window.dispatchEvent(new Event(ELDONITA_ROUTE_REVEAL_EVENT));
      }, ELDONITA_ROUTE_REVEAL_DELAY);
    };

    if (shouldReduceMotion) {
      window.setTimeout(changePage, delay);
      return;
    }

    window.dispatchEvent(new Event(ELDONITA_ROUTE_TRANSITION_EVENT));
    window.setTimeout(changePage, delay + ELDONITA_ROUTE_COVER_DELAY);
  };
};

const EldonitaRouteLink = ({
  to,
  className,
  children,
  ariaLabel,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) => {
  const navigateWithTransition = useEldonitaNavigation();

  return (
    <a
      href={to}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        navigateWithTransition(to);
      }}
    >
      {children}
    </a>
  );
};

const MethodHeader = ({ active = 'Método' }: { active?: 'Soluções' | 'Método' | 'Depoimentos' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const transitionTo = useEldonitaNavigation();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const menuItems = [
    { label: 'Soluções', to: '/playground/eldonita#solucoes', active: active === 'Soluções' },
    { label: 'Método', to: '/playground/eldonita/metodo', active: active === 'Método' },
    { label: 'Depoimentos', to: '/playground/eldonita#depoimentos', active: active === 'Depoimentos' },
  ] as const;

  const navigateWithTransition = (to: string) => {
    setMenuOpen(false);
    transitionTo(to, 320);
  };

  return (
    <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-5 py-7 md:px-8 lg:px-12">
      <EldonitaRouteLink to="/playground/eldonita" ariaLabel="Eldonita home">
        <Wordmark />
      </EldonitaRouteLink>

      <button
        type="button"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        aria-controls="eldonita-navigation"
        onClick={() => setMenuOpen((open) => !open)}
        className="relative z-[120] flex h-12 w-12 items-center justify-center text-white transition-colors hover:text-[#65a0ff]"
      >
        {menuOpen ? <X size={28} strokeWidth={1.7} /> : <Menu size={30} strokeWidth={1.8} />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="eldonita-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navegação"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03101a]/96 px-5 py-20 backdrop-blur-xl"
          >
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0"
            />

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
              <nav className="w-full text-center">
                {menuItems.map((item, index) => (
                  <motion.button
                    type="button"
                    key={item.label}
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -22 }}
                    transition={{
                      duration: 0.48,
                      delay: index * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => navigateWithTransition(item.to)}
                    className="group flex w-full items-baseline justify-center gap-4 border-b border-white/[0.07] py-4 text-center md:gap-7 md:py-5"
                  >
                    <span className="text-[0.62rem] font-medium tracking-[0.2em] text-[#65a0ff]/65">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-4xl font-light tracking-normal transition-[color,transform] duration-300 group-hover:translate-x-2 sm:text-5xl md:text-7xl ${
                        item.active ? 'text-[#75c75d]' : 'text-white group-hover:text-[#65a0ff]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                ))}

                <motion.a
                  href="mailto:contato@eldonita.com"
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 0.48, delay: 0.21, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex w-full items-baseline justify-center gap-4 py-4 text-center md:gap-7 md:py-5"
                >
                  <span className="text-[0.62rem] font-medium tracking-[0.2em] text-[#65a0ff]/65">04</span>
                  <span className="text-4xl font-light tracking-normal text-white transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-[#65a0ff] sm:text-5xl md:text-7xl">
                    Contato
                  </span>
                </motion.a>
              </nav>

              <motion.a
                href="mailto:contato@eldonita.com?subject=Quero experimentar a plataforma"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.34 }}
                className="mt-8 inline-flex items-center gap-3 border-b border-[#75c75d]/55 pb-2 text-sm font-medium text-white transition-colors hover:text-[#75c75d] md:mt-10 md:text-base"
              >
                Experimente nossa plataforma
                <ArrowRight size={17} />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const MethodSourceVisual = ({
  index,
  expanded = false,
  layered = false,
}: {
  index: number;
  expanded?: boolean;
  layered?: boolean;
}) => {
  const visualIndexes = layered ? methodSources.map((_, sourceIndex) => sourceIndex) : [index];

  return (
    <div className={`flex items-center justify-center overflow-visible ${expanded ? 'min-h-[520px]' : 'min-h-[320px]'}`}>
      <div className={`relative aspect-square ${expanded ? 'w-[min(48vw,560px)]' : 'w-[min(82vw,410px)]'}`}>
        <svg
          viewBox="0 0 420 420"
          className="method-source-network-shell absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <g className="method-source-guides">
            <circle cx="210" cy="210" r="184" stroke="white" strokeOpacity="0.08" />
            <circle
              className="method-source-scanline"
              cx="210"
              cy="210"
              r="166"
              stroke="#3F83EE"
              strokeOpacity="0.18"
              strokeDasharray="0.7 13"
              strokeLinecap="round"
            />
            <circle cx="210" cy="210" r="132" stroke="#3F83EE" strokeOpacity="0.15" />
            <circle cx="210" cy="210" r="92" stroke="#6FC256" strokeOpacity="0.12" />
            <circle cx="210" cy="210" r="55" stroke="white" strokeOpacity="0.08" />
          </g>

          <g className="method-source-blue-outer">
            <circle
              cx="210"
              cy="210"
              r="154"
              stroke="#3F83EE"
              strokeWidth="5.5"
              strokeDasharray="112 106 52 120"
              strokeDashoffset="18"
              strokeLinecap="round"
            />
          </g>
          <g className="method-source-silver-arcs">
            <circle
              cx="210"
              cy="210"
              r="122"
              stroke="#B5BDC7"
              strokeWidth="5"
              strokeDasharray="98 124 42 118"
              strokeDashoffset="78"
              strokeLinecap="round"
            />
          </g>
          <g className="method-source-green-mid">
            <circle
              cx="210"
              cy="210"
              r="98"
              stroke="#6FC256"
              strokeWidth="5"
              strokeDasharray="76 72 44 96"
              strokeDashoffset="26"
              strokeLinecap="round"
            />
          </g>
          <g className="method-source-blue-inner">
            <circle
              cx="210"
              cy="210"
              r="70"
              stroke="#3F83EE"
              strokeWidth="4.5"
              strokeDasharray="54 62 30 74"
              strokeDashoffset="20"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
          </g>
          <g className="method-source-network-pulses">
            <circle cx="210" cy="26" r="3.5" fill="#3F83EE" />
            <circle cx="376" cy="210" r="3" fill="#6FC256" />
            <circle cx="210" cy="342" r="2.6" fill="#B5BDC7" fillOpacity="0.72" />
            <circle cx="118" cy="210" r="3" fill="#3F83EE" fillOpacity="0.78" />
          </g>
        </svg>

        {visualIndexes.map((sourceIndex) => {
          const CoreIcon = methodSources[sourceIndex].icon;

          return (
            <div
              key={`source-visual-state-${sourceIndex}`}
              className="method-source-visual-state absolute inset-0 z-10"
              data-source-index={sourceIndex}
            >
              {sourceNetworkSets[sourceIndex].map((node, nodeIndex) => {
                const Icon = node.icon;
                const sizeClass = node.size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
                const iconSize = node.size === 'sm' ? 15 : 18;

                return (
                  <div
                    key={`network-node-${sourceIndex}-${nodeIndex}`}
                    className="method-source-network-orbit absolute inset-0"
                    data-angle={node.angle}
                    data-duration={node.duration}
                    data-direction={node.direction}
                    style={{ transform: `rotate(${node.angle}deg)` }}
                  >
                    <div
                      className="absolute left-1/2"
                      style={{
                        top: `${50 - node.radius}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="method-source-network-face" style={{ transform: `rotate(${-node.angle}deg)` }}>
                        <div
                          className={`flex ${sizeClass} items-center justify-center rounded-full border bg-[#061725]/92 shadow-[0_0_24px_rgba(3,10,18,0.46)] backdrop-blur-md`}
                          style={{
                            color: node.color,
                            borderColor: `${node.color}66`,
                            boxShadow: `0 0 24px ${node.color}24`,
                          }}
                        >
                          <Icon size={iconSize} strokeWidth={1.8} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <CoreIcon size={27} strokeWidth={1.7} className="text-[#65a0ff]" />
              </div>
            </div>
          );
        })}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-none relative h-[4.5rem] w-[4.5rem] rounded-full border border-[#65a0ff]/22 bg-[#061725]/96 shadow-[0_0_42px_rgba(63,131,238,0.18)]">
            <span className="method-source-core-ring absolute inset-[-7px] rounded-full border border-[#6fc256]/35 border-l-transparent border-b-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SeaNarrativeVisual = ({ className = '' }: { className?: string }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <svg
      viewBox="0 0 1440 760"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <g className="sea-wave-field" style={{ transformOrigin: '50% 78%' }}>
        {seaWaveStates[0].map((path, index) => (
          <path
            key={`sea-wave-${index}`}
            className={`sea-wave ${index === 0 ? 'sea-wave-slow' : index === 2 ? 'sea-wave-fast' : 'sea-wave-reverse'}`}
            data-sea-wave={index}
            d={path}
            fill="none"
            stroke={index === 1 ? '#6FC256' : index === 3 ? 'white' : '#65A0FF'}
            strokeOpacity={index === 0 ? 0.54 : index === 1 ? 0.42 : index === 2 ? 0.23 : 0.08}
            strokeWidth={index === 0 ? 3 : index === 3 ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <g className="sea-filter-marker" opacity="0.58">
          <line
            x1="790"
            y1="270"
            x2="790"
            y2="735"
            stroke="#B5BDC7"
            strokeOpacity="0.24"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
          <circle cx="790" cy="270" r="3" fill="#B5BDC7" opacity="0.55" />
          <text
            x="806"
            y="286"
            fill="#B5BDC7"
            fillOpacity="0.48"
            fontSize="10"
            letterSpacing="3"
          >
            FILTRO
          </text>
        </g>
        <g className="sea-path-markers">
          {Array.from({ length: 15 }).map((_, index) => (
            <g
              key={`sea-path-marker-${index}`}
              className="sea-path-marker"
              data-path-index={index % seaWaveStates[0].length}
              data-offset={(index * 0.097) % 1}
              data-speed={0.65 + (index % 4) * 0.17}
              opacity="0"
            >
              <circle
                className="sea-path-marker-dot"
                r={index % 4 === 0 ? 7 : 5.5}
                fill="#7D8794"
                stroke="white"
                strokeOpacity="0.14"
                strokeWidth="1"
              />
              <text
                className="sea-path-marker-icon"
                x="0"
                y="0"
                fill="white"
                fontSize="7"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
                opacity="0"
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  </div>
);

const methodHeroLines = [
  ['Um', 'método'],
  ['para', 'transformar'],
  ['sinais', 'em'],
] as const;

const EldonitaCursor = ({ rootId }: { rootId: string }) => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    const dot = dotRef.current;
    const ring = ringRef.current;
    const finePointer = window.matchMedia('(pointer: fine) and (min-width: 768px)');

    if (!root || !dot || !ring || !finePointer.matches) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = `#${rootId}, #${rootId} * { cursor: none !important; }`;
    document.head.appendChild(style);

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
    };

    const onLeave = () => {
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('a, button, input, textarea, select, [role="button"], [data-cursor-hover]')) {
        return;
      }

      gsap.to(dot, {
        scale: 0.7,
        backgroundColor: '#75c75d',
        duration: 0.25,
        overwrite: 'auto',
      });
      gsap.to(ring, {
        scale: 1.28,
        borderColor: 'rgba(117,199,93,0.78)',
        backgroundColor: 'transparent',
        duration: 0.35,
        overwrite: 'auto',
      });
    };

    const onOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('a, button, input, textarea, select, [role="button"], [data-cursor-hover]')) {
        return;
      }

      gsap.to(dot, {
        scale: 1,
        backgroundColor: '#75c75d',
        duration: 0.25,
        overwrite: 'auto',
      });
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(101,160,255,0.55)',
        backgroundColor: 'transparent',
        duration: 0.35,
        overwrite: 'auto',
      });
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerover', onOver);
    root.addEventListener('pointerout', onOut);

    return () => {
      style.remove();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerout', onOut);
    };
  }, [rootId]);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 opacity-0 md:block"
      >
        <svg className="h-full w-full" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle
            className="origin-center animate-spin"
            cx="18"
            cy="18"
            r="15"
            stroke="#65a0ff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="34 24 12 18"
            opacity="0.72"
            style={{ animationDuration: '9s' }}
          />
          <circle
            className="origin-center animate-spin"
            cx="18"
            cy="18"
            r="10"
            stroke="#75c75d"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="22 18"
            opacity="0.56"
            style={{ animationDuration: '6.5s', animationDirection: 'reverse' }}
          />
        </svg>
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[201] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#03101a] bg-[#75c75d] opacity-0 shadow-[0_0_14px_rgba(117,199,93,0.58)] md:block"
      />
    </>
  );
};

const EldonitaMethodPage = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const wrapper = scrollerRef.current;
    const content = contentRef.current;
    const desktopMotion = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!wrapper || !content || !desktopMotion.matches || reducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      wrapper,
      content,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.82,
      overscroll: true,
      anchors: { duration: 1.05 },
    });
    lenisRef.current = lenis;

    const updateScrollTrigger = () => ScrollTrigger.update();
    const raf = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const page = pageRef.current;
    if (!scroller || !page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const heroTitleWords = gsap.utils.toArray<HTMLElement>('.method-hero-word');
      const heroVisual = page.querySelector<HTMLElement>('.method-hero-visual');
      const heroVisualLayers = gsap.utils.toArray<SVGElement>(
        '.method-hero-visual .eldonita-ring-slow, .method-hero-visual .eldonita-ring-fast, .method-hero-visual .eldonita-blue-outer, .method-hero-visual .eldonita-blue-inner, .method-hero-visual .eldonita-green-mid, .method-hero-visual .eldonita-green-inner, .method-hero-visual .eldonita-silver-arcs, .method-hero-visual .eldonita-core-blue',
      );
      const heroVisualDots = gsap.utils.toArray<HTMLElement>(
        '.method-hero-visual .eldonita-orbit-dot, .method-hero-visual .eldonita-ambient-dot',
      );

      if (heroTitleWords.length && heroVisual) {
        gsap.set(heroTitleWords, {
          autoAlpha: 0,
          yPercent: 110,
          rotate: 5,
          transformOrigin: '0% 100%',
        });
        gsap.set('.method-hero-label', { autoAlpha: 0, y: 18 });
        gsap.set('.method-hero-paragraph', { autoAlpha: 0, y: 26 });
        gsap.set(heroVisual, {
          autoAlpha: 0,
          scale: 0.82,
          xPercent: 8,
          yPercent: 2,
          rotate: -8,
          transformOrigin: '50% 50%',
        });
        gsap.set(heroVisualLayers, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' });
        gsap.set(heroVisualDots, { autoAlpha: 0, scale: 0.25, transformOrigin: '50% 50%' });

        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTimeline
          .to('.method-hero-label', { autoAlpha: 1, y: 0, duration: 0.55 })
          .to(
            heroTitleWords,
            {
              autoAlpha: 1,
              yPercent: 0,
              rotate: 0,
              duration: 0.9,
              stagger: 0.075,
            },
            '-=0.12',
          )
          .to(
            heroVisual,
            {
              autoAlpha: 1,
              scale: 1,
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              duration: 1.2,
            },
            '-=0.98',
          )
          .to(
            heroVisualLayers,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.06,
            },
            '-=0.9',
          )
          .to(
            heroVisualDots,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.55,
              stagger: 0.03,
            },
            '-=0.48',
          )
          .to('.method-hero-paragraph', { autoAlpha: 1, y: 0, duration: 0.72 }, '-=0.34');
      }

      gsap.utils.toArray<HTMLElement>('[data-heading-reveal]').forEach((element) => {
        gsap.set(element, { clipPath: 'inset(0 0 100% 0)', y: 34, autoAlpha: 0 });
        gsap.to(element, {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            scroller,
            start: 'top 86%',
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-method-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 54 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              scroller,
              start: 'top 86%',
              once: true,
            },
          },
        );
      });

      const closingWordElements = gsap.utils.toArray<HTMLElement>('.method-closing-word');
      if (closingWordElements.length > 1) {
        gsap.set(closingWordElements, { autoAlpha: 0, yPercent: 105 });
        gsap.set(closingWordElements[0], { autoAlpha: 1, yPercent: 0 });

        const closingWordsTimeline = gsap.timeline({
          repeat: -1,
          paused: true,
        });

        closingWordElements.forEach((word, index) => {
          const nextWord = closingWordElements[(index + 1) % closingWordElements.length];
          closingWordsTimeline
            .to({}, { duration: 1.65 })
            .to(word, {
              autoAlpha: 0,
              yPercent: -105,
              duration: 0.52,
              ease: 'power3.inOut',
            })
            .fromTo(
              nextWord,
              { autoAlpha: 0, yPercent: 105 },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.52,
                ease: 'power3.inOut',
                immediateRender: false,
              },
              '<0.12',
            );
        });

        ScrollTrigger.create({
          trigger: '.method-closing-section',
          scroller,
          start: 'top 82%',
          end: 'bottom top',
          onEnter: () => closingWordsTimeline.play(),
          onEnterBack: () => closingWordsTimeline.play(),
          onLeave: () => closingWordsTimeline.pause(),
          onLeaveBack: () => closingWordsTimeline.pause(),
        });
      }

      gsap.fromTo(
        '.method-closing-orbit',
        { autoAlpha: 0, yPercent: 16, scale: 0.9 },
        {
          autoAlpha: 0.065,
          yPercent: 0,
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.method-closing-section',
            scroller,
            start: 'top 86%',
            once: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('[data-method-grid]').forEach((grid) => {
        const cards = Array.from(grid.children);
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 44, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.11,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: grid,
              scroller,
              start: 'top 82%',
              once: true,
            },
          },
        );
      });

      const journeyStory = page.querySelector<HTMLElement>('.method-journey-story');
      const journeyCards = gsap.utils.toArray<HTMLElement>('.method-journey-card');
      const journeyGhost = page.querySelector<HTMLElement>('.method-journey-ghost');

      if (
        journeyStory
        && journeyCards.length === methodTabs.length
        && journeyGhost
        && window.matchMedia('(min-width: 768px)').matches
      ) {
        const journeyGhostInner = journeyGhost.firstElementChild as HTMLElement | null;

        gsap.set(journeyGhost, { autoAlpha: 0, yPercent: 10, scale: 0.96 });
        if (journeyGhostInner) {
          gsap.set(journeyGhostInner, {
            yPercent: 4,
            rotate: -6,
            scale: 1,
            transformOrigin: '50% 50%',
          });
        }
        gsap.set(journeyCards, {
          autoAlpha: 0,
          scale: 0.94,
          y: 38,
          borderColor: 'rgba(255,255,255,0.10)',
          backgroundColor: 'rgba(255,255,255,0.035)',
        });
        gsap.set(journeyCards[0], {
          scale: 1.06,
          borderColor: 'rgba(101,160,255,0.52)',
          backgroundColor: 'rgba(255,255,255,0.11)',
          boxShadow: '0 28px 90px rgba(0,0,0,0.16)',
        });

        const journeyIntro = gsap.timeline({
          scrollTrigger: {
            trigger: journeyStory,
            scroller,
            start: 'top 84%',
            once: true,
          },
          defaults: { ease: 'power3.out' },
        });

        journeyIntro
          .to(
            journeyGhost,
            {
              autoAlpha: 0.12,
              yPercent: 0,
              scale: 1,
              duration: 1.1,
            },
            0,
          )
          .to(
            journeyGhostInner,
            {
              yPercent: 0,
              rotate: 0,
              duration: 1.12,
            },
            0.04,
          )
          .to(
            journeyCards,
            {
              autoAlpha: (_, target) => (target === journeyCards[0] ? 1 : 0.48),
              y: (_, target) => (target === journeyCards[0] ? 0 : 22),
              scale: (_, target) => (target === journeyCards[0] ? 1.06 : 0.94),
              duration: 0.82,
              stagger: 0.14,
            },
            0.52,
          );

        const journeyTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: journeyStory,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });

        journeyTimeline.to(
          journeyGhost,
          {
            autoAlpha: 0.16,
            yPercent: 0,
            scale: 1,
            duration: 0.58,
            ease: 'power2.out',
          },
          0,
        );

        methodTabs.slice(1).forEach((_, index) => {
          const currentIndex = index;
          const nextIndex = index + 1;
          const position = index === methodTabs.length - 2 ? index * 0.98 + 0.84 : index * 0.92 + 0.78;

          journeyTimeline
            .to(
              journeyCards[currentIndex],
              {
                autoAlpha: 0.48,
                scale: 0.94,
                y: 22,
                borderColor: 'rgba(255,255,255,0.10)',
                backgroundColor: 'rgba(255,255,255,0.035)',
                boxShadow: '0 0 0 rgba(0,0,0,0)',
                duration: 0.35,
                ease: 'power2.out',
              },
              position,
            )
            .to(
              journeyCards[nextIndex],
              {
                autoAlpha: 1,
                scale: 1.06,
                y: 0,
                borderColor: 'rgba(101,160,255,0.52)',
                backgroundColor: 'rgba(255,255,255,0.11)',
                boxShadow: '0 28px 90px rgba(0,0,0,0.16)',
                duration: nextIndex === methodTabs.length - 1 ? 0.56 : 0.42,
                ease: 'power2.out',
              },
              position + 0.06,
            );
        });

      }

      const sourceStory = page.querySelector<HTMLElement>('.method-source-story');
      const sourceCopies = gsap.utils.toArray<HTMLElement>('.method-source-copy');
      const sourceVisual = sourceStory?.querySelector<HTMLElement>('.method-source-icon');
      const sourceVisualStates = sourceVisual
        ? gsap.utils.toArray<HTMLElement>('.method-source-visual-state', sourceVisual)
        : [];
      const sourceIntroLabel = sourceStory?.querySelector<HTMLElement>('.method-source-intro-label');
      const sourceIntroTitle = sourceStory?.querySelector<HTMLElement>('.method-source-intro-title');
      const sourceIntroText = sourceStory?.querySelector<HTMLElement>('.method-source-intro-text');
      const sourceProgress = sourceStory?.querySelector<HTMLElement>('.method-source-progress');
      const sourceProgressFill = sourceStory?.querySelector<HTMLElement>('.method-source-progress-fill');
      const sourceProgressSteps = sourceStory
        ? gsap.utils.toArray<HTMLElement>('.method-source-progress-step', sourceStory)
        : [];

      if (
        sourceStory
        && sourceCopies.length === methodSources.length
        && sourceVisual
        && sourceVisualStates.length === methodSources.length
        && sourceIntroLabel
        && sourceIntroTitle
        && sourceIntroText
        && sourceProgress
        && sourceProgressFill
        && sourceProgressSteps.length === methodSources.length
        && window.matchMedia('(min-width: 768px)').matches
      ) {
        const firstVisualLayers = sourceVisual.querySelectorAll(
          '.method-source-guides, .method-source-blue-outer, .method-source-silver-arcs, .method-source-green-mid, .method-source-blue-inner, .method-source-network-pulses, .method-source-core-ring',
        );
        const firstVisualNodes = sourceVisualStates[0].querySelectorAll('.method-source-network-orbit');

        gsap.set(sourceIntroLabel, { autoAlpha: 0, y: 18 });
        gsap.set(sourceIntroTitle, {
          autoAlpha: 0,
          y: 42,
          clipPath: 'inset(0 0 100% 0)',
        });
        gsap.set(sourceIntroText, { autoAlpha: 0, y: 24 });
        gsap.set(sourceProgress, { autoAlpha: 0, y: 14 });
        gsap.set(sourceProgressFill, { scaleX: 0, transformOrigin: '0% 50%' });
        gsap.set(sourceProgressSteps, { opacity: 0.26, scale: 0.72 });
        gsap.set(sourceCopies, { autoAlpha: 0 });
        gsap.set(sourceVisualStates, { autoAlpha: 0 });
        gsap.set(sourceVisualStates[0], { autoAlpha: 1 });
        gsap.set(sourceVisual, {
          autoAlpha: 0,
          scale: 0.82,
          rotate: -6,
          transformOrigin: '50% 50%',
        });
        gsap.set(firstVisualLayers, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' });
        gsap.set(firstVisualNodes, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' });
        sourceCopies.forEach((copy) => {
          gsap.set(copy.querySelectorAll('.method-source-line'), { autoAlpha: 0, y: 24 });
        });

        const sourceTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: sourceStory,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        sourceTimeline
          .to(sourceIntroLabel, {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            ease: 'power2.out',
          })
          .to(sourceIntroTitle, {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.72,
            ease: 'power3.out',
          }, '>-0.08')
          .to(sourceIntroText, {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            ease: 'power2.out',
          }, '>-0.12')
          .to(sourceProgress, {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          }, '<0.1')
          .to(sourceVisual, {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: 0.72,
            ease: 'power3.out',
          }, '>-0.05')
          .set(sourceCopies[0], { autoAlpha: 1, y: 0 }, '<0.12')
          .to(sourceCopies[0].querySelectorAll('.method-source-line'), {
            autoAlpha: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.09,
            ease: 'power2.out',
          }, '<0.02')
          .to(firstVisualLayers, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.055,
            ease: 'power2.out',
          }, '<0.04')
          .to(firstVisualNodes, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.42,
            stagger: 0.055,
            ease: 'back.out(1.7)',
          }, '<0.08')
          .to(sourceProgressSteps[0], {
            opacity: 1,
            scale: 1.15,
            duration: 0.3,
          }, '<')
          .to({}, { duration: 0.18 });

        methodSources.slice(1).forEach((_, index) => {
          const currentIndex = index;
          const nextIndex = index + 1;

          sourceTimeline
            .to(
              [sourceCopies[currentIndex], sourceVisualStates[currentIndex]],
              { autoAlpha: 0, y: -24, duration: 0.35, ease: 'power2.in' },
            )
            .set(sourceCopies[nextIndex], { autoAlpha: 1, y: 0 }, '>')
            .fromTo(
              sourceVisualStates[nextIndex],
              { autoAlpha: 0, scale: 0.7 },
              { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' },
              '<0.04',
            )
            .fromTo(
              sourceCopies[nextIndex].querySelectorAll('.method-source-line'),
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.32,
                stagger: 0.12,
                ease: 'power2.out',
              },
              '<0.05',
            )
            .to(sourceProgressSteps[nextIndex], {
              opacity: 1,
              scale: 1.15,
              duration: 0.3,
            }, '<0.06')
            .to({}, { duration: nextIndex === methodSources.length - 1 ? 0.82 : 0.26 });
        });

        const sourceTimelineDuration = sourceTimeline.duration();
        sourceTimeline.to(sourceProgressFill, {
          scaleX: 1,
          duration: sourceTimelineDuration,
          ease: 'none',
        }, 0);
      }

      const seaStory = page.querySelector<HTMLElement>('.method-sea-story');
      const seaCopies = gsap.utils.toArray<HTMLElement>('.method-sea-copy');
      const seaField = page.querySelector<SVGGElement>('.method-sea-desktop-visual .sea-wave-field');
      const seaVisual = page.querySelector<HTMLElement>('.method-sea-desktop-visual');
      const seaPaths = gsap.utils.toArray<SVGPathElement>('.method-sea-desktop-visual [data-sea-wave]');
      const seaMarkers = gsap.utils.toArray<SVGGElement>('.method-sea-desktop-visual .sea-path-marker');
      const seaFilterMarker = page.querySelector<SVGGElement>('.method-sea-desktop-visual .sea-filter-marker');
      const seaIntro = seaStory?.querySelector<HTMLElement>('.method-sea-intro');
      const seaQuestion = seaStory?.querySelector<HTMLElement>('.method-sea-question');
      const seaAnswerPrefix = seaStory?.querySelector<HTMLElement>('.method-sea-answer-prefix');
      const seaAnswerSimple = seaStory?.querySelector<HTMLElement>('.method-sea-answer-simple');
      const seaAnswerAlways = seaStory?.querySelector<HTMLElement>('.method-sea-answer-always');
      const seaContext = seaStory?.querySelector<HTMLElement>('.method-sea-context');
      const seaScenarioStage = seaStory?.querySelector<HTMLElement>('.method-sea-scenarios');
      const seaSteps = gsap.utils.toArray<HTMLElement>('.method-sea-step');
      let updateSeaMarkers: (() => void) | null = null;

      if (
        seaStory
        && seaCopies.length === seaScenarios.length
        && seaField
        && seaVisual
        && seaIntro
        && seaQuestion
        && seaAnswerPrefix
        && seaAnswerSimple
        && seaAnswerAlways
        && seaContext
        && seaScenarioStage
        && seaFilterMarker
        && seaPaths.length === seaWaveStates[0].length
        && window.matchMedia('(min-width: 768px)').matches
      ) {
        const calmToAgitated = seaPaths.map((_, index) => (
          interpolate(seaWaveStates[0][index], seaWaveStates[1][index], { maxSegmentLength: 12 })
        ));
        const agitatedToTsunami = seaPaths.map((_, index) => (
          interpolate(seaWaveStates[1][index], seaWaveStates[2][index], { maxSegmentLength: 12 })
        ));
        const firstMorph = { progress: 0 };
        const secondMorph = { progress: 0 };
        const renderMorph = (
          interpolators: Array<(progress: number) => string>,
          progress: number,
        ) => {
          seaPaths.forEach((path, index) => {
            path.setAttribute('d', interpolators[index](progress));
          });
        };

        gsap.set(seaCopies, { autoAlpha: 0 });
        gsap.set(seaSteps, { opacity: 0.28 });
        gsap.set([seaQuestion, seaAnswerPrefix, seaAnswerSimple, seaAnswerAlways, seaContext], {
          autoAlpha: 0,
          y: 30,
        });
        gsap.set([seaAnswerSimple, seaAnswerAlways], {
          yPercent: 115,
          y: 0,
          rotate: 3,
          transformOrigin: '0% 100%',
        });
        gsap.set(seaIntro, { transformOrigin: '0% 0%' });
        gsap.set(seaScenarioStage, { autoAlpha: 0, y: 34 });
        gsap.set(seaVisual, { autoAlpha: 0 });
        gsap.set(seaField, { opacity: 0.66, y: 50 });
        gsap.set(seaFilterMarker, { y: 140 });
        seaCopies.forEach((copy) => {
          gsap.set(copy.querySelectorAll('.method-sea-line'), { autoAlpha: 0, y: 26 });
        });

        const seaTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: seaStory,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });

        seaTimeline
          .to(seaQuestion, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
          })
          .to(seaAnswerPrefix, {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          }, '>-0.08')
          .to(seaAnswerSimple, {
            autoAlpha: 1,
            yPercent: 0,
            rotate: 0,
            duration: 0.52,
            ease: 'power3.out',
          }, '>-0.04')
          .to(seaAnswerAlways, {
            autoAlpha: 1,
            yPercent: 0,
            rotate: 0,
            duration: 0.62,
            ease: 'power3.out',
          }, '>-0.22')
          .to(seaContext, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          }, '>-0.1')
          .to({}, { duration: 0.32 })
          .to(seaIntro, {
            yPercent: -58,
            scale: 0.58,
            duration: 0.62,
            ease: 'power3.inOut',
          })
          .to(seaScenarioStage, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          }, '>-0.08')
          .to(seaVisual, {
            autoAlpha: 1,
            duration: 0.48,
            ease: 'power2.out',
          }, '<')
          .to(seaField, {
            y: 0,
            duration: 0.62,
            ease: 'power3.out',
          }, '<')
          .set(seaCopies[0], { autoAlpha: 1 })
          .to(seaCopies[0].querySelectorAll('.method-sea-line'), {
            autoAlpha: 1,
            y: 0,
            duration: 0.36,
            stagger: 0.14,
            ease: 'power2.out',
          }, '<0.12')
          .to(seaSteps[0], {
            opacity: 1,
            duration: 0.28,
          }, '<')
          .to({}, { duration: 0.34 });

        const markerProgress = seaMarkers.map((marker) => Number(marker.dataset.offset ?? 0));
        const markerClassifications = [
          { color: '#6FC256', icon: '+' },
          { color: '#E6B84A', icon: '↓' },
          { color: '#E95D5D', icon: '−' },
        ] as const;
        updateSeaMarkers = () => {
          const storyProgress = seaTimeline.progress();
          const activeMarkers = storyProgress < 0.34 ? 5 : storyProgress < 0.76 ? 10 : 15;
          const speedMultiplier = storyProgress < 0.34 ? 0.45 : storyProgress < 0.76 ? 0.9 : 1.55;
          const delta = gsap.ticker.deltaRatio(60) / 60;

          seaMarkers.forEach((marker, index) => {
            const pathIndex = Number(marker.dataset.pathIndex ?? 0);
            const path = seaPaths[pathIndex];
            const dot = marker.querySelector<SVGCircleElement>('.sea-path-marker-dot');
            const icon = marker.querySelector<SVGTextElement>('.sea-path-marker-icon');
            if (!path) {
              return;
            }

            markerProgress[index] = (
              markerProgress[index]
              + Number(marker.dataset.speed ?? 1) * speedMultiplier * delta * 0.035
            ) % 1;
            const pathLength = path.getTotalLength();
            const visiblePathProgress = 0.11 + markerProgress[index] * 0.6;
            const point = path.getPointAtLength(pathLength * visiblePathProgress);
            const pathTranslateX = Number(gsap.getProperty(path, 'x')) || 0;
            const x = point.x + pathTranslateX;
            const lifecycle = Math.sin(Math.PI * markerProgress[index]);
            const scale = 0.28 + lifecycle * 0.92;
            const classified = x >= 790;
            const classification = markerClassifications[index % markerClassifications.length];

            marker.setAttribute('transform', `translate(${x} ${point.y}) scale(${scale})`);
            marker.style.opacity = index < activeMarkers
              ? String(lifecycle * (0.62 + (index % 3) * 0.12))
              : '0';

            if (dot) {
              dot.setAttribute('fill', classified ? classification.color : '#7D8794');
            }
            if (icon) {
              icon.textContent = classified ? classification.icon : '';
              icon.style.opacity = classified && lifecycle > 0.28 ? '0.95' : '0';
            }
          });
        };
        gsap.ticker.add(updateSeaMarkers);

        seaScenarios.slice(1).forEach((_, index) => {
          const currentIndex = index;
          const nextIndex = index + 1;

          seaTimeline
            .to(
              seaCopies[currentIndex],
              { autoAlpha: 0, y: -22, duration: 0.35, ease: 'power2.in' },
            )
            .to(
              seaSteps[currentIndex],
              { opacity: 0.28, duration: 0.24, ease: 'power2.out' },
              '<',
            )
            .to(
              seaSteps[nextIndex],
              { opacity: 1, duration: 0.28, ease: 'power2.out' },
              '<0.12',
            )
            .set(seaCopies[nextIndex], { autoAlpha: 1, y: 0 }, '<0.04')
            .fromTo(
              seaCopies[nextIndex].querySelectorAll('.method-sea-line'),
              { autoAlpha: 0, y: 26 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.36,
                stagger: 0.16,
                ease: 'power2.out',
              },
              '<0.04',
            );

          if (nextIndex === 1) {
            seaTimeline
              .to(firstMorph, {
                progress: 1,
                duration: 0.62,
                ease: 'power2.inOut',
                onUpdate: () => renderMorph(calmToAgitated, firstMorph.progress),
              }, '<')
              .to(seaFilterMarker, {
                y: 10,
                duration: 0.62,
                ease: 'power2.inOut',
              }, '<');
          } else {
            seaTimeline
              .to(secondMorph, {
                progress: 1,
                duration: 0.68,
                ease: 'power2.inOut',
                onUpdate: () => renderMorph(agitatedToTsunami, secondMorph.progress),
              }, '<')
              .to(seaFilterMarker, {
                y: -205,
                duration: 0.68,
                ease: 'power2.inOut',
              }, '<');
          }

          seaTimeline.to({}, { duration: nextIndex === 2 ? 0.72 : 0.34 });
        });
      }

      const sourceOrbitLayers = [
        { selector: '.method-source-blue-outer', rotation: 360, duration: 58 },
        { selector: '.method-source-silver-arcs', rotation: -360, duration: 72 },
        { selector: '.method-source-green-mid', rotation: -360, duration: 49 },
        { selector: '.method-source-blue-inner', rotation: 360, duration: 37 },
        { selector: '.method-source-guides', rotation: -360, duration: 108 },
        { selector: '.method-source-core-ring', rotation: 360, duration: 24 },
      ];

      sourceOrbitLayers.forEach(({ selector, rotation, duration }) => {
        gsap.utils.toArray<HTMLElement>(selector).forEach((layer, index) => {
          gsap.set(layer, { transformOrigin: '50% 50%' });
          gsap.to(layer, {
            rotate: rotation,
            duration: duration + index * 4,
            repeat: -1,
            ease: 'none',
          });
        });
      });

      gsap.to('.method-source-scanline', {
        strokeDashoffset: -84,
        duration: 14,
        repeat: -1,
        ease: 'none',
      });

      gsap.utils.toArray<HTMLElement>('.method-source-network-pulses').forEach((group, index) => {
        gsap.to(group, {
          rotate: index % 2 === 0 ? 360 : -360,
          duration: 34 + index * 6,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
      });

      gsap.utils.toArray<HTMLElement>('.method-source-network-orbit').forEach((orbit) => {
        const face = orbit.querySelector<HTMLElement>('.method-source-network-face');
        const angle = Number(orbit.dataset.angle ?? 0);
        const duration = Number(orbit.dataset.duration ?? 54);
        const direction = Number(orbit.dataset.direction ?? 1);

        gsap.set(orbit, { rotate: angle, transformOrigin: '50% 50%' });
        gsap.to(orbit, {
          rotate: direction > 0 ? '+=360' : '-=360',
          duration,
          repeat: -1,
          ease: 'none',
        });

        if (face) {
          gsap.set(face, { rotate: -angle, transformOrigin: '50% 50%' });
          gsap.to(face, {
            rotate: direction > 0 ? '-=360' : '+=360',
            duration,
            repeat: -1,
            ease: 'none',
          });
        }
      });

      gsap.to('.sea-wave-slow', {
        x: 26,
        duration: 5.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.sea-wave-fast', {
        x: -34,
        duration: 2.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.sea-wave-reverse', {
        x: -22,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const progressFill = scroller.querySelector<HTMLElement>('.method-progress-fill');

      const updateScrollPresentation = () => {
        const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
        const progress = Math.min(1, Math.max(0, scroller.scrollTop / maxScroll));

        gsap.set(progressFill, { scaleY: progress, transformOrigin: 'top' });
      };

      scroller.addEventListener('scroll', updateScrollPresentation, { passive: true });
      updateScrollPresentation();
      return () => {
        scroller.removeEventListener('scroll', updateScrollPresentation);
        if (updateSeaMarkers) {
          gsap.ticker.remove(updateSeaMarkers);
        }
      };
    }, page);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  const scrollToSeaScenario = (index: number) => {
    const scroller = scrollerRef.current;
    const story = pageRef.current?.querySelector<HTMLElement>('.method-sea-story');
    if (!scroller || !story) {
      return;
    }

    const positions = [0.52, 0.73, 0.94];
    const storyTravel = Math.max(0, story.offsetHeight - scroller.clientHeight);
    const target = story.offsetTop + storyTravel * positions[index];

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.05 });
    } else {
      scroller.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  return (
  <div id="eldonita-method-page" ref={scrollerRef} className="h-full overflow-y-auto bg-[#03101a] text-white">
    <EldonitaCursor rootId="eldonita-method-page" />
    <div ref={contentRef} className="relative isolate min-h-full overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_12%,rgba(63,131,238,0.22),transparent_34%),radial-gradient(circle_at_16%_44%,rgba(111,194,86,0.12),transparent_28%),linear-gradient(145deg,#041625_0%,#020913_56%,#061623_100%)]" />
      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden h-36 -translate-y-1/2 md:block">
        <span className="absolute right-0 top-0 h-full w-px bg-white/10" />
        <span className="method-progress-fill absolute right-0 top-0 h-full w-px origin-top scale-y-0 bg-[#65a0ff]" />
      </div>
      <MethodHeader />

      <main ref={pageRef} className="relative z-10">
        <section className="relative min-h-[calc(100svh-6rem)] px-5 pb-16 pt-8 md:min-h-[84vh] md:px-8 md:pb-20 md:pt-10 lg:px-12">
          <div className="method-hero-visual pointer-events-none absolute inset-x-[-12vw] top-[-5.5rem] bottom-[-6.5rem] z-0 hidden md:block">
            <div className="absolute right-[-16vw] top-1/2 -translate-y-1/2 opacity-45 lg:right-[-9vw]">
              <div className="scale-[1.18] lg:scale-[1.34] xl:scale-[1.46]">
                <OrbitalMark interactive={false} />
              </div>
            </div>
          </div>
          <div className="method-hero-visual pointer-events-none absolute left-1/2 top-[56%] z-0 -translate-x-[42%] -translate-y-1/2 opacity-[0.16] md:hidden">
            <OrbitalMark interactive={false} />
          </div>
          <div className="relative mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl items-center md:min-h-[84vh]">
            <div className="relative z-10 max-w-3xl">
              <div className="method-hero-label">
                <SectionLabel>Da análise à ação</SectionLabel>
              </div>
              <h1 className="max-w-[12ch] text-[clamp(3.75rem,10vw,5.8rem)] font-light leading-[0.96] text-white md:max-w-none md:text-7xl lg:text-8xl">
                {methodHeroLines.map((line, lineIndex) => (
                  <span key={`line-${lineIndex}`} className="block overflow-hidden">
                    <span className="block whitespace-nowrap">
                      {line.map((word) => (
                        <span key={word} className="method-hero-word inline-block pr-[0.24em]">
                          {word}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
                <span className="block overflow-hidden">
                  <strong className="method-hero-word inline-block font-semibold text-[#75c75d]">
                    decisão.
                  </strong>
                </span>
              </h1>
              <p className="method-hero-paragraph mt-7 text-base leading-8 text-white/62 md:text-lg">
                Diagnóstico, coleta de dados, elaboração de estratégias e
                monitoramento contínuo para transformar informação em resultado.
              </p>
            </div>
          </div>
        </section>

        <section className="method-journey-story relative md:h-[280vh]">
          <div className="relative px-5 py-20 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:px-0 md:py-8">
            <div className="mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-12">
              <div className="mb-10 max-w-2xl">
                <SectionLabel>O percurso</SectionLabel>
                <div className="overflow-hidden">
                  <h2 data-heading-reveal className="text-4xl font-light text-white md:text-5xl">
                    Quatro movimentos, uma leitura integrada.
                  </h2>
                </div>
              </div>

              <div className="method-journey-desktop relative hidden min-h-[31rem] overflow-visible md:block">
                <div className="method-journey-ghost pointer-events-none absolute left-[calc(50%-112vw)] top-[16%] bottom-[-52%] flex w-[142rem] items-end justify-center opacity-0">
                  <div className="scale-[3.4] text-white opacity-100 [filter:grayscale(1)_brightness(2.5)]">
                    <OrbitalMark interactive={false} />
                  </div>
                </div>
                <div className="relative z-10 grid gap-5 pt-12 md:grid-cols-4 lg:gap-6">
                  {methodTabs.map((tab, index) => (
                    <article
                      key={tab.title}
                      className="method-journey-card relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                    >
                      <span className="pointer-events-none absolute right-3 top-1 text-[4.5rem] font-semibold leading-none text-white/[0.06]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="relative mt-12 text-xl font-semibold text-white">{tab.title}</h2>
                      <p className="mt-3 text-sm font-medium text-white/76">{tab.subtitle}</p>
                      <p className="mt-4 text-sm leading-7 text-white/54">{tab.body}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div data-method-grid className="grid gap-4 md:hidden">
                {methodTabs.map((tab, index) => (
                  <article
                    key={tab.title}
                    className={`rounded-lg border p-5 ${
                      index === 0
                        ? 'border-[#65a0ff]/55 bg-[#65a0ff]/12'
                        : 'border-white/10 bg-[#061725]/85'
                    }`}
                  >
                    <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#65a0ff]">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-4 text-xl font-semibold text-white">{tab.title}</h2>
                    <p className="mt-3 text-sm font-medium text-white/76">{tab.subtitle}</p>
                    <p className="mt-4 text-sm leading-7 text-white/54">{tab.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="method-source-story relative px-5 md:h-[325vh] md:px-8 lg:px-12">
          <div className="mx-auto py-20 md:sticky md:top-0 md:flex md:h-screen md:max-w-7xl md:items-center md:overflow-hidden md:py-8">
            <div className="mx-auto max-w-2xl text-center md:hidden">
              <SectionLabel>Nossas fontes</SectionLabel>
              <div className="overflow-hidden">
                <h2 data-heading-reveal className="text-4xl font-light text-white md:text-5xl">
                  Cobertura completa, leitura precisa.
                </h2>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/58">
                Monitoramos dados online e offline, de grandes veículos a conversas
                distribuídas, para revelar padrões que importam.
              </p>
            </div>

            <div className="hidden w-full grid-cols-[minmax(0,0.92fr)_minmax(25rem,1.08fr)] items-center gap-3 md:grid lg:gap-8">
              <div className="flex min-h-[40rem] flex-col justify-center py-10">
                <div className="max-w-2xl pb-5">
                  <div className="method-source-intro-label">
                    <SectionLabel>Nossas fontes</SectionLabel>
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="method-source-intro-title max-w-[13ch] text-5xl font-light leading-[1.08] text-white lg:text-6xl">
                      Cobertura completa, leitura precisa.
                    </h2>
                  </div>
                  <p className="method-source-intro-text mt-5 max-w-xl text-sm leading-7 text-white/58 lg:text-base">
                    Monitoramos dados online e offline, de grandes veículos a conversas
                    distribuídas, para revelar padrões que importam.
                  </p>

                  <div className="method-source-progress mt-8 max-w-md">
                    <div className="relative h-px bg-white/10">
                      <span className="method-source-progress-fill absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-[#3f83ee] via-[#65a0ff] to-[#6fc256]" />
                      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                        {methodSources.map((source, index) => (
                          <span
                            key={`source-progress-${source.title}`}
                            className="method-source-progress-step h-3 w-3 rounded-full shadow-[0_0_0_4px_#061725]"
                            style={{
                              backgroundColor: index === 0 ? '#3F83EE' : index === 1 ? '#6FC256' : '#B5BDC7',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[22rem]">
                  {methodSources.map((source) => (
                    <article
                      key={source.title}
                      className="method-source-copy absolute inset-0 flex flex-col justify-center pr-6 lg:pr-10"
                    >
                      <h3 className="method-source-line text-3xl font-semibold text-white">{source.title}</h3>
                      <p className="method-source-line mt-3 text-sm font-semibold leading-7 text-white/68">
                        {source.subtitle}
                      </p>
                      <ul className="mt-6 space-y-3 lg:space-y-4">
                        {source.items.map((item) => (
                          <li key={item} className="method-source-line flex gap-3 text-sm leading-7 text-white/58">
                            <CheckCircle2 className="mt-1 shrink-0 text-[#75c75d]" size={17} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[34rem]">
                <div className="method-source-icon absolute inset-0 flex -translate-x-4 items-center justify-center lg:-translate-x-8">
                  <MethodSourceVisual index={0} expanded layered />
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-12 md:hidden">
              {methodSources.map((source, index) => {
                return (
                  <article key={source.title}>
                    <MethodSourceVisual index={index} />
                    <h3 className="text-2xl font-semibold text-white">{source.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-7 text-white/68">
                      {source.subtitle}
                    </p>
                    <ul className="mt-5 space-y-4">
                      {source.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-7 text-white/58">
                          <CheckCircle2 className="mt-1 shrink-0 text-[#75c75d]" size={17} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="method-sea-story relative md:h-[350vh]">
          <div className="relative overflow-visible px-5 py-20 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:px-0 md:py-8">
            <div className="method-sea-desktop-visual absolute left-1/2 top-0 h-full w-[max(100vw,1720px)] -translate-x-1/2">
              <SeaNarrativeVisual />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-12">
              <div className="method-sea-intro relative md:min-h-[18rem]">
                <div className="grid gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-end md:gap-16">
                  <div className="method-sea-question">
                    <div className="overflow-hidden">
                      <h2 className="text-4xl font-light leading-[1.08] text-white md:text-6xl lg:text-7xl">
                        Quando analisar dados?
                      </h2>
                    </div>
                  </div>

                  <div className="method-sea-answer">
                    <p className="method-sea-answer-prefix text-sm uppercase tracking-[0.24em] text-white/44">
                      A resposta é
                    </p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 overflow-hidden md:gap-x-6">
                      <span className="method-sea-answer-simple inline-block text-4xl font-light text-white md:text-6xl">
                        simples:
                      </span>
                      <strong className="method-sea-answer-always inline-block text-5xl font-semibold text-[#75c75d] md:text-7xl lg:text-8xl">
                        sempre.
                      </strong>
                    </div>
                    <p className="method-sea-context mt-6 max-w-2xl text-sm leading-7 text-white/58 md:text-base md:leading-8">
                      Cada cenário exige uma abordagem diferente. Da rotina estável à
                      crise, o monitoramento contínuo ajuda a entender públicos,
                      ajustar discursos e antecipar tendências.
                    </p>
                  </div>
                </div>
              </div>

              <div className="method-sea-scenarios md:absolute md:inset-x-8 md:top-[30%] md:-translate-y-[24%] lg:inset-x-12">
                <div className="relative z-10 mt-10 hidden items-center py-4 md:flex">
                  <p className="mr-auto text-[0.62rem] uppercase tracking-[0.24em] text-white/30">
                    Intensidade do cenário
                  </p>
                  <div className="flex items-center gap-8">
                    {seaScenarios.map((scenario, index) => (
                      <button
                        type="button"
                        key={scenario.title}
                        onClick={() => scrollToSeaScenario(index)}
                        aria-label={`Ir para o cenário ${scenario.title}`}
                        className="method-sea-step flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.2em] text-white"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${index === 2 ? 'bg-[#75c75d]' : 'bg-[#65a0ff]'}`} />
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span className="hidden lg:inline">{scenario.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 hidden min-h-[350px] md:block">
                  <div className="pointer-events-none absolute -inset-y-16 left-[-8rem] w-[58rem] bg-[radial-gradient(ellipse_at_left,rgba(3,16,26,1)_0%,rgba(3,16,26,0.95)_44%,transparent_78%)]" />
                  <div className="relative min-h-[350px] max-w-xl">
                    {seaScenarios.map((scenario, index) => (
                      <article
                        key={scenario.title}
                        className="method-sea-copy absolute inset-0 flex flex-col justify-center"
                      >
                        <div className="method-sea-line mb-5 flex items-center gap-4">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#65a0ff]">
                            Cenário {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="h-px w-14 bg-[#65a0ff]/35" />
                        </div>
                        <h3 className="method-sea-line text-5xl font-light leading-none text-white">
                          {scenario.title}
                        </h3>
                        <p className="method-sea-line mt-7 max-w-lg text-base leading-8 text-white/66">
                          {scenario.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 md:hidden">
                <div className="mt-10 grid gap-10">
                  {seaScenarios.map((scenario, index) => (
                    <article key={scenario.title} className="border-t border-white/10 pt-7">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#65a0ff]">
                        Cenário {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-4 text-3xl font-light text-white">{scenario.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-white/62">{scenario.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="method-closing-section relative overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12">
          <div className="method-closing-orbit pointer-events-none absolute bottom-[-78%] left-1/2 flex w-[76rem] -translate-x-1/2 justify-center text-white opacity-0 [filter:grayscale(1)_brightness(2.7)] md:bottom-[-104%] md:w-[112rem]">
            <div className="scale-[2.1] md:scale-[3.15]">
              <OrbitalMark interactive={false} />
            </div>
          </div>

          <div data-method-reveal className="relative mx-auto max-w-7xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#65a0ff]">
              Continue acompanhando
            </p>
            <div className="mt-6 grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-20">
              <div>
                <div className="overflow-hidden">
                  <h2 data-heading-reveal className="max-w-[16ch] text-4xl font-light leading-[1.08] text-white md:text-6xl">
                    <span className="flex items-baseline gap-x-3 md:gap-x-4">
                      <span>Mais</span>
                      <span className="relative inline-block h-[1.08em] min-w-[11.5ch] overflow-hidden font-semibold text-[#75c75d]">
                        {closingWords.map((word) => (
                          <span key={word} className="method-closing-word absolute inset-x-0 top-0">
                            {word}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="block">para decidir melhor.</span>
                  </h2>
                </div>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/56 md:text-base">
                  Receba leituras, tendências e análises selecionadas pela Eldonita.
                </p>
              </div>

              <form className="group/form grid gap-7" onSubmit={(event) => event.preventDefault()}>
                <label className="group/field block">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/38 transition-colors group-focus-within/field:text-[#65a0ff]">
                    Como podemos chamar você?
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    className="mt-3 h-11 w-full border-0 border-b border-white/16 bg-transparent px-0 text-base text-white outline-none transition-colors placeholder:text-white/24 focus:border-[#65a0ff]"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="group/field block">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/38 transition-colors group-focus-within/field:text-[#75c75d]">
                    Para onde enviamos?
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    className="mt-3 h-11 w-full border-0 border-b border-white/16 bg-transparent px-0 text-base text-white outline-none transition-colors placeholder:text-white/24 focus:border-[#75c75d]"
                    placeholder="voce@empresa.com"
                  />
                </label>
                <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                  <p className="max-w-sm text-xs leading-6 text-white/34">
                    Conteúdo relevante, enviado com cuidado e sem excesso.
                  </p>
                  <button
                    className="inline-flex h-11 items-center gap-3 border-b border-[#65a0ff]/60 px-1 text-sm font-medium text-white transition-[color,border-color] hover:border-[#75c75d] hover:text-[#75c75d]"
                    type="submit"
                  >
                    Quero receber
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 text-sm text-white/38 md:flex-row md:items-center">
          <Wordmark />
          <p>2026 Eldonita Inteligência. Todos os direitos reservados.</p>
          <EldonitaRouteLink
            to="/playground/eldonita"
            className="text-[#65a0ff] transition-colors hover:text-white"
          >
            Voltar para a landing
          </EldonitaRouteLink>
        </div>
      </footer>
    </div>
  </div>
  );
};

const EldonitaHomePage = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);

  useEffect(() => {
    if (testimonialPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeTestimonial, testimonialPaused]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smoothDesktop = window.matchMedia('(pointer: fine) and (min-width: 768px)').matches;
    const lenis = smoothDesktop && !reducedMotion
      ? new Lenis({
          wrapper: scroller,
          content,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.085,
          wheelMultiplier: 0.82,
          anchors: { duration: 1.05 },
        })
      : null;

    const raf = (time: number) => lenis?.raf(time * 1000);
    const updateScrollTrigger = () => ScrollTrigger.update();
    if (lenis) {
      lenis.on('scroll', updateScrollTrigger);
      gsap.ticker.add(raf);
    }

    const ctx = gsap.context(() => {
      if (!reducedMotion) {
        const heroWords = gsap.utils.toArray<HTMLElement>('.home-hero-word');
        gsap.set(heroWords, { autoAlpha: 0, yPercent: 115, rotate: 4, transformOrigin: '0% 100%' });
        gsap.set('.home-hero-label, .home-hero-copy, .home-hero-actions', { autoAlpha: 0, y: 24 });
        gsap.set('.home-hero-orbit', { autoAlpha: 0, scale: 0.84, rotate: -7 });

        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .to('.home-hero-label', { autoAlpha: 1, y: 0, duration: 0.5 })
          .to(heroWords, { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 0.82, stagger: 0.07 }, '-=0.08')
          .to('.home-hero-orbit', { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.15 }, '-=0.95')
          .to('.home-hero-copy', { autoAlpha: 1, y: 0, duration: 0.65 }, '-=0.45')
          .to('.home-hero-actions', { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.38');

        gsap.utils.toArray<HTMLElement>('.home-heading-reveal').forEach((heading) => {
          gsap.fromTo(
            heading,
            { autoAlpha: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: heading, scroller, start: 'top 86%', once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('.home-stagger').forEach((container) => {
          gsap.fromTo(
            Array.from(container.children),
            { autoAlpha: 0, y: 38 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: container, scroller, start: 'top 82%', once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('.home-solution-card').forEach((card, index) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 46, x: index % 2 === 0 ? -14 : 14, scale: 0.98 },
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              scale: 1,
              duration: 0.78,
              delay: (index % 2) * 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                scroller,
                start: 'top 91%',
                once: true,
              },
            },
          );
        });
      }
    }, content);

    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.off('scroll', updateScrollTrigger);
        lenis.destroy();
      }
    };
  }, []);

  return (
    <div id="eldonita-home-page" ref={scrollerRef} className="h-full overflow-y-auto bg-[#03101a] text-white">
      <EldonitaCursor rootId="eldonita-home-page" />
      <div ref={contentRef} className="relative isolate min-h-full overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(32,100,178,0.3),transparent_32%),radial-gradient(circle_at_12%_34%,rgba(32,168,70,0.1),transparent_26%),linear-gradient(140deg,#041625_0%,#020913_55%,#03111c_100%)]" />
        <MethodHeader active="Soluções" />

        <main className="relative z-10">
          <section className="relative px-5 pb-16 pt-7 md:min-h-[calc(100svh-6rem)] md:px-8 md:pb-20 lg:px-12">
            <div className="home-hero-orbit pointer-events-none absolute -bottom-20 left-[38%] opacity-[0.16] md:hidden">
              <OrbitalMark interactive={false} />
            </div>
            <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative z-10 max-w-[44rem]">
                <div className="home-hero-label">
                  <SectionLabel>Inteligência aplicada</SectionLabel>
                </div>
                <h1 className="max-w-full text-[clamp(2.85rem,10vw,4.35rem)] font-light leading-[1.02] text-white [text-wrap:balance] md:text-[clamp(3.2rem,5.4vw,4.65rem)] xl:text-[clamp(4.2rem,6.2vw,5.15rem)]">
                  <span className="block overflow-hidden">
                    <span className="home-hero-word inline-block max-w-full whitespace-normal">
                      Transformando dados em
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="home-hero-word inline-block max-w-full whitespace-normal">
                      <strong className="font-semibold text-[#65a0ff]">insights</strong> para{' '}
                      <strong className="font-semibold text-[#75c75d]">comunicação.</strong>
                    </span>
                  </span>
                </h1>
                <p className="home-hero-copy mt-7 max-w-xl text-base leading-8 text-white/62 md:text-lg">
                  Domine a opinião pública e lidere a narrativa com tecnologia,
                  análise humana, inteligência artificial e ciências sociais.
                </p>
                <div className="home-hero-actions mt-9 flex flex-col gap-4 sm:flex-row">
                  <EldonitaRouteLink
                    to="/playground/eldonita/metodo"
                    className="inline-flex h-12 items-center justify-center gap-2 bg-[#4d86f7] px-6 text-sm font-medium text-white transition-colors hover:bg-[#65a0ff]"
                  >
                    Conheça o método
                    <ArrowRight size={16} />
                  </EldonitaRouteLink>
                  <a
                    href="#contato"
                    className="inline-flex h-12 items-center justify-center gap-2 border border-white/22 px-6 text-sm font-medium text-white transition-colors hover:border-[#75c75d] hover:text-[#75c75d]"
                  >
                    Fale conosco
                  </a>
                </div>
              </div>

              <div className="home-hero-orbit relative z-10 hidden min-h-[560px] items-center justify-center md:flex">
                <OrbitalMark />
              </div>
            </div>
          </section>

          <section id="solucoes" className="relative px-5 py-24 md:px-8 md:py-32 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 xl:gap-20">
                <div className="lg:pt-3">
                  <SectionLabel>Nossas soluções</SectionLabel>
                  <div className="overflow-hidden">
                    <h2 className="home-heading-reveal max-w-[15ch] text-4xl font-light leading-[1.08] md:text-5xl xl:text-[3.65rem]">
                      Potencialize sua comunicação com parceria estratégica.
                    </h2>
                  </div>
                  <p className="mt-7 max-w-xl text-base leading-8 text-white/56">
                    O mundo fornece os dados. Nós transformamos sinais dispersos em
                    insights valiosos e planos de ação claros.
                  </p>
                </div>

                <div className="home-solutions-stagger grid gap-4 sm:grid-cols-2">
                  {homeSolutions.map((solution) => {
                    const Icon = solution.icon;
                    return (
                      <article
                        key={solution.title}
                        className="home-solution-card group relative min-h-[12.5rem] overflow-hidden border border-white/[0.07] bg-white/[0.025] px-6 py-7 transition-[background-color,border-color,transform] duration-500 hover:-translate-y-1 hover:border-[#65a0ff]/25 hover:bg-white/[0.045] md:px-7"
                      >
                        <Icon
                          size={92}
                          strokeWidth={0.75}
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-2 -top-3 text-[#65a0ff]/[0.085] transition-[color,transform] duration-700 group-hover:rotate-[-5deg] group-hover:scale-110 group-hover:text-[#75c75d]/[0.12]"
                        />

                        <div className="relative z-10 flex h-full flex-col">
                          <div className="flex items-start gap-4">
                            <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-[#75c75d] shadow-[0_0_0_5px_rgba(117,199,93,0.08)]" />
                            <h3 className="text-lg font-medium leading-snug text-white md:text-xl">
                              {solution.title}
                            </h3>
                          </div>
                          <p className="mt-auto max-w-[19rem] pt-6 text-sm leading-7 text-white/52">
                            {solution.body}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section id="metodo" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12">
            <div className="pointer-events-none absolute -left-[30rem] top-1/2 hidden -translate-y-1/2 opacity-[0.08] [filter:grayscale(1)_brightness(2.5)] md:block">
              <div className="scale-[2.2]">
                <OrbitalMark interactive={false} />
              </div>
            </div>
            <div className="relative mx-auto grid max-w-7xl gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:gap-24">
              <div className="min-h-[28rem]" />
              <div>
                <SectionLabel>Nosso método</SectionLabel>
                <div className="overflow-hidden">
                  <h2 className="home-heading-reveal text-4xl font-light leading-[1.08] md:text-6xl">
                    Dados relevantes se tornam direção.
                  </h2>
                </div>
                <p className="mt-7 max-w-xl text-base leading-8 text-white/56">
                  Monitoramos redes sociais e imprensa, realizamos pesquisas e
                  analisamos diferentes fontes para revelar tendências, oportunidades
                  e riscos.
                </p>
                <div className="home-stagger mt-10 grid gap-6 sm:grid-cols-3">
                  {methodSteps.map((step) => (
                    <article key={step.value}>
                      <span className="text-sm font-semibold text-[#65a0ff]">{step.value}</span>
                      <h3 className="mt-4 text-xl font-medium text-white">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/50">{step.body}</p>
                    </article>
                  ))}
                </div>
                <EldonitaRouteLink
                  to="/playground/eldonita/metodo"
                  className="mt-10 inline-flex items-center gap-3 border-b border-[#75c75d]/55 pb-2 text-sm font-medium text-white transition-colors hover:text-[#75c75d]"
                >
                  Conheça nosso método
                  <ArrowRight size={16} />
                </EldonitaRouteLink>
              </div>
            </div>
          </section>

          <section id="processo" className="relative px-5 py-24 md:px-8 md:py-32 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <SectionLabel>Processo</SectionLabel>
                <div className="overflow-hidden">
                  <h2 className="home-heading-reveal text-4xl font-light leading-[1.08] md:text-6xl">
                    Escutar, organizar, interpretar e recomendar.
                  </h2>
                </div>
              </div>
              <div className="home-stagger mt-14 grid gap-8 md:grid-cols-4">
                {processSteps.map((step, index) => (
                  <article key={step.value} className="relative pt-8">
                    <span className="absolute left-0 top-0 h-px w-full bg-white/10" />
                    <span className={`text-5xl font-light ${index > 1 ? 'text-[#75c75d]/42' : 'text-[#65a0ff]/42'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-8 text-2xl font-light text-white">{step.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/52">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="depoimentos" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-36 lg:px-12">
            <div className="pointer-events-none absolute right-[-18rem] top-1/2 hidden -translate-y-1/2 opacity-[0.06] [filter:grayscale(1)_brightness(2.7)] md:block">
              <div className="scale-[1.8]">
                <OrbitalMark interactive={false} />
              </div>
            </div>
            <div
              className="relative mx-auto max-w-6xl"
              onMouseEnter={() => setTestimonialPaused(true)}
              onMouseLeave={() => setTestimonialPaused(false)}
              onFocusCapture={() => setTestimonialPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setTestimonialPaused(false);
                }
              }}
            >
              <div className="flex flex-col items-start gap-8 text-left">
                <div className="flex max-w-3xl flex-col items-start">
                  <SectionLabel>Depoimentos</SectionLabel>
                  <div className="overflow-hidden">
                    <h2 className="home-heading-reveal text-4xl font-light leading-[1.08] md:text-6xl">
                      O que nossos clientes dizem
                    </h2>
                  </div>
                </div>
              </div>

              <div className="relative mt-14 min-h-[32rem] max-w-5xl text-left sm:min-h-[27rem] md:min-h-[24rem]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-2 -top-10 font-serif text-[9rem] leading-none text-[#65a0ff]/[0.09] sm:-left-8 sm:text-[12rem] md:-left-12"
                >
                  “
                </span>
                <span className="absolute right-0 top-0 text-[0.62rem] font-semibold tracking-[0.24em] text-white/24">
                  {String(activeTestimonial + 1).padStart(2, '0')} /{' '}
                  {String(testimonials.length).padStart(2, '0')}
                </span>
                <AnimatePresence mode="wait">
                  <motion.article
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    aria-live="polite"
                    className="relative z-10 grid gap-8 pt-12 md:grid-cols-[minmax(0,1fr)_17rem] md:pt-10"
                  >
                    <div>
                      <blockquote className="max-w-3xl text-base font-light leading-[1.9] text-white/78 sm:text-lg md:text-[1.2rem]">
                        {testimonials[activeTestimonial].quote}
                      </blockquote>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-5 border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                      <div className="flex items-center justify-start gap-4">
                        <div
                          aria-hidden="true"
                          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(101,160,255,0.22),rgba(117,199,93,0.1))] text-sm font-semibold tracking-[0.12em] text-[#9dc1ff] ring-1 ring-white/12"
                        >
                          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#03101a] bg-[#75c75d]" />
                          {testimonials[activeTestimonial].initials}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">
                            {testimonials[activeTestimonial].name}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-white/48">
                            {testimonials[activeTestimonial].role}
                          </p>
                        </div>
                      </div>
                      <span className="h-px w-20 bg-gradient-to-r from-[#65a0ff]/60 to-[#75c75d]/40" />
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-between gap-8">
                <div className="flex w-full max-w-sm items-center gap-3">
                  {testimonials.map((testimonial, index) => (
                    <button
                      type="button"
                      key={testimonial.name}
                      aria-label={`Exibir depoimento de ${testimonial.name}`}
                      aria-current={index === activeTestimonial ? 'true' : undefined}
                      onClick={() => setActiveTestimonial(index)}
                      className="group relative h-5 flex-1"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
                      {index === activeTestimonial && (
                        <motion.span
                          key={`${activeTestimonial}-${testimonialPaused}`}
                          className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-[#65a0ff]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: testimonialPaused ? 0 : 1 }}
                          transition={{ duration: testimonialPaused ? 0 : 5, ease: 'linear' }}
                        />
                      )}
                      <span
                        className={`absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-colors ${
                          index === activeTestimonial
                            ? 'bg-[#75c75d]'
                            : 'bg-white/22 group-hover:bg-white/55'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    aria-label="Depoimento anterior"
                    onClick={() =>
                      setActiveTestimonial(
                        (current) => (current - 1 + testimonials.length) % testimonials.length,
                      )
                    }
                    className="flex h-10 w-8 items-center justify-center text-white/42 transition-[color,transform] hover:-translate-x-1 hover:text-[#65a0ff]"
                  >
                    <ChevronLeft size={25} strokeWidth={1.4} />
                  </button>
                  <button
                    type="button"
                    aria-label="Próximo depoimento"
                    onClick={() =>
                      setActiveTestimonial((current) => (current + 1) % testimonials.length)
                    }
                    className="flex h-10 w-8 items-center justify-center text-white/70 transition-[color,transform] hover:translate-x-1 hover:text-[#75c75d]"
                  >
                    <ChevronRight size={25} strokeWidth={1.4} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="contato" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_0.9fr] md:items-end md:gap-20">
              <div>
                <SectionLabel>Continue acompanhando</SectionLabel>
                <div className="overflow-hidden">
                  <h2 className="home-heading-reveal max-w-[13ch] text-4xl font-light leading-[1.08] md:text-6xl">
                    Insights para enxergar antes e decidir melhor.
                  </h2>
                </div>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/54">
                  Receba gratuitamente nossas leituras e fique por dentro das tendências.
                </p>
              </div>
              <form className="grid gap-7" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Nome"
                  className="h-12 border-0 border-b border-white/16 bg-transparent text-base text-white outline-none placeholder:text-white/30 focus:border-[#65a0ff]"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="E-mail"
                  className="h-12 border-0 border-b border-white/16 bg-transparent text-base text-white outline-none placeholder:text-white/30 focus:border-[#75c75d]"
                />
                <button type="submit" className="inline-flex w-fit items-center gap-3 border-b border-[#65a0ff]/60 pb-2 text-sm font-medium text-white hover:text-[#75c75d]">
                  Quero receber
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </section>
        </main>

        <footer className="relative z-10 border-t border-white/10 px-5 py-8 md:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-9 text-sm text-white/38 md:grid-cols-[1fr_1.2fr_auto] md:items-end md:gap-12">
            <div>
              <Wordmark />
              <p className="mt-5 max-w-xs text-xs leading-6">
                © Copyright 2025. Eldonita Todos os direitos reservados.
              </p>
            </div>

            <p className="max-w-md text-base leading-7 text-white/52 md:pb-1">
              Na Eldonita, a inteligência encontra a estratégia.
            </p>

            <div className="md:text-right">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-white/36">
                Redes Sociais
              </p>
              <div className="mt-4 flex gap-3 md:justify-end">
                <a
                  href="https://www.linkedin.com/company/eldonita/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Eldonita no LinkedIn"
                  className="flex h-10 w-10 items-center justify-center border border-white/12 text-white/58 transition-[color,border-color] hover:border-[#65a0ff]/65 hover:text-[#65a0ff]"
                >
                  <Linkedin size={17} strokeWidth={1.7} />
                </a>
                <a
                  href="https://www.instagram.com/eldonitaintel"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Eldonita no Instagram"
                  className="flex h-10 w-10 items-center justify-center border border-white/12 text-white/58 transition-[color,border-color] hover:border-[#75c75d]/65 hover:text-[#75c75d]"
                >
                  <Instagram size={17} strokeWidth={1.7} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

type EldonitaPageTransitionPhase = 'idle' | 'covering' | 'revealing';

const EldonitaPageTransition = ({
  phase,
  reducedMotion,
}: {
  phase: EldonitaPageTransitionPhase;
  reducedMotion: boolean;
}) => {
  if (reducedMotion || phase === 'idle') {
    return null;
  }

  const arcPalette = [
    '#041625',
    '#061b2e',
    '#082139',
    '#0b2845',
    '#0f3152',
    '#143b60',
    '#1a466f',
  ] as const;
  const sweepArcs = Array.from({ length: 17 }, (_, index) => {
    const radius = 16 + index * 8;

    return {
      d: `M ${50 + radius} 118 A ${radius} ${radius} 0 0 0 ${50 - radius} 118`,
      stroke: arcPalette[index % arcPalette.length],
      width: 9.5,
      delay: index * 0.018,
      duration: 0.78 + index * 0.026,
    };
  });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[700] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
	      <motion.svg
	        className="h-full w-full"
	        viewBox="0 0 100 100"
	        preserveAspectRatio="xMidYMid slice"
	      >
		        <g>
		          {sweepArcs.map((arc, index) => (
		            <motion.path
		              key={`${arc.d}-${arc.stroke}-${index}`}
		              d={arc.d}
		              fill="none"
		              stroke={arc.stroke}
		              strokeWidth={arc.width}
		              strokeLinecap="round"
		              initial={
		                phase === 'revealing'
		                  ? { pathLength: 1, pathOffset: 0, opacity: 1 }
		                  : { pathLength: 0, pathOffset: 0, opacity: 0 }
		              }
		              animate={
		                phase === 'covering'
		                  ? {
		                      pathLength: 1,
		                      pathOffset: 0,
		                      opacity: [0, 1, 1],
		                    }
		                  : {
		                      pathLength: 1,
		                      pathOffset: 1,
		                      opacity: [1, 1, 0],
		                    }
		              }
		              transition={{
		                duration: phase === 'covering' ? arc.duration : arc.duration * 0.72,
		                delay: arc.delay,
		                opacity: {
		                  duration: phase === 'covering' ? arc.duration : arc.duration * 0.72,
		                  delay: arc.delay,
		                  times: phase === 'covering' ? [0, 0.08, 1] : [0, 0.82, 1],
		                },
		                ease: [0.76, 0, 0.24, 1],
		              }}
		            />
		          ))}
		        </g>
	      </motion.svg>
    </motion.div>
  );
};

export default function EldonitaLanding() {
  const location = useLocation();
  const [transitionPhase, setTransitionPhase] = useState<EldonitaPageTransitionPhase>('idle');
  const [transitionCycle, setTransitionCycle] = useState(0);
  const currentRouteRef = useRef(`${location.pathname}${location.search}`);
  const revealTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const clearTransitionTimers = () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }

      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };

    const startTransition = () => {
      clearTransitionTimers();
      setTransitionCycle((cycle) => cycle + 1);
      setTransitionPhase('covering');
    };

    const revealTransition = () => {
      clearTransitionTimers();
      setTransitionPhase('revealing');

      idleTimerRef.current = window.setTimeout(() => {
        setTransitionPhase('idle');
      }, ELDONITA_ROUTE_REVEAL_DURATION);
    };

    window.addEventListener(ELDONITA_ROUTE_TRANSITION_EVENT, startTransition);
    window.addEventListener(ELDONITA_ROUTE_REVEAL_EVENT, revealTransition);

    return () => {
      clearTransitionTimers();
      window.removeEventListener(ELDONITA_ROUTE_TRANSITION_EVENT, startTransition);
      window.removeEventListener(ELDONITA_ROUTE_REVEAL_EVENT, revealTransition);
    };
  }, []);

  useEffect(() => {
    const nextRoute = `${location.pathname}${location.search}`;

    if (currentRouteRef.current === nextRoute) {
      return;
    }

    currentRouteRef.current = nextRoute;

    if (reducedMotion || transitionPhase !== 'covering') {
      return;
    }

    revealTimerRef.current = window.setTimeout(() => {
      window.dispatchEvent(new Event(ELDONITA_ROUTE_REVEAL_EVENT));
    }, ELDONITA_ROUTE_REVEAL_DELAY);
  }, [location.pathname, location.search, reducedMotion, transitionPhase]);

  return (
    <div className="relative h-full overflow-hidden bg-[#03101a]">
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          className="absolute inset-0 h-full overflow-hidden"
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 8 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 1, y: -6 }
          }
          transition={{
            duration: reducedMotion ? 0.01 : 0.22,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[500] h-px origin-left bg-gradient-to-r from-[#65a0ff] via-[#75c75d] to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: 0.08, ease: 'easeOut' }}
          />
          {location.pathname.includes('/metodo') ? <EldonitaMethodPage /> : <EldonitaHomePage />}
        </motion.div>
      </AnimatePresence>
      <EldonitaPageTransition
        key={transitionCycle}
        phase={transitionPhase}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
