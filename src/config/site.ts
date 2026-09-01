export const siteConfig = {
  name: "Qodily",
  legalName: "Qodily-dz",
  tagline: "From idea to impact.",
  positioning: "Build. Design. Grow.",
  description:
    "Qodily-dz is a digital solutions partner based in Algiers, Algeria, transforming ideas and business problems into practical digital products through software engineering, design, and digital growth.",
  url: "https://qodily.dz",
  email: "hello@qodily.dz",
  phone: "+213 555 000 000",
  whatsapp: "https://wa.me/213555000000",
  address: {
    city: "Algiers",
    country: "Algeria",
  },
  languages: ["en", "fr", "ar"],
  defaultLanguage: "en",
  social: {
    github: "https://github.com/qodily",
    linkedin: "https://www.linkedin.com/company/qodily",
    twitter: "https://x.com/qodily",
    instagram: "https://www.instagram.com/qodily",
    dribbble: "https://dribbble.com/qodily",
    behance: "https://www.behance.net/qodily",
  },
  author: "Qodily",
  keywords: [
    "Qodily",
    "Qodily-dz",
    "digital solutions agency",
    "web development",
    "mobile applications",
    "UI/UX design",
    "product design",
    "digital marketing",
    "SEO",
    "software engineering",
    "Algeria",
    "Algiers",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
