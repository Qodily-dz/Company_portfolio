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
 * Tilt — 3D tilt hover wrapper (hover interaction).
 *
 * Rotates a surface toward the cursor. Kept deliberately small (2–5° max) so
 * it reads as physical response, not spectacle. Springs settle on leave.
 * No-op under prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

type TiltProps = {
  children: ReactNode;
  /** Maximum tilt in degrees (2–5 recommended). */
  max?: number;
  className?: string;
};

export function Tilt({ children, max = 4, className }: TiltProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const degrees = reduced ? 0 : max;

  const rotateX = useSpring(
    useTransform(py, [0, 1], [degrees, -degrees]),
    { stiffness: 170, damping: 22 }
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-degrees, degrees]),
    { stiffness: 170, damping: 22 }
  );

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
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
      style={{ perspective: 900 }}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}