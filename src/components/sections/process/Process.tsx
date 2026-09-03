"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout";
import { useTranslations } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * Process — HOW WE TURN IDEAS INTO IMPACT.
 *
 * Click-driven two-column layout:
 *   LEFT  — sticky step navigation (01–06) with vertical progress
 *   RIGHT — active panel with step info, WHAT WE DO, DELIVERABLES,
 *           TECHNOLOGIES, and a single evolving SVG visual.
 *
 * NOT scroll-driven (no 600vh). The whole section fits in ~100vh.
 * Clicking a step changes the panel content immediately.
 * One visual system evolves through all six stages.
 * Mobile: stacked horizontal progress + panel.
 * ------------------------------------------------------------------------- */

type Stage = {
  id: string;
  num: string;
  title: string;
  desc: string;
  whatWeDo: string[];
  deliverables: string[];
  technologies: string[];
};

const N = 6;

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------------------
 * Evolving SVG visual — one system that transforms per stage.
 * ------------------------------------------------------------------------- */

function ProcessVisual({ active }: { active: number }) {
  const stageProgress = active / (N - 1);

  /* Node positions shift from scattered (discover) → organized (grow) */
  const nodePositions = useMemo(() => {
    const scattered = [
      [60, 50], [340, 40], [40, 180], [370, 200],
      [100, 320], [310, 330], [200, 170],
    ];
    const organized = [
      [80, 60], [400, 60], [80, 190], [400, 190],
      [80, 320], [400, 320], [240, 190],
    ];
    return scattered.map((s, i) => {
      const t = stageProgress;
      return [
        s[0] + (organized[i][0] - s[0]) * t,
        s[1] + (organized[i][1] - s[1]) * t,
      ];
    });
  }, [stageProgress]);

  /* Connections strengthen as we progress */
  const edgeOpacity = 0.15 + stageProgress * 0.6;
  const nodeSize = 4 + stageProgress * 3;

  /* Stage-specific visual elements */
  const showWireframe = active >= 2;
  const showArchitecture = active >= 3;
  const showComplete = active >= 4;
  const showGrowth = active >= 5;

  return (
    <svg viewBox="0 0 480 380" className="w-full h-auto" aria-hidden>
      {/* Grid — appears in Design stage */}
      {showWireframe && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 0.6 }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`gv-${i}`} x1={48 * i} y1="0" x2={48 * i} y2="380" stroke="#2b5c91" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`gh-${i}`} x1="0" y1={47.5 * i} x2="480" y2={47.5 * i} stroke="#2b5c91" strokeWidth="0.5" />
          ))}
        </motion.g>
      )}

      {/* Edges */}
      {[
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [0, 1], [2, 3], [4, 5],
      ].map(([a, b], i) => (
        <motion.line
          key={`e-${i}`}
          x1={nodePositions[a][0]}
          y1={nodePositions[a][1]}
          x2={nodePositions[b][0]}
          y2={nodePositions[b][1]}
          stroke="#2b5c91"
          strokeWidth={active >= 3 ? 1.2 : 0.6}
          initial={{ opacity: 0 }}
          animate={{ opacity: edgeOpacity }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
        />
      ))}

      {/* Architecture boxes — appear in Build stage */}
      {showArchitecture && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.5 }}
        >
          <rect x="170" y="120" width="140" height="140" rx="8" fill="none" stroke="#173b68" strokeWidth="0.8" />
          <rect x="190" y="140" width="50" height="30" rx="4" fill="#0b1d35" stroke="#1a2540" strokeWidth="0.5" />
          <rect x="244" y="140" width="50" height="30" rx="4" fill="#0b1d35" stroke="#1a2540" strokeWidth="0.5" />
          <rect x="190" y="178" width="104" height="20" rx="4" fill="#0b1d35" stroke="#1a2540" strokeWidth="0.5" />
        </motion.g>
      )}

      {/* Nodes */}
      {nodePositions.map((pos, i) => {
        const isCenter = i === 6;
        return (
          <motion.g key={i}>
            <motion.circle
              cx={pos[0]}
              cy={pos[1]}
              r={isCenter ? nodeSize + 4 : nodeSize}
              fill={isCenter ? "#0b1d35" : "#070a0f"}
              stroke={isCenter ? "#2b5c91" : "#1a2540"}
              strokeWidth={isCenter ? 1.5 : 1}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{ transformOrigin: `${pos[0]}px ${pos[1]}px` }}
            />
            <motion.circle
              cx={pos[0]}
              cy={pos[1]}
              r={isCenter ? 3 : 1.5}
              fill="#2b5c91"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
            />
          </motion.g>
        );
      })}

      {/* Growth rings — appear in Grow stage */}
      {showGrowth && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <circle cx="240" cy="190" r="140" fill="none" stroke="#173b68" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="240" cy="190" r="170" fill="none" stroke="#173b68" strokeWidth="0.3" strokeDasharray="6 6" />
        </motion.g>
      )}

      {/* Launch check — appears in Launch stage */}
      {showComplete && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ transformOrigin: "240px 190px" }}
        >
          <circle cx="240" cy="190" r="18" fill="none" stroke="#2b5c91" strokeWidth="1.5" />
          <path
            d="M231 190 l6 6 l12 -14"
            fill="none"
            stroke="#2b5c91"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      )}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Active panel — step details with WHAT WE DO / DELIVERABLES / TECH.
 * ------------------------------------------------------------------------- */

function ActivePanel({ stage }: { stage: Stage }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col"
      >
        {/* Step indicator */}
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm tracking-[0.15em] text-accent">
            {stage.num} / 06
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-3xl font-medium uppercase tracking-[-0.01em] text-foreground md:text-4xl">
          {stage.title}
        </h3>

        {/* Description */}
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
          {stage.desc}
        </p>

        {/* WHAT WE DO + DELIVERABLES side by side */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              What we do
            </h4>
            <ul className="mt-3 flex flex-col gap-1.5">
              {stage.whatWeDo.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground-soft">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Deliverables
            </h4>
            <ul className="mt-3 flex flex-col gap-1.5">
              {stage.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground-soft">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-more/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TECHNOLOGIES (if any) */}
        {stage.technologies.length > 0 && (
          <div className="mt-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Technologies
            </h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stage.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-white/[0.02] px-2.5 py-1 text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------------
 * Section
 * ------------------------------------------------------------------------- */

export function Process() {
  const [active, setActive] = useState(0);
  const dict = useTranslations();
  const STAGES: Stage[] = dict.process.stages;

  const goTo = useCallback((i: number) => {
    setActive(i);
  }, []);

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-background"
      aria-label="How we turn ideas into impact"
    >
      {/* Subtle atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_70%_40%,rgba(11,29,53,0.3)_0%,transparent_70%)]"
        aria-hidden
      />

      <Container className="relative z-10 py-20 md:py-28" size="xl">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            <span>{dict.process.label}</span>
          </div>
          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.02em] text-foreground">
            {dict.process.heading1}{" "}
            <span className="text-accent">{dict.process.heading2}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {dict.process.subtitle}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
          {/* LEFT — Sticky step navigation */}
          <div className="md:sticky md:top-28 md:self-start">
            <nav aria-label="Process steps">
              <ol className="relative flex flex-col gap-0.5">
                {/* Vertical progress line */}
                <span
                  aria-hidden
                  className="absolute bottom-3 left-[11px] top-3 w-px bg-border-strong"
                />
                <motion.span
                  aria-hidden
                  className="absolute left-[11px] top-3 w-px bg-accent origin-top"
                  animate={{
                    height: `${(active / (N - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ maxHeight: "calc(100% - 12px)" }}
                />

                {STAGES.map((s, i) => {
                  const isActive = i === active;
                  const isDone = i < active;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={isActive ? "step" : undefined}
                        className="group flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors"
                      >
                        <span
                          aria-hidden
                          className={`relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors ${
                            isActive
                              ? "border-accent bg-accent text-background"
                              : isDone
                                ? "border-accent/50 text-accent"
                                : "border-border-strong bg-surface text-muted"
                          }`}
                        >
                          {s.num}
                        </span>
                        <span
                          className={`text-sm font-medium tracking-[0.06em] transition-colors ${
                            isActive
                              ? "text-foreground"
                              : "text-muted group-hover:text-foreground-soft"
                          }`}
                        >
                          {s.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* RIGHT — Active panel + visual */}
          <div className="flex flex-col gap-8">
            {/* Evolving visual */}
            <div className="w-full max-w-[480px]">
              <ProcessVisual active={active} />
            </div>

            {/* Active panel */}
            <ActivePanel stage={STAGES[active]} />
          </div>
        </div>
      </Container>
    </section>
  );
}
