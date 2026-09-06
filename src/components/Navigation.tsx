import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { Link, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navItems = language === 'pt'
    ? [
        { label: 'Início', href: '#home' },
        { label: 'Serviços', href: '#skills' },
        { label: 'Processo', href: '#process' },
        { label: 'Contato', href: '#contact' },
      ]
    : [
        { label: 'Home', href: '#home' },
        { label: 'Services', href: '#skills' },
        { label: 'Process', href: '#process' },
        { label: 'Contact', href: '#contact' },
      ];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Smart scroll: for pinned sections, scroll to the point where
  // the interaction actually begins (not the raw element top)
  const scrollToSection = useCallback((href: string) => {
    setIsOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;

    // Find the PINNED ScrollTrigger associated with this section
    const triggers = ScrollTrigger.getAll();
    const sectionTrigger = triggers.find(st => {
      if (!st.vars.pin) return false; // only care about pinned triggers
      const trigger = st.vars.trigger;
      if (trigger instanceof HTMLElement) return trigger.id === id || trigger.closest(`#${id}`) !== null;
      if (typeof trigger === 'string') return trigger === `#${id}` || trigger === href;
      return false;
    });

    if (sectionTrigger) {
      const pinStart = sectionTrigger.start;
      const pinRange = sectionTrigger.end - sectionTrigger.start;

      // Section-specific offsets tuned to where content is actually visible:
      // About (2400px range): slide 1 fades in at timeline 0→1 / 18 units → ~25% lands mid-reading
      // Process (4500px range): intro title visible ~0.3 / 8 units → ~5% shows the title moment
      const offsets: Record<string, number> = {
        about: 0.25,
        process: 0.05,
      };
      const fraction = offsets[id] ?? 0.15;
      window.scrollTo({ top: pinStart + pinRange * fraction, behavior: 'smooth' });
    } else {
      // Non-pinned sections: normal scroll with a small offset for nav clearance
      const top = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 left-0 w-full z-50 bg-transparent"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isHome ? (
              <a
                href="#home"
                onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
                className="text-sm font-mono tracking-[0.3em] text-white/70 hover:text-white/90 uppercase transition-colors duration-300"
              >
                Maruk
              </a>
            ) : (
              <Link
                to="/"
                className="text-sm font-mono tracking-[0.3em] text-white/70 hover:text-white/90 uppercase transition-colors duration-300"
              >
                Maruk
              </Link>
            )}
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/40 transition-colors hover:text-white/70"
            >
              <Globe size={12} />
              {language === 'pt' ? 'EN' : 'PT'}
            </button>
            <button
              type="button"
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isOpen}
              aria-controls="main-navigation-overlay"
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-[120] flex h-11 w-11 items-center justify-center text-white/60 transition-colors hover:text-white"
            >
              {isOpen ? <X size={26} strokeWidth={1.6} /> : <Menu size={28} strokeWidth={1.7} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="main-navigation-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Navegação principal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050505]/96 px-5 py-20 backdrop-blur-xl"
          >
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-px w-full origin-left bg-white/15"
            />
            <motion.div
              aria-hidden="true"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-8 top-0 hidden h-full w-px origin-top bg-white/[0.08] md:block"
            />

            <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.42, delay: 0.08 }}
                className="mb-7 font-mono text-[10px] uppercase tracking-[0.34em] text-white/35"
              >
                Maruk / menu
              </motion.p>

              <nav className="w-full text-center">
                {isHome && navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -22 }}
                    transition={{
                      duration: 0.48,
                      delay: index * 0.07 + 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                    className="group flex w-full items-baseline justify-center gap-4 border-b border-white/[0.07] py-4 text-center md:gap-7 md:py-5"
                  >
                    <span className="text-[0.62rem] font-medium tracking-[0.2em] text-[#00ffcc]/55">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-4xl font-light text-white transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-[#00ffcc] sm:text-5xl md:text-7xl">
                      {item.label}
                    </span>
                  </motion.a>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{
                    duration: 0.48,
                    delay: (isHome ? navItems.length : 0) * 0.07 + 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    to="/playground"
                    onClick={() => setIsOpen(false)}
                    className="group flex w-full items-baseline justify-center gap-4 py-4 text-center md:gap-7 md:py-5"
                  >
                    <span className="text-[0.62rem] font-medium tracking-[0.2em] text-[#00ffcc]/55">
                      {String((isHome ? navItems.length : 0) + 1).padStart(2, '0')}
                    </span>
                    <span className="text-4xl font-light text-white transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-[#00ffcc] sm:text-5xl md:text-7xl">
                      Lab
                    </span>
                  </Link>
                </motion.div>
              </nav>

              <motion.a
                href="#contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.42 }}
                onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
                className="mt-8 inline-flex items-center gap-3 border-b border-[#00ffcc]/45 pb-2 text-sm font-medium text-white transition-colors hover:text-[#00ffcc] md:mt-10 md:text-base"
              >
                {language === 'pt' ? 'Começar um projeto' : 'Start a project'}
                <ArrowRight size={17} strokeWidth={1.7} />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
