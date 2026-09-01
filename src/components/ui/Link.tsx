import type { AnchorHTMLAttributes, ReactNode } from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

type LinkProps = {
  children: ReactNode;
  href: string;
  className?: string;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Link({
  children,
  href,
  className,
  external,
  ...props
}: LinkProps) {
  const isExternal =
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto") ||
    href.startsWith("tel");

  const classes = cn(
    "inline-flex items-center gap-1 text-foreground-soft underline-offset-4 transition-colors duration-200 hover:text-accent-soft hover:underline",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  );
}
