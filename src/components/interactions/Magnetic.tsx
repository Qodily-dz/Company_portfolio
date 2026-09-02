"use client";

import { useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Magnetic — generic magnetic hover wrapper (cursor interaction #1).
 *
 * Wraps ANY single child element (button, link, text) and draws it toward the
 * cursor within `radius`, then springs it back to rest on leave. Measures its
 * own box (not the child) so it works for every child, including buttons that
 * render as anchors. No-op under prefers-reduced-motion.
 *
 * Deliberately subtle: default pull is capped at ~6px with a modest reach so
 * elements feel responsive without "chasing" the cursor. Keep magnetism for a
 * few key CTAs only — not everything on the page.
 * ------------------------------------------------------------------------- */

type MagneticProps = {
  children: ReactNode;
  /** Maximum pull distance in px (kept small — ~4–8px). */
  strength?: number;
  /** Reach of the magnet in px. */
  radius?: number;
  className?: string;
  style?: CSSProperties;
};

export function Magnetic({
  children,
  strength = 6,
  radius = 120,
  className,
  style,
}: MagneticProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.35 });

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d >= radius) return;
    const f = (1 - d / radius) * (1 - d / radius);
    const pull = strength * f;
    x.set((dx / (d + 0.01)) * pull);
    y.set((dy / (d + 0.01)) * pull);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("inline-flex", className)}
      style={style}
    >
      <motion.div className="inline-flex will-change-transform" style={{ x: sx, y: sy }}>
        {children}
      </motion.div>
    </div>
  );
}