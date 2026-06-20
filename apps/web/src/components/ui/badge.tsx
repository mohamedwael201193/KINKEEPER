import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "success" | "warning" | "critical" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "border-accent/20 bg-accent-soft text-accent",
        variant === "outline" && "border-ink/10 bg-transparent text-ink-muted",
        variant === "success" && "border-trust-ok/20 bg-trust-ok/10 text-trust-ok",
        variant === "warning" && "border-trust-warn/20 bg-trust-warn/10 text-trust-warn",
        variant === "critical" && "border-trust-critical/20 bg-trust-critical/10 text-trust-critical",
        className,
      )}
      {...props}
    />
  );
}
