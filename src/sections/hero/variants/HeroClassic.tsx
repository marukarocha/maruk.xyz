import { useRef, useLayoutEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { HeroShell } from '../HeroShell';
import gsap from 'gsap';
import { useLanguage } from '../../../i18n/useLanguage';

/**
 * HeroClassic — the original hero.
 * Centered logo → title → description → tech stack → CTAs.
 */
export const HeroClassic = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const roleRef      = useRef<HTMLParagraphElement>(null);
  const descRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLButtonElement>(null);

  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(roleRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.65 })
        .fromTo(titleRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.95 }, '-=0.45')
        .fromTo(descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 }, '-=0.55')
        .fromTo(ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.75 }, '-=0.45')
        .fromTo(scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 }, '-=0.4');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <HeroShell>
      <div
        ref={containerRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center pt-24 pb-20 text-center md:pt-28">
          <p
            ref={roleRef}
            className="mb-5 max-w-[19rem] text-[10px] font-mono uppercase leading-loose tracking-[0.22em] text-white/45 opacity-0 sm:max-w-2xl sm:text-[11px] sm:tracking-[0.28em]"
          >
            {t.hero.smallLine}
          </p>

          {/* Title */}
          <h1
            ref={titleRef}
            className="mb-6 max-w-[22rem] text-[2.65rem] font-semibold leading-[1.04] tracking-tight text-[#ededed] opacity-0 sm:max-w-4xl sm:text-6xl sm:leading-[0.98] md:text-7xl"
          >
            {t.hero.title}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="mx-auto mb-8 max-w-[21rem] text-base font-light leading-relaxed text-[#a1a1aa] opacity-0 sm:max-w-2xl md:text-xl"
          >
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col justify-center gap-3 opacity-0 sm:flex-row">
            <a href="#skills" className="btn-primary gap-2">
              {t.hero.cta1}
              <ArrowRight size={16} strokeWidth={1.8} />
            </a>
            <a href="#contact" className="btn-secondary">{t.hero.cta2}</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollRef}
          onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to About section"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 opacity-0 transition-colors duration-300 hover:text-[#ededed]"
        >
          <ChevronDown size={28} strokeWidth={1} className="animate-bounce" />
        </button>
      </div>
    </HeroShell>
  );
};
