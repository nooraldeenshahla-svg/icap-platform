"use client";

import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { STAKEHOLDER_CATEGORY_LABELS, STAKEHOLDER_POSITION_LABELS } from "@/lib/constants/stakeholder-labels";
import { CAUSE_LAYER_LABELS, EFFECT_HORIZON_LABELS } from "@/lib/constants/cause-effect-labels";
import { formatDate } from "@/lib/utils";
import type { Conflict } from "@/types/conflict";

export function ReportPrintView({ conflict, locale }: { conflict: Conflict; locale: "ar" | "en" }) {
  const isAr = locale === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="print-page mx-auto max-w-3xl bg-white p-8 text-[#1a1a1a]" style={{ fontFamily: isAr ? "'Noto Kufi Arabic', sans-serif" : "Inter, sans-serif" }}>
      <h1 className="text-center text-3xl font-bold text-[#22635c]">{conflict.name}</h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        {conflict.location.governorate} {conflict.location.district ? `— ${conflict.location.district}` : ""} · {formatDate(conflict.date, locale)}
      </p>

      <Section title={isAr ? "معلومات عامة" : "General Information"}>
        <p><b>{isAr ? "الباحث" : "Researcher"}:</b> {conflict.researcher}</p>
        <p><b>{isAr ? "المنظمة" : "Organization"}:</b> {conflict.organization}</p>
        <p><b>{isAr ? "نوع النزاع" : "Type"}:</b> {isAr ? CONFLICT_TYPE_LABELS[conflict.conflictType].ar : CONFLICT_TYPE_LABELS[conflict.conflictType].en}</p>
        <p className="mt-2">{conflict.description}</p>
      </Section>

      {conflict.stakeholders.length > 0 && (
        <Section title={isAr ? "أصحاب المصلحة" : "Stakeholders"}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#173533] text-white">
                <Th>{isAr ? "الطرف" : "Party"}</Th>
                <Th>{isAr ? "الفئة" : "Category"}</Th>
                <Th>{isAr ? "الموقف" : "Position"}</Th>
                <Th>{isAr ? "النفوذ" : "Influence"}</Th>
              </tr>
            </thead>
            <tbody>
              {conflict.stakeholders.map((s, i) => (
                <tr key={s.id} className={i % 2 ? "bg-[#f4f1ea]" : ""}>
                  <Td>{s.name}</Td>
                  <Td>{isAr ? STAKEHOLDER_CATEGORY_LABELS[s.category].ar : STAKEHOLDER_CATEGORY_LABELS[s.category].en}</Td>
                  <Td>{isAr ? STAKEHOLDER_POSITION_LABELS[s.position].ar : STAKEHOLDER_POSITION_LABELS[s.position].en}</Td>
                  <Td>{s.influence}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {conflict.timeline.length > 0 && (
        <Section title={isAr ? "التسلسل الزمني" : "Timeline"}>
          <ul className="list-disc space-y-1 ps-5">
            {[...conflict.timeline].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
              <li key={e.id}><b>{formatDate(e.date, locale)}</b> — {e.title}: {e.description}</li>
            ))}
          </ul>
        </Section>
      )}

      {conflict.causes.length > 0 && (
        <Section title={isAr ? "الأسباب" : "Causes"}>
          {(["root", "indirect", "direct"] as const).map((layer) => {
            const items = conflict.causes.filter((c) => c.layer === layer);
            if (items.length === 0) return null;
            return (
              <div key={layer} className="mb-2">
                <p className="font-semibold text-[#22635c]">{isAr ? CAUSE_LAYER_LABELS[layer].ar : CAUSE_LAYER_LABELS[layer].en}</p>
                <ul className="list-disc space-y-1 ps-5">
                  {items.map((c) => <li key={c.id}>{c.description}</li>)}
                </ul>
              </div>
            );
          })}
        </Section>
      )}

      {conflict.effects.length > 0 && (
        <Section title={isAr ? "الآثار" : "Effects"}>
          {(["immediate", "medium_term", "long_term"] as const).map((horizon) => {
            const items = conflict.effects.filter((e) => e.horizon === horizon);
            if (items.length === 0) return null;
            return (
              <div key={horizon} className="mb-2">
                <p className="font-semibold text-[#b96e34]">{isAr ? EFFECT_HORIZON_LABELS[horizon].ar : EFFECT_HORIZON_LABELS[horizon].en}</p>
                <ul className="list-disc space-y-1 ps-5">
                  {items.map((e) => <li key={e.id}>{e.description}</li>)}
                </ul>
              </div>
            );
          })}
        </Section>
      )}

      {conflict.aiAnalysis && (
        <Section title={isAr ? "التحليل بالذكاء الاصطناعي" : "AI Analysis"}>
          <p>{conflict.aiAnalysis.summary?.executiveSummary}</p>
          {conflict.aiAnalysis.riskAssessment && (
            <table className="mt-3 w-full border-collapse text-sm">
              <tbody>
                {Object.entries(conflict.aiAnalysis.riskAssessment).map(([key, score]) => (
                  <tr key={key} className="border-b border-gray-200">
                    <Td><b>{key}</b></Td>
                    <Td>{score.value}/100</Td>
                    <Td>{score.explanation}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 break-inside-avoid">
      <h2 className="border-b-2 border-[#22635c] pb-1 text-lg font-bold text-[#22635c]">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="border border-gray-300 p-2 text-start">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="border border-gray-300 p-2 align-top">{children}</td>;
}
