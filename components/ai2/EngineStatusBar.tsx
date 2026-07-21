"use client";

import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { cn } from "@/lib/utils";

export function EngineStatusBar() {
  const { status } = useEngineWarmup();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-b border-border/40 px-4 py-1.5 text-center text-[11px] leading-none text-emerald-700 dark:text-emerald-400 sm:text-xs"
      )}
      data-testid="engine-status-bar"
      role="status"
    >
      <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
      I&apos;m listening.
      {status === "degraded" ? (
        <span className="ml-2 text-amber-800/90 dark:text-amber-200/90">
          (connecting…)
        </span>
      ) : null}
    </div>
  );
}
