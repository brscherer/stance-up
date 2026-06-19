export type Locale = 'en' | 'pt-BR';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}
