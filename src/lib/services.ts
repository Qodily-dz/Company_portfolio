/**
 * The three capability pillars: Build, Design, Grow.
 * These drive the signature interactive services section. Each pillar maps
 * to a `morph` state in the shared WebGL environment (build=0, design=1,
 * grow=2) so switching between them transforms the same digital matter.
 */
export type PillarId = "build" | "design" | "grow";

export type PillarData = {
  id: PillarId;
  label: string;
  index: string;
  tagline: string;
  lede: string;
  services: string[];
  /** Present only for grow — the directional funnel stages. */
  funnel?: readonly string[];
};

export const PILLARS: readonly PillarData[] = [
  {
    id: "build",
    label: "Build",
    index: "01",
    tagline: "Software Architecture",
    lede: "We engineer the backbone — websites, web & mobile apps, custom software and APIs built to scale, stay fast, and hold together under real use.",
    services: [
      "Websites",
      "Web Apps",
      "Mobile Apps",
      "Desktop Apps",
      "Custom Software",
      "SaaS",
      "Automation",
      "APIs",
    ],
  },
  {
    id: "design",
    label: "Design",
    index: "02",
    tagline: "Digital Composition",
    lede: "We shape how your product reads and feels — interfaces, identities and design systems rendered as a precise, living composition.",
    services: [
      "UI/UX",
      "Product Design",
      "Web Design",
      "Mobile Design",
      "Branding",
      "Design Systems",
    ],
  },
  {
    id: "grow",
    label: "Grow",
    index: "03",
    tagline: "Data Flow",
    lede: "We turn attention into outcomes — campaigns, content and analytics that move people from first touch to lasting growth.",
    services: [
      "Digital Marketing",
      "Social Media",
      "Meta Ads",
      "SEO",
      "Content",
      "Lead Generation",
      "Analytics",
    ],
    funnel: ["Attention", "Engagement", "Leads", "Customers", "Growth"],
  },
] as const;

export function getPillar(id: PillarId): PillarData {
  return PILLARS.find((p) => p.id === id) ?? PILLARS[0];
}

/** Maps a pillar id to its WebGL morph target (build=0, design=1, grow=2). */
export function pillarToMorph(id: PillarId): number {
  switch (id) {
    case "build":
      return 0;
    case "design":
      return 1;
    case "grow":
      return 2;
  }
}
