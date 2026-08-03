"use client";

import Link from "next/link";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface WizardStep {
  key: string;
  ar: string;
  en: string;
  href: (conflictId: string) => string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { key: "new", ar: "معلومات النزاع", en: "Conflict Info", href: () => "/conflicts/new" },
  { key: "stakeholders", ar: "أصحاب المصلحة", en: "Stakeholders", href: (id) => `/stakeholders?conflict=${id}` },
  { key: "timeline", ar: "الخط الزمني", en: "Timeline", href: (id) => `/timeline?conflict=${id}` },
  { key: "problem-tree", ar: "شجرة المشكلة", en: "Problem Tree", href: (id) => `/problem-tree?conflict=${id}` },
  { key: "onion", ar: "نموذج البصلة", en: "Onion Model", href: (id) => `/analysis?conflict=${id}&model=onion` },
  { key: "abc", ar: "مثلث ABC", en: "ABC Triangle", href: (id) => `/analysis?conflict=${id}&model=abc` },
  { key: "ai", ar: "التحليل بالذكاء الاصطناعي", en: "AI Analysis", href: (id) => `/analysis?conflict=${id}&model=risk` },
  { key: "action-plan", ar: "خطة الحل", en: "Resolution Plan", href: (id) => `/action-plan?conflict=${id}` },
];

const COPY = {
  ar: { next: "الخطوة التالية", skip: "تخطّي", back: "الرجوع", finish: "إنهاء ← لوحة المعلومات" },
  en: { next: "Next Step", skip: "Skip", back: "Back", finish: "Finish → Dashboard" },
};

export function WizardStepIndicator({ currentKey }: { currentKey: string }) {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === currentKey);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {WIZARD_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
              i < currentIndex ? "bg-primary/15 text-primary" :
              i === currentIndex ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            )}
          >
            {i < currentIndex ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
            {isAr ? step.ar : step.en}
          </div>
          {i < WIZARD_STEPS.length - 1 && <div className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

export function WizardNav({
  currentKey, conflictId,
}: {
  currentKey: string;
  conflictId: string;
}) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === currentKey);
  const next = WIZARD_STEPS[currentIndex + 1];
  const prev = WIZARD_STEPS[currentIndex - 1];
  const isLast = currentIndex === WIZARD_STEPS.length - 1;

  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
      <div>
        {prev && (
          <Link href={prev.href(conflictId)} className="text-sm text-muted-foreground hover:text-foreground">
            {t.back}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!isLast && next && (
          <Link href={next.href(conflictId)} className="text-sm text-muted-foreground hover:text-foreground">
            {t.skip}
          </Link>
        )}
        {isLast ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {t.finish}
          </Link>
        ) : next && (
          <Link
            href={next.href(conflictId)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {t.next}
            <Arrow className="h-4 w-4 rtl-flip" />
          </Link>
        )}
      </div>
    </div>
  );
}
