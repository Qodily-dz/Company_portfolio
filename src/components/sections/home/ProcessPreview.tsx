"use client";

import Link from "next/link";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { useTranslations, useLocale } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * ProcessPreview — HOME.05 HOW WE WORK.
 * A six-step editorial timeline linking to the interactive /process page.
 * ------------------------------------------------------------------------- */

export function ProcessPreview() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
      aria-label={dict.pages.home.processLabel}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
      </div>

      <Container className="relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>{dict.pages.home.processLabel}</SectionLabel>
              <h2 className="mt-6 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
                <span className="block">{dict.process.heading1}</span>
                <span className="block text-accent">{dict.process.heading2}</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-more">
              {dict.pages.process.intro}
            </p>
          </div>
        </Reveal>

        <ol className="mt-16 border-t border-border">
          {dict.process.stages.map((stage, i) => (
            <li key={stage.id}>
              <Reveal delay={i * 0.05}>
                <div className="group grid grid-cols-1 items-baseline gap-2 border-b border-border py-6 transition-colors hover:bg-surface/30 md:grid-cols-12 md:gap-6 md:py-7">
                  <span className="text-sm font-medium tabular-nums text-muted-more md:col-span-2">
                    {stage.num}
                  </span>
                  <h3 className="text-lg font-medium tracking-[-0.01em] text-foreground group-hover:text-accent-soft md:col-span-4 md:text-xl">
                    {stage.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted md:col-span-6">
                    {stage.desc}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Link
            href={`/${locale}/process`}
            className="text-sm font-medium text-accent-soft transition-colors hover:text-foreground"
          >
            {dict.pages.home.exploreProcess} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}