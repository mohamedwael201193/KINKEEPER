import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  ChevronRight,
  FileStack,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/incidents", label: "Incidents", icon: Bell },
  { to: "/app/timeline", label: "Timeline", icon: Activity },
  { to: "/app/evidence", label: "Evidence", icon: FileStack },
  { to: "/app/family", label: "Family", icon: Heart },
  { to: "/app/caregivers", label: "Caregivers", icon: Users },
  { to: "/app/telegram", label: "Telegram", icon: MessageCircle },
  { to: "/app/qvac", label: "QVAC Runtime", icon: Sparkles },
  { to: "/app/system", label: "System Health", icon: Shield },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-ink/8 bg-canvas/80 px-5 py-6 backdrop-blur lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif text-lg leading-none">KINKEEPER</p>
              <p className="text-xs text-ink-muted">Family Safety</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-ink text-canvas" : "text-ink-muted hover:bg-canvas-muted hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-ink/8 bg-white/60 p-4">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-ink-muted">{user?.email}</p>
            <Button variant="ghost" size="sm" className="mt-3 w-full justify-start px-0" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-ink/8 bg-canvas/85 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Dashboard</p>
                <p className="font-serif text-xl">Protecting families using local AI</p>
              </div>
              <Button asChild variant="secondary" size="sm" className="lg:hidden">
                <Link to="/app/incidents">Incidents</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-ink md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          {item.to ? (
            <Link to={item.to} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
