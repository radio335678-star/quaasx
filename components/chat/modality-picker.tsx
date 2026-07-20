"use client";

import {
  AudioLines,
  Eye,
  Globe,
  LockIcon,
  PlusIcon,
  Radio,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type ModalityOption = {
  id: string;
  label: string;
  description: string;
  available: boolean;
  icon: LucideIcon;
  glow?: boolean;
};

const MODALITIES: ModalityOption[] = [
  {
    id: "web",
    label: "Web-X-AI²",
    description: "Search the open web alongside classical sources",
    available: true,
    icon: Globe,
    glow: true,
  },
  {
    id: "live",
    label: "Live",
    description: "Real-time voice and session mode",
    available: false,
    icon: Radio,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Speak and listen in the composer",
    available: false,
    icon: AudioLines,
  },
  {
    id: "vision",
    label: "Vision",
    description: "Images, scans, and visual evidence",
    available: false,
    icon: Eye,
  },
  {
    id: "omnihydra",
    label: "OmniHydra",
    description: "Multi-stream classical synthesis",
    available: false,
    icon: Sparkles,
  },
];

const FREE_TIER_LOCK = "Unavailable on free tier";

type ModalityPickerPopoverProps = {
  disabled?: boolean;
};

export function ModalityPickerPopover({ disabled }: ModalityPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (option: ModalityOption) => {
    if (!option.available) {
      toast.error(FREE_TIER_LOCK);
      return;
    }
    setOpen(false);
    if (option.id === "web") {
      router.push("/app/web-x");
    }
  };

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
            "h-7 w-7 rounded-lg border border-border/40 p-1 text-muted-foreground/60 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
          data-testid="modality-picker-button"
          disabled={disabled}
          title="Input modalities"
          type="button"
          variant="ghost"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(100vw-2rem,16rem)] p-2" side="top">
        <p className="px-2 pb-1 font-medium text-foreground text-xs">Modalities</p>
        <p className="px-2 pb-2 text-[11px] text-muted-foreground leading-snug">
          Web-X-AI² is available. Live, Audio, Vision, and OmniHydra unlock on paid
          tiers.
        </p>
        <ul className="space-y-0.5">
          {MODALITIES.map((option) => {
            const Icon = option.icon;
            const locked = !option.available;
            return (
              <li key={option.id}>
                <button
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                    locked
                      ? "cursor-not-allowed opacity-55"
                      : "hover:bg-muted/50"
                  )}
                  data-testid={`modality-option-${option.id}`}
                  onClick={() => handleSelect(option)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/30 bg-muted/30",
                      option.glow &&
                        "border-sky-400/40 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.45)]",
                      locked && "opacity-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5",
                        option.glow &&
                          "text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]",
                        locked && "text-muted-foreground/50"
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-[12px] text-foreground">
                        {option.label}
                      </span>
                      {option.available ? (
                        <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-medium text-sky-400">
                          Available
                        </span>
                      ) : (
                        <LockIcon className="size-3 shrink-0 text-muted-foreground/50" />
                      )}
                    </span>
                    {locked ? (
                      <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                        {FREE_TIER_LOCK}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-[10px] text-muted-foreground/60 leading-snug">
                        {option.description}
                      </span>
                    )}
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
