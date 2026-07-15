import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ConnectionStatus } from "@/components/pwa/connection-status";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { AppNavigation } from "@/components/app-navigation";
import { OnboardingGate } from "@/features/onboarding/onboarding-gate";
import { ThemeProvider } from "@/design-system";
import { AppStoreProvider } from "@/lib/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Comptes",
    template: "%s · Comptes",
  },
  description: "Gestió de comptes, simple i accessible.",
  applicationName: "Comptes",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comptes",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ca">
      <body>
        <ThemeProvider>
          <AppStoreProvider>
            <OnboardingGate>
              {children}
              <AppNavigation />
              <ConnectionStatus />
              <ServiceWorkerRegistration />
            </OnboardingGate>
          </AppStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
