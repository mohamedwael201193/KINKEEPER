import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { api, configureAuth, refreshToken, type AuthUser } from "@/services/api-client";
import { ApiError } from "@/lib/config";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isAuthenticated: boolean;
  hasFamily: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  setSession: (token: string, user: AuthUser) => void;
  refreshUser: () => Promise<void>;
  syncPrivySession: () => Promise<boolean>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function getPrivyTokenWithRetry(getAccessToken: () => Promise<string | null>): Promise<string | null> {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const token = await Promise.race([
        getAccessToken(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
      if (token) return token;
    } catch {
      // Privy may throw while the OAuth callback is still settling.
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, getAccessToken, logout: privyLogout } = usePrivy();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const bootstrapKeyRef = useRef<string | null>(null);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
  }, []);

  useEffect(() => {
    configureAuth(
      () => token,
      (value) => setToken(value),
    );
  }, [token, setToken]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    const me = await api.me();
    setUser(me);
  }, [token]);

  const setSession = useCallback(
    (accessToken: string, nextUser: AuthUser) => {
      setToken(accessToken);
      setUser(nextUser);
      setAuthError(null);
    },
    [setToken],
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const syncPrivySession = useCallback(async (): Promise<boolean> => {
    if (syncingRef.current) return Boolean(token && user);
    syncingRef.current = true;
    setIsSyncing(true);
    setAuthError(null);
    try {
      const privyToken = await getPrivyTokenWithRetry(getAccessToken);
      if (!privyToken) {
        throw new Error("Privy session not ready yet. Wait a moment or enter the OTP code from your email.");
      }

      const result = await api.syncPrivy({ accessToken: privyToken });
      setSession(result.accessToken, result.user);
      return true;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not complete sign-in";
      setAuthError(message);
      return false;
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [getAccessToken, setSession, token, user]);

  useEffect(() => {
    let cancelled = false;
    const bootstrapKey = `${ready}:${authenticated}:${Boolean(token && user)}`;

    async function bootstrap() {
      if (!ready) return;
      if (bootstrapKeyRef.current === bootstrapKey && token && user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (token && user) {
          bootstrapKeyRef.current = bootstrapKey;
          return;
        }

        if (authenticated) {
          await syncPrivySession();
        } else {
          const refreshed = await refreshToken();
          if (refreshed && !cancelled) {
            setToken(refreshed);
            const me = await api.me();
            if (!cancelled) setUser(me);
          } else if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        }
        bootstrapKeyRef.current = bootstrapKey;
      } catch {
        if (!cancelled && !authenticated) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, syncPrivySession, setToken, token, user]);

  const logout = useCallback(async () => {
    bootstrapKeyRef.current = null;
    try {
      await api.logout();
    } finally {
      setToken(null);
      setUser(null);
      setAuthError(null);
      await privyLogout();
    }
  }, [privyLogout, setToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading: !ready || isLoading,
      isSyncing,
      isAuthenticated: Boolean(token && user),
      hasFamily: Boolean(user?.familyId),
      authError,
      logout,
      setSession,
      refreshUser,
      syncPrivySession,
      clearAuthError,
    }),
    [
      user,
      token,
      ready,
      isLoading,
      isSyncing,
      authError,
      logout,
      setSession,
      refreshUser,
      syncPrivySession,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
