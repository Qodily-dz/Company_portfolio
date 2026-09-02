"use client";

import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { EditorialList } from "./EditorialList";
import { WORK_NOTE } from "@/lib/work";
import { useTranslations } from "@/lib/i18n";

/**
 * Homepage Work section — an editorial numbered index, not a card grid. Each
 * project is a row; hovering it summons a cursor-following preview with its
 * technology. Rows open real case-study routes for a transitioned page change.
 */
export function Work() {
  const dict = useTranslations();

  return (
    <section
      id="work"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Work — Qodily Lab"
    >
      {/* Lightweight floating-plane background */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
      </div>

      <Container className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>{dict.work.label}</SectionLabel>
            <h2 className="mt-6 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              <span className="block">{dict.work.heading1}</span>
              <span className="block text-accent">{dict.work.heading2}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-more">
            {WORK_NOTE}
          </p>
        </div>

        {/* Editorial project index */}
        <div className="mt-16">
          <EditorialList />
        </div>
      </Container>
    </section>
  );
}
