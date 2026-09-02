"use client";

import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

const COMBINE = ["engineering", "design", "growth"];

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
            <div className="border-l-2 border-accent pl-6 md:pl-8">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                + 02 · {dict.about.vision}
              </div>
              <p className="mt-5 text-[clamp(1.3rem,2.6vw,2rem)] font-light leading-relaxed tracking-[-0.01em] text-foreground">
                {dict.about.visionText}
              </p>
            </div>
            <div className="border-l-2 border-border-strong pl-6 md:pl-8">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                + 03 · {dict.about.mission}
              </div>
              <p className="mt-5 text-[clamp(1.3rem,2.6vw,2rem)] font-light leading-relaxed tracking-[-0.01em] text-muted">
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
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {dict.pages.about.approach.map((a, i) => (
              <div key={i} className="border-t border-border pt-5">
                <div className="font-mono text-sm text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{a}</p>
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
