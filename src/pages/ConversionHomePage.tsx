import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Code2,
  Cpu,
  FileText,
  Github,
  Instagram,
  Layers3,
  Mail,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';

const contactHref = 'mailto:maruk.xyz@gmail.com?subject=Oportunidade%20profissional';

const heroTech = ['React', 'Next.js', 'TypeScript', 'WordPress', 'WooCommerce', 'Three.js'];

const heroFacts = [
  { value: '20+', label: 'anos em desenvolvimento web' },
  { value: 'Em produção', label: 'Motodiario.app, produto próprio' },
  { value: 'Full stack', label: 'front-end, integrações e e-commerce' },
  { value: 'Creative', label: '3D, motion e direção visual' },
];

const featuredProjects = [
  {
    name: 'Motodiario.app',
    category: 'Product / Full Stack',
    role: 'Founder · Full Stack Developer · Designer',
    description:
      'Plataforma própria em produção para gestão de ganhos, abastecimentos, manutenção, quilometragem e metas de motoboys. Arquitetura, interface, autenticação, integrações, banco de dados e evolução contínua.',
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Firebase', 'APIs REST', 'PWA'],
    url: 'https://www.motodiario.app/',
    cta: 'Ver produto',
    image: '/port/motodiario/telas/motodiario_financeiro_completro_scrool.jpeg',
  },
  {
    name: 'Pedalhe',
    category: 'E-commerce / WordPress',
    role: 'Desenvolvimento, tema e integrações',
    description:
      'E-commerce em WordPress/WooCommerce com tema e plugins próprios, regras personalizadas de carrinho e integração independente de pagamento via PIX.',
    tech: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'API PIX'],
    url: 'https://pedalhe.com.br/',
    cta: 'Ver site',
    image: '/lab/bikeshop/catalogo/Bikes-catalogo1.png',
  },
];

const labProjects = [
  {
    id: 'eldonita',
    title: 'Eldonita Inteligência',
    description:
      'Protótipo de landing page para inteligência aplicada: leitura de dados, comunicação estratégica e decisão.',
    status: 'concept',
    tags: ['Landing page', 'UI', 'Estratégia'],
    cover: '/lab/covers_lab/eldonita.svg',
  },
  {
    id: 'pdv-showcase',
    title: 'PDV Spatial',
    description:
      'Cena 3D de ponto de venda com hotspots clicáveis, HUD lateral e tour guiado por transições de câmera.',
    status: 'live',
    tags: ['Three.js', '3D', 'UI'],
    cover: '/lab/covers_lab/PDV%20Spatial.png',
  },
  {
    id: 'bike-cargo',
    title: 'Bike Cargo',
    description:
      'Experiência de produto para uma bike cargo com viewer 3D, views guiadas e interface editorial.',
    status: 'wip',
    tags: ['Three.js', 'Produto', '3D'],
    cover: '/lab/covers_lab/Bike%20Cargo.png',
  },
  {
    id: 'tshirt-lab',
    title: 'T-Shirt Custom',
    description:
      'Customizador 3D de camiseta com troca de cor, estampas em tempo real e ajustes visuais.',
    status: 'live',
    tags: ['React', 'Customizer', '3D'],
    cover: '/lab/covers_lab/T-shirt_custom.png',
  },
  {
    id: 'tourism-guide',
    title: 'Gabe Turismo',
    description:
      'Landing page editorial para guia turístico em Morro de São Paulo, com roteiros, frota e contato direto.',
    status: 'live',
    tags: ['Landing page', 'UI', 'Copy'],
    cover: '/lab/covers_lab/gabe-tour-guide.svg',
  },
  {
    id: 'experience-studio',
    title: 'Lagoa E-Bikes',
    description:
      'Página comercial para aluguel, oficina e venda de bicicletas elétricas na Lagoa da Conceição.',
    status: 'wip',
    tags: ['Landing page', 'Negócio', 'UI'],
    cover: '/lab/bike/gallery/01.webp',
  },
  {
    id: 'animated-scene',
    title: 'Cena Animada',
    description:
      'Personagem 3D animado com timeline interativa, troca de clipes, parallax e controles de câmera e luz.',
    status: 'live',
    tags: ['Three.js', 'Animação', '3D'],
    cover: '/lab/covers_lab/animated%20scenes.png',
  },
  {
    id: 'drinks',
    title: 'Energy Drinks',
    description:
      'Carrossel 3D interativo com 9 energéticos, rotação por objeto, materiais e inspeção de rótulo.',
    status: 'live',
    tags: ['Three.js', 'WebGL', '3D'],
    cover: '/lab/covers_lab/energy_drinks.png',
  },
];

const statusLabel: Record<string, string> = {
  live: 'Ao vivo',
  wip: 'Em andamento',
  concept: 'Conceito',
};

const services = [
  {
    icon: Code2,
    title: 'Front-end de produto',
    text: 'React, Next.js, TypeScript e Tailwind. Interfaces de aplicação, componentes, estados e performance.',
  },
  {
    icon: ShoppingCart,
    title: 'E-commerce & WordPress',
    text: 'WooCommerce, temas, plugins, checkout, ACF/CPTs e PHP para lojas que precisam ir além do template.',
  },
  {
    icon: Cpu,
    title: 'Integrações & APIs',
    text: 'REST, webhooks, autenticação, Firebase e pagamentos (PIX). Sistemas que conversam entre si.',
  },
  {
    icon: Layers3,
    title: 'Experiências 3D',
    text: 'Three.js, WebGL e GSAP para showcases, produtos interativos e cenas navegáveis no navegador.',
  },
  {
    icon: Sparkles,
    title: 'Design & motion',
    text: 'Figma, Photoshop, Illustrator, After Effects e Blender: interface com direção visual e movimento.',
  },
  {
    icon: Bot,
    title: 'IA no fluxo de desenvolvimento',
    text: 'Claude Code, Cursor, Copilot e ChatGPT como apoio à prototipagem e à velocidade, com revisão e critério.',
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

const workModes = [
  {
    icon: BriefcaseBusiness,
    title: 'Vagas — CLT ou PJ',
    text: 'Disponível para times de produto, agências e empresas que precisam de alguém full stack com repertório de design e 3D. Trabalho remoto, com experiência em produto próprio e projetos de agência.',
    cta: 'Falar sobre vaga',
  },
  {
    icon: Boxes,
    title: 'Projetos sob demanda',
    text: 'Escopo fechado ou por hora para demandas pontuais: correções, integrações, landing pages, e-commerce e melhorias de interface.',
    cta: 'Falar sobre projeto',
  },
];

const SectionLabel = ({ children }: { children: string }) => (
  <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#00ffcc]/70">{children}</p>
);

export const ConversionHomePage = () => {
  useEffect(() => {
    document.title = 'Maruk.xyz — Full Stack Developer & Creative Technologist';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Desenvolvedor Full Stack e Creative Technologist com mais de 20 anos de experiência: React, Next.js, WordPress, WooCommerce, APIs e experiências 3D.',
    );
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#070707] text-[#ededed] selection:bg-[#00ffcc] selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_76%_12%,rgba(0,255,204,0.16),transparent_28%),radial-gradient(circle_at_16%_38%,rgba(255,255,255,0.08),transparent_22%)]" />

      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#070707]/72 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-mono text-xs uppercase tracking-[0.32em] text-white/80">
            Maruk.xyz
          </Link>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-white/50 md:flex">
            <a className="transition-colors hover:text-[#00ffcc]" href="#services">O que eu faço</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#experience">Experiência</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#projects">Projetos</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#contact">Contato</a>
          </nav>
          <Link
            to="/cv"
            className="inline-flex items-center gap-2 border border-[#00ffcc]/35 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:bg-[#00ffcc] hover:text-black"
          >
            <FileText size={14} />
            Currículo
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="home" className="relative flex min-h-screen items-center px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="container grid gap-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.76fr)] lg:items-center">
            <div className="max-w-5xl">
              <SectionLabel>Full Stack Developer · Creative Technologist</SectionLabel>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-normal text-white sm:text-6xl md:text-7xl">
                Desenvolvedor Full Stack e Creative Technologist.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
                Mais de 20 anos construindo produtos web — front-end, e-commerce, integrações e
                experiências 3D. Do briefing à entrega, com foco em resolver problemas reais.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/55">
                {heroTech.map((item) => (
                  <span key={item} className="border border-white/12 bg-white/[0.03] px-3 py-2">{item}</span>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#projects" className="inline-flex items-center justify-center gap-3 bg-[#ededed] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#00ffcc]">
                  Ver projetos
                  <ArrowRight size={17} />
                </a>
                <Link to="/cv" className="inline-flex items-center justify-center gap-3 border border-[#00ffcc]/45 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:bg-[#00ffcc]/10">
                  <FileText size={17} />
                  Currículo
                </Link>
                <a href={contactHref} className="inline-flex items-center justify-center gap-3 border border-white/18 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  Vamos conversar
                  <Mail size={17} />
                </a>
              </div>
            </div>

            <div className="relative border border-white/10 bg-black/24 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(0,255,204,0.09),transparent)]" />
              <div className="relative border border-white/10 bg-[#0d0d0d] p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00ffcc]/75">perfil profissional</span>
                  <span className="inline-flex items-center gap-2 border border-[#00ffcc]/30 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#00ffcc]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc]" />
                    Disponível
                  </span>
                </div>
                <div className="mt-6 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                  {heroFacts.map((fact) => (
                    <div key={fact.label} className="bg-[#0d0d0d] p-4">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/40">{fact.label}</p>
                      <p className="mt-2 text-lg font-semibold leading-6 text-white">{fact.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-white/55">
                  Aberto a vagas CLT/PJ (remoto) e a projetos sob demanda. Currículo completo, stack e
                  histórico estão na página de currículo.
                </p>
                <Link to="/cv" className="mt-4 inline-flex items-center gap-2 text-sm text-[#00ffcc] transition-colors hover:text-white">
                  Ver currículo completo
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* O QUE EU FAÇO */}
        <section id="services" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container">
            <div className="max-w-3xl">
              <SectionLabel>O que eu faço</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">Do front-end ao 3D, com critério de produto.</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">
                Seis frentes que se conectam no dia a dia: interface, loja virtual, integrações, experiências 3D, design e uso de IA no processo.
              </p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(({ icon: Icon, title, text }) => (
                <div key={title} className="border border-white/10 bg-black/28 p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center border border-[#00ffcc]/30 text-[#00ffcc]">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>
                  <h3 className="text-lg font-semibold uppercase tracking-[0.06em] text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIÊNCIA */}
        <section id="experience" className="border-y border-white/10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="container grid gap-10 lg:grid-cols-[0.62fr_1fr]">
            <div>
              <SectionLabel>Experiência</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">Onde eu já passei.</h2>
              <p className="mt-5 text-base leading-7 text-white/55">
                Produto próprio, agência e estúdio de experiências interativas. Histórico completo, stack
                e destaques na página de currículo.
              </p>
              <Link to="/cv" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#00ffcc] transition-colors hover:text-white">
                Currículo completo
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="grid gap-px border border-white/10 bg-white/10">
              {experience.map((item) => (
                <div key={item.company} className="bg-[#080808] p-6 md:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#00ffcc]/80">{item.period}</p>
                    <p className="text-sm text-white/50">{item.company}</p>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.role}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/55">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJETOS */}
        <section id="projects" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container">
            <div className="mb-12 max-w-3xl">
              <SectionLabel>Projetos</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">O que já está no ar.</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">
                Produtos em produção e o laboratório de experiências interativas — os protótipos que
                mostram o que eu consigo construir além da página tradicional.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {featuredProjects.map((project) => (
                <article key={project.name} className="group overflow-hidden border border-white/10 bg-white/[0.035] transition-colors hover:border-[#00ffcc]/45">
                  <div className="aspect-[16/9] overflow-hidden bg-black">
                    <img src={project.image} alt={project.name} loading="lazy" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-95" />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#00ffcc]/75">{project.category}</p>
                      <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#00ffcc]">
                        {project.cta}
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/40">{project.role}</p>
                    <p className="mt-4 text-base leading-7 text-white/62">{project.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tech.map((item) => (
                        <span key={item} className="border border-white/10 px-2.5 py-1.5 text-xs text-white/55">{item}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* LAB */}
            <div id="lab" className="mt-20">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <SectionLabel>No laboratório</SectionLabel>
                    <span className="border border-[#00ffcc]/30 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#00ffcc]">8 experimentos</span>
                  </div>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">Experimentos interativos</h3>
                  <p className="mt-4 text-base leading-7 text-white/60">
                    Protótipos e estudos de produto, 3D, motion e UI. Cada card abre a experiência ao vivo no playground.
                  </p>
                </div>
                <Link to="/playground" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-sm text-white/70 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  Ver todos no playground
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {labProjects.map((item) => (
                  <Link
                    key={item.id}
                    to={`/playground/${item.id}`}
                    className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition-colors hover:border-[#00ffcc]/45"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img src={item.cover} alt={item.title} loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100" />
                      <span className="absolute left-3 top-3 border border-white/15 bg-black/70 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/70 backdrop-blur">
                        {statusLabel[item.status] ?? item.status}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="text-base font-semibold text-white">{item.title}</h4>
                      <p className="mt-2 flex-1 text-xs leading-5 text-white/55">{item.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="border border-white/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-white/45">{tag}</span>
                        ))}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#00ffcc]/80 transition-colors group-hover:text-[#00ffcc]">
                        Abrir experimento
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STACK */}
        <section id="stack" className="border-y border-white/10 bg-[#ededed] px-4 py-24 text-black sm:px-6 lg:px-8">
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/45">Stack</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Ferramentas para construir e resolver.</h2>
              </div>
              <p className="max-w-md text-base leading-7 text-black/60">Tecnologia entra como meio: escolher a pilha certa, integrar bem e entregar algo que funcione no mundo real.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-3">
              {techGroups.map(([group, items]) => (
                <div key={group} className="bg-[#ededed] p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-black/45">{group}</h3>
                  <p className="mt-4 text-lg font-medium leading-8 text-black/82">{items.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO POSSO TRABALHAR */}
        <section id="work" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container">
            <div className="max-w-3xl">
              <SectionLabel>Disponibilidade</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">Como posso trabalhar com você.</h2>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {workModes.map(({ icon: Icon, title, text, cta }) => (
                <div key={title} className="border border-white/10 bg-black/28 p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[#00ffcc]/30 text-[#00ffcc]">
                      <Icon size={18} strokeWidth={1.6} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/58">{text}</p>
                  <a href={contactHref} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#00ffcc] transition-colors hover:text-white">
                    {cta}
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE + CONTATO */}
        <section id="about" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container grid gap-10 border-y border-white/10 py-16 lg:grid-cols-[0.55fr_1fr]">
            <div>
              <SectionLabel>Sobre</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Sobre Maruk</h2>
            </div>
            <div>
              <p className="text-xl leading-9 text-white/70">
                Há mais de 20 anos construo marcas, projetos web e experiências digitais, transitando
                entre design, tecnologia, 3D e motion.
              </p>
              <p className="mt-5 text-base leading-8 text-white/56">
                Hoje, como Full Stack Developer e Creative Technologist, transformo ideias em soluções
                digitais que combinam código, criação e experiência. Passei por agência, estúdio de
                experiências interativas e hoje mantenho um produto próprio em produção.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/cv" className="inline-flex items-center gap-2 border border-white/12 px-4 py-3 text-sm text-white/64 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  <FileText size={15} />
                  Currículo
                </Link>
                <a href="https://github.com/marukarocha/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/12 px-4 py-3 text-sm text-white/64 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  <Github size={15} />
                  GitHub
                </a>
                <a href="https://www.instagram.com/maruk.xyz/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/12 px-4 py-3 text-sm text-white/64 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  <Instagram size={15} />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
          <div className="container border border-white/10 bg-white/[0.035] p-8 text-center md:p-14">
            <SectionLabel>Contato</SectionLabel>
            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-7xl">Vamos conversar.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/62">
              Aberto a vagas e a projetos sob demanda. Me conte o contexto — time, produto ou problema — que eu respondo com o que faz sentido.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={contactHref} className="inline-flex items-center justify-center gap-3 bg-[#ededed] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#00ffcc]">
                Enviar e-mail
                <Mail size={17} />
              </a>
              <Link to="/cv" className="inline-flex items-center justify-center gap-3 border border-white/18 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                <FileText size={17} />
                Ver currículo
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-5 text-white/45">
              <a href="mailto:maruk.xyz@gmail.com" aria-label="Email" className="transition-colors hover:text-[#00ffcc]"><Mail size={19} /></a>
              <a href="https://github.com/marukarocha/" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-colors hover:text-[#00ffcc]"><Github size={19} /></a>
              <a href="https://www.instagram.com/maruk.xyz/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-[#00ffcc]"><Instagram size={19} /></a>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
          <div className="container flex flex-col items-center justify-between gap-4 text-xs text-white/35 sm:flex-row">
            <p className="font-mono uppercase tracking-[0.18em]">© 2026 Maruk.xyz</p>
            <div className="flex items-center gap-6">
              <Link to="/cv" className="transition-colors hover:text-[#00ffcc]">Currículo</Link>
              <Link to="/playground" className="transition-colors hover:text-[#00ffcc]">Playground</Link>
              <a href={contactHref} className="transition-colors hover:text-[#00ffcc]">Contato</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
