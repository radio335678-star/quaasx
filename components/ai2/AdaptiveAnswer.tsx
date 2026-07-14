"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { Ai2AnswerLayout } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";
import { CompareLayout } from "./CompareLayout";
import { CrossAcharyaBar } from "./CrossAcharyaBar";
import { RetrievalTrace } from "./RetrievalTrace";
import { ShlokaCard } from "./ShlokaCard";

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
    return (
      <div className="space-y-3 py-2" data-testid="adaptive-answer-loading">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!layout?.citations?.length) {
    return null;
  }

  const defaultLang = layout.ui_hints?.default_lang ?? "en";
  const layoutType = layout.layout_type ?? "general";
  const isCompare = layoutType === "clinical_compare";

  const citationCards = isCompare ? (
    <CompareLayout citations={layout.citations} defaultLang={defaultLang} />
  ) : layoutType === "citation_lookup" && layout.citations[0] ? (
    <ShlokaCard
      citation={layout.citations[0]}
      defaultLang={defaultLang}
      hero
    />
  ) : layoutType === "quick_fact" ? (
    <div className="space-y-2">
      {layout.citations.slice(0, 2).map((c) => (
        <ShlokaCard citation={c} defaultLang={defaultLang} key={c.citation_id} />
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {layout.citations.map((c) => (
        <ShlokaCard citation={c} defaultLang={defaultLang} key={c.citation_id} />
      ))}
    </div>
  );

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
      <p className="text-[11px] leading-relaxed text-muted-foreground/80">
        {layout.clinical_caution ??
          "Research disclaimer — verify classical citations before clinical use. Not medical advice."}
      </p>
      {citationCards}
      <CrossAcharyaBar cross={layout.cross_acharya} />
      <RetrievalTrace
        qualityGatePassed={layout.quality_gate_passed}
        strategies={layout.strategies}
      />
    </div>
  );
}
