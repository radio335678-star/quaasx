"use client";

import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { cn } from "@/lib/utils";

const COPY: Record<
  ReturnType<typeof useEngineWarmup>["status"],
  string | null
> = {
  degraded: "First answer after idle may take ~15s",
  idle: null,
  ready: "Engine ready",
  warming: "Waking classical engine…",
};

export function EngineStatusBar() {
  const { status } = useEngineWarmup();
  const message = COPY[status];
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-b border-border/40 px-4 py-1.5 text-center text-[11px] leading-none sm:text-xs",
        status === "ready" && "text-emerald-700 dark:text-emerald-400",
        status === "warming" && "text-muted-foreground",
        status === "degraded" && "text-amber-800 dark:text-amber-200"
      )}
      data-testid="engine-status-bar"
      role="status"
    >
      {status === "ready" ? (
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
      ) : status === "warming" ? (
        <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-amber-500/80" />
      ) : null}
      {message}
    </div>
  );
}
