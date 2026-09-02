"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type CursorState = "default" | "link" | "button" | "project" | "view" | "drag" | "explore";

const LABELS: Partial<Record<CursorState, string>> = {
  project: "View",
  view: "View",
  drag: "Drag",
  explore: "Explore",
};

/** Whether the device has a fine pointer (desktop mouse/trackpad). */
function subscribeFinePointer(cb: () => void) {
  const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getFinePointerSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine) and (hover: hover)").matches
  );
}

/** Server/SSR snapshot: always "no fine pointer", so nothing renders. */
function getFinePointerServerSnapshot() {
  return false;
}

/**
 * A subtle, non-interfering custom cursor.
 * - Desktop only: skipped on coarse-pointer (touch) devices.
 * - Respects `prefers-reduced-motion` (renders nothing).
 * - Renders inside a full-screen, pointer-events-none layer so it never
 *   blocks clicks, selection, or scrolling.
 * - The trailing ring springs toward the pointer; a small dot tracks exactly.
 * - States are driven by `data-cursor="link|button|project|view"` or by the
 *   element type (anchors/buttons). Use `data-cursor="off"` to opt out.
 */
export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );

  const [state, setState] = useState<CursorState>("default");

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 400, damping: 40, mass: 0.5 });
  const ringY = useSpring(dotY, { stiffness: 400, damping: 40, mass: 0.5 });

  const stateRef = useRef<CursorState>("default");
  const setStateSafe = (s: CursorState) => {
    stateRef.current = s;
    setState(s);
  };

  useEffect(() => {
    if (prefersReducedMotion || !finePointer) return;
    document.documentElement.classList.add("hide-native-cursor");

    const onMove = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const resolveState = (target: EventTarget | null): CursorState => {
      const el = (target as HTMLElement | null)?.closest?.(
        "[data-cursor], a, button, [role='button']"
      ) as HTMLElement | null;
      if (!el) return "default";
      const v = el.dataset.cursor;
      if (v === "project" || v === "view") return v;
      if (v === "drag") return "drag";
      if (v === "explore") return "explore";
      if (v === "button") return "button";
      if (v === "link") return "link";
      if (v === "off") return "default";
      if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") {
        return "button";
      }
      if (el.tagName === "A" || el.hasAttribute("href")) return "link";
      return "default";
    };

    const onOver = (e: PointerEvent) => setStateSafe(resolveState(e.target));
    const onOut = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor], a, button, [role='button']"
      );
      const related = (e.relatedTarget as HTMLElement | null)?.closest?.(
        "[data-cursor], a, button, [role='button']"
      );
      if (el && el !== related) setStateSafe("default");
    };
    const onLeave = () => setStateSafe("default");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("hide-native-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion, finePointer, dotX, dotY]);

  if (prefersReducedMotion || !finePointer) return null;

  const isActive = state !== "default";

  return (
    <div
      className="fixed inset-0 z-[2000] pointer-events-none hidden md:block"
      aria-hidden
    >
      {/* trailing ring */}
      <motion.div
        className="fixed rounded-full border border-accent/60"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: isActive ? 56 : 28,
          height: isActive ? 56 : 28,
          backgroundColor: isActive
            ? "rgba(43,92,145,0.12)"
            : "rgba(43,92,145,0)",
          opacity: 0.9,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {isActive && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium uppercase tracking-wider text-accent-soft">
            {LABELS[state] ?? ""}
          </span>
        )}
      </motion.div>

      {/* dot */}
      <motion.div
        className="fixed h-1.5 w-1.5 rounded-full bg-foreground"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: isActive ? 0 : 1 }}
      />
    </div>
  );
}
