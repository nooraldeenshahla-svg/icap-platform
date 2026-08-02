"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { GitBranch, ListTree } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Modal } from "@/components/ui/modal";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { CauseForm, EffectForm } from "@/components/problem-tree/cause-effect-forms";
import { CauseList, EffectList } from "@/components/problem-tree/cause-effect-lists";
import { ProblemTreeDiagram } from "@/components/problem-tree/problem-tree-diagram";
import { WizardStepIndicator, WizardNav } from "@/components/wizard/step-nav";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, saveConflict } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Conflict, Cause, Effect } from "@/types/conflict";

const COPY = {
  ar: {
    title: "شجرة المشكلة", subtitle: "حدّد الأسباب (المباشرة، غير المباشرة، الجذرية) والآثار المترتبة، وشاهد الشجرة تُبنى تلقائياً.",
    causesTab: "الأسباب والآثار", treeTab: "الشجرة", causesHeading: "الأسباب", effectsHeading: "الآثار",
  },
  en: {
    title: "Problem Tree", subtitle: "Define direct, indirect, and root causes plus effects — watch the tree build automatically.",
    causesTab: "Causes & Effects", treeTab: "Tree", causesHeading: "Causes", effectsHeading: "Effects",
  },
};

function ProblemTreeContent() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const searchParams = useSearchParams();
  const wizardConflictId = searchParams.get("conflict");

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [tab, setTab] = React.useState<"entry" | "tree">("entry");
  const [editingCause, setEditingCause] = React.useState<Cause | null>(null);
  const [editingEffect, setEditingEffect] = React.useState<Effect | null>(null);

  React.useEffect(() => {
    getAllConflicts().then((all) => {
      setConflicts(all);
      if (wizardConflictId && all.some((c) => c.id === wizardConflictId)) {
        setSelectedId(wizardConflictId);
      } else if (all.length > 0) {
        setSelectedId(all[0]?.id ?? "");
      }
    });
  }, [wizardConflictId]);

  const conflict = conflicts.find((c) => c.id === selectedId);

  async function persist(updated: Conflict) {
    setConflicts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    await saveConflict(updated);
  }

  function addCause(c: Cause) {
    if (!conflict) return;
    persist({ ...conflict, causes: [...conflict.causes, { ...c, conflictId: conflict.id }], updatedAt: new Date().toISOString() });
  }
  function updateCause(updated: Cause) {
    if (!conflict) return;
    persist({ ...conflict, causes: conflict.causes.map((c) => (c.id === updated.id ? updated : c)), updatedAt: new Date().toISOString() });
    setEditingCause(null);
  }
  function removeCause(id: string) {
    if (!conflict) return;
    persist({ ...conflict, causes: conflict.causes.filter((c) => c.id !== id), updatedAt: new Date().toISOString() });
  }
  function addEffect(e: Effect) {
    if (!conflict) return;
    persist({ ...conflict, effects: [...conflict.effects, { ...e, conflictId: conflict.id }], updatedAt: new Date().toISOString() });
  }
  function updateEffect(updated: Effect) {
    if (!conflict) return;
    persist({ ...conflict, effects: conflict.effects.map((e) => (e.id === updated.id ? updated : e)), updatedAt: new Date().toISOString() });
    setEditingEffect(null);
  }
  function removeEffect(id: string) {
    if (!conflict) return;
    persist({ ...conflict, effects: conflict.effects.filter((e) => e.id !== id), updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        {wizardConflictId && <WizardStepIndicator currentKey="problem-tree" />}
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6">
          <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {conflict && (
          <div className="mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("entry")}
                className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "entry" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
              >
                <ListTree className="h-4 w-4" /> {t.causesTab}
              </button>
              <button
                onClick={() => setTab("tree")}
                className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "tree" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
              >
                <GitBranch className="h-4 w-4" /> {t.treeTab}
              </button>
            </div>

            {tab === "entry" ? (
              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-medium">{t.causesHeading}</h3>
                  <CauseForm onAdd={addCause} />
                  <CauseList causes={conflict.causes} onRemove={removeCause} onEdit={setEditingCause} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-medium">{t.effectsHeading}</h3>
                  <EffectForm onAdd={addEffect} />
                  <EffectList effects={conflict.effects} onRemove={removeEffect} onEdit={setEditingEffect} />
                </div>

                <Modal open={!!editingCause} onOpenChange={(open) => !open && setEditingCause(null)}>
                  {editingCause && (
                    <CauseForm onAdd={addCause} onUpdate={updateCause} editing={editingCause} onCancelEdit={() => setEditingCause(null)} />
                  )}
                </Modal>
                <Modal open={!!editingEffect} onOpenChange={(open) => !open && setEditingEffect(null)}>
                  {editingEffect && (
                    <EffectForm onAdd={addEffect} onUpdate={updateEffect} editing={editingEffect} onCancelEdit={() => setEditingEffect(null)} />
                  )}
                </Modal>
              </div>
            ) : (
              <div className="mt-6">
                <ProblemTreeDiagram conflict={conflict} />
              </div>
            )}
          </div>
        )}

        {wizardConflictId && conflict && <WizardNav currentKey="problem-tree" conflictId={conflict.id} />}
      </div>
    </>
  );
}

export default function ProblemTreePage() {
  return (
    <React.Suspense fallback={null}>
      <ProblemTreeContent />
    </React.Suspense>
  );
}
