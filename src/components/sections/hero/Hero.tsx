"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";
import { Button, Text } from "@/components/ui";
import { Magnetic } from "@/components/interactions";
import { DynamicWebGL } from "@/components/webgl";
import { getPillars } from "@/lib/navigation";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const dict = useTranslations();
  const locale = useLocale();
  const pillarItems = getPillars(dict, locale);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden"
      id="top"
      aria-label="Qodily-dz — digital solutions"
    >
      {/* Digital field atmosphere — gradient base layer always present; the WebGL
          canvas is skipped entirely for reduced-motion users and layers on top
          for everyone else, degrading to the gradient if WebGL is unavailable. */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
        <DynamicWebGL
          kind="digital-field"
          disabled={!!reduced}
          fallback={
            <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0b1018_0%,#030405_60%)]" />
          }
        />
      </div>

      {/* Readability vignette + bottom fade */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(95%_85%_at_50%_42%,rgba(3,4,5,0.92)_0%,rgba(3,4,5,0.55)_46%,rgba(3,4,5,0)_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
        aria-hidden
      />

      {/* Content */}
      <Container className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 md:px-16 md:py-32 lg:px-20 xl:px-28 2xl:px-32">
        <motion.div
          className="w-full"
          {...rise(0.05)}
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted sm:justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            <span>{dict.hero.label}</span>
            <span aria-hidden className="text-muted-more">/</span>
            <span className="hidden sm:inline">{dict.hero.subLabel}</span>
          </div>
        </motion.div>

        {/* Editorial headline */}
        <motion.h1
          className="mt-6 text-left font-medium leading-[0.95] tracking-[-0.03em] text-foreground sm:text-center"
          {...rise(0.15)}
        >
          <span className="block text-[clamp(2.5rem,9vw,7rem)]">{dict.hero.headline1}</span>
          <span className="block text-[clamp(2.5rem,9vw,7rem)]">
            {dict.hero.headline2}{" "}
            <Magnetic strength={5} radius={120} style={{ verticalAlign: "top" }}>
              <span className="inline-flex text-accent">
                {dict.hero.headlineAccent}
              </span>
            </Magnetic>
          </span>
        </motion.h1>

        {/* Supporting copy */}
        <motion.div className="mt-7 max-w-xl sm:mx-auto sm:text-center" {...rise(0.28)}>
          <Text
            size="lg"
            muted
            className="text-muted sm:mx-auto sm:max-w-md"
            as="p"
          >
            {dict.hero.supporting}
          </Text>
        </motion.div>

        {/* CTA row */}
        <motion.div
          className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
          {...rise(0.4)}
        >
          <Magnetic strength={6} radius={130} className="w-full sm:w-auto">
            <Button href={`/${locale}/contact`} size="lg" className="w-full sm:w-auto">
              {dict.hero.cta1}
              <span aria-hidden>→</span>
            </Button>
          </Magnetic>
          <Button
            href={`/${locale}/work`}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            {dict.hero.cta2}
            <span aria-hidden>→</span>
          </Button>
        </motion.div>
      </Container>

      {/* Build · Design · Grow strip */}
      <motion.div
        className="relative z-10 border-t border-border/60"
        {...rise(0.52)}
      >
        <Container className="px-6 sm:px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-32">
          <div className="flex items-center justify-between py-5">
            {pillarItems.map((p, i) => (
              <div key={p.label} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden className="hidden text-muted-more sm:inline">
                    ·
                  </span>
                )}
                <a
                  href={p.href}
                  data-cursor="link"
                  className="text-xs font-medium uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
                >
                  {p.label}
                </a>
              </div>
            ))}
            <span aria-hidden className="hidden text-xs uppercase tracking-[0.22em] text-muted-more sm:inline">
              Qodily-dz
            </span>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
