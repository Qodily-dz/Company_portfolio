import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground-soft"
      >
        {label}
        {required && <span className="ml-0.5 text-accent" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && (
        <Text size="xs" muted>
          {hint}
        </Text>
      )}
      {error && (
        <Text size="xs" className="text-error">
          {error}
        </Text>
      )}
    </div>
  );
}
