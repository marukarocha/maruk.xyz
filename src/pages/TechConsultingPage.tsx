import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Cpu,
  House,
  ImagePlus,
  Mail,
  MapPinned,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type FocusCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
};

type ProcessStep = {
  label: string;
  title: string;
  description: string;
};

const focusCards: FocusCard[] = [
  {
    icon: Wrench,
    title: 'Limpeza',
    description: 'Para maquina quente, lenta ou sem manutencao ha muito tempo.',
    details: [
      'limpeza interna',
      'organizacao basica',
      'ajustes para recuperar estabilidade',
    ],
  },
  {
    icon: Cpu,
    title: 'Upgrade de pecas',
    description: 'Quando o computador ainda serve, mas ja nao acompanha sua rotina.',
    details: [
      'troca de SSD',
      'upgrade de memoria',
      'analise do melhor custo-beneficio',
    ],
  },
  {
    icon: ShoppingCart,
    title: 'Consultoria de pecas',
    description: 'Para comprar certo e evitar gasto errado com componente incompativel ou exagerado.',
    details: [
      'orientacao antes da compra',
      'pecas pensadas para seu uso',
      'montagem mais segura depois',
    ],
  },
];

const processSteps: ProcessStep[] = [
  {
    label: '01',
    title: 'Entendo o problema',
    description: 'Voce explica o que esta acontecendo e eu avalio o melhor caminho.',
  },
  {
    label: '02',
    title: 'Executo o necessario',
    description: 'Faco a limpeza, configuracao, instalacao ou upgrade conforme o caso.',
  },
  {
    label: '03',
    title: 'Entrego com clareza',
    description: 'O equipamento volta pronto e com orientacao simples para o proximo passo.',
  },
];

const imageNotes = [
  'Foto de atendimento ou bancada',
  'Foto de limpeza ou troca de pecas',
];

const PlaceholderImage = ({
  title,
  note,
  className,
}: {
  title: string;
  note: string;
  className?: string;
}) => (
  <div className={`relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0b1320] ${className ?? ''}`}>
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_42%,rgba(249,115,22,0.12))]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:26px_26px]" />
    <div className="relative flex h-full min-h-[280px] flex-col justify-between p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/50">
          Espaco visual
        </span>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/60">
          <ImagePlus size={18} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-medium text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-white/58">{note}</p>
      </div>
    </div>
  </div>
);

export const TechConsultingPage = () => {
  useEffect(() => {
    document.title = 'Consultoria em Informatica | Maruk';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      'content',
      'Suporte tecnico em informatica com limpeza, upgrade de pecas, consultoria de compra e atendimento domiciliar.',
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#05070d] text-[#f3efe8] selection:bg-[#f3efe8] selection:text-[#05070d]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,#05070d_0%,#07101a_45%,#04060b_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#05070d]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.35em] text-white/62 transition-colors duration-300 hover:text-white"
          >
            Maruk
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/58 transition-all duration-300 hover:border-white/30 hover:text-white sm:inline-flex"
            >
              Portfolio
            </Link>
            <a
              href="mailto:maruk.xyz@gmail.com?subject=Suporte%20tecnico%20em%20informatica"
              className="inline-flex items-center gap-2 rounded-full bg-[#f3efe8] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#05070d] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Solicitar atendimento
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-14 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/7 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/82">
                <ShieldCheck size={14} />
                Suporte tecnico em informatica
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
                Seu computador precisa
                <span className="block bg-gradient-to-r from-cyan-200 via-white to-orange-200 bg-clip-text text-transparent">
                  funcionar melhor, nao complicar sua rotina.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
                Faco limpeza, upgrade de pecas, consultoria de compra e atendimento na casa do cliente com uma abordagem direta e sem excesso de jargao.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:maruk.xyz@gmail.com?subject=Preciso%20de%20suporte%20tecnico"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f3efe8] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#05070d] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Solicitar atendimento
                  <ArrowRight size={16} />
                </a>
                <Link
                  to="/#contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white"
                >
                  Ver contato
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-5"
            >
              <PlaceholderImage
                title="Imagem principal"
                note={imageNotes[0]}
                className="aspect-[4/3]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <Clock3 className="text-cyan-200" size={18} />
                  <h2 className="mt-4 text-lg font-medium text-white">Horarios viaveis</h2>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    Atendimento alinhado com a rotina do cliente, sem depender apenas de horario comercial rigido.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <House className="text-orange-200" size={18} />
                  <h2 className="mt-4 text-lg font-medium text-white">Atendimento domiciliar</h2>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    Vou ate a casa do cliente para avaliar, configurar e resolver o problema no local.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">Foco</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
                Tres frentes que merecem destaque.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                Em vez de repetir servicos em varios blocos, a pagina agora concentra o que mais comunica valor logo de cara.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {focusCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                  className="rounded-[1.9rem] border border-white/10 bg-[#09101a]/92 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white">
                    <card.icon size={22} />
                  </div>

                  <h3 className="mt-5 text-2xl font-medium text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{card.description}</p>

                  <div className="mt-6 space-y-3 border-t border-white/8 pt-5">
                    {card.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-3 text-sm text-white/68">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-200" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,14,24,0.95),rgba(12,20,33,0.95))] p-7"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Atendimento</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
                Praticidade tambem faz parte do servico.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/62 sm:text-base">
                Nem sempre faz sentido desmontar tudo, levar a maquina para outro lugar e esperar dias. Quando o atendimento no local resolve melhor, esse formato vira uma vantagem real.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <Clock3 className="text-cyan-200" size={18} />
                    <h3 className="text-lg font-medium text-white">Viabilidade de horarios</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    Posso combinar o atendimento de forma mais flexivel, respeitando a rotina e a disponibilidade do cliente.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <MapPinned className="text-orange-200" size={18} />
                    <h3 className="text-lg font-medium text-white">Na casa do cliente</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    Ideal para setups montados, equipamentos conectados em rede local ou quem precisa resolver tudo sem sair de casa.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.06 }}
              className="grid gap-5"
            >
              <PlaceholderImage
                title="Imagem de manutencao"
                note={imageNotes[1]}
                className="aspect-[16/10]"
              />

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-cyan-200" size={18} />
                  <h2 className="text-xl font-medium text-white">Tambem posso ajudar com</h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    'instalacao de sistema',
                    'formatacao',
                    'configuracao inicial',
                    'organizacao do equipamento',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/68"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">Processo</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
                Como o atendimento acontece.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {processSteps.map((step, index) => (
                <motion.article
                  key={step.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-sm font-semibold text-cyan-100">
                    {step.label}
                  </span>
                  <h3 className="mt-5 text-xl font-medium text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{step.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 pt-10 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-5xl rounded-[2.1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,14,24,0.94),rgba(10,18,31,0.94))] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Contato</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
              Se a maquina esta te atrasando, podemos resolver isso.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Entre em contato para limpeza, upgrade, consultoria de pecas ou atendimento no local.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:maruk.xyz@gmail.com?subject=Atendimento%20tecnico%20em%20informatica"
                className="inline-flex items-center gap-2 rounded-full bg-[#f3efe8] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#05070d] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Mail size={16} />
                maruk.xyz@gmail.com
              </a>
              <Link
                to="/"
                className="inline-flex items-center rounded-full border border-white/12 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/72 transition-all duration-300 hover:border-white/30 hover:text-white"
              >
                Voltar ao portfolio
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
