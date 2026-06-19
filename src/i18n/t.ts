import type { Locale, TranslationDict } from './locale';
import en from './en';
import ptBr from './pt-BR';

const dicts: Record<Locale, TranslationDict> = { en, 'pt-BR': ptBr };

let currentLocale: Locale = 'en';
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  listeners.forEach(fn => fn());
}

export function t(key: string): string {
  const parts = key.split('.');
  let value: unknown = dicts[currentLocale];
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
