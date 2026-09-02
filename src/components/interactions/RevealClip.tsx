"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * RevealClip — clip-path reveal on scroll (scroll interaction).
 *
 * A masked region slides open bottom-up as the block enters the viewport —
 * a structured "unveiling" for imagery or panels. No-op under
 * prefers-reduced-motion (content renders immediately).
 * ------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealClipProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
};

export function RevealClip({ children, className, duration = 850 }: RevealClipProps) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="h-full w-full"
        initial={reduced ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
        whileInView={
          reduced ? undefined : { clipPath: "inset(0% 0% 0% 0%)" }
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reduced ? 0 : duration, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}