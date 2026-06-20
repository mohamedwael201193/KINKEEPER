import { useNavigate, useRouterState } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { MarketingNav } from "@/layouts/marketing-layout";
import { PageTransition } from "@/components/motion/primitives";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api-client";
import { ApiError } from "@/lib/config";
import { useState } from "react";
import { Skeleton } from "@/components/ui/states";

export function LoginPage() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRegister = pathname === "/register";
  const { ready, authenticated, login } = usePrivy();
  const { isAuthenticated, hasFamily, isLoading, isSyncing, authError, syncPrivySession, clearAuthError } =
    useAuth();

  useEffect(() => {
    if (!ready || isLoading || isSyncing || authError) return;
    if (!authenticated || isAuthenticated) return;
    void syncPrivySession();
  }, [ready, authenticated, isAuthenticated, isLoading, isSyncing, authError, syncPrivySession]);

  useEffect(() => {
    if (isLoading || isSyncing || !isAuthenticated) return;
    void navigate({ to: hasFamily ? "/app" : "/onboarding/family", replace: true });
  }, [isAuthenticated, hasFamily, isLoading, isSyncing, navigate]);

  const finishing = authenticated && !isAuthenticated && (isSyncing || isLoading);

  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      <PageTransition className="mx-auto flex max-w-lg flex-col px-4 py-16">
        <Card className="overflow-hidden border-ink/10 shadow-soft">
          <CardHeader className="space-y-4 bg-gradient-to-br from-white to-canvas-muted/60">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-trust-safe/30 bg-trust-safe/10 px-3 py-1 text-xs font-medium text-trust-safe"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Privy-secured · passwordless
            </motion.div>
            <div>
              <CardTitle className="font-display text-3xl">
                {isRegister ? "Get started with KINKEEPER" : "Sign in to KINKEEPER"}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {isRegister
                  ? "Create your account in one minute — then we'll walk you through protecting your parent step by step."
                  : "Enter your email — use the 6-digit code or tap the magic link from privy.io."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {finishing ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-ink/8 bg-white p-6 text-sm text-ink-muted">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                Email verified — starting your session…
              </div>
            ) : (
              <Button
                className="h-12 w-full text-base"
                disabled={!ready}
                onClick={() => {
                  clearAuthError();
                  void login();
                }}
              >
                Continue with email
              </Button>
            )}

            {authError ? (
              <div className="space-y-3">
                <p className="rounded-xl border border-trust-critical/20 bg-trust-critical/5 p-3 text-sm text-trust-critical">
                  {authError}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isSyncing}
                  onClick={() => {
                    clearAuthError();
                    void syncPrivySession();
                  }}
                >
                  Retry sign-in
                </Button>
              </div>
            ) : null}

            <p className="text-center text-xs text-ink-faint">
              Magic link opened a new tab? Return here after clicking it, or enter the OTP code in the Privy popup.
            </p>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}

export function RegisterPage() {
  return <LoginPage />;
}

export function OnboardingFamilyPage() {
  const navigate = useNavigate();
  const { refreshUser, setSession, user, hasFamily, isLoading, isAuthenticated, token } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const familyQuery = useQuery({
    queryKey: ["family"],
    queryFn: api.getFamily,
    enabled: Boolean(token) && isAuthenticated && !isLoading,
  });

  const existingFamily = familyQuery.data;

  useEffect(() => {
    if (isLoading || familyQuery.isLoading) return;
    if (hasFamily || existingFamily) {
      void navigate({ to: "/app/family", replace: true });
    }
  }, [hasFamily, existingFamily, isLoading, familyQuery.isLoading, navigate]);

  if (isLoading || familyQuery.isLoading || hasFamily || existingFamily) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      <PageTransition className="mx-auto flex max-w-lg flex-col px-4 py-16">
        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Step 0 · Household</span>
            </div>
            <CardTitle>Create your family</CardTitle>
            <CardDescription>Name the household KINKEEPER will protect</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  const family = await api.createFamily(name.trim());
                  if (family.accessToken && user) {
                    setSession(family.accessToken, {
                      ...user,
                      familyId: family.id,
                      role: "admin",
                    });
                  } else {
                    await refreshUser();
                  }
                  void navigate({ to: "/app/family" });
                } catch (err) {
                  if (err instanceof ApiError && err.code === "ALREADY_IN_FAMILY") {
                    await refreshUser();
                    void navigate({ to: "/app/family", replace: true });
                    return;
                  }
                  setError(err instanceof ApiError ? err.message : "Could not create family");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="familyName">Family name</Label>
                <Input
                  id="familyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Chen Family"
                  autoFocus
                />
                <p className="text-xs text-ink-faint">Use a name caregivers will recognize in Telegram alerts.</p>
              </div>
              {error ? <p className="text-sm text-trust-critical">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                Continue to protection setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}
