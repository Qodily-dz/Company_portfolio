"use client";

import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { ProjectCard } from "@/components/work/ProjectCard";
import { PROJECTS } from "@/lib/work";
import { useTranslations, useLocale } from "@/lib/i18n";

/** The three featured projects shown on the home page. */
const FEATURED = PROJECTS.slice(0, 3);

/**
 * 04 — Selected work preview.
 *
 * A uniform three-up index rather than a mosaic of mismatched tiles, so the
 * row reads as one considered body of work. Cards are shared with /work.
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
          <div className="max-w-2xl">
            <SectionLabel>{dict.pages.home.workLabel}</SectionLabel>
            <h2 className="mt-5 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              {dict.work.heading1}
              <span className="block text-accent">{dict.work.heading2}</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-more">
              {dict.pages.work.note}
            </p>
          </div>
          <Button
            href={`/${locale}/work`}
            variant="outline"
            size="md"
            className="hidden sm:inline-flex"
          >
            {dict.pages.home.exploreWork}
            <span aria-hidden>→</span>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} priority={i === 0} />
          ))}
        </div>

        {/* Provenance: the card artwork is our own product UI, used as
            illustration. Keep this visible while screenshots are in use. */}
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-more">
          {dict.work.imageNote}
        </p>

        <div className="mt-10 sm:hidden">
          <Button
            href={`/${locale}/work`}
            variant="outline"
            size="md"
            className="w-full"
          >
            {dict.pages.home.exploreWork}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </Container>
    </section>
  );
}
