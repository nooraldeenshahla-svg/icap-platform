import { z } from "zod";

export const actionItemStatusValues = ["planned", "in_progress", "completed", "delayed"] as const;

export const actionItemSchema = z.object({
  goal: z.string().min(5, "الهدف مطلوب"),
  activity: z.string().min(5, "وصف النشاط مطلوب"),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  responsible: z.string().optional(),
  status: z.enum(actionItemStatusValues),
});

export type ActionItemFormValues = z.infer<typeof actionItemSchema>;
