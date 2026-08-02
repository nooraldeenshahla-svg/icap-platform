import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { Conflict } from "@/types/conflict";
import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { STAKEHOLDER_CATEGORY_LABELS, STAKEHOLDER_POSITION_LABELS } from "@/lib/constants/stakeholder-labels";
import { CAUSE_LAYER_LABELS, EFFECT_HORIZON_LABELS } from "@/lib/constants/cause-effect-labels";

const FONT = "Arial";
const TEAL = "22635C";
const DARK = "173533";
const LIGHT_BG = "F4F1EA";

function P(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 160 },
    children: [new TextRun({ text, font: FONT, bold: !!opts.bold, size: opts.size ?? 22, color: opts.color ?? "1A1A1A" })],
  });
}

function H(text: string) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 180 },
    border: { bottom: { color: TEAL, space: 4, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text, font: FONT, bold: true, color: TEAL, size: 30 })],
  });
}

function Bullet(text: string) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 80 },
    children: [new TextRun({ text: `• ${text}`, font: FONT, size: 21 })],
  });
}

function cell(text: string, opts: { width?: number; shading?: string; bold?: boolean; color?: string } = {}) {
  return new TableCell({
    width: { size: opts.width ?? 25, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined,
    margins: { top: 90, bottom: 90, left: 90, right: 90 },
    children: [new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text, font: FONT, size: 18, bold: !!opts.bold, color: opts.color ?? "1A1A1A" })],
    })],
  });
}

function headerRow(cells: string[]) {
  return new TableRow({ tableHeader: true, children: cells.map((t) => cell(t, { bold: true, shading: DARK, color: "FFFFFF" })) });
}

export async function generateConflictDocx(conflict: Conflict, locale: "ar" | "en" = "ar") {
  const isAr = locale === "ar";
  const children: Paragraph[] | (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 60 }, bidirectional: true,
      children: [new TextRun({ text: conflict.name, font: FONT, bold: true, size: 40, color: TEAL })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 260 }, bidirectional: true,
      children: [new TextRun({
        text: `${conflict.location.governorate}${conflict.location.district ? " — " + conflict.location.district : ""} · ${new Date(conflict.date).toLocaleDateString(isAr ? "ar-IQ" : "en-US")}`,
        font: FONT, italics: true, size: 20, color: "555555",
      })],
    })
  );

  children.push(H(isAr ? "معلومات عامة" : "General Information"));
  children.push(P(`${isAr ? "الباحث" : "Researcher"}: ${conflict.researcher}`));
  children.push(P(`${isAr ? "المنظمة" : "Organization"}: ${conflict.organization}`));
  children.push(P(`${isAr ? "نوع النزاع" : "Type"}: ${isAr ? CONFLICT_TYPE_LABELS[conflict.conflictType].ar : CONFLICT_TYPE_LABELS[conflict.conflictType].en}`));
  children.push(P(conflict.description));

  if (conflict.stakeholders.length > 0) {
    children.push(H(isAr ? "أصحاب المصلحة" : "Stakeholders"));
    const rows = conflict.stakeholders.map((s, i) => new TableRow({
      children: [
        cell(s.name, { width: 22, shading: i % 2 ? LIGHT_BG : "FFFFFF" }),
        cell(isAr ? STAKEHOLDER_CATEGORY_LABELS[s.category].ar : STAKEHOLDER_CATEGORY_LABELS[s.category].en, { width: 18, shading: i % 2 ? LIGHT_BG : "FFFFFF" }),
        cell(isAr ? STAKEHOLDER_POSITION_LABELS[s.position].ar : STAKEHOLDER_POSITION_LABELS[s.position].en, { width: 15, shading: i % 2 ? LIGHT_BG : "FFFFFF" }),
        cell(String(s.influence), { width: 15, shading: i % 2 ? LIGHT_BG : "FFFFFF" }),
        cell(s.needs.join("، "), { width: 30, shading: i % 2 ? LIGHT_BG : "FFFFFF" }),
      ],
    }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow([isAr ? "الطرف" : "Party", isAr ? "الفئة" : "Category", isAr ? "الموقف" : "Position", isAr ? "النفوذ" : "Influence", isAr ? "الاحتياجات" : "Needs"]), ...rows],
    }) as unknown as Paragraph);
  }

  if (conflict.timeline.length > 0) {
    children.push(H(isAr ? "التسلسل الزمني" : "Timeline"));
    [...conflict.timeline].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => {
      children.push(Bullet(`${new Date(e.date).toLocaleDateString(isAr ? "ar-IQ" : "en-US")} — ${e.title}: ${e.description}`));
    });
  }

  if (conflict.causes.length > 0) {
    children.push(H(isAr ? "الأسباب" : "Causes"));
    (["root", "indirect", "direct"] as const).forEach((layer) => {
      const items = conflict.causes.filter((c) => c.layer === layer);
      if (items.length === 0) return;
      children.push(P(isAr ? CAUSE_LAYER_LABELS[layer].ar : CAUSE_LAYER_LABELS[layer].en, { bold: true }));
      items.forEach((c) => children.push(Bullet(c.description)));
    });
  }

  if (conflict.effects.length > 0) {
    children.push(H(isAr ? "الآثار" : "Effects"));
    (["immediate", "medium_term", "long_term"] as const).forEach((horizon) => {
      const items = conflict.effects.filter((e) => e.horizon === horizon);
      if (items.length === 0) return;
      children.push(P(isAr ? EFFECT_HORIZON_LABELS[horizon].ar : EFFECT_HORIZON_LABELS[horizon].en, { bold: true }));
      items.forEach((e) => children.push(Bullet(e.description)));
    });
  }

  if (conflict.abcTriangle) {
    children.push(H(isAr ? "مثلث ABC" : "ABC Triangle"));
    children.push(P(isAr ? "التصورات (Attitudes)" : "Attitudes", { bold: true }));
    conflict.abcTriangle.attitudes.forEach((a) => children.push(Bullet(a)));
    children.push(P(isAr ? "السلوكيات (Behaviors)" : "Behaviors", { bold: true }));
    conflict.abcTriangle.behaviors.forEach((b) => children.push(Bullet(b)));
    children.push(P(isAr ? "التناقضات (Contradictions)" : "Contradictions", { bold: true }));
    conflict.abcTriangle.contradictions.forEach((c) => children.push(Bullet(c)));
  }

  if (conflict.aiAnalysis) {
    const a = conflict.aiAnalysis;
    children.push(H(isAr ? "التحليل بالذكاء الاصطناعي" : "AI Analysis"));
    children.push(P(a.summary?.executiveSummary ?? ""));

    if (a.riskAssessment) {
      children.push(P(isAr ? "تقييم المخاطر" : "Risk Assessment", { bold: true }));
      Object.entries(a.riskAssessment).forEach(([key, score]) => {
        children.push(Bullet(`${key}: ${score.value}/100 — ${score.explanation}`));
      });
    }
    if (a.recommendations?.length) {
      children.push(P(isAr ? "التوصيات" : "Recommendations", { bold: true }));
      a.recommendations.forEach((r) => children.push(Bullet(`${r.title} (${r.priority}): ${r.description}`)));
    }
    if (a.scenarios?.length) {
      children.push(P(isAr ? "السيناريوهات" : "Scenarios", { bold: true }));
      a.scenarios.forEach((s) => children.push(Bullet(`${s.title} (${s.probability}%): ${s.narrative}`)));
    }
  }

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children: children as (Paragraph | Table)[],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${conflict.name.replace(/[^\w\u0600-\u06FF]+/g, "_")}.docx`);
}
