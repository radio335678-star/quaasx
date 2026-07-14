"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Ai2Citation } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";

type LangMode = "en" | "hi" | "both";

function trustVariant(trust: string) {
  if (trust === "gold") {
    return "default" as const;
  }
  if (trust.includes("working")) {
    return "secondary" as const;
  }
  return "outline" as const;
}

export function ShlokaCard({
  citation,
  defaultLang = "en",
  hero = false,
  compact = false,
}: {
  citation: Ai2Citation;
  defaultLang?: "en" | "hi";
  hero?: boolean;
  compact?: boolean;
}) {
  const [lang, setLang] = useState<LangMode>(
    defaultLang === "hi" ? "hi" : "en"
  );
  const isMobile = useIsMobile();

  const pad = citation.padaccheda ?? [];

  return (
    <article
      className={cn(
        "rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-background",
        compact ? "p-3.5" : "p-4",
        hero && "ring-1 ring-primary/20"
      )}
      data-testid={`shloka-card-${citation.citation_id}`}
    >
      <header className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold tracking-wide text-primary">
            {citation.citation_id}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {citation.source}
            {citation.sthana ? ` · ${citation.sthana}` : ""}
          </p>
        </div>
        <Badge variant={trustVariant(citation.trust)}>{citation.trust}</Badge>
      </header>

      {citation.devanagari ? (
        <p
          className={cn(
            "mb-2.5 font-serif leading-relaxed text-foreground",
            hero ? "text-xl" : compact ? "text-base" : "text-lg"
          )}
          lang="sa"
        >
          {citation.devanagari}
        </p>
      ) : null}

      {citation.iast ? (
        <p className="mb-2.5 text-[13px] italic leading-relaxed text-muted-foreground">
          {citation.iast}
        </p>
      ) : null}

      <div className="mb-2.5 flex gap-1">
        {(["en", "hi", "both"] as LangMode[]).map((mode) => (
          <Button
            className="h-7 px-2 text-xs"
            key={mode}
            onClick={() => setLang(mode)}
            size="sm"
            type="button"
            variant={lang === mode ? "default" : "ghost"}
          >
            {mode === "en" ? "English" : mode === "hi" ? "हिन्दी" : "Both"}
          </Button>
        ))}
      </div>

      {(lang === "en" || lang === "both") && citation.english ? (
        <p className="mb-2 text-[13px] leading-relaxed">{citation.english}</p>
      ) : null}

      {(lang === "hi" || lang === "both") && citation.hindi ? (
        <p className="mb-2 text-[13px] leading-relaxed" lang="hi">
          {citation.hindi}
        </p>
      ) : null}

      {citation.verse_meaning ? (
        <p className="mt-2 border-t border-border/40 pt-2 text-[13px] text-muted-foreground">
          {citation.verse_meaning}
        </p>
      ) : null}

      {pad.length > 0 ? (
        <Collapsible className="mt-3" defaultOpen={!isMobile && !compact}>
          <CollapsibleTrigger className="text-xs font-medium text-primary hover:underline">
            Padaccheda ({pad.length} words)
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {pad.map((entry) => (
              <div
                className="flex flex-wrap gap-x-2 text-xs"
                key={`${entry.word}-${entry.gloss_en}`}
              >
                <span className="font-medium" lang="sa">
                  {entry.word}
                </span>
                <span className="text-muted-foreground">{entry.gloss_en}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </article>
  );
}
