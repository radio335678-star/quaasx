"use client";

import { useEffect, useState } from "react";
import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { cn } from "@/lib/utils";

const AWAKE_FADE_MS = 3000;

export function EngineStatusBar() {
  const { status, wakeCountdown } = useEngineWarmup();
  const [awakeBannerVisible, setAwakeBannerVisible] = useState(false);

  useEffect(() => {
    if (status !== "awake") {
      setAwakeBannerVisible(false);
      return;
    }
    setAwakeBannerVisible(true);
    const timer = setTimeout(() => {
      setAwakeBannerVisible(false);
    }, AWAKE_FADE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "asleep") {
    return null;
  }

  let message: string | null = null;
  let tone: "neutral" | "pulse" | "ready" | "warn" = "neutral";

  if (status === "waking") {
    tone = "pulse";
    message =
      wakeCountdown !== null
        ? `Stretching… opening the texts… ${wakeCountdown}`
        : "Stretching… opening the texts…";
  } else if (status === "awake" && awakeBannerVisible) {
    tone = "ready";
    message = "I'm listening.";
  } else if (status === "degraded") {
    tone = "warn";
    message = "First reply may take a little longer.";
  }

  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-b border-border/40 px-4 py-1.5 text-center text-[11px] leading-none sm:text-xs",
        tone === "ready" && "text-emerald-700 dark:text-emerald-400",
        tone === "pulse" && "text-muted-foreground",
        tone === "warn" && "text-amber-800 dark:text-amber-200"
      )}
      data-testid="engine-status-bar"
      role="status"
    >
      {tone === "ready" ? (
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
      ) : tone === "pulse" ? (
        <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-amber-500/80" />
      ) : null}
      {message}
    </div>
  );
}
