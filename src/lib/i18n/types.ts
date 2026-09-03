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
    backToWork: string;
    project: string;
    challenge: string;
    solution: string;
    architecture: string;
    design: string;
    technology: string;
    result: string;
    nextProject: string;
    prevProject: string;
    openCase: string;
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
  };
  insights: {
    label: string;
    heading1: string;
    heading2: string;
    note: string;
    allArticles: string;
    viewAll: string;
    writtenBy: string;
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
      design: string;
      product: string;
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
