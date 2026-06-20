import { useNavigate } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingNav } from "@/layouts/marketing-layout";
import { PageTransition } from "@/components/motion/primitives";
import { useAuth } from "@/providers/auth-provider";

export function AuthCompletePage() {
  const navigate = useNavigate();
  const { ready, authenticated } = usePrivy();
  const { isAuthenticated, hasFamily, isLoading, isSyncing, authError, syncPrivySession, clearAuthError } =
    useAuth();
  const syncAttempted = useRef(false);
  const graceUntil = useRef(Date.now() + 8000);

  useEffect(() => {
    if (!ready || isLoading || isSyncing) return;
    if (authenticated) return;
    if (Date.now() < graceUntil.current) return;
    void navigate({ to: "/login", replace: true });
  }, [ready, authenticated, isLoading, isSyncing, navigate]);

  useEffect(() => {
    if (!ready || isLoading) return;
    if (isAuthenticated) {
      try {
        const stored = sessionStorage.getItem("kinkeeper-auth-return");
        if (stored?.startsWith("/app")) {
          sessionStorage.removeItem("kinkeeper-auth-return");
          void navigate({ to: stored, replace: true });
          return;
        }
      } catch {
        /* ignore */
      }
      void navigate({ to: hasFamily ? "/app" : "/app/family", replace: true });
    }
  }, [ready, isAuthenticated, hasFamily, isLoading, navigate]);

  useEffect(() => {
    if (!ready || !authenticated || isAuthenticated || isSyncing || authError || syncAttempted.current) return;
    syncAttempted.current = true;
    void syncPrivySession();
  }, [ready, authenticated, isAuthenticated, isSyncing, authError, syncPrivySession]);

  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      <PageTransition className="mx-auto flex max-w-lg flex-col px-4 py-16">
        <Card className="overflow-hidden border-ink/10 shadow-soft">
          <CardHeader className="space-y-4 bg-gradient-to-br from-white to-canvas-muted/60">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-trust-safe/30 bg-trust-safe/10 px-3 py-1 text-xs font-medium text-trust-safe">
              <ShieldCheck className="h-3.5 w-3.5" />
              Finishing sign-in
            </div>
            <div>
              <CardTitle className="font-display text-2xl">Connecting your session</CardTitle>
              <CardDescription className="mt-2 text-base">
                {authError
                  ? "We verified your email with Privy but could not start your KINKEEPER session."
                  : "Email verified — syncing with KINKEEPER servers."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {!authError ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-ink/8 bg-white p-6 text-sm text-ink-muted">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                {isSyncing || isLoading || !isAuthenticated ? "Almost there…" : "Redirecting to your dashboard…"}
              </div>
            ) : (
              <>
                <p className="rounded-xl border border-trust-critical/20 bg-trust-critical/5 p-4 text-sm text-trust-critical">
                  {authError}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    disabled={isSyncing}
                    onClick={() => {
                      clearAuthError();
                      syncAttempted.current = false;
                      void syncPrivySession();
                    }}
                  >
                    Try again
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      void navigate({ to: "/login" });
                    }}
                  >
                    Back to sign in
                  </Button>
                </div>
                <p className="text-xs text-ink-faint">
                  Tip: if the magic link opened a new browser tab, copy the URL into the same browser where you started
                  sign-in, or use the 6-digit OTP code instead.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}
