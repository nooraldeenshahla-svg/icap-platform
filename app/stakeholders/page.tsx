"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Network, List } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Modal } from "@/components/ui/modal";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { StakeholderForm } from "@/components/stakeholders/stakeholder-form";
import { StakeholderList } from "@/components/stakeholders/stakeholder-list";
import { StakeholderNetwork } from "@/components/stakeholders/stakeholder-network";
import { RelationshipManager } from "@/components/stakeholders/relationship-manager";
import { WizardStepIndicator, WizardNav } from "@/components/wizard/step-nav";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, saveConflict } from "@/lib/db";
import type { Conflict, Stakeholder, StakeholderRelationship } from "@/types/conflict";
import { cn } from "@/lib/utils";

const COPY = {
  ar: {
    title: "أصحاب المصلحة", subtitle: "حدّد الأطراف المعنية بالنزاع، مواقفهم، نفوذهم، وعلاقاتهم ببعض.",
    tabList: "القائمة", tabGraph: "الشبكة التفاعلية",
  },
  en: {
    title: "Stakeholders", subtitle: "Map every party involved in the conflict, their positions, influence, and relationships.",
    tabList: "List", tabGraph: "Network Graph",
  },
};

function StakeholdersContent() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const searchParams = useSearchParams();
  const wizardConflictId = searchParams.get("conflict");

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [tab, setTab] = React.useState<"list" | "graph">("list");
  const [editingStakeholder, setEditingStakeholder] = React.useState<Stakeholder | null>(null);

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

  function handleAddStakeholder(s: Stakeholder) {
    if (!conflict) return;
    const withConflictId = { ...s, conflictId: conflict.id };
    persist({ ...conflict, stakeholders: [...conflict.stakeholders, withConflictId], updatedAt: new Date().toISOString() });
  }

  function handleRemoveStakeholder(id: string) {
    if (!conflict) return;
    persist({
      ...conflict,
      stakeholders: conflict.stakeholders
        .filter((s) => s.id !== id)
        .map((s) => ({ ...s, relationships: s.relationships.filter((r) => r.targetStakeholderId !== id) })),
      updatedAt: new Date().toISOString(),
    });
  }

  function handleUpdateStakeholder(updated: Stakeholder) {
    if (!conflict) return;
    persist({
      ...conflict,
      stakeholders: conflict.stakeholders.map((s) => (s.id === updated.id ? updated : s)),
      updatedAt: new Date().toISOString(),
    });
    setEditingStakeholder(null);
  }

  function handleAddRelationship(sourceId: string, rel: StakeholderRelationship) {
    if (!conflict) return;
    persist({
      ...conflict,
      stakeholders: conflict.stakeholders.map((s) =>
        s.id === sourceId ? { ...s, relationships: [...s.relationships.filter((r) => r.targetStakeholderId !== rel.targetStakeholderId), rel] } : s
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  function handleRemoveRelationship(sourceId: string, targetId: string) {
    if (!conflict) return;
    persist({
      ...conflict,
      stakeholders: conflict.stakeholders.map((s) =>
        s.id === sourceId ? { ...s, relationships: s.relationships.filter((r) => r.targetStakeholderId !== targetId) } : s
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        {wizardConflictId && <WizardStepIndicator currentKey="stakeholders" />}
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6">
          <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {conflict && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <StakeholderForm onAdd={handleAddStakeholder} />

            <Modal open={!!editingStakeholder} onOpenChange={(open) => !open && setEditingStakeholder(null)}>
              {editingStakeholder && (
                <StakeholderForm
                  onAdd={handleAddStakeholder}
                  onUpdate={handleUpdateStakeholder}
                  editing={editingStakeholder}
                  onCancelEdit={() => setEditingStakeholder(null)}
                />
              )}
            </Modal>

            <div className="space-y-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("list")}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                    tab === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                >
                  <List className="h-4 w-4" /> {t.tabList}
                </button>
                <button
                  onClick={() => setTab("graph")}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                    tab === "graph" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                >
                  <Network className="h-4 w-4" /> {t.tabGraph}
                </button>
              </div>

              {tab === "list" ? (
                <StakeholderList stakeholders={conflict.stakeholders} onRemove={handleRemoveStakeholder} onEdit={setEditingStakeholder} />
              ) : (
                <StakeholderNetwork conflict={conflict} />
              )}

              <RelationshipManager
                stakeholders={conflict.stakeholders}
                onAddRelationship={handleAddRelationship}
                onRemoveRelationship={handleRemoveRelationship}
              />
            </div>
          </div>
        )}

        {wizardConflictId && conflict && <WizardNav currentKey="stakeholders" conflictId={conflict.id} />}
      </div>
    </>
  );
}

export default function StakeholdersPage() {
  return (
    <React.Suspense fallback={null}>
      <StakeholdersContent />
    </React.Suspense>
  );
}
