"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ai2AnswerLayout } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";
import { ClinicalSafetyBanner } from "./ClinicalSafetyBanner";
import { CompareLayout } from "./CompareLayout";
import { CrossAcharyaBar } from "./CrossAcharyaBar";
import { ExamModePanel } from "./ExamModePanel";
import { RetrievalTrace } from "./RetrievalTrace";
import { SampraptiMap } from "./SampraptiMap";
import { ScopedWorksBar } from "./ScopedWorksBar";
import { ShlokaCard } from "./ShlokaCard";
import { TreatmentPlanPanel } from "./TreatmentPlanPanel";

function tantrayuktiText(
  value: Ai2AnswerLayout["tantrayukti"]
): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim() || null;
  }
  const parts = [
    value.name || value.yukti,
    value.note || value.text || value.description,
  ].filter(Boolean);
  const text = parts.join(" — ").trim();
  return text || null;
}

export function AdaptiveAnswer({
  layout,
  isLoading,
  preferCompareSkeleton,
}: {
  layout?: Ai2AnswerLayout;
  isLoading?: boolean;
  preferCompareSkeleton?: boolean;
}) {
  const showCompareSkeleton =
    isLoading &&
    !layout?.citations?.length &&
    (preferCompareSkeleton || layout?.layout_type === "clinical_compare");

  if (showCompareSkeleton) {
    return (
      <div
        className="w-full space-y-3 py-1"
        data-testid="adaptive-answer-loading"
      >
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !layout?.citations?.length) {
    const nidanaSkeleton = layout?.layout_type === "nidana";
    return (
      <div className="space-y-3 py-2" data-testid="adaptive-answer-loading">
        <Skeleton className="h-4 w-2/3" />
        {nidanaSkeleton ? (
          <div className="space-y-2 rounded-xl border border-border/40 px-3 py-3">
            <Skeleton className="h-3 w-20" />
            <div className="relative space-y-3 pl-6">
              <div className="absolute top-1 bottom-1 left-2 w-px bg-border/40" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-4/5 rounded-lg" />
              <Skeleton className="h-8 w-3/4 rounded-lg" />
            </div>
          </div>
        ) : null}
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!layout) {
    return null;
  }

  const citations = layout.citations ?? [];
  const yuktiNote = tantrayuktiText(layout.tantrayukti);
  const hasSamprapti = Boolean(layout.samprapti_map?.stages?.length);
  const hasExam =
    layout.layout_type === "mcq_exam" ||
    Boolean(layout.exam) ||
    Boolean(layout.exam_verdict) ||
    layout.query_understanding?.intent?.startsWith("exam_") ||
    layout.engine_trace?.intent?.startsWith("exam_") ||
    Boolean(layout.direct_answer && /\([A-D]\)/i.test(layout.direct_answer));
  const hasSafety = Boolean(layout.safety_banner);
  const hasTreatment = Boolean(layout.treatment_plan?.stages?.length);
  const hasScopedWorks = Boolean(layout.scoped_works?.length);
  const hasExtras =
    hasSamprapti ||
    Boolean(yuktiNote) ||
    hasExam ||
    hasSafety ||
    hasTreatment ||
    hasScopedWorks;

  if (!citations.length && !hasExtras) {
    return null;
  }

  const defaultLang = layout.ui_hints?.default_lang ?? "en";
  const layoutType = layout.layout_type ?? "general";
  const isCompare = layoutType === "clinical_compare";
  const patientMode =
    layout.audience_mode === "patient" ||
    layout.ui_hints?.audience === "patient";

  let citationCards: ReactNode = null;
  if (citations.length > 0) {
    if (isCompare) {
      citationCards = (
        <CompareLayout
          citations={citations}
          defaultLang={defaultLang}
          patientMode={patientMode}
        />
      );
    } else if (layoutType === "citation_lookup" && citations[0]) {
      citationCards = (
        <ShlokaCard
          citation={citations[0]}
          defaultLang={defaultLang}
          hero
          patientMode={patientMode}
        />
      );
    } else if (layoutType === "quick_fact") {
      citationCards = (
        <div className="space-y-2">
          {citations.slice(0, 2).map((c) => (
            <ShlokaCard
              citation={c}
              defaultLang={defaultLang}
              key={c.citation_id}
              patientMode={patientMode}
            />
          ))}
        </div>
      );
    } else {
      citationCards = (
        <div className="space-y-3">
          {citations.map((c) => (
            <ShlokaCard
              citation={c}
              defaultLang={defaultLang}
              key={c.citation_id}
              patientMode={patientMode}
            />
          ))}
        </div>
      );
    }
  }

  return (
    <div
      className={cn(
        "mt-3 space-y-3",
        isCompare && "w-full max-w-none"
      )}
      data-testid="adaptive-answer"
    >
      {layout.headline ? (
        <p className="text-sm font-medium text-muted-foreground">
          {layout.headline}
        </p>
      ) : null}
      {layout.scoped_works?.length ? (
        <ScopedWorksBar variant="answer" works={layout.scoped_works} />
      ) : null}
      <p className="text-[11px] leading-relaxed text-muted-foreground/80">
        {layout.clinical_caution ??
          "Research disclaimer — verify classical citations before clinical use. Not medical advice."}
      </p>
      {layout.safety_banner ? (
        <ClinicalSafetyBanner banner={layout.safety_banner} />
      ) : null}
      {layout.treatment_plan ? (
        <TreatmentPlanPanel treatment_plan={layout.treatment_plan} />
      ) : null}
      <ExamModePanel layout={layout} />
      {layout.samprapti_map ? (
        <SampraptiMap map={layout.samprapti_map} />
      ) : null}
      {yuktiNote ? (
        <div
          className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
          data-testid="tantrayukti-note"
        >
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Tantrayukti
          </p>
          <p className="text-[12px] leading-relaxed text-foreground/90">
            {yuktiNote}
          </p>
        </div>
      ) : null}
      {citationCards}
      <CrossAcharyaBar cross={layout.cross_acharya} />
      <RetrievalTrace
        engineTrace={layout.engine_trace}
        qualityGatePassed={layout.quality_gate_passed}
        retrievalPlan={layout.retrieval_plan}
        strategies={layout.strategies}
        understanding={layout.query_understanding}
      />
    </div>
  );
}
