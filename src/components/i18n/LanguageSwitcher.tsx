"use client";

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const pathname = usePathname();

  function getLocalePath(locale: Locale): string {
    const segments = pathname.split("/");
    const first = segments[1];
    if (first && (locales as readonly string[]).includes(first)) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    const joined = segments.join("/");
    return joined === `/${locale}` ? `/${locale}` : joined;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {locales.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <a
            key={locale}
            href={getLocalePath(locale)}
            className={cn(
              "px-2 py-1 text-xs font-medium uppercase tracking-wider transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-more hover:text-muted"
            )}
            aria-label={`Switch to ${localeNames[locale]}`}
            lang={locale}
          >
            {localeNames[locale]}
          </a>
        );
      })}
    </div>
  );
}
