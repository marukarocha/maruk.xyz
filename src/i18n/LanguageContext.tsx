import { useState, useEffect, type ReactNode } from 'react';
import { pt, en } from './translations';
import { LanguageContext, type Language } from './language-context';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  // Load language from localStorage or browser preference
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
      setLanguage(browserLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'pt' ? 'en' : 'pt';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    
    // Update HTML lang attribute
    document.documentElement.lang = newLang;
  };

  const t = language === 'pt' ? pt : en;

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
