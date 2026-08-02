import type { ConflictType } from "@/types/conflict";

export const CONFLICT_TYPE_LABELS: Record<ConflictType, { ar: string; en: string }> = {
  land_dispute: { ar: "نزاع أراضٍ", en: "Land Dispute" },
  water_resources: { ar: "موارد مائية", en: "Water Resources" },
  tribal: { ar: "عشائري", en: "Tribal" },
  sectarian: { ar: "طائفي", en: "Sectarian" },
  political: { ar: "سياسي", en: "Political" },
  economic: { ar: "اقتصادي", en: "Economic" },
  security: { ar: "أمني", en: "Security" },
  administrative_boundary: { ar: "حدود إدارية", en: "Administrative Boundary" },
  returnee_idp: { ar: "نازحون وعائدون", en: "Returnees / IDPs" },
  resource_sharing: { ar: "تقاسم الموارد", en: "Resource Sharing" },
  governance: { ar: "حوكمة", en: "Governance" },
  other: { ar: "أخرى", en: "Other" },
};
