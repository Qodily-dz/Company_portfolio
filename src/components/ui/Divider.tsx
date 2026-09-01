import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children?: ReactNode;
  className?: string;
};

export function Divider({ children, className }: Props) {
  return (
    <div
      role="separator"
      aria-hidden={children ? undefined : true}
      className={cn("h-px w-full bg-border", className)}
    />
  );
}
