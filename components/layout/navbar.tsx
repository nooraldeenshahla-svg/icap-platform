"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, Languages, Waves, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; ar: string; en: string }[] = [
  { href: "/dashboard", ar: "لوحة المعلومات", en: "Dashboard" },
  { href: "/conflicts/new", ar: "نزاع جديد", en: "New Conflict" },
  { href: "/analysis", ar: "التحليل", en: "Analysis" },
  { href: "/statistics", ar: "الإحصائيات", en: "Statistics" },
  { href: "/search", ar: "البحث", en: "Search" },
  { href: "/settings", ar: "الإعدادات", en: "Settings" },
];

export function Navbar() {
  const locale = useAppStore((s) => s.locale);
  const toggleLocale = useAppStore((s) => s.toggleLocale);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Waves className="h-6 w-6 text-primary" />
          <span>ICAP</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {locale === "ar" ? item.ar : item.en}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm",
              "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            {locale === "ar" ? "EN" : "AR"}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </button>

          {session?.user && (
            <div className="flex items-center gap-2 border-s border-border ps-2">
              {session.user.image && (
                <Image src={session.user.image} alt={session.user.name ?? ""} width={28} height={28} className="rounded-full" />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Sign out"
                title={locale === "ar" ? "تسجيل الخروج" : "Sign out"}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
