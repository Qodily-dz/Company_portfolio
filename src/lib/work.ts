/**
 * Qodily Lab — a collection of conceptual projects.
 *
 * IMPORTANT: These are clearly-labelled conceptual explorations owned by
 * Qodily Lab, NOT commissioned client work. No clients, results or metrics
 * are fabricated. Outcomes are written qualitatively and the status of every
 * project is "Concept".
 */
export type Project = {
  id: string;
  title: string;
  category: string;
  short: string;
  /** 2–3 line hook for the portfolio tile. */
  summary: string;
  problem: string;
  solution: string;
  approach: string;
  design: string;
  product: string;
  technology: string[];
  outcome: string;
  /** Accent for the procedural preview & tile accents (kept in brand family). */
  accent: { a: string; b: string };
  span: string;
};

export const WORK_LABEL = "Qodily Lab";
export const WORK_NOTE =
  "Conceptual explorations, not client commissions. No two alike — same system, different problems.";

export const PROJECTS: Project[] = [
  {
    id: "restaurant-management",
    title: "Restaurant Management Platform",
    category: "Operations · Software",
    short: "One system to run tables, kitchen and orders from a single screen.",
    summary:
      "Connecting floor, kitchen and back office so a busy service runs without paper, phone tag or misplaced orders.",
    problem:
      "A restaurant relied on paper notes, phone calls and separate tablets. Orders got lost between floor and kitchen, stock was a spreadsheet, and there was no single view of the day's business.",
    solution:
      "A unified platform where front-of-house, kitchen and back office work from one live source of truth — orders, tables, stock and reports in a single flow.",
    approach:
      "Start with the worst pain: the order path from guest to kitchen. Design that path first, then layer stock and reporting around it so every part reads from the same data.",
    design:
      "A calm, high-in-contrast interface built for speed — big touch targets for the kitchen screen, clear status colours for open/completed orders, and a floor view that shows tables as the team actually sees them.",
    product:
      "Table and floor management, order entry with modifiers, a kitchen queue, stock tracking and end-of-day reports — one login, one system.",
    technology: ["Next.js", "Node.js", "PostgreSQL", "WebSockets"],
    outcome:
      "Concept: the design removes the shared friction of a busy service by replacing paper and phone with one ordered workflow. To be validated with a live venue before build.",
    accent: { a: "#7c5cff", b: "#4fd8b8" },
    span: "md:col-span-7",
  },
  {
    id: "e-commerce",
    title: "E-Commerce Platform",
    category: "Commerce · Product",
    short: "Catalog, cart, checkout and orders in one continuous buying flow.",
    summary:
      "Moving sales from spreadsheets and social DMs into a store with a clear, trustworthy checkout.",
    problem:
      "Products were listed in a spreadsheet and orders arrived by WhatsApp and email. Stock and shipping were tracked by hand, and the customer had no real storefront.",
    solution:
      "An online store where customers browse, buy and track, and the team manages catalog, stock and orders from one place.",
    approach:
      "Protect the checkout — the highest-leverage moment. Build a distraction-free path to purchase first, then layer discovery, product pages and the order inbox around it.",
    design:
      "Editorial product pages that let images and price breathe, a fast one-screen checkout, and clear order status so customers always know where their purchase is.",
    product:
      "Product catalog with search and filtering, cart and checkout, payment wiring, and an order management inbox for the team.",
    technology: ["Next.js", "Stripe", "PostgreSQL", "TypeScript"],
    outcome:
      "Concept: the flow turns a manual, chat-based sales process into a self-serve store, freeing the team to focus on products rather than re-keying orders.",
    accent: { a: "#9d84ff", b: "#7c5cff" },
    span: "md:col-span-5",
  },
  {
    id: "business-crm",
    title: "Business CRM",
    category: "Sales · Software",
    short: "Leads, deals and follow-ups tracked so nothing slips between inboxes.",
    summary:
      "Replacing notebooks and scattered inboxes with a view of every relationship and next action.",
    problem:
      "Contacts and follow-ups lived in inboxes, notebooks and memory. Deals stalled because there was no reliable place to see what was next.",
    solution:
      "A lightweight CRM where a team records leads, tracks deals through stages and never loses the next step.",
    approach:
      "Keep the data-entry bar low or salespeople won't use it. Design for quick capture and automatic next-actions rather than heavy pipeline administration.",
    design:
      "Clean list and kanban views with minimal clutter, a persistent 'next action' cue on every contact, and fast inline editing so the tool stays out of the way.",
    product:
      "Contacts, pipelines with stages, task and follow-up tracking, notes, and simple filters per owner and stage.",
    technology: ["Next.js", "Supabase", "Tailwind", "OpenAI API"],
    outcome:
      "Concept: focuses a sales team on follow-up consistency — a reliably recorded next step for every relationship — rather than reporting busywork.",
    accent: { a: "#7c5cff", b: "#8f7cff" },
    span: "md:col-span-4",
  },
  {
    id: "medical-appointments",
    title: "Medical Appointment Platform",
    category: "Health · Scheduling",
    short: "Online booking with reminders so less time is spent on the phone.",
    summary:
      "Moving a clinic's diary from phone calls and paper to self-service bookings with reliable reminders.",
    problem:
      "Appointments were managed by phone and paper diaries. No-shows were common, staff spent hours confirming visits, and patients had no way to book outside opening hours.",
    solution:
      "An online booking system where patients choose a time, get reminders, and staff see and manage the calendar in real time.",
    approach:
      "Design for the person least comfortable with technology on the patient side, and for speed on the staff side. Smoothness of booking and clarity of reminders come first.",
    design:
      "A friendly step-by-step booking flow, a clear monthly/weekly calendar for staff, and reminder handling built into the schedule rather than bolted on.",
    product:
      "Public booking, time-slot management, automated reminders, and a shared staff calendar with protected time slots.",
    technology: ["Next.js", "PostgreSQL", "Node.js"],
    outcome:
      "Concept: aims to reduce no-shows and phone time by shifting booking and reminders to self-service — to be measured with a pilot clinic.",
    accent: { a: "#4fd8b8", b: "#7c5cff" },
    span: "md:col-span-4",
  },
  {
    id: "school-management",
    title: "School Management System",
    category: "Education · Software",
    short: "Grades, attendance and parent updates in one school-wide system.",
    summary:
      "Bringing scattered grade books, attendance lists and parent messages into a single, understandable platform.",
    problem:
      "Grades were kept in separate books, attendance on paper, and parents were updated by occasional notes. Staff had no shared, reliable record.",
    solution:
      "A school platform where teachers record, students and staff see results, and parents receive clear updates — all from one source.",
    approach:
      "Solve for teachers first — the tool must save them time or they won't use it. Grade capture and attendance should be fast, with parent visibility as a clean layer on top.",
    design:
      "A calm grade book with fast entry, dashboards for staff and parents, and role-based views so each person sees only what matters to them.",
    product:
      "Role-based accounts, grade book, attendance, timetables and parent-facing updates in a single system.",
    technology: ["Next.js", "PostgreSQL", "React"],
    outcome:
      "Concept: replaces duplicated paper records with one structured source of truth for a school — to be piloted with staff feedback.",
    accent: { a: "#7c5cff", b: "#9d84ff" },
    span: "md:col-span-4",
  },
  {
    id: "saas-dashboard",
    title: "SaaS Dashboard",
    category: "Product · Design",
    short: "Raw data turned into the few metrics a team can actually act on.",
    summary:
      "Designing a focused analytics surface so decisions come from clarity, not buried spreadsheets.",
    problem:
      "Teams had data — too much of it, in raw exports. There was no clear, trusted place to see how the product was doing and what to do next.",
    solution:
      "A dashboard that surfaces the few numbers that matter, with context and next actions instead of a wall of charts.",
    approach:
      "Reduce, don't collect. Interview the team to find the handful of decisions made weekly, then build the dashboard around those decisions rather than every available metric.",
    design:
      "A calm visual hierarchy — a small set of primary KPIs, trend context, and drill-downs — so the first glance answers 'are we okay?' without a manual.",
    product:
      "Curated KPI overview, trend and segment views, and lightweight annotations so every number has context.",
    technology: ["Next.js", "D3", "TypeScript"],
    outcome:
      "Concept: reframes reporting from more data to usable clarity — the usefulness to be confirmed with the team in early sessions.",
    accent: { a: "#8f7cff", b: "#4fd8b8" },
    span: "md:col-span-7",
  },
];
