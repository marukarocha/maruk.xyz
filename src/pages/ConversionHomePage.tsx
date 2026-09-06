import { ArrowRight, Check, Code2, Cpu, ExternalLink, Github, Instagram, Layers3, Mail, ShoppingCart, Sparkles, Wrench } from 'lucide-react';

const contactHref = 'mailto:maruk.xyz@gmail.com?subject=Tenho%20um%20problema%20digital%20para%20resolver';

const featuredProjects = [
  {
    name: 'Motodiario.app',
    category: 'Product / Full Stack',
    description: 'Aplicacao web para gestao de ganhos, abastecimentos, manutencao, quilometragem, metas e desempenho de motoboys.',
    problem: 'Organizar a rotina financeira e operacional de profissionais que trabalham na rua.',
    result: 'Um produto web completo, com dados, metas, rastreio e experiencia mobile-first.',
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Firebase', 'APIs REST', 'PWA'],
    url: 'https://www.motodiario.app/',
    cta: 'Ver projeto',
    image: '/port/motodiario/telas/motodiario_financeiro_completro_scrool.jpeg',
  },
  {
    name: 'Pedalhe',
    category: 'E-commerce / WordPress',
    description: 'E-commerce em WordPress/WooCommerce com tema e plugins proprios, regras personalizadas de carrinho e integracao independente de pagamento via PIX.',
    problem: 'Transformar catalogo, checkout e pagamento em uma operacao de venda funcional.',
    result: 'Loja sob medida, com personalizacoes que passam do visual para a regra de negocio.',
    tech: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'API PIX'],
    url: 'https://pedalhe.com.br/',
    cta: 'Ver projeto',
    image: '/lab/bikeshop/catalogo/Bikes-catalogo1.png',
  },
  {
    name: 'T-Shirt Lab',
    category: 'Interactive Product / 3D',
    description: 'Experiencia web para customizacao interativa de camisetas, com personalizacao de nome, textos, cores e tamanhos, integrada ao PIX.',
    problem: 'Criar uma compra personalizavel sem transformar o pedido em conversa manual.',
    result: 'Um configurador visual que aproxima produto, escolha e finalizacao.',
    tech: ['Vite', 'Three.js', 'JavaScript', 'Web 3D', 'API PIX'],
    url: 'https://www.maruk.xyz/playground/tshirt-lab',
    cta: 'Experimentar',
    image: '/lab/covers_lab/T-shirt_custom.png',
  },
  {
    name: 'Orange Cargo Bike',
    category: 'Web 3D / Interactive Experience',
    description: 'Experiencia 3D interativa para apresentacao e exploracao de um conceito de cargo bike diretamente no navegador.',
    problem: 'Apresentar um produto/conceito de forma mais rica que uma landing page estatica.',
    result: 'Exploracao visual em WebGL, com narrativa de produto e interacao em tempo real.',
    tech: ['React', 'Vite', 'Three.js', 'JavaScript', 'WebGL'],
    url: 'https://www.maruk.xyz/playground/bike-cargo',
    cta: 'Explorar',
    image: '/lab/covers_lab/Bike Cargo.png',
  },
];

const services = [
  ['Websites', 'Criacao, redesign, melhorias, responsividade e manutencao.'],
  ['WordPress & WooCommerce', 'Temas, plugins, integracoes, checkout, regras de negocio e correcoes.'],
  ['Aplicacoes web', 'React, Next.js, APIs, Firebase e interfaces modernas.'],
  ['E-commerce', 'Lojas virtuais, customizacao de produtos, pagamentos e integracoes.'],
  ['Experiencias 3D', 'Three.js, WebGL, visualizacao de produtos e experiencias interativas.'],
  ['Desenvolvimento sob demanda', 'Correcoes, melhorias, novas funcionalidades e suporte tecnico por hora.'],
];

const serviceIcons = [Code2, ShoppingCart, Cpu, Wrench, Layers3, Sparkles];

const techGroups = [
  ['Frontend', ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind']],
  ['Web & E-commerce', ['WordPress', 'WooCommerce', 'PHP', 'Plugins', 'Themes']],
  ['Backend & APIs', ['Node.js', 'Firebase', 'Firestore', 'REST APIs', 'Authentication']],
  ['Interactive', ['Three.js', 'WebGL', 'GSAP', 'Vite']],
  ['Design', ['Figma', 'UI/UX', 'Photoshop', 'Illustrator']],
  ['3D & Motion', ['Blender', 'After Effects', 'Premiere']],
  ['Dev Tools', ['Git', 'GitHub', 'Vercel']],
];

const processSteps = [
  ['Explorar', 'Entendo o problema, objetivo e contexto.'],
  ['Estruturar', 'Defino escopo, prioridades e solucao.'],
  ['Construir', 'Desenvolvo e integro a solucao.'],
  ['Refinar', 'Testo, ajusto e entrego.'],
];

const demandServices = ['Correcoes', 'WordPress', 'WooCommerce', 'React', 'APIs', 'Integracoes', 'UI', 'Melhorias', 'Desenvolvimento personalizado'];

const SectionLabel = ({ children }: { children: string }) => (
  <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#00ffcc]/70">{children}</p>
);

export const ConversionHomePage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070707] text-[#ededed] selection:bg-[#00ffcc] selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_76%_12%,rgba(0,255,204,0.16),transparent_28%),radial-gradient(circle_at_16%_38%,rgba(255,255,255,0.08),transparent_22%)]" />

      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#070707]/72 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" className="font-mono text-xs uppercase tracking-[0.32em] text-white/80">Maruk.xyz</a>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-white/50 md:flex">
            <a className="transition-colors hover:text-[#00ffcc]" href="#projects">Projetos</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#services">Solucoes</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#hourly">Horas</a>
            <a className="transition-colors hover:text-[#00ffcc]" href="#contact">Contato</a>
          </nav>
          <a href={contactHref} className="inline-flex items-center gap-2 border border-[#00ffcc]/35 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#00ffcc] transition-colors hover:bg-[#00ffcc] hover:text-black">
            Vamos conversar
            <ArrowRight size={14} />
          </a>
        </div>
      </header>

      <main className="relative z-10">
        <section id="home" className="relative flex min-h-screen items-center px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="container grid gap-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.76fr)] lg:items-center">
            <div className="max-w-5xl">
              <SectionLabel>Full stack developer + creative technologist</SectionLabel>
              <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.96] tracking-normal text-white sm:text-6xl md:text-7xl lg:text-8xl">
                Desenvolvimento para problemas digitais complexos.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
                Sites, e-commerce, aplicacoes web e experiencias interativas - do desenvolvimento a solucao.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/55">
                {['React', 'Next.js', 'WordPress', 'WooCommerce', 'Three.js'].map((item) => (
                  <span key={item} className="border border-white/12 bg-white/[0.03] px-3 py-2">{item}</span>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#projects" className="inline-flex items-center justify-center gap-3 bg-[#ededed] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#00ffcc]">
                  Ver projetos
                  <ArrowRight size={17} />
                </a>
                <a href={contactHref} className="inline-flex items-center justify-center gap-3 border border-white/18 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                  Vamos conversar
                  <Mail size={17} />
                </a>
              </div>
            </div>

            <div className="relative min-h-[430px] border border-white/10 bg-black/24 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(0,255,204,0.09),transparent)]" />
              <div className="relative h-full min-h-[400px] overflow-hidden border border-white/10 bg-[#0d0d0d]">
                <div className="absolute left-5 top-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00ffcc]/75">solution map</div>
                <div className="absolute inset-x-8 top-24 h-px bg-[#00ffcc]/35" />
                <div className="absolute left-8 top-24 h-48 w-px bg-[#00ffcc]/35" />
                <div className="absolute left-8 top-72 right-12 h-px bg-white/18" />
                {['diagnostico', 'escopo', 'codigo', 'entrega'].map((item, index) => (
                  <div
                    key={item}
                    className="absolute border border-white/14 bg-black/60 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/70"
                    style={{ left: `${14 + index * 17}%`, top: `${28 + (index % 2) * 28}%` }}
                  >
                    <span className="mr-2 text-[#00ffcc]">0{index + 1}</span>{item}
                  </div>
                ))}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-white/45">
                  <span className="border border-white/10 p-3">Web</span>
                  <span className="border border-white/10 p-3">Commerce</span>
                  <span className="border border-white/10 p-3">3D</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container">
            <div className="mb-12 max-w-3xl">
              <SectionLabel>Projetos em destaque</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">Projetos selecionados</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">Alguns projetos que mostram diferentes formas de transformar problemas em produtos digitais.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {featuredProjects.map((project) => (
                <article key={project.name} className="group overflow-hidden border border-white/10 bg-white/[0.035] transition-colors hover:border-[#00ffcc]/45">
                  <div className="aspect-[16/9] overflow-hidden bg-black">
                    <img src={project.image} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-95" />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#00ffcc]/75">{project.category}</p>
                      <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#00ffcc]">
                        {project.cta}
                        <ExternalLink size={15} />
                      </a>
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold text-white">{project.name}</h3>
                    <p className="mt-4 text-base leading-7 text-white/62">{project.description}</p>
                    <div className="mt-6 grid gap-4 text-sm leading-6 text-white/56 md:grid-cols-2">
                      <p><span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/35">Problema</span>{project.problem}</p>
                      <p><span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/35">Resultado</span>{project.result}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tech.map((item) => (
                        <span key={item} className="border border-white/10 px-2.5 py-1.5 text-xs text-white/55">{item}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container grid gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <SectionLabel>Solucoes</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">O que posso resolver</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">Voce nao precisa contratar uma equipe inteira para cada problema digital. Posso atuar por projeto ou por horas para desenvolver, corrigir e melhorar produtos digitais.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map(([title, text], index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return (
                  <div key={title} className="border border-white/10 bg-black/28 p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center border border-[#00ffcc]/30 text-[#00ffcc]">
                      <Icon size={18} strokeWidth={1.6} />
                    </div>
                    <h3 className="text-lg font-semibold uppercase tracking-[0.06em] text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tech" className="border-y border-white/10 bg-[#ededed] px-4 py-24 text-black sm:px-6 lg:px-8">
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/45">Tech Arsenal</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Ferramentas para construir e resolver.</h2>
              </div>
              <p className="max-w-md text-base leading-7 text-black/60">Tecnologia entra como meio: escolher a pilha certa, integrar bem e entregar algo que funcione no mundo real.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-3">
              {techGroups.map(([group, items]) => (
                <div key={group as string} className="bg-[#ededed] p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-black/45">{group}</h3>
                  <p className="mt-4 text-lg font-medium leading-8 text-black/82">{(items as string[]).join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="hourly" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionLabel>Desenvolvimento sob demanda</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">Precisa de um desenvolvedor?</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">Contrate horas tecnicas para resolver problemas, implementar melhorias ou desenvolver novas funcionalidades.</p>
              <p className="mt-4 text-base leading-7 text-white/52">Nem todo problema precisa de um projeto grande. Posso atuar por algumas horas, por um projeto especifico ou de forma recorrente.</p>
            </div>
            <div className="border border-[#00ffcc]/28 bg-[#00ffcc]/[0.035] p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Hora tecnica</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-normal text-white md:text-7xl">R$40</span>
                <span className="pb-3 text-lg text-[#00ffcc]">/h</span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {demandServices.map((item) => (
                  <div key={item} className="flex items-center gap-3 border border-white/10 bg-black/24 p-3 text-sm text-white/70">
                    <Check size={16} className="text-[#00ffcc]" />
                    {item}
                  </div>
                ))}
              </div>
              <a href={contactHref} className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-[#00ffcc] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white">
                Tenho um problema para resolver
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        <section id="process" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container">
            <SectionLabel>Processo</SectionLabel>
            <div className="mt-6 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
              {processSteps.map(([title, text], index) => (
                <div key={title} className="bg-[#080808] p-6 md:p-8">
                  <p className="font-mono text-xs text-[#00ffcc]">0{index + 1}</p>
                  <h3 className="mt-14 text-3xl font-semibold text-white">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="container grid gap-10 border-y border-white/10 py-16 lg:grid-cols-[0.55fr_1fr]">
            <div>
              <SectionLabel>Sobre</SectionLabel>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Sobre Maruk</h2>
            </div>
            <div>
              <p className="text-xl leading-9 text-white/70">Desenvolvedor Full Stack e Creative Technologist com mais de 15 anos de experiencia em projetos digitais.</p>
              <p className="mt-5 text-base leading-8 text-white/56">Minha experiencia combina desenvolvimento web, design, UI/UX, e-commerce, 3D e experiencias interativas. Hoje trabalho principalmente com desenvolvimento sob demanda, ajudando empresas e produtos digitais a resolver problemas, implementar melhorias e transformar ideias em solucoes funcionais.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  ['Portfolio antigo', '/portfolio'],
                  ['GitHub', 'https://github.com/marukarocha/'],
                  ['LinkedIn', 'https://www.linkedin.com/'],
                  ['Instagram', 'https://www.instagram.com/maruk.xyz/'],
                ].map(([label, href]) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="border border-white/12 px-4 py-3 text-sm text-white/64 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">{label}</a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 pb-28 pt-16 sm:px-6 lg:px-8">
          <div className="container border border-white/10 bg-white/[0.035] p-8 text-center md:p-14">
            <SectionLabel>Contato</SectionLabel>
            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-7xl">Tem um problema digital?</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/62">Conte o que voce precisa. Podemos comecar com algumas horas para entender e resolver o problema.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={contactHref} className="inline-flex items-center justify-center gap-3 bg-[#ededed] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#00ffcc]">
                Vamos conversar
                <Mail size={17} />
              </a>
              <a href="#projects" className="inline-flex items-center justify-center gap-3 border border-white/18 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]">
                Ver projetos
                <ArrowRight size={17} />
              </a>
            </div>
            <div className="mt-10 flex items-center justify-center gap-5 text-white/45">
              <a href="mailto:maruk.xyz@gmail.com" aria-label="Email" className="transition-colors hover:text-[#00ffcc]"><Mail size={19} /></a>
              <a href="https://github.com/marukarocha/" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-colors hover:text-[#00ffcc]"><Github size={19} /></a>
              <a href="https://www.instagram.com/maruk.xyz/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-[#00ffcc]"><Instagram size={19} /></a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
