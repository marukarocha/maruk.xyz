import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const signals = [
  'Acesso seguro com fluxo simples e direto.',
  'Experiencia pensada para painel, operacao e leitura rapida.',
  'Base pronta para autenticação real, permissoes e estados de sessao.',
];

export const LoginPage = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    document.title = 'Login | Maruk';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      'content',
      'Pagina de login moderna com interface escura, foco em clareza visual e experiencia fluida.',
    );
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white selection:bg-white selection:text-[#050816]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(47,99,255,0.18),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(46,204,113,0.14),transparent_22%),linear-gradient(135deg,#050816_0%,#091124_52%,#040914_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
        <div className="absolute left-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#2f63ff]/18 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-4%] h-80 w-80 rounded-full bg-[#2ecc71]/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-5 py-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <Link
              to="/"
              className="text-[11px] uppercase tracking-[0.34em] text-white/62 transition-colors duration-300 hover:text-white"
            >
              Maruk
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/64 transition-all duration-300 hover:border-white/24 hover:text-white"
            >
              Voltar
              <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center px-5 pb-10 pt-4 sm:px-8 sm:pb-12">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/8 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/82">
                <ShieldCheck size={14} />
                Entrada do sistema
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-[4.7rem]">
                Entre com uma
                <span className="block bg-gradient-to-r from-white via-[#74a3ff] to-[#69d98c] bg-clip-text text-transparent">
                  experiencia mais limpa e moderna.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                Uma tela de login pensada para produto real: menos ruido, hierarquia forte e um
                visual que conversa com dashboards, plataformas internas e areas restritas.
              </p>

              <div className="mt-10 grid gap-3 sm:max-w-xl">
                {signals.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-md"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#5b84ff] to-[#63d57e]" />
                    <p className="text-sm leading-7 text-white/72">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.88, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-x-[12%] top-6 h-24 rounded-full bg-[#2f63ff]/14 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.92),rgba(7,13,28,0.82))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_40%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/42">Login</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[2rem]">
                        Acessar sistema
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#78a4ff]">
                      <LockKeyhole size={20} />
                    </div>
                  </div>

                  <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
                    Entre com seu e-mail e senha para acessar dashboards, relatórios, módulos e
                    fluxos privados da plataforma.
                  </p>

                  <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/45">
                        E-mail
                      </span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors duration-300 focus-within:border-[#6691ff]">
                        <Mail size={18} className="text-white/34" />
                        <input
                          type="email"
                          placeholder="voce@empresa.com"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/45">
                        Senha
                      </span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors duration-300 focus-within:border-[#6ad784]">
                        <LockKeyhole size={18} className="text-white/34" />
                        <input
                          type="password"
                          placeholder="Digite sua senha"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
                        />
                      </div>
                    </label>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex items-center gap-3 text-sm text-white/60">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-transparent text-[#5f87ff] focus:ring-[#5f87ff]"
                        />
                        Manter conectado
                      </label>

                      <a
                        href="#"
                        className="text-sm text-[#8fb1ff] transition-colors duration-300 hover:text-white"
                      >
                        Recuperar acesso
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#4d79ff,#6ad784)] px-5 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#04101f] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Entrar no sistema
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-6 text-sm text-white/52 sm:flex-row sm:items-center sm:justify-between">
                    <p>Ambiente seguro com autenticacao, perfis e gestao de acesso.</p>
                    <a
                      href="mailto:maruk.xyz@gmail.com?subject=Acesso%20ao%20sistema"
                      className="text-[#8fb1ff] transition-colors duration-300 hover:text-white"
                    >
                      Solicitar suporte
                    </a>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
};
