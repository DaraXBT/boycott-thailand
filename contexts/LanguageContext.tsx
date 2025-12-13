
import React, { createContext, useContext, useState } from 'react';
import { translations, Language, getCategoryTranslationKey } from '../translations';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en'], params?: {[key: string]: string | number}) => string;
  getCategoryLabel: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('km');

  const toggleLanguage = () => {
    setLang(prev => prev === 'km' ? 'en' : 'km');
  };

  const t = (key: keyof typeof translations['en'], params?: {[key: string]: string | number}) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const getCategoryLabel = (category: string) => {
    const key = getCategoryTranslationKey(category);
    // @ts-ignore
    return t(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t, getCategoryLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
