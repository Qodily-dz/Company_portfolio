"use client";

import { useMemo } from "react";
import type { Quality } from "@/lib/webgl-performance";
import type { WebGLComponentProps } from "./DynamicWebGL";
import { SceneCanvas, ParticleCloud } from "./library";

/* ---------------------------------------------------------------------------
 * DigitalField — HERO visual ("THE DIGITAL FIELD").
 *
 * Thin wrapper over the shared ParticleCloud (structured lattice extending
 * into depth). Lattice density scales with quality tier; the low tier also
 * gets simplified interaction so mobile stays clean — at the cost of the
 * immersive cursor deformation. Reduced-motion, off-screen pausing and DPR
 * caps are handled by SceneCanvas / ParticleCloud.
 * ------------------------------------------------------------------------- */

type LatticeDims = [number, number, number];

const TIER: Record<Quality, LatticeDims> = {
  low: [16, 10, 6],
  tablet: [24, 14, 9],
  desktop: [30, 18, 11],
};

const FALLBACK = (
  <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
);

function ParticleField({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const dims = useMemo(() => TIER[quality], [quality]);
  return (
    <ParticleCloud dims={dims} reduced={reduced} simplified={quality === "low"} />
  );
}

export default function DigitalField(_props: WebGLComponentProps) {
  return (
    <SceneCanvas fallback={FALLBACK}>
      {({ quality, reduced }) => <ParticleField quality={quality} reduced={reduced} />}
    </SceneCanvas>
  );
}