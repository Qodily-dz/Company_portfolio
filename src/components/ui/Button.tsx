import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

type ButtonOwnProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
};

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "className">;

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed select-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-white/90 hover:shadow-[0_0_24px_var(--color-accent-glow)] active:bg-white/80",
  secondary:
    "bg-white/[.06] text-foreground hover:bg-white/[.12] active:bg-white/[.16] border border-border",
  outline:
    "border border-border-strong text-foreground hover:border-accent hover:text-accent-soft active:border-accent-dim",
  ghost: "bg-transparent text-foreground-soft hover:bg-white/[.06] hover:text-foreground",
  danger: "bg-error/10 text-error hover:bg-error/20 active:bg-error/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      href,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (href) {
      const isExternal =
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel");

      if (isExternal) {
        return (
          <a
            href={href}
            className={classes}
            {...(href.startsWith("http")
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {})}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
