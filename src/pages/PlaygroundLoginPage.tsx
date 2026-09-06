import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, FileText, Globe2, LineChart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  getExperimentDisplayName,
  PLAYGROUND_PASSWORD,
  PROTECTED_PLAYGROUND_IDS,
} from '../playground/auth';

const eldonitaOrbitSources = [
  { icon: FileText, color: '#3F83EE', angle: 18, radius: 40, size: 2.45, duration: 42, direction: 1 },
  { icon: Globe2, color: '#6FC256', angle: 118, radius: 35, size: 2.25, duration: 36, direction: -1 },
  { icon: Database, color: '#B5BDC7', angle: 228, radius: 28, size: 2.1, duration: 31, direction: 1 },
  { icon: LineChart, color: '#7D8794', angle: 310, radius: 46, size: 2.15, duration: 48, direction: -1 },
  { icon: FileText, color: '#3F83EE', angle: 76, radius: 50, size: 1.45, duration: 56, direction: -1 },
  { icon: Globe2, color: '#6FC256', angle: 164, radius: 22, size: 1.35, duration: 28, direction: 1 },
] as const;

const eldonitaAmbientDots = [
  { radius: 45, angle: 252, size: 0.78, color: '#3F83EE', duration: 52, direction: 1 },
  { radius: 31, angle: 42, size: 0.58, color: '#6FC256', duration: 44, direction: -1 },
  { radius: 18, angle: 286, size: 0.48, color: '#3F83EE', duration: 34, direction: -1 },
  { radius: 52, angle: 188, size: 0.64, color: '#6FC256', duration: 62, direction: 1 },
] as const;

const EldonitaOrbitalVisual = () => (
  <div className="eldonita-login-orbit relative isolate flex aspect-square items-center justify-center" aria-hidden="true">
    <svg
      className="pointer-events-none h-full w-full overflow-visible drop-shadow-[0_0_34px_rgba(63,131,238,0.16)]"
      viewBox="0 0 520 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        opacity="0.58"
        animate={{ rotate: 360 }}
        transition={{ duration: 58, ease: 'linear', repeat: Infinity }}
        style={{ transformOrigin: '260px 260px' }}
      >
        <circle cx="260" cy="260" r="224" stroke="white" strokeOpacity="0.09" />
        <motion.circle
          cx="260"
          cy="260"
          r="188"
          stroke="#4F84DF"
          strokeOpacity="0.14"
          strokeDasharray="0.6 16"
          strokeLinecap="round"
          animate={{ strokeDashoffset: -90 }}
          transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
        />
      </motion.g>
      <motion.g
        opacity="0.62"
        animate={{ rotate: -360 }}
        transition={{ duration: 46, ease: 'linear', repeat: Infinity }}
        style={{ transformOrigin: '260px 260px' }}
      >
        <circle cx="260" cy="260" r="154" stroke="#4F84DF" strokeOpacity="0.2" />
        <circle cx="260" cy="260" r="96" stroke="#6FC256" strokeOpacity="0.14" />
        <circle cx="260" cy="260" r="206" stroke="#3F83EE" strokeOpacity="0.06" />
      </motion.g>
      {[
        { r: 174, stroke: '#3F83EE', width: 7, dash: '132 110 64 128', offset: 18, rotate: 360, duration: 52 },
        { r: 62, stroke: '#3F83EE', width: 6, dash: '74 66 32 90', offset: 24, rotate: -360, duration: 36 },
        { r: 132, stroke: '#6FC256', width: 6, dash: '98 92 62 108', offset: 34, rotate: -360, duration: 58 },
        { r: 83, stroke: '#6FC256', width: 5, dash: '54 70 30 104', offset: 12, rotate: 360, duration: 42 },
        { r: 150, stroke: '#B5BDC7', width: 6, dash: '128 152 54 136', offset: 96, rotate: 360, duration: 70 },
      ].map((ring) => (
        <motion.circle
          key={`${ring.stroke}-${ring.r}`}
          cx="260"
          cy="260"
          r={ring.r}
          stroke={ring.stroke}
          strokeWidth={ring.width}
          strokeDasharray={ring.dash}
          strokeDashoffset={ring.offset}
          strokeLinecap="round"
          animate={{ rotate: ring.rotate }}
          transition={{ duration: ring.duration, ease: 'linear', repeat: Infinity }}
          style={{ transformOrigin: '260px 260px' }}
        />
      ))}
      <circle cx="260" cy="260" r="44" stroke="#6FC256" strokeOpacity="0.2" />
      <motion.circle
        cx="260"
        cy="260"
        r="47"
        stroke="#3F83EE"
        strokeWidth="5"
        strokeDasharray="74 104"
        strokeDashoffset="28"
        strokeOpacity="0.82"
        strokeLinecap="round"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        style={{ transformOrigin: '260px 260px' }}
      />
    </svg>

    {eldonitaAmbientDots.map((dot) => (
      <motion.div
        key={`${dot.color}-${dot.angle}`}
        className="pointer-events-none absolute inset-0"
        initial={{ rotate: dot.angle }}
        animate={{ rotate: dot.direction >= 0 ? dot.angle + 360 : dot.angle - 360 }}
        transition={{ duration: dot.duration, ease: 'linear', repeat: Infinity }}
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
            opacity: 0.52,
          }}
        />
      </motion.div>
    ))}

    {eldonitaOrbitSources.map((source, index) => {
      const Icon = source.icon;

      return (
        <motion.div
          key={`${source.color}-${source.angle}-${index}`}
          className="pointer-events-none absolute inset-0"
          initial={{ rotate: source.angle }}
          animate={{ rotate: source.direction >= 0 ? source.angle + 360 : source.angle - 360 }}
          transition={{ duration: source.duration, ease: 'linear', repeat: Infinity }}
        >
          <motion.div
            className="absolute left-1/2 z-20 flex items-center justify-center rounded-full border border-white/25 bg-[#061725]/85 text-white shadow-[0_0_22px_rgba(63,131,238,0.32)]"
            style={{
              top: `${50 - source.radius}%`,
              width: `${source.size}rem`,
              height: `${source.size}rem`,
              color: source.color,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: source.direction >= 0 ? -(source.angle + 360) : -(source.angle - 360) }}
            transition={{ duration: source.duration, ease: 'linear', repeat: Infinity }}
          >
            <Icon size={18} strokeWidth={1.8} />
          </motion.div>
        </motion.div>
      );
    })}
  </div>
);

const EldonitaLogoMark = () => (
  <svg
    style={{ display: 'block', height: 'auto', maxWidth: '100%', width: '11.5rem' }}
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
      <g className="eldonita-logo-hover-spin eldonita-logo-hover-spin-reverse">
        <circle cx="56" cy="56" r="43" stroke="#C9D0D8" strokeWidth="7" strokeDasharray="108 58" strokeDashoffset="52" strokeLinecap="round" />
      </g>
      <g className="eldonita-logo-hover-spin eldonita-logo-hover-spin-outer">
        <circle cx="56" cy="56" r="54" stroke="#0D67D8" strokeWidth="7" strokeDasharray="116 72 36 46" strokeDashoffset="18" strokeLinecap="round" />
      </g>
      <g className="eldonita-logo-hover-spin eldonita-logo-hover-spin-inner">
        <circle cx="56" cy="56" r="31" stroke="#2FAA3F" strokeWidth="7" strokeDasharray="92 44" strokeLinecap="round" />
        <circle cx="56" cy="56" r="22" stroke="#2FAA3F" strokeWidth="6" strokeDasharray="86 78" strokeDashoffset="18" strokeLinecap="round" />
      </g>
      <g className="eldonita-logo-hover-spin eldonita-logo-hover-spin-dots">
        <circle cx="101" cy="22" r="8" fill="#0D67D8" />
        <circle cx="20" cy="90" r="8" fill="#0D67D8" />
      </g>
    </g>
  </svg>
);

const EldonitaLoginLogo = () => (
  <div className="leading-none text-white">
    <EldonitaLogoMark />
    <div className="mt-1 text-[0.5rem] tracking-[0.42em] text-white/55">
      INTELIGÊNCIA
    </div>
  </div>
);

export const PlaygroundLoginPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const needsProtection = Boolean(id && PROTECTED_PLAYGROUND_IDS.includes(id as (typeof PROTECTED_PLAYGROUND_IDS)[number]));
  const experimentName = getExperimentDisplayName(id);
  const isEldonita = id === 'eldonita';

  useEffect(() => {
    if (!id) {
      return;
    }

    const storedAuth = localStorage.getItem(`lab_auth_${id}`);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, [id]);

  if (!id || !needsProtection) {
    return <Navigate to="/playground" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputPassword === PLAYGROUND_PASSWORD) {
      localStorage.setItem(`lab_auth_${id}`, 'true');
      setError('');
      setIsAuthenticated(true);
      navigate(`/playground/${id}`, { replace: true });
      return;
    }

    setError('Senha incorreta. Tente novamente.');
  };

  if (isEldonita) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#03101a] text-white">
        <style>
          {`
            .eldonita-login-shell {
              position: relative;
              z-index: 10;
              min-height: 100svh;
              padding: 0 3rem;
              display: flex;
              align-items: center;
            }

            .eldonita-login-layout {
              width: min(100%, 96rem);
              min-height: 100svh;
              margin: 0 auto;
              display: grid;
              grid-template-columns: minmax(0, 1.18fr) minmax(23.75rem, 0.82fr);
              column-gap: clamp(2rem, 4vw, 4.75rem);
              align-items: center;
            }

            .eldonita-login-visual-column {
              min-width: 0;
              min-height: 100svh;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: visible;
            }

            .eldonita-login-orbit {
              width: min(92vw, 64rem);
              transform: translateX(clamp(-15rem, -15vw, -7rem));
            }

            .eldonita-login-panel-column {
              min-width: 0;
              min-height: 100svh;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .eldonita-login-panel {
              width: 100%;
              max-width: 28.75rem;
            }

            .eldonita-logo-hover-spin {
              transform-box: fill-box;
              transform-origin: center;
            }

            .eldonita-login-panel:hover .eldonita-logo-hover-spin-outer {
              animation: eldonita-logo-spin 22s linear infinite;
            }

            .eldonita-login-panel:hover .eldonita-logo-hover-spin-reverse {
              animation: eldonita-logo-spin-reverse 29s linear infinite;
            }

            .eldonita-login-panel:hover .eldonita-logo-hover-spin-inner {
              animation: eldonita-logo-spin 18s linear infinite;
            }

            .eldonita-login-panel:hover .eldonita-logo-hover-spin-dots {
              animation: eldonita-logo-spin-reverse 34s linear infinite;
            }

            @keyframes eldonita-logo-spin {
              to { transform: rotate(360deg); }
            }

            @keyframes eldonita-logo-spin-reverse {
              to { transform: rotate(-360deg); }
            }

            @media (max-width: 1023px) {
              .eldonita-login-shell {
                padding: 2rem 1.25rem;
              }

              .eldonita-login-layout {
                min-height: auto;
                grid-template-columns: 1fr;
                row-gap: 2rem;
              }

              .eldonita-login-visual-column,
              .eldonita-login-panel-column {
                min-height: auto;
                justify-content: center;
              }

              .eldonita-login-visual-column {
                min-height: 22rem;
              }

              .eldonita-login-orbit {
                width: min(92vw, 30rem);
                transform: none;
              }
            }
          `}
        </style>

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(32,100,178,0.3),transparent_32%),radial-gradient(circle_at_12%_34%,rgba(32,168,70,0.1),transparent_26%),linear-gradient(140deg,#041625_0%,#020913_55%,#03111c_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
        </div>

        <div className="eldonita-login-shell">
          <main className="w-full">
            <motion.section
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
              className="eldonita-login-layout"
            >
              <div className="eldonita-login-visual-column">
                <div className="pointer-events-none absolute bottom-2 left-[18%] h-[28rem] w-[28rem] rounded-full bg-[#3f83ee]/10 blur-3xl" />
                <div className="pointer-events-none absolute right-[10%] top-[14%] h-[22rem] w-[22rem] rounded-full bg-[#6fc256]/8 blur-3xl" />

                <div className="relative z-10 flex w-full items-center justify-center opacity-95">
                  <EldonitaOrbitalVisual />
                </div>
              </div>

              <div className="eldonita-login-panel-column">
                <div className="eldonita-login-panel border border-white/10 bg-[#061725]/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8">
                  <div className="mb-9">
                    <EldonitaLoginLogo />
                  </div>

                  <div>
                    <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                      Bem-vindo de volta
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/52">
                      Informe a senha de acesso para liberar a apresentação.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/40">
                        Senha
                      </span>
                      <div className="flex h-14 items-center gap-3 border border-white/10 bg-[#03101a] px-4 transition-colors duration-300 focus-within:border-[#65A0FF]/60">
                        <LockKeyhole size={18} className="text-white/34" />
                        <input
                          id="password"
                          type="password"
                          value={inputPassword}
                          onChange={(event) => setInputPassword(event.target.value)}
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
                          placeholder="Digite sua senha"
                          autoFocus
                        />
                      </div>
                    </label>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <button
                      type="submit"
                      className="inline-flex h-14 w-full items-center justify-center gap-2 bg-[#4d86f7] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#65A0FF]"
                    >
                      {isAuthenticated ? 'Atualizar acesso' : 'Entrar'}
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
                    <Link
                      to={`/playground/${id}`}
                      className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/54 transition-colors hover:text-white"
                    >
                      Ir para a experiência
                      <ArrowRight size={14} />
                    </Link>

                    {isAuthenticated ? (
                      <span className="border border-emerald-400/18 bg-emerald-400/8 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200">
                        acesso liberado
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090d] px-5 py-6 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.055),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(120,135,255,0.08),transparent_30%),linear-gradient(145deg,#0b1018_0%,#05070b_58%,#080b12_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            to="/playground"
            className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
          >
            Playground
          </Link>

          <Link
            to="/playground"
            className="inline-flex h-10 items-center justify-center gap-2 border border-white/12 px-4 text-xs font-medium uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/28 hover:text-white"
          >
            Voltar
            <ArrowRight size={14} />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid w-full max-w-4xl overflow-hidden border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="relative hidden min-h-[30rem] border-r border-white/10 p-8 md:flex md:flex-col md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.04] px-3 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-white/52">
                  <ShieldCheck size={14} />
                  Acesso seguro
                </div>

                <h1 className="mt-8 max-w-sm text-4xl font-semibold leading-[1.04] text-white">
                  Entre para acessar a experiência.
                </h1>
              </div>

              <div className="space-y-4">
                <div className="h-px w-full bg-white/10" />
                <p className="max-w-sm text-sm leading-7 text-white/48">
                  Área protegida do playground. Use a senha compartilhada para liberar a navegação.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="mb-8">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/38">
                  {experimentName}
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
                  Acesso restrito
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/52">
                  Digite a senha para continuar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                    Senha
                  </span>
                  <div className="flex h-14 items-center gap-3 border border-white/10 bg-black/22 px-4 transition-colors duration-300 focus-within:border-white/32">
                    <LockKeyhole size={18} className="text-white/34" />
                    <input
                      id="password"
                      type="password"
                      value={inputPassword}
                      onChange={(event) => setInputPassword(event.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
                      placeholder="Digite sua senha"
                      autoFocus
                    />
                  </div>
                </label>

                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 bg-white px-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#07090d] transition-colors hover:bg-white/88"
                >
                  {isAuthenticated ? 'Atualizar acesso' : 'Entrar'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                <Link
                  to={`/playground/${id}`}
                  className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/54 transition-colors hover:text-white"
                >
                  Ir para a experiência
                  <ArrowRight size={14} />
                </Link>

                {isAuthenticated ? (
                  <span className="border border-emerald-400/18 bg-emerald-400/8 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200">
                    acesso liberado
                  </span>
                ) : null}
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
};
