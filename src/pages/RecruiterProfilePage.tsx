import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Boxes,
  BriefcaseBusiness,
  BrainCircuit,
  Code2,
  Compass,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type HighlightCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ExperienceItem = {
  period: string;
  title: string;
  company: string;
  summary: string;
};

type StackGroup = {
  label: string;
  items: string[];
};

const highlightCards: HighlightCard[] = [
  {
    icon: Code2,
    title: 'Front-end de produto',
    description: 'React, arquitetura de interface, integrações e entrega de aplicações reais em produção.',
  },
  {
    icon: Sparkles,
    title: 'Interatividade e motion',
    description: 'GSAP, narrativa visual e microexperiências que deixam a interface mais clara e memorável.',
  },
  {
    icon: Boxes,
    title: '3D para web',
    description: 'Three.js, WebGL e direção visual aplicada a showcases, cenas interativas e apresentação de produto.',
  },
  {
    icon: BrainCircuit,
    title: 'Perfil híbrido',
    description: 'Combino execução técnica, sensibilidade visual e visão de produto sem separar design de implementação.',
  },
];

const experienceItems: ExperienceItem[] = [
  {
    period: '2021 - atual',
    title: 'Front-End Developer',
    company: 'Motodiario.app',
    summary:
      'Desenvolvimento de aplicação em produção com React e Firebase, incluindo autenticação, rotas protegidas, estrutura modular e manutenção contínua.',
  },
  {
    period: '2019 - 2021',
    title: 'Desenvolvedor de experiências interativas',
    company: 'Sábia Experience',
    summary:
      'Criação de ambientes digitais imersivos, interfaces 3D e fluxos interativos voltados para educação e apresentações digitais.',
  },
  {
    period: '2009 - atual',
    title: 'Front-End Developer',
    company: 'Projetos web, sistemas e agências',
    summary:
      'Entrega de portais, landing pages, e-commerces e sistemas web com integração de APIs, pagamentos, performance e direção visual.',
  },
];

const stackGroups: StackGroup[] = [
  {
    label: 'Core',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vite'],
  },
  {
    label: 'Interactive',
    items: ['Three.js', 'GSAP', 'WebGL', 'Framer Motion', 'Blender'],
  },
  {
    label: 'Product',
    items: ['Arquitetura de interface', 'APIs REST', 'Firebase', 'E-commerce', 'UX'],
  },
];

const quickFacts = [
  { value: '20+', label: 'anos em projetos digitais' },
  { value: '50+', label: 'entregas entre sites, sistemas e produtos' },
  { value: '1', label: 'link direto para leitura rápida do perfil' },
];

const selectedSignals = [
  'Experiência prática com produto próprio e manutenção contínua',
  'Boa interseção entre interface, direção visual e implementação',
  'Capacidade de sair do institucional e construir experiências mais autorais',
  'Histórico com times, agências, freelas e contexto de negócio real',
];

export const RecruiterProfilePage = () => {
  useEffect(() => {
    document.title = 'Perfil Profissional | Maruk';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      'content',
      'Perfil profissional objetivo de Marcus Rocha: front-end developer com foco em React, interfaces interativas, motion e 3D para web.',
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#1d140f] selection:bg-[#1d140f] selection:text-[#f6f1e8]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(203,120,41,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(68,108,130,0.16),transparent_24%),linear-gradient(180deg,#f6f1e8_0%,#f1e8dd_44%,#efe4d6_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(71,48,33,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(71,48,33,0.04)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40" />
        <div className="absolute left-[-12%] top-[14%] h-64 w-64 rounded-full bg-[#dc8a47]/20 blur-3xl" />
        <div className="absolute bottom-[12%] right-[-8%] h-72 w-72 rounded-full bg-[#7b9bb0]/16 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-black/6 bg-[#f6f1e8]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#7b614f]">Maruk</p>
            <p className="mt-1 text-sm text-[#6b5445]">Perfil direto para recrutadores</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6f5a4d] transition-all duration-300 hover:border-black/20 hover:text-[#1d140f] sm:inline-flex"
            >
              Portfolio
            </Link>
            <a
              href="mailto:maruk.xyz@gmail.com?subject=Contato%20profissional"
              className="inline-flex items-center gap-2 rounded-full bg-[#1d140f] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#f6f1e8] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Falar comigo
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c58a5c]/24 bg-white/55 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[#8a5a35] shadow-[0_8px_30px_rgba(104,64,34,0.06)]">
                <Compass size={14} />
                Front-end, motion e interfaces interativas
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.94] text-[#1d140f] sm:text-6xl lg:text-[4.7rem]">
                Experiência real em produto, interface e execução visual para web.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5d493d] sm:text-lg">
                Sou Marcus Rocha, front-end developer com mais de 20 anos em projetos digitais. Atuo
                na construção de aplicações, sistemas e experiências interativas com foco em React,
                motion, 3D para web e direção visual aplicada ao produto.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:maruk.xyz@gmail.com?subject=Oportunidade%20profissional"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1d140f] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#f6f1e8] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Entrar em contato
                  <ArrowUpRight size={16} />
                </a>
                <a
                  href="https://github.com/marukarocha"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm uppercase tracking-[0.18em] text-[#5d493d] transition-all duration-300 hover:border-black/20 hover:text-[#1d140f]"
                >
                  Ver GitHub
                </a>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.38))] p-6 shadow-[0_30px_80px_rgba(79,52,31,0.08)] backdrop-blur-xl sm:p-7"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b715e]">Resumo rapido</p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[1.4rem] border border-black/7 bg-[#fff9f4]/88 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7258]">Posicionamento</p>
                  <p className="mt-2 text-base leading-7 text-[#3b2a20]">
                    Desenvolvedor front-end com perfil híbrido entre engenharia visual, produto e
                    interatividade.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {quickFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-[1.3rem] border border-black/7 bg-white/72 p-4"
                    >
                      <p className="text-2xl font-semibold text-[#1d140f]">{fact.value}</p>
                      <p className="mt-2 text-sm leading-6 text-[#6b5445]">{fact.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b715e]">Leitura em 30 segundos</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#1d140f] sm:text-5xl">
                O que vale entender rapido sobre meu perfil.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlightCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="rounded-[1.7rem] border border-black/8 bg-white/58 p-6 shadow-[0_16px_50px_rgba(79,52,31,0.05)] backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d140f] text-[#f6f1e8]">
                    <card.icon size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-medium text-[#1d140f]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5d493d]">{card.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className="rounded-[1.9rem] border border-black/8 bg-[#1f1814] p-7 text-[#f7efe6] shadow-[0_24px_80px_rgba(29,20,15,0.16)]"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9ab94]">Sinais relevantes</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                Perfil bom para times que precisam de execução com repertório visual.
              </h2>

              <div className="mt-7 space-y-3">
                {selectedSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-[#e3d4c6]"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="rounded-[1.9rem] border border-black/8 bg-white/58 p-7 shadow-[0_16px_60px_rgba(79,52,31,0.05)] backdrop-blur-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b715e]">Stack prioritaria</p>
              <h2 className="mt-4 text-3xl font-semibold text-[#1d140f] sm:text-4xl">
                Tecnologias e frentes mais aderentes ao seu posicionamento.
              </h2>

              <div className="mt-7 space-y-4">
                {stackGroups.map((group) => (
                  <div key={group.label} className="rounded-[1.3rem] border border-black/7 bg-[#fffaf5] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#9a7258]">{group.label}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[#cfa47b]/28 bg-[#f5ecdf] px-3 py-2 text-sm text-[#4a362a]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b715e]">Experiencia</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#1d140f] sm:text-5xl">
                Recorte profissional para entender trajetória e contexto.
              </h2>
            </div>

            <div className="grid gap-4">
              {experienceItems.map((item, index) => (
                <motion.article
                  key={`${item.company}-${item.period}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="grid gap-5 rounded-[1.8rem] border border-black/8 bg-white/58 p-6 shadow-[0_16px_60px_rgba(79,52,31,0.05)] backdrop-blur-sm md:grid-cols-[160px_1fr]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#9a7258]">{item.period}</p>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-medium text-[#1d140f]">{item.title}</h3>
                      <span className="rounded-full border border-black/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#6f5a4d]">
                        {item.company}
                      </span>
                    </div>
                    <p className="mt-3 max-w-4xl text-sm leading-7 text-[#5d493d]">{item.summary}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-12">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,248,241,0.56))] p-8 shadow-[0_30px_90px_rgba(79,52,31,0.08)] backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b715e]">Contato profissional</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-[#1d140f] sm:text-5xl">
                  Se fizer sentido para a vaga, a conversa pode começar por aqui.
                </h2>
                <div className="mt-6 flex flex-col gap-3 text-sm leading-7 text-[#5d493d]">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#8a5a35]" />
                    <span>maruk.xyz@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-[#8a5a35]" />
                    <span>Florianópolis, SC · Brasil</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness size={16} className="text-[#8a5a35]" />
                    <span>Disponível para oportunidades em front-end, produto digital e experiências interativas</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="mailto:maruk.xyz@gmail.com?subject=Oportunidade%20profissional"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1d140f] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#f6f1e8] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Entrar em contato
                  <ArrowUpRight size={16} />
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm uppercase tracking-[0.18em] text-[#5d493d] transition-all duration-300 hover:border-black/20 hover:text-[#1d140f]"
                >
                  Ver portfolio principal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
