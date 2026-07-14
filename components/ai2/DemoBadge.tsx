"use client";

import type { DemoKind } from "@/lib/ai2/demos";
import { cn } from "@/lib/utils";

export function DemoBadge({
  kind,
  className,
}: {
  kind: DemoKind;
  className?: string;
}) {
  const label = kind === "hero" ? "Demo" : "Example";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        kind === "hero"
          ? "border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200"
          : "border border-border/60 bg-muted/40 text-muted-foreground",
        className
      )}
      data-testid={`demo-badge-${kind}`}
    >
      {label}
    </span>
  );
}

export function DemoAnswerLabel({ kind }: { kind: DemoKind }) {
  return (
    <p className="mb-1 text-[11px] text-muted-foreground/80">
      {kind === "hero" ? "Answer to demo query" : "Answer to example query"}
    </p>
  );
}
