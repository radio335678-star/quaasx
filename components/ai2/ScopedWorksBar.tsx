"use client";

import { BookOpenIcon } from "lucide-react";
import type { ScopedWorkEntry } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";

type ScopedWorksBarProps = {
  works: ScopedWorkEntry[];
  className?: string;
  variant?: "answer" | "user";
};

export function ScopedWorksBar({
  works,
  className,
  variant = "answer",
}: ScopedWorksBarProps) {
  if (!works.length) {
    return null;
  }

  const label = variant === "user" ? "Scoped to" : "Searched";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        variant === "answer"
          ? "rounded-xl border border-border/35 bg-muted/25 px-3 py-2"
          : "justify-end",
        className
      )}
      data-testid="scoped-works-bar"
    >
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/55">
        {label}
      </span>
      {works.map((work) => (
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
            variant === "answer"
              ? "border-border/40 bg-background/60 text-foreground/85"
              : "border-border/30 bg-secondary/80 text-foreground/80"
          )}
          key={work.name}
          title={
            work.short_group
              ? `${work.short_group} · ${work.tier === "db" ? "DB+FTS" : "CORPUS"}`
              : work.tier === "db"
                ? "DB+FTS"
                : "CORPUS"
          }
        >
          <BookOpenIcon className="size-3 shrink-0 text-muted-foreground/50" />
          <span className="truncate">{work.name}</span>
          <span
            className={cn(
              "rounded px-1 text-[9px] font-medium uppercase tracking-wide",
              work.tier === "db"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            )}
          >
            {work.tier === "db" ? "DB" : "CORPUS"}
          </span>
        </span>
      ))}
    </div>
  );
}
