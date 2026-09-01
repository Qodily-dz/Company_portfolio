"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerContainer } from "@/lib/motion";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
};

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  once = true,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      whileInView="animate"
      viewport={{ once, amount: 0.2 }}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}
