"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { memo } from "react";
import { SleepWakeCard } from "@/components/ai2/SleepWakeCard";
import { useEngineWarmup } from "@/hooks/use-engine-warmup";
import type { ChatMessage } from "@/lib/types";
import { Greeting } from "./greeting";
import type { VisibilityType } from "./visibility-selector";

type EmptyStateProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureEmptyState(_props: EmptyStateProps) {
  const { isComposerEnabled } = useEngineWarmup();

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col"
      data-testid="empty-state"
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 pb-6 pt-4 sm:gap-6 sm:px-4 sm:pb-8 sm:pt-6 md:pt-8">
          <Greeting />
          {!isComposerEnabled ? <SleepWakeCard /> : null}
        </div>
      </div>
    </div>
  );
}

export const EmptyState = memo(PureEmptyState, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) {
    return false;
  }
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
    return false;
  }
  return true;
});
