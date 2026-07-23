"use client";

import { useCallback, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Ai2AccessMenuProps = {
  /** Pixel size of the mark (logo trigger only) */
  size?: number;
  className?: string;
  imgClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Called after a successful role change (e.g. close mobile sidebar) */
  onRoleChanged?: () => void;
  /** Custom trigger (e.g. Open AI² button). Defaults to brand mark. */
  children?: ReactNode;
  /** After free/validator success, go to chat app. Default false for logo. */
  navigateToApp?: boolean;
  /** Optional app path override (default brand.appPath) */
  appHref?: string;
};

export function Ai2AccessMenu({
  size = 20,
  className,
  imgClassName,
  align = "start",
  side = "bottom",
  onRoleChanged,
  children,
  navigateToApp = false,
  appHref = brand.appPath,
}: Ai2AccessMenuProps) {
  const router = useRouter();
  const passkeyId = useId();
  const { role, enterAsFree, enterAsValidator } = useAccessRoleOptional();
  const [open, setOpen] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [busy, setBusy] = useState(false);

  const afterRole = useCallback(
    (next: "free" | "validator") => {
      setOpen(false);
      onRoleChanged?.();
      window.dispatchEvent(
        new CustomEvent("ai2-access-role", { detail: { role: next } })
      );
      if (navigateToApp) {
        router.push(appHref);
      }
    },
    [appHref, navigateToApp, onRoleChanged, router]
  );

  const handleFree = useCallback(async () => {
    setBusy(true);
    try {
      await enterAsFree();
      toast.success("Entered as free user — Flash, Pro, and Max available");
      afterRole("free");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not enter as free user"
      );
    } finally {
      setBusy(false);
    }
  }, [afterRole, enterAsFree]);

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
      afterRole("validator");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid pass-key"
      );
    } finally {
      setBusy(false);
    }
  }, [afterRole, enterAsValidator, passkey]);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        {children ? (
          <button
            className={cn(className)}
            data-testid="ai2-access-cta-trigger"
            type="button"
          >
            {children}
          </button>
        ) : (
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
        )}
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
                  htmlFor={passkeyId}
                >
                  Enter your pass-key
                </label>
                <div className="flex gap-1.5">
                  <input
                    autoComplete="off"
                    className="h-8 min-w-0 flex-1 rounded-md border border-border/60 bg-background px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={busy}
                    id={passkeyId}
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
              <p className="text-[11px] leading-snug text-muted-foreground">
                Benchmark validators unlock GOD mode with a pass-key. Apply if
                you do not have access yet.
              </p>
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

const PRIMARY_CTA =
  "inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90";
const PRIMARY_CTA_NAV =
  "rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90";
const PRIMARY_CTA_NAV_MOBILE =
  "rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm";
const OUTLINE_CTA =
  "inline-flex items-center justify-center rounded-md border border-border/60 px-6 py-3 font-medium text-foreground text-sm transition-colors hover:bg-muted/40";

type Ai2OpenCtaProps = {
  /** Button label */
  label?: string;
  variant?: "primary" | "outline" | "nav" | "navMobile";
  className?: string;
  align?: "start" | "center" | "end";
};

/** Open / Try AI² CTA — same free vs validator menu as the brand mark. */
export function Ai2OpenCta({
  label = `Open ${brand.name}`,
  variant = "primary",
  className,
  align = "start",
}: Ai2OpenCtaProps) {
  const base =
    variant === "outline"
      ? OUTLINE_CTA
      : variant === "nav"
        ? PRIMARY_CTA_NAV
        : variant === "navMobile"
          ? PRIMARY_CTA_NAV_MOBILE
          : PRIMARY_CTA;

  return (
    <Ai2AccessMenu
      align={align}
      className={cn(base, className)}
      navigateToApp
    >
      {label}
    </Ai2AccessMenu>
  );
}
