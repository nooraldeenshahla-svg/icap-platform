"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Paperclip, Loader2, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChipInput } from "@/components/ui/chip-input";
import { useAppStore } from "@/lib/store";
import { newConflictSchema, type NewConflictFormValues } from "@/lib/validators/conflict";
import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { IRAQ_GOVERNORATES, type Attachment, type Conflict } from "@/types/conflict";
import { fileToAttachment } from "@/lib/attachments";
import { saveConflict } from "@/lib/db";
import { WizardStepIndicator } from "@/components/wizard/step-nav";

const COPY = {
  ar: {
    title: "تسجيل نزاع جديد",
    subtitle: "أدخل المعلومات الأساسية عن النزاع. تقدر تكمل بقية الوحدات (أصحاب المصلحة، الخط الزمني...) بعد الحفظ.",
    sections: { general: "معلومات عامة", location: "الموقع الجغرافي", attachments: "المرفقات", classification: "التصنيف" },
    fields: {
      name: "اسم النزاع", governorate: "المحافظة", district: "القضاء", subdistrict: "الناحية",
      village: "القرية / الحي", lat: "خط العرض (GPS)", lng: "خط الطول (GPS)",
      conflictType: "نوع النزاع", researcher: "الباحث", organization: "المنظمة",
      date: "تاريخ التسجيل", description: "الوصف", tags: "الوسوم", keywords: "الكلمات المفتاحية",
    },
    placeholders: {
      tags: "اكتب وسم واضغط Enter", keywords: "اكتب كلمة مفتاحية واضغط Enter",
      selectGovernorate: "اختر المحافظة", selectType: "اختر نوع النزاع",
    },
    upload: "اضغط لرفع صور أو مستندات", uploadedCount: "ملف مرفوع",
    submit: "حفظ النزاع", submitting: "جارٍ الحفظ…",
  },
  en: {
    title: "Register a New Conflict",
    subtitle: "Enter the conflict's core information. You can complete the other modules (stakeholders, timeline...) after saving.",
    sections: { general: "General Information", location: "Location", attachments: "Attachments", classification: "Classification" },
    fields: {
      name: "Conflict Name", governorate: "Governorate", district: "District", subdistrict: "Subdistrict",
      village: "Village / Neighborhood", lat: "Latitude (GPS)", lng: "Longitude (GPS)",
      conflictType: "Conflict Type", researcher: "Researcher", organization: "Organization",
      date: "Date Recorded", description: "Description", tags: "Tags", keywords: "Keywords",
    },
    placeholders: {
      tags: "Type a tag and press Enter", keywords: "Type a keyword and press Enter",
      selectGovernorate: "Select governorate", selectType: "Select conflict type",
    },
    upload: "Click to upload photos or documents", uploadedCount: "file(s) uploaded",
    submit: "Save Conflict", submitting: "Saving…",
  },
};

export default function NewConflictPage() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const router = useRouter();
  const { data: session } = useSession();

  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register, handleSubmit, control, setValue, formState: { errors },
  } = useForm<NewConflictFormValues>({
    resolver: zodResolver(newConflictSchema),
    defaultValues: {
      tags: [], keywords: [],
      date: new Date().toISOString().slice(0, 10),
      researcher: session?.user?.name ?? "",
    },
  });

  React.useEffect(() => {
    if (session?.user?.name) setValue("researcher", session.user.name);
  }, [session?.user?.name, setValue]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const converted = await Promise.all(files.map(fileToAttachment));
    setAttachments((prev) => [...prev, ...converted]);
    e.target.value = "";
  }

  async function onSubmit(values: NewConflictFormValues) {
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const conflict: Conflict = {
        id: crypto.randomUUID(),
        name: values.name,
        location: {
          governorate: values.governorate,
          district: values.district || undefined,
          subdistrict: values.subdistrict || undefined,
          village: values.village || undefined,
          lat: values.lat,
          lng: values.lng,
        },
        conflictType: values.conflictType,
        researcher: values.researcher,
        organization: values.organization,
        date: values.date,
        description: values.description,
        tags: values.tags,
        keywords: values.keywords,
        attachments,
        stakeholders: [],
        timeline: [],
        causes: [],
        effects: [],
        onionModels: [],
        actionPlan: [],
        actionPlan: [],
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      await saveConflict(conflict);
      router.push(`/stakeholders?conflict=${conflict.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-3xl py-10">
        <WizardStepIndicator currentKey="new" />
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          {/* General information */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-medium">{t.sections.general}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">{t.fields.name}</Label>
                <Input id="name" className="mt-1.5" {...register("name")} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="researcher">{t.fields.researcher}</Label>
                <Input id="researcher" className="mt-1.5" {...register("researcher")} />
                {errors.researcher && <p className="mt-1 text-xs text-destructive">{errors.researcher.message}</p>}
              </div>

              <div>
                <Label htmlFor="organization">{t.fields.organization}</Label>
                <Input id="organization" className="mt-1.5" {...register("organization")} />
                {errors.organization && <p className="mt-1 text-xs text-destructive">{errors.organization.message}</p>}
              </div>

              <div>
                <Label htmlFor="date">{t.fields.date}</Label>
                <Input id="date" type="date" className="mt-1.5" {...register("date")} />
                {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor="conflictType">{t.fields.conflictType}</Label>
                <Select id="conflictType" className="mt-1.5" defaultValue="" {...register("conflictType")}>
                  <option value="" disabled>{t.placeholders.selectType}</option>
                  {Object.entries(CONFLICT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{isAr ? label.ar : label.en}</option>
                  ))}
                </Select>
                {errors.conflictType && <p className="mt-1 text-xs text-destructive">{errors.conflictType.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">{t.fields.description}</Label>
                <Textarea id="description" className="mt-1.5" rows={5} {...register("description")} />
                {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-medium">
              <MapPin className="h-5 w-5 text-secondary" />
              {t.sections.location}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="governorate">{t.fields.governorate}</Label>
                <Select id="governorate" className="mt-1.5" defaultValue="" {...register("governorate")}>
                  <option value="" disabled>{t.placeholders.selectGovernorate}</option>
                  {IRAQ_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </Select>
                {errors.governorate && <p className="mt-1 text-xs text-destructive">{errors.governorate.message}</p>}
              </div>

              <div>
                <Label htmlFor="district">{t.fields.district}</Label>
                <Input id="district" className="mt-1.5" {...register("district")} />
              </div>

              <div>
                <Label htmlFor="subdistrict">{t.fields.subdistrict}</Label>
                <Input id="subdistrict" className="mt-1.5" {...register("subdistrict")} />
              </div>

              <div>
                <Label htmlFor="village">{t.fields.village}</Label>
                <Input id="village" className="mt-1.5" {...register("village")} />
              </div>

              <div>
                <Label htmlFor="lat">{t.fields.lat}</Label>
                <Input id="lat" type="number" step="any" className="mt-1.5" {...register("lat")} />
              </div>

              <div>
                <Label htmlFor="lng">{t.fields.lng}</Label>
                <Input id="lng" type="number" step="any" className="mt-1.5" {...register("lng")} />
              </div>
            </div>
          </section>

          {/* Classification: tags & keywords */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-medium">{t.sections.classification}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t.fields.tags}</Label>
                <div className="mt-1.5">
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <ChipInput values={field.value} onChange={field.onChange} placeholder={t.placeholders.tags} />
                    )}
                  />
                </div>
              </div>
              <div>
                <Label>{t.fields.keywords}</Label>
                <div className="mt-1.5">
                  <Controller
                    name="keywords"
                    control={control}
                    render={({ field }) => (
                      <ChipInput values={field.value} onChange={field.onChange} placeholder={t.placeholders.keywords} />
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-medium">{t.sections.attachments}</h2>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary/40 hover:bg-accent/30">
              <Paperclip className="h-5 w-5" />
              {t.upload}
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFiles} />
            </label>
            {attachments.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {attachments.length} {t.uploadedCount}
              </p>
            )}
          </section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? t.submitting : t.submit}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
