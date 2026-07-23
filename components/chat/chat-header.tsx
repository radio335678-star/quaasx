"use client";

import { PanelLeftIcon } from "lucide-react";
import { memo } from "react";
import { Ai2AccessMenu } from "@/components/brand/Ai2AccessMenu";
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
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 bg-sidebar px-3 sm:h-14">
      <Button
        className="md:hidden"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <div className="flex items-center rounded-lg px-1 md:hidden">
        <Ai2AccessMenu imgClassName="size-6 rounded-md" size={24} />
      </div>

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
