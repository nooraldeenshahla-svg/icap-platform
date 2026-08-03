import type { ActionItemStatus } from "@/types/conflict";

export const ACTION_STATUS_LABELS: Record<ActionItemStatus, { ar: string; en: string }> = {
  planned: { ar: "لم يبدأ", en: "Planned" },
  in_progress: { ar: "قيد التنفيذ", en: "In Progress" },
  completed: { ar: "منجز", en: "Completed" },
  delayed: { ar: "متأخر", en: "Delayed" },
};

export const ACTION_STATUS_COLOR: Record<ActionItemStatus, string> = {
  planned: "#8a8a8a",
  in_progress: "#cc8748",
  completed: "#2f7d72",
  delayed: "#b93b2f",
};
