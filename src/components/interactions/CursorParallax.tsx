"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * CursorParallax — cursor-driven preview parallax (hover interaction).
 *
 * Content inside shifts opposite the cursor's position within the box —
 * layered depth for preview visuals. Springs settle on leave and the centre
 * is the rest point. No-op under prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

type CursorParallaxProps = {
  children: ReactNode;
  /** Max shift in px from the resting centre. */
  range?: number;
  className?: string;
};

export function CursorParallax({ children, range = 6, className }: CursorParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const extent = reduced ? 0 : range;

  const x = useSpring(
    useTransform(px, [0, 1], [extent, -extent]),
    { stiffness: 160, damping: 24 }
  );
  const y = useSpring(
    useTransform(py, [0, 1], [extent, -extent]),
    { stiffness: 160, damping: 24 }
  );

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    px.set(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1));
    py.set(Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1));
  };

  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("h-full w-full", className)}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        style={{ x, y }}
      >
        {children}
      </motion.div>
    </div>
  );
}