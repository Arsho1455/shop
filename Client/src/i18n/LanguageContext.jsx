import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations.js';

export const SUPPORTED_LANGUAGES = ['hy', 'ru', 'en'];
export const LANGUAGE_STORAGE_KEY = 'phoneshop-language';

export function countLabel(number, language, kind = 'products') {
  if (language === 'hy') return kind === 'reviews' ? 'գնահատական' : 'ապրանք';
  if (language === 'en') return kind === 'reviews' ? (number === 1 ? 'review' : 'reviews') : (number === 1 ? 'product' : 'products');
  const last = Math.abs(number) % 10;
  const lastTwo = Math.abs(number) % 100;
  const form = lastTwo >= 11 && lastTwo <= 14 ? 2 : last === 1 ? 0 : last >= 2 && last <= 4 ? 1 : 2;
  const labels = kind === 'reviews' ? ['отзыв', 'отзыва', 'отзывов'] : ['товар', 'товара', 'товаров'];
  return labels[form];
}

function savedLanguage() {
  try {
    // Verification links can carry a safe locale hint (no credentials in query string).
    const fromLink = window.location.pathname === '/verify-email' ? new URLSearchParams(window.location.search).get('lang') : null;
    if (SUPPORTED_LANGUAGES.includes(fromLink)) return fromLink;
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(value) ? value : 'hy';
  } catch { return 'hy'; }
}

let currentLanguage = savedLanguage();
export function translate(text, language = currentLanguage) {
  if (text == null || language === 'hy') return text;
  return translations[language]?.[text] ?? text;
}

const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(savedLanguage);
  useEffect(() => {
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = translate('PhoneShop | Քո սմարթֆոնների աշխարհը', language);
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate('PhoneShop — բացահայտիր ժամանակակից սմարթֆոններ, պահպանիր նախընտրածներդ և կառավարիր զամբյուղդ քո հաշվում։', language));
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Storage may be disabled. */ }
  }, [language]);
  const value = useMemo(() => ({
    language,
    setLanguage: (next) => { if (SUPPORTED_LANGUAGES.includes(next)) { currentLanguage = next; setLanguage(next); } },
    t: (text) => translate(text, language),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be called inside LanguageProvider');
  return context;
}
