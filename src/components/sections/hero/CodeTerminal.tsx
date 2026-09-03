"use client";

import { useEffect, useState } from "react";

/* ---------------------------------------------------------------------------
 * CodeTerminal — a live build console.
 *
 * Pure DOM/CSS (crisp text, no WebGL blur). Shows a CLI style session with a
 * typewriter cursor and an animated compile progress. Reacts to hover by
 * brightening the window. Gives the hero an unmistakable "coding / shipping"
 * story that animates on its own.
 * ------------------------------------------------------------------------- */

const LINES = [
  { indent: 0, text: "$ qodily build --stack next,node,postgres", cls: "text-muted-more" },
  { indent: 0, text: "", cls: "" },
  { indent: 2, text: "⚙ compiling modules ...", cls: "text-foreground-soft" },
  { indent: 2, text: "   ✓ design system linked", cls: "text-accent-soft" },
  { indent: 2, text: "   ✓ api routes generated", cls: "text-accent-soft" },
  { indent: 2, text: "   ✓ types · hooks · components", cls: "text-accent-soft" },
  { indent: 2, text: "", cls: "" },
  { indent: 2, text: "→ shipping to production", cls: "text-foreground" },
  { indent: 2, text: "   deploying ...", cls: "text-muted" },
  { indent: 2, text: "   ✓ live at qodily.dz", cls: "text-accent" },
  { indent: 2, text: "", cls: "" },
  { indent: 2, text: "SYSTEM ONLINE. NEXT MOVE READY.", cls: "text-foreground" },
];

/** How long (ms) each line stays before the next types in. */
const TIMING = [900, 200, 520, 380, 380, 380, 200, 520, 480, 460, 200, 900];

export function CodeTerminal() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i >= LINES.length - 1) {
        // Loop the whole build cycle.
        timeout = setTimeout(() => {
          setCount(1);
          i = 0;
          tick();
        }, 2600);
        return;
      }
      i += 1;
      setCount((c) => Math.max(c, i + 1));
      timeout = setTimeout(tick, TIMING[i] ?? 400);
    };
    timeout = setTimeout(tick, TIMING[0]);
    return () => clearTimeout(timeout);
  }, []);

  const visible = LINES.slice(0, count);
  const done = count >= LINES.length;

  return (
    <div
      className="group relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-strong/70 bg-surface/70 shadow-[0_0_60px_rgba(43,108,181,0.18)] backdrop-blur-md transition-shadow duration-500 group-hover:shadow-[0_0_90px_rgba(43,108,181,0.3)]"
      data-cursor="view"
      aria-hidden
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 select-none font-mono text-[11px] tracking-wider text-muted">
          qodily — deploy
        </span>
        {/* status dot */}
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${done ? "bg-success" : "animate-pulse bg-accent"}`}
          />
          <span className="select-none font-mono text-[10px] uppercase tracking-widest text-muted">
            {done ? "shipped" : "compiling"}
          </span>
        </span>
      </div>

      {/* Code body */}
      <div className="relative px-4 py-4 font-mono text-[12.5px] leading-6 sm:px-5 sm:text-[13px]">
        {visible.map((line, i) => {
          if (!line.text) {
            return <div key={i} className="h-6" />;
          }
          const isLast = i === count - 1 && !done;
          return (
            <div
              key={i}
              className={`whitespace-pre ${line.cls}`}
              style={{ paddingLeft: `${line.indent * 0.5}rem` }}
            >
              {line.text}
              {isLast && (
                <span className="ml-1 inline-block h-3.5 w-[7px] translate-y-[2px] animate-pulse bg-accent" />
              )}
            </div>
          );
        })}

        {/* Progress shimmer when compiling */}
        {!done && (
          <div className="mt-3 h-px overflow-hidden bg-border/60">
            <div className="h-full w-1/3 animate-[qody-shimmer_1.4s_linear_infinite] bg-accent/70" />
          </div>
        )}
      </div>
    </div>
  );
}
