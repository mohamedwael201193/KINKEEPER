import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  className,
  title,
}: {
  code: string;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-ink/10 bg-ink text-canvas shadow-soft", className)}>
      {title ? (
        <div className="border-b border-white/10 px-4 py-2 text-xs font-medium text-canvas/60">{title}</div>
      ) : null}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-canvas/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
