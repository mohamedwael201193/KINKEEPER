import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/states";
import { useAuth } from "@/providers/auth-provider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isSyncing } = useAuth();

  if (isLoading || isSyncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    try {
      const path = window.location.pathname;
      const returnPath = path.startsWith("/incidents/")
        ? `/app${path}`
        : path.startsWith("/app")
          ? path
          : null;
      if (returnPath) {
        sessionStorage.setItem("kinkeeper-auth-return", returnPath);
      }
    } catch {
      /* ignore */
    }
    return <Navigate to="/login" />;
  }

  return children;
}
