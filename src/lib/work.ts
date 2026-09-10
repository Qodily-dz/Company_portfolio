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
  /** Optional product footage — screenshots/photos shown on the case study. */
  gallery?: { url: string; alt?: string }[];
  /** Label shown on the card badge, e.g. "Client Production". */
  badge?: string;
  /** True for shipped work; false/absent marks a Qodily Lab concept. */
  isProduction?: boolean;
};

export const WORK_LABEL = "Qodily Projects";
export const WORK_NOTE =
  "Production platforms, client systems and conceptual explorations engineered by Qodily.";

export const PROJECTS: Project[] = [
  {
    id: "geststock-simple",
    title: "GestStock Simple",
    category: "Operations \u00b7 Software",
    short:
      "The same stock-and-till core, trimmed for a single counter.",
    summary:
      "A lighter edition of GestStock for a small store: the same purchase-to-cash spine, without the returns desk and per-shop configuration a larger operation needs.",
    problem:
      "A small counter needs the stock and cash discipline of a full back office, but every extra screen it will never use is training time and a place to make mistakes.",
    solution:
      "The same core \u2014 products, stock, suppliers, sales, payments, client accounts, expenses and cash closing \u2014 with the heavier modules left out rather than hidden.",
    approach:
      "Share the domain with the detailed edition and cut at the seam: drop sale returns and shop settings, keep every path that touches stock or money identical.",
    design:
      "The same dense back office with a shorter menu, so an operator moving up to the detailed edition finds the screens where they left them.",
    product:
      "Products and stock, suppliers with purchase invoices, sales with line items, client accounts and payments, expenses, and end-of-day cash closing.",
    technology: ["React 19", "TypeScript", "Laravel", "MySQL", "TanStack Query"],
    outcome:
      "The entry tier of a two-edition product line: a small store runs the simple build and moves to the detailed one without relearning the system.",
    accent: { a: "#4a8fd8", b: "#2b6cb5" },
    span: "md:col-span-6",
    badge: "Produit",
    isProduction: true,
  },
  {
    id: "geststock",
    title: "GestStock",
    category: "Operations \u00b7 Software",
    short:
      "Stock, sales and cash for a medical store, in one back office.",
    summary:
      "Running a medical store from purchase invoice to cash closing without the stock ledger, the till and the supplier account ever disagreeing.",
    problem:
      "Stock, sales and money were tracked in separate places. Nobody could say what was really in the store, what a client still owed, or whether the till matched the day's sales.",
    solution:
      "One back office where every movement is recorded once: purchases raise stock, sales lower it, payments and returns adjust the balance, and the day closes against a single figure.",
    approach:
      "Model the money trail first \u2014 sale, payment, return, cash closing \u2014 then hang products, stock and suppliers off it, so the numbers reconcile by construction rather than by end-of-day arithmetic.",
    design:
      "A dense, keyboard-friendly back office: fast product lookup, running totals always visible, and a cash-closing screen that shows the expected figure beside the counted one.",
    product:
      "Products and stock levels, suppliers with purchase invoices, sales with line items, client accounts, payments and returns, expenses, and an end-of-day cash closing.",
    technology: ["React 19", "TypeScript", "Laravel", "MySQL", "TanStack Query"],
    outcome:
      "A complete stock-and-till system for medical retail: the full edition, adding a returns desk and per-shop configuration on top of the shared core.",
    accent: { a: "#2b6cb5", b: "#4a8fd8" },
    span: "md:col-span-6",
    badge: "Produit",
    isProduction: true,
  },
  {
    id: "ecommerce-suite",
    title: "E-Commerce Suite",
    category: "Commerce \u00b7 Product",
    short:
      "One Laravel back office behind several branded storefronts.",
    summary:
      "A single catalogue and order back office serving several branded storefronts, so a new shop is a front end rather than a new system.",
    problem:
      "Every new shop meant rebuilding the same catalogue, product pages and order handling from scratch, with a different codebase to maintain for each brand.",
    solution:
      "One backend owning categories, products, images and orders, with storefronts built as separate front ends against the same API \u2014 parapharmacy, fashion and perfume among them.",
    approach:
      "Keep the shared domain in one place and let each storefront own only its look and copy, so a new brand is a theme and a deployment rather than a fork.",
    design:
      "Catalogue-first storefronts: clear category browsing, product pages that let images and price breathe, and a short order form instead of a multi-step checkout.",
    product:
      "Category and product catalogue with images, product detail pages, a quick order form, an order inbox and contact handling in the back office.",
    technology: ["Laravel", "PHP", "React", "TypeScript", "TailwindCSS"],
    outcome:
      "Three storefront templates running on one backend, which turns each additional shop into front-end work instead of another full build.",
    accent: { a: "#3f8f7a", b: "#5fb8a0" },
    span: "md:col-span-6",
    badge: "Produit",
    isProduction: true,
  },
  {
    id: "fedelo",
    title: "Fedelo",
    category: "SaaS · Loyalty & Queue Management",
    short: "Digital loyalty cards, Apple Wallet passes, and live queue tracking for local businesses.",
    summary:
      "Digitizing customer retention and live queue management for barbershops, salons, and local retail.",
    problem:
      "Local commerce lost clients due to misplaced paper stamp cards, unpredictable wait times, and a lack of direct re-engagement tools.",
    solution:
      "A complete SaaS platform uniting digital loyalty passes (Apple Wallet compatible), live mobile queues, and self-service booking.",
    approach:
      "Build a zero-friction, passwordless PWA accessed via QR code for clients, backed by an owner dashboard tracking throughput and rewards.",
    design:
      "A sophisticated dark interface with warm gold accents (#D4AF37), built for glanceable clarity in busy venues with an interactive punch card.",
    product:
      "Apple Wallet passes, live queue tracking with Web Push notifications, merchant dashboard with real-time occupancy metrics and custom reward rules.",
    technology: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "Web Push", "Apple PassKit", "Stripe"],
    outcome:
      "Production SaaS platform enabling venues to eliminate paper, increase customer retention, and balance peak-hour customer flow.",
    accent: { a: "#d4af37", b: "#e5c158" },
    span: "md:col-span-7",
    badge: "SaaS Produit",
    isProduction: true,
  },
  {
    id: "my-voucher-booking",
    title: "MY Voucher Booking",
    category: "Travel Platform · B2B/B2C Booking",
    short: "Hotel reservations, organized tours, and Omra packages with QR voucher generation and BaridiMob / CCP verification.",
    summary:
      "End-to-end booking platform for Algerian travel agency MY Voucher Booking (Constantine) unifying public booking, customer portal, B2B agency portal, and admin desk.",
    problem:
      "The agency relied on chaotic WhatsApp messages and paper vouchers. Offline CCP/BaridiMob transfers caused booking mismatches, and partner agencies had no direct access to negotiated rates.",
    solution:
      "An integrated booking platform managing hotels, tour packages, and Omra trips, with an enforced phone confirmation step before payment, automated QR voucher generation, and a B2B agency portal.",
    approach:
      "Align with the agency's real-world business model: mandatory human confirmation before money moves, integer centime financial calculations, and 5-language localization (FR, AR, EN, TR, ES).",
    design:
      "Inviting teal and orange visual brand, comprehensive multi-criteria search with dynamic filters, and professional printable A4 PDF vouchers.",
    product:
      "Night-by-night pricing engine, Reed-Solomon QR voucher issuer, BaridiMob & CCP payment verification pipeline, and multi-role administrative back-office.",
    technology: ["PHP 8.2", "MariaDB", "JavaScript", "BaridiMob & CCP", "Moteur QR Code", "Multi-langues (5)"],
    outcome:
      "Live production system replacing manual booking with an automated, audited sales pipeline and streamlined B2B partner distribution.",
    accent: { a: "#0d828a", b: "#f58220" },
    span: "md:col-span-5",
    badge: "Client Production",
    isProduction: true,
  },
  {
    id: "tcs-informatique",
    title: "TCS Informatique",
    category: "Enterprise B2B · Security & Low Current Systems",
    short: "Institutional digital overhaul, 26-table technical catalog, and structured B2B quote engine.",
    summary:
      "Enterprise web platform and technical catalog for Tiger Computer Services (TCS), accredited low/high-current integrator (Type I Video Surveillance License) in Algiers since 1995.",
    problem:
      "An outdated, vulnerable WordPress site with no structured product inventory and generic contact forms that overwhelmed sales reps with unqualified requests.",
    solution:
      "A hardened Laravel 12 architecture featuring a 26-table relational technical catalog, a pricetag-free reference basket for scoped commercial quotes, and an immutable audit trail.",
    approach:
      "Security-first design: zero online payments, mandatory 2FA on the back-office, strict rate limits, and full WCAG 2.2 AA accessibility standards.",
    design:
      "Warm paper editorial design, Newsreader serif typography with subtle brand red accents, and custom Apple-style 1:1 spring animations with zero external dependencies.",
    product:
      "Specification-driven equipment catalog, structured quote request form pre-categorized by trade, secured career portal for CV uploads, and audit logging.",
    technology: ["Laravel 12", "PHP 8.2+", "MariaDB", "Blade", "Vite", "Pest", "2FA & Audit Logs"],
    outcome:
      "High-credibility digital presence meeting banking and government contractor standards, eliminating spam and securing institutional client data.",
    accent: { a: "#d4161c", b: "#56565a" },
    span: "md:col-span-4",
    badge: "Client Production",
    isProduction: true,
  },
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
    accent: { a: "#2b6cb5", b: "#5fa3e0" },
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
    accent: { a: "#4a8fd8", b: "#2b6cb5" },
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
    accent: { a: "#2b6cb5", b: "#5fa3e0" },
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
    accent: { a: "#142a4a", b: "#2b6cb5" },
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
    accent: { a: "#142a4a", b: "#4a8fd8" },
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
    accent: { a: "#4a8fd8", b: "#2b6cb5" },
    span: "md:col-span-7",
  },
];

/** Resolves a project by its route slug (the id doubles as the slug). */
export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.id === slug);
}

/** Previous/next project for "keep browsing" navigation on the case study. */
export function getAdjacentProjects(slug: string) {
  const idx = PROJECTS.findIndex((p) => p.id === slug);
  const prev = idx > 0 ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;
  return { prev, next };
}
