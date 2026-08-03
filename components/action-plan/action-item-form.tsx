"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { actionItemSchema, type ActionItemFormValues } from "@/lib/validators/action-item";
import { ACTION_STATUS_LABELS } from "@/lib/constants/action-status-labels";
import type { ActionItem } from "@/types/conflict";

const COPY = {
  ar: {
    title: "إضافة بند لخطة الحل", editTitle: "تعديل البند",
    goal: "الهدف", activity: "النشاط", startDate: "تاريخ البداية", endDate: "تاريخ النهاية",
    responsible: "الجهة المسؤولة (اختياري)", status: "الحالة",
    add: "إضافة البند", save: "حفظ التعديلات", cancel: "إلغاء",
    suggest: "اقترح صياغة أفضل", suggesting: "جارٍ الاقتراح…",
    goalPh: "اكتب الهدف بأسلوبك العادي، وبعدين جرب زر الاقتراح",
    suggestError: "تعذّر توليد اقتراح، حاول مرة أخرى.",
  },
  en: {
    title: "Add Action Plan Item", editTitle: "Edit Item",
    goal: "Goal", activity: "Activity", startDate: "Start Date", endDate: "End Date",
    responsible: "Responsible Party (optional)", status: "Status",
    add: "Add Item", save: "Save Changes", cancel: "Cancel",
    suggest: "Suggest Better Phrasing", suggesting: "Suggesting…",
    goalPh: "Write the goal plainly, then try the suggest button",
    suggestError: "Couldn't generate a suggestion, please try again.",
  },
};

const EMPTY_DEFAULTS: ActionItemFormValues = {
  goal: "", activity: "", startDate: "", endDate: "", responsible: "", status: "planned",
};

export function ActionItemForm({
  onAdd, onUpdate, editing, onCancelEdit,
}: {
  onAdd: (item: ActionItem) => void;
  onUpdate?: (item: ActionItem) => void;
  editing?: ActionItem | null;
  onCancelEdit?: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";

  const [suggesting, setSuggesting] = React.useState(false);
  const [suggestError, setSuggestError] = React.useState(false);

  const { register, handleSubmit, control, reset, getValues, setValue, formState: { errors } } = useForm<ActionItemFormValues>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  React.useEffect(() => {
    if (editing) {
      const { id, conflictId, ...rest } = editing;
      reset(rest);
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [editing, reset]);

  async function handleSuggest() {
    const currentGoal = getValues("goal");
    if (!currentGoal || currentGoal.trim().length < 5) return;
    setSuggesting(true);
    setSuggestError(false);
    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentGoal, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setValue("goal", data.suggestion, { shouldValidate: true });
    } catch {
      setSuggestError(true);
    } finally {
      setSuggesting(false);
    }
  }

  function onSubmit(values: ActionItemFormValues) {
    if (editing) {
      onUpdate?.({ ...editing, ...values });
    } else {
      onAdd({ id: crypto.randomUUID(), conflictId: "", ...values });
      reset(EMPTY_DEFAULTS);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-medium">{editing ? t.editTitle : t.title}</h3>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="goal">{t.goal}</Label>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {suggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {suggesting ? t.suggesting : t.suggest}
          </button>
        </div>
        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <Textarea id="goal" className="mt-1.5" rows={2} placeholder={t.goalPh} {...field} />
          )}
        />
        {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
        {suggestError && <p className="mt-1 text-xs text-destructive">{t.suggestError}</p>}
      </div>

      <div>
        <Label htmlFor="activity">{t.activity}</Label>
        <Textarea id="activity" className="mt-1.5" rows={2} {...register("activity")} />
        {errors.activity && <p className="mt-1 text-xs text-destructive">{errors.activity.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startDate">{t.startDate}</Label>
          <Input id="startDate" type="date" className="mt-1.5" {...register("startDate")} />
          {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="endDate">{t.endDate}</Label>
          <Input id="endDate" type="date" className="mt-1.5" {...register("endDate")} />
          {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="responsible">{t.responsible}</Label>
        <Input id="responsible" className="mt-1.5" {...register("responsible")} />
      </div>

      <div>
        <Label htmlFor="status">{t.status}</Label>
        <Select id="status" className="mt-1.5" {...register("status")}>
          {Object.entries(ACTION_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{isAr ? l.ar : l.en}</option>
          ))}
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editing ? t.save : t.add}
      </Button>
      {editing && (
        <Button type="button" variant="outline" className="w-full" onClick={onCancelEdit}>
          {t.cancel}
        </Button>
      )}
    </form>
  );
}
