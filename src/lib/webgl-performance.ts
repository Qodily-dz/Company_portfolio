"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ---------------------------------------------------------------------------
 * Shared WebGL performance helpers.
 *
 * Every 3D field on the site follows the same set of rules so behaviour stays
 * consistent:
 *
 *  - Quality tiers:  low (mobile / reduced motion)  ->  tablet  ->  desktop.
 *    Coarse pointers (touch) and low-power devices are given lighter scenes.
 *  - DPR is capped per tier so 4K/retina displays don't push every canvas to
 *    2x+ — the single biggest GPU cost on modern screens.
 *  - Rendering is PAUSED while the canvas is off-screen (IntersectionObserver)
 *    or the tab is hidden. Previously every scene ran its render loop forever,
 *    even when the section was far out of view.
 * ------------------------------------------------------------------------- */

export type Quality = "low" | "tablet" | "desktop";

type QualityOptions = {
  /** prefers-reduced-motion: always drop to the lightest scene. */
  reduced: boolean;
  /** Pointer is coarse (touch): treat tablets/phones as lighter scenes. */
  coarse: boolean;
  /** navigator.hardwareConcurrency (null when unavailable). */
  cores: number | null;
};

/** Per-tier DPR ceiling. Keeps retina GPUs from doing needless work. */
export const MAX_DPR: Record<Quality, [number, number]> = {
  low: [1, 1.25],
  tablet: [1, 1.5],
  desktop: [1, 1.75],
};

export function getQuality(
  width: number,
  { reduced, coarse, cores }: QualityOptions,
): Quality {
  if (reduced) return "low";
  if (width < 768) return "low";
  // Low-power devices (≤4 logical cores) get the reduced effects even if
  // the screen is large — better than a janky "full" scene.
  if (width >= 1024 && cores !== null && cores <= 4) return "tablet";
  if (width < 1024) return coarse ? "low" : "tablet";
  return "desktop";
}

function subscribeWidth(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

function getQualitySnapshot(reduced: boolean): () => Quality {
  return () =>
    getQuality(window.innerWidth, {
      reduced,
      coarse: getCoarse(),
      cores: getCores(),
    });
}

function getCores(): number | null {
  if (typeof navigator === "undefined") return null;
  return navigator.hardwareConcurrency ?? null;
}

function getCoarse(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Reactive quality tier for a WebGL field.
 * Server snapshot defaults to "desktop" so the first paint matches the
 * intended full experience before hydration corrects it.
 */
export function useQuality(reduced: boolean): Quality {
  const getSnapshot = getQualitySnapshot(reduced);
  return useSyncExternalStore<Quality>(subscribeWidth, getSnapshot, () => "desktop");
}

/* ---------------------------------------------------------------------------
 * Scene activity: only render while the canvas is actually on screen.
 * ------------------------------------------------------------------------- */

export function useSceneActive() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () =>
      setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, active: inView && tabVisible };
}