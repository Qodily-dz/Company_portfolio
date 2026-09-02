"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Tilt } from "@/components/interactions";
import { CaseStudy } from "@/components/sections/work/CaseStudy";
import { Preview } from "@/components/sections/work/Preview";
import { PROJECTS } from "@/lib/work";
import type { Project } from "@/lib/work";
import { useTranslations } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Dedicated /work gallery — an editorial, alternating layout rather than a
 * repetitive grid of identical cards. Each project is a large editorial row:
 * the procedural preview on one side and the case narrative on the other,
 * swapping sides down the page. Interaction keeps the same cursor language
 * as the rest of the site and opens the shared case-study transition.
 */
export function WorkPage() {
  const dict = useTranslations();
  const [selected, setSelected] = useState<Project | null>(null);

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

      {/* Editorial alternating rows */}
      <section className="relative pb-28 md:pb-36" aria-label="Project gallery">
        <Container>
          <div className="flex flex-col gap-px">
            {PROJECTS.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={i}
                dict={dict}
                onOpen={() => setSelected(project)}
              />
            ))}
          </div>
          <p className="mt-14 text-xs uppercase tracking-[0.18em] text-muted-more">
            {dict.pages.work.note}
          </p>
        </Container>
      </section>

      {/* Case study transition */}
      <AnimatePresence>
        {selected && (
          <CaseStudy
            key={selected.id}
            project={selected}
            dict={dict}
            open={Boolean(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ProjectRow({
  project,
  index,
  dict,
  onOpen,
}: {
  project: Project;
  index: number;
  dict: Dictionary;
  onOpen: () => void;
}) {
  const translated = dict.projects[project.id];
  const title = translated?.title ?? project.title;
  const summary = translated?.summary ?? project.summary;
  const problem = translated?.problem ?? project.problem;
  const outcome = translated?.outcome ?? project.outcome;
  const flip = index % 2 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="border-t border-border py-12 md:py-16"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Preview visual */}
        <div className={flip ? "lg:order-2" : ""}>
          <button
            type="button"
            role="link"
            data-cursor="project"
            onClick={onOpen}
            aria-label={`Open case study: ${title}`}
            className="group relative block w-full overflow-hidden rounded-xl border border-border bg-surface/60"
          >
            <Tilt max={3} className="absolute inset-0">
              <div className="aspect-[16/10] w-full">
                <Preview accent={project.accent} seed={index + 1} tall={index % 3 === 1} />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute right-5 top-5 hidden rounded-full border border-accent/40 px-3 py-1 text-xs uppercase tracking-[0.14em] text-accent sm:inline-flex">
                  {dict.work.view}
                </div>
              </div>
            </Tilt>
          </button>
        </div>

        {/* Narrative */}
        <div className={flip ? "lg:order-1" : ""}>
          <div className="flex items-baseline justify-between gap-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {project.category}
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-more">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{summary}</p>
          <div className="mt-6 space-y-4 border-l-2 border-accent/40 pl-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-more">
                {dict.work.challenge}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{problem}</p>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-more">
                {dict.work.outcome}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{outcome}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technology.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
