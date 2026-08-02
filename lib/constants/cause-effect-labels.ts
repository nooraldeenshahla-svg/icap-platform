import type { CauseCategory, CauseLayer, EffectHorizon, EffectDomain } from "@/types/conflict";

export const CAUSE_LAYER_LABELS: Record<CauseLayer, { ar: string; en: string }> = {
  direct: { ar: "سبب مباشر", en: "Direct Cause" },
  indirect: { ar: "سبب غير مباشر", en: "Indirect Cause" },
  root: { ar: "سبب جذري", en: "Root Cause" },
};

export const CAUSE_CATEGORY_LABELS: Record<CauseCategory, { ar: string; en: string }> = {
  political: { ar: "سياسي", en: "Political" },
  economic: { ar: "اقتصادي", en: "Economic" },
  security: { ar: "أمني", en: "Security" },
  legal: { ar: "قانوني", en: "Legal" },
  environmental: { ar: "بيئي", en: "Environmental" },
  historical: { ar: "تاريخي", en: "Historical" },
  social: { ar: "اجتماعي", en: "Social" },
  religious: { ar: "ديني", en: "Religious" },
  administrative: { ar: "إداري", en: "Administrative" },
};

export const EFFECT_HORIZON_LABELS: Record<EffectHorizon, { ar: string; en: string }> = {
  immediate: { ar: "فوري", en: "Immediate" },
  medium_term: { ar: "متوسط المدى", en: "Medium Term" },
  long_term: { ar: "طويل المدى", en: "Long Term" },
};

export const EFFECT_DOMAIN_LABELS: Record<EffectDomain, { ar: string; en: string }> = {
  humanitarian: { ar: "إنساني", en: "Humanitarian" },
  political: { ar: "سياسي", en: "Political" },
  economic: { ar: "اقتصادي", en: "Economic" },
  security: { ar: "أمني", en: "Security" },
  social: { ar: "اجتماعي", en: "Social" },
  environmental: { ar: "بيئي", en: "Environmental" },
};

export const CAUSE_LAYER_COLOR: Record<CauseLayer, string> = {
  direct: "#cc8748",
  indirect: "#b96e34",
  root: "#22635c",
};
