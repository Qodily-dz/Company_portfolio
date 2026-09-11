import type { Locale } from "./config";

export type Dictionary = {
  meta: {
    title: string;
    description: string;
    ogLocale: string;
  };
  nav: {
    work: string;
    services: string;
    process: string;
    about: string;
    insights: string;
    contact: string;
    startAProject: string;
    getStarted: string;
    talkToUs: string;
  };
  pillars: {
    build: string;
    design: string;
    grow: string;
  };
  hero: {
    label: string;
    subLabel: string;
    headline1: string;
    headline2: string;
    headlineAccent: string;
    supporting: string;
    eyebrow: string;
    cta1: string;
    cta2: string;
    brand: string;
  };
  story: {
    label: string;
    statements: { prefix: string; accent: string }[];
    scroll: string;
  };
  transformation: {
    label: string;
    heading1: string;
    heading2Accent: string;
    heading2Rest: string;
    body: string;
    manual: string;
    digital: string;
    rows: { from: string; to: string }[];
    dragHint: string;
  };
  work: {
    label: string;
    heading1: string;
    heading2: string;
    view: string;
    viewCase: string;
    concept: string;
    /** Provenance disclosure for the project card screenshots. */
    imageNote: string;
    backToWork: string;
    project: string;
    challenge: string;
    solution: string;
    architecture: string;
    design: string;
    technology: string;
    result: string;
    gallery: string;
    nextProject: string;
    prevProject: string;
    openCase: string;
    /** Default badge for production work ("Production"). */
    production: string;
    /** Localized labels for the raw badge values coming from project data. */
    productionBadges: Record<string, string>;
    /** Section headers of the /work gallery (production vs Qodily Lab). */
    sections: {
      productionBadge: string;
      productionTitle: string;
      productionBody: string;
      conceptBadge: string;
      conceptTitle: string;
      conceptBody: string;
    };
  };
  engineering: {
    label: string;
    heading1: string;
    heading2Accent: string;
    heading2Rest: string;
    body: string;
    centerBlurb: string;
    hoverHint: string;
    liveLabel: string;
    close: string;
    expand: string;
    architecture: string;
  };
  process: {
    label: string;
    heading1: string;
    heading2: string;
    whatWeDo: string;
    deliverables: string;
    technologies: string;
    subtitle: string;
    stages: {
      id: string;
      num: string;
      title: string;
      desc: string;
      whatWeDo: string[];
      deliverables: string[];
      technologies: string[];
    }[];
  };
  growth: {
    label: string;
    heading1: string;
    heading2Accent: string;
    heading2Rest: string;
    body: string;
    subLabel: string;
    funnelStages: {
      reach: string;
      engagement: string;
      leads: string;
      customers: string;
      growth: string;
    };
    bottomMessage1: string;
    bottomMessage2Part1: string;
    bottomMessage2Part2: string;
    bottomMessage2Part3: string;
    bottomMessage2Rest: string;
  };
  services: {
    heading1: string;
    heading2Accent: string;
    heading2Rest: string;
    chooseCapability: string;
    footnote: string;
    packsLabel: string;
    packsIntro: string;
    packsNote: string;
    fromLabel: string;
    customLabel: string;
    choosePack: string;
  };
  insights: {
    label: string;
    heading1: string;
    heading2: string;
    note: string;
    allArticles: string;
    viewAll: string;
    writtenBy: string;
    backToAll: string;
    /** Localized "min read" unit used to format article reading times. */
    readTime: string;
    /** Localized article category names, keyed by the English token. */
    categories: Record<string, string>;
  };
  lab: {
    label: string;
    heading1: string;
    heading2: string;
    note: string;
    experimental: string;
    notClientWork: string;
    labBadge: string;
    conceptBadge: string;
    purposeTags: string[];
    footnote: string;
  };
  about: {
    label: string;
    headingLines: string[];
    body: string;
    disciplinesIntro: string;
    vision: string;
    visionText: string;
    mission: string;
    missionText: string;
    values: string;
    hoverToReveal: string;
    valuesList: { name: string; meaning: string }[];
  };
  contact: {
    label: string;
    heading1: string;
    heading2Accent: string;
    heading2Rest: string;
    body: string;
    stepTitles: string[];
    buildOptions: string[];
    needOptions: string[];
    budgetOptions: string[];
    timelineOptions: string[];
    objectivePlaceholder: string;
    objectiveMinHint: string;
    objectiveGoodHint: string;
    back: string;
    continue: string;
    sendCta: string;
    successMessage: string;
    successBody: string;
    startNew: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    messageLabel: string;
    messagePlaceholder: string;
    preferChat: string;
    whatsappCta: string;
    whatsappPrefill: string;
    submitError: string;
    budgetHint: string;
    /** Label of the honeypot field (never seen by real users). */
    website: string;
    errors: {
      build: string;
      objective: string;
      needs: string;
      budget: string;
      timeline: string;
      name: string;
      email: string;
    };
  };
  footer: {
    capabilities: string;
    company: string;
    getInTouch: string;
    allRights: string;
  };
  pages: {
    home: {
      servicesLabel: string;
      workLabel: string;
      processLabel: string;
      aboutLabel: string;
      exploreServices: string;
      exploreWork: string;
      exploreProcess: string;
      exploreAbout: string;
      finalCtaLabel: string;
      finalCtaHeading: string;
      finalCtaBody: string;
      startProject: string;
    };
    work: {
      title: string;
      description: string;
      intro: string;
      note: string;
    };
    services: {
      title: string;
      description: string;
      intro: string;
    };
    process: {
      title: string;
      description: string;
      intro: string;
    };
    about: {
      title: string;
      description: string;
      intro: string;
      storyHeading: string;
      story: string[];
      approachHeading: string;
      approach: string[];
    };
    contact: {
      title: string;
      description: string;
      intro: string;
      detailsHeading: string;
      reply: string;
    };
  };
  common: {
    scroll: string;
    close: string;
    back: string;
    skipToContent: string;
    home: string;
    next: string;
    mainNav: string;
    mainMenu: string;
    footerNav: string;
    openMenu: string;
    language: string;
    breadcrumb: string;
    articleNav: string;
  };
  seo: {
    keywords: string[];
  };
  structuredData: {
    organizationDescription: string;
    serviceDescriptions: string[];
  };
  articles: {
    [slug: string]: {
      title: string;
      summary: string;
      body: string[];
      keywords: string[];
    };
  };
  projects: {
    [id: string]: {
      title: string;
      category: string;
      short: string;
      summary: string;
      problem: string;
      solution: string;
      approach: string;
      architecture?: string;
      design: string;
      product: string;
      /** Three short, checkable capability lines shown on project cards. */
      capabilities: string[];
      outcome: string;
    };
  };
  servicesData: {
    pillars: {
      label: string;
      tagline: string;
      lede: string;
      services: string[];
    }[];
  };
  engineeringData: {
    center: string;
    nodes: {
      label: string;
      desc: string;
      details: string[];
    }[];
  };
};

export type { Locale };
