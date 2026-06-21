import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, Clock, AlertCircle, Timer } from "lucide-react";
import { api, verdictColor } from "@/lib/api";

function responseMinutes(createdAt: string, ackAt?: string): string | null {
  if (!ackAt) return null;
  const ms = new Date(ackAt).getTime() - new Date(createdAt).getTime();
  if (ms < 0) return null;
  return `${Math.round(ms / 60000)}m`;
}

export function TelegramPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.telegram>> | null>(null);

  useEffect(() => {
    const load = () => api.telegram().then(setData).catch(console.error);
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p className="p-10 text-center text-steel">Loading Family Safety Center…</p>;

  const ackByIncident = new Map(data.acks.map((a) => [a.incidentId, a.at]));

  return (
    <div className="page-shell">
      <p className="section-eyebrow">Caregiver operations</p>
      <h1 className="page-title mt-2">Family Safety Center</h1>
      <p className="page-subtitle">Alert timeline, acknowledgements, and incident response — powered by real Telegram data.</p>

      {!data.configured && (
        <div className="mt-8 rounded-xl border border-warn/30 bg-warn/10 p-6 text-sm text-warn">
          Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file.
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Bell, label: "Alerts sent", value: data.alertsSent ?? data.alerts.filter((a) => a.verdict !== "ALLOW").length, color: "text-accent-soft" },
          { icon: CheckCircle2, label: "Acknowledged", value: data.acknowledged, color: "text-allow" },
          { icon: AlertCircle, label: "Open incidents", value: data.openIncidents ?? data.pending, color: "text-warn" },
          { icon: Clock, label: "Resolved", value: data.resolvedIncidents ?? data.acknowledged, color: "text-steel-bright" },
        ].map((m) => (
          <div key={m.label} className="glass-card p-6">
            <m.icon className={`h-5 w-5 ${m.color}`} aria-hidden />
            <p className="metric-value mt-4 text-3xl">{m.value}</p>
            <p className="metric-label mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="section-eyebrow">Alert timeline</h2>
        <div className="mt-6 space-y-3">
          {data.alerts.length === 0 ? (
            <p className="text-steel">No alerts yet. Run a demo scenario to generate a real Telegram alert.</p>
          ) : (
            data.alerts.map((alert) => {
              const ackAt = ackByIncident.get(alert.incidentId);
              const response = responseMinutes(alert.createdAt, ackAt);
              return (
                <div key={alert.incidentId} className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${verdictColor(alert.verdict)}`}>{alert.verdict}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${alert.acknowledged ? "bg-allow/20 text-allow" : "bg-warn/20 text-warn"}`}>
                        {alert.acknowledged ? "Acknowledged" : "Pending"}
                      </span>
                    </div>
                    <Link to={`/evidence?id=${alert.incidentId}`} className="mt-2 inline-block font-mono text-xs text-accent-soft hover:underline">
                      {alert.incidentId}
                    </Link>
                    <p className="mt-1 text-xs text-steel">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-steel">
                    {response && (
                      <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> Response {response}</span>
                    )}
                    <Link to={`/evidence?id=${alert.incidentId}`} className="btn-secondary py-2 text-xs">View evidence</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {data.acks.length > 0 && (
        <section className="mt-14">
          <h2 className="section-eyebrow">Caregiver acknowledgements</h2>
          <ul className="mt-4 space-y-2">
            {data.acks.map((ack, i) => (
              <li key={`${ack.incidentId}-${i}`} className="glass-card flex justify-between p-4 text-sm">
                <span className="text-steel-bright">Incident {ack.incidentId.slice(0, 8)}… acknowledged via {ack.via}</span>
                <span className="text-steel">{new Date(ack.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
