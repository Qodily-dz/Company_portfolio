"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import { PILLARS } from "@/lib/services";
import type { PillarId } from "@/lib/services";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Dedicated /services page — BUILD / DESIGN / GROW, each with its own visual
 * experience. The shared morphing field provides the backdrop; each pillar
 * gets its own signature language (BUILD: architecture + nodes, DESIGN:
 * grids/typography, GROW: data flow + funnel) through the switcher.
 */
export function ServicesPage() {
  const dict = useTranslations();
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<PillarId>("build");
  const [Field, setField] = useState<ComponentType<{ active: PillarId }> | null>(null);

  useEffect(() => {
    if (reduced || !supportsWebGL()) return;
    let alive = true;
    import("@/components/webgl/PillarField")
      .then((m) => {
        if (alive) setField(() => m.default);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reduced]);

  const translatedPillars = dict.servicesData.pillars;

  return (
    <div aria-label={dict.pages.services.title}>
      {/* Page intro — calm, distinct from the homepage */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
        <Container className="relative z-10">
          <SectionLabel>{dict.pages.services.title}</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            {dict.services.heading1}{" "}
            <span className="text-accent">{dict.services.heading2Accent}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            {dict.pages.services.intro}
          </p>
        </Container>
      </section>

      {/* Interactive pillars with the shared morphing field */}
      <section
        id="services"
        className="relative overflow-hidden border-t border-border"
        aria-label={dict.footer.capabilities}
      >
        <div className="absolute inset-0">
          {Field ? (
            <WebGLBoundary
              fallback={
                <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
              }
            >
              <Field active={active} />
            </WebGLBoundary>
          ) : (
            <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_92%_at_50%_50%,rgba(3,4,5,0.92)_0%,rgba(3,4,5,0.5)_55%,rgba(3,4,5,0.06)_80%)]"
          aria-hidden
        />

        <Container className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-center py-24 md:py-28">
          <div className="pointer-events-auto flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                className={`rounded-full border px-5 py-2 text-sm font-medium uppercase tracking-[0.12em] transition-colors ${
                  active === p.id
                    ? "border-accent text-accent-soft"
                    : "border-border-strong text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto mt-12">
            <AnimatePresence mode="wait">
              {PILLARS.map((p) => {
                if (p.id !== active) return null;
                const tPillar = translatedPillars.find(
                  (tp: { label: string }) => tp.label.toLowerCase() === p.label.toLowerCase()
                );
                return (
                  <motion.div
                    key={p.id}
                    id={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="max-w-3xl"
                  >
                    <div className="font-mono text-sm text-accent">{p.index}</div>
                    <h2 className="mt-3 text-[clamp(2.4rem,7vw,5rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
                      {tPillar?.label ?? p.label}
                    </h2>
                    <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">
                      {tPillar?.tagline ?? p.tagline}
                    </div>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                      {tPillar?.lede ?? p.lede}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2">
                      {(tPillar?.services ?? p.services).map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-border bg-white/[0.02] px-3 py-1.5 text-sm text-foreground-soft"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {p.funnel && (
                      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
                        {p.funnel.map((s, i) => (
                          <span key={s} className="inline-flex items-center gap-3">
                            {i > 0 && (
                              <span aria-hidden className="text-accent">
                                →
                              </span>
                            )}
                            <span className="text-sm text-muted">{s}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="pointer-events-auto mt-14 flex items-center gap-4">
            <Button href={`/${locale}/contact`} size="md">
              {dict.pages.home.startProject}
              <span aria-hidden>→</span>
            </Button>
            <Link
              href={`/${locale}/process`}
              data-cursor="link"
              className="text-sm font-medium uppercase tracking-[0.14em] text-accent-soft transition-colors hover:text-foreground"
            >
              {dict.pages.home.exploreProcess}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
