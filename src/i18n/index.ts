import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Apply initial language settings (font and RTL)
const applyLanguageSettings = (lang: string) => {
  const selectedLang = languages.find(l => l.code === lang);
  document.documentElement.dir = selectedLang?.rtl ? 'rtl' : 'ltr';
  document.documentElement.classList.remove('font-ar', 'font-zh', 'font-default');
  if (lang === 'ar') {
    document.documentElement.classList.add('font-ar');
  } else if (lang === 'zh') {
    document.documentElement.classList.add('font-zh');
  } else {
    document.documentElement.classList.add('font-default');
  }
};

// Apply on init
applyLanguageSettings(i18n.language);

// Apply on language change
i18n.on('languageChanged', applyLanguageSettings);

export default i18n;
