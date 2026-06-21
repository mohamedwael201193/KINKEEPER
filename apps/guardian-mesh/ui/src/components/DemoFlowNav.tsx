import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Shield, ShieldCheck } from "lucide-react";

export function DemoFlowNav({ incidentId }: { incidentId: string }) {
  const steps = [
    { to: `/telegram`, label: "Family Safety Center", icon: MessageCircle },
    { to: `/evidence?id=${incidentId}`, label: "Evidence Center", icon: Shield },
    { to: "/proof", label: "QVAC Proof", icon: ShieldCheck },
  ];

  return (
    <div className="glass-card p-6">
      <p className="section-eyebrow">Demo flow</p>
      <p className="mt-2 text-sm text-steel-bright">Continue the story — each screen connects to real data from this incident.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {steps.map((s) => (
          <Link key={s.to} to={s.to} className="btn-secondary text-xs">
            <s.icon className="h-4 w-4" aria-hidden />
            {s.label}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
