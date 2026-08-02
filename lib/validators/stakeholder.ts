import { z } from "zod";

export const stakeholderCategoryValues = [
  "government", "tribal", "religious", "civil_society", "security_force",
  "political_party", "private_sector", "international_org", "community_group",
  "media", "other",
] as const;

export const stakeholderPositionValues = ["supportive", "neutral", "opposed", "mixed"] as const;

export const stakeholderSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  type: z.string().min(1, "نوع الطرف مطلوب"),
  category: z.enum(stakeholderCategoryValues),
  influence: z.coerce.number().min(0).max(100),
  power: z.coerce.number().min(0).max(100),
  interest: z.coerce.number().min(0).max(100),
  support: z.coerce.number().min(-100).max(100),
  position: z.enum(stakeholderPositionValues),
  needs: z.array(z.string()).default([]),
  fears: z.array(z.string()).default([]),
  expectations: z.array(z.string()).default([]),
  resources: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type StakeholderFormValues = z.infer<typeof stakeholderSchema>;
