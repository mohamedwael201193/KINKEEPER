import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from "@tanstack/react-router";
import LandingPage from "@/site/pages/landing-page";
import DocsPage from "@/site/pages/docs-page";
import DownloadPage from "@/site/pages/download-page";
import ArchitecturePage from "@/site/pages/architecture-page";
import DemoPage from "@/site/pages/demo-page";
import QvacProofPage from "@/site/pages/qvac-proof-page";

function RootLayout() {
  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsPage,
});

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  component: DownloadPage,
});

const architectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/architecture",
  component: ArchitecturePage,
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoPage,
});

const qvacProofRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/qvac-proof",
  component: QvacProofPage,
});

const legacyRedirect = (to: string) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: to,
    component: () => <Navigate to="/" />,
  });

const routeTree = rootRoute.addChildren([
  indexRoute,
  docsRoute,
  downloadRoute,
  architectureRoute,
  demoRoute,
  qvacProofRoute,
  legacyRedirect("/login"),
  legacyRedirect("/register"),
  legacyRedirect("/auth/complete"),
  legacyRedirect("/onboarding/family"),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/$",
    component: () => <Navigate to="/docs" />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: () => <Navigate to="/docs" />,
  }),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
