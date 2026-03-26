import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Github, Box, Instagram } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();
  
  const socialLinks = [
    {
      icon: Github,
      name: 'GitHub',
      url: 'https://github.com/marukarocha/',
    },
    {
      icon: Box,
      name: 'Sketchfab',
      url: 'https://sketchfab.com/maruk.xyz',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://www.instagram.com/maruk.xyz/',
    }
  ];

  return (
    <section id="contact" className="min-h-screen flex items-center section-padding bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden">
        <iframe 
          src="https://player.vimeo.com/video/880236451?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1" 
          className="absolute top-1/2 left-1/2 w-[177.77777778vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 opacity-50 object-cover"
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
        ></iframe>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="container relative z-10 h-full flex items-center justify-center">
        <div className="max-w-4xl w-full text-center">
          
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-10"
          >
            <div className="mb-2">
              <h2 className="text-3xl md:text-6xl font-bold text-white leading-tight tracking-tight max-w-3xl mx-auto">
                {t.contact.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{t.contact.titleHighlight}</span>
              </h2>
            </div>

            {/* Email Link - Big & Bold */}
            <a 
              href="mailto:maruk.xyz@gmail.com" 
              className="group relative inline-flex items-center gap-3 text-xl md:text-3xl font-light text-[#ededed] hover:text-white transition-colors duration-300"
            >
              <span className="border-b border-white/20 pb-1 group-hover:border-white transition-all duration-300">maruk.xyz@gmail.com</span>
              <Mail className="w-5 h-5 md:w-6 md:h-6 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-6 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="p-3 rounded-full border border-white/10 text-white/40 hover:text-white/90 hover:border-white/30 transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
            
          </motion.div>

        </div>
      </div>
    </section>
  );
};