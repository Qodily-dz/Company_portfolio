"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 07 — Final CTA.
 * The conversion close of the home page: a large, calm statement that hands
 * the visitor into the dedicated /contact environment.
 */
export function FinalCta() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden border-t border-border py-28 md:py-40"
      aria-label={dict.pages.home.finalCtaLabel}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionLabel className="justify-center">{dict.pages.home.finalCtaLabel}</SectionLabel>
          <h2 className="mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            {dict.pages.home.finalCtaHeading}
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted">
            {dict.pages.home.finalCtaBody}
          </p>
          <div className="mt-12">
            <Button href={`/${locale}/contact`} size="lg">
              {dict.pages.home.startProject}
              <span aria-hidden>→</span>
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
