import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/content/guardian-mesh";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const variant =
    verdict === "ALLOW" ? "success" : verdict === "WARN" ? "warning" : "critical";
  return <Badge variant={variant}>{verdict}</Badge>;
}
