export type DocPage = {
  slug: string;
  title: string;
  description: string;
  section: string;
};

export const DOC_SECTIONS = [
  "Overview",
  "Getting Started",
  "Platform",
  "Integration",
  "Community",
] as const;

export const DOC_PAGES: DocPage[] = [
  {
    slug: "",
    title: "Overview",
    description: "What Guardian Mesh is and how local AI protects families.",
    section: "Overview",
  },
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Clone, configure, and run your first analysis.",
    section: "Getting Started",
  },
  {
    slug: "installation",
    title: "Installation",
    description: "Platform requirements and verified install paths.",
    section: "Getting Started",
  },
  {
    slug: "first-run",
    title: "First Run",
    description: "Model download, launcher, and what to expect.",
    section: "Getting Started",
  },
  {
    slug: "architecture",
    title: "Architecture",
    description: "Monorepo layout and runtime components.",
    section: "Platform",
  },
  {
    slug: "threat-detection",
    title: "Threat Detection",
    description: "ALLOW, WARN, and BLOCK tiers with deterministic rules.",
    section: "Platform",
  },
  {
    slug: "evidence-chain",
    title: "Evidence Chain",
    description: "Hash-linked bundles and verification.",
    section: "Platform",
  },
  {
    slug: "telegram",
    title: "Telegram",
    description: "Optional caregiver alerts and acknowledge flow.",
    section: "Platform",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and verified fixes.",
    section: "Platform",
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Frequently asked questions.",
    section: "Platform",
  },
  {
    slug: "qvac-integration",
    title: "QVAC Integration",
    description: "Local models, profiler, and provider verification.",
    section: "Integration",
  },
  {
    slug: "developer-guide",
    title: "Developer Guide",
    description: "Build, test, and extend the engine.",
    section: "Integration",
  },
  {
    slug: "contributing",
    title: "Contributing",
    description: "Quality gates and pull request expectations.",
    section: "Community",
  },
];

export function getDocBySlug(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug);
}

export function docsBySection(section: (typeof DOC_SECTIONS)[number]) {
  return DOC_PAGES.filter((p) => p.section === section);
}
