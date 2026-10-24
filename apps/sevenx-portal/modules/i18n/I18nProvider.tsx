'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import mn from './mn.json';
import en from './en.json';

export type Locale = 'mn' | 'en';

type Dictionary = Record<string, string>;

const DICTIONARIES: Record<Locale, Dictionary> = { mn, en };

const LOCALE_KEY = 'sevenx.locale';

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (
  template: string,
  params?: Record<string, string | number>,
): string =>
  params
    ? template.replace(/\{(\w+)\}/g, (_, name: string) =>
        name in params ? String(params[name]) : `{${name}}`,
      )
    : template;

// --- tiny external store around localStorage so SSR renders `mn` and the
// client switches to the persisted locale after hydration without an effect.
const listeners = new Set<() => void>();

const readStoredLocale = (): Locale => {
  try {
    return window.localStorage.getItem(LOCALE_KEY) === 'en' ? 'en' : 'mn';
  } catch {
    return 'mn';
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const getServerSnapshot = (): Locale => 'mn';

const storeLocale = (next: Locale) => {
  try {
    window.localStorage.setItem(LOCALE_KEY, next);
  } catch {
    // storage unavailable: nothing persisted, listeners still re-read
  }
  listeners.forEach((l) => l());
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => storeLocale(next), []);

  const t = useCallback<TranslateFn>(
    (key, params) => {
      const template = DICTIONARIES[locale][key] ?? DICTIONARIES.mn[key] ?? key;
      return interpolate(template, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const useI18nContext = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useT must be used inside I18nProvider');
  }
  return ctx;
};

export const useT = (): TranslateFn => useI18nContext().t;

export const useLocale = (): Pick<I18nContextValue, 'locale' | 'setLocale'> => {
  const { locale, setLocale } = useI18nContext();
  return { locale, setLocale };
};
