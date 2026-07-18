"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type {
  EngineTrace,
  QueryUnderstandingSummary,
  RetrievalPlanSummary,
} from "@/lib/ai2/types";

function summarizeStrategies(strategies: string[]): {
  headline: string[];
  rest: string[];
} {
  const priority = [
    "understand:",
    "epistemic",
    "plan:",
    "slot_expand",
    "rrf_fuse",
    "react_recovery",
    "react_skipped",
    "deepen:",
  ];
  const headline: string[] = [];
  const rest: string[] = [];
  for (const s of strategies) {
    if (priority.some((p) => s.startsWith(p) || s.includes(p))) {
      headline.push(s);
    } else {
      rest.push(s);
    }
  }
  return { headline: headline.slice(0, 8), rest: rest.slice(0, 24) };
}

export function RetrievalTrace({
  strategies,
  qualityGatePassed,
  engineTrace,
  understanding,
  retrievalPlan,
}: {
  strategies?: string[];
  qualityGatePassed?: boolean;
  engineTrace?: EngineTrace;
  understanding?: QueryUnderstandingSummary;
  retrievalPlan?: RetrievalPlanSummary;
}) {
  const hasStrategies = Boolean(strategies?.length);
  const hasTrace = Boolean(
    engineTrace?.intent ||
      engineTrace?.plan_type ||
      engineTrace?.epistemic_mode ||
      understanding?.intent ||
      retrievalPlan?.plan_type
  );
  if (!hasStrategies && !hasTrace) {
    return null;
  }

  const { headline, rest } = summarizeStrategies(strategies ?? []);
  const intent = engineTrace?.intent ?? understanding?.intent;
  const planType = engineTrace?.plan_type ?? retrievalPlan?.plan_type;

  return (
    <Collapsible className="rounded-lg border border-dashed border-border/60 px-3 py-2">
      <CollapsibleTrigger className="w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground">
        How we found this
        {qualityGatePassed !== undefined ? (
          <Badge
            className="ml-2"
            variant={qualityGatePassed ? "default" : "outline"}
          >
            {qualityGatePassed ? "quality gate passed" : "partial match"}
          </Badge>
        ) : null}
        {engineTrace?.react_recovery ? (
          <Badge className="ml-2" variant="outline">
            react recovery
          </Badge>
        ) : null}
        {engineTrace?.epistemic_mode &&
        engineTrace.epistemic_mode !== "full_retrieve" ? (
          <Badge className="ml-2" variant="outline">
            epistemic: {engineTrace.epistemic_mode}
          </Badge>
        ) : null}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 pb-1">
        <div className="flex flex-wrap gap-1.5">
          {intent ? (
            <Badge variant="secondary">intent: {intent}</Badge>
          ) : null}
          {planType ? (
            <Badge variant="secondary">plan: {planType}</Badge>
          ) : null}
          {engineTrace?.classifier_source ? (
            <Badge variant="outline">{engineTrace.classifier_source}</Badge>
          ) : null}
          {engineTrace?.deepened ? (
            <Badge variant="outline">deepened</Badge>
          ) : null}
          {engineTrace?.react_recovery === false ? (
            <Badge variant="outline">react skipped</Badge>
          ) : null}
          {engineTrace?.epistemic_mode ? (
            <Badge variant="secondary">
              epistemic: {engineTrace.epistemic_mode}
            </Badge>
          ) : null}
          {engineTrace?.epistemic_escalated ? (
            <Badge variant="outline">epistemic escalated</Badge>
          ) : null}
          {typeof engineTrace?.epistemic_verified_count === "number" &&
          engineTrace.epistemic_verified_count > 0 ? (
            <Badge variant="outline">
              verified {engineTrace.epistemic_verified_count}
            </Badge>
          ) : null}
        </div>
        {headline.length || rest.length ? (
          <div className="flex flex-wrap gap-1.5">
            {[...headline, ...rest].map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
