"use client";

import { BookOpenIcon, CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  filterWorks,
  LIBRARY_WORKS,
  MAX_SCOPED_WORKS,
  type LibraryWork,
} from "@/lib/ai2/works";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type WorkPickerPopoverProps = {
  selectedWorks: LibraryWork[];
  onToggleWork: (work: LibraryWork) => void;
  disabled?: boolean;
};

/** Work scoping UI is locked for now — + stays visible but does not open. */
const WORK_PICKER_LOCKED = true;

export function WorkPickerPopover({
  selectedWorks,
  onToggleWork,
  disabled,
}: WorkPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedIds = useMemo(
    () => new Set(selectedWorks.map((w) => w.id)),
    [selectedWorks]
  );
  const filtered = useMemo(() => filterWorks(search), [search]);
  const locked = WORK_PICKER_LOCKED || Boolean(disabled);

  const handleSelect = useCallback(
    (work: LibraryWork) => {
      if (selectedIds.has(work.id)) {
        onToggleWork(work);
        return;
      }
      if (selectedWorks.length >= MAX_SCOPED_WORKS) {
        toast.error(`Maximum ${MAX_SCOPED_WORKS} works per query`);
        return;
      }
      onToggleWork(work);
    },
    [onToggleWork, selectedIds, selectedWorks.length]
  );

  return (
    <Popover
      onOpenChange={(next) => {
        if (locked) {
          setOpen(false);
          return;
        }
        setOpen(next);
      }}
      open={locked ? false : open}
    >
      <PopoverTrigger asChild>
        <Button
          aria-disabled={locked}
          className={cn(
            "h-7 w-7 rounded-lg border border-border/40 p-1",
            locked
              ? "cursor-not-allowed text-muted-foreground/25 opacity-40 hover:bg-transparent hover:text-muted-foreground/25"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
          data-testid="work-picker-button"
          disabled={locked}
          title={
            locked
              ? "Work scoping coming soon"
              : "Scope to classical works (max 5)"
          }
          type="button"
          variant="ghost"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0" side="top">
        <Command onValueChange={setSearch} shouldFilter={false} value={search}>
          <CommandInput placeholder="Search 35 works…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No works found.</CommandEmpty>
            <CommandGroup heading={`${selectedWorks.length}/${MAX_SCOPED_WORKS} selected`}>
              {filtered.map((work) => {
                const picked = selectedIds.has(work.id);
                return (
                  <CommandItem
                    key={work.id}
                    onSelect={() => handleSelect(work)}
                    value={work.name}
                  >
                    <CheckIcon
                      className={cn(
                        "size-3.5 shrink-0",
                        picked ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <BookOpenIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">
                        {work.name}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground/50">
                        {work.shortGroup}
                        {work.dbReady ? " · DB+FTS" : " · CORPUS"}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
