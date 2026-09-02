"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Parallax — scroll parallax depth wrapper (scroll interaction).
 *
 * Content inside drifts along a `range` (0..1 of its own height) as the page
 * scrolls past, giving layering depth without movement when
 * prefers-reduced-motion. Ideal for slow backgrounds behind foreground copy.
 * ------------------------------------------------------------------------- */

type ParallaxProps = {
  children: ReactNode;
  /** Fraction of the element's height it drifts by (0..1). */
  range?: number;
  className?: string;
};

export function Parallax({ children, range = 0.12, className }: ParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const distance = reduced ? 0 : range * 100;
  const y: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    [distance, -distance]
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}