export function DataProof({
  endpoint,
  value,
  className = "",
}: {
  endpoint: string;
  value?: string | number | boolean | null;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint ${className}`}
    >
      <span className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">Live API</span>
      <span>{endpoint}</span>
      {value !== undefined ? (
        <span className="normal-case tracking-normal text-ink-muted">→ {String(value)}</span>
      ) : null}
    </div>
  );
}
