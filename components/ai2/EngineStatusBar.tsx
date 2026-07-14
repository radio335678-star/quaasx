"use client";

import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { cn } from "@/lib/utils";

const COPY: Record<
  ReturnType<typeof useEngineWarmup>["status"],
  string | null
> = {
  idle: null,
  warming: "Waking classical engine…",
  ready: "Engine ready",
  degraded: "First answer after idle may take ~15s",
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
        "flex min-h-[44px] items-center justify-center border-b border-border/40 px-4 py-2 text-center text-xs",
        status === "ready" && "text-emerald-700 dark:text-emerald-400",
        status === "warming" && "text-muted-foreground",
        status === "degraded" && "text-amber-800 dark:text-amber-200"
      )}
      data-testid="engine-status-bar"
      role="status"
    >
      {status === "ready" ? (
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
      ) : null}
      {message}
    </div>
  );
}
