"use client";

import * as React from "react";
import { AlertTriangle, MapPinned, ListChecks, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { IraqMapClient } from "@/components/map/iraq-map-client";
import { useAppStore } from "@/lib/store";
import { getAllConflicts } from "@/lib/db";
import type { Conflict } from "@/types/conflict";
import { riskLevel } from "@/lib/utils";

const RISK_LABEL = {
  ar: { low: "منخفض", medium: "متوسط", high: "مرتفع", critical: "حرج" },
  en: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },
};

export default function DashboardPage() {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAllConflicts()
      .then(setConflicts)
      .catch(() => setConflicts([]))
      .finally(() => setLoading(false));
  }, []);

  const analyzed = conflicts.filter((c) => c.aiAnalysis);
  const avgSeverity =
    analyzed.length > 0
      ? Math.round(
          analyzed.reduce((sum, c) => sum + (c.aiAnalysis?.riskAssessment.conflictSeverity.value ?? 0), 0) /
            analyzed.length
        )
      : 0;
  const governorateCount = new Set(conflicts.map((c) => c.location?.governorate).filter(Boolean)).size;
  const highRiskCount = analyzed.filter(
    (c) => (c.aiAnalysis?.riskAssessment.conflictSeverity.value ?? 0) >= 55
  ).length;

  const kpis = [
    { icon: ListChecks, label: isAr ? "إجمالي النزاعات" : "Total Conflicts", value: conflicts.length },
    { icon: MapPinned, label: isAr ? "المحافظات المشمولة" : "Governorates Covered", value: governorateCount },
    { icon: AlertTriangle, label: isAr ? "نزاعات عالية الخطورة" : "High-Risk Conflicts", value: highRiskCount },
    { icon: TrendingUp, label: isAr ? "متوسط شدة النزاع" : "Avg. Conflict Severity", value: `${avgSeverity}/100` },
  ];

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{isAr ? "لوحة المعلومات" : "Dashboard"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAr
                ? "نظرة عامة تفاعلية على جميع النزاعات المسجّلة والتحليلات المكتملة."
                : "An interactive overview of all registered conflicts and completed analyses."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-border bg-card p-5">
              <k.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-display text-2xl font-semibold">{k.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-medium">
              {isAr ? "أحدث النزاعات" : "Recent Conflicts"}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {isAr ? "جارٍ التحميل…" : "Loading…"}
            </div>
          ) : conflicts.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {isAr
                ? "لا توجد نزاعات مسجّلة بعد. ابدأ بإنشاء أول تحليل."
                : "No conflicts recorded yet. Start by creating your first analysis."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-start text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-start font-medium">{isAr ? "الاسم" : "Name"}</th>
                  <th className="px-5 py-3 text-start font-medium">{isAr ? "المحافظة" : "Governorate"}</th>
                  <th className="px-5 py-3 text-start font-medium">{isAr ? "سجّله" : "Registered by"}</th>
                  <th className="px-5 py-3 text-start font-medium">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-5 py-3 text-start font-medium">{isAr ? "الخطورة" : "Risk"}</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.slice(0, 8).map((c) => {
                  const sev = c.aiAnalysis?.riskAssessment.conflictSeverity.value;
                  const level = sev !== undefined ? riskLevel(sev) : null;
                  return (
                    <tr key={c.id} className="border-t border-border/60">
                      <td className="px-5 py-3 font-medium">{c.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.location?.governorate}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.createdByName ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.status}</td>
                      <td className="px-5 py-3">
                        {level ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `hsl(var(--risk-${level}) / 0.15)`,
                              color: `hsl(var(--risk-${level}))`,
                            }}
                          >
                            {RISK_LABEL[locale][level]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isAr ? "لم يُحلَّل" : "Not analyzed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div id="map" className="mt-10 scroll-mt-20">
          <h2 className="mb-4 font-display text-lg font-medium">
            {isAr ? "خريطة العراق التفاعلية" : "Interactive Iraq Map"}
          </h2>
          <IraqMapClient conflicts={conflicts} />
        </div>
      </div>
    </>
  );
}
