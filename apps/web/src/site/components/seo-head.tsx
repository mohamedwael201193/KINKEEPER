import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "@/site/content/navigation";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
};

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SeoHead({
  title,
  description = "Local AI that detects scam calls, fraudulent invoices, and social engineering before money is lost.",
  path = "",
  type = "website",
}: SeoProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Protect Families Before Money Is Lost`;
  const url = `${SITE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("description", description);
    upsertMeta("og:title", fullTitle, true);
    upsertMeta("og:description", description, true);
    upsertMeta("og:url", url, true);
    upsertMeta("og:type", type, true);
    upsertMeta("og:site_name", SITE_NAME, true);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", fullTitle);
    upsertMeta("twitter:description", description);
    upsertMeta("theme-color", "#9478FC");
  }, [fullTitle, description, url, type]);

  return null;
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const id = "kinkeeper-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [data]);

  return null;
}
