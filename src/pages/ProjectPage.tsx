import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Expand, FileText, Mail } from 'lucide-react';
import gsap from 'gsap';
import { ImageLightbox } from '../components/ImageLightbox';
import { useReveal } from '../hooks/useReveal';
import { caseStudies } from '../data/portfolioCases';

const contactHref = 'mailto:maruk.xyz@gmail.com?subject=Oportunidade%20profissional';

export const ProjectPage = () => {
  const { id } = useParams();
  const project = caseStudies.find((item) => item.id === id);
  const projectIndex = project ? caseStudies.findIndex((item) => item.id === project.id) : -1;
  const nextProject = project ? caseStudies[(projectIndex + 1) % caseStudies.length] : null;

  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | Maruk.xyz`;
    }
  }, [project]);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 26, opacity: 0, duration: 0.8, stagger: 0.09 });
    }, root);

    return () => ctx.revert();
  }, [project?.id]);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-4 text-center text-[#ededed]">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#00ffcc]/80">404</p>
        <h1 className="text-4xl font-semibold">Projeto não encontrado.</h1>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 border-b border-[#00ffcc]/50 pb-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#00ffcc] transition-colors hover:text-white"
        >
          <ArrowLeft size={13} />
          Voltar ao portfólio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-[#00ffcc] selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:3px_3px]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link
            to="/portfolio"
            viewTransition
            className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-[#00ffcc]"
          >
            <ArrowLeft size={13} />
            Portfólio
          </Link>
          <Link to="/" className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/80">
            maruk.xyz
          </Link>
          <Link
            to="/cv"
            viewTransition
            className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#00ffcc] transition-colors hover:text-white"
          >
            <FileText size={12} />
            Currículo
          </Link>
        </div>
      </header>

      <main ref={revealRef} className="relative z-10 mx-auto max-w-[1100px] px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <div ref={heroRef}>
          <p data-hero className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#00ffcc]/80">
            {project.category}
          </p>
          <h1
            data-hero
            className="mt-4 text-[2.8rem] font-semibold leading-[0.98] tracking-tight text-[#ededed] sm:text-6xl lg:text-[4.4rem]"
          >
            {project.name}
          </h1>
          <p data-hero className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/35">
            {project.role}
          </p>
          <p data-hero className="mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
            {project.summary}
          </p>
          <div data-hero className="mt-7 flex flex-wrap items-center gap-2">
            {project.tech.map((item) => (
              <span key={item} className="border border-white/10 px-2.5 py-1.5 text-[0.65rem] text-white/50">
                {item}
              </span>
            ))}
          </div>
          <div data-hero className="mt-8 flex flex-wrap items-center gap-6">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 border-b border-[#00ffcc]/50 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#00ffcc] transition-colors hover:border-[#00ffcc] hover:text-white"
              >
                {project.urlLabel ?? 'Ver no site'}
                <ArrowUpRight size={13} />
              </a>
            ) : null}
            <a
              href={contactHref}
              className="group inline-flex items-center gap-2 border-b border-white/15 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/50 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
            >
              Falar sobre projeto
              <Mail size={12} />
            </a>
          </div>
        </div>

        {/* gallery */}
        <div className="mt-14 space-y-6" data-reveal>
          {project.gallery.map((image, index) => (
            <figure key={`${image.src}-${index}`} className="border border-white/10 bg-black">
              <div className="relative h-[62vh] overflow-y-auto">
                <img
                  src={image.src}
                  alt={image.caption ?? project.name}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onClick={() => setZoomIndex(index)}
                  style={index === 0 ? { viewTransitionName: `project-${project.id}` } : undefined}
                  className="block w-full cursor-zoom-in"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 px-3 py-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/35">
                <span>{image.caption ?? project.name}</span>
                <button
                  type="button"
                  onClick={() => setZoomIndex(index)}
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#00ffcc]"
                >
                  <Expand size={11} />
                  Página inteira · ampliar
                </button>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* process + result */}
        <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-2" data-reveal>
          <div>
            {project.problem ? (
              <>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/30">Problema</p>
                <p className="mt-2 text-sm leading-7 text-white/60">{project.problem}</p>
              </>
            ) : null}
            {project.steps && project.steps.length > 0 ? (
              <div className="mt-8">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/30">Como foi feito</p>
                <ul className="mt-3 space-y-3">
                  {project.steps.map((step) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-white/60">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#00ffcc]" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div>
            {project.result ? (
              <>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/30">Resultado</p>
                <p className="mt-2 text-lg leading-8 text-white/70">{project.result}</p>
              </>
            ) : null}
            <div className="mt-8 border border-white/10 p-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/30">Stack do projeto</p>
              <p className="mt-2 text-sm leading-7 text-white/55">{project.tech.join(' · ')}</p>
            </div>
          </div>
        </div>

        {/* next */}
        {nextProject ? (
          <Link
            to={`/portfolio/${nextProject.id}`}
            viewTransition
            className="group mt-16 block border-t border-white/10 pt-8"
          >
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/30">Próximo case</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#00ffcc] sm:text-4xl">
                {nextProject.name}
              </h2>
              <ArrowUpRight size={22} className="text-white/25 transition-colors group-hover:text-[#00ffcc]" />
            </div>
          </Link>
        ) : null}
      </main>

      {zoomIndex !== null ? (
        <ImageLightbox
          images={project.gallery}
          startIndex={zoomIndex}
          onClose={() => setZoomIndex(null)}
        />
      ) : null}
    </div>
  );
};
