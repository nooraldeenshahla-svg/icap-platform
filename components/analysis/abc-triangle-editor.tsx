"use client";

import { Brain, Activity, Layers3 } from "lucide-react";
import { ChipInput } from "@/components/ui/chip-input";
import { useAppStore } from "@/lib/store";
import type { ABCTriangle } from "@/types/conflict";

const COPY = {
  ar: {
    attitudes: "التصورات والمعتقدات (Attitudes)", attitudesHint: "التصورات، المشاعر، المعتقدات لدى كل طرف",
    behaviors: "الأفعال والسلوكيات (Behaviors)", behaviorsHint: "الأفعال، التصريحات، السلوك الملحوظ",
    contradictions: "التناقضات (Contradictions)", contradictionsHint: "التناقض الهيكلي بين أهداف الأطراف",
    chipPh: "اكتب واضغط Enter",
  },
  en: {
    attitudes: "Attitudes", attitudesHint: "Perceptions, feelings, and beliefs of each party",
    behaviors: "Behaviors", behaviorsHint: "Actions, statements, and observable conduct",
    contradictions: "Contradictions", contradictionsHint: "The underlying structural incompatibility of goals",
    chipPh: "Type and press Enter",
  },
};

export function ABCTriangleEditor({
  value, onChange,
}: {
  value: ABCTriangle;
  onChange: (v: ABCTriangle) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 font-display text-sm font-medium text-primary">
          <Brain className="h-4 w-4" /> {t.attitudes}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">{t.attitudesHint}</p>
        <div className="mt-3">
          <ChipInput values={value.attitudes} onChange={(v) => onChange({ ...value, attitudes: v })} placeholder={t.chipPh} />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 font-display text-sm font-medium text-secondary">
          <Activity className="h-4 w-4" /> {t.behaviors}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">{t.behaviorsHint}</p>
        <div className="mt-3">
          <ChipInput values={value.behaviors} onChange={(v) => onChange({ ...value, behaviors: v })} placeholder={t.chipPh} />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 font-display text-sm font-medium text-destructive">
          <Layers3 className="h-4 w-4" /> {t.contradictions}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">{t.contradictionsHint}</p>
        <div className="mt-3">
          <ChipInput values={value.contradictions} onChange={(v) => onChange({ ...value, contradictions: v })} placeholder={t.chipPh} />
        </div>
      </div>
    </div>
  );
}
