"use client";

import { useMemo } from "react";
import type { Quality } from "@/lib/webgl-performance";
import type { PillarId } from "@/lib/services";
import { SceneCanvas, MorphingGrid, type MorphState } from "./library";

/* ---------------------------------------------------------------------------
 * PillarField — SERVICES visual.
 *
 * One persistent particle system that morphs between the three service
 * pillars: BUILD (architecture lattice) → DESIGN (fluid) → GROW (directional
 * funnel). The morph machinery, camera pullback, mouse swirl and reduced-
 * motion handling live in the shared MorphingGrid; only the state geometry
 * (and the BUILD data-packet pulse) are defined here.
 * ------------------------------------------------------------------------- */

const TIER: Record<Quality, number> = {
  low: 1800,
  tablet: 5200,
  desktop: 9000,
};

/* BUILD — software architecture: matter snaps into a lattice network,
   nodes snap hard, a strand of connectors drifts between them. */
const BUILD = /* glsl */ `
  float res = 4.5;
  vec3 g = floor(ipos * res + 0.5) / res;
  float snap = seed < 0.52 ? 0.93 : 0.34;
  vec3 q = mix(ipos, g, snap);
  float strand = step(0.5, fract(seed * 13.7));
  q += (g - ipos) * strand * 0.5;
  return q;
`;

/* DESIGN — fluid: matter flows with layered noise, smooth like liquid. */
const DESIGN = /* glsl */ `
  vec3 dir = vec3(
    fbm3(ipos*0.42 + vec3(tm*0.04, seed*0.3, 0.0)),
    fbm3(ipos*0.42 + vec3(seed*0.5, tm*0.05, 0.0)),
    fbm3(ipos*0.36 + vec3(0.0, 0.0, tm*0.02 + seed))
  ) - 0.5;
  return ipos + dir * (0.7 + 1.0 * seed);
`;

/* GROW — directional data flow: matter streams along X through a funnel,
   tightening in the middle then widening. */
const GROW = /* glsl */ `
  float span = 6.5;
  float flow = fract(tm * 0.14 + seed * 2.2);
  float fx = (flow * 2.0 - 1.0) * span;
  float s = abs(fx) / span;
  float width = 0.28 + 1.7 * s * s + 0.5 * s;
  float y = (hash31(vec3(seed, flow, 3.1)) - 0.5) * width;
  float z = (hash31(vec3(seed, flow, 7.7)) - 0.5) * width * 0.8;
  return vec3(fx, y, z);
`;

/* Per-environment CURSOR/SCROLL influence. Each body returns a directional
   push (x,y) plus a strength scalar in z, blended by the morph weight so the
   same digital matter responds distinctly per pillar. `pos`, `uMouse` (vec3)
   and `uScrollVel` are in scope. */

/* BUILD — SYSTEM ARCHITECTURE: structured + engineered.
   Cursor snaps the matter toward a tight lattice alignment and pushes it
   along grid axes; strength leans toward the camera (structural depth). */
const BUILD_INT = /* glsl */ `
  vec2 d = pos.xy - uMouse.xy;
  float dd = length(d) + 1e-4;
  float fall = smoothstep(2.2, 0.0, dd);
  float cell = 0.34;
  vec2 g = uMouse.xy + (floor(pos.xy / cell + 0.5) - pos.xy / cell) * cell;
  vec2 align = (g - pos.xy);
  return vec3(d / dd * fall * 0.55 + align * fall * 0.5, 0.55 * fall);
`;

/* DESIGN — DIGITAL COMPOSITION: precise + fluid.
   Cursor repels into clean columns; blocks slide into a tidy composition
   and flatten slightly toward the surface. */
const DESIGN_INT = /* glsl */ `
  vec2 d = pos.xy - uMouse.xy;
  float dd = length(d) + 1e-4;
  float fall = smoothstep(2.4, 0.0, dd);
  float col = 0.5;
  float xoff = (round(pos.y / col) * col) * 0.45;
  return vec3((pos.x - uMouse.x) * fall * 0.3 + xoff * fall, -d.y * fall * 0.22, -0.4 * fall);
`;

/* GROW — DATA FLOW: directional + magnetic.
   Cursor draws matter onto its flow line and rushes it forward along the
   funnel; the stream bends toward the cursor. */
const GROW_INT = /* glsl */ `
  vec2 d = pos.xy - uMouse.xy;
  float dd = length(d) + 1e-4;
  float fall = smoothstep(2.4, 0.0, dd);
  return vec3(fall * 0.55, (uMouse.y - pos.y) * fall * 0.42, 0.8 * fall);
`;

/* BUILD: travelling data-packet pulse through the lattice. */
const BUILD_PULSE = /* glsl */ `
  float packet = fract(tm * 0.28 + dot(floor(position * 4.0 * (0.5 + aSeed)), vec3(1.0, 0.5, 0.7)) * 0.7);
  float pulse = smoothstep(0.16, 0.0, packet) * _w0;
  c *= 1.0 + pulse * 1.5;
  baseAlpha *= 0.8 + 0.6 * pulse;
`;

const STATES: MorphState[] = [
  { body: BUILD, color: "#173b68", interact: BUILD_INT },
  { body: DESIGN, color: "#2b5c91", interact: DESIGN_INT },
  { body: GROW, color: "#0b1d35", interact: GROW_INT },
];

const FALLBACK = (
  <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
);

function Morpher({ quality, reduced, target }: { quality: Quality; reduced: boolean; target: number }) {
  const count = useMemo(() => TIER[quality], [quality]);
  return (
    <MorphingGrid
      count={count}
      states={STATES}
      morph={target}
      reduced={reduced}
      vertexFooter={BUILD_PULSE}
    />
  );
}

export default function PillarField({ active }: { active: PillarId }) {
  const target = useMemo(
    () => (active === "build" ? 0 : active === "design" ? 1 : 2),
    [active]
  );

  return (
    <SceneCanvas fallback={FALLBACK}>
      {({ quality, reduced }) => <Morpher quality={quality} reduced={reduced} target={target} />}
    </SceneCanvas>
  );
}