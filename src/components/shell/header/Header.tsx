"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Logo } from "@/components/brand/Logo";
import { UnderlineFollow } from "@/components/interactions";
import { getMainNav } from "@/lib/navigation";
import { useTranslations, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Header — two-state responsive navigation bar.
 *
 * STATE A (top, scrollY <= 40): tall + transparent, integrated with the hero.
 * Full "Qodily-dz" logo with wordmark, clean text nav links, a large outline
 * CTA, and the language dropdown.
 *
 * STATE B (scrolled): a compact floating command bar — reduced height/padding,
 * icon-only logo, a small pill CTA, and a dark translucent backdrop-blurred
 * surface with a subtle border + shadow.
 *
 * The transition (height/padding, logo contraction, link tightening, CTA
 * shrink, glass surface) is one continuous 300–500ms spring-like animation.
 * The navbar never hides while scrolling.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dict = useTranslations();
  const locale = useLocale();
  const navItems = getMainNav(dict, locale).slice(0, 5); // Work, Services, Process, About, Insights

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 40;
      setScrolled((prev) => (prev === past ? prev : past));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dur = prefersReducedMotion ? 0 : 0.4;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {dict.common.skipToContent}
      </a>

      <motion.header
        initial={false}
        animate={{
          height: scrolled ? 60 : 96,
          left: scrolled ? "max(1rem, env(safe-area-inset-left))" : "0px",
          right: scrolled ? "max(1rem, env(safe-area-inset-right))" : "0px",
          top: scrolled ? "max(0.75rem, env(safe-area-inset-top))" : "0px",
          borderRadius: scrolled ? 16 : 0,
          backgroundColor: scrolled
            ? "rgba(7,10,15,0.78)"
            : "rgba(3,4,5,0)",
          boxShadow: scrolled
            ? "0 10px 30px rgba(0,0,0,0.4)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: dur, ease: EASE }}
        className={cn(
          "fixed inset-x-0 top-0 z-[1800] transition-[backdrop-filter] duration-500",
          scrolled
            ? "backdrop-blur-xl border border-border-strong"
            : "backdrop-blur-none border-b"
        )}
        style={{
          borderColor: scrolled
            ? "rgba(39,50,71,0.9)"
            : "rgba(39,50,71,0)",
        }}
      >
        <Container
          className={cn(
            "flex h-full items-center justify-between gap-3",
            scrolled
              ? "px-3 sm:px-4 lg:px-5"
              : "px-4 sm:px-6 md:px-8 lg:px-10"
          )}
        >
          {/* LEFT — logo (full -> icon) */}
          <Link href={`/${locale}`} className="shrink-0" aria-label="Qodily-dz">
            <span className="relative flex items-center">
              <AnimatePresence initial={false} mode="popLayout">
                {scrolled ? (
                  <motion.span
                    key="icon"
                    initial={{ opacity: 0, scale: 0.7, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                    exit={{ opacity: 0, scale: 0.7, width: 0 }}
                    transition={{ duration: dur, ease: EASE }}
                    className="flex overflow-hidden"
                  >
                    <Logo showWordmark={false} markClassName="h-6 w-auto" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="full"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.08 }}
                    transition={{ duration: dur, ease: EASE }}
                    className="flex"
                  >
                    <Logo markClassName="h-7 w-auto" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </Link>

          {/* CENTER — clean text nav */}
          <nav
            className="hidden items-center gap-6 xl:gap-8 lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <UnderlineFollow
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted transition-all duration-200 hover:text-foreground hover:-translate-y-px"
              >
                {item.label}
              </UnderlineFollow>
            ))}
          </nav>

          {/* RIGHT — language dropdown + CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <motion.div
              animate={{ scale: scrolled ? 0.92 : 1 }}
              transition={{ duration: dur, ease: EASE }}
              className="hidden sm:block"
            >
              <Link
                href={`/${locale}/contact`}
                data-cursor="button"
                className={
                  scrolled
                    ? "group inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-colors hover:bg-white/90"
                    : "group inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-6 text-sm font-medium text-foreground transition-all hover:border-accent hover:text-accent-soft"
                }
              >
                <span>{scrolled ? dict.nav.getStarted : dict.nav.startAProject}</span>
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </motion.div>

            <MobileMenu />
          </div>
        </Container>
      </motion.header>
    </>
  );
}
