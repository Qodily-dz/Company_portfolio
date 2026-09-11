"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CodeTerminal } from "./CodeTerminal";
import { Button, Text } from "@/components/ui";
import { Magnetic } from "@/components/interactions";
import { useTranslations, useLocale } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Lazy-load the heavy R3F data field */
const HeroSystem = dynamic(
  () => import("./HeroSystem").then((m) => ({ default: m.HeroSystem })),
  { ssr: false },
);

/* ---------------------------------------------------------------------------
 * Hero — BUILD SIGNAL.
 *
 * Asymmetric editorial composition, not a centered block:
 *
 *   LEFT (55%)  — a bold, offset statement and a short project invitation.
 *   RIGHT       — a live build console over a cursor-reactive signal field.
 *
 * Rather than a generic agency masthead, the hero feels like a product coming
 * online: signal, system, launch. The background responds to the cursor.
 * ------------------------------------------------------------------------- */

export function Hero() {
  const dict = useTranslations();
  const locale = useLocale();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden bg-background"
      id="top"
      aria-label={dict.meta.title}
    >
      {/* Animated data field — full-bleed background */}
      <div className="absolute inset-0">
        <HeroSystem />
      </div>

      {/* Leftward readability scrim so the type stays crisp over the signal field */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,4,5,0.9)_0%,rgba(3,4,5,0.55)_40%,rgba(3,4,5,0.15)_75%,rgba(3,4,5,0.5)_100%)]"
        aria-hidden
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-10 px-6 py-28 sm:px-10 md:px-16 md:py-32 lg:grid-cols-12 lg:py-36 xl:px-20 2xl:px-32">
        {/* LEFT — deliberately offset editorial type */}
        <div className="lg:col-span-7 xl:col-span-6">
          <motion.div {...rise(0.05)}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" aria-hidden />
              <span>{dict.hero.label}</span>
              <span aria-hidden className="text-accent">{"//"}</span>
              <span className="text-muted-more">{dict.hero.subLabel}</span>
            </div>
          </motion.div>

          <motion.h1
            className="mt-7 text-left font-medium leading-[0.94] tracking-[-0.035em] text-foreground"
            {...rise(0.12)}
          >
            <span className="block text-[clamp(3rem,7.2vw,6.25rem)]">{dict.hero.headline1}</span>
            <span className="ml-[8%] block text-[clamp(3rem,7.2vw,6.25rem)]">{dict.hero.headline2}</span>
            <span className="block text-[clamp(3rem,7.2vw,6.25rem)] text-accent">{dict.hero.headlineAccent}</span>
          </motion.h1>

          <motion.div className="mt-8 max-w-lg text-left" {...rise(0.22)}>
            <Text size="lg" muted as="p" className="text-muted">
              {dict.hero.supporting}
            </Text>
          </motion.div>

          <motion.div
            className="mt-9 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-more"
            {...rise(0.27)}
          >
            <span className="h-px w-10 bg-accent/70" aria-hidden />
            <span>{dict.hero.eyebrow}</span>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
            {...rise(0.32)}
          >
            <Magnetic strength={5} radius={120} className="w-full sm:w-auto">
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
        </div>

        {/* RIGHT — live build console over the interactive field */}
        <motion.div
          className="lg:col-span-5 xl:col-span-6"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          <div className="lg:pl-2 xl:pl-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CodeTerminal />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
