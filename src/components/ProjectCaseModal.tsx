import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail, X } from 'lucide-react';

export type ProjectGalleryImage = {
  src: string;
  caption?: string;
};

export type ProjectCase = {
  id: string;
  name: string;
  category: string;
  role: string;
  summary: string;
  problem?: string;
  steps?: string[];
  result?: string;
  tech: string[];
  gallery: ProjectGalleryImage[];
  url?: string;
  urlLabel?: string;
  statusNote?: string;
  statusTag?: string;
};

type ProjectCaseModalProps = {
  project: ProjectCase | null;
  contactHref: string;
  onClose: () => void;
};

export const ProjectCaseModal = ({ project, contactHref, onClose }: ProjectCaseModalProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const current = project.gallery[Math.min(index, project.gallery.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/12 bg-[#0b0b0b]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0b0b0b]/95 p-5 backdrop-blur md:p-6">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#00ffcc]/75">{project.category}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{project.name}</h2>
            <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/40">{project.role}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 border border-white/15 p-2 text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="aspect-video overflow-hidden border border-white/10 bg-black">
              {current ? (
                <img
                  src={current.src}
                  alt={current.caption ?? project.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            {project.gallery.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {project.gallery.map((image, imageIndex) => (
                  <button
                    key={`${image.src}-${imageIndex}`}
                    type="button"
                    onClick={() => setIndex(imageIndex)}
                    className={`aspect-video overflow-hidden border bg-black transition-colors ${
                      imageIndex === index ? 'border-[#00ffcc]' : 'border-white/10 hover:border-white/35'
                    }`}
                  >
                    <img src={image.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-sm leading-7 text-white/70">{project.summary}</p>

            {project.problem ? (
              <div className="mt-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">Problema</p>
                <p className="mt-1 text-sm leading-6 text-white/60">{project.problem}</p>
              </div>
            ) : null}

            {project.steps && project.steps.length > 0 ? (
              <div className="mt-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">Como foi feito</p>
                <ul className="mt-2 space-y-2">
                  {project.steps.map((step) => (
                    <li key={step} className="flex gap-2 text-sm leading-6 text-white/60">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#00ffcc]" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.result ? (
              <div className="mt-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">Resultado</p>
                <p className="mt-1 text-sm leading-6 text-white/60">{project.result}</p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tech.map((item) => (
                <span key={item} className="border border-white/10 px-2.5 py-1.5 text-xs text-white/55">{item}</span>
              ))}
            </div>

            {project.statusNote ? (
              <p className="mt-5 border border-[#00ffcc]/20 bg-[#00ffcc]/[0.04] p-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#00ffcc]/80">
                {project.statusNote}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#ededed] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#00ffcc]"
                >
                  {project.urlLabel ?? 'Ver no site'}
                  <ArrowUpRight size={14} />
                </a>
              ) : null}
              <a
                href={contactHref}
                className="inline-flex items-center gap-2 border border-white/18 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
              >
                Falar sobre projeto
                <Mail size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
