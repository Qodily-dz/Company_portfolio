"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { PROJECTS } from "@/lib/work";
import type { Project } from "@/lib/work";
import { useLocale, useTranslations } from "@/lib/i18n";
import { Preview } from "./Preview";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Editorial project index — a numbered list, not a card grid. Each project is
 * a row: index, large name, and a category slug. On hover (desktop) a large
 * preview panel emerges and tracks the cursor subtly, with technology labels
 * appearing beside it. Rows are real routes into the case study so navigation
 * is a transitioned page change, never an abrupt card swap.
 */

const SIZE_BY_INDEX = ["xl", "lg", "md", "md", "lg", "xl"] as const;

function RowHeading({ size, children }: { size: string; children: React.ReactNode }) {
  const classes: Record<string, string> = {
    xl: "text-[clamp(2.4rem,8vw,7rem)]",
    lg: "text-[clamp(2rem,7vw,5.5rem)]",
    md: "text-[clamp(1.6rem,6vw,4.25rem)]",
  };
  return (
    <span
      className={`block font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 ${classes[size]}`}
    >
      {children}
    </span>
  );
}

function CategorySlug({ category }: { category: string }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent-soft">
      {category.split(" · ").join(" / ")}
    </span>
  );
}

export function EditorialList() {
  const dict = useTranslations();
  const locale = useLocale();
  const reduced = useReducedMotion();

  // Floating preview position (desktop, fine pointer only).
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const px = useMotionValue(-400);
  const py = useMotionValue(-400);
  const springX = useSpring(px, { stiffness: 180, damping: 26, mass: 0.6 });
  const springY = useSpring(py, { stiffness: 180, damping: 26, mass: 0.6 });
  const listRef = useRef<HTMLDivElement | null>(null);

  const onEnter = (project: Project, e: React.MouseEvent) => {
    setPreviewProject(project);
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(e.clientX - rect.left);
    py.set(e.clientY - rect.top);
  };
  const onMove = (e: React.MouseEvent) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(e.clientX - rect.left);
    py.set(e.clientY - rect.top);
  };
  const onLeave = () => setPreviewProject(null);

  // On coarse-pointer / reduced-motion devices the list is fully readable as
  // static rows; a cursor preview adds nothing there.
  const showFloater = !reduced;

  return (
    <div
      ref={listRef}
      className="relative"
      onMouseLeave={reduced ? undefined : onLeave}
      data-cursor-area="work-lists"
    >
      <div className="flex flex-col">
        {PROJECTS.map((project, i) => {
          const t = dict.projects[project.id];
          const title = t?.title ?? project.title;
          const size = SIZE_BY_INDEX[i % SIZE_BY_INDEX.length];
          return (
            <Link
              key={project.id}
              href={`/${locale}/work/${project.id}`}
              data-cursor="case"
              data-cursor-label={title}
              onMouseEnter={(e) => !reduced && onEnter(project, e)}
              onMouseMove={(e) => !reduced && onMove(e)}
              className="group relative border-t border-border py-8 transition-colors last:border-b md:py-10"
            >
              {/* Index + category + title */}
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
                <span className="w-12 shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-muted-more transition-colors group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <CategorySlug category={t?.category ?? project.category} />
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    {/* Technology appears on hover */}
                    <span className="hidden translate-y-1 gap-1.5 opacity-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
                      {project.technology.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </span>
                  </div>
                  <RowHeading size={size}>{title}</RowHeading>
                </div>
                <span className="hidden shrink-0 items-center gap-1 self-center text-xs uppercase tracking-[0.18em] text-muted-more transition-colors group-hover:text-accent md:inline-flex">
                  {dict.work.viewCase}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cursor-following preview (desktop) */}
      <AnimatePresence>
        {showFloater && previewProject && (
          <motion.div
            key={previewProject.id}
            aria-hidden
            data-cursor="case"
            className="pointer-events-none absolute z-30 hidden w-[300px] lg:block"
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0, scale: 0.9, translateX: "-50%", translateY: "-50%" }}
            animate={{ opacity: 1, scale: 1, translateX: "-50%", translateY: "-50%" }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: EASE, scale: { duration: 0.2 } }}
          >
            <div className="overflow-hidden rounded-xl border border-border bg-surface/80 shadow-2xl backdrop-blur">
              <div className="aspect-[16/10] w-full">
                <Preview
                  accent={previewProject.accent}
                  seed={PROJECTS.findIndex((p) => p.id === previewProject.id) + 1}
                  tall={previewProject.id === "restaurant-management"}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent" />
              </div>
              <div className="px-4 py-3">
                <div className="text-sm font-medium uppercase tracking-[-0.01em] text-foreground">
                  {dict.projects[previewProject.id]?.title ?? previewProject.title}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {previewProject.technology.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
