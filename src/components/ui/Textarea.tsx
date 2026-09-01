import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-more",
          "transition-all duration-200",
          "border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          invalid && "border-error focus:border-error focus:ring-error/30",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[120px]",
          className
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
