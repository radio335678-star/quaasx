"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export function RetrievalTrace({
  strategies,
  qualityGatePassed,
}: {
  strategies?: string[];
  qualityGatePassed?: boolean;
}) {
  if (!strategies?.length) {
    return null;
  }

  return (
    <Collapsible className="rounded-lg border border-dashed border-border/60 px-3 py-2">
      <CollapsibleTrigger className="w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground">
        How we found this
        {qualityGatePassed !== undefined ? (
          <Badge className="ml-2" variant={qualityGatePassed ? "default" : "outline"}>
            {qualityGatePassed ? "quality gate passed" : "partial match"}
          </Badge>
        ) : null}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-wrap gap-1.5 pb-1">
        {strategies.map((s) => (
          <Badge key={s} variant="outline">
            {s}
          </Badge>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
