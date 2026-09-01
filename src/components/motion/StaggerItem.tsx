"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div className={cn(className)} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
