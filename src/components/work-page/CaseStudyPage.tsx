"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout";
import { WORK_LABEL } from "@/lib/work";
import type { Project } from "@/lib/work";
import { useLocale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import { Preview } from "@/components/sections/work/Preview";
import { getAdjacentProjects } from "@/lib/work";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The case study as a real route. Sections follow the directive order —
 * Challenge, Solution, Design, Technology, Architecture, Result — and the
 * status is always labelled as Qodily Lab / concept work (no fabricated
 * client results or metrics).
 */

type CaseStudyPageProps = {
  project: Project;
  dict: Dictionary;
};

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
      <div className="grid gap-4 md:grid-cols-[auto_1fr] md:gap-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{n}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            {label}
          </h2>
          <div className="mt-4 text-[clamp(1rem,2vw,1.15rem)] leading-relaxed text-foreground-soft">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseStudyPage({ project, dict }: CaseStudyPageProps) {
  const locale = useLocale();
  const tp = dict.projects[project.id];
  const title = tp?.title ?? project.title;
  const category = tp?.category ?? project.category;
  const short = tp?.short ?? project.short;
  const problem = tp?.problem ?? project.problem;
  const solution = tp?.solution ?? project.solution;
  const approach = tp?.approach ?? project.approach;
  const architecture = tp?.architecture ? tp.architecture : approach;
  const design = tp?.design ?? project.design;
  const product = tp?.product ?? project.product;
  const outcome = tp?.outcome ?? project.outcome;
  const gallery = project.gallery ?? [];

  const idx = [
    "fedelo",
    "my-voucher-booking",
    "tcs-informatique",
    "restaurant-management",
    "e-commerce",
    "business-crm",
    "medical-appointments",
    "school-management",
    "saas-dashboard",
  ].indexOf(project.id);
  const seed = Math.max(idx, 0) + 1;
  const { prev, next } = getAdjacentProjects(project.id);

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 100% at 20% 0%, ${project.accent.a}1f 0%, transparent 60%)`,
          }}
        />
        <Container className="relative z-10 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-accent/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                {WORK_LABEL}
              </span>
              <span className="rounded-full border border-border-strong px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-more">
                {project.isProduction ? (project.badge ?? "Production") : dict.work.concept}
              </span>
              <span className="text-xs text-muted-more">{category}</span>
            </div>

            <h1 className="mt-7 max-w-4xl text-[clamp(2.4rem,8vw,6.5rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{short}</p>

            <div className="mt-8">
              <Link
                href={`/${locale}/work`}
                className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-soft transition-colors hover:text-foreground"
              >
                <span aria-hidden>←</span>
                {dict.work.backToWork}
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Case study narrative */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              <Section n="01" label={dict.work.challenge}>
                {problem}
              </Section>
              <Section n="02" label={dict.work.solution}>
                {solution}
              </Section>
              <Section n="03" label={dict.work.design}>
                {design}
              </Section>
              <Section n="04" label={dict.work.architecture}>
                {architecture}
              </Section>
              <Section n="05" label={dict.work.project}>
                {product}
              </Section>
              <Section n="06" label={dict.work.result}>
                {outcome}
              </Section>
            </motion.div>

            {/* Technology + preview rail */}
            <motion.aside
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-surface/40 shadow-xl">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={`/work/${project.id}.png`}
                    alt={title}
                    fill
                    priority
                    className="object-cover object-top"
                  />
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-more">
                  {dict.work.technology}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
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

              <p className="mt-8 text-xs leading-relaxed text-muted-more">
                {dict.pages.work.note}
              </p>
            </motion.aside>
          </div>
        </Container>
      </section>

      {/* Product gallery */}
      {gallery.length > 0 && (
        <section className="border-t border-border py-20 md:py-24">
          <Container>
            <div className="mb-8 grid gap-4 md:grid-cols-[auto_1fr] md:gap-8">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">GG</span>
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
                  {dict.work.gallery}
                </h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img, i) => (
                <figure
                  key={`${img.url}-${i}`}
                  className="overflow-hidden rounded-xl border border-border bg-surface/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `${title} — ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Prev / Next project navigation */}
      <section className="border-t border-border">
        <Container>
          <div className="grid gap-px sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/${locale}/work/${prev.id}`}
                className="group flex items-center gap-4 py-10 transition-colors hover:bg-white/[0.02]"
              >
                <span aria-hidden className="text-accent transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                <span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-more">
                    {dict.work.prevProject}
                  </span>
                  <span className="mt-1 block text-lg font-medium uppercase tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent">
                    {dict.projects[prev.id]?.title ?? prev.title}
                  </span>
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/${locale}/work/${next.id}`}
                className="group flex items-center justify-end gap-4 py-10 text-right transition-colors hover:bg-white/[0.02]"
              >
                <span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-more">
                    {dict.work.nextProject}
                  </span>
                  <span className="mt-1 block text-lg font-medium uppercase tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent">
                    {dict.projects[next.id]?.title ?? next.title}
                  </span>
                </span>
                <span aria-hidden className="text-accent transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
