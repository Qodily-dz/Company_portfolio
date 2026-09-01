"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "@/lib/i18n";

function Statement({
  progress,
  index,
  lead,
  highlight,
  total,
}: {
  progress: MotionValue<number>;
  index: number;
  lead: string;
  highlight: string;
  total: number;
}) {
  const a0 = index / total;
  const a1 = index / total + 0.5 / total;
  const a2 = (index + 1) / total - 0.5 / total;
  const a3 = (index + 1) / total;

  const opacity = useTransform(progress, [a0, a1, a2, a3], [0, 1, 1, 0]);
  const y = useTransform(progress, [a0, a1, a2, a3], [110, 0, 0, -110]);
  const skew = useTransform(progress, [a0, a1, a2, a3], [0.02, 0, 0, -0.012]);
  // Text-mask wipe: the clip window opens upward as the statement enters.
  const clip = useTransform(
    progress,
    [a0, a1],
    ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]
  );
  const blur = useTransform(
    progress,
    [a0, a1],
    ["blur(7px)", "blur(0px)"]
  );

  const number = `0${index + 1}`;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ opacity, y, clipPath: clip, skewX: skew }}
      aria-hidden={index !== total - 1}
    >
      <div className="flex items-baseline gap-4 text-left sm:gap-6">
        <span className="hidden font-mono text-sm text-muted-more md:inline">
          {number}
        </span>
        <div>
          <motion.div
            className="text-[clamp(1.5rem,4.5vw,3rem)] font-medium uppercase leading-tight tracking-[-0.02em] text-muted"
            style={{ filter: blur }}
          >
            {lead}
          </motion.div>
          <motion.div
            className="text-[clamp(2.6rem,10vw,9rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground"
            style={{ filter: blur }}
          >
            {highlight}
            <span aria-hidden className="text-accent">
              {" "}
              .
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/** Deterministic (pure) pseudo-random unit value in [0,1) — avoids the
 *  React Compiler purity rule against calling Math.random during render. */
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: rand(i, 1) * 100,
        top: rand(i, 2) * 100,
        size: 1 + rand(i, 3) * 2,
        delay: rand(i, 4) * 6,
        dur: 7 + rand(i, 5) * 8,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-accent/40"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: d.dur,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function Story() {
  const ref = useRef<HTMLElement | null>(null);
  const dict = useTranslations();
  const statements = dict.story.statements;
  const N = statements.length;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      id="story"
      style={{ height: `${N * 100}vh` }}
      className="relative"
      aria-label="What we do"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Atmosphere backdrop */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,#08080a_0%,#050505_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgba(124,92,255,0.07)_0%,transparent_70%)]"
          aria-hidden
        />
        <Particles />

        {/* Statements */}
        {statements.map((s, i) => (
          <Statement
            key={s.accent}
            progress={scrollYProgress}
            index={i}
            lead={s.prefix}
            highlight={s.accent}
            total={N}
          />
        ))}

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-px w-24 bg-border-strong">
            <motion.div
              className="h-px w-full origin-left bg-accent"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
        <div className="absolute bottom-8 right-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-more">
          {dict.story.scroll}
        </div>
      </div>
    </section>
  );
}
