import { useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { HeroShell } from '../HeroShell';
import gsap from 'gsap';
import { useLanguage } from '../../../i18n/useLanguage';

/**
 * HeroSplit — layout editorial esquerda / direita.
 * Esquerda: eyebrow + título grande + descrição + CTAs.
 * Direita: 3 capability cards (baseados nos slides da seção About).
 */
export const HeroSplit = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef   = useRef<HTMLParagraphElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const descRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const cardsRef     = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLButtonElement>(null);

  const { t } = useLanguage();
  const slides = t.about.slides as { title: string; description: string }[];

  // Break title on dots for a poster-style stack
  const titleSegments = t.hero.title.split('.').map(s => s.trim()).filter(Boolean);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cardChildren = cardsRef.current?.children
        ? Array.from(cardsRef.current.children)
        : [];

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Left column enters from left
      tl.fromTo(eyebrowRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.7 })
        .fromTo(titleRef.current,
          { opacity: 0, x: -36 },
          { opacity: 1, x: 0, duration: 1 }, '-=0.4')
        .fromTo(descRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.8 }, '-=0.6')
        .fromTo(ctaRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.7 }, '-=0.5')
        // Right cards enter from right with stagger
        .fromTo(cardChildren,
          { opacity: 0, x: 36 },
          { opacity: 1, x: 0, duration: 0.7, stagger: 0.14 }, '-=0.9')
        .fromTo(scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 }, '-=0.3');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <HeroShell>
      <div
        ref={containerRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"
      >
        {/* Two-column grid — centered vertically by HeroShell's flex */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center min-h-screen py-28 md:py-0">

          {/* ── LEFT ─────────────────────────────────── */}
          <div className="flex flex-col">

            {/* Eyebrow */}
            <p
              ref={eyebrowRef}
              className="text-[10px] font-mono text-[#444] uppercase tracking-[0.35em] mb-7 opacity-0"
            >
              {t.hero.smallLine}
            </p>

            {/* Poster-style title — one segment per line */}
            <h1
              ref={titleRef}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#ededed] leading-[1.0] mb-8 opacity-0"
            >
              {titleSegments.map((seg, i) => (
                <span key={i} className="block">
                  {seg}
                  <span className="text-[#2a2a2a]">.</span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <p
              ref={descRef}
              className="text-[#777] font-light leading-relaxed mb-10 max-w-sm opacity-0"
            >
              {t.hero.description}
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
              <a href="#about"   className="btn-primary">{t.hero.cta1}</a>
              <a href="#contact" className="btn-secondary">{t.hero.cta2}</a>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────── */}
          <div
            ref={cardsRef}
            className="flex flex-col border-l border-[#161616]"
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="opacity-0 pl-8 py-8 border-b border-[#161616] last:border-b-0
                           group hover:bg-white/[0.025] transition-colors duration-300 cursor-default"
              >
                <span className="block text-[10px] font-mono text-[#272727] tracking-widest mb-2
                                 group-hover:text-[#444] transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-semibold text-[#888] mb-2
                               group-hover:text-[#ededed] transition-colors duration-300">
                  {slide.title}
                </h3>
                <p className="text-[13px] text-[#3c3c3c] font-light leading-relaxed
                              group-hover:text-[#666] transition-colors duration-300">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollRef}
          onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to About section"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5
                     text-[#2a2a2a] hover:text-[#ededed] transition-colors duration-300 opacity-0"
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase">scroll</span>
          <ChevronDown size={14} strokeWidth={1} className="animate-bounce" />
        </button>
      </div>
    </HeroShell>
  );
};
