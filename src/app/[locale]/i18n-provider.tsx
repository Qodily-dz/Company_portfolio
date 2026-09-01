"use client";

import { type ReactNode } from "react";
import { I18nContext } from "@/lib/i18n/use-translations";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  children: ReactNode;
  locale: Locale;
  dict: Dictionary;
};

export function I18nProvider({ children, locale, dict }: Props) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}
