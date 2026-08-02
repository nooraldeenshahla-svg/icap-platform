import type { StakeholderCategory, StakeholderPosition } from "@/types/conflict";

export const STAKEHOLDER_CATEGORY_LABELS: Record<StakeholderCategory, { ar: string; en: string }> = {
  government: { ar: "جهة حكومية", en: "Government" },
  tribal: { ar: "عشائري", en: "Tribal" },
  religious: { ar: "ديني", en: "Religious" },
  civil_society: { ar: "منظمة مجتمع مدني", en: "Civil Society" },
  security_force: { ar: "قوة أمنية", en: "Security Force" },
  political_party: { ar: "حزب سياسي", en: "Political Party" },
  private_sector: { ar: "قطاع خاص", en: "Private Sector" },
  international_org: { ar: "منظمة دولية", en: "International Org" },
  community_group: { ar: "مجموعة مجتمعية", en: "Community Group" },
  media: { ar: "إعلام", en: "Media" },
  other: { ar: "أخرى", en: "Other" },
};

export const STAKEHOLDER_POSITION_LABELS: Record<StakeholderPosition, { ar: string; en: string }> = {
  supportive: { ar: "مؤيد", en: "Supportive" },
  neutral: { ar: "محايد", en: "Neutral" },
  opposed: { ar: "معارض", en: "Opposed" },
  mixed: { ar: "مختلط", en: "Mixed" },
};

export const RELATIONSHIP_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  alliance: { ar: "تحالف", en: "Alliance" },
  rivalry: { ar: "خصومة", en: "Rivalry" },
  dependency: { ar: "تبعية", en: "Dependency" },
  neutral: { ar: "محايدة", en: "Neutral" },
  family_tribal: { ar: "عائلية/عشائرية", en: "Family/Tribal" },
};

export const POSITION_COLOR: Record<StakeholderPosition, string> = {
  supportive: "#2f7d72",
  opposed: "#b93b2f",
  neutral: "#8a8a8a",
  mixed: "#cc8748",
};
