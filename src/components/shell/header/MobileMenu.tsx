"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getMainNav, socialLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/i18n";
import { Arrow } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { trackWhatsapp } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M4 8h16M4 16h16"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A premium fullscreen mobile navigation.
 *
 * Editorial large-typography links (WORK / SERVICES / PROCESS / ABOUT /
 * INSIGHTS), a prominent START A PROJECT CTA, and social links — presented
 * as an extension of the brand over a deep near-black surface. Rendered as an
 * overlay with staggered reveals, body scroll lock, and focus trapping. The
 * trigger button and the language dropdown live in the header row.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const dict = useTranslations();
  const locale = useLocale();
  const navItems = getMainNav(dict, locale).slice(0, 5); // Work, Services, Process, About, Insights

  const toggle = () => setOpen((v) => !v);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Focus management: move focus in on open, restore to trigger on close.
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => firstFocusRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    menuButtonRef.current?.focus();
  }, [open]);

  // Escape to close + focus trap (Tab cycling).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const els = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (!els || els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label={open ? dict.common.close : dict.common.openMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/[.06] lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-mobile-menu"
            ref={panelRef}
            className="fixed inset-0 z-[1900] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: EASE }}
            style={{ backgroundColor: "rgba(3,4,5,0.98)" }}
            role="dialog"
            aria-modal="true"
            aria-label={dict.common.mainMenu}
          >
            {/* Ambient radial accent top-center */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(23,59,104,0.28),transparent)]"
            />

            <div className="relative flex h-full flex-col overflow-y-auto px-7 pb-10 pt-28">
              {/* Primary links — large editorial typography */}
              <nav
                className="flex flex-1 flex-col justify-center gap-1"
                aria-label={dict.common.mainMenu}
              >
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      delay: prefersReducedMotion ? 0 : 0.05 * i + 0.1,
                      ease: EASE,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-3 py-2.5"
                    >
                      <span className="text-xs font-medium tracking-[0.2em] text-muted-more">
                        0{i + 1}
                      </span>
                      <span className="text-4xl font-semibold tracking-tight text-foreground transition-all duration-200 group-hover:translate-x-2 group-hover:text-accent-soft sm:text-5xl">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.42,
                  ease: EASE,
                }}
                className="border-t border-border pt-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/${locale}/contact`}
                    ref={firstFocusRef}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-colors hover:bg-white/90"
                  >
                    {dict.nav.startAProject}
                    <span aria-hidden>→</span>
                  </Link>
                  <a
                    href={siteConfig.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsapp({ channel: "mobile_menu" });
                      setOpen(false);
                    }}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-border-strong px-6 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-soft"
                  >
                    {dict.nav.talkToUs}
                    <Arrow external />
                  </a>
                </div>
              </motion.div>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.52,
                }}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-2"
              >
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-sm text-muted transition-all duration-200 hover:-translate-y-px hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
