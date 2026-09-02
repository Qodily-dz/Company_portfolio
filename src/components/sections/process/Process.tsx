"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "@/lib/i18n";

/* ---------------------------------------------------------------------------
 * HOW WE BUILD — an interactive project process.
 *
 * One sticky scroll experience: as you scroll, a single evolving "system"
 * visual moves through six stages (discover → grow). The active stage is
 * highlighted on a linked timeline rail; clicking a stage scrolls straight to
 * it. The timeline + shared scroll progress both drive the central visual, so
 * the active step always controls what you see. Clear, transparent, no
 * six-generic-cards.
 * ------------------------------------------------------------------------- */

type Stage = {
  id: string;
  num: string;
  title: string;
  desc: string;
};

/* The scroll-driven visuals are designed for exactly 6 stages. */
const N = 6;

/* ---------------------------------------------------------------------------
 * Deterministic (pure) pseudo-random — avoids React Compiler purity rule.
 * ------------------------------------------------------------------------- */

function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------------------------------------------------------------------------
 * Layer wrapper — crossfades a stage's central visual across its scroll band.
 * ------------------------------------------------------------------------- */

function StageLayer({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: React.ReactNode;
}) {
  const a0 = index / N;
  const a1 = index / N + 0.42 / N;
  const a2 = (index + 1) / N - 0.42 / N;
  const a3 = (index + 1) / N;
  const opacity = useTransform(progress, [a0, a1, a2, a3], [0, 1, 1, 0]);
  const y = useTransform(progress, [a0, a1, a2, a3], [14, 0, 0, -10]);
  const scale = useTransform(progress, [a0, a1, a2, a3], [0.94, 1, 1, 0.96]);
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, y, scale }}
    >
      {children}
    </motion.div>
  );
}

/* --- 01 DISCOVER — scattered exploration: query nodes + concentric pulses --- */
function DiscoverNode({
  progress,
  x,
  y,
  r,
  index,
}: {
  progress: MotionValue<number>;
  x: number;
  y: number;
  r: number;
  index: number;
}) {
  const opacity = useTransform(progress, [(index * 0.5) / N, (index * 0.5 + 0.8) / N], [0, 1]);
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      fill={index % 3 === 0 ? "#2b5c91" : "#173b68"}
      style={{ opacity }}
    />
  );
}

function DiscoverVisual({ progress }: { progress: MotionValue<number> }) {
  const pulse = useTransform(progress, [0, 1 / N, 2 / N], [0, 1, 0]);
  const coreOpacity = useTransform(progress, [0, 0.02 / N], [0, 1]);
  const nodes = Array.from({ length: 9 }, (_, i) => ({
    x: 30 + rand(i, 7) * 340,
    y: 40 + rand(i, 9) * 320,
    r: 4 + rand(i, 11) * 3,
  }));
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      <g style={{ transformOrigin: "200px 200px" }}>
        <motion.circle
          cx="200"
          cy="200"
          fill="none"
          stroke="#173b68"
          strokeWidth="1"
          style={{ scale: pulse, opacity: pulse }}
          r="30"
        />
        <motion.circle
          cx="200"
          cy="200"
          fill="none"
          stroke="#2b5c91"
          strokeWidth="1"
          style={{ scale: pulse, opacity: pulse }}
          r="70"
        />
        <motion.circle
          cx="200"
          cy="200"
          fill="none"
          stroke="#173b68"
          strokeWidth="1"
          style={{ scale: pulse, opacity: pulse }}
          r="110"
        />
      </g>
      <motion.circle cx="200" cy="200" r="6" fill="#2b5c91" style={{ opacity: coreOpacity }} />
      {nodes.map((n, i) => (
        <DiscoverNode key={i} progress={progress} x={n.x} y={n.y} r={n.r} index={i} />
      ))}
      {/* query glyphs */}
      {[0, 3, 6].map((i) => (
        <text
          key={i}
          x={nodes[i].x - 9}
          y={nodes[i].y + 5}
          fontSize="11"
          fill="#7d8795"
          fontFamily="monospace"
        >
          ?
        </text>
      ))}
    </svg>
  );
}

/* --- 02 STRATEGIZE — scattered dots snap into a directed plan --- */
function PlanDot({
  progress,
  a0,
  a1,
  sx,
  sy,
  tx,
  ty,
  fill,
}: {
  progress: MotionValue<number>;
  a0: number;
  a1: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  fill: string;
}) {
  const cx = useTransform(progress, [a0, a1], [sx, tx]);
  const cy = useTransform(progress, [a0, a1], [sy, ty]);
  return <motion.circle cx={cx} cy={cy} r="5" fill={fill} />;
}

function StrategizeVisual({ progress }: { progress: MotionValue<number> }) {
  const plan: Array<{ sx: number; sy: number; tx: number; ty: number }> = [
    { sx: 60, sy: 320, tx: 130, ty: 270 },
    { sx: 330, sy: 80, tx: 270, ty: 150 },
    { sx: 40, sy: 60, tx: 130, ty: 140 },
    { sx: 350, sy: 330, tx: 270, ty: 270 },
    { sx: 190, sy: 340, tx: 200, ty: 200 },
  ];
  const a0 = 1 / N + 0.1 / N;
  const a1 = 2 / N - 0.2 / N;
  const path = useTransform(progress, [a0, a1], [0, 1]);
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      {/* structured plan paths */}
      <motion.path
        d={`M ${plan[0].tx} ${plan[0].ty} L ${plan[2].tx} ${plan[2].ty} L ${plan[4].tx} ${plan[4].ty} L ${plan[1].tx} ${plan[1].ty} L ${plan[3].tx} ${plan[3].ty}`}
        fill="none"
        stroke="#173b68"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ pathLength: path, opacity: path }}
      />
      {plan.map((p, i) => (
        <PlanDot
          key={i}
          progress={progress}
          a0={a0}
          a1={a1}
          sx={p.sx}
          sy={p.sy}
          tx={p.tx}
          ty={p.ty}
          fill={i % 2 === 0 ? "#2b5c91" : "#173b68"}
        />
      ))}
    </svg>
  );
}

/* --- 03 DESIGN — a clean interface wireframe assembles --- */
function DesignVisual({ progress }: { progress: MotionValue<number> }) {
  const fill = useTransform(progress, [2 / N + 0.08 / N, (2 + 0.8) / N], [0, 1]);
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      <motion.g style={{ opacity: fill }}>
        {/* browser frame */}
        <rect x="110" y="70" width="180" height="260" rx="10" fill="#070a0f" stroke="#273247" strokeWidth="1" />
        <circle cx="125" cy="86" r="4" fill="#173b68" />
        <circle cx="138" cy="86" r="4" fill="#2b5c91" />
        <circle cx="151" cy="86" r="4" fill="#173b68" />
        <rect x="110" y="104" width="180" height="8" rx="4" fill="#2b5c91" opacity="0.8" />
        <rect x="122" y="132" width="60" height="60" rx="6" fill="#101722" stroke="#273247" strokeWidth="1" />
        <rect x="192" y="132" width="86" height="28" rx="6" fill="#101722" stroke="#273247" strokeWidth="1" />
        <rect x="192" y="168" width="60" height="24" rx="6" fill="#101722" stroke="#273247" strokeWidth="1" />
        <rect x="122" y="210" width="156" height="8" rx="4" fill="#273247" />
        <rect x="122" y="226" width="120" height="8" rx="4" fill="#273247" />
        <rect x="122" y="242" width="140" height="8" rx="4" fill="#273247" />
        <rect x="122" y="288" width="156" height="26" rx="8" fill="#2b5c91" opacity="0.9" />
      </motion.g>
    </svg>
  );
}

/* --- 04 BUILD — stacked layers carry packets between them --- */
function BuildVisual({ progress }: { progress: MotionValue<number> }) {
  const fill = useTransform(progress, [3 / N + 0.06 / N, (3 + 0.8) / N], [0, 1]);
  const p1 = useTransform(progress, [3.2 / N, (3.2 + 0.5) / N], [0, 1]);
  const p2 = useTransform(progress, [3.5 / N, (3.5 + 0.5) / N], [0, 1]);
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      <motion.g style={{ opacity: fill }}>
        {[70, 150, 230].map((y, i) => (
          <g key={i}>
            <rect x="130" y={y} width="140" height="58" rx="8" fill="#070a0f" stroke="#173b68" strokeWidth="1" opacity="0.8" />
            <rect x="144" y={y + 12} width="60" height="6" rx="3" fill="#273247" />
            <rect x="144" y={y + 26} width="90" height="6" rx="3" fill="#273247" />
          </g>
        ))}
        {/* connecting packets */}
        <g>
          <motion.line x1="200" y1="130" x2="200" y2="150" stroke="#2b5c91" strokeWidth="2" style={{ opacity: p1 }} />
          <motion.line x1="200" y1="210" x2="200" y2="230" stroke="#2b5c91" strokeWidth="2" style={{ opacity: p1 }} />
        </g>
      </motion.g>
      {/* moving packet dots */}
      <motion.circle
        cx="200"
        cy={useTransform(progress, [3.15 / N, 3.65 / N], [130, 230])}
        r="4"
        fill="#2b5c91"
        style={{ opacity: p2 }}
      />
    </svg>
  );
}

/* --- 05 LAUNCH — a beam rises through, then a live check --- */
function LaunchVisual({ progress }: { progress: MotionValue<number> }) {
  const rise = useTransform(progress, [4 / N + 0.1 / N, (4 + 0.7) / N], [330, 70]);
  const beam = useTransform(progress, [4 / N, (4 + 0.4) / N], [0, 1]);
  const live = useTransform(progress, [(4 + 0.55) / N, (4 + 0.8) / N], [0, 1]);
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      <motion.line x1="200" y1="360" x2="200" y2="40" stroke="#173b68" strokeWidth="1" style={{ opacity: beam }} />
      <motion.g style={{ opacity: live }}>
        <circle cx="200" cy="160" r="26" fill="none" stroke="#2b5c91" strokeWidth="2" />
        <path
          d="M 188 160 l 9 9 l 16 -18"
          fill="none"
          stroke="#2b5c91"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.circle cx="200" cy={rise} r="6" fill="#2b5c91" style={{ opacity: useTransform(progress, [4 / N, (4 + 0.7) / N], [0, 1]) }} />
    </svg>
  );
}

/* --- 06 GROW — a curve climbs with rising bars --- */
function GrowBar({
  progress,
  x,
  h,
  fill,
}: {
  progress: MotionValue<number>;
  x: number;
  h: number;
  fill: string;
}) {
  const draw = useTransform(progress, [5 / N, (5 + 0.7) / N], [0, 1]);
  const y = useTransform(progress, [5 / N, (5 + 0.7) / N], [320 - h, 320]);
  return <motion.rect x={x} y={y} width="20" height={h} rx="4" fill={fill} style={{ opacity: draw }} />;
}

function GrowVisual({ progress }: { progress: MotionValue<number> }) {
  const draw = useTransform(progress, [5 / N + 0.08 / N, (5 + 0.7) / N], [0, 1]);
  const markerOpacity = useTransform(progress, [(5 + 0.6) / N, (5 + 0.8) / N], [0, 1]);
  const bars = [150, 210, 240, 285, 320];
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" className="max-h-[340px]">
      {bars.map((h, i) => (
        <GrowBar
          key={i}
          progress={progress}
          x={110 + i * 38}
          h={h}
          fill={i % 2 === 0 ? "#173b68" : "#2b5c91"}
        />
      ))}
      <motion.path
        d="M 100 300 C 150 290 175 240 220 220 C 260 205 300 250 330 180"
        fill="none"
        stroke="#2b5c91"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ pathLength: draw, opacity: draw }}
      />
      <motion.circle cx="330" cy="180" r="5" fill="#173b68" style={{ opacity: markerOpacity }} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Timeline rail — linked stages; active highlighted, click to navigate.
 * ------------------------------------------------------------------------- */

function Rail({
  stages,
  active,
  onSelect,
}: {
  stages: Stage[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <ol className="relative flex flex-col gap-1">
      <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px bg-border-strong" />
      {stages.map((s, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <li key={s.id} className="relative">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isActive ? "step" : undefined}
              className="group flex w-full items-center gap-4 rounded-lg px-1 py-2 text-left"
            >
              <span
                aria-hidden
                className={`relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-background"
                    : isDone
                      ? "border-accent/50 text-accent"
                      : "border-border-strong bg-surface text-muted"
                }`}
              >
                {s.num}
              </span>
              <span className="flex flex-col">
                <span
                  className={`text-sm font-medium uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-foreground" : "text-muted"
                  }`}
                >
                  {s.title}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------------------------------------------------------------------
 * Section
 * ------------------------------------------------------------------------- */

export function Process() {
  const ref = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const dict = useTranslations();
  const STAGES: Stage[] = dict.process.stages;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.max(0, Math.min(N - 1, Math.floor(v * N)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const scrollable = Math.max(el.offsetHeight - window.innerHeight, 0);
    window.scrollTo({ top: docTop + scrollable * ((i + 0.5) / N), behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      id="process"
      style={{ height: `${N * 100}vh` }}
      className="relative"
      aria-label="How we build — project process"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-[#030405]">
        {/* atmosphere */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_40%,#0b1018_0%,#030405_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_70%_50%,rgba(43,92,145,0.08)_0%,transparent_70%)]"
          aria-hidden
        />

        <div ref={containerRef} className="grid h-full items-center md:grid-cols-[15rem_1fr]">
          {/* Left: headline + rail */}
          <div className="flex h-full flex-col justify-center gap-6 px-6 py-6 md:justify-between md:px-10 md:py-14">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {dict.process.label}
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-medium uppercase leading-[0.95] tracking-[-0.02em] text-foreground md:text-4xl">
                {dict.process.heading1}
                <br />
                <span className="text-accent">{dict.process.heading2}</span>
              </h2>
            </div>

            <div className="mt-6 hidden md:block">
              <Rail stages={STAGES} active={active} onSelect={goTo} />
            </div>
          </div>

          {/* Right: the central evolving visual + active description */}
          <div className="relative flex h-full flex-col justify-center gap-4 px-6 py-4 md:gap-6 md:px-10 md:py-14">
            {/* central visual — crossfading stage scenes */}
            <div className="relative mx-auto h-[200px] w-full max-w-[280px] sm:h-[240px] sm:max-w-[340px] md:h-[340px] md:max-w-[440px]">
              <StageLayer progress={scrollYProgress} index={0}>
                <DiscoverVisual progress={scrollYProgress} />
              </StageLayer>
              <StageLayer progress={scrollYProgress} index={1}>
                <StrategizeVisual progress={scrollYProgress} />
              </StageLayer>
              <StageLayer progress={scrollYProgress} index={2}>
                <DesignVisual progress={scrollYProgress} />
              </StageLayer>
              <StageLayer progress={scrollYProgress} index={3}>
                <BuildVisual progress={scrollYProgress} />
              </StageLayer>
              <StageLayer progress={scrollYProgress} index={4}>
                <LaunchVisual progress={scrollYProgress} />
              </StageLayer>
              <StageLayer progress={scrollYProgress} index={5}>
                <GrowVisual progress={scrollYProgress} />
              </StageLayer>
            </div>

            {/* active stage description */}
            <div className="relative mx-auto w-full max-w-[440px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {STAGES[active].num} / {N}
                  </div>
                  <div className="text-lg font-medium uppercase tracking-[0.08em] text-foreground">
                    {STAGES[active].title}
                  </div>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                    {STAGES[active].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* bottom scroll hint + progress */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3 md:left-10">
          <div className="h-px w-24 bg-border-strong">
            <motion.div
              className="h-px w-full origin-left bg-accent"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-more">{dict.common.scroll}</span>
        </div>
        <div className="absolute bottom-6 right-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-more md:right-10">
          {STAGES[active].num} / 06
        </div>
      </div>
    </section>
  );
}
