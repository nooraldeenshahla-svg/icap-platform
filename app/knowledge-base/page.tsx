"use client";

import * as React from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CONTENT = {
  ar: {
    title: "قاعدة المعرفة",
    subtitle: "أدلة منهجية، مصطلحات، وأفضل الممارسات في تحليل النزاعات وبناء السلام.",
    sections: [
      {
        title: "دليل تحليل النزاعات",
        body: "يعتمد تحليل النزاع على خطوات متسلسلة: تحديد أصحاب المصلحة ومواقفهم، رسم التسلسل الزمني للتصعيد، فهم المصالح والاحتياجات عبر نموذج البصلة، تحديد الأسباب الجذرية والآثار عبر شجرة المشكلة، وأخيراً تحليل التصورات والسلوكيات والتناقضات عبر مثلث ABC. هذا التسلسل يبني صورة شاملة قبل الانتقال إلى التوصيات.",
      },
      {
        title: "أساليب حل النزاعات",
        body: "تشمل الأساليب الشائعة: الوساطة (طرف ثالث محايد يسهّل الحوار دون فرض حل)، التفاوض المباشر بين الأطراف، التحكيم (طرف ثالث يصدر قراراً ملزماً)، والمصالحة المجتمعية التي تعتمد غالباً على الأعراف العشائرية والدينية المحلية في السياق العراقي.",
      },
      {
        title: "موارد بناء السلام",
        body: "تشمل برامج إعادة الإدماج للنازحين والعائدين، آليات العدالة الانتقالية، برامج الحوار المجتمعي بين الفئات المتنازعة، ومبادرات التمكين الاقتصادي التي تقلل التنافس على الموارد الشحيحة كأحد الدوافع الجذرية للنزاعات المحلية.",
      },
      {
        title: "أفضل الممارسات",
        body: "التوثيق الدقيق والمحايد للوقائع، إشراك جميع الأطراف المتضررة (بمن فيهم النساء والشباب والفئات المهمّشة) في عملية التحليل، تجنّب اللغة المنحازة، والتحقق من المعلومات من مصادر متعددة قبل البناء عليها في التوصيات.",
      },
    ],
    glossaryTitle: "المسرد",
    glossary: [
      { term: "نموذج البصلة", def: "أداة تحليلية تفصل بين ما يطالب به الطرف علناً (الموقف)، ولماذا يريده (المصلحة)، وما يحتاجه فعلياً (الحاجة الأساسية)." },
      { term: "شجرة المشكلة", def: "أداة بصرية تربط الأسباب الجذرية بمشكلة مركزية وبالآثار المترتبة عليها، على هيئة جذور وجذع وأغصان." },
      { term: "مثلث ABC", def: "إطار يحلل النزاع عبر ثلاثة أبعاد: التصورات (Attitudes)، السلوكيات (Behaviors)، والتناقضات الهيكلية (Contradictions)." },
      { term: "أصحاب المصلحة", def: "كل فرد أو جهة لها مصلحة أو تأثير أو تتأثر بمسار النزاع، سواء كانت طرفاً مباشراً أو وسيطاً أو مراقباً." },
      { term: "مؤشرات الإنذار المبكر", def: "علامات قابلة للرصد تشير إلى احتمال تصاعد النزاع، تُستخدم لتوجيه التدخل الوقائي قبل وقوع التصعيد." },
    ],
  },
  en: {
    title: "Knowledge Base",
    subtitle: "Methodology guides, terminology, and best practices in conflict analysis and peacebuilding.",
    sections: [
      {
        title: "Conflict Analysis Guide",
        body: "Conflict analysis follows a sequence: identify stakeholders and their positions, map the escalation timeline, understand interests and needs through the onion model, identify root causes and effects through the problem tree, and finally analyze attitudes, behaviors, and contradictions through the ABC triangle.",
      },
      {
        title: "Conflict Resolution Methods",
        body: "Common approaches include mediation (a neutral third party facilitates dialogue without imposing a solution), direct negotiation, arbitration (a third party issues a binding decision), and community reconciliation, which in the Iraqi context often relies on tribal and religious customs.",
      },
      {
        title: "Peacebuilding Resources",
        body: "These include reintegration programs for IDPs and returnees, transitional justice mechanisms, community dialogue programs between conflicting groups, and economic empowerment initiatives that reduce competition over scarce resources.",
      },
      {
        title: "Best Practices",
        body: "Accurate, neutral documentation of facts; involving all affected parties (including women, youth, and marginalized groups) in the analysis process; avoiding biased language; and verifying information from multiple sources before building recommendations on it.",
      },
    ],
    glossaryTitle: "Glossary",
    glossary: [
      { term: "Onion Model", def: "An analytical tool separating what a party publicly demands (position), why they want it (interest), and what they actually need (basic need)." },
      { term: "Problem Tree", def: "A visual tool linking root causes to a central problem and its consequences, shaped as roots, trunk, and branches." },
      { term: "ABC Triangle", def: "A framework analyzing conflict across three dimensions: Attitudes, Behaviors, and structural Contradictions." },
      { term: "Stakeholders", def: "Any individual or entity with an interest in, influence over, or that is affected by the conflict's trajectory." },
      { term: "Early Warning Indicators", def: "Observable signs suggesting a conflict may escalate, used to guide preventive intervention." },
    ],
  },
};

export default function KnowledgeBasePage() {
  const locale = useAppStore((s) => s.locale);
  const c = CONTENT[locale];
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <>
      <Navbar />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-semibold">{c.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>

        <div className="mt-8 space-y-3">
          {c.sections.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-4 text-start"
              >
                <span className="flex items-center gap-2 font-display font-medium">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  {s.title}
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>}
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-10 font-display text-xl font-medium">{c.glossaryTitle}</h2>
        <div className="space-y-3">
          {c.glossary.map((g) => (
            <div key={g.term} className="rounded-lg border border-border bg-card p-4">
              <div className="font-medium text-primary">{g.term}</div>
              <p className="mt-1 text-sm text-muted-foreground">{g.def}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
