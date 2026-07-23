"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccessRoleOptional } from "@/hooks/use-access-role";
import {
  DEVELOPER_MODELS,
  resolveChatModel,
} from "@/lib/ai2/developer-models";
import {
  isModelAllowedForRole,
  modelLockReason,
} from "@/lib/ai2/access-role";
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
  const { role } = useAccessRoleOptional();
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
            "h-7 max-w-[180px] gap-1.5 rounded-lg border border-border/40 px-2 text-[11px] text-muted-foreground/80 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
          data-testid="model-picker-button"
          disabled={disabled}
          title={`${active.name} · ${active.audienceLabel}`}
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
            {active.name}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(100vw-2rem,20rem)] p-2" side="top">
        <p className="px-2 pb-2 font-medium text-foreground text-xs">
          Select model
          <span className="ml-1.5 font-normal text-muted-foreground">
            · {role === "validator" ? "validator" : "free"}
          </span>
        </p>
        <ul className="space-y-1">
          {models.map((model) => {
            const selected = active.slug === model.slug;
            const roleLocked = !isModelAllowedForRole(role, model.slug);
            const catalogLocked = !model.chatSelectable;
            const locked = roleLocked || catalogLocked;
            const reason = roleLocked
              ? modelLockReason(role, model.slug)
              : model.unavailableReason;
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
                    handleSelect(model.slug, !locked, reason)
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
                    <span className="block font-medium text-foreground text-[13px] tracking-tight">
                      {model.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {model.audienceLabel}
                    </span>
                    {locked && reason ? (
                      <span className="mt-1 block text-[10px] text-muted-foreground/70">
                        {reason}
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
