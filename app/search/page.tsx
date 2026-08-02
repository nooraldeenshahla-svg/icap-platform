"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { getAllConflicts } from "@/lib/db";
import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { IRAQ_GOVERNORATES, type Conflict } from "@/types/conflict";
import { formatDate } from "@/lib/utils";

const COPY = {
  ar: {
    title: "البحث المتقدم", subtitle: "ابحث بالكلمات المفتاحية، أو صفِّ حسب المحافظة ونوع النزاع.",
    keyword: "كلمة مفتاحية (الاسم، الوصف، الوسوم...)", governorate: "المحافظة", type: "نوع النزاع",
    all: "الكل", results: "نتيجة", noResults: "لا توجد نتائج مطابقة.",
  },
  en: {
    title: "Advanced Search", subtitle: "Search by keyword, or filter by governorate and conflict type.",
    keyword: "Keyword (name, description, tags...)", governorate: "Governorate", type: "Conflict Type",
    all: "All", results: "results", noResults: "No matching results.",
  },
};

export default function SearchPage() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [keyword, setKeyword] = React.useState("");
  const [governorate, setGovernorate] = React.useState("");
  const [type, setType] = React.useState("");

  React.useEffect(() => { getAllConflicts().then(setConflicts); }, []);

  const results = conflicts.filter((c) => {
    const kw = keyword.trim().toLowerCase();
    const matchesKeyword = !kw || [c.name, c.description, ...c.tags, ...c.keywords].join(" ").toLowerCase().includes(kw);
    const matchesGov = !governorate || c.location.governorate === governorate;
    const matchesType = !type || c.conflictType === type;
    return matchesKeyword && matchesGov && matchesType;
  });

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" placeholder={t.keyword} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <Select value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
            <option value="">{t.governorate} — {t.all}</option>
            {IRAQ_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t.type} — {t.all}</option>
            {Object.entries(CONFLICT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{isAr ? l.ar : l.en}</option>)}
          </Select>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{results.length} {t.results}</p>

        <div className="mt-3 rounded-lg border border-border bg-card">
          {results.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">{t.noResults}</p>
          ) : (
            results.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 p-4 last:border-0">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.location.governorate} · {isAr ? CONFLICT_TYPE_LABELS[c.conflictType].ar : CONFLICT_TYPE_LABELS[c.conflictType].en} · {formatDate(c.date, locale)}
                    {c.createdByName && <> · {isAr ? "سجّله" : "by"} {c.createdByName}</>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
