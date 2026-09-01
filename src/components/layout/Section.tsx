import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: keyof HTMLElementTagNameMap;
};

export function Section({
  children,
  className,
  id,
  as: Component = "section",
}: SectionProps) {
  return (
    <Component id={id} className={cn("w-full py-16 md:py-24 lg:py-32", className)}>
      {children}
    </Component>
  );
}
