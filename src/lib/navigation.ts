export type NavItem = {
  label: string;
  href: string;
};

/** Primary site navigation shared by the header, mobile menu, and footer. */
export const mainNav: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

/** The three capability pillars, reused in nav and footer. */
export const pillars = [
  { label: "Build", href: "/services#build" },
  { label: "Design", href: "/services#design" },
  { label: "Grow", href: "/services#grow" },
] as const;

export type Dictionary = {
  nav: {
    work: string;
    services: string;
    process: string;
    about: string;
    insights: string;
    contact: string;
    startAProject: string;
    talkToUs: string;
  };
  pillars: {
    build: string;
    design: string;
    grow: string;
  };
};

/** Locale-aware main navigation — dictionary labels with real route paths. */
export function getMainNav(dict: Dictionary, locale?: string): NavItem[] {
  const base = locale ? `/${locale}` : "";
  return [
    { label: dict.nav.work, href: `${base}/work` },
    { label: dict.nav.services, href: `${base}/services` },
    { label: dict.nav.process, href: `${base}/process` },
    { label: dict.nav.about, href: `${base}/about` },
    { label: dict.nav.insights, href: `${base}/insights` },
    { label: dict.nav.contact, href: `${base}/contact` },
  ];
}

/** Locale-aware pillars — anchors into the services page. */
export function getPillars(dict: Dictionary, locale?: string) {
  const base = locale ? `/${locale}` : "";
  return [
    { label: dict.pillars.build, href: `${base}/services#build` },
    { label: dict.pillars.design, href: `${base}/services#design` },
    { label: dict.pillars.grow, href: `${base}/services#grow` },
  ] as const;
}

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/qodily" },
  { label: "Instagram", href: "https://www.instagram.com/qodily" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/qodily" },
  { label: "GitHub", href: "https://github.com/qodily" },
] as const;