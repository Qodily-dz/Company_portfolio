"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PILLARS, type PillarId } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Per-pillar "environment" identity shown above the switcher. */
const ENV: Record<PillarId, { code: string; meta: string }> = {
  build: { code: "01 · SYSTEM ARCHITECTURE", meta: "nodes · connections · grids · APIs" },
  design: { code: "02 · DIGITAL COMPOSITION", meta: "grid · type · panels · layout" },
  grow: { code: "03 · DATA FLOW", meta: "attention · engagement · leads · growth" },
};

const HINT: Record<PillarId, string> = {
  build: "Hover the network — drag a node.",
  design: "Move your cursor — the composition rearranges.",
  grow: "Move your cursor — the flow bends toward it.",
};

function matchPillar(tPillars: Dictionary["servicesData"]["pillars"], label: string) {
  return tPillars.find(
    (tp: { label: string }) => tp.label.toLowerCase() === label.toLowerCase()
  );
}

/** An individual service rendered in its environment's idiom. */
function ServiceChip({ text, tone = "node" }: { text: string; tone?: "node" | "block" | "stream" }) {
  if (tone === "block") {
    // DESIGN — composition block, varied in size by length.
    const size =
      text.length > 14 ? "md:col-span-2" : text.length > 8 ? "md:col-span-1" : "md:col-span-1";
    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={cn(
          "rounded-lg border border-border bg-surface/50 px-4 py-4 text-sm font-medium text-foreground-soft transition-colors hover:border-accent hover:text-foreground",
          size
        )}
      >
        {text}
      </motion.div>
    );
  }
  if (tone === "stream") {
    // GROW — a flowing node with a leading pulse dot.
    return (
      <motion.span
        whileHover={{ x: 4 }}
        className="inline-flex items-center gap-2.5 rounded-full border border-border bg-white/[0.02] px-4 py-2 text-sm text-foreground-soft transition-colors hover:border-accent hover:text-foreground"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        {text}
      </motion.span>
    );
  }
  // BUILD — architecture node (compact card with a pin).
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-2.5 rounded-md border border-border bg-surface/40 px-3.5 py-2.5 text-sm text-foreground-soft transition-colors hover:border-accent hover:text-foreground"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-[2px] bg-accent" />
      {text}
    </motion.div>
  );
}

type ServicesEnvironmentProps = {
  active: PillarId;
  onChange: (id: PillarId) => void;
  dict: Dictionary;
};

/**
 * The three interactive environments (BUILD / DESIGN / GROW) rendered as a
 * premium switchable experience. The selected pillar is shown as a distinct
 * editorial environment — not a generic card — with its own metaphor for the
 * service list (architecture nodes, composition blocks, or a directional
 * data-flow funnel). The 3D background (morphed by `active`) lives in the
 * parent; the environment panel sits above it.
 */
export function ServicesEnvironment({ active, onChange, dict }: ServicesEnvironmentProps) {
  const tPillars = dict.servicesData.pillars;

  return (
    <div>
      {/* Environment switcher — segmented, not button rectangles */}
      <div className="flex flex-wrap items-center gap-2">
        {PILLARS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              aria-pressed={on}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium uppercase tracking-[0.1em] transition-colors",
                on
                  ? "border-accent text-foreground"
                  : "border-border-strong text-muted hover:border-accent hover:text-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "font-mono text-xs",
                  on ? "text-accent" : "text-muted-more group-hover:text-accent"
                )}
              >
                {p.index}
              </span>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Active environment */}
      <div className="mt-10 border-t border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pt-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-accent">
                  {ENV[active].code}
                </div>
                <h2 className="mt-3 text-[clamp(2.6rem,7vw,5.5rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
                  {matchPillar(tPillars, PILLARS.find((p) => p.id === active)!.label)?.label ??
                    PILLARS.find((p) => p.id === active)!.label}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">
                  {matchPillar(tPillars, PILLARS.find((p) => p.id === active)!.label)?.tagline ??
                    ""}
                </p>
              </div>
              <p className="max-w-xs text-right font-mono text-xs leading-relaxed text-muted-more">
                {ENV[active].meta}
              </p>
            </div>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {matchPillar(tPillars, PILLARS.find((p) => p.id === active)!.label)?.lede ?? ""}
            </p>

            {/* Environment-specific body */}
            {active === "grow" ? (
              <div className="mt-9">
                {/* Directional funnel: ATTENTION → … → GROWTH */}
                <div className="inline-flex flex-col gap-2">
                  {getGrowFunnel().map((stage, i) => {
                    const t = PILLARS.find((p) => p.id === "grow");
                    const label = t?.funnel?.[i] ?? stage;
                    const last = i === (t?.funnel?.length ?? 1) - 1;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i, duration: 0.3, ease: EASE }}
                          className={cn(
                            "inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-sm font-medium",
                            last
                              ? "border-accent text-foreground"
                              : "border-border bg-white/[0.02] text-muted"
                          )}
                        >
                          {i + 1}.
                          <span className={last ? "text-accent-soft" : ""}>{label}</span>
                        </motion.span>
                        {!last && (
                          <span aria-hidden className="text-muted-more">
                            ↓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* GROW services — flowing stream */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {(matchPillar(tPillars, PILLARS.find((p) => p.id === "grow")!.label)
                    ?.services ?? []
                  ).map((s) => (
                    <ServiceChip key={s} text={s} tone="stream" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-9">
                <div
                  className={cn(
                    "grid gap-2.5",
                    active === "design"
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
                  )}
                >
                  {(matchPillar(tPillars, PILLARS.find((p) => p.id === active)!.label)
                    ?.services ?? []
                  ).map((s) => (
                    <ServiceChip
                      key={s}
                      text={s}
                      tone={active === "design" ? "block" : "node"}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Interaction hint */}
            <p className="mt-9 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-more">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {HINT[active]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Funnel labels (from services.ts, directive order). */
function getGrowFunnel(): readonly string[] {
  return PILLARS.find((p) => p.id === "grow")?.funnel ?? ["Attention", "Engagement", "Leads", "Customers", "Growth"];
}
