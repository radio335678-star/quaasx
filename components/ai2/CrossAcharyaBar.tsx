"use client";

import { Badge } from "@/components/ui/badge";
import type { CrossAcharya } from "@/lib/ai2/types";

function ChipGroup({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "default" | "secondary" | "outline";
}) {
  if (!items.length) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {items.map((item) => (
        <Badge key={item} variant={variant}>
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function CrossAcharyaBar({ cross }: { cross?: CrossAcharya }) {
  if (!cross) {
    return null;
  }
  const hasAny =
    cross.agree.length || cross.differ.length || cross.silent.length;
  if (!hasAny) {
    return null;
  }

  return (
    <section
      className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3"
      data-testid="cross-acharya-bar"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Cross-Acharya
      </p>
      <div className="flex flex-col gap-2">
        <ChipGroup items={cross.agree} label="Agree" variant="default" />
        <ChipGroup items={cross.differ} label="Differ" variant="secondary" />
        <ChipGroup items={cross.silent} label="Silent" variant="outline" />
      </div>
    </section>
  );
}
