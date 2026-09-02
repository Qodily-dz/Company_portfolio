"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * ProximityGlow — cursor-following radial glow backdrop (cursor interaction).
 *
 * A soft radial gradient springs after the cursor while it's inside the
 * wrapper — the primary-glance response for section backdrops. Fades out on
 * leave. Desktop/silent under prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

type ProximityGlowProps = {
  children?: ReactNode;
  className?: string;
  /** Glow diameter in px. */
  size?: number;
  /** Peak opacity 0..1. */
  intensity?: number;
};

export function ProximityGlow({
  children,
  className,
  size = 460,
  intensity = 1,
}: ProximityGlowProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const opacity = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 55, damping: 18, mass: 0.9 });
  const sy = useSpring(y, { stiffness: 55, damping: 18, mass: 0.9 });
  const so = useSpring(opacity, { stiffness: 90, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      if (!inside) return;
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
      opacity.set(1);
    };
    const onLeave = () => opacity.set(0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, x, y, opacity]);

  return (
    <div
      ref={ref}
      className={cn("relative isolate overflow-hidden", className)}
    >
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 will-change-transform"
          style={{ x: sx, y: sy, opacity: so }}
        >
          <div
            className="h-[var(--glow-size)] w-[var(--glow-size)] rounded-full bg-[radial-gradient(circle,rgba(43,92,145,var(--glow-a))_0%,transparent_62%)]"
            style={
              {
                "--glow-size": `${size}px`,
                "--glow-a": 0.22 * intensity,
                transform: "translate(-50%,-50%)",
              } as CSSProperties
            }
          />
        </motion.div>
      )}
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}