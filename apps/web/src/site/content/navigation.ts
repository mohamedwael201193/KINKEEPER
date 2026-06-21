export const SITE_NAME = "KINKEEPER Guardian Mesh";

export const NAV_LINKS = [
  { label: "Documentation", to: "/docs" as const },
  { label: "Architecture", to: "/architecture" as const },
  { label: "Security", to: "/security" as const },
  { label: "Download", to: "/download" as const },
  { label: "FAQ", to: "/faq" as const },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Overview", to: "/" as const },
      { label: "Product preview", to: "/demo" as const },
      { label: "Download", to: "/download" as const },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", to: "/docs" as const },
      { label: "Installation", to: "/install" as const },
      { label: "Architecture", to: "/architecture" as const },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security & privacy", to: "/security" as const },
      { label: "FAQ", to: "/faq" as const },
    ],
  },
] as const;

export const SITE_URL = "https://kinkeeper.dev";
