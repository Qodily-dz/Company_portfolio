/**
 * Project request discovery.
 *
 * A multi-step lead form: what they're building → objective → needs →
 * budget range → timeline → contact details.
 *
 * The WhatsApp phone number is intentionally read from siteConfig so it
 * stays configurable in one place.
 */

export type BuildOption =
  | "Website"
  | "Web App"
  | "Mobile App"
  | "Desktop App"
  | "Custom Software"
  | "Marketing"
  | "Branding"
  | "Other";

export const BUILD_OPTIONS: BuildOption[] = [
  "Website",
  "Web App",
  "Mobile App",
  "Desktop App",
  "Custom Software",
  "Marketing",
  "Branding",
  "Other",
];

/** A free-form objective; validated to a minimum length. */
export const OBJECTIVE_MIN_LENGTH = 10;
export const OBJECTIVE_MAX_LENGTH = 600;

export type NeedOption =
  | "Discovery & planning"
  | "UI / UX design"
  | "Development"
  | "Product strategy"
  | "Digital marketing"
  | "Brand & identity"
  | "Automation"
  | "Ongoing support";

export const NEED_OPTIONS: NeedOption[] = [
  "Discovery & planning",
  "UI / UX design",
  "Development",
  "Product strategy",
  "Digital marketing",
  "Brand & identity",
  "Automation",
  "Ongoing support",
];

/**
 * Budget ranges. Deliberately currency-neutral — the market/monetization
 * strategy is not finalized, so we use descriptive bands rather than
 * locking in a fixed currency.
 */
export type BudgetOption =
  | "Under 1k"
  | "1k – 5k"
  | "5k – 15k"
  | "15k – 50k"
  | "50k+"
  | "Not sure";

export const BUDGET_OPTIONS: BudgetOption[] = [
  "Under 1k",
  "1k – 5k",
  "5k – 15k",
  "15k – 50k",
  "50k+",
  "Not sure",
];

export type TimelineOption =
  | "ASAP"
  | "1–3 months"
  | "3–6 months"
  | "6+ months"
  | "Not sure";

export const TIMELINE_OPTIONS: TimelineOption[] = [
  "ASAP",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Not sure",
];

/** Contact information for the final step. */
export type ContactDetails = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
};

/** The full multi-step request payload. */
export type ProjectRequest = {
  build: BuildOption | "";
  objective: string;
  needs: NeedOption[];
  budget: BudgetOption | "";
  timeline: TimelineOption | "";
  contact: ContactDetails;
};

/** Default empty request. */
export const EMPTY_REQUEST: ProjectRequest = {
  build: "",
  objective: "",
  needs: [],
  budget: "",
  timeline: "",
  contact: {
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  },
};

export const TOTAL_STEPS = 6;

export const STEP_TITLES = [
  "What are you building?",
  "What is your objective?",
  "What do you need?",
  "Budget range",
  "Timeline",
  "Contact",
] as const;

export const SUCCESS_MESSAGE = "Perfect. We've got the idea.";

export const SEND_CTA = "SEND PROJECT REQUEST";
