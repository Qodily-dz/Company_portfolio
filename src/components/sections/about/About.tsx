"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

const COMBINE = ["engineering", "design", "growth"];

export function About() {
  const dict = useTranslations();
  const [open, setOpen] = useState<string | null>("precision");
  const [hovered, setHovered] = useState<string | null>(null);

  const revealed = hovered ?? open;

  return (
    <section
      id="about"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="About Qodily-dz"
    >
      <Container>
        <div className="flex items-center gap-2">
          <SectionLabel>{dict.about.label}</SectionLabel>
        </div>

        <h2 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
          <span className="block">{dict.about.headingLines[0]}</span>
          <span className="block">{dict.about.headingLines[1]}</span>
          <span className="block">
            {(() => {
              const line = dict.about.headingLines[2];
              const idx = line.toLowerCase().indexOf("better solutions");
              if (idx === -1) return line;
              return (
                <>
                  {line.slice(0, idx)}
                  <span className="text-accent">{line.slice(idx)}</span>
                </>
              );
            })()}
          </span>
        </h2>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {dict.about.body}
          </p>
          <div className="flex flex-col justify-end">
            <p className="text-sm leading-relaxed text-muted-more">
              {dict.about.disciplinesIntro}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-medium uppercase tracking-[0.04em] text-foreground">
              {COMBINE.map((c, i) => (
                <span key={c} className="inline-flex items-baseline gap-3">
                  {i > 0 && (
                    <span aria-hidden className="text-accent">
                      +
                    </span>
                  )}
                  <span>{c}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-border pt-14 md:grid-cols-2 md:gap-16">
          <div className="border-l-2 border-accent pl-6 md:pl-8">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {dict.about.vision}
            </div>
            <p className="mt-5 text-[clamp(1.25rem,2.4vw,1.8rem)] font-light leading-relaxed tracking-[-0.01em] text-foreground">
              {dict.about.visionText}
            </p>
          </div>
          <div className="border-l-2 border-border-strong pl-6 md:pl-8">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {dict.about.mission}
            </div>
            <p className="mt-5 text-[clamp(1.25rem,2.4vw,1.8rem)] font-light leading-relaxed tracking-[-0.01em] text-muted">
              {dict.about.missionText}
            </p>
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {dict.about.values}
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-more">
              {dict.about.hoverToReveal}
            </div>
          </div>

          <div className="mt-6">
            {dict.about.valuesList.map((v: { name: string; meaning: string }, i: number) => {
              const isRevealed = revealed === v.name.toLowerCase();
              const isOpen = open === v.name.toLowerCase();
              return (
                <div
                  key={v.name}
                  className="group border-b border-border"
                  onMouseEnter={() => setHovered(v.name.toLowerCase())}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : v.name.toLowerCase())}
                    aria-expanded={isOpen}
                    className="block w-full py-5 text-left md:py-6"
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <div className="flex items-baseline gap-4 md:gap-6">
                        <span
                          className={`font-mono text-sm ${
                            isRevealed ? "text-accent" : "text-muted-more"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-[clamp(1.9rem,6vw,4rem)] font-medium uppercase leading-none tracking-[-0.02em] transition-colors duration-300 ${
                            isRevealed
                              ? "text-foreground"
                              : "text-muted group-hover:text-foreground"
                          }`}
                        >
                          {v.name}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className={`text-xl transition-all duration-300 ${
                          isRevealed ? "text-accent" : "text-muted-more"
                        }`}
                      >
                        {isRevealed ? "—" : "+"}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isRevealed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="max-w-2xl pb-6 pl-8 pr-4 md:pl-12">
                          <p className="text-[15px] leading-relaxed text-muted">
                            {v.meaning}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
