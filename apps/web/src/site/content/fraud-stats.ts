/** Publicly reported figures — sources linked in UI, not invented. */
export const FRAUD_STATS = [
  {
    value: "$2.7B+",
    label: "Reported imposter scam losses (U.S., 2023)",
    source: "FTC Consumer Sentinel Network",
    sourceUrl: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/02/consumer-sentinel-network-data-book-2023",
  },
  {
    value: "880K+",
    label: "Imposter scam reports filed with the FTC (2023)",
    source: "FTC Consumer Sentinel Network",
    sourceUrl: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/02/consumer-sentinel-network-data-book-2023",
  },
  {
    value: "$3.4B+",
    label: "Reported elder fraud losses (U.S., 2023)",
    source: "FBI IC3 Elder Fraud Report",
    sourceUrl: "https://www.ic3.gov/Media/PDF/AnnualReport/2023_IC3ElderFraudReport.pdf",
  },
] as const;

export const THREAT_CATEGORIES = [
  {
    title: "Scam calls",
    description:
      "Impersonators posing as IRS, Medicare, or law enforcement use urgency and fear to extract payment before families can intervene.",
    icon: "phone" as const,
  },
  {
    title: "Fake invoices",
    description:
      "Official-looking letters and PDFs demand wire transfers, gift cards, or crypto — often targeting elders who trust printed correspondence.",
    icon: "file" as const,
  },
  {
    title: "Social engineering",
    description:
      "Attackers isolate victims with instructions to stay silent, bypass banks, or act immediately — classic coercion patterns.",
    icon: "users" as const,
  },
  {
    title: "Tech support scams",
    description:
      "Remote-access requests and fake security alerts trick users into granting control or paying for nonexistent fixes.",
    icon: "monitor" as const,
  },
  {
    title: "Impersonation attacks",
    description:
      "Voice and message spoofing mimics grandchildren, attorneys, or caregivers to authorize transfers under pressure.",
    icon: "mask" as const,
  },
  {
    title: "Family fraud",
    description:
      "When elders are targeted repeatedly, caregivers need evidence and alerts — not after-the-fact bank disputes alone.",
    icon: "home" as const,
  },
] as const;
