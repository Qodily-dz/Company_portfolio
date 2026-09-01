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
    tagline: "Experience & Interface",
    lede: "We shape how your product looks and feels — interfaces, identities and design systems that make complex things feel simple and worthwhile.",
    services: [
      "UI/UX",
      "Product Design",
      "Web Design",
      "Branding",
      "Visual Identity",
      "Design Systems",
      "Social Media Design",
    ],
  },
  {
    id: "grow",
    label: "Grow",
    index: "03",
    tagline: "Direction & Data",
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
    funnel: ["Reach", "Engagement", "Leads", "Customers", "Growth"],
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
