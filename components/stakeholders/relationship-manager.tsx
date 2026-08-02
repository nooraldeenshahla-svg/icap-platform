"use client";

import * as React from "react";
import { Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/store";
import { RELATIONSHIP_TYPE_LABELS } from "@/lib/constants/stakeholder-labels";
import type { Stakeholder, StakeholderRelationship } from "@/types/conflict";

const COPY = {
  ar: {
    title: "العلاقات بين الأطراف", from: "من", to: "إلى", type: "نوع العلاقة",
    strength: "قوة العلاقة", add: "إضافة علاقة", empty: "لا توجد علاقات مضافة.",
    needTwo: "أضف طرفين على الأقل لتحديد علاقة بينهما.",
  },
  en: {
    title: "Relationships Between Stakeholders", from: "From", to: "To", type: "Relationship Type",
    strength: "Strength", add: "Add Relationship", empty: "No relationships added.",
    needTwo: "Add at least two stakeholders to define a relationship.",
  },
};

export function RelationshipManager({
  stakeholders, onAddRelationship, onRemoveRelationship,
}: {
  stakeholders: Stakeholder[];
  onAddRelationship: (sourceId: string, rel: StakeholderRelationship) => void;
  onRemoveRelationship: (sourceId: string, targetId: string) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";

  const [source, setSource] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [type, setType] = React.useState<StakeholderRelationship["type"]>("neutral");
  const [strength, setStrength] = React.useState(50);

  const allRelationships = stakeholders.flatMap((s) =>
    s.relationships.map((rel) => ({ sourceId: s.id, sourceName: s.name, rel }))
  );

  function handleAdd() {
    if (!source || !target || source === target) return;
    onAddRelationship(source, { targetStakeholderId: target, type, strength });
    setSource(""); setTarget("");
  }

  if (stakeholders.length < 2) {
    return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t.needTwo}</p>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-medium">
        <Link2 className="h-4 w-4 text-secondary" />
        {t.title}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">{t.from}</label>
          <Select className="mt-1" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">—</option>
            {stakeholders.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t.to}</label>
          <Select className="mt-1" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">—</option>
            {stakeholders.filter((s) => s.id !== source).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">{t.type}</label>
        <Select className="mt-1" value={type} onChange={(e) => setType(e.target.value as StakeholderRelationship["type"])}>
          {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{isAr ? l.ar : l.en}</option>
          ))}
        </Select>
      </div>

      <Slider label={t.strength} value={strength} onChange={setStrength} />

      <Button size="sm" onClick={handleAdd} disabled={!source || !target}>{t.add}</Button>

      <div className="space-y-2 border-t border-border pt-3">
        {allRelationships.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t.empty}</p>
        ) : (
          allRelationships.map(({ sourceId, sourceName, rel }) => {
            const targetName = stakeholders.find((s) => s.id === rel.targetStakeholderId)?.name ?? "?";
            return (
              <div key={`${sourceId}-${rel.targetStakeholderId}`} className="flex items-center justify-between text-sm">
                <span>
                  {sourceName} ← {isAr ? RELATIONSHIP_TYPE_LABELS[rel.type]?.ar : RELATIONSHIP_TYPE_LABELS[rel.type]?.en} → {targetName}
                </span>
                <button onClick={() => onRemoveRelationship(sourceId, rel.targetStakeholderId)} aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
