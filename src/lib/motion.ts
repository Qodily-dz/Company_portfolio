import type { Transition, Variants } from "framer-motion";

export const durations = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
} as const;

export const easings = {
  standard: [0.4, 0, 0.2, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  spring: { type: "spring", stiffness: 260, damping: 20 } as const,
} as const;

export const transition: Transition = {
  duration: durations.base,
  ease: easings.standard,
};

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: 16, transition: { duration: durations.fast } },
};

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition },
  exit: { opacity: 0, scale: 0.96, transition: { duration: durations.fast } },
};

export const slideIn: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition },
  exit: { opacity: 0, x: -24, transition: { duration: durations.fast } },
};

export const staggerContainer = (
  stagger = 0.08,
  delayChildren = 0.05
) => ({
  initial: {},
  animate: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = fadeIn;
