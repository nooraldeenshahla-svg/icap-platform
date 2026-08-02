"use client";

import * as React from "react";
import { Sparkles, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { riskLevel } from "@/lib/utils";
import type { Conflict, AIAnalysisResult } from "@/types/conflict";

const COPY = {
  ar: {
    trigger: "تشغيل التحليل بالذكاء الاصطناعي", running: "جارٍ التحليل…",
    reRun: "إعادة التحليل", lastRun: "آخر تحليل:", noAnalysis: "لم يُجرَ أي تحليل بعد لهذا النزاع.",
    summary: "الملخص التنفيذي", risk: "تقييم المخاطر", recommendations: "التوصيات",
    scenarios: "السيناريوهات", earlyWarning: "مؤشرات الإنذار المبكر",
    error: "حدث خطأ أثناء التحليل:",
    riskLabels: {
      conflictSeverity: "شدة النزاع", violenceRisk: "خطر العنف", escalationRisk: "خطر التصعيد",
      peaceOpportunity: "فرصة السلام", institutionalCapacity: "القدرة المؤسسية", communityReadiness: "جاهزية المجتمع",
    },
  },
  en: {
    trigger: "Run AI Analysis", running: "Analyzing…",
    reRun: "Re-run Analysis", lastRun: "Last run:", noAnalysis: "No AI analysis has been run for this conflict yet.",
    summary: "Executive Summary", risk: "Risk Assessment", recommendations: "Recommendations",
    scenarios: "Scenarios", earlyWarning: "Early Warning Indicators",
    error: "An error occurred during analysis:",
    riskLabels: {
      conflictSeverity: "Conflict Severity", violenceRisk: "Violence Risk", escalationRisk: "Escalation Risk",
      peaceOpportunity: "Peace Opportunity", institutionalCapacity: "Institutional Capacity", communityReadiness: "Community Readiness",
    },
  },
};

const RISK_COLOR = { low: "#2f7d72", medium: "#cc8748", high: "#d9822b", critical: "#b93b2f" };

export function AIAnalysisPanel({
  conflict, onResult,
}: {
  conflict: Conflict;
  onResult: (result: AIAnalysisResult) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conflict),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      onResult(data as AIAnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const result = conflict.aiAnalysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            {result ? t.reRun : t.trigger}
          </h3>
          {conflict.aiAnalyzedAt && (
            <p className="mt-1 text-xs text-muted-foreground">{t.lastRun} {new Date(conflict.aiAnalyzedAt).toLocaleString(isAr ? "ar-IQ" : "en-US")}</p>
          )}
        </div>
        <Button onClick={runAnalysis} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t.running : result ? t.reRun : t.trigger}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t.error} {error}</span>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t.noAnalysis}</p>
      )}

      {result && (
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h4 className="font-display text-base font-medium">{t.summary}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{result.summary?.executiveSummary}</p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h4 className="flex items-center gap-2 font-display text-base font-medium">
              <ShieldCheck className="h-4 w-4 text-secondary" /> {t.risk}
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {result.riskAssessment && Object.entries(result.riskAssessment).map(([key, score]) => {
                const level = riskLevel(score.value);
                return (
                  <div key={key} className="rounded-md bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{t.riskLabels[key as keyof typeof t.riskLabels] ?? key}</div>
                    <div className="mt-1 text-2xl font-semibold" style={{ color: RISK_COLOR[level] }}>{score.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{score.explanation}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {result.recommendations?.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h4 className="font-display text-base font-medium">{t.recommendations}</h4>
              <ul className="mt-3 space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="rounded-md bg-muted/50 p-3 text-sm">
                    <span className="font-medium">{r.title}</span>
                    <span className="ms-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{r.priority}</span>
                    <p className="mt-1 text-muted-foreground">{r.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.scenarios?.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h4 className="font-display text-base font-medium">{t.scenarios}</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {result.scenarios.map((s, i) => (
                  <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{s.title}</span>
                      <span className="text-xs text-muted-foreground">{s.probability}%</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{s.narrative}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.earlyWarningIndicators?.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h4 className="font-display text-base font-medium">{t.earlyWarning}</h4>
              <ul className="mt-3 space-y-2">
                {result.earlyWarningIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ind.currentStatus === "alert" ? "bg-destructive" : ind.currentStatus === "watch" ? "bg-secondary" : "bg-primary"}`} />
                    <span><span className="font-medium">{ind.indicator}:</span> {ind.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
