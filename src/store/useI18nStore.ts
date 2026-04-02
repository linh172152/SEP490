import { create } from 'zustand';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

type Language = 'en' | 'vi';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Language, any> = {
  en,
  vi,
};

export const useI18nStore = create<I18nState>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => {
    // Try to save to localStorage implicitly if window is available
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
    set({ language: lang });
  },
  t: (key) => {
    const keys = key.split('.');
    let value = dictionaries[get().language];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    // Fallback to English if key missing in VI
    if (value === undefined && get().language !== 'en') {
      let fallbackValue = dictionaries['en'];
      for (const k of keys) {
        if (fallbackValue === undefined) break;
        fallbackValue = fallbackValue[k];
      }
      return (typeof fallbackValue === 'string' ? fallbackValue : key) as string;
    }
    
    return typeof value === 'string' ? value : key;
  },
}));

// Initialize from localstorage
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
    useI18nStore.getState().setLanguage(savedLang);
  }
}
