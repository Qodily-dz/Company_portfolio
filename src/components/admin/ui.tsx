"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Icons ──────────────────────────────────────────── */

const paths: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  folder: "M3 6h7l2 2h9v10H3z",
  layers: "m4 8 8-4 8 4-8 4-8-4Zm0 4 8 4 8-4M4 16l8 4 8-4",
  article: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-7 0V20M12.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a2.5 2.5 0 0 0 0-5",
  image: "M4 5h16v14H4zM7 15l3-3 2 2 2-3 3 4M8 9h.01",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  search: "m20 20-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M18 6 6 18",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  check: "m5 12 4 4L19 6",
  file: "M6 3h8l4 4v14H6zM14 3v4h4",
  link: "M10 14a4 4 0 0 0 5.7.5l3-3a4 4 0 1 0-5.7-5.7l-1.4 1.4M14 10a4 4 0 0 0-5.7-.5l-3 3a4 4 0 1 0 5.7 5.7l1.4-1.4",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m9-8h-2M5 12H3m15.4-6.4-1.4 1.4M7 17l-1.4 1.4m12.8 0L17 17M7 7 5.6 5.6",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={cn("h-[17px] w-[17px] shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}

/* ── Button ─────────────────────────────────────────── */

type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<AdminButtonVariant, string> = {
  primary: "bg-accent-soft text-white hover:bg-accent",
  secondary: "bg-white/[.06] text-foreground border border-border hover:bg-white/[.12] hover:text-white",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-white/[.06]",
  danger: "bg-error/10 text-error border border-error/30 hover:bg-error/20",
};

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: AdminButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-[14px] text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── PageHeader ─────────────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-soft">
          {eyebrow}
        </div>
        <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

/* ── StatusBadge ────────────────────────────────────── */

type Tone = "blue" | "green" | "amber" | "red" | "gray";

const toneStyles: Record<Tone, string> = {
  blue: "text-accent-soft bg-accent-dim",
  green: "text-success bg-success/10",
  amber: "text-warning bg-warning/10",
  red: "text-error bg-error/10",
  gray: "text-muted bg-white/[.06]",
};

export function StatusBadge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium",
        toneStyles[tone]
      )}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {children}
    </span>
  );
}

/* ── SectionCard ────────────────────────────────────── */

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-[19px] py-[18px]">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── Form primitives ────────────────────────────────── */

export const fieldCls =
  "rounded border border-border bg-surface px-3 py-[11px] text-[12px] text-foreground outline-none focus:border-accent placeholder:text-muted-more";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-[7px] text-[11px] text-foreground-soft", className)}>
      <span className="flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-muted-more">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`h-[17px] w-[29px] rounded-full border-0 p-0.5 transition-colors ${
        checked ? "bg-accent" : "bg-white/[.16]"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`block h-[13px] w-[13px] rounded-full transition-transform ${
          checked ? "translate-x-3 bg-white" : "bg-muted"
        }`}
      />
    </button>
  );
}

export function Drawer({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-background/70"
      onMouseDown={onClose}
    >
      <aside
        className="flex h-full w-[min(560px,100%)] flex-col border-l border-border bg-surface"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-[25px] py-[25px]">
          <div>
            <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-soft">
              {eyebrow}
            </div>
            <h2 className="text-[21px] font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
          </div>
          <button
            className="inline-flex h-[30px] w-[30px] items-center justify-center bg-transparent text-muted hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-[17px] overflow-auto px-[25px] py-[22px]">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-[25px] py-[17px]">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}

export function Loading({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-[65px] text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent-soft" />
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon = "folder",
  title,
  body,
}: {
  icon?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-[65px] text-muted">
      <Icon name={icon} className="mb-1 h-7 w-7 text-accent-soft" />
      <strong className="text-[13px] text-foreground-soft">{title}</strong>
      <span className="text-[11px]">{body}</span>
    </div>
  );
}

export function TableShell({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-border px-[19px] py-3 text-left text-[10px] font-medium text-muted whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
