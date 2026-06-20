import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

const appId = import.meta.env.VITE_PRIVY_APP_ID;

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  if (!appId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
        <p className="max-w-md text-sm text-ink-muted">
          Missing <code className="text-ink">VITE_PRIVY_APP_ID</code>. Add it to your environment to enable sign-in.
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#111111",
          logo: "/favicon.svg",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
