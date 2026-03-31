import { createContext } from 'react';
import { pt } from './translations';

export type Language = 'pt' | 'en';
export type Translations = typeof pt;

export interface LanguageContextType {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
