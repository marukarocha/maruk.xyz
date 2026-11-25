import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
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
import { ImageLightbox, type LightboxImage } from '../components/ImageLightbox';
import { ProjectCaseModal, type ProjectCase } from '../components/ProjectCaseModal';

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
  'Creative Technologist',
  'React',
  'Next.js',
  'WordPress',
  'WooCommerce',
  'Three.js',
  'Motion',
  'Branding',
];

const caseStudies: ProjectCase[] = [
  {
    id: 'motodiario',
    name: 'Motodiario.app',
    category: 'Product / Full Stack',
    role: 'Founder · Full Stack Developer · Designer',
    summary:
      'Plataforma própria em produção para gestão de ganhos, abastecimentos, manutenção, quilometragem e metas de motoboys.',
    problem:
      'Organizar a rotina financeira e operacional de profissionais que trabalham na rua, com dados espalhados.',
    steps: [
      'Arquitetura do produto e evolução contínua desde o zero.',
      'Interface e fluxos mobile-first, do cadastro ao acompanhamento.',
      'Autenticação, banco de dados e integrações via Firebase e APIs REST.',
      'Metas, manutenção, quilometragem, mapa de calor e modo compacto.',
    ],
    result: 'Produto web completo em produção, evoluindo de forma contínua.',
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Firebase', 'APIs REST', 'PWA'],
    url: 'https://www.motodiario.app/',
    urlLabel: 'Ver produto',
    gallery: [
      { src: '/port/motodiario/telas/motodiario_financeiro_completro_scrool.jpeg', caption: 'Financeiro' },
      { src: '/port/motodiario/telas/motodiario_combustivel.jpeg', caption: 'Abastecimentos' },
      { src: '/port/motodiario/telas/motodiario_manutencoes.jpeg', caption: 'Manutenções' },
      { src: '/port/motodiario/telas/motodiario_mapadecalor_gps.jpeg', caption: 'Mapa de calor' },
      { src: '/port/motodiario/telas/motodiario_compactmode.jpeg', caption: 'Modo compacto' },
    ],
  },
  {
    id: 'pedalhe',
    name: 'Pedalhe',
    category: 'E-commerce / WordPress',
    role: 'Tema e plugins próprios · Integrações',
    summary:
      'E-commerce de roupas técnicas para ciclismo em WordPress/WooCommerce, com tema e plugins próprios, regras personalizadas de carrinho e integração independente de pagamento via PIX.',
    problem:
      'Transformar catálogo, checkout e pagamento em uma operação de venda funcional, sem depender de plugins prontos que não cobriam as regras da loja.',
    steps: [
      'Tema próprio: catálogo, página de produto, institucional e landing pages da marca.',
      'Plugin de regras de carrinho: condições e personalizações além do padrão do WooCommerce.',
      'Plugin de pagamento PIX: integração independente, com geração de cobrança e confirmação de status.',
      'Tipos de conteúdo e campos personalizados (ACF/CPTs) para catálogo e comunicação.',
      'Landing page de campanha (NaChuva) dentro do mesmo tema e plugins da marca.',
    ],
    result: 'Loja sob medida, com personalizações que passam do visual para a regra de negócio.',
    tech: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'API PIX', 'ACF', 'CPTs'],
    gallery: [
      { src: '/portfolio/pedalhe/home.webp', caption: 'Home' },
      { src: '/portfolio/pedalhe/shop.webp', caption: 'Catálogo' },
      { src: '/portfolio/pedalhe/produto.webp', caption: 'Produto' },
      { src: '/portfolio/pedalhe/manifesto.webp', caption: 'Manifesto' },
      { src: '/portfolio/pedalhe/nachuva.webp', caption: 'Landing NaChuva' },
    ],
  },
  {
    id: 'unitv',
    name: 'UNITV',
    category: 'Portal / WordPress',
    role: 'Desenvolvimento e manutenção',
    summary:
      'Portal de notícias em WordPress no ar há mais de 5 anos, com mais de 5 mil publicações e rotina editorial contínua.',
    steps: [
      'Portal de notícias com tema e estrutura editorial em WordPress.',
      'Categorias, matérias, mídia e publicação contínua.',
      'Manutenção e evolução ao longo de mais de 5 anos.',
    ],
    tech: ['WordPress', 'PHP', 'Tema', 'Portal de notícias'],
    url: 'https://www.unitv.com.br/',
    urlLabel: 'Ver portal',
    gallery: [{ src: '/portfolio/unitv/home.webp', caption: 'Portal UNITV' }],
  },
  {
    id: 'vertica',
    name: 'Vertica 3D',
    category: 'Marca / Web',
    role: 'Identidade visual e interface',
    summary:
      'Site e identidade visual da Vertica 3D — impressão 3D com a ideia de que "ideias ganham forma". Criação da marca e da direção visual da página.',
    steps: [
      'Identidade e direção visual da marca.',
      'Layout e interface do site.',
      'Seções de produto, processo e contato.',
    ],
    tech: ['Branding', 'Identidade visual', 'UI', 'Web'],
    url: 'https://vertica3d.vercel.app/',
    urlLabel: 'Ver site',
    gallery: [{ src: '/portfolio/vertica/home.webp', caption: 'Vertica 3D' }],
  },
];

const threeDWorks = [
  { src: '/port/3d/Craby-22.webp', title: 'Craby-22' },
  { src: '/port/3d/Dragon.webp', title: 'Dragon' },
  { src: '/port/3d/KOMBI.webp', title: 'Kombi' },
  { src: '/port/3d/monkey.webp', title: 'Monkey' },
  { src: '/port/3d/maquete1.webp', title: 'Maquete' },
  { src: '/port/3d/Maquete Laundex2.webp', title: 'Laundex' },
];

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

export const PersonalPortfolioPage = () => {
  const [activeProject, setActiveProject] = useState<ProjectCase | null>(null);
  const [lightbox, setLightbox] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  useEffect(() => {
    document.title = 'Portfólio | Maruk.xyz — Full Stack Developer & Creative Technologist';

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

  const openLightbox = (images: LightboxImage[], index: number) => setLightbox({ images, index });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-[#00ffcc] selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:3px_3px]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/80">
            maruk.xyz
          </Link>
          <nav className="hidden items-center gap-6 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/40 lg:flex">
            <a className="transition-colors hover:text-[#00ffcc]" href="#faco">01 O que faço</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#projetos">03 Projetos</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#tresd">04 3D</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#video">05 Vídeo</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#contato">08 Contato</a>
          </nav>
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

      <main className="relative z-10">
        {/* HERO */}
        <section id="top" className="mx-auto max-w-[1200px] px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#00ffcc]/80">
                Portfólio · 2009 — 2026
              </p>
              <h1 className="mt-6 text-[2.7rem] font-semibold leading-[0.97] tracking-tight text-[#ededed] sm:text-6xl lg:text-[4.6rem]">
                Desenvolvedor Full Stack e{' '}
                <span className="font-serif italic font-normal text-[#00ffcc]">Creative Technologist</span>.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-white/60 md:text-lg">
                Mais de 20 anos construindo web, produto e imagem: front-end, WordPress/WooCommerce,
                integrações e experiências 3D. Do briefing à entrega, com foco em resolver problemas reais.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
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
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono text-[0.58rem] uppercase tracking-[0.16em]">
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
                    <li key={section.href}>
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
                  <p className="text-xs leading-6 text-white/40">
                    Aberto a vagas CLT/PJ e a projetos sob demanda.
                  </p>
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
          <SectionHead index="01" label="O que eu faço" title="Do front-end ao 3D, com critério de produto.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Seis frentes que se conectam no dia a dia — interface, loja, integração, imagem e processo.
            </p>
          </SectionHead>
          <div className="border-t border-white/10">
            {practice.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-3 border-b border-white/10 py-6 md:grid-cols-[48px_1fr_1.3fr] md:gap-8"
              >
                <span className="font-mono text-[0.6rem] text-white/25">0{index + 1}</span>
                <h3 className="text-xl font-medium tracking-tight text-white md:text-2xl">{item.title}</h3>
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

        {/* 03 PROJETOS */}
        <section id="projetos" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="03" label="Projetos" title="Projetos e cases.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Produtos em produção, e-commerce, portal e landing pages. Cada case abre com as telas
              completas.
            </p>
          </SectionHead>

          <div className="space-y-16">
            {caseStudies.map((project, index) => (
              <article key={project.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-[#00ffcc]/70">
                    {String(index + 1).padStart(2, '0')} — {project.category}
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {project.name}
                  </h3>
                  <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-white/35">
                    {project.role}
                  </p>
                  <p className="mt-5 text-sm leading-7 text-white/60">{project.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tech.slice(0, 5).map((item) => (
                      <span key={item} className="border border-white/10 px-2 py-1 text-[0.62rem] text-white/45">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-6">
                    <button
                      type="button"
                      onClick={() => setActiveProject(project)}
                      className="group inline-flex items-center gap-2 border-b border-[#00ffcc]/50 pb-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#00ffcc] transition-colors hover:border-[#00ffcc] hover:text-white"
                    >
                      Abrir case
                      <ArrowUpRight size={13} />
                    </button>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white"
                      >
                        {project.urlLabel ?? 'Site'} ↗
                      </a>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className={`group relative h-[340px] overflow-hidden border border-white/10 bg-black text-left sm:h-[440px] ${
                    index % 2 === 1 ? 'lg:order-1' : ''
                  }`}
                  aria-label={`Abrir case ${project.name}`}
                >
                  <img
                    src={project.gallery[0]?.src}
                    alt={project.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top opacity-80 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                  />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 border border-white/15 bg-black/80 px-2.5 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/60 backdrop-blur">
                    <Expand size={11} />
                    página inteira
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 04 3D */}
        <section id="tresd" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="04" label="3D" title="Peças e estudos em 3D.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Modelagem, cena e direção visual — clique para ampliar.
            </p>
          </SectionHead>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {threeDWorks.map((work, index) => (
              <button
                key={work.src}
                type="button"
                onClick={() =>
                  openLightbox(
                    threeDWorks.map((item) => ({ src: item.src, caption: item.title })),
                    index,
                  )
                }
                className="group relative aspect-[4/5] overflow-hidden border border-white/10 bg-black text-left"
              >
                <img
                  src={work.src}
                  alt={work.title}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/60">
                  <span>{work.title}</span>
                  <Expand size={11} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 05 VÍDEO */}
        <section id="video" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead index="05" label="Vídeo" title="Motion e direção.">
            <p className="max-w-xs text-xs leading-6 text-white/40">
              Reel principal e uma seleção de trabalhos em motion, edição e arte.
            </p>
          </SectionHead>
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            Vamos <span className="font-serif italic font-normal text-[#00ffcc]">conversar</span>.
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

      <ProjectCaseModal
        project={activeProject}
        contactHref={contactHref}
        onClose={() => setActiveProject(null)}
      />

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
