"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn, fade, scaleIn, slideIn, transition } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  variant?: "fade" | "fade-in" | "scale" | "slide";
  className?: string;
  delay?: number;
  once?: boolean;
};

export function Reveal({
  children,
  variant = "fade",
  className,
  delay = 0,
  once = true,
}: RevealProps) {
  const getVariants = () => {
    switch (variant) {
      case "fade":
        return fade;
      case "fade-in":
        return fadeIn;
      case "scale":
        return scaleIn;
      case "slide":
        return slideIn;
    }
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="initial"
      whileInView="animate"
      viewport={{ once, amount: 0.2 }}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}
