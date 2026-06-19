import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from './locale';
import { getLocale, setLocale, subscribe, t } from './t';

interface LocaleContextValue {
  locale: Locale;
  toggle: () => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('stance-up-locale') as Locale | null;
    if (saved === 'pt-BR') {
      setLocale(saved);
    }
    document.documentElement.lang = getLocale();
    return subscribe(() => {
      document.documentElement.lang = getLocale();
      forceUpdate(n => n + 1);
    });
  }, []);

  const toggle = () => {
    const next: Locale = getLocale() === 'en' ? 'pt-BR' : 'en';
    setLocale(next);
    localStorage.setItem('stance-up-locale', next);
    document.documentElement.lang = next;
  };

  return (
    <LocaleContext.Provider value={{ locale: getLocale(), toggle, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function LocaleToggle() {
  const { locale, toggle } = useLocale();
  return (
    <button
      onClick={toggle}
      className="locale-toggle"
      aria-label={locale === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
      title={locale === 'en' ? 'Português' : 'English'}
    >
      {locale === 'en' ? 'PT' : 'EN'}
    </button>
  );
}
