"use client";

import { Trash2, Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  CAUSE_LAYER_LABELS, CAUSE_CATEGORY_LABELS, CAUSE_LAYER_COLOR,
  EFFECT_HORIZON_LABELS, EFFECT_DOMAIN_LABELS,
} from "@/lib/constants/cause-effect-labels";
import type { Cause, Effect, CauseLayer, EffectHorizon } from "@/types/conflict";

const causeLayerOrder: CauseLayer[] = ["root", "indirect", "direct"];
const effectHorizonOrder: EffectHorizon[] = ["immediate", "medium_term", "long_term"];

export function CauseList({
  causes, onRemove, onEdit,
}: {
  causes: Cause[];
  onRemove: (id: string) => void;
  onEdit: (c: Cause) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";

  if (causes.length === 0) return null;

  return (
    <div className="space-y-4">
      {causeLayerOrder.map((layer) => {
        const items = causes.filter((c) => c.layer === layer);
        if (items.length === 0) return null;
        return (
          <div key={layer}>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: CAUSE_LAYER_COLOR[layer] }}>
              {isAr ? CAUSE_LAYER_LABELS[layer].ar : CAUSE_LAYER_LABELS[layer].en}
            </h5>
            <div className="space-y-2">
              {items.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2 rounded-md border border-border bg-card p-3">
                  <div>
                    <span className="text-xs text-muted-foreground">{isAr ? CAUSE_CATEGORY_LABELS[c.category].ar : CAUSE_CATEGORY_LABELS[c.category].en}</span>
                    <p className="text-sm">{c.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => onEdit(c)} aria-label="Edit"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => onRemove(c.id)} aria-label="Remove"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EffectList({
  effects, onRemove, onEdit,
}: {
  effects: Effect[];
  onRemove: (id: string) => void;
  onEdit: (e: Effect) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";

  if (effects.length === 0) return null;

  return (
    <div className="space-y-4">
      {effectHorizonOrder.map((horizon) => {
        const items = effects.filter((e) => e.horizon === horizon);
        if (items.length === 0) return null;
        return (
          <div key={horizon}>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
              {isAr ? EFFECT_HORIZON_LABELS[horizon].ar : EFFECT_HORIZON_LABELS[horizon].en}
            </h5>
            <div className="space-y-2">
              {items.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 rounded-md border border-border bg-card p-3">
                  <div>
                    <span className="text-xs text-muted-foreground">{isAr ? EFFECT_DOMAIN_LABELS[e.domain].ar : EFFECT_DOMAIN_LABELS[e.domain].en}</span>
                    <p className="text-sm">{e.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => onEdit(e)} aria-label="Edit"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => onRemove(e.id)} aria-label="Remove"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
