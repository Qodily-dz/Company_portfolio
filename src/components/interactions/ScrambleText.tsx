"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ---------------------------------------------------------------------------
 * ScrambleText — text scramble reveal (hover / scroll interaction).
 *
 * Resolves `text` through a character scramble when scrolled into view (or on
 * hover with trigger="hover"). Reserved for short technical/positioning labels
 * where the effect reads as deliberate, not decorative noise. Static under
 * prefers-reduced-motion.
 * ------------------------------------------------------------------------- */

const CHARS = "!<>-_\\/[]{}—=+*^?#";

type ScrambleTextProps = {
  text: string;
  /** "view" resolves when the label enters the viewport; "hover" on each hover. */
  trigger?: "view" | "hover";
  duration?: number;
  className?: string;
};

export function ScrambleText({
  text,
  trigger = "view",
  duration = 550,
  className,
}: ScrambleTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const animateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    animateRef.current = () => {
      const el = ref.current;
      if (!el || reduced) return;
      const start = performance.now();
      const tick = (now: number) => {
        if (el !== ref.current) return;
        const p = Math.min((now - start) / duration, 1);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const resolved = i / text.length <= p;
          out += resolved
            ? text[i]
            : CHARS[(Math.random() * CHARS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          el.textContent = text;
        }
      };
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, reduced, duration]);

  useEffect(() => {
    if (reduced || trigger !== "view") return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          animateRef.current?.();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, trigger, text]);

  return (
    <span
      ref={ref}
      className={className}
      onPointerEnter={
        trigger === "hover" && !reduced
          ? () => animateRef.current?.()
          : undefined
      }
    >
      {text}
    </span>
  );
}