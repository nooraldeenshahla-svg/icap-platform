import { z } from "zod";

export const conflictTypeValues = [
  "land_dispute",
  "water_resources",
  "tribal",
  "sectarian",
  "political",
  "economic",
  "security",
  "administrative_boundary",
  "returnee_idp",
  "resource_sharing",
  "governance",
  "other",
] as const;

export const newConflictSchema = z.object({
  name: z.string().min(3, "الاسم لازم يكون 3 أحرف على الأقل"),
  governorate: z.string().min(1, "اختر المحافظة"),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  village: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  conflictType: z.enum(conflictTypeValues, { errorMap: () => ({ message: "اختر نوع النزاع" }) }),
  researcher: z.string().min(2, "اسم الباحث مطلوب"),
  organization: z.string().min(2, "اسم المنظمة مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().min(20, "الوصف لازم يكون 20 حرف على الأقل"),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type NewConflictFormValues = z.infer<typeof newConflictSchema>;
