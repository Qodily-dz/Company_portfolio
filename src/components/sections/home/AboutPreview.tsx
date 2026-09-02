"use client";

import Link from "next/link";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { useTranslations, useLocale } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * AboutPreview — HOME.06 ABOUT / VISION.
 * The three-line editorial statement + vision, linking to the /about page.
 * ------------------------------------------------------------------------- */

export function AboutPreview() {
  const dict = useTranslations();
  const locale = useLocale();
  const lines = dict.about.headingLines;

  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
      aria-label={dict.pages.home.aboutLabel}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
      </div>

      <Container className="relative z-10">
        <Reveal>
          <SectionLabel>{dict.pages.home.aboutLabel}</SectionLabel>
          <h2 className="mt-6 max-w-4xl text-[clamp(2.4rem,6.5vw,5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-foreground">
            {lines.map((line, i) => (
              <span
                key={i}
                className={i === lines.length - 1 ? "block text-accent" : "block"}
              >
                {line}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12">
            <p className="text-base leading-relaxed text-muted md:col-span-5">
              {dict.about.visionText}
            </p>
            <div className="md:col-span-4 md:col-start-7">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-more">
                {dict.about.vision}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {dict.pages.about.intro}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12">
          <Link
            href={`/${locale}/about`}
            className="text-sm font-medium text-accent-soft transition-colors hover:text-foreground"
          >
            {dict.pages.home.exploreAbout} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}