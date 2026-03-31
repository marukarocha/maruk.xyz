import { useRef, useLayoutEffect } from 'react';
import { ChevronDown, Github, Box, Instagram } from 'lucide-react';
import { HeroShell } from '../HeroShell';
import Logo from '/images/logo.svg';
import gsap from 'gsap';
import { useLanguage } from '../../../i18n/useLanguage';

const SOCIAL = [
  { Icon: Github,    href: 'https://github.com/marukarocha/',     label: 'GitHub' },
  { Icon: Box,       href: 'https://sketchfab.com/maruk.xyz',      label: 'Sketchfab' },
  { Icon: Instagram, href: 'https://www.instagram.com/maruk.xyz/', label: 'Instagram' },
];

/**
 * HeroStagger — badge de disponibilidade + entrada palavra-a-palavra + stats + social links.
 */
export const HeroStagger = () => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const logoRef       = useRef<HTMLImageElement>(null);
  const badgeRef      = useRef<HTMLAnchorElement>(null);
  const roleRef       = useRef<HTMLParagraphElement>(null);
  const titleWordsRef = useRef<HTMLSpanElement[]>([]);
  const descRef       = useRef<HTMLParagraphElement>(null);
  const dividerRef    = useRef<HTMLDivElement>(null);
  const techRef       = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const socialRef     = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef<HTMLButtonElement>(null);

  const { t } = useLanguage();
  const titleWords = t.hero.title.split(' ');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const statsChildren = statsRef.current?.children
        ? Array.from(statsRef.current.children)
        : [];
      const socialChildren = socialRef.current?.children
        ? Array.from(socialRef.current.children)
        : [];

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(logoRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1 })
        .fromTo(badgeRef.current,
          { opacity: 0, y: 12, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }, '-=0.4')
        .fromTo(roleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
        .fromTo(titleWordsRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, '-=0.35')
        .fromTo(descRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9 }, '-=0.3')
        .fromTo(dividerRef.current,
          { scaleX: 0, transformOrigin: 'center' },
          { scaleX: 1, duration: 0.8 }, '-=0.5')
        .fromTo(techRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo(statsChildren,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .fromTo(ctaRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
        .fromTo(socialChildren,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Logo */}
          <div className="mb-8">
            <img
              ref={logoRef}
              src={Logo}
              alt="Logo"
              className="w-[190px] md:w-[240px] opacity-0 invert brightness-0"
            />
          </div>

          {/* Availability badge */}
          <a
            ref={badgeRef}
            href="#contact"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#222] bg-[#111]/80 text-[11px] font-mono text-[#666] hover:text-[#ededed] hover:border-[#444] transition-all duration-300 mb-5 opacity-0 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            {t.hero.available}
          </a>

          {/* Eyebrow / role */}
          <p
            ref={roleRef}
            className="text-[11px] md:text-xs font-mono text-[#444] uppercase tracking-[0.3em] mb-6 opacity-0"
          >
            {t.hero.smallLine}
          </p>

          {/* Title — word-by-word stagger */}
          <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-bold tracking-tight text-[#ededed] mb-6 max-w-4xl leading-[1.05]">
            {titleWords.map((word, i) => (
              <span
                key={i}
                ref={el => { if (el) titleWordsRef.current[i] = el; }}
                className="inline-block opacity-0 mr-[0.22em] last:mr-0"
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-base md:text-lg text-[#888] max-w-xl mx-auto mb-8 leading-relaxed opacity-0 font-light"
          >
            {t.hero.description}
          </p>

          {/* Thin divider */}
          <div
            ref={dividerRef}
            className="w-24 h-px bg-[#222] mb-6"
            style={{ transform: 'scaleX(0)' }}
          />

          {/* Tech stack */}
          <div
            ref={techRef}
            className="text-[11px] font-mono text-[#3a3a3a] mb-10 uppercase tracking-[0.18em] opacity-0"
          >
            {t.hero.techStack}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex items-center gap-10 mb-10">
            {(t.hero.stats ?? []).map((stat: { value: string; label: string }, i: number) => (
              <div key={i} className="flex flex-col items-center gap-0.5 opacity-0">
                <span className="text-2xl font-bold text-[#ededed] tracking-tight leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-10 opacity-0">
            <a href="#about"   className="btn-primary">{t.hero.cta1}</a>
            <a href="#contact" className="btn-secondary">{t.hero.cta2}</a>
          </div>

          {/* Social links */}
          <div ref={socialRef} className="flex items-center gap-6">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-[#333] hover:text-[#ededed] transition-colors duration-300"
              >
                <Icon size={17} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollRef}
          onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to About section"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#2e2e2e] hover:text-[#ededed] transition-colors duration-300 opacity-0"
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase">scroll</span>
          <ChevronDown size={14} strokeWidth={1} className="animate-bounce" />
        </button>
      </div>
    </HeroShell>
  );
};
