"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Ai2Commentary } from "@/lib/ai2/types";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

function CommentaryItem({ entry }: { entry: Ai2Commentary }) {
  const [open, setOpen] = useState(false);
  const hasBody =
    Boolean(entry.text) ||
    Boolean(entry.iast) ||
    Boolean(entry.english) ||
    Boolean(entry.critic_note);

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground/90 transition-colors hover:bg-muted/40",
          !hasBody && "cursor-default"
        )}
        disabled={!hasBody}
        type="button"
      >
        <span className="truncate">{entry.commentator}</span>
        {hasBody ? (
          <ChevronDownIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        ) : null}
      </CollapsibleTrigger>
      {hasBody ? (
        <CollapsibleContent className="space-y-1.5 px-2 pb-2 pt-0.5">
          {entry.text ? (
            <p
              className="font-[family-name:var(--font-noto-devanagari)] text-[13px] leading-relaxed text-foreground/90"
              lang="sa"
            >
              {entry.text}
            </p>
          ) : null}
          {entry.iast ? (
            <p className="text-[12px] italic leading-relaxed text-muted-foreground">
              {entry.iast}
            </p>
          ) : null}
          {entry.english ? (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {entry.english}
            </p>
          ) : null}
          {entry.critic_note ? (
            <p className="border-l border-border/50 pl-2 text-[11px] leading-relaxed text-muted-foreground/80">
              {entry.critic_note}
            </p>
          ) : null}
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}

export function CommentaryPanel({
  commentaries,
  className,
  hideHeader = false,
}: {
  commentaries: Ai2Commentary[];
  className?: string;
  hideHeader?: boolean;
}) {
  if (!commentaries.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-3 rounded-lg border border-border/50 bg-muted/20",
        className
      )}
      data-testid="commentary-panel"
    >
      {hideHeader ? null : (
        <p className="border-b border-border/40 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Commentaries ({commentaries.length})
        </p>
      )}
      <div className="divide-y divide-border/30 py-0.5">
        {commentaries.map((entry) => (
          <CommentaryItem
            entry={entry}
            key={`${entry.commentator}-${entry.text?.slice(0, 24) ?? ""}`}
          />
        ))}
      </div>
    </div>
  );
}
