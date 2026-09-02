"use client";

import Link from "next/link";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { PILLARS } from "@/lib/services";
import { useTranslations, useLocale } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * ServicesPreview — HOME.03 BUILD / DESIGN / GROW.
 * An editorial list of the three capabilities linking to /services.
 * Spacious on purpose; the services page carries the interactive depth.
 * ------------------------------------------------------------------------- */

export function ServicesPreview() {
  const dict = useTranslations();
  const locale = useLocale();
  const entries = PILLARS.map((p, i) => {
    const localized = dict.servicesData.pillars[i];
    return {
      id: p.id,
      index: p.index,
      label: localized?.label ?? p.label,
      tagline: localized?.tagline ?? p.tagline,
      lede: localized?.lede ?? p.lede,
    };
  });

  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
      aria-label={dict.pages.home.servicesLabel}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
      </div>

      <Container className="relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>{dict.pages.home.servicesLabel}</SectionLabel>
              <h2 className="mt-6 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
                <span className="block">{dict.services.heading1}</span>
                <span className="block text-accent">
                  {dict.services.heading2Accent}
                  {dict.services.heading2Rest && (
                    <> {dict.services.heading2Rest}</>
                  )}
                </span>
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="max-w-sm text-sm leading-relaxed text-muted-more">
                {dict.services.footnote}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 border-t border-border">
          {entries.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <Link
                href={`/${locale}/services#${item.id}`}
                className="group grid grid-cols-1 items-baseline gap-3 border-b border-border py-8 transition-colors hover:bg-surface/30 md:grid-cols-12 md:gap-6 md:py-10"
              >
                <span className="text-sm font-medium tabular-nums text-muted-more md:col-span-1">
                  {item.index}
                </span>
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-medium tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent-soft md:text-3xl">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                    {item.tagline}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted md:col-span-6 md:max-w-xl">
                  {item.lede}
                </p>
                <span
                  aria-hidden
                  className="hidden text-muted-more transition-all group-hover:translate-x-1 group-hover:text-accent-soft md:col-span-2 md:inline-flex md:justify-end"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={`/${locale}/services`}
            className="text-sm font-medium text-accent-soft transition-colors hover:text-foreground"
          >
            {dict.pages.home.exploreServices} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}