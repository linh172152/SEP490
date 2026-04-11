import { create } from 'zustand';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

type Language = 'en' | 'vi';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, secondArg?: Record<string, string | number> | string) => string;
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
  t: (key, secondArg) => {
    const params = typeof secondArg === 'object' ? secondArg : undefined;
    const fallback = typeof secondArg === 'string' ? secondArg : undefined;

    const keys = key.split('.');
    let value = dictionaries[get().language];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    // Fallback to English if key missing in current language
    if (value === undefined && get().language !== 'en') {
      let fallbackDictValue = dictionaries['en'];
      for (const k of keys) {
        if (fallbackDictValue === undefined) break;
        fallbackDictValue = fallbackDictValue[k];
      }
      value = fallbackDictValue;
    }
    
    // Final result determination
    let result = (typeof value === 'string' ? value : (fallback || key)) as string;

    // Handle parameter replacement if params exist (only if result is from dictionary or fallback)
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        // Support both {key} and {{key}} formats
        const regex = new RegExp(`\\{?\\{${k}\\}\\}?`, 'g');
        result = result.replace(regex, String(v));
      });
    }

    return result;
  },
}));

// Initialize from localstorage
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
    useI18nStore.getState().setLanguage(savedLang);
  }
}
