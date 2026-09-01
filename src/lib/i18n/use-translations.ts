"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./types";
import type { Locale } from "./config";

export type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nContext.Provider");
  return ctx;
}

/**
 * Shorthand: returns the full dictionary for the current locale.
 * Use in client components: `const t = useTranslations(); ... t.hero.headline1`
 */
export function useTranslations(): Dictionary {
  return useI18n().dict;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
