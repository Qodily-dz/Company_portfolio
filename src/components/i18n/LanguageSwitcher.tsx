"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

/**
 * LanguageSwitcher — a single dropdown.
 * Displays the active locale (e.g. "EN ▾") and opens a small menu with
 * EN / FR / AR. Works the same on desktop and mobile, honours reduced motion,
 * and closes on Escape / outside click.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-3 text-xs font-semibold uppercase tracking-wider transition-colors",
          "text-muted hover:border-border-strong hover:text-foreground"
        )}
      >
        {localeNames[currentLocale]}
        <svg
          viewBox="0 0 12 12"
          className={cn(
            "h-2.5 w-2.5 transition-transform duration-200",
            open && "rotate-180"
          )}
          fill="none"
          aria-hidden
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Language"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: reduced ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-[2000] mt-2 w-28 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1"
          >
            {locales.map((locale) => {
              const isActive = locale === currentLocale;
              return (
                <Link
                  key={locale}
                  href={getLocalePath(locale)}
                  role="menuitem"
                  scroll={false}
                  lang={locale}
                  onClick={() => setOpen(false)}
                  aria-label={`Switch to ${localeNames[locale]}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                    isActive
                      ? "bg-white/[.06] text-foreground"
                      : "text-muted hover:bg-white/[.04] hover:text-foreground"
                  )}
                >
                  {localeNames[locale]}
                  {isActive && (
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
