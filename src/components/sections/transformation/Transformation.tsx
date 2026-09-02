"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Scrubber({ progress, dragHint }: { progress: MotionValue<number>; dragHint: string }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const HANDLE = 52;

  const handleLeft = useTransform(progress, (v) => `${v * 100}%`);

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const usable = Math.max(rect.width - HANDLE, 1);
    const r = (clientX - rect.left - HANDLE / 2) / usable;
    const clamped = Math.min(Math.max(r, 0), 1);
    progress.set(clamped);
    if (sliderRef.current) {
      sliderRef.current.setAttribute(
        "aria-valuenow",
        String(Math.round(clamped * 100))
      );
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={dragHint}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-orientation="horizontal"
      className="pointer-events-auto relative h-12 w-full cursor-ew-resize touch-pan-y select-none"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          progress.set(Math.min(progress.get() + 0.06, 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          progress.set(Math.max(progress.get() - 0.06, 0));
        } else {
          return;
        }
        e.preventDefault();
      }}
    >
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border-strong" />
      <motion.div
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 origin-left bg-accent"
        style={{ width: handleLeft }}
      />
      <motion.div
        ref={sliderRef}
        className="absolute top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-surface shadow-[0_0_20px_rgba(43,92,145,0.35)]"
        style={{ left: handleLeft }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 5v14M16 5v14M5 8h6M5 16h6M13 8h6M13 16h6"
            stroke="#2b5c91"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

type GlyphParams = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rot: number;
  size: number;
};

function makeGlyphs(row: number): GlyphParams[] {
  const n = 6;
  const heights = [-10, 4, -16, 12, -6, 20];
  return Array.from({ length: n }, (_, i) => {
    const tx = 6 + (i * (88 / (n - 1)));
    const ty = 50 + heights[i % heights.length];
    return {
      tx,
      ty,
      sx: 12 + rand(row * 20 + i, 7) * 76,
      sy: 8 + rand(row * 20 + i, 9) * 84,
      rot: -32 + rand(row * 20 + i, 11) * 64,
      size: 10 + rand(row * 20 + i, 13) * 12,
    };
  });
}

function Glyph({
  progress,
  g,
}: {
  progress: MotionValue<number>;
  g: GlyphParams;
}) {
  const left = useTransform(progress, (v) => `${g.sx + (g.tx - g.sx) * v}%`);
  const top = useTransform(progress, (v) => `${g.sy + (g.ty - g.sy) * v}%`);
  const rot = useTransform(progress, (v) => g.rot * (1 - v));
  const scale = useTransform(progress, (v) => 1 - 0.28 * (1 - v));
  const bg = useTransform(progress, [0, 1], ["#273247", "#173b68"]);
  const op = useTransform(progress, (v) => 0.45 + 0.55 * v);

  return (
    <motion.span
      className="absolute rounded-[4px]"
      style={{
        left,
        top,
        width: g.size,
        height: g.size,
        rotate: rot,
        scale,
        backgroundColor: bg,
        opacity: op,
      }}
    />
  );
}

function TransformationRow({
  row,
  manual,
  digital,
  progress,
  manualLabel,
  digitalLabel,
}: {
  row: number;
  manual: string;
  digital: string;
  progress: MotionValue<number>;
  manualLabel: string;
  digitalLabel: string;
}) {
  const glyphs = useMemo(() => makeGlyphs(row), [row]);

  const lineScale = useTransform(progress, [0.3, 0.55, 1], [0, 1, 1]);
  const manualOp = useTransform(progress, [0, 0.55], [1, 0.3]);
  const digitalOp = useTransform(progress, [0.4, 0.85], [0.3, 1]);

  return (
    <div className="relative border-b border-border/60 py-6 md:py-7">
      <div className="grid grid-cols-[1fr] items-center gap-3 sm:grid-cols-[9rem_1fr_9rem] sm:gap-6">
        <motion.div
          className="text-left"
          style={{ opacity: manualOp }}
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-more">
            {manualLabel}
          </div>
          <div className="mt-1 text-lg text-muted sm:text-xl">{manual}</div>
        </motion.div>

        <div className="relative h-20 w-full overflow-hidden rounded-lg bg-secondary/40 sm:h-24">
          <motion.div
            className="absolute left-[6%] top-1/2 h-px origin-left bg-accent/70"
            style={{ width: "88%", scaleX: lineScale, opacity: lineScale }}
          />
          {glyphs.map((g, i) => (
            <Glyph key={i} progress={progress} g={g} />
          ))}
        </div>

        <motion.div className="text-left sm:text-right" style={{ opacity: digitalOp }}>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            {digitalLabel}
          </div>
          <div className="mt-1 text-lg text-foreground sm:text-xl">{digital}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function Transformation() {
  const progress = useMotionValue(0);
  const dict = useTranslations();
  const TRANSFORMATIONS = dict.transformation.rows.map(r => ({ manual: r.from, digital: r.to }));

  return (
    <section
      id="transformation"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Digital transformation — from manual to digital"
    >
      <Container>
        <div className="flex items-center gap-2">
          <SectionLabel>{dict.transformation.label}</SectionLabel>
        </div>

        <h2 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
          <span className="block">{dict.transformation.heading1}</span>
          <span className="block">
            {dict.transformation.heading2Accent} <span className="text-accent">{dict.transformation.heading2Rest}</span>
          </span>
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {dict.transformation.body}
        </p>

        <div className="mt-12 grid items-center gap-8 md:grid-cols-[1fr_16rem]">
          <p className="max-w-md text-sm leading-relaxed text-muted-more">
            <span className="font-medium uppercase tracking-[0.18em] text-muted">
              {dict.transformation.dragHint}
            </span>{" "}
            See how the same work becomes organised when it moves from manual to
            digital.
          </p>
          <Scrubber progress={progress} dragHint={dict.transformation.dragHint} />
        </div>

        <div className="mt-12">
          {TRANSFORMATIONS.map((t, i) => (
            <TransformationRow
              key={t.manual}
              row={i}
              manual={t.manual}
              digital={t.digital}
              progress={progress}
              manualLabel={dict.transformation.manual}
              digitalLabel={dict.transformation.digital}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
