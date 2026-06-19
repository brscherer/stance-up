export type Locale = 'en' | 'pt-BR';

export type TranslationDict = Record<string, string | Record<string, string | Record<string, string>>;
