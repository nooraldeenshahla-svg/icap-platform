"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Modal } from "@/components/ui/modal";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { ActionItemForm } from "@/components/action-plan/action-item-form";
import { ActionItemList } from "@/components/action-plan/action-item-list";
import { WizardStepIndicator, WizardNav } from "@/components/wizard/step-nav";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, saveConflict } from "@/lib/db";
import type { Conflict, ActionItem } from "@/types/conflict";

const COPY = {
  ar: { title: "خطة الحل", subtitle: "حوّل التوصيات إلى أهداف ونشاطات محددة بجدول زمني ومسؤوليات واضحة." },
  en: { title: "Resolution Plan", subtitle: "Turn recommendations into concrete goals and activities with a timeline and clear ownership." },
};

function ActionPlanContent() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const searchParams = useSearchParams();
  const wizardConflictId = searchParams.get("conflict");

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [editingItem, setEditingItem] = React.useState<ActionItem | null>(null);

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

  function handleAdd(item: ActionItem) {
    if (!conflict) return;
    persist({ ...conflict, actionPlan: [...(conflict.actionPlan ?? []), { ...item, conflictId: conflict.id }], updatedAt: new Date().toISOString() });
  }

  function handleUpdate(updated: ActionItem) {
    if (!conflict) return;
    persist({
      ...conflict,
      actionPlan: (conflict.actionPlan ?? []).map((i) => (i.id === updated.id ? updated : i)),
      updatedAt: new Date().toISOString(),
    });
    setEditingItem(null);
  }

  function handleRemove(id: string) {
    if (!conflict) return;
    persist({ ...conflict, actionPlan: (conflict.actionPlan ?? []).filter((i) => i.id !== id), updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        {wizardConflictId && <WizardStepIndicator currentKey="action-plan" />}
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6">
          <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {conflict && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <ActionItemForm onAdd={handleAdd} />
            <ActionItemList items={conflict.actionPlan ?? []} onRemove={handleRemove} onEdit={setEditingItem} />

            <Modal open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
              {editingItem && (
                <ActionItemForm
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  editing={editingItem}
                  onCancelEdit={() => setEditingItem(null)}
                />
              )}
            </Modal>
          </div>
        )}

        {wizardConflictId && conflict && <WizardNav currentKey="action-plan" conflictId={conflict.id} />}
      </div>
    </>
  );
}

export default function ActionPlanPage() {
  return (
    <React.Suspense fallback={null}>
      <ActionPlanContent />
    </React.Suspense>
  );
}
