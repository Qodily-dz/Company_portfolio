"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";
import { Heading, Text } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import { PILLARS } from "@/lib/services";
import type { PillarId } from "@/lib/services";
import { useTranslations } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

function chipList(services: readonly string[]) {
  return services.map((s, i) => (
    <span key={s} className="inline-flex items-center">
      {i > 0 && (
        <span aria-hidden className="mx-2 text-muted-more">
          /
        </span>
      )}
      <span className="text-muted transition-colors hover:text-foreground">
        {s}
      </span>
    </span>
  ));
}

export function Services() {
  const dict = useTranslations();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<PillarId>("build");
  const [Field, setField] = useState<ComponentType<{ active: PillarId }> | null>(
    null
  );

  useEffect(() => {
    // Decorative background — reduced-motion users or machines without a
    // working GL context get the gradient fallback and never download the
    // three.js chunk.
    if (reduced || !supportsWebGL()) return;
    let alive = true;
    import("@/components/webgl/PillarField")
      .then((m) => {
        if (alive) setField(() => m.default);
      })
      .catch(() => {
        /* WebGL unavailable — fallback visuals below still render. */
      });
    return () => {
      alive = false;
    };
  }, [reduced]);

  const isActive = (pillar: PillarId) => active === pillar;

  const translatedPillars = dict.servicesData.pillars;

  return (
    <section
      id="services"
      className="relative flex min-h-svh flex-col overflow-hidden"
      aria-label={dict.footer.capabilities}
    >
      <div className="absolute inset-0">
        {Field ? (
          <WebGLBoundary
            fallback={
              <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0a0a0f_0%,#050505_60%)]" />
            }
          >
            <Field active={active} />
          </WebGLBoundary>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0a0a0f_0%,#050505_60%)]" />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_50%,rgba(5,5,5,0.88)_0%,rgba(5,5,5,0.45)_52%,rgba(5,5,5,0.05)_78%)]"
        aria-hidden
      />

      <Container
        className="pointer-events-none relative z-10 flex flex-1 flex-col justify-center py-28 md:py-32"
        size="lg"
      >
        <div className="uppercase tracking-[0.18em] text-muted-more">
          {dict.footer.capabilities}
        </div>
        <Heading as={2} size="3xl" className="mt-5 text-foreground">
          {dict.services.heading1}&nbsp;
          <span className="text-accent">
            {dict.services.heading2Accent}
          </span>
        </Heading>

        <div className="pointer-events-auto mt-12 w-full">
          {PILLARS.map((p) => {
            const on = isActive(p.id);
            const tPillar = translatedPillars.find(
              (tp: { label: string }) => tp.label.toLowerCase() === p.label.toLowerCase()
            );
            return (
              <div key={p.id} id={p.id}>
                <button
                  id={`services-pillar-${p.id}`}
                  aria-expanded={on}
                  aria-controls={`services-panel-${p.id}`}
                  onClick={() => setActive(p.id)}
                  className="group relative block w-full border-b border-border py-5 text-left md:py-7"
                >
                  <div className="flex items-baseline justify-between md:items-center">
                    <div className="flex items-baseline gap-4 md:gap-6">
                      <span
                        className={
                          on
                            ? "font-mono text-sm text-accent"
                            : "font-mono text-sm text-muted-more"
                        }
                      >
                        {p.index}
                      </span>
                      <span
                        className={
                          on
                            ? "text-[clamp(2rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.03em] text-foreground"
                            : "text-[clamp(2rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.03em] text-muted transition-colors duration-300 group-hover:text-foreground"
                        }
                      >
                        {tPillar?.label ?? p.label}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={
                        on
                          ? "text-xl text-accent transition-transform duration-500"
                          : "text-xl text-muted-more transition-all duration-300 group-hover:text-foreground"
                      }
                    >
                      {on ? "—" : "+"}
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`services-panel-${p.id}`}
                      role="region"
                      aria-labelledby={`services-pillar-${p.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="max-w-2xl pt-4 pl-10 md:pl-14">
                        <Text
                          as="p"
                          className="text-xs font-medium uppercase tracking-[0.2em] text-accent-soft"
                        >
                          {tPillar?.tagline ?? p.tagline}
                        </Text>
                        <Text
                          muted
                          size="lg"
                          className="mt-3 text-muted"
                          as="p"
                        >
                          {tPillar?.lede ?? p.lede}
                        </Text>
                        <div className="mt-5 text-sm leading-loose">
                          {p.funnel ? (
                            <Funnel stages={p.funnel} />
                          ) : (
                            <span className="flex flex-wrap items-baseline">
                              {chipList(tPillar?.services ?? p.services)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-14 hidden max-w-md text-sm leading-relaxed text-muted-more md:block">
          {dict.services.footnote}
        </p>
      </Container>
    </section>
  );
}

function Funnel({ stages }: { stages: readonly string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {stages.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="text-accent">
              →
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={
                i === stages.length - 1
                  ? "h-1.5 w-1.5 rounded-full bg-accent"
                  : "h-1 w-1 rounded-full bg-muted-more"
              }
            />
            <span
              className={
                i === stages.length - 1
                  ? "font-medium text-foreground"
                  : "text-muted"
              }
            >
              {s}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
