"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui";
import { WORK_LABEL } from "@/lib/work";
import type { Project } from "@/lib/work";
import type { Dictionary } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

type CaseStudyProps = {
  project: Project;
  dict: Dictionary;
  open: boolean;
  onClose: () => void;
};

/* Deterministic index for section numbering. */

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      onClick={onClose}
      variant="ghost"
      size="sm"
      className="relative z-10 group"
      aria-label="Close case study"
    >
      <span className="sr-only">Close</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </Button>
  );
}

function Section({
  n,
  label,
  children,
}: {
  n: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border/60 py-8 md:py-10">
      <div className="flex items-start gap-6">
        <span className="font-mono text-xs text-accent">{n}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium uppercase tracking-[0.14em] text-muted">
            {label}
          </h3>
          <div className="mt-4">
            {/* render markdown-ish plain text paragraphs */}
            {typeof children !== "string" ? (
              children
            ) : (
              <p className="max-w-2xl text-base leading-relaxed text-foreground-soft md:text-lg">
                {children}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseStudy({ project, dict, open, onClose }: CaseStudyProps) {
  const panel = useRef<HTMLDivElement | null>(null);
  const tp = dict.projects[project.id];
  const title = tp?.title ?? project.title;
  const category = tp?.category ?? project.category;
  const short = tp?.short ?? project.short;
  const problem = tp?.problem ?? project.problem;
  const solution = tp?.solution ?? project.solution;
  const approach = tp?.approach ?? project.approach;
  const design = tp?.design ?? project.design;
  const product = tp?.product ?? project.product;
  const outcome = tp?.outcome ?? project.outcome;

  // Lock body scroll + ESC to close while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Keep focus inside while open.
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label={`Case study — ${title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* Backdrop */}
          <motion.button
            aria-label="Close case study"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            ref={panel}
            tabIndex={-1}
            className="relative ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-border bg-background shadow-2xl outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* Header */}
            <div
              className="relative shrink-0 overflow-hidden px-6 py-8 md:px-10 md:py-10"
              style={{
                background: `radial-gradient(120% 100% at 0% 0%, ${project.accent.a}22 0%, transparent 60%)`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    {WORK_LABEL}
                  </div>
                  <h2 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground md:text-4xl">
                    {title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted">{category}</span>
                    <span aria-hidden className="text-muted-more">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-0.5 text-xs uppercase tracking-[0.14em] text-accent">
                      {dict.work.concept}
                    </span>
                  </div>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                    {short}
                  </p>
                </div>
                <CloseButton onClose={onClose} />
              </div>
            </div>

            {/* Scrollable body */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 pb-16 md:px-10">
              <Section n="01" label={dict.work.project}>
                {solution}
              </Section>
              <Section n="02" label={dict.work.challenge}>
                {problem}
              </Section>
              <Section n="03" label={dict.work.approach}>
                {approach}
              </Section>
              <Section n="04" label={dict.work.design}>
                {design}
              </Section>
              <Section n="05" label={dict.work.product}>
                {product}
              </Section>

              {/* Technology */}
              <div className="border-t border-border/60 py-8 md:py-10">
                <div className="flex items-start gap-6">
                  <span className="font-mono text-xs text-accent">06</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium uppercase tracking-[0.14em] text-muted">
                      {dict.work.technology}
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technology.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border bg-secondary px-3 py-1 font-mono text-xs text-foreground-soft"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Section n="07" label={dict.work.outcome}>
                {outcome}
              </Section>

              <div className="mt-2 flex justify-end">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="group"
                >
                  {dict.work.backToWork}
                  <span aria-hidden>←</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
