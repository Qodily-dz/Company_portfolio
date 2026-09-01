import { createElement } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

type HeadingProps = {
  children: ReactNode;
  as?: HeadingLevel;
  size?: HeadingSize;
  className?: string;
  id?: string;
};

const sizeClasses: Record<HeadingSize, string> = {
  xs: "text-lg md:text-xl",
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-4xl md:text-5xl",
  "2xl": "text-4xl md:text-5xl lg:text-6xl",
  "3xl": "text-4xl md:text-6xl lg:text-7xl",
  "4xl": "text-5xl md:text-7xl lg:text-8xl",
};

export function Heading({
  children,
  as: Tag = 2,
  size = "md",
  className,
  id,
}: HeadingProps) {
  return createElement(
    `h${Tag}`,
    {
      id,
      className: cn(
        "font-sans font-medium leading-[1.1] tracking-[-0.02em] text-foreground",
        sizeClasses[size],
        className
      ),
    },
    children
  );
}
