"use client";

import { BookOpenIcon, XIcon } from "lucide-react";
import {
  LIBRARY_WORKS,
  MAX_SCOPED_WORKS,
  type LibraryWork,
} from "@/lib/ai2/works";

type WorkScopeChipsProps = {
  selectedWorks: LibraryWork[];
  onRemove: (work: LibraryWork) => void;
};

export function WorkScopeChips({
  selectedWorks,
  onRemove,
}: WorkScopeChipsProps) {
  if (selectedWorks.length === 0) {
    return null;
  }

  return (
    <div
      className="flex w-full flex-wrap gap-1.5 px-3 pt-3"
      data-testid="work-scope-chips"
    >
      {selectedWorks.map((work) => (
        <span
          className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2 py-0.5 text-[11px] text-foreground/80"
          key={work.id}
        >
          <BookOpenIcon className="size-3 shrink-0 text-muted-foreground/50" />
          <span className="truncate">@{work.name}</span>
          <button
            aria-label={`Remove ${work.name}`}
            className="rounded p-0.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground"
            onClick={() => onRemove(work)}
            type="button"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export { LIBRARY_WORKS, MAX_SCOPED_WORKS, type LibraryWork };
