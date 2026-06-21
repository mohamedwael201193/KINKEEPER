import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  History,
  Home,
  Mic,
  Play,
  Shield,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

const nav = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/analyze/recording", label: "Analyze Recording", icon: Mic },
  { to: "/analyze/document", label: "Analyze Document", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/evidence", label: "Evidence", icon: Shield },
  { to: "/telegram", label: "Family Safety", icon: MessageCircle },
  { to: "/demo", label: "Demo Center", icon: Play },
  { to: "/proof", label: "QVAC Proof", icon: ShieldCheck },
];

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-navy-light/95 backdrop-blur-xl lg:flex">
        <div className="border-b border-white/[0.06] px-6 py-5">
          <p className="font-serif text-xl text-white">KINKEEPER</p>
          <p className="text-xs font-medium tracking-wide text-steel">Guardian Mesh</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn("nav-link flex w-full items-center gap-3", isActive && "nav-link-active")
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4 text-xs text-steel">
          Local AI · Private by design
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-serif text-lg text-white">KINKEEPER</p>
              <p className="text-[10px] uppercase tracking-wider text-steel">Guardian Mesh</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Mobile navigation">
            {nav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-steel",
                    isActive && "bg-accent/10 text-accent-soft",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
