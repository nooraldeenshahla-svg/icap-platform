import { z } from "zod";

export const timelineEventSchema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  title: z.string().min(3, "عنوان الحدث مطلوب"),
  description: z.string().min(5, "الوصف مطلوب"),
  escalationLevel: z.coerce.number().min(0).max(10),
  location: z.string().optional(),
  actors: z.array(z.string()).default([]),
});

export type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;
