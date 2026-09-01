import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "accent" | "muted" | "success";
type BadgeSize = "xs" | "sm" | "md";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/[.06] text-foreground-soft border border-border",
  outline: "bg-transparent text-foreground-soft border border-border-strong",
  accent: "bg-accent-ghost text-accent-soft border border-border-accent",
  muted: "bg-transparent text-muted border border-border",
  success: "bg-success/10 text-success border border-success/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[11px]",
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
