"use client";

import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { ProjectCard } from "@/components/work/ProjectCard";
import { PROJECTS, type Project } from "@/lib/work";
import { useTranslations } from "@/lib/i18n";

/**
 * Dedicated /work gallery — a numbered card index. Each project carries the
 * same information in the same order (index, discipline, name, what it covers,
 * stack), so the grid reads as one body of work. Cards link to the case study.
 */
export function WorkPage({
  projects = PROJECTS,
}: {
  /** Use cases from the API, or the bundled list when it is unreachable. */
  projects?: Project[];
  source?: "api" | "static";
} = {}) {
  const dict = useTranslations();

  const productionProjects = projects.filter((p) => p.isProduction);
  const conceptProjects = projects.filter((p) => !p.isProduction);

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

      <section className="relative pb-28 md:pb-36" aria-label="Project gallery">
        <Container>
          {/* Production Projects */}
          <div className="mb-24">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  01 / SYSTÈMES EN PRODUCTION
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                  Projets Réalisés & SaaS
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted">
                Plateformes déployées en production, systèmes transactionnels et infrastructures pour clients et produits internes.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productionProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  showNumber
                  priority={true}
                />
              ))}
            </div>
          </div>

          {/* Conceptual / Lab Projects */}
          <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-more">
                  02 / QODILY LAB
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                  Explorations & Concepts
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted">
                Systèmes conceptuels et explorations architecturales résolvant des défis sectoriels ciblés.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {conceptProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i + productionProjects.length}
                  showNumber
                  priority={false}
                />
              ))}
            </div>
          </div>

          <div className="mt-16 space-y-3 border-t border-border pt-8">
            <p className="max-w-2xl text-xs leading-relaxed text-muted-more">
              {dict.work.imageNote}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
