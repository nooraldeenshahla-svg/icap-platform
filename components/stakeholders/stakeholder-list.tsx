"use client";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { STAKEHOLDER_CATEGORY_LABELS, STAKEHOLDER_POSITION_LABELS, POSITION_COLOR } from "@/lib/constants/stakeholder-labels";
import type { Stakeholder } from "@/types/conflict";

const COPY = {
  ar: { empty: "لا يوجد أطراف مضافون بعد.", influence: "النفوذ", power: "القوة" },
  en: { empty: "No stakeholders added yet.", influence: "Influence", power: "Power" },
};

export function StakeholderList({
  stakeholders, onRemove, onEdit,
}: {
  stakeholders: Stakeholder[];
  onRemove: (id: string) => void;
  onEdit: (s: Stakeholder) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";

  if (stakeholders.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t.empty}</p>;
  }

  return (
    <div className="space-y-3">
      {stakeholders.map((s) => (
        <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{s.name}</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${POSITION_COLOR[s.position]}22`, color: POSITION_COLOR[s.position] }}
              >
                {isAr ? STAKEHOLDER_POSITION_LABELS[s.position].ar : STAKEHOLDER_POSITION_LABELS[s.position].en}
              </span>
              <span className="text-xs text-muted-foreground">
                {isAr ? STAKEHOLDER_CATEGORY_LABELS[s.category].ar : STAKEHOLDER_CATEGORY_LABELS[s.category].en}
              </span>
            </div>
            {s.type && <p className="mt-0.5 text-xs text-muted-foreground">{s.type}</p>}
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{t.influence}: {s.influence}</span>
              <span>{t.power}: {s.power}</span>
            </div>
            {s.needs.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {s.needs.join(" · ")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(s)} aria-label="Edit">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onRemove(s.id)} aria-label="Remove">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
