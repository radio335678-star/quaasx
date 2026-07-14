"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { Ai2AnswerLayout } from "@/lib/ai2/types";
import { CompareLayout } from "./CompareLayout";
import { CrossAcharyaBar } from "./CrossAcharyaBar";
import { RetrievalTrace } from "./RetrievalTrace";
import { ShlokaCard } from "./ShlokaCard";

export function AdaptiveAnswer({
  layout,
  isLoading,
}: {
  layout?: Ai2AnswerLayout;
  isLoading?: boolean;
}) {
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

  const citationCards =
    layoutType === "clinical_compare" ? (
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
    <div className="mt-3 space-y-3" data-testid="adaptive-answer">
      {layout.headline ? (
        <p className="text-sm font-medium text-muted-foreground">{layout.headline}</p>
      ) : null}
      {citationCards}
      <CrossAcharyaBar cross={layout.cross_acharya} />
      <RetrievalTrace
        qualityGatePassed={layout.quality_gate_passed}
        strategies={layout.strategies}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {layout.clinical_caution ??
          "Research disclaimer — verify classical citations before clinical use. Not medical advice."}
      </p>
    </div>
  );
}
