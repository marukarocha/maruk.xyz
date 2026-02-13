import { useRef, useLayoutEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { HeroBackgroundDarkLiquid } from '../components/HeroBackgroundDarkLiquid';
import Logo from '/images/logo.svg';
import gsap from 'gsap';
import { useLanguage } from '../i18n/LanguageContext';

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);
  
  const { t, language, toggleLanguage } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(logoRef.current, 
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      )
      .fromTo(titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.6"
      )
      .fromTo(descRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.8"
      )
      .fromTo(techRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      )
      // .fromTo(socialRef.current,
      //   { opacity: 0, y: 20 },
      //   { opacity: 1, y: 0, duration: 0.8 },
      //   "-=0.6"
      // )
      .fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.4"
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToNext = () => {
    const element = document.querySelector('#about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent" ref={containerRef}>
      {/* Background 3D Liquid Shading */}
      <HeroBackgroundDarkLiquid />
      
      {/* Overlay sutil de vinheta (opcional, para foco) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0a_100%)] opacity-60"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Logo animado */}
          <div className="mb-10">
            <img
              ref={logoRef}
              src={Logo}
              alt="Logo"
              className="w-[234px] md:w-[286px] opacity-0 invert brightness-0"
            />
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-bold tracking-tight text-[#ededed] mb-6 opacity-0 max-w-3xl"
          >
           {t.hero.title}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-8 leading-relaxed opacity-0 font-light"
          >
            {t.hero.description}
          </p>

          {/* Technical Line */}
          <div ref={techRef} className="text-xs md:text-sm font-mono text-[#555] mb-12 uppercase tracking-wide opacity-0">
             {t.hero.techStack}
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center mb-16 opacity-0">
            <a href="#about" className="btn-primary">
              {t.hero.cta1}
            </a>
            <a href="#contact" className="btn-secondary">
              {t.hero.cta2}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollRef}
          onClick={scrollToNext}
          aria-label="Scroll to About section"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#444] hover:text-[#ededed] transition-colors duration-300 opacity-0"
        >
          <ChevronDown size={28} strokeWidth={1} className="animate-bounce" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/80 hover:bg-white/20 transition-all duration-300"
        >
          <Globe size={14} />
          <span className="font-mono">{language === 'pt' ? 'EN' : 'PT'}</span>
        </button>
      </div>
    </section>
  );
};