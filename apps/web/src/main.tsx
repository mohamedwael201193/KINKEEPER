import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { AppProviders } from "@/providers/app-providers";
import { AuthProvider } from "@/providers/auth-provider";
import { PrivyAuthProvider } from "@/providers/privy-auth-provider";
import { router } from "@/routes/router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyAuthProvider>
      <AppProviders>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppProviders>
    </PrivyAuthProvider>
  </StrictMode>,
);
