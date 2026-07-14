"use client";

import type { SampraptiMapData } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

function stageLabel(stage: { label?: string; name?: string }, index: number) {
  return stage.label || stage.name || `Stage ${index + 1}`;
}

export function SampraptiMap({
  map,
  className,
}: {
  map: SampraptiMapData;
  className?: string;
}) {
  const stages = map.stages ?? [];
  const [expanded, setExpanded] = useState<number | null>(null);

  if (stages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/15 px-3 py-4",
        className
      )}
      data-testid="samprapti-map"
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Samprapti
      </p>
      <ol className="relative m-0 list-none space-y-0 p-0">
        {/* vertical connector */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-[11px] w-0.5"
          preserveAspectRatio="none"
        >
          <title>Stage connector</title>
          <line
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
            x1="1"
            x2="1"
            y1="0"
            y2="100%"
          />
        </svg>

        {stages.map((stage, index) => {
          const ids = stage.citation_ids ?? [];
          const isOpen = expanded === index;
          const label = stageLabel(stage, index);

          return (
            <li className="relative pl-8" key={`${label}-${index}`}>
              <span
                aria-hidden="true"
                className="absolute top-2.5 left-1.5 size-2.5 rounded-full border-2 border-foreground/40 bg-background"
              />
              <button
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/40",
                  isOpen && "bg-muted/30"
                )}
                onClick={() => setExpanded(isOpen ? null : index)}
                type="button"
              >
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {ids.length}
                </span>
              </button>
              {isOpen && ids.length > 0 ? (
                <ul className="mb-2 ml-2 space-y-1 border-l border-border/40 pl-3">
                  {ids.map((id) => (
                    <li
                      className="font-mono text-[11px] text-muted-foreground"
                      key={id}
                    >
                      {id}
                    </li>
                  ))}
                </ul>
              ) : null}
              {isOpen && ids.length === 0 ? (
                <p className="mb-2 ml-2 text-[11px] text-muted-foreground/70">
                  No citation ids for this stage.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
