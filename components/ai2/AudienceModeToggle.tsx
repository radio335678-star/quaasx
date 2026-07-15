"use client";

import { cn } from "@/lib/utils";

export type AudienceMode = "patient" | "scholar";

const OPTIONS: {
  value: AudienceMode;
  label: string;
  title: string;
}[] = [
  {
    value: "patient",
    label: "Patient",
    title: "Plain-language answers with clinical safety emphasis",
  },
  {
    value: "scholar",
    label: "Scholar",
    title: "Full classical depth — padaccheda, commentaries, and citation detail",
  },
];

export function AudienceModeToggle({
  value,
  onChange,
}: {
  value: AudienceMode;
  onChange: (mode: AudienceMode) => void;
}) {
  return (
    <div
      aria-label="Audience mode"
      className="flex h-7 items-center rounded-lg border border-border/50 bg-muted/30 p-0.5"
      data-testid="audience-mode-toggle"
      role="group"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            aria-pressed={selected}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium tracking-tight transition-colors",
              selected
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.title}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
