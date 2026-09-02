"use client";

import Link from "next/link";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { CursorParallax, ProximityGlow, Tilt } from "@/components/interactions";
import { Preview } from "@/components/sections/work/Preview";
import { PROJECTS } from "@/lib/work";
import type { Project } from "@/lib/work";
import { useTranslations, useLocale } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * WorkPreview — HOME.04 SELECTED WORK.
 * Two large editorial features (varied scale, no grid of identical cards)
 * linking to the dedicated /work gallery.
 * ------------------------------------------------------------------------- */

const FEATURED = ["restaurant-management", "saas-dashboard"];

function FeatureCard({
  project,
  index,
  dict,
  locale,
}: {
  project: Project;
  index: number;
  dict: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const translatedProject = dict.projects[project.id];
  const title = translatedProject?.title ?? project.title;
  const summary = translatedProject?.summary ?? project.summary;

  return (
    <Reveal delay={index * 0.1}>
      <Link
        href={`/${locale}/work`}
        data-cursor="project"
        className={`group relative block overflow-hidden rounded-xl border border-border bg-surface/60 ${
          index % 2 === 0 ? "" : "md:mt-24"
        }`}
      >
        <Tilt max={3} className="absolute inset-0">
          <div className="absolute inset-0">
            <CursorParallax range={5}>
              <Preview accent={project.accent} seed={index + 1} tall />
            </CursorParallax>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                {project.category}
              </div>
              <h3 className="mt-2 text-xl font-medium leading-tight tracking-[-0.02em] text-foreground md:text-2xl">
                {title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {summary}
              </p>
            </div>
            <span className="mb-1 hidden shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs uppercase tracking-[0.14em] text-accent sm:inline-flex sm:items-center">
              {dict.work.view}
            </span>
          </div>
          <div
            className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent transition-shadow duration-300 group-hover:shadow-[0_24px_60px_-20px_rgba(43,92,145,0.4)]"
            aria-hidden
          />
        </Tilt>
      </Link>
    </Reveal>
  );
}

export function WorkPreview() {
  const dict = useTranslations();
  const locale = useLocale();
  const featured = PROJECTS.filter((p) => FEATURED.includes(p.id));

  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
      aria-label={dict.pages.home.workLabel}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
        <ProximityGlow className="absolute inset-0" intensity={0.5} />
      </div>

      <Container className="relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>{dict.pages.home.workLabel}</SectionLabel>
              <h2 className="mt-6 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
                <span className="block">{dict.work.heading1}</span>
                <span className="block text-accent">{dict.work.heading2}</span>
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="max-w-sm text-sm leading-relaxed text-muted-more">
                {dict.pages.work.note}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
          {featured.map((project, i) => (
            <FeatureCard
              key={project.id}
              project={project}
              index={i}
              dict={dict}
              locale={locale}
            />
          ))}
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/work`}
            className="text-sm font-medium text-accent-soft transition-colors hover:text-foreground"
          >
            {dict.pages.home.exploreWork} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}