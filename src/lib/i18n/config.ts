export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
  ar: "ar_DZ",
};
export const rtlLocales: Locale[] = ["ar"];
export const dateLocales: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-DZ",
};

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

/** Coerces an unknown/string locale value to a valid Locale ("en" fallback). */
export function toLocale(value: string): Locale {
  return (locales as readonly string[]).includes(value)
    ? (value as Locale)
    : "en";
}
