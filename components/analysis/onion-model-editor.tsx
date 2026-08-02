"use client";

import * as React from "react";
import { Layers } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { Conflict, OnionModelEntry } from "@/types/conflict";

const COPY = {
  ar: {
    empty: "أضف أطرافاً بوحدة \"أصحاب المصلحة\" أولاً حتى تبني نموذج البصلة لهم.",
    position: "الطبقة الخارجية — الموقف (ما يطالب به علناً؟)",
    interest: "الطبقة الوسطى — المصلحة (لماذا يريد ذلك؟)",
    needs: "الطبقة الداخلية — الاحتياجات (الأساسيات)",
  },
  en: {
    empty: "Add stakeholders in the Stakeholders module first to build their onion model.",
    position: "Outer Layer — Position (what they publicly demand)",
    interest: "Middle Layer — Interest (why they want it)",
    needs: "Inner Layer — Needs (non-negotiable basics)",
  },
};

export function OnionModelEditor({ conflict, onSave }: { conflict: Conflict; onSave: (entries: OnionModelEntry[]) => void }) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  function getEntry(stakeholderId: string): OnionModelEntry {
    return conflict.onionModels.find((o) => o.stakeholderId === stakeholderId) ??
      { stakeholderId, position: "", interest: "", needs: "" };
  }

  function updateField(stakeholderId: string, field: "position" | "interest" | "needs", value: string) {
    const existing = getEntry(stakeholderId);
    const updated = { ...existing, [field]: value };
    const rest = conflict.onionModels.filter((o) => o.stakeholderId !== stakeholderId);
    onSave([...rest, updated]);
  }

  if (conflict.stakeholders.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t.empty}</p>;
  }

  return (
    <div className="space-y-5">
      {conflict.stakeholders.map((s) => {
        const entry = getEntry(s.id);
        return (
          <div key={s.id} className="rounded-lg border border-border bg-card p-5">
            <h4 className="flex items-center gap-2 font-display text-base font-medium">
              <Layers className="h-4 w-4 text-secondary" />
              {s.name}
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-clay-600">{t.position}</label>
                <Textarea rows={3} className="mt-1.5" value={entry.position}
                  onChange={(e) => updateField(s.id, "position", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-euphrates-600">{t.interest}</label>
                <Textarea rows={3} className="mt-1.5" value={entry.interest}
                  onChange={(e) => updateField(s.id, "interest", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-primary">{t.needs}</label>
                <Textarea rows={3} className="mt-1.5" value={entry.needs}
                  onChange={(e) => updateField(s.id, "needs", e.target.value)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
