"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { track, trackWhatsapp } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { useTranslations } from "@/lib/i18n";
import {
  EMPTY_REQUEST,
  OBJECTIVE_MAX_LENGTH,
  OBJECTIVE_MIN_LENGTH,
  TOTAL_STEPS,
  type BuildOption,
  type BudgetOption,
  type ContactDetails,
  type NeedOption,
  type ProjectRequest,
  type TimelineOption,
} from "@/lib/contact";

const EASE = [0.16, 1, 0.3, 1] as const;

type StepKey = "build" | "objective" | "needs" | "budget" | "timeline" | "contact";

const STEP_FIELDS: StepKey[] = [
  "build",
  "objective",
  "needs",
  "budget",
  "timeline",
  "contact",
];

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactRequests() {
  const dict = useTranslations();
  const [step, setStep] = useState(0);
  const [request, setRequest] = useState<ProjectRequest>(EMPTY_REQUEST);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  // Hidden honeypot — bots fill it, real users never see it.
  const [honeypot, setHoneypot] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const stepKey = STEP_FIELDS[step];
  const isSubmitting = status === "submitting";

  function updateRequest(patch: Partial<ProjectRequest>) {
    setRequest((r) => ({ ...r, ...patch }));
    // Any change addresses the current step's validation error.
    setStepError(null);
  }

  useEffect(() => {
    // Move focus to the step heading when the step changes so keyboard and
    // screen-reader users know which step they are on.
    headingRef.current?.focus();
  }, [step]);

  async function handleNext() {
    const error = errorForStep(stepKey, request, dict);
    if (error) {
      setStepError(error);
      errorRef.current?.focus();
      return;
    }

    if (step === 0) {
      track("contact_started", { build: request.build });
    }

    if (step === TOTAL_STEPS - 1) {
      await submit();
      return;
    }

    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 0) return;
    setStepError(null);
    setStep((s) => s - 1);
  }

  function selectBuild(option: BuildOption) {
    updateRequest({ build: option });
    track("service_selected", { service: option });
  }

  function toggleNeed(option: NeedOption) {
    setRequest((r) => {
      const has = r.needs.includes(option);
      return {
        ...r,
        needs: has
          ? r.needs.filter((n) => n !== option)
          : [...r.needs, option],
      };
    });
    setStepError(null);
  }

  async function submit() {
    setStatus("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, website: honeypot }),
      });
      if (!res.ok) throw new Error("request rejected");
      setStatus("success");
      track("contact_completed", {
        build: request.build,
        needs: request.needs,
        budget: request.budget,
        timeline: request.timeline,
      });
    } catch {
      setStatus("error");
      setSubmitError(dict.contact.submitError);
    }
  }

  const progress = `${String(step + 1).padStart(2, "0")} / ${String(
    TOTAL_STEPS,
  ).padStart(2, "0")}`;

  return (
    <form
      className="relative w-full max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault();
        void handleNext();
      }}
      noValidate
    >
      {status === "success" ? (
        <SuccessState
          onReset={() => {
            setRequest(EMPTY_REQUEST);
            setStep(0);
            setStatus("idle");
            setStepError(null);
            setHoneypot("");
          }}
          successMessage={dict.contact.successMessage}
          successBody={dict.contact.successBody}
          startNew={dict.contact.startNew}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <h3
              ref={headingRef}
              tabIndex={-1}
              className="text-[clamp(1.6rem,4vw,2.4rem)] font-medium uppercase leading-tight tracking-[-0.02em] text-foreground focus:outline-none"
            >
              {dict.contact.stepTitles[step]}
            </h3>
            <span className="shrink-0 font-mono text-sm tabular-nums text-accent">
              {progress}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2" aria-hidden>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors duration-300",
                  i <= step ? "bg-accent" : "bg-border",
                )}
              />
            ))}
          </div>

          <div className="mt-10 min-h-[16rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {stepKey === "build" && (
                  <OptionGrid
                    options={dict.contact.buildOptions as unknown as readonly string[]}
                    selected={request.build}
                    onSelect={(o) => selectBuild(o as BuildOption)}
                  />
                )}

                {stepKey === "objective" && (
                  <ObjectiveStep
                    value={request.objective}
                    onChange={(v) => updateRequest({ objective: v })}
                    placeholder={dict.contact.objectivePlaceholder}
                    minHint={dict.contact.objectiveMinHint}
                    goodHint={dict.contact.objectiveGoodHint}
                  />
                )}

                {stepKey === "needs" && (
                  <NeedStep
                    selected={request.needs}
                    onToggle={toggleNeed}
                    options={dict.contact.needOptions}
                  />
                )}

                {stepKey === "budget" && (
                  <OptionGrid
                    options={dict.contact.budgetOptions as unknown as readonly string[]}
                    selected={request.budget}
                    onSelect={(o) =>
                      updateRequest({ budget: o as BudgetOption })
                    }
                    hint={dict.contact.budgetHint}
                  />
                )}

                {stepKey === "timeline" && (
                  <OptionGrid
                    options={dict.contact.timelineOptions as unknown as readonly string[]}
                    selected={request.timeline}
                    onSelect={(o) =>
                      updateRequest({ timeline: o as TimelineOption })
                    }
                  />
                )}

                {stepKey === "contact" && (
                  <ContactStep
                    value={request.contact}
                    onChange={(patch) =>
                      updateRequest({
                        contact: { ...request.contact, ...patch },
                      })
                    }
                    labels={{
                      name: dict.contact.name,
                      company: dict.contact.company,
                      email: dict.contact.email,
                      phone: dict.contact.phone,
                      country: dict.contact.country,
                      messageLabel: dict.contact.messageLabel,
                      messagePlaceholder: dict.contact.messagePlaceholder,
                    }}
                    error={errorForStep("contact", request, dict)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {stepError && (
            <div
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="mt-6 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error focus:outline-none"
            >
              {stepError}
            </div>
          )}

          {status === "error" && submitError && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            >
              {submitError}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || isSubmitting}
              aria-label="Go back"
            >
              {dict.contact.back}
            </Button>

            <div className="flex items-center gap-4">
              {step < TOTAL_STEPS - 1 && (
                <Button variant="outline" onClick={() => void handleNext()} disabled={isSubmitting}>
                  {dict.contact.continue}
                </Button>
              )}
              {step === TOTAL_STEPS - 1 && (
                <Button
                  type="submit"
                  onClick={() => void handleNext()}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? <Spinner /> : dict.contact.sendCta}
                </Button>
              )}
            </div>
          </div>

          <WhatsAppRow
            preferChat={dict.contact.preferChat}
            whatsappCta={dict.contact.whatsappCta}
            whatsappPrefill={dict.contact.whatsappPrefill}
          />

          {/* Honeypot — visually hidden from users, attractive to bots.
              Kept out of tab order and off screen-reader announcements. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              tabIndex={-1}
              autoComplete="off"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </>
      )}
    </form>
  );
}

function OptionGrid({
  options,
  selected,
  onSelect,
  hint,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (option: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-md border px-5 py-4 text-left text-sm font-medium transition-all duration-200",
                isSelected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hint && (
        <p className="mt-4 text-xs text-muted-more">{hint}</p>
      )}
    </div>
  );
}

function ObjectiveStep({
  value,
  onChange,
  placeholder,
  minHint,
  goodHint,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minHint: string;
  goodHint: string;
}) {
  return (
    <div>
      <Textarea
        id="objective"
        name="objective"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="What is your objective?"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-more">
        <span>
          {value.trim().length < OBJECTIVE_MIN_LENGTH
            ? minHint
            : goodHint}
        </span>
        <span>
          {value.length}/{OBJECTIVE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}

function NeedStep({
  selected,
  onToggle,
  options,
}: {
  selected: NeedOption[];
  onToggle: (option: NeedOption) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = selected.includes(option as NeedOption);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option as NeedOption)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isSelected
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ContactStep({
  value,
  onChange,
  labels,
  error,
}: {
  value: ContactDetails;
  onChange: (patch: Partial<ContactDetails>) => void;
  labels: {
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    messageLabel: string;
    messagePlaceholder: string;
  };
  error: string | null;
}) {
  const fields: {
    key: keyof ContactDetails;
    label: string;
    type?: string;
    autoComplete?: string;
    required?: boolean;
  }[] = [
    { key: "name", label: labels.name, required: true, autoComplete: "name" },
    { key: "company", label: labels.company, autoComplete: "organization" },
    { key: "email", label: labels.email, type: "email", required: true, autoComplete: "email" },
    { key: "phone", label: labels.phone, type: "tel", autoComplete: "tel" },
    { key: "country", label: labels.country, autoComplete: "country" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <label
              htmlFor={`contact-${field.key}`}
              className="text-sm font-medium text-foreground-soft"
            >
              {field.label}
              {field.required && (
                <span className="ml-0.5 text-accent" aria-hidden>*</span>
              )}
            </label>
            <Input
              id={`contact-${field.key}`}
              name={field.key}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              value={value[field.key]}
              onChange={(e) =>
                onChange({ [field.key]: e.target.value } as Partial<ContactDetails>)
              }
              required={field.required}
              placeholder={field.label}
            />
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="text-sm font-medium text-foreground-soft"
          >
            {labels.messageLabel}
          </label>
          <Textarea
            id="contact-message"
            name="message"
            value={value.message}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder={labels.messagePlaceholder}
            aria-label="Message"
          />
          {error && (
            <p className="mt-1 text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppRow({ preferChat, whatsappCta, whatsappPrefill }: { preferChat: string; whatsappCta: string; whatsappPrefill: string }) {
  const href = withPrefill(siteConfig.whatsapp, whatsappPrefill);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted-more">{preferChat}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsapp({ channel: "contact_form" })}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border-strong px-6 text-sm font-medium text-foreground transition-all duration-200 hover:border-accent hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {whatsappCta}
      </a>
    </div>
  );
}

function SuccessState({
  onReset,
  successMessage,
  successBody,
  startNew,
}: {
  onReset: () => void;
  successMessage: string;
  successBody: string;
  startNew: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Announce the outcome to assistive tech and move focus off the submit
    // button that just disappeared.
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-start gap-6 py-6" role="status">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="text-[clamp(1.8rem,4.5vw,3rem)] font-medium uppercase leading-tight tracking-[-0.02em] text-foreground focus:outline-none"
        >
          {successMessage}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          {successBody}
        </p>
      </div>
      <Button variant="outline" onClick={onReset}>
        {startNew}
      </Button>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function errorForStep(
  stepKey: StepKey,
  request: ProjectRequest,
  dict: ReturnType<typeof useTranslations>,
): string | null {
  switch (stepKey) {
    case "build":
      return request.build ? null : dict.contact.errors.build;
    case "objective":
      return request.objective.trim().length >= OBJECTIVE_MIN_LENGTH
        ? null
        : dict.contact.errors.objective;
    case "needs":
      return request.needs.length > 0 ? null : dict.contact.errors.needs;
    case "budget":
      return request.budget ? null : dict.contact.errors.budget;
    case "timeline":
      return request.timeline ? null : dict.contact.errors.timeline;
    case "contact": {
      const c = request.contact;
      if (!c.name.trim()) return dict.contact.errors.name;
      if (!c.email.trim()) return dict.contact.errors.email;
      if (!/\S+@\S+\.\S+/.test(c.email)) return dict.contact.errors.email;
      return null;
    }
  }
}

function withPrefill(baseUrl: string, message: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("text", message);
  return url.toString();
}
