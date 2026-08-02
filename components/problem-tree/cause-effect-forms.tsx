"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { causeSchema, effectSchema, type CauseFormValues, type EffectFormValues } from "@/lib/validators/cause-effect";
import { CAUSE_LAYER_LABELS, CAUSE_CATEGORY_LABELS, EFFECT_HORIZON_LABELS, EFFECT_DOMAIN_LABELS } from "@/lib/constants/cause-effect-labels";
import type { Cause, Effect } from "@/types/conflict";

const COPY = {
  ar: {
    causeTitle: "إضافة سبب", causeEditTitle: "تعديل السبب", effectTitle: "إضافة أثر", effectEditTitle: "تعديل الأثر",
    layer: "المستوى", category: "التصنيف", horizon: "المدى الزمني", domain: "المجال",
    description: "الوصف", addCause: "إضافة السبب", addEffect: "إضافة الأثر",
    save: "حفظ التعديلات", cancel: "إلغاء",
  },
  en: {
    causeTitle: "Add a Cause", causeEditTitle: "Edit Cause", effectTitle: "Add an Effect", effectEditTitle: "Edit Effect",
    layer: "Layer", category: "Category", horizon: "Time Horizon", domain: "Domain",
    description: "Description", addCause: "Add Cause", addEffect: "Add Effect",
    save: "Save Changes", cancel: "Cancel",
  },
};

export function CauseForm({
  onAdd, onUpdate, editing, onCancelEdit,
}: {
  onAdd: (c: Cause) => void;
  onUpdate?: (c: Cause) => void;
  editing?: Cause | null;
  onCancelEdit?: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CauseFormValues>({
    resolver: zodResolver(causeSchema),
    defaultValues: { layer: "root", category: "social", description: "" },
  });

  React.useEffect(() => {
    if (editing) {
      const { id, conflictId, ...rest } = editing;
      reset(rest);
    } else {
      reset({ layer: "root", category: "social", description: "" });
    }
  }, [editing, reset]);

  function onSubmit(values: CauseFormValues) {
    if (editing) {
      onUpdate?.({ ...editing, ...values });
    } else {
      onAdd({ id: crypto.randomUUID(), conflictId: "", ...values });
      reset({ layer: values.layer, category: values.category, description: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-medium">{editing ? t.causeEditTitle : t.causeTitle}</h4>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{t.layer}</Label>
          <Select className="mt-1 h-9 text-sm" {...register("layer")}>
            {Object.entries(CAUSE_LAYER_LABELS).map(([v, l]) => <option key={v} value={v}>{isAr ? l.ar : l.en}</option>)}
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t.category}</Label>
          <Select className="mt-1 h-9 text-sm" {...register("category")}>
            {Object.entries(CAUSE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{isAr ? l.ar : l.en}</option>)}
          </Select>
        </div>
      </div>
      <Textarea rows={2} placeholder={t.description} {...register("description")} />
      {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      <Button type="submit" size="sm" variant={editing ? "default" : "outline"} className="w-full">
        {editing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {editing ? t.save : t.addCause}
      </Button>
      {editing && (
        <Button type="button" size="sm" variant="outline" className="w-full" onClick={onCancelEdit}>
          {t.cancel}
        </Button>
      )}
    </form>
  );
}

export function EffectForm({
  onAdd, onUpdate, editing, onCancelEdit,
}: {
  onAdd: (e: Effect) => void;
  onUpdate?: (e: Effect) => void;
  editing?: Effect | null;
  onCancelEdit?: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EffectFormValues>({
    resolver: zodResolver(effectSchema),
    defaultValues: { horizon: "medium_term", domain: "social", description: "" },
  });

  React.useEffect(() => {
    if (editing) {
      const { id, conflictId, ...rest } = editing;
      reset(rest);
    } else {
      reset({ horizon: "medium_term", domain: "social", description: "" });
    }
  }, [editing, reset]);

  function onSubmit(values: EffectFormValues) {
    if (editing) {
      onUpdate?.({ ...editing, ...values });
    } else {
      onAdd({ id: crypto.randomUUID(), conflictId: "", ...values });
      reset({ horizon: values.horizon, domain: values.domain, description: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-medium">{editing ? t.effectEditTitle : t.effectTitle}</h4>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{t.horizon}</Label>
          <Select className="mt-1 h-9 text-sm" {...register("horizon")}>
            {Object.entries(EFFECT_HORIZON_LABELS).map(([v, l]) => <option key={v} value={v}>{isAr ? l.ar : l.en}</option>)}
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t.domain}</Label>
          <Select className="mt-1 h-9 text-sm" {...register("domain")}>
            {Object.entries(EFFECT_DOMAIN_LABELS).map(([v, l]) => <option key={v} value={v}>{isAr ? l.ar : l.en}</option>)}
          </Select>
        </div>
      </div>
      <Textarea rows={2} placeholder={t.description} {...register("description")} />
      {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      <Button type="submit" size="sm" variant={editing ? "default" : "outline"} className="w-full">
        {editing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {editing ? t.save : t.addEffect}
      </Button>
      {editing && (
        <Button type="button" size="sm" variant="outline" className="w-full" onClick={onCancelEdit}>
          {t.cancel}
        </Button>
      )}
    </form>
  );
}
