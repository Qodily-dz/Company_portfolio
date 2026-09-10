"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/work";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One project card, shared by the home preview and the /work index.
 *
 * The artwork is a screenshot of a Qodily-built interface used as an
 * illustration — it is NOT a picture of the concept named on the card. The
 * `CONCEPT` badge and the section-level image note say so; do not remove
 * either while these images are in place.
 */
export function ProjectCard({
  project,
  index,
  showNumber = false,
  priority = false,
}: {
  project: Project;
  index: number;
  /** Show the 01–06 index used on the /work gallery. */
  showNumber?: boolean;
  priority?: boolean;
}) {
  const dict = useTranslations();
  const locale = useLocale();

  const t = dict.projects[project.id];
  const title = t?.title ?? project.title;
  const summary = t?.summary ?? project.summary;
  const category = t?.category ?? project.category;
  const capabilities = t?.capabilities ?? [];
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE, delay: (index % 3) * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface/60 transition-[border-color,box-shadow,transform] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:border-accent/50 hover:shadow-[0_24px_60px_-20px_rgba(43,92,145,0.45)] motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-background">
        {/* Browser chrome. A bare screenshot bleeding to the card edge reads as
            stock art; framing it says "this is a running product" and gives the
            shot a deliberate edge instead of an arbitrary crop. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-1.5 border-b border-border/70 bg-background/95 px-3 backdrop-blur"
        >
          <span className="size-2 rounded-full bg-[#ff5f57]/70" />
          <span className="size-2 rounded-full bg-[#febc2e]/70" />
          <span className="size-2 rounded-full bg-[#28c840]/70" />
        </div>
        <Image
          src={`/work/${project.id}.png`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover object-top pt-7 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface/90 to-transparent" />
        <span
          className={`absolute start-3 top-10 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur ${
            project.isProduction
              ? "border-accent/50 bg-background/90 text-accent font-semibold shadow-[0_0_12px_rgba(43,92,145,0.3)]"
              : "border-border-strong bg-background/80 text-muted"
          }`}
        >
          {project.isProduction ? (project.badge ?? "Production") : dict.work.concept}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline gap-3">
          {showNumber && (
            <span className="font-mono text-[11px] text-muted-more">
              {number}
            </span>
          )}
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {category}
          </div>
        </div>

        <h3 className="mt-3 text-xl font-medium leading-tight tracking-[-0.02em] text-foreground">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{summary}</p>

        {capabilities.length > 0 && (
          <ul className="mt-4 space-y-2">
            {capabilities.map((cap) => (
              <li
                key={cap}
                className="flex gap-2.5 text-sm leading-snug text-muted-more"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-accent"
                />
                {cap}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap gap-1.5">
            {project.technology.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-more"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-1.5 border-t border-border pt-4 text-xs uppercase tracking-[0.14em] text-muted-more transition-colors duration-300 group-hover:text-accent">
            {dict.work.viewCase}
            <span
              aria-hidden
              className="transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            >
              →
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/${locale}/work/${project.id}`}
        className="absolute inset-0 z-10"
        aria-label={title}
      />
    </motion.article>
  );
}
