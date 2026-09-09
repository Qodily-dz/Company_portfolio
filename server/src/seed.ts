import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("Seeding Qodily database...\n");

  // ── 1. Admin user ──────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);
  const { error: adminError } = await supabase.from("admin_users").upsert({
    id: "admin-001",
    name: "Wail K.",
    email: "admin@qodily.dz",
    password_hash: passwordHash,
    role: "ADMIN",
  }, { onConflict: "email" });
  if (adminError) {
    console.error("❌ Supabase error seeding admin user:", adminError);
    process.exit(1);
  }
  console.log("✓ Admin user (admin@qodily.dz / admin123)");

  // ── 2. Site config ─────────────────────────────────
  await supabase.from("site_config").upsert({
    id: 1,
    name: "Qodily",
    legal_name: "Qodily-dz",
    tagline: "From idea to impact.",
    positioning: "Build. Design. Grow.",
    description: "Qodily-dz is a digital solutions partner based in Algiers, Algeria, transforming ideas and business problems into practical digital products through software engineering, design, and digital growth.",
    url: "https://qodily.dz",
    email: "hello@qodily.dz",
    phone: "+213 555 000 000",
    whatsapp: "https://wa.me/213555000000",
    address_city: "Algiers",
    address_country: "Algeria",
    default_language: "en",
    social: {
      github: "https://github.com/qodily",
      linkedin: "https://www.linkedin.com/company/qodily",
      twitter: "https://x.com/qodily",
      instagram: "https://www.instagram.com/qodily",
      dribbble: "https://dribbble.com/qodily",
      behance: "https://www.behance.net/qodily",
    },
    seo_keywords: ["Qodily", "Qodily-dz", "digital solutions agency", "web development", "mobile applications", "UI/UX design", "product design", "digital marketing", "SEO", "software engineering", "Algeria", "Algiers"],
  }, { onConflict: "id" });
  console.log("✓ Site config");

  // ── 3. Pillars ─────────────────────────────────────
  const pillars = [
    { id: "build", index: "01", order: 1 },
    { id: "design", index: "02", order: 2 },
    { id: "grow", index: "03", order: 3 },
  ];
  await supabase.from("pillars").upsert(pillars, { onConflict: "id" });

  const pillarTranslations = [
    { pillar_id: "build", locale: "en", label: "Build", tagline: "Software Architecture", lede: "We engineer the backbone — websites, web & mobile apps, custom software and APIs built to scale, stay fast, and hold together under real use." },
    { pillar_id: "build", locale: "fr", label: "Construire", tagline: "Architecture Logicielle", lede: "Nous concevons l'infrastructure — sites web, applications mobile et sur web, logiciels sur mesure et API conçus pour évoluer, rester rapides et tenir bon face à l'usage réel." },
    { pillar_id: "build", locale: "ar", label: "بناء", tagline: "هندسة البرمجيات", lede: "نبني الهيكل الأساسي — مواقع ويب وتطبيقات جوال وبرمجيات مخصصة وواجهات برمجية مصممة للتوسع والسرعة والمتانة." },
    { pillar_id: "design", locale: "en", label: "Design", tagline: "Digital Composition", lede: "We shape how your product reads and feels — interfaces, identities and design systems rendered as a precise, living composition." },
    { pillar_id: "design", locale: "fr", label: "Design", tagline: "Composition Numérique", lede: "Nous façonnons la lecture et le ressenti de votre produit — interfaces, identités et systèmes de design rendus comme une composition précise et vivante." },
    { pillar_id: "design", locale: "ar", label: "تصميم", tagline: "التصميم الرقمي", lede: "نصمم الطريقة التي يُقرأ بها منتجك ويُشعر بها — واجهات وهويات وأنظمة تصميم مقدمة كتكوين دقيق وحي." },
    { pillar_id: "grow", locale: "en", label: "Grow", tagline: "Data Flow", lede: "We turn attention into outcomes — campaigns, content and analytics that move people from first touch to lasting growth." },
    { pillar_id: "grow", locale: "fr", label: "Croître", tagline: "Flux de Données", lede: "Nous transformons l'attention en résultats — campagnes, contenu et analytiques qui font passer les gens du premier contact à une croissance durable." },
    { pillar_id: "grow", locale: "ar", label: "نمو", tagline: "تدفق البيانات", lede: " نحوّل الانتباه إلى نتائج — حملات ومحتوى وتحليلات تنقل الناس من أول تواصل إلى نمو مستدام." },
  ];
  await supabase.from("pillar_translations").delete().in("pillar_id", ["build", "design", "grow"]);
  await supabase.from("pillar_translations").insert(pillarTranslations);
  console.log("✓ Pillars + translations");

  // ── 4. Services ────────────────────────────────────
  const serviceData: Record<string, { name: string; order: number }[]> = {
    build: [
      { name: "Websites", order: 1 }, { name: "Web Apps", order: 2 }, { name: "Mobile Apps", order: 3 },
      { name: "Desktop Apps", order: 4 }, { name: "Custom Software", order: 5 }, { name: "SaaS", order: 6 },
      { name: "Automation", order: 7 }, { name: "APIs", order: 8 },
    ],
    design: [
      { name: "UI/UX", order: 1 }, { name: "Product Design", order: 2 }, { name: "Web Design", order: 3 },
      { name: "Mobile Design", order: 4 }, { name: "Branding", order: 5 }, { name: "Design Systems", order: 6 },
    ],
    grow: [
      { name: "Digital Marketing", order: 1 }, { name: "Social Media", order: 2 }, { name: "Meta Ads", order: 3 },
      { name: "SEO", order: 4 }, { name: "Content", order: 5 }, { name: "Lead Generation", order: 6 },
      { name: "Analytics", order: 7 },
    ],
  };

  await supabase.from("services").delete().in("pillar_id", ["build", "design", "grow"]);
  for (const [pillarId, services] of Object.entries(serviceData)) {
    for (const svc of services) {
      const { data } = await supabase
        .from("services")
        .insert({ pillar_id: pillarId, name: svc.name, order: svc.order })
        .select()
        .single();

      if (data) {
        await supabase.from("service_translations").insert([
          { service_id: data.id, locale: "en", name: svc.name },
          { service_id: data.id, locale: "fr", name: svc.name },
          { service_id: data.id, locale: "ar", name: svc.name },
        ]);
      }
    }
  }
  console.log("✓ Services (21) + translations");

  // ── 5. Projects ────────────────────────────────────
  const projects = [
    {
      slug: "restaurant-management", category: "Operations · Software",
      short: "One system to run tables, kitchen and orders from a single screen.",
      summary: "Connecting floor, kitchen and back office so a busy service runs without paper, phone tag or misplaced orders.",
      problem: "A restaurant relied on paper notes, phone calls and separate tablets. Orders got lost between floor and kitchen, stock was a spreadsheet, and there was no single view of the day's business.",
      solution: "A unified platform where front-of-house, kitchen and back office work from one live source of truth — orders, tables, stock and reports in a single flow.",
      approach: "Start with the worst pain: the order path from guest to kitchen. Design that path first, then layer stock and reporting around it so every part reads from the same data.",
      architecture: "A real-time architecture built around an orders hub: the kitchen and floor render from the same WebSocket-fed state, stock events are event-sourced into PostgreSQL, and reports read from a read-optimised projection so the live view and the end-of-day numbers never disagree.",
      design: "A calm, high-in-contrast interface built for speed — big touch targets for the kitchen screen, clear status colours for open/completed orders, and a floor view that shows tables as the team actually sees them.",
      product: "Table and floor management, order entry with modifiers, a kitchen queue, stock tracking and end-of-day reports — one login, one system.",
      outcome: "Concept: the design removes the shared friction of a busy service by replacing paper and phone with one ordered workflow. To be validated with a live venue before build.",
      accent_a: "#2b6cb5", accent_b: "#5fa3e0", span: "md:col-span-7",
      client: "Qodily Lab", status: "PUBLISHED", featured: true, order: 1,
      technologies: ["Next.js", "Node.js", "PostgreSQL", "WebSockets"],
    },
    {
      slug: "e-commerce", category: "Commerce · Product",
      short: "Catalog, cart, checkout and orders in one continuous buying flow.",
      summary: "Moving sales from spreadsheets and social DMs into a store with a clear, trustworthy checkout.",
      problem: "Products were listed in a spreadsheet and orders arrived by WhatsApp and email. Stock and shipping were tracked by hand, and the customer had no real storefront.",
      solution: "An online store where customers browse, buy and track, and the team manages catalog, stock and orders from one place.",
      approach: "Protect the checkout — the highest-leverage moment. Build a distraction-free path to purchase first, then layer discovery, product pages and the order inbox around it.",
      architecture: "A headless commerce build: the catalog and cart live in PostgreSQL, checkout is hosted on Stripe, and webhooks reconcile stock and orders so the storefront and the order inbox stay consistent without polling.",
      design: "Editorial product pages that let images and price breathe, a fast one-screen checkout, and clear order status so customers always know where their purchase is.",
      product: "Product catalog with search and filtering, cart and checkout, payment wiring, and an order management inbox for the team.",
      outcome: "Concept: the flow turns a manual, chat-based sales process into a self-serve store, freeing the team to focus on products rather than re-keying orders.",
      accent_a: "#4a8fd8", accent_b: "#2b6cb5", span: "md:col-span-5",
      client: "Qodily Lab", status: "PUBLISHED", featured: true, order: 2,
      technologies: ["Next.js", "Stripe", "PostgreSQL", "TypeScript"],
    },
    {
      slug: "business-crm", category: "Sales · Software",
      short: "Leads, deals and follow-ups tracked so nothing slips between inboxes.",
      summary: "Replacing notebooks and scattered inboxes with a view of every relationship and next action.",
      problem: "Contacts and follow-ups lived in inboxes, notebooks and memory. Deals stalled because there was no reliable place to see what was next.",
      solution: "A lightweight CRM where a team records leads, tracks deals through stages and never loses the next step.",
      approach: "Keep the data-entry bar low or salespeople won't use it. Design for quick capture and automatic next-actions rather than heavy pipeline administration.",
      architecture: "A thin server on Supabase with PostgREST access: rows are typed output of the Postgres schema, so the frontend reads and writes the same relational model and follow-up tasks are derived, not duplicated.",
      design: "Clean list and kanban views with minimal clutter, a persistent 'next action' cue on every contact, and fast inline editing so the tool stays out of the way.",
      product: "Contacts, pipelines with stages, task and follow-up tracking, notes, and simple filters per owner and stage.",
      outcome: "Concept: focuses a sales team on follow-up consistency — a reliably recorded next step for every relationship — rather than reporting busywork.",
      accent_a: "#2b6cb5", accent_b: "#5fa3e0", span: "md:col-span-4",
      client: "Qodily Lab", status: "PUBLISHED", featured: true, order: 3,
      technologies: ["Next.js", "Supabase", "Tailwind", "OpenAI API"],
    },
    {
      slug: "medical-appointments", category: "Health · Scheduling",
      short: "Online booking with reminders so less time is spent on the phone.",
      summary: "Moving a clinic's diary from phone calls and paper to self-service bookings with reliable reminders.",
      problem: "Appointments were managed by phone and paper diaries. No-shows were common, staff spent hours confirming visits, and patients had no way to book outside opening hours.",
      solution: "An online booking system where patients choose a time, get reminders, and staff see and manage the calendar in real time.",
      approach: "Design for the person least comfortable with technology on the patient side, and for speed on the staff side. Smoothness of booking and clarity of reminders come first.",
      architecture: "Slots are generated from staff availability rules, booked rows are part of the same Postgres transaction as the reminder job queue, and reminders are sent through a scheduled worker keyed off the appointment time.",
      design: "A friendly step-by-step booking flow, a clear monthly/weekly calendar for staff, and reminder handling built into the schedule rather than bolted on.",
      product: "Public booking, time-slot management, automated reminders, and a shared staff calendar with protected time slots.",
      outcome: "Concept: aims to reduce no-shows and phone time by shifting booking and reminders to self-service — to be measured with a pilot clinic.",
      accent_a: "#142a4a", accent_b: "#2b6cb5", span: "md:col-span-4",
      client: "Qodily Lab", status: "IN_PROGRESS", featured: false, order: 4,
      technologies: ["Next.js", "PostgreSQL", "Node.js"],
    },
    {
      slug: "school-management", category: "Education · Software",
      short: "Grades, attendance and parent updates in one school-wide system.",
      summary: "Bringing scattered grade books, attendance lists and parent messages into a single, understandable platform.",
      problem: "Grades were kept in separate books, attendance on paper, and parents were updated by occasional notes. Staff had no shared, reliable record.",
      solution: "A school platform where teachers record, students and staff see results, and parents receive clear updates — all from one source.",
      approach: "Solve for teachers first — the tool must save them time or they won't use it. Grade capture and attendance should be fast, with parent visibility as a clean layer on top.",
      architecture: "Role-based accounts on a single Postgres model: one student record, one grade book, and views that project the same data for staff, students and parents so nobody reads from a separate copy.",
      design: "A calm grade book with fast entry, dashboards for staff and parents, and role-based views so each person sees only what matters to them.",
      product: "Role-based accounts, grade book, attendance, timetables and parent-facing updates in a single system.",
      outcome: "Concept: replaces duplicated paper records with one structured source of truth for a school — to be piloted with staff feedback.",
      accent_a: "#142a4a", accent_b: "#4a8fd8", span: "md:col-span-4",
      client: "Qodily Lab", status: "DRAFT", featured: false, order: 5,
      technologies: ["Next.js", "PostgreSQL", "React"],
    },
    {
      slug: "saas-dashboard", category: "Product · Design",
      short: "Raw data turned into the few metrics a team can actually act on.",
      summary: "Designing a focused analytics surface so decisions come from clarity, not buried spreadsheets.",
      problem: "Teams had data — too much of it, in raw exports. There was no clear, trusted place to see how the product was doing and what to do next.",
      solution: "A dashboard that surfaces the few numbers that matter, with context and next actions instead of a wall of charts.",
      approach: "Reduce, don't collect. Interview the team to find the handful of decisions made weekly, then build the dashboard around those decisions rather than every available metric.",
      architecture: "A query layer in front of the product database: metrics are computed in SQL, cached as materialised daily snapshots, and served to the frontend through one typed endpoint so every card shares the same source of truth.",
      design: "A calm visual hierarchy — a small set of primary KPIs, trend context, and drill-downs — so the first glance answers 'are we okay?' without a manual.",
      product: "Curated KPI overview, trend and segment views, and lightweight annotations so every number has context.",
      outcome: "Concept: reframes reporting from more data to usable clarity — the usefulness to be confirmed with the team in early sessions.",
      accent_a: "#4a8fd8", accent_b: "#2b6cb5", span: "md:col-span-7",
      client: "Qodily Lab", status: "DRAFT", featured: false, order: 6,
      technologies: ["Next.js", "D3", "TypeScript"],
    },
  ];

  for (const p of projects) {
    const { technologies, ...projectFields } = p;
    const { data: proj } = await supabase
      .from("projects")
      .upsert({ ...projectFields, gallery: [] }, { onConflict: "slug" })
      .select()
      .single();

    if (proj) {
      await supabase.from("project_technologies").delete().eq("project_id", proj.id);
      await supabase.from("project_technologies").insert(
        technologies.map((technology) => ({ project_id: proj.id, technology }))
      );

      await supabase.from("project_translations").delete().eq("project_id", proj.id);
      await supabase.from("project_translations").insert([
        { project_id: proj.id, locale: "en", title: projectFields.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "), category: projectFields.category, short: projectFields.short, summary: projectFields.summary, problem: projectFields.problem, solution: projectFields.solution, approach: projectFields.approach, architecture: projectFields.architecture, design: projectFields.design, product: projectFields.product, outcome: projectFields.outcome },
        { project_id: proj.id, locale: "fr", title: projectFields.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "), category: projectFields.category, short: projectFields.short, summary: projectFields.summary, problem: projectFields.problem, solution: projectFields.solution, approach: projectFields.approach, architecture: projectFields.architecture, design: projectFields.design, product: projectFields.product, outcome: projectFields.outcome },
        { project_id: proj.id, locale: "ar", title: projectFields.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "), category: projectFields.category, short: projectFields.short, summary: projectFields.summary, problem: projectFields.problem, solution: projectFields.solution, approach: projectFields.approach, architecture: projectFields.architecture, design: projectFields.design, product: projectFields.product, outcome: projectFields.outcome },
      ]);
    }
  }
  console.log("✓ Projects (6) + translations + technologies");

  // ── 6. Articles ────────────────────────────────────
  const articles = [
    { slug: "does-your-business-need-a-website-or-a-web-app", category: "TECHNOLOGY" as const, read_time: "6 min read", date: "2026-08-18", title: "Does Your Business Need a Website or a Web App?", summary: "A static site and a web application solve different problems. Choosing the right one depends on what your users need to do, not what looks impressive.", body: ["Many businesses start with the assumption that they need a web application when a well-structured website would serve them better.", "A restaurant that needs an online menu is well served by a brochure website. A restaurant that needs online ordering needs a web application."], keywords: ["website vs web application", "business website", "web app development"] },
    { slug: "how-custom-software-can-save-your-business-time", category: "SOFTWARE" as const, read_time: "7 min read", date: "2026-08-11", title: "How Custom Software Can Save Your Business Time", summary: "Off-the-shelf tools force teams to adapt their workflow to the software. Custom software adapts to the workflow.", body: ["Every business develops its own way of working.", "Custom software removes the cost of context switching."], keywords: ["custom software development", "business automation"] },
    { slug: "5-digital-mistakes-small-businesses-make", category: "BUSINESS" as const, read_time: "5 min read", date: "2026-08-04", title: "5 Digital Mistakes Small Businesses Make", summary: "Most small businesses don't fail at digital because of bad ideas. They fail because of five predictable mistakes.", body: ["The first mistake is building a digital presence without a clear purpose."], keywords: ["small business digital mistakes"] },
    { slug: "how-to-turn-an-idea-into-an-mvp", category: "SOFTWARE" as const, read_time: "6 min read", date: "2026-07-28", title: "How to Turn an Idea Into an MVP", summary: "An MVP is not a smaller version of the final product. It is the smallest version that answers the most important question.", body: ["Every product starts with an idea."], keywords: ["minimum viable product", "MVP development"] },
    { slug: "why-ux-matters-for-business", category: "DESIGN" as const, read_time: "5 min read", date: "2026-07-21", title: "Why UX Matters for Business", summary: "User experience is not about making things look good. It is about making things work well enough.", body: ["When a customer abandons a checkout page, the cause is rarely the price."], keywords: ["user experience design", "UX for business"] },
    { slug: "how-social-media-can-generate-real-leads", category: "MARKETING" as const, read_time: "6 min read", date: "2026-07-14", title: "How Social Media Can Generate Real Leads", summary: "Social media generates leads when it is used as a channel for useful content and direct engagement.", body: ["Most businesses post on social media and wait."], keywords: ["social media lead generation"] },
  ];

  for (const a of articles) {
    const { data: art } = await supabase
      .from("articles")
      .upsert({ slug: a.slug, category: a.category, read_time: a.read_time, date: a.date, status: "PUBLISHED" }, { onConflict: "slug" })
      .select()
      .single();

    if (art) {
      await supabase.from("article_translations").delete().eq("article_id", art.id);
      await supabase.from("article_translations").insert([
        { article_id: art.id, locale: "en", title: a.title, summary: a.summary, body: a.body, keywords: a.keywords },
        { article_id: art.id, locale: "fr", title: a.title, summary: a.summary, body: a.body, keywords: a.keywords },
        { article_id: art.id, locale: "ar", title: a.title, summary: a.summary, body: a.body, keywords: a.keywords },
      ]);
    }
  }
  console.log("✓ Articles (6) + translations");

  // ── 7. Navigation items ────────────────────────────
  await supabase.from("navigation_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("navigation_items").insert([
    { label: "Work", href: "/work", location: "header", visible: true, order: 1 },
    { label: "Services", href: "/services", location: "header", visible: true, order: 2 },
    { label: "Process", href: "/process", location: "header", visible: true, order: 3 },
    { label: "About", href: "/about", location: "header", visible: true, order: 4 },
    { label: "Insights", href: "/insights", location: "header", visible: true, order: 5 },
    { label: "Contact", href: "/contact", location: "header", visible: true, order: 6 },
    { label: "Start a project", href: "/contact", location: "footer", visible: true, order: 7 },
  ]);
  console.log("✓ Navigation items (7)");

  // ── 8. SEO settings ────────────────────────────────
  const seoPages = [
    { page_path: "/", meta_title: "Qodily — From idea to impact", meta_description: "Qodily-dz builds digital products, websites and growth systems from idea to impact." },
    { page_path: "/work", meta_title: "Work — Qodily", meta_description: "Selected projects and case studies from Qodily." },
    { page_path: "/services", meta_title: "Services — Qodily", meta_description: "Build, Design and Grow — software, design and digital growth services." },
    { page_path: "/about", meta_title: "About — Qodily", meta_description: "The story, vision and team behind Qodily-dz." },
    { page_path: "/insights", meta_title: "Insights — Qodily", meta_description: "Perspectives on technology, software, business and design." },
    { page_path: "/contact", meta_title: "Contact — Qodily", meta_description: "Start a project with Qodily-dz." },
    { page_path: "/process", meta_title: "Process — Qodily", meta_description: "Our six-stage process from discovery to growth." },
  ];
  for (const page of seoPages) {
    for (const locale of ["en", "fr", "ar"]) {
      await supabase.from("seo_settings").upsert({ ...page, locale }, { onConflict: "page_path,locale" });
    }
  }
  console.log("✓ SEO settings (7 pages × 3 locales)");

  // ── 9. Engineering nodes ───────────────────────────
  const engNodes = [
    { id: "frontend", glyph: "UI", pos_x: 3.1, pos_y: 0.2, pos_z: 0.4, order: 1 },
    { id: "backend", glyph: "BE", pos_x: -2.6, pos_y: 1.4, pos_z: 1.5, order: 2 },
    { id: "api", glyph: "AP", pos_x: 1.2, pos_y: 2.4, pos_z: -1.4, order: 3 },
    { id: "database", glyph: "DB", pos_x: -3.3, pos_y: -0.8, pos_z: 0.3, order: 4 },
    { id: "cloud", glyph: "CL", pos_x: 2.1, pos_y: -1.9, pos_z: 1.3, order: 5 },
    { id: "mobile", glyph: "MO", pos_x: -1.3, pos_y: -2.5, pos_z: -1.2, order: 6 },
    { id: "analytics", glyph: "AN", pos_x: 2.9, pos_y: -0.6, pos_z: -1.6, order: 7 },
    { id: "ai", glyph: "AI", pos_x: -1.6, pos_y: 2.5, pos_z: -1.8, order: 8 },
    { id: "automation", glyph: "AU", pos_x: 0.1, pos_y: -1.2, pos_z: 3.0, order: 9 },
  ];
  await supabase.from("engineering_nodes").upsert(engNodes, { onConflict: "id" });

  const engTranslations = [
    { node_id: "frontend", locale: "en", label: "Frontend", description: "Interfaces people actually use — fast, accessible and consistent across every device.", details: ["Component architecture & design systems", "Performance budgets & accessibility", "Responsive, cross-device consistency"] },
    { node_id: "backend", locale: "en", label: "Backend", description: "The logic that runs behind the scenes — rules, processes and reliability.", details: ["Service & concurrency design", "Transactions & error handling", "Observability & resilience"] },
    { node_id: "api", locale: "en", label: "API", description: "The connections between systems — data moving where it should, securely.", details: ["Typed contracts & versioning", "Auth, rate limiting & documentation", "Secure, consistent data exchange"] },
    { node_id: "database", locale: "en", label: "Database", description: "Where data is stored, structured and retrieved — without loss.", details: ["Schema & index design", "Migrations, backups, integrity", "Query performance at scale"] },
    { node_id: "cloud", locale: "en", label: "Cloud", description: "Infrastructure that scales — deploy, run and stop worrying about uptime.", details: ["Provisioning & scaling", "CI/CD & monitoring", "Cost control & security"] },
    { node_id: "mobile", locale: "en", label: "Mobile", description: "Native-quality experiences in your customers' pockets.", details: ["Offline support & push", "Secure local storage", "Store release process"] },
    { node_id: "analytics", locale: "en", label: "Analytics", description: "Turning data into decisions — measure what actually matters.", details: ["Event & pipeline design", "Dashboards that inform action", "Privacy-first measurement"] },
    { node_id: "ai", locale: "en", label: "AI", description: "Automating the complex — from classification to assistants.", details: ["Prompt & retrieval pipelines", "Evaluation & guardrails", "Cost-aware inference"] },
    { node_id: "automation", locale: "en", label: "Automation", description: "Removing repetitive work so teams focus on judgement, not copy-paste.", details: ["Workflow orchestration", "Integrations done reliably", "Failure handling & idempotency"] },
  ];
  await supabase.from("engineering_node_translations").delete().in("node_id", engNodes.map((n) => n.id));
  await supabase.from("engineering_node_translations").insert(engTranslations);
  console.log("✓ Engineering nodes (9) + translations");

  // ── 10. Process stages ─────────────────────────────
  const stages = [
    { id: "discover", num: "01", order: 1, title: "Discover", desc: "We learn the problem before we touch a screen — the context, the constraints, and the people involved.", whatWeDo: ["Stakeholder interviews", "Problem framing", "User research", "Market context"], deliverables: ["Research summary", "Problem statement", "User personas"], technologies: [] },
    { id: "strategize", num: "02", order: 2, title: "Strategize", desc: "We define the path — what to build, in what order, and what success looks like.", whatWeDo: ["Roadmap planning", "Feature prioritization", "Technical architecture"], deliverables: ["Product roadmap", "Architecture spec", "Success metrics"], technologies: [] },
    { id: "design", num: "03", order: 3, title: "Design", desc: "We shape the experience — interfaces that are clear, fast and worth using.", whatWeDo: ["Wireframing", "UI design", "Prototyping", "Design system"], deliverables: ["Wireframes", "High-fidelity mockups", "Interactive prototype"], technologies: [] },
    { id: "build", num: "04", order: 4, title: "Build", desc: "We write the code — production-ready, tested and built to evolve.", whatWeDo: ["Frontend development", "Backend development", "API integration", "Testing"], deliverables: ["Working software", "Test coverage", "API documentation"], technologies: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"] },
    { id: "launch", num: "05", order: 5, title: "Launch", desc: "We ship it — carefully, with monitoring and a plan for what comes next.", whatWeDo: ["Deployment", "Performance optimization", "Monitoring setup"], deliverables: ["Production deployment", "Monitoring dashboard", "Runbook"], technologies: ["Vercel", "Supabase", "Plausible"] },
    { id: "grow", num: "06", order: 6, title: "Grow", desc: "We measure, iterate and expand — the product gets better as the business grows.", whatWeDo: ["Analytics review", "Feature iteration", "Growth campaigns"], deliverables: ["Growth report", "Iteration plan", "Campaign results"], technologies: [] },
  ];
  await supabase.from("process_stages").upsert(stages.map(({ title, desc, whatWeDo, deliverables, technologies, ...s }) => s), { onConflict: "id" });
  await supabase.from("process_stage_translations").delete().in("stage_id", stages.map((s) => s.id));
  for (const s of stages) {
    await supabase.from("process_stage_translations").insert([
      { stage_id: s.id, locale: "en", title: s.title, description: s.desc, what_we_do: s.whatWeDo, deliverables: s.deliverables, technologies: s.technologies },
      { stage_id: s.id, locale: "fr", title: s.title, description: s.desc, what_we_do: s.whatWeDo, deliverables: s.deliverables, technologies: s.technologies },
      { stage_id: s.id, locale: "ar", title: s.title, description: s.desc, what_we_do: s.whatWeDo, deliverables: s.deliverables, technologies: s.technologies },
    ]);
  }
  console.log("✓ Process stages (6) + translations");

  // ── 11. Service packs ──────────────────────────────
  type PackSeed = {
    name: string;
    price: number | null;
    priceLabel: string;
    currency: string;
    period: string;
    featured: boolean;
    order: number;
    translations: { en: { name: string; description: string; deliverables: string[] } };
  };

  const packs: PackSeed[] = [
    {
      name: "Landing Page",
      price: 1200,
      priceLabel: "",
      currency: "$",
      period: "one-off",
      featured: false,
      order: 1,
      translations: {
        en: {
          name: "Landing Page",
          description: "A single high-conversion page to launch a product, campaign or announcement.",
          deliverables: ["Strategy & copywriting", "Custom design in your brand", "Mobile-first, fast build", "Basic SEO & analytics", "Deploy + 30 days support"],
        },
      },
    },
    {
      name: "Business Website",
      price: 3500,
      priceLabel: "",
      currency: "$",
      period: "one-off",
      featured: true,
      order: 2,
      translations: {
        en: {
          name: "Business Website",
          description: "A complete multi-section website with a content system you can manage yourself.",
          deliverables: ["Up to 8 sections / 3 languages", "Editable content (CMS)", "Contact & lead forms", "SEO-ready structure", "Analytics setup", "1 month support"],
        },
      },
    },
    {
      name: "Web App MVP",
      price: 9000,
      priceLabel: "",
      currency: "$",
      period: "one-off",
      featured: true,
      order: 3,
      translations: {
        en: {
          name: "Web App MVP",
          description: "A working product — the smallest version that proves the core idea with real users.",
          deliverables: ["Product framing & roadmap", "UI/UX design", "Frontend + backend build", "Database & auth", "Admin panel", "Deploy + 1 month support"],
        },
      },
    },
    {
      name: "Mobile App MVP",
      price: 12000,
      priceLabel: "",
      currency: "$",
      period: "one-off",
      featured: false,
      order: 4,
      translations: {
        en: {
          name: "Mobile App MVP",
          description: "An iOS/Android product built once, designed for phones first.",
          deliverables: ["Product framing & roadmap", "Mobile UI/UX design", "Cross-platform build", "Backend + push notifications", "Store submission", "1 month support"],
        },
      },
    },
    {
      name: "Custom Software",
      price: null,
      priceLabel: "Custom",
      currency: "$",
      period: "project",
      featured: false,
      order: 5,
      translations: {
        en: {
          name: "Custom Software",
          description: "Tailored systems for your business — internal tools, automation, integrations and more.",
          deliverables: ["Discovery & architecture", "Design + development", "Integrations & automation", "Testing & deployment", "Training & documentation"],
        },
      },
    },
    {
      name: "Growth Retainer",
      price: 1500,
      priceLabel: "",
      currency: "$",
      period: "per month",
      featured: false,
      order: 6,
      translations: {
        en: {
          name: "Growth Retainer",
          description: "Ongoing marketing, content and analytics so growth keeps compounding after launch.",
          deliverables: ["Monthly strategy & reporting", "Content & campaigns", "SEO / ads management", "Analytics dashboard", "Priority response"],
        },
      },
    },
  ];

  await supabase.from("service_pack_translations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("service_packs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (const pack of packs) {
    const { translations, priceLabel, ...rest } = pack;
    const { data: created, error: packErr } = await supabase
      .from("service_packs")
      .insert({
        ...rest,
        price_label: priceLabel,
      })
      .select()
      .single();

    if (packErr) {
      console.error("Failed to insert service pack:", packErr);
      process.exit(1);
    }

    if (created) {
      const rows = ["en", "fr", "ar"].map((locale) => ({
        pack_id: created.id,
        locale,
        name: translations.en.name,
        description: translations.en.description,
        deliverables: translations.en.deliverables,
      }));
      const { error: transErr } = await supabase.from("service_pack_translations").insert(rows);
      if (transErr) {
        console.error("Failed to insert service pack translation:", transErr);
        process.exit(1);
      }
    }
  }
  console.log("✓ Service packs (6) + translations");

  console.log("\nSeeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
