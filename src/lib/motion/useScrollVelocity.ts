"use client";

import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { MotionValue } from "framer-motion";

/* ---------------------------------------------------------------------------
 * useScrollVelocity — normalized, smoothed page-scroll velocity.
 *
 * Returns a 0..1 MotionValue (1 = fast scrolling) that consumers can drive
 * subtle physics from (particle speed, layering, parallax intensity) without
 * tracking raw pixels. Spring-smoothed so it settles instead of jittering,
 * and always 0 for prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

const FULL_SPEED_PX_S = 1150;

export function useScrollVelocity(): MotionValue<number> {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const raw = useVelocity(scrollY);
  const normalized = useTransform(raw, (v) =>
    reduced ? 0 : Math.min(Math.abs(v) / FULL_SPEED_PX_S, 1)
  );
  return useSpring(normalized, { stiffness: 170, damping: 26, mass: 0.7 });
}