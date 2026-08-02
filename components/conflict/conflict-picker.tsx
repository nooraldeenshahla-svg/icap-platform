"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Conflict } from "@/types/conflict";

const COPY = {
  ar: { label: "النزاع", none: "لا توجد نزاعات بعد", create: "أنشئ نزاعاً جديداً أولاً", select: "اختر نزاعاً" },
  en: { label: "Conflict", none: "No conflicts yet", create: "Create a conflict first", select: "Select a conflict" },
};

export function ConflictPicker({
  conflicts, selectedId, onSelect,
}: {
  conflicts: Conflict[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="h-4 w-4" />
          {t.none}
        </div>
        <Link href="/conflicts/new" className="text-sm font-medium text-primary underline underline-offset-4">
          {t.create}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="whitespace-nowrap text-sm font-medium text-muted-foreground">{t.label}</label>
      <Select value={selectedId} onChange={(e) => onSelect(e.target.value)} className="max-w-sm">
        <option value="" disabled>{t.select}</option>
        {conflicts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
    </div>
  );
}
