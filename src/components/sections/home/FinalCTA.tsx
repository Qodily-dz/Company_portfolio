"use client";

import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { Magnetic } from "@/components/interactions";
import { Reveal } from "@/components/motion";
import { useTranslations, useLocale } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * FinalCTA — HOME.07 FINAL CTA.
 * Conversion closing panel: one clear invitation to start a project.
 * ------------------------------------------------------------------------- */

export function FinalCTA() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      className="relative overflow-hidden py-32 md:py-44"
      aria-label={dict.pages.home.finalCtaLabel}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
      </div>

      <Container className="relative z-10 text-center">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {dict.pages.home.finalCtaLabel}
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2.8rem,8vw,6.5rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            <span className="block">{dict.pages.home.finalCtaHeading}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            {dict.pages.home.finalCtaBody}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic strength={6} radius={130} className="w-full sm:w-auto">
              <Button
                href={`/${locale}/contact`}
                size="lg"
                className="w-full sm:w-auto"
              >
                {dict.pages.home.startProject}
                <span aria-hidden>→</span>
              </Button>
            </Magnetic>
            <Button
              href={`/${locale}/work`}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              {dict.hero.cta2}
              <span aria-hidden>→</span>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}