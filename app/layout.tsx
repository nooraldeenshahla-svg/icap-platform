import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleShell } from "@/components/locale-shell";
import { AuthProvider } from "@/components/auth/session-provider";

export const metadata: Metadata = {
  title: {
    default: "ICAP — منصة تحليل النزاعات العراقية",
    template: "%s | ICAP",
  },
  description:
    "Iraq Conflict Analysis Platform — an AI-powered platform for analyzing community conflicts, stakeholders, root causes, and peace opportunities across Iraq.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a1c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LocaleShell>{children}</LocaleShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
