import { Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  ChevronRight,
  FileStack,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api-client";

const RAIL_WIDTH = "w-[220px]";
const RAIL_OFFSET = "lg:pl-[220px]";

type NavItem = {
  to: string;
  label: string;
  hint: string;
  icon: typeof Activity;
  exact?: boolean;
};

const primaryNav: NavItem[] = [
  { to: "/app", label: "Timeline", hint: "Activity feed", icon: Activity, exact: true },
  { to: "/app/incidents", label: "Alerts", hint: "Scam & risks", icon: Bell },
  { to: "/app/evidence", label: "Evidence", hint: "Proof records", icon: FileStack },
  { to: "/app/telegram", label: "Telegram", hint: "Caregiver pings", icon: MessageCircle },
];

const secondaryNav: NavItem[] = [
  { to: "/app/family", label: "Family setup", hint: "Onboarding wizard", icon: Heart },
  { to: "/app/caregivers", label: "Caregivers", hint: "Your team", icon: Users },
  { to: "/app/qvac", label: "AI engine", hint: "Local inference", icon: Sparkles },
  { to: "/app/system", label: "Health", hint: "System status", icon: Shield },
];

function NavLink({
  item,
  pathname,
  onNavigate,
  compact,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={`${item.label} — ${item.hint}`}
      aria-label={item.label}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-colors",
        compact ? "px-3 py-2.5" : "px-3 py-2",
        active
          ? "bg-ink text-canvas shadow-soft"
          : "text-ink-muted hover:bg-white/70 hover:text-ink",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {compact ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-tight">{item.label}</span>
          <span
            className={cn(
              "block truncate text-[10px] leading-tight",
              active ? "text-canvas/70" : "text-ink-faint group-hover:text-ink-muted",
            )}
          >
            {item.hint}
          </span>
        </span>
      ) : (
        <span className="text-sm font-medium">{item.label}</span>
      )}
    </Link>
  );
}

export function AppShell() {
  const { user, logout, hasFamily } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: family } = useQuery({
    queryKey: ["family"],
    queryFn: api.getFamily,
    enabled: hasFamily,
  });

  const { data: onboarding } = useQuery({
    queryKey: ["onboarding"],
    queryFn: api.getOnboarding,
    enabled: hasFamily,
  });

  if (!hasFamily) {
    return <Navigate to="/onboarding/family" replace />;
  }

  const familyLabel = family?.name ?? "Your family";
  const setupIncomplete = onboarding && onboarding.progress < 100;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-ink/8 bg-canvas/95 backdrop-blur lg:flex",
          RAIL_WIDTH,
        )}
      >
        <Link
          to="/app"
          className="flex h-14 items-center gap-2 border-b border-ink/8 px-4"
          title="KINKEEPER home"
          aria-label="KINKEEPER home"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas shadow-soft">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-sm leading-tight">KINKEEPER</p>
            <p className="truncate text-[10px] text-ink-faint">{familyLabel}</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Watch</p>
          {primaryNav.map((item) => (
            <NavLink key={item.to} item={item} pathname={pathname} compact />
          ))}

          <div className="my-3 border-t border-ink/8" aria-hidden />

          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Configure</p>
          {secondaryNav.map((item) => (
            <NavLink key={item.to} item={item} pathname={pathname} compact />
          ))}
        </nav>

        <div className="border-t border-ink/8 p-2">
          <Button
            variant="ghost"
            className="group relative h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-ink-muted hover:bg-white/70 hover:text-ink"
            onClick={() => {
              void logout().then(() => {
                void navigate({ to: "/login" });
              });
            }}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="text-left text-sm font-medium">Sign out</span>
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-ink/10 bg-canvas p-4 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-serif text-lg">KINKEEPER</p>
                <p className="text-xs text-ink-muted">{familyLabel}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Watch</p>
              {primaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-6 border-t border-ink/8 pt-4">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                Configure
              </p>
              <div className="flex flex-col gap-1">
                {secondaryNav.map((item) => (
                  <NavLink
                    key={item.to}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("flex min-h-screen flex-col", RAIL_OFFSET)}>
        <header className="sticky top-0 z-20 border-b border-ink/8 bg-canvas/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8 lg:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.16em] text-ink-faint">
                  {familyLabel}
                </p>
                <p className="truncate font-serif text-lg leading-tight lg:text-xl">
                  Family safety workflow
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="max-w-[180px] truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-medium text-canvas">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {setupIncomplete && !pathname.startsWith("/app/family") ? (
            <Link
              to="/app/family"
              className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm transition hover:border-accent/40"
            >
              <span>
                <span className="font-medium text-accent">Setup {onboarding!.progress}% complete</span>
                <span className="ml-2 text-ink-muted">— tap to continue protecting your family</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-accent" />
            </Link>
          ) : null}
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-ink/8 bg-canvas/95 px-2 py-2 backdrop-blur lg:hidden">
          {primaryNav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium",
                  active ? "text-accent" : "text-ink-muted",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-accent")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl tracking-tight text-ink md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
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
