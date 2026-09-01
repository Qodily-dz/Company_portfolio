import { createElement } from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  fluid?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  as: Component = "div",
  fluid = false,
  size = "lg",
}: ContainerProps) {
  return createElement(
    Component,
    {
      className: cn(
        "mx-auto w-full px-5 sm:px-6 md:px-8 lg:px-12",
        !fluid && sizeClasses[size],
        className
      ),
    },
    children
  );
}
