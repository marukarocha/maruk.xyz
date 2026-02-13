import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
    { label: t.footer.nav.projects, href: '#projects' }, // Keeping projects link even if potentially unused/hidden
    { label: t.footer.nav.contact, href: '#contact' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Back to top button */}
          <motion.button
            onClick={scrollToTop}
            aria-label="Back to top"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition-all duration-300 mb-8 shadow-lg hover:shadow-xl"
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
            <h3 className="text-2xl font-bold gradient-text">
              Portfolio
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
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </motion.nav>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-px bg-gradient-to-r from-primary-500 to-purple-500 mx-auto mb-8"
          />

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm"
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