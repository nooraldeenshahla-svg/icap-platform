"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChipInput } from "@/components/ui/chip-input";
import { useAppStore } from "@/lib/store";
import { stakeholderSchema, type StakeholderFormValues } from "@/lib/validators/stakeholder";
import { STAKEHOLDER_CATEGORY_LABELS, STAKEHOLDER_POSITION_LABELS } from "@/lib/constants/stakeholder-labels";
import type { Stakeholder } from "@/types/conflict";

const COPY = {
  ar: {
    title: "إضافة طرف جديد", editTitle: "تعديل الطرف", name: "الاسم", type: "نوع الطرف (نص حر)", category: "الفئة",
    position: "الموقف العام", influence: "النفوذ", power: "القوة", interest: "المصلحة",
    support: "درجة الدعم/المعارضة", needs: "الاحتياجات", fears: "المخاوف",
    expectations: "التوقعات", resources: "الموارد المتاحة", notes: "ملاحظات",
    add: "إضافة الطرف", save: "حفظ التعديلات", cancel: "إلغاء", chipPh: "اكتب واضغط Enter",
    supportHint: "من -١٠٠ (معارضة تامة) إلى +١٠٠ (دعم تام)",
  },
  en: {
    title: "Add New Stakeholder", editTitle: "Edit Stakeholder", name: "Name", type: "Type (free text)", category: "Category",
    position: "Overall Position", influence: "Influence", power: "Power", interest: "Interest",
    support: "Support/Opposition Level", needs: "Needs", fears: "Fears",
    expectations: "Expectations", resources: "Available Resources", notes: "Notes",
    add: "Add Stakeholder", save: "Save Changes", cancel: "Cancel", chipPh: "Type and press Enter",
    supportHint: "From -100 (fully opposed) to +100 (fully supportive)",
  },
};

const EMPTY_DEFAULTS: StakeholderFormValues = {
  name: "", type: "", category: "government", position: "neutral",
  influence: 50, power: 50, interest: 50, support: 0,
  needs: [], fears: [], expectations: [], resources: [], notes: "",
};

export function StakeholderForm({
  onAdd, onUpdate, editing, onCancelEdit,
}: {
  onAdd: (s: Stakeholder) => void;
  onUpdate?: (s: Stakeholder) => void;
  editing?: Stakeholder | null;
  onCancelEdit?: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  React.useEffect(() => {
    if (editing) {
      const { id, conflictId, relationships, ...rest } = editing;
      reset(rest);
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [editing, reset]);

  function onSubmit(values: StakeholderFormValues) {
    if (editing) {
      onUpdate?.({ ...editing, ...values });
    } else {
      const stakeholder: Stakeholder = {
        id: crypto.randomUUID(),
        conflictId: "", // set by parent
        relationships: [],
        ...values,
      };
      onAdd(stakeholder);
      reset(EMPTY_DEFAULTS);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-medium">{editing ? t.editTitle : t.title}</h3>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <Label htmlFor="sh-name">{t.name}</Label>
        <Input id="sh-name" className="mt-1.5" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sh-type">{t.type}</Label>
          <Input id="sh-type" className="mt-1.5" {...register("type")} />
        </div>
        <div>
          <Label htmlFor="sh-category">{t.category}</Label>
          <Select id="sh-category" className="mt-1.5" {...register("category")}>
            {Object.entries(STAKEHOLDER_CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{isAr ? l.ar : l.en}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="sh-position">{t.position}</Label>
        <Select id="sh-position" className="mt-1.5" {...register("position")}>
          {Object.entries(STAKEHOLDER_POSITION_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{isAr ? l.ar : l.en}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-4 rounded-md bg-muted/50 p-4">
        <Controller name="influence" control={control} render={({ field }) => (
          <Slider label={t.influence} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="power" control={control} render={({ field }) => (
          <Slider label={t.power} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="interest" control={control} render={({ field }) => (
          <Slider label={t.interest} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="support" control={control} render={({ field }) => (
          <Slider label={t.support} value={field.value} onChange={field.onChange} min={-100} max={100} hint={t.supportHint} />
        )} />
      </div>

      <div>
        <Label>{t.needs}</Label>
        <div className="mt-1.5">
          <Controller name="needs" control={control} render={({ field }) => (
            <ChipInput values={field.value} onChange={field.onChange} placeholder={t.chipPh} />
          )} />
        </div>
      </div>
      <div>
        <Label>{t.fears}</Label>
        <div className="mt-1.5">
          <Controller name="fears" control={control} render={({ field }) => (
            <ChipInput values={field.value} onChange={field.onChange} placeholder={t.chipPh} />
          )} />
        </div>
      </div>
      <div>
        <Label>{t.expectations}</Label>
        <div className="mt-1.5">
          <Controller name="expectations" control={control} render={({ field }) => (
            <ChipInput values={field.value} onChange={field.onChange} placeholder={t.chipPh} />
          )} />
        </div>
      </div>
      <div>
        <Label>{t.resources}</Label>
        <div className="mt-1.5">
          <Controller name="resources" control={control} render={({ field }) => (
            <ChipInput values={field.value} onChange={field.onChange} placeholder={t.chipPh} />
          )} />
        </div>
      </div>

      <div>
        <Label htmlFor="sh-notes">{t.notes}</Label>
        <Textarea id="sh-notes" className="mt-1.5" rows={3} {...register("notes")} />
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
