"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { Tilt } from "@/components/interactions";
import { Preview } from "@/components/sections/work/Preview";
import { PROJECTS } from "@/lib/work";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The three featured projects shown on the home page (varied scale). */
const FEATURED = PROJECTS.slice(0, 3);

const LAYOUTS = [
  "md:col-span-7",
  "md:col-span-5 md:row-span-2",
  "md:col-span-5",
];

const HEIGHTS = ["aspect-[16/9]", "aspect-[3/4]", "aspect-[16/9]"];

/**
 * 04 — Selected work preview.
 * An editorial, editorial-scale showcase of a few projects — not a repetitive
 * grid — with one deliberate inset piece for rhythm. Deep-links to /work.
 */
export function WorkPreview() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden border-t border-border py-24 md:py-32 lg:py-40"
      aria-label={dict.pages.home.workLabel}
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>{dict.pages.home.workLabel}</SectionLabel>
            <h2 className="mt-5 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              {dict.work.heading1}
              <span className="block text-accent">{dict.work.heading2}</span>
            </h2>
          </div>
          <Button href={`/${locale}/work`} variant="outline" size="md" className="hidden sm:inline-flex">
            {dict.pages.home.exploreWork}
            <span aria-hidden>→</span>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {FEATURED.map((p, i) => {
            const translated = dict.projects[p.id];
            const title = translated?.title ?? p.title;
            const summary = translated?.summary ?? p.summary;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-xl border border-border bg-surface/60 ${LAYOUTS[i]}`}
              >
                {/* This must remain in normal flow: making the Tilt wrapper absolute
                    collapsed every project tile to zero height, leaving the section blank. */}
                <Tilt max={3} className="relative block">
                  <div className={`relative w-full ${HEIGHTS[i]}`}>
                    <Preview accent={p.accent} seed={i + 1} tall={i === 1} />
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                          {p.category}
                        </div>
                        <h3 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.02em] text-foreground md:text-3xl">
                          {title}
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                          {summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tilt>
                <Link
                  href={`/${locale}/work`}
                  className="absolute inset-0 z-10"
                  aria-label={title}
                />
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 sm:hidden">
          <Button href={`/${locale}/work`} variant="outline" size="md" className="w-full">
            {dict.pages.home.exploreWork}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </Container>
    </section>
  );
}
