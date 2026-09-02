"use client";

import NextLink from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { ReactNode } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * UnderlineFollow — nav link whose underline follows the cursor.
 *
 * The ruler stays at the cursor's fraction of the label while hovered (a
 * width ramp with a movable origin reads as "following"), then retracts on
 * leave. Renders an internal or external anchor like the shared Link.
 * No-op under prefers-reduced-motion (regular hover colors remain).
 * ------------------------------------------------------------------------- */

type UnderlineFollowProps = {
  children: ReactNode;
  href: string;
  external?: boolean;
  className?: string;
};

export function UnderlineFollow({
  children,
  href,
  external,
  className,
}: UnderlineFollowProps) {
  const reduced = useReducedMotion();
  const scaleX = useMotionValue(0);
  const origin = useMotionValue(0);
  const ramp = useSpring(scaleX, { stiffness: 320, damping: 26 });
  const originPct = useMotionTemplate`${origin}%`;

  const isExternal =
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto") ||
    href.startsWith("tel");

  const classes = cn(
    "relative inline-flex items-center gap-1 transition-colors duration-200 underline-offset-4 hover:text-accent-soft",
    className
  );

  const underline = (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-[-3px] h-px bg-current"
      style={{ scaleX: ramp, transformOrigin: originPct }}
    />
  );

  const track = {
    onPointerEnter: () => {
      if (!reduced) scaleX.set(1);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (reduced) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      if (r.width <= 0) return;
      origin.set((Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)) * 100);
    },
    onPointerLeave: () => scaleX.set(0),
  };

  if (isExternal) {
    return (
      <span className="inline-flex" {...track}>
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
          {underline}
        </a>
      </span>
    );
  }

  return (
    <span className="inline-flex" {...track}>
      <NextLink href={href} className={classes}>
        {children}
        {underline}
      </NextLink>
    </span>
  );
}