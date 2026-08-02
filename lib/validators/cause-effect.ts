import { z } from "zod";

export const causeLayerValues = ["direct", "indirect", "root"] as const;
export const causeCategoryValues = [
  "political", "economic", "security", "legal", "environmental",
  "historical", "social", "religious", "administrative",
] as const;

export const causeSchema = z.object({
  layer: z.enum(causeLayerValues),
  category: z.enum(causeCategoryValues),
  description: z.string().min(5, "الوصف مطلوب"),
});
export type CauseFormValues = z.infer<typeof causeSchema>;

export const effectHorizonValues = ["immediate", "medium_term", "long_term"] as const;
export const effectDomainValues = ["humanitarian", "political", "economic", "security", "social", "environmental"] as const;

export const effectSchema = z.object({
  horizon: z.enum(effectHorizonValues),
  domain: z.enum(effectDomainValues),
  description: z.string().min(5, "الوصف مطلوب"),
});
export type EffectFormValues = z.infer<typeof effectSchema>;
