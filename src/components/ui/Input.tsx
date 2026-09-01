import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border bg-surface px-4 text-sm text-foreground placeholder:text-muted-more",
          "transition-all duration-200",
          "border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          invalid && "border-error focus:border-error focus:ring-error/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
