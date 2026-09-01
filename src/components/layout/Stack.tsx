import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StackProps = {
  children: ReactNode;
  className?: string;
  gap?: string;
  direction?: "row" | "col";
  items?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
};

const itemsClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export function Stack({
  children,
  className,
  gap = "gap-4",
  direction = "col",
  items,
  justify,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        gap,
        items && itemsClass[items],
        justify && justifyClass[justify],
        className
      )}
    >
      {children}
    </div>
  );
}
