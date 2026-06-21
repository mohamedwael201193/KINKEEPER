import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api, verdictColor } from "@/lib/api";
import type { IncidentSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

export function HistoryPage() {
  const [items, setItems] = useState<IncidentSummary[]>([]);
  const [q, setQ] = useState("");
  const [verdict, setVerdict] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .history({ q: q || undefined, verdict: verdict || undefined })
      .then((r) => setItems(r.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, verdict]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="font-serif text-3xl text-white md:text-4xl">Protection History</h1>
      <p className="mt-2 text-steel">Real incidents from your local evidence chain.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
          <input
            type="search"
            placeholder="Search incidents…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-card py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-steel focus:border-accent/50 focus:outline-none"
            aria-label="Search incidents"
          />
        </div>
        <select
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          className="rounded-xl border border-white/10 bg-navy-card px-4 py-2.5 text-sm text-white focus:border-accent/50 focus:outline-none"
          aria-label="Filter by verdict"
        >
          <option value="">All verdicts</option>
          <option value="BLOCK">BLOCK</option>
          <option value="WARN">WARN</option>
          <option value="ALLOW">ALLOW</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-12 text-center text-steel">Loading history…</p>
      ) : items.length === 0 ? (
        <div className="glass-card mt-12 p-12 text-center">
          <p className="text-steel-bright">No incidents recorded yet.</p>
          <Link to="/analyze/recording" className="btn-primary mt-6 inline-flex">
            Analyze your first recording
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <Link
              key={item.incidentId}
              to={`/evidence?id=${item.incidentId}`}
              className="glass-card flex flex-col gap-3 p-5 transition hover:border-accent/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-xs text-steel">{new Date(item.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-sm text-steel-bright">
                  {item.inputType.toUpperCase()} · {item.scamType ?? "Analysis complete"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn("text-lg font-bold", verdictColor(item.verdict))}>{item.verdict}</span>
                <span className="text-xs text-steel">
                  {item.telegramSent ? "Telegram sent" : "Local only"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
