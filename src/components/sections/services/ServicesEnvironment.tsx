"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PILLARS, type PillarId } from "@/lib/services";
import type { Dictionary } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

type ServicesEnvironmentProps = {
  active: PillarId;
  onChange: (id: PillarId) => void;
  dict: Dictionary;
};

function getPillar(dict: Dictionary, id: PillarId) {
  const index = PILLARS.findIndex((item) => item.id === id);
  return dict.servicesData.pillars[index >= 0 ? index : 0] ?? dict.servicesData.pillars[0];
}

/**
 * Capability console — a deliberately asymmetric service interface. The three
 * disciplines are not treated as generic cards; they are adjacent operating
 * modes in one system, with the selected mode opening its own service matrix.
 */
export function ServicesEnvironment({ active, onChange, dict }: ServicesEnvironmentProps) {
  const selected = getPillar(dict, active);
  const selectedBase = PILLARS.find((item) => item.id === active) ?? PILLARS[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-2 md:grid-cols-3">
        {PILLARS.map((pillar) => {
          const isActive = pillar.id === active;
          const copy = getPillar(dict, pillar.id);
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onChange(pillar.id)}
              onPointerEnter={() => onChange(pillar.id)}
              aria-pressed={isActive}
              className={"group relative min-h-32 overflow-hidden rounded-xl border p-5 text-left transition-all duration-500 " + (isActive ? "border-accent/70 bg-accent/10" : "border-border bg-background/30 hover:border-border-strong hover:bg-surface/40")}
            >
              <span className={"absolute -right-1 -top-6 font-mono text-8xl font-semibold leading-none " + (isActive ? "text-accent/[0.12]" : "text-foreground/[0.035]")} aria-hidden>{pillar.index}</span>
              <span className={"relative block font-mono text-[10px] uppercase tracking-[0.2em] " + (isActive ? "text-accent" : "text-muted-more")}>{copy.tagline}</span>
              <span className={"relative mt-7 block text-2xl font-medium uppercase tracking-[-0.03em] " + (isActive ? "text-foreground" : "text-muted")}>{copy.label}</span>
              <span className={"absolute bottom-5 right-5 text-lg transition-transform duration-300 " + (isActive ? "text-accent" : "text-muted-more group-hover:translate-x-0.5")} aria-hidden>{isActive ? "—" : "↗"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(20,42,74,0.72),rgba(11,16,24,0.82)_46%,rgba(3,4,5,0.85))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="grid lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="relative border-b border-border p-7 md:p-10 lg:border-b-0 lg:border-r">
              <span className="font-mono text-xs tracking-[0.22em] text-accent">{selectedBase.index} / {dict.footer.capabilities}</span>
              <h2 className="mt-5 text-[clamp(3.5rem,8vw,7rem)] font-medium uppercase leading-[0.82] tracking-[-0.06em] text-foreground">{selected.label}</h2>
              <div className="mt-8 h-px w-16 bg-accent/70" aria-hidden />
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{selected.lede}</p>
              <div className="mt-12 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-more"><span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />{selected.tagline}</div>
            </div>

            <div className="p-5 md:p-7 lg:p-10">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-more">{dict.footer.capabilities}</span>
                <span className="font-mono text-xs text-accent">{String(selected.services.length).padStart(2, "0")}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selected.services.map((service, index) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.035, ease: EASE }}
                    className={"group rounded-lg border border-border bg-background/30 p-3.5 transition-colors hover:border-accent/60 hover:bg-accent/10 " + (index === 0 ? "sm:col-span-2" : "")}
                  >
                    <span className="font-mono text-[10px] text-accent/80">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mt-5 block text-sm font-medium leading-tight text-foreground-soft transition-colors group-hover:text-foreground">{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
