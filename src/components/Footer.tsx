import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const navItems = [
    { label: t.footer.nav.home, href: '#home' },
    { label: t.footer.nav.about, href: '#about' },
    { label: t.footer.nav.skills, href: '#skills' },
    { label: 'Process', href: '#process' },
    { label: t.footer.nav.contact, href: '#contact' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white py-12 relative border-t border-white/[0.04]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Back to top button */}
          <motion.button
            onClick={scrollToTop}
            aria-label="Back to top"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/30 text-white/40 hover:text-white/80 transition-all duration-300 mb-8"
          >
            <ArrowUp size={20} />
          </motion.button>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-sm font-mono tracking-[0.3em] text-white/60 uppercase">
              Maruk
            </h3>
          </motion.div>

          {/* Navigation Links */}
          <motion.nav
            aria-label="Footer Navigation"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/30 hover:text-white/70 text-xs font-mono uppercase tracking-[0.15em] transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/consultoria-informatica"
              className="text-cyan-200/60 hover:text-cyan-100 text-xs font-mono uppercase tracking-[0.15em] transition-colors duration-300"
            >
              Suporte
            </Link>
          </motion.nav>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-px bg-white/10 mx-auto mb-8"
          />

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/20 text-xs font-mono"
          >
           <p className="flex items-center justify-center gap-2 flex-wrap">
              © {currentYear} Maruk. {t.footer.rights}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </footer>
  );
};
