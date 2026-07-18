"use client";

import type { AudienceMode } from "@/lib/ai2/audience-mode";
import { cn } from "@/lib/utils";

export type { AudienceMode };

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
    value: "clinician",
    label: "Clinician",
    title: "Clinical practice focus — chikitsa, formulations, and bedside application",
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
      className="flex h-7 max-w-full items-center overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-0.5"
      data-testid="audience-mode-toggle"
      role="group"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            aria-pressed={selected}
            className={cn(
              "shrink-0 rounded-md px-1.5 py-1 text-[10px] font-medium tracking-tight transition-colors sm:px-2 sm:text-[11px]",
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
