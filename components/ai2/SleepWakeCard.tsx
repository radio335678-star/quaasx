"use client";

import { motion } from "framer-motion";
import { MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type SleepWakeCardProps = {
  className?: string;
  compact?: boolean;
};

export function SleepWakeCard({ className, compact = false }: SleepWakeCardProps) {
  const { status, wake } = useEngineWarmup();

  if (status !== "asleep") {
    return null;
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-muted/30 to-card/50 shadow-[var(--shadow-card)]",
        compact ? "px-4 py-3" : "px-5 py-5 sm:px-6 sm:py-6",
        className
      )}
      data-testid="sleep-wake-card"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-amber-500/5 blur-2xl"
      />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-background/70">
          <MoonIcon className="size-4 text-muted-foreground/70" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {brand.name}
          </p>
          <p
            className={cn(
              "mt-1 font-medium text-foreground",
              compact ? "text-[13px] leading-snug" : "text-base sm:text-lg"
            )}
          >
            I&apos;m resting. Wake me when you have a question.
          </p>
          {!compact ? (
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
              If no one asks, I sleep — wake me to open the texts.
            </p>
          ) : null}
          <Button
            className={cn(
              "touch-manipulation font-semibold",
              compact ? "mt-3 h-9 px-4 text-xs" : "mt-4 h-11 min-h-[44px] px-6 text-sm"
            )}
            data-testid="wake-me-up-button"
            onClick={() => void wake()}
            type="button"
          >
            Wake me up
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
