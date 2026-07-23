"use client";

import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { cn } from "@/lib/utils";

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

type EngineStatusBarProps = {
  /** AI SDK chat status from the active chat */
  chatStatus?: ChatStatus;
};

type DotPhase = "listening" | "thinking" | "streaming" | "degraded";

function resolvePhase(
  chatStatus: ChatStatus | undefined,
  waitingPhase: string | undefined,
  warmup: "ready" | "degraded"
): DotPhase {
  if (warmup === "degraded" && chatStatus !== "streaming" && chatStatus !== "submitted") {
    return "degraded";
  }
  if (chatStatus === "streaming") {
    return "streaming";
  }
  if (
    chatStatus === "submitted" ||
    waitingPhase === "waiting" ||
    waitingPhase === "thinking" ||
    waitingPhase === "still-waiting" ||
    waitingPhase === "health"
  ) {
    return "thinking";
  }
  return "listening";
}

/**
 * Floating emerald status dot — no bar, no copy, no reserved layout row.
 * Patterns: slow pulse (listening) · sequential blink (thinking) · fast breathe (streaming).
 */
export function EngineStatusBar({ chatStatus = "ready" }: EngineStatusBarProps) {
  const { status: warmup } = useEngineWarmup();
  const { waitingStatus } = useDataStream();
  const phase = resolvePhase(chatStatus, waitingStatus?.phase, warmup);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center"
      data-phase={phase}
      data-testid="engine-status-dot"
      role="status"
    >
      <span
        className={cn(
          "size-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.55)]",
          phase === "degraded" &&
            "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)] animate-status-listen",
          phase === "listening" && "bg-emerald-500 animate-status-listen",
          phase === "thinking" && "bg-emerald-500 animate-status-think",
          phase === "streaming" && "bg-emerald-400 animate-status-stream"
        )}
      />
      <span className="sr-only">
        {phase === "listening"
          ? "Ready"
          : phase === "thinking"
            ? "Thinking"
            : phase === "streaming"
              ? "Responding"
              : "Connecting"}
      </span>
    </div>
  );
}
