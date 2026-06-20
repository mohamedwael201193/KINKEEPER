import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
} from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { AuthRedirect } from "@/components/auth-redirect";
import { IncidentConsole } from "@/features/incidents/incident-console";
import { TimelineHome } from "@/features/timeline/timeline-home";
import LandingPage from "@/features/landing/landing-page";
import { AppShell } from "@/layouts/app-shell";
import { LoginPage, OnboardingFamilyPage, RegisterPage } from "@/pages/auth-pages";
import { AuthCompletePage } from "@/pages/auth-complete-page";
import { IncidentsPage } from "@/pages/dashboard/incidents-page";
import { TimelinePage } from "@/pages/dashboard/timeline-page";
import { EvidencePage } from "@/pages/dashboard/evidence-page";
import { CaregiversPage, FamilyPage } from "@/pages/dashboard/family-page";
import { TelegramPage } from "@/pages/dashboard/telegram-page";
import { QvacPage, SettingsPage, SystemHealthPage } from "@/pages/dashboard/system-pages";

function RootLayout() {
  return (
    <>
      <AuthRedirect />
      <Outlet />
    </>
  );
}

function ProtectedAppShell() {
  return (
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  );
}

function ProtectedOnboarding() {
  return (
    <RequireAuth>
      <OnboardingFamilyPage />
    </RequireAuth>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const authCompleteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/complete",
  component: AuthCompletePage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/family",
  component: ProtectedOnboarding,
});

const incidentDeepLinkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents/$incidentId",
  component: function IncidentRedirect() {
    const { incidentId } = incidentDeepLinkRoute.useParams();
    return <Navigate to="/app/incidents/$incidentId" params={{ incidentId }} />;
  },
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: ProtectedAppShell,
});

const overviewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: TimelineHome,
});

const incidentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/incidents",
  component: IncidentsPage,
});

const incidentDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/incidents/$incidentId",
  component: function IncidentDetailRoute() {
    const { incidentId } = incidentDetailRoute.useParams();
    return <IncidentConsole incidentId={incidentId} />;
  },
});

const timelineRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/timeline",
  component: TimelinePage,
});

const evidenceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/evidence",
  component: EvidencePage,
});

const familyRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/family",
  component: FamilyPage,
});

const caregiversRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/caregivers",
  component: CaregiversPage,
});

const telegramRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/telegram",
  component: TelegramPage,
});

const qvacRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/qvac",
  component: QvacPage,
});

const systemRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/system",
  component: SystemHealthPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authCompleteRoute,
  onboardingRoute,
  incidentDeepLinkRoute,
  appRoute.addChildren([
    overviewRoute,
    incidentsRoute,
    incidentDetailRoute,
    timelineRoute,
    evidenceRoute,
    familyRoute,
    caregiversRoute,
    telegramRoute,
    qvacRoute,
    systemRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
