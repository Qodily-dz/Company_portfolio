"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 05 — How we work preview.
 * An editorial read of the six-step process, framed as an invite into the
 * interactive /process experience. Deliberately calm — no WebGL here, so the
 * home stays airy between the more active sections.
 */
export function ProcessPreview() {
  const dict = useTranslations();
  const locale = useLocale();
  const stages = dict.process.stages;

  return (
    <section
      className="relative overflow-hidden border-t border-border py-24 md:py-32 lg:py-40"
      aria-label={dict.pages.home.processLabel}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionLabel>{dict.pages.home.processLabel}</SectionLabel>
            <h2 className="mt-5 text-[clamp(2.6rem,7vw,5.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              {dict.process.heading1}
              <br />
              <span className="text-accent">{dict.process.heading2}</span>
            </h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
              {dict.pages.process.intro}
            </p>
            <Link
              href={`/${locale}/process`}
              data-cursor="link"
              className="group mt-9 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-accent-soft transition-colors hover:text-foreground"
            >
              {dict.pages.home.exploreProcess}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>

          <ol className="flex flex-col justify-center">
            {stages.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                className="flex items-baseline gap-5 border-b border-border py-4"
              >
                <span className="font-mono text-sm text-accent">{s.num}</span>
                <span className="flex-1 text-xl font-medium uppercase tracking-[0.04em] text-foreground md:text-2xl">
                  {s.title}
                </span>
                <span aria-hidden className="text-muted-more">
                  →
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
