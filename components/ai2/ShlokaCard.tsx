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
import { CheckIcon, CopyIcon } from "lucide-react";
import { CommentaryPanel } from "./CommentaryPanel";

type LangMode = "en" | "hi" | "both";

function normalizeTrust(trust: string) {
  return trust.trim().toLowerCase().replaceAll("_", " ");
}

function trustLabel(trust: string) {
  const n = normalizeTrust(trust);
  if (n === "inferred synthesis") {
    return "Inferred Synthesis";
  }
  return trust;
}

function trustVariant(trust: string) {
  const n = normalizeTrust(trust);
  if (n === "gold") {
    return "default" as const;
  }
  if (n === "inferred synthesis") {
    return "secondary" as const;
  }
  if (n.includes("working") || n.includes("machine")) {
    return "secondary" as const;
  }
  return "outline" as const;
}

function trustBadgeClass(trust: string) {
  if (normalizeTrust(trust) === "inferred synthesis") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-200";
  }
  return undefined;
}

function formatCitationRef(citation: Ai2Citation): string {
  const { source, sthana, chapter_num: chapterNum, citation_id: id } = citation;
  if (source && sthana && chapterNum != null) {
    const verseMatch = id.match(/\.(\d+)\s*$/);
    const verse = verseMatch?.[1];
    if (verse) {
      return `${source}, ${sthana} ${chapterNum}.${verse}`;
    }
    return `${source}, ${sthana} ${chapterNum}`;
  }
  return id;
}

export function ShlokaCard({
  citation,
  defaultLang = "en",
  hero = false,
  compact = false,
  patientMode = false,
}: {
  citation: Ai2Citation;
  defaultLang?: "en" | "hi";
  hero?: boolean;
  compact?: boolean;
  patientMode?: boolean;
}) {
  const [lang, setLang] = useState<LangMode>(
    patientMode ? "en" : defaultLang === "hi" ? "hi" : "en"
  );
  const [copied, setCopied] = useState(false);
  const [commentariesOpen, setCommentariesOpen] = useState(!patientMode);
  const isMobile = useIsMobile();

  if (normalizeTrust(citation.trust) === "hallucinated") {
    return null;
  }

  const pad = citation.padaccheda ?? [];
  const commentaries = citation.commentaries ?? [];
  const padacchedaDefaultOpen =
    !patientMode && !isMobile && !compact;

  const copyCitation = async () => {
    const text = formatCitationRef(citation);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable
    }
  };

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
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            aria-label="Copy citation"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={copyCitation}
            size="sm"
            type="button"
            variant="ghost"
          >
            {copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Badge
            className={trustBadgeClass(citation.trust)}
            variant={trustVariant(citation.trust)}
          >
            {trustLabel(citation.trust)}
          </Badge>
        </div>
      </header>

      {citation.devanagari ? (
        <p
          className={cn(
            "mb-2.5 font-[family-name:var(--font-noto-devanagari)] leading-relaxed text-foreground",
            patientMode && (hero ? "text-lg" : "text-base"),
            !patientMode && (hero ? "text-xl" : compact ? "text-base" : "text-lg")
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

      {citation.critic_note ? (
        <p className="mt-2 border-l border-border/50 pl-2 text-[11px] leading-relaxed text-muted-foreground/80">
          {citation.critic_note}
        </p>
      ) : null}

      {pad.length > 0 ? (
        <Collapsible className="mt-3" defaultOpen={padacchedaDefaultOpen}>
          <CollapsibleTrigger className="text-xs font-medium text-primary hover:underline">
            Padaccheda ({pad.length} words)
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {pad.map((entry) => (
              <div
                className="flex flex-wrap gap-x-2 text-xs"
                key={`${entry.word}-${entry.gloss_en}`}
              >
                <span
                  className="font-medium font-[family-name:var(--font-noto-devanagari)]"
                  lang="sa"
                >
                  {entry.word}
                </span>
                <span className="text-muted-foreground">{entry.gloss_en}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {commentaries.length > 0 ? (
        patientMode ? (
          <Collapsible
            className="mt-3"
            onOpenChange={setCommentariesOpen}
            open={commentariesOpen}
          >
            <CollapsibleTrigger className="text-xs font-medium text-primary hover:underline">
              Commentaries ({commentaries.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CommentaryPanel commentaries={commentaries} hideHeader />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <CommentaryPanel commentaries={commentaries} />
        )
      ) : null}
    </article>
  );
}
