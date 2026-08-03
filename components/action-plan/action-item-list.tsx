"use client";

import { Trash2, Pencil, User, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { ACTION_STATUS_LABELS, ACTION_STATUS_COLOR } from "@/lib/constants/action-status-labels";
import type { ActionItem } from "@/types/conflict";

const COPY = {
  ar: { empty: "لا توجد بنود بخطة الحل بعد." },
  en: { empty: "No action plan items yet." },
};

export function ActionItemList({
  items, onRemove, onEdit,
}: {
  items: ActionItem[];
  onRemove: (id: string) => void;
  onEdit: (item: ActionItem) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";

  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{COPY[locale].empty}</p>;
  }

  const sorted = [...items].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="space-y-3">
      {sorted.map((item) => {
        const color = ACTION_STATUS_COLOR[item.status];
        return (
          <div key={item.id} className="rounded-lg border border-border bg-card p-4" style={{ borderInlineStartWidth: 4, borderInlineStartColor: color }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.goal}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.activity}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => onEdit(item)} aria-label="Edit"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => onRemove(item.id)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.startDate, locale)} — {formatDate(item.endDate, locale)}
              </span>
              {item.responsible && (
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.responsible}</span>
              )}
              <span className="rounded-full px-2 py-0.5 font-medium" style={{ backgroundColor: `${color}22`, color }}>
                {isAr ? ACTION_STATUS_LABELS[item.status].ar : ACTION_STATUS_LABELS[item.status].en}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
