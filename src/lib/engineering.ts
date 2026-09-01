/**
 * Engineering constellation — the disciplines behind building for
 * real-world problems. Capability-focused, NOT a list of languages or logos.
 */
export type EngNode = {
  id: string;
  label: string;
  /** Short glyph shown on the node (no logos). */
  glyph: string;
  desc: string;
  /** Additional technical info revealed on click. */
  details: string[];
  /** 3D position relative to the center. */
  pos: [number, number, number];
};

export const ENGINEERING_CENTER = "Qodily Engineering";

export const ENGINEERING_NODES: EngNode[] = [
  {
    id: "frontend",
    label: "Frontend",
    glyph: "UI",
    desc: "Interfaces people actually use — fast, accessible and consistent across every device.",
    details: [
      "Component architecture & design systems",
      "Performance budgets & accessibility",
      "Responsive, cross-device consistency",
    ],
    pos: [3.1, 0.2, 0.4],
  },
  {
    id: "backend",
    label: "Backend",
    glyph: "BE",
    desc: "The logic that runs behind the scenes — rules, processes and reliability.",
    details: [
      "Service & concurrency design",
      "Transactions & error handling",
      "Observability & resilience",
    ],
    pos: [-2.6, 1.4, 1.5],
  },
  {
    id: "api",
    label: "API",
    glyph: "AP",
    desc: "The connections between systems — data moving where it should, securely.",
    details: [
      "Typed contracts & versioning",
      "Auth, rate limiting & documentation",
      "Secure, consistent data exchange",
    ],
    pos: [1.2, 2.4, -1.4],
  },
  {
    id: "database",
    label: "Database",
    glyph: "DB",
    desc: "Where data is stored, structured and retrieved — without loss.",
    details: [
      "Schema & index design",
      "Migrations, backups, integrity",
      "Query performance at scale",
    ],
    pos: [-3.3, -0.8, 0.3],
  },
  {
    id: "cloud",
    label: "Cloud",
    glyph: "CL",
    desc: "Infrastructure that scales — deploy, run and stop worrying about uptime.",
    details: [
      "Provisioning & scaling",
      "CI/CD & monitoring",
      "Cost control & security",
    ],
    pos: [2.1, -1.9, 1.3],
  },
  {
    id: "mobile",
    label: "Mobile",
    glyph: "MO",
    desc: "Native-quality experiences in your customers' pockets.",
    details: [
      "Offline support & push",
      "Secure local storage",
      "Store release process",
    ],
    pos: [-1.3, -2.5, -1.2],
  },
  {
    id: "analytics",
    label: "Analytics",
    glyph: "AN",
    desc: "Turning data into decisions — measure what actually matters.",
    details: [
      "Event & pipeline design",
      "Dashboards that inform action",
      "Privacy-first measurement",
    ],
    pos: [2.9, -0.6, -1.6],
  },
  {
    id: "ai",
    label: "AI",
    glyph: "AI",
    desc: "Automating the complex — from classification to assistants.",
    details: [
      "Prompt & retrieval pipelines",
      "Evaluation & guardrails",
      "Cost-aware inference",
    ],
    pos: [-1.6, 2.5, -1.8],
  },
  {
    id: "automation",
    label: "Automation",
    glyph: "AU",
    desc: "Removing repetitive work so teams focus on judgement, not copy-paste.",
    details: [
      "Workflow orchestration",
      "Integrations done reliably",
      "Failure handling & idempotency",
    ],
    pos: [0.1, -1.2, 3.0],
  },
];
