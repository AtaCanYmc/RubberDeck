import { de } from './de';
import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';
import { tr } from './tr';

export type Locale = 'en' | 'tr' | 'de' | 'fr' | 'es';

export const LOCALES: readonly { readonly id: Locale; readonly label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'tr', label: 'TR' },
  { id: 'de', label: 'DE' },
  { id: 'fr', label: 'FR' },
  { id: 'es', label: 'ES' },
];

export const MESSAGES: Record<Locale, Messages> = {
  en,
  tr,
  de,
  fr,
  es,
};
