"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";

/** Keeps <html dir="rtl|ltr" lang="ar|en"> in sync with the locale store. */
export function LocaleShell({ children }: { children: React.ReactNode }) {
  const locale = useAppStore((s) => s.locale);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
