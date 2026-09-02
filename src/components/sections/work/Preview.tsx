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
 * reads differently. On hover the inner group shifts to hint at depth.
 */
export function Preview({ accent, seed, tall = false }: PreviewProps) {
  const bars = useMemo(() => {
    const count = tall ? 9 : 7;
    return Array.from({ length: count }, (_, i) => {
      const h = +(18 + rand(seed * 10 + i, 1) * 70).toFixed(2);
      return {
        x: +(6 + i * (88 / (count - 1))).toFixed(2),
        h,
        w: +(4 + rand(seed * 10 + i, 2) * 7).toFixed(2),
        o: +(0.55 + rand(seed * 10 + i, 3) * 0.45).toFixed(3),
      };
    });
  }, [seed, tall]);

  const dots = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: +(6 + rand(seed * 7 + i, 4) * 88).toFixed(2),
        y: +(8 + rand(seed * 7 + i, 5) * 84).toFixed(2),
        r: +(2 + rand(seed * 7 + i, 6) * 3).toFixed(2),
      })),
    [seed]
  );

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`pbg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent.a} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent.b} stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#pbg-${seed})`} />

      {/* Hover-reactive inner group: shifts up+left on hover for a parallax preview */}
      <g>
        {/* faint connecting grid, always structured */}
        <g stroke="rgba(43,92,145,0.16)" strokeWidth="0.4">
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={20 + i * 16}
              y1="0"
              x2={20 + i * 16}
              y2="100"
            />
          ))}
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="0" y1="85" x2="100" y2="85" />
        </g>

        {/* bars forming a chart silhouette */}
        {bars.map((b, i) => (
          <rect
            key={`b${i}`}
            x={b.x}
            y={90 - b.h}
            width={b.w}
            height={b.h}
            rx="1.5"
            fill={i % 2 === 0 ? accent.a : "#ffffff"}
            fillOpacity={b.o}
          />
        ))}

        {/* drifting points */}
        {dots.map((d, i) => (
          <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill={accent.b} fillOpacity="0.5" />
        ))}
      </g>
    </svg>
  );
}
