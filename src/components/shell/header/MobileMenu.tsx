"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getMainNav, getPillars, socialLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import { trackWhatsapp } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

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
 * Rendered as an overlay with staggered editorial reveals, body scroll lock,
 * and focus trapping. Trigger button lives in the header.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const dict = useTranslations();
  const navItems = getMainNav(dict);
  const pillarItems = getPillars(dict);

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
        'a[href], button:not([disabled])'
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
        aria-label={open ? dict.common.close : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-white/[.06] md:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-mobile-menu"
            ref={panelRef}
            className="fixed inset-0 z-[1900] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            style={{ backgroundColor: "rgba(5,5,5,0.98)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
              <div className="flex flex-1 flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.35,
                      delay: prefersReducedMotion ? 0 : 0.06 * i + 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group block py-2 text-4xl font-medium tracking-tight text-foreground transition-colors hover:text-accent-soft"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Language switcher */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.28, duration: 0.4 }}
                className="mt-6"
              >
                <LanguageSwitcher />
              </motion.div>

              {/* Capability pillars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.32, duration: 0.4 }}
                className="mt-10 border-t border-border pt-6"
              >
                <div className="flex gap-6">
                  {pillarItems.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>

                <a
                  href="#contact"
                  ref={firstFocusRef}
                  onClick={() => setOpen(false)}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-white/90"
                >
                  {dict.nav.startAProject}
                  <span aria-hidden>→</span>
                </a>
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackWhatsapp({ channel: "mobile_menu" });
                    setOpen(false);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-border-strong px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-soft"
                >
                  {dict.nav.talkToUs}
                </a>
              </motion.div>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: 0.4 }}
                className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
              >
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-sm text-muted transition-colors hover:text-foreground"
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
