import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { HeroShell } from '../HeroShell';
import Logo from '/images/logo.svg';
import gsap from 'gsap';
import { useLanguage } from '../../../i18n/LanguageContext';

/** Typewriter hook — types each line character by character. */
function useTypewriter(lines: string[], charSpeed = 26) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let active  = true;

    setVisibleLines([]);
    setIsDone(false);

    const tick = () => {
      if (!active) return;
      if (lineIdx >= lines.length) { setIsDone(true); return; }

      const line = lines[lineIdx];

      if (charIdx <= line.length) {
        setVisibleLines(prev => {
          const next = [...prev];
          next[lineIdx] = line.slice(0, charIdx);
          return next;
        });
        charIdx++;
        timer = window.setTimeout(tick, line.trim() === '' ? 380 : charSpeed);
      } else {
        lineIdx++;
        charIdx = 0;
        timer = window.setTimeout(tick, 260);
      }
    };

    // Small initial pause for dramatic effect
    let timer = window.setTimeout(tick, 650);
    return () => { active = false; clearTimeout(timer); };
  // Re-run only when the lines source changes (language switch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lines)]);

  return { visibleLines, isDone };
}

/**
 * HeroTerminal — sequência de typewriter seguida de título + CTAs.
 * Evoca um boot de terminal, depois revela o conteúdo principal.
 */
export const HeroTerminal = () => {
  const { t } = useLanguage();

  const lines = t.hero.terminalLines as string[];
  const { visibleLines, isDone } = useTypewriter(lines);

  const headerRef = useRef<HTMLDivElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);

  // Header fades in on mount
  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 }
    );
  }, []);

  // Content reveals when typing finishes
  useEffect(() => {
    if (!isDone) return;
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    );
    gsap.fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.55 }
    );
  }, [isDone]);

  return (
    <HeroShell>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-2xl">

        {/* Logo + label header */}
        <div ref={headerRef} className="flex items-center gap-3 mb-12 opacity-0">
          <img src={Logo} alt="Logo" className="w-7 h-7 invert brightness-0" />
          <span className="font-mono text-[10px] text-[#2e2e2e] tracking-[0.32em] uppercase">
            maruk.xyz — terminal
          </span>
        </div>

        {/* Typewriter lines */}
        <div className="font-mono text-sm md:text-[15px] space-y-2.5 mb-10">
          {visibleLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3 leading-relaxed min-h-[1.5em]">
              {line.trim() !== '' && (
                <span className="text-[#252525] select-none mt-px flex-shrink-0">›</span>
              )}
              <span className={line.trim() === '' ? 'block h-3' : 'text-[#686868]'}>
                {line}
                {/* Blinking cursor on the currently typing line */}
                {i === visibleLines.length - 1 && !isDone && (
                  <span className="inline-block w-[2px] h-[1em] bg-[#444] ml-[2px] align-middle animate-cursor-blink" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Title + description + CTAs — revealed after typing */}
        <div ref={ctaRef} className="opacity-0">
          <div className="w-12 h-px bg-[#1c1c1c] mb-8" />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#ededed] mb-5 leading-[1.06]">
            {t.hero.title}
          </h1>

          <p className="text-[#5c5c5c] font-light leading-relaxed mb-10 max-w-lg text-base">
            {t.hero.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#about"   className="btn-primary">{t.hero.cta1}</a>
            <a href="#contact" className="btn-secondary">{t.hero.cta2}</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollRef}
          onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to About section"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5
                     text-[#2a2a2a] hover:text-[#ededed] transition-colors duration-300 opacity-0"
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase">scroll</span>
          <ChevronDown size={14} strokeWidth={1} className="animate-bounce" />
        </button>
      </div>
    </HeroShell>
  );
};
