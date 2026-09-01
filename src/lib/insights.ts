/**
 * Qodily Insights — articles covering technology, software, business,
 * design, marketing and digital transformation.
 *
 * Every article is authored by Qodily. No fabricated statistics, sources
 * or third-party authorship are attributed. Summaries and body content
 * reflect the team's perspective and experience.
 */

export type ArticleCategory =
  | "Technology"
  | "Software"
  | "Business"
  | "Design"
  | "Marketing"
  | "Digital Transformation";

export const CATEGORIES: ArticleCategory[] = [
  "Technology",
  "Software",
  "Business",
  "Design",
  "Marketing",
  "Digital Transformation",
];

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  /** One-line description shown in cards and used as meta description. */
  summary: string;
  /** ISO 8601 date string. */
  date: string;
  /** Estimated reading time, e.g. "5 min read". */
  readTime: string;
  /** Body paragraphs — each string is a <p>. No lorem ipsum. */
  body: string[];
  /** SEO keywords for the article. */
  keywords: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "does-your-business-need-a-website-or-a-web-app",
    title: "Does Your Business Need a Website or a Web App?",
    category: "Technology",
    summary:
      "A static site and a web application solve different problems. Choosing the right one depends on what your users need to do, not what looks impressive.",
    date: "2026-08-18",
    readTime: "6 min read",
    body: [
      "Many businesses start with the assumption that they need a web application when a well-structured website would serve them better. The distinction matters: a website presents information, while a web application processes user input, manages data and delivers interactive workflows.",
      "A restaurant that needs an online menu, hours and a contact form is well served by a brochure website. A restaurant that needs online ordering, table reservations and a kitchen management dashboard needs a web application. The first costs less, launches faster and is simpler to maintain. The second requires more engineering, hosting infrastructure and ongoing development.",
      "The wrong choice creates friction. A business that builds a full web application when a five-page website would suffice spends months longer in development and pays more for hosting and maintenance. A business that tries to bolt complex functionality onto a static site ends up with slow load times, security concerns and a poor user experience.",
      "We recommend starting with the simplest version that solves the core problem. If customers need to find information — hours, services, pricing — a website is enough. If they need to log in, fill forms that route to internal systems, manage accounts, or interact with data in real time, a web application is the right direction.",
      "The good news is that both paths lead to the same technology stack in most cases. A website built with a modern framework can grow into a web application when the business is ready, without starting from scratch. The key is making the choice based on what your users actually need, not on what the latest trend suggests.",
    ],
    keywords: [
      "website vs web application",
      "business website",
      "web app development",
      "when to build a web app",
      "digital solutions",
    ],
  },
  {
    slug: "how-custom-software-can-save-your-business-time",
    title: "How Custom Software Can Save Your Business Time",
    category: "Software",
    summary:
      "Off-the-shelf tools force teams to adapt their workflow to the software. Custom software adapts to the workflow — and that difference compounds over time.",
    date: "2026-08-11",
    readTime: "7 min read",
    body: [
      "Every business develops its own way of working. The flow of information from a customer inquiry to a delivered product involves steps that are specific to your team, your market and your operations. Off-the-shelf software handles the generic version of that flow. Custom software handles yours.",
      "The time savings come from removing friction in the daily routine. When a sales team uses a spreadsheet to track leads, someone spends time each week cleaning data, merging duplicates and reconciling what is in the sheet with what is in the inbox. A custom CRM that captures leads from the same channels and routes them to the right person eliminates that manual work.",
      "Custom software also removes the cost of context switching. When a team jumps between four different tools to complete one task — a project manager, a spreadsheet, an email thread and a messaging app — every switch carries a cognitive cost. A purpose-built system keeps related actions in one place.",
      "The investment in custom software pays back in time saved, not just money saved. A team that spends thirty minutes a day on manual data entry is losing two and a half hours a week per person. Across a team of ten, that is twenty-five hours a week — more than three full work days — spent on work that a well-designed system handles automatically.",
      "The strongest argument for custom software is that it evolves with the business. As processes change, the tool changes with them. Off-the-shelf software gets a new feature every quarter. Custom software gets the feature your team needs, when they need it.",
    ],
    keywords: [
      "custom software development",
      "business automation",
      "save time with software",
      "off-the-shelf vs custom",
      "workflow optimization",
    ],
  },
  {
    slug: "5-digital-mistakes-small-businesses-make",
    title: "5 Digital Mistakes Small Businesses Make",
    category: "Business",
    summary:
      "Most small businesses don't fail at digital because of bad ideas. They fail because of five predictable mistakes that are easy to fix once you see them.",
    date: "2026-08-04",
    readTime: "5 min read",
    body: [
      "The first mistake is building a digital presence without a clear purpose. A business launches a website, opens accounts on three social platforms and starts posting content without defining what success looks like. Without a goal, there is no way to measure whether the work is paying off.",
      "The second mistake is trying to be everywhere at once. A small business with a team of three does not need to be active on Instagram, LinkedIn, Facebook, TikTok, YouTube and X simultaneously. Spreading effort across too many channels produces mediocre content everywhere instead of strong content on the platforms where the actual customers spend time.",
      "The third mistake is neglecting the basics. Slow websites, broken contact forms, missing Google Business profiles and inconsistent information across directories quietly erode trust. A potential customer who finds an outdated phone number or a page that takes six seconds to load does not report the problem — they move on.",
      "The fourth mistake is treating digital as a one-time project. A website launched two years ago and never updated is a website that is falling behind. Search engines reward fresh content. Customers expect current information. Security patches keep the site safe. Digital presence requires the same ongoing attention as any other part of the business.",
      "The fifth mistake is making decisions based on vanity metrics. Follower counts, page views and impressions look impressive in a report but do not tell you whether the business is growing. The metrics that matter are the ones tied to action: form submissions, phone calls, booked appointments and completed purchases.",
    ],
    keywords: [
      "small business digital mistakes",
      "digital marketing errors",
      "small business online presence",
      "digital strategy",
      "common business mistakes",
    ],
  },
  {
    slug: "how-to-turn-an-idea-into-an-mvp",
    title: "How to Turn an Idea Into an MVP",
    category: "Software",
    summary:
      "An MVP is not a smaller version of the final product. It is the smallest version that answers the most important question: will anyone actually use this?",
    date: "2026-07-28",
    readTime: "6 min read",
    body: [
      "Every product starts with an idea. The gap between the idea and the first user is where most projects stall. The Minimum Viable Product exists to close that gap as quickly and cheaply as possible, by testing the core assumption before investing in the full vision.",
      "The first step is identifying the one thing the product must do. Not five things. Not three. One. If you are building a booking system, the one thing might be: can a customer select a time slot and confirm a reservation? Everything beyond that — reminders, analytics, team dashboards — is secondary until the core action works and people want to do it.",
      "The second step is defining what done means. An MVP is done when it can answer the question you set out to test. If the question is whether people will book online, the MVP is a working booking flow — not a full business management platform. Drawing this line clearly is what separates a focused MVP from a project that expands endlessly.",
      "The third step is building the simplest version that works. This does not mean ugly or broken. It means every screen and every feature directly serves the core action. No settings page for preferences that do not exist yet. No onboarding flow for a product with one function. Every element should earn its place by contributing to the test.",
      "The final step is putting it in front of real users and listening. An MVP that lives on a staging server teaches nothing. An MVP that ten people use and give feedback on teaches what the next version should become. The goal is not to launch a finished product. The goal is to learn what the finished product should be.",
    ],
    keywords: [
      "minimum viable product",
      "MVP development",
      "startup product development",
      "how to build an MVP",
      "product idea validation",
    ],
  },
  {
    slug: "why-ux-matters-for-business",
    title: "Why UX Matters for Business",
    category: "Design",
    summary:
      "User experience is not about making things look good. It is about making things work well enough that customers complete the action you designed the product for.",
    date: "2026-07-21",
    readTime: "5 min read",
    body: [
      "When a customer abandons a checkout page, the cause is rarely the price. It is usually confusion: too many fields, unclear instructions, a button that does not look clickable, or a step that does not seem necessary. Each of these is a user experience problem, and each one costs the business revenue.",
      "User experience is the sum of every interaction a person has with a product — from the moment they arrive to the moment they leave. It includes how quickly the page loads, whether the navigation makes sense, whether error messages help or frustrate, and whether the overall flow respects the user's time.",
      "The business impact is direct. A checkout flow that removes one unnecessary step can measurably increase the number of completed purchases. A form that validates input in real time reduces support requests. A clear information architecture reduces the time it takes a customer to find what they need, which increases the likelihood they will complete the action.",
      "Good UX also reduces cost. Products that are designed with clear user flows require fewer support tickets. Internal tools with intuitive interfaces need less training. Systems built around how people actually work — not how engineers assume they work — produce fewer errors and less rework.",
      "The misconception is that UX is a luxury reserved for large companies with dedicated design teams. In reality, UX thinking is a discipline that applies at every scale. A five-page website benefits from the same principle: make it obvious, make it fast, make it work the way the user expects.",
    ],
    keywords: [
      "user experience design",
      "UX for business",
      "UX importance",
      "user experience ROI",
      "design for conversions",
    ],
  },
  {
    slug: "how-social-media-can-generate-real-leads",
    title: "How Social Media Can Generate Real Leads",
    category: "Marketing",
    summary:
      "Social media generates leads when it is used as a channel for useful content and direct engagement — not as a broadcast tool for announcements.",
    date: "2026-07-14",
    readTime: "6 min read",
    body: [
      "Most businesses post on social media and wait. The post goes out, the likes come in and nothing changes. The problem is not the platform. The problem is that posting without a lead generation strategy is the digital equivalent of handing out flyers on a busy street and hoping someone calls.",
      "Social media generates leads when the content answers a question the target audience is already asking. A business that posts a clear explanation of a common problem — with a direct path to a solution — gives the reader a reason to engage. A business that posts a generic company update gives them nothing.",
      "The second mechanism is direct engagement. replying to comments, joining relevant conversations, answering questions in groups and sharing genuinely useful insights creates visibility that paid advertising cannot replicate. This takes time, but the trust it builds translates directly into inquiries.",
      "The third mechanism is a clear next step. Every post should lead somewhere: a page on the website, a contact form, a phone number, a booking link. When the path from social media to the business is obvious and short, the conversion rate increases. When the path is vague — visit our website and figure it out — most people do not take it.",
      "The reality is that social media is a long game. The businesses that generate consistent leads from social platforms are the ones that show up regularly, publish content that teaches something, engage with their audience directly and make it easy to take the next step. There is no shortcut, but there is a clear formula.",
    ],
    keywords: [
      "social media lead generation",
      "social media marketing",
      "business social media strategy",
      "generating leads online",
      "social media for business",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(
  category: ArticleCategory,
): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

export function getAllSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

export const INSIGHTS_LABEL = "Insights";
export const INSIGHTS_NOTE =
  "Perspectives from the Qodily team on technology, software, business, design, marketing and digital transformation.";
