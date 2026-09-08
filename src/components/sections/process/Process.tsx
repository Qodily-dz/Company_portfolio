"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";
import { useTranslations } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;
type Stage = ReturnType<typeof useTranslations>["process"]["stages"][number];

function SystemMap({ active, total }: { active: number; total: number }) {
  const points = Array.from({ length: total }, (_, index) => 42 + index * (396 / (total - 1)));
  return (
    <svg viewBox="0 0 480 120" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="process-line" x1="0" x2="1"><stop offset="0" stopColor="#173b68" stopOpacity="0.2" /><stop offset="0.5" stopColor="#4a8fd8" stopOpacity="0.8" /><stop offset="1" stopColor="#173b68" stopOpacity="0.2" /></linearGradient>
        <filter id="process-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d="M42 60 H438" stroke="#1c2638" strokeWidth="1" />
      <motion.path d="M42 60 H438" stroke="url(#process-line)" strokeWidth="1.5" initial={false} animate={{ pathLength: (active + 1) / total }} transition={{ duration: 0.5, ease: EASE }} />
      {points.map((x, index) => {
        const selected = index === active;
        return <g key={x}>
          <motion.circle cx={x} cy="60" r={selected ? 13 : 7} fill={selected ? "#0b1d35" : "#070a0f"} stroke={selected || index < active ? "#4a8fd8" : "#2c3a52"} strokeWidth={selected ? 2 : 1}
            animate={{ scale: selected ? [1, 1.14, 1] : 1 }} transition={selected ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }} style={{ transformOrigin: x + "px 60px" }} />
          {selected && <circle cx={x} cy="60" r="3" fill="#5fa3e0" filter="url(#process-glow)" />}
        </g>;
      })}
      <motion.circle cy="60" r="3.5" fill="#5fa3e0" filter="url(#process-glow)" initial={false} animate={{ cx: points[active] }} transition={{ duration: 0.5, ease: EASE }} />
    </svg>
  );
}

function DetailPanel({ stage }: { stage: Stage }) {
  const dict = useTranslations();
  return <AnimatePresence mode="wait">
    <motion.div key={stage.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }} className="relative overflow-hidden rounded-2xl border border-border bg-surface/70 p-6 shadow-[0_20px_80px_-50px_rgba(74,143,216,0.7)] md:p-9">
      <span className="pointer-events-none absolute -right-3 -top-7 font-mono text-[9rem] font-semibold leading-none text-foreground/[0.035]" aria-hidden>{stage.num}</span>
      <div className="relative flex items-start justify-between gap-6"><div><div className="font-mono text-xs font-medium tracking-[0.18em] text-accent">{stage.num} / 06</div><h2 className="mt-3 text-[clamp(2rem,5vw,4rem)] font-medium uppercase leading-none tracking-[-0.035em] text-foreground">{stage.title}</h2></div><span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-accent shadow-[0_0_16px_var(--color-accent)]" aria-hidden /></div>
      <p className="relative mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{stage.desc}</p>
      <div className="relative mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/35 p-5"><h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{dict.process.whatWeDo}</h3><ul className="mt-4 space-y-2.5">{stage.whatWeDo.map((item) => <li key={item} className="flex gap-2 text-sm leading-snug text-foreground-soft"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />{item}</li>)}</ul></div>
        <div className="rounded-xl border border-border bg-background/35 p-5"><h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{dict.process.deliverables}</h3><ul className="mt-4 space-y-2.5">{stage.deliverables.map((item) => <li key={item} className="flex gap-2 text-sm leading-snug text-foreground-soft"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-more" />{item}</li>)}</ul></div>
      </div>
      {stage.technologies.length > 0 && <div className="relative mt-6 border-t border-border pt-5"><h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-more">{dict.process.technologies}</h3><div className="mt-3 flex flex-wrap gap-2">{stage.technologies.map((tech) => <span key={tech} className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1.5 font-mono text-[11px] text-accent-soft">{tech}</span>)}</div></div>}
    </motion.div>
  </AnimatePresence>;
}

/** Interactive delivery control room: choose a phase to inspect its work and outputs. */
export function Process() {
  const dict = useTranslations();
  const stages = dict.process.stages;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % stages.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reduced, stages.length]);
  return <section id="process" className="relative overflow-hidden bg-background pb-24 pt-14 md:pb-32 md:pt-20" aria-label={dict.process.heading1 + " " + dict.process.heading2}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_76%_24%,rgba(43,108,181,0.16),transparent_72%)]" aria-hidden />
    <Container className="relative z-10" size="xl">
      <div className="rounded-2xl border border-border bg-secondary/55 p-5 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-more"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{dict.process.label}</div><span className="font-mono text-xs tabular-nums text-accent">{stages[active].num} / 06</span></div><div className="mt-7"><SystemMap active={active} total={stages.length} /></div></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{stages.map((stage, index) => {
        const selected = index === active;
        const stateClass = selected ? "border-accent/60 bg-accent/10 shadow-[0_12px_35px_-24px_rgba(74,143,216,0.8)]" : "border-border bg-surface/25 hover:border-border-strong hover:bg-surface/60";
        return <button key={stage.id} type="button" onClick={() => setActive(index)} aria-pressed={selected} className={"group flex min-h-24 items-end justify-between rounded-xl border p-4 text-left transition-all duration-300 " + stateClass}>
          <span><span className={"block font-mono text-[11px] " + (selected ? "text-accent" : "text-muted-more")}>{stage.num}</span><span className={"mt-3 block text-lg font-medium uppercase tracking-[-0.02em] " + (selected ? "text-foreground" : "text-muted")}>{stage.title}</span></span><span className={"text-lg transition-transform duration-300 " + (selected ? "text-accent" : "text-muted-more group-hover:translate-x-0.5")} aria-hidden>{selected ? "—" : "↗"}</span>
        </button>;
      })}</div>
      <div className="mt-8"><DetailPanel stage={stages[active]} /></div>
    </Container>
  </section>;
}
