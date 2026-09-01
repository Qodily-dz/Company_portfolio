"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Logo } from "@/components/brand/Logo";
import { getMainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/i18n";
import { trackWhatsapp } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dict = useTranslations();
  const locale = useLocale();
  const navItems = getMainNav(dict);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 24;
      setScrolled((prev) => (prev === past ? prev : past));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        height: scrolled ? 60 : 80,
        backgroundColor: scrolled
          ? "rgba(8,8,8,0.72)"
          : "rgba(5,5,5,0)",
        borderColor: scrolled ? "rgba(28,28,31,0.9)" : "rgba(28,28,31,0)",
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-x-0 top-0 z-[1800] border-b backdrop-blur-md"
      style={{ borderBottomWidth: 1 }}
    >
      <Container className="flex h-full items-center justify-between">
        <Link href={`/${locale}`} className="shrink-0">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden md:flex" />
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsapp({ channel: "header" })}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            {dict.nav.talkToUs}
          </a>
          <Link
            href="#contact"
            data-cursor="button"
            className={cn(
              "group hidden items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-soft sm:inline-flex"
            )}
          >
            {dict.nav.startAProject}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <MobileMenu />
        </div>
      </Container>
      </motion.header>
    </>
  );
}
