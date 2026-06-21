import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

let mermaidInitialized = false;

export function MermaidDiagram({ chart, title }: { chart: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#6d28ff",
          primaryTextColor: "#e4e4e7",
          lineColor: "#52525b",
          secondaryColor: "#18181b",
          tertiaryColor: "#09090b",
        },
      });
      mermaidInitialized = true;
    }

    let cancelled = false;
    void mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram render failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-4")}>
      {title ? <figcaption className="mb-3 text-sm font-medium text-zinc-300">{title}</figcaption> : null}
      {error ? (
        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-zinc-400">{chart}</pre>
      ) : svg ? (
        <div className="overflow-x-auto [&_svg]:mx-auto" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-zinc-500">Rendering diagram…</div>
      )}
    </figure>
  );
}
