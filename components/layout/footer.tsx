"use client";

import { useAppStore } from "@/lib/store";

const COPY = {
  ar: "تم تطوير هذه المنصة من قبل منظمة السلام للتعايش السلمي",
  en: "This platform was developed by the Peace Organization for Peaceful Coexistence",
};

export function Footer() {
  const locale = useAppStore((s) => s.locale);

  return (
    <footer className="no-print border-t border-border/60 py-6">
      <div className="container text-center text-xs text-muted-foreground">
        {COPY[locale]}
      </div>
    </footer>
  );
}
