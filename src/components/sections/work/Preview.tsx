"use client";

import { useMemo } from "react";

/** Deterministic (pure) bit-exact integer PRNG in [0,1) — 100% identical on SSR & client. */
function rand(i: number, salt: number): number {
  let h = Math.imul(i ^ (salt * 0x9e3779b9), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type PreviewProps = {
  accent: { a: string; b: string };
  seed: number;
  tall?: boolean;
};

/**
 * A purely procedural, deterministic abstract "interface" preview. No stock
 * imagery — derived from the project's accent and a seed so every project
 * reads differently. A neon grid, rising data bars and drifting nodes form a
 * tech / dashboard silhouette. On hover the inner group shifts for depth.
 */
export function Preview({ accent, seed, tall = false }: PreviewProps) {
  const bars = useMemo(() => {
    const count = tall ? 9 : 7;
    return Array.from({ length: count }, (_, i) => {
      const h = +(16 + rand(seed * 10 + i, 1) * 72).toFixed(2);
      return {
        x: +(6 + i * (88 / (count - 1))).toFixed(2),
        h,
        w: +(5 + rand(seed * 10 + i, 2) * 9).toFixed(2),
        o: +(0.7 + rand(seed * 10 + i, 3) * 0.3).toFixed(3),
        top: rand(seed * 10 + i, 7) > 0.2,
      };
    });
  }, [seed, tall]);

  const dots = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: +(6 + rand(seed * 7 + i, 4) * 88).toFixed(2),
        y: +(8 + rand(seed * 7 + i, 5) * 84).toFixed(2),
        r: +(2 + rand(seed * 7 + i, 6) * 3.2).toFixed(2),
      })),
    [seed]
  );

  const id = useMemo(() => `pv-${seed}-${accent.b.replace("#", "")}`, [seed, accent.b]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent.a} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent.b} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${id}-bar`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={accent.b} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accent.b} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* base wash */}
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-bg)`} />

      {/* neon grid */}
      <g stroke={accent.b} strokeWidth="0.5" fill="none">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`v${i}`} x1={14 + i * 15} y1="0" x2={14 + i * 15} y2="100" opacity="0.28" />
        ))}
        <line x1="0" y1="30" x2="100" y2="30" opacity="0.28" />
        <line x1="0" y1="68" x2="100" y2="68" opacity="0.28" />
      </g>

      {/* rising data bars */}
      {bars.map((b, i) => (
        <rect
          key={`b${i}`}
          x={b.x}
          y={88 - b.h}
          width={b.w}
          height={b.h}
          rx="2"
          fill={b.top ? accent.b : accent.a}
          fillOpacity={b.o}
          stroke={accent.b}
          strokeOpacity={b.top ? 0.9 : 0.25}
          strokeWidth="0.6"
        />
      ))}

      {/* drifting data nodes */}
      {dots.map((d, i) => (
        <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill={accent.b} fillOpacity="0.65" />
      ))}

      {/* hover-reactive parallax group */}
      <g className="origin-center transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1">
        <rect
          x="6"
          y="6"
          width="30"
          height="16"
          rx="2"
          fill="none"
          stroke={accent.b}
          strokeOpacity="0.6"
          strokeWidth="0.8"
        />
        {[10, 16, 22, 28].map((x, i) => (
          <circle key={`ch${i}`} cx={x} cy={11} r="1" fill={accent.a} fillOpacity={0.9} />
        ))}
        <rect x="6" y="78" width="22" height="10" rx="2" fill={accent.b} fillOpacity="0.5" />
      </g>
    </svg>
  );
}
