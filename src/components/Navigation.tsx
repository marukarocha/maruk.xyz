import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { Link, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ];

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
        <div className="flex items-center justify-between h-16">
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
                className="text-sm font-mono tracking-[0.3em] text-white/60 hover:text-white/90 uppercase transition-colors duration-300"
              >
                Maruk
              </a>
            ) : (
              <Link
                to="/"
                className="text-sm font-mono tracking-[0.3em] text-white/60 hover:text-white/90 uppercase transition-colors duration-300"
              >
                Maruk
              </Link>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHome && navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
                className="text-[11px] font-mono text-white/35 hover:text-white/80 transition-colors duration-300 uppercase tracking-[0.15em]"
              >
                {item.label}
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
            >
              <Link
                to="/consultoria-informatica"
                className="text-[11px] font-mono text-cyan-200/70 hover:text-cyan-100 transition-colors duration-300 uppercase tracking-[0.15em]"
              >
                Suporte
              </Link>
            </motion.div>

            {/* Playground link */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                to="/playground"
                className="text-[11px] font-mono text-white/35 hover:text-white/80 transition-colors duration-300 uppercase tracking-[0.15em]"
              >
                Lab
              </Link>
            </motion.div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10" />

            {/* Language toggle */}
            <motion.button
              onClick={toggleLanguage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors duration-300 uppercase tracking-widest"
            >
              <Globe size={12} />
              <span>{language === 'pt' ? 'EN' : 'PT'}</span>
            </motion.button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <Globe size={12} />
              {language === 'pt' ? 'EN' : 'PT'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/50 hover:text-white/80 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.04]"
          >
            <div className="py-6 px-6 flex flex-col gap-4">
              {isHome && navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className="text-sm font-mono text-white/50 hover:text-white/90 transition-colors uppercase tracking-[0.2em] py-2"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/consultoria-informatica"
                onClick={() => setIsOpen(false)}
                className="text-sm font-mono text-cyan-200/70 hover:text-cyan-100 transition-colors uppercase tracking-[0.2em] py-2"
              >
                Suporte
              </Link>
              <Link
                to="/playground"
                onClick={() => setIsOpen(false)}
                className="text-sm font-mono text-white/50 hover:text-white/90 transition-colors uppercase tracking-[0.2em] py-2"
              >
                Lab
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
