"use client";

import * as React from "react";
import { Printer, FileDown, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { ConflictPicker } from "@/components/conflict/conflict-picker";
import { Button } from "@/components/ui/button";
import { ReportPrintView } from "@/components/reports/report-print-view";
import { useAppStore } from "@/lib/store";
import { getAllConflicts } from "@/lib/db";
import { generateConflictDocx } from "@/lib/reports/docx-export";
import type { Conflict } from "@/types/conflict";

const COPY = {
  ar: {
    title: "التقارير", subtitle: "صدّر تقريراً احترافياً عن أي نزاع بصيغة Word أو PDF.",
    exportWord: "تصدير Word (.docx)", exportPdf: "طباعة / حفظ PDF",
    pdfHint: "يفتح نافذة الطباعة — اختر \"حفظ كملف PDF\" كوجهة الطباعة.",
    preview: "معاينة التقرير",
  },
  en: {
    title: "Reports", subtitle: "Export a professional report for any conflict as Word or PDF.",
    exportWord: "Export Word (.docx)", exportPdf: "Print / Save as PDF",
    pdfHint: "Opens the print dialog — choose \"Save as PDF\" as the destination.",
    preview: "Report Preview",
  },
};

export default function ReportsPage() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    getAllConflicts().then((all) => {
      setConflicts(all);
      if (all.length > 0) setSelectedId(all[0]?.id ?? "");
    });
  }, []);

  const conflict = conflicts.find((c) => c.id === selectedId);

  async function handleWordExport() {
    if (!conflict) return;
    setExporting(true);
    try {
      await generateConflictDocx(conflict, locale);
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="no-print">
        <Navbar />
      </div>
      <div className="container py-10">
        <div className="no-print">
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

          <div className="mt-6">
            <ConflictPicker conflicts={conflicts} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          {conflict && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={handleWordExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {t.exportWord}
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                {t.exportPdf}
              </Button>
              <span className="text-xs text-muted-foreground">{t.pdfHint}</span>
            </div>
          )}

          {conflict && <h2 className="mb-3 mt-8 text-sm font-medium text-muted-foreground">{t.preview}</h2>}
        </div>

        {conflict && (
          <div className="rounded-lg border border-border">
            <ReportPrintView conflict={conflict} locale={locale} />
          </div>
        )}
      </div>
    </>
  );
}
