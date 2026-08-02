"use client";

import { Trash2, MapPin, Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/types/conflict";

const COPY = {
  ar: { empty: "لا توجد أحداث مسجّلة بعد.", level: "مستوى التصعيد" },
  en: { empty: "No events recorded yet.", level: "Escalation level" },
};

function escalationColor(level: number) {
  if (level <= 3) return "#2f7d72";
  if (level <= 6) return "#cc8748";
  return "#b93b2f";
}

export function TimelineView({
  events, onRemove, onEdit,
}: {
  events: TimelineEvent[];
  onRemove: (id: string) => void;
  onEdit: (e: TimelineEvent) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  if (events.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t.empty}</p>;
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="relative">
      <div className="absolute bottom-0 top-0 w-px bg-border ltr:left-[7px] rtl:right-[7px]" />
      <div className="space-y-6">
        {sorted.map((ev) => {
          const color = escalationColor(ev.escalationLevel);
          return (
            <div key={ev.id} className="relative ps-6">
              <span
                className="absolute top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ltr:left-0 rtl:right-0"
                style={{ backgroundColor: color }}
              />
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{formatDate(ev.date, locale)}</div>
                    <h4 className="mt-0.5 font-medium">{ev.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {t.level}: {ev.escalationLevel}/10
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ev)} aria-label="Edit">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(ev.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ev.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {ev.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>
                  )}
                  {ev.actors.length > 0 && (
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ev.actors.join("، ")}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
