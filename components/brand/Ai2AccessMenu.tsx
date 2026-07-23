"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessRoleOptional } from "@/hooks/use-access-role";
import { ACTIVE_VALIDATORS } from "@/lib/ai2/access-role";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Ai2AccessMenuProps = {
  /** Pixel size of the mark */
  size?: number;
  className?: string;
  imgClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Called after a successful role change (e.g. close mobile sidebar) */
  onRoleChanged?: () => void;
};

export function Ai2AccessMenu({
  size = 20,
  className,
  imgClassName,
  align = "start",
  side = "bottom",
  onRoleChanged,
}: Ai2AccessMenuProps) {
  const { role, enterAsFree, enterAsValidator } = useAccessRoleOptional();
  const [open, setOpen] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedValidatorId, setExpandedValidatorId] = useState<string | null>(
    null
  );

  const handleFree = useCallback(async () => {
    setBusy(true);
    try {
      await enterAsFree();
      toast.success("Entered as free user — Flash, Pro, and Max available");
      setOpen(false);
      onRoleChanged?.();
      window.dispatchEvent(
        new CustomEvent("ai2-access-role", { detail: { role: "free" } })
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not enter as free user"
      );
    } finally {
      setBusy(false);
    }
  }, [enterAsFree, onRoleChanged]);

  const handleValidatorSubmit = useCallback(async () => {
    if (!passkey.trim()) {
      toast.error("Enter your pass-key");
      return;
    }
    setBusy(true);
    try {
      await enterAsValidator(passkey.trim());
      setPasskey("");
      toast.success("Validator access granted — GOD mode enabled");
      setOpen(false);
      onRoleChanged?.();
      window.dispatchEvent(
        new CustomEvent("ai2-access-role", { detail: { role: "validator" } })
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid pass-key"
      );
    } finally {
      setBusy(false);
    }
  }, [enterAsValidator, onRoleChanged, passkey]);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`${brand.name} access menu`}
          className={cn(
            "inline-flex items-center justify-center rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          data-testid="ai2-access-menu-trigger"
          type="button"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={brand.name}
            className={cn("rounded-md", imgClassName)}
            height={size}
            src={brand.mark}
            style={{ width: size, height: size }}
            width={size}
          />
          <span className="sr-only">{brand.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-[min(100vw-2rem,18rem)]"
        side={side}
        sideOffset={6}
      >
        <DropdownMenuLabel className="flex items-center justify-between gap-2 font-normal">
          <span className="text-xs text-muted-foreground">Access</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              role === "validator"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {role === "validator" ? "Validator" : "Free"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onSelect={(e) => {
            e.preventDefault();
            void handleFree();
          }}
        >
          Enter as free user
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={busy}>
            I am a validator for benchmark
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[min(100vw-2rem,18rem)] p-0">
            <div className="space-y-3 p-3">
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-medium text-muted-foreground"
                  htmlFor="ai2-validator-passkey"
                >
                  Enter your pass-key
                </label>
                <div className="flex gap-1.5">
                  <input
                    autoComplete="off"
                    className="h-8 min-w-0 flex-1 rounded-md border border-border/60 bg-background px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={busy}
                    id="ai2-validator-passkey"
                    onChange={(e) => setPasskey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleValidatorSubmit();
                      }
                    }}
                    placeholder="Pass-key"
                    type="password"
                    value={passkey}
                  />
                  <button
                    className="h-8 shrink-0 rounded-md bg-primary px-2.5 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void handleValidatorSubmit()}
                    type="button"
                  >
                    Unlock
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Validators currently active
                </p>
                <ul className="space-y-1">
                  {ACTIVE_VALIDATORS.map((v) => {
                    const expanded = expandedValidatorId === v.id;
                    return (
                      <li key={v.id}>
                        <button
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/60",
                            expanded && "bg-muted/50"
                          )}
                          onClick={() =>
                            setExpandedValidatorId(expanded ? null : v.id)
                          }
                          type="button"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse"
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-[12px] text-foreground",
                                expanded && "font-semibold tracking-tight"
                              )}
                            >
                              {v.name}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {v.specialty}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-muted-foreground text-xs">
          <Link href="/benchmark#apply" onClick={() => setOpen(false)}>
            Apply for validator access
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
