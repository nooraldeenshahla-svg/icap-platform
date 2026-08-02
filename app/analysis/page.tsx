"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Layers, Triangle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { OnionModelEditor } from "@/components/analysis/onion-model-editor";
import { ABCTriangleEditor } from "@/components/analysis/abc-triangle-editor";
import { AIAnalysisPanel } from "@/components/analysis/ai-analysis-panel";
import { WizardStepIndicator, WizardNav } from "@/components/wizard/step-nav";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, saveConflict } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Conflict, OnionModelEntry, ABCTriangle, AIAnalysisResult } from "@/types/conflict";

const COPY = {
  ar: { title: "التحليل التفصيلي", subtitle: "نموذج البصلة، مثلث ABC، والتحليل الشامل بالذكاء الاصطناعي.", onion: "نموذج البصلة", abc: "مثلث ABC", ai: "التحليل الذكي" },
  en: { title: "Detailed Analysis", subtitle: "Onion model, ABC triangle, and comprehensive AI analysis.", onion: "Onion Model", abc: "ABC Triangle", ai: "AI Analysis" },
};

type Tab = "onion" | "abc" | "ai";

function AnalysisContent() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const params = useSearchParams();
  const initial = params.get("model");
  const wizardConflictId = params.get("conflict");
  const [tab, setTab] = React.useState<Tab>(initial === "abc" ? "abc" : initial === "risk" ? "ai" : "onion");

  React.useEffect(() => {
    setTab(initial === "abc" ? "abc" : initial === "risk" ? "ai" : "onion");
  }, [initial]);

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");

  React.useEffect(() => {
    getAllConflicts().then((all) => {
      setConflicts(all);
      if (wizardConflictId && all.some((c) => c.id === wizardConflictId)) {
        setSelectedId(wizardConflictId);
      } else if (all.length > 0) {
        setSelectedId(all[0].id);
      }
    });
  }, [wizardConflictId]);

  const conflict = conflicts.find((c) => c.id === selectedId);

  async function persist(updated: Conflict) {
    setConflicts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    await saveConflict(updated);
  }

  function saveOnion(entries: OnionModelEntry[]) {
    if (!conflict) return;
    persist({ ...conflict, onionModels: entries, updatedAt: new Date().toISOString() });
  }
  function saveABC(v: ABCTriangle) {
    if (!conflict) return;
    persist({ ...conflict, abcTriangle: v, updatedAt: new Date().toISOString() });
  }
  function saveAIResult(result: AIAnalysisResult) {
    if (!conflict) return;
    persist({ ...conflict, aiAnalysis: result, aiAnalyzedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  const tabs: { id: Tab; label: string; icon: typeof Layers }[] = [
    { id: "onion", label: t.onion, icon: Layers },
    { id: "abc", label: t.abc, icon: Triangle },
    { id: "ai", label: t.ai, icon: Sparkles },
  ];

  return (
    <>
      <Navbar />
      <div className="container py-10">
        {wizardConflictId && <WizardStepIndicator currentKey={tab} />}
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6">
          <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {conflict && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                    tab === tb.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                >
                  <tb.icon className="h-4 w-4" /> {tb.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === "onion" && <OnionModelEditor conflict={conflict} onSave={saveOnion} />}
              {tab === "abc" && (
                <ABCTriangleEditor
                  value={conflict.abcTriangle ?? { attitudes: [], behaviors: [], contradictions: [] }}
                  onChange={saveABC}
                />
              )}
              {tab === "ai" && <AIAnalysisPanel conflict={conflict} onResult={saveAIResult} />}
            </div>
          </div>
        )}

        {wizardConflictId && conflict && <WizardNav currentKey={tab} conflictId={conflict.id} />}
      </div>
    </>
  );
}

export default function AnalysisPage() {
  return (
    <React.Suspense fallback={null}>
      <AnalysisContent />
    </React.Suspense>
  );
}
