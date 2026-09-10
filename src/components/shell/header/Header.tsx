"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { UnderlineFollow } from "@/components/interactions";
import { getMainNav } from "@/lib/navigation";
import { useTranslations, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Header — two states.
 *
 * TOP (scrollY <= 48): full-height (88px) transparent bar integrated with the
 * hero — full logo, text nav, language dropdown, START A PROJECT → CTA.
 *
 * SCROLLED: a gently compacted floating glass bar. Not icon-only and never
 * pushes content: the full logo stays, only slightly smaller, so it is never
 * cropped. Height ~64px, translucent blur + subtle border, CTA becomes the
 * compact "GET STARTED →" pill.
 */

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dict = useTranslations();
  const locale = useLocale();
  const navItems = getMainNav(dict, locale).slice(0, 5);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 48;
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
          height: scrolled ? 64 : 88,
          /* Slight inset when scrolled, but keep it essentially full width. */
          left: scrolled ? "max(0.75rem, env(safe-area-inset-left))" : "0px",
          right: scrolled ? "max(0.75rem, env(safe-area-inset-right))" : "0px",
          top: scrolled ? "max(0.5rem, env(safe-area-inset-top))" : "0px",
          borderRadius: scrolled ? 20 : 0,
          backgroundColor: scrolled
            ? "rgba(7,10,15,0.78)"
            : "rgba(3,4,5,0)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.35)"
            : "0 0 0 rgba(0,0,0,0)",
          borderColor: scrolled
            ? "rgba(39,50,71,0.6)"
            : "rgba(39,50,71,0)",
        }}
        transition={{ duration: dur, ease: EASE }}
        className={cn(
          "fixed inset-x-0 top-0 z-[1800] border",
          "transition-[backdrop-filter] duration-500",
          scrolled ? "backdrop-blur-xl" : "backdrop-blur-none",
        )}
        style={{ borderColor: "transparent" }}
      >
        <div
          className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-6 md:px-8 lg:px-12"
        >
          {/* LEFT — logo stays FULL, never icon-only or cropped */}
          <Link href={`/${locale}`} className="shrink-0" aria-label="Qodily-dz">
            <motion.span
              animate={{ scale: scrolled ? 0.9 : 1 }}
              transition={{ duration: dur, ease: EASE }}
              className="flex origin-left items-center"
            >
              <Logo
                showWordmark={true}
                markClassName={scrolled ? "h-6 w-auto" : "h-7 w-auto"}
                className={scrolled ? "gap-2" : "gap-2.5"}
              />
            </motion.span>
          </Link>

          {/* CENTER — nav links */}
          <nav
            className="hidden items-center lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <UnderlineFollow
                key={item.href}
                href={item.href}
                className={cn(
                  "font-medium transition-colors hover:text-foreground hover:-translate-y-px",
                  scrolled
                    ? "px-3 py-1 text-[13px] text-foreground-soft"
                    : "px-3.5 py-1.5 text-sm text-muted",
                )}
              >
                {item.label}
              </UnderlineFollow>
            ))}
          </nav>

          {/* RIGHT — language + CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageSwitcher />

            <motion.div
              animate={{ scale: scrolled ? 0.94 : 1 }}
              transition={{ duration: dur, ease: EASE }}
              className="hidden sm:block"
            >
              <Link
                href={`/${locale}/contact`}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full transition-all duration-300",
                  scrolled
                    ? "h-9 px-5 text-xs font-semibold bg-foreground text-background hover:bg-white/90"
                    : "h-10 px-6 text-sm font-medium border border-border-strong text-foreground hover:border-accent hover:text-accent-soft",
                )}
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
        </div>
      </motion.header>
    </>
  );
}