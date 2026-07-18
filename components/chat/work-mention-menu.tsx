"use client";

import { BookOpenIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import {
  filterWorks,
  type LibraryWork,
  LIBRARY_WORKS,
} from "@/lib/ai2/works";
import { cn } from "@/lib/utils";

type WorkMentionMenuProps = {
  query: string;
  onSelect: (work: LibraryWork) => void;
  onClose: () => void;
  selectedIndex: number;
  selectedIds: Set<string>;
};

function WorkMentionMenuItem({
  work,
  index,
  onSelect,
  selectedIndex,
  isSelected,
}: {
  work: LibraryWork;
  index: number;
  onSelect: (work: LibraryWork) => void;
  selectedIndex: number;
  isSelected: boolean;
}) {
  const handleClick = useCallback(() => {
    onSelect(work);
  }, [onSelect, work]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    },
    []
  );

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors",
        index === selectedIndex ? "bg-muted/70" : "hover:bg-muted/40",
        isSelected && "opacity-50"
      )}
      data-selected={index === selectedIndex}
      disabled={isSelected}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      type="button"
    >
      <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/60">
        <BookOpenIcon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-foreground">
          @{work.name}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground/50">
          {work.shortGroup}
          {work.dbReady ? " · DB" : " · CORPUS"}
        </span>
      </div>
    </button>
  );
}

export function WorkMentionMenu({
  query,
  onSelect,
  onClose: _onClose,
  selectedIndex,
  selectedIds,
}: WorkMentionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const filtered = filterWorks(query);

  useEffect(() => {
    const selected = menuRef.current?.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border/50 bg-card/95 px-4 py-3 text-[12px] text-muted-foreground shadow-[var(--shadow-float)] backdrop-blur-xl">
        No matching works
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-xl"
      ref={menuRef}
    >
      <div className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
        Scope search · {LIBRARY_WORKS.length} works · max 5
      </div>
      <div className="max-h-64 overflow-y-auto pb-1 no-scrollbar">
        {filtered.map((work, index) => (
          <WorkMentionMenuItem
            index={index}
            isSelected={selectedIds.has(work.id)}
            key={work.id}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            work={work}
          />
        ))}
      </div>
    </div>
  );
}

export function getMentionState(
  value: string,
  cursorPos: number
): { query: string; startIndex: number } | null {
  const before = value.slice(0, cursorPos);
  const match = before.match(/(?:^|\s)@([^\s@]*)$/);
  if (!match) {
    return null;
  }
  const query = match[1] ?? "";
  const startIndex = before.length - query.length - 1;
  return { query, startIndex };
}
