"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { MAX_DPR, useQuality, useSceneActive, type Quality } from "@/lib/webgl-performance";
import { dpr } from "./theme";

/* ---------------------------------------------------------------------------
 * SceneCanvas — shared R3F Canvas wrapper used by every WebGL visual.
 *
 * Encapsulates the rules every scene follows:
 *  - Quality tiering (low/tablet/desktop) with capped DPR.
 *  - Frameloop paused off-screen and on hidden tabs.
 *  - Reduced-motion detection.
 *  - Transparent canvas with a dark theme color clear.
 *
 * Children receive `quality` and `reduced` via render props so each visual
 * can adapt its particle counts and interaction depth.
 * ------------------------------------------------------------------------- */

type SceneCanvasProps = {
  children: (ctx: { quality: Quality; reduced: boolean }) => ReactNode;
  /** Camera position. */
  camera?: [number, number, number];
  /** fov. */
  fov?: number;
  /** far plane. */
  far?: number;
  /** When true, DPR is clamped to the given tier (+caps). */
  quality?: Quality;
  /** Override reduced-motion detection. */
  reduced?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Background color to clear to (default theme bg). */
  background?: string;
  /** DOM fallback rendered while WebGL initializes. */
  fallback?: ReactNode;
};

export function SceneCanvas({
  children,
  camera = [0, 0, 9],
  fov = 45,
  far = 60,
  quality: forcedQuality,
  reduced: forcedReduced,
  className,
  style,
  background = "#030405",
  fallback,
}: SceneCanvasProps) {
  const reducedMotion = useReducedMotion();
  const reduced = forcedReduced ?? (reducedMotion ?? false);
  const autoQuality = useQuality(reduced);
  const quality = forcedQuality ?? autoQuality;
  const { ref, active } = useSceneActive();

  const tierDPR = quality === "low" ? dpr.low : quality === "tablet" ? dpr.tablet : dpr.desktop;

  return (
    <Canvas
      ref={ref}
      frameloop={active ? "always" : "never"}
      dpr={tierDPR}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: camera, fov, near: 0.1, far }}
      style={{ position: "absolute", inset: 0, ...style }}
      className={className}
      fallback={fallback}
    >
      <color attach="background" args={[background]} />
      {children({ quality, reduced })}
    </Canvas>
  );
}

export type { Quality };
export { MAX_DPR };