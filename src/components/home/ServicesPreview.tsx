"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import { PILLARS } from "@/lib/services";
import type { PillarId } from "@/lib/services";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

function PillarChips({ items }: { items: readonly string[] }) {
  return (
    <span className="flex flex-wrap items-baseline">
      {items.map((s, i) => (
        <span key={s} className="inline-flex items-center">
          {i > 0 && (
            <span aria-hidden className="mx-2 text-muted-more">
              /
            </span>
          )}
          <span className="text-muted">{s}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * 03 — BUILD / DESIGN / GROW preview.
 * A spacious editorial strip: three pillars you can hover/click, each with its
 * own visual personality (reusing the shared morphing field). Open the full
 * services page from here. Distinct look from the homepage hero.
 */
export function ServicesPreview() {
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
    <section
      className="relative overflow-hidden border-t border-border py-24 md:py-32 lg:py-40"
      aria-label={dict.pages.home.servicesLabel}
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_50%_50%,rgba(3,4,5,0.9)_0%,rgba(3,4,5,0.5)_55%,rgba(3,4,5,0.08)_80%)]"
        aria-hidden
      />

      <Container className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>{dict.pages.home.servicesLabel}</SectionLabel>
            <h2 className="mt-5 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              {dict.pages.home.servicesLabel}
            </h2>
          </div>
          <Button href={`/${locale}/services`} variant="outline" size="md" className="hidden sm:inline-flex">
            {dict.pages.home.exploreServices}
            <span aria-hidden>→</span>
          </Button>
        </div>

        <div className="mt-14">
          {PILLARS.map((p, i) => {
            const on = active === p.id;
            const tPillar = translatedPillars[i] ?? p;
            return (
              <button
                key={p.id}
                type="button"
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                onClick={() => setActive(p.id)}
                className="group relative block w-full border-b border-border py-6 text-left md:py-8"
                aria-current={on ? "true" : undefined}
              >
                <div className="flex items-baseline justify-between gap-6">
                  <div className="flex items-baseline gap-4 md:gap-8">
                    <span
                      className={`font-mono text-sm ${on ? "text-accent" : "text-muted-more"}`}
                    >
                      {p.index}
                    </span>
                    <span
                      className={`text-[clamp(2rem,7vw,5rem)] font-medium leading-none tracking-[-0.03em] transition-colors duration-300 ${
                        on ? "text-foreground" : "text-muted group-hover:text-foreground"
                      }`}
                    >
                      {tPillar?.label ?? p.label}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className={`text-xl ${on ? "text-accent" : "text-muted-more"}`}
                  >
                    {on ? "—" : "+"}
                  </span>
                </div>

                <div className="mt-4 max-w-3xl">
                  {on && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <p className="max-w-2xl text-lg leading-relaxed text-muted">
                        {tPillar?.lede ?? p.lede}
                      </p>
                      <div className="mt-4 text-sm leading-loose">
                        <PillarChips items={tPillar?.services ?? p.services} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 sm:hidden">
          <Button href={`/${locale}/services`} variant="outline" size="md" className="w-full">
            {dict.pages.home.exploreServices}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </Container>
    </section>
  );
}
