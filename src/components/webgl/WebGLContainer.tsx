"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type WebGLContainerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

/**
 * A scoped wrapper for WebGL canvases. Keeps the child effect
 * visually isolated (pointer events off, overflow hidden) and gives
 * it a stable, sized box to render into.
 */
export function WebGLContainer({
  children,
  className,
  style,
  ariaLabel,
}: WebGLContainerProps) {
  return (
    <div
      className={cn("pointer-events-none relative h-full w-full overflow-hidden", className)}
      style={style}
      role="presentation"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
