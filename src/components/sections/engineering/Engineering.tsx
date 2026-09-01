"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { WebGLBoundary } from "@/components/webgl";
import { supportsWebGL } from "@/lib/webgl";
import { ENGINEERING_CENTER, ENGINEERING_NODES } from "@/lib/engineering";
import { useTranslations } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

type FieldProps = {
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  packetMult: number;
};

export function Engineering() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [Field, setField] = useState<ComponentType<FieldProps> | null>(null);
  const [packetMult, setPacketMult] = useState(3);
  const dict = useTranslations();
  const translatedNodes = dict.engineeringData.nodes;

  useEffect(() => {
    let alive = true;
    // Interactive scene, but still requires a working GL context to exist —
    // otherwise the DOM panel and section render alone.
    if (!supportsWebGL()) return;
    import("./EngineeringField")
      .then((m) => {
        if (alive) setField(() => m.EngineeringField);
      })
      .catch(() => {
        /* WebGL unavailable — DOM panel + section still render. */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const sync = () =>
      setPacketMult(window.matchMedia("(min-width: 1024px)").matches ? 3 : 1);
    sync();
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = selected ?? hovered;
  const activeNode = active
    ? ENGINEERING_NODES.find((n) => n.id === active)
    : null;
  const activeTranslated = activeNode
    ? translatedNodes.find(
        (n) => n.label.toLowerCase() === activeNode.label.toLowerCase()
      )
    : null;

  return (
    <section
      id="engineering"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Engineering — technology constellation"
    >
      <Container>
        {/* Header */}
        <div className="flex items-center gap-2">
          <SectionLabel>{dict.engineering.label}</SectionLabel>
        </div>

        <h2 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
          <span className="block">{dict.engineering.heading1}</span>
          <span className="block text-accent">
            {dict.engineering.heading2Accent} {dict.engineering.heading2Rest}
          </span>
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {dict.engineering.body}
        </p>

        {/* Constellation */}
        <div className="relative mt-4">
          <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-border bg-surface/30 md:h-[560px]">
            {/* 3D field */}
            <div className="absolute inset-0">
              {Field ? (
                <WebGLBoundary
                  fallback={
                    <div className="h-full w-full bg-[radial-gradient(120%_110%_at_50%_45%,#0a0a0f_0%,#050505_72%)]" />
                  }
                >
                  <Field
                    hovered={hovered}
                    selected={selected}
                    onHover={setHovered}
                    onSelect={setSelected}
                    packetMult={packetMult}
                  />
                </WebGLBoundary>
              ) : (
                <div className="h-full w-full bg-[radial-gradient(120%_110%_at_50%_45%,#0a0a0f_0%,#050505_72%)]" />
              )}
            </div>

            {/* Center label (DOM overlay — crisp text) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
                  Qodily
                </div>
                <div className="mt-1 text-lg font-medium uppercase tracking-[0.22em] text-foreground">
                  Engineering
                </div>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-muted-more">
            <span>{dict.engineering.hoverHint}</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              {dict.engineering.liveLabel}
            </span>
          </div>
        </div>

        {/* Contextual info panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode?.id ?? "default"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface/60"
          >
            {activeNode ? (
              <div className="grid items-start gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-sm font-semibold tracking-wide text-accent">
                  {activeNode.glyph}
                </div>
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                    {activeTranslated?.label ?? activeNode.label}
                  </div>
                  <p className="mt-2 max-w-xl leading-relaxed text-foreground">
                    {activeTranslated?.desc ?? activeNode.desc}
                  </p>
                  {selected === activeNode.id && (
                    <motion.ul
                      initial="hidden"
                      animate="show"
                      variants={{
                        show: { transition: { staggerChildren: 0.05 } },
                      }}
                      className="mt-4 grid max-w-2xl gap-2 sm:grid-cols-2"
                    >
                      {(activeTranslated?.details ?? activeNode.details).map((d) => (
                        <motion.li
                          key={d}
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            show: { opacity: 1, x: 0 },
                          }}
                          className="flex items-start gap-2 text-sm leading-snug text-muted"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                          {d}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs uppercase tracking-[0.16em] text-muted-more transition-colors hover:text-foreground"
                  aria-label={dict.engineering.close}
                >
                  {selected === activeNode.id ? dict.engineering.close : dict.engineering.expand}
                </button>
              </div>
            ) : (
              <div className="grid items-start gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold tracking-wide text-muted">
                  ⚙
                </div>
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                    {ENGINEERING_CENTER}
                  </div>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">
                    {dict.engineering.centerBlurb}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-muted-more">
                  {dict.engineering.architecture}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
