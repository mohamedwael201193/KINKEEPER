import { useNavigate, useRouterState } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

const PUBLIC_ENTRY_PATHS = new Set(["/", "/login", "/register"]);

function resolvePostLoginPath(hasFamily: boolean): string {
  try {
    const stored = sessionStorage.getItem("kinkeeper-auth-return");
    if (stored?.startsWith("/app")) {
      sessionStorage.removeItem("kinkeeper-auth-return");
      return stored;
    }
  } catch {
    /* ignore */
  }
  return hasFamily ? "/app" : "/onboarding/family";
}

export function AuthRedirect() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { ready, authenticated } = usePrivy();
  const { isAuthenticated, hasFamily, isLoading, isSyncing } = useAuth();

  useEffect(() => {
    if (!ready || isLoading || isSyncing) return;
    if (!isAuthenticated) return;
    if (!PUBLIC_ENTRY_PATHS.has(pathname) && pathname !== "/auth/complete") return;

    void navigate({
      to: resolvePostLoginPath(hasFamily),
      replace: true,
    });
  }, [ready, isAuthenticated, hasFamily, isLoading, isSyncing, pathname, navigate]);

  useEffect(() => {
    if (!ready || isLoading || isSyncing) return;
    if (!authenticated || isAuthenticated) return;
    if (pathname === "/auth/complete") return;
    if (!PUBLIC_ENTRY_PATHS.has(pathname)) return;

    try {
      if (pathname.startsWith("/app")) {
        sessionStorage.setItem("kinkeeper-auth-return", pathname);
      }
    } catch {
      /* ignore */
    }

    void navigate({ to: "/auth/complete", replace: true });
  }, [ready, authenticated, isAuthenticated, isLoading, isSyncing, pathname, navigate]);

  return null;
}
