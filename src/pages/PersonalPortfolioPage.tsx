import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  Expand,
  FileText,
  Github,
  Instagram,
  Mail,
} from 'lucide-react';
import gsap from 'gsap';
import { ImageLightbox, type LightboxImage } from '../components/ImageLightbox';
import { useReveal } from '../hooks/useReveal';
import { caseStudies } from '../data/portfolioCases';
import type { ProjectCase } from '../types/portfolio';

const contactHref = 'mailto:maruk.xyz@gmail.com?subject=Oportunidade%20profissional';

const navSections = [
  { index: '01', label: 'O que eu faço', href: '#faco' },
  { index: '02', label: 'Experiência', href: '#experiencia' },
  { index: '03', label: 'Projetos', href: '#projetos' },
  { index: '04', label: '3D', href: '#tresd' },
  { index: '05', label: 'Vídeo', href: '#video' },
  { index: '06', label: 'Branding', href: '#branding' },
  { index: '07', label: 'Stack', href: '#stack' },
  { index: '08', label: 'Contato', href: '#contato' },
];

const marqueeItems = [
  'Full Stack Developer',
  'Full Stack',
  'React',
  'Next.js',
  'WordPress',
  'WooCommerce',
  'Three.js',
  'Motion',
  'Branding',
];

type ThreeDImage = { kind: 'image'; src: string; title: string; ratio: string };
type ThreeDText = { kind: 'text'; title: string; text: string };

const threeDItems: Array<ThreeDImage | ThreeDText> = [
  {
    kind: 'text' as const,
    title: 'Forma, luz e matéria.',
    text: 'Peças que nascem como estudo e viram produto, personagem ou ambiente. Modelagem, cena e direção visual.',
  },
  { kind: 'image' as const, src: '/port/3d/Craby-22.webp', title: 'Craby-22', ratio: 'aspect-[4/5]' },
  { kind: 'image' as const, src: '/port/3d/Dragon.webp', title: 'Dragon', ratio: 'aspect-square' },
  { kind: 'image' as const, src: '/port/3d/KOMBI.webp', title: 'Kombi', ratio: 'aspect-[4/5]' },
  {
    kind: 'text' as const,
    title: 'Três dimensões, um processo.',
    text: 'Blockout, material, câmera e luz. O mesmo olhar que aplico em interfaces, marcas e produtos.',
  },
  { kind: 'image' as const, src: '/port/3d/monkey.webp', title: 'Monkey', ratio: 'aspect-square' },
  { kind: 'image' as const, src: '/port/3d/maquete1.webp', title: 'Maquete', ratio: 'aspect-[4/5]' },
  { kind: 'image' as const, src: '/port/3d/Maquete Laundex2.webp', title: 'Laundex', ratio: 'aspect-square' },
];

const threeDImages = threeDItems.filter((item): item is ThreeDImage => item.kind === 'image');

const videoReels = [
  { title: 'E-ouv Gov. Federal', url: 'https://vimeo.com/801965062' },
  { title: 'Gestão de Risco', url: 'https://vimeo.com/802180969' },
  { title: 'Colaborar Faz a Diferença', url: 'https://vimeo.com/801951255' },
  { title: 'Web Projects', url: 'https://vimeo.com/880236451' },
  { title: 'Mobiliário', url: 'https://vimeo.com/211000871' },
];

const brands = [
  { src: '/port/3d/Hidromel.webp', name: 'Hidromel', note: 'identidade visual' },
  { src: '/port/3d/dinofim.webp', name: 'DinoFim', note: 'identidade visual' },
  { src: '/port/3d/devconf.webp', name: 'DevConf', note: 'identidade visual' },
  { src: '/port/3d/coletivo.webp', name: 'Coletivo Selo', note: 'identidade visual' },
  { src: '/port/3d/Nova linha varejo Ultraprotec.webp', name: 'Ultraprotec', note: 'linha de produto' },
];

const practice: Array<{ title: string; text: string; tags: string[] }> = [
  {
    title: 'Front-end de produto',
    text: 'Interfaces de aplicação, componentes, estados e performance. React, Next.js, TypeScript e Tailwind no dia a dia.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'E-commerce & WordPress',
    text: 'Lojas que precisam ir além do template: temas, plugins, checkout, campos e tipos de conteúdo personalizados.',
    tags: ['WooCommerce', 'PHP', 'Temas', 'Plugins', 'ACF'],
  },
  {
    title: 'Integrações & APIs',
    text: 'REST, webhooks, autenticação, Firebase e pagamentos via PIX. Sistemas que conversam entre si.',
    tags: ['REST', 'Webhooks', 'PIX', 'Firebase'],
  },
  {
    title: 'Experiências 3D',
    text: 'Three.js, WebGL e GSAP para showcases, produtos interativos e cenas navegáveis no navegador.',
    tags: ['Three.js', 'WebGL', 'GSAP'],
  },
  {
    title: 'Design & motion',
    text: 'Direção visual, interface e movimento: Figma, Photoshop, Illustrator, After Effects e Blender.',
    tags: ['Figma', 'After Effects', 'Blender'],
  },
  {
    title: 'IA no fluxo de desenvolvimento',
    text: 'Claude Code, Cursor, Copilot e ChatGPT como apoio à prototipagem e à velocidade, com revisão e critério.',
    tags: ['Claude Code', 'Cursor', 'Copilot'],
  },
];

const experience = [
  {
    period: '2024–2026',
    role: 'Founder · Full Stack Developer · Designer',
    company: 'Motodiario.app',
    summary:
      'Desenvolvimento e evolução de uma plataforma própria em produção: arquitetura, interface, autenticação, integrações, banco de dados e evolução contínua do produto.',
  },
  {
    period: '2019–2021',
    role: 'Interactive Development',
    company: 'Sábia Experience',
    summary:
      'Experiências digitais imersivas, animações técnicas e interfaces interativas para projetos educacionais e de realidade virtual e aumentada.',
  },
  {
    period: '2012–2018',
    role: 'Sócio · Gerente de Projetos',
    company: 'Coletivo Selo',
    summary:
      'Briefing, relacionamento com clientes, planejamento e acompanhamento de projetos digitais em agência, com vários projetos simultâneos.',
  },
  {
    period: '2009–2026',
    role: 'Desenvolvedor · Freelancer',
    company: 'Freelance · Dev web & projetos digitais',
    summary:
      'Sites, e-commerce, interfaces e soluções digitais para diferentes clientes: WordPress, PHP, JavaScript, integrações e projetos personalizados.',
  },
];

const techGroups: Array<[string, string[]]> = [
  ['Frontend', ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind']],
  ['Web & E-commerce', ['WordPress', 'WooCommerce', 'PHP', 'Themes', 'Plugins', 'ACF', 'CPTs']],
  ['Integrações & APIs', ['REST APIs', 'Webhooks', 'Authentication', 'PIX', 'Firebase']],
  ['Interativo', ['Three.js', 'WebGL', 'GSAP', '3D']],
  ['Design & Motion', ['Figma', 'Photoshop', 'Illustrator', 'After Effects', 'Blender']],
  ['IA & Dev tools', ['Claude Code', 'Cursor', 'GitHub Copilot', 'ChatGPT', 'Git', 'GitHub']],
];

const SectionHead = ({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: string;
  children?: ReactNode;
}) => (
  <div className="mb-10 flex flex-col gap-5 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#00ffcc]/80">
        {index} — {label}
      </p>
      <h2 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-tight text-[#ededed] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PersonalPortfolioPage = () => {
  const [hovered, setHovered] = useState<ProjectCase | null>(null);
  const [lightbox, setLightbox] = useState<{ images: LightboxImage[]; index: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLElement>();

  useEffect(() => {
    document.title = 'Portfólio | Maruk.xyz — Desenvolvedor Full Stack';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Portfólio de Maruk: desenvolvimento web, WordPress/WooCommerce, integrações, experiências 3D, vídeo e branding. Mais de 20 anos de projetos digitais.',
    );
  }, []);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.08 })
        .from('[data-index-row]', { x: 16, opacity: 0, duration: 0.45, stagger: 0.05 }, '-=0.65');
    }, root);

    return () => ctx.revert();
  }, []);

  const openLightbox = (images: LightboxImage[], index: number) => setLightbox({ images, index });

  const handleProjectsMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = previewRef.current;
    if (!element) return;
    const width = 300;
    const pad = 24;
    const x = Math.min(event.clientX + pad, window.innerWidth - width - pad);
    const y = Math.min(Math.max(event.clientY - 120, pad + 56), window.innerHeight - 270);
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-[#00ffcc] selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:3px_3px]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/80">
            maruk.xyz
          </Link>
          <p className="hidden font-mono text-[0.55rem] uppercase tracking-[0.22em] text-white/25 md:block">
            Portfólio · 2009 — 2026
          </p>
          <Link
            to="/cv"
            viewTransition
            className="inline-flex items-center gap-2 border-b border-[#00ffcc]/40 pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#00ffcc] transition-colors hover:border-[#00ffcc] hover:text-white"
          >
            <FileText size={12} />
            Currículo
          </Link>
        </div>
      </header>

      <main ref={revealRef} className="relative z-10">
        {/* HERO */}
        <section id="top" className="mx-auto max-w-[1200px] px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
          <div ref={heroRef} className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p data-hero className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#00ffcc]/80">
                Portfólio · 2009 — 2026
              </p>
              <h1
                data-hero
                className="mt-6 text-[2.7rem] font-semibold leading-[0.97] tracking-tight text-[#ededed] sm:text-6xl lg:text-[4.6rem]"
              >
                Desenvolvedor <span className="text-[#00ffcc]">Full Stack</span>.
              </h1>
              <p data-hero className="mt-8 max-w-xl text-base leading-8 text-white/60 md:text-lg">
                Mais de 20 anos construindo web, produto e imagem: front-end, WordPress/WooCommerce,
                integrações e experiências 3D. Do briefing à entrega, com foco em resolver problemas reais.
              </p>
              <div data-hero className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href="#projetos"
                  className="group inline-flex items-center gap-3 border-b border-white/30 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
                >
                  Ver projetos
                  <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" />
                </a>
                <Link
                  to="/cv"
                  viewTransition
                  className="group inline-flex items-center gap-2 border-b border-white/15 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
                >
                  Currículo
                  <FileText size={12} />
                </Link>
                <a
                  href={contactHref}
                  className="group inline-flex items-center gap-2 border-b border-white/15 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
                >
                  Contato
                  <Mail size={12} />
                </a>
              </div>
              <dl data-hero className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono text-[0.58rem] uppercase tracking-[0.16em]">
                <div>
                  <dt className="text-white/30">Base</dt>
                  <dd className="mt-1 text-white/70">Brasil · remoto</dd>
                </div>
                <div>
                  <dt className="text-white/30">Disponível</dt>
                  <dd className="mt-1 text-white/70">Vagas · projetos</dd>
                </div>
                <div>
                  <dt className="text-white/30">Foco</dt>
                  <dd className="mt-1 text-white/70">Web · 3D · marca</dd>
                </div>
              </dl>
            </div>

            <aside className="lg:col-span-5 lg:pl-8">
              <div className="border border-white/10">
                <p className="border-b border-white/10 px-4 py-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-white/35">
                  Índice
                </p>
                <ol>
                  {navSections.map((section) => (
                    <li key={section.href} data-index-row>
                      <a
                        href={section.href}
                        className="group flex items-baseline gap-4 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <span className="font-mono text-[0.58rem] text-[#00ffcc]/70">{section.index}</span>
                        <span className="flex-1 text-sm text-white/65 transition-colors group-hover:text-white">
                          {section.label}
                        </span>
                        <ArrowUpRight size={12} className="text-white/15 transition-colors group-hover:text-[#00ffcc]" />
                      </a>
                    </li>
                  ))}
                </ol>
                <div className="border-t border-white/10 p-4">
                  <p className="text-xs leading-6 text-white/40">Aberto a vagas CLT/PJ e a projetos sob demanda.</p>
                  <a
                    href={contactHref}
                    className="mt-2 inline-block font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:text-white"
                  >
                    maruk.xyz@gmail.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-3">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/30">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-8">
                {item}
                <span className="text-[#00ffcc]/40">◦</span>
              </span>
            ))}
          </div>
        </div>

        {/* 01 O QUE EU FAÇO */}
        <section id="faco" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="01" label="O que eu faço" title="Do código à imagem.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Seis frentes que se conectam no dia a dia — interface, loja, integração, imagem e processo.
            </p>
          </SectionHead>
          <div className="border-t border-white/10">
            {practice.map((item, index) => (
              <div
                key={item.title}
                data-reveal
                className="group grid gap-3 border-b border-white/10 py-6 md:grid-cols-[48px_1fr_1.3fr] md:gap-8"
              >
                <span className="font-mono text-[0.6rem] text-white/25">0{index + 1}</span>
                <h3 className="text-xl font-medium tracking-tight text-white transition-colors group-hover:text-[#00ffcc] md:text-2xl">
                  {item.title}
                </h3>
                <div>
                  <p className="text-sm leading-7 text-white/55">{item.text}</p>
                  <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/25">
                    {item.tags.join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 EXPERIÊNCIA */}
        <section id="experiencia" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="02" label="Experiência" title="Onde eu já passei.">
            <Link
              to="/cv"
              viewTransition
              className="inline-flex items-center gap-2 border-b border-[#00ffcc]/40 pb-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:border-[#00ffcc] hover:text-white"
            >
              Currículo completo
              <ArrowUpRight size={12} />
            </Link>
          </SectionHead>
          <div className="border-t border-white/10">
            {experience.map((item) => (
              <div
                key={item.company}
                data-reveal
                className="grid gap-2 border-b border-white/10 py-6 md:grid-cols-[150px_1fr_1.4fr] md:gap-8"
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#00ffcc]/70">
                  {item.period}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white">{item.company}</h3>
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/30">
                    {item.role}
                  </p>
                </div>
                <p className="text-sm leading-6 text-white/55">{item.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 PROJETOS — lista com preview flutuante */}
        <section id="projetos" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="03" label="Projetos" title="Cases selecionados.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Passe o mouse para ver e clique para abrir a página do projeto.
            </p>
          </SectionHead>

          <div
            className="relative border-t border-white/10"
            onMouseMove={handleProjectsMouseMove}
            onMouseLeave={() => setHovered(null)}
          >
            {caseStudies.map((project, index) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.id}`}
                viewTransition
                onMouseEnter={() => setHovered(project)}
                onFocus={() => setHovered(project)}
                className="group block border-b border-white/10"
              >
                <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 py-6 md:grid-cols-[48px_1.15fr_0.85fr_auto] md:py-7">
                  <span className="font-mono text-[0.6rem] text-white/25">0{index + 1}</span>
                  <h3 className="text-2xl font-medium tracking-tight text-white transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#00ffcc] md:text-3xl">
                    {project.name}
                  </h3>
                  <p className="hidden font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/30 md:block">
                    {project.category}
                  </p>
                  <span className="flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/25 transition-colors group-hover:text-[#00ffcc]">
                    <span className="hidden sm:inline">Abrir case</span>
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <div className="overflow-hidden border border-white/10 lg:hidden">
                  <img
                    src={project.gallery[0]?.src}
                    alt={project.name}
                    loading="lazy"
                    className="h-44 w-full object-cover object-top opacity-80"
                  />
                </div>
                <div className="h-4 lg:block" />
              </Link>
            ))}

            {/* preview flutuante seguindo o mouse */}
            <div
              ref={previewRef}
              aria-hidden="true"
              className={`pointer-events-none fixed left-0 top-0 z-40 hidden w-[300px] transition-opacity duration-200 lg:block ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="overflow-hidden border border-white/15 bg-black shadow-2xl">
                <div className="h-[190px] overflow-hidden">
                  <img
                    src={hovered?.gallery[0]?.src}
                    alt=""
                    className="h-full w-full object-cover object-top"
                    style={hovered ? { viewTransitionName: `project-${hovered.id}` } : undefined}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0a0a0a]/95 px-3 py-2">
                  <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/50">
                    {hovered?.category ?? ''}
                  </span>
                  <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#00ffcc]">abrir ↗</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 3D — masonry com texto */}
        <section id="tresd" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="04" label="3D" title="Peças e estudos em 3D.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Modelagem, cena e direção visual — clique para ampliar.
            </p>
          </SectionHead>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {threeDItems.map((item, index) =>
              item.kind === 'text' ? (
                <div
                  key={`text-${index}`}
                  data-reveal
                  className="mb-4 break-inside-avoid border border-white/10 bg-white/[0.02] p-6"
                >
                  <p className="text-xl font-semibold leading-snug tracking-tight text-white">{item.title}</p>
                  <p className="mt-3 text-xs leading-6 text-white/45">{item.text}</p>
                </div>
              ) : (
                <button
                  key={item.src}
                  type="button"
                  data-reveal
                  onClick={() =>
                    openLightbox(
                      threeDImages.map((image) => ({ src: image.src, caption: image.title })),
                      threeDImages.findIndex((image) => image.src === item.src),
                    )
                  }
                  className={`group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-white/10 bg-black text-left ${item.ratio}`}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/60">
                    <span>{item.title}</span>
                    <Expand size={11} />
                  </span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* 05 VÍDEO */}
        <section id="video" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="05" label="Vídeo" title="Motion e direção.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Reel principal e uma seleção de trabalhos em motion, edição e arte.
            </p>
          </SectionHead>
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]" data-reveal>
            <div className="border border-white/10 bg-black">
              <div className="aspect-video">
                <iframe
                  src="https://player.vimeo.com/video/816333951?title=0&byline=0&portrait=0"
                  title="Reel principal"
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/35">
                  Reel principal
                </span>
                <a
                  href="https://vimeo.com/816333951"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:text-white"
                >
                  Vimeo ↗
                </a>
              </div>
            </div>
            <div>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-white/30">Seleção</p>
              <ul className="mt-3 border-t border-white/10">
                {videoReels.map((video, index) => (
                  <li key={video.url}>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 border-b border-white/10 py-3 text-sm text-white/55 transition-colors hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[0.55rem] text-white/20">0{index + 1}</span>
                        {video.title}
                      </span>
                      <ArrowUpRight size={13} className="text-white/20 transition-colors group-hover:text-[#00ffcc]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 06 BRANDING */}
        <section id="branding" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="06" label="Branding" title="Marcas e identidades.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Identidade visual e direção de marca em projetos próprios e de clientes.
            </p>
          </SectionHead>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {brands.map((brand, index) => (
              <button
                key={brand.src}
                type="button"
                onClick={() =>
                  openLightbox(
                    brands.map((item) => ({ src: item.src, caption: item.name })),
                    index,
                  )
                }
                className="group text-left"
              >
                <div className="aspect-[4/3] overflow-hidden border border-white/10 bg-black">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="text-sm text-white/75 transition-colors group-hover:text-white">{brand.name}</p>
                  <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/25">{brand.note}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 07 STACK */}
        <section id="stack" className="bg-[#e8e4dc] text-[#0a0a0a]">
          <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 flex flex-col gap-5 border-t border-black/15 pt-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-black/50">07 — Stack</p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                  Ferramentas para construir e resolver.
                </h2>
              </div>
              <p className="max-w-xs text-xs leading-6 text-black/55">
                Tecnologia entra como meio: escolher a pilha certa, integrar bem e entregar algo que
                funcione no mundo real.
              </p>
            </div>
            <div className="grid gap-px border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-3">
              {techGroups.map(([group, items]) => (
                <div key={group} className="bg-[#e8e4dc] p-6">
                  <h3 className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-black/45">{group}</h3>
                  <p className="mt-3 text-base font-medium leading-7 text-black/80">{items.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 08 CONTATO */}
        <section id="contato" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 sm:py-24">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#00ffcc]/80">08 — Contato</p>
          <h2 className="mt-4 max-w-3xl text-[2.6rem] font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl">
            Vamos <span className="text-[#00ffcc]">conversar</span>.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/55">
            Aberto a vagas e a projetos sob demanda. Me conte o contexto — time, produto ou problema —
            que eu respondo com o que faz sentido.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={contactHref}
              className="group inline-flex items-center gap-3 border-b border-[#00ffcc]/50 pb-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#00ffcc] transition-colors hover:border-[#00ffcc] hover:text-white"
            >
              <Mail size={14} />
              maruk.xyz@gmail.com
            </a>
            <Link
              to="/cv"
              viewTransition
              className="group inline-flex items-center gap-2 border-b border-white/20 pb-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
            >
              <FileText size={13} />
              Currículo
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-5 text-white/35">
            <a href="https://github.com/marukarocha/" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-colors hover:text-[#00ffcc]">
              <Github size={18} />
            </a>
            <a href="https://www.instagram.com/maruk.xyz/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-[#00ffcc]">
              <Instagram size={18} />
            </a>
            <a href="mailto:maruk.xyz@gmail.com" aria-label="Email" className="transition-colors hover:text-[#00ffcc]">
              <Mail size={18} />
            </a>
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/25 sm:flex-row">
            <p>© 2026 Maruk.xyz</p>
            <div className="flex items-center gap-6">
              <Link to="/cv" viewTransition className="transition-colors hover:text-[#00ffcc]">Currículo</Link>
              <Link to="/playground" viewTransition className="transition-colors hover:text-[#00ffcc]">Playground</Link>
              <a href={contactHref} className="transition-colors hover:text-[#00ffcc]">Contato</a>
            </div>
          </div>
        </footer>
      </main>


      {lightbox ? (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
};
