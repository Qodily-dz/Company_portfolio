"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

type StageId = "reach" | "engagement" | "leads" | "customers" | "growth";

type Stage = {
  id: StageId;
  label: string;
  desc: string;
  services: string[];
};

const STAGES: Stage[] = [
  {
    id: "reach",
    label: "Reach",
    desc: "Make your product visible where your customers already are — so the right people actually hear about it.",
    services: ["Social Media", "Meta Ads", "SEO"],
  },
  {
    id: "engagement",
    label: "Engagement",
    desc: "Give people a reason to stay — useful content and genuine conversation that turn a first look into real interest.",
    services: ["Content", "Social Media"],
  },
  {
    id: "leads",
    label: "Leads",
    desc: "Turn interest into enquiries — capture who wants to know more and make the next step effortless.",
    services: ["Lead Generation", "Content"],
  },
  {
    id: "customers",
    label: "Customers",
    desc: "Convert interest into paying customers with a clear, trustworthy path from \u2018interested\u2019 to \u2018bought\u2019.",
    services: ["Social Media", "Content", "Meta Ads"],
  },
  {
    id: "growth",
    label: "Growth",
    desc: "Keep improving — measure what actually works, double down on it and let the product grow over time.",
    services: ["Analytics", "Digital Strategy"],
  },
];

const SERVICES: Array<{ name: string; note: string; stages: StageId[] }> = [
  { name: "Social Media", note: "Show up where your audience scrolls.", stages: ["reach", "engagement", "customers"] },
  { name: "Content", note: "Publish value that earns attention.", stages: ["engagement", "leads", "customers"] },
  { name: "Meta Ads", note: "Put your product in front of the right people.", stages: ["reach", "customers"] },
  { name: "SEO", note: "Get found by people already searching.", stages: ["reach"] },
  { name: "Lead Generation", note: "Turn interest into enquiries.", stages: ["leads"] },
  { name: "Analytics", note: "Know what is working and what is not.", stages: ["growth"] },
  { name: "Digital Strategy", note: "A plan that ties visibility to growth.", stages: ["growth"] },
];

const STAGE_OF = (s: string): StageId | null => {
  const found = SERVICES.find((x) => x.name === s);
  return found ? found.stages[0] : null;
};

const F_TOP = 188;
const F_STEP = 34;
const F_H = 80;
const F_GAP = 10;

function layerPolygon(i: number): string {
  const topY = i * (F_H + F_GAP);
  const botY = topY + F_H;
  const topHW = F_TOP - i * F_STEP;
  const botHW = F_TOP - (i + 1) * F_STEP;
  return `M ${200 - topHW} ${topY} L ${200 + topHW} ${topY} L ${200 + botHW} ${botY} L ${200 - botHW} ${botY} Z`;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function Funnel({
  active,
  onFocus,
  labels,
}: {
  active: StageId;
  onFocus: (id: StageId) => void;
  labels: Record<StageId, string>;
}) {
  const pulse = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        delay: i * 1.4,
        dur: 4.2,
      })),
    []
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 460"
      className="max-h-[440px]"
      role="group"
      aria-label={Object.values(labels).join(", ")}
    >
      <defs>
        <linearGradient id="funnelFlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#173b68" stopOpacity="0" />
          <stop offset="50%" stopColor="#2b5c91" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#173b68" stopOpacity="0" />
        </linearGradient>
        <clipPath id="funnelClip">
          {STAGES.map((s, i) => (
            <path key={s.id} d={layerPolygon(i)} />
          ))}
        </clipPath>
      </defs>

      <g clipPath="url(#funnelClip)" pointerEvents="none">
        {pulse.map((p, i) => (
          <motion.rect
            key={i}
            x="40"
            y="-180"
            width="320"
            height="180"
            fill="url(#funnelFlow)"
            initial={{ y: -220 }}
            animate={{ y: 460 }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}
      </g>

      {STAGES.map((s, i) => {
        const isActive = active === s.id;
        const topY = i * (F_H + F_GAP);
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={labels[s.id]}
            aria-pressed={isActive}
            onClick={() => onFocus(s.id)}
            onPointerEnter={() => onFocus(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFocus(s.id);
              }
            }}
            className="cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <motion.path
              d={layerPolygon(i)}
              fill={isActive ? "rgba(43,92,145,0.30)" : "rgba(7,10,15,0.7)"}
              stroke={isActive ? "#2b5c91" : "#273247"}
              strokeWidth={isActive ? 1.8 : 1}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0.75 }}
              transition={{ duration: 0.25 }}
            />
            <g>
              <text
                x={200}
                y={topY + F_H / 2 + 4}
                textAnchor="middle"
                fontSize="13"
                fontWeight={isActive ? 600 : 500}
                fill={isActive ? "#ffffff" : "#7d8795"}
                fontFamily="ui-sans-serif, system-ui"
                letterSpacing="0.12em"
              >
                {labels[s.id].toUpperCase()}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function Grow() {
  const dict = useTranslations();
  const [active, setActive] = useState<StageId>("reach");
  const stage = STAGES.find((s) => s.id === active) ?? STAGES[0];
  const activeServices = stage.services;

  const stageLabel = (id: StageId): string => {
    const stages = dict.growth.funnelStages;
    switch (id) {
      case "reach": return stages.reach;
      case "engagement": return stages.engagement;
      case "leads": return stages.leads;
      case "customers": return stages.customers;
      case "growth": return stages.growth;
    }
  };

  const stageLabels: Record<StageId, string> = {
    reach: stageLabel("reach"),
    engagement: stageLabel("engagement"),
    leads: stageLabel("leads"),
    customers: stageLabel("customers"),
    growth: stageLabel("growth"),
  };

  return (
    <section
      id="growth"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label={dict.growth.label}
    >
      <Container>
        <div className="flex items-center gap-2">
          <SectionLabel>{dict.growth.label}</SectionLabel>
        </div>

        <h2 className="mt-6 text-[clamp(2.6rem,8vw,6rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
          <span className="block">{dict.growth.heading1}</span>
          <span className="block">
            {dict.growth.heading2Accent} <span className="text-accent">{dict.growth.heading2Rest}</span>
          </span>
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {dict.growth.body}
        </p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[440px] rounded-xl border border-border bg-surface/30 p-6">
            <Funnel active={active} onFocus={setActive} labels={stageLabels} />
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="rounded-xl border border-border bg-surface/60 p-6 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
                    {String(STAGES.indexOf(stage) + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl font-medium uppercase tracking-[0.06em] text-foreground">
                    {stageLabel(stage.id)}
                  </h3>
                  <span
                    className="ml-auto h-2 w-2 rounded-full"
                    style={{
                      background:
                        active === stage.id ? "#2b5c91" : "#173b68",
                    }}
                    aria-hidden
                  />
                </div>
                <p className="mt-4 max-w-md leading-relaxed text-muted">
                  {stage.desc}
                </p>

                {activeServices.length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-more">
                      {dict.growth.subLabel}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeServices.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            const s = STAGE_OF(name);
                            if (s) setActive(s);
                          }}
                          className="group rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-sm text-accent transition-colors hover:border-accent/60"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {SERVICES.map((svc, i) => {
            const lit = svc.stages.includes(active);
            return (
              <button
                type="button"
                key={svc.name}
                onClick={() => setActive(svc.stages[0])}
                className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all duration-200 ${
                  lit
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-surface/40 hover:border-border-strong"
                }`}
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                <span
                  className={`text-[13px] font-medium leading-tight ${
                    lit ? "text-foreground" : "text-muted"
                  }`}
                >
                  {svc.name}
                </span>
                <span className="text-xs leading-snug text-muted-more">
                  {svc.note}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-14 grid items-center gap-6 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 via-surface/40 to-accent-dim/40 p-8 md:grid-cols-[auto_1fr] md:p-10">
          <div className="text-[clamp(1.6rem,4vw,3rem)] font-medium uppercase leading-[0.95] tracking-[-0.02em] text-foreground">
            {dict.growth.bottomMessage1} <span className="text-accent">{dict.growth.bottomMessage2Part1}</span>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted md:justify-self-end">
            {dict.growth.bottomMessage2Part2} <span className="text-foreground">{dict.growth.bottomMessage2Part3}</span>{" "}
            and <span className="text-foreground">grow</span> — {dict.growth.bottomMessage2Rest}
          </p>
        </div>
      </Container>
    </section>
  );
}
