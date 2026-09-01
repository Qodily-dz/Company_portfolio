import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextProps = {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  as?: "p" | "span" | "div" | "small" | "strong";
  muted?: boolean;
  moreMuted?: boolean;
  leading?: "none" | "tight" | "snug" | "normal" | "relaxed" | "loose";
};

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  md: "text-[17px]",
  lg: "text-lg",
  xl: "text-xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const leadingClasses = {
  none: "leading-none",
  tight: "leading-tight",
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

export function Text({
  children,
  className,
  size = "base",
  weight = "normal",
  as: Component = "p",
  muted,
  moreMuted,
  leading = "normal",
}: TextProps) {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        leadingClasses[leading],
        muted ? "text-muted" : moreMuted ? "text-muted-more" : "text-foreground-soft",
        className
      )}
    >
      {children}
    </Component>
  );
}
