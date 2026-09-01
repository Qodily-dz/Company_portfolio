export type NavItem = {
  label: string;
  href: string;
};

/** Primary site navigation shared by the header, mobile menu, and footer. */
export const mainNav: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Insights", href: "#insights" },
];

/** The three capability pillars, reused in nav and footer. */
export const pillars = [
  { label: "Build", href: "#build" },
  { label: "Design", href: "#design" },
  { label: "Grow", href: "#grow" },
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

/** Locale-aware main navigation — uses dictionary labels with section anchors. */
export function getMainNav(dict: Dictionary): NavItem[] {
  return [
    { label: dict.nav.work, href: "#work" },
    { label: dict.nav.services, href: "#services" },
    { label: dict.nav.process, href: "#process" },
    { label: dict.nav.about, href: "#about" },
    { label: dict.nav.insights, href: "#insights" },
  ];
}

/** Locale-aware pillars — uses dictionary labels with section anchors. */
export function getPillars(dict: Dictionary) {
  return [
    { label: dict.pillars.build, href: "#build" },
    { label: dict.pillars.design, href: "#design" },
    { label: dict.pillars.grow, href: "#grow" },
  ] as const;
}

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/qodily" },
  { label: "Instagram", href: "https://www.instagram.com/qodily" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/qodily" },
  { label: "GitHub", href: "https://github.com/qodily" },
] as const;
