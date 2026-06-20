import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-xl bg-canvas-muted", className)} {...props} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/10 bg-white/40 px-8 py-16 text-center">
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl border border-trust-critical/20 bg-trust-critical/5 p-6 text-center">
      <p className="text-sm text-trust-critical">{message}</p>
      {retry ? (
        <button type="button" onClick={retry} className="mt-4 text-sm font-medium text-ink underline">
          Try again
        </button>
      ) : null}
    </div>
  );
}
