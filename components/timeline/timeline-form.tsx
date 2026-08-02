"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChipInput } from "@/components/ui/chip-input";
import { useAppStore } from "@/lib/store";
import { timelineEventSchema, type TimelineEventFormValues } from "@/lib/validators/timeline";
import type { TimelineEvent } from "@/types/conflict";

const COPY = {
  ar: {
    title: "إضافة حدث جديد", editTitle: "تعديل الحدث", date: "التاريخ", eventTitle: "عنوان الحدث", description: "الوصف",
    escalation: "درجة التصعيد", location: "الموقع", actors: "الأطراف الفاعلة",
    add: "إضافة الحدث", save: "حفظ التعديلات", cancel: "إلغاء", chipPh: "اكتب واضغط Enter",
    escalationHint: "من ٠ (هادئ) إلى ١٠ (تصعيد حاد)",
  },
  en: {
    title: "Add New Event", editTitle: "Edit Event", date: "Date", eventTitle: "Event Title", description: "Description",
    escalation: "Escalation Level", location: "Location", actors: "Actors Involved",
    add: "Add Event", save: "Save Changes", cancel: "Cancel", chipPh: "Type and press Enter",
    escalationHint: "From 0 (calm) to 10 (sharp escalation)",
  },
};

const EMPTY_DEFAULTS: TimelineEventFormValues = {
  escalationLevel: 3, actors: [], date: new Date().toISOString().slice(0, 10),
  title: "", description: "", location: "",
};

export function TimelineForm({
  onAdd, onUpdate, editing, onCancelEdit,
}: {
  onAdd: (e: TimelineEvent) => void;
  onUpdate?: (e: TimelineEvent) => void;
  editing?: TimelineEvent | null;
  onCancelEdit?: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventSchema),
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

  function onSubmit(values: TimelineEventFormValues) {
    if (editing) {
      onUpdate?.({ ...editing, ...values });
    } else {
      const event: TimelineEvent = { id: crypto.randomUUID(), conflictId: "", ...values };
      onAdd(event);
      reset({ ...EMPTY_DEFAULTS, date: values.date });
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
        <Label htmlFor="ev-date">{t.date}</Label>
        <Input id="ev-date" type="date" className="mt-1.5" {...register("date")} />
        {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <div>
        <Label htmlFor="ev-title">{t.eventTitle}</Label>
        <Input id="ev-title" className="mt-1.5" {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="ev-description">{t.description}</Label>
        <Textarea id="ev-description" className="mt-1.5" rows={3} {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="rounded-md bg-muted/50 p-4">
        <Controller name="escalationLevel" control={control} render={({ field }) => (
          <Slider label={t.escalation} value={field.value} onChange={field.onChange} min={0} max={10} hint={t.escalationHint} />
        )} />
      </div>

      <div>
        <Label htmlFor="ev-location">{t.location}</Label>
        <Input id="ev-location" className="mt-1.5" {...register("location")} />
      </div>

      <div>
        <Label>{t.actors}</Label>
        <div className="mt-1.5">
          <Controller name="actors" control={control} render={({ field }) => (
            <ChipInput values={field.value} onChange={field.onChange} placeholder={t.chipPh} />
          )} />
        </div>
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
