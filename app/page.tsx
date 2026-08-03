"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Network, GitBranch, Clock, Layers, Triangle, Map as MapIcon,
  FileBarChart, ShieldAlert, BookOpen, ArrowLeft, ArrowRight, Plus, ListChecks,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { TributaryMotif } from "@/components/layout/tributary-motif";
import { useAppStore } from "@/lib/store";
import { getAllConflicts } from "@/lib/db";
import type { Conflict } from "@/types/conflict";

const COPY = {
  ar: {
    kicker: "أول منصة عراقية لتحليل النزاعات مدعومة بالذكاء الاصطناعي",
    title: "افهم النزاع قبل أن يتّسع.",
    subtitle:
      "منصة ICAP تساعد الباحثين والمنظمات على رسم أصحاب المصلحة، وتتبّع الجذور والتأثيرات، وتوليد تحليل استراتيجي قائم على الأدلة — من أول تقرير ميداني إلى توصيات جاهزة لصنّاع القرار.",
    cta1: "ابدأ تحليلاً جديداً",
    cta2: "استكشاف اللوحة الرئيسية",
    stats: [
      { key: "total", label: "نزاعات مسجّلة" },
      { key: "governorates", label: "محافظات مشمولة" },
      { key: "analyzed", label: "تحليلات مكتملة بالذكاء الاصطناعي" },
    ],
    modulesTitle: "أدوات التحليل",
    modulesSubtitle: "كل إطار تحليلي معتمد دولياً، مُعرَّب ومُهيّأ للسياق العراقي.",
  },
  en: {
    kicker: "Iraq's first AI-powered conflict analysis platform",
    title: "Understand the conflict before it widens.",
    subtitle:
      "ICAP helps researchers and organizations map stakeholders, trace root causes and effects, and generate evidence-based strategic analysis — from the first field report to decision-ready recommendations.",
    cta1: "Start a new analysis",
    cta2: "Explore the dashboard",
    stats: [
      { key: "total", label: "Registered conflicts" },
      { key: "governorates", label: "Governorates covered" },
      { key: "analyzed", label: "AI analyses completed" },
    ],
    modulesTitle: "Analysis Tools",
    modulesSubtitle: "Every framework is internationally recognized, localized for the Iraqi context.",
  },
};

const MODULES = [
  { href: "/stakeholders", icon: Network, ar: "أصحاب المصلحة", en: "Stakeholders", ar_d: "شبكة تفاعلية للنفوذ والمصالح والعلاقات", en_d: "Interactive network of influence, interests, and relationships" },
  { href: "/problem-tree", icon: GitBranch, ar: "شجرة المشكلة", en: "Problem Tree", ar_d: "من الجذور إلى المشكلة الأساسية إلى النتائج", en_d: "From root causes to core problem to consequences" },
  { href: "/timeline", icon: Clock, ar: "الخط الزمني", en: "Timeline", ar_d: "تتبّع تصاعد الأحداث لحظة بلحظة", en_d: "Track escalation event by event" },
  { href: "/action-plan", icon: ListChecks, ar: "خطة الحل", en: "Resolution Plan", ar_d: "أهداف ونشاطات بجدول زمني ومسؤوليات واضحة", en_d: "Goals and activities with a timeline and clear ownership" },
  { href: "/analysis?model=onion", icon: Layers, ar: "نموذج البصلة", en: "Onion Model", ar_d: "الموقف، المصلحة، الحاجة لكل طرف", en_d: "Position, interest, and need for every actor" },
  { href: "/analysis?model=abc", icon: Triangle, ar: "مثلث ABC", en: "ABC Triangle", ar_d: "المواقف والسلوكيات والتناقضات", en_d: "Attitudes, behaviors, and contradictions" },
  { href: "/dashboard#map", icon: MapIcon, ar: "خريطة العراق التفاعلية", en: "Iraq Map", ar_d: "تجميع النزاعات جغرافياً مع مرشّحات متقدمة", en_d: "Geo-clustered conflicts with advanced filters" },
  { href: "/reports", icon: FileBarChart, ar: "التقارير", en: "Reports", ar_d: "تصدير احترافي بصيغتي PDF و Word", en_d: "Professional export to PDF and Word" },
  { href: "/analysis?model=risk", icon: ShieldAlert, ar: "تقييم المخاطر", en: "Risk Assessment", ar_d: "مؤشرات إنذار مبكر ودرجات مخاطر مفسَّرة", en_d: "Early-warning indicators and explained risk scores" },
  { href: "/knowledge-base", icon: BookOpen, ar: "قاعدة المعرفة", en: "Knowledge Base", ar_d: "أدلة ومنهجيات وأفضل الممارسات", en_d: "Guides, methodologies, and best practices" },
];

export default function HomePage() {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);

  React.useEffect(() => {
    getAllConflicts().then(setConflicts).catch(() => setConflicts([]));
  }, []);

  const stats = {
    total: conflicts.length,
    governorates: new Set(conflicts.map((c) => c.location?.governorate).filter(Boolean)).size,
    analyzed: conflicts.filter((c) => c.aiAnalysis).length,
  };

  return (
    <>
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/60">
        <TributaryMotif className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {t.kicker}
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              {t.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/conflicts/new"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                {t.cta1}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-muted"
              >
                {t.cta2}
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4"
          >
            {t.stats.map((s) => (
              <div
                key={s.key}
                className="rounded-lg border border-border/70 bg-card/70 px-4 py-5 text-center backdrop-blur"
              >
                <div className="font-display text-3xl font-semibold text-primary">
                  {stats[s.key as keyof typeof stats]}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold">{t.modulesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.modulesSubtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            >
              <Link
                href={m.href}
                className="group flex h-full flex-col gap-3 rounded-lg border border-border/70 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <m.icon className="h-6 w-6 text-secondary transition-colors group-hover:text-primary" />
                <div className="font-display text-lg font-medium">{isAr ? m.ar : m.en}</div>
                <p className="text-sm text-muted-foreground">{isAr ? m.ar_d : m.en_d}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
