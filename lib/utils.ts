import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, locale: "ar" | "en" = "ar") {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-IQ" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function riskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score < 30) return "low";
  if (score < 55) return "medium";
  if (score < 80) return "high";
  return "critical";
}
