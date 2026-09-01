import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-md border bg-surface px-4 pr-10 text-sm text-foreground",
            "transition-all duration-200 cursor-pointer",
            "border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
            invalid && "border-error focus:border-error focus:ring-error/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-invalid={invalid || undefined}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  }
);

Select.displayName = "Select";
