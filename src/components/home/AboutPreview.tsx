"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 06 — About / vision preview.
 * A quiet, editorial moment: the studio's position and vision in large type,
 * inviting into the fuller /about story. Intentionally light — no WebGL.
 */
export function AboutPreview() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden border-t border-border py-24 md:py-32 lg:py-40"
      aria-label={dict.pages.home.aboutLabel}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_100%,rgba(43,92,145,0.06)_0%,transparent_70%)]"
        aria-hidden
      />
      <Container className="relative z-10">
        <SectionLabel>{dict.pages.home.aboutLabel}</SectionLabel>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-8 max-w-4xl"
        >
          <h2 className="text-[clamp(2.4rem,6.5vw,5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
            {dict.about.headingLines[0]}{" "}
            <span className="text-muted">{dict.about.headingLines[1]}</span>{" "}
            <span className="text-accent">{dict.about.headingLines[2]}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mt-10 max-w-2xl"
        >
          <p className="text-lg leading-relaxed text-muted">{dict.about.body}</p>
          <Link
            href={`/${locale}/about`}
            data-cursor="link"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-accent-soft transition-colors hover:text-foreground"
          >
            {dict.pages.home.exploreAbout}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
