"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";
import { Heading } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import type { PillarId } from "@/lib/services";
import { ServicesEnvironment } from "./ServicesEnvironment";
import { useTranslations } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * Services — BUILD / DESIGN / GROW experience.
 *
 * A shared morphing 3D field (the same digital matter transforms between the
 * three pillars) sits behind an editorial DOM panel. Each pillar renders as a
 * distinct interactive environment — SYSTEM ARCHITECTURE, DIGITAL COMPOSITION
 * or DATA FLOW — not a generic card. The background (PillarField) is a
 * persistent particle system that morphs as the anchor changes, so switching
 * feels like the matter rearranging rather than loading a new scene.
 * ------------------------------------------------------------------------- */

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

  return (
    <section
      id="services"
      className="relative flex min-h-svh flex-col overflow-hidden"
      aria-label={dict.footer.capabilities}
    >
      {/* Shared morphing 3D environment background */}
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

      {/* Readability overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_50%,rgba(3,4,5,0.9)_0%,rgba(3,4,5,0.5)_55%,rgba(3,4,5,0.08)_80%)]"
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
          <span className="block">{dict.services.heading1}</span>
          <span className="block text-accent">{dict.services.heading2Accent}</span>
        </Heading>

        <div className="pointer-events-auto mt-12 w-full">
          <ServicesEnvironment active={active} onChange={setActive} dict={dict} />
        </div>

        <p className="pointer-events-auto mt-14 hidden max-w-md text-sm leading-relaxed text-muted-more md:block">
          {dict.services.footnote}
        </p>
      </Container>
    </section>
  );
}
