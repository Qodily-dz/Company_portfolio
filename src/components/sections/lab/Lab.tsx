"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

type Experiment = {
  id: string;
  label: "LAB" | "CONCEPT";
  order: string;
  title: string;
  purpose: string;
  note: string;
  tags: string[];
  status: string;
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "prompt-intake",
    label: "LAB",
    order: "01",
    title: "Prompt-routed document intake",
    purpose: "AI experiments",
    note: "Whether an unstructured brief or a messy export can be routed, cleaned and turned into structured data by a prompt pipeline — with a human check before anything is trusted.",
    tags: ["LLM pipelines", "Extraction", "Review"],
    status: "In progress",
  },
  {
    id: "white-label-saas",
    label: "CONCEPT",
    order: "02",
    title: "White-label workflow SaaS",
    purpose: "SaaS concepts",
    note: "A reusable core legitimately re-skinned per business, so a proven workflow could become a product any team could run without custom development each time.",
    tags: ["Multi-tenant", "Product", "Reuse"],
    status: "Prototype",
  },
  {
    id: "order-automation",
    label: "LAB",
    order: "03",
    title: "Order-to-invoice automations",
    purpose: "Automation",
    note: "Chaining order capture, stock check and invoicing into one flow, to see how much manual re-keying real-world back office work can actually shed.",
    tags: ["Workflows", "Integrations", "Triggers"],
    status: "Experimenting",
  },
  {
    id: "morph-ui",
    label: "LAB",
    order: "04",
    title: "Morphing interface kit",
    purpose: "UI experiments",
    note: "A small set of components that reshapes live between list, card and screen states — testing how fluid a UI can stay without losing orientation or predictability.",
    tags: ["Motion", "Components", "Design tokens"],
    status: "Prototype",
  },
  {
    id: "generative-scene",
    label: "CONCEPT",
    order: "05",
    title: "Generative brand scene",
    purpose: "Creative technology",
    note: "A brand visual generated procedurally in the browser instead of designed as a static asset — exploring real-time, rule-driven identity that can breathe on its own.",
    tags: ["WebGL", "Shaders", "Brand"],
    status: "Concept",
  },
  {
    id: "ops-dashboard",
    label: "LAB",
    order: "06",
    title: "Project ops dashboard",
    purpose: "Internal tools",
    note: "An internal view built to answer \u2018where is every project, and what is the next blocked step\u2019 without commuting across spreadsheets and inboxes.",
    tags: ["Internal", "Visibility", "Kanban"],
    status: "In use by Qodily",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function Badge({ label }: { label: "LAB" | "CONCEPT" }) {
  const dict = useTranslations();
  const isLab = label === "LAB";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
        isLab
          ? "border-teal/40 text-teal"
          : "border-accent/40 text-accent"
      }`}
    >
      {isLab ? dict.lab.labBadge : dict.lab.conceptBadge}
    </span>
  );
}

function ExperimentRow({
  exp,
  active,
  onToggle,
}: {
  exp: Experiment;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-border/60">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        className="group flex w-full items-center gap-5 py-6 text-left md:py-7"
      >
        <span className="hidden w-10 shrink-0 text-sm tabular-nums text-muted-more md:block">
          {exp.order}
        </span>
        <span className="w-36 shrink-0">
          <Badge label={exp.label} />
        </span>
        <span className="flex-1">
          <span className="block text-[clamp(1.3rem,3vw,2rem)] font-medium leading-tight tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
            {exp.title}
          </span>
          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-muted-more">
            {exp.purpose}
          </span>
        </span>
        <span className="hidden shrink-0 text-xs text-muted-more sm:block">
          {exp.status}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: active ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="shrink-0 text-xl text-muted"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-7 pl-0 md:pl-[6.75rem]">
              <p className="max-w-2xl text-base leading-relaxed text-muted">{exp.note}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {exp.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-muted"
                  >
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-xs uppercase tracking-[0.14em] text-muted-more">
                  {exp.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Lab() {
  const dict = useTranslations();
  const [openId, setOpenId] = useState<string | null>(EXPERIMENTS[0].id);

  return (
    <section
      id="lab"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Qodily Lab — experimental projects"
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_40%,#0c0c12_0%,#050505_60%)]" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl">
          <SectionLabel>{dict.lab.label}</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
            <span className="block">{dict.lab.heading1}</span>
            <span className="block text-accent">{dict.lab.heading2}</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            {dict.lab.note}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {dict.lab.purposeTags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 border-b border-border/60"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {EXPERIMENTS.map((exp) => (
            <ExperimentRow
              key={exp.id}
              exp={exp}
              active={openId === exp.id}
              onToggle={() => setOpenId(openId === exp.id ? null : exp.id)}
            />
          ))}
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-more">
          <span>Every experiment is carried out and owned by Qodily.</span>
          <span className="uppercase tracking-[0.16em]">{dict.lab.notClientWork}</span>
        </div>
      </Container>
    </section>
  );
}
