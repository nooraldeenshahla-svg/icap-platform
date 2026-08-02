"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Download, Trash2, Sun, Moon, Monitor, Languages, KeyRound } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, clearAllConflicts } from "@/lib/db";
import { cn } from "@/lib/utils";

const COPY = {
  ar: {
    title: "الإعدادات", subtitle: "تفضيلات الواجهة، النسخ الاحتياطي، وإدارة البيانات.",
    appearance: "المظهر", language: "اللغة", theme: "السمة",
    light: "فاتح", dark: "غامق", system: "تلقائي (حسب النظام)",
    arabic: "العربية", english: "English",
    data: "البيانات", dataDesc: "نزاعاتك محفوظة بقاعدة بيانات مشتركة أونلاين، بس محصورة بحسابك أنت بس — ماكو حساب ثاني يقدر يشوفها.",
    backup: "تنزيل نسخة احتياطية (JSON)", conflictsCount: "نزاع محفوظ",
    danger: "منطقة الخطر", dangerDesc: "حذف كل النزاعات اللي سجّلتها أنت بحسابك نهائياً (ما يأثر على بيانات باقي الحسابات). لا يمكن التراجع عن هذا الإجراء.",
    clearAll: "حذف كل البيانات", confirmClear: "متأكد؟ اضغط مرة ثانية للتأكيد خلال 5 ثوانٍ",
    apiKey: "مفتاح Groq API", apiKeyDesc: "يُدار عبر ملف .env.local (متغير GROQ_API_KEY) ولا يظهر أبداً بالواجهة أو المتصفح. مجاني تماماً بدون بطاقة ائتمان (console.groq.com/keys).",
  },
  en: {
    title: "Settings", subtitle: "Interface preferences, backup, and data management.",
    appearance: "Appearance", language: "Language", theme: "Theme",
    light: "Light", dark: "Dark", system: "System",
    arabic: "العربية", english: "English",
    data: "Data", dataDesc: "Your conflicts are stored in a shared online database, but scoped to your account only — no other account can see them.",
    backup: "Download Backup (JSON)", conflictsCount: "conflicts stored",
    danger: "Danger Zone", dangerDesc: "Permanently delete all conflicts registered under your own account (other accounts' data is not affected). This cannot be undone.",
    clearAll: "Delete All Data", confirmClear: "Are you sure? Click again within 5 seconds to confirm",
    apiKey: "Groq API Key", apiKeyDesc: "Managed via the .env.local file (GROQ_API_KEY variable) and is never exposed in the UI or browser. Completely free, no credit card required (console.groq.com/keys).",
  },
};

export default function SettingsPage() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const t = COPY[locale];
  const { theme, setTheme } = useTheme();

  const [count, setCount] = React.useState(0);
  const [confirmingClear, setConfirmingClear] = React.useState(false);

  React.useEffect(() => { getAllConflicts().then((c) => setCount(c.length)); }, []);

  async function handleBackup() {
    const conflicts = await getAllConflicts();
    const blob = new Blob([JSON.stringify(conflicts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `icap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleClearAll() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), 5000);
      return;
    }
    await clearAllConflicts();
    setCount(0);
    setConfirmingClear(false);
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-2xl py-10">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-base font-medium">{t.appearance}</h2>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><Languages className="h-4 w-4" />{t.language}</label>
            <div className="mt-2 flex gap-2">
              <ToggleButton active={locale === "ar"} onClick={() => setLocale("ar")}>{t.arabic}</ToggleButton>
              <ToggleButton active={locale === "en"} onClick={() => setLocale("en")}>{t.english}</ToggleButton>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm text-muted-foreground">{t.theme}</label>
            <div className="mt-2 flex gap-2">
              <ToggleButton active={theme === "light"} onClick={() => setTheme("light")}><Sun className="h-3.5 w-3.5" />{t.light}</ToggleButton>
              <ToggleButton active={theme === "dark"} onClick={() => setTheme("dark")}><Moon className="h-3.5 w-3.5" />{t.dark}</ToggleButton>
              <ToggleButton active={theme === "system"} onClick={() => setTheme("system")}><Monitor className="h-3.5 w-3.5" />{t.system}</ToggleButton>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-base font-medium">{t.data}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.dataDesc}</p>
          <p className="mt-2 text-sm">{count} {t.conflictsCount}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleBackup}>
            <Download className="h-4 w-4" />{t.backup}
          </Button>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-medium"><KeyRound className="h-4 w-4 text-secondary" />{t.apiKey}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.apiKeyDesc}</p>
        </section>

        <section className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="font-display text-base font-medium text-destructive">{t.danger}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.dangerDesc}</p>
          <Button variant="destructive" size="sm" className="mt-3" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4" />{confirmingClear ? t.confirmClear : t.clearAll}
          </Button>
        </section>
      </div>
    </>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
