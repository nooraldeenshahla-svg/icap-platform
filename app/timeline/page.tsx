"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Modal } from "@/components/ui/modal";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { TimelineForm } from "@/components/timeline/timeline-form";
import { TimelineView } from "@/components/timeline/timeline-view";
import { WizardStepIndicator, WizardNav } from "@/components/wizard/step-nav";
import { useAppStore } from "@/lib/store";
import { getAllConflicts, saveConflict } from "@/lib/db";
import type { Conflict, TimelineEvent } from "@/types/conflict";

const COPY = {
  ar: { title: "الخط الزمني", subtitle: "سجّل أحداث النزاع بالتسلسل لتتبّع مسار التصعيد أو التهدئة." },
  en: { title: "Timeline", subtitle: "Record conflict events in sequence to track escalation or de-escalation." },
};

function TimelineContent() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const searchParams = useSearchParams();
  const wizardConflictId = searchParams.get("conflict");

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);

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

  function handleAdd(ev: TimelineEvent) {
    if (!conflict) return;
    persist({ ...conflict, timeline: [...conflict.timeline, { ...ev, conflictId: conflict.id }], updatedAt: new Date().toISOString() });
  }

  function handleUpdate(updated: TimelineEvent) {
    if (!conflict) return;
    persist({
      ...conflict,
      timeline: conflict.timeline.map((e) => (e.id === updated.id ? updated : e)),
      updatedAt: new Date().toISOString(),
    });
    setEditingEvent(null);
  }

  function handleRemove(id: string) {
    if (!conflict) return;
    persist({ ...conflict, timeline: conflict.timeline.filter((e) => e.id !== id), updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        {wizardConflictId && <WizardStepIndicator currentKey="timeline" />}
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6">
          <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {conflict && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <TimelineForm onAdd={handleAdd} />
            <TimelineView events={conflict.timeline} onRemove={handleRemove} onEdit={setEditingEvent} />

            <Modal open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
              {editingEvent && (
                <TimelineForm
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  editing={editingEvent}
                  onCancelEdit={() => setEditingEvent(null)}
                />
              )}
            </Modal>
          </div>
        )}

        {wizardConflictId && conflict && <WizardNav currentKey="timeline" conflictId={conflict.id} />}
      </div>
    </>
  );
}

export default function TimelinePage() {
  return (
    <React.Suspense fallback={null}>
      <TimelineContent />
    </React.Suspense>
  );
}
