"use client";

import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

/**
 * Dedicated /about page — editorial and human, deliberately free of heavy
 * WebGL. Vision, mission, values, story and approach read as a long-form
 * narrative with a distinct personality from the homepage.
 */
export function AboutPage() {
  const dict = useTranslations();

  return (
    <div aria-label={dict.pages.about.title}>
      {/* Editorial intro */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
        <Container className="relative z-10">
          <SectionLabel>{dict.pages.about.title}</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
            {dict.about.headingLines[0]}
            <span className="block">{dict.about.headingLines[1]}</span>
            <span className="block text-accent">{dict.about.headingLines[2]}</span>
          </h1>
          <p className="mt-10 max-w-2xl text-xl leading-relaxed text-muted">
            {dict.pages.about.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-medium uppercase tracking-[0.04em] text-foreground">
            {Object.values(dict.pillars).map((pillar, i) => (
              <span key={pillar} className="inline-flex items-baseline gap-3">
                {i > 0 && (
                  <span aria-hidden className="text-accent">
                    +
                  </span>
                )}
                <span>{pillar}</span>
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Story / body */}
      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="grid gap-12 md:grid-cols-5">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted md:col-span-1">
              + 01
            </div>
            <div className="md:col-span-4">
              <p className="max-w-3xl text-lg leading-relaxed text-muted">
                {dict.about.body}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision & Mission */}
      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="group relative overflow-hidden rounded-2xl border border-accent/30 bg-[linear-gradient(135deg,rgba(43,108,181,0.13),rgba(11,16,24,0.25)_55%,rgba(3,4,5,0.7))] p-7 md:p-9">
              <span className="pointer-events-none absolute -right-2 -top-7 font-mono text-[9rem] font-medium leading-none text-accent/[0.07] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden>
                02
              </span>
              <div className="relative text-xs font-medium uppercase tracking-[0.2em] text-accent">
                02 / {dict.about.vision}
              </div>
              <p className="relative mt-12 max-w-md text-[clamp(1.3rem,2.6vw,2rem)] font-light leading-relaxed tracking-[-0.01em] text-foreground">
                {dict.about.visionText}
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface/45 p-7 md:p-9">
              <span className="pointer-events-none absolute -right-2 -top-7 font-mono text-[9rem] font-medium leading-none text-foreground/[0.035] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden>
                03
              </span>
              <div className="relative text-xs font-medium uppercase tracking-[0.2em] text-muted">
                03 / {dict.about.mission}
              </div>
              <p className="relative mt-12 max-w-md text-[clamp(1.3rem,2.6vw,2rem)] font-light leading-relaxed tracking-[-0.01em] text-muted">
                {dict.about.missionText}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Approach */}
      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            + 04
          </div>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.2rem,6vw,4rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
            {dict.pages.about.approachHeading}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {dict.pages.about.approach.map((a, i) => (
              <div key={i} className="group rounded-xl border border-border bg-surface/30 p-6 transition-colors duration-300 hover:border-accent/50 hover:bg-surface/60">
                <div className="font-mono text-sm text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-8 h-px w-8 bg-border-strong transition-all duration-300 group-hover:w-full group-hover:bg-accent/70" aria-hidden />
                <p className="mt-5 text-[15px] leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            + 05
          </div>
          <h2 className="mt-4 text-[clamp(2.2rem,6vw,4rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
            {dict.about.values}
          </h2>
          <div className="mt-10">
            {dict.about.valuesList.map((v: { name: string; meaning: string }, i: number) => (
              <div key={v.name} className="border-b border-border py-6">
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-mono text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[clamp(1.9rem,5vw,3.5rem)] font-medium uppercase leading-none tracking-[-0.02em] text-foreground">
                    {v.name}
                  </span>
                </div>
                <p className="mt-4 max-w-2xl pl-8 text-[15px] leading-relaxed text-muted md:pl-14">
                  {v.meaning}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
