"use client";

import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { EditorialList } from "@/components/sections/work/EditorialList";
import { useTranslations } from "@/lib/i18n";

/**
 * Dedicated /work gallery — an editorial numbered index. Each project is a
 * large row; on hover a preview panel tracks the cursor with its technology
 * labels. Rows link to real case-study routes, so opening a project is a
 * transitioned page change, never an abrupt card swap.
 */
export function WorkPage() {
  const dict = useTranslations();

  return (
    <>
      <section
        className="relative overflow-hidden py-24 md:py-32 lg:py-36"
        aria-label={dict.pages.work.title}
      >
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
        <Container className="relative z-10">
          <SectionLabel>{dict.pages.work.title}</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            {dict.work.heading1}
            <span className="block text-accent">{dict.work.heading2}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            {dict.pages.work.intro}
          </p>
        </Container>
      </section>

      {/* Editorial project index */}
      <section className="relative pb-28 md:pb-36" aria-label="Project gallery">
        <Container>
          <EditorialList />
          <p className="mt-14 text-xs uppercase tracking-[0.18em] text-muted-more">
            {dict.pages.work.note}
          </p>
        </Container>
      </section>
    </>
  );
}
