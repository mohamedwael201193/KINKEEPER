import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import LandingPage from "@/site/pages/landing-page";
import ArchitecturePage from "@/site/pages/architecture-page";
import SecurityPage from "@/site/pages/security-page";
import FaqPage from "@/site/pages/faq-page";
import InstallPage, { DemoPage, DownloadPage } from "@/site/pages/product-pages";
import { DocsHomePage, DocsLayout } from "@/site/pages/docs/docs-layout";
import { DocArticlePage } from "@/site/pages/docs/doc-articles";

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsLayout,
});

const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/",
  component: DocsHomePage,
});

const docsSlugRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/$slug",
  component: function DocsSlug() {
    const { slug } = docsSlugRoute.useParams();
    return <DocArticlePage slug={slug} />;
  },
});

const installRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/install",
  component: InstallPage,
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

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  component: SecurityPage,
});

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  component: DownloadPage,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FaqPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  docsRoute.addChildren([docsIndexRoute, docsSlugRoute]),
  installRoute,
  architectureRoute,
  demoRoute,
  securityRoute,
  downloadRoute,
  faqRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
