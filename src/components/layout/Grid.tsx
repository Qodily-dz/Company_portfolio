import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GridProps = {
  children: ReactNode;
  className?: string;
  cols?: number;
  colsSm?: number;
  colsMd?: number;
  colsLg?: number;
  colsXl?: number;
  gap?: string;
};

export function Grid({
  children,
  className,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = "gap-6",
}: GridProps) {
  const colClass = (n: number) => `grid-cols-${n}`;

  return (
    <div
      className={cn(
        "grid",
        colClass(cols),
        colsSm && `sm:${colClass(colsSm)}`,
        colsMd && `md:${colClass(colsMd)}`,
        colsLg && `lg:${colClass(colsLg)}`,
        colsXl && `xl:${colClass(colsXl)}`,
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}
