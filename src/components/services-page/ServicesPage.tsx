"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import type { PillarId } from "@/lib/services";
import { ServicesEnvironment } from "@/components/sections/services/ServicesEnvironment";
import { useTranslations, useLocale } from "@/lib/i18n";
import { ServicePacks } from "@/components/services-page/ServicePacks";

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
          <div className="pointer-events-auto w-full">
            <ServicesEnvironment active={active} onChange={setActive} dict={dict} />
          </div>

          <div className="pointer-events-auto mt-14 flex items-center gap-4">
            <Button href={`/${locale}/contact`} size="md">
              {dict.pages.home.startProject}
              <span aria-hidden>→</span>
            </Button>
            <Link
              href={`/${locale}/process`}
              className="text-sm font-medium uppercase tracking-[0.14em] text-accent-soft transition-colors hover:text-foreground"
            >
              {dict.pages.home.exploreProcess}
            </Link>
          </div>
        </Container>
      </section>

      {/* Service packs — live from the backend catalogue */}
      <ServicePacks />
    </div>
  );
}
