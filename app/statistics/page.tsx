"use client";

import * as React from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend, type ChartData,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Navbar } from "@/components/layout/navbar";
import { useAppStore } from "@/lib/store";
import { getAllConflicts } from "@/lib/db";
import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { riskLevel } from "@/lib/utils";
import type { Conflict } from "@/types/conflict";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COPY = {
  ar: {
    title: "الإحصائيات", subtitle: "نظرة تحليلية على جميع النزاعات المسجّلة.",
    byGovernorate: "النزاعات حسب المحافظة", byType: "النزاعات حسب النوع", byRisk: "توزيع مستوى الخطورة",
    empty: "لا توجد بيانات كافية بعد — سجّل نزاعات أولاً.",
    riskLabels: { low: "منخفض", medium: "متوسط", high: "مرتفع", critical: "حرج", none: "غير محلّل" },
  },
  en: {
    title: "Statistics", subtitle: "An analytical overview of all registered conflicts.",
    byGovernorate: "Conflicts by Governorate", byType: "Conflicts by Type", byRisk: "Risk Level Distribution",
    empty: "Not enough data yet — register some conflicts first.",
    riskLabels: { low: "Low", medium: "Medium", high: "High", critical: "Critical", none: "Not analyzed" },
  },
};

const PALETTE = ["#22635c", "#cc8748", "#b93b2f", "#2f5cb9", "#8a5cb9", "#4a9c9c", "#7a7a2f", "#5c9c2f", "#b96e34", "#4a4a4a", "#3b6fb9", "#8a8a8a"];

export default function StatisticsPage() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);

  React.useEffect(() => { getAllConflicts().then(setConflicts); }, []);

  const byGovernorate = React.useMemo(() => {
    const counts: Record<string, number> = {};
    conflicts.forEach((c) => { counts[c.location.governorate] = (counts[c.location.governorate] ?? 0) + 1; });
    return counts;
  }, [conflicts]);

  const byType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    conflicts.forEach((c) => { counts[c.conflictType] = (counts[c.conflictType] ?? 0) + 1; });
    return counts;
  }, [conflicts]);

  const byRisk = React.useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0, none: 0 };
    conflicts.forEach((c) => {
      const v = c.aiAnalysis?.riskAssessment.conflictSeverity.value;
      counts[v === undefined ? "none" : riskLevel(v)]++;
    });
    return counts;
  }, [conflicts]);

  if (conflicts.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container py-10">
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t.empty}</p>
        </div>
      </>
    );
  }

  const govData: ChartData<"bar"> = {
    labels: Object.keys(byGovernorate),
    datasets: [{ data: Object.values(byGovernorate), backgroundColor: "#22635c", borderRadius: 6 }],
  };

  const typeData: ChartData<"doughnut"> = {
    labels: Object.keys(byType).map((k) => isAr ? CONFLICT_TYPE_LABELS[k as keyof typeof CONFLICT_TYPE_LABELS].ar : CONFLICT_TYPE_LABELS[k as keyof typeof CONFLICT_TYPE_LABELS].en),
    datasets: [{ data: Object.values(byType), backgroundColor: PALETTE }],
  };

  const riskColors: Record<string, string> = { low: "#2f7d72", medium: "#cc8748", high: "#d9822b", critical: "#b93b2f", none: "#8a8a8a" };
  const riskData: ChartData<"bar"> = {
    labels: Object.keys(byRisk).map((k) => t.riskLabels[k as keyof typeof t.riskLabels]),
    datasets: [{ data: Object.values(byRisk), backgroundColor: Object.keys(byRisk).map((k) => riskColors[k] ?? "#8a8a8a"), borderRadius: 6 }],
  };

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-base font-medium">{t.byGovernorate}</h3>
            <Bar data={govData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-base font-medium">{t.byType}</h3>
            <Doughnut data={typeData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }} />
          </div>
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <h3 className="mb-4 font-display text-base font-medium">{t.byRisk}</h3>
            <Bar data={riskData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
        </div>
      </div>
    </>
  );
}
