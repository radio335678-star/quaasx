"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DEVELOPER_MODELS,
  resolveChatModel,
} from "@/lib/ai2/developer-models";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type ModelPickerPopoverProps = {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  disabled?: boolean;
};

export function ModelPickerPopover({
  selectedModelId,
  onModelChange,
  disabled,
}: ModelPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const active = resolveChatModel(selectedModelId);

  const handleSelect = (slug: string, selectable: boolean, reason?: string) => {
    if (!selectable) {
      toast.error(reason ?? "This model is not available yet");
      return;
    }
    onModelChange?.(slug);
    setOpen(false);
  };

  const models = useMemo(() => DEVELOPER_MODELS, []);

  return (
    <Popover
      onOpenChange={(next) => {
        if (disabled) {
          setOpen(false);
          return;
        }
        setOpen(next);
      }}
      open={disabled ? false : open}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-7 max-w-[160px] gap-1.5 rounded-lg border border-border/40 px-2 text-[11px] text-muted-foreground/80 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
          data-testid="model-picker-button"
          disabled={disabled}
          title="Model and thinking level"
          type="button"
          variant="ghost"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={brand.name}
            className="size-3.5 shrink-0 rounded"
            height={14}
            src={brand.mark}
            width={14}
          />
          <span className="truncate font-medium tracking-tight">
            {active.audienceLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(100vw-2rem,22rem)] p-2" side="top">
        <p className="px-2 pb-1 font-medium text-foreground text-xs">
          Model · thinking level
        </p>
        <p className="px-2 pb-2 text-[11px] text-muted-foreground leading-snug">
          Patient (web-fast), Scholar (library + web), Clinician (library-deep).
          GOD mode stays locked on free tier.
        </p>
        <ul className="space-y-1">
          {models.map((model) => {
            const selected = active.slug === model.slug;
            const locked = !model.chatSelectable;
            return (
              <li key={model.id}>
                <button
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors",
                    locked
                      ? "cursor-not-allowed opacity-55"
                      : "hover:bg-muted/50",
                    selected && !locked && "bg-muted/40"
                  )}
                  data-testid={`model-option-${model.slug}`}
                  onClick={() =>
                    handleSelect(
                      model.slug,
                      model.chatSelectable,
                      model.unavailableReason
                    )
                  }
                  type="button"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                    {locked ? (
                      <LockIcon className="size-3 text-muted-foreground/60" />
                    ) : (
                      <CheckIcon
                        className={cn(
                          "size-3.5",
                          selected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-foreground text-[12px]">
                        {model.audienceLabel}
                      </span>
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {model.thinking} thinking
                      </span>
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground/80">
                      {model.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground leading-snug">
                      {model.description}
                    </span>
                    {locked && model.unavailableReason ? (
                      <span className="mt-1 block text-[10px] text-muted-foreground/70">
                        {model.unavailableReason}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
