"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@/lib/utils";

type MagneticButtonProps = ButtonProps & {
  children: ReactNode;
  strength?: number;
  className?: string;
};

export function MagneticButton({
  children,
  strength = 0.35,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      style={{ display: "inline-flex" }}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(className)}
    >
      <Button ref={ref} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
