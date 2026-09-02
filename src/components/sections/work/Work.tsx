"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { CursorParallax, ProximityGlow, Tilt } from "@/components/interactions";
import { CaseStudy } from "./CaseStudy";
import { Preview } from "./Preview";
import { PROJECTS, WORK_NOTE } from "@/lib/work";
import type { Project } from "@/lib/work";
import { useTranslations } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

function Tile({
  project,
  index,
  onOpen,
  dict,
}: {
  project: Project;
  index: number;
  onOpen: (id: string) => void;
  dict: Dictionary;
}) {
  const tall = project.id === "restaurant-management" || project.id === "saas-dashboard";
  const translatedProject = dict.projects[project.id];
  const title = translatedProject?.title ?? project.title;
  const summary = translatedProject?.summary ?? project.summary;

  return (
    <motion.article
        role="button"
        tabIndex={0}
        aria-label={`Open case study: ${title}`}
        data-cursor="project"
        onClick={() => onOpen(project.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project.id);
          }
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface/60 ${
          project.span
        }`}
        style={{ aspectRatio: tall ? "16 / 11" : "16 / 9" }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE, delay: (index % 3) * 0.08 }}
        whileHover="hover"
      >
        <Tilt max={3} className="absolute inset-0">
        {/* Preview visual */}
        <div className="absolute inset-0">
          <CursorParallax range={5}>
            <Preview accent={project.accent} seed={index + 1} tall={tall} />
          </CursorParallax>
        </div>

        {/* Readability gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />

        {/* Metadata */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
          <div>
            <motion.div
              variants={{ hover: { y: -4 } }}
              className="text-xs font-medium uppercase tracking-[0.18em] text-accent"
            >
              {project.category}
            </motion.div>
            <motion.h3
              variants={{ hover: { y: -4 } }}
              className="mt-2 text-xl font-medium leading-tight tracking-[-0.02em] text-foreground md:text-2xl"
            >
              {title}
            </motion.h3>
            <motion.p
              variants={{ hover: { y: -4 } }}
              className="mt-2 max-w-sm text-sm leading-relaxed text-muted"
            >
              {summary}
            </motion.p>
          </div>
          <motion.span
            variants={{ hover: { rotate: 0, scale: 1 } }}
            initial={{ rotate: 0 }}
            className="mb-1 hidden shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs uppercase tracking-[0.14em] text-accent sm:inline-flex sm:items-center"
          >
            {dict.work.view}
          </motion.span>
        </div>

        {/* Hover lift toward the user */}
        <motion.span
          className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent"
          variants={{ hover: { boxShadow: "0 24px 60px -20px rgba(43,92,145,0.4)" } }}
          aria-hidden
        />
        </Tilt>
      </motion.article>
  );
}

export function Work() {
  const [selected, setSelected] = useState<Project | null>(null);
  const dict = useTranslations();

  const selectedProject = selected ?? null;

  return (
    <section
      id="work"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Work — Qodily Lab"
    >
      {/* Lightweight floating-plane background (desktop) + cursor glow */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
        <ProximityGlow className="absolute inset-0" intensity={0.7} />
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

        {/* Spatial grid — varied scales, no identical cards */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {PROJECTS.map((p, i) => (
            <Tile
              key={p.id}
              project={p}
              index={i}
              dict={dict}
              onOpen={(id) => {
                const found = PROJECTS.find((x) => x.id === id);
                if (found) setSelected(found);
              }}
            />
          ))}
        </div>
      </Container>

      {/* Case study overlay */}
      <AnimatePresence>
        {selectedProject && (
          <CaseStudy
            key={selectedProject.id}
            project={selectedProject}
            dict={dict}
            open={Boolean(selectedProject)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
