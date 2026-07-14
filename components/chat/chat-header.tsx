"use client";

import { PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { brand } from "@/lib/brand";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center gap-2 bg-sidebar px-3">
      <Button
        className="md:hidden"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <Link
        aria-label={brand.name}
        className="flex items-center rounded-lg px-1 md:hidden"
        href="/app"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          aria-hidden
          className="size-6 rounded-md"
          height={24}
          src={brand.mark}
          width={24}
        />
      </Link>

      {!isReadonly && process.env.NEXT_PUBLIC_ENABLE_SERVER_SYNC === "true" ? (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      ) : null}

      <div className="ml-auto hidden items-center gap-2 md:flex">
        <span className="text-muted-foreground text-sm tracking-tight">
          {brand.fullName}
        </span>
      </div>
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
);
